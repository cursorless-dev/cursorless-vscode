;; https://github.com/sogaiu/tree-sitter-clojure/blob/master/src/grammar.json

(comment) @comment @textFragment

(str_lit) @string @textFragment

(map_lit) @map

;; A list is either a vector literal or a quoted list literal
(vec_lit) @list

(quoting_lit
  (list_lit)
) @list

;;!! '(foo bar)
;;!    ^^^ ^^^
(list_lit
  (_)? @_.leading.endOf
  .
  (_) @collectionItem
  .
  (_)? @_.trailing.startOf
)

(list_lit
  open: "(" @collectionItem.iteration.start.endOf
  close: ")" @collectionItem.iteration.end.startOf
) @collectionItem.iteration.domain

;;!! [foo bar]
;;!   ^^^ ^^^
(vec_lit
  (_)? @_.leading.endOf
  .
  (_) @collectionItem
  .
  (_)? @_.trailing.startOf
)

(vec_lit
  open: "[" @collectionItem.iteration.start.endOf
  close: "]" @collectionItem.iteration.end.startOf
) @collectionItem.iteration.domain

;; Keyword follow by a value
(map_lit
  (_)? @_.leading.endOf
  .
  (kwd_lit) @collectionItem.start
  .
  value: (_) @collectionItem.end
  .
  (_)? @_.trailing.startOf
)

;; Keyword followed by comment or closing brace
(map_lit
  (_)? @_.leading.endOf
  .
  (kwd_lit) @collectionItem.start
  .
  [
    (comment) @_.trailing.startOf
    "}"
  ]
)

;; Non keyword value that is not preceded by a keyword. eg a string literal.
(map_lit
  _ @_dummy
  .
  value: (_) @collectionItem
  (#not-type? @_dummy "kwd_lit")
  (#not-type? @collectionItem "kwd_lit")
)

(map_lit
  open: "{" @collectionItem.iteration.start.endOf
  close: "}" @collectionItem.iteration.end.startOf
) @collectionItem.iteration.domain
