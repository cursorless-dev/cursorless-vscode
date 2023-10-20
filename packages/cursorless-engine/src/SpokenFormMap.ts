import {
  ModifierType,
  SimpleScopeTypeType,
  SurroundingPairName,
} from "@cursorless/common";

export type SpeakableSurroundingPairName =
  | Exclude<SurroundingPairName, "collectionBoundary">
  | "whitespace";

export type SimpleModifierType = Exclude<
  ModifierType,
  | "containingScope"
  | "ordinalScope"
  | "relativeScope"
  | "modifyIfUntyped"
  | "cascading"
  | "range"
>;

export type ModifierExtra =
  | "first"
  | "last"
  | "previous"
  | "next"
  | "forward"
  | "backward";

/**
 * This interface is the source of truth for the types used in our spoken form
 * map. The keys of this interface are the types of spoken forms that we
 * support, eg `simpleScopeTypeType`, `simpleModifier`, etc. The type of each
 * key is a disjunction of all identifiers that are allowed for the given type of
 * spoken form.
 */
export interface SpokenFormMapKeyTypes {
  pairedDelimiter: SpeakableSurroundingPairName;
  simpleScopeTypeType: SimpleScopeTypeType;
  surroundingPairForceDirection: "left" | "right";

  /**
   * These modifier types are spoken by directly saying the spoken form for the
   * modifier type, unlike the more complex spoken forms such as
   * `relativeScope`, which can use various different custom spoken forms such
   * as `next`, `previous`, etc.
   */
  simpleModifier: SimpleModifierType;

  /**
   * These are customizable spoken forms used in speaking modifiers, but that
   * don't directly correspond to a modifier type. For example, `next` is a
   * customizable spoken form that can be used when speaking `relativeScope`
   * modifiers, but `next` itself isn't a modifier type.
   */
  modifierExtra: ModifierExtra;
  customRegex: string;
}

export type SpokenFormType = keyof SpokenFormMapKeyTypes;

/**
 * These are the types of spoken forms that are not total mappings, eg if you
 * look up a string in `spokenFormMap.customRegex`, you might get `undefined`,
 * even though technically the identifier type is `string`.
 */
export type PartialSpokenFormTypes = "customRegex";

export interface SpokenFormMapEntry {
  /**
   * The spoken forms for this entry. These could either be a user's custom
   * spoken forms, if we have access to them, or the default spoken forms, if we
   * don't, or if we're testing.
   */
  spokenForms: string[];

  /**
   * If `true`, indicates that the user is not using the default spoken forms
   * for this entry.
   */
  isCustom: boolean;

  /**
   * The default spoken forms for this entry.
   */
  defaultSpokenForms: string[];

  /**
   * If `true`, indicates that the entry wasn't found in the user's Talon spoken
   * forms json, and so they need to update their cursorless-talon to get the
   * given entity.
   */
  requiresTalonUpdate: boolean;

  /**
   * If `true`, indicates that the entry is only for internal experimentation,
   * and should not be exposed to users except within a targeted working group.
   */
  isPrivate: boolean;
}

/**
 * A type that contains all the keys of {@link SpokenFormMapKeyTypes}, each of
 * whose values are a map from the allowed identifiers for that key to a particular
 * value type {@link T}.
 */
export type SpokenFormMappingType<T> = {
  readonly [K in SpokenFormType]: K extends PartialSpokenFormTypes
    ? Readonly<Partial<Record<SpokenFormMapKeyTypes[K], T>>>
    : Readonly<Record<SpokenFormMapKeyTypes[K], T>>;
};

/**
 * A spoken form map contains information about the spoken forms for all our
 * speakable entities, including scope types, paired delimiters, etc. It can
 * either contain the user's custom spoken forms, or the default spoken forms,
 * if we don't have access to the user's custom spoken forms, or if we're
 * testing.
 *
 * Each key of this map is a type of spoken form, eg `simpleScopeTypeType`, and
 * the value is a map of identifiers to {@link SpokenFormMapEntry}s.
 */
export type SpokenFormMap = SpokenFormMappingType<SpokenFormMapEntry>;

/**
 * Converts a spoken form map to a spoken form component map for use in spoken
 * form generation.
 * @param spokenFormMap The spoken form map to convert to a spoken form
 * component map
 * @returns A spoken form component map that can be used to generate spoken
 * forms
 */
export function mapSpokenForms<I, O>(
  input: SpokenFormMappingType<I>,
  mapper: <T extends SpokenFormType>(
    input: I,
    spokenFormType: T,
    id: SpokenFormMapKeyTypes[T],
  ) => O,
): SpokenFormMappingType<O> {
  return Object.fromEntries(
    Object.entries(input).map(([spokenFormType, map]) => [
      spokenFormType,
      Object.fromEntries(
        Object.entries(map).map(([id, inputValue]) => [
          id,
          mapper(inputValue!, spokenFormType as SpokenFormType, id),
        ]),
      ),
    ]),
    // FIXME: Don't cast here; need to make our own mapValues with stronger typing
    // using tricks from our object.d.ts
  ) as SpokenFormMappingType<O>;
}
