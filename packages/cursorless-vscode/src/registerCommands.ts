import type { CursorlessCommandId } from "@cursorless/common";
import {
  CURSORLESS_COMMAND_ID,
  type CommandHistoryStorage,
} from "@cursorless/common";
import {
  showCheatsheet,
  updateDefaults,
} from "@cursorless/cursorless-cheatsheet";
import type {
  CommandApi,
  StoredTargetMap,
} from "@cursorless/cursorless-engine";
import { analyzeCommandHistory } from "@cursorless/cursorless-engine";
import type {
  ScopeTestRecorder,
  TestCaseRecorder,
} from "@cursorless/test-case-recorder";
import * as vscode from "vscode";
import type { InstallationDependencies } from "./InstallationDependencies";
import type { ScopeVisualizer } from "./ScopeVisualizerCommandApi";
import type { VscodeSnippets } from "./VscodeSnippets";
import type { VscodeTutorial } from "./VscodeTutorial";
import { showDocumentation, showQuickPick } from "./commands";
import type { VscodeIDE } from "./ide/vscode/VscodeIDE";
import type { VscodeHats } from "./ide/vscode/hats/VscodeHats";
import type { KeyboardCommands } from "./keyboard/KeyboardCommands";
import { logQuickActions } from "./logQuickActions";
import { migrateSnippets } from "./migrateSnippets";

export function registerCommands(
  extensionContext: vscode.ExtensionContext,
  vscodeIde: VscodeIDE,
  commandApi: CommandApi,
  commandHistoryStorage: CommandHistoryStorage,
  testCaseRecorder: TestCaseRecorder,
  scopeTestRecorder: ScopeTestRecorder,
  scopeVisualizer: ScopeVisualizer,
  keyboardCommands: KeyboardCommands,
  hats: VscodeHats,
  tutorial: VscodeTutorial,
  installationDependencies: InstallationDependencies,
  storedTargets: StoredTargetMap,
  snippets: VscodeSnippets,
): void {
  const runCommandWrapper = async (run: () => Promise<unknown>) => {
    try {
      return await run();
    } catch (e) {
      if (vscodeIde.runMode !== "test") {
        const err = e as Error;
        console.error(err.stack);
        vscodeIde.handleCommandError(err);
      }
      throw e;
    }
  };

  const commands: Record<CursorlessCommandId, (...args: any[]) => any> = {
    // The core Cursorless command
    [CURSORLESS_COMMAND_ID]: async (...args: unknown[]) => {
      return runCommandWrapper(() => commandApi.runCommandSafe(...args));
    },

    ["cursorless.repeatPreviousCommand"]: async () => {
      return runCommandWrapper(() => commandApi.repeatPreviousCommand());
    },

    // Cheatsheet commands
    ["cursorless.showCheatsheet"]: (arg) => showCheatsheet(vscodeIde, arg),
    ["cursorless.internal.updateCheatsheetDefaults"]: updateDefaults,

    // Testcase recorder commands
    ["cursorless.recordTestCase"]: testCaseRecorder.toggle,
    ["cursorless.recordOneTestCaseThenPause"]:
      testCaseRecorder.recordOneThenPause,
    ["cursorless.pauseRecording"]: testCaseRecorder.pause,
    ["cursorless.resumeRecording"]: testCaseRecorder.resume,
    ["cursorless.takeSnapshot"]: testCaseRecorder.takeSnapshot,

    // Scope test recorder commands
    ["cursorless.recordScopeTests.showUnimplementedFacets"]:
      scopeTestRecorder.showUnimplementedFacets,
    ["cursorless.recordScopeTests.saveActiveDocument"]:
      scopeTestRecorder.saveActiveDocument,

    // Other commands
    ["cursorless.showQuickPick"]: showQuickPick,
    ["cursorless.showDocumentation"]: showDocumentation,
    ["cursorless.showInstallationDependencies"]: installationDependencies.show,

    ["cursorless.migrateSnippets"]: (dir) => migrateSnippets(snippets, dir),

    ["cursorless.private.logQuickActions"]: logQuickActions,

    // Hats
    ["cursorless.toggleDecorations"]: hats.toggle,
    ["cursorless.recomputeDecorationStyles"]: hats.recomputeDecorationStyles,

    // Scope visualizer
    ["cursorless.showScopeVisualizer"]: scopeVisualizer.start,
    ["cursorless.hideScopeVisualizer"]: scopeVisualizer.stop,

    // Command history
    ["cursorless.analyzeCommandHistory"]: () =>
      analyzeCommandHistory(commandHistoryStorage),

    // General keyboard commands
    ["cursorless.keyboard.escape"]:
      keyboardCommands.keyboardHandler.cancelActiveListener,

    // Targeted keyboard commands
    ["cursorless.keyboard.targeted.targetHat"]:
      keyboardCommands.targeted.targetDecoratedMark,

    ["cursorless.keyboard.targeted.targetScope"]:
      keyboardCommands.targeted.modifyTargetContainingScope,

    ["cursorless.keyboard.targeted.targetSelection"]:
      keyboardCommands.targeted.targetSelection,

    ["cursorless.keyboard.targeted.clearTarget"]:
      keyboardCommands.targeted.clearTarget,

    ["cursorless.keyboard.targeted.runActionOnTarget"]:
      keyboardCommands.targeted.performActionOnTarget,

    // Modal keyboard commands
    ["cursorless.keyboard.modal.modeOn"]: keyboardCommands.modal.modeOn,
    ["cursorless.keyboard.modal.modeOff"]: keyboardCommands.modal.modeOff,
    ["cursorless.keyboard.modal.modeToggle"]: keyboardCommands.modal.modeToggle,
    ["cursorless.keyboard.undoTarget"]: () => storedTargets.undo("keyboard"),
    ["cursorless.keyboard.redoTarget"]: () => storedTargets.redo("keyboard"),

    // Tutorial commands
    ["cursorless.tutorial.start"]: tutorial.start,
    ["cursorless.tutorial.next"]: tutorial.next,
    ["cursorless.tutorial.previous"]: tutorial.previous,
    ["cursorless.tutorial.restart"]: tutorial.restart,
    ["cursorless.tutorial.resume"]: tutorial.resume,
    ["cursorless.tutorial.list"]: tutorial.list,
    ["cursorless.documentationOpened"]: tutorial.documentationOpened,
  };

  extensionContext.subscriptions.push(
    ...Object.entries(commands).map(([commandId, callback]) =>
      vscode.commands.registerCommand(commandId, callback),
    ),
  );
}
