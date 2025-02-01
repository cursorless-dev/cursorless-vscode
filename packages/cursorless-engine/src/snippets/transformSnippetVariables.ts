import type { TextmateSnippet } from "./vendor/vscodeSnippet/snippetParser";
import {
  Placeholder,
  Text,
  Variable,
} from "./vendor/vscodeSnippet/snippetParser";
import { KnownSnippetVariableNames } from "./vendor/vscodeSnippet/snippetVariables";

/**
 * Replaces the snippet variable with name `placeholderName` with
 * TM_SELECTED_TEXT
 *
 * Also replaces any unknown variables with placeholders. We do this so it's
 * easier to leave one of the placeholders blank. We may make it so that you can
 * disable this with a setting in the future
 * @param parsedSnippet The parsed textmate snippet to operate on
 * @param placeholderName The variable name to replace with TM_SELECTED_TEXT
 * @param substitutions A map from variable names to text values that will be
 * substituted and the given variable will no longer be a placeholder in the
 * final snippet
 */
export function transformSnippetVariables(
  parsedSnippet: TextmateSnippet,
  placeholderName?: string | null,
  substitutions?: Record<string, string>,
): void {
  let nextPlaceholderIndex = getMaxPlaceholderIndex(parsedSnippet) + 1;
  const placeholderIndexMap: Record<string, number> = {};

  parsedSnippet.walk((candidate) => {
    if (candidate instanceof Variable) {
      if (candidate.name === placeholderName) {
        candidate.name = "TM_SELECTED_TEXT";
      } else if (
        substitutions != null &&
        Object.prototype.hasOwnProperty.call(substitutions, candidate.name)
      ) {
        candidate.parent.replace(candidate, [
          new Text(substitutions[candidate.name]),
        ]);
      } else if (!KnownSnippetVariableNames[candidate.name]) {
        let placeholderIndex: number;
        if (candidate.name in placeholderIndexMap) {
          placeholderIndex = placeholderIndexMap[candidate.name];
        } else {
          placeholderIndex = nextPlaceholderIndex++;
          placeholderIndexMap[candidate.name] = placeholderIndex;
        }
        const placeholder = new Placeholder(placeholderIndex);
        candidate.children.forEach((child) => placeholder.appendChild(child));
        candidate.parent.replace(candidate, [placeholder]);
      }
    } else if (candidate instanceof Placeholder) {
      if (candidate.index.toString() === placeholderName) {
        candidate.parent.replace(candidate, [new Variable("TM_SELECTED_TEXT")]);
      } else if (
        substitutions != null &&
        Object.prototype.hasOwnProperty.call(substitutions, candidate.index)
      ) {
        candidate.parent.replace(candidate, [
          new Text(substitutions[candidate.index]),
        ]);
      }
    }
    return true;
  });
}

/**
 * Returns the highest placeholder index in the given snippet
 * @param parsedSnippet The parsed textmate snippet
 * @returns The highest placeholder index in the given snippet
 */
function getMaxPlaceholderIndex(parsedSnippet: TextmateSnippet): number {
  let placeholderIndex = 0;
  parsedSnippet.walk((candidate) => {
    if (candidate instanceof Placeholder) {
      placeholderIndex = Math.max(placeholderIndex, candidate.index);
    }
    return true;
  });
  return placeholderIndex;
}
