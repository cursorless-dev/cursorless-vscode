import { javascriptScopeSupport } from "./javascript";
import type { LanguageScopeSupportFacetMap } from "./scopeSupportFacets.types";
import { ScopeSupportFacetLevel } from "./scopeSupportFacets.types";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const { supported, unsupported, notApplicable } = ScopeSupportFacetLevel;

export const javascriptreactScopeSupport: LanguageScopeSupportFacetMap = {
  ...javascriptScopeSupport,

  "textFragment.element": supported,
};
