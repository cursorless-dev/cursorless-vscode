import type {
  ExecuteCommandOptions,
  GetTextActionOptions,
  HighlightId,
  InsertSnippetArg,
  ReplaceWith,
  SimpleActionName,
  WrapWithSnippetArg,
} from "@cursorless/common";
import type { ModifierStage } from "../processTargets/PipelineStages.types";
import type { SelectionWithEditor } from "../typings/Types";
import type { Destination, Target } from "../typings/target.types";

/**
 * To be returned by {@link SimpleAction.run}
 */
export interface ActionReturnValue {
  /**
   * The value that should be returned to the caller of the command
   */
  returnValue?: any;

  /**
   * A list of selections that will become the `that` mark for the next command.
   * The given selections will be wrapped in {@link UntypedTarget}s. This
   * attribute is provided for convenience. Mutually exclusive with
   * {@link thatTargets}
   */
  thatSelections?: SelectionWithEditor[];

  /**
   * A list of targets that will become the `that` mark for the next command.
   * Mutually exclusive with {@link thatSelections}
   */
  thatTargets?: Target[];

  /**
   * A list of selections that will become the `source` mark for the next command.
   * The given selections will be wrapped in {@link UntypedTarget}s. This
   * attribute is provided for convenience. Mutually exclusive with {@link sourceTargets}
   */
  sourceSelections?: SelectionWithEditor[];

  /**
   * A list of targets that will become the `source` mark for the next command.
   * Mutually exclusive with {@link sourceSelections}
   */
  sourceTargets?: Target[];

  /**
   * A list of targets that will be used by the "instance" modifier in the next command
   * to determine either the range for "every", or the start point for "next"
   */
  instanceReferenceTargets?: Target[];

  /**
   * A list of targets that become the active keybaord targets
   */
  keyboardTargets?: Target[];
}

export interface SimpleAction {
  run(targets: Target[]): Promise<ActionReturnValue>;

  /**
   * Used to define final stages that should be run at the end of the pipeline before the action
   * @param args Extra args to command
   */
  getFinalStages?(): ModifierStage[];

  /**
   * If `true`, don't perform automatic token expansion for "<action> this" with
   * empty cursor. Used for actions like `setImplicitTarget` that are just
   * loading up the pipeline.
   */
  noAutomaticTokenExpansion?: boolean;
}

/**
 * Keeps a map from action names to objects that implement the given action
 */
export interface ActionRecord extends Record<SimpleActionName, SimpleAction> {
  callAsFunction: {
    run(callees: Target[], args: Target[]): Promise<ActionReturnValue>;
  };

  replaceWithTarget: {
    run(
      sources: Target[],
      destinations: Destination[],
    ): Promise<ActionReturnValue>;
  };

  moveToTarget: {
    run(
      sources: Target[],
      destinations: Destination[],
    ): Promise<ActionReturnValue>;
  };

  swapTargets: {
    run(targets1: Target[], targets2: Target[]): Promise<ActionReturnValue>;
  };

  wrapWithPairedDelimiter: {
    run(
      targets: Target[],
      left: string,
      right: string,
    ): Promise<ActionReturnValue>;
  };

  rewrapWithPairedDelimiter: {
    run(
      targets: Target[],
      left: string,
      right: string,
    ): Promise<ActionReturnValue>;
    getFinalStages(): ModifierStage[];
  };

  pasteFromClipboard: {
    run(destinations: Destination[]): Promise<ActionReturnValue>;
  };

  generateSnippet: {
    run(
      targets: Target[],
      directory?: string,
      snippetName?: string,
    ): Promise<ActionReturnValue>;
  };

  insertSnippet: {
    run(
      destinations: Destination[],
      snippetDescription: InsertSnippetArg,
    ): Promise<ActionReturnValue>;
    getFinalStages(
      destinations: Destination[],
      snippetDescription: InsertSnippetArg,
    ): ModifierStage[];
  };

  wrapWithSnippet: {
    run(
      targets: Target[],
      snippetDescription: WrapWithSnippetArg,
    ): Promise<ActionReturnValue>;
    getFinalStages(
      targets: Target[],
      snippetDescription: WrapWithSnippetArg,
    ): ModifierStage[];
  };

  editNew: {
    run(destinations: Destination[]): Promise<ActionReturnValue>;
  };

  executeCommand: {
    run(
      targets: Target[],
      commandId: string,
      options?: ExecuteCommandOptions,
    ): Promise<ActionReturnValue>;
  };

  replace: {
    run(
      destinations: Destination[],
      replaceWith: ReplaceWith,
    ): Promise<ActionReturnValue>;
  };

  highlight: {
    run(
      targets: Target[],
      highlightId?: HighlightId,
    ): Promise<ActionReturnValue>;
  };

  getText: {
    run(
      target: Target[],
      options?: GetTextActionOptions,
    ): Promise<ActionReturnValue>;
  };
}
