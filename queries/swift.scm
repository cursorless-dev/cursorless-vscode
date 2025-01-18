[
  (import_declaration)
  (property_declaration)
  (typealias_declaration)
  (switch_entry)
] @statement

(function_declaration
  name: (_) @functionName
) @namedFunction @functionName.domain

(class_declaration
  name: (_) @className
) @class @className.domain

[
  (class_declaration)
  (protocol_declaration)
] @namedFunction.iteration @functionName.iteration

(array_literal) @list

(dictionary_literal) @map

(regex_literal) @regularExpression

[
  (class_declaration)
  (protocol_declaration)
  (function_declaration)
] @statement.iteration

(value_argument) @argumentOrParameter

[
  (comment)
  (multiline_comment)
] @comment @textFragment

[
  (if_statement)
  (guard_statement)
] @ifStatement

(switch_statement
  expr: (_) @private.switchStatementSubject
  (#child-range! @private.switchStatementSubject 0 -1 true true)
) @_.domain

(switch_pattern) @condition

;;!! true ? 0 : 1;
;;!  ^^^^
;;!         ^   ^
;;! --------------
(ternary_expression
  condition: (_) @condition
  if_true: (_) @branch
) @condition.domain
(ternary_expression
  if_false: (_) @branch
)
