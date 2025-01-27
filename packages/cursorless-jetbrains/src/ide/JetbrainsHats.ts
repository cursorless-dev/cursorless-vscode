import type {
  Disposable,
  HatRange,
  Hats,
  HatStyleInfo,
  HatStyleMap,
  Listener,
} from "@cursorless/common";
import { Notifier } from "@cursorless/common";
import type { JetbrainsClient } from "./JetbrainsClient";
import type { JetbrainsHatRange } from "../types/jetbrains.types";

export class JetbrainsHats implements Hats {
  private isEnabledNotifier: Notifier<[boolean]> = new Notifier();
  private hatStyleChangedNotifier: Notifier<[HatStyleMap]> = new Notifier();

  private hatRanges: HatRange[] = [];
  private client: JetbrainsClient;
  enabledHatStyles: HatStyleMap;
  private enabledHatShapes = ["default"];
  private hatShapePenalties: Map<string, number> = new Map([["default", 0]]);
  private enabledHatColors = ["default"];
  private hatColorPenalties: Map<string, number> = new Map([["default", 0]]);
  isEnabled: boolean = true;

  constructor(client: JetbrainsClient) {
    this.client = client;
    this.enabledHatStyles = this.generateHatStyles();
  }

  setHatRanges(hatRanges: HatRange[]): Promise<void> {
    // console.log("ASOEE/CL: JetbrainsHats.setHatRanges : " + hatRanges.length);

    this.hatRanges = hatRanges;
    const jbHatRanges = this.toJetbransHatRanges(hatRanges);
    const hatsJson = JSON.stringify(jbHatRanges);
    // console.log("ASOEE/CL: JetbrainsHats.setHatRanges json: " + hatsJson);
    this.client.hatsUpdated(hatsJson);
    return Promise.resolve();
  }

  setEnabledHatShapes(enabledHatShapes: string[]): void {
    this.enabledHatShapes = enabledHatShapes;
    this.enabledHatStyles = this.generateHatStyles();
    this.hatStyleChangedNotifier.notifyListeners(this.enabledHatStyles);
  }

  setHatShapePenalties(hatShapePenalties: Map<string, number>): void {
    // supplied map is a json map, and not a typescript map, so convert it to typed map
    this.hatShapePenalties = new Map<string, number>(
      Object.entries(hatShapePenalties),
    );
    this.enabledHatStyles = this.generateHatStyles();
    this.hatStyleChangedNotifier.notifyListeners(this.enabledHatStyles);
  }

  setEnabledHatColors(enabledHatColors: string[]): void {
    this.enabledHatColors = enabledHatColors;
    this.enabledHatStyles = this.generateHatStyles();
    this.hatStyleChangedNotifier.notifyListeners(this.enabledHatStyles);
  }

  setHatColorPenalties(hatColorPenalties: Map<string, number>): void {
    // supplied map is a json map, and not a typescript map, so convert it to typed map
    this.hatColorPenalties = new Map<string, number>(
      Object.entries(hatColorPenalties),
    );
    this.enabledHatStyles = this.generateHatStyles();
    this.hatStyleChangedNotifier.notifyListeners(this.enabledHatStyles);
  }

  toJetbransHatRanges(hatRanges: HatRange[]): JetbrainsHatRange[] {
    return hatRanges.map((range) => {
      return {
        styleName: range.styleName,
        editorId: range.editor.id,
        range: range.range,
      };
    });
  }

  private generateHatStyles(): HatStyleMap {
    const res = new Map<string, HatStyleInfo>();
    for (const color of this.enabledHatColors) {
      const colorPenalty = this.getColorPenalty(color);
      for (const shape of this.enabledHatShapes) {
        const shapePenalty = this.getShapePenalty(shape);
        let styleName: string;
        if (shape === "default") {
          styleName = color;
        } else {
          styleName = `${color}-${shape}`;
        }
        res.set(styleName, { penalty: colorPenalty + shapePenalty });
      }
    }
    return Object.fromEntries(res);
  }

  private getShapePenalty(shape: string) {
    let shapePenalty = this.hatShapePenalties.get(shape);
    if (shapePenalty == null) {
      shapePenalty = shape === "default" ? 0 : 2;
    } else {
      shapePenalty = shape === "default" ? shapePenalty : shapePenalty + 1;
    }
    return shapePenalty;
  }

  private getColorPenalty(color: string) {
    let colorPenalty = this.hatColorPenalties.get(color);
    if (colorPenalty == null) {
      colorPenalty = color === "default" ? 0 : 1;
    }
    return colorPenalty;
  }

  onDidChangeEnabledHatStyles(listener: Listener<[HatStyleMap]>): Disposable {
    return this.hatStyleChangedNotifier.registerListener(listener);
  }

  onDidChangeIsEnabled(listener: Listener<[boolean]>): Disposable {
    return this.isEnabledNotifier.registerListener(listener);
  }

  toggle(isEnabled?: boolean) {
    this.isEnabled = isEnabled ?? !this.isEnabled;
    this.isEnabledNotifier.notifyListeners(this.isEnabled);
  }
}
