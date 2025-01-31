import type { LanguageScopeSupportFacetMap } from "./scopeSupportFacets.types";
import { ScopeSupportFacetLevel } from "./scopeSupportFacets.types";

const { supported, unsupported, notApplicable } = ScopeSupportFacetLevel;

export const swiftScopeSupport: LanguageScopeSupportFacetMap = {
  // Command related
  command: notApplicable,

  // XML/HTML related
  element: notApplicable,
  startTag: notApplicable,
  endTag: notApplicable,
  tags: notApplicable,
  attribute: supported, // Swift has attributes like @available, @objc
  environment: notApplicable,

  // Document structure
  section: notApplicable,

  // Data structures and control flow
  list: supported,
  map: supported,
  ifStatement: supported,
  regularExpression: supported,
  switchStatementSubject: supported,
  fieldAccess: supported,

  // Statements and classes
  statement: supported,
  "statement.class": supported,
  "statement.iteration.document": supported,
  "statement.iteration.block": supported,

  class: supported,
  "class.iteration.document": supported,
  "class.iteration.block": supported,
  className: supported,
  "className.iteration.document": supported,
  "className.iteration.block": supported,

  // Functions
  namedFunction: supported,
  "namedFunction.method": supported,
  "namedFunction.method.iteration.class": supported,
  "namedFunction.constructor": supported, // Swift has initializers
  "namedFunction.iteration": supported,
  "namedFunction.iteration.document": supported,
  anonymousFunction: supported, // Swift has closures
  functionName: supported,
  "functionName.method": supported,
  "functionName.method.iteration.class": supported,
  "functionName.constructor": supported,
  "functionName.iteration": supported,
  "functionName.iteration.document": supported,

  // Function calls
  functionCall: supported,
  "functionCall.constructor": supported,
  functionCallee: supported,
  "functionCallee.constructor": supported,

  // Arguments
  "argument.actual": supported,
  "argument.actual.iteration": supported,
  "argument.actual.method": supported,
  "argument.actual.method.iteration": supported,
  "argument.actual.constructor": supported,
  "argument.actual.constructor.iteration": supported,
  "argument.formal": supported,
  "argument.formal.iteration": supported,
  "argument.formal.method": supported,
  "argument.formal.method.iteration": supported,
  "argument.formal.constructor": supported,
  "argument.formal.constructor.iteration": supported,

  // Comments
  "comment.line": supported,
  "comment.block": supported,

  // Strings
  "string.singleLine": supported,
  "string.multiLine": supported,

  // Text fragments
  "textFragment.comment.line": supported,
  "textFragment.comment.block": supported,
  "textFragment.string.singleLine": supported,
  "textFragment.string.multiLine": supported,

  // Delimiters
  disqualifyDelimiter: supported,
  pairDelimiter: supported,

  // Branches
  "branch.if": supported,
  "branch.loop": supported,
  "branch.if.iteration": supported,
  "branch.try": supported,
  "branch.try.iteration": supported,
  "branch.switchCase": supported,
  "branch.switchCase.iteration": supported,
  "branch.ternary": supported,

  // Collection items
  "collectionItem.unenclosed": supported,
  "collectionItem.unenclosed.iteration": supported,

  // Conditions
  "condition.if": supported,
  "condition.while": supported,
  "condition.doWhile": unsupported, // Swift doesn't have do-while loops
  "condition.for": supported,
  "condition.ternary": supported,
  "condition.switchCase": supported,
  "condition.switchCase.iteration": supported,

  // Names
  "name.assignment": supported,
  "name.assignment.pattern": supported,
  "name.variable": supported,
  "name.variable.pattern": supported,
  "name.foreach": supported,
  "name.function": supported,
  "name.method": supported,
  "name.constructor": supported,
  "name.class": supported,
  "name.field": supported,
  "name.resource": unsupported, // Swift doesn't have explicit resource management blocks
  "name.resource.iteration": unsupported,
  "name.argument.formal": supported,
  "name.argument.formal.iteration": supported,
  "name.argument.formal.method": supported,
  "name.argument.formal.method.iteration": supported,
  "name.argument.formal.constructor": supported,
  "name.argument.formal.constructor.iteration": supported,
  "name.iteration.block": supported,
  "name.iteration.document": supported,

  // Keys
  "key.attribute": supported,
  "key.mapPair": supported,
  "key.mapPair.iteration": supported,

  // Values
  "value.assignment": supported,
  "value.variable": supported,
  "value.variable.pattern": supported,
  "value.mapPair": supported,
  "value.mapPair.iteration": supported,
  "value.foreach": supported,
  "value.attribute": supported,
  "value.return": supported,
  "value.return.lambda": supported,
  "value.field": supported,
  "value.yield": unsupported, // Swift doesn't have yield statements
  "value.resource": unsupported,
  "value.resource.iteration": unsupported,
  "value.argument.formal": supported,
  "value.argument.formal.iteration": supported,
  "value.argument.formal.method": supported,
  "value.argument.formal.method.iteration": supported,
  "value.argument.formal.constructor": supported,
  "value.argument.formal.constructor.iteration": supported,
  "value.typeAlias": supported,

  // Types
  "type.variable": supported,
  "type.argument.formal": supported,
  "type.argument.formal.iteration": supported,
  "type.argument.formal.method": supported,
  "type.argument.formal.method.iteration": supported,
  "type.argument.formal.constructor": supported,
  "type.argument.formal.constructor.iteration": supported,
  "type.return": supported,
  "type.field": supported,
  "type.field.iteration": supported,
  "type.foreach": supported,
  "type.interface": supported, // Swift has protocols which are similar to interfaces
  "type.class": supported,
  "type.alias": supported,
  "type.cast": supported,
  "type.typeArgument": supported,
  "type.typeArgument.iteration": supported,

  // Notebook
  notebookCell: notApplicable,
};
