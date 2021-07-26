import { SyntaxNode } from "web-tree-sitter";
import { getPojoMatchers } from "./getPojoMatchers";
import { cascadingMatcher, composedMatcher, matcher } from "../nodeMatchers";
import {
  NodeMatcher,
  NodeMatcherAlternative,
  ScopeType,
  NodeFinder,
} from "../Types";
import {
  getDeclarationNode,
  getNameNode,
  getValueNode,
} from "../treeSitterUtils";
import {
  nodeFinder,
  typedNodeFinder,
  findPossiblyWrappedNode,
} from "../nodeFinders";
import {
  delimitedSelector,
  selectWithLeadingDelimiter,
} from "../nodeSelectors";

// TODO figure out how to properly use super types
// Generated by the following command:
// > curl https://raw.githubusercontent.com/tree-sitter/tree-sitter-typescript/4c20b54771e4b390ee058af2930feb2cd55f2bf8/typescript/src/node-types.json \
//   | jq '.[] | select(.type == "primary_expression" or .type == "expression") | [.subtypes[].type]'
const EXPRESSION_TYPES = [
  "array",
  "arrow_function",
  "as_expression",
  "assignment_expression",
  "augmented_assignment_expression",
  "await_expression",
  "binary_expression",
  "call_expression",
  "class",
  "false",
  "function",
  "generator_function",
  "identifier",
  "import",
  "internal_module",
  "member_expression",
  "meta_property",
  "new_expression",
  "non_null_expression",
  "null",
  "number",
  "object",
  "parenthesized_expression",
  "primary_expression",
  "regex",
  "string",
  "subscript_expression",
  "super",
  "template_string",
  "ternary_expression",
  "this",
  "true",
  "type_assertion",
  "unary_expression",
  "undefined",
  "update_expression",
  "yield_expression",
];

function isExpression(node: SyntaxNode) {
  return EXPRESSION_TYPES.includes(node.type);
}

// Generated by the following command:
// > curl https://raw.githubusercontent.com/tree-sitter/tree-sitter-typescript/4c20b54771e4b390ee058af2930feb2cd55f2bf8/typescript/src/node-types.json \
//   | jq '[.[] | select(.type == "statement" or .type == "declaration") | .subtypes[].type]'
const STATEMENT_TYPES = [
  "abstract_class_declaration",
  "ambient_declaration",
  "break_statement",
  "class_declaration",
  "continue_statement",
  "debugger_statement",
  "declaration",
  "do_statement",
  "empty_statement",
  "enum_declaration",
  "export_statement",
  "expression_statement",
  "for_in_statement",
  "for_statement",
  "function_declaration",
  "function_signature",
  "generator_function_declaration",
  "if_statement",
  "import_alias",
  "import_statement",
  "interface_declaration",
  "internal_module",
  "labeled_statement",
  "lexical_declaration",
  "module",
  "return_statement",
  "statement_block",
  "switch_statement",
  "throw_statement",
  "try_statement",
  "type_alias_declaration",
  "variable_declaration",
  "while_statement",
  "with_statement",
];

function possiblyExportedDeclaration(...typeNames: string[]): NodeFinder {
  return findPossiblyWrappedNode(
    typedNodeFinder("export_statement"),
    typedNodeFinder(...typeNames),
    (node) => [getDeclarationNode(node), getValueNode(node)]
  );
}

const findNamedArrowFunction = (node: SyntaxNode) => {
  if (node.type !== "lexical_declaration" || node.namedChildCount !== 1) {
    return null;
  }

  const child = node.firstNamedChild!;

  return child.type === "variable_declarator" &&
    getValueNode(child)!.type === "arrow_function"
    ? node
    : null;
};

const findClassPropertyArrowFunction = (node: SyntaxNode) =>
  node.type === "public_field_definition" &&
  getValueNode(node)!.type === "arrow_function"
    ? node
    : null;

export const findTypeNode = (node: SyntaxNode) => {
  const typeAnnotationNode = node.children.find((child) =>
    ["type_annotation", "opting_type_annotation"].includes(child.type)
  );
  return typeAnnotationNode?.lastChild ?? null;
};

const nodeMatchers: Record<ScopeType, NodeMatcherAlternative> = {
  ...getPojoMatchers(
    ["object"],
    ["array"],
    (node) => isExpression(node) || node.type === "spread_element"
  ),
  ifStatement: "if_statement",
  class: [
    "export_statement.class_declaration", // export class
    "export_statement.class", // export default class
    "class_declaration", // class
  ],
  statement: matcher(possiblyExportedDeclaration(...STATEMENT_TYPES)),
  arrowFunction: "arrow_function",
  functionCall: ["call_expression", "new_expression"],
  name: matcher(getNameNode),
  functionName: cascadingMatcher(
    composedMatcher([
      typedNodeFinder("function_declaration", "method_definition"),
      getNameNode,
    ]),
    composedMatcher([findClassPropertyArrowFunction, getNameNode]),
    composedMatcher([findNamedArrowFunction, getNameNode])
  ),
  className: composedMatcher([
    typedNodeFinder("class_declaration", "class"),
    getNameNode,
  ]),
  type: cascadingMatcher(
    // Typed parameters, properties, and functions
    matcher(findTypeNode, selectWithLeadingDelimiter),
    // Type alias/interface declarations
    matcher(
      possiblyExportedDeclaration(
        "type_alias_declaration",
        "interface_declaration"
      )
    )
  ),
  argumentOrParameter: matcher(
    nodeFinder(
      (node) =>
        (node.parent?.type === "arguments" &&
          (isExpression(node) || node.type === "spread_element")) ||
        node.type === "optional_parameter" ||
        node.type === "required_parameter"
    ),
    delimitedSelector(
      (node) => node.type === "," || node.type === "(" || node.type === ")",
      ", "
    )
  ),
  namedFunction: [
    "export_statement.function_declaration", // export function
    "export_statement.function", // export default function
    "function_declaration", // function
    "method_definition", // class method
    "public_field_definition.arrow_function", // class arrow method
    // const foo = () => "hello"
    "lexical_declaration.variable_declarator.arrow_function",
    // foo = () => "hello"
    "expression_statement.assignment_expression.arrow_function",
  ],
  comment: "comment",
};

export default nodeMatchers;
