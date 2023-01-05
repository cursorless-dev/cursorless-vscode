import { sortBy } from "lodash";
import { HatStyleMap } from "../libs/common/ide/types/Hats";
import { HatStyleName } from "../libs/common/ide/types/hatStyles.types";
import ide from "../libs/cursorless-engine/singletons/ide.singleton";
import tokenGraphemeSplitter from "../libs/cursorless-engine/singletons/tokenGraphemeSplitter.singleton";
import { Graph } from "../typings/Types";
import { computeHatRanges } from "../util/computeHatRanges";
import { IndividualHatMap } from "./IndividualHatMap";

interface Context {
  getActiveMap(): Promise<IndividualHatMap>;
}

export class HatAllocator {
  private timeoutHandle: NodeJS.Timeout | null = null;
  private disposables: Disposable[] = [];
  private sortedHatStyleNames!: HatStyleName[];

  constructor(private graph: Graph, private context: Context) {
    ide().disposeOnExit(this);

    this.addDecorationsDebounced = this.addDecorationsDebounced.bind(this);
    this.clearEditorDecorations = this.clearEditorDecorations.bind(this);

    this.disposables.push(
      ide().hats.onDidChangeAvailableHatStyles(this.handleAvailableHatStyles),
      ide().hats.onDidChangeIsActive(this.addDecorationsDebounced),

      // An event that fires when a text document opens
      ide().onDidOpenTextDocument(this.addDecorationsDebounced),
      // An event that fires when a text document closes
      ide().onDidCloseTextDocument(this.addDecorationsDebounced),
      // An Event which fires when the active editor has changed. Note that the event also fires when the active editor changes to undefined.
      ide().onDidChangeActiveTextEditor(this.addDecorationsDebounced),
      // An Event which fires when the array of visible editors has changed.
      ide().onDidChangeVisibleTextEditors(this.addDecorationsDebounced),
      // An event that is emitted when a text document is changed. This usually happens when the contents changes but also when other things like the dirty-state changes.
      ide().onDidChangeTextDocument(this.addDecorationsDebounced),
      // An Event which fires when the selection in an editor has changed.
      ide().onDidChangeTextEditorSelection(this.addDecorationsDebounced),
      // An Event which fires when the visible ranges of an editor has changed.
      ide().onDidChangeTextEditorVisibleRanges(this.addDecorationsDebounced),
      // Re-draw hats on grapheme splitting algorithm change in case they
      // changed their token hat splitting setting.
      tokenGraphemeSplitter().registerAlgorithmChangeListener(
        this.addDecorationsDebounced,
      ),
    );

    this.computeSortedHatStyleNames(ide().hats.availableHatStyles);
  }

  private handleAvailableHatStyles(availableHatStyles: HatStyleMap): void {
    this.computeSortedHatStyleNames(availableHatStyles);
    this.addDecorationsDebounced();
  }

  private computeSortedHatStyleNames(availableHatStyles: HatStyleMap): void {
    this.sortedHatStyleNames = sortBy(
      Object.entries(availableHatStyles),
      ([_, { penalty }]) => penalty,
    ).map(([hatStyleName, _]) => hatStyleName as HatStyleName);
  }

  private clearEditorDecorations(editor: vscode.TextEditor) {
    this.graph.decorations.decorations.forEach(({ decoration }) => {
      editor.setDecorations(decoration, []);
    });
  }

  async addDecorations() {
    const activeMap = await this.context.getActiveMap();

    if (ide().hats.isActive) {
      const { visibleTextEditors } = ide();

      const hatRangeDescriptors = computeHatRanges(
        tokenGraphemeSplitter(),
        this.sortedHatStyleNames,
        ide().activeTextEditor,
        visibleTextEditors,
      );

      activeMap.clear();

      const decorationRanges: Map<
        TextEditor,
        {
          [decorationName in HatStyleName]?: Range[];
        }
      > = new Map(
        visibleTextEditors.map((editor) => [
          editor,
          Object.fromEntries(
            this.sortedHatStyleNames.map((name) => [name, []]),
          ),
        ]),
      );

      hatRangeDescriptors.forEach(({ hatStyle, grapheme, token, hatRange }) => {
        activeMap.addToken(hatStyle, grapheme, token);
        decorationRanges.get(token.editor)![hatStyle]!.push(hatRange);
      });

      decorationRanges.forEach((ranges, editor) => {
        decorations.hatStyleNames.forEach((hatStyleName) => {
          ide()
            .getEditableTextEditor(editor)
            .setDecorations(
              decorations.decorationMap[hatStyleName]!,
              ranges[hatStyleName]!,
            );
        });
      });
    } else {
      vscode.window.visibleTextEditors.forEach(this.clearEditorDecorations);
      activeMap.clear();
    }
  }

  addDecorationsDebounced() {
    if (this.timeoutHandle != null) {
      clearTimeout(this.timeoutHandle);
    }

    const decorationDebounceDelayMs = ide().configuration.getOwnConfiguration(
      "decorationDebounceDelayMs",
    );

    this.timeoutHandle = setTimeout(() => {
      this.addDecorations();
      this.timeoutHandle = null;
    }, decorationDebounceDelayMs);
  }

  dispose() {
    this.disposables.forEach(({ dispose }) => dispose());

    if (this.timeoutHandle != null) {
      clearTimeout(this.timeoutHandle);
    }
  }
}
