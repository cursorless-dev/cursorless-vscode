import { SyntaxNode } from "web-tree-sitter";
import * as vscode from "vscode";
import { Location } from "vscode";
import { SymbolColor } from "./constants";
import { EditStyles } from "./editStyles";
import NavigationMap from "./NavigationMap";

/**
 * A token within a text editor, including the current display line of the token
 */
export interface Token {
  text: string;
  range: vscode.Range;
  startOffset: number;
  endOffset: number;
  editor: vscode.TextEditor;
  displayLine: number;
}

export interface CursorMark {
  type: "cursor";
}

export interface That {
  type: "that";
}

export interface LastCursorPosition {
  type: "lastCursorPosition";
}

export interface DecoratedSymbol {
  type: "decoratedSymbol";
  symbolColor: SymbolColor;
  character: string;
}

export type Mark = CursorMark | That | LastCursorPosition | DecoratedSymbol;
export type Delimiter =
  | "squareBrackets"
  | "curlyBrackets"
  | "angleBrackets"
  | "parentheses"
  | "singleQuotes"
  | "doubleQuotes";
export type ScopeType =
  | "argumentOrParameter"
  | "arrowFunction"
  | "class"
  | "className"
  | "collectionItem"
  | "collectionKey"
  | "comment"
  | "dictionary"
  | "xmlElement"
  | "functionCall"
  | "functionName"
  | "ifStatement"
  | "list"
  | "name"
  | "namedFunction"
  | "regex"
  | "statement"
  | "string"
  | "type"
  | "value"
  | "xmlAttribute"
  | "xmlElement"
  | "xmlBothTags"
  | "xmlEndTag"
  | "xmlStartTag";
export type PieceType = "word" | "character";

export interface SurroundingPairModifier {
  type: "surroundingPair";
  delimiter: Delimiter;
}
export interface ContainingScopeModifier {
  type: "containingScope";
  scopeType: ScopeType;
  valueOnly?: boolean;
  includeSiblings?: boolean;
}
export interface SubpieceModifier {
  type: "subpiece";
  pieceType: PieceType;
  anchor: number;
  active: number;
}
export interface MatchingPairSymbolModifier {
  type: "matchingPairSymbol";
}
export interface IdentityModifier {
  type: "identity";
}

export type Modifier =
  | SurroundingPairModifier
  | ContainingScopeModifier
  | SubpieceModifier
  | MatchingPairSymbolModifier
  | IdentityModifier;

export type SelectionType =
  | "character"
  | "token"
  | "line"
  | "paragraph"
  | "document";
export type Position = "before" | "after" | "contents";
export type InsideOutsideType = "inside" | "outside" | null;

export interface PartialPrimitiveTarget {
  type: "primitive";
  mark?: Mark;
  modifier?: Modifier;
  selectionType?: SelectionType;
  position?: Position;
  insideOutsideType?: InsideOutsideType;
}

export interface PartialRangeTarget {
  type: "range";
  start: PartialPrimitiveTarget;
  end: PartialPrimitiveTarget;
  excludeStart?: boolean;
  excludeEnd?: boolean;
}

export interface PartialListTarget {
  type: "list";
  elements: (PartialPrimitiveTarget | PartialRangeTarget)[];
}

export type PartialTarget =
  | PartialPrimitiveTarget
  | PartialRangeTarget
  | PartialListTarget;

export interface PrimitiveTarget {
  type: "primitive";
  mark: Mark;
  modifier: Modifier;
  selectionType: SelectionType;
  position: Position;
  insideOutsideType: InsideOutsideType;
}

export interface RangeTarget {
  type: "range";
  start: PrimitiveTarget;
  end: PrimitiveTarget;
  excludeStart: boolean;
  excludeEnd: boolean;
}

export interface ListTarget {
  type: "list";
  elements: (PrimitiveTarget | RangeTarget)[];
}

export type Target = PrimitiveTarget | RangeTarget | ListTarget;

export interface InferenceContext {
  selectionContents: string[];
  clipboardContents?: string;
  isPaste: boolean;
}

export interface ProcessedTargetsContext {
  currentSelections: SelectionWithEditor[];
  currentEditor: vscode.TextEditor | undefined;
  navigationMap: NavigationMap;
  thatMark: SelectionWithEditor[];
  getNodeAtLocation: (location: Location) => SyntaxNode;
}

export interface SelectionWithEditor {
  selection: vscode.Selection;
  editor: vscode.TextEditor;
}

export interface SelectionContext {
  isInDelimitedList?: boolean;
  containingListDelimiter?: string;

  // Selection used for outside selection
  outerSelection?: vscode.Selection | null;

  /**
   * The range of the delimiter before the selection, *if* the selection has a
   * preceding sibling, else null
   */
  leadingDelimiterRange?: vscode.Range | null;

  /**
   * The range of the delimiter after the selection, *if* the selection has a
   * following sibling, else null
   */
  trailingDelimiterRange?: vscode.Range | null;
}

export interface TypedSelection {
  /**
   * The selection.  If insideOutsideType is non-null, it will be adjusted to
   * include delimiter if outside
   */
  selection: SelectionWithEditor;
  selectionType: SelectionType;
  selectionContext: SelectionContext;

  /**
   * Is a boolean if user specifically requested inside or outside
   */
  insideOutsideType: InsideOutsideType;

  /**
   * Mirrored from the target from which this selection was constructed
   */
  position: Position;
}

export interface ActionPreferences {
  position?: Position;
  insideOutsideType: InsideOutsideType;
}

export interface SelectionWithContext {
  selection: vscode.Selection;
  context: SelectionContext;
}

export interface ActionReturnValue {
  returnValue: any;
  thatMark: SelectionWithEditor[];
}

export interface Action {
  run(targets: TypedSelection[][], ...args: any[]): Promise<ActionReturnValue>;
  targetPreferences: ActionPreferences[];
}

export type ActionType =
  | "bring"
  | "clear"
  | "commentLines"
  | "copy"
  | "cut"
  | "copyLinesDown"
  | "copyLinesUp"
  | "delete"
  | "extractVariable"
  | "editNewLineAbove"
  | "editNewLineBelow"
  | "findInFiles"
  | "fold"
  | "getText"
  | "insertEmptyLineAbove"
  | "insertEmptyLinesAround"
  | "insertEmptyLineBelow"
  | "indentLines"
  | "move"
  | "outdentLines"
  | "paste"
  | "replaceWithText"
  | "scrollToBottom"
  | "scrollToCenter"
  | "scrollToTop"
  | "setBreakpoint"
  | "setSelection"
  | "setSelectionAfter"
  | "setSelectionBefore"
  | "swap"
  | "unfold"
  | "wrap";

export type ActionRecord = Record<ActionType, Action>;

export interface Graph {
  readonly actions: ActionRecord;
  readonly editStyles: EditStyles;
}

export interface DecorationColorSetting {
  dark: string;
  light: string;
  highContrast: string;
}

export type NodeMatcher = (
  selection: SelectionWithEditor,
  node: SyntaxNode
) => SelectionWithContext[] | null;

export type NodeMatcherAlternative = NodeMatcher | string[] | string;

/**
 * Returns the desired relative of the provided node.
 * Returns null if matching node not found.
 **/
export type NodeFinder = (
  node: SyntaxNode,
  selection?: vscode.Selection
) => SyntaxNode | null;

/** Returns a selection for a given SyntaxNode */
export type SelectionExtractor = (
  editor: vscode.TextEditor,
  node: SyntaxNode
) => SelectionWithContext[];

/** Represent a single edit/change in the document */
export interface Edit {
  range: vscode.Range;
  text: string;
}
