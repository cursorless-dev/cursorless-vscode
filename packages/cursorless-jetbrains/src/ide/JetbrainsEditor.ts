import type { Selection } from "@cursorless/common";
import {
  selectionsEqual,
  type BreakpointDescriptor,
  type Edit,
  type EditableTextEditor,
  type InMemoryTextDocument,
  type OpenLinkOptions,
  type Range,
  type RevealLineAt,
  type SetSelectionsOpts,
  type TextEditor,
  type TextEditorOptions,
} from "@cursorless/common";
import { setSelections } from "./setSelections";
import type { JetbrainsIDE } from "./JetbrainsIDE";
import { jetbrainsPerformEdits } from "./jetbrainsPerformEdits";
import type { JetbrainsClient } from "./JetbrainsClient";
import { JetbrainsEditorCommand } from "./JetbrainsEditorCommand";

export class JetbrainsEditor implements EditableTextEditor {
  options: TextEditorOptions = {
    tabSize: 4,
    insertSpaces: true,
  };

  isActive = true;
  isVisible = true;
  isEditable = true;

  constructor(
    private client: JetbrainsClient,
    private ide: JetbrainsIDE,
    public id: string,
    public document: InMemoryTextDocument,
    public visibleRanges: Range[],
    public selections: Selection[],
  ) {}

  isEqual(other: TextEditor): boolean {
    return this.id === other.id;
  }

  async setSelections(
    selections: Selection[],
    _opts?: SetSelectionsOpts,
  ): Promise<void> {
    // console.log("editor.setSelections");
    if (!selectionsEqual(this.selections, selections)) {
      await setSelections(this.client, this.document, this.id, selections);
      this.selections = selections;
    }
  }

  edit(edits: Edit[]): Promise<boolean> {
    // console.log("editor.edit");
    jetbrainsPerformEdits(this.client, this.ide, this.document, this.id, edits);
    return Promise.resolve(true);
  }

  async clipboardCopy(ranges: Range[]): Promise<void> {
    await this.ide.clipboard.copy(this.id, ranges);
  }

  async clipboardPaste(): Promise<void> {
    await this.ide.clipboard.paste(this.id);
  }

  async indentLine(ranges: Range[]): Promise<void> {
    const command = new JetbrainsEditorCommand(
      ranges ? ranges : [],
      true,
      true,
      "EditorIndentSelection",
    );
    await this.client.executeRangeCommand(this.id, JSON.stringify(command));
  }

  async outdentLine(ranges: Range[]): Promise<void> {
    const command = new JetbrainsEditorCommand(
      ranges ? ranges : [],
      true,
      true,
      "EditorUnindentSelection",
    );
    await this.client.executeRangeCommand(this.id, JSON.stringify(command));
  }

  async insertLineAfter(ranges?: Range[]): Promise<void> {
    await this.client.insertLineAfter(this.id, JSON.stringify(ranges));
  }

  focus(): Promise<void> {
    throw new Error("focus not implemented.");
  }

  revealRange(_range: Range): Promise<void> {
    return Promise.resolve();
  }

  async revealLine(lineNumber: number, at: RevealLineAt): Promise<void> {
    await this.client.revealLine(this.id, lineNumber, at);
  }

  openLink(
    _range: Range,
    _options?: OpenLinkOptions | undefined,
  ): Promise<void> {
    throw new Error("openLink not implemented.");
  }

  async fold(ranges?: Range[] | undefined): Promise<void> {
    const command = new JetbrainsEditorCommand(
      ranges ? ranges : [],
      true,
      false,
      "CollapseRegion",
    );
    await this.client.executeRangeCommand(this.id, JSON.stringify(command));
  }

  async unfold(ranges?: Range[] | undefined): Promise<void> {
    const command = new JetbrainsEditorCommand(
      ranges ? ranges : [],
      true,
      false,
      "ExpandRegion",
    );
    await this.client.executeRangeCommand(this.id, JSON.stringify(command));
  }

  async toggleBreakpoint(
    _descriptors?: BreakpointDescriptor[] | undefined,
  ): Promise<void> {
    throw new Error("toggleBreakpoint not implemented.");
  }

  async toggleLineComment(ranges?: Range[] | undefined): Promise<void> {
    const command = new JetbrainsEditorCommand(
      ranges ? ranges : [],
      true,
      false,
      "CommentByLineComment",
    );
    await this.client.executeRangeCommand(this.id, JSON.stringify(command));
  }

  insertSnippet(
    _snippet: string,
    _ranges?: Range[] | undefined,
  ): Promise<void> {
    throw new Error("insertSnippet not implemented.");
  }

  async rename(range?: Range | undefined): Promise<void> {
    const command = new JetbrainsEditorCommand(
      range ? [range] : [],
      true,
      false,
      "RenameElement",
    );
    await this.client.executeRangeCommand(this.id, JSON.stringify(command));
  }

  async showReferences(range?: Range | undefined): Promise<void> {
    const command = new JetbrainsEditorCommand(
      range ? [range] : [],
      true,
      false,
      "FindUsages",
    );
    await this.client.executeRangeCommand(this.id, JSON.stringify(command));
  }

  async quickFix(range?: Range | undefined): Promise<void> {
    const command = new JetbrainsEditorCommand(
      range ? [range] : [],
      true,
      false,
      "ShowIntentionActions",
    );
    await this.client.executeRangeCommand(this.id, JSON.stringify(command));
  }

  async revealDefinition(range?: Range | undefined): Promise<void> {
    const command = new JetbrainsEditorCommand(
      range ? [range] : [],
      true,
      false,
      "GotoDeclaration",
    );
    await this.client.executeRangeCommand(this.id, JSON.stringify(command));
  }

  async revealTypeDefinition(range?: Range | undefined): Promise<void> {
    const command = new JetbrainsEditorCommand(
      range ? [range] : [],
      true,
      false,
      "QuickImplementations",
    );
    await this.client.executeRangeCommand(this.id, JSON.stringify(command));
  }

  showHover(_range?: Range | undefined): Promise<void> {
    throw new Error("showHover not implemented.");
  }

  showDebugHover(_range?: Range | undefined): Promise<void> {
    throw new Error("showDebugHover not implemented.");
  }

  async extractVariable(range?: Range | undefined): Promise<void> {
    const command = new JetbrainsEditorCommand(
      range ? [range] : [],
      true,
      false,
      "IntroduceVariable",
    );
    await this.client.executeRangeCommand(this.id, JSON.stringify(command));
  }

  editNewNotebookCellAbove(): Promise<void> {
    throw new Error("editNewNotebookCellAbove not implemented.");
  }

  editNewNotebookCellBelow(): Promise<void> {
    throw new Error("editNewNotebookCellBelow not implemented.");
  }
}
