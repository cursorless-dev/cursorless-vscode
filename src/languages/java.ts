import { patternFinder } from "../nodeFinders";
import {
  matcher,
  createPatternMatchers,
  argumentMatcher,
  notSupported,
} from "../nodeMatchers";
import { selectWithLeadingDelimiter } from "../nodeSelectors";
import { NodeMatcherAlternative, ScopeType } from "../Types";

// Generated by the following command:
// > curl https://raw.githubusercontent.com/tree-sitter/tree-sitter-java/master/src/node-types.json | jq '[.[] | select(.type == "statement" or .type == "declaration") | .subtypes[].type]'
const STATEMENT_TYPES = [
  "annotation_type_declaration",
  "class_declaration",
  "enum_declaration",
  "import_declaration",
  "interface_declaration",
  "module_declaration",
  "package_declaration",
  //   ";",
  "assert_statement",
  "block",
  "break_statement",
  "continue_statement",
  "declaration",
  "do_statement",
  "enhanced_for_statement",
  "expression_statement",
  "for_statement",
  "if_statement",
  "labeled_statement",
  "local_variable_declaration",
  "return_statement",
  "switch_expression",
  "synchronized_statement",
  "throw_statement",
  "try_statement",
  "try_with_resources_statement",
  "while_statement",
  "yield_statement",
];

const nodeMatchers: Partial<Record<ScopeType, NodeMatcherAlternative>> = {
  class: "class_declaration",
  className: "class_declaration[name]",
  namedFunction: ["method_declaration", "constructor_declaration"],
  functionName: [
    "method_declaration.identifier!",
    "constructor_declaration.identifier!",
  ],
  ifStatement: "if_statement",
  string: "string_literal",
  name: ["*[declarator.name]", "*[name]", "formal_parameter.identifier!"],
  type: [
    "type_identifier",
    "local_variable_declaration[type]",
    "array_creation_expression[type]",
    "formal_parameter[type]",
  ],
  comment: "comment",
  arrowFunction: "lambda_expression",
  list: "array_initializer",
  functionCall: "method_invocation",
  value: matcher(
    patternFinder("*[declarator.value]", "*[value]"),
    selectWithLeadingDelimiter
  ),
  collectionItem: argumentMatcher("array_initializer"),
  argumentOrParameter: argumentMatcher("formal_parameters", "argument_list"),
  statement: STATEMENT_TYPES,
  dictionary: ["block"],
  collectionKey: notSupported,
};

export default createPatternMatchers(nodeMatchers);
