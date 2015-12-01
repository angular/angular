/**
 * This indirection is needed to free up Component, etc symbols in the public API
 * to be used by the decorator versions of these annotations.
 */
export { QueryMetadata, ContentChildrenMetadata, ContentChildMetadata, ViewChildrenMetadata, ViewQueryMetadata, ViewChildMetadata, AttributeMetadata } from './metadata/di';
export { ComponentMetadata, DirectiveMetadata, PipeMetadata, InputMetadata, OutputMetadata, HostBindingMetadata, HostListenerMetadata } from './metadata/directives';
export { ViewMetadata, ViewEncapsulation } from './metadata/view';
import { QueryMetadata, ContentChildrenMetadata, ContentChildMetadata, ViewChildrenMetadata, ViewChildMetadata, ViewQueryMetadata, AttributeMetadata } from './metadata/di';
import { ComponentMetadata, DirectiveMetadata, PipeMetadata, InputMetadata, OutputMetadata, HostBindingMetadata, HostListenerMetadata } from './metadata/directives';
import { ViewMetadata } from './metadata/view';
import { makeDecorator, makeParamDecorator, makePropDecorator } from './util/decorators';
// TODO(alexeagle): remove the duplication of this doc. It is copied from ComponentMetadata.
/**
 * Declare reusable UI building blocks for an application.
 *
 * Each Angular component requires a single `@Component` and at least one `@View` annotation. The
 * `@Component`
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
 * For details on the `@View` annotation, see {@link ViewMetadata}.
 *
 * ## Lifecycle hooks
 *
 * When the component class implements some {@link angular2/lifecycle_hooks} the callbacks are
 * called by the change detection at defined points in time during the life of the component.
 *
 * ### Example
 *
 * ```
 * @Component({
 *   selector: 'greet',
 *   template: 'Hello {{name}}!'
 * })
 * class Greet {
 *   name: string;
 *
 *   constructor() {
 *     this.name = 'World';
 *   }
 * }
 * ```
 *
 */
export var Component = makeDecorator(ComponentMetadata, (fn) => fn.View = View);
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
 * removed, or moved by a directive that uses a {@link ViewContainerRef} such as a `ng-for`, an
 * `ng-if`, or an `ng-switch`.
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
 * When the directive class implements some {@link angular2/lifecycle_hooks} the callbacks are
 * called by the change detection at defined points in time during the life of the directive.
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
export var Directive = makeDecorator(DirectiveMetadata);
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
export var View = makeDecorator(ViewMetadata, (fn) => fn.View = View);
// TODO(alexeagle): remove the duplication of this doc. It is copied from AttributeMetadata.
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
export var Attribute = makeParamDecorator(AttributeMetadata);
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
 *   <pane *ng-for="#o of objects" [title]="o.title">{{o.text}}</pane>
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
 *      <li *ng-for="#pane of panes">{{pane.title}}</li>
 *    </ul>
 *    <content></content>
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
 * @Component({ selector: 'foo' })
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
 *   <div #find-me>...</div>
 *   <div #find-me-too>...</div>
 * </seeker>
 *
 *  @Component({
 *   selector: 'foo'
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
export var Query = makeParamDecorator(QueryMetadata);
// TODO(alexeagle): remove the duplication of this doc. It is copied from ContentChildrenMetadata.
/**
 * Configures a content query.
 *
 * Content queries are set before the `afterContentInit` callback is called.
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
 *   afterContentInit() {
 *     // contentChildren is set
 *   }
 * }
 * ```
 */
export var ContentChildren = makePropDecorator(ContentChildrenMetadata);
// TODO(alexeagle): remove the duplication of this doc. It is copied from ContentChildMetadata.
/**
 * Configures a content query.
 *
 * Content queries are set before the `afterContentInit` callback is called.
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
 *   afterContentInit() {
 *     // contentChild is set
 *   }
 * }
 * ```
 */
export var ContentChild = makePropDecorator(ContentChildMetadata);
// TODO(alexeagle): remove the duplication of this doc. It is copied from ViewChildrenMetadata.
/**
 * Configures a view query.
 *
 * View queries are set before the `afterViewInit` callback is called.
 *
 * ### Example
 *
 * ```
 * @Component({
 *   selector: 'someDir',
 *   templateUrl: 'someTemplate',
 *   directives: [ItemDirective]
 * })
 * class SomeDir {
 *   @ViewChildren(ItemDirective) viewChildren: QueryList<ItemDirective>;
 *
 *   afterViewInit() {
 *     // viewChildren is set
 *   }
 * }
 * ```
 */
export var ViewChildren = makePropDecorator(ViewChildrenMetadata);
// TODO(alexeagle): remove the duplication of this doc. It is copied from ViewChildMetadata.
/**
 * Configures a view query.
 *
 * View queries are set before the `afterViewInit` callback is called.
 *
 * ### Example
 *
 * ```
 * @Component({
 *   selector: 'someDir',
 *   templateUrl: 'someTemplate',
 *   directives: [ItemDirective]
 * })
 * class SomeDir {
 *   @ViewChild(ItemDirective) viewChild:ItemDirective;
 *
 *   afterViewInit() {
 *     // viewChild is set
 *   }
 * }
 * ```
 */
export var ViewChild = makePropDecorator(ViewChildMetadata);
// TODO(alexeagle): remove the duplication of this doc. It is copied from ViewQueryMetadata.
/**
 * Similar to {@link QueryMetadata}, but querying the component view, instead of
 * the content children.
 *
 * ### Example ([live demo](http://plnkr.co/edit/eNsFHDf7YjyM6IzKxM1j?p=preview))
 *
 * ```javascript
 * @Component({...})
 * @View({
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
 *     items.onChange(() => console.log(items.length));
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
export var ViewQuery = makeParamDecorator(ViewQueryMetadata);
// TODO(alexeagle): remove the duplication of this doc. It is copied from PipeMetadata.
/**
 * Declare reusable pipe function.
 *
 * ### Example
 *
 * ```
 * @Pipe({
 *   name: 'lowercase'
 * })
 * class Lowercase {
 *   transform(v, args) { return v.toLowerCase(); }
 * }
 * ```
 */
export var Pipe = makeDecorator(PipeMetadata);
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
export var Input = makePropDecorator(InputMetadata);
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
 *     <interval-dir (every-second)="everySecond()" (every-five-seconds)="everyFiveSeconds()">
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
export var Output = makePropDecorator(OutputMetadata);
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
 * on the DOM element that has ng-model directive on it.
 *
 * ```typescript
 * @Directive({selector: '[ng-model]'})
 * class NgModelStatus {
 *   constructor(public control:NgModel) {}
 *   @HostBinding('[class.valid]') get valid { return this.control.valid; }
 *   @HostBinding('[class.invalid]') get invalid { return this.control.invalid; }
 * }
 *
 * @Component({
 *   selector: 'app',
 *   template: `<input [(ng-model)]="prop">`,
 *   directives: [FORM_DIRECTIVES, NgModelStatus]
 * })
 * class App {
 *   prop;
 * }
 *
 * bootstrap(App);
 * ```
 */
export var HostBinding = makePropDecorator(HostBindingMetadata);
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
export var HostListener = makePropDecorator(HostListenerMetadata);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWV0YWRhdGEuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJhbmd1bGFyMi9zcmMvY29yZS9tZXRhZGF0YS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O0dBR0c7QUFFSCxTQUNFLGFBQWEsRUFDYix1QkFBdUIsRUFDdkIsb0JBQW9CLEVBQ3BCLG9CQUFvQixFQUNwQixpQkFBaUIsRUFDakIsaUJBQWlCLEVBQ2pCLGlCQUFpQixRQUNaLGVBQWUsQ0FBQztBQUV2QixTQUNFLGlCQUFpQixFQUNqQixpQkFBaUIsRUFDakIsWUFBWSxFQUNaLGFBQWEsRUFDYixjQUFjLEVBQ2QsbUJBQW1CLEVBQ25CLG9CQUFvQixRQUNmLHVCQUF1QixDQUFDO0FBRS9CLFNBQVEsWUFBWSxFQUFFLGlCQUFpQixRQUFPLGlCQUFpQixDQUFDO09BRXpELEVBQ0wsYUFBYSxFQUNiLHVCQUF1QixFQUN2QixvQkFBb0IsRUFDcEIsb0JBQW9CLEVBQ3BCLGlCQUFpQixFQUNqQixpQkFBaUIsRUFDakIsaUJBQWlCLEVBQ2xCLE1BQU0sZUFBZTtPQUVmLEVBQ0wsaUJBQWlCLEVBQ2pCLGlCQUFpQixFQUNqQixZQUFZLEVBQ1osYUFBYSxFQUNiLGNBQWMsRUFDZCxtQkFBbUIsRUFDbkIsb0JBQW9CLEVBQ3JCLE1BQU0sdUJBQXVCO09BRXZCLEVBQUMsWUFBWSxFQUFvQixNQUFNLGlCQUFpQjtPQUd4RCxFQUNMLGFBQWEsRUFDYixrQkFBa0IsRUFDbEIsaUJBQWlCLEVBR2xCLE1BQU0sbUJBQW1CO0FBbWMxQiw0RkFBNEY7QUFDNUY7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0dBc0NHO0FBQ0gsV0FBVyxTQUFTLEdBQ0UsYUFBYSxDQUFDLGlCQUFpQixFQUFFLENBQUMsRUFBTyxLQUFLLEVBQUUsQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDLENBQUM7QUFFcEYsNEZBQTRGO0FBQzVGOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztHQXlYRztBQUNILFdBQVcsU0FBUyxHQUF1QyxhQUFhLENBQUMsaUJBQWlCLENBQUMsQ0FBQztBQUU1Rix1RkFBdUY7QUFDdkY7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7R0E0Qkc7QUFDSCxXQUFXLElBQUksR0FDRSxhQUFhLENBQUMsWUFBWSxFQUFFLENBQUMsRUFBTyxLQUFLLEVBQUUsQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDLENBQUM7QUFFMUUsNEZBQTRGO0FBQzVGOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0dBNEJHO0FBQ0gsV0FBVyxTQUFTLEdBQXFCLGtCQUFrQixDQUFDLGlCQUFpQixDQUFDLENBQUM7QUFFL0Usd0ZBQXdGO0FBQ3hGOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0dBMEdHO0FBQ0gsV0FBVyxLQUFLLEdBQWlCLGtCQUFrQixDQUFDLGFBQWEsQ0FBQyxDQUFDO0FBRW5FLGtHQUFrRztBQUNsRzs7Ozs7Ozs7Ozs7Ozs7Ozs7OztHQW1CRztBQUNILFdBQVcsZUFBZSxHQUEyQixpQkFBaUIsQ0FBQyx1QkFBdUIsQ0FBQyxDQUFDO0FBRWhHLCtGQUErRjtBQUMvRjs7Ozs7Ozs7Ozs7Ozs7Ozs7OztHQW1CRztBQUNILFdBQVcsWUFBWSxHQUF3QixpQkFBaUIsQ0FBQyxvQkFBb0IsQ0FBQyxDQUFDO0FBRXZGLCtGQUErRjtBQUMvRjs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0dBcUJHO0FBQ0gsV0FBVyxZQUFZLEdBQXdCLGlCQUFpQixDQUFDLG9CQUFvQixDQUFDLENBQUM7QUFFdkYsNEZBQTRGO0FBQzVGOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7R0FxQkc7QUFDSCxXQUFXLFNBQVMsR0FBcUIsaUJBQWlCLENBQUMsaUJBQWlCLENBQUMsQ0FBQztBQUU5RSw0RkFBNEY7QUFDNUY7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7R0FrQ0c7QUFDSCxXQUFXLFNBQVMsR0FBaUIsa0JBQWtCLENBQUMsaUJBQWlCLENBQUMsQ0FBQztBQUUzRSx1RkFBdUY7QUFDdkY7Ozs7Ozs7Ozs7Ozs7R0FhRztBQUNILFdBQVcsSUFBSSxHQUE2QixhQUFhLENBQUMsWUFBWSxDQUFDLENBQUM7QUFFeEUsd0ZBQXdGO0FBQ3hGOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0dBd0NHO0FBQ0gsV0FBVyxLQUFLLEdBQWlCLGlCQUFpQixDQUFDLGFBQWEsQ0FBQyxDQUFDO0FBRWxFLHlGQUF5RjtBQUN6Rjs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztHQXdDRztBQUNILFdBQVcsTUFBTSxHQUFrQixpQkFBaUIsQ0FBQyxjQUFjLENBQUMsQ0FBQztBQUVyRSw4RkFBOEY7QUFDOUY7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7R0FrQ0c7QUFDSCxXQUFXLFdBQVcsR0FBdUIsaUJBQWlCLENBQUMsbUJBQW1CLENBQUMsQ0FBQztBQUVwRiwrRkFBK0Y7QUFDL0Y7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztHQWlDRztBQUNILFdBQVcsWUFBWSxHQUF3QixpQkFBaUIsQ0FBQyxvQkFBb0IsQ0FBQyxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBUaGlzIGluZGlyZWN0aW9uIGlzIG5lZWRlZCB0byBmcmVlIHVwIENvbXBvbmVudCwgZXRjIHN5bWJvbHMgaW4gdGhlIHB1YmxpYyBBUElcbiAqIHRvIGJlIHVzZWQgYnkgdGhlIGRlY29yYXRvciB2ZXJzaW9ucyBvZiB0aGVzZSBhbm5vdGF0aW9ucy5cbiAqL1xuXG5leHBvcnQge1xuICBRdWVyeU1ldGFkYXRhLFxuICBDb250ZW50Q2hpbGRyZW5NZXRhZGF0YSxcbiAgQ29udGVudENoaWxkTWV0YWRhdGEsXG4gIFZpZXdDaGlsZHJlbk1ldGFkYXRhLFxuICBWaWV3UXVlcnlNZXRhZGF0YSxcbiAgVmlld0NoaWxkTWV0YWRhdGEsXG4gIEF0dHJpYnV0ZU1ldGFkYXRhXG59IGZyb20gJy4vbWV0YWRhdGEvZGknO1xuXG5leHBvcnQge1xuICBDb21wb25lbnRNZXRhZGF0YSxcbiAgRGlyZWN0aXZlTWV0YWRhdGEsXG4gIFBpcGVNZXRhZGF0YSxcbiAgSW5wdXRNZXRhZGF0YSxcbiAgT3V0cHV0TWV0YWRhdGEsXG4gIEhvc3RCaW5kaW5nTWV0YWRhdGEsXG4gIEhvc3RMaXN0ZW5lck1ldGFkYXRhXG59IGZyb20gJy4vbWV0YWRhdGEvZGlyZWN0aXZlcyc7XG5cbmV4cG9ydCB7Vmlld01ldGFkYXRhLCBWaWV3RW5jYXBzdWxhdGlvbn0gZnJvbSAnLi9tZXRhZGF0YS92aWV3JztcblxuaW1wb3J0IHtcbiAgUXVlcnlNZXRhZGF0YSxcbiAgQ29udGVudENoaWxkcmVuTWV0YWRhdGEsXG4gIENvbnRlbnRDaGlsZE1ldGFkYXRhLFxuICBWaWV3Q2hpbGRyZW5NZXRhZGF0YSxcbiAgVmlld0NoaWxkTWV0YWRhdGEsXG4gIFZpZXdRdWVyeU1ldGFkYXRhLFxuICBBdHRyaWJ1dGVNZXRhZGF0YVxufSBmcm9tICcuL21ldGFkYXRhL2RpJztcblxuaW1wb3J0IHtcbiAgQ29tcG9uZW50TWV0YWRhdGEsXG4gIERpcmVjdGl2ZU1ldGFkYXRhLFxuICBQaXBlTWV0YWRhdGEsXG4gIElucHV0TWV0YWRhdGEsXG4gIE91dHB1dE1ldGFkYXRhLFxuICBIb3N0QmluZGluZ01ldGFkYXRhLFxuICBIb3N0TGlzdGVuZXJNZXRhZGF0YVxufSBmcm9tICcuL21ldGFkYXRhL2RpcmVjdGl2ZXMnO1xuXG5pbXBvcnQge1ZpZXdNZXRhZGF0YSwgVmlld0VuY2Fwc3VsYXRpb259IGZyb20gJy4vbWV0YWRhdGEvdmlldyc7XG5pbXBvcnQge0NoYW5nZURldGVjdGlvblN0cmF0ZWd5fSBmcm9tICdhbmd1bGFyMi9zcmMvY29yZS9jaGFuZ2VfZGV0ZWN0aW9uL2NoYW5nZV9kZXRlY3Rpb24nO1xuXG5pbXBvcnQge1xuICBtYWtlRGVjb3JhdG9yLFxuICBtYWtlUGFyYW1EZWNvcmF0b3IsXG4gIG1ha2VQcm9wRGVjb3JhdG9yLFxuICBUeXBlRGVjb3JhdG9yLFxuICBDbGFzc1xufSBmcm9tICcuL3V0aWwvZGVjb3JhdG9ycyc7XG5pbXBvcnQge1R5cGV9IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvbGFuZyc7XG5cbi8qKlxuICogSW50ZXJmYWNlIGZvciB0aGUge0BsaW5rIERpcmVjdGl2ZU1ldGFkYXRhfSBkZWNvcmF0b3IgZnVuY3Rpb24uXG4gKlxuICogU2VlIHtAbGluayBEaXJlY3RpdmVGYWN0b3J5fS5cbiAqL1xuZXhwb3J0IGludGVyZmFjZSBEaXJlY3RpdmVEZWNvcmF0b3IgZXh0ZW5kcyBUeXBlRGVjb3JhdG9yIHt9XG5cbi8qKlxuICogSW50ZXJmYWNlIGZvciB0aGUge0BsaW5rIENvbXBvbmVudE1ldGFkYXRhfSBkZWNvcmF0b3IgZnVuY3Rpb24uXG4gKlxuICogU2VlIHtAbGluayBDb21wb25lbnRGYWN0b3J5fS5cbiAqL1xuZXhwb3J0IGludGVyZmFjZSBDb21wb25lbnREZWNvcmF0b3IgZXh0ZW5kcyBUeXBlRGVjb3JhdG9yIHtcbiAgLyoqXG4gICAqIENoYWluIHtAbGluayBWaWV3TWV0YWRhdGF9IGFubm90YXRpb24uXG4gICAqL1xuICBWaWV3KG9iajoge1xuICAgIHRlbXBsYXRlVXJsPzogc3RyaW5nLFxuICAgIHRlbXBsYXRlPzogc3RyaW5nLFxuICAgIGRpcmVjdGl2ZXM/OiBBcnJheTxUeXBlIHwgYW55W10+LFxuICAgIHBpcGVzPzogQXJyYXk8VHlwZSB8IGFueVtdPixcbiAgICByZW5kZXJlcj86IHN0cmluZyxcbiAgICBzdHlsZXM/OiBzdHJpbmdbXSxcbiAgICBzdHlsZVVybHM/OiBzdHJpbmdbXSxcbiAgfSk6IFZpZXdEZWNvcmF0b3I7XG59XG5cbi8qKlxuICogSW50ZXJmYWNlIGZvciB0aGUge0BsaW5rIFZpZXdNZXRhZGF0YX0gZGVjb3JhdG9yIGZ1bmN0aW9uLlxuICpcbiAqIFNlZSB7QGxpbmsgVmlld0ZhY3Rvcnl9LlxuICovXG5leHBvcnQgaW50ZXJmYWNlIFZpZXdEZWNvcmF0b3IgZXh0ZW5kcyBUeXBlRGVjb3JhdG9yIHtcbiAgLyoqXG4gICAqIENoYWluIHtAbGluayBWaWV3TWV0YWRhdGF9IGFubm90YXRpb24uXG4gICAqL1xuICBWaWV3KG9iajoge1xuICAgIHRlbXBsYXRlVXJsPzogc3RyaW5nLFxuICAgIHRlbXBsYXRlPzogc3RyaW5nLFxuICAgIGRpcmVjdGl2ZXM/OiBBcnJheTxUeXBlIHwgYW55W10+LFxuICAgIHBpcGVzPzogQXJyYXk8VHlwZSB8IGFueVtdPixcbiAgICByZW5kZXJlcj86IHN0cmluZyxcbiAgICBzdHlsZXM/OiBzdHJpbmdbXSxcbiAgICBzdHlsZVVybHM/OiBzdHJpbmdbXSxcbiAgfSk6IFZpZXdEZWNvcmF0b3I7XG59XG5cbi8qKlxuICoge0BsaW5rIERpcmVjdGl2ZU1ldGFkYXRhfSBmYWN0b3J5IGZvciBjcmVhdGluZyBhbm5vdGF0aW9ucywgZGVjb3JhdG9ycyBvciBEU0wuXG4gKlxuICogIyMjIEV4YW1wbGUgYXMgVHlwZVNjcmlwdCBEZWNvcmF0b3JcbiAqXG4gKiBgYGBcbiAqIGltcG9ydCB7RGlyZWN0aXZlfSBmcm9tIFwiYW5ndWxhcjIvYW5ndWxhcjJcIjtcbiAqXG4gKiBARGlyZWN0aXZlKHsuLi59KVxuICogY2xhc3MgTXlEaXJlY3RpdmUge1xuICogICBjb25zdHJ1Y3RvcigpIHtcbiAqICAgICAuLi5cbiAqICAgfVxuICogfVxuICogYGBgXG4gKlxuICogIyMjIEV4YW1wbGUgYXMgRVM1IERTTFxuICpcbiAqIGBgYFxuICogdmFyIE15RGlyZWN0aXZlID0gbmdcbiAqICAgLkRpcmVjdGl2ZSh7Li4ufSlcbiAqICAgLkNsYXNzKHtcbiAqICAgICBjb25zdHJ1Y3RvcjogZnVuY3Rpb24oKSB7XG4gKiAgICAgICAuLi5cbiAqICAgICB9XG4gKiAgIH0pXG4gKiBgYGBcbiAqXG4gKiAjIyMgRXhhbXBsZSBhcyBFUzUgYW5ub3RhdGlvblxuICpcbiAqIGBgYFxuICogdmFyIE15RGlyZWN0aXZlID0gZnVuY3Rpb24oKSB7XG4gKiAgIC4uLlxuICogfTtcbiAqXG4gKiBNeURpcmVjdGl2ZS5hbm5vdGF0aW9ucyA9IFtcbiAqICAgbmV3IG5nLkRpcmVjdGl2ZSh7Li4ufSlcbiAqIF1cbiAqIGBgYFxuICovXG5leHBvcnQgaW50ZXJmYWNlIERpcmVjdGl2ZUZhY3Rvcnkge1xuICAob2JqOiB7XG4gICAgc2VsZWN0b3I/OiBzdHJpbmcsXG4gICAgaW5wdXRzPzogc3RyaW5nW10sXG4gICAgb3V0cHV0cz86IHN0cmluZ1tdLFxuICAgIHByb3BlcnRpZXM/OiBzdHJpbmdbXSxcbiAgICBldmVudHM/OiBzdHJpbmdbXSxcbiAgICBob3N0Pzoge1trZXk6IHN0cmluZ106IHN0cmluZ30sXG4gICAgYmluZGluZ3M/OiBhbnlbXSxcbiAgICBwcm92aWRlcnM/OiBhbnlbXSxcbiAgICBleHBvcnRBcz86IHN0cmluZyxcbiAgICBtb2R1bGVJZD86IHN0cmluZyxcbiAgICBxdWVyaWVzPzoge1trZXk6IHN0cmluZ106IGFueX1cbiAgfSk6IERpcmVjdGl2ZURlY29yYXRvcjtcbiAgbmV3IChvYmo6IHtcbiAgICBzZWxlY3Rvcj86IHN0cmluZyxcbiAgICBpbnB1dHM/OiBzdHJpbmdbXSxcbiAgICBvdXRwdXRzPzogc3RyaW5nW10sXG4gICAgcHJvcGVydGllcz86IHN0cmluZ1tdLFxuICAgIGV2ZW50cz86IHN0cmluZ1tdLFxuICAgIGhvc3Q/OiB7W2tleTogc3RyaW5nXTogc3RyaW5nfSxcbiAgICBiaW5kaW5ncz86IGFueVtdLFxuICAgIHByb3ZpZGVycz86IGFueVtdLFxuICAgIGV4cG9ydEFzPzogc3RyaW5nLFxuICAgIG1vZHVsZUlkPzogc3RyaW5nLFxuICAgIHF1ZXJpZXM/OiB7W2tleTogc3RyaW5nXTogYW55fVxuICB9KTogRGlyZWN0aXZlTWV0YWRhdGE7XG59XG5cbi8qKlxuICoge0BsaW5rIENvbXBvbmVudE1ldGFkYXRhfSBmYWN0b3J5IGZvciBjcmVhdGluZyBhbm5vdGF0aW9ucywgZGVjb3JhdG9ycyBvciBEU0wuXG4gKlxuICogIyMjIEV4YW1wbGUgYXMgVHlwZVNjcmlwdCBEZWNvcmF0b3JcbiAqXG4gKiBgYGBcbiAqIGltcG9ydCB7Q29tcG9uZW50fSBmcm9tIFwiYW5ndWxhcjIvYW5ndWxhcjJcIjtcbiAqXG4gKiBAQ29tcG9uZW50KHsuLi59KVxuICogY2xhc3MgTXlDb21wb25lbnQge1xuICogICBjb25zdHJ1Y3RvcigpIHtcbiAqICAgICAuLi5cbiAqICAgfVxuICogfVxuICogYGBgXG4gKlxuICogIyMjIEV4YW1wbGUgYXMgRVM1IERTTFxuICpcbiAqIGBgYFxuICogdmFyIE15Q29tcG9uZW50ID0gbmdcbiAqICAgLkNvbXBvbmVudCh7Li4ufSlcbiAqICAgLkNsYXNzKHtcbiAqICAgICBjb25zdHJ1Y3RvcjogZnVuY3Rpb24oKSB7XG4gKiAgICAgICAuLi5cbiAqICAgICB9XG4gKiAgIH0pXG4gKiBgYGBcbiAqXG4gKiAjIyMgRXhhbXBsZSBhcyBFUzUgYW5ub3RhdGlvblxuICpcbiAqIGBgYFxuICogdmFyIE15Q29tcG9uZW50ID0gZnVuY3Rpb24oKSB7XG4gKiAgIC4uLlxuICogfTtcbiAqXG4gKiBNeUNvbXBvbmVudC5hbm5vdGF0aW9ucyA9IFtcbiAqICAgbmV3IG5nLkNvbXBvbmVudCh7Li4ufSlcbiAqIF1cbiAqIGBgYFxuICovXG5leHBvcnQgaW50ZXJmYWNlIENvbXBvbmVudEZhY3Rvcnkge1xuICAob2JqOiB7XG4gICAgc2VsZWN0b3I/OiBzdHJpbmcsXG4gICAgaW5wdXRzPzogc3RyaW5nW10sXG4gICAgb3V0cHV0cz86IHN0cmluZ1tdLFxuICAgIHByb3BlcnRpZXM/OiBzdHJpbmdbXSxcbiAgICBldmVudHM/OiBzdHJpbmdbXSxcbiAgICBob3N0Pzoge1trZXk6IHN0cmluZ106IHN0cmluZ30sXG4gICAgLyogQGRlcHJlY2F0ZWQgKi9cbiAgICBiaW5kaW5ncz86IGFueVtdLFxuICAgIHByb3ZpZGVycz86IGFueVtdLFxuICAgIGV4cG9ydEFzPzogc3RyaW5nLFxuICAgIG1vZHVsZUlkPzogc3RyaW5nLFxuICAgIHF1ZXJpZXM/OiB7W2tleTogc3RyaW5nXTogYW55fSxcbiAgICB2aWV3QmluZGluZ3M/OiBhbnlbXSxcbiAgICB2aWV3UHJvdmlkZXJzPzogYW55W10sXG4gICAgY2hhbmdlRGV0ZWN0aW9uPzogQ2hhbmdlRGV0ZWN0aW9uU3RyYXRlZ3ksXG4gICAgdGVtcGxhdGVVcmw/OiBzdHJpbmcsXG4gICAgdGVtcGxhdGU/OiBzdHJpbmcsXG4gICAgc3R5bGVVcmxzPzogc3RyaW5nW10sXG4gICAgc3R5bGVzPzogc3RyaW5nW10sXG4gICAgZGlyZWN0aXZlcz86IEFycmF5PFR5cGUgfCBhbnlbXT4sXG4gICAgcGlwZXM/OiBBcnJheTxUeXBlIHwgYW55W10+LFxuICAgIGVuY2Fwc3VsYXRpb24/OiBWaWV3RW5jYXBzdWxhdGlvblxuICB9KTogQ29tcG9uZW50RGVjb3JhdG9yO1xuICBuZXcgKG9iajoge1xuICAgIHNlbGVjdG9yPzogc3RyaW5nLFxuICAgIGlucHV0cz86IHN0cmluZ1tdLFxuICAgIG91dHB1dHM/OiBzdHJpbmdbXSxcbiAgICBwcm9wZXJ0aWVzPzogc3RyaW5nW10sXG4gICAgZXZlbnRzPzogc3RyaW5nW10sXG4gICAgaG9zdD86IHtba2V5OiBzdHJpbmddOiBzdHJpbmd9LFxuICAgIC8qIEBkZXByZWNhdGVkICovXG4gICAgYmluZGluZ3M/OiBhbnlbXSxcbiAgICBwcm92aWRlcnM/OiBhbnlbXSxcbiAgICBleHBvcnRBcz86IHN0cmluZyxcbiAgICBtb2R1bGVJZD86IHN0cmluZyxcbiAgICBxdWVyaWVzPzoge1trZXk6IHN0cmluZ106IGFueX0sXG4gICAgLyogQGRlcHJlY2F0ZWQgKi9cbiAgICB2aWV3QmluZGluZ3M/OiBhbnlbXSxcbiAgICB2aWV3UHJvdmlkZXJzPzogYW55W10sXG4gICAgY2hhbmdlRGV0ZWN0aW9uPzogQ2hhbmdlRGV0ZWN0aW9uU3RyYXRlZ3ksXG4gICAgdGVtcGxhdGVVcmw/OiBzdHJpbmcsXG4gICAgdGVtcGxhdGU/OiBzdHJpbmcsXG4gICAgc3R5bGVVcmxzPzogc3RyaW5nW10sXG4gICAgc3R5bGVzPzogc3RyaW5nW10sXG4gICAgZGlyZWN0aXZlcz86IEFycmF5PFR5cGUgfCBhbnlbXT4sXG4gICAgcGlwZXM/OiBBcnJheTxUeXBlIHwgYW55W10+LFxuICAgIGVuY2Fwc3VsYXRpb24/OiBWaWV3RW5jYXBzdWxhdGlvblxuICB9KTogQ29tcG9uZW50TWV0YWRhdGE7XG59XG5cbi8qKlxuICoge0BsaW5rIFZpZXdNZXRhZGF0YX0gZmFjdG9yeSBmb3IgY3JlYXRpbmcgYW5ub3RhdGlvbnMsIGRlY29yYXRvcnMgb3IgRFNMLlxuICpcbiAqICMjIyBFeGFtcGxlIGFzIFR5cGVTY3JpcHQgRGVjb3JhdG9yXG4gKlxuICogYGBgXG4gKiBpbXBvcnQge0NvbXBvbmVudCwgVmlld30gZnJvbSBcImFuZ3VsYXIyL2FuZ3VsYXIyXCI7XG4gKlxuICogQENvbXBvbmVudCh7Li4ufSlcbiAqIEBWaWV3KHsuLi59KVxuICogY2xhc3MgTXlDb21wb25lbnQge1xuICogICBjb25zdHJ1Y3RvcigpIHtcbiAqICAgICAuLi5cbiAqICAgfVxuICogfVxuICogYGBgXG4gKlxuICogIyMjIEV4YW1wbGUgYXMgRVM1IERTTFxuICpcbiAqIGBgYFxuICogdmFyIE15Q29tcG9uZW50ID0gbmdcbiAqICAgLkNvbXBvbmVudCh7Li4ufSlcbiAqICAgLlZpZXcoey4uLn0pXG4gKiAgIC5DbGFzcyh7XG4gKiAgICAgY29uc3RydWN0b3I6IGZ1bmN0aW9uKCkge1xuICogICAgICAgLi4uXG4gKiAgICAgfVxuICogICB9KVxuICogYGBgXG4gKlxuICogIyMjIEV4YW1wbGUgYXMgRVM1IGFubm90YXRpb25cbiAqXG4gKiBgYGBcbiAqIHZhciBNeUNvbXBvbmVudCA9IGZ1bmN0aW9uKCkge1xuICogICAuLi5cbiAqIH07XG4gKlxuICogTXlDb21wb25lbnQuYW5ub3RhdGlvbnMgPSBbXG4gKiAgIG5ldyBuZy5Db21wb25lbnQoey4uLn0pLFxuICogICBuZXcgbmcuVmlldyh7Li4ufSlcbiAqIF1cbiAqIGBgYFxuICovXG5leHBvcnQgaW50ZXJmYWNlIFZpZXdGYWN0b3J5IHtcbiAgKG9iajoge1xuICAgIHRlbXBsYXRlVXJsPzogc3RyaW5nLFxuICAgIHRlbXBsYXRlPzogc3RyaW5nLFxuICAgIGRpcmVjdGl2ZXM/OiBBcnJheTxUeXBlIHwgYW55W10+LFxuICAgIHBpcGVzPzogQXJyYXk8VHlwZSB8IGFueVtdPixcbiAgICBlbmNhcHN1bGF0aW9uPzogVmlld0VuY2Fwc3VsYXRpb24sXG4gICAgc3R5bGVzPzogc3RyaW5nW10sXG4gICAgc3R5bGVVcmxzPzogc3RyaW5nW10sXG4gIH0pOiBWaWV3RGVjb3JhdG9yO1xuICBuZXcgKG9iajoge1xuICAgIHRlbXBsYXRlVXJsPzogc3RyaW5nLFxuICAgIHRlbXBsYXRlPzogc3RyaW5nLFxuICAgIGRpcmVjdGl2ZXM/OiBBcnJheTxUeXBlIHwgYW55W10+LFxuICAgIHBpcGVzPzogQXJyYXk8VHlwZSB8IGFueVtdPixcbiAgICBlbmNhcHN1bGF0aW9uPzogVmlld0VuY2Fwc3VsYXRpb24sXG4gICAgc3R5bGVzPzogc3RyaW5nW10sXG4gICAgc3R5bGVVcmxzPzogc3RyaW5nW10sXG4gIH0pOiBWaWV3TWV0YWRhdGE7XG59XG5cbi8qKlxuICoge0BsaW5rIEF0dHJpYnV0ZU1ldGFkYXRhfSBmYWN0b3J5IGZvciBjcmVhdGluZyBhbm5vdGF0aW9ucywgZGVjb3JhdG9ycyBvciBEU0wuXG4gKlxuICogIyMjIEV4YW1wbGUgYXMgVHlwZVNjcmlwdCBEZWNvcmF0b3JcbiAqXG4gKiBgYGBcbiAqIGltcG9ydCB7QXR0cmlidXRlLCBDb21wb25lbnR9IGZyb20gXCJhbmd1bGFyMi9hbmd1bGFyMlwiO1xuICpcbiAqIEBDb21wb25lbnQoey4uLn0pXG4gKiBjbGFzcyBNeUNvbXBvbmVudCB7XG4gKiAgIGNvbnN0cnVjdG9yKEBBdHRyaWJ1dGUoJ3RpdGxlJykgdGl0bGU6IHN0cmluZykge1xuICogICAgIC4uLlxuICogICB9XG4gKiB9XG4gKiBgYGBcbiAqXG4gKiAjIyMgRXhhbXBsZSBhcyBFUzUgRFNMXG4gKlxuICogYGBgXG4gKiB2YXIgTXlDb21wb25lbnQgPSBuZ1xuICogICAuQ29tcG9uZW50KHsuLi59KVxuICogICAuQ2xhc3Moe1xuICogICAgIGNvbnN0cnVjdG9yOiBbbmV3IG5nLkF0dHJpYnV0ZSgndGl0bGUnKSwgZnVuY3Rpb24odGl0bGUpIHtcbiAqICAgICAgIC4uLlxuICogICAgIH1dXG4gKiAgIH0pXG4gKiBgYGBcbiAqXG4gKiAjIyMgRXhhbXBsZSBhcyBFUzUgYW5ub3RhdGlvblxuICpcbiAqIGBgYFxuICogdmFyIE15Q29tcG9uZW50ID0gZnVuY3Rpb24odGl0bGUpIHtcbiAqICAgLi4uXG4gKiB9O1xuICpcbiAqIE15Q29tcG9uZW50LmFubm90YXRpb25zID0gW1xuICogICBuZXcgbmcuQ29tcG9uZW50KHsuLi59KVxuICogXVxuICogTXlDb21wb25lbnQucGFyYW1ldGVycyA9IFtcbiAqICAgW25ldyBuZy5BdHRyaWJ1dGUoJ3RpdGxlJyldXG4gKiBdXG4gKiBgYGBcbiAqL1xuZXhwb3J0IGludGVyZmFjZSBBdHRyaWJ1dGVGYWN0b3J5IHtcbiAgKG5hbWU6IHN0cmluZyk6IFR5cGVEZWNvcmF0b3I7XG4gIG5ldyAobmFtZTogc3RyaW5nKTogQXR0cmlidXRlTWV0YWRhdGE7XG59XG5cbi8qKlxuICoge0BsaW5rIFF1ZXJ5TWV0YWRhdGF9IGZhY3RvcnkgZm9yIGNyZWF0aW5nIGFubm90YXRpb25zLCBkZWNvcmF0b3JzIG9yIERTTC5cbiAqXG4gKiAjIyMgRXhhbXBsZSBhcyBUeXBlU2NyaXB0IERlY29yYXRvclxuICpcbiAqIGBgYFxuICogaW1wb3J0IHtRdWVyeSwgUXVlcnlMaXN0LCBDb21wb25lbnR9IGZyb20gXCJhbmd1bGFyMi9hbmd1bGFyMlwiO1xuICpcbiAqIEBDb21wb25lbnQoey4uLn0pXG4gKiBjbGFzcyBNeUNvbXBvbmVudCB7XG4gKiAgIGNvbnN0cnVjdG9yKEBRdWVyeShTb21lVHlwZSkgcXVlcnlMaXN0OiBRdWVyeUxpc3Q8U29tZVR5cGU+KSB7XG4gKiAgICAgLi4uXG4gKiAgIH1cbiAqIH1cbiAqIGBgYFxuICpcbiAqICMjIyBFeGFtcGxlIGFzIEVTNSBEU0xcbiAqXG4gKiBgYGBcbiAqIHZhciBNeUNvbXBvbmVudCA9IG5nXG4gKiAgIC5Db21wb25lbnQoey4uLn0pXG4gKiAgIC5DbGFzcyh7XG4gKiAgICAgY29uc3RydWN0b3I6IFtuZXcgbmcuUXVlcnkoU29tZVR5cGUpLCBmdW5jdGlvbihxdWVyeUxpc3QpIHtcbiAqICAgICAgIC4uLlxuICogICAgIH1dXG4gKiAgIH0pXG4gKiBgYGBcbiAqXG4gKiAjIyMgRXhhbXBsZSBhcyBFUzUgYW5ub3RhdGlvblxuICpcbiAqIGBgYFxuICogdmFyIE15Q29tcG9uZW50ID0gZnVuY3Rpb24ocXVlcnlMaXN0KSB7XG4gKiAgIC4uLlxuICogfTtcbiAqXG4gKiBNeUNvbXBvbmVudC5hbm5vdGF0aW9ucyA9IFtcbiAqICAgbmV3IG5nLkNvbXBvbmVudCh7Li4ufSlcbiAqIF1cbiAqIE15Q29tcG9uZW50LnBhcmFtZXRlcnMgPSBbXG4gKiAgIFtuZXcgbmcuUXVlcnkoU29tZVR5cGUpXVxuICogXVxuICogYGBgXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgUXVlcnlGYWN0b3J5IHtcbiAgKHNlbGVjdG9yOiBUeXBlIHwgc3RyaW5nLCB7ZGVzY2VuZGFudHN9Pzoge2Rlc2NlbmRhbnRzPzogYm9vbGVhbn0pOiBQYXJhbWV0ZXJEZWNvcmF0b3I7XG4gIG5ldyAoc2VsZWN0b3I6IFR5cGUgfCBzdHJpbmcsIHtkZXNjZW5kYW50c30/OiB7ZGVzY2VuZGFudHM/OiBib29sZWFufSk6IFF1ZXJ5TWV0YWRhdGE7XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgQ29udGVudENoaWxkcmVuRmFjdG9yeSB7XG4gIChzZWxlY3RvcjogVHlwZSB8IHN0cmluZywge2Rlc2NlbmRhbnRzfT86IHtkZXNjZW5kYW50cz86IGJvb2xlYW59KTogYW55O1xuICBuZXcgKHNlbGVjdG9yOiBUeXBlIHwgc3RyaW5nLCB7ZGVzY2VuZGFudHN9Pzoge2Rlc2NlbmRhbnRzPzogYm9vbGVhbn0pOiBDb250ZW50Q2hpbGRyZW5NZXRhZGF0YTtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBDb250ZW50Q2hpbGRGYWN0b3J5IHtcbiAgKHNlbGVjdG9yOiBUeXBlIHwgc3RyaW5nKTogYW55O1xuICBuZXcgKHNlbGVjdG9yOiBUeXBlIHwgc3RyaW5nKTogQ29udGVudENoaWxkRmFjdG9yeTtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBWaWV3Q2hpbGRyZW5GYWN0b3J5IHtcbiAgKHNlbGVjdG9yOiBUeXBlIHwgc3RyaW5nKTogYW55O1xuICBuZXcgKHNlbGVjdG9yOiBUeXBlIHwgc3RyaW5nKTogVmlld0NoaWxkcmVuTWV0YWRhdGE7XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgVmlld0NoaWxkRmFjdG9yeSB7XG4gIChzZWxlY3RvcjogVHlwZSB8IHN0cmluZyk6IGFueTtcbiAgbmV3IChzZWxlY3RvcjogVHlwZSB8IHN0cmluZyk6IFZpZXdDaGlsZEZhY3Rvcnk7XG59XG5cblxuLyoqXG4gKiB7QGxpbmsgUGlwZU1ldGFkYXRhfSBmYWN0b3J5IGZvciBjcmVhdGluZyBkZWNvcmF0b3JzLlxuICpcbiAqICMjIyBFeGFtcGxlIGFzIFR5cGVTY3JpcHQgRGVjb3JhdG9yXG4gKlxuICogYGBgXG4gKiBpbXBvcnQge1BpcGV9IGZyb20gXCJhbmd1bGFyMi9hbmd1bGFyMlwiO1xuICpcbiAqIEBQaXBlKHsuLi59KVxuICogY2xhc3MgTXlQaXBlIHtcbiAqICAgY29uc3RydWN0b3IoKSB7XG4gKiAgICAgLi4uXG4gKiAgIH1cbiAqXG4gKiAgIHRyYW5zZm9ybSh2LCBhcmdzKSB7fVxuICogfVxuICogYGBgXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgUGlwZUZhY3Rvcnkge1xuICAob2JqOiB7bmFtZTogc3RyaW5nLCBwdXJlPzogYm9vbGVhbn0pOiBhbnk7XG4gIG5ldyAob2JqOiB7bmFtZTogc3RyaW5nLCBwdXJlPzogYm9vbGVhbn0pOiBhbnk7XG59XG5cbi8qKlxuICoge0BsaW5rIElucHV0TWV0YWRhdGF9IGZhY3RvcnkgZm9yIGNyZWF0aW5nIGRlY29yYXRvcnMuXG4gKlxuICogU2VlIHtAbGluayBJbnB1dE1ldGFkYXRhfS5cbiAqL1xuZXhwb3J0IGludGVyZmFjZSBJbnB1dEZhY3Rvcnkge1xuICAoYmluZGluZ1Byb3BlcnR5TmFtZT86IHN0cmluZyk6IGFueTtcbiAgbmV3IChiaW5kaW5nUHJvcGVydHlOYW1lPzogc3RyaW5nKTogYW55O1xufVxuXG4vKipcbiAqIHtAbGluayBPdXRwdXRNZXRhZGF0YX0gZmFjdG9yeSBmb3IgY3JlYXRpbmcgZGVjb3JhdG9ycy5cbiAqXG4gKiBTZWUge0BsaW5rIE91dHB1dE1ldGFkYXRhfS5cbiAqL1xuZXhwb3J0IGludGVyZmFjZSBPdXRwdXRGYWN0b3J5IHtcbiAgKGJpbmRpbmdQcm9wZXJ0eU5hbWU/OiBzdHJpbmcpOiBhbnk7XG4gIG5ldyAoYmluZGluZ1Byb3BlcnR5TmFtZT86IHN0cmluZyk6IGFueTtcbn1cblxuLyoqXG4gKiB7QGxpbmsgSG9zdEJpbmRpbmdNZXRhZGF0YX0gZmFjdG9yeSBmdW5jdGlvbi5cbiAqL1xuZXhwb3J0IGludGVyZmFjZSBIb3N0QmluZGluZ0ZhY3Rvcnkge1xuICAoaG9zdFByb3BlcnR5TmFtZT86IHN0cmluZyk6IGFueTtcbiAgbmV3IChob3N0UHJvcGVydHlOYW1lPzogc3RyaW5nKTogYW55O1xufVxuXG4vKipcbiAqIHtAbGluayBIb3N0TGlzdGVuZXJNZXRhZGF0YX0gZmFjdG9yeSBmdW5jdGlvbi5cbiAqL1xuZXhwb3J0IGludGVyZmFjZSBIb3N0TGlzdGVuZXJGYWN0b3J5IHtcbiAgKGV2ZW50TmFtZTogc3RyaW5nLCBhcmdzPzogc3RyaW5nW10pOiBhbnk7XG4gIG5ldyAoZXZlbnROYW1lOiBzdHJpbmcsIGFyZ3M/OiBzdHJpbmdbXSk6IGFueTtcbn1cblxuLy8gVE9ETyhhbGV4ZWFnbGUpOiByZW1vdmUgdGhlIGR1cGxpY2F0aW9uIG9mIHRoaXMgZG9jLiBJdCBpcyBjb3BpZWQgZnJvbSBDb21wb25lbnRNZXRhZGF0YS5cbi8qKlxuICogRGVjbGFyZSByZXVzYWJsZSBVSSBidWlsZGluZyBibG9ja3MgZm9yIGFuIGFwcGxpY2F0aW9uLlxuICpcbiAqIEVhY2ggQW5ndWxhciBjb21wb25lbnQgcmVxdWlyZXMgYSBzaW5nbGUgYEBDb21wb25lbnRgIGFuZCBhdCBsZWFzdCBvbmUgYEBWaWV3YCBhbm5vdGF0aW9uLiBUaGVcbiAqIGBAQ29tcG9uZW50YFxuICogYW5ub3RhdGlvbiBzcGVjaWZpZXMgd2hlbiBhIGNvbXBvbmVudCBpcyBpbnN0YW50aWF0ZWQsIGFuZCB3aGljaCBwcm9wZXJ0aWVzIGFuZCBob3N0TGlzdGVuZXJzIGl0XG4gKiBiaW5kcyB0by5cbiAqXG4gKiBXaGVuIGEgY29tcG9uZW50IGlzIGluc3RhbnRpYXRlZCwgQW5ndWxhclxuICogLSBjcmVhdGVzIGEgc2hhZG93IERPTSBmb3IgdGhlIGNvbXBvbmVudC5cbiAqIC0gbG9hZHMgdGhlIHNlbGVjdGVkIHRlbXBsYXRlIGludG8gdGhlIHNoYWRvdyBET00uXG4gKiAtIGNyZWF0ZXMgYWxsIHRoZSBpbmplY3RhYmxlIG9iamVjdHMgY29uZmlndXJlZCB3aXRoIGBwcm92aWRlcnNgIGFuZCBgdmlld1Byb3ZpZGVyc2AuXG4gKlxuICogQWxsIHRlbXBsYXRlIGV4cHJlc3Npb25zIGFuZCBzdGF0ZW1lbnRzIGFyZSB0aGVuIGV2YWx1YXRlZCBhZ2FpbnN0IHRoZSBjb21wb25lbnQgaW5zdGFuY2UuXG4gKlxuICogRm9yIGRldGFpbHMgb24gdGhlIGBAVmlld2AgYW5ub3RhdGlvbiwgc2VlIHtAbGluayBWaWV3TWV0YWRhdGF9LlxuICpcbiAqICMjIExpZmVjeWNsZSBob29rc1xuICpcbiAqIFdoZW4gdGhlIGNvbXBvbmVudCBjbGFzcyBpbXBsZW1lbnRzIHNvbWUge0BsaW5rIGFuZ3VsYXIyL2xpZmVjeWNsZV9ob29rc30gdGhlIGNhbGxiYWNrcyBhcmVcbiAqIGNhbGxlZCBieSB0aGUgY2hhbmdlIGRldGVjdGlvbiBhdCBkZWZpbmVkIHBvaW50cyBpbiB0aW1lIGR1cmluZyB0aGUgbGlmZSBvZiB0aGUgY29tcG9uZW50LlxuICpcbiAqICMjIyBFeGFtcGxlXG4gKlxuICogYGBgXG4gKiBAQ29tcG9uZW50KHtcbiAqICAgc2VsZWN0b3I6ICdncmVldCcsXG4gKiAgIHRlbXBsYXRlOiAnSGVsbG8ge3tuYW1lfX0hJ1xuICogfSlcbiAqIGNsYXNzIEdyZWV0IHtcbiAqICAgbmFtZTogc3RyaW5nO1xuICpcbiAqICAgY29uc3RydWN0b3IoKSB7XG4gKiAgICAgdGhpcy5uYW1lID0gJ1dvcmxkJztcbiAqICAgfVxuICogfVxuICogYGBgXG4gKlxuICovXG5leHBvcnQgdmFyIENvbXBvbmVudDogQ29tcG9uZW50RmFjdG9yeSA9XG4gICAgPENvbXBvbmVudEZhY3Rvcnk+bWFrZURlY29yYXRvcihDb21wb25lbnRNZXRhZGF0YSwgKGZuOiBhbnkpID0+IGZuLlZpZXcgPSBWaWV3KTtcblxuLy8gVE9ETyhhbGV4ZWFnbGUpOiByZW1vdmUgdGhlIGR1cGxpY2F0aW9uIG9mIHRoaXMgZG9jLiBJdCBpcyBjb3BpZWQgZnJvbSBEaXJlY3RpdmVNZXRhZGF0YS5cbi8qKlxuICogRGlyZWN0aXZlcyBhbGxvdyB5b3UgdG8gYXR0YWNoIGJlaGF2aW9yIHRvIGVsZW1lbnRzIGluIHRoZSBET00uXG4gKlxuICoge0BsaW5rIERpcmVjdGl2ZU1ldGFkYXRhfXMgd2l0aCBhbiBlbWJlZGRlZCB2aWV3IGFyZSBjYWxsZWQge0BsaW5rIENvbXBvbmVudE1ldGFkYXRhfXMuXG4gKlxuICogQSBkaXJlY3RpdmUgY29uc2lzdHMgb2YgYSBzaW5nbGUgZGlyZWN0aXZlIGFubm90YXRpb24gYW5kIGEgY29udHJvbGxlciBjbGFzcy4gV2hlbiB0aGVcbiAqIGRpcmVjdGl2ZSdzIGBzZWxlY3RvcmAgbWF0Y2hlc1xuICogZWxlbWVudHMgaW4gdGhlIERPTSwgdGhlIGZvbGxvd2luZyBzdGVwcyBvY2N1cjpcbiAqXG4gKiAxLiBGb3IgZWFjaCBkaXJlY3RpdmUsIHRoZSBgRWxlbWVudEluamVjdG9yYCBhdHRlbXB0cyB0byByZXNvbHZlIHRoZSBkaXJlY3RpdmUncyBjb25zdHJ1Y3RvclxuICogYXJndW1lbnRzLlxuICogMi4gQW5ndWxhciBpbnN0YW50aWF0ZXMgZGlyZWN0aXZlcyBmb3IgZWFjaCBtYXRjaGVkIGVsZW1lbnQgdXNpbmcgYEVsZW1lbnRJbmplY3RvcmAgaW4gYVxuICogZGVwdGgtZmlyc3Qgb3JkZXIsXG4gKiAgICBhcyBkZWNsYXJlZCBpbiB0aGUgSFRNTC5cbiAqXG4gKiAjIyBVbmRlcnN0YW5kaW5nIEhvdyBJbmplY3Rpb24gV29ya3NcbiAqXG4gKiBUaGVyZSBhcmUgdGhyZWUgc3RhZ2VzIG9mIGluamVjdGlvbiByZXNvbHV0aW9uLlxuICogLSAqUHJlLWV4aXN0aW5nIEluamVjdG9ycyo6XG4gKiAgIC0gVGhlIHRlcm1pbmFsIHtAbGluayBJbmplY3Rvcn0gY2Fubm90IHJlc29sdmUgZGVwZW5kZW5jaWVzLiBJdCBlaXRoZXIgdGhyb3dzIGFuIGVycm9yIG9yLCBpZlxuICogdGhlIGRlcGVuZGVuY3kgd2FzXG4gKiAgICAgc3BlY2lmaWVkIGFzIGBAT3B0aW9uYWxgLCByZXR1cm5zIGBudWxsYC5cbiAqICAgLSBUaGUgcGxhdGZvcm0gaW5qZWN0b3IgcmVzb2x2ZXMgYnJvd3NlciBzaW5nbGV0b24gcmVzb3VyY2VzLCBzdWNoIGFzOiBjb29raWVzLCB0aXRsZSxcbiAqIGxvY2F0aW9uLCBhbmQgb3RoZXJzLlxuICogLSAqQ29tcG9uZW50IEluamVjdG9ycyo6IEVhY2ggY29tcG9uZW50IGluc3RhbmNlIGhhcyBpdHMgb3duIHtAbGluayBJbmplY3Rvcn0sIGFuZCB0aGV5IGZvbGxvd1xuICogdGhlIHNhbWUgcGFyZW50LWNoaWxkIGhpZXJhcmNoeVxuICogICAgIGFzIHRoZSBjb21wb25lbnQgaW5zdGFuY2VzIGluIHRoZSBET00uXG4gKiAtICpFbGVtZW50IEluamVjdG9ycyo6IEVhY2ggY29tcG9uZW50IGluc3RhbmNlIGhhcyBhIFNoYWRvdyBET00uIFdpdGhpbiB0aGUgU2hhZG93IERPTSBlYWNoXG4gKiBlbGVtZW50IGhhcyBhbiBgRWxlbWVudEluamVjdG9yYFxuICogICAgIHdoaWNoIGZvbGxvdyB0aGUgc2FtZSBwYXJlbnQtY2hpbGQgaGllcmFyY2h5IGFzIHRoZSBET00gZWxlbWVudHMgdGhlbXNlbHZlcy5cbiAqXG4gKiBXaGVuIGEgdGVtcGxhdGUgaXMgaW5zdGFudGlhdGVkLCBpdCBhbHNvIG11c3QgaW5zdGFudGlhdGUgdGhlIGNvcnJlc3BvbmRpbmcgZGlyZWN0aXZlcyBpbiBhXG4gKiBkZXB0aC1maXJzdCBvcmRlci4gVGhlXG4gKiBjdXJyZW50IGBFbGVtZW50SW5qZWN0b3JgIHJlc29sdmVzIHRoZSBjb25zdHJ1Y3RvciBkZXBlbmRlbmNpZXMgZm9yIGVhY2ggZGlyZWN0aXZlLlxuICpcbiAqIEFuZ3VsYXIgdGhlbiByZXNvbHZlcyBkZXBlbmRlbmNpZXMgYXMgZm9sbG93cywgYWNjb3JkaW5nIHRvIHRoZSBvcmRlciBpbiB3aGljaCB0aGV5IGFwcGVhciBpbiB0aGVcbiAqIHtAbGluayBWaWV3TWV0YWRhdGF9OlxuICpcbiAqIDEuIERlcGVuZGVuY2llcyBvbiB0aGUgY3VycmVudCBlbGVtZW50XG4gKiAyLiBEZXBlbmRlbmNpZXMgb24gZWxlbWVudCBpbmplY3RvcnMgYW5kIHRoZWlyIHBhcmVudHMgdW50aWwgaXQgZW5jb3VudGVycyBhIFNoYWRvdyBET00gYm91bmRhcnlcbiAqIDMuIERlcGVuZGVuY2llcyBvbiBjb21wb25lbnQgaW5qZWN0b3JzIGFuZCB0aGVpciBwYXJlbnRzIHVudGlsIGl0IGVuY291bnRlcnMgdGhlIHJvb3QgY29tcG9uZW50XG4gKiA0LiBEZXBlbmRlbmNpZXMgb24gcHJlLWV4aXN0aW5nIGluamVjdG9yc1xuICpcbiAqXG4gKiBUaGUgYEVsZW1lbnRJbmplY3RvcmAgY2FuIGluamVjdCBvdGhlciBkaXJlY3RpdmVzLCBlbGVtZW50LXNwZWNpZmljIHNwZWNpYWwgb2JqZWN0cywgb3IgaXQgY2FuXG4gKiBkZWxlZ2F0ZSB0byB0aGUgcGFyZW50XG4gKiBpbmplY3Rvci5cbiAqXG4gKiBUbyBpbmplY3Qgb3RoZXIgZGlyZWN0aXZlcywgZGVjbGFyZSB0aGUgY29uc3RydWN0b3IgcGFyYW1ldGVyIGFzOlxuICogLSBgZGlyZWN0aXZlOkRpcmVjdGl2ZVR5cGVgOiBhIGRpcmVjdGl2ZSBvbiB0aGUgY3VycmVudCBlbGVtZW50IG9ubHlcbiAqIC0gYEBIb3N0KCkgZGlyZWN0aXZlOkRpcmVjdGl2ZVR5cGVgOiBhbnkgZGlyZWN0aXZlIHRoYXQgbWF0Y2hlcyB0aGUgdHlwZSBiZXR3ZWVuIHRoZSBjdXJyZW50XG4gKiBlbGVtZW50IGFuZCB0aGVcbiAqICAgIFNoYWRvdyBET00gcm9vdC5cbiAqIC0gYEBRdWVyeShEaXJlY3RpdmVUeXBlKSBxdWVyeTpRdWVyeUxpc3Q8RGlyZWN0aXZlVHlwZT5gOiBBIGxpdmUgY29sbGVjdGlvbiBvZiBkaXJlY3QgY2hpbGRcbiAqIGRpcmVjdGl2ZXMuXG4gKiAtIGBAUXVlcnlEZXNjZW5kYW50cyhEaXJlY3RpdmVUeXBlKSBxdWVyeTpRdWVyeUxpc3Q8RGlyZWN0aXZlVHlwZT5gOiBBIGxpdmUgY29sbGVjdGlvbiBvZiBhbnlcbiAqIGNoaWxkIGRpcmVjdGl2ZXMuXG4gKlxuICogVG8gaW5qZWN0IGVsZW1lbnQtc3BlY2lmaWMgc3BlY2lhbCBvYmplY3RzLCBkZWNsYXJlIHRoZSBjb25zdHJ1Y3RvciBwYXJhbWV0ZXIgYXM6XG4gKiAtIGBlbGVtZW50OiBFbGVtZW50UmVmYCB0byBvYnRhaW4gYSByZWZlcmVuY2UgdG8gbG9naWNhbCBlbGVtZW50IGluIHRoZSB2aWV3LlxuICogLSBgdmlld0NvbnRhaW5lcjogVmlld0NvbnRhaW5lclJlZmAgdG8gY29udHJvbCBjaGlsZCB0ZW1wbGF0ZSBpbnN0YW50aWF0aW9uLCBmb3JcbiAqIHtAbGluayBEaXJlY3RpdmVNZXRhZGF0YX0gZGlyZWN0aXZlcyBvbmx5XG4gKiAtIGBiaW5kaW5nUHJvcGFnYXRpb246IEJpbmRpbmdQcm9wYWdhdGlvbmAgdG8gY29udHJvbCBjaGFuZ2UgZGV0ZWN0aW9uIGluIGEgbW9yZSBncmFudWxhciB3YXkuXG4gKlxuICogIyMjIEV4YW1wbGVcbiAqXG4gKiBUaGUgZm9sbG93aW5nIGV4YW1wbGUgZGVtb25zdHJhdGVzIGhvdyBkZXBlbmRlbmN5IGluamVjdGlvbiByZXNvbHZlcyBjb25zdHJ1Y3RvciBhcmd1bWVudHMgaW5cbiAqIHByYWN0aWNlLlxuICpcbiAqXG4gKiBBc3N1bWUgdGhpcyBIVE1MIHRlbXBsYXRlOlxuICpcbiAqIGBgYFxuICogPGRpdiBkZXBlbmRlbmN5PVwiMVwiPlxuICogICA8ZGl2IGRlcGVuZGVuY3k9XCIyXCI+XG4gKiAgICAgPGRpdiBkZXBlbmRlbmN5PVwiM1wiIG15LWRpcmVjdGl2ZT5cbiAqICAgICAgIDxkaXYgZGVwZW5kZW5jeT1cIjRcIj5cbiAqICAgICAgICAgPGRpdiBkZXBlbmRlbmN5PVwiNVwiPjwvZGl2PlxuICogICAgICAgPC9kaXY+XG4gKiAgICAgICA8ZGl2IGRlcGVuZGVuY3k9XCI2XCI+PC9kaXY+XG4gKiAgICAgPC9kaXY+XG4gKiAgIDwvZGl2PlxuICogPC9kaXY+XG4gKiBgYGBcbiAqXG4gKiBXaXRoIHRoZSBmb2xsb3dpbmcgYGRlcGVuZGVuY3lgIGRlY29yYXRvciBhbmQgYFNvbWVTZXJ2aWNlYCBpbmplY3RhYmxlIGNsYXNzLlxuICpcbiAqIGBgYFxuICogQEluamVjdGFibGUoKVxuICogY2xhc3MgU29tZVNlcnZpY2Uge1xuICogfVxuICpcbiAqIEBEaXJlY3RpdmUoe1xuICogICBzZWxlY3RvcjogJ1tkZXBlbmRlbmN5XScsXG4gKiAgIGlucHV0czogW1xuICogICAgICdpZDogZGVwZW5kZW5jeSdcbiAqICAgXVxuICogfSlcbiAqIGNsYXNzIERlcGVuZGVuY3kge1xuICogICBpZDpzdHJpbmc7XG4gKiB9XG4gKiBgYGBcbiAqXG4gKiBMZXQncyBzdGVwIHRocm91Z2ggdGhlIGRpZmZlcmVudCB3YXlzIGluIHdoaWNoIGBNeURpcmVjdGl2ZWAgY291bGQgYmUgZGVjbGFyZWQuLi5cbiAqXG4gKlxuICogIyMjIE5vIGluamVjdGlvblxuICpcbiAqIEhlcmUgdGhlIGNvbnN0cnVjdG9yIGlzIGRlY2xhcmVkIHdpdGggbm8gYXJndW1lbnRzLCB0aGVyZWZvcmUgbm90aGluZyBpcyBpbmplY3RlZCBpbnRvXG4gKiBgTXlEaXJlY3RpdmVgLlxuICpcbiAqIGBgYFxuICogQERpcmVjdGl2ZSh7IHNlbGVjdG9yOiAnW215LWRpcmVjdGl2ZV0nIH0pXG4gKiBjbGFzcyBNeURpcmVjdGl2ZSB7XG4gKiAgIGNvbnN0cnVjdG9yKCkge1xuICogICB9XG4gKiB9XG4gKiBgYGBcbiAqXG4gKiBUaGlzIGRpcmVjdGl2ZSB3b3VsZCBiZSBpbnN0YW50aWF0ZWQgd2l0aCBubyBkZXBlbmRlbmNpZXMuXG4gKlxuICpcbiAqICMjIyBDb21wb25lbnQtbGV2ZWwgaW5qZWN0aW9uXG4gKlxuICogRGlyZWN0aXZlcyBjYW4gaW5qZWN0IGFueSBpbmplY3RhYmxlIGluc3RhbmNlIGZyb20gdGhlIGNsb3Nlc3QgY29tcG9uZW50IGluamVjdG9yIG9yIGFueSBvZiBpdHNcbiAqIHBhcmVudHMuXG4gKlxuICogSGVyZSwgdGhlIGNvbnN0cnVjdG9yIGRlY2xhcmVzIGEgcGFyYW1ldGVyLCBgc29tZVNlcnZpY2VgLCBhbmQgaW5qZWN0cyB0aGUgYFNvbWVTZXJ2aWNlYCB0eXBlXG4gKiBmcm9tIHRoZSBwYXJlbnRcbiAqIGNvbXBvbmVudCdzIGluamVjdG9yLlxuICogYGBgXG4gKiBARGlyZWN0aXZlKHsgc2VsZWN0b3I6ICdbbXktZGlyZWN0aXZlXScgfSlcbiAqIGNsYXNzIE15RGlyZWN0aXZlIHtcbiAqICAgY29uc3RydWN0b3Ioc29tZVNlcnZpY2U6IFNvbWVTZXJ2aWNlKSB7XG4gKiAgIH1cbiAqIH1cbiAqIGBgYFxuICpcbiAqIFRoaXMgZGlyZWN0aXZlIHdvdWxkIGJlIGluc3RhbnRpYXRlZCB3aXRoIGEgZGVwZW5kZW5jeSBvbiBgU29tZVNlcnZpY2VgLlxuICpcbiAqXG4gKiAjIyMgSW5qZWN0aW5nIGEgZGlyZWN0aXZlIGZyb20gdGhlIGN1cnJlbnQgZWxlbWVudFxuICpcbiAqIERpcmVjdGl2ZXMgY2FuIGluamVjdCBvdGhlciBkaXJlY3RpdmVzIGRlY2xhcmVkIG9uIHRoZSBjdXJyZW50IGVsZW1lbnQuXG4gKlxuICogYGBgXG4gKiBARGlyZWN0aXZlKHsgc2VsZWN0b3I6ICdbbXktZGlyZWN0aXZlXScgfSlcbiAqIGNsYXNzIE15RGlyZWN0aXZlIHtcbiAqICAgY29uc3RydWN0b3IoZGVwZW5kZW5jeTogRGVwZW5kZW5jeSkge1xuICogICAgIGV4cGVjdChkZXBlbmRlbmN5LmlkKS50b0VxdWFsKDMpO1xuICogICB9XG4gKiB9XG4gKiBgYGBcbiAqIFRoaXMgZGlyZWN0aXZlIHdvdWxkIGJlIGluc3RhbnRpYXRlZCB3aXRoIGBEZXBlbmRlbmN5YCBkZWNsYXJlZCBhdCB0aGUgc2FtZSBlbGVtZW50LCBpbiB0aGlzIGNhc2VcbiAqIGBkZXBlbmRlbmN5PVwiM1wiYC5cbiAqXG4gKiAjIyMgSW5qZWN0aW5nIGEgZGlyZWN0aXZlIGZyb20gYW55IGFuY2VzdG9yIGVsZW1lbnRzXG4gKlxuICogRGlyZWN0aXZlcyBjYW4gaW5qZWN0IG90aGVyIGRpcmVjdGl2ZXMgZGVjbGFyZWQgb24gYW55IGFuY2VzdG9yIGVsZW1lbnQgKGluIHRoZSBjdXJyZW50IFNoYWRvd1xuICogRE9NKSwgaS5lLiBvbiB0aGUgY3VycmVudCBlbGVtZW50LCB0aGVcbiAqIHBhcmVudCBlbGVtZW50LCBvciBpdHMgcGFyZW50cy5cbiAqIGBgYFxuICogQERpcmVjdGl2ZSh7IHNlbGVjdG9yOiAnW215LWRpcmVjdGl2ZV0nIH0pXG4gKiBjbGFzcyBNeURpcmVjdGl2ZSB7XG4gKiAgIGNvbnN0cnVjdG9yKEBIb3N0KCkgZGVwZW5kZW5jeTogRGVwZW5kZW5jeSkge1xuICogICAgIGV4cGVjdChkZXBlbmRlbmN5LmlkKS50b0VxdWFsKDIpO1xuICogICB9XG4gKiB9XG4gKiBgYGBcbiAqXG4gKiBgQEhvc3RgIGNoZWNrcyB0aGUgY3VycmVudCBlbGVtZW50LCB0aGUgcGFyZW50LCBhcyB3ZWxsIGFzIGl0cyBwYXJlbnRzIHJlY3Vyc2l2ZWx5LiBJZlxuICogYGRlcGVuZGVuY3k9XCIyXCJgIGRpZG4ndFxuICogZXhpc3Qgb24gdGhlIGRpcmVjdCBwYXJlbnQsIHRoaXMgaW5qZWN0aW9uIHdvdWxkXG4gKiBoYXZlIHJldHVybmVkXG4gKiBgZGVwZW5kZW5jeT1cIjFcImAuXG4gKlxuICpcbiAqICMjIyBJbmplY3RpbmcgYSBsaXZlIGNvbGxlY3Rpb24gb2YgZGlyZWN0IGNoaWxkIGRpcmVjdGl2ZXNcbiAqXG4gKlxuICogQSBkaXJlY3RpdmUgY2FuIGFsc28gcXVlcnkgZm9yIG90aGVyIGNoaWxkIGRpcmVjdGl2ZXMuIFNpbmNlIHBhcmVudCBkaXJlY3RpdmVzIGFyZSBpbnN0YW50aWF0ZWRcbiAqIGJlZm9yZSBjaGlsZCBkaXJlY3RpdmVzLCBhIGRpcmVjdGl2ZSBjYW4ndCBzaW1wbHkgaW5qZWN0IHRoZSBsaXN0IG9mIGNoaWxkIGRpcmVjdGl2ZXMuIEluc3RlYWQsXG4gKiB0aGUgZGlyZWN0aXZlIGluamVjdHMgYSB7QGxpbmsgUXVlcnlMaXN0fSwgd2hpY2ggdXBkYXRlcyBpdHMgY29udGVudHMgYXMgY2hpbGRyZW4gYXJlIGFkZGVkLFxuICogcmVtb3ZlZCwgb3IgbW92ZWQgYnkgYSBkaXJlY3RpdmUgdGhhdCB1c2VzIGEge0BsaW5rIFZpZXdDb250YWluZXJSZWZ9IHN1Y2ggYXMgYSBgbmctZm9yYCwgYW5cbiAqIGBuZy1pZmAsIG9yIGFuIGBuZy1zd2l0Y2hgLlxuICpcbiAqIGBgYFxuICogQERpcmVjdGl2ZSh7IHNlbGVjdG9yOiAnW215LWRpcmVjdGl2ZV0nIH0pXG4gKiBjbGFzcyBNeURpcmVjdGl2ZSB7XG4gKiAgIGNvbnN0cnVjdG9yKEBRdWVyeShEZXBlbmRlbmN5KSBkZXBlbmRlbmNpZXM6UXVlcnlMaXN0PERlcGVuZGVuY3k+KSB7XG4gKiAgIH1cbiAqIH1cbiAqIGBgYFxuICpcbiAqIFRoaXMgZGlyZWN0aXZlIHdvdWxkIGJlIGluc3RhbnRpYXRlZCB3aXRoIGEge0BsaW5rIFF1ZXJ5TGlzdH0gd2hpY2ggY29udGFpbnMgYERlcGVuZGVuY3lgIDQgYW5kXG4gKiA2LiBIZXJlLCBgRGVwZW5kZW5jeWAgNSB3b3VsZCBub3QgYmUgaW5jbHVkZWQsIGJlY2F1c2UgaXQgaXMgbm90IGEgZGlyZWN0IGNoaWxkLlxuICpcbiAqICMjIyBJbmplY3RpbmcgYSBsaXZlIGNvbGxlY3Rpb24gb2YgZGVzY2VuZGFudCBkaXJlY3RpdmVzXG4gKlxuICogQnkgcGFzc2luZyB0aGUgZGVzY2VuZGFudCBmbGFnIHRvIGBAUXVlcnlgIGFib3ZlLCB3ZSBjYW4gaW5jbHVkZSB0aGUgY2hpbGRyZW4gb2YgdGhlIGNoaWxkXG4gKiBlbGVtZW50cy5cbiAqXG4gKiBgYGBcbiAqIEBEaXJlY3RpdmUoeyBzZWxlY3RvcjogJ1tteS1kaXJlY3RpdmVdJyB9KVxuICogY2xhc3MgTXlEaXJlY3RpdmUge1xuICogICBjb25zdHJ1Y3RvcihAUXVlcnkoRGVwZW5kZW5jeSwge2Rlc2NlbmRhbnRzOiB0cnVlfSkgZGVwZW5kZW5jaWVzOlF1ZXJ5TGlzdDxEZXBlbmRlbmN5Pikge1xuICogICB9XG4gKiB9XG4gKiBgYGBcbiAqXG4gKiBUaGlzIGRpcmVjdGl2ZSB3b3VsZCBiZSBpbnN0YW50aWF0ZWQgd2l0aCBhIFF1ZXJ5IHdoaWNoIHdvdWxkIGNvbnRhaW4gYERlcGVuZGVuY3lgIDQsIDUgYW5kIDYuXG4gKlxuICogIyMjIE9wdGlvbmFsIGluamVjdGlvblxuICpcbiAqIFRoZSBub3JtYWwgYmVoYXZpb3Igb2YgZGlyZWN0aXZlcyBpcyB0byByZXR1cm4gYW4gZXJyb3Igd2hlbiBhIHNwZWNpZmllZCBkZXBlbmRlbmN5IGNhbm5vdCBiZVxuICogcmVzb2x2ZWQuIElmIHlvdVxuICogd291bGQgbGlrZSB0byBpbmplY3QgYG51bGxgIG9uIHVucmVzb2x2ZWQgZGVwZW5kZW5jeSBpbnN0ZWFkLCB5b3UgY2FuIGFubm90YXRlIHRoYXQgZGVwZW5kZW5jeVxuICogd2l0aCBgQE9wdGlvbmFsKClgLlxuICogVGhpcyBleHBsaWNpdGx5IHBlcm1pdHMgdGhlIGF1dGhvciBvZiBhIHRlbXBsYXRlIHRvIHRyZWF0IHNvbWUgb2YgdGhlIHN1cnJvdW5kaW5nIGRpcmVjdGl2ZXMgYXNcbiAqIG9wdGlvbmFsLlxuICpcbiAqIGBgYFxuICogQERpcmVjdGl2ZSh7IHNlbGVjdG9yOiAnW215LWRpcmVjdGl2ZV0nIH0pXG4gKiBjbGFzcyBNeURpcmVjdGl2ZSB7XG4gKiAgIGNvbnN0cnVjdG9yKEBPcHRpb25hbCgpIGRlcGVuZGVuY3k6RGVwZW5kZW5jeSkge1xuICogICB9XG4gKiB9XG4gKiBgYGBcbiAqXG4gKiBUaGlzIGRpcmVjdGl2ZSB3b3VsZCBiZSBpbnN0YW50aWF0ZWQgd2l0aCBhIGBEZXBlbmRlbmN5YCBkaXJlY3RpdmUgZm91bmQgb24gdGhlIGN1cnJlbnQgZWxlbWVudC5cbiAqIElmIG5vbmUgY2FuIGJlXG4gKiBmb3VuZCwgdGhlIGluamVjdG9yIHN1cHBsaWVzIGBudWxsYCBpbnN0ZWFkIG9mIHRocm93aW5nIGFuIGVycm9yLlxuICpcbiAqICMjIyBFeGFtcGxlXG4gKlxuICogSGVyZSB3ZSB1c2UgYSBkZWNvcmF0b3IgZGlyZWN0aXZlIHRvIHNpbXBseSBkZWZpbmUgYmFzaWMgdG9vbC10aXAgYmVoYXZpb3IuXG4gKlxuICogYGBgXG4gKiBARGlyZWN0aXZlKHtcbiAqICAgc2VsZWN0b3I6ICdbdG9vbHRpcF0nLFxuICogICBpbnB1dHM6IFtcbiAqICAgICAndGV4dDogdG9vbHRpcCdcbiAqICAgXSxcbiAqICAgaG9zdDoge1xuICogICAgICcobW91c2VlbnRlciknOiAnb25Nb3VzZUVudGVyKCknLFxuICogICAgICcobW91c2VsZWF2ZSknOiAnb25Nb3VzZUxlYXZlKCknXG4gKiAgIH1cbiAqIH0pXG4gKiBjbGFzcyBUb29sdGlwe1xuICogICB0ZXh0OnN0cmluZztcbiAqICAgb3ZlcmxheTpPdmVybGF5OyAvLyBOT1QgWUVUIElNUExFTUVOVEVEXG4gKiAgIG92ZXJsYXlNYW5hZ2VyOk92ZXJsYXlNYW5hZ2VyOyAvLyBOT1QgWUVUIElNUExFTUVOVEVEXG4gKlxuICogICBjb25zdHJ1Y3RvcihvdmVybGF5TWFuYWdlcjpPdmVybGF5TWFuYWdlcikge1xuICogICAgIHRoaXMub3ZlcmxheSA9IG92ZXJsYXk7XG4gKiAgIH1cbiAqXG4gKiAgIG9uTW91c2VFbnRlcigpIHtcbiAqICAgICAvLyBleGFjdCBzaWduYXR1cmUgdG8gYmUgZGV0ZXJtaW5lZFxuICogICAgIHRoaXMub3ZlcmxheSA9IHRoaXMub3ZlcmxheU1hbmFnZXIub3Blbih0ZXh0LCAuLi4pO1xuICogICB9XG4gKlxuICogICBvbk1vdXNlTGVhdmUoKSB7XG4gKiAgICAgdGhpcy5vdmVybGF5LmNsb3NlKCk7XG4gKiAgICAgdGhpcy5vdmVybGF5ID0gbnVsbDtcbiAqICAgfVxuICogfVxuICogYGBgXG4gKiBJbiBvdXIgSFRNTCB0ZW1wbGF0ZSwgd2UgY2FuIHRoZW4gYWRkIHRoaXMgYmVoYXZpb3IgdG8gYSBgPGRpdj5gIG9yIGFueSBvdGhlciBlbGVtZW50IHdpdGggdGhlXG4gKiBgdG9vbHRpcGAgc2VsZWN0b3IsXG4gKiBsaWtlIHNvOlxuICpcbiAqIGBgYFxuICogPGRpdiB0b29sdGlwPVwic29tZSB0ZXh0IGhlcmVcIj48L2Rpdj5cbiAqIGBgYFxuICpcbiAqIERpcmVjdGl2ZXMgY2FuIGFsc28gY29udHJvbCB0aGUgaW5zdGFudGlhdGlvbiwgZGVzdHJ1Y3Rpb24sIGFuZCBwb3NpdGlvbmluZyBvZiBpbmxpbmUgdGVtcGxhdGVcbiAqIGVsZW1lbnRzOlxuICpcbiAqIEEgZGlyZWN0aXZlIHVzZXMgYSB7QGxpbmsgVmlld0NvbnRhaW5lclJlZn0gdG8gaW5zdGFudGlhdGUsIGluc2VydCwgbW92ZSwgYW5kIGRlc3Ryb3kgdmlld3MgYXRcbiAqIHJ1bnRpbWUuXG4gKiBUaGUge0BsaW5rIFZpZXdDb250YWluZXJSZWZ9IGlzIGNyZWF0ZWQgYXMgYSByZXN1bHQgb2YgYDx0ZW1wbGF0ZT5gIGVsZW1lbnQsIGFuZCByZXByZXNlbnRzIGFcbiAqIGxvY2F0aW9uIGluIHRoZSBjdXJyZW50IHZpZXdcbiAqIHdoZXJlIHRoZXNlIGFjdGlvbnMgYXJlIHBlcmZvcm1lZC5cbiAqXG4gKiBWaWV3cyBhcmUgYWx3YXlzIGNyZWF0ZWQgYXMgY2hpbGRyZW4gb2YgdGhlIGN1cnJlbnQge0BsaW5rIFZpZXdNZXRhZGF0YX0sIGFuZCBhcyBzaWJsaW5ncyBvZiB0aGVcbiAqIGA8dGVtcGxhdGU+YCBlbGVtZW50LiBUaHVzIGFcbiAqIGRpcmVjdGl2ZSBpbiBhIGNoaWxkIHZpZXcgY2Fubm90IGluamVjdCB0aGUgZGlyZWN0aXZlIHRoYXQgY3JlYXRlZCBpdC5cbiAqXG4gKiBTaW5jZSBkaXJlY3RpdmVzIHRoYXQgY3JlYXRlIHZpZXdzIHZpYSBWaWV3Q29udGFpbmVycyBhcmUgY29tbW9uIGluIEFuZ3VsYXIsIGFuZCB1c2luZyB0aGUgZnVsbFxuICogYDx0ZW1wbGF0ZT5gIGVsZW1lbnQgc3ludGF4IGlzIHdvcmR5LCBBbmd1bGFyXG4gKiBhbHNvIHN1cHBvcnRzIGEgc2hvcnRoYW5kIG5vdGF0aW9uOiBgPGxpICpmb289XCJiYXJcIj5gIGFuZCBgPGxpIHRlbXBsYXRlPVwiZm9vOiBiYXJcIj5gIGFyZVxuICogZXF1aXZhbGVudC5cbiAqXG4gKiBUaHVzLFxuICpcbiAqIGBgYFxuICogPHVsPlxuICogICA8bGkgKmZvbz1cImJhclwiIHRpdGxlPVwidGV4dFwiPjwvbGk+XG4gKiA8L3VsPlxuICogYGBgXG4gKlxuICogRXhwYW5kcyBpbiB1c2UgdG86XG4gKlxuICogYGBgXG4gKiA8dWw+XG4gKiAgIDx0ZW1wbGF0ZSBbZm9vXT1cImJhclwiPlxuICogICAgIDxsaSB0aXRsZT1cInRleHRcIj48L2xpPlxuICogICA8L3RlbXBsYXRlPlxuICogPC91bD5cbiAqIGBgYFxuICpcbiAqIE5vdGljZSB0aGF0IGFsdGhvdWdoIHRoZSBzaG9ydGhhbmQgcGxhY2VzIGAqZm9vPVwiYmFyXCJgIHdpdGhpbiB0aGUgYDxsaT5gIGVsZW1lbnQsIHRoZSBiaW5kaW5nIGZvclxuICogdGhlIGRpcmVjdGl2ZVxuICogY29udHJvbGxlciBpcyBjb3JyZWN0bHkgaW5zdGFudGlhdGVkIG9uIHRoZSBgPHRlbXBsYXRlPmAgZWxlbWVudCByYXRoZXIgdGhhbiB0aGUgYDxsaT5gIGVsZW1lbnQuXG4gKlxuICogIyMgTGlmZWN5Y2xlIGhvb2tzXG4gKlxuICogV2hlbiB0aGUgZGlyZWN0aXZlIGNsYXNzIGltcGxlbWVudHMgc29tZSB7QGxpbmsgYW5ndWxhcjIvbGlmZWN5Y2xlX2hvb2tzfSB0aGUgY2FsbGJhY2tzIGFyZVxuICogY2FsbGVkIGJ5IHRoZSBjaGFuZ2UgZGV0ZWN0aW9uIGF0IGRlZmluZWQgcG9pbnRzIGluIHRpbWUgZHVyaW5nIHRoZSBsaWZlIG9mIHRoZSBkaXJlY3RpdmUuXG4gKlxuICogIyMjIEV4YW1wbGVcbiAqXG4gKiBMZXQncyBzdXBwb3NlIHdlIHdhbnQgdG8gaW1wbGVtZW50IHRoZSBgdW5sZXNzYCBiZWhhdmlvciwgdG8gY29uZGl0aW9uYWxseSBpbmNsdWRlIGEgdGVtcGxhdGUuXG4gKlxuICogSGVyZSBpcyBhIHNpbXBsZSBkaXJlY3RpdmUgdGhhdCB0cmlnZ2VycyBvbiBhbiBgdW5sZXNzYCBzZWxlY3RvcjpcbiAqXG4gKiBgYGBcbiAqIEBEaXJlY3RpdmUoe1xuICogICBzZWxlY3RvcjogJ1t1bmxlc3NdJyxcbiAqICAgaW5wdXRzOiBbJ3VubGVzcyddXG4gKiB9KVxuICogZXhwb3J0IGNsYXNzIFVubGVzcyB7XG4gKiAgIHZpZXdDb250YWluZXI6IFZpZXdDb250YWluZXJSZWY7XG4gKiAgIHRlbXBsYXRlUmVmOiBUZW1wbGF0ZVJlZjtcbiAqICAgcHJldkNvbmRpdGlvbjogYm9vbGVhbjtcbiAqXG4gKiAgIGNvbnN0cnVjdG9yKHZpZXdDb250YWluZXI6IFZpZXdDb250YWluZXJSZWYsIHRlbXBsYXRlUmVmOiBUZW1wbGF0ZVJlZikge1xuICogICAgIHRoaXMudmlld0NvbnRhaW5lciA9IHZpZXdDb250YWluZXI7XG4gKiAgICAgdGhpcy50ZW1wbGF0ZVJlZiA9IHRlbXBsYXRlUmVmO1xuICogICAgIHRoaXMucHJldkNvbmRpdGlvbiA9IG51bGw7XG4gKiAgIH1cbiAqXG4gKiAgIHNldCB1bmxlc3MobmV3Q29uZGl0aW9uKSB7XG4gKiAgICAgaWYgKG5ld0NvbmRpdGlvbiAmJiAoaXNCbGFuayh0aGlzLnByZXZDb25kaXRpb24pIHx8ICF0aGlzLnByZXZDb25kaXRpb24pKSB7XG4gKiAgICAgICB0aGlzLnByZXZDb25kaXRpb24gPSB0cnVlO1xuICogICAgICAgdGhpcy52aWV3Q29udGFpbmVyLmNsZWFyKCk7XG4gKiAgICAgfSBlbHNlIGlmICghbmV3Q29uZGl0aW9uICYmIChpc0JsYW5rKHRoaXMucHJldkNvbmRpdGlvbikgfHwgdGhpcy5wcmV2Q29uZGl0aW9uKSkge1xuICogICAgICAgdGhpcy5wcmV2Q29uZGl0aW9uID0gZmFsc2U7XG4gKiAgICAgICB0aGlzLnZpZXdDb250YWluZXIuY3JlYXRlKHRoaXMudGVtcGxhdGVSZWYpO1xuICogICAgIH1cbiAqICAgfVxuICogfVxuICogYGBgXG4gKlxuICogV2UgY2FuIHRoZW4gdXNlIHRoaXMgYHVubGVzc2Agc2VsZWN0b3IgaW4gYSB0ZW1wbGF0ZTpcbiAqIGBgYFxuICogPHVsPlxuICogICA8bGkgKnVubGVzcz1cImV4cHJcIj48L2xpPlxuICogPC91bD5cbiAqIGBgYFxuICpcbiAqIE9uY2UgdGhlIGRpcmVjdGl2ZSBpbnN0YW50aWF0ZXMgdGhlIGNoaWxkIHZpZXcsIHRoZSBzaG9ydGhhbmQgbm90YXRpb24gZm9yIHRoZSB0ZW1wbGF0ZSBleHBhbmRzXG4gKiBhbmQgdGhlIHJlc3VsdCBpczpcbiAqXG4gKiBgYGBcbiAqIDx1bD5cbiAqICAgPHRlbXBsYXRlIFt1bmxlc3NdPVwiZXhwXCI+XG4gKiAgICAgPGxpPjwvbGk+XG4gKiAgIDwvdGVtcGxhdGU+XG4gKiAgIDxsaT48L2xpPlxuICogPC91bD5cbiAqIGBgYFxuICpcbiAqIE5vdGUgYWxzbyB0aGF0IGFsdGhvdWdoIHRoZSBgPGxpPjwvbGk+YCB0ZW1wbGF0ZSBzdGlsbCBleGlzdHMgaW5zaWRlIHRoZSBgPHRlbXBsYXRlPjwvdGVtcGxhdGU+YCxcbiAqIHRoZSBpbnN0YW50aWF0ZWRcbiAqIHZpZXcgb2NjdXJzIG9uIHRoZSBzZWNvbmQgYDxsaT48L2xpPmAgd2hpY2ggaXMgYSBzaWJsaW5nIHRvIHRoZSBgPHRlbXBsYXRlPmAgZWxlbWVudC5cbiAqL1xuZXhwb3J0IHZhciBEaXJlY3RpdmU6IERpcmVjdGl2ZUZhY3RvcnkgPSA8RGlyZWN0aXZlRmFjdG9yeT5tYWtlRGVjb3JhdG9yKERpcmVjdGl2ZU1ldGFkYXRhKTtcblxuLy8gVE9ETyhhbGV4ZWFnbGUpOiByZW1vdmUgdGhlIGR1cGxpY2F0aW9uIG9mIHRoaXMgZG9jLiBJdCBpcyBjb3BpZWQgZnJvbSBWaWV3TWV0YWRhdGEuXG4vKipcbiAqIE1ldGFkYXRhIHByb3BlcnRpZXMgYXZhaWxhYmxlIGZvciBjb25maWd1cmluZyBWaWV3cy5cbiAqXG4gKiBFYWNoIEFuZ3VsYXIgY29tcG9uZW50IHJlcXVpcmVzIGEgc2luZ2xlIGBAQ29tcG9uZW50YCBhbmQgYXQgbGVhc3Qgb25lIGBAVmlld2AgYW5ub3RhdGlvbi4gVGhlXG4gKiBgQFZpZXdgIGFubm90YXRpb24gc3BlY2lmaWVzIHRoZSBIVE1MIHRlbXBsYXRlIHRvIHVzZSwgYW5kIGxpc3RzIHRoZSBkaXJlY3RpdmVzIHRoYXQgYXJlIGFjdGl2ZVxuICogd2l0aGluIHRoZSB0ZW1wbGF0ZS5cbiAqXG4gKiBXaGVuIGEgY29tcG9uZW50IGlzIGluc3RhbnRpYXRlZCwgdGhlIHRlbXBsYXRlIGlzIGxvYWRlZCBpbnRvIHRoZSBjb21wb25lbnQncyBzaGFkb3cgcm9vdCwgYW5kXG4gKiB0aGUgZXhwcmVzc2lvbnMgYW5kIHN0YXRlbWVudHMgaW4gdGhlIHRlbXBsYXRlIGFyZSBldmFsdWF0ZWQgYWdhaW5zdCB0aGUgY29tcG9uZW50LlxuICpcbiAqIEZvciBkZXRhaWxzIG9uIHRoZSBgQENvbXBvbmVudGAgYW5ub3RhdGlvbiwgc2VlIHtAbGluayBDb21wb25lbnRNZXRhZGF0YX0uXG4gKlxuICogIyMjIEV4YW1wbGVcbiAqXG4gKiBgYGBcbiAqIEBDb21wb25lbnQoe1xuICogICBzZWxlY3RvcjogJ2dyZWV0JyxcbiAqICAgdGVtcGxhdGU6ICdIZWxsbyB7e25hbWV9fSEnLFxuICogICBkaXJlY3RpdmVzOiBbR3JlZXRVc2VyLCBCb2xkXVxuICogfSlcbiAqIGNsYXNzIEdyZWV0IHtcbiAqICAgbmFtZTogc3RyaW5nO1xuICpcbiAqICAgY29uc3RydWN0b3IoKSB7XG4gKiAgICAgdGhpcy5uYW1lID0gJ1dvcmxkJztcbiAqICAgfVxuICogfVxuICogYGBgXG4gKi9cbmV4cG9ydCB2YXIgVmlldzogVmlld0ZhY3RvcnkgPVxuICAgIDxWaWV3RmFjdG9yeT5tYWtlRGVjb3JhdG9yKFZpZXdNZXRhZGF0YSwgKGZuOiBhbnkpID0+IGZuLlZpZXcgPSBWaWV3KTtcblxuLy8gVE9ETyhhbGV4ZWFnbGUpOiByZW1vdmUgdGhlIGR1cGxpY2F0aW9uIG9mIHRoaXMgZG9jLiBJdCBpcyBjb3BpZWQgZnJvbSBBdHRyaWJ1dGVNZXRhZGF0YS5cbi8qKlxuICogTWV0YWRhdGEgcHJvcGVydGllcyBhdmFpbGFibGUgZm9yIGNvbmZpZ3VyaW5nIFZpZXdzLlxuICpcbiAqIEVhY2ggQW5ndWxhciBjb21wb25lbnQgcmVxdWlyZXMgYSBzaW5nbGUgYEBDb21wb25lbnRgIGFuZCBhdCBsZWFzdCBvbmUgYEBWaWV3YCBhbm5vdGF0aW9uLiBUaGVcbiAqIGBAVmlld2AgYW5ub3RhdGlvbiBzcGVjaWZpZXMgdGhlIEhUTUwgdGVtcGxhdGUgdG8gdXNlLCBhbmQgbGlzdHMgdGhlIGRpcmVjdGl2ZXMgdGhhdCBhcmUgYWN0aXZlXG4gKiB3aXRoaW4gdGhlIHRlbXBsYXRlLlxuICpcbiAqIFdoZW4gYSBjb21wb25lbnQgaXMgaW5zdGFudGlhdGVkLCB0aGUgdGVtcGxhdGUgaXMgbG9hZGVkIGludG8gdGhlIGNvbXBvbmVudCdzIHNoYWRvdyByb290LCBhbmRcbiAqIHRoZSBleHByZXNzaW9ucyBhbmQgc3RhdGVtZW50cyBpbiB0aGUgdGVtcGxhdGUgYXJlIGV2YWx1YXRlZCBhZ2FpbnN0IHRoZSBjb21wb25lbnQuXG4gKlxuICogRm9yIGRldGFpbHMgb24gdGhlIGBAQ29tcG9uZW50YCBhbm5vdGF0aW9uLCBzZWUge0BsaW5rIENvbXBvbmVudE1ldGFkYXRhfS5cbiAqXG4gKiAjIyMgRXhhbXBsZVxuICpcbiAqIGBgYFxuICogQENvbXBvbmVudCh7XG4gKiAgIHNlbGVjdG9yOiAnZ3JlZXQnLFxuICogICB0ZW1wbGF0ZTogJ0hlbGxvIHt7bmFtZX19IScsXG4gKiAgIGRpcmVjdGl2ZXM6IFtHcmVldFVzZXIsIEJvbGRdXG4gKiB9KVxuICogY2xhc3MgR3JlZXQge1xuICogICBuYW1lOiBzdHJpbmc7XG4gKlxuICogICBjb25zdHJ1Y3RvcigpIHtcbiAqICAgICB0aGlzLm5hbWUgPSAnV29ybGQnO1xuICogICB9XG4gKiB9XG4gKiBgYGBcbiAqL1xuZXhwb3J0IHZhciBBdHRyaWJ1dGU6IEF0dHJpYnV0ZUZhY3RvcnkgPSBtYWtlUGFyYW1EZWNvcmF0b3IoQXR0cmlidXRlTWV0YWRhdGEpO1xuXG4vLyBUT0RPKGFsZXhlYWdsZSk6IHJlbW92ZSB0aGUgZHVwbGljYXRpb24gb2YgdGhpcyBkb2MuIEl0IGlzIGNvcGllZCBmcm9tIFF1ZXJ5TWV0YWRhdGEuXG4vKipcbiAqIERlY2xhcmVzIGFuIGluamVjdGFibGUgcGFyYW1ldGVyIHRvIGJlIGEgbGl2ZSBsaXN0IG9mIGRpcmVjdGl2ZXMgb3IgdmFyaWFibGVcbiAqIGJpbmRpbmdzIGZyb20gdGhlIGNvbnRlbnQgY2hpbGRyZW4gb2YgYSBkaXJlY3RpdmUuXG4gKlxuICogIyMjIEV4YW1wbGUgKFtsaXZlIGRlbW9dKGh0dHA6Ly9wbG5rci5jby9lZGl0L2xZOW04SEx5N3owNnZEb1VhU04yP3A9cHJldmlldykpXG4gKlxuICogQXNzdW1lIHRoYXQgYDx0YWJzPmAgY29tcG9uZW50IHdvdWxkIGxpa2UgdG8gZ2V0IGEgbGlzdCBpdHMgY2hpbGRyZW4gYDxwYW5lPmBcbiAqIGNvbXBvbmVudHMgYXMgc2hvd24gaW4gdGhpcyBleGFtcGxlOlxuICpcbiAqIGBgYGh0bWxcbiAqIDx0YWJzPlxuICogICA8cGFuZSB0aXRsZT1cIk92ZXJ2aWV3XCI+Li4uPC9wYW5lPlxuICogICA8cGFuZSAqbmctZm9yPVwiI28gb2Ygb2JqZWN0c1wiIFt0aXRsZV09XCJvLnRpdGxlXCI+e3tvLnRleHR9fTwvcGFuZT5cbiAqIDwvdGFicz5cbiAqIGBgYFxuICpcbiAqIFRoZSBwcmVmZXJyZWQgc29sdXRpb24gaXMgdG8gcXVlcnkgZm9yIGBQYW5lYCBkaXJlY3RpdmVzIHVzaW5nIHRoaXMgZGVjb3JhdG9yLlxuICpcbiAqIGBgYGphdmFzY3JpcHRcbiAqIEBDb21wb25lbnQoe1xuICogICBzZWxlY3RvcjogJ3BhbmUnLFxuICogICBpbnB1dHM6IFsndGl0bGUnXVxuICogfSlcbiAqIGNsYXNzIFBhbmUge1xuICogICB0aXRsZTpzdHJpbmc7XG4gKiB9XG4gKlxuICogQENvbXBvbmVudCh7XG4gKiAgc2VsZWN0b3I6ICd0YWJzJyxcbiAqICB0ZW1wbGF0ZTogYFxuICogICAgPHVsPlxuICogICAgICA8bGkgKm5nLWZvcj1cIiNwYW5lIG9mIHBhbmVzXCI+e3twYW5lLnRpdGxlfX08L2xpPlxuICogICAgPC91bD5cbiAqICAgIDxjb250ZW50PjwvY29udGVudD5cbiAqICBgXG4gKiB9KVxuICogY2xhc3MgVGFicyB7XG4gKiAgIHBhbmVzOiBRdWVyeUxpc3Q8UGFuZT47XG4gKiAgIGNvbnN0cnVjdG9yKEBRdWVyeShQYW5lKSBwYW5lczpRdWVyeUxpc3Q8UGFuZT4pIHtcbiAqICAgICB0aGlzLnBhbmVzID0gcGFuZXM7XG4gKiAgIH1cbiAqIH1cbiAqIGBgYFxuICpcbiAqIEEgcXVlcnkgY2FuIGxvb2sgZm9yIHZhcmlhYmxlIGJpbmRpbmdzIGJ5IHBhc3NpbmcgaW4gYSBzdHJpbmcgd2l0aCBkZXNpcmVkIGJpbmRpbmcgc3ltYm9sLlxuICpcbiAqICMjIyBFeGFtcGxlIChbbGl2ZSBkZW1vXShodHRwOi8vcGxua3IuY28vZWRpdC9zVDJqMjVjSDFkVVJBeUJSQ0t4MT9wPXByZXZpZXcpKVxuICogYGBgaHRtbFxuICogPHNlZWtlcj5cbiAqICAgPGRpdiAjZmluZG1lPi4uLjwvZGl2PlxuICogPC9zZWVrZXI+XG4gKlxuICogQENvbXBvbmVudCh7IHNlbGVjdG9yOiAnZm9vJyB9KVxuICogY2xhc3Mgc2Vla2VyIHtcbiAqICAgY29uc3RydWN0b3IoQFF1ZXJ5KCdmaW5kbWUnKSBlbExpc3Q6IFF1ZXJ5TGlzdDxFbGVtZW50UmVmPikgey4uLn1cbiAqIH1cbiAqIGBgYFxuICpcbiAqIEluIHRoaXMgY2FzZSB0aGUgb2JqZWN0IHRoYXQgaXMgaW5qZWN0ZWQgZGVwZW5kIG9uIHRoZSB0eXBlIG9mIHRoZSB2YXJpYWJsZVxuICogYmluZGluZy4gSXQgY2FuIGJlIGFuIEVsZW1lbnRSZWYsIGEgZGlyZWN0aXZlIG9yIGEgY29tcG9uZW50LlxuICpcbiAqIFBhc3NpbmcgaW4gYSBjb21tYSBzZXBhcmF0ZWQgbGlzdCBvZiB2YXJpYWJsZSBiaW5kaW5ncyB3aWxsIHF1ZXJ5IGZvciBhbGwgb2YgdGhlbS5cbiAqXG4gKiBgYGBodG1sXG4gKiA8c2Vla2VyPlxuICogICA8ZGl2ICNmaW5kLW1lPi4uLjwvZGl2PlxuICogICA8ZGl2ICNmaW5kLW1lLXRvbz4uLi48L2Rpdj5cbiAqIDwvc2Vla2VyPlxuICpcbiAqICBAQ29tcG9uZW50KHtcbiAqICAgc2VsZWN0b3I6ICdmb28nXG4gKiB9KVxuICogY2xhc3MgU2Vla2VyIHtcbiAqICAgY29uc3RydWN0b3IoQFF1ZXJ5KCdmaW5kTWUsIGZpbmRNZVRvbycpIGVsTGlzdDogUXVlcnlMaXN0PEVsZW1lbnRSZWY+KSB7Li4ufVxuICogfVxuICogYGBgXG4gKlxuICogQ29uZmlndXJlIHdoZXRoZXIgcXVlcnkgbG9va3MgZm9yIGRpcmVjdCBjaGlsZHJlbiBvciBhbGwgZGVzY2VuZGFudHNcbiAqIG9mIHRoZSBxdWVyeWluZyBlbGVtZW50LCBieSB1c2luZyB0aGUgYGRlc2NlbmRhbnRzYCBwYXJhbWV0ZXIuXG4gKiBJdCBpcyBzZXQgdG8gYGZhbHNlYCBieSBkZWZhdWx0LlxuICpcbiAqICMjIyBFeGFtcGxlIChbbGl2ZSBkZW1vXShodHRwOi8vcGxua3IuY28vZWRpdC93dEdlQjk3N2J2N3F2QTVGVFlsOT9wPXByZXZpZXcpKVxuICogYGBgaHRtbFxuICogPGNvbnRhaW5lciAjZmlyc3Q+XG4gKiAgIDxpdGVtPmE8L2l0ZW0+XG4gKiAgIDxpdGVtPmI8L2l0ZW0+XG4gKiAgIDxjb250YWluZXIgI3NlY29uZD5cbiAqICAgICA8aXRlbT5jPC9pdGVtPlxuICogICA8L2NvbnRhaW5lcj5cbiAqIDwvY29udGFpbmVyPlxuICogYGBgXG4gKlxuICogV2hlbiBxdWVyeWluZyBmb3IgaXRlbXMsIHRoZSBmaXJzdCBjb250YWluZXIgd2lsbCBzZWUgb25seSBgYWAgYW5kIGBiYCBieSBkZWZhdWx0LFxuICogYnV0IHdpdGggYFF1ZXJ5KFRleHREaXJlY3RpdmUsIHtkZXNjZW5kYW50czogdHJ1ZX0pYCBpdCB3aWxsIHNlZSBgY2AgdG9vLlxuICpcbiAqIFRoZSBxdWVyaWVkIGRpcmVjdGl2ZXMgYXJlIGtlcHQgaW4gYSBkZXB0aC1maXJzdCBwcmUtb3JkZXIgd2l0aCByZXNwZWN0IHRvIHRoZWlyXG4gKiBwb3NpdGlvbnMgaW4gdGhlIERPTS5cbiAqXG4gKiBRdWVyeSBkb2VzIG5vdCBsb29rIGRlZXAgaW50byBhbnkgc3ViY29tcG9uZW50IHZpZXdzLlxuICpcbiAqIFF1ZXJ5IGlzIHVwZGF0ZWQgYXMgcGFydCBvZiB0aGUgY2hhbmdlLWRldGVjdGlvbiBjeWNsZS4gU2luY2UgY2hhbmdlIGRldGVjdGlvblxuICogaGFwcGVucyBhZnRlciBjb25zdHJ1Y3Rpb24gb2YgYSBkaXJlY3RpdmUsIFF1ZXJ5TGlzdCB3aWxsIGFsd2F5cyBiZSBlbXB0eSB3aGVuIG9ic2VydmVkIGluIHRoZVxuICogY29uc3RydWN0b3IuXG4gKlxuICogVGhlIGluamVjdGVkIG9iamVjdCBpcyBhbiB1bm1vZGlmaWFibGUgbGl2ZSBsaXN0LlxuICogU2VlIHtAbGluayBRdWVyeUxpc3R9IGZvciBtb3JlIGRldGFpbHMuXG4gKi9cbmV4cG9ydCB2YXIgUXVlcnk6IFF1ZXJ5RmFjdG9yeSA9IG1ha2VQYXJhbURlY29yYXRvcihRdWVyeU1ldGFkYXRhKTtcblxuLy8gVE9ETyhhbGV4ZWFnbGUpOiByZW1vdmUgdGhlIGR1cGxpY2F0aW9uIG9mIHRoaXMgZG9jLiBJdCBpcyBjb3BpZWQgZnJvbSBDb250ZW50Q2hpbGRyZW5NZXRhZGF0YS5cbi8qKlxuICogQ29uZmlndXJlcyBhIGNvbnRlbnQgcXVlcnkuXG4gKlxuICogQ29udGVudCBxdWVyaWVzIGFyZSBzZXQgYmVmb3JlIHRoZSBgYWZ0ZXJDb250ZW50SW5pdGAgY2FsbGJhY2sgaXMgY2FsbGVkLlxuICpcbiAqICMjIyBFeGFtcGxlXG4gKlxuICogYGBgXG4gKiBARGlyZWN0aXZlKHtcbiAqICAgc2VsZWN0b3I6ICdzb21lRGlyJ1xuICogfSlcbiAqIGNsYXNzIFNvbWVEaXIge1xuICogICBAQ29udGVudENoaWxkcmVuKENoaWxkRGlyZWN0aXZlKSBjb250ZW50Q2hpbGRyZW46IFF1ZXJ5TGlzdDxDaGlsZERpcmVjdGl2ZT47XG4gKlxuICogICBhZnRlckNvbnRlbnRJbml0KCkge1xuICogICAgIC8vIGNvbnRlbnRDaGlsZHJlbiBpcyBzZXRcbiAqICAgfVxuICogfVxuICogYGBgXG4gKi9cbmV4cG9ydCB2YXIgQ29udGVudENoaWxkcmVuOiBDb250ZW50Q2hpbGRyZW5GYWN0b3J5ID0gbWFrZVByb3BEZWNvcmF0b3IoQ29udGVudENoaWxkcmVuTWV0YWRhdGEpO1xuXG4vLyBUT0RPKGFsZXhlYWdsZSk6IHJlbW92ZSB0aGUgZHVwbGljYXRpb24gb2YgdGhpcyBkb2MuIEl0IGlzIGNvcGllZCBmcm9tIENvbnRlbnRDaGlsZE1ldGFkYXRhLlxuLyoqXG4gKiBDb25maWd1cmVzIGEgY29udGVudCBxdWVyeS5cbiAqXG4gKiBDb250ZW50IHF1ZXJpZXMgYXJlIHNldCBiZWZvcmUgdGhlIGBhZnRlckNvbnRlbnRJbml0YCBjYWxsYmFjayBpcyBjYWxsZWQuXG4gKlxuICogIyMjIEV4YW1wbGVcbiAqXG4gKiBgYGBcbiAqIEBEaXJlY3RpdmUoe1xuICogICBzZWxlY3RvcjogJ3NvbWVEaXInXG4gKiB9KVxuICogY2xhc3MgU29tZURpciB7XG4gKiAgIEBDb250ZW50Q2hpbGQoQ2hpbGREaXJlY3RpdmUpIGNvbnRlbnRDaGlsZDtcbiAqXG4gKiAgIGFmdGVyQ29udGVudEluaXQoKSB7XG4gKiAgICAgLy8gY29udGVudENoaWxkIGlzIHNldFxuICogICB9XG4gKiB9XG4gKiBgYGBcbiAqL1xuZXhwb3J0IHZhciBDb250ZW50Q2hpbGQ6IENvbnRlbnRDaGlsZEZhY3RvcnkgPSBtYWtlUHJvcERlY29yYXRvcihDb250ZW50Q2hpbGRNZXRhZGF0YSk7XG5cbi8vIFRPRE8oYWxleGVhZ2xlKTogcmVtb3ZlIHRoZSBkdXBsaWNhdGlvbiBvZiB0aGlzIGRvYy4gSXQgaXMgY29waWVkIGZyb20gVmlld0NoaWxkcmVuTWV0YWRhdGEuXG4vKipcbiAqIENvbmZpZ3VyZXMgYSB2aWV3IHF1ZXJ5LlxuICpcbiAqIFZpZXcgcXVlcmllcyBhcmUgc2V0IGJlZm9yZSB0aGUgYGFmdGVyVmlld0luaXRgIGNhbGxiYWNrIGlzIGNhbGxlZC5cbiAqXG4gKiAjIyMgRXhhbXBsZVxuICpcbiAqIGBgYFxuICogQENvbXBvbmVudCh7XG4gKiAgIHNlbGVjdG9yOiAnc29tZURpcicsXG4gKiAgIHRlbXBsYXRlVXJsOiAnc29tZVRlbXBsYXRlJyxcbiAqICAgZGlyZWN0aXZlczogW0l0ZW1EaXJlY3RpdmVdXG4gKiB9KVxuICogY2xhc3MgU29tZURpciB7XG4gKiAgIEBWaWV3Q2hpbGRyZW4oSXRlbURpcmVjdGl2ZSkgdmlld0NoaWxkcmVuOiBRdWVyeUxpc3Q8SXRlbURpcmVjdGl2ZT47XG4gKlxuICogICBhZnRlclZpZXdJbml0KCkge1xuICogICAgIC8vIHZpZXdDaGlsZHJlbiBpcyBzZXRcbiAqICAgfVxuICogfVxuICogYGBgXG4gKi9cbmV4cG9ydCB2YXIgVmlld0NoaWxkcmVuOiBWaWV3Q2hpbGRyZW5GYWN0b3J5ID0gbWFrZVByb3BEZWNvcmF0b3IoVmlld0NoaWxkcmVuTWV0YWRhdGEpO1xuXG4vLyBUT0RPKGFsZXhlYWdsZSk6IHJlbW92ZSB0aGUgZHVwbGljYXRpb24gb2YgdGhpcyBkb2MuIEl0IGlzIGNvcGllZCBmcm9tIFZpZXdDaGlsZE1ldGFkYXRhLlxuLyoqXG4gKiBDb25maWd1cmVzIGEgdmlldyBxdWVyeS5cbiAqXG4gKiBWaWV3IHF1ZXJpZXMgYXJlIHNldCBiZWZvcmUgdGhlIGBhZnRlclZpZXdJbml0YCBjYWxsYmFjayBpcyBjYWxsZWQuXG4gKlxuICogIyMjIEV4YW1wbGVcbiAqXG4gKiBgYGBcbiAqIEBDb21wb25lbnQoe1xuICogICBzZWxlY3RvcjogJ3NvbWVEaXInLFxuICogICB0ZW1wbGF0ZVVybDogJ3NvbWVUZW1wbGF0ZScsXG4gKiAgIGRpcmVjdGl2ZXM6IFtJdGVtRGlyZWN0aXZlXVxuICogfSlcbiAqIGNsYXNzIFNvbWVEaXIge1xuICogICBAVmlld0NoaWxkKEl0ZW1EaXJlY3RpdmUpIHZpZXdDaGlsZDpJdGVtRGlyZWN0aXZlO1xuICpcbiAqICAgYWZ0ZXJWaWV3SW5pdCgpIHtcbiAqICAgICAvLyB2aWV3Q2hpbGQgaXMgc2V0XG4gKiAgIH1cbiAqIH1cbiAqIGBgYFxuICovXG5leHBvcnQgdmFyIFZpZXdDaGlsZDogVmlld0NoaWxkRmFjdG9yeSA9IG1ha2VQcm9wRGVjb3JhdG9yKFZpZXdDaGlsZE1ldGFkYXRhKTtcblxuLy8gVE9ETyhhbGV4ZWFnbGUpOiByZW1vdmUgdGhlIGR1cGxpY2F0aW9uIG9mIHRoaXMgZG9jLiBJdCBpcyBjb3BpZWQgZnJvbSBWaWV3UXVlcnlNZXRhZGF0YS5cbi8qKlxuICogU2ltaWxhciB0byB7QGxpbmsgUXVlcnlNZXRhZGF0YX0sIGJ1dCBxdWVyeWluZyB0aGUgY29tcG9uZW50IHZpZXcsIGluc3RlYWQgb2ZcbiAqIHRoZSBjb250ZW50IGNoaWxkcmVuLlxuICpcbiAqICMjIyBFeGFtcGxlIChbbGl2ZSBkZW1vXShodHRwOi8vcGxua3IuY28vZWRpdC9lTnNGSERmN1lqeU02SXpLeE0xaj9wPXByZXZpZXcpKVxuICpcbiAqIGBgYGphdmFzY3JpcHRcbiAqIEBDb21wb25lbnQoey4uLn0pXG4gKiBAVmlldyh7XG4gKiAgIHRlbXBsYXRlOiBgXG4gKiAgICAgPGl0ZW0+IGEgPC9pdGVtPlxuICogICAgIDxpdGVtPiBiIDwvaXRlbT5cbiAqICAgICA8aXRlbT4gYyA8L2l0ZW0+XG4gKiAgIGBcbiAqIH0pXG4gKiBjbGFzcyBNeUNvbXBvbmVudCB7XG4gKiAgIHNob3duOiBib29sZWFuO1xuICpcbiAqICAgY29uc3RydWN0b3IocHJpdmF0ZSBAUXVlcnkoSXRlbSkgaXRlbXM6UXVlcnlMaXN0PEl0ZW0+KSB7XG4gKiAgICAgaXRlbXMub25DaGFuZ2UoKCkgPT4gY29uc29sZS5sb2coaXRlbXMubGVuZ3RoKSk7XG4gKiAgIH1cbiAqIH1cbiAqIGBgYFxuICpcbiAqIFN1cHBvcnRzIHRoZSBzYW1lIHF1ZXJ5aW5nIHBhcmFtZXRlcnMgYXMge0BsaW5rIFF1ZXJ5TWV0YWRhdGF9LCBleGNlcHRcbiAqIGBkZXNjZW5kYW50c2AuIFRoaXMgYWx3YXlzIHF1ZXJpZXMgdGhlIHdob2xlIHZpZXcuXG4gKlxuICogQXMgYHNob3duYCBpcyBmbGlwcGVkIGJldHdlZW4gdHJ1ZSBhbmQgZmFsc2UsIGl0ZW1zIHdpbGwgY29udGFpbiB6ZXJvIG9mIG9uZVxuICogaXRlbXMuXG4gKlxuICogU3BlY2lmaWVzIHRoYXQgYSB7QGxpbmsgUXVlcnlMaXN0fSBzaG91bGQgYmUgaW5qZWN0ZWQuXG4gKlxuICogVGhlIGluamVjdGVkIG9iamVjdCBpcyBhbiBpdGVyYWJsZSBhbmQgb2JzZXJ2YWJsZSBsaXZlIGxpc3QuXG4gKiBTZWUge0BsaW5rIFF1ZXJ5TGlzdH0gZm9yIG1vcmUgZGV0YWlscy5cbiAqL1xuZXhwb3J0IHZhciBWaWV3UXVlcnk6IFF1ZXJ5RmFjdG9yeSA9IG1ha2VQYXJhbURlY29yYXRvcihWaWV3UXVlcnlNZXRhZGF0YSk7XG5cbi8vIFRPRE8oYWxleGVhZ2xlKTogcmVtb3ZlIHRoZSBkdXBsaWNhdGlvbiBvZiB0aGlzIGRvYy4gSXQgaXMgY29waWVkIGZyb20gUGlwZU1ldGFkYXRhLlxuLyoqXG4gKiBEZWNsYXJlIHJldXNhYmxlIHBpcGUgZnVuY3Rpb24uXG4gKlxuICogIyMjIEV4YW1wbGVcbiAqXG4gKiBgYGBcbiAqIEBQaXBlKHtcbiAqICAgbmFtZTogJ2xvd2VyY2FzZSdcbiAqIH0pXG4gKiBjbGFzcyBMb3dlcmNhc2Uge1xuICogICB0cmFuc2Zvcm0odiwgYXJncykgeyByZXR1cm4gdi50b0xvd2VyQ2FzZSgpOyB9XG4gKiB9XG4gKiBgYGBcbiAqL1xuZXhwb3J0IHZhciBQaXBlOiBQaXBlRmFjdG9yeSA9IDxQaXBlRmFjdG9yeT5tYWtlRGVjb3JhdG9yKFBpcGVNZXRhZGF0YSk7XG5cbi8vIFRPRE8oYWxleGVhZ2xlKTogcmVtb3ZlIHRoZSBkdXBsaWNhdGlvbiBvZiB0aGlzIGRvYy4gSXQgaXMgY29waWVkIGZyb20gSW5wdXRNZXRhZGF0YS5cbi8qKlxuICogRGVjbGFyZXMgYSBkYXRhLWJvdW5kIGlucHV0IHByb3BlcnR5LlxuICpcbiAqIEFuZ3VsYXIgYXV0b21hdGljYWxseSB1cGRhdGVzIGRhdGEtYm91bmQgcHJvcGVydGllcyBkdXJpbmcgY2hhbmdlIGRldGVjdGlvbi5cbiAqXG4gKiBgSW5wdXRNZXRhZGF0YWAgdGFrZXMgYW4gb3B0aW9uYWwgcGFyYW1ldGVyIHRoYXQgc3BlY2lmaWVzIHRoZSBuYW1lXG4gKiB1c2VkIHdoZW4gaW5zdGFudGlhdGluZyBhIGNvbXBvbmVudCBpbiB0aGUgdGVtcGxhdGUuIFdoZW4gbm90IHByb3ZpZGVkLFxuICogdGhlIG5hbWUgb2YgdGhlIGRlY29yYXRlZCBwcm9wZXJ0eSBpcyB1c2VkLlxuICpcbiAqICMjIyBFeGFtcGxlXG4gKlxuICogVGhlIGZvbGxvd2luZyBleGFtcGxlIGNyZWF0ZXMgYSBjb21wb25lbnQgd2l0aCB0d28gaW5wdXQgcHJvcGVydGllcy5cbiAqXG4gKiBgYGB0eXBlc2NyaXB0XG4gKiBAQ29tcG9uZW50KHtcbiAqICAgc2VsZWN0b3I6ICdiYW5rLWFjY291bnQnLFxuICogICB0ZW1wbGF0ZTogYFxuICogICAgIEJhbmsgTmFtZToge3tiYW5rTmFtZX19XG4gKiAgICAgQWNjb3VudCBJZDoge3tpZH19XG4gKiAgIGBcbiAqIH0pXG4gKiBjbGFzcyBCYW5rQWNjb3VudCB7XG4gKiAgIEBJbnB1dCgpIGJhbmtOYW1lOiBzdHJpbmc7XG4gKiAgIEBJbnB1dCgnYWNjb3VudC1pZCcpIGlkOiBzdHJpbmc7XG4gKlxuICogICAvLyB0aGlzIHByb3BlcnR5IGlzIG5vdCBib3VuZCwgYW5kIHdvbid0IGJlIGF1dG9tYXRpY2FsbHkgdXBkYXRlZCBieSBBbmd1bGFyXG4gKiAgIG5vcm1hbGl6ZWRCYW5rTmFtZTogc3RyaW5nO1xuICogfVxuICpcbiAqIEBDb21wb25lbnQoe1xuICogICBzZWxlY3RvcjogJ2FwcCcsXG4gKiAgIHRlbXBsYXRlOiBgXG4gKiAgICAgPGJhbmstYWNjb3VudCBiYW5rLW5hbWU9XCJSQkNcIiBhY2NvdW50LWlkPVwiNDc0N1wiPjwvYmFuay1hY2NvdW50PlxuICogICBgLFxuICogICBkaXJlY3RpdmVzOiBbQmFua0FjY291bnRdXG4gKiB9KVxuICogY2xhc3MgQXBwIHt9XG4gKlxuICogYm9vdHN0cmFwKEFwcCk7XG4gKiBgYGBcbiAqL1xuZXhwb3J0IHZhciBJbnB1dDogSW5wdXRGYWN0b3J5ID0gbWFrZVByb3BEZWNvcmF0b3IoSW5wdXRNZXRhZGF0YSk7XG5cbi8vIFRPRE8oYWxleGVhZ2xlKTogcmVtb3ZlIHRoZSBkdXBsaWNhdGlvbiBvZiB0aGlzIGRvYy4gSXQgaXMgY29waWVkIGZyb20gT3V0cHV0TWV0YWRhdGEuXG4vKipcbiAqIERlY2xhcmVzIGFuIGV2ZW50LWJvdW5kIG91dHB1dCBwcm9wZXJ0eS5cbiAqXG4gKiBXaGVuIGFuIG91dHB1dCBwcm9wZXJ0eSBlbWl0cyBhbiBldmVudCwgYW4gZXZlbnQgaGFuZGxlciBhdHRhY2hlZCB0byB0aGF0IGV2ZW50XG4gKiB0aGUgdGVtcGxhdGUgaXMgaW52b2tlZC5cbiAqXG4gKiBgT3V0cHV0TWV0YWRhdGFgIHRha2VzIGFuIG9wdGlvbmFsIHBhcmFtZXRlciB0aGF0IHNwZWNpZmllcyB0aGUgbmFtZVxuICogdXNlZCB3aGVuIGluc3RhbnRpYXRpbmcgYSBjb21wb25lbnQgaW4gdGhlIHRlbXBsYXRlLiBXaGVuIG5vdCBwcm92aWRlZCxcbiAqIHRoZSBuYW1lIG9mIHRoZSBkZWNvcmF0ZWQgcHJvcGVydHkgaXMgdXNlZC5cbiAqXG4gKiAjIyMgRXhhbXBsZVxuICpcbiAqIGBgYHR5cGVzY3JpcHRcbiAqIEBEaXJlY3RpdmUoe1xuICogICBzZWxlY3RvcjogJ2ludGVydmFsLWRpcicsXG4gKiB9KVxuICogY2xhc3MgSW50ZXJ2YWxEaXIge1xuICogICBAT3V0cHV0KCkgZXZlcnlTZWNvbmQgPSBuZXcgRXZlbnRFbWl0dGVyKCk7XG4gKiAgIEBPdXRwdXQoJ2V2ZXJ5Rml2ZVNlY29uZHMnKSBmaXZlNVNlY3MgPSBuZXcgRXZlbnRFbWl0dGVyKCk7XG4gKlxuICogICBjb25zdHJ1Y3RvcigpIHtcbiAqICAgICBzZXRJbnRlcnZhbCgoKSA9PiB0aGlzLmV2ZXJ5U2Vjb25kLmVtaXQoXCJldmVudFwiKSwgMTAwMCk7XG4gKiAgICAgc2V0SW50ZXJ2YWwoKCkgPT4gdGhpcy5maXZlNVNlY3MuZW1pdChcImV2ZW50XCIpLCA1MDAwKTtcbiAqICAgfVxuICogfVxuICpcbiAqIEBDb21wb25lbnQoe1xuICogICBzZWxlY3RvcjogJ2FwcCcsXG4gKiAgIHRlbXBsYXRlOiBgXG4gKiAgICAgPGludGVydmFsLWRpciAoZXZlcnktc2Vjb25kKT1cImV2ZXJ5U2Vjb25kKClcIiAoZXZlcnktZml2ZS1zZWNvbmRzKT1cImV2ZXJ5Rml2ZVNlY29uZHMoKVwiPlxuICogICAgIDwvaW50ZXJ2YWwtZGlyPlxuICogICBgLFxuICogICBkaXJlY3RpdmVzOiBbSW50ZXJ2YWxEaXJdXG4gKiB9KVxuICogY2xhc3MgQXBwIHtcbiAqICAgZXZlcnlTZWNvbmQoKSB7IGNvbnNvbGUubG9nKCdzZWNvbmQnKTsgfVxuICogICBldmVyeUZpdmVTZWNvbmRzKCkgeyBjb25zb2xlLmxvZygnZml2ZSBzZWNvbmRzJyk7IH1cbiAqIH1cbiAqIGJvb3RzdHJhcChBcHApO1xuICogYGBgXG4gKi9cbmV4cG9ydCB2YXIgT3V0cHV0OiBPdXRwdXRGYWN0b3J5ID0gbWFrZVByb3BEZWNvcmF0b3IoT3V0cHV0TWV0YWRhdGEpO1xuXG4vLyBUT0RPKGFsZXhlYWdsZSk6IHJlbW92ZSB0aGUgZHVwbGljYXRpb24gb2YgdGhpcyBkb2MuIEl0IGlzIGNvcGllZCBmcm9tIEhvc3RCaW5kaW5nTWV0YWRhdGEuXG4vKipcbiAqIERlY2xhcmVzIGEgaG9zdCBwcm9wZXJ0eSBiaW5kaW5nLlxuICpcbiAqIEFuZ3VsYXIgYXV0b21hdGljYWxseSBjaGVja3MgaG9zdCBwcm9wZXJ0eSBiaW5kaW5ncyBkdXJpbmcgY2hhbmdlIGRldGVjdGlvbi5cbiAqIElmIGEgYmluZGluZyBjaGFuZ2VzLCBpdCB3aWxsIHVwZGF0ZSB0aGUgaG9zdCBlbGVtZW50IG9mIHRoZSBkaXJlY3RpdmUuXG4gKlxuICogYEhvc3RCaW5kaW5nTWV0YWRhdGFgIHRha2VzIGFuIG9wdGlvbmFsIHBhcmFtZXRlciB0aGF0IHNwZWNpZmllcyB0aGUgcHJvcGVydHlcbiAqIG5hbWUgb2YgdGhlIGhvc3QgZWxlbWVudCB0aGF0IHdpbGwgYmUgdXBkYXRlZC4gV2hlbiBub3QgcHJvdmlkZWQsXG4gKiB0aGUgY2xhc3MgcHJvcGVydHkgbmFtZSBpcyB1c2VkLlxuICpcbiAqICMjIyBFeGFtcGxlXG4gKlxuICogVGhlIGZvbGxvd2luZyBleGFtcGxlIGNyZWF0ZXMgYSBkaXJlY3RpdmUgdGhhdCBzZXRzIHRoZSBgdmFsaWRgIGFuZCBgaW52YWxpZGAgY2xhc3Nlc1xuICogb24gdGhlIERPTSBlbGVtZW50IHRoYXQgaGFzIG5nLW1vZGVsIGRpcmVjdGl2ZSBvbiBpdC5cbiAqXG4gKiBgYGB0eXBlc2NyaXB0XG4gKiBARGlyZWN0aXZlKHtzZWxlY3RvcjogJ1tuZy1tb2RlbF0nfSlcbiAqIGNsYXNzIE5nTW9kZWxTdGF0dXMge1xuICogICBjb25zdHJ1Y3RvcihwdWJsaWMgY29udHJvbDpOZ01vZGVsKSB7fVxuICogICBASG9zdEJpbmRpbmcoJ1tjbGFzcy52YWxpZF0nKSBnZXQgdmFsaWQgeyByZXR1cm4gdGhpcy5jb250cm9sLnZhbGlkOyB9XG4gKiAgIEBIb3N0QmluZGluZygnW2NsYXNzLmludmFsaWRdJykgZ2V0IGludmFsaWQgeyByZXR1cm4gdGhpcy5jb250cm9sLmludmFsaWQ7IH1cbiAqIH1cbiAqXG4gKiBAQ29tcG9uZW50KHtcbiAqICAgc2VsZWN0b3I6ICdhcHAnLFxuICogICB0ZW1wbGF0ZTogYDxpbnB1dCBbKG5nLW1vZGVsKV09XCJwcm9wXCI+YCxcbiAqICAgZGlyZWN0aXZlczogW0ZPUk1fRElSRUNUSVZFUywgTmdNb2RlbFN0YXR1c11cbiAqIH0pXG4gKiBjbGFzcyBBcHAge1xuICogICBwcm9wO1xuICogfVxuICpcbiAqIGJvb3RzdHJhcChBcHApO1xuICogYGBgXG4gKi9cbmV4cG9ydCB2YXIgSG9zdEJpbmRpbmc6IEhvc3RCaW5kaW5nRmFjdG9yeSA9IG1ha2VQcm9wRGVjb3JhdG9yKEhvc3RCaW5kaW5nTWV0YWRhdGEpO1xuXG4vLyBUT0RPKGFsZXhlYWdsZSk6IHJlbW92ZSB0aGUgZHVwbGljYXRpb24gb2YgdGhpcyBkb2MuIEl0IGlzIGNvcGllZCBmcm9tIEhvc3RMaXN0ZW5lck1ldGFkYXRhLlxuLyoqXG4gKiBEZWNsYXJlcyBhIGhvc3QgbGlzdGVuZXIuXG4gKlxuICogQW5ndWxhciB3aWxsIGludm9rZSB0aGUgZGVjb3JhdGVkIG1ldGhvZCB3aGVuIHRoZSBob3N0IGVsZW1lbnQgZW1pdHMgdGhlIHNwZWNpZmllZCBldmVudC5cbiAqXG4gKiBJZiB0aGUgZGVjb3JhdGVkIG1ldGhvZCByZXR1cm5zIGBmYWxzZWAsIHRoZW4gYHByZXZlbnREZWZhdWx0YCBpcyBhcHBsaWVkIG9uIHRoZSBET01cbiAqIGV2ZW50LlxuICpcbiAqICMjIyBFeGFtcGxlXG4gKlxuICogVGhlIGZvbGxvd2luZyBleGFtcGxlIGRlY2xhcmVzIGEgZGlyZWN0aXZlIHRoYXQgYXR0YWNoZXMgYSBjbGljayBsaXN0ZW5lciB0byB0aGUgYnV0dG9uIGFuZFxuICogY291bnRzIGNsaWNrcy5cbiAqXG4gKiBgYGB0eXBlc2NyaXB0XG4gKiBARGlyZWN0aXZlKHtzZWxlY3RvcjogJ2J1dHRvbltjb3VudGluZ10nfSlcbiAqIGNsYXNzIENvdW50Q2xpY2tzIHtcbiAqICAgbnVtYmVyT2ZDbGlja3MgPSAwO1xuICpcbiAqICAgQEhvc3RMaXN0ZW5lcignY2xpY2snLCBbJyRldmVudC50YXJnZXQnXSlcbiAqICAgb25DbGljayhidG4pIHtcbiAqICAgICBjb25zb2xlLmxvZyhcImJ1dHRvblwiLCBidG4sIFwibnVtYmVyIG9mIGNsaWNrczpcIiwgdGhpcy5udW1iZXJPZkNsaWNrcysrKTtcbiAqICAgfVxuICogfVxuICpcbiAqIEBDb21wb25lbnQoe1xuICogICBzZWxlY3RvcjogJ2FwcCcsXG4gKiAgIHRlbXBsYXRlOiBgPGJ1dHRvbiBjb3VudGluZz5JbmNyZW1lbnQ8L2J1dHRvbj5gLFxuICogICBkaXJlY3RpdmVzOiBbQ291bnRDbGlja3NdXG4gKiB9KVxuICogY2xhc3MgQXBwIHt9XG4gKlxuICogYm9vdHN0cmFwKEFwcCk7XG4gKiBgYGBcbiAqL1xuZXhwb3J0IHZhciBIb3N0TGlzdGVuZXI6IEhvc3RMaXN0ZW5lckZhY3RvcnkgPSBtYWtlUHJvcERlY29yYXRvcihIb3N0TGlzdGVuZXJNZXRhZGF0YSk7XG4iXX0=