import type { JetbrainsClient } from "./JetbrainsClient";
import type {
  CommandServerApi,
  FocusedElementType,
  InboundSignal,
} from "@cursorless/common";

export class JetbrainsCommandServer implements CommandServerApi {
  private client!: JetbrainsClient;
  readonly signals: { prePhrase: InboundSignal } = {
    prePhrase: {
      getVersion: async () => {
        return this.client.prePhraseVersion();
      },
    },
  };

  constructor(client: JetbrainsClient) {
    this.client = client;
  }

  getFocusedElementType(): Promise<FocusedElementType | undefined> {
    return Promise.resolve(undefined);
  }
}
