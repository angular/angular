/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {resolveForwardRef} from '../di/forward_ref';
import {OpaqueToken} from '../di/opaque_token';
import {StringWrapper, isString, stringify} from '../facade/lang';
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
export const ANALYZE_FOR_ENTRY_COMPONENTS = new OpaqueToken('AnalyzeForEntryComponents');


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
 */ (name: string): any;
  new (name: string): Attribute;
}


/**
 * Type of the Attribute metadata.
 *
 * @stable
 */
export interface Attribute { attributeName?: string; }

/**
 * Attribute decorator and metadata.
 *
 * @stable
 * @Annotation
 */
export const Attribute: AttributeDecorator = makeParamDecorator([['attributeName', undefined]]);

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
 * Base class for query metadata
 *
 * @stable
 */
export abstract class Query {}

/**
 * Type of the ContentChildren decorator / constructor function.
 *
 * @stable
 */
export interface ContentChildrenDecorator {
  /**
   * Configures a content query.
   *
   * Content queries are set before the `ngAfterContentInit` callback is called.
   *
   * ### Example
   *
   * ```
   * @Directive({
   *   selector: 'someDir'
   * })
   * class SomeDir {
   *   @ContentChildren(ChildDirective) contentChildren: QueryList<ChildDirective>;
   *
   *   ngAfterContentInit() {
   *     // contentChildren is set
   *   }
   * }
   * ```
   * @stable
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
 */
export type ContentChildren = Query;

/**
 * ContentChildren decorator and metadata.
 *
 * @stable
 * @Annotation
 */
export const ContentChildren: ContentChildrenDecorator = makePropDecorator(
    [
      ['selector', undefined],
      {first: false, isViewQuery: false, descendants: false, read: undefined}
    ],
    Query);

/**
 * Type of the ContentChild decorator / constructor function.
 *
 * @stable
 */
export interface ContentChildDecorator {
  /**
   * Configures a content query.
   *
   * Content queries are set before the `ngAfterContentInit` callback is called.
   *
   * ### Example
   *
   * ```
   * @Directive({
   *   selector: 'someDir'
   * })
   * class SomeDir {
   *   @ContentChild(ChildDirective) contentChild;
   *   @ContentChild('container_ref') containerChild
   *
   *   ngAfterContentInit() {
   *     // contentChild is set
   *     // containerChild is set
   *   }
   * }
   * ```
   *
   * ```html
   * <container #container_ref>
   *   <item>a</item>
   *   <item>b</item>
   * </container>
   * ```
   */
  (selector: Type<any>|Function|string, {read}?: {read?: any}): any;
  new (selector: Type<any>|Function|string, {read}?: {read?: any}): ContentChild;
}

/**
 * Type of the ContentChild metadata.
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
    [
      ['selector', undefined], {
        first: true,
        isViewQuery: false,
        descendants: false,
        read: undefined,
      }
    ],
    Query);

/**
 * Type of the ViewChildren decorator / constructor function.
 *
 * @stable
 */
export interface ViewChildrenDecorator {
  /**
 * Declares a list of child element references.
 *
 * Angular automatically updates the list when the DOM is updated.
 *
 * `ViewChildren` takes an argument to select elements.
 *
 * - If the argument is a type, directives or components with the type will be bound.
 *
 * - If the argument is a string, the string is interpreted as a list of comma-separated selectors.
 * For each selector, an element containing the matching template variable (e.g. `#child`) will be
 * bound.
 *
 * View children are set before the `ngAfterViewInit` callback is called.
 *
 * ### Example
 *
 * With type selector:
 *
 * ```
 * @Component({
 *   selector: 'child-cmp',
 *   template: '<p>child</p>'
 * })
 * class ChildCmp {
 *   doSomething() {}
 * }
 *
 * @Component({
 *   selector: 'some-cmp',
 *   template: `
 *     <child-cmp></child-cmp>
 *     <child-cmp></child-cmp>
 *     <child-cmp></child-cmp>
 *   `,
 *   directives: [ChildCmp]
 * })
 * class SomeCmp {
 *   @ViewChildren(ChildCmp) children:QueryList<ChildCmp>;
 *
 *   ngAfterViewInit() {
 *     // children are set
 *     this.children.toArray().forEach((child)=>child.doSomething());
 *   }
 * }
 * ```
 *
 * With string selector:
 *
 * ```
 * @Component({
 *   selector: 'child-cmp',
 *   template: '<p>child</p>'
 * })
 * class ChildCmp {
 *   doSomething() {}
 * }
 *
 * @Component({
 *   selector: 'some-cmp',
 *   template: `
 *     <child-cmp #child1></child-cmp>
 *     <child-cmp #child2></child-cmp>
 *     <child-cmp #child3></child-cmp>
 *   `,
 *   directives: [ChildCmp]
 * })
 * class SomeCmp {
 *   @ViewChildren('child1,child2,child3') children:QueryList<ChildCmp>;
 *
 *   ngAfterViewInit() {
 *     // children are set
 *     this.children.toArray().forEach((child)=>child.doSomething());
 *   }
 * }
 * ```
 * @stable
 */ (selector: Type<any>|Function|string, {read}?: {read?: any}): any;
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
 * @stable
 */
export interface ViewChildDecorator {
  /**
 *
 * Declares a reference of child element.
 *
 * `ViewChildren` takes an argument to select elements.
 *
 * - If the argument is a type, a directive or a component with the type will be bound.
 *
 * If the argument is a string, the string is interpreted as a selector. An element containing the
 * matching template variable (e.g. `#child`) will be bound.
 *
 * In either case, `@ViewChild()` assigns the first (looking from above) element if there are
 multiple matches.
 *
 * View child is set before the `ngAfterViewInit` callback is called.
 *
 * ### Example
 *
 * With type selector:
 *
 * ```
 * @Component({
 *   selector: 'child-cmp',
 *   template: '<p>child</p>'
 * })
 * class ChildCmp {
 *   doSomething() {}
 * }
 *
 * @Component({
 *   selector: 'some-cmp',
 *   template: '<child-cmp></child-cmp>',
 *   directives: [ChildCmp]
 * })
 * class SomeCmp {
 *   @ViewChild(ChildCmp) child:ChildCmp;
 *
 *   ngAfterViewInit() {
 *     // child is set
 *     this.child.doSomething();
 *   }
 * }
 * ```
 *
 * With string selector:
 *
 * ```
 * @Component({
 *   selector: 'child-cmp',
 *   template: '<p>child</p>'
 * })
 * class ChildCmp {
 *   doSomething() {}
 * }
 *
 * @Component({
 *   selector: 'some-cmp',
 *   template: '<child-cmp #child></child-cmp>',
 *   directives: [ChildCmp]
 * })
 * class SomeCmp {
 *   @ViewChild('child') child:ChildCmp;
 *
 *   ngAfterViewInit() {
 *     // child is set
 *     this.child.doSomething();
 *   }
 * }
 * ```
 * @stable
 */ (selector: Type<any>|Function|string, {read}?: {read?: any}): any;
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
    [
      ['selector', undefined], {
        first: true,
        isViewQuery: true,
        descendants: true,
        read: undefined,
      }
    ],
    Query);
