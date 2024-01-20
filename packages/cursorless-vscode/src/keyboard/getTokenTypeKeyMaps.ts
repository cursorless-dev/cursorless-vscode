import { isString, range } from "lodash";
import {
  KeyboardActionType,
  PolymorphicKeyboardActionDescriptor,
  SpecificKeyboardActionDescriptor,
  simpleKeyboardActionNames,
} from "./KeyboardActionType";
import { KeyboardConfig, only } from "./KeyboardConfig";
import { TokenTypeKeyMapMap } from "./TokenTypeHelpers";

/**
 * Returns a map from token type names to a keymap for that token type. Something like:
 *
 * ```ts
 * {
 *   action: {
 *     "c": {
 *       type: "action",
 *       value: "clearAndSetSelection",
 *     },
 *     "t": {
 *       type: "action",
 *       value: "setSelection",
 *     },
 *   },
 *   makeRange: {
 *     "r": {
 *       type: "makeRange",
 *     },
 *   },
 *   ...
 * }
 * ```
 * @returns A map from token type names to a keymap for that token type.
 */
export function getTokenTypeKeyMaps(
  config: KeyboardConfig,
): TokenTypeKeyMapMap {
  return {
    simpleScopeTypeType: config.getTokenKeyMap("simpleScopeTypeType", "scope"),
    color: config.getTokenKeyMap("color"),
    shape: config.getTokenKeyMap("shape"),
    vscodeCommand: config.getTokenKeyMap("vscodeCommand"),
    pairedDelimiter: config.getTokenKeyMap("pairedDelimiter"),

    // action config section
    simpleAction: config.getTokenKeyMap("simpleAction", "action", (value) =>
      transformActionDescriptor(value, simpleKeyboardActionNames),
    ),
    wrap: config.getTokenKeyMap("wrap", "action", (value) =>
      transformActionDescriptor(value, ["wrap"]),
    ),

    // misc config section
    makeRange: config.getTokenKeyMap("makeRange", "misc", only("makeRange")),
    makeList: config.getTokenKeyMap("makeList", "misc", only("makeList")),
    combineColorAndShape: config.getTokenKeyMap(
      "combineColorAndShape",
      "misc",
      only("combineColorAndShape"),
    ),
    direction: config.getTokenKeyMap(
      "direction",
      "misc",
      only("forward", "backward"),
    ),

    // modifier config section
    every: config.getTokenKeyMap("every", "modifier", only("every")),
    nextPrev: config.getTokenKeyMap("nextPrev", "modifier", only("nextPrev")),

    digit: Object.fromEntries(
      range(10).map((value) => [
        value.toString(),
        {
          type: "digit" as const,
          value,
        },
      ]),
    ),
  };
}

/**
 * Given an action config entry, returns a fully specified action descriptor, or
 * undefined if the action name is not included in {@link actionNames}.
 *
 * @param value The action descriptor to transform, or reject
 * @param actionNames The names of the actions to accept
 * @returns A fully specified action descriptor, or undefined if the action name
 * is not included in {@link actionNames}
 */
function transformActionDescriptor<T extends KeyboardActionType>(
  value: PolymorphicKeyboardActionDescriptor,
  actionNames: T[],
): SpecificKeyboardActionDescriptor<T> | undefined {
  if (isString(value)) {
    return isIncluded(value, actionNames)
      ? {
          actionId: value,
          exitCursorlessMode: false,
        }
      : undefined;
  }

  return isIncluded(value.actionId, actionNames)
    ? (value as SpecificKeyboardActionDescriptor<T>)
    : undefined;
}

function isIncluded<T extends string>(value: string, values: T[]): value is T {
  return values.includes(value as T);
}
