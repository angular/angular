/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {assertInInjectionContext} from '../di';
import {
  createMultiResultQuerySignalFn,
  createSingleResultOptionalQuerySignalFn,
  createSingleResultRequiredQuerySignalFn,
} from '../render3/queries/query_reactive';
function viewChildFn(locator, opts) {
  ngDevMode && assertInInjectionContext(viewChild);
  return createSingleResultOptionalQuerySignalFn(opts);
}
function viewChildRequiredFn(locator, opts) {
  ngDevMode && assertInInjectionContext(viewChild);
  return createSingleResultRequiredQuerySignalFn(opts);
}
/**
 * Initializes a view child query.
 *
 * Consider using `viewChild.required` for queries that should always match.
 *
 * @usageNotes
 * Create a child query in your component by declaring a
 * class field and initializing it with the `viewChild()` function.
 *
 * ```angular-ts
 * @Component({template: '<div #el></div><my-component #cmp />'})
 * export class TestComponent {
 *   divEl = viewChild<ElementRef>('el');                   // Signal<ElementRef|undefined>
 *   divElRequired = viewChild.required<ElementRef>('el');  // Signal<ElementRef>
 *   cmp = viewChild(MyComponent);                          // Signal<MyComponent|undefined>
 *   cmpRequired = viewChild.required(MyComponent);         // Signal<MyComponent>
 * }
 * ```
 *
 * @publicApi 19.0
 * @initializerApiFunction
 */
export const viewChild = (() => {
  // Note: This may be considered a side-effect, but nothing will depend on
  // this assignment, unless this `viewChild` constant export is accessed. It's a
  // self-contained side effect that is local to the user facing `viewChild` export.
  viewChildFn.required = viewChildRequiredFn;
  return viewChildFn;
})();
/**
 * Initializes a view children query.
 *
 * Query results are represented as a signal of a read-only collection containing all matched
 * elements.
 *
 * @usageNotes
 * Create a children query in your component by declaring a
 * class field and initializing it with the `viewChildren()` function.
 *
 * ```ts
 * @Component({...})
 * export class TestComponent {
 *   divEls = viewChildren<ElementRef>('el');   // Signal<ReadonlyArray<ElementRef>>
 * }
 * ```
 *
 * @initializerApiFunction
 * @publicApi 19.0
 */
export function viewChildren(locator, opts) {
  ngDevMode && assertInInjectionContext(viewChildren);
  return createMultiResultQuerySignalFn(opts);
}
export function contentChildFn(locator, opts) {
  ngDevMode && assertInInjectionContext(contentChild);
  return createSingleResultOptionalQuerySignalFn(opts);
}
function contentChildRequiredFn(locator, opts) {
  ngDevMode && assertInInjectionContext(contentChildren);
  return createSingleResultRequiredQuerySignalFn(opts);
}
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
 *
 * Note: By default `descendants` is `true` which means the query will traverse all descendants in the same template.
 *
 * @initializerApiFunction
 * @publicApi 19.0
 */
export const contentChild = (() => {
  // Note: This may be considered a side-effect, but nothing will depend on
  // this assignment, unless this `viewChild` constant export is accessed. It's a
  // self-contained side effect that is local to the user facing `viewChild` export.
  contentChildFn.required = contentChildRequiredFn;
  return contentChildFn;
})();
/**
 * Initializes a content children query.
 *
 * Query results are represented as a signal of a read-only collection containing all matched
 * elements.
 *
 * @usageNotes
 * Create a children query in your component by declaring a
 * class field and initializing it with the `contentChildren()` function.
 *
 * ```ts
 * @Component({...})
 * export class TestComponent {
 *   headerEl = contentChildren<ElementRef>('h');   // Signal<ReadonlyArray<ElementRef>>
 * }
 * ```
 *
 * Note: By default `descendants` is `false` which means the query will not traverse all descendants in the same template.
 *
 * @initializerApiFunction
 * @publicApi 19.0
 */
export function contentChildren(locator, opts) {
  return createMultiResultQuerySignalFn(opts);
}
//# sourceMappingURL=queries.js.map
