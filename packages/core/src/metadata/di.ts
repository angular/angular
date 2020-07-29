/**
 * @license
 * Copyright Google LLC All Rights Reserved.
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
 * @deprecated Since 9.0.0. With Ivy, this property is no longer necessary.
 */
export const ANALYZE_FOR_ENTRY_COMPONENTS = new InjectionToken<any>('AnalyzeForEntryComponents');

/**
 * Type of the `Attribute` decorator / constructor function.
 *
 * @publicApi
 */
export interface AttributeDecorator {
  /**
   * A parameter decorator that specifies that a constant attribute value should be injected.
   *
   * You can use this to inject constant string literals of host element attributes.
   * For example, suppose you have an `<input>` element and want to know its type.
   *
   * ```html
   * <input type="text">
   * ```
   *
   * The following constructor for the directive that instantiates this element
   * uses the parameter decorator to inject
   * the string literal "text" as the value of the element's `type` attribute.
   *
   * {@example core/ts/metadata/metadata.ts region='attributeMetadata'}
   *
   * @publicApi
   */
  (name: string): any;
  new(name: string): Attribute;
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
  /**
   * True to include all descendants, otherwise include only direct children.
   */
  descendants: boolean;
  /**
   * True to if the current iteration index is the first in the set.
   */
  first: boolean;
  /**
   * Use to read a different token from the queried elements.
   */
  read: any;
  /**
   * True if this is a view query, false if it is a content query.
   */
  isViewQuery: boolean;
  /**
   * The directive type or the name used for querying.
   */
  selector: any;
  /**
   * True to resolve query results before change detection runs,
   * false to resolve after change detection. Default is false.
   */
  static?: boolean;
}

/**
 * Base class for query metadata. Sets up and allows iteration through
 * a set of changes in the view or content hierarchy.
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
   * Parameter decorator that configures a content query.
   *
   * Retrieves a `QueryList` of changes to elements or directives from the content DOM.
   * Any time a child element is added, removed, or moved, Angular updates the
   * read-only `QueryList` object, and the `changes` observable of the
   * query list emits a new value.
   *
   * Content queries are set before the `ngAfterContentInit` callback is called.
   *
   * Does not retrieve elements or directives that are in other components' templates.
   * A component's template is not directly accessible from its content ancestors.
   *
   * The following code shows how to set up a content query.
   *
   * {@example core/di/ts/contentChildren/content_children_howto.ts region='HowTo'}
   *
   * The following slightly more complete example shows how a content query
   * can be used to implement a tab pane component.
   *
   * {@example core/di/ts/contentChildren/content_children_example.ts region='Component'}
   *
   * @see `QueryList`
   * @see [Lifecycle hooks guide](guide/lifecycle-hooks)
   * @see `ContentChild`
   *
   * @Annotation
   */
  (selector: Type<any>|InjectionToken<unknown>|Function|string,
   opts?: {descendants?: boolean, read?: any}): any;
  new(selector: Type<any>|InjectionToken<unknown>|Function|string,
      opts?: {descendants?: boolean, read?: any}): Query;
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
   * Parameter decorator that configures a content query.
   *
   * Use to get the first element or the directive matching the selector from the content DOM.
   * If the content DOM changes, and a new child matches the selector,
   * the property is updated.
   *
   * Content queries are set before the `ngAfterContentInit` callback is called.
   *
   * Does not retrieve elements or directives that are in other components' templates.
   * A component's template is not directly accessible from its content ancestors.
   *
   * The following basic example shows how to set up an `AfterContentInit`
   * handler method that can operate on a component's content child.
   *
   * {@example core/di/ts/contentChild/content_child_howto.ts region='HowTo'}
   *
   * The following slightly more complete example shows how a content query
   * can be used to implement a tab pane component.
   *
   * {@example core/di/ts/contentChild/content_child_example.ts region='Component'}
   *
   * @see `QueryList`
   * @see [Lifecycle hooks guide](guide/lifecycle-hooks)
   * @see `ContentChildren`
   *
   * @Annotation
   */
  (selector: Type<any>|InjectionToken<unknown>|Function|string,
   opts?: {read?: any, static?: boolean}): any;
  new(selector: Type<any>|InjectionToken<unknown>|Function|string,
      opts?: {read?: any, static?: boolean}): ContentChild;
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
    (selector?: any, data: any = {}) =>
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
   * Parameter decorator that configures a view query.
   *
   * Use to get the `QueryList` of elements or directives from the view DOM.
   * Any time a child element is added, removed, or moved, the query list is updated,
   * and the `changes` observable of the query list emits a new value.
   *
   * View queries are set before the `ngAfterViewInit` callback is called.
   *
   * The following basic example shows how to set up a view query.
   *
   * {@example core/di/ts/viewChildren/view_children_howto.ts region='HowTo'}
   *
   * The following slightly more complete example shows how a content query
   * can be used to implement a tab pane component.
   *
   * {@example core/di/ts/viewChildren/view_children_example.ts region='Component'}
   *
   * @see `QueryList`
   * @see [Lifecycle hooks guide](guide/lifecycle-hooks)
   * @see `ViewChild`
   *
   * @Annotation
   */
  (selector: Type<any>|InjectionToken<unknown>|Function|string, opts?: {read?: any}): any;
  new(selector: Type<any>|InjectionToken<unknown>|Function|string,
      opts?: {read?: any}): ViewChildren;
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
    (selector?: any, data: any = {}) =>
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
   * Property decorator that configures a query for the direct view child
   * of the queried component or directive.
   *
   * The following selectors are supported.
   *  * Any class with the `@Component` or `@Directive` decorator
   *  * A template reference variable as a string (for example, query `<my-component #cmp></my-component>`
   * with `@ViewChild('cmp')`)
   *   * Any provider defined in the child component tree of the current component (for example,
   * `@ViewChild(SomeService) someService: SomeService`)
   *   * Any provider defined through a string token (for example, `@ViewChild('someToken') someTokenVal:
   * any`)
   *   * A `TemplateRef` (for example, query `<ng-template></ng-template>` with `@ViewChild(TemplateRef)
   * template;`)
   *
   * Creates a `QueryList` of changes in the view DOM.
   * Any time a child element is added, removed, or moved, the query list is updated,
   * and the `changes` observable of the query list emits a new value.
   *
   * View queries are set before the `ngAfterViewInit` callback is called.
   *
   * The following basic example shows how to set up a view query.
   *
   * {@example core/di/ts/viewChild/view_child_example.ts region='Component'}
   *
   * The following slightly more complete example shows how a view query
   * can be used to implement a tab pane component.
   *
   * {@example core/di/ts/viewChild/view_child_howto.ts region='HowTo'}
   *
   * @see `QueryList`
   * @see [Lifecycle hooks guide](guide/lifecycle-hooks)
   * @see `ViewChildren`
   *
   * @Annotation
   */
  (selector: Type<any>|InjectionToken<unknown>|Function|string,
   opts?: {read?: any, static?: boolean}): any;
  new(selector: Type<any>|InjectionToken<unknown>|Function|string,
      opts?: {read?: any, static?: boolean}): ViewChild;
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
    (selector: any, data: any) =>
        ({selector, first: true, isViewQuery: true, descendants: true, ...data}),
    Query);
