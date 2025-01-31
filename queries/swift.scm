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

(protocol_declaration
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


(
  (value_arguments
    (_)? @_.leading.endOf
    .
    (_) @argumentOrParameter
    .
    (_)? @_.trailing.startOf
  ) @_dummy
  (#not-type? @argumentOrParameter "comment")
  (#single-or-multi-line-delimiter! @argumentOrParameter @_dummy ", " ",\n")
)

(
  (type_arguments
    (_)? @_.leading.endOf
    .
    (_) @argumentOrParameter
    .
    (_)? @_.trailing.startOf
  ) @_dummy
  (#not-type? @argumentOrParameter "comment")
  (#single-or-multi-line-delimiter! @argumentOrParameter @_dummy ", " ",\n")
)

(value_arguments
  "(" @argumentOrParameter.iteration.start.endOf
  ")" @argumentOrParameter.iteration.end.startOf
) @argumentOrParameter.iteration.domain

(type_arguments
  "<" @argumentOrParameter.iteration.start.endOf
  ">" @argumentOrParameter.iteration.end.startOf
) @argumentOrParameter.iteration.domain

[
  (comment)
  (multiline_comment)
] @comment @textFragment

[
  (line_string_literal)
  (multi_line_string_literal)
  (raw_string_literal)
] @string @textFragment

;; (line_string_literal
;;   "\"" @textFragment.start.endOf
;;   "\"" @textFragment.end.startOf
;; ) @string

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
