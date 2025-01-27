import { InMemoryTextDocument, Notifier, Range } from "@cursorless/common";
import type {
  Event,
  FlashDescriptor,
  GeneralizedRange,
  QuickPickOptions,
  TextDocument,
  TextDocumentContentChangeEvent,
  TextEditorSelectionChangeEvent,
  TextEditorVisibleRangesChangeEvent,
  Disposable,
  EditableTextEditor,
  IDE,
  OpenUntitledTextDocumentOptions,
  RunMode,
  TextDocumentChangeEvent,
  TextEditor,
  WorkspaceFolder,
  NotebookEditor,
} from "@cursorless/common";
import { pull } from "lodash-es";
import { JetbrainsCapabilities } from "./JetbrainsCapabilities";
import { fromJetbrainsContentChange } from "./JetbrainsEvents";

import type { JetbrainsClient } from "./JetbrainsClient";
import { JetbrainsClipboard } from "./JetbrainsClipboard";
import type { JetbrainsConfiguration } from "./JetbrainsConfiguration";
import { JetbrainsMessages } from "./JetbrainsMessages";
import { JetbrainsKeyValueStore } from "./JetbrainsKeyValueStore";
import type { EditorState } from "../types/types";
import { createSelection, createTextEditor } from "./createTextEditor";
import { JetbrainsEditor } from "./JetbrainsEditor";
import type { JetbrainsFlashDescriptor } from "./JetbrainsFlashDescriptor";

export class JetbrainsIDE implements IDE {
  readonly configuration: JetbrainsConfiguration;
  readonly keyValueStore: JetbrainsKeyValueStore;
  readonly messages: JetbrainsMessages;
  readonly clipboard: JetbrainsClipboard;
  readonly capabilities: JetbrainsCapabilities;
  readonly runMode: RunMode = "production";
  readonly visibleNotebookEditors: NotebookEditor[] = [];
  //   private editorMap;
  //   private documentMap;
  private activeProject: Window | undefined;
  private activeEditor: JetbrainsEditor | undefined;

  private disposables: Disposable[] = [];
  private assetsRoot_: string | undefined;
  private cursorlessJetbrainsPath: string | undefined;
  private quickPickReturnValue: string | undefined = undefined;

  private editors: Map<string, JetbrainsEditor> = new Map<
    string,
    JetbrainsEditor
  >();

  private onDidChangeTextDocumentNotifier: Notifier<[TextDocumentChangeEvent]> =
    new Notifier();
  private onDidOpenTextDocumentNotifier: Notifier<[TextDocument]> =
    new Notifier();

  private onDidChangeTextDocumentContentNotifier: Notifier<
    [TextDocumentContentChangeEvent]
  > = new Notifier();

  constructor(
    private client: JetbrainsClient,
    configuration: JetbrainsConfiguration,
  ) {
    this.configuration = configuration;
    this.keyValueStore = new JetbrainsKeyValueStore();
    this.messages = new JetbrainsMessages();
    this.clipboard = new JetbrainsClipboard(this.client);
    this.capabilities = new JetbrainsCapabilities();
    //     this.editorMap = new Map<Window, JetbrainsTextEditorImpl>();
    //     this.documentMap = new Map<Buffer, JetbrainsTextDocumentImpl>();
    this.activeProject = undefined;
    this.activeEditor = undefined;
  }

  async init() {}

  async showQuickPick(
    _items: readonly string[],
    _options?: QuickPickOptions,
  ): Promise<string | undefined> {
    throw Error("showQuickPick Not implemented");
  }

  async setHighlightRanges(
    _highlightId: string | undefined,
    _editor: TextEditor,
    _ranges: GeneralizedRange[],
  ): Promise<void> {
    throw Error("setHighlightRanges Not implemented");
  }

  async flashRanges(flashDescriptors: FlashDescriptor[]): Promise<void> {
    console.log("flashRangeses");
    const jbfs = flashDescriptors.map((flashDescriptor) => {
      const jbf: JetbrainsFlashDescriptor = {
        editorId: flashDescriptor.editor.id,
        range: flashDescriptor.range,
        style: flashDescriptor.style,
      };
      return jbf;
    });
    this.client.flashRanges(JSON.stringify(jbfs));
  }

  get assetsRoot(): string {
    console.log("get assetsRoot");
    throw new Error("assetsRoot not implemented.");
  }

  get cursorlessVersion(): string {
    console.log("get cursorlessVersion");
    throw new Error("cursorlessVersion not implemented.");
  }

  get workspaceFolders(): readonly WorkspaceFolder[] | undefined {
    console.log("get workspaceFolders");
    throw new Error("workspaceFolders not get implemented.");
  }

  get activeTextEditor(): TextEditor | undefined {
    // console.log("get activeTextEditor");
    return this.activeEditor;
  }

  get activeEditableTextEditor(): EditableTextEditor | undefined {
    // console.log("get activeEditableTextEditor");
    return this.activeEditor?.isEditable ? this.activeEditor : undefined;
  }

  get visibleTextEditors(): TextEditor[] {
    // console.log("get visibleTextEditors");
    return [...this.editors.values()].filter((editor) => editor.isVisible);
  }

  getEditableTextEditor(editor: TextEditor): EditableTextEditor  {
    // console.log("getEditableTextEditor");
    if (editor instanceof JetbrainsEditor) {
      // console.log("getEditableTextEditor - return current");
      if (editor.isEditable) {
        return editor;
      } else {
        throw Error(`Editor is not editable: ${editor}`);
      }
    }
    throw Error(`Unsupported text editor type: ${editor}`);
  }

  public async findInDocument(
    _query: string,
    _editor: TextEditor,
  ): Promise<void> {
    throw Error("findInDocument Not implemented");
  }

  public async findInWorkspace(_query: string): Promise<void> {
    throw Error("findInWorkspace Not implemented");
  }

  public async openTextDocument(_path: string): Promise<TextEditor> {
    throw Error("openTextDocument Not implemented");
  }

  public async openUntitledTextDocument(
    _options: OpenUntitledTextDocumentOptions,
  ): Promise<TextEditor> {
    throw Error("openUntitledTextDocument Not implemented");
  }

  public async showInputBox(_options?: any): Promise<string | undefined> {
    throw Error("showInputBox Not implemented");
  }

  public async executeCommand<T>(
    _command: string,
    ..._args: any[]
  ): Promise<T | undefined> {
    throw new Error("executeCommand Method not implemented.");
  }

  public onDidChangeTextDocument(
    listener: (event: TextDocumentChangeEvent) => void,
  ): Disposable {
    return this.onDidChangeTextDocumentNotifier.registerListener(listener);
  }

  public onDidOpenTextDocument(
    listener: (event: TextDocument) => any,
    _thisArgs?: any,
    _disposables?: Disposable[] | undefined,
  ): Disposable {
    return this.onDidOpenTextDocumentNotifier.registerListener(listener);
  }
  onDidCloseTextDocument: Event<TextDocument> = dummyEvent;
  onDidChangeActiveTextEditor: Event<TextEditor | undefined> = dummyEvent;
  onDidChangeVisibleTextEditors: Event<TextEditor[]> = dummyEvent;
  onDidChangeTextEditorSelection: Event<TextEditorSelectionChangeEvent> =
    dummyEvent;
  onDidChangeTextEditorVisibleRanges: Event<TextEditorVisibleRangesChangeEvent> =
    dummyEvent;

  handleCommandError(_err: Error) {
    // if (err instanceof OutdatedExtensionError) {
    //   this.showUpdateExtensionErrorMessage(err);
    // } else {
    //     void showErrorMessage(this.client, err.message);
    // }
  }

  disposeOnExit(...disposables: Disposable[]): () => void {
    this.disposables.push(...disposables);

    return () => pull(this.disposables, ...disposables);
  }

  public documentClosed(editorId: string) {
    this.editors.delete(editorId);
    // console.log(
    //   "removed editor " +
    //     editorId +
    //     "remaining after change: " +
    //     this.editors.size,
    // );
  }

  public documentCreated(editorStateJson: any) {
    this.documentChanged(editorStateJson);
    const editorState = editorStateJson as EditorState;
    const editor = this.editors.get(editorState.id);
    if (editor) {
      this.onDidOpenTextDocumentNotifier.notifyListeners(editor.document);
    }
  }

  public documentChanged(editorStateJson: any) {
    // console.log(
    //   "ASOEE/CL: documentChanged : " + JSON.stringify(editorStateJson),
    // );
    const editorState = editorStateJson as EditorState;

    const editor = this.updateTextEditors(editorState);

    const linedata = getLines(
      editorState.text,
      editorState.firstVisibleLine,
      editorState.lastVisibleLine,
    );
    const contentChangeEvents = fromJetbrainsContentChange(
      editor.document,
      editorState.firstVisibleLine,
      editorState.lastVisibleLine,
      linedata,
    );
    const documentChangeEvent: TextDocumentChangeEvent = {
      document: editor.document,
      contentChanges: contentChangeEvents,
    };
    // console.log("ASOEE/CL: documentChanged : notify...");
    this.emitDidChangeTextDocument(documentChangeEvent);
    // console.log("ASOEE/CL: documentChanged : notify complete");
  }

  emitDidChangeTextDocument(event: TextDocumentChangeEvent) {
    this.onDidChangeTextDocumentNotifier.notifyListeners(event);
  }

  updateTextEditors(editorState: EditorState): JetbrainsEditor {
    let editor = this.editors.get(editorState.id);
    if (editor) {
      updateEditor(editor, editorState);
    } else {
      editor = createTextEditor(this.client, this, editorState);
      this.editors.set(editorState.id, editor);
    }
    if (editorState.active) {
      this.activeEditor = editor;
    }
    return editor;
  }

  readQuery(filename: string): string | undefined {
    return this.client.readQuery(filename);
  }
}

function updateEditor(editor: JetbrainsEditor, editorState: EditorState) {
  // console.log("Updating editor " + editorState.id);
  const oldDocument = editor.document;
  editor.document = new InMemoryTextDocument(
    oldDocument.uri,
    oldDocument.languageId,
    editorState.text,
  );
  editor.visibleRanges = [
    new Range(
      editorState.firstVisibleLine,
      0,
      editorState.lastVisibleLine + 1,
      0,
    ),
  ];
  editor.selections = editorState.selections.map((selection) =>
    createSelection(editor.document, selection),
  );
  editor.isActive = editorState.active;
  editor.isVisible = editorState.visible;
  editor.isEditable = editorState.editable;
}

function getLines(text: string, firstLine: number, lastLine: number) {
  const lines = text.split("\n");
  return lines.slice(firstLine, lastLine);
}

function dummyEvent() {
  return {
    dispose() {
      // empty
    },
  };
}

export function createIDE(
  client: JetbrainsClient,
  configuration: JetbrainsConfiguration,
) {
  return new JetbrainsIDE(client, configuration);
}
