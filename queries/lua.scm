;; Statements
[
  (variable_declaration)
  (break_statement)
  (do_statement)
  (empty_statement)
  (for_statement)
  (goto_statement)
  (if_statement)
  (label_statement)
  (repeat_statement)
  (return_statement)
  (while_statement)
] @statement

;; Only treat function declarions and calls as statements if they
;; aren't part of assignments, etc
(
  [
    (function_declaration)
    (function_call)
  ] @statement
  (#not-parent-type? @statement expression_list)
)
[
  (block)
  (chunk)
] @statement.iteration @namedFunction.iteration @functionCall.iteration

;; Duplicate with above, due to 3 label node limit
[
  (block)
  (chunk)
] @ifStatement.iteration @value.iteration

;; Capture assignment only if without variable prefix
;;!! count = count + 1
;;!  ^^^^^^^^^^^^^^^^^
(
  (assignment_statement) @statement
  (#not-parent-type? @statement variable_declaration)
)

;; Conditionals
;;!! if x < y then
;;!  ---^^^^^-----
;;!  ---xxxxxx----
;;!! end
;;!  ---
(if_statement
  _ @condition.domain.start.startOf
  condition: (_) @condition
  consequence: (_)
  !alternative
  "end" @condition.domain.end.endOf
)

;;!! if x < y then
;;!  ---^^^^^-----
;;!  ---xxxxxx----
;;!! elseif x < y then
(if_statement
  _ @_.domain.start.startOf
  condition: (_) @condition
  consequence: (_) @_.domain.end.endOf
  alternative: (_)
)

;;!! elseif x < y then
;;!  -------^^^^^-----
;;!  -------xxxxxx----
(elseif_statement
  condition: (_) @condition
) @_.domain

;;!!
(if_statement
  "if" @branch.start
  consequence: (_) @branch.end @branch.interior
) @ifStatement @branch.iteration @condition.iteration

;;!! if x < y then
;;!!     print("x smaller")
;;!! else
;;!  ^^^^
;;!!     print("x bigger")
;;!      ^^^^^^^^^^^^^^^^^
;;!! end
[
  (elseif_statement
    consequence: (_) @branch.interior
  )
  (else_statement
    body: (_) @branch.interior
  )
] @branch @_.domain

;; Lists and maps
(table_constructor
  "{" @_.interior.start.endOf @value.iteration.start.endOf
  (field
    name: (_)
  )
  "}" @_.interior.end.startOf @value.iteration.end.startOf
) @map @collectionKey.iteration
;;!! a = { foo = "bar" }
;;!        ^^^--------
;;!        xxxxxx-----
(field
  name: (_) @collectionKey @_.trailing.start.endOf
  value: (_) @_.trailing.end.startOf
) @_.domain
;;!! a = { foo = "bar" }
;;!        ------^^^^^
;;!        ---xxxxxxxx
(field
  name: (_) @_.leading.start.endOf
  value: (_) @value @_.leading.end.startOf
) @_.domain
;; In lua everything is a map, but a map that omits keys for entries
;; is similar enough to a list to warrant having that scope.
;;!! a = { "1", "2", "3" }
;;!      ^^^^^^^^^^^^^^^^^
(table_constructor
  "{" @_.interior.start.endOf
  (field
    !name
  )
  "}" @_.interior.end.startOf
) @list

;; Strings

(comment) @comment @textFragment
(string) @string
(string_content) @textFragment

;; Functions

;; callee:
;;!! local sum = add(5, 7)
;;!              ^^^------
;; call:
;;!! local sum = add(5, 7)
;;!              ^^^^^^^^^
(function_call
  name: (_) @functionCallee
) @_.domain @functionCall

;;!!local sum = add(5, 7)
;;!                 ^---
;;!                 xxx-
(arguments
  "(" @_.iteration.start.endOf
  (_)? @_.leading.start.endOf
  .
  (_) @argumentOrParameter @_.leading.end.startOf @_.trailing.start.endOf
  .
  (_)? @_.trailing.end.startOf
  ")" @_.iteration.end.startOf
  (#insertion-delimiter! @argumentOrParameter ", ")
)
;;!!function add(5, 7)
;;!              ^---
;;!              xxx-
(parameters
  "(" @_.iteration.start.endOf
  (_)? @_.leading.start.endOf
  .
  (_) @argumentOrParameter @_.leading.end.startOf @_.trailing.start.endOf
  .
  (_)? @_.trailing.end.startOf
  ")" @_.iteration.end.startOf
  (#insertion-delimiter! @argumentOrParameter ", ")
)

;; funk name:
;;!! function add(x, b) return x + y end
;;!  ---------^^^-----------------------
;; inside funk:
;;!! function add(x, b) return x + y end
;;!  -------------------^^^^^^^^^^^^----
;;! funk:
;;!! function add(x, b) return x + y end
;;!  ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
(function_declaration
  name: (_) @functionName
  body: (_)? @namedFunction.interior @ifStatement.iteration @item.iteration
) @_.domain @namedFunction

;; inside lambda:
;;!! __add = function(a, b) return a + b end
;;!          ---------------^^^^^^^^^^^^----
;; lambda:
;;!! __add = function(a, b) return a + b end
;;!          ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
(function_definition
  !name
  body: (_)? @anonymousFunction.interior @ifStatement.iteration
) @_.domain @anonymousFunction

;; Names and values

;; Handle variable assignments
;;!! a = 42
;;!  ^-----
;;!  xxxx--
(
  (assignment_statement
    (variable_list) @name
    (#allow-multiple! @name)
    .
    "="
    .
    (_) @_.leading.end.startOf
  ) @dummy @_.leading.start.startOf @_.domain
  (#not-parent-type? @dummy variable_declaration)
)
;; Handle variable declarations
;;!! local a = 42
;;!  ------^-----
;;!  xxxxxxxxxx--
(_
  local_declaration: (variable_declaration
    "local" @_.leading.start.startOf
    .
    (assignment_statement
      (variable_list) @name
      (#allow-multiple! @name)
      .
      "="
      (_) @_.leading.end.startOf
    )
  ) @_.domain
)

;; Handle assignment values
;;!! a = 42
;;!  ----------^^
;;!  -------xxxxx
(
  (assignment_statement
    (_) @_.leading.start.endOf
    .
    (expression_list
      value: (_)
    ) @value @_.leading.end.startOf
  ) @dummy @_.domain
  (#not-parent-type? @dummy variable_declaration)
)

;; Handle variable declaration values
;;!! local a = 42
;;!  ----------^^
;;!  -------xxxxx
(_
  local_declaration: (variable_declaration
    (assignment_statement
      (_) @_.leading.start.endOf
      .
      (expression_list
        value: (_)
      ) @value @_.leading.end.startOf
    )
  ) @_.domain
)

;;!! return a + b
;;!  -------^^^^^
;;!  ------xxxxxx
(return_statement
  (_) @value
) @_.domain

;; Structures and object access

;; (method_index_expression) @private.fieldAccess
