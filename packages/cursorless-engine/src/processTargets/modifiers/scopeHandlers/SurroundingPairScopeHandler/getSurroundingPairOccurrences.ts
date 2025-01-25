import type { Range } from "@cursorless/common";
import findLastIndex from "lodash-es/findLastIndex";
import type { DelimiterOccurrence, SurroundingPairOccurrence } from "./types";

/**
 * Given a list of occurrences of delimiters, returns a list of occurrences of
 * surrounding pairs by matching opening and closing delimiters.
 *
 * @param delimiterOccurrences A list of occurrences of delimiters
 * @returns A list of occurrences of surrounding pairs
 */
export function getSurroundingPairOccurrences(
  delimiterOccurrences: DelimiterOccurrence[],
): SurroundingPairOccurrence[] {
  const result: SurroundingPairOccurrence[] = [];
  const openingDelimitersStack: DelimiterOccurrence[] = [];

  for (const occurrence of delimiterOccurrences) {
    const {
      delimiterInfo: { delimiterName, side, isSingleLine },
      textFragmentRange,
      range,
    } = occurrence;

    if (side === "left") {
      openingDelimitersStack.push(occurrence);
    } else {
      const openingDelimiterIndex = findLastIndex(
        openingDelimitersStack,
        (o) =>
          o.delimiterInfo.delimiterName === delimiterName &&
          isSameTextFragment(o.textFragmentRange, textFragmentRange) &&
          isValidLine(isSingleLine, o.range, range),
      );

      if (openingDelimiterIndex === -1) {
        // When side is unknown and we can't find an opening delimiter, that means this is the opening delimiter.
        if (side === "unknown") {
          openingDelimitersStack.push(occurrence);
        }
        continue;
      }

      const openingDelimiter = openingDelimitersStack[openingDelimiterIndex];

      // Pop stack up to and including the opening delimiter
      openingDelimitersStack.length = openingDelimiterIndex;

      result.push({
        delimiterName: delimiterName,
        openingDelimiterRange: openingDelimiter.range,
        closingDelimiterRange: range,
      });
    }
  }

  return result;
}

function isSameTextFragment(
  a: Range | undefined,
  b: Range | undefined,
): boolean {
  if (a == null || b == null) {
    return a === b;
  }
  return a.isRangeEqual(b);
}

function isValidLine(isSingleLine: boolean, a: Range, b: Range): boolean {
  return !isSingleLine || a.start.line === b.start.line;
}
