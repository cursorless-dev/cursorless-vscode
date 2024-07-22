import { FlashStyle } from "@cursorless/common";
import { RangeUpdater } from "../core/updateSelections/RangeUpdater";
import { EditsUpdater } from "../core/updateSelections/updateSelections";
import { getContainingSurroundingPairIfNoBoundaryStage } from "../processTargets/modifiers/InteriorStage";
import { ModifierStageFactory } from "../processTargets/ModifierStageFactory";
import { ide } from "../singletons/ide.singleton";
import { Target } from "../typings/target.types";
import {
  createThatMark,
  flashTargets,
  runOnTargetsForEachEditor,
} from "../util/targetUtils";
import { ActionReturnValue } from "./actions.types";

export default class Rewrap {
  getFinalStages = () => [
    getContainingSurroundingPairIfNoBoundaryStage(this.modifierStageFactory),
  ];

  constructor(
    private rangeUpdater: RangeUpdater,
    private modifierStageFactory: ModifierStageFactory,
  ) {
    this.run = this.run.bind(this);
  }

  async run(
    targets: Target[],
    left: string,
    right: string,
  ): Promise<ActionReturnValue> {
    const boundaryTargets = targets.flatMap((target) => {
      const boundary = target.getBoundary()!;

      if (boundary.length !== 2) {
        throw Error("Target must have an opening and closing delimiter");
      }

      return boundary;
    });

    await flashTargets(ide(), boundaryTargets, FlashStyle.pendingModification0);

    const results = await runOnTargetsForEachEditor(
      boundaryTargets,
      async (editor, boundaryTargets) => {
        const edits = boundaryTargets.map((target, i) => ({
          editor,
          range: target.contentRange,
          text: i % 2 === 0 ? left : right,
        }));
        const editableEditor = ide().getEditableTextEditor(editor);

        const {
          ranges: [updatedSourceRanges, updatedThatRanges],
        } = await new EditsUpdater(this.rangeUpdater, editableEditor, edits)
          .ranges(targets.map((target) => target.thatTarget.contentRange))
          .ranges(targets.map((target) => target.contentRange))
          .updateEditorSelections()
          .run();

        return {
          sourceMark: createThatMark(targets, updatedSourceRanges),
          thatMark: createThatMark(targets, updatedThatRanges),
        };
      },
    );

    return {
      sourceSelections: results.flatMap(({ sourceMark }) => sourceMark),
      thatSelections: results.flatMap(({ thatMark }) => thatMark),
    };
  }
}
