/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {InjectionToken} from '../di/injection_token';
import {Type} from '../interface/type';
import {makePropDecorator} from '../util/decorators';

/**
 * A DI token that you can use to create a virtual [provider](guide/glossary#provider)
 * that will populate the `entryComponents` field of components and NgModules
 * based on its `useValue` property value.
 * All components that are referenced in the `useValue` value (either directly
 * or in a nested array or map) are added to the `entryComponents` property.
 *
 * @usageNotes
 *
 * The following example shows how the router can populate the `entryComponents`
 * field of an NgModule based on a router configuration that refers
 * to components.
 *
 * ```typescript
 * // helper function inside the router
 * function provideRoutes(routes) {
 *   return [
 *     {provide: ROUTES, useValue: routes},
 *     {provide: ANALYZE_FOR_ENTRY_COMPONENTS, useValue: routes, multi: true}
 *   ];
 * }
 *
 * // user code
 * let routes = [
 *   {path: '/root', component: RootComp},
 *   {path: '/teams', component: TeamsComp}
 * ];
 *
 * @NgModule({
 *   providers: [provideRoutes(routes)]
 * })
 * class ModuleWithRoutes {}
 * ```
 *
 * @publicApi
 */
export const ANALYZE_FOR_ENTRY_COMPONENTS = new InjectionToken<any>('AnalyzeForEntryComponents');

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
   * <code-example path="core/ts/metadata/metadata.ts"
   * region='attributeMetadata' linenums="false"></code-example>
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
  first: boolean;
  read: any;
  isViewQuery: boolean;
  selector: any;
  static: boolean;
}

/**
 * Base class for query metadata.
 *
 * @see `ContentChildren`.
 * @see `ContentChild`.
 * @see `ViewChildren`.
 * @see `ViewChild`.
 *
 * @publicApi
 */
export abstract class Query {}

/**
 * Type of the ContentChildren decorator / constructor function.
 *
 * @see `ContentChildren`.
 * @publicApi
 */
export interface ContentChildrenDecorator {
  /**
   * Configures a content query.
   *
   * You can use ContentChildren to get the `QueryList` of elements or directives from the
   * content DOM. Any time a child element is added, removed, or moved, the query list will be
   * updated, and the changes observable of the query list will emit a new value.
   *
   * Content queries are set before the `ngAfterContentInit` callback is called.
   *
   * | Metadata Property | Description |
   * | :--------------- | :-------------------- |
   * | selector | The directive type or the name used for querying. |
   * | descendants | When true, include only direct children or all descendants. |
   * | read | Read a different token from the queried elements. |
   *
   * @usageNotes
   * ### Basic Example
   *
   * Here is a simple demonstration of how the `ContentChildren` decorator can be used.
   *
   * <code-example path="core/di/ts/contentChildren/content_children_howto.ts"
   * region='HowTo' linenums="false"></code-example>
   *
   * ### Tab-pane Example
   *
   * Here is a slightly more realistic example that shows how `ContentChildren` decorators
   * can be used to implement a tab pane component.
   *
   * <code-example path="core/di/ts/contentChildren/content_children_example.ts"
   * region='Component' linenums="false"></code-example>
   *
   * @Annotation
   */
  (selector: Type<any>|Function|string, opts?: {descendants?: boolean, read?: any}): any;
  new (selector: Type<any>|Function|string, opts?: {descendants?: boolean, read?: any}): Query;
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
    (selector?: any, data: any = {}) =>
        ({selector, first: false, isViewQuery: false, descendants: false, ...data}),
    Query);

/**
 * Type of the ContentChild decorator / constructor function.
 *
 * @publicApi
 */
export interface ContentChildDecorator {
  /**
   * Configures a content query.
   *
   * You can use ContentChild to get the first element or the directive matching the selector from
   * the content DOM. If the content DOM changes, and a new child matches the selector,
   * the property will be updated.
   *
   * Content queries are set before the `ngAfterContentInit` callback is called.
   *
   * | Metadata Property | Description |
   * | :--------------- | :-------------------- |
   * | selector | The directive type or the name used for querying. |
   * | read | Read a different token from the queried elements. |
   * | static | Required. When true, resolve query results before change detection runs. |
   *
   * The `static` flag should typically be set to `false`, so that all possible
   * query results are collected after change detection has completed for the
   * relevant nodes.
   * This ensures that matches which depend on binding resolution
   * (such as results inside `*ngIf` or `*ngFor`) are found.
   *
   * If you need access to a `TemplateRef` in a query to create a view dynamically,
   * you cannot do so in `ngAfterContentInit`.
   * Change detection has already run on that view, so creating a new view with
   * the template throws an `ExpressionHasChangedAfterChecked` error.
   * In this case, you can set the `static` flag to `true` and create your view
   * in `ngOnInit`.
   * Note that in this case, query results nested in `*ngIf` or `*ngFor`
   * are not found by the query.
   *
   *
   * @usageNotes
   *
   * ### Example
   *
   * <code-example path="core/di/ts/contentChild/content_child_howto.ts"
   * region='HowTo' linenums="false"></code-example>
   *
   * ### Example
   *
   * <code-example path="core/di/ts/contentChild/content_child_example.ts"
   * region='Component' linenums="false"></code-example>
   *
   * ### Migration to Angular version 8
   *
   * When migrating to version 8, set the `static` flag to `true`
   * if your component code already depends  on the query results
   * being available some time *before* `ngAfterContentInit`.
   * For example, if your component relies on the query results being populated in
   * the `ngOnInit` hook or in `@Input` setters,
   * you will need to either set the flag to `true`
   * or re-work your component to adjust to later timing.
   *
   * For more information, see [Static Query Migration](guide/static-query-migration).
   *
   * @Annotation
   */
  (selector: Type<any>|Function|string, opts: {read?: any, static: boolean}): any;
  new (selector: Type<any>|Function|string, opts: {read?: any, static: boolean}): ContentChild;
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
    'ContentChild', (selector?: any, data: any = {}) =>
                        ({selector, first: true, isViewQuery: false, descendants: true, ...data}),
    Query);

/**
 * Type of the ViewChildren decorator / constructor function.
 *
 * @see `ViewChildren`.
 *
 * @publicApi
 */
export interface ViewChildrenDecorator {
  /**
   * Configures a view query.
   *
   * You can use ViewChildren to get the `QueryList` of elements or directives from the
   * view DOM. Any time a child element is added, removed, or moved, the query list will be updated,
   * and the changes observable of the query list will emit a new value.
   *
   * View queries are set before the `ngAfterViewInit` callback is called.
   *
   * | Metadata Property | Description |
   * | :--------------- | :-------------------- |
   * | selector | The directive type or the name used for querying. |
   * | read | Read a different token from the queried elements. |
   *
   * @usageNotes
   *
   * ### Example
   *
   * <code-example path="core/di/ts/viewChildren/view_children_howto.ts"
   * region='HowTo' linenums="false"></code-example>
   *
   * ### Example
   *
   * <code-example path="core/di/ts/viewChildren/view_children_example.ts"
   * region='Component' linenums="false"></code-example>
   *
   * @Annotation
   */
  (selector: Type<any>|Function|string, opts?: {read?: any}): any;
  new (selector: Type<any>|Function|string, opts?: {read?: any}): ViewChildren;
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
    'ViewChildren', (selector?: any, data: any = {}) =>
                        ({selector, first: false, isViewQuery: true, descendants: true, ...data}),
    Query);

/**
 * Type of the ViewChild decorator / constructor function.
 *
 * @see `ViewChild`.
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
   * View queries are set before the `ngAfterViewInit` callback is called.
   *
   * | Metadata Property | Description |
   * | :--------------- | :-------------------- |
   * | selector | The directive type or the name used for querying. |
   * | read | Read a different token from the queried elements. |
   * | static | When true, resolve query results before change detection runs. |
   *
   * The `static` flag should typically be set to `false`, so that all possible
   * query results are collected after change detection has completed for the
   * relevant nodes.
   * This ensures that matches which depend on binding resolution
   * (such as results inside `*ngIf` or `*ngFor`) are found.
   *
   * If you need access to a `TemplateRef` in a query to create a view dynamically,
   * you cannot do so in `ngAfterContentInit`.
   * Change detection has already run on that view, so creating a new view with
   * the template throws an `ExpressionHasChangedAfterChecked` error.
   * In this case, you can set the `static` flag to `true` and create your view
   * in `ngOnInit`.
   * Note that in this case, query results nested in `*ngIf` or `*ngFor`
   * are not found by the query.
   *
   * The following selectors are supported.
   *   * Any class with the `@Component` or `@Directive` decorator.
   *   * A template reference variable as a string (such as query `<my-component #cmp>
   * </my-component>` with `@ViewChild('cmp')`).
   *   * Any provider defined in the child component tree of the current component (such as
   * `@ViewChild(SomeService) someService: SomeService`).
   *   * Any provider defined through a string token (such as `@ViewChild('someToken')
   *  someTokenVal: any`).
   *   * A `TemplateRef` (such as query `<ng-template></ng-template>` with
   *  `@ViewChild(TemplateRef) template;`).
   *
   * @usageNotes
   *
   * <code-example path="core/di/ts/viewChild/view_child_example.ts"
   * region='Component' linenums="false"></code-example>
   *
   * ### Example
   *
   * <code-example path="core/di/ts/viewChild/view_child_howto.ts"
   * region='HowTo' linenums="false"></code-example>
   *
   * ### Example
   *
   * <code-example path="core/di/ts/viewChild/view_child_example.ts"
   * region='Component' linenums="false"></code-example>
   *
   * ### Migration to Angular version 8
   *
   * When migrating to version 8, set the `static` flag to `true`
   * if your component code already depends  on the query results
   * being available some time *before* `ngAfterContentInit`.
   * For example, if your component relies on the query results being populated in
   * the `ngOnInit` hook or in `@Input` setters,
   * you will need to either set the flag to `true`
   * or re-work your component to adjust to later timing.
   *
   * For more information, see [Static Query Migration](guide/static-query-migration).
   *
   * @Annotation
   */
  (selector: Type<any>|Function|string, opts: {read?: any, static: boolean}): any;
  new (selector: Type<any>|Function|string, opts: {read?: any, static: boolean}): ViewChild;
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
    'ViewChild', (selector: any, data: any) =>
                     ({selector, first: true, isViewQuery: true, descendants: true, ...data}),
    Query);
