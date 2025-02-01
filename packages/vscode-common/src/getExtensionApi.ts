import type { CommandServerApi } from "@cursorless/common";
import * as vscode from "vscode";
import type { Language, SyntaxNode, Tree } from "web-tree-sitter";
import type { VscodeTestHelpers } from "./TestHelpers";

export interface CursorlessApi {
  testHelpers: VscodeTestHelpers | undefined;
}

export interface ParseTreeApi {
  getNodeAtLocation(location: vscode.Location): SyntaxNode;
  getTreeForUri(uri: vscode.Uri): Tree;
  loadLanguage: (languageId: string) => Promise<boolean>;
  getLanguage(languageId: string): Language | undefined;
}

export async function getExtensionApi<T>(extensionId: string) {
  const extension = vscode.extensions.getExtension(extensionId);

  return extension == null ? undefined : ((await extension.activate()) as T);
}

export async function getExtensionApiStrict<T>(extensionId: string) {
  const extension = vscode.extensions.getExtension(extensionId);

  if (extension == null) {
    throw new Error(`Could not get ${extensionId} extension`);
  }

  return (await extension.activate()) as T;
}

export const EXTENSION_ID = "pokey.cursorless";
export const COMMAND_SERVER_EXTENSION_ID = "pokey.command-server";

export const getCursorlessApi = () =>
  getExtensionApiStrict<CursorlessApi>(EXTENSION_ID);

export const getParseTreeApi = () =>
  getExtensionApiStrict<ParseTreeApi>("pokey.parse-tree");

/**
 *
 * @returns Command server API or null if not installed
 */
export const getCommandServerApi = () =>
  getExtensionApi<CommandServerApi>(COMMAND_SERVER_EXTENSION_ID);
