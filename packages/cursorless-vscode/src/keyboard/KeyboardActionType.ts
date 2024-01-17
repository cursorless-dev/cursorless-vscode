import { ActionType } from "@cursorless/common";

// This file contains types defining the allowable identifiers for actions in
// user keyboard config settings. It is a modified version of the default action
// identifiers from @cursorless/common, with the addition of the "wrap" action
// that is designed to function like the "wrap" spoken form (ie use the same spoken
// form for both snippet and delimiter wrapping).

const extraKeyboardActionNames = ["wrap"] as const;
const excludedKeyboardActionNames = [
  "wrapWithPairedDelimiter",
  "wrapWithSnippet",
] as const;
const complexKeyboardActionTypes = ["wrap"] as const;

type ExtraKeyboardActionType = (typeof extraKeyboardActionNames)[number];
type ExcludedKeyboardActionType = (typeof excludedKeyboardActionNames)[number];
type ComplexKeyboardActionType = (typeof complexKeyboardActionTypes)[number];
export type SimpleKeyboardActionType = Exclude<
  KeyboardActionDescriptor,
  ComplexKeyboardActionType
>;

export type KeyboardActionDescriptor =
  | KeyboardActionType
  | {
      actionId: KeyboardActionType;
      exitCursorlessMode?: boolean;
    };

export type KeyboardActionType =
  | Exclude<ActionType, ExcludedKeyboardActionType>
  | ExtraKeyboardActionType;
