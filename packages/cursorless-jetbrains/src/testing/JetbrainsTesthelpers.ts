import type {
  Command,
  CommandResponse,
  IDE,
  NormalizedIDE,
  TestHelpers,
} from "@cursorless/common";
import type { JetbrainsIDE } from "../ide/JetbrainsIDE";
import type { StoredTargetMap } from "@cursorless/cursorless-engine";

export interface JetbrainsTestHelpers
  extends Omit<TestHelpers, "takeSnapshot"> {
  talonJsIDE: JetbrainsIDE;
  ide: NormalizedIDE;
  storedTargets: StoredTargetMap;
  injectIde: (ide: IDE) => void;
  runCommand(command: Command): Promise<CommandResponse | unknown>;
}

export interface ActivateReturnValue {
  testHelpers?: JetbrainsTestHelpers;
}
