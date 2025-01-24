import type {
  CommandResponse,
  CommandServerApi,
  CursorlessCommandId,
} from "@cursorless/common";
import {
  CURSORLESS_COMMAND_ID,
  clientSupportsFallback,
  ensureCommandShape,
} from "@cursorless/common";

import type { CommandApi } from "@cursorless/cursorless-engine";
import type { NeovimIDE } from "@cursorless/neovim-common";
import {
  modeSwitchNormalTerminal,
  modeSwitchTerminal,
} from "@cursorless/neovim-common";
import { getNeovimRegistry } from "@cursorless/neovim-registry";
import type { NeovimClient } from "neovim";

export async function registerCommands(
  client: NeovimClient,
  neovimIDE: NeovimIDE,
  commandApi: CommandApi,
  commandServerApi: CommandServerApi,
): Promise<void> {
  const commands: Record<CursorlessCommandId, (...args: any[]) => any> = {
    // The core Cursorless command
    [CURSORLESS_COMMAND_ID]: async (...args: unknown[]) => {
      const originalMode = await client.mode;
      if (originalMode.mode === "t") {
        // Switch to "nt" so we can easily call lua functions without any problems
        void modeSwitchNormalTerminal(client);
      }

      try {
        await neovimIDE.updateTextEditor();
        const result = await commandApi.runCommandSafe(...args);

        const command = ensureCommandShape(args);
        const focusedElementType =
          await commandServerApi.getFocusedElementType();
        if (
          focusedElementType === "terminal" &&
          clientSupportsFallback(command)
        ) {
          const commandResponse = result as CommandResponse;
          if (
            "fallback" in commandResponse &&
            commandResponse.fallback.action === "insert"
          ) {
            // if user runs a terminal, and a "bring" command was requested, switch back to "t" mode
            // so the fallback can do its magic
            void modeSwitchTerminal(client);
          }
        }

        return result;
      } catch (e) {
        if (neovimIDE.runMode !== "test") {
          const err = e as Error;
          console.error(err.stack);
          neovimIDE.handleCommandError(err);
        }
        throw e;
      }
    },

    ["cursorless.repeatPreviousCommand"]: dummyCommandHandler,

    // Cheatsheet commands
    ["cursorless.showCheatsheet"]: dummyCommandHandler,
    ["cursorless.internal.updateCheatsheetDefaults"]: dummyCommandHandler,

    // Testcase recorder commands
    ["cursorless.recordTestCase"]: dummyCommandHandler,
    ["cursorless.recordOneTestCaseThenPause"]: dummyCommandHandler,
    ["cursorless.pauseRecording"]: dummyCommandHandler,
    ["cursorless.resumeRecording"]: dummyCommandHandler,
    ["cursorless.takeSnapshot"]: dummyCommandHandler,

    // Scope test recorder commands
    ["cursorless.recordScopeTests.showUnimplementedFacets"]:
      dummyCommandHandler,
    ["cursorless.recordScopeTests.saveActiveDocument"]: dummyCommandHandler,

    // Other commands
    ["cursorless.showQuickPick"]: dummyCommandHandler,
    ["cursorless.showDocumentation"]: dummyCommandHandler,
    ["cursorless.showInstallationDependencies"]: dummyCommandHandler,
    ["cursorless.migrateSnippets"]: dummyCommandHandler,
    ["cursorless.private.logQuickActions"]: dummyCommandHandler,

    // Hats
    ["cursorless.toggleDecorations"]: dummyCommandHandler,
    ["cursorless.recomputeDecorationStyles"]: dummyCommandHandler,

    // Scope visualizer
    ["cursorless.showScopeVisualizer"]: dummyCommandHandler,
    ["cursorless.hideScopeVisualizer"]: dummyCommandHandler,

    // Command history
    ["cursorless.analyzeCommandHistory"]: dummyCommandHandler,

    // General keyboard commands
    ["cursorless.keyboard.escape"]: dummyCommandHandler,

    // Targeted keyboard commands
    ["cursorless.keyboard.targeted.targetHat"]: dummyCommandHandler,
    ["cursorless.keyboard.targeted.targetScope"]: dummyCommandHandler,
    ["cursorless.keyboard.targeted.targetSelection"]: dummyCommandHandler,
    ["cursorless.keyboard.targeted.clearTarget"]: dummyCommandHandler,
    ["cursorless.keyboard.targeted.runActionOnTarget"]: dummyCommandHandler,

    // Modal keyboard commands
    ["cursorless.keyboard.modal.modeOn"]: dummyCommandHandler,
    ["cursorless.keyboard.modal.modeOff"]: dummyCommandHandler,
    ["cursorless.keyboard.modal.modeToggle"]: dummyCommandHandler,
    ["cursorless.keyboard.undoTarget"]: dummyCommandHandler,
    ["cursorless.keyboard.redoTarget"]: dummyCommandHandler,

    // Tutorial commands
    ["cursorless.tutorial.start"]: dummyCommandHandler,
    ["cursorless.tutorial.next"]: dummyCommandHandler,
    ["cursorless.tutorial.previous"]: dummyCommandHandler,
    ["cursorless.tutorial.restart"]: dummyCommandHandler,
    ["cursorless.tutorial.resume"]: dummyCommandHandler,
    ["cursorless.tutorial.list"]: dummyCommandHandler,
    ["cursorless.documentationOpened"]: dummyCommandHandler,
  };

  Object.entries(commands).map(([commandId, callback]) =>
    getNeovimRegistry().registerCommand(commandId, callback),
  );
}

export async function dummyCommandHandler(...args: any[]) {
  console.debug(`dummyCommandHandler(): args=${args}`);
}
