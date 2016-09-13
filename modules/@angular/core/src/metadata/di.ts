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
// Note: we keep the constructor separate and make it return `any` to trick typescript into
// looking up the docs for the decorator from this function.
export function AttributeMetadata(attributeName: string): any {
  this.attributeName = attributeName;
  return null;
}
// Note: Can't make this generic as typescript does not support tuple types for varargs.
export interface AttributeMetadataCtor {
  /**
   * See the corresponding decorator.
   */
  new (attributeName: string): AttributeMetadata;
}
// Note: No documentation needed as the constructor is a separate function.
export interface AttributeMetadata { attributeName: string; }

/**
 * Internal class used for storing the data for the
 * query annotations.
 *
 * @stable
 */
export class QueryMetadata {
  private _selector: Type<any>|string;
  descendants: boolean;
  read: any;

  constructor(
      selector: Type<any>|string, public isViewQuery: boolean, public first: boolean,
      {descendants = false, read = null}: {descendants?: boolean, read?: any} = {}) {
    this._selector = selector;
    this.descendants = descendants;
    this.read = read;
  }

  get selector(): Type<any>|any { return resolveForwardRef(this._selector); }

  /**
   * whether this is querying for a variable binding or a directive.
   */
  get isVarBindingQuery(): boolean { return isString(this.selector); }

  /**
   * returns a list of variable bindings this is querying for.
   * Only applicable if this is a variable bindings query.
   */
  get varBindings(): string[] { return StringWrapper.split(<string>this.selector, /\s*,\s*/g); }
}

export interface QueryOptions {
  /**
   * The DI token to read from an element that matches the selector.
   */
  read?: any;
}

export interface ContentQueryOptions extends QueryOptions {
  /**
   * whether we want to query only direct children (false) or all
   * children (true).
   */
  descendants?: boolean;
}

// Note: Can't make this generic as typescript does not support tuple types for varargs.
export interface QueryMetadataCtor {
  /**
   * See the corresponding decorator.
   */
  new (token: any, options?: QueryOptions): QueryMetadata;
}
// Note: Can't make this generic as typescript does not support tuple types for varargs.
export interface ContentQueryMetadataCtor {
  /**
   * See the corresponding decorator.
   */
  new (token: any, options?: ContentQueryOptions): QueryMetadata;
}

// TODO: add an example after ContentChildren and ViewChildren are in master
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
// Note: we keep the constructor separate and make it return `any` to trick typescript into
// looking up the docs for the decorator from this function.
export function ContentChildrenMetadata(token: any, options: ContentQueryOptions = {}): any {
  QueryMetadata.call(this, token, false, false, options);
}
ContentChildrenMetadata.prototype = Object.create(QueryMetadata.prototype);

// Note: No documentation needed as the constructor is a separate function.
export type ContentChildrenMetadata = QueryMetadata;

// TODO: add an example after ContentChild and ViewChild are in master
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
 *
 *   ngAfterContentInit() {
 *     // contentChild is set
 *   }
 * }
 * ```
 * @stable
 */
// Note: we keep the constructor separate and make it return `any` to trick typescript into
// looking up the docs for the decorator from this function.
export function ContentChildMetadata(token: any, options: ContentQueryOptions = {}): any {
  QueryMetadata.call(this, token, false, true, options);
}
ContentChildMetadata.prototype = Object.create(QueryMetadata.prototype);

// Note: No documentation needed as the constructor is a separate function.
export type ContentChildMetadata = QueryMetadata;

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
 */
// Note: we keep the constructor separate and make it return `any` to trick typescript into
// looking up the docs for the decorator from this function.
export function ViewChildrenMetadata(token: any, options: QueryOptions = {}): any {
  QueryMetadata.call(this, token, true, false, {descendants: true, read: options.read});
}
ViewChildrenMetadata.prototype = Object.create(QueryMetadata.prototype);

// Note: No documentation needed as the constructor is a separate function.
export type ViewChildrenMetadata = QueryMetadata;

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
 */
// Note: we keep the constructor separate and make it return `any` to trick typescript into
// looking up the docs for the decorator from this function.
export function ViewChildMetadata(token: any, options: QueryOptions = {}): any {
  QueryMetadata.call(this, token, true, true, {descendants: true, read: options.read});
}
ViewChildMetadata.prototype = Object.create(QueryMetadata.prototype);

// Note: No documentation needed as the constructor is a separate function.
export type ViewChildMetadata = QueryMetadata;
