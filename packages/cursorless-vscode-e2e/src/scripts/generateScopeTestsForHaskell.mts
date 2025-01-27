import * as fs from "fs";
import * as path from "path";

const functionsWithSingleCase = [
  ["id :: a -> a", "id x = x"],
  ["const :: a -> b -> a", "const x y = x"],
  ["fst :: (a, b) -> a", "fst (x, y) = x"],
];

const functionsWithMultipleCases = [
  [
    "fib :: Integer -> Integer",
    "fib 0 = 0",
    "fib 1 = 1",
    "fib n = fib (n-1) + fib (n-2)",
  ],
  [
    "map :: (a -> b) -> [a] -> [b]",
    "map f [] = []",
    "map f (x:xs) = f x : map f xs",
  ],
  ["not :: Bool -> Bool", "not True = False", "not False = True"],
];

const nonFunctions = [
  ["type Point = (Double, Double)"],
  ["data Maybe a = Nothing | Just a"],
];

interface FunctionParameters {
  singleCase: boolean;
  signature: boolean;
}

function* functionParameterCases(): Generator<FunctionParameters, void, void> {
  for (const singleCase of [true, false]) {
    for (const signature of [true, false]) {
      yield { singleCase, signature };
    }
  }
}

type DelimiterParameters =
  | { kind: "anchor" }
  | ({ kind: "function" } & FunctionParameters)
  | { kind: "otherwise" };

const delimiterParameterCases: DelimiterParameters[] = [
  { kind: "anchor" },
  ...[...functionParameterCases()].map(
    (functionParameters: FunctionParameters): DelimiterParameters => {
      return { kind: "function", ...functionParameters };
    },
  ),
  { kind: "otherwise" },
];

interface TestParameters {
  startDelimiterParameters: DelimiterParameters;
  functionParameters: FunctionParameters;
  endDelimiterParameters: DelimiterParameters;
}

function* testParameterCases(): Generator<TestParameters, void, void> {
  for (const startDelimiterParameters of delimiterParameterCases) {
    for (const functionParameters of functionParameterCases()) {
      for (const endDelimiterParameters of delimiterParameterCases) {
        yield {
          startDelimiterParameters,
          functionParameters,
          endDelimiterParameters,
        };
      }
    }
  }
}

function renderFunction(
  [functionSignature, ...functionBody]: string[],
  { signature }: FunctionParameters,
): string {
  if (signature) {
    return [functionSignature, ...functionBody].join("\n");
  } else {
    return functionBody.join("\n");
  }
}

function* testCases(): Generator<string, void, void> {
  for (const testParameters of testParameterCases()) {
    const functionsWithSingleCaseIter = functionsWithSingleCase.values();
    const functionsWithMultipleCasesIter = functionsWithMultipleCases.values();
    const nonFunctionsIter = nonFunctions.values();
    // eslint-disable-next-line no-inner-declarations
    function generateFunction(functionParameters: FunctionParameters): string {
      if (functionParameters.singleCase) {
        return renderFunction(
          functionsWithSingleCaseIter.next().value,
          functionParameters,
        );
      } else {
        return renderFunction(
          functionsWithMultipleCasesIter.next().value,
          functionParameters,
        );
      }
    }
    const testCase: string[] = [];
    if (testParameters.startDelimiterParameters.kind === "function") {
      testCase.push(generateFunction(testParameters.startDelimiterParameters));
    } else if (testParameters.startDelimiterParameters.kind === "otherwise") {
      testCase.push(nonFunctionsIter.next().value.join("\n"));
    }
    testCase.push(generateFunction(testParameters.functionParameters));
    if (testParameters.endDelimiterParameters.kind === "function") {
      testCase.push(generateFunction(testParameters.endDelimiterParameters));
    } else if (testParameters.endDelimiterParameters.kind === "otherwise") {
      testCase.push(nonFunctionsIter.next().value.join("\n"));
    }
    testCase.push("---");
    yield testCase.join("\n\n");
  }
}

const scopeTypes = [
  "branch.match.iteration",
  "name.function",
  "namedFunction",
  "functionName",
];

function generateTestsFor(scopeType: string): void {
  const dirname = path.join(
    "src",
    "suite",
    "fixtures",
    "scopes",
    "haskell",
    "generated",
    scopeType,
  );
  fs.mkdirSync(dirname, { recursive: true });

  let index: number = 1;
  for (const testCase of testCases()) {
    fs.writeFileSync(
      path.join(dirname, `./${scopeType}${index}.scope`),
      testCase,
      { encoding: "utf-8" },
    );
    index++;
  }
}

for (const scopeType of scopeTypes) {
  generateTestsFor(scopeType);
}
