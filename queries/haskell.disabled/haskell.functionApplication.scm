;; This file defines all patterns for function application and arguments.
;; For function declaration, see haskell.functionDeclaration.scm.

;; functionCall & functionCallee
;; expression-level function application
(exp_apply
  .
  (_) @functionCallee
  (_) @argumentOrParameter
) @functionCall
;; expression-level operator application
(exp_infix
  [
    (constructor_operator)
    (operator)
  ]
  @functionCallee
) @functionCall
;; expression-level type application
(exp_type_application
  .
  (_) @functionCallee
  (_) @argumentOrParameter
) @functionCall
;; expression-level constructor pattern
(pat_apply
  .
  (_) @functionCallee
) @functionCall
;; expression-level constructor operator pattern
(pat_infix
  (constructor_operator) @functionCallee
) @functionCall
;; type-level type constructor application
(type_apply
  .
  (_) @functionCallee
) @functionCall
;; type-level type operator application
;; TODO: (fun) contains multiple applications
(type_infix
  [
    (constructor_operator)
    (type_operator)
  ] @functionCallee
) @functionCall
;; type-level function type constructor application
(fun
  (_) @functionCall.start
  .
  "->" @functionCallee
  .
  (_) @functionCall.end
)
(fun
  ;; TODO: and leading or trailing "->" to removal range
  (_) @argumentOrParameter
)
;; argument.actual.iteration: exp_case
(exp_case
  (alts
    (alt) @argumentOrParameter.iteration
  )
)
