'use strict';/**
 * This indirection is needed to free up Component, etc symbols in the public API
 * to be used by the decorator versions of these annotations.
 */
"use strict";
var di_1 = require('./metadata/di');
exports.QueryMetadata = di_1.QueryMetadata;
exports.ContentChildrenMetadata = di_1.ContentChildrenMetadata;
exports.ContentChildMetadata = di_1.ContentChildMetadata;
exports.ViewChildrenMetadata = di_1.ViewChildrenMetadata;
exports.ViewQueryMetadata = di_1.ViewQueryMetadata;
exports.ViewChildMetadata = di_1.ViewChildMetadata;
exports.AttributeMetadata = di_1.AttributeMetadata;
var directives_1 = require('./metadata/directives');
exports.ComponentMetadata = directives_1.ComponentMetadata;
exports.DirectiveMetadata = directives_1.DirectiveMetadata;
exports.PipeMetadata = directives_1.PipeMetadata;
exports.InputMetadata = directives_1.InputMetadata;
exports.OutputMetadata = directives_1.OutputMetadata;
exports.HostBindingMetadata = directives_1.HostBindingMetadata;
exports.HostListenerMetadata = directives_1.HostListenerMetadata;
var view_1 = require('./metadata/view');
exports.ViewMetadata = view_1.ViewMetadata;
exports.ViewEncapsulation = view_1.ViewEncapsulation;
var di_2 = require('./metadata/di');
var directives_2 = require('./metadata/directives');
var view_2 = require('./metadata/view');
var decorators_1 = require('./util/decorators');
// TODO(alexeagle): remove the duplication of this doc. It is copied from ComponentMetadata.
/**
 * Declare reusable UI building blocks for an application.
 *
 * Each Angular component requires a single `@Component` annotation. The `@Component`
 * annotation specifies when a component is instantiated, and which properties and hostListeners it
 * binds to.
 *
 * When a component is instantiated, Angular
 * - creates a shadow DOM for the component.
 * - loads the selected template into the shadow DOM.
 * - creates all the injectable objects configured with `providers` and `viewProviders`.
 *
 * All template expressions and statements are then evaluated against the component instance.
 *
 * ## Lifecycle hooks
 *
 * When the component class implements some {@link ../../guide/lifecycle-hooks.html} the callbacks
 * are called by the change detection at defined points in time during the life of the component.
 *
 * ### Example
 *
 * {@example core/ts/metadata/metadata.ts region='component'}
 */
exports.Component = decorators_1.makeDecorator(directives_2.ComponentMetadata, function (fn) { return fn.View = View; });
// TODO(alexeagle): remove the duplication of this doc. It is copied from DirectiveMetadata.
/**
 * Directives allow you to attach behavior to elements in the DOM.
 *
 * {@link DirectiveMetadata}s with an embedded view are called {@link ComponentMetadata}s.
 *
 * A directive consists of a single directive annotation and a controller class. When the
 * directive's `selector` matches
 * elements in the DOM, the following steps occur:
 *
 * 1. For each directive, the `ElementInjector` attempts to resolve the directive's constructor
 * arguments.
 * 2. Angular instantiates directives for each matched element using `ElementInjector` in a
 * depth-first order,
 *    as declared in the HTML.
 *
 * ## Understanding How Injection Works
 *
 * There are three stages of injection resolution.
 * - *Pre-existing Injectors*:
 *   - The terminal {@link Injector} cannot resolve dependencies. It either throws an error or, if
 * the dependency was
 *     specified as `@Optional`, returns `null`.
 *   - The platform injector resolves browser singleton resources, such as: cookies, title,
 * location, and others.
 * - *Component Injectors*: Each component instance has its own {@link Injector}, and they follow
 * the same parent-child hierarchy
 *     as the component instances in the DOM.
 * - *Element Injectors*: Each component instance has a Shadow DOM. Within the Shadow DOM each
 * element has an `ElementInjector`
 *     which follow the same parent-child hierarchy as the DOM elements themselves.
 *
 * When a template is instantiated, it also must instantiate the corresponding directives in a
 * depth-first order. The
 * current `ElementInjector` resolves the constructor dependencies for each directive.
 *
 * Angular then resolves dependencies as follows, according to the order in which they appear in the
 * {@link ViewMetadata}:
 *
 * 1. Dependencies on the current element
 * 2. Dependencies on element injectors and their parents until it encounters a Shadow DOM boundary
 * 3. Dependencies on component injectors and their parents until it encounters the root component
 * 4. Dependencies on pre-existing injectors
 *
 *
 * The `ElementInjector` can inject other directives, element-specific special objects, or it can
 * delegate to the parent
 * injector.
 *
 * To inject other directives, declare the constructor parameter as:
 * - `directive:DirectiveType`: a directive on the current element only
 * - `@Host() directive:DirectiveType`: any directive that matches the type between the current
 * element and the
 *    Shadow DOM root.
 * - `@Query(DirectiveType) query:QueryList<DirectiveType>`: A live collection of direct child
 * directives.
 * - `@QueryDescendants(DirectiveType) query:QueryList<DirectiveType>`: A live collection of any
 * child directives.
 *
 * To inject element-specific special objects, declare the constructor parameter as:
 * - `element: ElementRef` to obtain a reference to logical element in the view.
 * - `viewContainer: ViewContainerRef` to control child template instantiation, for
 * {@link DirectiveMetadata} directives only
 * - `bindingPropagation: BindingPropagation` to control change detection in a more granular way.
 *
 * ### Example
 *
 * The following example demonstrates how dependency injection resolves constructor arguments in
 * practice.
 *
 *
 * Assume this HTML template:
 *
 * ```
 * <div dependency="1">
 *   <div dependency="2">
 *     <div dependency="3" my-directive>
 *       <div dependency="4">
 *         <div dependency="5"></div>
 *       </div>
 *       <div dependency="6"></div>
 *     </div>
 *   </div>
 * </div>
 * ```
 *
 * With the following `dependency` decorator and `SomeService` injectable class.
 *
 * ```
 * @Injectable()
 * class SomeService {
 * }
 *
 * @Directive({
 *   selector: '[dependency]',
 *   inputs: [
 *     'id: dependency'
 *   ]
 * })
 * class Dependency {
 *   id:string;
 * }
 * ```
 *
 * Let's step through the different ways in which `MyDirective` could be declared...
 *
 *
 * ### No injection
 *
 * Here the constructor is declared with no arguments, therefore nothing is injected into
 * `MyDirective`.
 *
 * ```
 * @Directive({ selector: '[my-directive]' })
 * class MyDirective {
 *   constructor() {
 *   }
 * }
 * ```
 *
 * This directive would be instantiated with no dependencies.
 *
 *
 * ### Component-level injection
 *
 * Directives can inject any injectable instance from the closest component injector or any of its
 * parents.
 *
 * Here, the constructor declares a parameter, `someService`, and injects the `SomeService` type
 * from the parent
 * component's injector.
 * ```
 * @Directive({ selector: '[my-directive]' })
 * class MyDirective {
 *   constructor(someService: SomeService) {
 *   }
 * }
 * ```
 *
 * This directive would be instantiated with a dependency on `SomeService`.
 *
 *
 * ### Injecting a directive from the current element
 *
 * Directives can inject other directives declared on the current element.
 *
 * ```
 * @Directive({ selector: '[my-directive]' })
 * class MyDirective {
 *   constructor(dependency: Dependency) {
 *     expect(dependency.id).toEqual(3);
 *   }
 * }
 * ```
 * This directive would be instantiated with `Dependency` declared at the same element, in this case
 * `dependency="3"`.
 *
 * ### Injecting a directive from any ancestor elements
 *
 * Directives can inject other directives declared on any ancestor element (in the current Shadow
 * DOM), i.e. on the current element, the
 * parent element, or its parents.
 * ```
 * @Directive({ selector: '[my-directive]' })
 * class MyDirective {
 *   constructor(@Host() dependency: Dependency) {
 *     expect(dependency.id).toEqual(2);
 *   }
 * }
 * ```
 *
 * `@Host` checks the current element, the parent, as well as its parents recursively. If
 * `dependency="2"` didn't
 * exist on the direct parent, this injection would
 * have returned
 * `dependency="1"`.
 *
 *
 * ### Injecting a live collection of direct child directives
 *
 *
 * A directive can also query for other child directives. Since parent directives are instantiated
 * before child directives, a directive can't simply inject the list of child directives. Instead,
 * the directive injects a {@link QueryList}, which updates its contents as children are added,
 * removed, or moved by a directive that uses a {@link ViewContainerRef} such as a `ngFor`, an
 * `ngIf`, or an `ngSwitch`.
 *
 * ```
 * @Directive({ selector: '[my-directive]' })
 * class MyDirective {
 *   constructor(@Query(Dependency) dependencies:QueryList<Dependency>) {
 *   }
 * }
 * ```
 *
 * This directive would be instantiated with a {@link QueryList} which contains `Dependency` 4 and
 * 6. Here, `Dependency` 5 would not be included, because it is not a direct child.
 *
 * ### Injecting a live collection of descendant directives
 *
 * By passing the descendant flag to `@Query` above, we can include the children of the child
 * elements.
 *
 * ```
 * @Directive({ selector: '[my-directive]' })
 * class MyDirective {
 *   constructor(@Query(Dependency, {descendants: true}) dependencies:QueryList<Dependency>) {
 *   }
 * }
 * ```
 *
 * This directive would be instantiated with a Query which would contain `Dependency` 4, 5 and 6.
 *
 * ### Optional injection
 *
 * The normal behavior of directives is to return an error when a specified dependency cannot be
 * resolved. If you
 * would like to inject `null` on unresolved dependency instead, you can annotate that dependency
 * with `@Optional()`.
 * This explicitly permits the author of a template to treat some of the surrounding directives as
 * optional.
 *
 * ```
 * @Directive({ selector: '[my-directive]' })
 * class MyDirective {
 *   constructor(@Optional() dependency:Dependency) {
 *   }
 * }
 * ```
 *
 * This directive would be instantiated with a `Dependency` directive found on the current element.
 * If none can be
 * found, the injector supplies `null` instead of throwing an error.
 *
 * ### Example
 *
 * Here we use a decorator directive to simply define basic tool-tip behavior.
 *
 * ```
 * @Directive({
 *   selector: '[tooltip]',
 *   inputs: [
 *     'text: tooltip'
 *   ],
 *   host: {
 *     '(mouseenter)': 'onMouseEnter()',
 *     '(mouseleave)': 'onMouseLeave()'
 *   }
 * })
 * class Tooltip{
 *   text:string;
 *   overlay:Overlay; // NOT YET IMPLEMENTED
 *   overlayManager:OverlayManager; // NOT YET IMPLEMENTED
 *
 *   constructor(overlayManager:OverlayManager) {
 *     this.overlay = overlay;
 *   }
 *
 *   onMouseEnter() {
 *     // exact signature to be determined
 *     this.overlay = this.overlayManager.open(text, ...);
 *   }
 *
 *   onMouseLeave() {
 *     this.overlay.close();
 *     this.overlay = null;
 *   }
 * }
 * ```
 * In our HTML template, we can then add this behavior to a `<div>` or any other element with the
 * `tooltip` selector,
 * like so:
 *
 * ```
 * <div tooltip="some text here"></div>
 * ```
 *
 * Directives can also control the instantiation, destruction, and positioning of inline template
 * elements:
 *
 * A directive uses a {@link ViewContainerRef} to instantiate, insert, move, and destroy views at
 * runtime.
 * The {@link ViewContainerRef} is created as a result of `<template>` element, and represents a
 * location in the current view
 * where these actions are performed.
 *
 * Views are always created as children of the current {@link ViewMetadata}, and as siblings of the
 * `<template>` element. Thus a
 * directive in a child view cannot inject the directive that created it.
 *
 * Since directives that create views via ViewContainers are common in Angular, and using the full
 * `<template>` element syntax is wordy, Angular
 * also supports a shorthand notation: `<li *foo="bar">` and `<li template="foo: bar">` are
 * equivalent.
 *
 * Thus,
 *
 * ```
 * <ul>
 *   <li *foo="bar" title="text"></li>
 * </ul>
 * ```
 *
 * Expands in use to:
 *
 * ```
 * <ul>
 *   <template [foo]="bar">
 *     <li title="text"></li>
 *   </template>
 * </ul>
 * ```
 *
 * Notice that although the shorthand places `*foo="bar"` within the `<li>` element, the binding for
 * the directive
 * controller is correctly instantiated on the `<template>` element rather than the `<li>` element.
 *
 * ## Lifecycle hooks
 *
 * When the directive class implements some {@link ../../guide/lifecycle-hooks.html} the callbacks
 * are called by the change detection at defined points in time during the life of the directive.
 *
 * ### Example
 *
 * Let's suppose we want to implement the `unless` behavior, to conditionally include a template.
 *
 * Here is a simple directive that triggers on an `unless` selector:
 *
 * ```
 * @Directive({
 *   selector: '[unless]',
 *   inputs: ['unless']
 * })
 * export class Unless {
 *   viewContainer: ViewContainerRef;
 *   templateRef: TemplateRef;
 *   prevCondition: boolean;
 *
 *   constructor(viewContainer: ViewContainerRef, templateRef: TemplateRef) {
 *     this.viewContainer = viewContainer;
 *     this.templateRef = templateRef;
 *     this.prevCondition = null;
 *   }
 *
 *   set unless(newCondition) {
 *     if (newCondition && (isBlank(this.prevCondition) || !this.prevCondition)) {
 *       this.prevCondition = true;
 *       this.viewContainer.clear();
 *     } else if (!newCondition && (isBlank(this.prevCondition) || this.prevCondition)) {
 *       this.prevCondition = false;
 *       this.viewContainer.create(this.templateRef);
 *     }
 *   }
 * }
 * ```
 *
 * We can then use this `unless` selector in a template:
 * ```
 * <ul>
 *   <li *unless="expr"></li>
 * </ul>
 * ```
 *
 * Once the directive instantiates the child view, the shorthand notation for the template expands
 * and the result is:
 *
 * ```
 * <ul>
 *   <template [unless]="exp">
 *     <li></li>
 *   </template>
 *   <li></li>
 * </ul>
 * ```
 *
 * Note also that although the `<li></li>` template still exists inside the `<template></template>`,
 * the instantiated
 * view occurs on the second `<li></li>` which is a sibling to the `<template>` element.
 */
exports.Directive = decorators_1.makeDecorator(directives_2.DirectiveMetadata);
// TODO(alexeagle): remove the duplication of this doc. It is copied from ViewMetadata.
/**
 * Metadata properties available for configuring Views.
 *
 * Each Angular component requires a single `@Component` and at least one `@View` annotation. The
 * `@View` annotation specifies the HTML template to use, and lists the directives that are active
 * within the template.
 *
 * When a component is instantiated, the template is loaded into the component's shadow root, and
 * the expressions and statements in the template are evaluated against the component.
 *
 * For details on the `@Component` annotation, see {@link ComponentMetadata}.
 *
 * ### Example
 *
 * ```
 * @Component({
 *   selector: 'greet',
 *   template: 'Hello {{name}}!',
 *   directives: [GreetUser, Bold]
 * })
 * class Greet {
 *   name: string;
 *
 *   constructor() {
 *     this.name = 'World';
 *   }
 * }
 * ```
 */
var View = decorators_1.makeDecorator(view_2.ViewMetadata, function (fn) { return fn.View = View; });
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
 */
exports.Attribute = decorators_1.makeParamDecorator(di_2.AttributeMetadata);
// TODO(alexeagle): remove the duplication of this doc. It is copied from QueryMetadata.
/**
 * Declares an injectable parameter to be a live list of directives or variable
 * bindings from the content children of a directive.
 *
 * ### Example ([live demo](http://plnkr.co/edit/lY9m8HLy7z06vDoUaSN2?p=preview))
 *
 * Assume that `<tabs>` component would like to get a list its children `<pane>`
 * components as shown in this example:
 *
 * ```html
 * <tabs>
 *   <pane title="Overview">...</pane>
 *   <pane *ngFor="let o of objects" [title]="o.title">{{o.text}}</pane>
 * </tabs>
 * ```
 *
 * The preferred solution is to query for `Pane` directives using this decorator.
 *
 * ```javascript
 * @Component({
 *   selector: 'pane',
 *   inputs: ['title']
 * })
 * class Pane {
 *   title:string;
 * }
 *
 * @Component({
 *  selector: 'tabs',
 *  template: `
 *    <ul>
 *      <li *ngFor="let pane of panes">{{pane.title}}</li>
 *    </ul>
 *    <ng-content></ng-content>
 *  `
 * })
 * class Tabs {
 *   panes: QueryList<Pane>;
 *   constructor(@Query(Pane) panes:QueryList<Pane>) {
 *     this.panes = panes;
 *   }
 * }
 * ```
 *
 * A query can look for variable bindings by passing in a string with desired binding symbol.
 *
 * ### Example ([live demo](http://plnkr.co/edit/sT2j25cH1dURAyBRCKx1?p=preview))
 * ```html
 * <seeker>
 *   <div #findme>...</div>
 * </seeker>
 *
 * @Component({ selector: 'seeker' })
 * class seeker {
 *   constructor(@Query('findme') elList: QueryList<ElementRef>) {...}
 * }
 * ```
 *
 * In this case the object that is injected depend on the type of the variable
 * binding. It can be an ElementRef, a directive or a component.
 *
 * Passing in a comma separated list of variable bindings will query for all of them.
 *
 * ```html
 * <seeker>
 *   <div #findMe>...</div>
 *   <div #findMeToo>...</div>
 * </seeker>
 *
 *  @Component({
 *   selector: 'seeker'
 * })
 * class Seeker {
 *   constructor(@Query('findMe, findMeToo') elList: QueryList<ElementRef>) {...}
 * }
 * ```
 *
 * Configure whether query looks for direct children or all descendants
 * of the querying element, by using the `descendants` parameter.
 * It is set to `false` by default.
 *
 * ### Example ([live demo](http://plnkr.co/edit/wtGeB977bv7qvA5FTYl9?p=preview))
 * ```html
 * <container #first>
 *   <item>a</item>
 *   <item>b</item>
 *   <container #second>
 *     <item>c</item>
 *   </container>
 * </container>
 * ```
 *
 * When querying for items, the first container will see only `a` and `b` by default,
 * but with `Query(TextDirective, {descendants: true})` it will see `c` too.
 *
 * The queried directives are kept in a depth-first pre-order with respect to their
 * positions in the DOM.
 *
 * Query does not look deep into any subcomponent views.
 *
 * Query is updated as part of the change-detection cycle. Since change detection
 * happens after construction of a directive, QueryList will always be empty when observed in the
 * constructor.
 *
 * The injected object is an unmodifiable live list.
 * See {@link QueryList} for more details.
 */
exports.Query = decorators_1.makeParamDecorator(di_2.QueryMetadata);
// TODO(alexeagle): remove the duplication of this doc. It is copied from ContentChildrenMetadata.
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
 */
exports.ContentChildren = decorators_1.makePropDecorator(di_2.ContentChildrenMetadata);
// TODO(alexeagle): remove the duplication of this doc. It is copied from ContentChildMetadata.
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
 */
exports.ContentChild = decorators_1.makePropDecorator(di_2.ContentChildMetadata);
// TODO(alexeagle): remove the duplication of this doc. It is copied from ViewChildrenMetadata.
/**
 * Declares a list of child element references.
 *
 * Angular automatically updates the list when the DOM is updated.
 *
 * `ViewChildren` takes a argument to select elements.
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
 *
 * See also: [ViewChildrenMetadata]
 */
exports.ViewChildren = decorators_1.makePropDecorator(di_2.ViewChildrenMetadata);
// TODO(alexeagle): remove the duplication of this doc. It is copied from ViewChildMetadata.
/**
 * Declares a reference to a child element.
 *
 * `ViewChildren` takes a argument to select elements.
 *
 * - If the argument is a type, a directive or a component with the type will be bound.
 *
 * - If the argument is a string, the string is interpreted as a selector. An element containing the
 * matching template variable (e.g. `#child`) will be bound.
 *
 * In either case, `@ViewChild()` assigns the first (looking from above) element if there are
 * multiple matches.
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
 * See also: [ViewChildMetadata]
 */
exports.ViewChild = decorators_1.makePropDecorator(di_2.ViewChildMetadata);
// TODO(alexeagle): remove the duplication of this doc. It is copied from ViewQueryMetadata.
/**
 * Similar to {@link QueryMetadata}, but querying the component view, instead of
 * the content children.
 *
 * ### Example ([live demo](http://plnkr.co/edit/eNsFHDf7YjyM6IzKxM1j?p=preview))
 *
 * ```javascript
 * @Component({
 *   ...,
 *   template: `
 *     <item> a </item>
 *     <item> b </item>
 *     <item> c </item>
 *   `
 * })
 * class MyComponent {
 *   shown: boolean;
 *
 *   constructor(private @Query(Item) items:QueryList<Item>) {
 *     items.changes.subscribe(() => console.log(items.length));
 *   }
 * }
 * ```
 *
 * Supports the same querying parameters as {@link QueryMetadata}, except
 * `descendants`. This always queries the whole view.
 *
 * As `shown` is flipped between true and false, items will contain zero of one
 * items.
 *
 * Specifies that a {@link QueryList} should be injected.
 *
 * The injected object is an iterable and observable live list.
 * See {@link QueryList} for more details.
 */
exports.ViewQuery = decorators_1.makeParamDecorator(di_2.ViewQueryMetadata);
// TODO(alexeagle): remove the duplication of this doc. It is copied from PipeMetadata.
/**
 * Declare reusable pipe function.
 *
 * ### Example
 *
 * {@example core/ts/metadata/metadata.ts region='pipe'}
 */
exports.Pipe = decorators_1.makeDecorator(directives_2.PipeMetadata);
// TODO(alexeagle): remove the duplication of this doc. It is copied from InputMetadata.
/**
 * Declares a data-bound input property.
 *
 * Angular automatically updates data-bound properties during change detection.
 *
 * `InputMetadata` takes an optional parameter that specifies the name
 * used when instantiating a component in the template. When not provided,
 * the name of the decorated property is used.
 *
 * ### Example
 *
 * The following example creates a component with two input properties.
 *
 * ```typescript
 * @Component({
 *   selector: 'bank-account',
 *   template: `
 *     Bank Name: {{bankName}}
 *     Account Id: {{id}}
 *   `
 * })
 * class BankAccount {
 *   @Input() bankName: string;
 *   @Input('account-id') id: string;
 *
 *   // this property is not bound, and won't be automatically updated by Angular
 *   normalizedBankName: string;
 * }
 *
 * @Component({
 *   selector: 'app',
 *   template: `
 *     <bank-account bank-name="RBC" account-id="4747"></bank-account>
 *   `,
 *   directives: [BankAccount]
 * })
 * class App {}
 *
 * bootstrap(App);
 * ```
 */
exports.Input = decorators_1.makePropDecorator(directives_2.InputMetadata);
// TODO(alexeagle): remove the duplication of this doc. It is copied from OutputMetadata.
/**
 * Declares an event-bound output property.
 *
 * When an output property emits an event, an event handler attached to that event
 * the template is invoked.
 *
 * `OutputMetadata` takes an optional parameter that specifies the name
 * used when instantiating a component in the template. When not provided,
 * the name of the decorated property is used.
 *
 * ### Example
 *
 * ```typescript
 * @Directive({
 *   selector: 'interval-dir',
 * })
 * class IntervalDir {
 *   @Output() everySecond = new EventEmitter();
 *   @Output('everyFiveSeconds') five5Secs = new EventEmitter();
 *
 *   constructor() {
 *     setInterval(() => this.everySecond.emit("event"), 1000);
 *     setInterval(() => this.five5Secs.emit("event"), 5000);
 *   }
 * }
 *
 * @Component({
 *   selector: 'app',
 *   template: `
 *     <interval-dir (everySecond)="everySecond()" (everyFiveSeconds)="everyFiveSeconds()">
 *     </interval-dir>
 *   `,
 *   directives: [IntervalDir]
 * })
 * class App {
 *   everySecond() { console.log('second'); }
 *   everyFiveSeconds() { console.log('five seconds'); }
 * }
 * bootstrap(App);
 * ```
 */
exports.Output = decorators_1.makePropDecorator(directives_2.OutputMetadata);
// TODO(alexeagle): remove the duplication of this doc. It is copied from HostBindingMetadata.
/**
 * Declares a host property binding.
 *
 * Angular automatically checks host property bindings during change detection.
 * If a binding changes, it will update the host element of the directive.
 *
 * `HostBindingMetadata` takes an optional parameter that specifies the property
 * name of the host element that will be updated. When not provided,
 * the class property name is used.
 *
 * ### Example
 *
 * The following example creates a directive that sets the `valid` and `invalid` classes
 * on the DOM element that has ngModel directive on it.
 *
 * ```typescript
 * @Directive({selector: '[ngModel]'})
 * class NgModelStatus {
 *   constructor(public control:NgModel) {}
 *   @HostBinding('[class.valid]') get valid { return this.control.valid; }
 *   @HostBinding('[class.invalid]') get invalid { return this.control.invalid; }
 * }
 *
 * @Component({
 *   selector: 'app',
 *   template: `<input [(ngModel)]="prop">`,
 *   directives: [FORM_DIRECTIVES, NgModelStatus]
 * })
 * class App {
 *   prop;
 * }
 *
 * bootstrap(App);
 * ```
 */
exports.HostBinding = decorators_1.makePropDecorator(directives_2.HostBindingMetadata);
// TODO(alexeagle): remove the duplication of this doc. It is copied from HostListenerMetadata.
/**
 * Declares a host listener.
 *
 * Angular will invoke the decorated method when the host element emits the specified event.
 *
 * If the decorated method returns `false`, then `preventDefault` is applied on the DOM
 * event.
 *
 * ### Example
 *
 * The following example declares a directive that attaches a click listener to the button and
 * counts clicks.
 *
 * ```typescript
 * @Directive({selector: 'button[counting]'})
 * class CountClicks {
 *   numberOfClicks = 0;
 *
 *   @HostListener('click', ['$event.target'])
 *   onClick(btn) {
 *     console.log("button", btn, "number of clicks:", this.numberOfClicks++);
 *   }
 * }
 *
 * @Component({
 *   selector: 'app',
 *   template: `<button counting>Increment</button>`,
 *   directives: [CountClicks]
 * })
 * class App {}
 *
 * bootstrap(App);
 * ```
 */
exports.HostListener = decorators_1.makePropDecorator(directives_2.HostListenerMetadata);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWV0YWRhdGEuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJkaWZmaW5nX3BsdWdpbl93cmFwcGVyLW91dHB1dF9wYXRoLXI1UHJKSzloLnRtcC9hbmd1bGFyMi9zcmMvY29yZS9tZXRhZGF0YS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O0dBR0c7O0FBRUgsbUJBUU8sZUFBZSxDQUFDO0FBUHJCLDJDQUFhO0FBQ2IsK0RBQXVCO0FBQ3ZCLHlEQUFvQjtBQUNwQix5REFBb0I7QUFDcEIsbURBQWlCO0FBQ2pCLG1EQUFpQjtBQUNqQixtREFDcUI7QUFFdkIsMkJBUU8sdUJBQXVCLENBQUM7QUFQN0IsMkRBQWlCO0FBQ2pCLDJEQUFpQjtBQUNqQixpREFBWTtBQUNaLG1EQUFhO0FBQ2IscURBQWM7QUFDZCwrREFBbUI7QUFDbkIsaUVBQzZCO0FBRS9CLHFCQUE4QyxpQkFBaUIsQ0FBQztBQUF4RCwyQ0FBWTtBQUFFLHFEQUEwQztBQWFoRSxtQkFRTyxlQUFlLENBQUMsQ0FBQTtBQUV2QiwyQkFRTyx1QkFBdUIsQ0FBQyxDQUFBO0FBRS9CLHFCQUE4QyxpQkFBaUIsQ0FBQyxDQUFBO0FBR2hFLDJCQU1PLG1CQUFtQixDQUFDLENBQUE7QUF5YTNCLDRGQUE0RjtBQUM1Rjs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztHQXNCRztBQUNRLGlCQUFTLEdBQ1UsMEJBQWEsQ0FBQyw4QkFBaUIsRUFBRSxVQUFDLEVBQU8sSUFBSyxPQUFBLEVBQUUsQ0FBQyxJQUFJLEdBQUcsSUFBSSxFQUFkLENBQWMsQ0FBQyxDQUFDO0FBRTVGLDRGQUE0RjtBQUM1Rjs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7R0F5WEc7QUFDUSxpQkFBUyxHQUNVLDBCQUFhLENBQUMsOEJBQWlCLENBQUMsQ0FBQztBQUUvRCx1RkFBdUY7QUFDdkY7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7R0E0Qkc7QUFDSCxJQUFJLElBQUksR0FDaUIsMEJBQWEsQ0FBQyxtQkFBWSxFQUFFLFVBQUMsRUFBTyxJQUFLLE9BQUEsRUFBRSxDQUFDLElBQUksR0FBRyxJQUFJLEVBQWQsQ0FBYyxDQUFDLENBQUM7QUFFbEY7Ozs7Ozs7Ozs7Ozs7Ozs7R0FnQkc7QUFDUSxpQkFBUyxHQUE2QiwrQkFBa0IsQ0FBQyxzQkFBaUIsQ0FBQyxDQUFDO0FBRXZGLHdGQUF3RjtBQUN4Rjs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztHQTBHRztBQUNRLGFBQUssR0FBeUIsK0JBQWtCLENBQUMsa0JBQWEsQ0FBQyxDQUFDO0FBRTNFLGtHQUFrRztBQUNsRzs7Ozs7Ozs7Ozs7Ozs7Ozs7OztHQW1CRztBQUNRLHVCQUFlLEdBQ3RCLDhCQUFpQixDQUFDLDRCQUF1QixDQUFDLENBQUM7QUFFL0MsK0ZBQStGO0FBQy9GOzs7Ozs7Ozs7Ozs7Ozs7Ozs7O0dBbUJHO0FBQ1Esb0JBQVksR0FBZ0MsOEJBQWlCLENBQUMseUJBQW9CLENBQUMsQ0FBQztBQUUvRiwrRkFBK0Y7QUFDL0Y7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztHQThFRztBQUNRLG9CQUFZLEdBQWdDLDhCQUFpQixDQUFDLHlCQUFvQixDQUFDLENBQUM7QUFFL0YsNEZBQTRGO0FBQzVGOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7R0FxRUc7QUFDUSxpQkFBUyxHQUE2Qiw4QkFBaUIsQ0FBQyxzQkFBaUIsQ0FBQyxDQUFDO0FBRXRGLDRGQUE0RjtBQUM1Rjs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztHQWtDRztBQUNRLGlCQUFTLEdBQXlCLCtCQUFrQixDQUFDLHNCQUFpQixDQUFDLENBQUM7QUFFbkYsdUZBQXVGO0FBQ3ZGOzs7Ozs7R0FNRztBQUNRLFlBQUksR0FBNkMsMEJBQWEsQ0FBQyx5QkFBWSxDQUFDLENBQUM7QUFFeEYsd0ZBQXdGO0FBQ3hGOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0dBd0NHO0FBQ1EsYUFBSyxHQUF5Qiw4QkFBaUIsQ0FBQywwQkFBYSxDQUFDLENBQUM7QUFFMUUseUZBQXlGO0FBQ3pGOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0dBd0NHO0FBQ1EsY0FBTSxHQUEwQiw4QkFBaUIsQ0FBQywyQkFBYyxDQUFDLENBQUM7QUFFN0UsOEZBQThGO0FBQzlGOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0dBa0NHO0FBQ1EsbUJBQVcsR0FBK0IsOEJBQWlCLENBQUMsZ0NBQW1CLENBQUMsQ0FBQztBQUU1RiwrRkFBK0Y7QUFDL0Y7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztHQWlDRztBQUNRLG9CQUFZLEdBQWdDLDhCQUFpQixDQUFDLGlDQUFvQixDQUFDLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIFRoaXMgaW5kaXJlY3Rpb24gaXMgbmVlZGVkIHRvIGZyZWUgdXAgQ29tcG9uZW50LCBldGMgc3ltYm9scyBpbiB0aGUgcHVibGljIEFQSVxuICogdG8gYmUgdXNlZCBieSB0aGUgZGVjb3JhdG9yIHZlcnNpb25zIG9mIHRoZXNlIGFubm90YXRpb25zLlxuICovXG5cbmV4cG9ydCB7XG4gIFF1ZXJ5TWV0YWRhdGEsXG4gIENvbnRlbnRDaGlsZHJlbk1ldGFkYXRhLFxuICBDb250ZW50Q2hpbGRNZXRhZGF0YSxcbiAgVmlld0NoaWxkcmVuTWV0YWRhdGEsXG4gIFZpZXdRdWVyeU1ldGFkYXRhLFxuICBWaWV3Q2hpbGRNZXRhZGF0YSxcbiAgQXR0cmlidXRlTWV0YWRhdGFcbn0gZnJvbSAnLi9tZXRhZGF0YS9kaSc7XG5cbmV4cG9ydCB7XG4gIENvbXBvbmVudE1ldGFkYXRhLFxuICBEaXJlY3RpdmVNZXRhZGF0YSxcbiAgUGlwZU1ldGFkYXRhLFxuICBJbnB1dE1ldGFkYXRhLFxuICBPdXRwdXRNZXRhZGF0YSxcbiAgSG9zdEJpbmRpbmdNZXRhZGF0YSxcbiAgSG9zdExpc3RlbmVyTWV0YWRhdGFcbn0gZnJvbSAnLi9tZXRhZGF0YS9kaXJlY3RpdmVzJztcblxuZXhwb3J0IHtWaWV3TWV0YWRhdGEsIFZpZXdFbmNhcHN1bGF0aW9ufSBmcm9tICcuL21ldGFkYXRhL3ZpZXcnO1xuXG5leHBvcnQge1xuICBBZnRlckNvbnRlbnRJbml0LFxuICBBZnRlckNvbnRlbnRDaGVja2VkLFxuICBBZnRlclZpZXdJbml0LFxuICBBZnRlclZpZXdDaGVja2VkLFxuICBPbkNoYW5nZXMsXG4gIE9uRGVzdHJveSxcbiAgT25Jbml0LFxuICBEb0NoZWNrXG59IGZyb20gJy4vbWV0YWRhdGEvbGlmZWN5Y2xlX2hvb2tzJztcblxuaW1wb3J0IHtcbiAgUXVlcnlNZXRhZGF0YSxcbiAgQ29udGVudENoaWxkcmVuTWV0YWRhdGEsXG4gIENvbnRlbnRDaGlsZE1ldGFkYXRhLFxuICBWaWV3Q2hpbGRyZW5NZXRhZGF0YSxcbiAgVmlld0NoaWxkTWV0YWRhdGEsXG4gIFZpZXdRdWVyeU1ldGFkYXRhLFxuICBBdHRyaWJ1dGVNZXRhZGF0YVxufSBmcm9tICcuL21ldGFkYXRhL2RpJztcblxuaW1wb3J0IHtcbiAgQ29tcG9uZW50TWV0YWRhdGEsXG4gIERpcmVjdGl2ZU1ldGFkYXRhLFxuICBQaXBlTWV0YWRhdGEsXG4gIElucHV0TWV0YWRhdGEsXG4gIE91dHB1dE1ldGFkYXRhLFxuICBIb3N0QmluZGluZ01ldGFkYXRhLFxuICBIb3N0TGlzdGVuZXJNZXRhZGF0YVxufSBmcm9tICcuL21ldGFkYXRhL2RpcmVjdGl2ZXMnO1xuXG5pbXBvcnQge1ZpZXdNZXRhZGF0YSwgVmlld0VuY2Fwc3VsYXRpb259IGZyb20gJy4vbWV0YWRhdGEvdmlldyc7XG5pbXBvcnQge0NoYW5nZURldGVjdGlvblN0cmF0ZWd5fSBmcm9tICdhbmd1bGFyMi9zcmMvY29yZS9jaGFuZ2VfZGV0ZWN0aW9uL2NoYW5nZV9kZXRlY3Rpb24nO1xuXG5pbXBvcnQge1xuICBtYWtlRGVjb3JhdG9yLFxuICBtYWtlUGFyYW1EZWNvcmF0b3IsXG4gIG1ha2VQcm9wRGVjb3JhdG9yLFxuICBUeXBlRGVjb3JhdG9yLFxuICBDbGFzc1xufSBmcm9tICcuL3V0aWwvZGVjb3JhdG9ycyc7XG5pbXBvcnQge1R5cGV9IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvbGFuZyc7XG5cbi8qKlxuICogSW50ZXJmYWNlIGZvciB0aGUge0BsaW5rIERpcmVjdGl2ZU1ldGFkYXRhfSBkZWNvcmF0b3IgZnVuY3Rpb24uXG4gKlxuICogU2VlIHtAbGluayBEaXJlY3RpdmVGYWN0b3J5fS5cbiAqL1xuZXhwb3J0IGludGVyZmFjZSBEaXJlY3RpdmVEZWNvcmF0b3IgZXh0ZW5kcyBUeXBlRGVjb3JhdG9yIHt9XG5cbi8qKlxuICogSW50ZXJmYWNlIGZvciB0aGUge0BsaW5rIENvbXBvbmVudE1ldGFkYXRhfSBkZWNvcmF0b3IgZnVuY3Rpb24uXG4gKlxuICogU2VlIHtAbGluayBDb21wb25lbnRGYWN0b3J5fS5cbiAqL1xuZXhwb3J0IGludGVyZmFjZSBDb21wb25lbnREZWNvcmF0b3IgZXh0ZW5kcyBUeXBlRGVjb3JhdG9yIHtcbiAgLyoqXG4gICAqIENoYWluIHtAbGluayBWaWV3TWV0YWRhdGF9IGFubm90YXRpb24uXG4gICAqL1xuICBWaWV3KG9iajoge1xuICAgIHRlbXBsYXRlVXJsPzogc3RyaW5nLFxuICAgIHRlbXBsYXRlPzogc3RyaW5nLFxuICAgIGRpcmVjdGl2ZXM/OiBBcnJheTxUeXBlIHwgYW55W10+LFxuICAgIHBpcGVzPzogQXJyYXk8VHlwZSB8IGFueVtdPixcbiAgICByZW5kZXJlcj86IHN0cmluZyxcbiAgICBzdHlsZXM/OiBzdHJpbmdbXSxcbiAgICBzdHlsZVVybHM/OiBzdHJpbmdbXSxcbiAgfSk6IFZpZXdEZWNvcmF0b3I7XG59XG5cbi8qKlxuICogSW50ZXJmYWNlIGZvciB0aGUge0BsaW5rIFZpZXdNZXRhZGF0YX0gZGVjb3JhdG9yIGZ1bmN0aW9uLlxuICpcbiAqIFNlZSB7QGxpbmsgVmlld0ZhY3Rvcnl9LlxuICovXG5leHBvcnQgaW50ZXJmYWNlIFZpZXdEZWNvcmF0b3IgZXh0ZW5kcyBUeXBlRGVjb3JhdG9yIHtcbiAgLyoqXG4gICAqIENoYWluIHtAbGluayBWaWV3TWV0YWRhdGF9IGFubm90YXRpb24uXG4gICAqL1xuICBWaWV3KG9iajoge1xuICAgIHRlbXBsYXRlVXJsPzogc3RyaW5nLFxuICAgIHRlbXBsYXRlPzogc3RyaW5nLFxuICAgIGRpcmVjdGl2ZXM/OiBBcnJheTxUeXBlIHwgYW55W10+LFxuICAgIHBpcGVzPzogQXJyYXk8VHlwZSB8IGFueVtdPixcbiAgICByZW5kZXJlcj86IHN0cmluZyxcbiAgICBzdHlsZXM/OiBzdHJpbmdbXSxcbiAgICBzdHlsZVVybHM/OiBzdHJpbmdbXSxcbiAgfSk6IFZpZXdEZWNvcmF0b3I7XG59XG5cbi8qKlxuICoge0BsaW5rIERpcmVjdGl2ZU1ldGFkYXRhfSBmYWN0b3J5IGZvciBjcmVhdGluZyBhbm5vdGF0aW9ucywgZGVjb3JhdG9ycyBvciBEU0wuXG4gKlxuICogIyMjIEV4YW1wbGUgYXMgVHlwZVNjcmlwdCBEZWNvcmF0b3JcbiAqXG4gKiB7QGV4YW1wbGUgY29yZS90cy9tZXRhZGF0YS9tZXRhZGF0YS50cyByZWdpb249J2RpcmVjdGl2ZSd9XG4gKlxuICogIyMjIEV4YW1wbGUgYXMgRVM1IERTTFxuICpcbiAqIGBgYFxuICogdmFyIE15RGlyZWN0aXZlID0gbmdcbiAqICAgLkRpcmVjdGl2ZSh7Li4ufSlcbiAqICAgLkNsYXNzKHtcbiAqICAgICBjb25zdHJ1Y3RvcjogZnVuY3Rpb24oKSB7XG4gKiAgICAgICAuLi5cbiAqICAgICB9XG4gKiAgIH0pXG4gKiBgYGBcbiAqXG4gKiAjIyMgRXhhbXBsZSBhcyBFUzUgYW5ub3RhdGlvblxuICpcbiAqIGBgYFxuICogdmFyIE15RGlyZWN0aXZlID0gZnVuY3Rpb24oKSB7XG4gKiAgIC4uLlxuICogfTtcbiAqXG4gKiBNeURpcmVjdGl2ZS5hbm5vdGF0aW9ucyA9IFtcbiAqICAgbmV3IG5nLkRpcmVjdGl2ZSh7Li4ufSlcbiAqIF1cbiAqIGBgYFxuICovXG5leHBvcnQgaW50ZXJmYWNlIERpcmVjdGl2ZU1ldGFkYXRhRmFjdG9yeSB7XG4gIChvYmo6IHtcbiAgICBzZWxlY3Rvcj86IHN0cmluZyxcbiAgICBpbnB1dHM/OiBzdHJpbmdbXSxcbiAgICBvdXRwdXRzPzogc3RyaW5nW10sXG4gICAgcHJvcGVydGllcz86IHN0cmluZ1tdLFxuICAgIGV2ZW50cz86IHN0cmluZ1tdLFxuICAgIGhvc3Q/OiB7W2tleTogc3RyaW5nXTogc3RyaW5nfSxcbiAgICBiaW5kaW5ncz86IGFueVtdLFxuICAgIHByb3ZpZGVycz86IGFueVtdLFxuICAgIGV4cG9ydEFzPzogc3RyaW5nLFxuICAgIHF1ZXJpZXM/OiB7W2tleTogc3RyaW5nXTogYW55fVxuICB9KTogRGlyZWN0aXZlRGVjb3JhdG9yO1xuICBuZXcgKG9iajoge1xuICAgIHNlbGVjdG9yPzogc3RyaW5nLFxuICAgIGlucHV0cz86IHN0cmluZ1tdLFxuICAgIG91dHB1dHM/OiBzdHJpbmdbXSxcbiAgICBwcm9wZXJ0aWVzPzogc3RyaW5nW10sXG4gICAgZXZlbnRzPzogc3RyaW5nW10sXG4gICAgaG9zdD86IHtba2V5OiBzdHJpbmddOiBzdHJpbmd9LFxuICAgIGJpbmRpbmdzPzogYW55W10sXG4gICAgcHJvdmlkZXJzPzogYW55W10sXG4gICAgZXhwb3J0QXM/OiBzdHJpbmcsXG4gICAgcXVlcmllcz86IHtba2V5OiBzdHJpbmddOiBhbnl9XG4gIH0pOiBEaXJlY3RpdmVNZXRhZGF0YTtcbn1cblxuLyoqXG4gKiB7QGxpbmsgQ29tcG9uZW50TWV0YWRhdGF9IGZhY3RvcnkgZm9yIGNyZWF0aW5nIGFubm90YXRpb25zLCBkZWNvcmF0b3JzIG9yIERTTC5cbiAqXG4gKiAjIyMgRXhhbXBsZSBhcyBUeXBlU2NyaXB0IERlY29yYXRvclxuICpcbiAqIHtAZXhhbXBsZSBjb3JlL3RzL21ldGFkYXRhL21ldGFkYXRhLnRzIHJlZ2lvbj0nY29tcG9uZW50J31cbiAqXG4gKiAjIyMgRXhhbXBsZSBhcyBFUzUgRFNMXG4gKlxuICogYGBgXG4gKiB2YXIgTXlDb21wb25lbnQgPSBuZ1xuICogICAuQ29tcG9uZW50KHsuLi59KVxuICogICAuQ2xhc3Moe1xuICogICAgIGNvbnN0cnVjdG9yOiBmdW5jdGlvbigpIHtcbiAqICAgICAgIC4uLlxuICogICAgIH1cbiAqICAgfSlcbiAqIGBgYFxuICpcbiAqICMjIyBFeGFtcGxlIGFzIEVTNSBhbm5vdGF0aW9uXG4gKlxuICogYGBgXG4gKiB2YXIgTXlDb21wb25lbnQgPSBmdW5jdGlvbigpIHtcbiAqICAgLi4uXG4gKiB9O1xuICpcbiAqIE15Q29tcG9uZW50LmFubm90YXRpb25zID0gW1xuICogICBuZXcgbmcuQ29tcG9uZW50KHsuLi59KVxuICogXVxuICogYGBgXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgQ29tcG9uZW50TWV0YWRhdGFGYWN0b3J5IHtcbiAgKG9iajoge1xuICAgIHNlbGVjdG9yPzogc3RyaW5nLFxuICAgIGlucHV0cz86IHN0cmluZ1tdLFxuICAgIG91dHB1dHM/OiBzdHJpbmdbXSxcbiAgICBwcm9wZXJ0aWVzPzogc3RyaW5nW10sXG4gICAgZXZlbnRzPzogc3RyaW5nW10sXG4gICAgaG9zdD86IHtba2V5OiBzdHJpbmddOiBzdHJpbmd9LFxuICAgIC8qIEBkZXByZWNhdGVkICovXG4gICAgYmluZGluZ3M/OiBhbnlbXSxcbiAgICBwcm92aWRlcnM/OiBhbnlbXSxcbiAgICBleHBvcnRBcz86IHN0cmluZyxcbiAgICBtb2R1bGVJZD86IHN0cmluZyxcbiAgICBxdWVyaWVzPzoge1trZXk6IHN0cmluZ106IGFueX0sXG4gICAgdmlld0JpbmRpbmdzPzogYW55W10sXG4gICAgdmlld1Byb3ZpZGVycz86IGFueVtdLFxuICAgIGNoYW5nZURldGVjdGlvbj86IENoYW5nZURldGVjdGlvblN0cmF0ZWd5LFxuICAgIHRlbXBsYXRlVXJsPzogc3RyaW5nLFxuICAgIHRlbXBsYXRlPzogc3RyaW5nLFxuICAgIHN0eWxlVXJscz86IHN0cmluZ1tdLFxuICAgIHN0eWxlcz86IHN0cmluZ1tdLFxuICAgIGRpcmVjdGl2ZXM/OiBBcnJheTxUeXBlIHwgYW55W10+LFxuICAgIHBpcGVzPzogQXJyYXk8VHlwZSB8IGFueVtdPixcbiAgICBlbmNhcHN1bGF0aW9uPzogVmlld0VuY2Fwc3VsYXRpb25cbiAgfSk6IENvbXBvbmVudERlY29yYXRvcjtcbiAgbmV3IChvYmo6IHtcbiAgICBzZWxlY3Rvcj86IHN0cmluZyxcbiAgICBpbnB1dHM/OiBzdHJpbmdbXSxcbiAgICBvdXRwdXRzPzogc3RyaW5nW10sXG4gICAgcHJvcGVydGllcz86IHN0cmluZ1tdLFxuICAgIGV2ZW50cz86IHN0cmluZ1tdLFxuICAgIGhvc3Q/OiB7W2tleTogc3RyaW5nXTogc3RyaW5nfSxcbiAgICAvKiBAZGVwcmVjYXRlZCAqL1xuICAgIGJpbmRpbmdzPzogYW55W10sXG4gICAgcHJvdmlkZXJzPzogYW55W10sXG4gICAgZXhwb3J0QXM/OiBzdHJpbmcsXG4gICAgbW9kdWxlSWQ/OiBzdHJpbmcsXG4gICAgcXVlcmllcz86IHtba2V5OiBzdHJpbmddOiBhbnl9LFxuICAgIC8qIEBkZXByZWNhdGVkICovXG4gICAgdmlld0JpbmRpbmdzPzogYW55W10sXG4gICAgdmlld1Byb3ZpZGVycz86IGFueVtdLFxuICAgIGNoYW5nZURldGVjdGlvbj86IENoYW5nZURldGVjdGlvblN0cmF0ZWd5LFxuICAgIHRlbXBsYXRlVXJsPzogc3RyaW5nLFxuICAgIHRlbXBsYXRlPzogc3RyaW5nLFxuICAgIHN0eWxlVXJscz86IHN0cmluZ1tdLFxuICAgIHN0eWxlcz86IHN0cmluZ1tdLFxuICAgIGRpcmVjdGl2ZXM/OiBBcnJheTxUeXBlIHwgYW55W10+LFxuICAgIHBpcGVzPzogQXJyYXk8VHlwZSB8IGFueVtdPixcbiAgICBlbmNhcHN1bGF0aW9uPzogVmlld0VuY2Fwc3VsYXRpb25cbiAgfSk6IENvbXBvbmVudE1ldGFkYXRhO1xufVxuXG4vKipcbiAqIHtAbGluayBWaWV3TWV0YWRhdGF9IGZhY3RvcnkgZm9yIGNyZWF0aW5nIGFubm90YXRpb25zLCBkZWNvcmF0b3JzIG9yIERTTC5cbiAqXG4gKiAjIyMgRXhhbXBsZSBhcyBUeXBlU2NyaXB0IERlY29yYXRvclxuICpcbiAqIGBgYFxuICogaW1wb3J0IHtDb21wb25lbnQsIFZpZXd9IGZyb20gXCJhbmd1bGFyMi9jb3JlXCI7XG4gKlxuICogQENvbXBvbmVudCh7Li4ufSlcbiAqIGNsYXNzIE15Q29tcG9uZW50IHtcbiAqICAgY29uc3RydWN0b3IoKSB7XG4gKiAgICAgLi4uXG4gKiAgIH1cbiAqIH1cbiAqIGBgYFxuICpcbiAqICMjIyBFeGFtcGxlIGFzIEVTNSBEU0xcbiAqXG4gKiBgYGBcbiAqIHZhciBNeUNvbXBvbmVudCA9IG5nXG4gKiAgIC5Db21wb25lbnQoey4uLn0pXG4gKiAgIC5WaWV3KHsuLi59KVxuICogICAuQ2xhc3Moe1xuICogICAgIGNvbnN0cnVjdG9yOiBmdW5jdGlvbigpIHtcbiAqICAgICAgIC4uLlxuICogICAgIH1cbiAqICAgfSlcbiAqIGBgYFxuICpcbiAqICMjIyBFeGFtcGxlIGFzIEVTNSBhbm5vdGF0aW9uXG4gKlxuICogYGBgXG4gKiB2YXIgTXlDb21wb25lbnQgPSBmdW5jdGlvbigpIHtcbiAqICAgLi4uXG4gKiB9O1xuICpcbiAqIE15Q29tcG9uZW50LmFubm90YXRpb25zID0gW1xuICogICBuZXcgbmcuQ29tcG9uZW50KHsuLi59KSxcbiAqICAgbmV3IG5nLlZpZXcoey4uLn0pXG4gKiBdXG4gKiBgYGBcbiAqL1xuZXhwb3J0IGludGVyZmFjZSBWaWV3TWV0YWRhdGFGYWN0b3J5IHtcbiAgKG9iajoge1xuICAgIHRlbXBsYXRlVXJsPzogc3RyaW5nLFxuICAgIHRlbXBsYXRlPzogc3RyaW5nLFxuICAgIGRpcmVjdGl2ZXM/OiBBcnJheTxUeXBlIHwgYW55W10+LFxuICAgIHBpcGVzPzogQXJyYXk8VHlwZSB8IGFueVtdPixcbiAgICBlbmNhcHN1bGF0aW9uPzogVmlld0VuY2Fwc3VsYXRpb24sXG4gICAgc3R5bGVzPzogc3RyaW5nW10sXG4gICAgc3R5bGVVcmxzPzogc3RyaW5nW10sXG4gIH0pOiBWaWV3RGVjb3JhdG9yO1xuICBuZXcgKG9iajoge1xuICAgIHRlbXBsYXRlVXJsPzogc3RyaW5nLFxuICAgIHRlbXBsYXRlPzogc3RyaW5nLFxuICAgIGRpcmVjdGl2ZXM/OiBBcnJheTxUeXBlIHwgYW55W10+LFxuICAgIHBpcGVzPzogQXJyYXk8VHlwZSB8IGFueVtdPixcbiAgICBlbmNhcHN1bGF0aW9uPzogVmlld0VuY2Fwc3VsYXRpb24sXG4gICAgc3R5bGVzPzogc3RyaW5nW10sXG4gICAgc3R5bGVVcmxzPzogc3RyaW5nW10sXG4gIH0pOiBWaWV3TWV0YWRhdGE7XG59XG5cbi8qKlxuICoge0BsaW5rIEF0dHJpYnV0ZU1ldGFkYXRhfSBmYWN0b3J5IGZvciBjcmVhdGluZyBhbm5vdGF0aW9ucywgZGVjb3JhdG9ycyBvciBEU0wuXG4gKlxuICogIyMjIEV4YW1wbGUgYXMgVHlwZVNjcmlwdCBEZWNvcmF0b3JcbiAqXG4gKiB7QGV4YW1wbGUgY29yZS90cy9tZXRhZGF0YS9tZXRhZGF0YS50cyByZWdpb249J2F0dHJpYnV0ZUZhY3RvcnknfVxuICpcbiAqICMjIyBFeGFtcGxlIGFzIEVTNSBEU0xcbiAqXG4gKiBgYGBcbiAqIHZhciBNeUNvbXBvbmVudCA9IG5nXG4gKiAgIC5Db21wb25lbnQoey4uLn0pXG4gKiAgIC5DbGFzcyh7XG4gKiAgICAgY29uc3RydWN0b3I6IFtuZXcgbmcuQXR0cmlidXRlKCd0aXRsZScpLCBmdW5jdGlvbih0aXRsZSkge1xuICogICAgICAgLi4uXG4gKiAgICAgfV1cbiAqICAgfSlcbiAqIGBgYFxuICpcbiAqICMjIyBFeGFtcGxlIGFzIEVTNSBhbm5vdGF0aW9uXG4gKlxuICogYGBgXG4gKiB2YXIgTXlDb21wb25lbnQgPSBmdW5jdGlvbih0aXRsZSkge1xuICogICAuLi5cbiAqIH07XG4gKlxuICogTXlDb21wb25lbnQuYW5ub3RhdGlvbnMgPSBbXG4gKiAgIG5ldyBuZy5Db21wb25lbnQoey4uLn0pXG4gKiBdXG4gKiBNeUNvbXBvbmVudC5wYXJhbWV0ZXJzID0gW1xuICogICBbbmV3IG5nLkF0dHJpYnV0ZSgndGl0bGUnKV1cbiAqIF1cbiAqIGBgYFxuICovXG5leHBvcnQgaW50ZXJmYWNlIEF0dHJpYnV0ZU1ldGFkYXRhRmFjdG9yeSB7XG4gIChuYW1lOiBzdHJpbmcpOiBUeXBlRGVjb3JhdG9yO1xuICBuZXcgKG5hbWU6IHN0cmluZyk6IEF0dHJpYnV0ZU1ldGFkYXRhO1xufVxuXG4vKipcbiAqIHtAbGluayBRdWVyeU1ldGFkYXRhfSBmYWN0b3J5IGZvciBjcmVhdGluZyBhbm5vdGF0aW9ucywgZGVjb3JhdG9ycyBvciBEU0wuXG4gKlxuICogIyMjIEV4YW1wbGUgYXMgVHlwZVNjcmlwdCBEZWNvcmF0b3JcbiAqXG4gKiBgYGBcbiAqIGltcG9ydCB7UXVlcnksIFF1ZXJ5TGlzdCwgQ29tcG9uZW50fSBmcm9tIFwiYW5ndWxhcjIvY29yZVwiO1xuICpcbiAqIEBDb21wb25lbnQoey4uLn0pXG4gKiBjbGFzcyBNeUNvbXBvbmVudCB7XG4gKiAgIGNvbnN0cnVjdG9yKEBRdWVyeShTb21lVHlwZSkgcXVlcnlMaXN0OiBRdWVyeUxpc3Q8U29tZVR5cGU+KSB7XG4gKiAgICAgLi4uXG4gKiAgIH1cbiAqIH1cbiAqIGBgYFxuICpcbiAqICMjIyBFeGFtcGxlIGFzIEVTNSBEU0xcbiAqXG4gKiBgYGBcbiAqIHZhciBNeUNvbXBvbmVudCA9IG5nXG4gKiAgIC5Db21wb25lbnQoey4uLn0pXG4gKiAgIC5DbGFzcyh7XG4gKiAgICAgY29uc3RydWN0b3I6IFtuZXcgbmcuUXVlcnkoU29tZVR5cGUpLCBmdW5jdGlvbihxdWVyeUxpc3QpIHtcbiAqICAgICAgIC4uLlxuICogICAgIH1dXG4gKiAgIH0pXG4gKiBgYGBcbiAqXG4gKiAjIyMgRXhhbXBsZSBhcyBFUzUgYW5ub3RhdGlvblxuICpcbiAqIGBgYFxuICogdmFyIE15Q29tcG9uZW50ID0gZnVuY3Rpb24ocXVlcnlMaXN0KSB7XG4gKiAgIC4uLlxuICogfTtcbiAqXG4gKiBNeUNvbXBvbmVudC5hbm5vdGF0aW9ucyA9IFtcbiAqICAgbmV3IG5nLkNvbXBvbmVudCh7Li4ufSlcbiAqIF1cbiAqIE15Q29tcG9uZW50LnBhcmFtZXRlcnMgPSBbXG4gKiAgIFtuZXcgbmcuUXVlcnkoU29tZVR5cGUpXVxuICogXVxuICogYGBgXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgUXVlcnlNZXRhZGF0YUZhY3Rvcnkge1xuICAoc2VsZWN0b3I6IFR5cGUgfCBzdHJpbmcsXG4gICB7ZGVzY2VuZGFudHMsIHJlYWR9Pzoge2Rlc2NlbmRhbnRzPzogYm9vbGVhbiwgcmVhZD86IGFueX0pOiBQYXJhbWV0ZXJEZWNvcmF0b3I7XG4gIG5ldyAoc2VsZWN0b3I6IFR5cGUgfCBzdHJpbmcsXG4gICAgICAge2Rlc2NlbmRhbnRzLCByZWFkfT86IHtkZXNjZW5kYW50cz86IGJvb2xlYW4sIHJlYWQ/OiBhbnl9KTogUXVlcnlNZXRhZGF0YTtcbn1cblxuLyoqXG4gKiBGYWN0b3J5IGZvciB7QGxpbmsgQ29udGVudENoaWxkcmVufS5cbiAqL1xuZXhwb3J0IGludGVyZmFjZSBDb250ZW50Q2hpbGRyZW5NZXRhZGF0YUZhY3Rvcnkge1xuICAoc2VsZWN0b3I6IFR5cGUgfCBzdHJpbmcsIHtkZXNjZW5kYW50cywgcmVhZH0/OiB7ZGVzY2VuZGFudHM/OiBib29sZWFuLCByZWFkPzogYW55fSk6IGFueTtcbiAgbmV3IChzZWxlY3RvcjogVHlwZSB8IHN0cmluZyxcbiAgICAgICB7ZGVzY2VuZGFudHMsIHJlYWR9Pzoge2Rlc2NlbmRhbnRzPzogYm9vbGVhbiwgcmVhZD86IGFueX0pOiBDb250ZW50Q2hpbGRyZW5NZXRhZGF0YTtcbn1cblxuLyoqXG4gKiBGYWN0b3J5IGZvciB7QGxpbmsgQ29udGVudENoaWxkfS5cbiAqL1xuZXhwb3J0IGludGVyZmFjZSBDb250ZW50Q2hpbGRNZXRhZGF0YUZhY3Rvcnkge1xuICAoc2VsZWN0b3I6IFR5cGUgfCBzdHJpbmcsIHtyZWFkfT86IHtyZWFkPzogYW55fSk6IGFueTtcbiAgbmV3IChzZWxlY3RvcjogVHlwZSB8IHN0cmluZywge3JlYWR9Pzoge3JlYWQ/OiBhbnl9KTogQ29udGVudENoaWxkTWV0YWRhdGFGYWN0b3J5O1xufVxuXG4vKipcbiAqIEZhY3RvcnkgZm9yIHtAbGluayBWaWV3Q2hpbGRyZW59LlxuICovXG5leHBvcnQgaW50ZXJmYWNlIFZpZXdDaGlsZHJlbk1ldGFkYXRhRmFjdG9yeSB7XG4gIChzZWxlY3RvcjogVHlwZSB8IHN0cmluZywge3JlYWR9Pzoge3JlYWQ/OiBhbnl9KTogYW55O1xuICBuZXcgKHNlbGVjdG9yOiBUeXBlIHwgc3RyaW5nLCB7cmVhZH0/OiB7cmVhZD86IGFueX0pOiBWaWV3Q2hpbGRyZW5NZXRhZGF0YTtcbn1cblxuLyoqXG4gKiBGYWN0b3J5IGZvciB7QGxpbmsgVmlld0NoaWxkfS5cbiAqL1xuZXhwb3J0IGludGVyZmFjZSBWaWV3Q2hpbGRNZXRhZGF0YUZhY3Rvcnkge1xuICAoc2VsZWN0b3I6IFR5cGUgfCBzdHJpbmcsIHtyZWFkfT86IHtyZWFkPzogYW55fSk6IGFueTtcbiAgbmV3IChzZWxlY3RvcjogVHlwZSB8IHN0cmluZywge3JlYWR9Pzoge3JlYWQ/OiBhbnl9KTogVmlld0NoaWxkTWV0YWRhdGFGYWN0b3J5O1xufVxuXG5cbi8qKlxuICoge0BsaW5rIFBpcGVNZXRhZGF0YX0gZmFjdG9yeSBmb3IgY3JlYXRpbmcgZGVjb3JhdG9ycy5cbiAqXG4gKiAjIyMgRXhhbXBsZVxuICpcbiAqIHtAZXhhbXBsZSBjb3JlL3RzL21ldGFkYXRhL21ldGFkYXRhLnRzIHJlZ2lvbj0ncGlwZSd9XG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgUGlwZU1ldGFkYXRhRmFjdG9yeSB7XG4gIChvYmo6IHtuYW1lOiBzdHJpbmcsIHB1cmU/OiBib29sZWFufSk6IGFueTtcbiAgbmV3IChvYmo6IHtuYW1lOiBzdHJpbmcsIHB1cmU/OiBib29sZWFufSk6IGFueTtcbn1cblxuLyoqXG4gKiB7QGxpbmsgSW5wdXRNZXRhZGF0YX0gZmFjdG9yeSBmb3IgY3JlYXRpbmcgZGVjb3JhdG9ycy5cbiAqXG4gKiBTZWUge0BsaW5rIElucHV0TWV0YWRhdGF9LlxuICovXG5leHBvcnQgaW50ZXJmYWNlIElucHV0TWV0YWRhdGFGYWN0b3J5IHtcbiAgKGJpbmRpbmdQcm9wZXJ0eU5hbWU/OiBzdHJpbmcpOiBhbnk7XG4gIG5ldyAoYmluZGluZ1Byb3BlcnR5TmFtZT86IHN0cmluZyk6IGFueTtcbn1cblxuLyoqXG4gKiB7QGxpbmsgT3V0cHV0TWV0YWRhdGF9IGZhY3RvcnkgZm9yIGNyZWF0aW5nIGRlY29yYXRvcnMuXG4gKlxuICogU2VlIHtAbGluayBPdXRwdXRNZXRhZGF0YX0uXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgT3V0cHV0TWV0YWRhdGFGYWN0b3J5IHtcbiAgKGJpbmRpbmdQcm9wZXJ0eU5hbWU/OiBzdHJpbmcpOiBhbnk7XG4gIG5ldyAoYmluZGluZ1Byb3BlcnR5TmFtZT86IHN0cmluZyk6IGFueTtcbn1cblxuLyoqXG4gKiB7QGxpbmsgSG9zdEJpbmRpbmdNZXRhZGF0YX0gZmFjdG9yeSBmdW5jdGlvbi5cbiAqL1xuZXhwb3J0IGludGVyZmFjZSBIb3N0QmluZGluZ01ldGFkYXRhRmFjdG9yeSB7XG4gIChob3N0UHJvcGVydHlOYW1lPzogc3RyaW5nKTogYW55O1xuICBuZXcgKGhvc3RQcm9wZXJ0eU5hbWU/OiBzdHJpbmcpOiBhbnk7XG59XG5cbi8qKlxuICoge0BsaW5rIEhvc3RMaXN0ZW5lck1ldGFkYXRhfSBmYWN0b3J5IGZ1bmN0aW9uLlxuICovXG5leHBvcnQgaW50ZXJmYWNlIEhvc3RMaXN0ZW5lck1ldGFkYXRhRmFjdG9yeSB7XG4gIChldmVudE5hbWU6IHN0cmluZywgYXJncz86IHN0cmluZ1tdKTogYW55O1xuICBuZXcgKGV2ZW50TmFtZTogc3RyaW5nLCBhcmdzPzogc3RyaW5nW10pOiBhbnk7XG59XG5cbi8vIFRPRE8oYWxleGVhZ2xlKTogcmVtb3ZlIHRoZSBkdXBsaWNhdGlvbiBvZiB0aGlzIGRvYy4gSXQgaXMgY29waWVkIGZyb20gQ29tcG9uZW50TWV0YWRhdGEuXG4vKipcbiAqIERlY2xhcmUgcmV1c2FibGUgVUkgYnVpbGRpbmcgYmxvY2tzIGZvciBhbiBhcHBsaWNhdGlvbi5cbiAqXG4gKiBFYWNoIEFuZ3VsYXIgY29tcG9uZW50IHJlcXVpcmVzIGEgc2luZ2xlIGBAQ29tcG9uZW50YCBhbm5vdGF0aW9uLiBUaGUgYEBDb21wb25lbnRgXG4gKiBhbm5vdGF0aW9uIHNwZWNpZmllcyB3aGVuIGEgY29tcG9uZW50IGlzIGluc3RhbnRpYXRlZCwgYW5kIHdoaWNoIHByb3BlcnRpZXMgYW5kIGhvc3RMaXN0ZW5lcnMgaXRcbiAqIGJpbmRzIHRvLlxuICpcbiAqIFdoZW4gYSBjb21wb25lbnQgaXMgaW5zdGFudGlhdGVkLCBBbmd1bGFyXG4gKiAtIGNyZWF0ZXMgYSBzaGFkb3cgRE9NIGZvciB0aGUgY29tcG9uZW50LlxuICogLSBsb2FkcyB0aGUgc2VsZWN0ZWQgdGVtcGxhdGUgaW50byB0aGUgc2hhZG93IERPTS5cbiAqIC0gY3JlYXRlcyBhbGwgdGhlIGluamVjdGFibGUgb2JqZWN0cyBjb25maWd1cmVkIHdpdGggYHByb3ZpZGVyc2AgYW5kIGB2aWV3UHJvdmlkZXJzYC5cbiAqXG4gKiBBbGwgdGVtcGxhdGUgZXhwcmVzc2lvbnMgYW5kIHN0YXRlbWVudHMgYXJlIHRoZW4gZXZhbHVhdGVkIGFnYWluc3QgdGhlIGNvbXBvbmVudCBpbnN0YW5jZS5cbiAqXG4gKiAjIyBMaWZlY3ljbGUgaG9va3NcbiAqXG4gKiBXaGVuIHRoZSBjb21wb25lbnQgY2xhc3MgaW1wbGVtZW50cyBzb21lIHtAbGluayAuLi8uLi9ndWlkZS9saWZlY3ljbGUtaG9va3MuaHRtbH0gdGhlIGNhbGxiYWNrc1xuICogYXJlIGNhbGxlZCBieSB0aGUgY2hhbmdlIGRldGVjdGlvbiBhdCBkZWZpbmVkIHBvaW50cyBpbiB0aW1lIGR1cmluZyB0aGUgbGlmZSBvZiB0aGUgY29tcG9uZW50LlxuICpcbiAqICMjIyBFeGFtcGxlXG4gKlxuICoge0BleGFtcGxlIGNvcmUvdHMvbWV0YWRhdGEvbWV0YWRhdGEudHMgcmVnaW9uPSdjb21wb25lbnQnfVxuICovXG5leHBvcnQgdmFyIENvbXBvbmVudDogQ29tcG9uZW50TWV0YWRhdGFGYWN0b3J5ID1cbiAgICA8Q29tcG9uZW50TWV0YWRhdGFGYWN0b3J5Pm1ha2VEZWNvcmF0b3IoQ29tcG9uZW50TWV0YWRhdGEsIChmbjogYW55KSA9PiBmbi5WaWV3ID0gVmlldyk7XG5cbi8vIFRPRE8oYWxleGVhZ2xlKTogcmVtb3ZlIHRoZSBkdXBsaWNhdGlvbiBvZiB0aGlzIGRvYy4gSXQgaXMgY29waWVkIGZyb20gRGlyZWN0aXZlTWV0YWRhdGEuXG4vKipcbiAqIERpcmVjdGl2ZXMgYWxsb3cgeW91IHRvIGF0dGFjaCBiZWhhdmlvciB0byBlbGVtZW50cyBpbiB0aGUgRE9NLlxuICpcbiAqIHtAbGluayBEaXJlY3RpdmVNZXRhZGF0YX1zIHdpdGggYW4gZW1iZWRkZWQgdmlldyBhcmUgY2FsbGVkIHtAbGluayBDb21wb25lbnRNZXRhZGF0YX1zLlxuICpcbiAqIEEgZGlyZWN0aXZlIGNvbnNpc3RzIG9mIGEgc2luZ2xlIGRpcmVjdGl2ZSBhbm5vdGF0aW9uIGFuZCBhIGNvbnRyb2xsZXIgY2xhc3MuIFdoZW4gdGhlXG4gKiBkaXJlY3RpdmUncyBgc2VsZWN0b3JgIG1hdGNoZXNcbiAqIGVsZW1lbnRzIGluIHRoZSBET00sIHRoZSBmb2xsb3dpbmcgc3RlcHMgb2NjdXI6XG4gKlxuICogMS4gRm9yIGVhY2ggZGlyZWN0aXZlLCB0aGUgYEVsZW1lbnRJbmplY3RvcmAgYXR0ZW1wdHMgdG8gcmVzb2x2ZSB0aGUgZGlyZWN0aXZlJ3MgY29uc3RydWN0b3JcbiAqIGFyZ3VtZW50cy5cbiAqIDIuIEFuZ3VsYXIgaW5zdGFudGlhdGVzIGRpcmVjdGl2ZXMgZm9yIGVhY2ggbWF0Y2hlZCBlbGVtZW50IHVzaW5nIGBFbGVtZW50SW5qZWN0b3JgIGluIGFcbiAqIGRlcHRoLWZpcnN0IG9yZGVyLFxuICogICAgYXMgZGVjbGFyZWQgaW4gdGhlIEhUTUwuXG4gKlxuICogIyMgVW5kZXJzdGFuZGluZyBIb3cgSW5qZWN0aW9uIFdvcmtzXG4gKlxuICogVGhlcmUgYXJlIHRocmVlIHN0YWdlcyBvZiBpbmplY3Rpb24gcmVzb2x1dGlvbi5cbiAqIC0gKlByZS1leGlzdGluZyBJbmplY3RvcnMqOlxuICogICAtIFRoZSB0ZXJtaW5hbCB7QGxpbmsgSW5qZWN0b3J9IGNhbm5vdCByZXNvbHZlIGRlcGVuZGVuY2llcy4gSXQgZWl0aGVyIHRocm93cyBhbiBlcnJvciBvciwgaWZcbiAqIHRoZSBkZXBlbmRlbmN5IHdhc1xuICogICAgIHNwZWNpZmllZCBhcyBgQE9wdGlvbmFsYCwgcmV0dXJucyBgbnVsbGAuXG4gKiAgIC0gVGhlIHBsYXRmb3JtIGluamVjdG9yIHJlc29sdmVzIGJyb3dzZXIgc2luZ2xldG9uIHJlc291cmNlcywgc3VjaCBhczogY29va2llcywgdGl0bGUsXG4gKiBsb2NhdGlvbiwgYW5kIG90aGVycy5cbiAqIC0gKkNvbXBvbmVudCBJbmplY3RvcnMqOiBFYWNoIGNvbXBvbmVudCBpbnN0YW5jZSBoYXMgaXRzIG93biB7QGxpbmsgSW5qZWN0b3J9LCBhbmQgdGhleSBmb2xsb3dcbiAqIHRoZSBzYW1lIHBhcmVudC1jaGlsZCBoaWVyYXJjaHlcbiAqICAgICBhcyB0aGUgY29tcG9uZW50IGluc3RhbmNlcyBpbiB0aGUgRE9NLlxuICogLSAqRWxlbWVudCBJbmplY3RvcnMqOiBFYWNoIGNvbXBvbmVudCBpbnN0YW5jZSBoYXMgYSBTaGFkb3cgRE9NLiBXaXRoaW4gdGhlIFNoYWRvdyBET00gZWFjaFxuICogZWxlbWVudCBoYXMgYW4gYEVsZW1lbnRJbmplY3RvcmBcbiAqICAgICB3aGljaCBmb2xsb3cgdGhlIHNhbWUgcGFyZW50LWNoaWxkIGhpZXJhcmNoeSBhcyB0aGUgRE9NIGVsZW1lbnRzIHRoZW1zZWx2ZXMuXG4gKlxuICogV2hlbiBhIHRlbXBsYXRlIGlzIGluc3RhbnRpYXRlZCwgaXQgYWxzbyBtdXN0IGluc3RhbnRpYXRlIHRoZSBjb3JyZXNwb25kaW5nIGRpcmVjdGl2ZXMgaW4gYVxuICogZGVwdGgtZmlyc3Qgb3JkZXIuIFRoZVxuICogY3VycmVudCBgRWxlbWVudEluamVjdG9yYCByZXNvbHZlcyB0aGUgY29uc3RydWN0b3IgZGVwZW5kZW5jaWVzIGZvciBlYWNoIGRpcmVjdGl2ZS5cbiAqXG4gKiBBbmd1bGFyIHRoZW4gcmVzb2x2ZXMgZGVwZW5kZW5jaWVzIGFzIGZvbGxvd3MsIGFjY29yZGluZyB0byB0aGUgb3JkZXIgaW4gd2hpY2ggdGhleSBhcHBlYXIgaW4gdGhlXG4gKiB7QGxpbmsgVmlld01ldGFkYXRhfTpcbiAqXG4gKiAxLiBEZXBlbmRlbmNpZXMgb24gdGhlIGN1cnJlbnQgZWxlbWVudFxuICogMi4gRGVwZW5kZW5jaWVzIG9uIGVsZW1lbnQgaW5qZWN0b3JzIGFuZCB0aGVpciBwYXJlbnRzIHVudGlsIGl0IGVuY291bnRlcnMgYSBTaGFkb3cgRE9NIGJvdW5kYXJ5XG4gKiAzLiBEZXBlbmRlbmNpZXMgb24gY29tcG9uZW50IGluamVjdG9ycyBhbmQgdGhlaXIgcGFyZW50cyB1bnRpbCBpdCBlbmNvdW50ZXJzIHRoZSByb290IGNvbXBvbmVudFxuICogNC4gRGVwZW5kZW5jaWVzIG9uIHByZS1leGlzdGluZyBpbmplY3RvcnNcbiAqXG4gKlxuICogVGhlIGBFbGVtZW50SW5qZWN0b3JgIGNhbiBpbmplY3Qgb3RoZXIgZGlyZWN0aXZlcywgZWxlbWVudC1zcGVjaWZpYyBzcGVjaWFsIG9iamVjdHMsIG9yIGl0IGNhblxuICogZGVsZWdhdGUgdG8gdGhlIHBhcmVudFxuICogaW5qZWN0b3IuXG4gKlxuICogVG8gaW5qZWN0IG90aGVyIGRpcmVjdGl2ZXMsIGRlY2xhcmUgdGhlIGNvbnN0cnVjdG9yIHBhcmFtZXRlciBhczpcbiAqIC0gYGRpcmVjdGl2ZTpEaXJlY3RpdmVUeXBlYDogYSBkaXJlY3RpdmUgb24gdGhlIGN1cnJlbnQgZWxlbWVudCBvbmx5XG4gKiAtIGBASG9zdCgpIGRpcmVjdGl2ZTpEaXJlY3RpdmVUeXBlYDogYW55IGRpcmVjdGl2ZSB0aGF0IG1hdGNoZXMgdGhlIHR5cGUgYmV0d2VlbiB0aGUgY3VycmVudFxuICogZWxlbWVudCBhbmQgdGhlXG4gKiAgICBTaGFkb3cgRE9NIHJvb3QuXG4gKiAtIGBAUXVlcnkoRGlyZWN0aXZlVHlwZSkgcXVlcnk6UXVlcnlMaXN0PERpcmVjdGl2ZVR5cGU+YDogQSBsaXZlIGNvbGxlY3Rpb24gb2YgZGlyZWN0IGNoaWxkXG4gKiBkaXJlY3RpdmVzLlxuICogLSBgQFF1ZXJ5RGVzY2VuZGFudHMoRGlyZWN0aXZlVHlwZSkgcXVlcnk6UXVlcnlMaXN0PERpcmVjdGl2ZVR5cGU+YDogQSBsaXZlIGNvbGxlY3Rpb24gb2YgYW55XG4gKiBjaGlsZCBkaXJlY3RpdmVzLlxuICpcbiAqIFRvIGluamVjdCBlbGVtZW50LXNwZWNpZmljIHNwZWNpYWwgb2JqZWN0cywgZGVjbGFyZSB0aGUgY29uc3RydWN0b3IgcGFyYW1ldGVyIGFzOlxuICogLSBgZWxlbWVudDogRWxlbWVudFJlZmAgdG8gb2J0YWluIGEgcmVmZXJlbmNlIHRvIGxvZ2ljYWwgZWxlbWVudCBpbiB0aGUgdmlldy5cbiAqIC0gYHZpZXdDb250YWluZXI6IFZpZXdDb250YWluZXJSZWZgIHRvIGNvbnRyb2wgY2hpbGQgdGVtcGxhdGUgaW5zdGFudGlhdGlvbiwgZm9yXG4gKiB7QGxpbmsgRGlyZWN0aXZlTWV0YWRhdGF9IGRpcmVjdGl2ZXMgb25seVxuICogLSBgYmluZGluZ1Byb3BhZ2F0aW9uOiBCaW5kaW5nUHJvcGFnYXRpb25gIHRvIGNvbnRyb2wgY2hhbmdlIGRldGVjdGlvbiBpbiBhIG1vcmUgZ3JhbnVsYXIgd2F5LlxuICpcbiAqICMjIyBFeGFtcGxlXG4gKlxuICogVGhlIGZvbGxvd2luZyBleGFtcGxlIGRlbW9uc3RyYXRlcyBob3cgZGVwZW5kZW5jeSBpbmplY3Rpb24gcmVzb2x2ZXMgY29uc3RydWN0b3IgYXJndW1lbnRzIGluXG4gKiBwcmFjdGljZS5cbiAqXG4gKlxuICogQXNzdW1lIHRoaXMgSFRNTCB0ZW1wbGF0ZTpcbiAqXG4gKiBgYGBcbiAqIDxkaXYgZGVwZW5kZW5jeT1cIjFcIj5cbiAqICAgPGRpdiBkZXBlbmRlbmN5PVwiMlwiPlxuICogICAgIDxkaXYgZGVwZW5kZW5jeT1cIjNcIiBteS1kaXJlY3RpdmU+XG4gKiAgICAgICA8ZGl2IGRlcGVuZGVuY3k9XCI0XCI+XG4gKiAgICAgICAgIDxkaXYgZGVwZW5kZW5jeT1cIjVcIj48L2Rpdj5cbiAqICAgICAgIDwvZGl2PlxuICogICAgICAgPGRpdiBkZXBlbmRlbmN5PVwiNlwiPjwvZGl2PlxuICogICAgIDwvZGl2PlxuICogICA8L2Rpdj5cbiAqIDwvZGl2PlxuICogYGBgXG4gKlxuICogV2l0aCB0aGUgZm9sbG93aW5nIGBkZXBlbmRlbmN5YCBkZWNvcmF0b3IgYW5kIGBTb21lU2VydmljZWAgaW5qZWN0YWJsZSBjbGFzcy5cbiAqXG4gKiBgYGBcbiAqIEBJbmplY3RhYmxlKClcbiAqIGNsYXNzIFNvbWVTZXJ2aWNlIHtcbiAqIH1cbiAqXG4gKiBARGlyZWN0aXZlKHtcbiAqICAgc2VsZWN0b3I6ICdbZGVwZW5kZW5jeV0nLFxuICogICBpbnB1dHM6IFtcbiAqICAgICAnaWQ6IGRlcGVuZGVuY3knXG4gKiAgIF1cbiAqIH0pXG4gKiBjbGFzcyBEZXBlbmRlbmN5IHtcbiAqICAgaWQ6c3RyaW5nO1xuICogfVxuICogYGBgXG4gKlxuICogTGV0J3Mgc3RlcCB0aHJvdWdoIHRoZSBkaWZmZXJlbnQgd2F5cyBpbiB3aGljaCBgTXlEaXJlY3RpdmVgIGNvdWxkIGJlIGRlY2xhcmVkLi4uXG4gKlxuICpcbiAqICMjIyBObyBpbmplY3Rpb25cbiAqXG4gKiBIZXJlIHRoZSBjb25zdHJ1Y3RvciBpcyBkZWNsYXJlZCB3aXRoIG5vIGFyZ3VtZW50cywgdGhlcmVmb3JlIG5vdGhpbmcgaXMgaW5qZWN0ZWQgaW50b1xuICogYE15RGlyZWN0aXZlYC5cbiAqXG4gKiBgYGBcbiAqIEBEaXJlY3RpdmUoeyBzZWxlY3RvcjogJ1tteS1kaXJlY3RpdmVdJyB9KVxuICogY2xhc3MgTXlEaXJlY3RpdmUge1xuICogICBjb25zdHJ1Y3RvcigpIHtcbiAqICAgfVxuICogfVxuICogYGBgXG4gKlxuICogVGhpcyBkaXJlY3RpdmUgd291bGQgYmUgaW5zdGFudGlhdGVkIHdpdGggbm8gZGVwZW5kZW5jaWVzLlxuICpcbiAqXG4gKiAjIyMgQ29tcG9uZW50LWxldmVsIGluamVjdGlvblxuICpcbiAqIERpcmVjdGl2ZXMgY2FuIGluamVjdCBhbnkgaW5qZWN0YWJsZSBpbnN0YW5jZSBmcm9tIHRoZSBjbG9zZXN0IGNvbXBvbmVudCBpbmplY3RvciBvciBhbnkgb2YgaXRzXG4gKiBwYXJlbnRzLlxuICpcbiAqIEhlcmUsIHRoZSBjb25zdHJ1Y3RvciBkZWNsYXJlcyBhIHBhcmFtZXRlciwgYHNvbWVTZXJ2aWNlYCwgYW5kIGluamVjdHMgdGhlIGBTb21lU2VydmljZWAgdHlwZVxuICogZnJvbSB0aGUgcGFyZW50XG4gKiBjb21wb25lbnQncyBpbmplY3Rvci5cbiAqIGBgYFxuICogQERpcmVjdGl2ZSh7IHNlbGVjdG9yOiAnW215LWRpcmVjdGl2ZV0nIH0pXG4gKiBjbGFzcyBNeURpcmVjdGl2ZSB7XG4gKiAgIGNvbnN0cnVjdG9yKHNvbWVTZXJ2aWNlOiBTb21lU2VydmljZSkge1xuICogICB9XG4gKiB9XG4gKiBgYGBcbiAqXG4gKiBUaGlzIGRpcmVjdGl2ZSB3b3VsZCBiZSBpbnN0YW50aWF0ZWQgd2l0aCBhIGRlcGVuZGVuY3kgb24gYFNvbWVTZXJ2aWNlYC5cbiAqXG4gKlxuICogIyMjIEluamVjdGluZyBhIGRpcmVjdGl2ZSBmcm9tIHRoZSBjdXJyZW50IGVsZW1lbnRcbiAqXG4gKiBEaXJlY3RpdmVzIGNhbiBpbmplY3Qgb3RoZXIgZGlyZWN0aXZlcyBkZWNsYXJlZCBvbiB0aGUgY3VycmVudCBlbGVtZW50LlxuICpcbiAqIGBgYFxuICogQERpcmVjdGl2ZSh7IHNlbGVjdG9yOiAnW215LWRpcmVjdGl2ZV0nIH0pXG4gKiBjbGFzcyBNeURpcmVjdGl2ZSB7XG4gKiAgIGNvbnN0cnVjdG9yKGRlcGVuZGVuY3k6IERlcGVuZGVuY3kpIHtcbiAqICAgICBleHBlY3QoZGVwZW5kZW5jeS5pZCkudG9FcXVhbCgzKTtcbiAqICAgfVxuICogfVxuICogYGBgXG4gKiBUaGlzIGRpcmVjdGl2ZSB3b3VsZCBiZSBpbnN0YW50aWF0ZWQgd2l0aCBgRGVwZW5kZW5jeWAgZGVjbGFyZWQgYXQgdGhlIHNhbWUgZWxlbWVudCwgaW4gdGhpcyBjYXNlXG4gKiBgZGVwZW5kZW5jeT1cIjNcImAuXG4gKlxuICogIyMjIEluamVjdGluZyBhIGRpcmVjdGl2ZSBmcm9tIGFueSBhbmNlc3RvciBlbGVtZW50c1xuICpcbiAqIERpcmVjdGl2ZXMgY2FuIGluamVjdCBvdGhlciBkaXJlY3RpdmVzIGRlY2xhcmVkIG9uIGFueSBhbmNlc3RvciBlbGVtZW50IChpbiB0aGUgY3VycmVudCBTaGFkb3dcbiAqIERPTSksIGkuZS4gb24gdGhlIGN1cnJlbnQgZWxlbWVudCwgdGhlXG4gKiBwYXJlbnQgZWxlbWVudCwgb3IgaXRzIHBhcmVudHMuXG4gKiBgYGBcbiAqIEBEaXJlY3RpdmUoeyBzZWxlY3RvcjogJ1tteS1kaXJlY3RpdmVdJyB9KVxuICogY2xhc3MgTXlEaXJlY3RpdmUge1xuICogICBjb25zdHJ1Y3RvcihASG9zdCgpIGRlcGVuZGVuY3k6IERlcGVuZGVuY3kpIHtcbiAqICAgICBleHBlY3QoZGVwZW5kZW5jeS5pZCkudG9FcXVhbCgyKTtcbiAqICAgfVxuICogfVxuICogYGBgXG4gKlxuICogYEBIb3N0YCBjaGVja3MgdGhlIGN1cnJlbnQgZWxlbWVudCwgdGhlIHBhcmVudCwgYXMgd2VsbCBhcyBpdHMgcGFyZW50cyByZWN1cnNpdmVseS4gSWZcbiAqIGBkZXBlbmRlbmN5PVwiMlwiYCBkaWRuJ3RcbiAqIGV4aXN0IG9uIHRoZSBkaXJlY3QgcGFyZW50LCB0aGlzIGluamVjdGlvbiB3b3VsZFxuICogaGF2ZSByZXR1cm5lZFxuICogYGRlcGVuZGVuY3k9XCIxXCJgLlxuICpcbiAqXG4gKiAjIyMgSW5qZWN0aW5nIGEgbGl2ZSBjb2xsZWN0aW9uIG9mIGRpcmVjdCBjaGlsZCBkaXJlY3RpdmVzXG4gKlxuICpcbiAqIEEgZGlyZWN0aXZlIGNhbiBhbHNvIHF1ZXJ5IGZvciBvdGhlciBjaGlsZCBkaXJlY3RpdmVzLiBTaW5jZSBwYXJlbnQgZGlyZWN0aXZlcyBhcmUgaW5zdGFudGlhdGVkXG4gKiBiZWZvcmUgY2hpbGQgZGlyZWN0aXZlcywgYSBkaXJlY3RpdmUgY2FuJ3Qgc2ltcGx5IGluamVjdCB0aGUgbGlzdCBvZiBjaGlsZCBkaXJlY3RpdmVzLiBJbnN0ZWFkLFxuICogdGhlIGRpcmVjdGl2ZSBpbmplY3RzIGEge0BsaW5rIFF1ZXJ5TGlzdH0sIHdoaWNoIHVwZGF0ZXMgaXRzIGNvbnRlbnRzIGFzIGNoaWxkcmVuIGFyZSBhZGRlZCxcbiAqIHJlbW92ZWQsIG9yIG1vdmVkIGJ5IGEgZGlyZWN0aXZlIHRoYXQgdXNlcyBhIHtAbGluayBWaWV3Q29udGFpbmVyUmVmfSBzdWNoIGFzIGEgYG5nRm9yYCwgYW5cbiAqIGBuZ0lmYCwgb3IgYW4gYG5nU3dpdGNoYC5cbiAqXG4gKiBgYGBcbiAqIEBEaXJlY3RpdmUoeyBzZWxlY3RvcjogJ1tteS1kaXJlY3RpdmVdJyB9KVxuICogY2xhc3MgTXlEaXJlY3RpdmUge1xuICogICBjb25zdHJ1Y3RvcihAUXVlcnkoRGVwZW5kZW5jeSkgZGVwZW5kZW5jaWVzOlF1ZXJ5TGlzdDxEZXBlbmRlbmN5Pikge1xuICogICB9XG4gKiB9XG4gKiBgYGBcbiAqXG4gKiBUaGlzIGRpcmVjdGl2ZSB3b3VsZCBiZSBpbnN0YW50aWF0ZWQgd2l0aCBhIHtAbGluayBRdWVyeUxpc3R9IHdoaWNoIGNvbnRhaW5zIGBEZXBlbmRlbmN5YCA0IGFuZFxuICogNi4gSGVyZSwgYERlcGVuZGVuY3lgIDUgd291bGQgbm90IGJlIGluY2x1ZGVkLCBiZWNhdXNlIGl0IGlzIG5vdCBhIGRpcmVjdCBjaGlsZC5cbiAqXG4gKiAjIyMgSW5qZWN0aW5nIGEgbGl2ZSBjb2xsZWN0aW9uIG9mIGRlc2NlbmRhbnQgZGlyZWN0aXZlc1xuICpcbiAqIEJ5IHBhc3NpbmcgdGhlIGRlc2NlbmRhbnQgZmxhZyB0byBgQFF1ZXJ5YCBhYm92ZSwgd2UgY2FuIGluY2x1ZGUgdGhlIGNoaWxkcmVuIG9mIHRoZSBjaGlsZFxuICogZWxlbWVudHMuXG4gKlxuICogYGBgXG4gKiBARGlyZWN0aXZlKHsgc2VsZWN0b3I6ICdbbXktZGlyZWN0aXZlXScgfSlcbiAqIGNsYXNzIE15RGlyZWN0aXZlIHtcbiAqICAgY29uc3RydWN0b3IoQFF1ZXJ5KERlcGVuZGVuY3ksIHtkZXNjZW5kYW50czogdHJ1ZX0pIGRlcGVuZGVuY2llczpRdWVyeUxpc3Q8RGVwZW5kZW5jeT4pIHtcbiAqICAgfVxuICogfVxuICogYGBgXG4gKlxuICogVGhpcyBkaXJlY3RpdmUgd291bGQgYmUgaW5zdGFudGlhdGVkIHdpdGggYSBRdWVyeSB3aGljaCB3b3VsZCBjb250YWluIGBEZXBlbmRlbmN5YCA0LCA1IGFuZCA2LlxuICpcbiAqICMjIyBPcHRpb25hbCBpbmplY3Rpb25cbiAqXG4gKiBUaGUgbm9ybWFsIGJlaGF2aW9yIG9mIGRpcmVjdGl2ZXMgaXMgdG8gcmV0dXJuIGFuIGVycm9yIHdoZW4gYSBzcGVjaWZpZWQgZGVwZW5kZW5jeSBjYW5ub3QgYmVcbiAqIHJlc29sdmVkLiBJZiB5b3VcbiAqIHdvdWxkIGxpa2UgdG8gaW5qZWN0IGBudWxsYCBvbiB1bnJlc29sdmVkIGRlcGVuZGVuY3kgaW5zdGVhZCwgeW91IGNhbiBhbm5vdGF0ZSB0aGF0IGRlcGVuZGVuY3lcbiAqIHdpdGggYEBPcHRpb25hbCgpYC5cbiAqIFRoaXMgZXhwbGljaXRseSBwZXJtaXRzIHRoZSBhdXRob3Igb2YgYSB0ZW1wbGF0ZSB0byB0cmVhdCBzb21lIG9mIHRoZSBzdXJyb3VuZGluZyBkaXJlY3RpdmVzIGFzXG4gKiBvcHRpb25hbC5cbiAqXG4gKiBgYGBcbiAqIEBEaXJlY3RpdmUoeyBzZWxlY3RvcjogJ1tteS1kaXJlY3RpdmVdJyB9KVxuICogY2xhc3MgTXlEaXJlY3RpdmUge1xuICogICBjb25zdHJ1Y3RvcihAT3B0aW9uYWwoKSBkZXBlbmRlbmN5OkRlcGVuZGVuY3kpIHtcbiAqICAgfVxuICogfVxuICogYGBgXG4gKlxuICogVGhpcyBkaXJlY3RpdmUgd291bGQgYmUgaW5zdGFudGlhdGVkIHdpdGggYSBgRGVwZW5kZW5jeWAgZGlyZWN0aXZlIGZvdW5kIG9uIHRoZSBjdXJyZW50IGVsZW1lbnQuXG4gKiBJZiBub25lIGNhbiBiZVxuICogZm91bmQsIHRoZSBpbmplY3RvciBzdXBwbGllcyBgbnVsbGAgaW5zdGVhZCBvZiB0aHJvd2luZyBhbiBlcnJvci5cbiAqXG4gKiAjIyMgRXhhbXBsZVxuICpcbiAqIEhlcmUgd2UgdXNlIGEgZGVjb3JhdG9yIGRpcmVjdGl2ZSB0byBzaW1wbHkgZGVmaW5lIGJhc2ljIHRvb2wtdGlwIGJlaGF2aW9yLlxuICpcbiAqIGBgYFxuICogQERpcmVjdGl2ZSh7XG4gKiAgIHNlbGVjdG9yOiAnW3Rvb2x0aXBdJyxcbiAqICAgaW5wdXRzOiBbXG4gKiAgICAgJ3RleHQ6IHRvb2x0aXAnXG4gKiAgIF0sXG4gKiAgIGhvc3Q6IHtcbiAqICAgICAnKG1vdXNlZW50ZXIpJzogJ29uTW91c2VFbnRlcigpJyxcbiAqICAgICAnKG1vdXNlbGVhdmUpJzogJ29uTW91c2VMZWF2ZSgpJ1xuICogICB9XG4gKiB9KVxuICogY2xhc3MgVG9vbHRpcHtcbiAqICAgdGV4dDpzdHJpbmc7XG4gKiAgIG92ZXJsYXk6T3ZlcmxheTsgLy8gTk9UIFlFVCBJTVBMRU1FTlRFRFxuICogICBvdmVybGF5TWFuYWdlcjpPdmVybGF5TWFuYWdlcjsgLy8gTk9UIFlFVCBJTVBMRU1FTlRFRFxuICpcbiAqICAgY29uc3RydWN0b3Iob3ZlcmxheU1hbmFnZXI6T3ZlcmxheU1hbmFnZXIpIHtcbiAqICAgICB0aGlzLm92ZXJsYXkgPSBvdmVybGF5O1xuICogICB9XG4gKlxuICogICBvbk1vdXNlRW50ZXIoKSB7XG4gKiAgICAgLy8gZXhhY3Qgc2lnbmF0dXJlIHRvIGJlIGRldGVybWluZWRcbiAqICAgICB0aGlzLm92ZXJsYXkgPSB0aGlzLm92ZXJsYXlNYW5hZ2VyLm9wZW4odGV4dCwgLi4uKTtcbiAqICAgfVxuICpcbiAqICAgb25Nb3VzZUxlYXZlKCkge1xuICogICAgIHRoaXMub3ZlcmxheS5jbG9zZSgpO1xuICogICAgIHRoaXMub3ZlcmxheSA9IG51bGw7XG4gKiAgIH1cbiAqIH1cbiAqIGBgYFxuICogSW4gb3VyIEhUTUwgdGVtcGxhdGUsIHdlIGNhbiB0aGVuIGFkZCB0aGlzIGJlaGF2aW9yIHRvIGEgYDxkaXY+YCBvciBhbnkgb3RoZXIgZWxlbWVudCB3aXRoIHRoZVxuICogYHRvb2x0aXBgIHNlbGVjdG9yLFxuICogbGlrZSBzbzpcbiAqXG4gKiBgYGBcbiAqIDxkaXYgdG9vbHRpcD1cInNvbWUgdGV4dCBoZXJlXCI+PC9kaXY+XG4gKiBgYGBcbiAqXG4gKiBEaXJlY3RpdmVzIGNhbiBhbHNvIGNvbnRyb2wgdGhlIGluc3RhbnRpYXRpb24sIGRlc3RydWN0aW9uLCBhbmQgcG9zaXRpb25pbmcgb2YgaW5saW5lIHRlbXBsYXRlXG4gKiBlbGVtZW50czpcbiAqXG4gKiBBIGRpcmVjdGl2ZSB1c2VzIGEge0BsaW5rIFZpZXdDb250YWluZXJSZWZ9IHRvIGluc3RhbnRpYXRlLCBpbnNlcnQsIG1vdmUsIGFuZCBkZXN0cm95IHZpZXdzIGF0XG4gKiBydW50aW1lLlxuICogVGhlIHtAbGluayBWaWV3Q29udGFpbmVyUmVmfSBpcyBjcmVhdGVkIGFzIGEgcmVzdWx0IG9mIGA8dGVtcGxhdGU+YCBlbGVtZW50LCBhbmQgcmVwcmVzZW50cyBhXG4gKiBsb2NhdGlvbiBpbiB0aGUgY3VycmVudCB2aWV3XG4gKiB3aGVyZSB0aGVzZSBhY3Rpb25zIGFyZSBwZXJmb3JtZWQuXG4gKlxuICogVmlld3MgYXJlIGFsd2F5cyBjcmVhdGVkIGFzIGNoaWxkcmVuIG9mIHRoZSBjdXJyZW50IHtAbGluayBWaWV3TWV0YWRhdGF9LCBhbmQgYXMgc2libGluZ3Mgb2YgdGhlXG4gKiBgPHRlbXBsYXRlPmAgZWxlbWVudC4gVGh1cyBhXG4gKiBkaXJlY3RpdmUgaW4gYSBjaGlsZCB2aWV3IGNhbm5vdCBpbmplY3QgdGhlIGRpcmVjdGl2ZSB0aGF0IGNyZWF0ZWQgaXQuXG4gKlxuICogU2luY2UgZGlyZWN0aXZlcyB0aGF0IGNyZWF0ZSB2aWV3cyB2aWEgVmlld0NvbnRhaW5lcnMgYXJlIGNvbW1vbiBpbiBBbmd1bGFyLCBhbmQgdXNpbmcgdGhlIGZ1bGxcbiAqIGA8dGVtcGxhdGU+YCBlbGVtZW50IHN5bnRheCBpcyB3b3JkeSwgQW5ndWxhclxuICogYWxzbyBzdXBwb3J0cyBhIHNob3J0aGFuZCBub3RhdGlvbjogYDxsaSAqZm9vPVwiYmFyXCI+YCBhbmQgYDxsaSB0ZW1wbGF0ZT1cImZvbzogYmFyXCI+YCBhcmVcbiAqIGVxdWl2YWxlbnQuXG4gKlxuICogVGh1cyxcbiAqXG4gKiBgYGBcbiAqIDx1bD5cbiAqICAgPGxpICpmb289XCJiYXJcIiB0aXRsZT1cInRleHRcIj48L2xpPlxuICogPC91bD5cbiAqIGBgYFxuICpcbiAqIEV4cGFuZHMgaW4gdXNlIHRvOlxuICpcbiAqIGBgYFxuICogPHVsPlxuICogICA8dGVtcGxhdGUgW2Zvb109XCJiYXJcIj5cbiAqICAgICA8bGkgdGl0bGU9XCJ0ZXh0XCI+PC9saT5cbiAqICAgPC90ZW1wbGF0ZT5cbiAqIDwvdWw+XG4gKiBgYGBcbiAqXG4gKiBOb3RpY2UgdGhhdCBhbHRob3VnaCB0aGUgc2hvcnRoYW5kIHBsYWNlcyBgKmZvbz1cImJhclwiYCB3aXRoaW4gdGhlIGA8bGk+YCBlbGVtZW50LCB0aGUgYmluZGluZyBmb3JcbiAqIHRoZSBkaXJlY3RpdmVcbiAqIGNvbnRyb2xsZXIgaXMgY29ycmVjdGx5IGluc3RhbnRpYXRlZCBvbiB0aGUgYDx0ZW1wbGF0ZT5gIGVsZW1lbnQgcmF0aGVyIHRoYW4gdGhlIGA8bGk+YCBlbGVtZW50LlxuICpcbiAqICMjIExpZmVjeWNsZSBob29rc1xuICpcbiAqIFdoZW4gdGhlIGRpcmVjdGl2ZSBjbGFzcyBpbXBsZW1lbnRzIHNvbWUge0BsaW5rIC4uLy4uL2d1aWRlL2xpZmVjeWNsZS1ob29rcy5odG1sfSB0aGUgY2FsbGJhY2tzXG4gKiBhcmUgY2FsbGVkIGJ5IHRoZSBjaGFuZ2UgZGV0ZWN0aW9uIGF0IGRlZmluZWQgcG9pbnRzIGluIHRpbWUgZHVyaW5nIHRoZSBsaWZlIG9mIHRoZSBkaXJlY3RpdmUuXG4gKlxuICogIyMjIEV4YW1wbGVcbiAqXG4gKiBMZXQncyBzdXBwb3NlIHdlIHdhbnQgdG8gaW1wbGVtZW50IHRoZSBgdW5sZXNzYCBiZWhhdmlvciwgdG8gY29uZGl0aW9uYWxseSBpbmNsdWRlIGEgdGVtcGxhdGUuXG4gKlxuICogSGVyZSBpcyBhIHNpbXBsZSBkaXJlY3RpdmUgdGhhdCB0cmlnZ2VycyBvbiBhbiBgdW5sZXNzYCBzZWxlY3RvcjpcbiAqXG4gKiBgYGBcbiAqIEBEaXJlY3RpdmUoe1xuICogICBzZWxlY3RvcjogJ1t1bmxlc3NdJyxcbiAqICAgaW5wdXRzOiBbJ3VubGVzcyddXG4gKiB9KVxuICogZXhwb3J0IGNsYXNzIFVubGVzcyB7XG4gKiAgIHZpZXdDb250YWluZXI6IFZpZXdDb250YWluZXJSZWY7XG4gKiAgIHRlbXBsYXRlUmVmOiBUZW1wbGF0ZVJlZjtcbiAqICAgcHJldkNvbmRpdGlvbjogYm9vbGVhbjtcbiAqXG4gKiAgIGNvbnN0cnVjdG9yKHZpZXdDb250YWluZXI6IFZpZXdDb250YWluZXJSZWYsIHRlbXBsYXRlUmVmOiBUZW1wbGF0ZVJlZikge1xuICogICAgIHRoaXMudmlld0NvbnRhaW5lciA9IHZpZXdDb250YWluZXI7XG4gKiAgICAgdGhpcy50ZW1wbGF0ZVJlZiA9IHRlbXBsYXRlUmVmO1xuICogICAgIHRoaXMucHJldkNvbmRpdGlvbiA9IG51bGw7XG4gKiAgIH1cbiAqXG4gKiAgIHNldCB1bmxlc3MobmV3Q29uZGl0aW9uKSB7XG4gKiAgICAgaWYgKG5ld0NvbmRpdGlvbiAmJiAoaXNCbGFuayh0aGlzLnByZXZDb25kaXRpb24pIHx8ICF0aGlzLnByZXZDb25kaXRpb24pKSB7XG4gKiAgICAgICB0aGlzLnByZXZDb25kaXRpb24gPSB0cnVlO1xuICogICAgICAgdGhpcy52aWV3Q29udGFpbmVyLmNsZWFyKCk7XG4gKiAgICAgfSBlbHNlIGlmICghbmV3Q29uZGl0aW9uICYmIChpc0JsYW5rKHRoaXMucHJldkNvbmRpdGlvbikgfHwgdGhpcy5wcmV2Q29uZGl0aW9uKSkge1xuICogICAgICAgdGhpcy5wcmV2Q29uZGl0aW9uID0gZmFsc2U7XG4gKiAgICAgICB0aGlzLnZpZXdDb250YWluZXIuY3JlYXRlKHRoaXMudGVtcGxhdGVSZWYpO1xuICogICAgIH1cbiAqICAgfVxuICogfVxuICogYGBgXG4gKlxuICogV2UgY2FuIHRoZW4gdXNlIHRoaXMgYHVubGVzc2Agc2VsZWN0b3IgaW4gYSB0ZW1wbGF0ZTpcbiAqIGBgYFxuICogPHVsPlxuICogICA8bGkgKnVubGVzcz1cImV4cHJcIj48L2xpPlxuICogPC91bD5cbiAqIGBgYFxuICpcbiAqIE9uY2UgdGhlIGRpcmVjdGl2ZSBpbnN0YW50aWF0ZXMgdGhlIGNoaWxkIHZpZXcsIHRoZSBzaG9ydGhhbmQgbm90YXRpb24gZm9yIHRoZSB0ZW1wbGF0ZSBleHBhbmRzXG4gKiBhbmQgdGhlIHJlc3VsdCBpczpcbiAqXG4gKiBgYGBcbiAqIDx1bD5cbiAqICAgPHRlbXBsYXRlIFt1bmxlc3NdPVwiZXhwXCI+XG4gKiAgICAgPGxpPjwvbGk+XG4gKiAgIDwvdGVtcGxhdGU+XG4gKiAgIDxsaT48L2xpPlxuICogPC91bD5cbiAqIGBgYFxuICpcbiAqIE5vdGUgYWxzbyB0aGF0IGFsdGhvdWdoIHRoZSBgPGxpPjwvbGk+YCB0ZW1wbGF0ZSBzdGlsbCBleGlzdHMgaW5zaWRlIHRoZSBgPHRlbXBsYXRlPjwvdGVtcGxhdGU+YCxcbiAqIHRoZSBpbnN0YW50aWF0ZWRcbiAqIHZpZXcgb2NjdXJzIG9uIHRoZSBzZWNvbmQgYDxsaT48L2xpPmAgd2hpY2ggaXMgYSBzaWJsaW5nIHRvIHRoZSBgPHRlbXBsYXRlPmAgZWxlbWVudC5cbiAqL1xuZXhwb3J0IHZhciBEaXJlY3RpdmU6IERpcmVjdGl2ZU1ldGFkYXRhRmFjdG9yeSA9XG4gICAgPERpcmVjdGl2ZU1ldGFkYXRhRmFjdG9yeT5tYWtlRGVjb3JhdG9yKERpcmVjdGl2ZU1ldGFkYXRhKTtcblxuLy8gVE9ETyhhbGV4ZWFnbGUpOiByZW1vdmUgdGhlIGR1cGxpY2F0aW9uIG9mIHRoaXMgZG9jLiBJdCBpcyBjb3BpZWQgZnJvbSBWaWV3TWV0YWRhdGEuXG4vKipcbiAqIE1ldGFkYXRhIHByb3BlcnRpZXMgYXZhaWxhYmxlIGZvciBjb25maWd1cmluZyBWaWV3cy5cbiAqXG4gKiBFYWNoIEFuZ3VsYXIgY29tcG9uZW50IHJlcXVpcmVzIGEgc2luZ2xlIGBAQ29tcG9uZW50YCBhbmQgYXQgbGVhc3Qgb25lIGBAVmlld2AgYW5ub3RhdGlvbi4gVGhlXG4gKiBgQFZpZXdgIGFubm90YXRpb24gc3BlY2lmaWVzIHRoZSBIVE1MIHRlbXBsYXRlIHRvIHVzZSwgYW5kIGxpc3RzIHRoZSBkaXJlY3RpdmVzIHRoYXQgYXJlIGFjdGl2ZVxuICogd2l0aGluIHRoZSB0ZW1wbGF0ZS5cbiAqXG4gKiBXaGVuIGEgY29tcG9uZW50IGlzIGluc3RhbnRpYXRlZCwgdGhlIHRlbXBsYXRlIGlzIGxvYWRlZCBpbnRvIHRoZSBjb21wb25lbnQncyBzaGFkb3cgcm9vdCwgYW5kXG4gKiB0aGUgZXhwcmVzc2lvbnMgYW5kIHN0YXRlbWVudHMgaW4gdGhlIHRlbXBsYXRlIGFyZSBldmFsdWF0ZWQgYWdhaW5zdCB0aGUgY29tcG9uZW50LlxuICpcbiAqIEZvciBkZXRhaWxzIG9uIHRoZSBgQENvbXBvbmVudGAgYW5ub3RhdGlvbiwgc2VlIHtAbGluayBDb21wb25lbnRNZXRhZGF0YX0uXG4gKlxuICogIyMjIEV4YW1wbGVcbiAqXG4gKiBgYGBcbiAqIEBDb21wb25lbnQoe1xuICogICBzZWxlY3RvcjogJ2dyZWV0JyxcbiAqICAgdGVtcGxhdGU6ICdIZWxsbyB7e25hbWV9fSEnLFxuICogICBkaXJlY3RpdmVzOiBbR3JlZXRVc2VyLCBCb2xkXVxuICogfSlcbiAqIGNsYXNzIEdyZWV0IHtcbiAqICAgbmFtZTogc3RyaW5nO1xuICpcbiAqICAgY29uc3RydWN0b3IoKSB7XG4gKiAgICAgdGhpcy5uYW1lID0gJ1dvcmxkJztcbiAqICAgfVxuICogfVxuICogYGBgXG4gKi9cbnZhciBWaWV3OiBWaWV3TWV0YWRhdGFGYWN0b3J5ID1cbiAgICA8Vmlld01ldGFkYXRhRmFjdG9yeT5tYWtlRGVjb3JhdG9yKFZpZXdNZXRhZGF0YSwgKGZuOiBhbnkpID0+IGZuLlZpZXcgPSBWaWV3KTtcblxuLyoqXG4gKiBTcGVjaWZpZXMgdGhhdCBhIGNvbnN0YW50IGF0dHJpYnV0ZSB2YWx1ZSBzaG91bGQgYmUgaW5qZWN0ZWQuXG4gKlxuICogVGhlIGRpcmVjdGl2ZSBjYW4gaW5qZWN0IGNvbnN0YW50IHN0cmluZyBsaXRlcmFscyBvZiBob3N0IGVsZW1lbnQgYXR0cmlidXRlcy5cbiAqXG4gKiAjIyMgRXhhbXBsZVxuICpcbiAqIFN1cHBvc2Ugd2UgaGF2ZSBhbiBgPGlucHV0PmAgZWxlbWVudCBhbmQgd2FudCB0byBrbm93IGl0cyBgdHlwZWAuXG4gKlxuICogYGBgaHRtbFxuICogPGlucHV0IHR5cGU9XCJ0ZXh0XCI+XG4gKiBgYGBcbiAqXG4gKiBBIGRlY29yYXRvciBjYW4gaW5qZWN0IHN0cmluZyBsaXRlcmFsIGB0ZXh0YCBsaWtlIHNvOlxuICpcbiAqIHtAZXhhbXBsZSBjb3JlL3RzL21ldGFkYXRhL21ldGFkYXRhLnRzIHJlZ2lvbj0nYXR0cmlidXRlTWV0YWRhdGEnfVxuICovXG5leHBvcnQgdmFyIEF0dHJpYnV0ZTogQXR0cmlidXRlTWV0YWRhdGFGYWN0b3J5ID0gbWFrZVBhcmFtRGVjb3JhdG9yKEF0dHJpYnV0ZU1ldGFkYXRhKTtcblxuLy8gVE9ETyhhbGV4ZWFnbGUpOiByZW1vdmUgdGhlIGR1cGxpY2F0aW9uIG9mIHRoaXMgZG9jLiBJdCBpcyBjb3BpZWQgZnJvbSBRdWVyeU1ldGFkYXRhLlxuLyoqXG4gKiBEZWNsYXJlcyBhbiBpbmplY3RhYmxlIHBhcmFtZXRlciB0byBiZSBhIGxpdmUgbGlzdCBvZiBkaXJlY3RpdmVzIG9yIHZhcmlhYmxlXG4gKiBiaW5kaW5ncyBmcm9tIHRoZSBjb250ZW50IGNoaWxkcmVuIG9mIGEgZGlyZWN0aXZlLlxuICpcbiAqICMjIyBFeGFtcGxlIChbbGl2ZSBkZW1vXShodHRwOi8vcGxua3IuY28vZWRpdC9sWTltOEhMeTd6MDZ2RG9VYVNOMj9wPXByZXZpZXcpKVxuICpcbiAqIEFzc3VtZSB0aGF0IGA8dGFicz5gIGNvbXBvbmVudCB3b3VsZCBsaWtlIHRvIGdldCBhIGxpc3QgaXRzIGNoaWxkcmVuIGA8cGFuZT5gXG4gKiBjb21wb25lbnRzIGFzIHNob3duIGluIHRoaXMgZXhhbXBsZTpcbiAqXG4gKiBgYGBodG1sXG4gKiA8dGFicz5cbiAqICAgPHBhbmUgdGl0bGU9XCJPdmVydmlld1wiPi4uLjwvcGFuZT5cbiAqICAgPHBhbmUgKm5nRm9yPVwibGV0IG8gb2Ygb2JqZWN0c1wiIFt0aXRsZV09XCJvLnRpdGxlXCI+e3tvLnRleHR9fTwvcGFuZT5cbiAqIDwvdGFicz5cbiAqIGBgYFxuICpcbiAqIFRoZSBwcmVmZXJyZWQgc29sdXRpb24gaXMgdG8gcXVlcnkgZm9yIGBQYW5lYCBkaXJlY3RpdmVzIHVzaW5nIHRoaXMgZGVjb3JhdG9yLlxuICpcbiAqIGBgYGphdmFzY3JpcHRcbiAqIEBDb21wb25lbnQoe1xuICogICBzZWxlY3RvcjogJ3BhbmUnLFxuICogICBpbnB1dHM6IFsndGl0bGUnXVxuICogfSlcbiAqIGNsYXNzIFBhbmUge1xuICogICB0aXRsZTpzdHJpbmc7XG4gKiB9XG4gKlxuICogQENvbXBvbmVudCh7XG4gKiAgc2VsZWN0b3I6ICd0YWJzJyxcbiAqICB0ZW1wbGF0ZTogYFxuICogICAgPHVsPlxuICogICAgICA8bGkgKm5nRm9yPVwibGV0IHBhbmUgb2YgcGFuZXNcIj57e3BhbmUudGl0bGV9fTwvbGk+XG4gKiAgICA8L3VsPlxuICogICAgPG5nLWNvbnRlbnQ+PC9uZy1jb250ZW50PlxuICogIGBcbiAqIH0pXG4gKiBjbGFzcyBUYWJzIHtcbiAqICAgcGFuZXM6IFF1ZXJ5TGlzdDxQYW5lPjtcbiAqICAgY29uc3RydWN0b3IoQFF1ZXJ5KFBhbmUpIHBhbmVzOlF1ZXJ5TGlzdDxQYW5lPikge1xuICogICAgIHRoaXMucGFuZXMgPSBwYW5lcztcbiAqICAgfVxuICogfVxuICogYGBgXG4gKlxuICogQSBxdWVyeSBjYW4gbG9vayBmb3IgdmFyaWFibGUgYmluZGluZ3MgYnkgcGFzc2luZyBpbiBhIHN0cmluZyB3aXRoIGRlc2lyZWQgYmluZGluZyBzeW1ib2wuXG4gKlxuICogIyMjIEV4YW1wbGUgKFtsaXZlIGRlbW9dKGh0dHA6Ly9wbG5rci5jby9lZGl0L3NUMmoyNWNIMWRVUkF5QlJDS3gxP3A9cHJldmlldykpXG4gKiBgYGBodG1sXG4gKiA8c2Vla2VyPlxuICogICA8ZGl2ICNmaW5kbWU+Li4uPC9kaXY+XG4gKiA8L3NlZWtlcj5cbiAqXG4gKiBAQ29tcG9uZW50KHsgc2VsZWN0b3I6ICdzZWVrZXInIH0pXG4gKiBjbGFzcyBzZWVrZXIge1xuICogICBjb25zdHJ1Y3RvcihAUXVlcnkoJ2ZpbmRtZScpIGVsTGlzdDogUXVlcnlMaXN0PEVsZW1lbnRSZWY+KSB7Li4ufVxuICogfVxuICogYGBgXG4gKlxuICogSW4gdGhpcyBjYXNlIHRoZSBvYmplY3QgdGhhdCBpcyBpbmplY3RlZCBkZXBlbmQgb24gdGhlIHR5cGUgb2YgdGhlIHZhcmlhYmxlXG4gKiBiaW5kaW5nLiBJdCBjYW4gYmUgYW4gRWxlbWVudFJlZiwgYSBkaXJlY3RpdmUgb3IgYSBjb21wb25lbnQuXG4gKlxuICogUGFzc2luZyBpbiBhIGNvbW1hIHNlcGFyYXRlZCBsaXN0IG9mIHZhcmlhYmxlIGJpbmRpbmdzIHdpbGwgcXVlcnkgZm9yIGFsbCBvZiB0aGVtLlxuICpcbiAqIGBgYGh0bWxcbiAqIDxzZWVrZXI+XG4gKiAgIDxkaXYgI2ZpbmRNZT4uLi48L2Rpdj5cbiAqICAgPGRpdiAjZmluZE1lVG9vPi4uLjwvZGl2PlxuICogPC9zZWVrZXI+XG4gKlxuICogIEBDb21wb25lbnQoe1xuICogICBzZWxlY3RvcjogJ3NlZWtlcidcbiAqIH0pXG4gKiBjbGFzcyBTZWVrZXIge1xuICogICBjb25zdHJ1Y3RvcihAUXVlcnkoJ2ZpbmRNZSwgZmluZE1lVG9vJykgZWxMaXN0OiBRdWVyeUxpc3Q8RWxlbWVudFJlZj4pIHsuLi59XG4gKiB9XG4gKiBgYGBcbiAqXG4gKiBDb25maWd1cmUgd2hldGhlciBxdWVyeSBsb29rcyBmb3IgZGlyZWN0IGNoaWxkcmVuIG9yIGFsbCBkZXNjZW5kYW50c1xuICogb2YgdGhlIHF1ZXJ5aW5nIGVsZW1lbnQsIGJ5IHVzaW5nIHRoZSBgZGVzY2VuZGFudHNgIHBhcmFtZXRlci5cbiAqIEl0IGlzIHNldCB0byBgZmFsc2VgIGJ5IGRlZmF1bHQuXG4gKlxuICogIyMjIEV4YW1wbGUgKFtsaXZlIGRlbW9dKGh0dHA6Ly9wbG5rci5jby9lZGl0L3d0R2VCOTc3YnY3cXZBNUZUWWw5P3A9cHJldmlldykpXG4gKiBgYGBodG1sXG4gKiA8Y29udGFpbmVyICNmaXJzdD5cbiAqICAgPGl0ZW0+YTwvaXRlbT5cbiAqICAgPGl0ZW0+YjwvaXRlbT5cbiAqICAgPGNvbnRhaW5lciAjc2Vjb25kPlxuICogICAgIDxpdGVtPmM8L2l0ZW0+XG4gKiAgIDwvY29udGFpbmVyPlxuICogPC9jb250YWluZXI+XG4gKiBgYGBcbiAqXG4gKiBXaGVuIHF1ZXJ5aW5nIGZvciBpdGVtcywgdGhlIGZpcnN0IGNvbnRhaW5lciB3aWxsIHNlZSBvbmx5IGBhYCBhbmQgYGJgIGJ5IGRlZmF1bHQsXG4gKiBidXQgd2l0aCBgUXVlcnkoVGV4dERpcmVjdGl2ZSwge2Rlc2NlbmRhbnRzOiB0cnVlfSlgIGl0IHdpbGwgc2VlIGBjYCB0b28uXG4gKlxuICogVGhlIHF1ZXJpZWQgZGlyZWN0aXZlcyBhcmUga2VwdCBpbiBhIGRlcHRoLWZpcnN0IHByZS1vcmRlciB3aXRoIHJlc3BlY3QgdG8gdGhlaXJcbiAqIHBvc2l0aW9ucyBpbiB0aGUgRE9NLlxuICpcbiAqIFF1ZXJ5IGRvZXMgbm90IGxvb2sgZGVlcCBpbnRvIGFueSBzdWJjb21wb25lbnQgdmlld3MuXG4gKlxuICogUXVlcnkgaXMgdXBkYXRlZCBhcyBwYXJ0IG9mIHRoZSBjaGFuZ2UtZGV0ZWN0aW9uIGN5Y2xlLiBTaW5jZSBjaGFuZ2UgZGV0ZWN0aW9uXG4gKiBoYXBwZW5zIGFmdGVyIGNvbnN0cnVjdGlvbiBvZiBhIGRpcmVjdGl2ZSwgUXVlcnlMaXN0IHdpbGwgYWx3YXlzIGJlIGVtcHR5IHdoZW4gb2JzZXJ2ZWQgaW4gdGhlXG4gKiBjb25zdHJ1Y3Rvci5cbiAqXG4gKiBUaGUgaW5qZWN0ZWQgb2JqZWN0IGlzIGFuIHVubW9kaWZpYWJsZSBsaXZlIGxpc3QuXG4gKiBTZWUge0BsaW5rIFF1ZXJ5TGlzdH0gZm9yIG1vcmUgZGV0YWlscy5cbiAqL1xuZXhwb3J0IHZhciBRdWVyeTogUXVlcnlNZXRhZGF0YUZhY3RvcnkgPSBtYWtlUGFyYW1EZWNvcmF0b3IoUXVlcnlNZXRhZGF0YSk7XG5cbi8vIFRPRE8oYWxleGVhZ2xlKTogcmVtb3ZlIHRoZSBkdXBsaWNhdGlvbiBvZiB0aGlzIGRvYy4gSXQgaXMgY29waWVkIGZyb20gQ29udGVudENoaWxkcmVuTWV0YWRhdGEuXG4vKipcbiAqIENvbmZpZ3VyZXMgYSBjb250ZW50IHF1ZXJ5LlxuICpcbiAqIENvbnRlbnQgcXVlcmllcyBhcmUgc2V0IGJlZm9yZSB0aGUgYG5nQWZ0ZXJDb250ZW50SW5pdGAgY2FsbGJhY2sgaXMgY2FsbGVkLlxuICpcbiAqICMjIyBFeGFtcGxlXG4gKlxuICogYGBgXG4gKiBARGlyZWN0aXZlKHtcbiAqICAgc2VsZWN0b3I6ICdzb21lRGlyJ1xuICogfSlcbiAqIGNsYXNzIFNvbWVEaXIge1xuICogICBAQ29udGVudENoaWxkcmVuKENoaWxkRGlyZWN0aXZlKSBjb250ZW50Q2hpbGRyZW46IFF1ZXJ5TGlzdDxDaGlsZERpcmVjdGl2ZT47XG4gKlxuICogICBuZ0FmdGVyQ29udGVudEluaXQoKSB7XG4gKiAgICAgLy8gY29udGVudENoaWxkcmVuIGlzIHNldFxuICogICB9XG4gKiB9XG4gKiBgYGBcbiAqL1xuZXhwb3J0IHZhciBDb250ZW50Q2hpbGRyZW46IENvbnRlbnRDaGlsZHJlbk1ldGFkYXRhRmFjdG9yeSA9XG4gICAgbWFrZVByb3BEZWNvcmF0b3IoQ29udGVudENoaWxkcmVuTWV0YWRhdGEpO1xuXG4vLyBUT0RPKGFsZXhlYWdsZSk6IHJlbW92ZSB0aGUgZHVwbGljYXRpb24gb2YgdGhpcyBkb2MuIEl0IGlzIGNvcGllZCBmcm9tIENvbnRlbnRDaGlsZE1ldGFkYXRhLlxuLyoqXG4gKiBDb25maWd1cmVzIGEgY29udGVudCBxdWVyeS5cbiAqXG4gKiBDb250ZW50IHF1ZXJpZXMgYXJlIHNldCBiZWZvcmUgdGhlIGBuZ0FmdGVyQ29udGVudEluaXRgIGNhbGxiYWNrIGlzIGNhbGxlZC5cbiAqXG4gKiAjIyMgRXhhbXBsZVxuICpcbiAqIGBgYFxuICogQERpcmVjdGl2ZSh7XG4gKiAgIHNlbGVjdG9yOiAnc29tZURpcidcbiAqIH0pXG4gKiBjbGFzcyBTb21lRGlyIHtcbiAqICAgQENvbnRlbnRDaGlsZChDaGlsZERpcmVjdGl2ZSkgY29udGVudENoaWxkO1xuICpcbiAqICAgbmdBZnRlckNvbnRlbnRJbml0KCkge1xuICogICAgIC8vIGNvbnRlbnRDaGlsZCBpcyBzZXRcbiAqICAgfVxuICogfVxuICogYGBgXG4gKi9cbmV4cG9ydCB2YXIgQ29udGVudENoaWxkOiBDb250ZW50Q2hpbGRNZXRhZGF0YUZhY3RvcnkgPSBtYWtlUHJvcERlY29yYXRvcihDb250ZW50Q2hpbGRNZXRhZGF0YSk7XG5cbi8vIFRPRE8oYWxleGVhZ2xlKTogcmVtb3ZlIHRoZSBkdXBsaWNhdGlvbiBvZiB0aGlzIGRvYy4gSXQgaXMgY29waWVkIGZyb20gVmlld0NoaWxkcmVuTWV0YWRhdGEuXG4vKipcbiAqIERlY2xhcmVzIGEgbGlzdCBvZiBjaGlsZCBlbGVtZW50IHJlZmVyZW5jZXMuXG4gKlxuICogQW5ndWxhciBhdXRvbWF0aWNhbGx5IHVwZGF0ZXMgdGhlIGxpc3Qgd2hlbiB0aGUgRE9NIGlzIHVwZGF0ZWQuXG4gKlxuICogYFZpZXdDaGlsZHJlbmAgdGFrZXMgYSBhcmd1bWVudCB0byBzZWxlY3QgZWxlbWVudHMuXG4gKlxuICogLSBJZiB0aGUgYXJndW1lbnQgaXMgYSB0eXBlLCBkaXJlY3RpdmVzIG9yIGNvbXBvbmVudHMgd2l0aCB0aGUgdHlwZSB3aWxsIGJlIGJvdW5kLlxuICpcbiAqIC0gSWYgdGhlIGFyZ3VtZW50IGlzIGEgc3RyaW5nLCB0aGUgc3RyaW5nIGlzIGludGVycHJldGVkIGFzIGEgbGlzdCBvZiBjb21tYS1zZXBhcmF0ZWQgc2VsZWN0b3JzLlxuICogRm9yIGVhY2ggc2VsZWN0b3IsIGFuIGVsZW1lbnQgY29udGFpbmluZyB0aGUgbWF0Y2hpbmcgdGVtcGxhdGUgdmFyaWFibGUgKGUuZy4gYCNjaGlsZGApIHdpbGwgYmVcbiAqIGJvdW5kLlxuICpcbiAqIFZpZXcgY2hpbGRyZW4gYXJlIHNldCBiZWZvcmUgdGhlIGBuZ0FmdGVyVmlld0luaXRgIGNhbGxiYWNrIGlzIGNhbGxlZC5cbiAqXG4gKiAjIyMgRXhhbXBsZVxuICpcbiAqIFdpdGggdHlwZSBzZWxlY3RvcjpcbiAqXG4gKiBgYGBcbiAqIEBDb21wb25lbnQoe1xuICogICBzZWxlY3RvcjogJ2NoaWxkLWNtcCcsXG4gKiAgIHRlbXBsYXRlOiAnPHA+Y2hpbGQ8L3A+J1xuICogfSlcbiAqIGNsYXNzIENoaWxkQ21wIHtcbiAqICAgZG9Tb21ldGhpbmcoKSB7fVxuICogfVxuICpcbiAqIEBDb21wb25lbnQoe1xuICogICBzZWxlY3RvcjogJ3NvbWUtY21wJyxcbiAqICAgdGVtcGxhdGU6IGBcbiAqICAgICA8Y2hpbGQtY21wPjwvY2hpbGQtY21wPlxuICogICAgIDxjaGlsZC1jbXA+PC9jaGlsZC1jbXA+XG4gKiAgICAgPGNoaWxkLWNtcD48L2NoaWxkLWNtcD5cbiAqICAgYCxcbiAqICAgZGlyZWN0aXZlczogW0NoaWxkQ21wXVxuICogfSlcbiAqIGNsYXNzIFNvbWVDbXAge1xuICogICBAVmlld0NoaWxkcmVuKENoaWxkQ21wKSBjaGlsZHJlbjpRdWVyeUxpc3Q8Q2hpbGRDbXA+O1xuICpcbiAqICAgbmdBZnRlclZpZXdJbml0KCkge1xuICogICAgIC8vIGNoaWxkcmVuIGFyZSBzZXRcbiAqICAgICB0aGlzLmNoaWxkcmVuLnRvQXJyYXkoKS5mb3JFYWNoKChjaGlsZCk9PmNoaWxkLmRvU29tZXRoaW5nKCkpO1xuICogICB9XG4gKiB9XG4gKiBgYGBcbiAqXG4gKiBXaXRoIHN0cmluZyBzZWxlY3RvcjpcbiAqXG4gKiBgYGBcbiAqIEBDb21wb25lbnQoe1xuICogICBzZWxlY3RvcjogJ2NoaWxkLWNtcCcsXG4gKiAgIHRlbXBsYXRlOiAnPHA+Y2hpbGQ8L3A+J1xuICogfSlcbiAqIGNsYXNzIENoaWxkQ21wIHtcbiAqICAgZG9Tb21ldGhpbmcoKSB7fVxuICogfVxuICpcbiAqIEBDb21wb25lbnQoe1xuICogICBzZWxlY3RvcjogJ3NvbWUtY21wJyxcbiAqICAgdGVtcGxhdGU6IGBcbiAqICAgICA8Y2hpbGQtY21wICNjaGlsZDE+PC9jaGlsZC1jbXA+XG4gKiAgICAgPGNoaWxkLWNtcCAjY2hpbGQyPjwvY2hpbGQtY21wPlxuICogICAgIDxjaGlsZC1jbXAgI2NoaWxkMz48L2NoaWxkLWNtcD5cbiAqICAgYCxcbiAqICAgZGlyZWN0aXZlczogW0NoaWxkQ21wXVxuICogfSlcbiAqIGNsYXNzIFNvbWVDbXAge1xuICogICBAVmlld0NoaWxkcmVuKCdjaGlsZDEsY2hpbGQyLGNoaWxkMycpIGNoaWxkcmVuOlF1ZXJ5TGlzdDxDaGlsZENtcD47XG4gKlxuICogICBuZ0FmdGVyVmlld0luaXQoKSB7XG4gKiAgICAgLy8gY2hpbGRyZW4gYXJlIHNldFxuICogICAgIHRoaXMuY2hpbGRyZW4udG9BcnJheSgpLmZvckVhY2goKGNoaWxkKT0+Y2hpbGQuZG9Tb21ldGhpbmcoKSk7XG4gKiAgIH1cbiAqIH1cbiAqIGBgYFxuICpcbiAqIFNlZSBhbHNvOiBbVmlld0NoaWxkcmVuTWV0YWRhdGFdXG4gKi9cbmV4cG9ydCB2YXIgVmlld0NoaWxkcmVuOiBWaWV3Q2hpbGRyZW5NZXRhZGF0YUZhY3RvcnkgPSBtYWtlUHJvcERlY29yYXRvcihWaWV3Q2hpbGRyZW5NZXRhZGF0YSk7XG5cbi8vIFRPRE8oYWxleGVhZ2xlKTogcmVtb3ZlIHRoZSBkdXBsaWNhdGlvbiBvZiB0aGlzIGRvYy4gSXQgaXMgY29waWVkIGZyb20gVmlld0NoaWxkTWV0YWRhdGEuXG4vKipcbiAqIERlY2xhcmVzIGEgcmVmZXJlbmNlIHRvIGEgY2hpbGQgZWxlbWVudC5cbiAqXG4gKiBgVmlld0NoaWxkcmVuYCB0YWtlcyBhIGFyZ3VtZW50IHRvIHNlbGVjdCBlbGVtZW50cy5cbiAqXG4gKiAtIElmIHRoZSBhcmd1bWVudCBpcyBhIHR5cGUsIGEgZGlyZWN0aXZlIG9yIGEgY29tcG9uZW50IHdpdGggdGhlIHR5cGUgd2lsbCBiZSBib3VuZC5cbiAqXG4gKiAtIElmIHRoZSBhcmd1bWVudCBpcyBhIHN0cmluZywgdGhlIHN0cmluZyBpcyBpbnRlcnByZXRlZCBhcyBhIHNlbGVjdG9yLiBBbiBlbGVtZW50IGNvbnRhaW5pbmcgdGhlXG4gKiBtYXRjaGluZyB0ZW1wbGF0ZSB2YXJpYWJsZSAoZS5nLiBgI2NoaWxkYCkgd2lsbCBiZSBib3VuZC5cbiAqXG4gKiBJbiBlaXRoZXIgY2FzZSwgYEBWaWV3Q2hpbGQoKWAgYXNzaWducyB0aGUgZmlyc3QgKGxvb2tpbmcgZnJvbSBhYm92ZSkgZWxlbWVudCBpZiB0aGVyZSBhcmVcbiAqIG11bHRpcGxlIG1hdGNoZXMuXG4gKlxuICogVmlldyBjaGlsZCBpcyBzZXQgYmVmb3JlIHRoZSBgbmdBZnRlclZpZXdJbml0YCBjYWxsYmFjayBpcyBjYWxsZWQuXG4gKlxuICogIyMjIEV4YW1wbGVcbiAqXG4gKiBXaXRoIHR5cGUgc2VsZWN0b3I6XG4gKlxuICogYGBgXG4gKiBAQ29tcG9uZW50KHtcbiAqICAgc2VsZWN0b3I6ICdjaGlsZC1jbXAnLFxuICogICB0ZW1wbGF0ZTogJzxwPmNoaWxkPC9wPidcbiAqIH0pXG4gKiBjbGFzcyBDaGlsZENtcCB7XG4gKiAgIGRvU29tZXRoaW5nKCkge31cbiAqIH1cbiAqXG4gKiBAQ29tcG9uZW50KHtcbiAqICAgc2VsZWN0b3I6ICdzb21lLWNtcCcsXG4gKiAgIHRlbXBsYXRlOiAnPGNoaWxkLWNtcD48L2NoaWxkLWNtcD4nLFxuICogICBkaXJlY3RpdmVzOiBbQ2hpbGRDbXBdXG4gKiB9KVxuICogY2xhc3MgU29tZUNtcCB7XG4gKiAgIEBWaWV3Q2hpbGQoQ2hpbGRDbXApIGNoaWxkOkNoaWxkQ21wO1xuICpcbiAqICAgbmdBZnRlclZpZXdJbml0KCkge1xuICogICAgIC8vIGNoaWxkIGlzIHNldFxuICogICAgIHRoaXMuY2hpbGQuZG9Tb21ldGhpbmcoKTtcbiAqICAgfVxuICogfVxuICogYGBgXG4gKlxuICogV2l0aCBzdHJpbmcgc2VsZWN0b3I6XG4gKlxuICogYGBgXG4gKiBAQ29tcG9uZW50KHtcbiAqICAgc2VsZWN0b3I6ICdjaGlsZC1jbXAnLFxuICogICB0ZW1wbGF0ZTogJzxwPmNoaWxkPC9wPidcbiAqIH0pXG4gKiBjbGFzcyBDaGlsZENtcCB7XG4gKiAgIGRvU29tZXRoaW5nKCkge31cbiAqIH1cbiAqXG4gKiBAQ29tcG9uZW50KHtcbiAqICAgc2VsZWN0b3I6ICdzb21lLWNtcCcsXG4gKiAgIHRlbXBsYXRlOiAnPGNoaWxkLWNtcCAjY2hpbGQ+PC9jaGlsZC1jbXA+JyxcbiAqICAgZGlyZWN0aXZlczogW0NoaWxkQ21wXVxuICogfSlcbiAqIGNsYXNzIFNvbWVDbXAge1xuICogICBAVmlld0NoaWxkKCdjaGlsZCcpIGNoaWxkOkNoaWxkQ21wO1xuICpcbiAqICAgbmdBZnRlclZpZXdJbml0KCkge1xuICogICAgIC8vIGNoaWxkIGlzIHNldFxuICogICAgIHRoaXMuY2hpbGQuZG9Tb21ldGhpbmcoKTtcbiAqICAgfVxuICogfVxuICogYGBgXG4gKiBTZWUgYWxzbzogW1ZpZXdDaGlsZE1ldGFkYXRhXVxuICovXG5leHBvcnQgdmFyIFZpZXdDaGlsZDogVmlld0NoaWxkTWV0YWRhdGFGYWN0b3J5ID0gbWFrZVByb3BEZWNvcmF0b3IoVmlld0NoaWxkTWV0YWRhdGEpO1xuXG4vLyBUT0RPKGFsZXhlYWdsZSk6IHJlbW92ZSB0aGUgZHVwbGljYXRpb24gb2YgdGhpcyBkb2MuIEl0IGlzIGNvcGllZCBmcm9tIFZpZXdRdWVyeU1ldGFkYXRhLlxuLyoqXG4gKiBTaW1pbGFyIHRvIHtAbGluayBRdWVyeU1ldGFkYXRhfSwgYnV0IHF1ZXJ5aW5nIHRoZSBjb21wb25lbnQgdmlldywgaW5zdGVhZCBvZlxuICogdGhlIGNvbnRlbnQgY2hpbGRyZW4uXG4gKlxuICogIyMjIEV4YW1wbGUgKFtsaXZlIGRlbW9dKGh0dHA6Ly9wbG5rci5jby9lZGl0L2VOc0ZIRGY3WWp5TTZJekt4TTFqP3A9cHJldmlldykpXG4gKlxuICogYGBgamF2YXNjcmlwdFxuICogQENvbXBvbmVudCh7XG4gKiAgIC4uLixcbiAqICAgdGVtcGxhdGU6IGBcbiAqICAgICA8aXRlbT4gYSA8L2l0ZW0+XG4gKiAgICAgPGl0ZW0+IGIgPC9pdGVtPlxuICogICAgIDxpdGVtPiBjIDwvaXRlbT5cbiAqICAgYFxuICogfSlcbiAqIGNsYXNzIE15Q29tcG9uZW50IHtcbiAqICAgc2hvd246IGJvb2xlYW47XG4gKlxuICogICBjb25zdHJ1Y3Rvcihwcml2YXRlIEBRdWVyeShJdGVtKSBpdGVtczpRdWVyeUxpc3Q8SXRlbT4pIHtcbiAqICAgICBpdGVtcy5jaGFuZ2VzLnN1YnNjcmliZSgoKSA9PiBjb25zb2xlLmxvZyhpdGVtcy5sZW5ndGgpKTtcbiAqICAgfVxuICogfVxuICogYGBgXG4gKlxuICogU3VwcG9ydHMgdGhlIHNhbWUgcXVlcnlpbmcgcGFyYW1ldGVycyBhcyB7QGxpbmsgUXVlcnlNZXRhZGF0YX0sIGV4Y2VwdFxuICogYGRlc2NlbmRhbnRzYC4gVGhpcyBhbHdheXMgcXVlcmllcyB0aGUgd2hvbGUgdmlldy5cbiAqXG4gKiBBcyBgc2hvd25gIGlzIGZsaXBwZWQgYmV0d2VlbiB0cnVlIGFuZCBmYWxzZSwgaXRlbXMgd2lsbCBjb250YWluIHplcm8gb2Ygb25lXG4gKiBpdGVtcy5cbiAqXG4gKiBTcGVjaWZpZXMgdGhhdCBhIHtAbGluayBRdWVyeUxpc3R9IHNob3VsZCBiZSBpbmplY3RlZC5cbiAqXG4gKiBUaGUgaW5qZWN0ZWQgb2JqZWN0IGlzIGFuIGl0ZXJhYmxlIGFuZCBvYnNlcnZhYmxlIGxpdmUgbGlzdC5cbiAqIFNlZSB7QGxpbmsgUXVlcnlMaXN0fSBmb3IgbW9yZSBkZXRhaWxzLlxuICovXG5leHBvcnQgdmFyIFZpZXdRdWVyeTogUXVlcnlNZXRhZGF0YUZhY3RvcnkgPSBtYWtlUGFyYW1EZWNvcmF0b3IoVmlld1F1ZXJ5TWV0YWRhdGEpO1xuXG4vLyBUT0RPKGFsZXhlYWdsZSk6IHJlbW92ZSB0aGUgZHVwbGljYXRpb24gb2YgdGhpcyBkb2MuIEl0IGlzIGNvcGllZCBmcm9tIFBpcGVNZXRhZGF0YS5cbi8qKlxuICogRGVjbGFyZSByZXVzYWJsZSBwaXBlIGZ1bmN0aW9uLlxuICpcbiAqICMjIyBFeGFtcGxlXG4gKlxuICoge0BleGFtcGxlIGNvcmUvdHMvbWV0YWRhdGEvbWV0YWRhdGEudHMgcmVnaW9uPSdwaXBlJ31cbiAqL1xuZXhwb3J0IHZhciBQaXBlOiBQaXBlTWV0YWRhdGFGYWN0b3J5ID0gPFBpcGVNZXRhZGF0YUZhY3Rvcnk+bWFrZURlY29yYXRvcihQaXBlTWV0YWRhdGEpO1xuXG4vLyBUT0RPKGFsZXhlYWdsZSk6IHJlbW92ZSB0aGUgZHVwbGljYXRpb24gb2YgdGhpcyBkb2MuIEl0IGlzIGNvcGllZCBmcm9tIElucHV0TWV0YWRhdGEuXG4vKipcbiAqIERlY2xhcmVzIGEgZGF0YS1ib3VuZCBpbnB1dCBwcm9wZXJ0eS5cbiAqXG4gKiBBbmd1bGFyIGF1dG9tYXRpY2FsbHkgdXBkYXRlcyBkYXRhLWJvdW5kIHByb3BlcnRpZXMgZHVyaW5nIGNoYW5nZSBkZXRlY3Rpb24uXG4gKlxuICogYElucHV0TWV0YWRhdGFgIHRha2VzIGFuIG9wdGlvbmFsIHBhcmFtZXRlciB0aGF0IHNwZWNpZmllcyB0aGUgbmFtZVxuICogdXNlZCB3aGVuIGluc3RhbnRpYXRpbmcgYSBjb21wb25lbnQgaW4gdGhlIHRlbXBsYXRlLiBXaGVuIG5vdCBwcm92aWRlZCxcbiAqIHRoZSBuYW1lIG9mIHRoZSBkZWNvcmF0ZWQgcHJvcGVydHkgaXMgdXNlZC5cbiAqXG4gKiAjIyMgRXhhbXBsZVxuICpcbiAqIFRoZSBmb2xsb3dpbmcgZXhhbXBsZSBjcmVhdGVzIGEgY29tcG9uZW50IHdpdGggdHdvIGlucHV0IHByb3BlcnRpZXMuXG4gKlxuICogYGBgdHlwZXNjcmlwdFxuICogQENvbXBvbmVudCh7XG4gKiAgIHNlbGVjdG9yOiAnYmFuay1hY2NvdW50JyxcbiAqICAgdGVtcGxhdGU6IGBcbiAqICAgICBCYW5rIE5hbWU6IHt7YmFua05hbWV9fVxuICogICAgIEFjY291bnQgSWQ6IHt7aWR9fVxuICogICBgXG4gKiB9KVxuICogY2xhc3MgQmFua0FjY291bnQge1xuICogICBASW5wdXQoKSBiYW5rTmFtZTogc3RyaW5nO1xuICogICBASW5wdXQoJ2FjY291bnQtaWQnKSBpZDogc3RyaW5nO1xuICpcbiAqICAgLy8gdGhpcyBwcm9wZXJ0eSBpcyBub3QgYm91bmQsIGFuZCB3b24ndCBiZSBhdXRvbWF0aWNhbGx5IHVwZGF0ZWQgYnkgQW5ndWxhclxuICogICBub3JtYWxpemVkQmFua05hbWU6IHN0cmluZztcbiAqIH1cbiAqXG4gKiBAQ29tcG9uZW50KHtcbiAqICAgc2VsZWN0b3I6ICdhcHAnLFxuICogICB0ZW1wbGF0ZTogYFxuICogICAgIDxiYW5rLWFjY291bnQgYmFuay1uYW1lPVwiUkJDXCIgYWNjb3VudC1pZD1cIjQ3NDdcIj48L2JhbmstYWNjb3VudD5cbiAqICAgYCxcbiAqICAgZGlyZWN0aXZlczogW0JhbmtBY2NvdW50XVxuICogfSlcbiAqIGNsYXNzIEFwcCB7fVxuICpcbiAqIGJvb3RzdHJhcChBcHApO1xuICogYGBgXG4gKi9cbmV4cG9ydCB2YXIgSW5wdXQ6IElucHV0TWV0YWRhdGFGYWN0b3J5ID0gbWFrZVByb3BEZWNvcmF0b3IoSW5wdXRNZXRhZGF0YSk7XG5cbi8vIFRPRE8oYWxleGVhZ2xlKTogcmVtb3ZlIHRoZSBkdXBsaWNhdGlvbiBvZiB0aGlzIGRvYy4gSXQgaXMgY29waWVkIGZyb20gT3V0cHV0TWV0YWRhdGEuXG4vKipcbiAqIERlY2xhcmVzIGFuIGV2ZW50LWJvdW5kIG91dHB1dCBwcm9wZXJ0eS5cbiAqXG4gKiBXaGVuIGFuIG91dHB1dCBwcm9wZXJ0eSBlbWl0cyBhbiBldmVudCwgYW4gZXZlbnQgaGFuZGxlciBhdHRhY2hlZCB0byB0aGF0IGV2ZW50XG4gKiB0aGUgdGVtcGxhdGUgaXMgaW52b2tlZC5cbiAqXG4gKiBgT3V0cHV0TWV0YWRhdGFgIHRha2VzIGFuIG9wdGlvbmFsIHBhcmFtZXRlciB0aGF0IHNwZWNpZmllcyB0aGUgbmFtZVxuICogdXNlZCB3aGVuIGluc3RhbnRpYXRpbmcgYSBjb21wb25lbnQgaW4gdGhlIHRlbXBsYXRlLiBXaGVuIG5vdCBwcm92aWRlZCxcbiAqIHRoZSBuYW1lIG9mIHRoZSBkZWNvcmF0ZWQgcHJvcGVydHkgaXMgdXNlZC5cbiAqXG4gKiAjIyMgRXhhbXBsZVxuICpcbiAqIGBgYHR5cGVzY3JpcHRcbiAqIEBEaXJlY3RpdmUoe1xuICogICBzZWxlY3RvcjogJ2ludGVydmFsLWRpcicsXG4gKiB9KVxuICogY2xhc3MgSW50ZXJ2YWxEaXIge1xuICogICBAT3V0cHV0KCkgZXZlcnlTZWNvbmQgPSBuZXcgRXZlbnRFbWl0dGVyKCk7XG4gKiAgIEBPdXRwdXQoJ2V2ZXJ5Rml2ZVNlY29uZHMnKSBmaXZlNVNlY3MgPSBuZXcgRXZlbnRFbWl0dGVyKCk7XG4gKlxuICogICBjb25zdHJ1Y3RvcigpIHtcbiAqICAgICBzZXRJbnRlcnZhbCgoKSA9PiB0aGlzLmV2ZXJ5U2Vjb25kLmVtaXQoXCJldmVudFwiKSwgMTAwMCk7XG4gKiAgICAgc2V0SW50ZXJ2YWwoKCkgPT4gdGhpcy5maXZlNVNlY3MuZW1pdChcImV2ZW50XCIpLCA1MDAwKTtcbiAqICAgfVxuICogfVxuICpcbiAqIEBDb21wb25lbnQoe1xuICogICBzZWxlY3RvcjogJ2FwcCcsXG4gKiAgIHRlbXBsYXRlOiBgXG4gKiAgICAgPGludGVydmFsLWRpciAoZXZlcnlTZWNvbmQpPVwiZXZlcnlTZWNvbmQoKVwiIChldmVyeUZpdmVTZWNvbmRzKT1cImV2ZXJ5Rml2ZVNlY29uZHMoKVwiPlxuICogICAgIDwvaW50ZXJ2YWwtZGlyPlxuICogICBgLFxuICogICBkaXJlY3RpdmVzOiBbSW50ZXJ2YWxEaXJdXG4gKiB9KVxuICogY2xhc3MgQXBwIHtcbiAqICAgZXZlcnlTZWNvbmQoKSB7IGNvbnNvbGUubG9nKCdzZWNvbmQnKTsgfVxuICogICBldmVyeUZpdmVTZWNvbmRzKCkgeyBjb25zb2xlLmxvZygnZml2ZSBzZWNvbmRzJyk7IH1cbiAqIH1cbiAqIGJvb3RzdHJhcChBcHApO1xuICogYGBgXG4gKi9cbmV4cG9ydCB2YXIgT3V0cHV0OiBPdXRwdXRNZXRhZGF0YUZhY3RvcnkgPSBtYWtlUHJvcERlY29yYXRvcihPdXRwdXRNZXRhZGF0YSk7XG5cbi8vIFRPRE8oYWxleGVhZ2xlKTogcmVtb3ZlIHRoZSBkdXBsaWNhdGlvbiBvZiB0aGlzIGRvYy4gSXQgaXMgY29waWVkIGZyb20gSG9zdEJpbmRpbmdNZXRhZGF0YS5cbi8qKlxuICogRGVjbGFyZXMgYSBob3N0IHByb3BlcnR5IGJpbmRpbmcuXG4gKlxuICogQW5ndWxhciBhdXRvbWF0aWNhbGx5IGNoZWNrcyBob3N0IHByb3BlcnR5IGJpbmRpbmdzIGR1cmluZyBjaGFuZ2UgZGV0ZWN0aW9uLlxuICogSWYgYSBiaW5kaW5nIGNoYW5nZXMsIGl0IHdpbGwgdXBkYXRlIHRoZSBob3N0IGVsZW1lbnQgb2YgdGhlIGRpcmVjdGl2ZS5cbiAqXG4gKiBgSG9zdEJpbmRpbmdNZXRhZGF0YWAgdGFrZXMgYW4gb3B0aW9uYWwgcGFyYW1ldGVyIHRoYXQgc3BlY2lmaWVzIHRoZSBwcm9wZXJ0eVxuICogbmFtZSBvZiB0aGUgaG9zdCBlbGVtZW50IHRoYXQgd2lsbCBiZSB1cGRhdGVkLiBXaGVuIG5vdCBwcm92aWRlZCxcbiAqIHRoZSBjbGFzcyBwcm9wZXJ0eSBuYW1lIGlzIHVzZWQuXG4gKlxuICogIyMjIEV4YW1wbGVcbiAqXG4gKiBUaGUgZm9sbG93aW5nIGV4YW1wbGUgY3JlYXRlcyBhIGRpcmVjdGl2ZSB0aGF0IHNldHMgdGhlIGB2YWxpZGAgYW5kIGBpbnZhbGlkYCBjbGFzc2VzXG4gKiBvbiB0aGUgRE9NIGVsZW1lbnQgdGhhdCBoYXMgbmdNb2RlbCBkaXJlY3RpdmUgb24gaXQuXG4gKlxuICogYGBgdHlwZXNjcmlwdFxuICogQERpcmVjdGl2ZSh7c2VsZWN0b3I6ICdbbmdNb2RlbF0nfSlcbiAqIGNsYXNzIE5nTW9kZWxTdGF0dXMge1xuICogICBjb25zdHJ1Y3RvcihwdWJsaWMgY29udHJvbDpOZ01vZGVsKSB7fVxuICogICBASG9zdEJpbmRpbmcoJ1tjbGFzcy52YWxpZF0nKSBnZXQgdmFsaWQgeyByZXR1cm4gdGhpcy5jb250cm9sLnZhbGlkOyB9XG4gKiAgIEBIb3N0QmluZGluZygnW2NsYXNzLmludmFsaWRdJykgZ2V0IGludmFsaWQgeyByZXR1cm4gdGhpcy5jb250cm9sLmludmFsaWQ7IH1cbiAqIH1cbiAqXG4gKiBAQ29tcG9uZW50KHtcbiAqICAgc2VsZWN0b3I6ICdhcHAnLFxuICogICB0ZW1wbGF0ZTogYDxpbnB1dCBbKG5nTW9kZWwpXT1cInByb3BcIj5gLFxuICogICBkaXJlY3RpdmVzOiBbRk9STV9ESVJFQ1RJVkVTLCBOZ01vZGVsU3RhdHVzXVxuICogfSlcbiAqIGNsYXNzIEFwcCB7XG4gKiAgIHByb3A7XG4gKiB9XG4gKlxuICogYm9vdHN0cmFwKEFwcCk7XG4gKiBgYGBcbiAqL1xuZXhwb3J0IHZhciBIb3N0QmluZGluZzogSG9zdEJpbmRpbmdNZXRhZGF0YUZhY3RvcnkgPSBtYWtlUHJvcERlY29yYXRvcihIb3N0QmluZGluZ01ldGFkYXRhKTtcblxuLy8gVE9ETyhhbGV4ZWFnbGUpOiByZW1vdmUgdGhlIGR1cGxpY2F0aW9uIG9mIHRoaXMgZG9jLiBJdCBpcyBjb3BpZWQgZnJvbSBIb3N0TGlzdGVuZXJNZXRhZGF0YS5cbi8qKlxuICogRGVjbGFyZXMgYSBob3N0IGxpc3RlbmVyLlxuICpcbiAqIEFuZ3VsYXIgd2lsbCBpbnZva2UgdGhlIGRlY29yYXRlZCBtZXRob2Qgd2hlbiB0aGUgaG9zdCBlbGVtZW50IGVtaXRzIHRoZSBzcGVjaWZpZWQgZXZlbnQuXG4gKlxuICogSWYgdGhlIGRlY29yYXRlZCBtZXRob2QgcmV0dXJucyBgZmFsc2VgLCB0aGVuIGBwcmV2ZW50RGVmYXVsdGAgaXMgYXBwbGllZCBvbiB0aGUgRE9NXG4gKiBldmVudC5cbiAqXG4gKiAjIyMgRXhhbXBsZVxuICpcbiAqIFRoZSBmb2xsb3dpbmcgZXhhbXBsZSBkZWNsYXJlcyBhIGRpcmVjdGl2ZSB0aGF0IGF0dGFjaGVzIGEgY2xpY2sgbGlzdGVuZXIgdG8gdGhlIGJ1dHRvbiBhbmRcbiAqIGNvdW50cyBjbGlja3MuXG4gKlxuICogYGBgdHlwZXNjcmlwdFxuICogQERpcmVjdGl2ZSh7c2VsZWN0b3I6ICdidXR0b25bY291bnRpbmddJ30pXG4gKiBjbGFzcyBDb3VudENsaWNrcyB7XG4gKiAgIG51bWJlck9mQ2xpY2tzID0gMDtcbiAqXG4gKiAgIEBIb3N0TGlzdGVuZXIoJ2NsaWNrJywgWyckZXZlbnQudGFyZ2V0J10pXG4gKiAgIG9uQ2xpY2soYnRuKSB7XG4gKiAgICAgY29uc29sZS5sb2coXCJidXR0b25cIiwgYnRuLCBcIm51bWJlciBvZiBjbGlja3M6XCIsIHRoaXMubnVtYmVyT2ZDbGlja3MrKyk7XG4gKiAgIH1cbiAqIH1cbiAqXG4gKiBAQ29tcG9uZW50KHtcbiAqICAgc2VsZWN0b3I6ICdhcHAnLFxuICogICB0ZW1wbGF0ZTogYDxidXR0b24gY291bnRpbmc+SW5jcmVtZW50PC9idXR0b24+YCxcbiAqICAgZGlyZWN0aXZlczogW0NvdW50Q2xpY2tzXVxuICogfSlcbiAqIGNsYXNzIEFwcCB7fVxuICpcbiAqIGJvb3RzdHJhcChBcHApO1xuICogYGBgXG4gKi9cbmV4cG9ydCB2YXIgSG9zdExpc3RlbmVyOiBIb3N0TGlzdGVuZXJNZXRhZGF0YUZhY3RvcnkgPSBtYWtlUHJvcERlY29yYXRvcihIb3N0TGlzdGVuZXJNZXRhZGF0YSk7XG4iXX0=