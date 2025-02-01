import { HatStability } from "@cursorless/common";
import { getCursorlessApi, openNewEditor } from "@cursorless/vscode-common";
import * as assert from "assert";
import { endToEndTestSetup } from "../endToEndTestSetup";
import { runCursorlessCommand } from "@cursorless/vscode-common";
import { setupFake } from "./setupFake";

suite("Wrap with snippet across split", async function () {
  endToEndTestSetup(this);

  suiteSetup(async () => {
    const { ide } = (await getCursorlessApi()).testHelpers!;
    setupFake(ide, HatStability.stable);
  });

  test("Wrap with snippet across split", runTest);
});

async function runTest() {
  const { hatTokenMap } = (await getCursorlessApi()).testHelpers!;

  const { document: document1 } = await openNewEditor("hello world");
  const { document: document2 } = await openNewEditor("", { openBeside: true });

  await hatTokenMap.allocateHats();

  await runCursorlessCommand({
    version: 7,
    action: {
      name: "wrapWithSnippet",
      snippetDescription: {
        type: "custom",
        body: "My friend $foo likes to eat spaghetti!",
        variableName: "foo",
      },
      target: {
        type: "primitive",
        mark: {
          type: "decoratedSymbol",
          symbolColor: "default",
          character: "h",
        },
      },
    },
    usePrePhraseSnapshot: false,
  });

  assert.deepStrictEqual(
    document1.getText(),
    "My friend hello likes to eat spaghetti! world",
  );
  assert.deepStrictEqual(document2.getText(), "");
}
