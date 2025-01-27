import type { Range, TextDocument, TreeSitter } from "@cursorless/common";
import type { Language, SyntaxNode, Tree } from "web-tree-sitter";
import Parser from "web-tree-sitter";
import { pathJoin } from "./pathJoin";

export class JetbrainsTreeSitter implements TreeSitter {
  constructor(private wasmDirectory: string) {}

  parsers = new Map<string, Parser>();

  getTree(document: TextDocument): Tree {
    if (this.getLanguage(document.languageId)) {
      const parser = this.parsers.get(document.languageId);
      if (parser) {
        return parser.parse(document.getText());
      }
    }
    throw new Error("Language not supported");
  }

  async loadLanguage(languageId: string): Promise<boolean> {
    // console.log(`Loading language ${languageId}`);
    const parser = new Parser();
    const filePath = pathJoin(
      this.wasmDirectory,
      `tree-sitter-${languageId}.wasm`,
    );
    const language = await Parser.Language.load(filePath);
    parser.setLanguage(language);
    this.parsers.set(languageId, parser);
    return true;
  }

  getLanguage(languageId: string): Language | undefined {
    return this.parsers.get(languageId)?.getLanguage();
  }

  getNodeAtLocation(document: TextDocument, range: Range): SyntaxNode {
    const tree = this.getTree(document);
    const node = tree.rootNode.descendantForPosition(
      {
        row: range.start.line,
        column: range.start.character,
      },
      {
        row: range.end.line,
        column: range.end.character,
      },
    );
    return node;
  }
}
