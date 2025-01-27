;;
;; Statements
;;

(let_expression
  (binding_set
    (_) @statement @_.domain
  )
  "in" @statement.iteration.end.startOf
)

(source_code) @comment.iteration

;; Any foo = <expression> anywhere is a statement
;; [
;;     (inherit)
;;     (binding)
;; ] @statement
(binding_set) @map.iteration @list.iteration @ifStatement.iteration

;; This matches assert statements as stand-alone statements. This
;; is because it's common to have a series of assert statements in a file, which
;; would otherwise all match as a single statement. See the playground/nix/asserts.nix
;; file for an example.
(
  (assert_expression
    "assert" @statement.start @statement.domain.start
    condition: (_)
    ";" @statement.end
    body: (_) @statement.domain.end.startOf
  ) @dummy
  (#not-parent-type? @dummy binding)
)

;; FIXME: Branch only makes sense probably for single line assert, but may not keep it.
;; also don't know how to match on single line only
(assert_expression
  condition: (_) @condition
  ;;   body: (_) @branch
) @_.domain

;; Match with when it's part of an expression like:
;; with lib;
;; let ... in ...;
(
  (with_expression
    "with" @statement.start
    .
    environment: (_)
    ";" @statement.end
  ) @dummy
  (#not-parent-type? @dummy binding)
)

;; FIXME: Need something like above for inherit, but only if it is on a single line.

;;!! let
;;!!   a = 1;
;;!   <******
;;!!   b = 2;
;;!    *****>
;;!! in a + b
(let_expression
  "let"
  .
  (_) @statement.iteration @value.iteration @name.iteration
)

;;
;; Conditionals
;;

;;!! key = if a then b else c;
;;!        ^^^^^^^^^^^^^^^^^^
(if_expression) @ifStatement @branch.iteration @condition.iteration
;;!! key = if a then b else c;
;;!        ^^^^^^^^^^^
;;!        xxxxxxxxxxxx
(if_expression
  "if" @branch.start
  condition: (_)
  "then"
  consequence: (_) @branch.end @branch.interior
)
;;!! key = if a then b else c;
;;!                    ^^^^^^
;;!                   xxxxxxx
(if_expression
  "else" @branch.start
  alternative: (_) @branch.end @branch.interior
)

;;!! key = if a > 10 then b else c;
;;!           ^^^^^^
(if_expression
  condition: (_) @condition
) @_.domain

;;
;; Lists and maps
;;

;;!! foo = [ a b c ];
;;!          ^
;;!          xx
(list_expression
  element: (_) @collectionItem
) @_.iteration @_.domain

;;!! foo = [ a b c ];
;;!        ^^^^^^^^^
(list_expression
  "[" @list.interior.start.endOf
  "]" @list.interior.end.startOf
) @list

;;!! foo = { x = 1; y = 2; };
;;!        ^^^^^^^^^^^^^^^^^
[
  (attrset_expression
    (_) @map.interior
  )
  (rec_attrset_expression
    (_) @map.interior
  )
] @map @value.iteration @name.iteration

;;!! foo = { x = 1; };
;;!          ^^^^^^
(attrset_expression
  (binding_set
    binding: (_) @collectionItem
  )
) @_.iteration

;;!! foo = rec { x = 1; };
;;!              ^^^^^^
(rec_attrset_expression
  (binding_set
    binding: (_) @collectionItem
  )
) @_.iteration

;;!! foo = { x = 1; y = 2; };
;;!          ^
;;!          xxxx
;;!          -----
(binding
  attrpath: (_) @collectionKey @_.trailing.start.endOf
  expression: (_) @_.trailing.end.startOf
) @_.domain

;;
;; Strings
;;

;; Comment
;;!! # foo
;;!  ^^^^^
;; Inside comment:
;;!! # foo
;;!    ^^^
(comment) @comment @textFragment

;; FIXME: This works for inside comment on #, but breaks multi-line /* */
;; Not sure how to match different interiors depending on contents. Almost
;; need a #regex predicate? Can't use shrink-to-match in [] without errors
;; [
;;   (
;;     (comment) @comment.interior
;;     (#shrink-to-match! @comment.interior "# ?(?<keep>.*)$")
;;   )
;;   (
;;     (comment) @comment.interior
;;     ;; This would need to be a multi-line match, which I'm not sure shrink-to-match can do
;;     ;; (#shrink-to-match! @comment.interior "/\*(?<keep>.*)\*/$")
;;   )
;; ] @comment

[
  (string_expression)
  (indented_string_expression)
] @string
(string_fragment) @textFragment

;;!! d = "foo ${bar} baz"
;;!           ^^^^^^
;;!      <**************>
(string_expression
  (interpolation) @argumentOrParameter
) @_.iteration

;;
;; Functions
;;

;; Note for this part of the function, we identify is as lambda only
;;!! x = a: b: a + b;
;;!         ^^^^^^^^ Func1 due to currying
;;!      ^^^^^^^^^^^ Func2 due to currying
(function_expression
  .
  [
    (
      ;; Match foo@{ a, b }:
      (identifier)? @argumentOrParameter.start
      .
      "@"
      .
      (formals) @argumentOrParameter.end
    )
    (
      ;; Match{ a, b }@foo:
      (formals) @argumentOrParameter.start
      .
      "@"
      .
      (identifier) @argumentOrParameter.end
    )
    ;; Match { a, b }:
    (
      (formals) @argumentOrParameter
      .
      ":"
    )
    ;; Match a:
    (
      (identifier) @argumentOrParameter
      .
      ":"
    )
  ]
  .
  body: (_) @anonymousFunction.interior
) @anonymousFunction @argumentOrParameter.iteration

;; We define the named function as the full assignment of the lambda
;; This means funk name becomes the variable holding the lambda
(binding
  (_) @functionName
  "="
  expression: (function_expression) @namedFunction.interior
) @namedFunction @functionName.domain

;; This is gross, but not sure how to do fuzzy matching against an unknown number of
;; nested child nodes. Possiblyl should be a new predicate. Arbitrarily stopping at
;; 5 args for now, as that ought to be enough arguments for anyone
;; Args:
;;!! mkHost a b c d e
;;!           ^
;;!           xx
;;!        <*********>
;;! Callee:
;;!! mkHost a b c d e
;;!  ^^^^^^
;;!  xxxxxxx
;;!  ----------------
(apply_expression
  [
    (apply_expression
      function: (variable_expression
        name: (identifier) @functionCallee
      )
    )
    (apply_expression
      [
        (apply_expression
          function: (variable_expression
            name: (identifier) @functionCallee
          )
        )
        (apply_expression
          [
            (apply_expression
              function: (variable_expression
                name: (identifier) @functionCallee
              )
            )
            (apply_expression
              (apply_expression
                function: (variable_expression
                  name: (identifier) @functionCallee
                )
              )
            )
          ]
        )
      ]
    )
  ]
) @functionCall @_.domain

;; Similar to above, but sometimes the function calls are in select_expression
(apply_expression
  [
    (select_expression
      expression: (variable_expression
        name: (identifier)
      )
    ) @functionCallee
    (apply_expression
      [
        (select_expression
          expression: (variable_expression
            name: (identifier)
          )
        ) @functionCallee
        (apply_expression
          [
            (select_expression
              expression: (variable_expression
                name: (identifier)
              )
            ) @functionCallee
            (apply_expression
              (select_expression
                expression: (variable_expression
                  name: (identifier)
                )
              ) @functionCallee
            )
          ]
        )
      ]
    )
  ]
) @functionCall @_.domain

;; Args:
;;!! mkHost a
;;!         ^
;;!         x
;;!  --------
;;! Callee:
;;!! mkHost a
;;!  ^^^^^^
;;!  xxxxxx
;;!  --------
(apply_expression
  function: (variable_expression
    name: (identifier) @functionCallee
  )
  argument: (_) @argumentOrParameter
) @functionCall @_.domain

(apply_expression
  argument: (_) @argumentOrParameter
)

;;
;; Names and Values
;;

;;!! a = 25;
;;!      ^^
;;!   xxxxx
;;!  -------
(binding
  (_) @_.leading.start.endOf
  .
  expression: (_) @value @_.leading.end.startOf
) @_.domain

;;!! a = 25;
;;!  ^
;;!  xxxx
;;!  -------
(binding
  (_) @name @_.leading.end.startOf @_.trailing.start.endOf
  .
  expression: (_) @_.trailing.end.startOf
) @_.domain
