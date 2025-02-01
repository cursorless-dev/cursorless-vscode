import type { WrapWithSnippetArg } from "@cursorless/common";
import { FlashStyle } from "@cursorless/common";
import type { Snippets } from "../core/Snippets";
import { getPreferredSnippet } from "../core/getPreferredSnippet";
import type { RangeUpdater } from "../core/updateSelections/RangeUpdater";
import { performEditsAndUpdateSelections } from "../core/updateSelections/updateSelections";
import type { ModifierStageFactory } from "../processTargets/ModifierStageFactory";
import { ModifyIfUntypedStage } from "../processTargets/modifiers/ConditionalModifierStages";
import { ide } from "../singletons/ide.singleton";
import { transformSnippetVariables } from "../snippets/transformSnippetVariables";
import { SnippetParser } from "../snippets/vendor/vscodeSnippet/snippetParser";
import type { Target } from "../typings/target.types";
import { ensureSingleEditor, flashTargets } from "../util/targetUtils";
import type { ActionReturnValue } from "./actions.types";

export default class WrapWithSnippet {
  private snippetParser = new SnippetParser();

  constructor(
    private rangeUpdater: RangeUpdater,
    private snippets: Snippets,
    private modifierStageFactory: ModifierStageFactory,
  ) {
    this.run = this.run.bind(this);
  }

  getFinalStages(targets: Target[], snippetDescription: WrapWithSnippetArg) {
    const editor = ensureSingleEditor(targets);
    const snippet = getPreferredSnippet(
      snippetDescription,
      editor.document.languageId,
    );

    if (snippet.scopeType == null) {
      return [];
    }

    return [
      new ModifyIfUntypedStage(this.modifierStageFactory, {
        type: "modifyIfUntyped",
        modifier: {
          type: "containingScope",
          scopeType: snippet.scopeType,
        },
      }),
    ];
  }

  async run(
    targets: Target[],
    snippetDescription: WrapWithSnippetArg,
  ): Promise<ActionReturnValue> {
    const editor = ide().getEditableTextEditor(ensureSingleEditor(targets));
    const snippet = getPreferredSnippet(
      snippetDescription,
      editor.document.languageId,
    );

    const parsedSnippet = this.snippetParser.parse(snippet.body);

    transformSnippetVariables(parsedSnippet, snippet.variableName);

    const snippetString = parsedSnippet.toTextmateString();

    await flashTargets(ide(), targets, FlashStyle.pendingModification0);

    const targetSelections = targets.map((target) => target.contentSelection);

    const { targetSelections: updatedTargetSelections } =
      await performEditsAndUpdateSelections({
        rangeUpdater: this.rangeUpdater,
        editor,
        callback: () => editor.insertSnippet(snippetString, targetSelections),
        preserveCursorSelections: true,
        selections: {
          targetSelections,
        },
      });

    return {
      thatSelections: updatedTargetSelections.map((selection) => ({
        editor,
        selection,
      })),
    };
  }
}
