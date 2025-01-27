import type {
  ScopeSupportFacet,
  ScopeSupportFacetInfo,
} from "./scopeSupportFacets.types";

export const scopeSupportFacetInfos: Record<
  ScopeSupportFacet,
  ScopeSupportFacetInfo
> = {
  command: {
    description: "A command, for example Talon spoken command or bash",
    scopeType: "command",
  },

  element: {
    description: "An xml/html element. Also used for LaTeX environments",
    scopeType: "xmlElement",
  },
  startTag: {
    description: "The start tag of an xml element",
    scopeType: "xmlStartTag",
  },
  endTag: {
    description: "The end tag of an xml element",
    scopeType: "xmlEndTag",
  },
  tags: {
    description: "Both tags in an xml element",
    scopeType: "xmlBothTags",
  },
  attribute: {
    description: "A attribute, eg of an html element or a C++ attribute",
    scopeType: "attribute",
  },

  environment: {
    description: "An environment, eg in LaTeX",
    scopeType: "environment",
  },

  section: {
    description: "A document section",
    scopeType: "section",
  },

  list: {
    description: "A list/array",
    scopeType: "list",
  },
  map: {
    description: "A map/dictionary",
    scopeType: "map",
  },
  ifStatement: {
    description: "An if statement",
    scopeType: "ifStatement",
  },
  regularExpression: {
    description: "A regular expression",
    scopeType: "regularExpression",
  },
  switchStatementSubject: {
    description: "The subject of a switch statement",
    scopeType: "private.switchStatementSubject",
  },
  fieldAccess: {
    description: "A field access",
    scopeType: "private.fieldAccess",
  },

  statement: {
    description: "A statement, eg assignment, for loop, etc",
    scopeType: "statement",
  },
  "statement.class": {
    description: "An class declaration",
    scopeType: "statement",
  },
  "statement.iteration.document": {
    description: "Iteration scope for statements. The entire document.",
    scopeType: "statement",
    isIteration: true,
  },
  "statement.iteration.block": {
    description:
      "Iteration scope for statements. Statement blocks(body of functions/if statements/for loops/etc).",
    scopeType: "statement",
    isIteration: true,
  },

  class: {
    description: "A class in an object-oriented language",
    scopeType: "class",
  },
  "class.iteration.document": {
    description: "Iteration scope for classes. The entire document.",
    scopeType: "class",
    isIteration: true,
  },
  "class.iteration.block": {
    description:
      "Iteration scope for classes. Statement blocks(body of functions/if classes/for loops/etc).",
    scopeType: "class",
    isIteration: true,
  },
  className: {
    description: "The name of a class",
    scopeType: "className",
  },
  "className.iteration.document": {
    description: "Iteration scope for class names. The entire document.",
    scopeType: "className",
    isIteration: true,
  },
  "className.iteration.block": {
    description:
      "Iteration scope for class names. Statement blocks(body of functions/if classes/for loops/etc).",
    scopeType: "className",
    isIteration: true,
  },

  namedFunction: {
    description: "A named function declaration",
    scopeType: "namedFunction",
  },
  "namedFunction.method": {
    description: "A named method declaration in a class",
    scopeType: "namedFunction",
  },
  "namedFunction.method.iteration.class": {
    description: "Iteration scope for named functions: class bodies",
    scopeType: "namedFunction",
    isIteration: true,
  },
  "namedFunction.constructor": {
    description: "A constructor declaration in a class",
    scopeType: "namedFunction",
  },
  "namedFunction.iteration": {
    description: "Iteration scope for named functions",
    scopeType: "namedFunction",
    isIteration: true,
  },
  "namedFunction.iteration.document": {
    description: "Iteration scope for named functions: the entire document",
    scopeType: "namedFunction",
    isIteration: true,
  },
  anonymousFunction: {
    description:
      "An anonymous function, eg a lambda function, an arrow function, etc",
    scopeType: "anonymousFunction",
  },
  functionName: {
    description: "The name of a function",
    scopeType: "functionName",
  },
  "functionName.method": {
    description: "The name of a method in a class",
    scopeType: "functionName",
  },
  "functionName.method.iteration.class": {
    description: "Iteration scope for function names: class bodies",
    scopeType: "functionName",
    isIteration: true,
  },
  "functionName.constructor": {
    description: "The name of a constructor in a class",
    scopeType: "functionName",
  },
  "functionName.iteration": {
    description: "Iteration scope for function names",
    scopeType: "functionName",
    isIteration: true,
  },
  "functionName.iteration.document": {
    description: "Iteration scope for function names: the entire document",
    scopeType: "functionName",
    isIteration: true,
  },

  functionCall: {
    description: "A function call",
    scopeType: "functionCall",
  },
  "functionCall.constructor": {
    description: "A constructor call",
    scopeType: "functionCall",
  },
  functionCallee: {
    description: "The function being called in a function call",
    scopeType: "functionCallee",
  },
  "functionCallee.constructor": {
    description:
      "The class being constructed in a class instantiation, including the `new` keyword",
    scopeType: "functionCallee",
  },

  "argument.actual": {
    description: "An argument/parameter in a function call",
    scopeType: "argumentOrParameter",
  },
  "argument.actual.iteration": {
    description:
      "Iteration scope of arguments in a function call, should be inside the parens of the argument list",
    scopeType: "argumentOrParameter",
    isIteration: true,
  },
  "argument.actual.method": {
    description: "An argument/parameter in a method call",
    scopeType: "argumentOrParameter",
  },
  "argument.actual.method.iteration": {
    description:
      "Iteration scope of arguments in a method call, should be inside the parens of the argument list",
    scopeType: "argumentOrParameter",
    isIteration: true,
  },
  "argument.actual.constructor": {
    description: "An argument/parameter in a constructor call",
    scopeType: "argumentOrParameter",
  },
  "argument.actual.constructor.iteration": {
    description:
      "Iteration scope of arguments in a constructor call, should be inside the parens of the argument list",
    scopeType: "argumentOrParameter",
    isIteration: true,
  },
  "argument.formal": {
    description: "A parameter in a function declaration",
    scopeType: "argumentOrParameter",
  },
  "argument.formal.iteration": {
    description:
      "Iteration scope of the formal parameters of a function declaration; should be the whole parameter list. The domain should be the entire function.",
    scopeType: "argumentOrParameter",
    isIteration: true,
  },
  "argument.formal.method": {
    description: "A parameter in a class method declaration",
    scopeType: "argumentOrParameter",
  },
  "argument.formal.method.iteration": {
    description:
      "Iteration scope of the formal parameters of a class method declaration; should be the whole parameter list. The domain should be the entire function.",
    scopeType: "argumentOrParameter",
    isIteration: true,
  },
  "argument.formal.constructor": {
    description: "A parameter in a constructor declaration",
    scopeType: "argumentOrParameter",
  },
  "argument.formal.constructor.iteration": {
    description:
      "Iteration scope of the formal parameters of a constructor declaration; should be the whole parameter list. The domain should be the entire function.",
    scopeType: "argumentOrParameter",
    isIteration: true,
  },

  "comment.line": {
    description: "A line comment",
    scopeType: "comment",
  },
  "comment.block": {
    description: "A block comment",
    scopeType: "comment",
  },

  "string.singleLine": {
    description: "A single-line string",
    scopeType: "string",
  },
  "string.multiLine": {
    description: "A multi-line string",
    scopeType: "string",
  },

  "textFragment.comment.line": {
    description: "Text fragment consisting of a line comment",
    scopeType: "textFragment",
  },
  "textFragment.comment.block": {
    description: "Text fragment consisting of a block comment",
    scopeType: "textFragment",
  },
  "textFragment.string.singleLine": {
    description: "Text fragment consisting of a single-line string",
    scopeType: "textFragment",
  },
  "textFragment.string.multiLine": {
    description: "Text fragment consisting of a multi-line string",
    scopeType: "textFragment",
  },
  "textFragment.element": {
    description: "Text fragment consisting of an xml element interior",
    scopeType: "textFragment",
  },

  disqualifyDelimiter: {
    description:
      "Used to disqualify a token from being treated as a surrounding pair delimiter. This will usually be operators containing `>` or `<`, eg `<`, `<=`, `->`, etc",
    scopeType: "disqualifyDelimiter",
  },
  pairDelimiter: {
    description:
      "A pair delimiter, eg parentheses, brackets, braces, quotes, etc",
    scopeType: "pairDelimiter",
  },

  "branch.match": {
    description: "A pattern match branch",
    scopeType: "branch",
  },
  "branch.match.iteration": {
    description:
      "Iteration scope for pattern match branches; should be the entire branch",
    scopeType: "branch",
    isIteration: true,
  },
  "branch.if": {
    description: "An if/elif/else branch",
    scopeType: "branch",
  },
  "branch.loop": {
    description:
      "A for / while loop branch. For most languages there will just be one branch for the entire loop, but eg in Python you can have an else branch for a loop.",
    scopeType: "branch",
  },
  "branch.if.iteration": {
    description:
      "Iteration scope for if/elif/else branch; should be the entire if-else statement",
    scopeType: "branch",
    isIteration: true,
  },
  "branch.try": {
    description: "A try/catch/finally branch",
    scopeType: "branch",
  },
  "branch.try.iteration": {
    description:
      "Iteration scope for try/catch/finally branch; should be the entire try-catch statement",
    scopeType: "branch",
    isIteration: true,
  },
  "branch.switchCase": {
    description: "A case/default branch in a switch/match statement",
    scopeType: "branch",
  },
  "branch.switchCase.iteration": {
    description:
      "Iteration scope for branches in a switch/match statement; should contain all the cases",
    scopeType: "branch",
    isIteration: true,
  },
  "branch.ternary": {
    description: "A branch in a ternary expression",
    scopeType: "branch",
  },
  "collectionItem.unenclosed": {
    description:
      "An item in a comma-separated list without enclosing delimiters. This could be multi-variable declarations, import statements, etc.",
    scopeType: "collectionItem",
  },
  "collectionItem.unenclosed.iteration": {
    description:
      "Iteration scope for items in a comma-separated list without enclosing delimiters",
    scopeType: "collectionItem",
    isIteration: true,
  },

  "condition.if": {
    description: "A condition in an if statement",
    scopeType: "condition",
  },
  "condition.while": {
    description: "A condition in a while loop",
    scopeType: "condition",
  },
  "condition.doWhile": {
    description: "A condition in a do while loop",
    scopeType: "condition",
  },
  "condition.for": {
    description: "A condition in a for loop",
    scopeType: "condition",
  },
  "condition.ternary": {
    description: "A condition in a ternary expression",
    scopeType: "condition",
  },
  "condition.switchCase": {
    description: "A condition in a switch statement",
    scopeType: "condition",
  },
  "condition.switchCase.iteration": {
    description:
      "The iteration scope for conditions in a switch statement: should contain all the cases, and exclude any curly brackets delimiting the full switch statement body",
    scopeType: "condition",
    isIteration: true,
  },

  "name.assignment": {
    description: "Name (LHS) of an assignment",
    scopeType: "name",
  },
  "name.assignment.pattern": {
    description: "LHS of an assignment with pattern destructuring",
    scopeType: "name",
  },
  "name.variable": {
    description: "Name (LHS) of a variable declaration",
    scopeType: "name",
  },
  "name.variable.pattern": {
    description:
      "Name (LHS) of a variable declaration with pattern destructuring",
    scopeType: "name",
  },
  "name.foreach": {
    description: "Iteration variable name in a for each loop",
    scopeType: "name",
  },
  "name.function": {
    description: "Name of a function",
    scopeType: "name",
  },
  "name.method": {
    description: "Name of a class method",
    scopeType: "name",
  },
  "name.constructor": {
    description: "Name of a constructor",
    scopeType: "name",
  },
  "name.class": {
    description: "Name of a class",
    scopeType: "name",
  },
  "name.field": {
    description: "Name (LHS) of a field in a class / interface",
    scopeType: "name",
  },
  "name.resource": {
    description: "Name in a 'with' / 'use' / 'using' statement",
    scopeType: "name",
  },
  "name.resource.iteration": {
    description:
      "Iteration scope for names in a 'with' / 'use' / 'using' statement",
    scopeType: "name",
    isIteration: true,
  },
  "name.argument.actual": {
    description: "The name of a (keyword) argument in a function call",
    scopeType: "name",
  },
  "name.argument.actual.iteration": {
    description:
      "Iteration scope of the names of the actual parameters of a function call; should be the whole arguments list",
    scopeType: "name",
    isIteration: true,
  },
  "name.argument.formal": {
    description: "The name of a parameter in a function declaration",
    scopeType: "name",
  },
  "name.argument.formal.iteration": {
    description:
      "Iteration scope of the names of the formal parameters of a function declaration; should be the whole parameter list",
    scopeType: "name",
    isIteration: true,
  },
  "name.argument.formal.method": {
    description: "The name of a parameter in a class method declaration",
    scopeType: "name",
  },
  "name.argument.formal.method.iteration": {
    description:
      "Iteration scope of the names of the formal parameters of a class method declaration; should be the whole parameter list",
    scopeType: "name",
    isIteration: true,
  },
  "name.argument.formal.constructor": {
    description: "The name of a parameter in a constructor declaration",
    scopeType: "name",
  },
  "name.argument.formal.constructor.iteration": {
    description:
      "Iteration scope of the names of the formal parameters of a constructor declaration; should be the whole parameter list",
    scopeType: "name",
    isIteration: true,
  },
  "name.iteration.block": {
    description:
      "Iteration scope for names: statement blocks (body of functions/if classes/for loops/etc).",
    scopeType: "name",
    isIteration: true,
  },
  "name.iteration.document": {
    description: "Iteration scope for names: the entire document",
    scopeType: "name",
    isIteration: true,
  },
  "key.attribute": {
    description: "Key (LHS) of an attribute eg in an xml element",
    scopeType: "collectionKey",
  },
  "key.mapPair": {
    description: "Key (LHS) of a key-value pair of a map",
    scopeType: "collectionKey",
  },
  "key.mapPair.iteration": {
    description:
      "Iteration scope of key-value pairs in a map; should be between the braces",
    scopeType: "collectionKey",
    isIteration: true,
  },

  "value.assignment": {
    description: "Value (RHS) of an assignment",
    scopeType: "value",
  },
  "value.variable": {
    description: "Value (RHS) of a variable declaration",
    scopeType: "value",
  },
  "value.variable.pattern": {
    description:
      "Value (RHS) of a variable declaration with pattern destructuring",
    scopeType: "value",
  },
  "value.mapPair": {
    description: "Value (RHS) of a key-value pair in a map",
    scopeType: "value",
  },
  "value.mapPair.iteration": {
    description:
      "Iteration scope of key-value pairs in a map; should be between the braces",
    scopeType: "value",
    isIteration: true,
  },
  "value.foreach": {
    description: "Iterable in a for each loop",
    scopeType: "value",
  },
  "value.attribute": {
    description: "Value (RHS) of an attribute eg in an xml element",
    scopeType: "value",
  },
  "value.return": {
    description: "Return value of a function",
    scopeType: "value",
  },
  "value.return.lambda": {
    description: "Implicit return value from a lambda",
    scopeType: "value",
  },
  "value.field": {
    description: "Value (RHS) of a field in a class / interface",
    scopeType: "value",
  },
  "value.yield": {
    description: "Value of a yield statement",
    scopeType: "value",
  },
  "value.resource": {
    description: "Value of a 'with' / 'use' / 'using' statement",
    scopeType: "value",
  },
  "value.resource.iteration": {
    description:
      "Iteration scope for values in a 'with' / 'use' / 'using' statement",
    scopeType: "value",
    isIteration: true,
  },
  "value.argument.formal": {
    description: "The value of a (keyword) argument in a function declaration",
    scopeType: "value",
  },
  "value.argument.formal.iteration": {
    description:
      "Iteration scope of the values of the formal parameters of a function declaration; should be the whole parameter list",
    scopeType: "value",
    isIteration: true,
  },
  "value.argument.actual": {
    description: "The value of a argument in a function call",
    scopeType: "value",
  },
  "value.argument.actual.iteration": {
    description:
      "Iteration scope of the values of the actual parameters of a function call; should be the whole arguments list",
    scopeType: "value",
    isIteration: true,
  },
  "value.argument.formal.method": {
    description: "The value of a parameter in a class method declaration",
    scopeType: "value",
  },
  "value.argument.formal.method.iteration": {
    description:
      "Iteration scope of the values of the formal parameters of a class method declaration; should be the whole parameter list",
    scopeType: "value",
    isIteration: true,
  },
  "value.argument.formal.constructor": {
    description: "The value of a parameter in a constructor declaration",
    scopeType: "value",
  },
  "value.argument.formal.constructor.iteration": {
    description:
      "Iteration scope of the values of the formal parameters of a constructor declaration; should be the whole parameter list",
    scopeType: "value",
    isIteration: true,
  },
  "value.typeAlias": {
    description: "Value of a type alias declaration",
    scopeType: "value",
  },

  "type.variable": {
    description: "Type of variable in a variable declaration",
    scopeType: "type",
  },
  "type.argument.formal": {
    description: "Type of formal parameter in a function declaration",
    scopeType: "type",
  },
  "type.argument.formal.iteration": {
    description:
      "Iteration scope of the types of the formal parameters of a function declaration; should be the whole parameter list",
    scopeType: "type",
    isIteration: true,
  },
  "type.argument.formal.method": {
    description: "Type of formal parameter in a class method declaration",
    scopeType: "type",
  },
  "type.argument.formal.method.iteration": {
    description:
      "Iteration scope of the types of the formal parameters of a class method declaration; should be the whole parameter list",
    scopeType: "type",
    isIteration: true,
  },
  "type.argument.formal.constructor": {
    description: "Type of formal parameter in a constructor declaration",
    scopeType: "type",
  },
  "type.argument.formal.constructor.iteration": {
    description:
      "Iteration scope of the types of the formal parameters of a constructor declaration; should be the whole parameter list",
    scopeType: "type",
    isIteration: true,
  },
  "type.return": {
    description: "Type of return value in a function declaration",
    scopeType: "type",
  },
  "type.field": {
    description: "Type of field in a class / interface",
    scopeType: "type",
  },
  "type.field.iteration": {
    description:
      "Iteration scope for type of field in a class / interface; should be entire class / interface body",
    scopeType: "type",
    isIteration: true,
  },
  "type.foreach": {
    description: "Type of variable in a for each loop",
    scopeType: "type",
  },
  "type.interface": {
    description: "An interface declaration",
    scopeType: "type",
  },
  "type.enum": {
    description: "An enum declaration",
    scopeType: "type",
  },
  "type.class": {
    description: "An class declaration",
    scopeType: "type",
  },
  "type.alias": {
    description: "A type alias declaration",
    scopeType: "type",
  },
  "type.cast": {
    description: "A type cast",
    scopeType: "type",
  },
  "type.typeArgument": {
    description: "Type argument to a generic / parametrized type",
    scopeType: "type",
  },
  "type.typeArgument.iteration": {
    description:
      "Iteration scope for type argument to a generic / parametrized type; Should be the list of type arguments",
    scopeType: "type",
    isIteration: true,
  },

  notebookCell: {
    description: "A cell in a notebook or a markdown code block",
    scopeType: "notebookCell",
  },
};
