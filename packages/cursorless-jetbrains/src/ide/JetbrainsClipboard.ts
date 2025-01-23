import type { Clipboard, Range } from "@cursorless/common";
import type { JetbrainsClient } from "./JetbrainsClient";

export class JetbrainsClipboard implements Clipboard {
  constructor(private client: JetbrainsClient) {}

  async readText(): Promise<string> {
    return "";
  }

  async writeText(_value: string): Promise<void> {
    return;
  }

  async copy(editorId: string, ranges: Range[]): Promise<void> {
    const rangesJson = JSON.stringify(ranges);
    this.client.clipboardCopy(editorId, rangesJson);
  }

  async paste(editorId: string): Promise<void> {
    this.client.clipboardPaste(editorId);
  }
}
