import { readFileSync } from "fs";
import { join } from "path";
import * as vscode from "vscode";
import getHatThemeColors from "../../core/getHatThemeColors";
import {
  defaultShapeAdjustments,
  DEFAULT_HAT_HEIGHT_EM,
  DEFAULT_VERTICAL_OFFSET_EM,
  IndividualHatAdjustmentMap,
} from "../../core/shapeAdjustments";
import FontMeasurements from "./FontMeasurements";
import { HatShape, HAT_SHAPES, VscodeHatStyleName } from "./hatStyles.types";
import VscodeAvailableHatStyles from "./VscodeAvailableHatStyles";

type HatDecorationMap = Partial<
  Record<VscodeHatStyleName, vscode.TextEditorDecorationType>
>;

export default class VscodeHatRenderer {
  private decorationMap!: HatDecorationMap;
  private disposables: vscode.Disposable[] = [];
  private fontMeasurements: FontMeasurements;

  constructor(
    private extensionContext: vscode.ExtensionContext,
    private availableHatStyles: VscodeAvailableHatStyles,
  ) {
    extensionContext.subscriptions.push(this);
    this.fontMeasurements = new FontMeasurements(extensionContext);

    this.recomputeDecorations = this.recomputeDecorations.bind(this);

    this.disposables.push(
      vscode.commands.registerCommand(
        "cursorless.recomputeDecorationStyles",
        () => {
          this.fontMeasurements.clearCache();
          this.recomputeDecorations();
        },
      ),

      vscode.workspace.onDidChangeConfiguration(this.recomputeDecorations),
    );
  }

  async init() {
    await this.fontMeasurements.calculate();
    this.constructDecorations(this.fontMeasurements);
  }

  private destroyDecorations() {
    Object.values(this.decorationMap).forEach((decoration) => {
      decoration.dispose();
    });
  }

  private async recomputeDecorations() {
    this.destroyDecorations();
    await this.fontMeasurements.calculate();
    this.constructDecorations(this.fontMeasurements);
  }

  private constructDecorations(fontMeasurements: FontMeasurements) {
    const userSizeAdjustment = vscode.workspace
      .getConfiguration("cursorless")
      .get<number>(`hatSizeAdjustment`)!;

    const userVerticalOffset = vscode.workspace
      .getConfiguration("cursorless")
      .get<number>(`hatVerticalOffset`)!;

    const userIndividualAdjustments = vscode.workspace
      .getConfiguration("cursorless")
      .get<IndividualHatAdjustmentMap>("individualHatAdjustments")!;

    const hatSvgMap = Object.fromEntries(
      HAT_SHAPES.map((shape) => {
        const { sizeAdjustment = 0, verticalOffset = 0 } =
          defaultShapeAdjustments[shape];

        const {
          sizeAdjustment: userIndividualSizeAdjustment = 0,
          verticalOffset: userIndividualVerticalOffset = 0,
        } = userIndividualAdjustments[shape] ?? {};

        const scaleFactor =
          1 +
          (sizeAdjustment + userSizeAdjustment + userIndividualSizeAdjustment) /
            100;

        const finalVerticalOffsetEm =
          (verticalOffset + userVerticalOffset + userIndividualVerticalOffset) /
          100;

        return [
          shape,
          this.processSvg(
            fontMeasurements,
            shape,
            scaleFactor,
            finalVerticalOffsetEm,
          ),
        ];
      }),
    );

    this.decorationMap = Object.fromEntries(
      Object.entries(this.availableHatStyles.hatStyleMap).map(
        ([styleName, { color, shape }]) => {
          const { svg, svgWidthPx, svgHeightPx } = hatSvgMap[shape];

          const { light, dark } = getHatThemeColors(color);

          return [
            styleName,
            vscode.window.createTextEditorDecorationType({
              rangeBehavior: vscode.DecorationRangeBehavior.ClosedClosed,
              light: {
                before: {
                  contentIconPath: this.constructColoredSvgDataUri(svg, light),
                },
              },
              dark: {
                before: {
                  contentIconPath: this.constructColoredSvgDataUri(svg, dark),
                },
              },
              before: {
                margin: `-${svgHeightPx}px -${svgWidthPx}px 0 0`,
                width: `${svgWidthPx}px`,
                height: `${svgHeightPx}px`,
              },
            }),
          ];
        },
      ),
    );
  }

  private constructColoredSvgDataUri(originalSvg: string, color: string) {
    if (
      originalSvg.match(/fill="[^"]+"/) == null &&
      originalSvg.match(/fill:[^;]+;/) == null
    ) {
      throw Error("Raw svg doesn't have fill");
    }

    const svg = originalSvg
      .replace(/fill="[^"]+"/, `fill="${color}"`)
      .replace(/fill:[^;]+;/, `fill:${color};`);

    const encoded = encodeURIComponent(svg);

    return vscode.Uri.parse(`data:image/svg+xml;utf8,${encoded}`);
  }

  /**
   * Creates an SVG from the hat SVG that pads, offsets and scales it to end up
   * in the right size / place relative to the character it will be placed over.
   * [This image](../../images/svg-calculations.png) may or may not be helpful.
   *
   * @param fontMeasurements Info about the user's font
   * @param shape The hat shape to process
   * @param scaleFactor How much to scale the hat
   * @param hatVerticalOffsetEm How far off top of characters should hats be
   * @returns An object with the new SVG and its measurements
   */
  private processSvg(
    fontMeasurements: FontMeasurements,
    shape: HatShape,
    scaleFactor: number,
    hatVerticalOffsetEm: number,
  ) {
    const iconPath = join(
      this.extensionContext.extensionPath,
      "images",
      "hats",
      `${shape}.svg`,
    );
    const rawSvg = readFileSync(iconPath, "utf8");
    const { characterWidth, characterHeight, fontSize } = fontMeasurements;

    const { originalViewBoxHeight, originalViewBoxWidth } =
      this.getViewBoxDimensions(rawSvg);

    const defaultHatHeightPx = DEFAULT_HAT_HEIGHT_EM * fontSize;
    const defaultHatWidthPx =
      (originalViewBoxWidth / originalViewBoxHeight) * defaultHatHeightPx;

    const hatHeightPx = defaultHatHeightPx * scaleFactor;
    const hatWidthPx = defaultHatWidthPx * scaleFactor;

    const hatVerticalOffsetPx =
      (DEFAULT_VERTICAL_OFFSET_EM + hatVerticalOffsetEm) * fontSize -
      hatHeightPx / 2;

    const svgWidthPx = Math.ceil(characterWidth);
    const svgHeightPx = characterHeight + hatHeightPx + hatVerticalOffsetPx;

    const newViewBoxWidth = originalViewBoxWidth * (svgWidthPx / hatWidthPx);
    const newViewBoxHeight = newViewBoxWidth * (svgHeightPx / svgWidthPx);
    const newViewBoxX =
      (-(characterWidth - hatWidthPx) * (newViewBoxWidth / svgWidthPx)) / 2;
    const newViewBoxY = 0;

    const newViewBoxString = `${newViewBoxX} ${newViewBoxY} ${newViewBoxWidth} ${newViewBoxHeight}`;

    if (
      rawSvg.match(/width="[^"]+"/) == null ||
      rawSvg.match(/height="[^"]+"/) == null
    ) {
      throw Error("Raw svg doesn't have height or width");
    }

    const svg = rawSvg
      .replace(/width="[^"]+"/, `width="${svgWidthPx}px"`)
      .replace(/height="[^"]+"/, `height="${svgHeightPx}px"`)
      .replace(/viewBox="([^"]+)"/, `viewBox="${newViewBoxString}"`);

    return {
      svg,
      svgHeightPx,
      svgWidthPx,
    };
  }

  private getViewBoxDimensions(rawSvg: string) {
    const viewBoxMatch = rawSvg.match(/viewBox="([^"]+)"/);
    if (viewBoxMatch == null) {
      throw Error("View box not found in svg");
    }

    const originalViewBoxString = viewBoxMatch[1];
    const [_0, _1, originalViewBoxWidthStr, originalViewBoxHeightStr] =
      originalViewBoxString.split(" ");

    const originalViewBoxWidth = Number(originalViewBoxWidthStr);
    const originalViewBoxHeight = Number(originalViewBoxHeightStr);

    return { originalViewBoxHeight, originalViewBoxWidth };
  }

  dispose() {
    this.destroyDecorations();
    this.disposables.forEach(({ dispose }) => dispose());
  }
}
