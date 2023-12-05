;; Note that we don't just import `javascript.scm` because that includes
;; `javascript.jsx.scm`, and tree-sitter would complain because those node
;; types are not defined in the typescript grammar.

;; import javascript.core.scm

;;!! function aaa(bbb?: Ccc = "ddd") {}
;;!               ^^^--------------
(optional_parameter
  (identifier) @name
) @_.domain

;;!! function aaa(bbb: Ccc = "ddd") {}
;;!               ^^^-------------
(required_parameter
  (identifier) @name
) @_.domain

;; Define these here because these node types don't exist in javascript.
(
  [
    ;;!! class Foo { foo() {} }
    ;;!              ^^^^^^^^
    ;;!! interface Foo { foo(): void; }
    ;;!                  ^^^^^^^^^^^^
    (method_signature
      name: (_) @functionName @name
    )

    ;;!! class Foo { abstract foo(): void; }
    ;;!              ^^^^^^^^^^^^^^^^^^^^^
    (abstract_method_signature
      name: (_) @functionName @name
    )

    ;;!! class Foo {
    ;;!!   (public | private | protected) foo = () => {};
    ;;!                                   ^^^^^^^^^^^^^^^
    ;;!!   (public | private | protected) foo = function() {};
    ;;!                                   ^^^^^^^^^^^^^^^^^^^^
    ;;!!   (public | private | protected) foo = function *() {};
    ;;!                                   ^^^^^^^^^^^^^^^^^^^^^^
    ;;!! }
    (public_field_definition
      name: (_) @functionName
      value: [
        (function
          !name
        )
        (generator_function
          !name
        )
        (arrow_function)
      ]
    )
  ] @namedFunction.start @functionName.domain.start @name.domain.start
  .
  ";"? @namedFunction.end @functionName.domain.end @name.domain.end
)

(
  ;;!! (public | private | protected) foo = ...;
  ;;!  -------------------------------^^^-------
  (public_field_definition
    name: (_) @name
    type: (_
      ":"
      (_) @type
    )?
    value: (_)? @value
  ) @_.domain.start
  .
  ";"? @_.domain.end
)

[
  (interface_declaration)
  (object_type)
] @namedFunction.iteration @functionName.iteration

;; Special cases for `(let | const | var) foo = ...;` because the full statement
;; is actually a grandparent of the `name` node, so we want the domain to include
;; this full grandparent statement.
(
  [
    ;;!! (const | let) aaa: Bbb = 0;
    ;;!                     ^^^
    ;;!                   xxxxx
    ;;!  ---------------------------
    (lexical_declaration
      (variable_declarator
        type: (type_annotation
          (_) @type
        ) @type.removal
      )
    )

    ;;!! var aaa: Bbb = 0;
    ;;!           ^^^
    ;;!         xxxxx
    ;;!  -----------------
    ;; Note that we can't merge this with the variable declaration above because
    ;; of https://github.com/tree-sitter/tree-sitter/issues/1442#issuecomment-1584628651
    (variable_declaration
      (variable_declarator
        type: (type_annotation
          (_) @type
        ) @type.removal
      )
    )
  ] @_.domain
  (#not-parent-type? @_.domain export_statement)

  ;; Handle multiple variable declarators in one statement, eg
  ;;!! (let | const | var) aaa: Bbb = ..., ccc: Ddd = ...;
  ;;!  -------------------------^^^-------------^^^-------
  (#allow-multiple! @type)
)

(
  (export_statement
    (_
      ;;!! export (const | let | var) aaa: Bbb = 0;
      ;;!                                  ^^^
      ;;!                                xxxxx
      ;;!  ----------------------------------------
      (variable_declarator
        type: (type_annotation
          (_) @type
        ) @type.removal
      )
    )
  ) @_.domain

  ;; Handle multiple variable declarators in one statement, eg
  ;;!! export (let | const | var) aaa: Bbb = ..., ccc: Ddd = ...;
  ;;!  --------------------------------^^^-------------^^^-------
  (#allow-multiple! @type)
)

;;!! (const | let | var) aaa: Ccc = 0, bbb: Ddd = 0;
;;!1                          ^^^
;;!1                        xxxxx
;;!1                     ------------
;;!2                                        ^^^
;;!2                                      xxxxx
;;!2                                   ------------
(
  (_
    (variable_declarator
      type: (type_annotation
        (_) @type
      ) @type.removal
    ) @_.domain
  ) @dummy
  (#has-multiple-children-of-type? @dummy variable_declarator)
)

;;!! function ccc(aaa: string, bbb?: string) {}
;;!                    ^^^^^^        ^^^^^^
(formal_parameters
  (_
    pattern: (_) @type.leading.start.endOf
    type: (_
      ":"
      (_) @type @type.leading.end.startOf
    )
  ) @_.domain
)

;;!! function ccc(): string {}
;;!                  ^^^^^^
;;!! ccc(): string {}
;;!         ^^^^^^
(_
  parameters: (_) @type.leading.end.endOf
  return_type: (_
    ":"
    (_) @type @type.leading.end.startOf
  )
) @_.domain

;;!! new Aaa<Bbb>()
;;!      ^^^^^^^^
(new_expression
  constructor: (_) @type.start
  type_arguments: (_)? @type.end
)

;;!! useState<string>()
;;!           ^^^^^^
;;!! useState<Record<string, string>>()
;;!           ^^^^^^^^^^^^^^^^^^^^^^
;;!                  ^^^^^^  ^^^^^^
(type_arguments
  (_) @type
  (#not-parent-type? @dummy type_assertion)
) @dummy

;;!! function foo<A>() {}
;;!               ^
;;!! const foo = <A>() => {}
;;!               ^
(type_parameters
  (_) @type
)

;;!! interface Aaa {}
;;!! type Aaa = Bbb;
(
  [
    (type_alias_declaration)
    (interface_declaration)
  ] @type
  (#not-parent-type? @type export_statement)
)

;;!! export interface Aaa {}
;;!! export type Aaa = Bbb;
(export_statement
  [
    (type_alias_declaration)
    (interface_declaration)
  ] @type
) @_.domain

;;!! aaa as Bbb
;;!         ^^^
;;!     xxxxxxx
;;!  ----------
(as_expression
  (_) @_.leading.start.endOf
  (_) @type @_.leading.end.startOf
) @_.domain

;;!! aaa satisfies Bbb
;;!                ^^^
;;!     xxxxxxxxxxxxxx
;;!  -----------------
(satisfies_expression
  (_) @_.leading.start.endOf
  [
    (generic_type)
    (predefined_type)
  ] @type @_.leading.end.startOf
) @_.domain

;;!! abstract class MyClass {}
;;!  ^^^^^^^^^^^^^^^^^^^^^^^^^
(
  (abstract_class_declaration
    name: (_) @className
  ) @class @_.domain
  (#not-parent-type? @class export_statement)
)

;;!! export abstract class MyClass {}
;;!  ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
(export_statement
  (abstract_class_declaration
    name: (_) @className
  )
) @class @_.domain

;;!! class MyClass {}
;;!        ^^^^^^^
;;!  ----------------
(abstract_class_declaration
  name: (_) @name
) @_.domain

;;!! interface Type { name: string; }
;;!                   ^^^^
;;!                   xxxxxx
;;!                   ------------
(property_signature
  name: (_) @collectionKey @collectionKey.trailing.start.endOf @type.leading.start.endOf
  type: (_
    ":"
    (_) @type @collectionKey.trailing.end.startOf @type.leading.end.startOf
  )
) @_.domain

;;!! interface Type { name: string; }
;;!                 ^^^^^^^^^^^^^^^^^
(object_type) @collectionKey.iteration

;; Non-exported statements
(
  [
    (ambient_declaration)
    (abstract_class_declaration)
    (enum_declaration)
    (function_signature)
    (import_alias)
    (interface_declaration)
    (internal_module)
    (module)
    (type_alias_declaration)
  ] @statement
  (#not-parent-type? @statement export_statement)
)

;; Statements with optional trailing `;`
(
  [
    (property_signature)
    (public_field_definition)
    (abstract_method_signature)
  ] @statement.start
  ";"? @statement.end
)
