import type { ScopeType } from "@cursorless/common";
import type { Target } from "../../typings/target.types";
import type { ModifierStageFactory } from "../ModifierStageFactory";
import { createContinuousRangeTarget } from "../createContinuousRangeTarget";
import { assertIndices } from "./listUtils";

/**
 * Construct a single range target between two targets in a list of targets,
 * inclusive
 * @param targets The list of targets to index into
 * @param startIndex The index of the target in {@link targets} that will form
 * the start of the range
 * @param endIndex The index of the target in {@link targets} that will form the
 * end of the range
 */
export function createRangeTargetFromIndices(
  scopeType: ScopeType,
  isReversed: boolean,
  targets: Target[],
  startIndex: number,
  endIndex: number,
): Target {
  assertIndices(scopeType, targets, startIndex, endIndex);

  if (startIndex === endIndex) {
    return targets[startIndex];
  }

  return createContinuousRangeTarget(
    isReversed,
    targets[startIndex],
    targets[endIndex],
    true,
    true,
  );
}

export function getEveryScopeTargets(
  modifierStageFactory: ModifierStageFactory,
  target: Target,
  scopeType: ScopeType,
): Target[] {
  const containingStage = modifierStageFactory.create({
    type: "everyScope",
    scopeType,
  });
  return containingStage.run(target);
}
