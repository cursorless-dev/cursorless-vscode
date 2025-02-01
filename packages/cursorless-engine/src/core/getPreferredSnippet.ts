import type {
  CustomInsertSnippetArg,
  CustomWrapWithSnippetArg,
  InsertSnippetArg,
  WrapWithSnippetArg,
} from "@cursorless/common";
import { compareSnippetDefinitions } from "./compareSnippetDefinitions";

export function getPreferredSnippet(
  snippetDescription: InsertSnippetArg,
  languageId: string,
): CustomInsertSnippetArg;

export function getPreferredSnippet(
  snippetDescription: WrapWithSnippetArg,
  languageId: string,
): CustomWrapWithSnippetArg;

export function getPreferredSnippet(
  snippetDescription: InsertSnippetArg | WrapWithSnippetArg,
  languageId: string,
) {
  const allSnippets = getSnippets(snippetDescription);
  const filteredSnippets = filterSnippetDefinitions(allSnippets, languageId);
  filteredSnippets.sort(compareSnippetDefinitions);
  const preferredSnippet = filteredSnippets[0];

  if (preferredSnippet == null) {
    throw new Error("No snippet available for the current language");
  }

  return preferredSnippet;
}

function getSnippets(
  snippetDescription: InsertSnippetArg | WrapWithSnippetArg,
) {
  if (snippetDescription.type === "named") {
    throw new Error(
      "Cursorless snippets are deprecated. Please use community snippets.",
    );
  }
  if (snippetDescription.type === "custom") {
    return [snippetDescription];
  }
  return snippetDescription.snippets;
}

/**
 * Filter snippet definitions by language.
 * @param snippetDescriptions The snippets to filter
 * @returns The snippets that are relevant to the current language
 */
function filterSnippetDefinitions<
  T extends CustomInsertSnippetArg | CustomWrapWithSnippetArg,
>(snippetDescriptions: T[], languageId: string): T[] {
  return snippetDescriptions.filter((snippetDescription) => {
    if (snippetDescription.languages == null) {
      return true;
    }
    return snippetDescription.languages.includes(languageId);
  });
}
