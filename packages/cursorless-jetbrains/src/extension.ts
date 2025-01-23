import type { CursorlessEngine } from "@cursorless/cursorless-engine";
import { createCursorlessEngine } from "@cursorless/cursorless-engine";
import type { JetbrainsPlugin } from "./ide/JetbrainsPlugin";
import Parser from "web-tree-sitter";
import { JetbrainsTreeSitter } from "./ide/JetbrainsTreeSitter";
import { JetbrainsTreeSitterQueryProvider } from "./ide/JetbrainsTreeSitterQueryProvider";
import { pathJoin } from "./ide/pathJoin";
import { JetbrainsCommandServer } from "./ide/JetbrainsCommandServer";

export async function activate(
  plugin: JetbrainsPlugin,
  wasmDirectory: string,
): Promise<CursorlessEngine> {
  console.log("activate started");
  await Parser.init({
    locateFile(scriptName: string, _scriptDirectory: string) {
      const fullPath = pathJoin(wasmDirectory, scriptName);
      return fullPath;
    },
  });
  console.log("Parser initialized");

  const commandServerApi = new JetbrainsCommandServer(plugin.client);
  const queryProvider = new JetbrainsTreeSitterQueryProvider(plugin.ide);
  const engine = await createCursorlessEngine({
    ide: plugin.ide,
    hats: plugin.hats,
    treeSitterQueryProvider: queryProvider,
    treeSitter: new JetbrainsTreeSitter(wasmDirectory),
    commandServerApi: commandServerApi,
  });
  console.log("activate completed");
  return engine;
}
