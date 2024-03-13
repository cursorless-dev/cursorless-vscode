import {
  IterationScopeRangeConfig,
  IterationScopeRanges,
  ScopeRangeConfig,
  ScopeRanges,
  TextEditor,
} from "@cursorless/common";

import { ModifierStageFactory } from "../processTargets/ModifierStageFactory";
import { ScopeHandlerFactory } from "../processTargets/modifiers/scopeHandlers/ScopeHandlerFactory";
import { getIterationRange } from "./getIterationRange";
import { getIterationScopeRanges } from "./getIterationScopeRanges";
import { getScopeRanges } from "./getScopeRanges";

/**
 * Provides scope ranges for a given editor to use eg for visualizing scopes
 */
export class ScopeRangeProvider {
  constructor(
    private scopeHandlerFactory: ScopeHandlerFactory,
    private modifierStageFactory: ModifierStageFactory,
  ) {
    this.provideScopeRanges = this.provideScopeRanges.bind(this);
    this.provideIterationScopeRanges =
      this.provideIterationScopeRanges.bind(this);
  }

  async provideScopeRanges(
    editor: TextEditor,
    { scopeType, visibleOnly }: ScopeRangeConfig,
  ): Promise<ScopeRanges[]> {
    const scopeHandler = this.scopeHandlerFactory.create(
      scopeType,
      editor.document.languageId,
    );

    if (scopeHandler == null) {
      return [];
    }

    return await getScopeRanges(
      editor,
      scopeHandler,
      getIterationRange(editor, scopeHandler, visibleOnly),
    );
  }

  provideIterationScopeRanges(
    editor: TextEditor,
    { scopeType, visibleOnly, includeNestedTargets }: IterationScopeRangeConfig,
  ): IterationScopeRanges[] {
    const { languageId } = editor.document;
    const scopeHandler = this.scopeHandlerFactory.create(scopeType, languageId);

    if (scopeHandler == null) {
      return [];
    }

    const iterationScopeHandler = this.scopeHandlerFactory.create(
      scopeHandler.iterationScopeType,
      languageId,
    );

    if (iterationScopeHandler == null) {
      return [];
    }

    return getIterationScopeRanges(
      editor,
      iterationScopeHandler,
      this.modifierStageFactory.create({
        type: "everyScope",
        scopeType,
      }),
      getIterationRange(editor, scopeHandler, visibleOnly),
      includeNestedTargets,
    );
  }
}
