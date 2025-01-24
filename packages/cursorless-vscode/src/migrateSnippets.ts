import type {
  SnippetMap,
  SnippetVariable as SnippetVariableLegacy,
} from "@cursorless/common";
import * as fs from "node:fs/promises";
import * as path from "node:path";
import {
  serializeSnippetFile,
  type SnippetDocument,
  type SnippetVariable,
} from "talon-snippets";
import * as vscode from "vscode";
import type { VscodeSnippets } from "./VscodeSnippets";

export async function migrateSnippets(
  snippets: VscodeSnippets,
  targetDirectory: string,
) {
  const userSnippetsDir = snippets.getUserDirectoryStrict();
  const files = await snippets.getSnippetPaths(userSnippetsDir);

  for (const file of files) {
    await migrateFile(targetDirectory, file);
  }

  await vscode.window.showInformationMessage(
    `${files.length} snippet files migrated successfully!`,
  );
}

async function migrateFile(targetDirectory: string, filePath: string) {
  const fileName = path.basename(filePath, ".cursorless-snippets");
  const snippetFile = await readLegacyFile(filePath);
  const communitySnippetFile: SnippetDocument[] = [];

  for (const snippetName in snippetFile) {
    const snippet = snippetFile[snippetName];

    communitySnippetFile.push({
      name: snippetName,
      variables: parseVariables(snippet.variables),
      insertionScopes: snippet.insertionScopeTypes,
      // TODO: snippet.description
    });

    for (const def of snippet.definitions) {
      communitySnippetFile.push({
        body: def.body.map((line) => line.replaceAll("\t", "    ")),
        languages: def.scope?.langIds,
        variables: parseVariables(def.variables),
        // TODO: def.scope?.scopeTypes
        // TODO: def.scope?.excludeDescendantScopeTypes
      });
    }
  }

  let destinationPath = path.join(targetDirectory, `${fileName}.snippet`);
  if (await fileExists(destinationPath)) {
    destinationPath = path.join(
      targetDirectory,
      `${fileName}_CONFLICT.snippet`,
    );
  }
  await writeCommunityFile(communitySnippetFile, destinationPath);
}

function parseVariables(
  variables?: Record<string, SnippetVariableLegacy>,
): SnippetVariable[] {
  return Object.entries(variables ?? {}).map(
    ([name, variable]): SnippetVariable => {
      return {
        name,
        wrapperScope: variable.wrapperScopeType,
        insertionFormatters: variable.formatter
          ? [variable.formatter]
          : undefined,
        // TODO: variable.description
      };
    },
  );
}

async function fileExists(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath);
    return true;
  } catch (_e) {
    return false;
  }
}

async function readLegacyFile(filePath: string): Promise<SnippetMap> {
  const content = await fs.readFile(filePath, "utf8");
  if (content.length === 0) {
    return {};
  }
  return JSON.parse(content);
}

async function writeCommunityFile(
  snippetFile: SnippetDocument[],
  filePath: string,
) {
  const snippetText = serializeSnippetFile(snippetFile);
  const file = await fs.open(filePath, "w");
  await file.write(snippetText);
  await file.close();
}
