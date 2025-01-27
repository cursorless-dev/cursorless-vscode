import {
  Notifier,
  type Disposable,
  type RawTreeSitterQueryProvider,
} from "@cursorless/common";
import type { JetbrainsIDE } from "./JetbrainsIDE";

export class JetbrainsTreeSitterQueryProvider
  implements RawTreeSitterQueryProvider
{
  private notifier: Notifier = new Notifier();
  private disposables: Disposable[] = [];

  constructor(private ide: JetbrainsIDE) {}

  onChanges = this.notifier.registerListener;

  async readQuery(filename: string): Promise<string | undefined> {
    // console.log("readQuery", filename);
    const queryContents = await this.ide.readQuery(filename);
    return queryContents;
  }

  dispose() {
    this.disposables.forEach((disposable) => disposable.dispose());
  }
}
