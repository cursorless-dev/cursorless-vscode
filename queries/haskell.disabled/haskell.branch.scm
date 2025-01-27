;; TODO
;; - @branch.tenary : if expressions
;; - @branch.if     : multi-way if expressions
;; -

;; @branch.if: guard
(guard_equation
  [
    ;; ... with a SINGLE guard
    (guards
      .
      (guard) @branch.start
      .
    )
    ;; ... with MULTIPLE guards
    (guards
      .
      (guard) @branch.start
      (guard) @branch.start
      .
    )
  ]
  .
  (_) @branch.end
) @branch.removal

;; @branch.match: case
(exp_case
  (alts
    (alt) @branch
  )
)

;; @condition.if: guard
(guard_equation
  (guards
    (guard) @condition
  )
) @condition.domain
