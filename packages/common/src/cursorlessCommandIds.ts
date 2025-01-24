export const CURSORLESS_COMMAND_ID =
  "cursorless.command" satisfies CursorlessCommandId;

export interface CommandDescription {
  readonly isVisible: boolean;
  readonly title: string;
}

abstract class Command {
  constructor(private baseTitle: string) {}

  get title(): string {
    return `Cursorless: ${this.baseTitle}`;
  }
}

class HiddenCommand extends Command implements CommandDescription {
  readonly isVisible = false as const;
}

class VisibleCommand extends Command implements CommandDescription {
  readonly isVisible = true as const;
}

export const cursorlessCommandIds = [
  "cursorless.command",
  "cursorless.repeatPreviousCommand",
  "cursorless.internal.updateCheatsheetDefaults",
  "cursorless.private.logQuickActions",
  "cursorless.keyboard.escape",
  "cursorless.keyboard.modal.modeOff",
  "cursorless.keyboard.modal.modeOn",
  "cursorless.keyboard.modal.modeToggle",
  "cursorless.keyboard.undoTarget",
  "cursorless.keyboard.redoTarget",
  "cursorless.keyboard.targeted.clearTarget",
  "cursorless.keyboard.targeted.runActionOnTarget",
  "cursorless.keyboard.targeted.targetHat",
  "cursorless.keyboard.targeted.targetScope",
  "cursorless.keyboard.targeted.targetSelection",
  "cursorless.migrateSnippets",
  "cursorless.pauseRecording",
  "cursorless.recomputeDecorationStyles",
  "cursorless.recordTestCase",
  "cursorless.recordOneTestCaseThenPause",
  "cursorless.resumeRecording",
  "cursorless.recordScopeTests.showUnimplementedFacets",
  "cursorless.recordScopeTests.saveActiveDocument",
  "cursorless.showCheatsheet",
  "cursorless.showDocumentation",
  "cursorless.showInstallationDependencies",
  "cursorless.showQuickPick",
  "cursorless.takeSnapshot",
  "cursorless.toggleDecorations",
  "cursorless.showScopeVisualizer",
  "cursorless.hideScopeVisualizer",
  "cursorless.tutorial.start",
  "cursorless.tutorial.next",
  "cursorless.tutorial.previous",
  "cursorless.tutorial.restart",
  "cursorless.tutorial.resume",
  "cursorless.tutorial.list",
  "cursorless.documentationOpened",
  "cursorless.analyzeCommandHistory",
] as const satisfies readonly `cursorless.${string}`[];

export type CursorlessCommandId = (typeof cursorlessCommandIds)[number];

export const cursorlessCommandDescriptions: Record<
  CursorlessCommandId,
  CommandDescription
> = {
  ["cursorless.toggleDecorations"]: new VisibleCommand("Toggle decorations"),
  ["cursorless.recomputeDecorationStyles"]: new VisibleCommand(
    "Recompute decoration styles",
  ),
  ["cursorless.recordTestCase"]: new VisibleCommand("Record test case"),
  ["cursorless.recordOneTestCaseThenPause"]: new VisibleCommand(
    "Record one test case, then pause",
  ),
  ["cursorless.pauseRecording"]: new VisibleCommand(
    "Pause test case recording",
  ),
  ["cursorless.resumeRecording"]: new VisibleCommand(
    "Resume test case recording",
  ),
  ["cursorless.recordScopeTests.showUnimplementedFacets"]: new VisibleCommand(
    "Bulk record unimplemented scope facets",
  ),
  ["cursorless.recordScopeTests.saveActiveDocument"]: new VisibleCommand(
    "Bulk save scope tests for the active document",
  ),
  ["cursorless.showDocumentation"]: new VisibleCommand("Show documentation"),
  ["cursorless.showInstallationDependencies"]: new VisibleCommand(
    "Show installation dependencies",
  ),
  ["cursorless.showScopeVisualizer"]: new VisibleCommand(
    "Show the scope visualizer",
  ),
  ["cursorless.hideScopeVisualizer"]: new VisibleCommand(
    "Hide the scope visualizer",
  ),
  ["cursorless.analyzeCommandHistory"]: new VisibleCommand(
    "Analyze collected command history",
  ),

  ["cursorless.tutorial.start"]: new HiddenCommand("Start a tutorial"),
  ["cursorless.tutorial.next"]: new VisibleCommand("Tutorial next"),
  ["cursorless.tutorial.previous"]: new VisibleCommand("Tutorial previous"),
  ["cursorless.tutorial.restart"]: new VisibleCommand("Tutorial restart"),
  ["cursorless.tutorial.resume"]: new VisibleCommand("Tutorial resume"),
  ["cursorless.tutorial.list"]: new VisibleCommand("Tutorial list"),
  ["cursorless.documentationOpened"]: new HiddenCommand(
    "Used by talon to notify us that the docs have been opened; for use with tutorial",
  ),
  ["cursorless.command"]: new HiddenCommand("The core cursorless command"),
  ["cursorless.repeatPreviousCommand"]: new VisibleCommand(
    "Repeat the previous Cursorless command",
  ),
  ["cursorless.showQuickPick"]: new HiddenCommand(
    "Pop up a quick pick of all cursorless commands",
  ),
  ["cursorless.showCheatsheet"]: new HiddenCommand(
    "Display the cursorless cheatsheet",
  ),
  ["cursorless.internal.updateCheatsheetDefaults"]: new HiddenCommand(
    "Update the default values of the cheatsheet payload used on the website and for local development. Be sure to run this on stock community and cursorless.",
  ),
  ["cursorless.private.logQuickActions"]: new HiddenCommand(
    "Log the quick actions available at the current cursor position",
  ),
  ["cursorless.takeSnapshot"]: new HiddenCommand(
    "Take a snapshot of the current editor state",
  ),
  ["cursorless.keyboard.escape"]: new HiddenCommand(
    "Should be mapped to the escape key when using cursorless keyboard. By default, exits modal keyboard mode, but changes behaviour when Cursorless is expecting a continuation keystroke.  For example, when you type a color and Cursorless is waiting for a character, it cancels the color and switches back to modal mode.",
  ),
  ["cursorless.keyboard.targeted.targetHat"]: new HiddenCommand(
    "Sets the keyboard target to the given hat",
  ),
  ["cursorless.keyboard.targeted.targetScope"]: new HiddenCommand(
    "Sets the keyboard target to the scope containing the current target",
  ),
  ["cursorless.keyboard.targeted.targetSelection"]: new HiddenCommand(
    "Sets the keyboard target to the current selection",
  ),
  ["cursorless.keyboard.targeted.clearTarget"]: new HiddenCommand(
    "Clears the current keyboard target",
  ),
  ["cursorless.keyboard.targeted.runActionOnTarget"]: new HiddenCommand(
    "Run the given action on the current keyboard target",
  ),
  ["cursorless.keyboard.modal.modeOn"]: new HiddenCommand(
    "Turn on the cursorless modal mode",
  ),
  ["cursorless.keyboard.modal.modeOff"]: new HiddenCommand(
    "Turn off the cursorless modal mode",
  ),
  ["cursorless.keyboard.modal.modeToggle"]: new HiddenCommand(
    "Toggle the cursorless modal mode",
  ),
  ["cursorless.keyboard.undoTarget"]: new HiddenCommand(
    "Undo keyboard targeting changes",
  ),
  ["cursorless.keyboard.redoTarget"]: new HiddenCommand(
    "Redo keyboard targeting changes",
  ),
  ["cursorless.migrateSnippets"]: new HiddenCommand(
    "Migrate snippets from the old Cursorless format to the new community format",
  ),
};
