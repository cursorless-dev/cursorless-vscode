export interface SelectionOffsets {
  // Document offsets
  anchor: number;
  active: number;
}

export interface JbSelection {
  start: JbPosition;
  end: JbPosition;
  cursorPosition: JbPosition;
  anchor: JbPosition;
  active: JbPosition;
}

export interface JbPosition {
  line: number;
  column: number;
}

export interface EditorState {
  id: string;
  text: string;
  languageId?: string;
  firstVisibleLine: number;
  lastVisibleLine: number;
  selections: JbSelection[];
  active: boolean;
  visible: boolean;
  editable: boolean;
}

export interface EditorChange {
  readonly text: string;
  readonly rangeOffset: number;
  readonly rangeLength: number;
}

export interface EditorEdit {
  /**
   * The new document content after the edit. We provide this for platforms
   * where we can't easily handle {@link changes}.
   */
  text: string;
  changes: EditorChange[];
}
