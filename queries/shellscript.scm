;;
;; Statements
;;

(
  (program
    (_) @statement
  )
  (#not-type? @statement comment)
)
[
  (if_statement)
  (while_statement)
  (for_statement)
  (function_definition)
  (declaration_command)
  (case_statement)
  (subshell)
  (list)
  (redirected_statement)
] @statement

;;FIXME: Make the #not-parent-type? thing a list of nodes
(
  (_
    [
      (variable_assignment)
      (command)
    ] @statement
    (#not-parent-type? @statement declaration_command c_style_for_statement list redirected_statement)
  )
)

;;
;; Conditionals
;;

(if_statement) @ifStatement @branch.iteration @condition.iteration

;;!! if [ $value -le 0 ]; then
;;!! fi
(if_statement
  "if" @condition.domain.start.startOf @branch.start.startOf
  (_) @condition
  "then" @condition.domain.end.endOf @branch.end.endOf
  .
  "fi"
)

;;!! if [ $value -le 0 ]; then
;;!! else
(if_statement
  "if" @condition.domain.start.startOf @branch.start.startOf
  (_) @condition
  "then" @condition.domain.end.endOf @branch.end.endOf
  .
  (else_clause)
)

;;!! if [ $value -le 0 ]; then
;;!! elif
(if_statement
  "if" @condition.domain.start.startOf @branch.start.startOf
  (_) @condition
  "then" @condition.domain.end.endOf @branch.end.endOf
  .
  (elif_clause)
)

;;!! if [ $value -le 0 ]; then
;;!!     echo foo
;;!! fi
(
  (if_statement
    "if" @condition.domain.start.startOf @branch.start.startOf
    (_) @condition
    "then" @branch.interior.start.endOf
    (_) @dummy
    .
    "fi" @condition.domain.end.startOf @branch.end.startOf @branch.interior.end.startOf
  )
  (#not-type? @dummy else_clause elif_clause)
)

;;!! if [ $value -le 0 ]; then
;;!!     echo foo
;;!! elif [ $value -le 0 ]; then
;;!! fi
(
  (if_statement
    "if" @condition.domain.start.startOf @branch.start.startOf
    (_) @condition
    "then" @branch.interior.start.endOf
    (_)
    (elif_clause) @condition.domain.end.startOf @branch.end.startOf @branch.interior.end.startOf
  )
)

;;!! if [ $value -le 0 ]; then
;;!!     echo foo
;;!! else [ $value -le 0 ]; then
;;!! fi
(
  (if_statement
    "if" @condition.domain.start.startOf @branch.start.startOf
    (_) @condition
    "then" @branch.interior.start.endOf
    (_) @dummy
    .
    (else_clause) @condition.domain.end.startOf @branch.end.startOf @branch.interior.end.startOf
  )
  (#not-type? @dummy elif_clause)
)

;;!! elif [ $value -le 0 ]; then
;;!! else
(elif_clause
  (_) @condition
  "then"
  .
) @branch @_.domain

;;!! elif [ $value -le 0 ]; then
;;!!    echo "foo1"
;;!!    echo "foo1"
(elif_clause
  (_) @condition
  "then" @branch.interior.start.endOf
  (_)
) @branch @_.domain @branch.interior.end.endOf

;;!! else
;;!! fi
(else_clause
  "else"
  .
) @branch

;;!! else
;;!!     echo "foo1"
;;!!     echo "foo1"
;;!! fi
(else_clause
  "else" @branch.interior.start.endOf
  (_)
) @branch @branch.interior.end.endOf

(_
  condition: (_) @condition
)

(case_statement) @branch.iteration @condition.iteration
(case_item
  value: (_) @condition
  .
  ")" @branch.interior.start.endOf
  (_) @branch.interior.end.endOf
  .
  ";;"
) @branch @_.domain

;; Lists and maps
;;

;;!! array=("a" "b" "c")
;;!        ^^^^^^^^^^^^^
;;!        -------------
(array
  "(" @_.interior.start.endOf
  (_)? @collectionItem
  ")" @_.interior.end.startOf
) @list @collectionItem.iteration

;;!! FIXME: I will file an issue in tree-sitter-bash as I think the grammar is
;;!! bad. But the below does work for now
;;!! arr+=(["key2"]=val2 ["key3"]=val3)
(array
  (
    (concatenation
      ;; This matches the [ which is (word) for some reason
      (_) @collectionKey.leading.start
      (_) @collectionKey
      ;; This matches the ] which is also (word) for some reason
      (_) @collectionKey.trailing.end
      (_) @value
    ) @collectionItem
    (#shrink-to-match! @value "\=(?<keep>.*)")
  )
)

;;
;; Strings
;;

;;!! # foo
;;!  ^^^^^
(comment) @comment @textFragment

;;!! var="foo"
;;!      ^^^^^
(string) @string @textFragment

;;!! var="foo ${bar}"
;;!           ^^^^^^
;;!           xxxxxx
(string
  (
    (expansion) @argumentOrParameter
    ;; FIXME: This is due to a tree-sitter-bash bug (imo) where given: "Foo ${BAR} ${BAZ}"
    ;; ${BAZ} incorrectly includes preceding space
    (#shrink-to-match! @argumentOrParameter "\\s*(?<keep>.*)")
  )
)
(string
  (simple_expansion) @argumentOrParameter
  (#shrink-to-match! @argumentOrParameter "\\s*(?<keep>.*)")
)

;;
;; Functions
;;

;;!! echo "foo"
;;!       ^^^^^
(_
  argument: (_) @argumentOrParameter
) @_.iteration

;; call:
;;!! echo "foo"
;;!  ^^^^^^^^^^
;; callee:
;;!! echo "foo"
;;!  ^^^^
;;!  ----------
(command
  name: (_) @functionCallee
) @_.domain @functionCall @command

;;!! function foo() {
;;!           ^^^
;;!  ----------------
;;!!    echo "foo"
;;!     ----------
;;!! }
;;!  -
(function_definition
  name: (_) @functionName
) @_.domain

;; FIXME: Need to support redirections
;; interior:
;;!! function foo() {
;;!  ----------------
;;!!    echo "foo"
;;!     ^^^^^^^^^^
;;!     ----------
;;!! }
;;!  -
(function_definition
  body: (_
    (_)? @_.interior
  )
) @namedFunction @_.domain

;;
;; Names, values, and types
;;

;;!! for ((i = 1; i <= 5; i++)); do
;;!        ^
;;!        xxxx
;;!        -----
(
  (variable_assignment
    name: (_) @name @value.leading.endOf
    value: (_) @value @name.trailing.startOf
  ) @dummy @_.domain
  (#not-parent-type? @dummy declaration_command)
)

;;!! local foo="bar"
;;!        ^^^
;;!  xxxxxxxxxx
;;!  ---------------
(declaration_command
  (variable_assignment
    name: (_) @name
    value: (_) @_.removal.end.startOf
  )
) @_.domain @_.removal.start.startOf

;;!! local foo="bar"
;;!        ^^^
;;!  xxxxxxxxxx
;;!  ---------------
(declaration_command
  (variable_assignment
    name: (_) @_.leading.endOf
    value: (_) @value
  )
) @_.domain

;;!! local foo
;;!        ^^^
;;!  ---------
(declaration_command
  (variable_name) @name
) @_.domain

(regex) @regularExpression @textFragment
