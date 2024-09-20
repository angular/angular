/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {ProviderToken} from '../di/provider_token';
import {makePropDecorator} from '../util/decorators';

/**
 * Type of the `Attribute` decorator / constructor function.
 *
 * @publicApi
 */
export interface AttributeDecorator {
  /**
   * Specifies that a constant attribute value should be injected.
   *
   * The directive can inject constant string literals of host element attributes.
   *
   * @usageNotes
   *
   * Suppose we have an `<input>` element and want to know its `type`.
   *
   * ```html
   * <input type="text">
   * ```
   *
   * A decorator can inject string literal `text` as in the following example.
   *
   * {@example core/ts/metadata/metadata.ts region='attributeMetadata'}
   *
   * @publicApi
   */
  (name: string): any;
  new (name: string): Attribute;
}

/**
 * Type of the Attribute metadata.
 *
 * @publicApi
 */
export interface Attribute {
  /**
   * The name of the attribute to be injected into the constructor.
   */
  attributeName?: string;
}

/**
 * Type of the Query metadata.
 *
 * @publicApi
 */
export interface Query {
  descendants: boolean;
  emitDistinctChangesOnly: boolean;
  first: boolean;
  read: any;
  isViewQuery: boolean;
  selector: any;
  static?: boolean;

  /**
   * @internal
   *
   * Whether the query is a signal query.
   *
   * This option exists for JIT compatibility. Users are not expected to use this.
   * Angular needs a way to capture queries from classes so that the internal query
   * functions can be generated. This needs to happen before the component is instantiated.
   * Due to this, for JIT compilation, signal queries need an additional decorator
   * declaring the query. Angular provides a TS transformer to automatically handle this
   * for JIT usage (e.g. in tests).
   */
  isSignal?: boolean;
}

// Stores the default value of `emitDistinctChangesOnly` when the `emitDistinctChangesOnly` is not
// explicitly set.
export const emitDistinctChangesOnlyDefaultValue = true;

/**
 * Base class for query metadata.
 *
 * @see {@link ContentChildren}
 * @see {@link ContentChild}
 * @see {@link ViewChildren}
 * @see {@link ViewChild}
 *
 * @publicApi
 */
export abstract class Query {}

/**
 * Type of the ContentChildren decorator / constructor function.
 *
 * @see {@link ContentChildren}
 * @publicApi
 */
export interface ContentChildrenDecorator {
  /**
   * @description
   * Property decorator that configures a content query.
   *
   * Use to get the `QueryList` of elements or directives from the content DOM.
   * Any time a child element is added, removed, or moved, the query list will be
   * updated, and the changes observable of the query list will emit a new value.
   *
   * Content queries are set before the `ngAfterContentInit` callback is called.
   *
   * Does not retrieve elements or directives that are in other components' templates,
   * since a component's template is always a black box to its ancestors.
   *
   * **Metadata Properties**:
   *
   * * **selector** - The directive type or the name used for querying.
   * * **descendants** - If `true` include all descendants of the element. If `false` then only
   * query direct children of the element.
   * * **emitDistinctChangesOnly** - The ` QueryList#changes` observable will emit new values only
   *   if the QueryList result has changed. When `false` the `changes` observable might emit even
   *   if the QueryList has not changed.
   *   ** Note: *** This config option is **deprecated**, it will be permanently set to `true` and
   *   removed in future versions of Angular.
   * * **read** - Used to read a different token from the queried elements.
   *
   * The following selectors are supported.
   *   * Any class with the `@Component` or `@Directive` decorator
   *   * A template reference variable as a string (e.g. query `<my-component #cmp></my-component>`
   * with `@ContentChildren('cmp')`)
   *   * Any provider defined in the child component tree of the current component (e.g.
   * `@ContentChildren(SomeService) someService: SomeService`)
   *   * Any provider defined through a string token (e.g. `@ContentChildren('someToken')
   * someTokenVal: any`)
   *   * A `TemplateRef` (e.g. query `<ng-template></ng-template>` with
   * `@ContentChildren(TemplateRef) template;`)
   *
   * In addition, multiple string selectors can be separated with a comma (e.g.
   * `@ContentChildren('cmp1,cmp2')`)
   *
   * The following values are supported by `read`:
   *   * Any class with the `@Component` or `@Directive` decorator
   *   * Any provider defined on the injector of the component that is matched by the `selector` of
   * this query
   *   * Any provider defined through a string token (e.g. `{provide: 'token', useValue: 'val'}`)
   *   * `TemplateRef`, `ElementRef`, and `ViewContainerRef`
   *
   * @usageNotes
   *
   * Here is a simple demonstration of how the `ContentChildren` decorator can be used.
   *
   * {@example core/di/ts/contentChildren/content_children_howto.ts region='HowTo'}
   *
   * ### Tab-pane example
   *
   * Here is a slightly more realistic example that shows how `ContentChildren` decorators
   * can be used to implement a tab pane component.
   *
   * {@example core/di/ts/contentChildren/content_children_example.ts region='Component'}
   *
   * @Annotation
   */
  (
    selector: ProviderToken<unknown> | Function | string,
    opts?: {
      descendants?: boolean;
      emitDistinctChangesOnly?: boolean;
      read?: any;
    },
  ): any;
  new (
    selector: ProviderToken<unknown> | Function | string,
    opts?: {descendants?: boolean; emitDistinctChangesOnly?: boolean; read?: any},
  ): Query;
}

/**
 * Type of the ContentChildren metadata.
 *
 *
 * @Annotation
 * @publicApi
 */
export type ContentChildren = Query;

/**
 * ContentChildren decorator and metadata.
 *
 *
 * @Annotation
 * @publicApi
 */
export const ContentChildren: ContentChildrenDecorator = makePropDecorator(
  'ContentChildren',
  (selector?: any, opts: any = {}) => ({
    selector,
    first: false,
    isViewQuery: false,
    descendants: false,
    emitDistinctChangesOnly: emitDistinctChangesOnlyDefaultValue,
    ...opts,
  }),
  Query,
);

/**
 * Type of the ContentChild decorator / constructor function.
 *
 * @publicApi
 */
export interface ContentChildDecorator {
  /**
   * @description
   * Property decorator that configures a content query.
   *
   * Use to get the first element or the directive matching the selector from the content DOM.
   * If the content DOM changes, and a new child matches the selector,
   * the property will be updated.
   *
   * Does not retrieve elements or directives that are in other components' templates,
   * since a component's template is always a black box to its ancestors.
   *
   * **Metadata Properties**:
   *
   * * **selector** - The directive type or the name used for querying.
   * * **descendants** - If `true` (default) include all descendants of the element. If `false` then
   * only query direct children of the element.
   * * **read** - Used to read a different token from the queried element.
   * * **static** - True to resolve query results before change detection runs,
   * false to resolve after change detection. Defaults to false.
   *
   * The following selectors are supported.
   *   * Any class with the `@Component` or `@Directive` decorator
   *   * A template reference variable as a string (e.g. query `<my-component #cmp></my-component>`
   * with `@ContentChild('cmp')`)
   *   * Any provider defined in the child component tree of the current component (e.g.
   * `@ContentChild(SomeService) someService: SomeService`)
   *   * Any provider defined through a string token (e.g. `@ContentChild('someToken') someTokenVal:
   * any`)
   *   * A `TemplateRef` (e.g. query `<ng-template></ng-template>` with `@ContentChild(TemplateRef)
   * template;`)
   *
   * The following values are supported by `read`:
   *   * Any class with the `@Component` or `@Directive` decorator
   *   * Any provider defined on the injector of the component that is matched by the `selector` of
   * this query
   *   * Any provider defined through a string token (e.g. `{provide: 'token', useValue: 'val'}`)
   *   * `TemplateRef`, `ElementRef`, and `ViewContainerRef`
   *
   * Difference between dynamic and static queries:
   *
   * | Queries                             | Details |
   * |:---                                 |:---     |
   * | Dynamic queries \(`static: false`\) | The query resolves before the `ngAfterContentInit()`
   * callback is called. The result will be updated for changes to your view, such as changes to
   * `ngIf` and `ngFor` blocks. | | Static queries \(`static: true`\)   | The query resolves once
   * the view has been created, but before change detection runs (before the `ngOnInit()` callback
   * is called). The result, though, will never be updated to reflect changes to your view, such as
   * changes to `ngIf` and `ngFor` blocks.  |
   *
   * @usageNotes
   *
   * {@example core/di/ts/contentChild/content_child_howto.ts region='HowTo'}
   *
   * ### Example
   *
   * {@example core/di/ts/contentChild/content_child_example.ts region='Component'}
   *
   * @Annotation
   */
  (
    selector: ProviderToken<unknown> | Function | string,
    opts?: {descendants?: boolean; read?: any; static?: boolean},
  ): any;
  new (
    selector: ProviderToken<unknown> | Function | string,
    opts?: {descendants?: boolean; read?: any; static?: boolean},
  ): ContentChild;
}

/**
 * Type of the ContentChild metadata.
 *
 * @publicApi
 */
export type ContentChild = Query;

/**
 * ContentChild decorator and metadata.
 *
 *
 * @Annotation
 *
 * @publicApi
 */
export const ContentChild: ContentChildDecorator = makePropDecorator(
  'ContentChild',
  (selector?: any, opts: any = {}) => ({
    selector,
    first: true,
    isViewQuery: false,
    descendants: true,
    ...opts,
  }),
  Query,
);

/**
 * Type of the ViewChildren decorator / constructor function.
 *
 * @see {@link ViewChildren}
 *
 * @publicApi
 */
export interface ViewChildrenDecorator {
  /**
   * @description
   * Property decorator that configures a view query.
   *
   * Use to get the `QueryList` of elements or directives from the view DOM.
   * Any time a child element is added, removed, or moved, the query list will be updated,
   * and the changes observable of the query list will emit a new value.
   *
   * View queries are set before the `ngAfterViewInit` callback is called.
   *
   * **Metadata Properties**:
   *
   * * **selector** - The directive type or the name used for querying.
   * * **read** - Used to read a different token from the queried elements.
   * * **emitDistinctChangesOnly** - The ` QueryList#changes` observable will emit new values only
   *   if the QueryList result has changed. When `false` the `changes` observable might emit even
   *   if the QueryList has not changed.
   *   ** Note: *** This config option is **deprecated**, it will be permanently set to `true` and
   * removed in future versions of Angular.
   *
   * The following selectors are supported.
   *   * Any class with the `@Component` or `@Directive` decorator
   *   * A template reference variable as a string (e.g. query `<my-component #cmp></my-component>`
   * with `@ViewChildren('cmp')`)
   *   * Any provider defined in the child component tree of the current component (e.g.
   * `@ViewChildren(SomeService) someService!: SomeService`)
   *   * Any provider defined through a string token (e.g. `@ViewChildren('someToken')
   * someTokenVal!: any`)
   *   * A `TemplateRef` (e.g. query `<ng-template></ng-template>` with `@ViewChildren(TemplateRef)
   * template;`)
   *
   * In addition, multiple string selectors can be separated with a comma (e.g.
   * `@ViewChildren('cmp1,cmp2')`)
   *
   * The following values are supported by `read`:
   *   * Any class with the `@Component` or `@Directive` decorator
   *   * Any provider defined on the injector of the component that is matched by the `selector` of
   * this query
   *   * Any provider defined through a string token (e.g. `{provide: 'token', useValue: 'val'}`)
   *   * `TemplateRef`, `ElementRef`, and `ViewContainerRef`
   *
   * @usageNotes
   *
   * {@example core/di/ts/viewChildren/view_children_howto.ts region='HowTo'}
   *
   * ### Another example
   *
   * {@example core/di/ts/viewChildren/view_children_example.ts region='Component'}
   *
   * @Annotation
   */
  (
    selector: ProviderToken<unknown> | Function | string,
    opts?: {read?: any; emitDistinctChangesOnly?: boolean},
  ): any;
  new (
    selector: ProviderToken<unknown> | Function | string,
    opts?: {read?: any; emitDistinctChangesOnly?: boolean},
  ): ViewChildren;
}

/**
 * Type of the ViewChildren metadata.
 *
 * @publicApi
 */
export type ViewChildren = Query;

/**
 * ViewChildren decorator and metadata.
 *
 * @Annotation
 * @publicApi
 */
export const ViewChildren: ViewChildrenDecorator = makePropDecorator(
  'ViewChildren',
  (selector?: any, opts: any = {}) => ({
    selector,
    first: false,
    isViewQuery: true,
    descendants: true,
    emitDistinctChangesOnly: emitDistinctChangesOnlyDefaultValue,
    ...opts,
  }),
  Query,
);

/**
 * Type of the ViewChild decorator / constructor function.
 *
 * @see {@link ViewChild}
 * @publicApi
 */
export interface ViewChildDecorator {
  /**
   * @description
   * Property decorator that configures a view query.
   * The change detector looks for the first element or the directive matching the selector
   * in the view DOM. If the view DOM changes, and a new child matches the selector,
   * the property is updated.
   *
   * **Metadata Properties**:
   *
   * * **selector** - The directive type or the name used for querying.
   * * **read** - Used to read a different token from the queried elements.
   * * **static** - `true` to resolve query results before change detection runs,
   * `false` to resolve after change detection. Defaults to `false`.
   *
   *
   * The following selectors are supported.
   *   * Any class with the `@Component` or `@Directive` decorator
   *   * A template reference variable as a string (e.g. query `<my-component #cmp></my-component>`
   * with `@ViewChild('cmp')`)
   *   * Any provider defined in the child component tree of the current component (e.g.
   * `@ViewChild(SomeService) someService: SomeService`)
   *   * Any provider defined through a string token (e.g. `@ViewChild('someToken') someTokenVal:
   * any`)
   *   * A `TemplateRef` (e.g. query `<ng-template></ng-template>` with `@ViewChild(TemplateRef)
   * template;`)
   *
   * The following values are supported by `read`:
   *   * Any class with the `@Component` or `@Directive` decorator
   *   * Any provider defined on the injector of the component that is matched by the `selector` of
   * this query
   *   * Any provider defined through a string token (e.g. `{provide: 'token', useValue: 'val'}`)
   *   * `TemplateRef`, `ElementRef`, and `ViewContainerRef`
   *
   * Difference between dynamic and static queries:
   *   * Dynamic queries \(`static: false`\) - The query resolves before the `ngAfterViewInit()`
   * callback is called. The result will be updated for changes to your view, such as changes to
   * `ngIf` and `ngFor` blocks.
   *   * Static queries \(`static: true`\) - The query resolves once
   * the view has been created, but before change detection runs (before the `ngOnInit()` callback
   * is called). The result, though, will never be updated to reflect changes to your view, such as
   * changes to `ngIf` and `ngFor` blocks.
   *
   * @usageNotes
   *
   * ### Example 1
   *
   * {@example core/di/ts/viewChild/view_child_example.ts region='Component'}
   *
   * ### Example 2
   *
   * {@example core/di/ts/viewChild/view_child_howto.ts region='HowTo'}
   *
   * @Annotation
   */
  (
    selector: ProviderToken<unknown> | Function | string,
    opts?: {read?: any; static?: boolean},
  ): any;
  new (
    selector: ProviderToken<unknown> | Function | string,
    opts?: {read?: any; static?: boolean},
  ): ViewChild;
}

/**
 * Type of the ViewChild metadata.
 *
 * @publicApi
 */
export type ViewChild = Query;

/**
 * ViewChild decorator and metadata.
 *
 * @Annotation
 * @publicApi
 */
export const ViewChild: ViewChildDecorator = makePropDecorator(
  'ViewChild',
  (selector: any, opts: any) => ({
    selector,
    first: true,
    isViewQuery: true,
    descendants: true,
    ...opts,
  }),
  Query,
);
