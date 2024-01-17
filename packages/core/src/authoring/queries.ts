/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ProviderToken} from '../di';
import {Signal} from '../render3/reactivity/api';

function viewChildFn<V>(locator: ProviderToken<V>|string): Signal<V|undefined>;
function viewChildFn<V, T>(
    locator: ProviderToken<T>|string, opts: {read: ProviderToken<V>}): Signal<V|undefined>;
function viewChildFn<V, T>(
    locator: ProviderToken<T>|string, opts?: {read?: ProviderToken<V>}): Signal<V|undefined> {
  return null! as Signal<V|undefined>;
}

function viewChildRequiredFn<V>(locator: ProviderToken<V>|string): Signal<V>;
function viewChildRequiredFn<V, T>(
    locator: ProviderToken<T>|string, opts: {read: ProviderToken<V>}): Signal<V>;
function viewChildRequiredFn<V, T>(
    locator: ProviderToken<T>|string, opts?: {read?: ProviderToken<V>}): Signal<V> {
  return null! as Signal<V>;
}

/**
 * Type of the `viewChild` function.
 *
 * The viewChild function creates a singular view query. It is a special function that also provides
 * access to required query results via the `.required` property.
 */
export type ViewChildFunction = typeof viewChildFn&{required: typeof viewChildRequiredFn};

/**
 * Initializes a view child query. Consider using `viewChild.required` for queries that should
 * always match.
 *
 * @usageNotes
 * Create a child query in your component by declaring a
 * class field and initializing it with the `viewChild()` function.
 *
 * ```ts
 * @Component({template: '<div #el></div><my-component #cmp />'})
 * export class TestComponent {
 *   divEl = viewChild<ElementRef>('el');                   // Signal<ElementRef|undefined>
 *   divElRequired = viewChild.required<ElementRef>('el');  // Signal<ElementRef>
 *   cmp = viewChild(MyComponent);                          // Signal<MyComponent|undefined>
 *   cmpRequired = viewChild.required(MyComponent);         // Signal<MyComponent>
 * }
 * ```
 */
export const viewChild: ViewChildFunction = (() => {
  // Note: This may be considered a side-effect, but nothing will depend on
  // this assignment, unless this `viewChild` constant export is accessed. It's a
  // self-contained side effect that is local to the user facing `viewChild` export.
  (viewChildFn as any).required = viewChildRequiredFn;
  return viewChildFn as ViewChildFunction;
})();

export function viewChildren<V>(locator: ProviderToken<V>|string): Signal<ReadonlyArray<V>>;
export function viewChildren<V, T>(
    locator: ProviderToken<T>|string, opts: {read: ProviderToken<V>}): Signal<ReadonlyArray<V>>;
/**
 * Initializes a view children query. Query results are represented as a signal of a read-only
 * collection containing all matched elements.
 *
 * @usageNotes
 * Create a children query in your component by declaring a
 * class field and initializing it with the `viewChildren()` function.
 *
 * ```ts
 * @Component({...})
 * export class TestComponent {
 *   divEls = viewChildren<ElementRef>('el');   // Signal<ReadonlyArray<ElementRef>>
 *   cmps = viewChildren.required(MyComponent); // Signal<ReadonlyArray<MyComponent>>
 * }
 * ```
 */
export function viewChildren<V, T>(
    locator: ProviderToken<T>|string, opts?: {read?: ProviderToken<V>}): Signal<ReadonlyArray<V>> {
  return null!;
}

export function contentChildFn<V>(
    locator: ProviderToken<V>|string, opts?: {descendants?: boolean}): Signal<V|undefined>;
export function contentChildFn<V, T>(
    locator: ProviderToken<T>|string,
    opts: {descendants?: boolean, read: ProviderToken<V>}): Signal<V|undefined>;
export function contentChildFn<V, T>(
    locator: ProviderToken<T>|string,
    opts?: {descendants?: boolean, read?: ProviderToken<V>}): Signal<V|undefined> {
  return null!;
}

function contentChildRequiredFn<V>(
    locator: ProviderToken<V>|string, opts?: {descendants?: boolean}): Signal<V>;
function contentChildRequiredFn<V, T>(
    locator: ProviderToken<T>|string,
    opts: {descendants?: boolean, read: ProviderToken<V>}): Signal<V>;
function contentChildRequiredFn<V, T>(
    locator: ProviderToken<T>|string,
    opts?: {descendants?: boolean, read?: ProviderToken<V>}): Signal<V> {
  return null!;
}

/**
 * Type of the `contentChild` function.
 *
 * The contentChild function creates a singular content query. It is a special function that also
 * provides access to required query results via the `.required` property.
 */
export type ContentChildFunction = typeof contentChildFn&{required: typeof contentChildRequiredFn};

/**
 * Initializes a content child query. Consider using `contentChild.required` for queries that should
 * always match.
 *
 * @usageNotes
 * Create a child query in your component by declaring a
 * class field and initializing it with the `contentChild()` function.
 *
 * ```ts
 * @Component({...})
 * export class TestComponent {
 *   headerEl = contentChild<ElementRef>('h');                    // Signal<ElementRef|undefined>
 *   headerElElRequired = contentChild.required<ElementRef>('h'); // Signal<ElementRef>
 *   header = contentChild(MyHeader);                             // Signal<MyHeader|undefined>
 *   headerRequired = contentChild.required(MyHeader);            // Signal<MyHeader>
 * }
 * ```
 */
export const contentChild: ContentChildFunction = (() => {
  // Note: This may be considered a side-effect, but nothing will depend on
  // this assignment, unless this `viewChild` constant export is accessed. It's a
  // self-contained side effect that is local to the user facing `viewChild` export.
  (contentChildFn as any).required = contentChildRequiredFn;
  return contentChildFn as ContentChildFunction;
})();

/**
 * Initializes a content children query. Query results are represented as a signal of a read-only
 * collection containing all matched elements.
 *
 * @usageNotes
 * Create a children query in your component by declaring a
 * class field and initializing it with the `contentChildren()` function.
 *
 * ```ts
 * @Component({...})
 * export class TestComponent {
 *   headerEl = contentChildren<ElementRef>('h');   // Signal<ReadonlyArray<ElementRef>>
 *   header = contentChildren.required(MyHeader);   // Signal<ReadonlyArray<MyHeader>>
 * }
 * ```
 */
export function contentChildren<V>(
    locator: ProviderToken<V>|string, opts?: {descendants?: boolean}): Signal<ReadonlyArray<V>>;
export function contentChildren<V, T>(
    locator: ProviderToken<T>|string,
    opts: {descendants?: boolean, read: ProviderToken<V>}): Signal<ReadonlyArray<V>>;
export function contentChildren<V, T>(
    locator: ProviderToken<T>|string,
    opts?: {descendants?: boolean, read?: ProviderToken<V>}): Signal<ReadonlyArray<V>> {
  return null!;
}
