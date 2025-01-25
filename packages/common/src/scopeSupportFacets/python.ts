import type { LanguageScopeSupportFacetMap } from "./scopeSupportFacets.types";
import { ScopeSupportFacetLevel } from "./scopeSupportFacets.types";

const { supported, notApplicable } = ScopeSupportFacetLevel;

export const pythonScopeSupport: LanguageScopeSupportFacetMap = {
  "name.foreach": supported,
  "name.resource": supported,
  "name.resource.iteration": supported,
  "name.argument.actual": supported,
  "name.argument.actual.iteration": supported,

  "value.foreach": supported,
  "value.yield": supported,
  "value.resource": supported,
  "value.resource.iteration": supported,
  "value.argument.actual": supported,
  "value.argument.actual.iteration": supported,

  namedFunction: supported,
  anonymousFunction: supported,
  disqualifyDelimiter: supported,
  pairDelimiter: supported,

  "argument.actual": supported,
  "argument.actual.iteration": supported,
  "argument.formal": supported,
  "argument.formal.iteration": supported,

  "collectionItem.unenclosed": supported,
  "collectionItem.unenclosed.iteration": supported,

  "branch.if": supported,
  "branch.if.iteration": supported,
  "branch.switchCase": supported,
  "branch.switchCase.iteration": supported,
  "branch.ternary": supported,
  "branch.try": supported,
  "branch.loop": supported,

  element: notApplicable,
  tags: notApplicable,
  attribute: notApplicable,
  "key.attribute": notApplicable,
  "value.attribute": notApplicable,
};
