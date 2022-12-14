import {
  createPatternMatchers,
  argumentMatcher,
  conditionMatcher,
  cascadingMatcher,
  patternMatcher,
} from "../util/nodeMatchers";
import { NodeMatcherAlternative } from "../typings/Types";
import { SimpleScopeTypeType } from "../core/commandRunner/typings/targetDescriptor.types";

// Generated by the following command:
// `curl https://raw.githubusercontent.com/tree-sitter/tree-sitter-go/master/src/node-types.json | jq '[.[] | select(.type == "_statement" or .type == "_simple_statement") | .subtypes[].type]'`
const STATEMENT_TYPES = [
  "_expression",
  "assignment_statement",
  "dec_statement",
  "inc_statement",
  "send_statement",
  "short_var_declaration",
  "_simple_statement",
  "break_statement",
  "const_declaration",
  "continue_statement",
  "defer_statement",
  "empty_statement",
  "expression_switch_statement",
  "fallthrough_statement",
  "for_statement",
  "go_statement",
  "goto_statement",
  "if_statement",
  "labeled_statement",
  "return_statement",
  "select_statement",
  "type_declaration",
  "type_switch_statement",
  "var_declaration",
];

const nodeMatchers: Partial<
  Record<SimpleScopeTypeType, NodeMatcherAlternative>
> = {
  map: "composite_literal",
  list: ["composite_literal", "slice_type", "array_type"],
  statement: STATEMENT_TYPES,
  string: ["interpreted_string_literal", "raw_string_literal"],
  ifStatement: "if_statement",
  functionCall: ["call_expression", "composite_literal"],
  functionCallee: ["call_expression[function]", "composite_literal[type]"],
  comment: "comment",
  namedFunction: ["function_declaration", "method_declaration"],
  type: [
    "pointer_type",
    "qualified_type",
    "type_identifier",
    "function_declaration[result]",
    "method_declaration[result]",
  ],
  functionName: ["function_declaration[name]", "method_declaration[name]"],
  anonymousFunction: "func_literal",
  condition: conditionMatcher("*[condition]"),
  argumentOrParameter: cascadingMatcher(
    argumentMatcher("argument_list", "parameter_list"),
    patternMatcher("parameter_declaration"),
    patternMatcher("argument_declaration"),
  ),
  collectionKey: "keyed_element[0]",
  value: cascadingMatcher(
    patternMatcher("keyed_element[1]"),
    patternMatcher("return_statement.expression_list!"),
  ),
};

export default createPatternMatchers(nodeMatchers);
