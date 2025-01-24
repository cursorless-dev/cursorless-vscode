import type {
  Command,
  CommandServerApi,
  Direction,
  Hats,
  IDE,
  ScopeProvider,
  ScopeType,
  TextEditor,
} from "@cursorless/common";
import { Position } from "@cursorless/common";
import {
  ensureCommandShape,
  type RawTreeSitterQueryProvider,
  type TalonSpokenForms,
  type TreeSitter,
} from "@cursorless/common";
import { KeyboardTargetUpdater } from "./KeyboardTargetUpdater";
import type {
  CommandRunnerDecorator,
  CursorlessEngine,
} from "./api/CursorlessEngineApi";
import { Debug } from "./core/Debug";
import { HatTokenMapImpl } from "./core/HatTokenMapImpl";
import type { Snippets } from "./core/Snippets";
import { StoredTargetMap } from "./core/StoredTargets";
import { RangeUpdater } from "./core/updateSelections/RangeUpdater";
import { DisabledCommandServerApi } from "./disabledComponents/DisabledCommandServerApi";
import { DisabledHatTokenMap } from "./disabledComponents/DisabledHatTokenMap";
import { DisabledLanguageDefinitions } from "./disabledComponents/DisabledLanguageDefinitions";
import { DisabledSnippets } from "./disabledComponents/DisabledSnippets";
import { DisabledTalonSpokenForms } from "./disabledComponents/DisabledTalonSpokenForms";
import { DisabledTreeSitter } from "./disabledComponents/DisabledTreeSitter";
import { CustomSpokenFormGeneratorImpl } from "./generateSpokenForm/CustomSpokenFormGeneratorImpl";
import {
  LanguageDefinitionsImpl,
  type LanguageDefinitions,
} from "./languages/LanguageDefinitions";
import { ModifierStageFactoryImpl } from "./processTargets/ModifierStageFactoryImpl";
import { ScopeHandlerFactoryImpl } from "./processTargets/modifiers/scopeHandlers";
import type { TargetScope } from "./processTargets/modifiers/scopeHandlers/scope.types";
import type {
  ScopeHandler,
  ScopeIteratorRequirements,
} from "./processTargets/modifiers/scopeHandlers/scopeHandler.types";
import { runCommand } from "./runCommand";
import { runIntegrationTests } from "./runIntegrationTests";
import { ScopeInfoProvider } from "./scopeProviders/ScopeInfoProvider";
import { ScopeRangeProvider } from "./scopeProviders/ScopeRangeProvider";
import { ScopeRangeWatcher } from "./scopeProviders/ScopeRangeWatcher";
import { ScopeSupportChecker } from "./scopeProviders/ScopeSupportChecker";
import { ScopeSupportWatcher } from "./scopeProviders/ScopeSupportWatcher";
import { injectIde } from "./singletons/ide.singleton";

export class Testing implements ScopeHandler {
  scopeType = { type: "document" } as ScopeType;
  iterationScopeType = { type: "document" } as ScopeType;
  includeAdjacentInEvery = false;

  generateScopes(
    editor: TextEditor,
    position: Position,
    direction: Direction,
    requirements: ScopeIteratorRequirements,
  ): Iterable<TargetScope> {
    console.log(requirements.distalPosition);
    throw new Error("Method not implemented.");
  }
}

export interface EngineProps {
  ide: IDE;
  hats?: Hats;
  treeSitterQueryProvider?: RawTreeSitterQueryProvider;
  treeSitter?: TreeSitter;
  commandServerApi?: CommandServerApi;
  talonSpokenForms?: TalonSpokenForms;
  snippets?: Snippets;
}

export async function createCursorlessEngine({
  ide,
  hats,
  treeSitterQueryProvider,
  treeSitter = new DisabledTreeSitter(),
  commandServerApi = new DisabledCommandServerApi(),
  talonSpokenForms = new DisabledTalonSpokenForms(),
  snippets = new DisabledSnippets(),
}: EngineProps): Promise<CursorlessEngine> {
  injectIde(ide);

  const test: ScopeHandler = new Testing();
  console.log(test);
  test.generateScopes(
    null as unknown as TextEditor,
    new Position(0, 0),
    "forward",
    {},
  );

  const debug = new Debug(ide);
  const rangeUpdater = new RangeUpdater();

  const storedTargets = new StoredTargetMap();
  const keyboardTargetUpdater = new KeyboardTargetUpdater(ide, storedTargets);
  const customSpokenFormGenerator = new CustomSpokenFormGeneratorImpl(
    talonSpokenForms,
  );

  const hatTokenMap =
    hats != null
      ? new HatTokenMapImpl(rangeUpdater, debug, hats, commandServerApi)
      : new DisabledHatTokenMap();
  void hatTokenMap.allocateHats();

  const languageDefinitions = treeSitterQueryProvider
    ? await LanguageDefinitionsImpl.create(
        ide,
        treeSitter,
        treeSitterQueryProvider,
      )
    : new DisabledLanguageDefinitions();

  ide.disposeOnExit(
    rangeUpdater,
    languageDefinitions,
    hatTokenMap,
    debug,
    keyboardTargetUpdater,
  );

  const commandRunnerDecorators: CommandRunnerDecorator[] = [];

  let previousCommand: Command | undefined = undefined;

  const runCommandClosure = (command: Command) => {
    previousCommand = command;
    return runCommand(
      treeSitter,
      commandServerApi,
      debug,
      hatTokenMap,
      snippets,
      storedTargets,
      languageDefinitions,
      rangeUpdater,
      commandRunnerDecorators,
      command,
    );
  };

  return {
    commandApi: {
      runCommand(command: Command) {
        return runCommandClosure(command);
      },

      runCommandSafe(...args: unknown[]) {
        return runCommandClosure(ensureCommandShape(args));
      },

      repeatPreviousCommand() {
        if (previousCommand == null) {
          throw new Error("No previous command");
        }

        return runCommandClosure(previousCommand);
      },
    },
    scopeProvider: createScopeProvider(
      languageDefinitions,
      storedTargets,
      customSpokenFormGenerator,
    ),
    customSpokenFormGenerator,
    storedTargets,
    hatTokenMap,
    injectIde,
    runIntegrationTests: () =>
      runIntegrationTests(treeSitter, languageDefinitions),
    addCommandRunnerDecorator: (decorator: CommandRunnerDecorator) => {
      commandRunnerDecorators.push(decorator);
    },
  };
}

function createScopeProvider(
  languageDefinitions: LanguageDefinitions,
  storedTargets: StoredTargetMap,
  customSpokenFormGenerator: CustomSpokenFormGeneratorImpl,
): ScopeProvider {
  const scopeHandlerFactory = new ScopeHandlerFactoryImpl(languageDefinitions);

  const rangeProvider = new ScopeRangeProvider(
    scopeHandlerFactory,
    new ModifierStageFactoryImpl(
      languageDefinitions,
      storedTargets,
      scopeHandlerFactory,
    ),
  );

  const rangeWatcher = new ScopeRangeWatcher(
    languageDefinitions,
    rangeProvider,
  );
  const supportChecker = new ScopeSupportChecker(scopeHandlerFactory);
  const infoProvider = new ScopeInfoProvider(customSpokenFormGenerator);
  const supportWatcher = new ScopeSupportWatcher(
    languageDefinitions,
    supportChecker,
    infoProvider,
  );

  return {
    provideScopeRanges: rangeProvider.provideScopeRanges,
    provideIterationScopeRanges: rangeProvider.provideIterationScopeRanges,
    onDidChangeScopeRanges: rangeWatcher.onDidChangeScopeRanges,
    onDidChangeIterationScopeRanges:
      rangeWatcher.onDidChangeIterationScopeRanges,
    getScopeSupport: supportChecker.getScopeSupport,
    getIterationScopeSupport: supportChecker.getIterationScopeSupport,
    onDidChangeScopeSupport: supportWatcher.onDidChangeScopeSupport,
    getScopeInfo: infoProvider.getScopeTypeInfo,
    onDidChangeScopeInfo: infoProvider.onDidChangeScopeInfo,
  };
}
