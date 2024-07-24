;; Generated by the following command:
;;  >  curl https://raw.githubusercontent.com/tree-sitter/tree-sitter-cpp/master/src/node-types.json | jq '[.[] | select(.type == "compound_statement") | .children.types[].type] + [.[] | select(.type == "_statement") | .subtypes[].type]'
[
  (declaration)
  (function_definition)
  (linkage_specification)
  (preproc_call)
  (preproc_def)
  (preproc_function_def)
  (preproc_if)
  (preproc_ifdef)
  (preproc_include)
  (type_definition)
  (break_statement)
  (case_statement)
  (compound_statement)
  (continue_statement)
  (do_statement)
  (expression_statement)
  (for_statement)
  (goto_statement)
  (if_statement)
  (labeled_statement)
  (return_statement)
  (switch_statement)
  (while_statement)
] @statement

(if_statement) @ifStatement

(
  (string_literal) @string @textFragment
  (#child-range! @textFragment 0 -1 true true)
)

(comment) @comment @textFragment

(_
  (struct_specifier
    name: (_) @className @name
    body: (_)
  ) @_.domain.start @class.start @type.start
  .
  ";"? @_.domain.end @class.end @type.end
)
(_
  (enum_specifier
    name: (_) @className @name
    body: (_)
  ) @_.domain.start @class.start @type.start
  .
  ";"? @_.domain.end @class.end @type.end
)
(_
  (union_specifier
    name: (_) @className @name
    body: (_)
  ) @_.domain.start @class.start @type.start
  .
  ";"? @_.domain.end @class.end @type.end
)

(_
  (struct_specifier
    name: (_)
    body: (_)
  ) @statement.start
  .
  ";"? @statement.end
)
(_
  (enum_specifier
    name: (_)
    body: (_)
  ) @statement.start
  .
  ";"? @statement.end
)
(_
  (union_specifier
    name: (_)
    body: (_)
  ) @statement.start
  .
  ";"? @statement.end
)

(type_definition
  type: (struct_specifier
    body: (_)
  )
  declarator: (type_identifier) @className @name
) @_.domain @class @type
(type_definition
  type: (enum_specifier
    body: (_)
  )
  declarator: (type_identifier) @className @name
) @_.domain @class @type
(type_definition
  type: (union_specifier
    body: (_)
  )
  declarator: (type_identifier) @className @name
) @_.domain @class @type

;;!! void funcName();
(declaration
  (function_declarator
    declarator: (_
      !name
    ) @functionName @name
  )
) @namedFunction @functionName.domain @name.domain

;;!! void C::funcName() {}
(declaration
  (function_declarator
    declarator: (_
      name: (_) @functionName @name
    )
  )
) @namedFunction @functionName.domain @name.domain

(function_definition
  declarator: (_
    declarator: (_
      name: (_) @functionName @name
    )
  )
) @namedFunction @functionName.domain @name.domain

;;!! void funcName() {}
(function_definition
  declarator: (_
    declarator: (_
      !name
    ) @functionName @name
  )
) @namedFunction @functionName.domain @name.domain

(field_declaration
  declarator: (_
    !declarator
  ) @name
) @name.domain
(field_declaration
  declarator: (_
    declarator: (_) @name
  )
) @name.domain

(initializer_list) @list

(call_expression) @functionCall

(call_expression
  function: (_) @functionCallee
) @_.domain

(switch_statement
  condition: (_
    value: (_) @private.switchStatementSubject
  )
) @_.domain

;;!! int aaa = 0;
(declaration
  declarator: (_
    declarator: (_) @name @value.leading.endOf
    value: (_) @value @name.removal.end.startOf
  )
) @_.domain @name.removal.start.startOf

;;!! int aaa;
(declaration
  declarator: (_
    !declarator
  ) @name
) @_.domain

;;!! aaa = 0;
(
  (assignment_expression
    left: (_) @name @value.leading.endOf
    right: (_) @value @name.trailing.startOf
  ) @_.domain.start
  .
  ";"? @_.domain.end
)

(
  (_
    type: (_) @type
  ) @_.domain
  (#not-type? @_.domain "type_definition")
)

;;!! void foo(int value) {}
;;!               ^^^^^
(parameter_declaration
  declarator: (_) @name
) @_.domain

;;!! void foo(int value) {}
;;!           ^^^^^^^^^
(
  (parameter_list
    (_)? @_.leading.endOf
    .
    (parameter_declaration) @argumentOrParameter
    .
    (_)? @_.trailing.startOf
  ) @_dummy
  (#not-type? @argumentOrParameter "comment")
  (#single-or-multi-line-delimiter! @argumentOrParameter @_dummy ", " ",\n")
)

;;!! foo(5 + 6)
;;!      ^^^^^
(
  (argument_list
    (_)? @_.leading.endOf
    .
    (_) @argumentOrParameter
    .
    (_)? @_.trailing.startOf
  ) @_dummy
  (#not-type? @argumentOrParameter "comment")
  (#single-or-multi-line-delimiter! @argumentOrParameter @_dummy ", " ",\n")
)

(_
  (function_declarator
    (parameter_list
      "(" @argumentOrParameter.iteration.start.endOf @name.iteration.start.endOf @value.iteration.start.endOf
      ")" @argumentOrParameter.iteration.end.startOf @name.iteration.end.startOf @value.iteration.end.startOf
    )
  )
) @argumentOrParameter.iteration.domain

(argument_list
  "(" @argumentOrParameter.iteration.start.endOf @name.iteration.start.endOf @value.iteration.start.endOf
  ")" @argumentOrParameter.iteration.end.startOf @name.iteration.end.startOf @value.iteration.end.startOf
) @argumentOrParameter.iteration.domain

(binary_expression
  operator: _ @disqualifyDelimiter
)
(assignment_expression
  operator: _ @disqualifyDelimiter
)
(field_expression
  operator: "->" @disqualifyDelimiter
)
