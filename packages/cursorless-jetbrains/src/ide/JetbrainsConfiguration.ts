import type {
  Configuration,
  ConfigurationScope,
  CursorlessConfiguration,
} from "@cursorless/common";
import { CONFIGURATION_DEFAULTS } from "@cursorless/common";
import type { GetFieldType, Paths } from "@cursorless/common";
import { Notifier } from "@cursorless/common";
import { get } from "lodash-es";

export class JetbrainsConfiguration implements Configuration {
  private notifier = new Notifier();
  private configuration: CursorlessConfiguration = CONFIGURATION_DEFAULTS;

  constructor(configuration: CursorlessConfiguration) {
    this.configuration = configuration;
  }

  getOwnConfiguration<Path extends Paths<CursorlessConfiguration>>(
    path: Path,
    _scope?: ConfigurationScope,
  ): GetFieldType<CursorlessConfiguration, Path> {
    return get(this.configuration, path) as GetFieldType<
      CursorlessConfiguration,
      Path
    >;
  }

  onDidChangeConfiguration = this.notifier.registerListener;

  updateConfiguration(configuration: CursorlessConfiguration) {
    this.configuration = configuration;
    this.notifier.notifyListeners();
  }
}

export function createJetbrainsConfiguration(
  configuration: CursorlessConfiguration,
): JetbrainsConfiguration {
  return new JetbrainsConfiguration(configuration);
}

