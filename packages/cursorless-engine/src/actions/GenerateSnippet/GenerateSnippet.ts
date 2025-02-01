import {
  FlashStyle,
  Range,
  matchAll,
  type EditableTextEditor,
  type Selection,
  type TextEditor,
} from "@cursorless/common";
import {
  parseSnippetFile,
  serializeSnippetFile,
  type Snippet,
  type SnippetFile,
  type SnippetHeader,
  type SnippetVariable,
} from "talon-snippets";
import type { Snippets } from "../../core/Snippets";
import { ide } from "../../singletons/ide.singleton";
import type { Target } from "../../typings/target.types";
import { ensureSingleTarget, flashTargets } from "../../util/targetUtils";
import type { ActionReturnValue } from "../actions.types";
import { constructSnippetBody } from "./constructSnippetBody";
import { editText } from "./editText";
import type { Offsets } from "./Offsets";

/**
 * This action can be used to automatically create a snippet from a target. Any
 * cursor selections inside the target will become placeholders in the final
 * snippet.  This action creates a new file, and inserts a snippet that the user
 * can fill out to construct their desired snippet.
 *
 * Note that there are two snippets involved in this implementation:
 *
 * - The snippet that the user is trying to create.  We refer to this snippet as
 *   the user snippet.
 * - The snippet that we insert that the user can use to build their snippet. We
 *   refer to this as the meta snippet.
 *
 * We proceed as follows:
 *
 * 1. Ask user for snippet name if not provided as arg
 * 2. Find all cursor selections inside target - these will become the user
 *    snippet variables
 * 3. Extract text of target
 * 4. Replace cursor selections in text with snippet variables
 * 4. Construct the user snippet body as a list of strings
 * 5. Construct a javascript object that will be serialized to become the meta
 *    snippet
 * 6. Serialize the javascript object
 * 7. Escape dollar signs and replace placeholder text with snippet placeholders.
 *    This modified json output is the meta snippet.
 * 8. Open a new document in the snippets dir to hold the new snippet.
 * 9. Insert the meta snippet so that the user can construct their snippet.
 */
export default class GenerateSnippet {
  constructor(private snippets: Snippets) {
    this.run = this.run.bind(this);
  }

  async run(
    targets: Target[],
    directory: string,
    snippetName?: string,
  ): Promise<ActionReturnValue> {
    if (directory == null) {
      throw new Error(
        "Directory argument is required for GenerateSnippet action. Please update Cursorless Talon",
      );
    }

    const target = ensureSingleTarget(targets);
    const editor = target.editor;

    // NB: We don't await the pending edit decoration so that if the user
    // immediately starts saying the name of the snippet (eg command chain
    // "snippet make funk camel my function"), we're more likely to
    // win the race and have the input box ready for them
    void flashTargets(ide(), targets, FlashStyle.referenced);

    if (snippetName == null) {
      snippetName = await ide().showInputBox({
        prompt: "Name of snippet",
        placeHolder: "helloWorld",
      });

      // User cancelled; do nothing
      if (!snippetName) {
        return {};
      }
    }

    const baseOffset = editor.document.offsetAt(target.contentRange.start);

    /**
     * The variables that will appear in the user snippet.
     */
    const selections = getsSnippetSelections(editor, target.contentRange);
    const variables = selections.map(
      (selection, index): Variable => ({
        offsets: {
          start: editor.document.offsetAt(selection.start) - baseOffset,
          end: editor.document.offsetAt(selection.end) - baseOffset,
        },
        name: index === selections.length - 1 ? "0" : `${index + 1}`,
      }),
    );

    /**
     * Text before the start of the snippet in the snippet start line.  We need
     * to pass this to {@link constructSnippetBody} so that it knows the
     * baseline indentation of the snippet
     */
    const linePrefix = editor.document.getText(
      new Range(
        target.contentRange.start.with(undefined, 0),
        target.contentRange.start,
      ),
    );

    const originalText = editor.document.getText(target.contentRange);

    const snippetBodyText = editText(originalText, [
      ...matchAll(originalText, /\$|\\/g, (match) => ({
        offsets: {
          start: match.index!,
          end: match.index! + match[0].length,
        },
        text: `\\${match[0]}`,
      })),
      ...variables.map(({ offsets, name }) => ({
        offsets,
        text: `$${name}`,
      })),
    ]);

    const snippetLines = constructSnippetBody(snippetBodyText, linePrefix);

    let editableEditor: EditableTextEditor;
    let snippetFile: SnippetFile = { snippets: [] };

    if (ide().runMode === "test") {
      // If we're testing, we just overwrite the current document
      editableEditor = ide().getEditableTextEditor(editor);
    } else {
      // Otherwise, we create and open a new document for the snippet
      editableEditor = ide().getEditableTextEditor(
        await this.snippets.openNewSnippetFile(snippetName, directory),
      );
      snippetFile = parseSnippetFile(editableEditor.document.getText());
    }

    await editableEditor.setSelections([
      editableEditor.document.range.toSelection(false),
    ]);

    /** The next placeholder index to use for the meta snippet */
    let currentPlaceholderIndex = 1;

    const { header } = snippetFile;

    const phrases =
      snippetFile.header?.phrases != null
        ? undefined
        : [`${PLACEHOLDER}${currentPlaceholderIndex++}`];

    const createVariable = (variable: Variable): SnippetVariable => {
      const hasPhrase = header?.variables?.some(
        (v) => v.name === variable.name && v.wrapperPhrases != null,
      );
      return {
        name: variable.name,
        wrapperPhrases: hasPhrase
          ? undefined
          : [`${PLACEHOLDER}${currentPlaceholderIndex++}`],
      };
    };

    const snippet: Snippet = {
      name: header?.name === snippetName ? undefined : snippetName,
      phrases,
      languages: getSnippetLanguages(editor, header),
      body: snippetLines,
      variables: variables.map(createVariable),
    };

    snippetFile.snippets.push(snippet);

    /**
     * This is the text of the meta-snippet in Textmate format that we will
     * insert into the new document where the user will fill out their snippet
     * definition
     */
    const metaSnippetText = serializeSnippetFile(snippetFile)
      // Escape dollar signs in the snippet text so that they don't get used as
      // placeholders in the meta snippet
      .replace(/\$/g, "\\$")
      // Replace constant with dollar sign for meta snippet placeholders
      .replaceAll(PLACEHOLDER, "$");

    // Insert the meta-snippet
    await editableEditor.insertSnippet(metaSnippetText);

    return {
      thatSelections: targets.map(({ editor, contentSelection }) => ({
        editor,
        selection: contentSelection,
      })),
    };
  }
}

function getSnippetLanguages(
  editor: TextEditor,
  header: SnippetHeader | undefined,
): string[] | undefined {
  if (header?.languages?.includes(editor.document.languageId)) {
    return undefined;
  }
  return [editor.document.languageId];
}

function getsSnippetSelections(editor: TextEditor, range: Range): Selection[] {
  const selections = editor.selections.filter((selection) =>
    range.contains(selection),
  );
  selections.sort((a, b) => a.start.compareTo(b.start));
  return selections;
}

// Used to temporarily escape the $1, $2 snippet holes (the "meta snippet" holes
// that become live snippets when the user edits) so we can use traditional
// backslash escaping for the holes in the underlying snippet itself (the "user
// snippet" holes that will be saved as part of their new template).
const PLACEHOLDER = "PLACEHOLDER_VFA77zcbLD6wXNmfMAay";

interface Variable {
  /**
   * The start an end offsets of the variable relative to the text of the
   * snippet that contains it
   */
  offsets: Offsets;

  /**
   * The name for the variable
   */
  name: string;
}
