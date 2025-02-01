import type { TextEditor } from "@cursorless/common";
import type { Snippets } from "../core/Snippets";

export class DisabledSnippets implements Snippets {
  openNewSnippetFile(
    _snippetName: string,
    _directory: string,
  ): Promise<TextEditor> {
    throw new Error("Snippets are not implemented.");
  }
}
