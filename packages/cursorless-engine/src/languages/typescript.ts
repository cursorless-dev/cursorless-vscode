import { SimpleScopeTypeType } from "@cursorless/common";
import { NodeMatcherAlternative } from "../typings/Types";
import { patternFinder } from "../util/nodeFinders";
import {
  argumentMatcher,
  cascadingMatcher,
  conditionMatcher,
  createPatternMatchers,
  matcher,
  patternMatcher,
  trailingMatcher,
} from "../util/nodeMatchers";
import { extendForwardPastOptional } from "../util/nodeSelectors";
import { branchMatcher } from "./branchMatcher";
import { elseExtractor, elseIfExtractor } from "./elseIfExtractor";
import { ternaryBranchMatcher } from "./ternaryBranchMatcher";

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
  "functions_declaration",
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
  //   "statement_block", This is disabled since we want the whole statement and not just the block
  "switch_statement",
  "throw_statement",
  "try_statement",
  "type_alias_declaration",
  "variable_declaration",
  "while_statement",
  "with_statement",
];

const nodeMatchers: Partial<
  Record<SimpleScopeTypeType, NodeMatcherAlternative>
> = {
  collectionItem: "jsx_attribute",
  collectionKey: trailingMatcher(
    [
      "pair[key]",
      "jsx_attribute.property_identifier!",
      "object_type.property_signature[name]!",
      "shorthand_property_identifier",
    ],
    [":"],
  ),
  statement: cascadingMatcher(
    matcher(
      patternFinder(
        "property_signature",
        "public_field_definition",
        "abstract_method_signature",
      ),
      extendForwardPastOptional(";"),
    ),
    patternMatcher(
      ...STATEMENT_TYPES.map((type) => `export_statement?.${type}`),
      "method_definition",
    ),
  ),
  condition: cascadingMatcher(
    patternMatcher("ternary_expression[condition]"),
    conditionMatcher(
      "if_statement[condition]",
      "for_statement[condition]",
      "while_statement[condition]",
      "do_statement[condition]",
    ),
  ),
  branch: cascadingMatcher(
    patternMatcher("switch_case"),
    matcher(patternFinder("else_clause"), elseExtractor("if_statement")),
    matcher(patternFinder("if_statement"), elseIfExtractor()),
    branchMatcher("try_statement", ["catch_clause", "finally_clause"]),
    ternaryBranchMatcher("ternary_expression", [1, 2]),
  ),
  // class: [
  //   "export_statement?.class_declaration", // export class | class
  //   "export_statement?.abstract_class_declaration", // export abstract class | abstract class
  //   "export_statement.class", // export default class
  // ],
  argumentOrParameter: argumentMatcher("formal_parameters", "arguments"),
};

export const patternMatchers = createPatternMatchers(nodeMatchers);
