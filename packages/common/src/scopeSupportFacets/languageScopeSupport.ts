import type { StringRecord } from "../types/StringRecord";
import { cScopeSupport } from "./c";
import { clojureScopeSupport } from "./clojure";
import { cppScopeSupport } from "./cpp";
import { csharpScopeSupport } from "./csharp";
import { cssScopeSupport } from "./css";
import { dartScopeSupport } from "./dart";
import { goScopeSupport } from "./go";
import { haskellScopeSupport } from "./haskell";
import { htmlScopeSupport } from "./html";
import { javaScopeSupport } from "./java";
import { javascriptScopeSupport } from "./javascript";
import { javascriptreactScopeSupport } from "./javascriptreact";
import { jsonScopeSupport } from "./json";
import { jsoncScopeSupport } from "./jsonc";
import { jsonlScopeSupport } from "./jsonl";
import { latexScopeSupport } from "./latex";
import { luaScopeSupport } from "./lua";
import { markdownScopeSupport } from "./markdown";
import { phpScopeSupport } from "./php";
import { pythonScopeSupport } from "./python";
import { rubyScopeSupport } from "./ruby";
import { rustScopeSupport } from "./rust";
import { scalaScopeSupport } from "./scala";
import { scmScopeSupport } from "./scm";
import type { LanguageScopeSupportFacetMap } from "./scopeSupportFacets.types";
import { scssScopeSupport } from "./scss";
import { talonScopeSupport } from "./talon";
import { typescriptScopeSupport } from "./typescript";
import { typescriptreactScopeSupport } from "./typescriptreact";
import { xmlScopeSupport } from "./xml";
import { yamlScopeSupport } from "./yaml";

export const languageScopeSupport: StringRecord<LanguageScopeSupportFacetMap> =
  {
    c: cScopeSupport,
    clojure: clojureScopeSupport,
    cpp: cppScopeSupport,
    csharp: csharpScopeSupport,
    css: cssScopeSupport,
    dart: dartScopeSupport,
    go: goScopeSupport,
    haskell: haskellScopeSupport,
    html: htmlScopeSupport,
    java: javaScopeSupport,
    javascript: javascriptScopeSupport,
    javascriptreact: javascriptreactScopeSupport,
    json: jsonScopeSupport,
    jsonc: jsoncScopeSupport,
    jsonl: jsonlScopeSupport,
    latex: latexScopeSupport,
    lua: luaScopeSupport,
    markdown: markdownScopeSupport,
    php: phpScopeSupport,
    python: pythonScopeSupport,
    ruby: rubyScopeSupport,
    rust: rustScopeSupport,
    scala: scalaScopeSupport,
    scm: scmScopeSupport,
    scss: scssScopeSupport,
    talon: talonScopeSupport,
    typescript: typescriptScopeSupport,
    typescriptreact: typescriptreactScopeSupport,
    xml: xmlScopeSupport,
    yaml: yamlScopeSupport,
  };
