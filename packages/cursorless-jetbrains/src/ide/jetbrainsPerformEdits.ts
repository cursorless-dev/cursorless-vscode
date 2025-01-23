import type { Edit } from "@cursorless/common";
import { type InMemoryTextDocument } from "@cursorless/common";
import type { EditorEdit } from "../types/types";
import type { JetbrainsIDE } from "./JetbrainsIDE";
import type { JetbrainsClient } from "./JetbrainsClient";

export function jetbrainsPerformEdits(
  client: JetbrainsClient,
  ide: JetbrainsIDE,
  document: InMemoryTextDocument,
  id: string,
  edits: Edit[],
) {
  const changes = document.edit(edits);

  const editorEdit: EditorEdit = {
    text: document.text,
    changes: changes.map((change) => ({
      rangeOffset: change.rangeOffset,
      rangeLength: change.rangeLength,
      text: change.text,
    })),
  };

  client.documentUpdated(id, JSON.stringify(editorEdit));
  //jetbrains.actions.user.cursorless_everywhere_edit_text(editorEdit);

  ide.emitDidChangeTextDocument({
    document,
    contentChanges: changes,
  });
}
