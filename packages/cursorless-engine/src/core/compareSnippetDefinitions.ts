import type {
  CustomInsertSnippetArg,
  CustomWrapWithSnippetArg,
  SimpleScopeTypeType,
  SnippetScope,
} from "@cursorless/common";

/**
 * Compares two snippet definitions by how specific their scope, breaking
 * ties by origin.
 * @param a One of the snippet definitions to compare
 * @param b The other snippet definition to compare
 * @returns A negative number if a should come before b, a positive number if b
 */
export function compareSnippetDefinitions<
  T extends CustomInsertSnippetArg | CustomWrapWithSnippetArg,
>(a: T, b: T): number {
  return compareSnippetScopes(
    getScopeFromSnippetDescription(a),
    getScopeFromSnippetDescription(b),
  );
}

function getScopeFromSnippetDescription(
  snippet: CustomInsertSnippetArg | CustomWrapWithSnippetArg,
): SnippetScope | undefined {
  if (snippet.languages != null) {
    return {
      langIds: snippet.languages,
      // Note what is called scopeTypes in the snippet arg is the
      // insertion scope. Not scope to match against like with the
      // function/method snippet example.
    };
  }
}

function compareSnippetScopes(
  a: SnippetScope | undefined,
  b: SnippetScope | undefined,
): number {
  if (a == null && b == null) {
    return 0;
  }

  // Prefer the snippet that has a scope at all
  if (a == null) {
    return -1;
  }

  if (b == null) {
    return 1;
  }

  // Prefer the snippet that is language-specific, regardless of scope type
  if (a.langIds == null && b.langIds != null) {
    return -1;
  }

  if (b.langIds == null && a.langIds != null) {
    return 1;
  }

  // If both snippets are language-specific, prefer the snippet that specifies
  // scope types.  Note that this holds even if one snippet specifies more
  // languages than the other.  The motivating use case is if you have a snippet
  // for functions in js and ts, and a snippet for methods in js and ts.  If you
  // override the function snippet for ts, you still want the method snippet to
  // be used for ts methods.
  const scopeTypesComparision = compareScopeTypes(a.scopeTypes, b.scopeTypes);

  if (scopeTypesComparision !== 0) {
    return scopeTypesComparision;
  }

  // If snippets both have scope types or both don't have scope types, prefer
  // the snippet that specifies fewer languages
  return a.langIds == null ? 0 : b.langIds!.length - a.langIds.length;
}

function compareScopeTypes(
  a: SimpleScopeTypeType[] | undefined,
  b: SimpleScopeTypeType[] | undefined,
): number {
  if (a == null && b != null) {
    return -1;
  }

  if (b == null && a != null) {
    return 1;
  }

  return 0;
}
