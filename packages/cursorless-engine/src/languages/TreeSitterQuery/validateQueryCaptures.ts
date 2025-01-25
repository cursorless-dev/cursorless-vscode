import { showError, simpleScopeTypeTypes } from "@cursorless/common";
import { ide } from "../../singletons/ide.singleton";

const wildcard = "_";
const captureNames = [wildcard, ...simpleScopeTypeTypes];

const positionRelationships = ["prefix", "leading", "trailing"];
const positionSuffixes = ["startOf", "endOf"];

const rangeRelationships = [
  "domain",
  "removal",
  "interior",
  "iteration",
  "iteration.domain",
];
const rangeSuffixes = [
  "start",
  "end",
  "start.startOf",
  "start.endOf",
  "end.startOf",
  "end.endOf",
];

const allowedCaptures = new Set<string>();

for (const captureName of captureNames) {
  // Wildcard is not allowed by itself without a relationship
  if (captureName !== wildcard) {
    // eg: statement
    allowedCaptures.add(captureName);

    // eg: statement.start | statement.start.endOf
    for (const suffix of rangeSuffixes) {
      allowedCaptures.add(`${captureName}.${suffix}`);
    }
  }

  for (const relationship of positionRelationships) {
    // eg: statement.leading
    allowedCaptures.add(`${captureName}.${relationship}`);

    for (const suffix of positionSuffixes) {
      // eg: statement.leading.endOf
      allowedCaptures.add(`${captureName}.${relationship}.${suffix}`);
    }
  }

  for (const relationship of rangeRelationships) {
    // eg: statement.domain
    allowedCaptures.add(`${captureName}.${relationship}`);

    for (const suffix of rangeSuffixes) {
      // eg: statement.domain.start | statement.domain.start.endOf
      allowedCaptures.add(`${captureName}.${relationship}.${suffix}`);
    }
  }
}

// Not a comment. ie line is not starting with `;;`
// Not a string.
// Capture starts with `@` and is followed by words and/or dots
const capturePattern = /^(?!;;).*(?<!"\w*)@([\w.]*)/gm;

export function validateQueryCaptures(file: string, rawQuery: string): void {
  const matches = rawQuery.matchAll(capturePattern);

  const errors: string[] = [];

  for (const match of matches) {
    const captureName = match[1];

    if (
      captureName.length > 1 &&
      !captureName.includes(".") &&
      captureName.startsWith("_")
    ) {
      // Allow @_foo dummy captures to use for referring to in query predicates
      continue;
    }

    if (!allowedCaptures.has(captureName)) {
      const lineNumber = match.input.slice(0, match.index).split("\n").length;
      errors.push(`${file}(${lineNumber}) invalid capture '@${captureName}'.`);
    }
  }

  if (errors.length === 0) {
    return;
  }

  const message = errors.join("\n");

  void showError(
    ide().messages,
    "validateQueryCaptures.invalidCaptureName",
    message,
  );

  if (ide().runMode === "test") {
    throw new Error(message);
  }
}
