import type { Range, TextDocument, TextEditor } from "@cursorless/common";
import type { Target } from "../../../../typings/target.types";
import { shrinkRangeToFitContent } from "../../../../util/selectionUtils";
import { DocumentTarget } from "../../DocumentTarget";
import { LineTarget } from "../../LineTarget";
import { ParagraphTarget } from "../../ParagraphTarget";
import { TokenTarget } from "../../TokenTarget";
import { union } from "../../../../util/rangeUtils";

export function getSmartRemovalTarget(target: Target): Target {
  const { editor, isReversed } = target;
  const { document } = editor;
  const contentRange = union(target.contentRange, target.prefixRange);

  if (!isLine(document, contentRange)) {
    return new TokenTarget({
      editor,
      isReversed,
      contentRange: contentRange,
    });
  }

  if (isDocument(editor, contentRange)) {
    return new DocumentTarget({
      editor,
      isReversed,
      contentRange: document.range,
    });
  }

  if (isParagraph(document, contentRange)) {
    return new ParagraphTarget({
      editor,
      isReversed,
      contentRange: contentRange,
    });
  }

  return new LineTarget({
    editor,
    isReversed,
    contentRange: contentRange,
  });
}

function isLine(document: TextDocument, contentRange: Range): boolean {
  const start = document.lineAt(contentRange.start).rangeTrimmed?.start;
  const end = document.lineAt(contentRange.end).rangeTrimmed?.end;
  return (
    start != null &&
    end != null &&
    start.isEqual(contentRange.start) &&
    end.isEqual(contentRange.end)
  );
}

function isParagraph(document: TextDocument, contentRange: Range): boolean {
  const { start, end } = contentRange;
  return (
    (start.line === 0 || document.lineAt(start.line - 1).isEmptyOrWhitespace) &&
    (end.line === document.lineCount - 1 ||
      document.lineAt(end.line + 1).isEmptyOrWhitespace)
  );
}

function isDocument(editor: TextEditor, contentRange: Range): boolean {
  const documentContentRange = shrinkRangeToFitContent(
    editor,
    editor.document.range,
  );
  return documentContentRange.isRangeEqual(contentRange);
}
