import type {
  Edit,
  Range,
  RevealLineAt,
  Selection,
  TextDocument,
  TextEditorOptions,
} from "..";

/**
 * Represents a read-only reference to a text editor.  If you need to modify the
 * editor, use {@link IDE.getEditableTextEditor}.
 */
export interface TextEditor {
  /**
   * Unique identifier for this text editor
   */
  readonly id: string;

  /**
   * The document associated with this text editor. The document will be the same for the entire lifetime of this text editor.
   */
  readonly document: TextDocument;

  /**
   * The current visible ranges in the editor (vertically).
   * This accounts only for vertical scrolling, and not for horizontal scrolling.
   */
  readonly visibleRanges: Range[];

  /**
   * The selections in this text editor.
   */
  readonly selections: Selection[];

  /**
   * Text editor options.
   */
  readonly options: TextEditorOptions;

  /**
   * True if this text editor is active.
   */
  readonly isActive: boolean;

  /**
   * Check if this text editor is equal to `other`.
   *
   * @param other A text editor.
   * @return `true` if the this text editor is equal to `other`.
   */
  isEqual(other: TextEditor): boolean;
}

export interface SetSelectionsOpts {
  focusEditor?: boolean;
  revealRange?: boolean;
  highlightWord?: boolean;
}

export type OpenLinkOptions = {
  openAside: boolean;
};

export interface EditableTextEditor extends TextEditor {
  /**
   * Set the selections in this text editor, optionally focusing the editor
   * and/or revealing the ranges.
   *
   * Note that if your editor requires unique selections, you should deduplicate
   * them in your implementation of this method.
   *
   * @param selections The new selections
   * @param opts The options for setting the selections
   */
  setSelections(
    selections: Selection[],
    opts?: SetSelectionsOpts,
  ): Promise<void>;

  options: TextEditorOptions;

  /**
   * Scroll to reveal the given range.
   *
   * @param range A {@link Range range}.
   */
  revealRange(range: Range): Promise<void>;

  /**
   * Scroll to reveal the given line.
   *
   * @param lineNumber A line number.
   * @param at Were to reveal the line at: top|center|bottom.
   */
  revealLine(lineNumber: number, at: RevealLineAt): Promise<void>;

  /**
   * Focus the editor.
   */
  focus(): Promise<void>;

  /**
   * Perform an edit on the document associated with this text editor.
   *
   * @param edits the list of edits that need to be applied to the document
   *        (note that the implementation might need to sort them in reverse order)
   * @return A promise that resolves with a value indicating if the edits could be applied.
   */
  edit(edits: Edit[]): Promise<boolean>;

  /**
   * Edit a new new notebook cell above.
   */
  editNewNotebookCellAbove(): Promise<void>;

  /**
   * Edit a new new notebook cell below.
   */
  editNewNotebookCellBelow(): Promise<void>;

  /**
   * Open link at location.
   * @param location Position or range
   * @param options Options for opening the link.
   */
  openLink(range: Range, options?: OpenLinkOptions): Promise<void>;

  /**
   * Fold ranges
   * @param ranges A list of {@link Range ranges}
   */
  fold(ranges?: Range[]): Promise<void>;

  /**
   * Unfold ranges
   * @param ranges A list of {@link Range ranges}
   */
  unfold(ranges?: Range[]): Promise<void>;

  /**
   * Copy to clipboard
   * @param ranges A list of {@link Range ranges}
   */
  clipboardCopy(ranges?: Range[]): Promise<void>;

  /**
   * Paste clipboard content
   */
  clipboardPaste(): Promise<void>;

  /**
   * Toggle breakpoints. For each of the descriptors in {@link descriptors},
   * remove all breakpoints overlapping with the given descriptor if it overlaps
   * with any existing breakpoint, otherwise add a new breakpoint at the given
   * location.
   * @param descriptors A list of breakpoint descriptors
   */
  toggleBreakpoint(descriptors?: BreakpointDescriptor[]): Promise<void>;

  /**
   * Toggle line comments
   * @param ranges A list of {@link Range ranges}
   */
  toggleLineComment(ranges?: Range[]): Promise<void>;

  /**
   * Indent lines
   * @param ranges A list of {@link Range ranges}
   */
  indentLine(ranges?: Range[]): Promise<void>;

  /**
   * Outdent lines
   * @param ranges A list of {@link Range ranges}
   */
  outdentLine(ranges?: Range[]): Promise<void>;

  /**
   * Insert line after
   * @param ranges A list of {@link Range ranges}
   */
  insertLineAfter(ranges?: Range[]): Promise<void>;

  /**
   * Insert snippet
   * @param snippet A snippet string
   * @param ranges A list of {@link Range ranges}
   */
  insertSnippet(snippet: string, ranges?: Range[]): Promise<void>;

  /**
   * Rename
   * @param range A {@link Range range}
   */
  rename(range?: Range): Promise<void>;

  /**
   * Show references
   * @param range A {@link Range range}
   */
  showReferences(range?: Range): Promise<void>;

  /**
   * Show quick fixed dialogue
   * @param range A {@link Range range}
   */
  quickFix(range?: Range): Promise<void>;

  /**
   * Reveal definition
   * @param range A {@link Range range}
   */
  revealDefinition(range?: Range): Promise<void>;

  /**
   * Reveal type definition
   * @param range A {@link Range range}
   */
  revealTypeDefinition(range?: Range): Promise<void>;

  /**
   * Show hover
   * @param range A {@link Range range}
   */
  showHover(range?: Range): Promise<void>;

  /**
   * Show debug hover
   * @param range A {@link Range range}
   */
  showDebugHover(range?: Range): Promise<void>;

  /**
   * Extract variable
   * @param range A {@link Range range}
   */
  extractVariable(range?: Range): Promise<void>;
}

interface LineBreakpointDescriptor {
  type: "line";
  startLine: number;
  /**
   * Last line, inclusive
   */
  endLine: number;
}

interface InlineBreakpointDescriptor {
  type: "inline";
  range: Range;
}

export type BreakpointDescriptor =
  | LineBreakpointDescriptor
  | InlineBreakpointDescriptor;
