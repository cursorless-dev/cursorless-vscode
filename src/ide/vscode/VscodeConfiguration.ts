import { HatStability } from "../../packages/common";
import { get } from "lodash";
import * as vscode from "vscode";
import {
  Configuration,
  ConfigurationScope,
  CursorlessConfiguration,
} from "../../packages/common/ide/types/Configuration";
import { GetFieldType, Paths } from "../../packages/common/ide/types/Paths";
import { Notifier } from "../../packages/common/util/Notifier";
import type VscodeIDE from "./VscodeIDE";

const translators = {
  experimental: {
    hatStability(value: string) {
      return HatStability[value as keyof typeof HatStability];
    },
  },
};

export default class VscodeConfiguration implements Configuration {
  private notifier = new Notifier();

  constructor(ide: VscodeIDE) {
    this.onDidChangeConfiguration = this.onDidChangeConfiguration.bind(this);

    ide.disposeOnExit(
      vscode.workspace.onDidChangeConfiguration(this.notifier.notifyListeners),
    );
  }

  getOwnConfiguration<Path extends Paths<CursorlessConfiguration>>(
    path: Path,
    scope?: ConfigurationScope,
  ): GetFieldType<CursorlessConfiguration, Path> {
    const rawValue = vscode.workspace
      .getConfiguration("cursorless", scope)
      .get<GetFieldType<CursorlessConfiguration, Path>>(path)!;

    return get(translators, path)?.(rawValue) ?? rawValue;
  }

  onDidChangeConfiguration = this.notifier.registerListener;
}
