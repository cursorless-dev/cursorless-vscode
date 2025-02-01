import type { SimpleScopeTypeType } from "./command/PartialTargetDescriptor.types";

export interface SnippetScope {
  /**
   * VSCode language ids where this snippet definition should be active
   */
  langIds?: string[];

  /**
   * Cursorless scopes in which this snippet is active.  Allows, for example, to
   * have different snippets to define a function if you're in a class or at
   * global scope.
   */
  scopeTypes?: SimpleScopeTypeType[];

  /**
   * Exclude regions of {@link scopeTypes} that are descendants of these scope
   * types. For example, if you have a snippet that should be active in a class
   * but not in a function within the class, you can specify
   * `scopeTypes: ["class"], excludeDescendantScopeTypes: ["namedFunction"]`.
   */
  excludeDescendantScopeTypes?: SimpleScopeTypeType[];
}

export type SnippetBody = string[];

export interface SnippetDefinition {
  /**
   * Inline snippet text using VSCode snippet syntax; entries joined by newline.
   * Named variables of the form `$foo` can be used as placeholders
   */
  body: SnippetBody;

  /**
   * Scopes where this snippet is active
   */
  scope?: SnippetScope;

  /**
   * Scope-specific overrides for the variables defined in the snippet
   */
  variables?: Record<string, SnippetVariable>;
}

export interface SnippetVariable {
  /**
   * Default to this scope type when wrapping a target without scope type
   * specified.
   */
  wrapperScopeType?: SimpleScopeTypeType;

  /**
   * Description of the snippet variable
   */
  description?: string;

  /**
   * Format text inserted into this variable using the given formatter
   */
  formatter?: string;
}

export interface Snippet {
  /**
   * List of possible definitions for this snippet
   */
  definitions: SnippetDefinition[];

  /**
   * For each named variable in the snippet, provides extra information about the variable.
   */
  variables?: Record<string, SnippetVariable>;

  /**
   * Description of the snippet
   */
  description?: string;

  /**
   * Try to expand target to this scope type when inserting this snippet
   * before/after a target without scope type specified. If multiple scope types
   * are specified try them each in order until one of them matches.
   */
  insertionScopeTypes?: SimpleScopeTypeType[];
}

export type SnippetMap = Record<string, Snippet>;
