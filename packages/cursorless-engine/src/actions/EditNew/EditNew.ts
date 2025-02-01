import type { RangeUpdater } from "../../core/updateSelections/RangeUpdater";
import { ide } from "../../singletons/ide.singleton";
import type { Destination } from "../../typings/target.types";
import { createThatMark, ensureSingleEditor } from "../../util/targetUtils";
import type { Actions } from "../Actions";
import type { ActionReturnValue } from "../actions.types";
import type { State } from "./EditNew.types";
import { runEditTargets } from "./runEditTargets";
import { runInsertLineAfterTargets } from "./runInsertLineAfterTargets";
import { runEditNewNotebookCellTargets } from "./runNotebookCellTargets";

export class EditNew {
  constructor(
    private rangeUpdater: RangeUpdater,
    private actions: Actions,
  ) {
    this.run = this.run.bind(this);
  }

  async run(destinations: Destination[]): Promise<ActionReturnValue> {
    if (destinations.some(({ target }) => target.isNotebookCell)) {
      // It is not possible to "pour" a notebook cell and something else,
      // because each notebook cell is its own editor, and you can't have
      // cursors in multiple editors.
      return runEditNewNotebookCellTargets(this.actions, destinations);
    }

    const editableEditor = ide().getEditableTextEditor(
      ensureSingleEditor(destinations),
    );

    /**
     * Keeps track of the desired cursor positions and "that" marks as we
     * perform the necessary commands and edits.
     */
    let state: State = {
      destinations,
      actionTypes: destinations.map((d) => d.getEditNewActionType()),
      thatRanges: destinations.map(
        ({ target }) => target.thatTarget.contentRange,
      ),
      cursorRanges: new Array(destinations.length).fill(
        undefined,
      ) as undefined[],
    };

    const insertLineAfterCapability =
      ide().capabilities.commands.insertLineAfter;
    const useInsertLineAfter = insertLineAfterCapability != null;

    if (useInsertLineAfter) {
      state = await runInsertLineAfterTargets(
        insertLineAfterCapability,
        this.rangeUpdater,
        editableEditor,
        state,
      );
    }

    state = await runEditTargets(
      this.rangeUpdater,
      editableEditor,
      state,
      !useInsertLineAfter,
    );

    const newSelections = state.destinations.map((destination, index) => {
      const cursorRange = state.cursorRanges[index];
      if (cursorRange == null) {
        throw Error("Cursor range is undefined for destination");
      }
      return cursorRange.toSelection(destination.target.isReversed);
    });

    await editableEditor.setSelections(newSelections, { focusEditor: true });

    return {
      thatSelections: createThatMark(
        state.destinations.map((d) => d.target),
        state.thatRanges,
      ),
    };
  }
}
