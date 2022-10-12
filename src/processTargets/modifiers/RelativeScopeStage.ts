import { findLastIndex } from "lodash";
import { Range } from "vscode";
import { Target } from "../../typings/target.types";
import { RelativeScopeModifier } from "../../typings/targetDescriptor.types";
import { ProcessedTargetsContext } from "../../typings/Types";
import getScopeHandler from "../getScopeHandler";
import { ModifierStage } from "../PipelineStages.types";
import { UntypedTarget } from "../targets";
import { ContainedIndices } from "./scopeHandlers/scopeHandler.types";
import {
  createRangeTargetFromIndices,
  getEveryScopeTargets,
  OutOfRangeError,
} from "./targetSequenceUtils";

export class RelativeScopeStage implements ModifierStage {
  constructor(private modifier: RelativeScopeModifier) {}

  run(context: ProcessedTargetsContext, target: Target): Target[] {
    switch (this.modifier.scopeType.type) {
      case "token":
        return this.runNew(target);
      default:
        return this.runLegacy(context, target);
    }
  }

  private runNew(target: Target): Target[] {
    const scopeHandler = getScopeHandler(this.modifier.scopeType);
    const iterationScope = scopeHandler.run(
      target.editor,
      target.contentRange,
      target.isReversed,
      false
    );

    return this.calculateIndicesAndCreateTarget(
      target,
      iterationScope.targets,
      iterationScope.containingIndices
    );
  }

  private runLegacy(
    context: ProcessedTargetsContext,
    target: Target
  ): Target[] {
    /**
     * A list of targets in the iteration scope for the input {@link target}.
     * Note that we convert {@link target} to have no explicit range so that we
     * get all targets in the iteration scope rather than just the intersecting
     * targets.
     *
     * FIXME: In the future we should probably use a better abstraction for this, but
     * that will rely on #629
     */
    const targets = getEveryScopeTargets(
      context,
      createTargetWithoutExplicitRange(target),
      this.modifier.scopeType
    );

    const containingIndices = getContainingIndices(
      target.contentRange,
      targets
    );

    return this.calculateIndicesAndCreateTarget(
      target,
      targets,
      containingIndices
    );
  }

  private calculateIndicesAndCreateTarget(
    target: Target,
    targets: Target[],
    containingIndices: ContainedIndices | undefined
  ): Target[] {
    const isForward = this.modifier.direction === "forward";

    /** Proximal index. This is the index closest to the target content range. */
    const proximalIndex = this.computeProximalIndex(
      target.contentRange,
      targets,
      isForward,
      containingIndices
    );

    /** Index of range farther from input target */
    const distalIndex = isForward
      ? proximalIndex + this.modifier.length - 1
      : proximalIndex - this.modifier.length + 1;

    const startIndex = Math.min(proximalIndex, distalIndex);
    const endIndex = Math.max(proximalIndex, distalIndex);

    return [
      createRangeTargetFromIndices(
        target.isReversed,
        targets,
        startIndex,
        endIndex
      ),
    ];
  }

  /**
   * Compute the index of the target that will form the near end of the range.
   *
   * @param inputTargetRange The range of the input target to the modifier stage
   * @param targets A list of all targets under consideration (eg in iteration
   * scope)
   * @param isForward `true` if we are handling "next", `false` if "previous"
   * @returns The index into {@link targets} that will form the near end of the range.
   */
  private computeProximalIndex(
    inputTargetRange: Range,
    targets: Target[],
    isForward: boolean,
    containingIndices: ContainedIndices | undefined
  ) {
    const includeIntersectingScopes = this.modifier.offset === 0;

    if (containingIndices == null) {
      const adjacentTargetIndex = isForward
        ? targets.findIndex((t) =>
            t.contentRange.start.isAfter(inputTargetRange.start)
          )
        : findLastIndex(targets, (t) =>
            t.contentRange.start.isBefore(inputTargetRange.start)
          );

      if (adjacentTargetIndex === -1) {
        throw new OutOfRangeError();
      }

      // For convenience, if they ask to include intersecting indices, we just
      // start with the nearest one in the correct direction.  So eg if you say
      // "two funks" between functions, it will take two functions to the right
      // of you.
      if (includeIntersectingScopes) {
        return adjacentTargetIndex;
      }

      return isForward
        ? adjacentTargetIndex + this.modifier.offset - 1
        : adjacentTargetIndex - this.modifier.offset + 1;
    }

    // If we've made it here, then there are scopes intersecting with
    // {@link inputTargetRange}

    const intersectingStartIndex = containingIndices.start;
    const intersectingEndIndex = containingIndices.end;

    if (includeIntersectingScopes) {
      // Number of scopes intersecting with input target is already greater than
      // desired length; throw error.  This occurs if user says "two funks", and
      // they have 3 functions selected.  Not clear what to do in that case so
      // we throw error.
      const intersectingLength =
        intersectingEndIndex - intersectingStartIndex + 1;
      if (intersectingLength > this.modifier.length) {
        throw new TooFewScopesError(
          this.modifier.length,
          intersectingLength,
          this.modifier.scopeType.type
        );
      }

      // This ensures that we count intersecting scopes in "three funks", so
      // that we will never get more than 3 functions.
      return isForward ? intersectingStartIndex : intersectingEndIndex;
    }

    // If we are excluding the intersecting scopes, then we set 0 to be such
    // that the next scope will be the first non-intersecting.
    return isForward
      ? intersectingEndIndex + this.modifier.offset
      : intersectingStartIndex - this.modifier.offset;
  }
}

class TooFewScopesError extends Error {
  constructor(
    requestedLength: number,
    currentLength: number,
    scopeType: string
  ) {
    super(
      `Requested ${requestedLength} ${scopeType}s, but ${currentLength} are already selected.`
    );
    this.name = "TooFewScopesError";
  }
}

/** Get indices of all targets in {@link targets} intersecting with
 * {@link inputTargetRange} */
function getContainingIndices(
  inputTargetRange: Range,
  targets: Target[]
): ContainedIndices | undefined {
  const targetsWithIntersection = targets
    .map((t, i) => ({
      index: i,
      intersection: t.contentRange.intersection(inputTargetRange),
    }))
    .filter((t) => t.intersection != null);

  // Input target range is empty. Use rightmost target and accept weak
  // containment.
  if (inputTargetRange.isEmpty) {
    if (targetsWithIntersection.length === 0) {
      return undefined;
    }
    const index = targetsWithIntersection.at(-1)!.index;
    return { start: index, end: index };
  }

  // Input target range is not empty. Use all targets with non empty
  // intersections.
  const targetsWithNonEmptyIntersection = targetsWithIntersection
    .filter((t) => !t.intersection!.isEmpty)
    .map((t) => t.index);
  if (targetsWithNonEmptyIntersection.length === 0) {
    return undefined;
  }
  return {
    start: targetsWithNonEmptyIntersection[0],
    end: targetsWithNonEmptyIntersection.at(-1)!,
  };
}

function createTargetWithoutExplicitRange(target: Target) {
  return new UntypedTarget({
    editor: target.editor,
    isReversed: target.isReversed,
    contentRange: target.contentRange,
    hasExplicitRange: false,
  });
}
