import type { Selection, TextDocument } from "@cursorless/common";
import type { JetbrainsClient } from "./JetbrainsClient";

export function setSelections(
  client: JetbrainsClient,
  document: TextDocument,
  editorId: string,
  selections: Selection[],
): Promise<void> {
  // console.log("setSelections: " + selections);
  const selectionsJson = JSON.stringify(selections);
  // console.log("setSelections JSON: " + selectionsJson);
  client.setSelection(editorId, selectionsJson);
  return Promise.resolve();
}
