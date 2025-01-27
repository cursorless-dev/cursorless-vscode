import {
  InMemoryTextDocument,
  Position,
  Range,
  Selection,
  type TextDocument,
} from "@cursorless/common";
import { URI } from "vscode-uri";
import type { EditorState, JbPosition, JbSelection } from "../types/types";
import { JetbrainsEditor } from "./JetbrainsEditor";
import type { JetbrainsIDE } from "./JetbrainsIDE";
import type { JetbrainsClient } from "./JetbrainsClient";

export function createTextEditor(
  client: JetbrainsClient,
  ide: JetbrainsIDE,
  editorState: EditorState,
): JetbrainsEditor {
  // console.log("createTextEditor");

  const id = editorState.id;
  const uri = URI.parse(`talon-jetbrains://${id}`);
  const languageId = editorState.languageId ?? "plaintext";
  const document = new InMemoryTextDocument(uri, languageId, editorState.text);
  const visibleRanges = [
    new Range(editorState.firstVisibleLine, 0, editorState.lastVisibleLine, 0),
  ];
  const selections = editorState.selections.map((selection) =>
    createSelection(document, selection),
  );

  return new JetbrainsEditor(
    client,
    ide,
    id,
    document,
    visibleRanges,
    selections,
  );
}

export function createSelection(
  document: TextDocument,
  selection: JbSelection,
): Selection {
  // console.log("createSelection " + JSON.stringify(selection));
  return new Selection(
    createPosition(selection.anchor),
    createPosition(selection.active),
  );
}

export function createPosition(jbPosition: JbPosition): Position {
  return new Position(jbPosition.line, jbPosition.column);
}
