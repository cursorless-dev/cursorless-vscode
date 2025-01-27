;; This file defines all patterns for function application and arguments.
;; For function declaration, see haskell.functionApplication.scm.

;; This file contains the queries for:
;;
;; - @argument.formal
;; - @argument.formal.iteration
;; - @branch.match (for function declarations)
;; - @branch.match.iteration (for function declarations)
;; - @functionName
;; - @name.function
;; - @namedFunction
;;
;; Due to the restriction on the number of captures in tree-sitter, the
;; queries for @branch.match.iteration, @functionName, @name.function,
;; and @namedFunction are essentially the same query repeated four times.
;; Any changes made to one of them should probably be made to all of them.

;; @argument.formal
(pat_apply) @argumentOrParameter
(pat_as) @argumentOrParameter
(pat_field) @argumentOrParameter
(pat_fields) @argumentOrParameter
(pat_infix) @argumentOrParameter
(pat_irrefutable) @argumentOrParameter
(pat_list) @argumentOrParameter
(pat_literal) @argumentOrParameter
(pat_name) @argumentOrParameter
(pat_negation) @argumentOrParameter
(pat_parens) @argumentOrParameter
(pat_record) @argumentOrParameter
(pat_strict) @argumentOrParameter
(pat_tuple) @argumentOrParameter
(pat_typed) @argumentOrParameter
(pat_unboxed_tuple) @argumentOrParameter
(pat_view) @argumentOrParameter
(pat_wildcard) @argumentOrParameter

;; @argument.formal.iteration
(function) @argumentOrParameter.iteration

;; @branch.match
(function) @branch

;; @branch.match.iteration
(
  ;; previous declaration
  [
    (
      (_) @_previous
      (#not-type? @_previous "function" "signature")
    )
    (
      (function
        name: (variable) @_previous
      )
    )
  ]
  .
  ;; function declaration
  [
    ;; ... without SIGNATURE and with SINGLE declaration
    (
      (function
          name: (variable) @_start_name @_end_name
          ;; The annotation `@_end_name` is REQUIRED because assertions are
          ;; hoisted, which means that the assertion `(#eq? @_start_name @_end_name)`
          ;; is ALWAYS evaluated, so if we don't set `@_end_name`, it fails.
      ) @branch.iteration
      (#not-eq? @_previous @_start_name)
    )
    ;; ... with SIGNATURE and/or MULTIPLE declarations
    (
      [
        (
          (signature
                name: (variable) @_start_name
          ) @branch.iteration.start
          (#not-eq? @_previous @_start_name)
        )
        (
          (function
              name: (variable) @_start_name
          ) @branch.iteration.start
          (#not-eq? @_previous @_start_name)
        )
      ]
      .
      (function)*
      .
      (
        (function
            name: (variable) @_end_name
        ) @branch.iteration.end
        (#eq? @_start_name @_end_name)
      )
    )
  ]
  .
  ;; next declaration
  [
    (
      (_) @_next
      (#not-type? @_next "function")
    )
    (
      (function
        name: (variable) @_next
      )
      (#not-eq? @_next @_start_name)
    )
  ]
)
;; ... at the START of the file
(haskell
  .
  ;; function declaration
  [
    ;; ... without SIGNATURE and with SINGLE declaration
    (
      (function
          name: (variable) @_start_name @_end_name
          ;; The annotation `@_end_name` is REQUIRED because assertions are
          ;; hoisted, which means that the assertion `(#eq? @_start_name @_end_name)`
          ;; is ALWAYS evaluated, so if we don't set `@_end_name`, it fails.
      ) @branch.iteration
    )
    ;; ... with SIGNATURE and/or MULTIPLE declarations
    (
      [
        (
          (signature
                name: (variable) @_start_name
          ) @branch.iteration.start
        )
        (
          (function
              name: (variable) @_start_name
          ) @branch.iteration.start
        )
      ]
      .
      (function)*
      .
      (
        (function
            name: (variable) @_end_name
        ) @branch.iteration.end
        (#eq? @_start_name @_end_name)
      )
    )
  ]
  .
  ;; next declaration
  [
    (
      (_) @_next
      (#not-type? @_next "function")
    )
    (
      (function
        name: (variable) @_next
      )
      (#not-eq? @_next @_start_name)
    )
  ]
)
;; ... at the END of the file
;; ... without SIGNATURE and with SINGLE declaration
(haskell
  ;; previous declaration
  [
    (
      (_) @_previous
      (#not-type? @_previous "function" "signature")
    )
    (
      (function
        name: (variable) @_previous
      )
    )
  ]
  .
  ;; function declaration
  (
    (function
        name: (variable) @_start_name @_end_name
        ;; The annotation `@_end_name` is REQUIRED because assertions are
        ;; hoisted, which means that the assertion `(#eq? @_start_name @_end_name)`
        ;; is ALWAYS evaluated, so if we don't set `@_end_name`, it fails.
    ) @branch.iteration
    (#not-eq? @_previous @_start_name)
  )
  .
)
;; ... at the END of the file
;; ... with SIGNATURE and/or MULTIPLE declarations
(haskell
  ;; previous declaration
  [
    (
      (_) @_previous
      (#not-type? @_previous "function" "signature")
    )
    (
      (function
        name: (variable) @_previous
      )
    )
  ]
  .
  ;; function declaration
  [
    (
      (signature
            name: (variable) @_start_name
      ) @branch.iteration.start
      (#not-eq? @_previous @_start_name)
    )
    (
      (function
          name: (variable) @_start_name
      ) @branch.iteration.start
      (#not-eq? @_previous @_start_name)
    )
  ]
  .
  (function)*
  .
  (
    (function
        name: (variable) @_end_name
    ) @branch.iteration.end
    (#eq? @_start_name @_end_name)
  )
  .
)
(haskell
  ;; previous declaration
  [
    (
      (_) @_previous
      (#not-type? @_previous "function" "signature")
    )
    (
      (function
        name: (variable) @_previous
      )
    )
  ]
  .
  ;; function declaration
  [
    (
      (signature
            name: (variable) @_start_name
      ) @branch.iteration.start
      (#not-eq? @_previous @_start_name)
    )
    (
      (function
          name: (variable) @_start_name
      ) @branch.iteration.start
      (#not-eq? @_previous @_start_name)
    )
  ]
  .
  (function)*
  .
  (
    (function
        name: (variable) @_end_name
    ) @branch.iteration.end
    (#eq? @_start_name @_end_name)
  )
  .
)
;; ... as the ONLY in the file
;; ... without SIGNATURE and with SINGLE declaration
(haskell
  .
  ;; function declaration
  (function
      name: (variable) @_start_name
  ) @branch.iteration
  .
)
;; ... as the ONLY in the file
;; ... with SIGNATURE and/or MULTIPLE declarations
(haskell
  .
  ;; function declaration
  [
    (
      (signature
            name: (variable) @_start_name
      ) @branch.iteration.start
    )
    (
      (function
          name: (variable) @_start_name
      ) @branch.iteration.start
    )
  ]
  .
  (function)*
  .
  (
    (function
        name: (variable) @_end_name
    ) @branch.iteration.end
    (#eq? @_start_name @_end_name)
  )
  .
)
;; ... at the START of the clause
(decls
  .
  ;; function declaration
  [
    ;; ... without SIGNATURE and with SINGLE declaration
    (
      (function
          name: (variable) @_start_name @_end_name
          ;; The annotation `@_end_name` is REQUIRED because assertions are
          ;; hoisted, which means that the assertion `(#eq? @_start_name @_end_name)`
          ;; is ALWAYS evaluated, so if we don't set `@_end_name`, it fails.
      ) @branch.iteration
    )
    ;; ... with SIGNATURE and/or MULTIPLE declarations
    (
      [
        (
          (signature
                name: (variable) @_start_name
          ) @branch.iteration.start
        )
        (
          (function
              name: (variable) @_start_name
          ) @branch.iteration.start
        )
      ]
      .
      (function)*
      .
      (
        (function
            name: (variable) @_end_name
        ) @branch.iteration.end
        (#eq? @_start_name @_end_name)
      )
    )
  ]
  .
  ;; next declaration
  [
    (
      (_) @_next
      (#not-type? @_next "function")
    )
    (
      (function
        name: (variable) @_next
      )
      (#not-eq? @_next @_start_name)
    )
  ]
)
;; ... at the END of the clause
;; ... without SIGNATURE and with SINGLE declaration
(decls
  ;; previous declaration
  [
    (
      (_) @_previous
      (#not-type? @_previous "function" "signature")
    )
    (
      (function
        name: (variable) @_previous
      )
    )
  ]
  .
  ;; function declaration
  (
    (function
        name: (variable) @_start_name @_end_name
        ;; The annotation `@_end_name` is REQUIRED because assertions are
        ;; hoisted, which means that the assertion `(#eq? @_start_name @_end_name)`
        ;; is ALWAYS evaluated, so if we don't set `@_end_name`, it fails.
    ) @branch.iteration
    (#not-eq? @_previous @_start_name)
  )
  .
)
;; ... at the END of the clause
;; ... with SIGNATURE and/or MULTIPLE declarations
(decls
  ;; previous declaration
  [
    (
      (_) @_previous
      (#not-type? @_previous "function" "signature")
    )
    (
      (function
        name: (variable) @_previous
      )
    )
  ]
  .
  ;; function declaration
  (
    [
      (
        (signature
              name: (variable) @_start_name
        ) @branch.iteration.start
        (#not-eq? @_previous @_start_name)
      )
      (
        (function
            name: (variable) @_start_name
        ) @branch.iteration.start
        (#not-eq? @_previous @_start_name)
      )
    ]
    .
    (function)*
    .
    (
      (function
          name: (variable) @_end_name
      ) @branch.iteration.end
      (#eq? @_start_name @_end_name)
    )
  )
  .
)
;; ... as the ONLY in the clause
;; ... without SIGNATURE and with SINGLE declaration
(decls
  .
  ;; function declaration
  (
    (function
        name: (variable) @_start_name @_end_name
        ;; The annotation `@_end_name` is REQUIRED because assertions are
        ;; hoisted, which means that the assertion `(#eq? @_start_name @_end_name)`
        ;; is ALWAYS evaluated, so if we don't set `@_end_name`, it fails.
    ) @branch.iteration
  )
  .
)
;; ... as the ONLY in the clause
;; ... with SIGNATURE and/or MULTIPLE declarations
(decls
  .
  ;; function declaration
  [
    (
      (signature
            name: (variable) @_start_name
      ) @branch.iteration.start
    )
    (
      (function
          name: (variable) @_start_name
      ) @branch.iteration.start
    )
  ]
  .
  (function)*
  .
  (
    (function
        name: (variable) @_end_name
    ) @branch.iteration.end
    (#eq? @_start_name @_end_name)
  )
  .
)

;; @functionName
(
  ;; previous declaration
  [
    (
      (_) @_previous
      (#not-type? @_previous "function" "signature")
    )
    (
      (function
        name: (variable) @_previous
      )
    )
  ]
  .
  ;; function declaration
  [
    ;; ... without SIGNATURE and with SINGLE declaration
    (
      (function
          name: (variable) @functionName @_start_name @_end_name
          ;; The annotation `@_end_name` is REQUIRED because assertions are
          ;; hoisted, which means that the assertion `(#eq? @_start_name @_end_name)`
          ;; is ALWAYS evaluated, so if we don't set `@_end_name`, it fails.
      ) @functionName.domain
      (#not-eq? @_previous @_start_name)
    )
    ;; ... with SIGNATURE and/or MULTIPLE declarations
    (
      [
        (
          (signature
                name: (variable) @functionName @_start_name
          ) @functionName.domain.start
          (#not-eq? @_previous @_start_name)
        )
        (
          (function
              name: (variable) @functionName @_start_name
          ) @functionName.domain.start
          (#not-eq? @_previous @_start_name)
        )
      ]
      .
      (function)*
      .
      (
        (function
            name: (variable) @_end_name
        ) @functionName.domain.end
        (#eq? @_start_name @_end_name)
      )
    )
  ]
  .
  ;; next declaration
  [
    (
      (_) @_next
      (#not-type? @_next "function")
    )
    (
      (function
        name: (variable) @_next
      )
      (#not-eq? @_next @_start_name)
    )
  ]
)
;; ... at the START of the file
(haskell
  .
  ;; function declaration
  [
    ;; ... without SIGNATURE and with SINGLE declaration
    (
      (function
          name: (variable) @functionName @_start_name @_end_name
          ;; The annotation `@_end_name` is REQUIRED because assertions are
          ;; hoisted, which means that the assertion `(#eq? @_start_name @_end_name)`
          ;; is ALWAYS evaluated, so if we don't set `@_end_name`, it fails.
      ) @functionName.domain
    )
    ;; ... with SIGNATURE and/or MULTIPLE declarations
    (
      [
        (
          (signature
                name: (variable) @functionName @_start_name
          ) @functionName.domain.start
        )
        (
          (function
              name: (variable) @functionName @_start_name
          ) @functionName.domain.start
        )
      ]
      .
      (function)*
      .
      (
        (function
            name: (variable) @_end_name
        ) @functionName.domain.end
        (#eq? @_start_name @_end_name)
      )
    )
  ]
  .
  ;; next declaration
  [
    (
      (_) @_next
      (#not-type? @_next "function")
    )
    (
      (function
        name: (variable) @_next
      )
      (#not-eq? @_next @_start_name)
    )
  ]
)
;; ... at the END of the file
;; ... without SIGNATURE and with SINGLE declaration
(haskell
  ;; previous declaration
  [
    (
      (_) @_previous
      (#not-type? @_previous "function" "signature")
    )
    (
      (function
        name: (variable) @_previous
      )
    )
  ]
  .
  ;; function declaration
  (
    (function
        name: (variable) @functionName @_start_name @_end_name
        ;; The annotation `@_end_name` is REQUIRED because assertions are
        ;; hoisted, which means that the assertion `(#eq? @_start_name @_end_name)`
        ;; is ALWAYS evaluated, so if we don't set `@_end_name`, it fails.
    ) @functionName.domain
    (#not-eq? @_previous @_start_name)
  )
  .
)
;; ... at the END of the file
;; ... with SIGNATURE and/or MULTIPLE declarations
(haskell
  ;; previous declaration
  [
    (
      (_) @_previous
      (#not-type? @_previous "function" "signature")
    )
    (
      (function
        name: (variable) @_previous
      )
    )
  ]
  .
  ;; function declaration
  [
    (
      (signature
            name: (variable) @functionName @_start_name
      ) @functionName.domain.start
      (#not-eq? @_previous @_start_name)
    )
    (
      (function
          name: (variable) @functionName @_start_name
      ) @functionName.domain.start
      (#not-eq? @_previous @_start_name)
    )
  ]
  .
  (function)*
  .
  (
    (function
        name: (variable) @_end_name
    ) @functionName.domain.end
    (#eq? @_start_name @_end_name)
  )
  .
)
(haskell
  ;; previous declaration
  [
    (
      (_) @_previous
      (#not-type? @_previous "function" "signature")
    )
    (
      (function
        name: (variable) @_previous
      )
    )
  ]
  .
  ;; function declaration
  [
    (
      (signature
            name: (variable) @functionName @_start_name
      ) @functionName.domain.start
      (#not-eq? @_previous @_start_name)
    )
    (
      (function
          name: (variable) @functionName @_start_name
      ) @functionName.domain.start
      (#not-eq? @_previous @_start_name)
    )
  ]
  .
  (function)*
  .
  (
    (function
        name: (variable) @_end_name
    ) @functionName.domain.end
    (#eq? @_start_name @_end_name)
  )
  .
)
;; ... as the ONLY in the file
;; ... without SIGNATURE and with SINGLE declaration
(haskell
  .
  ;; function declaration
  (function
      name: (variable) @functionName @_start_name
  ) @functionName.domain
  .
)
;; ... as the ONLY in the file
;; ... with SIGNATURE and/or MULTIPLE declarations
(haskell
  .
  ;; function declaration
  [
    (
      (signature
            name: (variable) @functionName @_start_name
      ) @functionName.domain.start
    )
    (
      (function
          name: (variable) @functionName @_start_name
      ) @functionName.domain.start
    )
  ]
  .
  (function)*
  .
  (
    (function
        name: (variable) @_end_name
    ) @functionName.domain.end
    (#eq? @_start_name @_end_name)
  )
  .
)
;; ... at the START of the clause
(decls
  .
  ;; function declaration
  [
    ;; ... without SIGNATURE and with SINGLE declaration
    (
      (function
          name: (variable) @functionName @_start_name @_end_name
          ;; The annotation `@_end_name` is REQUIRED because assertions are
          ;; hoisted, which means that the assertion `(#eq? @_start_name @_end_name)`
          ;; is ALWAYS evaluated, so if we don't set `@_end_name`, it fails.
      ) @functionName.domain
    )
    ;; ... with SIGNATURE and/or MULTIPLE declarations
    (
      [
        (
          (signature
                name: (variable) @functionName @_start_name
          ) @functionName.domain.start
        )
        (
          (function
              name: (variable) @functionName @_start_name
          ) @functionName.domain.start
        )
      ]
      .
      (function)*
      .
      (
        (function
            name: (variable) @_end_name
        ) @functionName.domain.end
        (#eq? @_start_name @_end_name)
      )
    )
  ]
  .
  ;; next declaration
  [
    (
      (_) @_next
      (#not-type? @_next "function")
    )
    (
      (function
        name: (variable) @_next
      )
      (#not-eq? @_next @_start_name)
    )
  ]
)
;; ... at the END of the clause
;; ... without SIGNATURE and with SINGLE declaration
(decls
  ;; previous declaration
  [
    (
      (_) @_previous
      (#not-type? @_previous "function" "signature")
    )
    (
      (function
        name: (variable) @_previous
      )
    )
  ]
  .
  ;; function declaration
  (
    (function
        name: (variable) @functionName @_start_name @_end_name
        ;; The annotation `@_end_name` is REQUIRED because assertions are
        ;; hoisted, which means that the assertion `(#eq? @_start_name @_end_name)`
        ;; is ALWAYS evaluated, so if we don't set `@_end_name`, it fails.
    ) @functionName.domain
    (#not-eq? @_previous @_start_name)
  )
  .
)
;; ... at the END of the clause
;; ... with SIGNATURE and/or MULTIPLE declarations
(decls
  ;; previous declaration
  [
    (
      (_) @_previous
      (#not-type? @_previous "function" "signature")
    )
    (
      (function
        name: (variable) @_previous
      )
    )
  ]
  .
  ;; function declaration
  (
    [
      (
        (signature
              name: (variable) @functionName @_start_name
        ) @functionName.domain.start
        (#not-eq? @_previous @_start_name)
      )
      (
        (function
            name: (variable) @functionName @_start_name
        ) @functionName.domain.start
        (#not-eq? @_previous @_start_name)
      )
    ]
    .
    (function)*
    .
    (
      (function
          name: (variable) @_end_name
      ) @functionName.domain.end
      (#eq? @_start_name @_end_name)
    )
  )
  .
)
;; ... as the ONLY in the clause
;; ... without SIGNATURE and with SINGLE declaration
(decls
  .
  ;; function declaration
  (
    (function
        name: (variable) @functionName @_start_name @_end_name
        ;; The annotation `@_end_name` is REQUIRED because assertions are
        ;; hoisted, which means that the assertion `(#eq? @_start_name @_end_name)`
        ;; is ALWAYS evaluated, so if we don't set `@_end_name`, it fails.
    ) @functionName.domain
  )
  .
)
;; ... as the ONLY in the clause
;; ... with SIGNATURE and/or MULTIPLE declarations
(decls
  .
  ;; function declaration
  [
    (
      (signature
            name: (variable) @functionName @_start_name
      ) @functionName.domain.start
    )
    (
      (function
          name: (variable) @functionName @_start_name
      ) @functionName.domain.start
    )
  ]
  .
  (function)*
  .
  (
    (function
        name: (variable) @_end_name
    ) @functionName.domain.end
    (#eq? @_start_name @_end_name)
  )
  .
)

;; @name.function
(
  ;; previous declaration
  [
    (
      (_) @_previous
      (#not-type? @_previous "function" "signature")
    )
    (
      (function
        name: (variable) @_previous
      )
    )
  ]
  .
  ;; function declaration
  [
    ;; ... without SIGNATURE and with SINGLE declaration
    (
      (function
          name: (variable) @name @_start_name @_end_name
          ;; The annotation `@_end_name` is REQUIRED because assertions are
          ;; hoisted, which means that the assertion `(#eq? @_start_name @_end_name)`
          ;; is ALWAYS evaluated, so if we don't set `@_end_name`, it fails.
      ) @name.domain
      (#not-eq? @_previous @_start_name)
    )
    ;; ... with SIGNATURE and/or MULTIPLE declarations
    (
      [
        (
          (signature
                name: (variable) @name @_start_name
          ) @name.domain.start
          (#not-eq? @_previous @_start_name)
        )
        (
          (function
              name: (variable) @name @_start_name
          ) @name.domain.start
          (#not-eq? @_previous @_start_name)
        )
      ]
      .
      (function)*
      .
      (
        (function
            name: (variable) @_end_name
        ) @name.domain.end
        (#eq? @_start_name @_end_name)
      )
    )
  ]
  .
  ;; next declaration
  [
    (
      (_) @_next
      (#not-type? @_next "function")
    )
    (
      (function
        name: (variable) @_next
      )
      (#not-eq? @_next @_start_name)
    )
  ]
)
;; ... at the START of the file
(haskell
  .
  ;; function declaration
  [
    ;; ... without SIGNATURE and with SINGLE declaration
    (
      (function
          name: (variable) @name @_start_name @_end_name
          ;; The annotation `@_end_name` is REQUIRED because assertions are
          ;; hoisted, which means that the assertion `(#eq? @_start_name @_end_name)`
          ;; is ALWAYS evaluated, so if we don't set `@_end_name`, it fails.
      ) @name.domain
    )
    ;; ... with SIGNATURE and/or MULTIPLE declarations
    (
      [
        (
          (signature
                name: (variable) @name @_start_name
          ) @name.domain.start
        )
        (
          (function
              name: (variable) @name @_start_name
          ) @name.domain.start
        )
      ]
      .
      (function)*
      .
      (
        (function
            name: (variable) @_end_name
        ) @name.domain.end
        (#eq? @_start_name @_end_name)
      )
    )
  ]
  .
  ;; next declaration
  [
    (
      (_) @_next
      (#not-type? @_next "function")
    )
    (
      (function
        name: (variable) @_next
      )
      (#not-eq? @_next @_start_name)
    )
  ]
)
;; ... at the END of the file
;; ... without SIGNATURE and with SINGLE declaration
(haskell
  ;; previous declaration
  [
    (
      (_) @_previous
      (#not-type? @_previous "function" "signature")
    )
    (
      (function
        name: (variable) @_previous
      )
    )
  ]
  .
  ;; function declaration
  (
    (function
        name: (variable) @name @_start_name @_end_name
        ;; The annotation `@_end_name` is REQUIRED because assertions are
        ;; hoisted, which means that the assertion `(#eq? @_start_name @_end_name)`
        ;; is ALWAYS evaluated, so if we don't set `@_end_name`, it fails.
    ) @name.domain
    (#not-eq? @_previous @_start_name)
  )
  .
)
;; ... at the END of the file
;; ... with SIGNATURE and/or MULTIPLE declarations
(haskell
  ;; previous declaration
  [
    (
      (_) @_previous
      (#not-type? @_previous "function" "signature")
    )
    (
      (function
        name: (variable) @_previous
      )
    )
  ]
  .
  ;; function declaration
  [
    (
      (signature
            name: (variable) @name @_start_name
      ) @name.domain.start
      (#not-eq? @_previous @_start_name)
    )
    (
      (function
          name: (variable) @name @_start_name
      ) @name.domain.start
      (#not-eq? @_previous @_start_name)
    )
  ]
  .
  (function)*
  .
  (
    (function
        name: (variable) @_end_name
    ) @name.domain.end
    (#eq? @_start_name @_end_name)
  )
  .
)
(haskell
  ;; previous declaration
  [
    (
      (_) @_previous
      (#not-type? @_previous "function" "signature")
    )
    (
      (function
        name: (variable) @_previous
      )
    )
  ]
  .
  ;; function declaration
  [
    (
      (signature
            name: (variable) @name @_start_name
      ) @name.domain.start
      (#not-eq? @_previous @_start_name)
    )
    (
      (function
          name: (variable) @name @_start_name
      ) @name.domain.start
      (#not-eq? @_previous @_start_name)
    )
  ]
  .
  (function)*
  .
  (
    (function
        name: (variable) @_end_name
    ) @name.domain.end
    (#eq? @_start_name @_end_name)
  )
  .
)
;; ... as the ONLY in the file
;; ... without SIGNATURE and with SINGLE declaration
(haskell
  .
  ;; function declaration
  (function
      name: (variable) @name @_start_name
  ) @name.domain
  .
)
;; ... as the ONLY in the file
;; ... with SIGNATURE and/or MULTIPLE declarations
(haskell
  .
  ;; function declaration
  [
    (
      (signature
            name: (variable) @name @_start_name
      ) @name.domain.start
    )
    (
      (function
          name: (variable) @name @_start_name
      ) @name.domain.start
    )
  ]
  .
  (function)*
  .
  (
    (function
        name: (variable) @_end_name
    ) @name.domain.end
    (#eq? @_start_name @_end_name)
  )
  .
)
;; ... at the START of the clause
(decls
  .
  ;; function declaration
  [
    ;; ... without SIGNATURE and with SINGLE declaration
    (
      (function
          name: (variable) @name @_start_name @_end_name
          ;; The annotation `@_end_name` is REQUIRED because assertions are
          ;; hoisted, which means that the assertion `(#eq? @_start_name @_end_name)`
          ;; is ALWAYS evaluated, so if we don't set `@_end_name`, it fails.
      ) @name.domain
    )
    ;; ... with SIGNATURE and/or MULTIPLE declarations
    (
      [
        (
          (signature
                name: (variable) @name @_start_name
          ) @name.domain.start
        )
        (
          (function
              name: (variable) @name @_start_name
          ) @name.domain.start
        )
      ]
      .
      (function)*
      .
      (
        (function
            name: (variable) @_end_name
        ) @name.domain.end
        (#eq? @_start_name @_end_name)
      )
    )
  ]
  .
  ;; next declaration
  [
    (
      (_) @_next
      (#not-type? @_next "function")
    )
    (
      (function
        name: (variable) @_next
      )
      (#not-eq? @_next @_start_name)
    )
  ]
)
;; ... at the END of the clause
;; ... without SIGNATURE and with SINGLE declaration
(decls
  ;; previous declaration
  [
    (
      (_) @_previous
      (#not-type? @_previous "function" "signature")
    )
    (
      (function
        name: (variable) @_previous
      )
    )
  ]
  .
  ;; function declaration
  (
    (function
        name: (variable) @name @_start_name @_end_name
        ;; The annotation `@_end_name` is REQUIRED because assertions are
        ;; hoisted, which means that the assertion `(#eq? @_start_name @_end_name)`
        ;; is ALWAYS evaluated, so if we don't set `@_end_name`, it fails.
    ) @name.domain
    (#not-eq? @_previous @_start_name)
  )
  .
)
;; ... at the END of the clause
;; ... with SIGNATURE and/or MULTIPLE declarations
(decls
  ;; previous declaration
  [
    (
      (_) @_previous
      (#not-type? @_previous "function" "signature")
    )
    (
      (function
        name: (variable) @_previous
      )
    )
  ]
  .
  ;; function declaration
  (
    [
      (
        (signature
              name: (variable) @name @_start_name
        ) @name.domain.start
        (#not-eq? @_previous @_start_name)
      )
      (
        (function
            name: (variable) @name @_start_name
        ) @name.domain.start
        (#not-eq? @_previous @_start_name)
      )
    ]
    .
    (function)*
    .
    (
      (function
          name: (variable) @_end_name
      ) @name.domain.end
      (#eq? @_start_name @_end_name)
    )
  )
  .
)
;; ... as the ONLY in the clause
;; ... without SIGNATURE and with SINGLE declaration
(decls
  .
  ;; function declaration
  (
    (function
        name: (variable) @name @_start_name @_end_name
        ;; The annotation `@_end_name` is REQUIRED because assertions are
        ;; hoisted, which means that the assertion `(#eq? @_start_name @_end_name)`
        ;; is ALWAYS evaluated, so if we don't set `@_end_name`, it fails.
    ) @name.domain
  )
  .
)
;; ... as the ONLY in the clause
;; ... with SIGNATURE and/or MULTIPLE declarations
(decls
  .
  ;; function declaration
  [
    (
      (signature
            name: (variable) @name @_start_name
      ) @name.domain.start
    )
    (
      (function
          name: (variable) @name @_start_name
      ) @name.domain.start
    )
  ]
  .
  (function)*
  .
  (
    (function
        name: (variable) @_end_name
    ) @name.domain.end
    (#eq? @_start_name @_end_name)
  )
  .
)

;; @namedFunction
(
  ;; previous declaration
  [
    (
      (_) @_previous
      (#not-type? @_previous "function" "signature")
    )
    (
      (function
        name: (variable) @_previous
      )
    )
  ]
  .
  ;; function declaration
  [
    ;; ... without SIGNATURE and with SINGLE declaration
    (
      (function
          name: (variable) @_start_name @_end_name
          ;; The annotation `@_end_name` is REQUIRED because assertions are
          ;; hoisted, which means that the assertion `(#eq? @_start_name @_end_name)`
          ;; is ALWAYS evaluated, so if we don't set `@_end_name`, it fails.
      ) @namedFunction
      (#not-eq? @_previous @_start_name)
    )
    ;; ... with SIGNATURE and/or MULTIPLE declarations
    (
      [
        (
          (signature
                name: (variable) @_start_name
          ) @namedFunction.start
          (#not-eq? @_previous @_start_name)
        )
        (
          (function
              name: (variable) @_start_name
          ) @namedFunction.start
          (#not-eq? @_previous @_start_name)
        )
      ]
      .
      (function)*
      .
      (
        (function
            name: (variable) @_end_name
        ) @namedFunction.end
        (#eq? @_start_name @_end_name)
      )
    )
  ]
  .
  ;; next declaration
  [
    (
      (_) @_next
      (#not-type? @_next "function")
    )
    (
      (function
        name: (variable) @_next
      )
      (#not-eq? @_next @_start_name)
    )
  ]
)
;; ... at the START of the file
(haskell
  .
  ;; function declaration
  [
    ;; ... without SIGNATURE and with SINGLE declaration
    (
      (function
          name: (variable) @_start_name @_end_name
          ;; The annotation `@_end_name` is REQUIRED because assertions are
          ;; hoisted, which means that the assertion `(#eq? @_start_name @_end_name)`
          ;; is ALWAYS evaluated, so if we don't set `@_end_name`, it fails.
      ) @namedFunction
    )
    ;; ... with SIGNATURE and/or MULTIPLE declarations
    (
      [
        (
          (signature
                name: (variable) @_start_name
          ) @namedFunction.start
        )
        (
          (function
              name: (variable) @_start_name
          ) @namedFunction.start
        )
      ]
      .
      (function)*
      .
      (
        (function
            name: (variable) @_end_name
        ) @namedFunction.end
        (#eq? @_start_name @_end_name)
      )
    )
  ]
  .
  ;; next declaration
  [
    (
      (_) @_next
      (#not-type? @_next "function")
    )
    (
      (function
        name: (variable) @_next
      )
      (#not-eq? @_next @_start_name)
    )
  ]
)
;; ... at the END of the file
;; ... without SIGNATURE and with SINGLE declaration
(haskell
  ;; previous declaration
  [
    (
      (_) @_previous
      (#not-type? @_previous "function" "signature")
    )
    (
      (function
        name: (variable) @_previous
      )
    )
  ]
  .
  ;; function declaration
  (
    (function
        name: (variable) @_start_name @_end_name
        ;; The annotation `@_end_name` is REQUIRED because assertions are
        ;; hoisted, which means that the assertion `(#eq? @_start_name @_end_name)`
        ;; is ALWAYS evaluated, so if we don't set `@_end_name`, it fails.
    ) @namedFunction
    (#not-eq? @_previous @_start_name)
  )
  .
)
;; ... at the END of the file
;; ... with SIGNATURE and/or MULTIPLE declarations
(haskell
  ;; previous declaration
  [
    (
      (_) @_previous
      (#not-type? @_previous "function" "signature")
    )
    (
      (function
        name: (variable) @_previous
      )
    )
  ]
  .
  ;; function declaration
  [
    (
      (signature
            name: (variable) @_start_name
      ) @namedFunction.start
      (#not-eq? @_previous @_start_name)
    )
    (
      (function
          name: (variable) @_start_name
      ) @namedFunction.start
      (#not-eq? @_previous @_start_name)
    )
  ]
  .
  (function)*
  .
  (
    (function
        name: (variable) @_end_name
    ) @namedFunction.end
    (#eq? @_start_name @_end_name)
  )
  .
)
(haskell
  ;; previous declaration
  [
    (
      (_) @_previous
      (#not-type? @_previous "function" "signature")
    )
    (
      (function
        name: (variable) @_previous
      )
    )
  ]
  .
  ;; function declaration
  [
    (
      (signature
            name: (variable) @_start_name
      ) @namedFunction.start
      (#not-eq? @_previous @_start_name)
    )
    (
      (function
          name: (variable) @_start_name
      ) @namedFunction.start
      (#not-eq? @_previous @_start_name)
    )
  ]
  .
  (function)*
  .
  (
    (function
        name: (variable) @_end_name
    ) @namedFunction.end
    (#eq? @_start_name @_end_name)
  )
  .
)
;; ... as the ONLY in the file
;; ... without SIGNATURE and with SINGLE declaration
(haskell
  .
  ;; function declaration
  (function
      name: (variable) @_start_name
  ) @namedFunction
  .
)
;; ... as the ONLY in the file
;; ... with SIGNATURE and/or MULTIPLE declarations
(haskell
  .
  ;; function declaration
  [
    (
      (signature
            name: (variable) @_start_name
      ) @namedFunction.start
    )
    (
      (function
          name: (variable) @_start_name
      ) @namedFunction.start
    )
  ]
  .
  (function)*
  .
  (
    (function
        name: (variable) @_end_name
    ) @namedFunction.end
    (#eq? @_start_name @_end_name)
  )
  .
)
;; ... at the START of the clause
(decls
  .
  ;; function declaration
  [
    ;; ... without SIGNATURE and with SINGLE declaration
    (
      (function
          name: (variable) @_start_name @_end_name
          ;; The annotation `@_end_name` is REQUIRED because assertions are
          ;; hoisted, which means that the assertion `(#eq? @_start_name @_end_name)`
          ;; is ALWAYS evaluated, so if we don't set `@_end_name`, it fails.
      ) @namedFunction
    )
    ;; ... with SIGNATURE and/or MULTIPLE declarations
    (
      [
        (
          (signature
                name: (variable) @_start_name
          ) @namedFunction.start
        )
        (
          (function
              name: (variable) @_start_name
          ) @namedFunction.start
        )
      ]
      .
      (function)*
      .
      (
        (function
            name: (variable) @_end_name
        ) @namedFunction.end
        (#eq? @_start_name @_end_name)
      )
    )
  ]
  .
  ;; next declaration
  [
    (
      (_) @_next
      (#not-type? @_next "function")
    )
    (
      (function
        name: (variable) @_next
      )
      (#not-eq? @_next @_start_name)
    )
  ]
)
;; ... at the END of the clause
;; ... without SIGNATURE and with SINGLE declaration
(decls
  ;; previous declaration
  [
    (
      (_) @_previous
      (#not-type? @_previous "function" "signature")
    )
    (
      (function
        name: (variable) @_previous
      )
    )
  ]
  .
  ;; function declaration
  (
    (function
        name: (variable) @_start_name @_end_name
        ;; The annotation `@_end_name` is REQUIRED because assertions are
        ;; hoisted, which means that the assertion `(#eq? @_start_name @_end_name)`
        ;; is ALWAYS evaluated, so if we don't set `@_end_name`, it fails.
    ) @namedFunction
    (#not-eq? @_previous @_start_name)
  )
  .
)
;; ... at the END of the clause
;; ... with SIGNATURE and/or MULTIPLE declarations
(decls
  ;; previous declaration
  [
    (
      (_) @_previous
      (#not-type? @_previous "function" "signature")
    )
    (
      (function
        name: (variable) @_previous
      )
    )
  ]
  .
  ;; function declaration
  (
    [
      (
        (signature
              name: (variable) @_start_name
        ) @namedFunction.start
        (#not-eq? @_previous @_start_name)
      )
      (
        (function
            name: (variable) @_start_name
        ) @namedFunction.start
        (#not-eq? @_previous @_start_name)
      )
    ]
    .
    (function)*
    .
    (
      (function
          name: (variable) @_end_name
      ) @namedFunction.end
      (#eq? @_start_name @_end_name)
    )
  )
  .
)
;; ... as the ONLY in the clause
;; ... without SIGNATURE and with SINGLE declaration
(decls
  .
  ;; function declaration
  (
    (function
        name: (variable) @_start_name @_end_name
        ;; The annotation `@_end_name` is REQUIRED because assertions are
        ;; hoisted, which means that the assertion `(#eq? @_start_name @_end_name)`
        ;; is ALWAYS evaluated, so if we don't set `@_end_name`, it fails.
    ) @namedFunction
  )
  .
)
;; ... as the ONLY in the clause
;; ... with SIGNATURE and/or MULTIPLE declarations
(decls
  .
  ;; function declaration
  [
    (
      (signature
            name: (variable) @_start_name
      ) @namedFunction.start
    )
    (
      (function
          name: (variable) @_start_name
      ) @namedFunction.start
    )
  ]
  .
  (function)*
  .
  (
    (function
        name: (variable) @_end_name
    ) @namedFunction.end
    (#eq? @_start_name @_end_name)
  )
  .
)
