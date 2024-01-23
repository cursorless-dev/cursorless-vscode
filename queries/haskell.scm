;; import haskell/haskell.branch.scm
;; import haskell/haskell.functionApplication.scm
;; import haskell/haskell.functionDeclaration.scm

;; Short declarations are below.

;; anonymousFunction
(exp_lambda) @anonymousFunction
(exp_lambda_case) @anonymousFunction

;; list
(exp_list) @list
(exp_list_comprehension) @list
(exp_tuple) @list
(exp_unboxed_tuple) @list
(pat_list) @list
(pat_tuple) @list
(pat_unboxed_tuple) @list
(type_tuple) @list
(type_unboxed_tuple) @list

;; map
(exp_record) @map
(pat_record) @map

;; string
(string) @string
(char) @string
