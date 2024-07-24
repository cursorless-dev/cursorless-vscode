import {
  Edit,
  FlashStyle,
  RangeExpansionBehavior,
  Selection,
  toCharacterRange,
} from "@cursorless/common";
import { RangeUpdater } from "../core/updateSelections/RangeUpdater";
import { performEditsAndUpdateSelections } from "../core/updateSelections/updateSelections";
import { ide } from "../singletons/ide.singleton";
import { Target } from "../typings/target.types";
import { runOnTargetsForEachEditor } from "../util/targetUtils";
import { ActionReturnValue } from "./actions.types";

export default class Wrap {
  constructor(private rangeUpdater: RangeUpdater) {
    this.run = this.run.bind(this);
  }

  async run(
    targets: Target[],
    left: string,
    right: string,
  ): Promise<ActionReturnValue> {
    const results = await runOnTargetsForEachEditor(
      targets,
      async (editor, targets) => {
        const boundaries = targets.map((target) => ({
          start: new Selection(
            target.contentRange.start,
            target.contentRange.start,
          ),
          end: new Selection(target.contentRange.end, target.contentRange.end),
        }));

        const edits: Edit[] = boundaries.flatMap(({ start, end }) => [
          {
            text: left,
            range: start,
          },
          {
            text: right,
            range: end,
            isReplace: true,
          },
        ]);

        const boundariesStartSelections = boundaries.map(({ start }) => start);
        const boundariesEndSelections = boundaries.map(({ end }) => end);

        const editableEditor = ide().getEditableTextEditor(editor);

        const contentSelections = targets.map(
          (target) => target.contentSelection,
        );

        const {
          boundariesStartSelections: delimiterStartSelections,
          boundariesEndSelections: delimiterEndSelections,
          sourceSelections: sourceMarkSelections,
          thatSelections: thatMarkSelections,
        } = await performEditsAndUpdateSelections({
          rangeUpdater: this.rangeUpdater,
          editor: editableEditor,
          edits,
          selections: {
            boundariesStartSelections: {
              selections: boundariesStartSelections,
              behavior: RangeExpansionBehavior.openClosed,
            },
            boundariesEndSelections: {
              selections: boundariesEndSelections,
              behavior: RangeExpansionBehavior.closedOpen,
            },
            sourceSelections: contentSelections,
            thatSelections: {
              selections: contentSelections,
              behavior: RangeExpansionBehavior.openOpen,
            },
          },
        });

        const delimiterSelections = [
          ...delimiterStartSelections,
          ...delimiterEndSelections,
        ];

        await ide().flashRanges(
          delimiterSelections.map((selection) => ({
            editor,
            range: toCharacterRange(selection),
            style: FlashStyle.justAdded,
          })),
        );

        return {
          sourceMark: sourceMarkSelections.map((selection) => ({
            editor,
            selection,
          })),
          thatMark: thatMarkSelections.map((selection) => ({
            editor,
            selection,
          })),
        };
      },
    );

    return {
      sourceSelections: results.flatMap(({ sourceMark }) => sourceMark),
      thatSelections: results.flatMap(({ thatMark }) => thatMark),
    };
  }
}
