import type { TextEditor } from "@cursorless/common";
import { type IDE } from "@cursorless/common";
import { type Snippets } from "@cursorless/cursorless-engine";
import { walkFiles } from "@cursorless/node-common";
import { open } from "node:fs/promises";
import { join } from "node:path";

// DEPRECATED @ 2025-02-01

export const CURSORLESS_SNIPPETS_SUFFIX = ".cursorless-snippets";

/**
 * Handles all cursorless snippets, including core, third-party and
 * user-defined.  Merges these collections and allows looking up snippets by
 * name.
 */
export class VscodeSnippets implements Snippets {
  private userSnippetsDir?: string;

  constructor(private ide: IDE) {
    this.updateUserSnippetsPath();

    this.ide.disposeOnExit(
      this.ide.configuration.onDidChangeConfiguration(() =>
        this.updateUserSnippetsPath(),
      ),
    );
  }

  private updateUserSnippetsPath() {
    this.userSnippetsDir = this.ide.configuration.getOwnConfiguration(
      "experimental.snippetsDir",
    );
  }

  async openNewSnippetFile(
    snippetName: string,
    directory: string,
  ): Promise<TextEditor> {
    const path = join(directory, `${snippetName}.snippet`);
    await touch(path);
    return this.ide.openTextDocument(path);
  }

  getUserDirectoryStrict() {
    const userSnippetsDir = this.ide.configuration.getOwnConfiguration(
      "experimental.snippetsDir",
    );

    if (!userSnippetsDir) {
      throw new Error("User snippets dir not configured.");
    }

    return userSnippetsDir;
  }

  getSnippetPaths(snippetsDir: string) {
    return walkFiles(snippetsDir, CURSORLESS_SNIPPETS_SUFFIX);
  }
}

async function touch(path: string) {
  const file = await open(path, "w");
  await file.close();
}
