import type { Position, TextEditor } from "vscode";
import type {
  Direction,
  ScopeType,
} from "../../../typings/targetDescriptor.types";
import type { TargetScope } from "./scope.types";
import type {
  ScopeHandler,
  ScopeIteratorRequirements,
} from "./scopeHandler.types";
import { shouldReturnScope } from "./scopeHandlers.helpers";

/**
 * All scope handlers should derive from this base class
 */
export default abstract class BaseScopeHandler implements ScopeHandler {
  public abstract readonly scopeType: ScopeType;
  public abstract readonly iterationScopeType: ScopeType;

  /**
   * Indicates whether scopes are allowed to contain one another.  If `true`, we
   * can optimise the algorithm by making certain assumptions.
   */
  protected abstract readonly isHierarchical: boolean;

  /**
   * Returns an iterable that yields scopes.
   *
   * If {@link direction} is `"forward"`, walk forward starting at
   * {@link position} (including position). Any time a scope's
   * {@link TargetScope.domain|domain} ends or starts, yield that scope.  If
   * multiple domains start or end at a particular point, break ties as follows:
   *
   * 1. First yield any scopes with empty domain.
   * 2. Then yield any scopes whose domains are ending, in reverse order of
   *    where they start.
   * 3. Then yield the scope with minimal domain that is starting. Any time you
   *    yield a scope, advance your position to the end of the scope, but when
   *    considering this new position, don't return this scope again.
   *
   * Note that once you have yielded a scope, you should not yield any scopes
   * contained by that scope.
   *
   * In the case of a non-hierarchical scope type, the above is equivalent to
   * the following:
   *
   * Yield all scopes whose {@link TargetScope.domain|domain}'s
   * {@link Range.end|end} is equal to or after {@link position}, in order of
   * domain end position.
   *
   * If {@link direction} is `"backward"`, walk backward starting at
   * {@link position} (including position). Any time a scope's
   * {@link TargetScope.domain|domain} ends or starts, yield that scope.  If
   * multiple domains start or end at a particular point, break ties as follows:
   *
   * 1. First yield any scopes with empty domain.
   * 2. Then yield any scopes whose domains are starting, in order of where they
   *    end.
   * 3. Then yield the scope with minimal domain that is ending. Any time you
   *    yield a scope, advance your position to the start of the scope, but when
   *    considering this new position, don't return this scope again.
   *
   * In the case of a non-hierarchical scope type, the above is equivalent to
   * the following:
   *
   * Yield all scopes whose {@link TargetScope.domain|domain}'s
   * {@link Range.start|start} is equal to or before {@link position}, in
   * reverse order domain start position.
   *
   * Note that the {@link hints} argument can be ignored, but you are welcome to
   * use it to improve performance.  For example, knowing the
   * {@link ScopeIteratorRequirements.distalPosition} can be useful if you are
   * getting a list of scopes in bulk.
   *
   * @param editor The editor containing {@link position}
   * @param position The position from which to start
   * @param direction The direction to go relative to {@link position}
   * @param hints Optional hints about which scopes should be returned
   */
  protected abstract generateScopeCandidates(
    editor: TextEditor,
    position: Position,
    direction: Direction,
    hints?: ScopeIteratorRequirements | undefined,
  ): Iterable<TargetScope>;

  /**
   * Returns an iterable of scopes meeting the requirements in
   * {@link requirements}, yielded in a specific order.  See
   * {@link generateScopeCandidates} for more on the order.
   *
   * @param editor The editor containing {@link position}
   * @param position The position from which to start
   * @param direction The direction to go relative to {@link position}
   * @param requirements Extra requirements of the scopes being returned
   * @returns An iterable of scopes
   */
  *generateScopes(
    editor: TextEditor,
    position: Position,
    direction: Direction,
    requirements: ScopeIteratorRequirements | undefined = {},
  ): Iterable<TargetScope> {
    let previousScope: TargetScope | undefined = undefined;

    for (const scope of this.generateScopeCandidates(
      editor,
      position,
      direction,
      requirements,
    )) {
      if (
        shouldReturnScope(
          position,
          direction,
          requirements,
          previousScope,
          scope,
        )
      ) {
        yield scope;
      }

      if (this.canStopEarly(position, direction, requirements, scope)) {
        return;
      }

      previousScope = scope;
    }
  }

  private canStopEarly(
    position: Position,
    direction: Direction,
    requirements: ScopeIteratorRequirements,
    { domain }: TargetScope,
  ) {
    const { containment, distalPosition } = requirements;

    if (this.isHierarchical) {
      // Don't try anything fancy if scope is hierarchical
      return false;
    }

    if (
      containment === "required" &&
      (direction === "forward"
        ? domain.end.isAfter(position)
        : domain.start.isBefore(position))
    ) {
      // If we require containment, then if we have already yielded something
      // ending strictly after position, we won't yield anything else containing
      // position
      return true;
    }

    if (
      distalPosition != null &&
      (direction === "forward"
        ? domain.end.isAfterOrEqual(distalPosition)
        : domain.start.isBeforeOrEqual(distalPosition))
    ) {
      // If we have a distal position, and we have yielded something that ends
      // at or after distal position, we won't be able to yield anything else
      // that starts before distal position
      return true;
    }

    return false;
  }
}
