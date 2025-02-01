import type { Range } from "@cursorless/common";
import type {
  Destination,
  EditNewActionType,
} from "../../typings/target.types";

/**
 * Internal type to be used for storing a reference to a destination that will use an
 * edit action to insert a new destination
 */
export interface EditDestination {
  destination: Destination;

  /**
   * The original index of this target in the original list of targets passed
   * to the action
   */
  index: number;
}

/**
 * Internal representation of the current state.  This action first handles
 * command targets, then edit targets.  This state is used to track cursors,
 * thatTargets, etc as we perform the edits and commands.
 *
 * Note that each field is an array with the same number of items, equal to the
 * number of original targets passed into the action.
 */
export interface State {
  /**
   * This field stores the original destinations.
   */
  destinations: Destination[];

  /**
   * The action types for each destination. Important to read from this and not
   * the destinations themself since they get updated during the process am we want
   * the default value for this.
   */
  actionTypes: EditNewActionType[];

  /**
   * We use this field to track the desired `thatMark` at the end, updating it
   * as necessary.
   */
  thatRanges: Range[];

  /**
   * Where the cursors should be placed.  We update these after each step.
   * They are initially undefined, and we update them as we run commands /
   * perform edits, and the finally use them to set the cursor positions at the
   * end.
   */
  cursorRanges: (Range | undefined)[];
}
