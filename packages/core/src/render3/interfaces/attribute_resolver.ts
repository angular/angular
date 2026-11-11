/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

/**
 * Classes that each source applies to an element, ordered from the lowest to the highest priority.
 * An `(attr.class)` binding receives them as `$event.sources`.
 *
 * - `component`: the component on the element, including the component's host directives.
 * - `directives`: all other directives on the element, in matching order.
 * - `template`: the element's own `class` attribute and its `[class]` and `[class.name]` bindings.
 *
 * Within a source, static classes come first, followed by `[class]` and then `[class.name]`
 * bindings. A class that a higher-priority binding turns off (for example with
 * `[class.name]="false"`) isn't present in any source.
 *
 * When several `(class)` or `(attr.class)` bindings apply to an element, each one after the
 * lowest-priority one receives the classes that the previous one resolved, grouped the same way. A
 * class keeps its source, and a class that the previous binding added is reported under that
 * binding's source.
 *
 * @experimental 22.3
 */
export type ClassSources = readonly [
  component: readonly string[],
  directives: readonly string[],
  template: readonly string[],
];

/**
 * A value that names classes, read the way a `[class]` binding reads it: a string splits on
 * whitespace, an array or a `Set` lists the names, and an object map keeps the keys whose values
 * are truthy. `null`, `undefined`, `false`, and `''` add nothing.
 *
 * The type rejects plain functions, and maps, arrays, and sets that are also functions, through the
 * `Symbol.hasInstance` member that every function has, which leaves a class named `call` allowed.
 * A structural check can't reject a function whose type was widened, such as
 * `const names: readonly string[] = Object.assign(() => {}, ['a'])`. In dev mode, a function
 * that a handler supplies throws `NG0320` at runtime.
 *
 * @experimental 22.3
 */
export type ClassBindingValue =
  | string
  | (readonly string[] & {readonly [Symbol.hasInstance]?: never})
  | (ReadonlySet<string> & {readonly [Symbol.hasInstance]?: never})
  | ({readonly [className: string]: unknown} & {readonly [Symbol.hasInstance]?: never})
  | null
  | undefined
  | false;

// Type-only brand of `ResolvedAttribute`; no value carries it at runtime.
export const ɵRESOLVED_CLASSES_BRAND: unique symbol = /* @__PURE__ */ Symbol();

/**
 * The value of an attribute that the resolver of a resolve event merged for an element, such as
 * the classes that `ClassResolveEvent.resolver` returns. Only that resolver creates one; pass it
 * to the same event's `resolve` to apply it.
 *
 * @experimental 22.3
 */
export interface ResolvedAttribute {
  readonly [ɵRESOLVED_CLASSES_BRAND]: true;
}

/**
 * The resolver of a `ClassResolveEvent`. It merges the event's sources with the extras, which rank
 * at the end of the source of the binding that calls it.
 *
 * @experimental 22.3
 */
export type BoundClassResolver = (...extras: ClassBindingValue[]) => ResolvedAttribute;

/**
 * A function that computes an element's classes with the resolver of a `ClassResolveEvent`.
 *
 * @experimental 22.3
 */
export type ClassCallback = (cn: BoundClassResolver) => ResolvedAttribute;

/**
 * `$event` of an `(attr.class)` binding, which resolves the classes of its element.
 *
 * If the handler doesn't call `resolve()`, the element keeps the classes of its sources. The
 * handler's return value is ignored.
 *
 * @experimental 22.3
 */
export interface ClassResolveEvent {
  /** Classes that each source applies to the element. */
  readonly sources: ClassSources;

  /**
   * Merges the sources with `extras`, which rank at the end of the source of the binding that
   * calls it.
   */
  resolver(...extras: ClassBindingValue[]): ResolvedAttribute;

  /**
   * Sets the element's classes. Call it at most once, while the handler runs; in dev mode, another
   * call throws.
   */
  resolve(classes: ClassBindingValue | ResolvedAttribute): void;
}

/**
 * Merges the classes of an element. It receives one argument per class, from the lowest to the
 * highest priority, and returns the element's classes.
 *
 * @experimental 22.3
 */
export type ClassResolver = (...classes: string[]) => string;

/**
 * Values that each source gives an attribute other than `class`, ordered from the lowest to the
 * highest priority, like `ClassSources`. An `(attr.x)` binding receives them as `$event.sources`.
 *
 * @experimental 22.3
 */
export type AttributeSources = readonly [
  component: readonly string[],
  directives: readonly string[],
  template: readonly string[],
];

/**
 * A value of an attribute: a string, or an array whose entries join with a space.
 *
 * The type rejects plain functions, and arrays that are also functions, through the `call` member
 * that every function has. A structural check can't reject every function, such as
 * `Object.assign(() => {}, ['a'], {call: undefined})`. In dev mode, a function that a handler
 * supplies throws `NG0320` at runtime.
 *
 * @experimental 22.3
 */
export type AttributeValue = string | (readonly string[] & {readonly call?: never});

/**
 * Merges the values of an attribute other than `class`. It receives one argument per value, from
 * the lowest to the highest priority, and returns the attribute's value, or `null` to remove the
 * attribute. For an attribute that holds a list of tokens, such as `rel` or `aria-describedby`, each
 * token is a value.
 *
 * @experimental 22.3
 */
export type AttributeResolver = (...values: string[]) => string | null;

/**
 * `$event` of an `(attr.x)` binding for an attribute other than `class` and `style`.
 *
 * If the handler doesn't call `resolve()`, an attribute that holds a list of tokens, such as
 * `aria-describedby`, takes the tokens of its sources without repeated ones, and any other attribute
 * takes the last value of its sources.
 *
 * @experimental 22.3
 */
export interface AttributeResolveEvent {
  /** Values that each source gives the attribute. */
  readonly sources: AttributeSources;

  /**
   * Merges the sources with `extras`, which rank at the end of the source of the binding that
   * calls it.
   */
  resolver(...extras: AttributeValue[]): ResolvedAttribute;

  /**
   * Sets the attribute's value; `null` removes the attribute. Call it at most once, while the
   * handler runs; in dev mode, another call throws.
   */
  resolve(value: AttributeValue | ResolvedAttribute | null): void;
}

/**
 * A value that holds style declarations, read the way a `[style]` binding reads it: a string holds
 * declarations separated by semicolons, an array lists strings that join with `; `, and an object
 * map keeps the properties whose values aren't `null`, `undefined`, or `''`. A trusted style, such
 * as one from `DomSanitizer.bypassSecurityTrustStyle`, reads as its string. `null` and `undefined`
 * add nothing.
 *
 * Besides object literals, objects that the runtime reads as maps are accepted, such as a map typed
 * by an interface or a `SafeStyle`, which index signatures alone would reject. Numbers and booleans
 * are rejected, and so are a `ResolvedAttribute` and iterables other than arrays, such as a `Set`
 * or a `Map`, whose entries the runtime wouldn't read as styles.
 *
 * The type rejects plain functions, and maps and arrays that are also functions, through the `call`
 * member that every function has. A structural check can't reject every function, such as
 * `Object.assign(() => {}, {call: undefined})`. In dev mode, a function that a handler supplies
 * throws `NG0320` at runtime.
 *
 * @experimental 22.3
 */
export type StyleBindingValue =
  | string
  | (readonly string[] & {readonly call?: never})
  | ({readonly [property: string]: unknown} & {
      readonly call?: never;
      readonly [Symbol.iterator]?: never;
      readonly [ɵRESOLVED_CLASSES_BRAND]?: never;
    })
  | (object & {
      readonly call?: never;
      readonly [Symbol.iterator]?: never;
      readonly [ɵRESOLVED_CLASSES_BRAND]?: never;
    })
  | null
  | undefined;

/**
 * The resolver of a `StyleResolveEvent`. It merges the event's sources with the extras, which rank
 * at the end of the source of the binding that calls it.
 *
 * @experimental 22.3
 */
export type BoundStyleResolver = (...extras: StyleBindingValue[]) => ResolvedAttribute;

/**
 * A function that computes an element's styles with the resolver of a `StyleResolveEvent`.
 *
 * @experimental 22.3
 */
export type StyleCallback = (s: BoundStyleResolver) => ResolvedAttribute;

/**
 * `$event` of a `(style)` or `(attr.style)` binding, which resolves the styles of its element.
 *
 * If the handler doesn't call `resolve()`, the element takes the declarations of its sources,
 * joined by `joinDeclarations`.
 *
 * @experimental 22.3
 */
export interface StyleResolveEvent {
  /** Declarations, such as `padding: 4px`, that each source gives the element, one per property. */
  readonly sources: AttributeSources;

  /**
   * Merges the sources with `extras`, which rank at the end of the source of the binding that
   * calls it.
   */
  resolver(...extras: StyleBindingValue[]): ResolvedAttribute;

  /**
   * Sets the element's styles; `null` removes the styles that the resolver set. Call it at most
   * once, while the handler runs; in dev mode, another call throws.
   */
  resolve(value: StyleBindingValue | ResolvedAttribute): void;
}

/** Handler compiled from a resolver binding, such as `(class)` or `(attr.role)`. */
export type AttributeResolverFn = (
  event: ClassResolveEvent | StyleResolveEvent | AttributeResolveEvent,
) => unknown;

/**
 * Flags of a `ɵɵattributeResolver` registration.
 *
 * NOTE: Ensure changes here are in sync with `packages/compiler/src/core.ts`.
 */
export const enum AttributeResolverFlags {
  /** The handler receives a resolve event. */
  FullForm = 1 << 0,

  /** The handler was compiled from a shorthand, whose result must come from its event. */
  Shorthand = 1 << 1,
}

/** How the entries of an attribute's sources are read, merged, and applied. */
export const enum AttributeGrammar {
  /** Class names, merged like `class`. */
  ClassList,

  /** Style declarations, one per property. */
  Declarations,

  /** Tokens separated by whitespace. */
  TokenList,

  /** One value per contributor. */
  Scalar,
}

/** Position of a source in `ClassSources`. */
export const enum AttributeSource {
  Component = 0,
  Directives = 1,
  Template = 2,
}

/** A binding that contributes to an attribute's sources. */
export interface TAttributeBinding {
  /**
   * `styling` for a `[class]`, `[class.name]`, `[style]`, or `[style.property]` binding,
   * `attribute` for an `[attr.x]` binding.
   */
  kind: 'styling' | 'attribute';

  /**
   * Binding index. The normalized value of a styling binding is read at `index + 1`, and the value
   * of an attribute binding at `index`.
   */
  index: number;
}

/**
 * A static style declaration: its canonical property name, its value and importance or `null` for
 * an empty value, and the declaration as sources hold it, or `null` for an empty value.
 */
export type TStaticStyle = [
  property: string,
  value: [value: string, important: boolean] | null,
  declaration: string | null,
];

/** Values contributed by one directive's host bindings or by the template. */
export interface TAttributeSourceSegment {
  /** Source under which the values are reported. */
  source: AttributeSource;

  /** Index of the `DirectiveDef` in `TView.data`, or `-1` for the template. */
  directiveIndex: number;

  /** Static values from the directive's `hostAttrs` or the element's `attrs`. */
  statics: string[];

  /**
   * The static declarations of a `style` resolver, read once from `statics` in the same order, or
   * `null` for another attribute.
   */
  staticStyles: TStaticStyle[] | null;

  /**
   * The segment's bindings: styling bindings in execution order, which is their priority order,
   * followed by attribute bindings in execution order.
   */
  bindings: TAttributeBinding[];
}

/**
 * Offsets of an element's per-instance state for one resolved attribute in the `LView`, from
 * `TAttributeResolver.index`.
 */
export const enum AttributeResolverSlot {
  /** The `AttributeResolverFn`s registered by `ɵɵattributeResolver`, in the order of `owners`. */
  ResolverFns = 0,

  /**
   * For `class`, the `KeyValueArray` of the classes applied by the previous resolution. Before the
   * first resolution, it holds the classes of an element claimed by hydration, or `null` if the
   * element still has the static classes it was created with.
   *
   * For `style`, the declarations applied by the previous resolution, in a `Map` keyed by property
   * in the order that they apply. Before the first resolution, it's `true` for an element claimed
   * by hydration, or `null` while the element has the static styles it was created with.
   *
   * For an attribute with one value or a list of tokens, the value applied by the previous
   * resolution, or `false` if it removed the attribute. Before the first resolution, it's `null`,
   * and the element's attribute is the previous value.
   */
  AppliedValue = 1,

  /**
   * The resolver of the attribute that each registration's owner injects, in the order of `owners`,
   * or `null` for the built-in rule.
   */
  Resolvers = 2,
}

/**
 * Data shared by all instances of an element whose attribute `name` is computed by a resolver
 * binding.
 */
export interface TAttributeResolver {
  name: string;
  grammar: AttributeGrammar;

  /** Index of the per-instance state in the `LView`. See `AttributeResolverSlot`. */
  index: number;

  /**
   * Owner of each registered resolver, from the lowest to the highest priority: the index of the
   * `DirectiveDef` in `TView.data`, or `-1` for the template.
   */
  owners: number[];

  /** `AttributeResolverFlags` of each registered resolver, in the order of `owners`. */
  flags: AttributeResolverFlags[];

  /** One segment per directive followed by the template's, from the lowest to the highest priority. */
  segments: TAttributeSourceSegment[];
}
