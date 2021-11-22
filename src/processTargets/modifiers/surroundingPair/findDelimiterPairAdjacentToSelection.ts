import { getDelimiterPair } from "./getDelimiterPair";
import {
  SurroundingPairOffsets,
  Offsets,
  PossibleDelimiterOccurrence,
  DelimiterOccurrence,
} from "./types";
import { findOppositeDelimiter } from "./findOppositeDelimiter";

export function findDelimiterPairAdjacentToSelection(
  initialIndex: number,
  delimiterOccurrences: PossibleDelimiterOccurrence[],
  selectionOffsets: Offsets,
  bailOnUnmatchedAdjacent: boolean = false
): SurroundingPairOffsets | null {
  const indicesToTry = [initialIndex + 1, initialIndex];

  for (const index of indicesToTry) {
    const delimiterOccurrence = delimiterOccurrences[index];

    if (
      delimiterOccurrence != null &&
      delimiterOccurrence.offsets.start <= selectionOffsets.start &&
      delimiterOccurrence.offsets.end >= selectionOffsets.end
    ) {
      const { delimiterInfo } = delimiterOccurrence;

      if (delimiterInfo != null) {
        const possibleMatch = findOppositeDelimiter(
          delimiterOccurrences,
          index,
          delimiterInfo
        );

        if (possibleMatch != null) {
          return getDelimiterPair(
            delimiterOccurrence as DelimiterOccurrence,
            possibleMatch
          );
        } else if (bailOnUnmatchedAdjacent) {
          return null;
        }
      }
    }
  }

  return null;
}
