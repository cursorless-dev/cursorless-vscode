/* eslint-disable @typescript-eslint/naming-convention */

import type { LanguageScopeSupportFacetMap } from "./scopeSupportFacets.types";
import { ScopeSupportFacetLevel } from "./scopeSupportFacets.types";

const { supported } = ScopeSupportFacetLevel;

export const shellscriptScopeSupport: LanguageScopeSupportFacetMap = {
  list: supported,
  command: supported,
  "name.assignment": supported,
  "value.assignment": supported,
};
