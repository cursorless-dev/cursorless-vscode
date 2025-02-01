import type {
  ActionDescriptor,
  CommandComplete,
  CommandHistoryEntry,
  CommandServerApi,
  IDE,
  ReadOnlyHatMap,
} from "@cursorless/common";
import { type CommandHistoryStorage } from "@cursorless/common";
import { produce } from "immer";
import { v4 as uuid } from "uuid";
import type { CommandRunner } from "./CommandRunner";
import type { CommandRunnerDecorator } from "./api/CursorlessEngineApi";

const filePrefix = "cursorlessCommandHistory";

/**
 * When user opts in, this class sanitizes and appends each Cursorless command
 * to a local log file in `.cursorless/commandHistory` dir.
 */
export class CommandHistory implements CommandRunnerDecorator {
  private currentPhraseSignal = "";
  private currentPhraseId = "";

  constructor(
    private ide: IDE,
    private storage: CommandHistoryStorage,
    private commandServerApi: CommandServerApi | undefined,
  ) {}

  wrapCommandRunner(
    _readableHatMap: ReadOnlyHatMap,
    runner: CommandRunner,
  ): CommandRunner {
    if (!this.isActive()) {
      return runner;
    }

    return {
      run: async (commandComplete: CommandComplete) => {
        try {
          const returnValue = await runner.run(commandComplete);

          await this.appendToLog(commandComplete);

          return returnValue;
        } catch (e) {
          await this.appendToLog(commandComplete, e as Error);
          throw e;
        }
      },
    };
  }

  private async appendToLog(
    command: CommandComplete,
    thrownError?: Error,
  ): Promise<void> {
    const date = new Date();
    const fileName = `${filePrefix}_${getMonthDate(date)}.jsonl`;

    const historyItem: CommandHistoryEntry = {
      id: uuid(),
      date: getDayDate(date),
      cursorlessVersion: this.ide.cursorlessVersion,
      error: thrownError?.name,
      phraseId: await this.getPhraseId(),
      command: produce(command, sanitizeCommandInPlace),
    };

    await this.storage.appendEntry(fileName, historyItem);
  }

  private async getPhraseId(): Promise<string | undefined> {
    const phraseStartSignal = this.commandServerApi?.signals?.prePhrase;

    if (phraseStartSignal == null) {
      return undefined;
    }

    const newSignal = await phraseStartSignal.getVersion();

    if (newSignal == null) {
      return undefined;
    }

    if (newSignal !== this.currentPhraseSignal) {
      this.currentPhraseSignal = newSignal;
      this.currentPhraseId = uuid();
    }

    return this.currentPhraseId;
  }

  private isActive(): boolean {
    return this.ide.configuration.getOwnConfiguration("commandHistory");
  }
}

// Remove spoken form and sanitize action
function sanitizeCommandInPlace(command: CommandComplete): void {
  delete command.spokenForm;
  sanitizeActionInPlace(command.action);
}

function sanitizeActionInPlace(action: ActionDescriptor): void {
  switch (action.name) {
    // Remove replace with text
    case "replace":
      if (Array.isArray(action.replaceWith)) {
        action.replaceWith = [];
      }
      break;

    // Remove substitutions and custom body
    case "insertSnippet":
      if (action.snippetDescription.type === "custom") {
        action.snippetDescription.body = "";
        delete action.snippetDescription.substitutions;
      } else if (action.snippetDescription.type === "list") {
        for (const snippet of action.snippetDescription.snippets) {
          snippet.body = "";
          delete snippet.substitutions;
        }
      } else {
        delete action.snippetDescription.substitutions;
      }
      break;

    case "wrapWithSnippet":
      if (action.snippetDescription.type === "custom") {
        action.snippetDescription.body = "";
      }
      break;

    case "executeCommand":
      delete action.options?.commandArgs;
      break;

    case "addSelection":
    case "addSelectionAfter":
    case "addSelectionBefore":
    case "breakLine":
    case "callAsFunction":
    case "clearAndSetSelection":
    case "copyToClipboard":
    case "cutToClipboard":
    case "decrement":
    case "deselect":
    case "editNew":
    case "editNewLineAfter":
    case "editNewLineBefore":
    case "experimental.setInstanceReference":
    case "extractVariable":
    case "findInDocument":
    case "findInWorkspace":
    case "flashTargets":
    case "foldRegion":
    case "followLink":
    case "followLinkAside":
    case "generateSnippet":
    case "getText":
    case "highlight":
    case "increment":
    case "indentLine":
    case "insertCopyAfter":
    case "insertCopyBefore":
    case "insertEmptyLineAfter":
    case "insertEmptyLineBefore":
    case "insertEmptyLinesAround":
    case "joinLines":
    case "moveToTarget":
    case "outdentLine":
    case "parsed":
    case "pasteFromClipboard":
    case "private.getTargets":
    case "private.setKeyboardTarget":
    case "private.showParseTree":
    case "randomizeTargets":
    case "remove":
    case "rename":
    case "replaceWithTarget":
    case "revealDefinition":
    case "revealTypeDefinition":
    case "reverseTargets":
    case "rewrapWithPairedDelimiter":
    case "scrollToBottom":
    case "scrollToCenter":
    case "scrollToTop":
    case "setSelection":
    case "setSelectionAfter":
    case "setSelectionBefore":
    case "showDebugHover":
    case "showHover":
    case "showQuickFix":
    case "showReferences":
    case "sortTargets":
    case "swapTargets":
    case "toggleLineBreakpoint":
    case "toggleLineComment":
    case "unfoldRegion":
    case "wrapWithPairedDelimiter":
      break;

    default: {
      // Ensure we don't miss any new actions
      const _exhaustiveCheck: never = action;
    }
  }
}

function getMonthDate(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}`;
}

function getDayDate(date: Date): string {
  return `${getMonthDate(date)}-${pad(date.getDate())}`;
}

function pad(num: number): string {
  return num.toString().padStart(2, "0");
}
