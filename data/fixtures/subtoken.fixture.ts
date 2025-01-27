interface Fixture {
  input: string;
  expectedOutput: string[];
}

export const subtokenFixture: Fixture[] = [
  {
    input: "QuickBrownFox",
    expectedOutput: ["Quick", "Brown", "Fox"],
  },
  {
    input: "quickBrownFox",
    expectedOutput: ["quick", "Brown", "Fox"],
  },
  {
    input: "quick_brown_fox",
    expectedOutput: ["quick", "brown", "fox"],
  },
  {
    input: "QUICK_BROWN_FOX",
    expectedOutput: ["QUICK", "BROWN", "FOX"],
  },
  {
    input: "quick-brown-fox",
    expectedOutput: ["quick", "brown", "fox"],
  },
  {
    input: "QUICK-BROWN-FOX",
    expectedOutput: ["QUICK", "BROWN", "FOX"],
  },
  {
    input: "quick.brown.fox",
    expectedOutput: ["quick", "brown", "fox"],
  },
  {
    input: "QUICK.BROWN.FOX",
    expectedOutput: ["QUICK", "BROWN", "FOX"],
  },
  {
    input: "../quick/brown/.fox",
    expectedOutput: ["quick", "brown", "fox"],
  },
  {
    input: "../QUICK/BROWN/.FOX",
    expectedOutput: ["QUICK", "BROWN", "FOX"],
  },
  {
    input: "quick::brown::fox",
    expectedOutput: ["quick", "brown", "fox"],
  },
  {
    input: "QUICK::BROWN::FOX",
    expectedOutput: ["QUICK", "BROWN", "FOX"],
  },
  {
    input: "APIClientFactory",
    expectedOutput: ["API", "Client", "Factory"],
  },
  {
    input: "MockAPIClientFactory",
    expectedOutput: ["Mock", "API", "Client", "Factory"],
  },
  {
    input: "mockAPIClientFactory",
    expectedOutput: ["mock", "API", "Client", "Factory"],
  },
  {
    input: "mockAPIClient123FactoryV1",
    expectedOutput: ["mock", "API", "Client", "123", "Factory", "V", "1"],
  },
  {
    input: "mock_api_client_123_factory_v1",
    expectedOutput: ["mock", "api", "client", "123", "factory", "v1"],
  },
  {
    input: "v1",
    expectedOutput: ["v", "1"],
  },
  {
    input: "aaBbÄä",
    expectedOutput: ["aa", "Bb", "Ää"],
  },
  {
    input: "_quickBrownFox_",
    expectedOutput: ["quick", "Brown", "Fox"],
  },
];
