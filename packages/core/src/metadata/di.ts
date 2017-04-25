/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {InjectionToken} from '../di/injection_token';
import {Type} from '../type';
import {makeParamDecorator, makePropDecorator} from '../util/decorators';

/**
 * This token can be used to create a virtual provider that will populate the
 * `entryComponents` fields of components and ng modules based on its `useValue`.
 * All components that are referenced in the `useValue` value (either directly
 * or in a nested array or map) will be added to the `entryComponents` property.
 *
 * ### Example
 * The following example shows how the router can populate the `entryComponents`
 * field of an NgModule based on the router configuration which refers
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
 * @experimental
 */
export const ANALYZE_FOR_ENTRY_COMPONENTS = new InjectionToken<any>('AnalyzeForEntryComponents');

/**
 * Type of the Attribute decorator / constructor function.
 *
 * @stable
 */
export interface AttributeDecorator {
  /**
   * Specifies that a constant attribute value should be injected.
   *
   * The directive can inject constant string literals of host element attributes.
   *
   * ### Example
   *
   * Suppose we have an `<input>` element and want to know its `type`.
   *
   * ```html
   * <input type="text">
   * ```
   *
   * A decorator can inject string literal `text` like so:
   *
   * {@example core/ts/metadata/metadata.ts region='attributeMetadata'}
   *
   * ### Example as TypeScript Decorator
   *
   * {@example core/ts/metadata/metadata.ts region='attributeFactory'}
   *
   * ### Example as ES5 DSL
   *
   * ```
   * var MyComponent = ng
   *   .Component({...})
   *   .Class({
   *     constructor: [new ng.Attribute('title'), function(title) {
   *       ...
   *     }]
   *   })
   * ```
   *
   * ### Example as ES5 annotation
   *
   * ```
   * var MyComponent = function(title) {
   *   ...
   * };
   *
   * MyComponent.annotations = [
   *   new ng.Component({...})
   * ]
   * MyComponent.parameters = [
   *   [new ng.Attribute('title')]
   * ]
   * ```
   *
   * @stable
   */
  (name: string): any;
  new (name: string): Attribute;
}


/**
 * Type of the Attribute metadata.
 */
export interface Attribute { attributeName?: string; }

/**
 * Attribute decorator and metadata.
 *
 * @stable
 * @Annotation
 */
export const Attribute: AttributeDecorator =
    makeParamDecorator('Attribute', [['attributeName', undefined]]);

/**
 * Type of the Query metadata.
 *
 * @stable
 */
export interface Query {
  descendants: boolean;
  first: boolean;
  read: any;
  isViewQuery: boolean;
  selector: any;
}

/**
 * Base class for query metadata.
 *
 * See {@link ContentChildren}, {@link ContentChild}, {@link ViewChildren}, {@link ViewChild} for
 * more information.
 *
 * @stable
 */
export abstract class Query {}

/**
 * Type of the ContentChildren decorator / constructor function.
 *
 * See {@link ContentChildren}.
 *
 * @stable
 */
export interface ContentChildrenDecorator {
  /**
   * @whatItDoes Configures a content query.
   *
   * @howToUse
   *
   * {@example core/di/ts/contentChildren/content_children_howto.ts region='HowTo'}
   *
   * @description
   *
   * You can use ContentChildren to get the {@link QueryList} of elements or directives from the
   * content DOM. Any time a child element is added, removed, or moved, the query list will be
   * updated,
   * and the changes observable of the query list will emit a new value.
   *
   * Content queries are set before the `ngAfterContentInit` callback is called.
   *
   * **Metadata Properties**:
   *
   * * **selector** - the directive type or the name used for querying.
   * * **descendants** - include only direct children or all descendants.
   * * **read** - read a different token from the queried elements.
   *
   * Let's look at an example:
   *
   * {@example core/di/ts/contentChildren/content_children_example.ts region='Component'}
   *
   * **npm package**: `@angular/core`
   *
   * @stable
   * @Annotation
   */
  (selector: Type<any>|Function|string,
   {descendants, read}?: {descendants?: boolean, read?: any}): any;
  new (
      selector: Type<any>|Function|string,
      {descendants, read}?: {descendants?: boolean, read?: any}): Query;
}

/**
 * Type of the ContentChildren metadata.
 *
 * @stable
 * @Annotation
 */
export type ContentChildren = Query;

/**
 * ContentChildren decorator and metadata.
 *
 *  @stable
 *  @Annotation
 */
export const ContentChildren: ContentChildrenDecorator =
    <ContentChildrenDecorator>makePropDecorator(
        'ContentChildren',
        [
          ['selector', undefined], {
            first: false,
            isViewQuery: false,
            descendants: false,
            read: undefined,
          }
        ],
        Query);

/**
 * Type of the ContentChild decorator / constructor function.
 *
 *
 * @stable
 */
export interface ContentChildDecorator {
  /**
   * @whatItDoes Configures a content query.
   *
   * @howToUse
   *
   * {@example core/di/ts/contentChild/content_child_howto.ts region='HowTo'}
   *
   * @description
   *
   * You can use ContentChild to get the first element or the directive matching the selector from
   * the content DOM. If the content DOM changes, and a new child matches the selector,
   * the property will be updated.
   *
   * Content queries are set before the `ngAfterContentInit` callback is called.
   *
   * **Metadata Properties**:
   *
   * * **selector** - the directive type or the name used for querying.
   * * **read** - read a different token from the queried element.
   *
   * Let's look at an example:
   *
   * {@example core/di/ts/contentChild/content_child_example.ts region='Component'}
   *
   * **npm package**: `@angular/core`
   *
   * @stable
   * @Annotation
   */
  (selector: Type<any>|Function|string, {read}?: {read?: any}): any;
  new (selector: Type<any>|Function|string, {read}?: {read?: any}): ContentChild;
}

/**
 * Type of the ContentChild metadata.
 *
 * See {@link ContentChild}.
 *
 * @stable
 */
export type ContentChild = Query;

/**
 * ContentChild decorator and metadata.
 *
 * @stable
 * @Annotation
 */
export const ContentChild: ContentChildDecorator = makePropDecorator(
    'ContentChild',
    [
      ['selector', undefined], {
        first: true,
        isViewQuery: false,
        descendants: true,
        read: undefined,
      }
    ],
    Query);

/**
 * Type of the ViewChildren decorator / constructor function.
 *
 * See {@link ViewChildren}.
 *
 * @stable
 */
export interface ViewChildrenDecorator {
  /**
   * @whatItDoes Configures a view query.
   *
   * @howToUse
   *
   * {@example core/di/ts/viewChildren/view_children_howto.ts region='HowTo'}
   *
   * @description
   *
   * You can use ViewChildren to get the {@link QueryList} of elements or directives from the
   * view DOM. Any time a child element is added, removed, or moved, the query list will be updated,
   * and the changes observable of the query list will emit a new value.
   *
   * View queries are set before the `ngAfterViewInit` callback is called.
   *
   * **Metadata Properties**:
   *
   * * **selector** - the directive type or the name used for querying.
   * * **read** - read a different token from the queried elements.
   *
   * Let's look at an example:
   *
   * {@example core/di/ts/viewChildren/view_children_example.ts region='Component'}
   *
   * **npm package**: `@angular/core`
   *
   * @stable
   * @Annotation
   */
  (selector: Type<any>|Function|string, {read}?: {read?: any}): any;
  new (selector: Type<any>|Function|string, {read}?: {read?: any}): ViewChildren;
}

/**
 * Type of the ViewChildren metadata.
 *
 * @stable
 */
export type ViewChildren = Query;

/**
 * ViewChildren decorator and metadata.
 *
 * @stable
 * @Annotation
 */
export const ViewChildren: ViewChildrenDecorator = makePropDecorator(
    'ViewChildren',
    [
      ['selector', undefined], {
        first: false,
        isViewQuery: true,
        descendants: true,
        read: undefined,
      }
    ],
    Query);

/**
 * Type of the ViewChild decorator / constructor function.
 *
 * See {@link ViewChild}
 *
 * @stable
 */
export interface ViewChildDecorator {
  /**
   * @whatItDoes Configures a view query.
   *
   * @howToUse
   *
   * {@example core/di/ts/viewChild/view_child_howto.ts region='HowTo'}
   *
   * @description
   *
   * You can use ViewChild to get the first element or the directive matching the selector from the
   * view DOM. If the view DOM changes, and a new child matches the selector,
   * the property will be updated.
   *
   * View queries are set before the `ngAfterViewInit` callback is called.
   *
   * **Metadata Properties**:
   *
   * * **selector** - the directive type or the name used for querying.
   * * **read** - read a different token from the queried elements.
   *
   * {@example core/di/ts/viewChild/view_child_example.ts region='Component'}
   *
   * **npm package**: `@angular/core`
   *
   * @stable
   * @Annotation
   */
  (selector: Type<any>|Function|string, {read}?: {read?: any}): any;
  new (selector: Type<any>|Function|string, {read}?: {read?: any}): ViewChild;
}

/**
 * Type of the ViewChild metadata.
 *
 * @stable
 */
export type ViewChild = Query;

/**
 * ViewChild decorator and metadata.
 *
 * @stable
 * @Annotation
 */
export const ViewChild: ViewChildDecorator = makePropDecorator(
    'ViewChild',
    [
      ['selector', undefined], {
        first: true,
        isViewQuery: true,
        descendants: true,
        read: undefined,
      }
    ],
    Query);
