import type { JetbrainsClient } from "./JetbrainsClient";
import { JetbrainsHats } from "./JetbrainsHats";
import type { JetbrainsIDE } from "./JetbrainsIDE";

export class JetbrainsPlugin {
  constructor(
    readonly client: JetbrainsClient,
    readonly ide: JetbrainsIDE,
    readonly hats: JetbrainsHats,
  ) {}
}

export function createPlugin(
  client: JetbrainsClient,
  ide: JetbrainsIDE,
): JetbrainsPlugin {
  const hats = new JetbrainsHats(client);
  return new JetbrainsPlugin(client, ide, hats);
}
