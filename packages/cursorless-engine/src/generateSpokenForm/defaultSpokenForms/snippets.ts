import type { InsertSnippetArg, WrapWithSnippetArg } from "@cursorless/common";
import { NoSpokenFormError } from "../NoSpokenFormError";

export function insertionSnippetToSpokenForm(
  snippetDescription: InsertSnippetArg,
): string {
  throw new NoSpokenFormError(`${snippetDescription.type} insertion snippet`);
}

export function wrapperSnippetToSpokenForm(
  snippetDescription: WrapWithSnippetArg,
): string {
  throw new NoSpokenFormError(`${snippetDescription.type} wrap with snippet`);
}
