import * as semver from "semver";
import {
  commands,
  NotebookDocument,
  TextEditor,
  version,
  ViewColumn,
  window,
} from "vscode";
import ide from "../../libs/cursorless-engine/singletons/ide.singleton";
import { getCellIndex } from "../../libs/vscode-common/notebook";
import { getNotebookFromCellDocument } from "../../util/notebook";
import {
  focusNotebookCellLegacy,
  isVscodeLegacyNotebookVersion,
} from "../../util/notebookLegacy";

const columnFocusCommands = {
  [ViewColumn.One]: "workbench.action.focusFirstEditorGroup",
  [ViewColumn.Two]: "workbench.action.focusSecondEditorGroup",
  [ViewColumn.Three]: "workbench.action.focusThirdEditorGroup",
  [ViewColumn.Four]: "workbench.action.focusFourthEditorGroup",
  [ViewColumn.Five]: "workbench.action.focusFifthEditorGroup",
  [ViewColumn.Six]: "workbench.action.focusSixthEditorGroup",
  [ViewColumn.Seven]: "workbench.action.focusSeventhEditorGroup",
  [ViewColumn.Eight]: "workbench.action.focusEighthEditorGroup",
  [ViewColumn.Nine]: "workbench.action.focusNinthEditorGroup",
  [ViewColumn.Active]: "",
  [ViewColumn.Beside]: "",
};

export default async function focusVscodeEditor(
  editor: TextEditor,
  editorId: string,
) {
  const viewColumn = getViewColumn(editor);
  if (viewColumn != null) {
    await commands.executeCommand(columnFocusCommands[viewColumn]);
  } else {
    // If the view column is null we see if it's a notebook and try to see if we
    // can just move around in the notebook to focus the correct editor

    if (isVscodeLegacyNotebookVersion()) {
      return await focusNotebookCellLegacy(editor);
    }

    await focusNotebookCell(editor, editorId);
  }
}

function getViewColumn(editor: TextEditor): ViewColumn | undefined {
  if (editor.viewColumn != null) {
    return editor.viewColumn;
  }
  // TODO: tabGroups is not available on older versions of vscode we still support.
  // Remove any cast as soon as version is updated.
  if (semver.lt(version, "1.67.0")) {
    return undefined;
  }
  const uri = editor.document.uri.toString();
  const tabGroup = (window as any)?.tabGroups?.all?.find((tabGroup: any) =>
    tabGroup?.tabs.find((tab: any) => tab?.input?.modified?.toString() === uri),
  );
  return tabGroup?.viewColumn;
}

async function focusNotebookCell(editor: TextEditor, editorId: string) {
  const desiredNotebookEditor = getNotebookFromCellDocument(editor.document);
  if (desiredNotebookEditor == null) {
    throw new Error("Couldn't find notebook editor for given document");
  }

  const desiredNotebookDocument: NotebookDocument =
    desiredNotebookEditor.notebook;

  await commands.executeCommand(
    columnFocusCommands[
      desiredNotebookEditor.viewColumn as keyof typeof columnFocusCommands
    ],
  );

  const desiredEditorIndex = getCellIndex(
    desiredNotebookDocument,
    editor.document,
  );

  const desiredSelections = [
    desiredNotebookEditor.selection.with({
      start: desiredEditorIndex,
      end: desiredEditorIndex + 1,
    }),
  ];
  desiredNotebookEditor.selections = desiredSelections;
  desiredNotebookEditor.revealRange(desiredSelections[0]);

  // Issue a command to tell VSCode to focus the cell input editor
  // NB: We don't issue the command if it's already focused, because it turns
  // out that this command is actually a toggle, so that causes it to de-focus!
  if (ide().activeTextEditor?.id !== editorId) {
    await commands.executeCommand("notebook.cell.edit");
  }
}
