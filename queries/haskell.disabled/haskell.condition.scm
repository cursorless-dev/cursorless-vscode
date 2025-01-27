;; guard equations
(guard_equation
  [
    ;; ... with a SINGLE guard
    (guards
      .
      (guard) @condition @condition.domain.start
      .
    )
    ;; ... with MULTIPLE guards
    (guards
      .
      (guard) @condition.start @condition.domain.start
      (guard) @condition.end @condition.domain.start
      .
    )
  ]
  .
  (_) @condition.domain.end
)

;; case expressions
(exp_case
  (_) @condition
  .
)
