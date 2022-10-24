import { escapeRegExp } from "lodash";
import * as vscode from "vscode";
import { matchAll } from "../util/regex";
import { LanguageTokenizerComponents } from "./tokenizer.types";

const REPEATABLE_SYMBOLS = [
  "-",
  "+",
  "*",
  "/",
  "=",
  "<",
  ">",
  "_",
  "#",
  ".",
  "|",
  "&",
  ":",
];

const FIXED_TOKENS = [
  "!==",
  "!=",
  "+=",
  "-=",
  "*=",
  "/=",
  "%=",
  "<=",
  ">=",
  "=>",
  "->",
  "??",
  '"""',
  "```",
  "/*",
  "*/",
  "<!--",
  "-->",
];

export const IDENTIFIER_WORD_REGEXES = ["\\p{L}", "\\p{M}", "\\p{N}"];
const SINGLE_SYMBOLS_REGEX = "[^\\s\\w]";
const NUMBERS_REGEX = "(?<=[^.\\d]|^)\\d+\\.\\d+(?=[^.\\d]|$)"; // (not-dot/digit digits dot digits not-dot/digit)

interface Matcher {
  tokenMatcher: RegExp;
  identifierMatcher: RegExp;
  wordMatcher: RegExp;
}

function generateMatcher(
  languageComponents: LanguageTokenizerComponents
): Matcher {
  const {
    fixedTokens,
    repeatableSymbols,
    identifierWordRegexes,
    identifierWordDelimiters,
    numbersRegex,
    singleSymbolsRegex,
  } = languageComponents;

  const repeatableSymbolsRegex = repeatableSymbols
    .map(escapeRegExp)
    .map((s) => `${s}+`)
    .join("|");

  const fixedTokensRegex = fixedTokens.map(escapeRegExp).join("|");

  const identifierComponents = identifierWordRegexes.concat(
    identifierWordDelimiters.map(escapeRegExp)
  );
  const identifiersRegex = `(${identifierComponents.join("|")})+`;
  const wordRegex = `(${identifierWordRegexes.join("|")})+`;

  // Order matters here.
  const regex = [
    fixedTokensRegex,
    numbersRegex,
    identifiersRegex,
    repeatableSymbolsRegex,
    singleSymbolsRegex,
  ].join("|");

  return {
    identifierMatcher: new RegExp(identifiersRegex, "gu"),
    wordMatcher: new RegExp(wordRegex, "gu"),
    tokenMatcher: new RegExp(regex, "gu"),
  };
}

const matchers = new Map<string[], Matcher>();

export function getMatcher(languageId: string): Matcher {
  const wordSeparators = vscode.workspace
    .getConfiguration("cursorless", { languageId })
    .get<string[]>("wordSeparators", ["_"]);

  if (!matchers.has(wordSeparators)) {
    const components: LanguageTokenizerComponents = {
      fixedTokens: FIXED_TOKENS,
      repeatableSymbols: REPEATABLE_SYMBOLS,
      identifierWordRegexes: IDENTIFIER_WORD_REGEXES,
      identifierWordDelimiters: wordSeparators,
      numbersRegex: NUMBERS_REGEX,
      singleSymbolsRegex: SINGLE_SYMBOLS_REGEX,
    };
    matchers.set(wordSeparators, generateMatcher(components));
  }

  return matchers.get(wordSeparators)!;
}

export function tokenize<T>(
  text: string,
  languageId: string,
  mapfn: (v: RegExpMatchArray, k: number) => T
) {
  return matchAll(text, getMatcher(languageId).tokenMatcher, mapfn);
}
