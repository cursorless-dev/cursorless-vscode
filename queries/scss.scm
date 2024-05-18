;; import css.scm

(single_line_comment) @comment @textFragment

(if_statement) @ifStatement

(mixin_statement
  (name) @functionName @name
) @namedFunction @_.domain

(function_statement
  (name) @functionName @name
) @namedFunction @_.domain

(declaration
  (variable_name) @name
) @_.domain
(parameter
  (variable_name) @name
) @_.domain
