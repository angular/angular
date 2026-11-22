/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

/**
 * Augmentable registry for custom elements in Angular templates.
 *
 * This interface is intentionally part of the public API (without a `ɵ` prefix) because it is
 * designed to be augmented via `declare module '@angular/core'` by application authors and
 * external ecosystem tooling (such as Custom Elements Manifest to `.d.ts` generators) to provide
 * element types, attributes, and events for custom element tag names without requiring compiler
 * plugins.
 *
 * @example
 * ```ts
 * declare module '@angular/core' {
 *   interface NgCustomElements {
 *     'my-dialog': {
 *       element: MyDialogElement;
 *       attributes: { 'open'?: boolean | string };
 *       events: { 'closed': CustomEvent<void> };
 *     };
 *   }
 * }
 * ```
 *
 * @publicApi
 */
export interface NgCustomElements {}

type ɵValidCustomElementKeys<T> = [undefined] extends [{}]
  ? keyof {[K in keyof T as [T[K]] extends [never] ? never : K]: any}
  : keyof {
      [
        K in keyof T as [undefined] extends [T[K]]
          ? never
          : [null] extends [T[K]]
            ? never
            : [T[K]] extends [never]
              ? never
              : K
      ]: any;
    };

type ɵTagNameMapElement<T extends string> = T extends keyof HTMLElementTagNameMap
  ? [NonNullable<HTMLElementTagNameMap[T]>] extends [never]
    ? HTMLElement
    : NonNullable<HTMLElementTagNameMap[T]>
  : HTMLElement;

type ɵRawNgAttributeType<T extends string, Attr extends string> = T extends keyof NgCustomElements
  ? 'attributes' extends keyof NgCustomElements[T]
    ? Attr extends keyof NonNullable<NgCustomElements[T]['attributes']>
      ? NonNullable<NgCustomElements[T]['attributes']>[Attr]
      : unknown
    : unknown
  : unknown;

type ɵIsCustomElementKnown<T extends string> =
  T extends ɵValidCustomElementKeys<NgCustomElements>
    ? true
    : T extends ɵValidCustomElementKeys<HTMLElementTagNameMap>
      ? true
      : false;

/**
 * Resolves the element instance type for a custom element tag name by checking
 * `NgCustomElements` first (when `element` is specified) and falling back to
 * `HTMLElementTagNameMap`.
 *
 * @codeGenApi
 */
export type ɵNgElementType<T extends string> = T extends keyof NgCustomElements
  ? 'element' extends keyof NgCustomElements[T]
    ? [NonNullable<NgCustomElements[T]['element']>] extends [never]
      ? ɵTagNameMapElement<T>
      : NonNullable<NgCustomElements[T]['element']>
    : ɵTagNameMapElement<T>
  : ɵTagNameMapElement<T>;

/**
 * Resolves the type of an HTML attribute (static or `[attr.*]`) on a custom element from
 * `NgCustomElements`. Returns `unknown` when the tag or attribute is not declared in
 * `NgCustomElements`. Allows the empty string `""` for attributes whose declared type accepts
 * `boolean`, matching both HTML boolean presence attributes (`<my-dialog open>`) and Angular's
 * idiomatic boolean attribute binding (`[attr.open]="isOpen ? '' : null"`).
 *
 * @codeGenApi
 */
export type ɵNgAttributeType<T extends string, Attr extends string> =
  boolean extends ɵRawNgAttributeType<T, Attr>
    ? ɵRawNgAttributeType<T, Attr> | ''
    : ɵRawNgAttributeType<T, Attr>;

/**
 * Resolves the event listener target for a custom element event binding.
 * If `NgCustomElements[T]['events'][EventName]` is declared, returns an object whose
 * `addEventListener` provides that scoped event type; otherwise falls back to `El` so custom
 * `addEventListener` overloads on the element class (e.g. from `HTMLElementTagNameMap`) and
 * standard `HTMLElementEventMap` types are preserved.
 *
 * @codeGenApi
 */
export type ɵNgEventTarget<
  T extends string,
  EventName extends string,
  El,
> = T extends keyof NgCustomElements
  ? 'events' extends keyof NgCustomElements[T]
    ? EventName extends keyof NonNullable<NgCustomElements[T]['events']>
      ? {
          addEventListener(
            type: EventName,
            listener: (ev: Required<NonNullable<NgCustomElements[T]['events']>>[EventName]) => any,
          ): void;
        }
      : El
    : El
  : El;

/**
 * Resolves the property target for a custom element. If the element is known in
 * `NgCustomElements` or `HTMLElementTagNameMap`, returns its element type; otherwise
 * returns `any` so unknown elements (already reported via `ɵassertCustomElement` or
 * allowed under `CUSTOM_ELEMENTS_SCHEMA`) do not emit secondary `HTMLElement` errors.
 *
 * @codeGenApi
 */
export type ɵNgPropertyTarget<T extends string> =
  ɵIsCustomElementKnown<T> extends true ? ɵNgElementType<T> : any;

/**
 * Asserts that a custom element tag name is known in `NgCustomElements` or `HTMLElementTagNameMap`.
 * Emits a type error during downstream TypeScript compilation when an unknown custom element
 * is used without `CUSTOM_ELEMENTS_SCHEMA`.
 *
 * @codeGenApi
 */
export function ɵassertCustomElement<
  T extends
    ɵValidCustomElementKeys<HTMLElementTagNameMap> | ɵValidCustomElementKeys<NgCustomElements>,
>(tagName: T, isStandalone?: boolean): void {}

/**
 * Utility function used during template type checking to assert that a value is of a certain type.
 * @codeGenApi
 */
export function ɵassertType<T>(value: unknown): asserts value is T {}
