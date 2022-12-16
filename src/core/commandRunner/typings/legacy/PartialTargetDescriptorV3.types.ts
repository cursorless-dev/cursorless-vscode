const HAT_COLORS = [
  "default",
  "blue",
  "green",
  "red",
  "pink",
  "yellow",
  "userColor1",
  "userColor2",
] as const;

const HAT_NON_DEFAULT_SHAPES = [
  "ex",
  "fox",
  "wing",
  "hole",
  "frame",
  "curve",
  "eye",
  "play",
  "bolt",
  "crosshairs",
] as const;

type HatColor = typeof HAT_COLORS[number];
type HatNonDefaultShape = typeof HAT_NON_DEFAULT_SHAPES[number];
type HatStyleName = HatColor | `${HatColor}-${HatNonDefaultShape}`;

interface CursorMark {
  type: "cursor";
}

interface ThatMark {
  type: "that";
}

interface SourceMark {
  type: "source";
}

interface NothingMark {
  type: "nothing";
}

interface DecoratedSymbolMark {
  type: "decoratedSymbol";
  symbolColor: HatStyleName;
  character: string;
}

type LineNumberType = "absolute" | "relative" | "modulo100";

interface LineNumberMark {
  type: "lineNumber";
  lineNumberType: LineNumberType;
  lineNumber: number;
}

/**
 * Constructs a range between {@link anchor} and {@link active}
 */
interface RangeMark {
  type: "range";
  anchor: Mark;
  active: Mark;
  excludeAnchor?: boolean;
  excludeActive?: boolean;
}

type Mark =
  | CursorMark
  | ThatMark
  | SourceMark
  | DecoratedSymbolMark
  | NothingMark
  | LineNumberMark
  | RangeMark;

type SimpleSurroundingPairName =
  | "angleBrackets"
  | "backtickQuotes"
  | "curlyBrackets"
  | "doubleQuotes"
  | "escapedDoubleQuotes"
  | "escapedParentheses"
  | "escapedSquareBrackets"
  | "escapedSingleQuotes"
  | "parentheses"
  | "singleQuotes"
  | "squareBrackets";
type ComplexSurroundingPairName = "string" | "any" | "collectionBoundary";
type SurroundingPairName =
  | SimpleSurroundingPairName
  | ComplexSurroundingPairName;

type SimpleScopeTypeType =
  | "argumentOrParameter"
  | "anonymousFunction"
  | "attribute"
  | "class"
  | "className"
  | "collectionItem"
  | "collectionKey"
  | "comment"
  | "functionCall"
  | "functionCallee"
  | "functionName"
  | "ifStatement"
  | "list"
  | "map"
  | "name"
  | "namedFunction"
  | "regularExpression"
  | "statement"
  | "string"
  | "type"
  | "value"
  | "condition"
  | "section"
  | "sectionLevelOne"
  | "sectionLevelTwo"
  | "sectionLevelThree"
  | "sectionLevelFour"
  | "sectionLevelFive"
  | "sectionLevelSix"
  | "selector"
  | "switchStatementSubject"
  | "unit"
  | "xmlBothTags"
  | "xmlElement"
  | "xmlEndTag"
  | "xmlStartTag"
  // Latex scope types
  | "part"
  | "chapter"
  | "subSection"
  | "subSubSection"
  | "namedParagraph"
  | "subParagraph"
  | "environment"
  // Text based scopes
  | "token"
  | "line"
  | "notebookCell"
  | "paragraph"
  | "document"
  | "character"
  | "word"
  | "identifier"
  | "nonWhitespaceSequence"
  | "boundedNonWhitespaceSequence"
  | "url";

interface SimpleScopeType {
  type: SimpleScopeTypeType;
}

interface CustomRegexScopeType {
  type: "customRegex";
  regex: string;
}

type SurroundingPairDirection = "left" | "right";
interface SurroundingPairScopeType {
  type: "surroundingPair";
  delimiter: SurroundingPairName;
  forceDirection?: SurroundingPairDirection;

  /**
   * If `true`, then only accept pairs where the pair completely contains the
   * selection, ie without the edges touching.
   */
  requireStrongContainment?: boolean;
}

interface OneOfScopeType {
  type: "oneOf";
  scopeTypes: ScopeType[];
}

type ScopeType =
  | SimpleScopeType
  | SurroundingPairScopeType
  | CustomRegexScopeType
  | OneOfScopeType;

interface InteriorOnlyModifier {
  type: "interiorOnly";
}

interface ExcludeInteriorModifier {
  type: "excludeInterior";
}

interface ContainingScopeModifier {
  type: "containingScope";
  scopeType: ScopeType;
  ancestorIndex?: number;
}

interface EveryScopeModifier {
  type: "everyScope";
  scopeType: ScopeType;
}

/**
 * Refer to scopes by absolute index relative to iteration scope, eg "first
 * funk" to refer to the first function in a class.
 */
interface OrdinalScopeModifier {
  type: "ordinalScope";

  scopeType: ScopeType;

  /** The start of the range.  Start from end of iteration scope if `start` is negative */
  start: number;

  /** The number of scopes to include.  Will always be positive.  If greater than 1, will include scopes after {@link start} */
  length: number;
}

type Direction = "forward" | "backward";

/**
 * Refer to scopes by offset relative to input target, eg "next
 * funk" to refer to the first function after the function containing the target input.
 */
interface RelativeScopeModifier {
  type: "relativeScope";

  scopeType: ScopeType;

  /** Indicates how many scopes away to start relative to the input target.
   * Note that if {@link direction} is `"backward"`, then this scope will be the
   * end of the output range.  */
  offset: number;

  /** The number of scopes to include.  Will always be positive.  If greater
   * than 1, will include scopes in the direction of {@link direction} */
  length: number;

  /** Indicates which direction both {@link offset} and {@link length} go
   * relative to input target  */
  direction: Direction;
}

/**
 * Converts its input to a raw selection with no type information so for
 * example if it is the destination of a bring or move it should inherit the
 * type information such as delimiters from its source.
 */
interface RawSelectionModifier {
  type: "toRawSelection";
}

interface LeadingModifier {
  type: "leading";
}

interface TrailingModifier {
  type: "trailing";
}

interface KeepContentFilterModifier {
  type: "keepContentFilter";
}

interface KeepEmptyFilterModifier {
  type: "keepEmptyFilter";
}

interface InferPreviousMarkModifier {
  type: "inferPreviousMark";
}

type Position = "before" | "after" | "start" | "end";

interface PositionModifier {
  type: "position";
  position: Position;
}

export interface PartialPrimitiveTargetDescriptorV3 {
  type: "primitive";
  mark?: Mark;
  modifiers?: Modifier[];
  isImplicit?: boolean;
}

interface HeadTailModifier {
  type: "extendThroughStartOf" | "extendThroughEndOf";
  modifiers?: Modifier[];
}

/**
 * Runs {@link modifier} if the target has no explicit scope type, ie if
 * {@link Target.hasExplicitScopeType} is `false`.
 */
interface ModifyIfUntypedModifier {
  type: "modifyIfUntyped";

  /**
   * The modifier to apply if the target is untyped
   */
  modifier: Modifier;
}

/**
 * Tries each of the modifiers in {@link modifiers} in turn until one of them
 * doesn't throw an error, returning the output from the first modifier not
 * throwing an error.
 */
interface CascadingModifier {
  type: "cascading";

  /**
   * The modifiers to try in turn
   */
  modifiers: Modifier[];
}

/**
 * First applies {@link anchor} to input, then independently applies
 * {@link active}, and forms a range between the two resulting targets
 */
interface RangeModifier {
  type: "range";
  anchor: Modifier;
  active: Modifier;
  excludeAnchor?: boolean;
  excludeActive?: boolean;
}

type Modifier =
  | PositionModifier
  | InteriorOnlyModifier
  | ExcludeInteriorModifier
  | ContainingScopeModifier
  | EveryScopeModifier
  | OrdinalScopeModifier
  | RelativeScopeModifier
  | HeadTailModifier
  | LeadingModifier
  | TrailingModifier
  | RawSelectionModifier
  | ModifyIfUntypedModifier
  | CascadingModifier
  | RangeModifier
  | KeepContentFilterModifier
  | KeepEmptyFilterModifier
  | InferPreviousMarkModifier;

// continuous is one single continuous selection between the two targets
// vertical puts a selection on each line vertically between the two targets
type RangeType = "continuous" | "vertical";

export interface PartialRangeTargetDescriptorV3 {
  type: "range";
  anchor: PartialPrimitiveTargetDescriptorV3;
  active: PartialPrimitiveTargetDescriptorV3;
  excludeAnchor: boolean;
  excludeActive: boolean;
  rangeType?: RangeType;
}

interface PartialListTargetDescriptor {
  type: "list";
  elements: (
    | PartialPrimitiveTargetDescriptorV3
    | PartialRangeTargetDescriptorV3
  )[];
}

export type PartialTargetDescriptorV3 =
  | PartialPrimitiveTargetDescriptorV3
  | PartialRangeTargetDescriptorV3
  | PartialListTargetDescriptor;
