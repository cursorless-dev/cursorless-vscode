import * as vscode from "vscode";
import Position from "../../libs/common/ide/Position";
import Range from "../../libs/common/ide/Range";
import Selection from "../../libs/common/ide/Selection";
import { EndOfLine } from "../../libs/common/ide/types/ide.types";
import TextLine from "../../libs/common/ide/types/TextLine";

export function toVscodeRange(range: Range): vscode.Range {
  return new vscode.Range(
    range.start.line,
    range.start.character,
    range.end.line,
    range.end.character,
  );
}

export function fromVscodeRange(range: vscode.Range): Range {
  return new Range(
    range.start.line,
    range.start.character,
    range.end.line,
    range.end.character,
  );
}

export function toVscodeSelection(range: Selection): vscode.Selection {
  return new vscode.Selection(
    range.start.line,
    range.start.character,
    range.end.line,
    range.end.character,
  );
}

export function fromVscodeSelection(range: vscode.Selection): Selection {
  return new Selection(
    range.start.line,
    range.start.character,
    range.end.line,
    range.end.character,
  );
}

export function toVscodePosition(position: Position): vscode.Position {
  return new vscode.Position(position.line, position.character);
}

export function fromVscodePosition(position: vscode.Position): Position {
  return new Position(position.line, position.character);
}

export function toVscodeTextLine(line: TextLine): vscode.TextLine {
  return {
    ...line,
    range: toVscodeRange(line.range),
    rangeIncludingLineBreak: toVscodeRange(line.rangeIncludingLineBreak),
  };
}

export function fromVscodeTextLine(line: vscode.TextLine): TextLine {
  return {
    ...line,
    range: fromVscodeRange(line.range),
    rangeIncludingLineBreak: fromVscodeRange(line.rangeIncludingLineBreak),
  };
}

export function toVscodeEndOfLine(eol: EndOfLine): vscode.EndOfLine {
  return eol === "LF" ? vscode.EndOfLine.LF : vscode.EndOfLine.CRLF;
}

export function fromVscodeAndOfLine(eol: vscode.EndOfLine): EndOfLine {
  return eol === vscode.EndOfLine.LF ? "LF" : "CRLF";
}
