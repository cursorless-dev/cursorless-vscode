import type { EditableTextEditor } from "@cursorless/common";
import { RangeExpansionBehavior } from "@cursorless/common";
import { zip } from "lodash-es";
import type { RangeUpdater } from "../../core/updateSelections/RangeUpdater";
import { performEditsAndUpdateSelections } from "../../core/updateSelections/updateSelections";
import type { EditDestination, State } from "./EditNew.types";

/**
 * Handle targets that will use an edit action to insert a new target, and
 * return an updated state object.
 *
 * We proceed by asking the targets to construct an edit where we insert an
 * empty string, and then we place the cursor where that empty string would be.
 * This will cause the targets to delete themselves, or insert a delimiter if
 * they are positional.
 * @param graph The graph object
 * @param editor The editor on which we're operating
 * @param state The state object tracking cursors, thatMark, etc
 * @returns An updated `state` object
 */
export async function runEditTargets(
  rangeUpdater: RangeUpdater,
  editor: EditableTextEditor,
  state: State,
  useAllDestinations: boolean,
): Promise<State> {
  const destinations: EditDestination[] = state.destinations
    .map((destination, index) => {
      if (useAllDestinations || state.actionTypes[index] === "edit") {
        return {
          destination,
          index,
        };
      }
    })
    .filter((destination): destination is EditDestination => !!destination);

  if (destinations.length === 0) {
    return state;
  }

  const edits = destinations.map((destination) =>
    destination.destination.constructChangeEdit(""),
  );

  // We need to remove undefined cursor locations.  Note that these undefined
  // locations will be the locations where our edit targets will go.  The only
  // cursor positions defined at this point will have come from command targets
  // before.
  const cursorInfos = state.cursorRanges
    .map((range, index) => ({ range, index }))
    .filter(({ range }) => range != null);

  const cursorIndices = cursorInfos.map(({ index }) => index);
  const cursorRanges = cursorInfos.map(({ range }) => range!);
  const editRanges = edits.map((edit) => edit.range);

  const {
    thatRanges: updatedThatRanges,
    cursorRanges: updatedCursorRanges,
    editRanges: updatedEditRanges,
  } = await performEditsAndUpdateSelections({
    rangeUpdater,
    editor,
    edits,
    preserveCursorSelections: true,
    selections: {
      thatRanges: state.thatRanges,
      cursorRanges,
      editRanges: {
        selections: editRanges,
        behavior: RangeExpansionBehavior.openOpen,
      },
    },
  });

  const finalCursorRanges = [...state.cursorRanges];

  // Update the cursor positions for the command targets
  zip(cursorIndices, updatedCursorRanges).forEach(([index, range]) => {
    finalCursorRanges[index!] = range;
  });

  // Add cursor positions for our edit targets.
  destinations.forEach((delimiterTarget, index) => {
    const edit = edits[index];
    const range = edit.updateRange(updatedEditRanges[index]);
    finalCursorRanges[delimiterTarget.index] = range;
  });

  return {
    destinations: state.destinations,
    actionTypes: state.actionTypes,
    thatRanges: updatedThatRanges,
    cursorRanges: finalCursorRanges,
  };
}
