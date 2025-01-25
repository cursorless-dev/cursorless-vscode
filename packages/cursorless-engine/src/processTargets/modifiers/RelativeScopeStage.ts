import {
  NoContainingScopeError,
  type RelativeScopeModifier,
} from "@cursorless/common";
import type { Target } from "../../typings/target.types";
import type { ModifierStageFactory } from "../ModifierStageFactory";
import type { ModifierStage } from "../PipelineStages.types";
import { runLegacy } from "./relativeScopeLegacy";
import type { ScopeHandlerFactory } from "./scopeHandlers/ScopeHandlerFactory";
import type { TargetScope } from "./scopeHandlers/scope.types";
import type {
  ContainmentPolicy,
  ScopeHandler,
} from "./scopeHandlers/scopeHandler.types";
import { islice, itake } from "itertools";
import { OutOfRangeError } from "./listUtils";
import { constructScopeRangeTarget } from "./constructScopeRangeTarget";
import { getPreferredScopeTouchingPosition } from "./getPreferredScopeTouchingPosition";

/**
 * Handles relative modifiers input, eg "next funk", "two funks", "previous two
 * tokens". Proceeds by running {@link ScopeHandler.generateScopes} to get the
 * desired scopes, skipping the first scope if input range is empty and is at
 * start of that scope.
 */
export class RelativeScopeStage implements ModifierStage {
  constructor(
    private modifierStageFactory: ModifierStageFactory,
    private scopeHandlerFactory: ScopeHandlerFactory,
    private modifier: RelativeScopeModifier,
  ) {}

  run(target: Target): Target[] {
    const scopeHandler = this.scopeHandlerFactory.maybeCreate(
      this.modifier.scopeType,
      target.editor.document.languageId,
    );

    if (scopeHandler == null) {
      return runLegacy(this.modifierStageFactory, this.modifier, target);
    }

    const scopes = Array.from(
      this.modifier.offset === 0
        ? generateScopesInclusive(scopeHandler, target, this.modifier)
        : generateScopesExclusive(scopeHandler, target, this.modifier),
    );

    if (scopes.length < this.modifier.length) {
      throw new OutOfRangeError(
        this.modifier.scopeType,
        this.modifier.offset + this.modifier.length - 1,
      );
    }

    const { isReversed } = target;

    if (this.modifier.isEvery) {
      return scopes.flatMap((scope) => scope.getTargets(isReversed));
    }

    return constructScopeRangeTarget(
      isReversed,
      scopes[0],
      scopes[scopes.length - 1],
    );
  }
}

/**
 * Handles relative modifiers that include targets intersecting with the input,
 * eg `"two funks"`, `"token backward"`, etc.  Proceeds as follows:
 *
 * 1. Constructs the initial range to use as the starting point for the relative
 *    scope search.  Expands from the proximal end of the input target (start
 *    for "forward", end for "backward") to the smallest containing scope,
 *    breaking ties in direction {@link direction} rather than the tie-breaking
 *    heuristics we use for containing scope, to make this modifier easier to
 *    reason about when between scopes.
 * 2. Calls {@link ScopeHandler.generateScopes} to get as many scopes as
 *    desired, starting from the proximal end of the initial range (ie the start
 *    if direction is "forward", the end if direction is "backward").
 */
function generateScopesInclusive(
  scopeHandler: ScopeHandler,
  target: Target,
  modifier: RelativeScopeModifier,
): Iterable<TargetScope> {
  const { editor, contentRange } = target;
  const { length: desiredScopeCount, direction } = modifier;

  const initialRange = getPreferredScopeTouchingPosition(
    scopeHandler,
    editor,
    direction === "forward" ? contentRange.start : contentRange.end,
    direction,
  )?.domain;

  if (initialRange == null) {
    throw new NoContainingScopeError(modifier.scopeType.type);
  }

  return itake(
    desiredScopeCount,
    scopeHandler.generateScopes(
      editor,
      direction === "forward" ? initialRange.start : initialRange.end,
      direction,
      {
        skipAncestorScopes: true,
      },
    ),
  );
}

/**
 * Handles relative modifiers that don't include targets intersecting with the
 * input, eg "next funk", "previous two tokens". Proceeds by running
 * {@link ScopeHandler.generateScopes} to get the desired scopes, skipping the
 * first scope if input range is empty and is at start of that scope.
 */
function generateScopesExclusive(
  scopeHandler: ScopeHandler,
  target: Target,
  modifier: RelativeScopeModifier,
): Iterable<TargetScope> {
  const { editor, contentRange: inputRange } = target;
  const { length: desiredScopeCount, direction, offset } = modifier;

  const initialPosition =
    direction === "forward" ? inputRange.end : inputRange.start;

  // If inputRange is empty, then we skip past any scopes that start at
  // inputRange.  Otherwise just disallow any scopes that start strictly
  // before the end of input range (strictly after for "backward").
  const containment: ContainmentPolicy | undefined = inputRange.isEmpty
    ? "disallowed"
    : "disallowedIfStrict";

  return islice(
    scopeHandler.generateScopes(editor, initialPosition, direction, {
      containment,
      skipAncestorScopes: true,
    }),
    offset - 1,
    offset + desiredScopeCount - 1,
  );
}
