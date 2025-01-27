export interface JetbrainsClient {
  prePhraseVersion(): string | PromiseLike<string | null> | null;
  clipboardCopy(editorId: string, rangesJson: string): void;
  clipboardPaste(editorId: string): void;
  hatsUpdated(hatsJson: string): void;
  documentUpdated(editorId: string, updateJson: string): void;
  setSelection(editorId: string, selectionJson: string): void;
  executeCommand(editorId: string, command: string, jsonArgs: string): string;
  executeRangeCommand(editorId: string, commandJson: string): string;
  insertLineAfter(editorId: string, rangesJson: string): void;
  revealLine(editorId: string, line: number, revealAt: string): void;
  readQuery(filename: string): string | undefined;
  flashRanges(flashRangesJson: string): string | undefined;
}
