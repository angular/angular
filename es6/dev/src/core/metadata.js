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
 * {@example core/ts/metadata/metadata.ts region='component'}
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
 *   <pane *ngFor="#o of objects" [title]="o.title">{{o.text}}</pane>
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
 *      <li *ngFor="#pane of panes">{{pane.title}}</li>
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
 *   <div #findMe>...</div>
 *   <div #findMeToo>...</div>
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
export var ContentChildren = makePropDecorator(ContentChildrenMetadata);
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
export var ContentChild = makePropDecorator(ContentChildMetadata);
// TODO(alexeagle): remove the duplication of this doc. It is copied from ViewChildrenMetadata.
/**
 * Configures a view query.
 *
 * View queries are set before the `ngAfterViewInit` callback is called.
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
 *   ngAfterViewInit() {
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
 * View queries are set before the `ngAfterViewInit` callback is called.
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
 *   ngAfterViewInit() {
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
 * {@example core/ts/metadata/metadata.ts region='pipe'}
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWV0YWRhdGEuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJhbmd1bGFyMi9zcmMvY29yZS9tZXRhZGF0YS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O0dBR0c7QUFFSCxTQUNFLGFBQWEsRUFDYix1QkFBdUIsRUFDdkIsb0JBQW9CLEVBQ3BCLG9CQUFvQixFQUNwQixpQkFBaUIsRUFDakIsaUJBQWlCLEVBQ2pCLGlCQUFpQixRQUNaLGVBQWUsQ0FBQztBQUV2QixTQUNFLGlCQUFpQixFQUNqQixpQkFBaUIsRUFDakIsWUFBWSxFQUNaLGFBQWEsRUFDYixjQUFjLEVBQ2QsbUJBQW1CLEVBQ25CLG9CQUFvQixRQUNmLHVCQUF1QixDQUFDO0FBRS9CLFNBQVEsWUFBWSxFQUFFLGlCQUFpQixRQUFPLGlCQUFpQixDQUFDO09BRXpELEVBQ0wsYUFBYSxFQUNiLHVCQUF1QixFQUN2QixvQkFBb0IsRUFDcEIsb0JBQW9CLEVBQ3BCLGlCQUFpQixFQUNqQixpQkFBaUIsRUFDakIsaUJBQWlCLEVBQ2xCLE1BQU0sZUFBZTtPQUVmLEVBQ0wsaUJBQWlCLEVBQ2pCLGlCQUFpQixFQUNqQixZQUFZLEVBQ1osYUFBYSxFQUNiLGNBQWMsRUFDZCxtQkFBbUIsRUFDbkIsb0JBQW9CLEVBQ3JCLE1BQU0sdUJBQXVCO09BRXZCLEVBQUMsWUFBWSxFQUFvQixNQUFNLGlCQUFpQjtPQUd4RCxFQUNMLGFBQWEsRUFDYixrQkFBa0IsRUFDbEIsaUJBQWlCLEVBR2xCLE1BQU0sbUJBQW1CO0FBNloxQiw0RkFBNEY7QUFDNUY7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7R0F5Qkc7QUFDSCxXQUFXLFNBQVMsR0FDRSxhQUFhLENBQUMsaUJBQWlCLEVBQUUsQ0FBQyxFQUFPLEtBQUssRUFBRSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUMsQ0FBQztBQUVwRiw0RkFBNEY7QUFDNUY7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0dBeVhHO0FBQ0gsV0FBVyxTQUFTLEdBQXVDLGFBQWEsQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDO0FBRTVGLHVGQUF1RjtBQUN2Rjs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztHQTRCRztBQUNILFdBQVcsSUFBSSxHQUNFLGFBQWEsQ0FBQyxZQUFZLEVBQUUsQ0FBQyxFQUFPLEtBQUssRUFBRSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUMsQ0FBQztBQUUxRTs7Ozs7Ozs7Ozs7Ozs7OztHQWdCRztBQUNILFdBQVcsU0FBUyxHQUFxQixrQkFBa0IsQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDO0FBRS9FLHdGQUF3RjtBQUN4Rjs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztHQTBHRztBQUNILFdBQVcsS0FBSyxHQUFpQixrQkFBa0IsQ0FBQyxhQUFhLENBQUMsQ0FBQztBQUVuRSxrR0FBa0c7QUFDbEc7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7R0FtQkc7QUFDSCxXQUFXLGVBQWUsR0FBMkIsaUJBQWlCLENBQUMsdUJBQXVCLENBQUMsQ0FBQztBQUVoRywrRkFBK0Y7QUFDL0Y7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7R0FtQkc7QUFDSCxXQUFXLFlBQVksR0FBd0IsaUJBQWlCLENBQUMsb0JBQW9CLENBQUMsQ0FBQztBQUV2RiwrRkFBK0Y7QUFDL0Y7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztHQXFCRztBQUNILFdBQVcsWUFBWSxHQUF3QixpQkFBaUIsQ0FBQyxvQkFBb0IsQ0FBQyxDQUFDO0FBRXZGLDRGQUE0RjtBQUM1Rjs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0dBcUJHO0FBQ0gsV0FBVyxTQUFTLEdBQXFCLGlCQUFpQixDQUFDLGlCQUFpQixDQUFDLENBQUM7QUFFOUUsNEZBQTRGO0FBQzVGOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0dBa0NHO0FBQ0gsV0FBVyxTQUFTLEdBQWlCLGtCQUFrQixDQUFDLGlCQUFpQixDQUFDLENBQUM7QUFFM0UsdUZBQXVGO0FBQ3ZGOzs7Ozs7R0FNRztBQUNILFdBQVcsSUFBSSxHQUE2QixhQUFhLENBQUMsWUFBWSxDQUFDLENBQUM7QUFFeEUsd0ZBQXdGO0FBQ3hGOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0dBd0NHO0FBQ0gsV0FBVyxLQUFLLEdBQWlCLGlCQUFpQixDQUFDLGFBQWEsQ0FBQyxDQUFDO0FBRWxFLHlGQUF5RjtBQUN6Rjs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztHQXdDRztBQUNILFdBQVcsTUFBTSxHQUFrQixpQkFBaUIsQ0FBQyxjQUFjLENBQUMsQ0FBQztBQUVyRSw4RkFBOEY7QUFDOUY7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7R0FrQ0c7QUFDSCxXQUFXLFdBQVcsR0FBdUIsaUJBQWlCLENBQUMsbUJBQW1CLENBQUMsQ0FBQztBQUVwRiwrRkFBK0Y7QUFDL0Y7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztHQWlDRztBQUNILFdBQVcsWUFBWSxHQUF3QixpQkFBaUIsQ0FBQyxvQkFBb0IsQ0FBQyxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBUaGlzIGluZGlyZWN0aW9uIGlzIG5lZWRlZCB0byBmcmVlIHVwIENvbXBvbmVudCwgZXRjIHN5bWJvbHMgaW4gdGhlIHB1YmxpYyBBUElcbiAqIHRvIGJlIHVzZWQgYnkgdGhlIGRlY29yYXRvciB2ZXJzaW9ucyBvZiB0aGVzZSBhbm5vdGF0aW9ucy5cbiAqL1xuXG5leHBvcnQge1xuICBRdWVyeU1ldGFkYXRhLFxuICBDb250ZW50Q2hpbGRyZW5NZXRhZGF0YSxcbiAgQ29udGVudENoaWxkTWV0YWRhdGEsXG4gIFZpZXdDaGlsZHJlbk1ldGFkYXRhLFxuICBWaWV3UXVlcnlNZXRhZGF0YSxcbiAgVmlld0NoaWxkTWV0YWRhdGEsXG4gIEF0dHJpYnV0ZU1ldGFkYXRhXG59IGZyb20gJy4vbWV0YWRhdGEvZGknO1xuXG5leHBvcnQge1xuICBDb21wb25lbnRNZXRhZGF0YSxcbiAgRGlyZWN0aXZlTWV0YWRhdGEsXG4gIFBpcGVNZXRhZGF0YSxcbiAgSW5wdXRNZXRhZGF0YSxcbiAgT3V0cHV0TWV0YWRhdGEsXG4gIEhvc3RCaW5kaW5nTWV0YWRhdGEsXG4gIEhvc3RMaXN0ZW5lck1ldGFkYXRhXG59IGZyb20gJy4vbWV0YWRhdGEvZGlyZWN0aXZlcyc7XG5cbmV4cG9ydCB7Vmlld01ldGFkYXRhLCBWaWV3RW5jYXBzdWxhdGlvbn0gZnJvbSAnLi9tZXRhZGF0YS92aWV3JztcblxuaW1wb3J0IHtcbiAgUXVlcnlNZXRhZGF0YSxcbiAgQ29udGVudENoaWxkcmVuTWV0YWRhdGEsXG4gIENvbnRlbnRDaGlsZE1ldGFkYXRhLFxuICBWaWV3Q2hpbGRyZW5NZXRhZGF0YSxcbiAgVmlld0NoaWxkTWV0YWRhdGEsXG4gIFZpZXdRdWVyeU1ldGFkYXRhLFxuICBBdHRyaWJ1dGVNZXRhZGF0YVxufSBmcm9tICcuL21ldGFkYXRhL2RpJztcblxuaW1wb3J0IHtcbiAgQ29tcG9uZW50TWV0YWRhdGEsXG4gIERpcmVjdGl2ZU1ldGFkYXRhLFxuICBQaXBlTWV0YWRhdGEsXG4gIElucHV0TWV0YWRhdGEsXG4gIE91dHB1dE1ldGFkYXRhLFxuICBIb3N0QmluZGluZ01ldGFkYXRhLFxuICBIb3N0TGlzdGVuZXJNZXRhZGF0YVxufSBmcm9tICcuL21ldGFkYXRhL2RpcmVjdGl2ZXMnO1xuXG5pbXBvcnQge1ZpZXdNZXRhZGF0YSwgVmlld0VuY2Fwc3VsYXRpb259IGZyb20gJy4vbWV0YWRhdGEvdmlldyc7XG5pbXBvcnQge0NoYW5nZURldGVjdGlvblN0cmF0ZWd5fSBmcm9tICdhbmd1bGFyMi9zcmMvY29yZS9jaGFuZ2VfZGV0ZWN0aW9uL2NoYW5nZV9kZXRlY3Rpb24nO1xuXG5pbXBvcnQge1xuICBtYWtlRGVjb3JhdG9yLFxuICBtYWtlUGFyYW1EZWNvcmF0b3IsXG4gIG1ha2VQcm9wRGVjb3JhdG9yLFxuICBUeXBlRGVjb3JhdG9yLFxuICBDbGFzc1xufSBmcm9tICcuL3V0aWwvZGVjb3JhdG9ycyc7XG5pbXBvcnQge1R5cGV9IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvbGFuZyc7XG5cbi8qKlxuICogSW50ZXJmYWNlIGZvciB0aGUge0BsaW5rIERpcmVjdGl2ZU1ldGFkYXRhfSBkZWNvcmF0b3IgZnVuY3Rpb24uXG4gKlxuICogU2VlIHtAbGluayBEaXJlY3RpdmVGYWN0b3J5fS5cbiAqL1xuZXhwb3J0IGludGVyZmFjZSBEaXJlY3RpdmVEZWNvcmF0b3IgZXh0ZW5kcyBUeXBlRGVjb3JhdG9yIHt9XG5cbi8qKlxuICogSW50ZXJmYWNlIGZvciB0aGUge0BsaW5rIENvbXBvbmVudE1ldGFkYXRhfSBkZWNvcmF0b3IgZnVuY3Rpb24uXG4gKlxuICogU2VlIHtAbGluayBDb21wb25lbnRGYWN0b3J5fS5cbiAqL1xuZXhwb3J0IGludGVyZmFjZSBDb21wb25lbnREZWNvcmF0b3IgZXh0ZW5kcyBUeXBlRGVjb3JhdG9yIHtcbiAgLyoqXG4gICAqIENoYWluIHtAbGluayBWaWV3TWV0YWRhdGF9IGFubm90YXRpb24uXG4gICAqL1xuICBWaWV3KG9iajoge1xuICAgIHRlbXBsYXRlVXJsPzogc3RyaW5nLFxuICAgIHRlbXBsYXRlPzogc3RyaW5nLFxuICAgIGRpcmVjdGl2ZXM/OiBBcnJheTxUeXBlIHwgYW55W10+LFxuICAgIHBpcGVzPzogQXJyYXk8VHlwZSB8IGFueVtdPixcbiAgICByZW5kZXJlcj86IHN0cmluZyxcbiAgICBzdHlsZXM/OiBzdHJpbmdbXSxcbiAgICBzdHlsZVVybHM/OiBzdHJpbmdbXSxcbiAgfSk6IFZpZXdEZWNvcmF0b3I7XG59XG5cbi8qKlxuICogSW50ZXJmYWNlIGZvciB0aGUge0BsaW5rIFZpZXdNZXRhZGF0YX0gZGVjb3JhdG9yIGZ1bmN0aW9uLlxuICpcbiAqIFNlZSB7QGxpbmsgVmlld0ZhY3Rvcnl9LlxuICovXG5leHBvcnQgaW50ZXJmYWNlIFZpZXdEZWNvcmF0b3IgZXh0ZW5kcyBUeXBlRGVjb3JhdG9yIHtcbiAgLyoqXG4gICAqIENoYWluIHtAbGluayBWaWV3TWV0YWRhdGF9IGFubm90YXRpb24uXG4gICAqL1xuICBWaWV3KG9iajoge1xuICAgIHRlbXBsYXRlVXJsPzogc3RyaW5nLFxuICAgIHRlbXBsYXRlPzogc3RyaW5nLFxuICAgIGRpcmVjdGl2ZXM/OiBBcnJheTxUeXBlIHwgYW55W10+LFxuICAgIHBpcGVzPzogQXJyYXk8VHlwZSB8IGFueVtdPixcbiAgICByZW5kZXJlcj86IHN0cmluZyxcbiAgICBzdHlsZXM/OiBzdHJpbmdbXSxcbiAgICBzdHlsZVVybHM/OiBzdHJpbmdbXSxcbiAgfSk6IFZpZXdEZWNvcmF0b3I7XG59XG5cbi8qKlxuICoge0BsaW5rIERpcmVjdGl2ZU1ldGFkYXRhfSBmYWN0b3J5IGZvciBjcmVhdGluZyBhbm5vdGF0aW9ucywgZGVjb3JhdG9ycyBvciBEU0wuXG4gKlxuICogIyMjIEV4YW1wbGUgYXMgVHlwZVNjcmlwdCBEZWNvcmF0b3JcbiAqXG4gKiB7QGV4YW1wbGUgY29yZS90cy9tZXRhZGF0YS9tZXRhZGF0YS50cyByZWdpb249J2RpcmVjdGl2ZSd9XG4gKlxuICogIyMjIEV4YW1wbGUgYXMgRVM1IERTTFxuICpcbiAqIGBgYFxuICogdmFyIE15RGlyZWN0aXZlID0gbmdcbiAqICAgLkRpcmVjdGl2ZSh7Li4ufSlcbiAqICAgLkNsYXNzKHtcbiAqICAgICBjb25zdHJ1Y3RvcjogZnVuY3Rpb24oKSB7XG4gKiAgICAgICAuLi5cbiAqICAgICB9XG4gKiAgIH0pXG4gKiBgYGBcbiAqXG4gKiAjIyMgRXhhbXBsZSBhcyBFUzUgYW5ub3RhdGlvblxuICpcbiAqIGBgYFxuICogdmFyIE15RGlyZWN0aXZlID0gZnVuY3Rpb24oKSB7XG4gKiAgIC4uLlxuICogfTtcbiAqXG4gKiBNeURpcmVjdGl2ZS5hbm5vdGF0aW9ucyA9IFtcbiAqICAgbmV3IG5nLkRpcmVjdGl2ZSh7Li4ufSlcbiAqIF1cbiAqIGBgYFxuICovXG5leHBvcnQgaW50ZXJmYWNlIERpcmVjdGl2ZUZhY3Rvcnkge1xuICAob2JqOiB7XG4gICAgc2VsZWN0b3I/OiBzdHJpbmcsXG4gICAgaW5wdXRzPzogc3RyaW5nW10sXG4gICAgb3V0cHV0cz86IHN0cmluZ1tdLFxuICAgIHByb3BlcnRpZXM/OiBzdHJpbmdbXSxcbiAgICBldmVudHM/OiBzdHJpbmdbXSxcbiAgICBob3N0Pzoge1trZXk6IHN0cmluZ106IHN0cmluZ30sXG4gICAgYmluZGluZ3M/OiBhbnlbXSxcbiAgICBwcm92aWRlcnM/OiBhbnlbXSxcbiAgICBleHBvcnRBcz86IHN0cmluZyxcbiAgICBtb2R1bGVJZD86IHN0cmluZyxcbiAgICBxdWVyaWVzPzoge1trZXk6IHN0cmluZ106IGFueX1cbiAgfSk6IERpcmVjdGl2ZURlY29yYXRvcjtcbiAgbmV3IChvYmo6IHtcbiAgICBzZWxlY3Rvcj86IHN0cmluZyxcbiAgICBpbnB1dHM/OiBzdHJpbmdbXSxcbiAgICBvdXRwdXRzPzogc3RyaW5nW10sXG4gICAgcHJvcGVydGllcz86IHN0cmluZ1tdLFxuICAgIGV2ZW50cz86IHN0cmluZ1tdLFxuICAgIGhvc3Q/OiB7W2tleTogc3RyaW5nXTogc3RyaW5nfSxcbiAgICBiaW5kaW5ncz86IGFueVtdLFxuICAgIHByb3ZpZGVycz86IGFueVtdLFxuICAgIGV4cG9ydEFzPzogc3RyaW5nLFxuICAgIG1vZHVsZUlkPzogc3RyaW5nLFxuICAgIHF1ZXJpZXM/OiB7W2tleTogc3RyaW5nXTogYW55fVxuICB9KTogRGlyZWN0aXZlTWV0YWRhdGE7XG59XG5cbi8qKlxuICoge0BsaW5rIENvbXBvbmVudE1ldGFkYXRhfSBmYWN0b3J5IGZvciBjcmVhdGluZyBhbm5vdGF0aW9ucywgZGVjb3JhdG9ycyBvciBEU0wuXG4gKlxuICogIyMjIEV4YW1wbGUgYXMgVHlwZVNjcmlwdCBEZWNvcmF0b3JcbiAqXG4gKiB7QGV4YW1wbGUgY29yZS90cy9tZXRhZGF0YS9tZXRhZGF0YS50cyByZWdpb249J2NvbXBvbmVudCd9XG4gKlxuICogIyMjIEV4YW1wbGUgYXMgRVM1IERTTFxuICpcbiAqIGBgYFxuICogdmFyIE15Q29tcG9uZW50ID0gbmdcbiAqICAgLkNvbXBvbmVudCh7Li4ufSlcbiAqICAgLkNsYXNzKHtcbiAqICAgICBjb25zdHJ1Y3RvcjogZnVuY3Rpb24oKSB7XG4gKiAgICAgICAuLi5cbiAqICAgICB9XG4gKiAgIH0pXG4gKiBgYGBcbiAqXG4gKiAjIyMgRXhhbXBsZSBhcyBFUzUgYW5ub3RhdGlvblxuICpcbiAqIGBgYFxuICogdmFyIE15Q29tcG9uZW50ID0gZnVuY3Rpb24oKSB7XG4gKiAgIC4uLlxuICogfTtcbiAqXG4gKiBNeUNvbXBvbmVudC5hbm5vdGF0aW9ucyA9IFtcbiAqICAgbmV3IG5nLkNvbXBvbmVudCh7Li4ufSlcbiAqIF1cbiAqIGBgYFxuICovXG5leHBvcnQgaW50ZXJmYWNlIENvbXBvbmVudEZhY3Rvcnkge1xuICAob2JqOiB7XG4gICAgc2VsZWN0b3I/OiBzdHJpbmcsXG4gICAgaW5wdXRzPzogc3RyaW5nW10sXG4gICAgb3V0cHV0cz86IHN0cmluZ1tdLFxuICAgIHByb3BlcnRpZXM/OiBzdHJpbmdbXSxcbiAgICBldmVudHM/OiBzdHJpbmdbXSxcbiAgICBob3N0Pzoge1trZXk6IHN0cmluZ106IHN0cmluZ30sXG4gICAgLyogQGRlcHJlY2F0ZWQgKi9cbiAgICBiaW5kaW5ncz86IGFueVtdLFxuICAgIHByb3ZpZGVycz86IGFueVtdLFxuICAgIGV4cG9ydEFzPzogc3RyaW5nLFxuICAgIG1vZHVsZUlkPzogc3RyaW5nLFxuICAgIHF1ZXJpZXM/OiB7W2tleTogc3RyaW5nXTogYW55fSxcbiAgICB2aWV3QmluZGluZ3M/OiBhbnlbXSxcbiAgICB2aWV3UHJvdmlkZXJzPzogYW55W10sXG4gICAgY2hhbmdlRGV0ZWN0aW9uPzogQ2hhbmdlRGV0ZWN0aW9uU3RyYXRlZ3ksXG4gICAgdGVtcGxhdGVVcmw/OiBzdHJpbmcsXG4gICAgdGVtcGxhdGU/OiBzdHJpbmcsXG4gICAgc3R5bGVVcmxzPzogc3RyaW5nW10sXG4gICAgc3R5bGVzPzogc3RyaW5nW10sXG4gICAgZGlyZWN0aXZlcz86IEFycmF5PFR5cGUgfCBhbnlbXT4sXG4gICAgcGlwZXM/OiBBcnJheTxUeXBlIHwgYW55W10+LFxuICAgIGVuY2Fwc3VsYXRpb24/OiBWaWV3RW5jYXBzdWxhdGlvblxuICB9KTogQ29tcG9uZW50RGVjb3JhdG9yO1xuICBuZXcgKG9iajoge1xuICAgIHNlbGVjdG9yPzogc3RyaW5nLFxuICAgIGlucHV0cz86IHN0cmluZ1tdLFxuICAgIG91dHB1dHM/OiBzdHJpbmdbXSxcbiAgICBwcm9wZXJ0aWVzPzogc3RyaW5nW10sXG4gICAgZXZlbnRzPzogc3RyaW5nW10sXG4gICAgaG9zdD86IHtba2V5OiBzdHJpbmddOiBzdHJpbmd9LFxuICAgIC8qIEBkZXByZWNhdGVkICovXG4gICAgYmluZGluZ3M/OiBhbnlbXSxcbiAgICBwcm92aWRlcnM/OiBhbnlbXSxcbiAgICBleHBvcnRBcz86IHN0cmluZyxcbiAgICBtb2R1bGVJZD86IHN0cmluZyxcbiAgICBxdWVyaWVzPzoge1trZXk6IHN0cmluZ106IGFueX0sXG4gICAgLyogQGRlcHJlY2F0ZWQgKi9cbiAgICB2aWV3QmluZGluZ3M/OiBhbnlbXSxcbiAgICB2aWV3UHJvdmlkZXJzPzogYW55W10sXG4gICAgY2hhbmdlRGV0ZWN0aW9uPzogQ2hhbmdlRGV0ZWN0aW9uU3RyYXRlZ3ksXG4gICAgdGVtcGxhdGVVcmw/OiBzdHJpbmcsXG4gICAgdGVtcGxhdGU/OiBzdHJpbmcsXG4gICAgc3R5bGVVcmxzPzogc3RyaW5nW10sXG4gICAgc3R5bGVzPzogc3RyaW5nW10sXG4gICAgZGlyZWN0aXZlcz86IEFycmF5PFR5cGUgfCBhbnlbXT4sXG4gICAgcGlwZXM/OiBBcnJheTxUeXBlIHwgYW55W10+LFxuICAgIGVuY2Fwc3VsYXRpb24/OiBWaWV3RW5jYXBzdWxhdGlvblxuICB9KTogQ29tcG9uZW50TWV0YWRhdGE7XG59XG5cbi8qKlxuICoge0BsaW5rIFZpZXdNZXRhZGF0YX0gZmFjdG9yeSBmb3IgY3JlYXRpbmcgYW5ub3RhdGlvbnMsIGRlY29yYXRvcnMgb3IgRFNMLlxuICpcbiAqICMjIyBFeGFtcGxlIGFzIFR5cGVTY3JpcHQgRGVjb3JhdG9yXG4gKlxuICogYGBgXG4gKiBpbXBvcnQge0NvbXBvbmVudCwgVmlld30gZnJvbSBcImFuZ3VsYXIyL2FuZ3VsYXIyXCI7XG4gKlxuICogQENvbXBvbmVudCh7Li4ufSlcbiAqIEBWaWV3KHsuLi59KVxuICogY2xhc3MgTXlDb21wb25lbnQge1xuICogICBjb25zdHJ1Y3RvcigpIHtcbiAqICAgICAuLi5cbiAqICAgfVxuICogfVxuICogYGBgXG4gKlxuICogIyMjIEV4YW1wbGUgYXMgRVM1IERTTFxuICpcbiAqIGBgYFxuICogdmFyIE15Q29tcG9uZW50ID0gbmdcbiAqICAgLkNvbXBvbmVudCh7Li4ufSlcbiAqICAgLlZpZXcoey4uLn0pXG4gKiAgIC5DbGFzcyh7XG4gKiAgICAgY29uc3RydWN0b3I6IGZ1bmN0aW9uKCkge1xuICogICAgICAgLi4uXG4gKiAgICAgfVxuICogICB9KVxuICogYGBgXG4gKlxuICogIyMjIEV4YW1wbGUgYXMgRVM1IGFubm90YXRpb25cbiAqXG4gKiBgYGBcbiAqIHZhciBNeUNvbXBvbmVudCA9IGZ1bmN0aW9uKCkge1xuICogICAuLi5cbiAqIH07XG4gKlxuICogTXlDb21wb25lbnQuYW5ub3RhdGlvbnMgPSBbXG4gKiAgIG5ldyBuZy5Db21wb25lbnQoey4uLn0pLFxuICogICBuZXcgbmcuVmlldyh7Li4ufSlcbiAqIF1cbiAqIGBgYFxuICovXG5leHBvcnQgaW50ZXJmYWNlIFZpZXdGYWN0b3J5IHtcbiAgKG9iajoge1xuICAgIHRlbXBsYXRlVXJsPzogc3RyaW5nLFxuICAgIHRlbXBsYXRlPzogc3RyaW5nLFxuICAgIGRpcmVjdGl2ZXM/OiBBcnJheTxUeXBlIHwgYW55W10+LFxuICAgIHBpcGVzPzogQXJyYXk8VHlwZSB8IGFueVtdPixcbiAgICBlbmNhcHN1bGF0aW9uPzogVmlld0VuY2Fwc3VsYXRpb24sXG4gICAgc3R5bGVzPzogc3RyaW5nW10sXG4gICAgc3R5bGVVcmxzPzogc3RyaW5nW10sXG4gIH0pOiBWaWV3RGVjb3JhdG9yO1xuICBuZXcgKG9iajoge1xuICAgIHRlbXBsYXRlVXJsPzogc3RyaW5nLFxuICAgIHRlbXBsYXRlPzogc3RyaW5nLFxuICAgIGRpcmVjdGl2ZXM/OiBBcnJheTxUeXBlIHwgYW55W10+LFxuICAgIHBpcGVzPzogQXJyYXk8VHlwZSB8IGFueVtdPixcbiAgICBlbmNhcHN1bGF0aW9uPzogVmlld0VuY2Fwc3VsYXRpb24sXG4gICAgc3R5bGVzPzogc3RyaW5nW10sXG4gICAgc3R5bGVVcmxzPzogc3RyaW5nW10sXG4gIH0pOiBWaWV3TWV0YWRhdGE7XG59XG5cbi8qKlxuICoge0BsaW5rIEF0dHJpYnV0ZU1ldGFkYXRhfSBmYWN0b3J5IGZvciBjcmVhdGluZyBhbm5vdGF0aW9ucywgZGVjb3JhdG9ycyBvciBEU0wuXG4gKlxuICogIyMjIEV4YW1wbGUgYXMgVHlwZVNjcmlwdCBEZWNvcmF0b3JcbiAqXG4gKiB7QGV4YW1wbGUgY29yZS90cy9tZXRhZGF0YS9tZXRhZGF0YS50cyByZWdpb249J2F0dHJpYnV0ZUZhY3RvcnknfVxuICpcbiAqICMjIyBFeGFtcGxlIGFzIEVTNSBEU0xcbiAqXG4gKiBgYGBcbiAqIHZhciBNeUNvbXBvbmVudCA9IG5nXG4gKiAgIC5Db21wb25lbnQoey4uLn0pXG4gKiAgIC5DbGFzcyh7XG4gKiAgICAgY29uc3RydWN0b3I6IFtuZXcgbmcuQXR0cmlidXRlKCd0aXRsZScpLCBmdW5jdGlvbih0aXRsZSkge1xuICogICAgICAgLi4uXG4gKiAgICAgfV1cbiAqICAgfSlcbiAqIGBgYFxuICpcbiAqICMjIyBFeGFtcGxlIGFzIEVTNSBhbm5vdGF0aW9uXG4gKlxuICogYGBgXG4gKiB2YXIgTXlDb21wb25lbnQgPSBmdW5jdGlvbih0aXRsZSkge1xuICogICAuLi5cbiAqIH07XG4gKlxuICogTXlDb21wb25lbnQuYW5ub3RhdGlvbnMgPSBbXG4gKiAgIG5ldyBuZy5Db21wb25lbnQoey4uLn0pXG4gKiBdXG4gKiBNeUNvbXBvbmVudC5wYXJhbWV0ZXJzID0gW1xuICogICBbbmV3IG5nLkF0dHJpYnV0ZSgndGl0bGUnKV1cbiAqIF1cbiAqIGBgYFxuICovXG5leHBvcnQgaW50ZXJmYWNlIEF0dHJpYnV0ZUZhY3Rvcnkge1xuICAobmFtZTogc3RyaW5nKTogVHlwZURlY29yYXRvcjtcbiAgbmV3IChuYW1lOiBzdHJpbmcpOiBBdHRyaWJ1dGVNZXRhZGF0YTtcbn1cblxuLyoqXG4gKiB7QGxpbmsgUXVlcnlNZXRhZGF0YX0gZmFjdG9yeSBmb3IgY3JlYXRpbmcgYW5ub3RhdGlvbnMsIGRlY29yYXRvcnMgb3IgRFNMLlxuICpcbiAqICMjIyBFeGFtcGxlIGFzIFR5cGVTY3JpcHQgRGVjb3JhdG9yXG4gKlxuICogYGBgXG4gKiBpbXBvcnQge1F1ZXJ5LCBRdWVyeUxpc3QsIENvbXBvbmVudH0gZnJvbSBcImFuZ3VsYXIyL2FuZ3VsYXIyXCI7XG4gKlxuICogQENvbXBvbmVudCh7Li4ufSlcbiAqIGNsYXNzIE15Q29tcG9uZW50IHtcbiAqICAgY29uc3RydWN0b3IoQFF1ZXJ5KFNvbWVUeXBlKSBxdWVyeUxpc3Q6IFF1ZXJ5TGlzdDxTb21lVHlwZT4pIHtcbiAqICAgICAuLi5cbiAqICAgfVxuICogfVxuICogYGBgXG4gKlxuICogIyMjIEV4YW1wbGUgYXMgRVM1IERTTFxuICpcbiAqIGBgYFxuICogdmFyIE15Q29tcG9uZW50ID0gbmdcbiAqICAgLkNvbXBvbmVudCh7Li4ufSlcbiAqICAgLkNsYXNzKHtcbiAqICAgICBjb25zdHJ1Y3RvcjogW25ldyBuZy5RdWVyeShTb21lVHlwZSksIGZ1bmN0aW9uKHF1ZXJ5TGlzdCkge1xuICogICAgICAgLi4uXG4gKiAgICAgfV1cbiAqICAgfSlcbiAqIGBgYFxuICpcbiAqICMjIyBFeGFtcGxlIGFzIEVTNSBhbm5vdGF0aW9uXG4gKlxuICogYGBgXG4gKiB2YXIgTXlDb21wb25lbnQgPSBmdW5jdGlvbihxdWVyeUxpc3QpIHtcbiAqICAgLi4uXG4gKiB9O1xuICpcbiAqIE15Q29tcG9uZW50LmFubm90YXRpb25zID0gW1xuICogICBuZXcgbmcuQ29tcG9uZW50KHsuLi59KVxuICogXVxuICogTXlDb21wb25lbnQucGFyYW1ldGVycyA9IFtcbiAqICAgW25ldyBuZy5RdWVyeShTb21lVHlwZSldXG4gKiBdXG4gKiBgYGBcbiAqL1xuZXhwb3J0IGludGVyZmFjZSBRdWVyeUZhY3Rvcnkge1xuICAoc2VsZWN0b3I6IFR5cGUgfCBzdHJpbmcsIHtkZXNjZW5kYW50c30/OiB7ZGVzY2VuZGFudHM/OiBib29sZWFufSk6IFBhcmFtZXRlckRlY29yYXRvcjtcbiAgbmV3IChzZWxlY3RvcjogVHlwZSB8IHN0cmluZywge2Rlc2NlbmRhbnRzfT86IHtkZXNjZW5kYW50cz86IGJvb2xlYW59KTogUXVlcnlNZXRhZGF0YTtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBDb250ZW50Q2hpbGRyZW5GYWN0b3J5IHtcbiAgKHNlbGVjdG9yOiBUeXBlIHwgc3RyaW5nLCB7ZGVzY2VuZGFudHN9Pzoge2Rlc2NlbmRhbnRzPzogYm9vbGVhbn0pOiBhbnk7XG4gIG5ldyAoc2VsZWN0b3I6IFR5cGUgfCBzdHJpbmcsIHtkZXNjZW5kYW50c30/OiB7ZGVzY2VuZGFudHM/OiBib29sZWFufSk6IENvbnRlbnRDaGlsZHJlbk1ldGFkYXRhO1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIENvbnRlbnRDaGlsZEZhY3Rvcnkge1xuICAoc2VsZWN0b3I6IFR5cGUgfCBzdHJpbmcpOiBhbnk7XG4gIG5ldyAoc2VsZWN0b3I6IFR5cGUgfCBzdHJpbmcpOiBDb250ZW50Q2hpbGRGYWN0b3J5O1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIFZpZXdDaGlsZHJlbkZhY3Rvcnkge1xuICAoc2VsZWN0b3I6IFR5cGUgfCBzdHJpbmcpOiBhbnk7XG4gIG5ldyAoc2VsZWN0b3I6IFR5cGUgfCBzdHJpbmcpOiBWaWV3Q2hpbGRyZW5NZXRhZGF0YTtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBWaWV3Q2hpbGRGYWN0b3J5IHtcbiAgKHNlbGVjdG9yOiBUeXBlIHwgc3RyaW5nKTogYW55O1xuICBuZXcgKHNlbGVjdG9yOiBUeXBlIHwgc3RyaW5nKTogVmlld0NoaWxkRmFjdG9yeTtcbn1cblxuXG4vKipcbiAqIHtAbGluayBQaXBlTWV0YWRhdGF9IGZhY3RvcnkgZm9yIGNyZWF0aW5nIGRlY29yYXRvcnMuXG4gKlxuICogIyMjIEV4YW1wbGVcbiAqXG4gKiB7QGV4YW1wbGUgY29yZS90cy9tZXRhZGF0YS9tZXRhZGF0YS50cyByZWdpb249J3BpcGUnfVxuICovXG5leHBvcnQgaW50ZXJmYWNlIFBpcGVGYWN0b3J5IHtcbiAgKG9iajoge25hbWU6IHN0cmluZywgcHVyZT86IGJvb2xlYW59KTogYW55O1xuICBuZXcgKG9iajoge25hbWU6IHN0cmluZywgcHVyZT86IGJvb2xlYW59KTogYW55O1xufVxuXG4vKipcbiAqIHtAbGluayBJbnB1dE1ldGFkYXRhfSBmYWN0b3J5IGZvciBjcmVhdGluZyBkZWNvcmF0b3JzLlxuICpcbiAqIFNlZSB7QGxpbmsgSW5wdXRNZXRhZGF0YX0uXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgSW5wdXRGYWN0b3J5IHtcbiAgKGJpbmRpbmdQcm9wZXJ0eU5hbWU/OiBzdHJpbmcpOiBhbnk7XG4gIG5ldyAoYmluZGluZ1Byb3BlcnR5TmFtZT86IHN0cmluZyk6IGFueTtcbn1cblxuLyoqXG4gKiB7QGxpbmsgT3V0cHV0TWV0YWRhdGF9IGZhY3RvcnkgZm9yIGNyZWF0aW5nIGRlY29yYXRvcnMuXG4gKlxuICogU2VlIHtAbGluayBPdXRwdXRNZXRhZGF0YX0uXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgT3V0cHV0RmFjdG9yeSB7XG4gIChiaW5kaW5nUHJvcGVydHlOYW1lPzogc3RyaW5nKTogYW55O1xuICBuZXcgKGJpbmRpbmdQcm9wZXJ0eU5hbWU/OiBzdHJpbmcpOiBhbnk7XG59XG5cbi8qKlxuICoge0BsaW5rIEhvc3RCaW5kaW5nTWV0YWRhdGF9IGZhY3RvcnkgZnVuY3Rpb24uXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgSG9zdEJpbmRpbmdGYWN0b3J5IHtcbiAgKGhvc3RQcm9wZXJ0eU5hbWU/OiBzdHJpbmcpOiBhbnk7XG4gIG5ldyAoaG9zdFByb3BlcnR5TmFtZT86IHN0cmluZyk6IGFueTtcbn1cblxuLyoqXG4gKiB7QGxpbmsgSG9zdExpc3RlbmVyTWV0YWRhdGF9IGZhY3RvcnkgZnVuY3Rpb24uXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgSG9zdExpc3RlbmVyRmFjdG9yeSB7XG4gIChldmVudE5hbWU6IHN0cmluZywgYXJncz86IHN0cmluZ1tdKTogYW55O1xuICBuZXcgKGV2ZW50TmFtZTogc3RyaW5nLCBhcmdzPzogc3RyaW5nW10pOiBhbnk7XG59XG5cbi8vIFRPRE8oYWxleGVhZ2xlKTogcmVtb3ZlIHRoZSBkdXBsaWNhdGlvbiBvZiB0aGlzIGRvYy4gSXQgaXMgY29waWVkIGZyb20gQ29tcG9uZW50TWV0YWRhdGEuXG4vKipcbiAqIERlY2xhcmUgcmV1c2FibGUgVUkgYnVpbGRpbmcgYmxvY2tzIGZvciBhbiBhcHBsaWNhdGlvbi5cbiAqXG4gKiBFYWNoIEFuZ3VsYXIgY29tcG9uZW50IHJlcXVpcmVzIGEgc2luZ2xlIGBAQ29tcG9uZW50YCBhbmQgYXQgbGVhc3Qgb25lIGBAVmlld2AgYW5ub3RhdGlvbi4gVGhlXG4gKiBgQENvbXBvbmVudGBcbiAqIGFubm90YXRpb24gc3BlY2lmaWVzIHdoZW4gYSBjb21wb25lbnQgaXMgaW5zdGFudGlhdGVkLCBhbmQgd2hpY2ggcHJvcGVydGllcyBhbmQgaG9zdExpc3RlbmVycyBpdFxuICogYmluZHMgdG8uXG4gKlxuICogV2hlbiBhIGNvbXBvbmVudCBpcyBpbnN0YW50aWF0ZWQsIEFuZ3VsYXJcbiAqIC0gY3JlYXRlcyBhIHNoYWRvdyBET00gZm9yIHRoZSBjb21wb25lbnQuXG4gKiAtIGxvYWRzIHRoZSBzZWxlY3RlZCB0ZW1wbGF0ZSBpbnRvIHRoZSBzaGFkb3cgRE9NLlxuICogLSBjcmVhdGVzIGFsbCB0aGUgaW5qZWN0YWJsZSBvYmplY3RzIGNvbmZpZ3VyZWQgd2l0aCBgcHJvdmlkZXJzYCBhbmQgYHZpZXdQcm92aWRlcnNgLlxuICpcbiAqIEFsbCB0ZW1wbGF0ZSBleHByZXNzaW9ucyBhbmQgc3RhdGVtZW50cyBhcmUgdGhlbiBldmFsdWF0ZWQgYWdhaW5zdCB0aGUgY29tcG9uZW50IGluc3RhbmNlLlxuICpcbiAqIEZvciBkZXRhaWxzIG9uIHRoZSBgQFZpZXdgIGFubm90YXRpb24sIHNlZSB7QGxpbmsgVmlld01ldGFkYXRhfS5cbiAqXG4gKiAjIyBMaWZlY3ljbGUgaG9va3NcbiAqXG4gKiBXaGVuIHRoZSBjb21wb25lbnQgY2xhc3MgaW1wbGVtZW50cyBzb21lIHtAbGluayBhbmd1bGFyMi9saWZlY3ljbGVfaG9va3N9IHRoZSBjYWxsYmFja3MgYXJlXG4gKiBjYWxsZWQgYnkgdGhlIGNoYW5nZSBkZXRlY3Rpb24gYXQgZGVmaW5lZCBwb2ludHMgaW4gdGltZSBkdXJpbmcgdGhlIGxpZmUgb2YgdGhlIGNvbXBvbmVudC5cbiAqXG4gKiAjIyMgRXhhbXBsZVxuICpcbiAqIHtAZXhhbXBsZSBjb3JlL3RzL21ldGFkYXRhL21ldGFkYXRhLnRzIHJlZ2lvbj0nY29tcG9uZW50J31cbiAqL1xuZXhwb3J0IHZhciBDb21wb25lbnQ6IENvbXBvbmVudEZhY3RvcnkgPVxuICAgIDxDb21wb25lbnRGYWN0b3J5Pm1ha2VEZWNvcmF0b3IoQ29tcG9uZW50TWV0YWRhdGEsIChmbjogYW55KSA9PiBmbi5WaWV3ID0gVmlldyk7XG5cbi8vIFRPRE8oYWxleGVhZ2xlKTogcmVtb3ZlIHRoZSBkdXBsaWNhdGlvbiBvZiB0aGlzIGRvYy4gSXQgaXMgY29waWVkIGZyb20gRGlyZWN0aXZlTWV0YWRhdGEuXG4vKipcbiAqIERpcmVjdGl2ZXMgYWxsb3cgeW91IHRvIGF0dGFjaCBiZWhhdmlvciB0byBlbGVtZW50cyBpbiB0aGUgRE9NLlxuICpcbiAqIHtAbGluayBEaXJlY3RpdmVNZXRhZGF0YX1zIHdpdGggYW4gZW1iZWRkZWQgdmlldyBhcmUgY2FsbGVkIHtAbGluayBDb21wb25lbnRNZXRhZGF0YX1zLlxuICpcbiAqIEEgZGlyZWN0aXZlIGNvbnNpc3RzIG9mIGEgc2luZ2xlIGRpcmVjdGl2ZSBhbm5vdGF0aW9uIGFuZCBhIGNvbnRyb2xsZXIgY2xhc3MuIFdoZW4gdGhlXG4gKiBkaXJlY3RpdmUncyBgc2VsZWN0b3JgIG1hdGNoZXNcbiAqIGVsZW1lbnRzIGluIHRoZSBET00sIHRoZSBmb2xsb3dpbmcgc3RlcHMgb2NjdXI6XG4gKlxuICogMS4gRm9yIGVhY2ggZGlyZWN0aXZlLCB0aGUgYEVsZW1lbnRJbmplY3RvcmAgYXR0ZW1wdHMgdG8gcmVzb2x2ZSB0aGUgZGlyZWN0aXZlJ3MgY29uc3RydWN0b3JcbiAqIGFyZ3VtZW50cy5cbiAqIDIuIEFuZ3VsYXIgaW5zdGFudGlhdGVzIGRpcmVjdGl2ZXMgZm9yIGVhY2ggbWF0Y2hlZCBlbGVtZW50IHVzaW5nIGBFbGVtZW50SW5qZWN0b3JgIGluIGFcbiAqIGRlcHRoLWZpcnN0IG9yZGVyLFxuICogICAgYXMgZGVjbGFyZWQgaW4gdGhlIEhUTUwuXG4gKlxuICogIyMgVW5kZXJzdGFuZGluZyBIb3cgSW5qZWN0aW9uIFdvcmtzXG4gKlxuICogVGhlcmUgYXJlIHRocmVlIHN0YWdlcyBvZiBpbmplY3Rpb24gcmVzb2x1dGlvbi5cbiAqIC0gKlByZS1leGlzdGluZyBJbmplY3RvcnMqOlxuICogICAtIFRoZSB0ZXJtaW5hbCB7QGxpbmsgSW5qZWN0b3J9IGNhbm5vdCByZXNvbHZlIGRlcGVuZGVuY2llcy4gSXQgZWl0aGVyIHRocm93cyBhbiBlcnJvciBvciwgaWZcbiAqIHRoZSBkZXBlbmRlbmN5IHdhc1xuICogICAgIHNwZWNpZmllZCBhcyBgQE9wdGlvbmFsYCwgcmV0dXJucyBgbnVsbGAuXG4gKiAgIC0gVGhlIHBsYXRmb3JtIGluamVjdG9yIHJlc29sdmVzIGJyb3dzZXIgc2luZ2xldG9uIHJlc291cmNlcywgc3VjaCBhczogY29va2llcywgdGl0bGUsXG4gKiBsb2NhdGlvbiwgYW5kIG90aGVycy5cbiAqIC0gKkNvbXBvbmVudCBJbmplY3RvcnMqOiBFYWNoIGNvbXBvbmVudCBpbnN0YW5jZSBoYXMgaXRzIG93biB7QGxpbmsgSW5qZWN0b3J9LCBhbmQgdGhleSBmb2xsb3dcbiAqIHRoZSBzYW1lIHBhcmVudC1jaGlsZCBoaWVyYXJjaHlcbiAqICAgICBhcyB0aGUgY29tcG9uZW50IGluc3RhbmNlcyBpbiB0aGUgRE9NLlxuICogLSAqRWxlbWVudCBJbmplY3RvcnMqOiBFYWNoIGNvbXBvbmVudCBpbnN0YW5jZSBoYXMgYSBTaGFkb3cgRE9NLiBXaXRoaW4gdGhlIFNoYWRvdyBET00gZWFjaFxuICogZWxlbWVudCBoYXMgYW4gYEVsZW1lbnRJbmplY3RvcmBcbiAqICAgICB3aGljaCBmb2xsb3cgdGhlIHNhbWUgcGFyZW50LWNoaWxkIGhpZXJhcmNoeSBhcyB0aGUgRE9NIGVsZW1lbnRzIHRoZW1zZWx2ZXMuXG4gKlxuICogV2hlbiBhIHRlbXBsYXRlIGlzIGluc3RhbnRpYXRlZCwgaXQgYWxzbyBtdXN0IGluc3RhbnRpYXRlIHRoZSBjb3JyZXNwb25kaW5nIGRpcmVjdGl2ZXMgaW4gYVxuICogZGVwdGgtZmlyc3Qgb3JkZXIuIFRoZVxuICogY3VycmVudCBgRWxlbWVudEluamVjdG9yYCByZXNvbHZlcyB0aGUgY29uc3RydWN0b3IgZGVwZW5kZW5jaWVzIGZvciBlYWNoIGRpcmVjdGl2ZS5cbiAqXG4gKiBBbmd1bGFyIHRoZW4gcmVzb2x2ZXMgZGVwZW5kZW5jaWVzIGFzIGZvbGxvd3MsIGFjY29yZGluZyB0byB0aGUgb3JkZXIgaW4gd2hpY2ggdGhleSBhcHBlYXIgaW4gdGhlXG4gKiB7QGxpbmsgVmlld01ldGFkYXRhfTpcbiAqXG4gKiAxLiBEZXBlbmRlbmNpZXMgb24gdGhlIGN1cnJlbnQgZWxlbWVudFxuICogMi4gRGVwZW5kZW5jaWVzIG9uIGVsZW1lbnQgaW5qZWN0b3JzIGFuZCB0aGVpciBwYXJlbnRzIHVudGlsIGl0IGVuY291bnRlcnMgYSBTaGFkb3cgRE9NIGJvdW5kYXJ5XG4gKiAzLiBEZXBlbmRlbmNpZXMgb24gY29tcG9uZW50IGluamVjdG9ycyBhbmQgdGhlaXIgcGFyZW50cyB1bnRpbCBpdCBlbmNvdW50ZXJzIHRoZSByb290IGNvbXBvbmVudFxuICogNC4gRGVwZW5kZW5jaWVzIG9uIHByZS1leGlzdGluZyBpbmplY3RvcnNcbiAqXG4gKlxuICogVGhlIGBFbGVtZW50SW5qZWN0b3JgIGNhbiBpbmplY3Qgb3RoZXIgZGlyZWN0aXZlcywgZWxlbWVudC1zcGVjaWZpYyBzcGVjaWFsIG9iamVjdHMsIG9yIGl0IGNhblxuICogZGVsZWdhdGUgdG8gdGhlIHBhcmVudFxuICogaW5qZWN0b3IuXG4gKlxuICogVG8gaW5qZWN0IG90aGVyIGRpcmVjdGl2ZXMsIGRlY2xhcmUgdGhlIGNvbnN0cnVjdG9yIHBhcmFtZXRlciBhczpcbiAqIC0gYGRpcmVjdGl2ZTpEaXJlY3RpdmVUeXBlYDogYSBkaXJlY3RpdmUgb24gdGhlIGN1cnJlbnQgZWxlbWVudCBvbmx5XG4gKiAtIGBASG9zdCgpIGRpcmVjdGl2ZTpEaXJlY3RpdmVUeXBlYDogYW55IGRpcmVjdGl2ZSB0aGF0IG1hdGNoZXMgdGhlIHR5cGUgYmV0d2VlbiB0aGUgY3VycmVudFxuICogZWxlbWVudCBhbmQgdGhlXG4gKiAgICBTaGFkb3cgRE9NIHJvb3QuXG4gKiAtIGBAUXVlcnkoRGlyZWN0aXZlVHlwZSkgcXVlcnk6UXVlcnlMaXN0PERpcmVjdGl2ZVR5cGU+YDogQSBsaXZlIGNvbGxlY3Rpb24gb2YgZGlyZWN0IGNoaWxkXG4gKiBkaXJlY3RpdmVzLlxuICogLSBgQFF1ZXJ5RGVzY2VuZGFudHMoRGlyZWN0aXZlVHlwZSkgcXVlcnk6UXVlcnlMaXN0PERpcmVjdGl2ZVR5cGU+YDogQSBsaXZlIGNvbGxlY3Rpb24gb2YgYW55XG4gKiBjaGlsZCBkaXJlY3RpdmVzLlxuICpcbiAqIFRvIGluamVjdCBlbGVtZW50LXNwZWNpZmljIHNwZWNpYWwgb2JqZWN0cywgZGVjbGFyZSB0aGUgY29uc3RydWN0b3IgcGFyYW1ldGVyIGFzOlxuICogLSBgZWxlbWVudDogRWxlbWVudFJlZmAgdG8gb2J0YWluIGEgcmVmZXJlbmNlIHRvIGxvZ2ljYWwgZWxlbWVudCBpbiB0aGUgdmlldy5cbiAqIC0gYHZpZXdDb250YWluZXI6IFZpZXdDb250YWluZXJSZWZgIHRvIGNvbnRyb2wgY2hpbGQgdGVtcGxhdGUgaW5zdGFudGlhdGlvbiwgZm9yXG4gKiB7QGxpbmsgRGlyZWN0aXZlTWV0YWRhdGF9IGRpcmVjdGl2ZXMgb25seVxuICogLSBgYmluZGluZ1Byb3BhZ2F0aW9uOiBCaW5kaW5nUHJvcGFnYXRpb25gIHRvIGNvbnRyb2wgY2hhbmdlIGRldGVjdGlvbiBpbiBhIG1vcmUgZ3JhbnVsYXIgd2F5LlxuICpcbiAqICMjIyBFeGFtcGxlXG4gKlxuICogVGhlIGZvbGxvd2luZyBleGFtcGxlIGRlbW9uc3RyYXRlcyBob3cgZGVwZW5kZW5jeSBpbmplY3Rpb24gcmVzb2x2ZXMgY29uc3RydWN0b3IgYXJndW1lbnRzIGluXG4gKiBwcmFjdGljZS5cbiAqXG4gKlxuICogQXNzdW1lIHRoaXMgSFRNTCB0ZW1wbGF0ZTpcbiAqXG4gKiBgYGBcbiAqIDxkaXYgZGVwZW5kZW5jeT1cIjFcIj5cbiAqICAgPGRpdiBkZXBlbmRlbmN5PVwiMlwiPlxuICogICAgIDxkaXYgZGVwZW5kZW5jeT1cIjNcIiBteS1kaXJlY3RpdmU+XG4gKiAgICAgICA8ZGl2IGRlcGVuZGVuY3k9XCI0XCI+XG4gKiAgICAgICAgIDxkaXYgZGVwZW5kZW5jeT1cIjVcIj48L2Rpdj5cbiAqICAgICAgIDwvZGl2PlxuICogICAgICAgPGRpdiBkZXBlbmRlbmN5PVwiNlwiPjwvZGl2PlxuICogICAgIDwvZGl2PlxuICogICA8L2Rpdj5cbiAqIDwvZGl2PlxuICogYGBgXG4gKlxuICogV2l0aCB0aGUgZm9sbG93aW5nIGBkZXBlbmRlbmN5YCBkZWNvcmF0b3IgYW5kIGBTb21lU2VydmljZWAgaW5qZWN0YWJsZSBjbGFzcy5cbiAqXG4gKiBgYGBcbiAqIEBJbmplY3RhYmxlKClcbiAqIGNsYXNzIFNvbWVTZXJ2aWNlIHtcbiAqIH1cbiAqXG4gKiBARGlyZWN0aXZlKHtcbiAqICAgc2VsZWN0b3I6ICdbZGVwZW5kZW5jeV0nLFxuICogICBpbnB1dHM6IFtcbiAqICAgICAnaWQ6IGRlcGVuZGVuY3knXG4gKiAgIF1cbiAqIH0pXG4gKiBjbGFzcyBEZXBlbmRlbmN5IHtcbiAqICAgaWQ6c3RyaW5nO1xuICogfVxuICogYGBgXG4gKlxuICogTGV0J3Mgc3RlcCB0aHJvdWdoIHRoZSBkaWZmZXJlbnQgd2F5cyBpbiB3aGljaCBgTXlEaXJlY3RpdmVgIGNvdWxkIGJlIGRlY2xhcmVkLi4uXG4gKlxuICpcbiAqICMjIyBObyBpbmplY3Rpb25cbiAqXG4gKiBIZXJlIHRoZSBjb25zdHJ1Y3RvciBpcyBkZWNsYXJlZCB3aXRoIG5vIGFyZ3VtZW50cywgdGhlcmVmb3JlIG5vdGhpbmcgaXMgaW5qZWN0ZWQgaW50b1xuICogYE15RGlyZWN0aXZlYC5cbiAqXG4gKiBgYGBcbiAqIEBEaXJlY3RpdmUoeyBzZWxlY3RvcjogJ1tteS1kaXJlY3RpdmVdJyB9KVxuICogY2xhc3MgTXlEaXJlY3RpdmUge1xuICogICBjb25zdHJ1Y3RvcigpIHtcbiAqICAgfVxuICogfVxuICogYGBgXG4gKlxuICogVGhpcyBkaXJlY3RpdmUgd291bGQgYmUgaW5zdGFudGlhdGVkIHdpdGggbm8gZGVwZW5kZW5jaWVzLlxuICpcbiAqXG4gKiAjIyMgQ29tcG9uZW50LWxldmVsIGluamVjdGlvblxuICpcbiAqIERpcmVjdGl2ZXMgY2FuIGluamVjdCBhbnkgaW5qZWN0YWJsZSBpbnN0YW5jZSBmcm9tIHRoZSBjbG9zZXN0IGNvbXBvbmVudCBpbmplY3RvciBvciBhbnkgb2YgaXRzXG4gKiBwYXJlbnRzLlxuICpcbiAqIEhlcmUsIHRoZSBjb25zdHJ1Y3RvciBkZWNsYXJlcyBhIHBhcmFtZXRlciwgYHNvbWVTZXJ2aWNlYCwgYW5kIGluamVjdHMgdGhlIGBTb21lU2VydmljZWAgdHlwZVxuICogZnJvbSB0aGUgcGFyZW50XG4gKiBjb21wb25lbnQncyBpbmplY3Rvci5cbiAqIGBgYFxuICogQERpcmVjdGl2ZSh7IHNlbGVjdG9yOiAnW215LWRpcmVjdGl2ZV0nIH0pXG4gKiBjbGFzcyBNeURpcmVjdGl2ZSB7XG4gKiAgIGNvbnN0cnVjdG9yKHNvbWVTZXJ2aWNlOiBTb21lU2VydmljZSkge1xuICogICB9XG4gKiB9XG4gKiBgYGBcbiAqXG4gKiBUaGlzIGRpcmVjdGl2ZSB3b3VsZCBiZSBpbnN0YW50aWF0ZWQgd2l0aCBhIGRlcGVuZGVuY3kgb24gYFNvbWVTZXJ2aWNlYC5cbiAqXG4gKlxuICogIyMjIEluamVjdGluZyBhIGRpcmVjdGl2ZSBmcm9tIHRoZSBjdXJyZW50IGVsZW1lbnRcbiAqXG4gKiBEaXJlY3RpdmVzIGNhbiBpbmplY3Qgb3RoZXIgZGlyZWN0aXZlcyBkZWNsYXJlZCBvbiB0aGUgY3VycmVudCBlbGVtZW50LlxuICpcbiAqIGBgYFxuICogQERpcmVjdGl2ZSh7IHNlbGVjdG9yOiAnW215LWRpcmVjdGl2ZV0nIH0pXG4gKiBjbGFzcyBNeURpcmVjdGl2ZSB7XG4gKiAgIGNvbnN0cnVjdG9yKGRlcGVuZGVuY3k6IERlcGVuZGVuY3kpIHtcbiAqICAgICBleHBlY3QoZGVwZW5kZW5jeS5pZCkudG9FcXVhbCgzKTtcbiAqICAgfVxuICogfVxuICogYGBgXG4gKiBUaGlzIGRpcmVjdGl2ZSB3b3VsZCBiZSBpbnN0YW50aWF0ZWQgd2l0aCBgRGVwZW5kZW5jeWAgZGVjbGFyZWQgYXQgdGhlIHNhbWUgZWxlbWVudCwgaW4gdGhpcyBjYXNlXG4gKiBgZGVwZW5kZW5jeT1cIjNcImAuXG4gKlxuICogIyMjIEluamVjdGluZyBhIGRpcmVjdGl2ZSBmcm9tIGFueSBhbmNlc3RvciBlbGVtZW50c1xuICpcbiAqIERpcmVjdGl2ZXMgY2FuIGluamVjdCBvdGhlciBkaXJlY3RpdmVzIGRlY2xhcmVkIG9uIGFueSBhbmNlc3RvciBlbGVtZW50IChpbiB0aGUgY3VycmVudCBTaGFkb3dcbiAqIERPTSksIGkuZS4gb24gdGhlIGN1cnJlbnQgZWxlbWVudCwgdGhlXG4gKiBwYXJlbnQgZWxlbWVudCwgb3IgaXRzIHBhcmVudHMuXG4gKiBgYGBcbiAqIEBEaXJlY3RpdmUoeyBzZWxlY3RvcjogJ1tteS1kaXJlY3RpdmVdJyB9KVxuICogY2xhc3MgTXlEaXJlY3RpdmUge1xuICogICBjb25zdHJ1Y3RvcihASG9zdCgpIGRlcGVuZGVuY3k6IERlcGVuZGVuY3kpIHtcbiAqICAgICBleHBlY3QoZGVwZW5kZW5jeS5pZCkudG9FcXVhbCgyKTtcbiAqICAgfVxuICogfVxuICogYGBgXG4gKlxuICogYEBIb3N0YCBjaGVja3MgdGhlIGN1cnJlbnQgZWxlbWVudCwgdGhlIHBhcmVudCwgYXMgd2VsbCBhcyBpdHMgcGFyZW50cyByZWN1cnNpdmVseS4gSWZcbiAqIGBkZXBlbmRlbmN5PVwiMlwiYCBkaWRuJ3RcbiAqIGV4aXN0IG9uIHRoZSBkaXJlY3QgcGFyZW50LCB0aGlzIGluamVjdGlvbiB3b3VsZFxuICogaGF2ZSByZXR1cm5lZFxuICogYGRlcGVuZGVuY3k9XCIxXCJgLlxuICpcbiAqXG4gKiAjIyMgSW5qZWN0aW5nIGEgbGl2ZSBjb2xsZWN0aW9uIG9mIGRpcmVjdCBjaGlsZCBkaXJlY3RpdmVzXG4gKlxuICpcbiAqIEEgZGlyZWN0aXZlIGNhbiBhbHNvIHF1ZXJ5IGZvciBvdGhlciBjaGlsZCBkaXJlY3RpdmVzLiBTaW5jZSBwYXJlbnQgZGlyZWN0aXZlcyBhcmUgaW5zdGFudGlhdGVkXG4gKiBiZWZvcmUgY2hpbGQgZGlyZWN0aXZlcywgYSBkaXJlY3RpdmUgY2FuJ3Qgc2ltcGx5IGluamVjdCB0aGUgbGlzdCBvZiBjaGlsZCBkaXJlY3RpdmVzLiBJbnN0ZWFkLFxuICogdGhlIGRpcmVjdGl2ZSBpbmplY3RzIGEge0BsaW5rIFF1ZXJ5TGlzdH0sIHdoaWNoIHVwZGF0ZXMgaXRzIGNvbnRlbnRzIGFzIGNoaWxkcmVuIGFyZSBhZGRlZCxcbiAqIHJlbW92ZWQsIG9yIG1vdmVkIGJ5IGEgZGlyZWN0aXZlIHRoYXQgdXNlcyBhIHtAbGluayBWaWV3Q29udGFpbmVyUmVmfSBzdWNoIGFzIGEgYG5nRm9yYCwgYW5cbiAqIGBuZ0lmYCwgb3IgYW4gYG5nU3dpdGNoYC5cbiAqXG4gKiBgYGBcbiAqIEBEaXJlY3RpdmUoeyBzZWxlY3RvcjogJ1tteS1kaXJlY3RpdmVdJyB9KVxuICogY2xhc3MgTXlEaXJlY3RpdmUge1xuICogICBjb25zdHJ1Y3RvcihAUXVlcnkoRGVwZW5kZW5jeSkgZGVwZW5kZW5jaWVzOlF1ZXJ5TGlzdDxEZXBlbmRlbmN5Pikge1xuICogICB9XG4gKiB9XG4gKiBgYGBcbiAqXG4gKiBUaGlzIGRpcmVjdGl2ZSB3b3VsZCBiZSBpbnN0YW50aWF0ZWQgd2l0aCBhIHtAbGluayBRdWVyeUxpc3R9IHdoaWNoIGNvbnRhaW5zIGBEZXBlbmRlbmN5YCA0IGFuZFxuICogNi4gSGVyZSwgYERlcGVuZGVuY3lgIDUgd291bGQgbm90IGJlIGluY2x1ZGVkLCBiZWNhdXNlIGl0IGlzIG5vdCBhIGRpcmVjdCBjaGlsZC5cbiAqXG4gKiAjIyMgSW5qZWN0aW5nIGEgbGl2ZSBjb2xsZWN0aW9uIG9mIGRlc2NlbmRhbnQgZGlyZWN0aXZlc1xuICpcbiAqIEJ5IHBhc3NpbmcgdGhlIGRlc2NlbmRhbnQgZmxhZyB0byBgQFF1ZXJ5YCBhYm92ZSwgd2UgY2FuIGluY2x1ZGUgdGhlIGNoaWxkcmVuIG9mIHRoZSBjaGlsZFxuICogZWxlbWVudHMuXG4gKlxuICogYGBgXG4gKiBARGlyZWN0aXZlKHsgc2VsZWN0b3I6ICdbbXktZGlyZWN0aXZlXScgfSlcbiAqIGNsYXNzIE15RGlyZWN0aXZlIHtcbiAqICAgY29uc3RydWN0b3IoQFF1ZXJ5KERlcGVuZGVuY3ksIHtkZXNjZW5kYW50czogdHJ1ZX0pIGRlcGVuZGVuY2llczpRdWVyeUxpc3Q8RGVwZW5kZW5jeT4pIHtcbiAqICAgfVxuICogfVxuICogYGBgXG4gKlxuICogVGhpcyBkaXJlY3RpdmUgd291bGQgYmUgaW5zdGFudGlhdGVkIHdpdGggYSBRdWVyeSB3aGljaCB3b3VsZCBjb250YWluIGBEZXBlbmRlbmN5YCA0LCA1IGFuZCA2LlxuICpcbiAqICMjIyBPcHRpb25hbCBpbmplY3Rpb25cbiAqXG4gKiBUaGUgbm9ybWFsIGJlaGF2aW9yIG9mIGRpcmVjdGl2ZXMgaXMgdG8gcmV0dXJuIGFuIGVycm9yIHdoZW4gYSBzcGVjaWZpZWQgZGVwZW5kZW5jeSBjYW5ub3QgYmVcbiAqIHJlc29sdmVkLiBJZiB5b3VcbiAqIHdvdWxkIGxpa2UgdG8gaW5qZWN0IGBudWxsYCBvbiB1bnJlc29sdmVkIGRlcGVuZGVuY3kgaW5zdGVhZCwgeW91IGNhbiBhbm5vdGF0ZSB0aGF0IGRlcGVuZGVuY3lcbiAqIHdpdGggYEBPcHRpb25hbCgpYC5cbiAqIFRoaXMgZXhwbGljaXRseSBwZXJtaXRzIHRoZSBhdXRob3Igb2YgYSB0ZW1wbGF0ZSB0byB0cmVhdCBzb21lIG9mIHRoZSBzdXJyb3VuZGluZyBkaXJlY3RpdmVzIGFzXG4gKiBvcHRpb25hbC5cbiAqXG4gKiBgYGBcbiAqIEBEaXJlY3RpdmUoeyBzZWxlY3RvcjogJ1tteS1kaXJlY3RpdmVdJyB9KVxuICogY2xhc3MgTXlEaXJlY3RpdmUge1xuICogICBjb25zdHJ1Y3RvcihAT3B0aW9uYWwoKSBkZXBlbmRlbmN5OkRlcGVuZGVuY3kpIHtcbiAqICAgfVxuICogfVxuICogYGBgXG4gKlxuICogVGhpcyBkaXJlY3RpdmUgd291bGQgYmUgaW5zdGFudGlhdGVkIHdpdGggYSBgRGVwZW5kZW5jeWAgZGlyZWN0aXZlIGZvdW5kIG9uIHRoZSBjdXJyZW50IGVsZW1lbnQuXG4gKiBJZiBub25lIGNhbiBiZVxuICogZm91bmQsIHRoZSBpbmplY3RvciBzdXBwbGllcyBgbnVsbGAgaW5zdGVhZCBvZiB0aHJvd2luZyBhbiBlcnJvci5cbiAqXG4gKiAjIyMgRXhhbXBsZVxuICpcbiAqIEhlcmUgd2UgdXNlIGEgZGVjb3JhdG9yIGRpcmVjdGl2ZSB0byBzaW1wbHkgZGVmaW5lIGJhc2ljIHRvb2wtdGlwIGJlaGF2aW9yLlxuICpcbiAqIGBgYFxuICogQERpcmVjdGl2ZSh7XG4gKiAgIHNlbGVjdG9yOiAnW3Rvb2x0aXBdJyxcbiAqICAgaW5wdXRzOiBbXG4gKiAgICAgJ3RleHQ6IHRvb2x0aXAnXG4gKiAgIF0sXG4gKiAgIGhvc3Q6IHtcbiAqICAgICAnKG1vdXNlZW50ZXIpJzogJ29uTW91c2VFbnRlcigpJyxcbiAqICAgICAnKG1vdXNlbGVhdmUpJzogJ29uTW91c2VMZWF2ZSgpJ1xuICogICB9XG4gKiB9KVxuICogY2xhc3MgVG9vbHRpcHtcbiAqICAgdGV4dDpzdHJpbmc7XG4gKiAgIG92ZXJsYXk6T3ZlcmxheTsgLy8gTk9UIFlFVCBJTVBMRU1FTlRFRFxuICogICBvdmVybGF5TWFuYWdlcjpPdmVybGF5TWFuYWdlcjsgLy8gTk9UIFlFVCBJTVBMRU1FTlRFRFxuICpcbiAqICAgY29uc3RydWN0b3Iob3ZlcmxheU1hbmFnZXI6T3ZlcmxheU1hbmFnZXIpIHtcbiAqICAgICB0aGlzLm92ZXJsYXkgPSBvdmVybGF5O1xuICogICB9XG4gKlxuICogICBvbk1vdXNlRW50ZXIoKSB7XG4gKiAgICAgLy8gZXhhY3Qgc2lnbmF0dXJlIHRvIGJlIGRldGVybWluZWRcbiAqICAgICB0aGlzLm92ZXJsYXkgPSB0aGlzLm92ZXJsYXlNYW5hZ2VyLm9wZW4odGV4dCwgLi4uKTtcbiAqICAgfVxuICpcbiAqICAgb25Nb3VzZUxlYXZlKCkge1xuICogICAgIHRoaXMub3ZlcmxheS5jbG9zZSgpO1xuICogICAgIHRoaXMub3ZlcmxheSA9IG51bGw7XG4gKiAgIH1cbiAqIH1cbiAqIGBgYFxuICogSW4gb3VyIEhUTUwgdGVtcGxhdGUsIHdlIGNhbiB0aGVuIGFkZCB0aGlzIGJlaGF2aW9yIHRvIGEgYDxkaXY+YCBvciBhbnkgb3RoZXIgZWxlbWVudCB3aXRoIHRoZVxuICogYHRvb2x0aXBgIHNlbGVjdG9yLFxuICogbGlrZSBzbzpcbiAqXG4gKiBgYGBcbiAqIDxkaXYgdG9vbHRpcD1cInNvbWUgdGV4dCBoZXJlXCI+PC9kaXY+XG4gKiBgYGBcbiAqXG4gKiBEaXJlY3RpdmVzIGNhbiBhbHNvIGNvbnRyb2wgdGhlIGluc3RhbnRpYXRpb24sIGRlc3RydWN0aW9uLCBhbmQgcG9zaXRpb25pbmcgb2YgaW5saW5lIHRlbXBsYXRlXG4gKiBlbGVtZW50czpcbiAqXG4gKiBBIGRpcmVjdGl2ZSB1c2VzIGEge0BsaW5rIFZpZXdDb250YWluZXJSZWZ9IHRvIGluc3RhbnRpYXRlLCBpbnNlcnQsIG1vdmUsIGFuZCBkZXN0cm95IHZpZXdzIGF0XG4gKiBydW50aW1lLlxuICogVGhlIHtAbGluayBWaWV3Q29udGFpbmVyUmVmfSBpcyBjcmVhdGVkIGFzIGEgcmVzdWx0IG9mIGA8dGVtcGxhdGU+YCBlbGVtZW50LCBhbmQgcmVwcmVzZW50cyBhXG4gKiBsb2NhdGlvbiBpbiB0aGUgY3VycmVudCB2aWV3XG4gKiB3aGVyZSB0aGVzZSBhY3Rpb25zIGFyZSBwZXJmb3JtZWQuXG4gKlxuICogVmlld3MgYXJlIGFsd2F5cyBjcmVhdGVkIGFzIGNoaWxkcmVuIG9mIHRoZSBjdXJyZW50IHtAbGluayBWaWV3TWV0YWRhdGF9LCBhbmQgYXMgc2libGluZ3Mgb2YgdGhlXG4gKiBgPHRlbXBsYXRlPmAgZWxlbWVudC4gVGh1cyBhXG4gKiBkaXJlY3RpdmUgaW4gYSBjaGlsZCB2aWV3IGNhbm5vdCBpbmplY3QgdGhlIGRpcmVjdGl2ZSB0aGF0IGNyZWF0ZWQgaXQuXG4gKlxuICogU2luY2UgZGlyZWN0aXZlcyB0aGF0IGNyZWF0ZSB2aWV3cyB2aWEgVmlld0NvbnRhaW5lcnMgYXJlIGNvbW1vbiBpbiBBbmd1bGFyLCBhbmQgdXNpbmcgdGhlIGZ1bGxcbiAqIGA8dGVtcGxhdGU+YCBlbGVtZW50IHN5bnRheCBpcyB3b3JkeSwgQW5ndWxhclxuICogYWxzbyBzdXBwb3J0cyBhIHNob3J0aGFuZCBub3RhdGlvbjogYDxsaSAqZm9vPVwiYmFyXCI+YCBhbmQgYDxsaSB0ZW1wbGF0ZT1cImZvbzogYmFyXCI+YCBhcmVcbiAqIGVxdWl2YWxlbnQuXG4gKlxuICogVGh1cyxcbiAqXG4gKiBgYGBcbiAqIDx1bD5cbiAqICAgPGxpICpmb289XCJiYXJcIiB0aXRsZT1cInRleHRcIj48L2xpPlxuICogPC91bD5cbiAqIGBgYFxuICpcbiAqIEV4cGFuZHMgaW4gdXNlIHRvOlxuICpcbiAqIGBgYFxuICogPHVsPlxuICogICA8dGVtcGxhdGUgW2Zvb109XCJiYXJcIj5cbiAqICAgICA8bGkgdGl0bGU9XCJ0ZXh0XCI+PC9saT5cbiAqICAgPC90ZW1wbGF0ZT5cbiAqIDwvdWw+XG4gKiBgYGBcbiAqXG4gKiBOb3RpY2UgdGhhdCBhbHRob3VnaCB0aGUgc2hvcnRoYW5kIHBsYWNlcyBgKmZvbz1cImJhclwiYCB3aXRoaW4gdGhlIGA8bGk+YCBlbGVtZW50LCB0aGUgYmluZGluZyBmb3JcbiAqIHRoZSBkaXJlY3RpdmVcbiAqIGNvbnRyb2xsZXIgaXMgY29ycmVjdGx5IGluc3RhbnRpYXRlZCBvbiB0aGUgYDx0ZW1wbGF0ZT5gIGVsZW1lbnQgcmF0aGVyIHRoYW4gdGhlIGA8bGk+YCBlbGVtZW50LlxuICpcbiAqICMjIExpZmVjeWNsZSBob29rc1xuICpcbiAqIFdoZW4gdGhlIGRpcmVjdGl2ZSBjbGFzcyBpbXBsZW1lbnRzIHNvbWUge0BsaW5rIGFuZ3VsYXIyL2xpZmVjeWNsZV9ob29rc30gdGhlIGNhbGxiYWNrcyBhcmVcbiAqIGNhbGxlZCBieSB0aGUgY2hhbmdlIGRldGVjdGlvbiBhdCBkZWZpbmVkIHBvaW50cyBpbiB0aW1lIGR1cmluZyB0aGUgbGlmZSBvZiB0aGUgZGlyZWN0aXZlLlxuICpcbiAqICMjIyBFeGFtcGxlXG4gKlxuICogTGV0J3Mgc3VwcG9zZSB3ZSB3YW50IHRvIGltcGxlbWVudCB0aGUgYHVubGVzc2AgYmVoYXZpb3IsIHRvIGNvbmRpdGlvbmFsbHkgaW5jbHVkZSBhIHRlbXBsYXRlLlxuICpcbiAqIEhlcmUgaXMgYSBzaW1wbGUgZGlyZWN0aXZlIHRoYXQgdHJpZ2dlcnMgb24gYW4gYHVubGVzc2Agc2VsZWN0b3I6XG4gKlxuICogYGBgXG4gKiBARGlyZWN0aXZlKHtcbiAqICAgc2VsZWN0b3I6ICdbdW5sZXNzXScsXG4gKiAgIGlucHV0czogWyd1bmxlc3MnXVxuICogfSlcbiAqIGV4cG9ydCBjbGFzcyBVbmxlc3Mge1xuICogICB2aWV3Q29udGFpbmVyOiBWaWV3Q29udGFpbmVyUmVmO1xuICogICB0ZW1wbGF0ZVJlZjogVGVtcGxhdGVSZWY7XG4gKiAgIHByZXZDb25kaXRpb246IGJvb2xlYW47XG4gKlxuICogICBjb25zdHJ1Y3Rvcih2aWV3Q29udGFpbmVyOiBWaWV3Q29udGFpbmVyUmVmLCB0ZW1wbGF0ZVJlZjogVGVtcGxhdGVSZWYpIHtcbiAqICAgICB0aGlzLnZpZXdDb250YWluZXIgPSB2aWV3Q29udGFpbmVyO1xuICogICAgIHRoaXMudGVtcGxhdGVSZWYgPSB0ZW1wbGF0ZVJlZjtcbiAqICAgICB0aGlzLnByZXZDb25kaXRpb24gPSBudWxsO1xuICogICB9XG4gKlxuICogICBzZXQgdW5sZXNzKG5ld0NvbmRpdGlvbikge1xuICogICAgIGlmIChuZXdDb25kaXRpb24gJiYgKGlzQmxhbmsodGhpcy5wcmV2Q29uZGl0aW9uKSB8fCAhdGhpcy5wcmV2Q29uZGl0aW9uKSkge1xuICogICAgICAgdGhpcy5wcmV2Q29uZGl0aW9uID0gdHJ1ZTtcbiAqICAgICAgIHRoaXMudmlld0NvbnRhaW5lci5jbGVhcigpO1xuICogICAgIH0gZWxzZSBpZiAoIW5ld0NvbmRpdGlvbiAmJiAoaXNCbGFuayh0aGlzLnByZXZDb25kaXRpb24pIHx8IHRoaXMucHJldkNvbmRpdGlvbikpIHtcbiAqICAgICAgIHRoaXMucHJldkNvbmRpdGlvbiA9IGZhbHNlO1xuICogICAgICAgdGhpcy52aWV3Q29udGFpbmVyLmNyZWF0ZSh0aGlzLnRlbXBsYXRlUmVmKTtcbiAqICAgICB9XG4gKiAgIH1cbiAqIH1cbiAqIGBgYFxuICpcbiAqIFdlIGNhbiB0aGVuIHVzZSB0aGlzIGB1bmxlc3NgIHNlbGVjdG9yIGluIGEgdGVtcGxhdGU6XG4gKiBgYGBcbiAqIDx1bD5cbiAqICAgPGxpICp1bmxlc3M9XCJleHByXCI+PC9saT5cbiAqIDwvdWw+XG4gKiBgYGBcbiAqXG4gKiBPbmNlIHRoZSBkaXJlY3RpdmUgaW5zdGFudGlhdGVzIHRoZSBjaGlsZCB2aWV3LCB0aGUgc2hvcnRoYW5kIG5vdGF0aW9uIGZvciB0aGUgdGVtcGxhdGUgZXhwYW5kc1xuICogYW5kIHRoZSByZXN1bHQgaXM6XG4gKlxuICogYGBgXG4gKiA8dWw+XG4gKiAgIDx0ZW1wbGF0ZSBbdW5sZXNzXT1cImV4cFwiPlxuICogICAgIDxsaT48L2xpPlxuICogICA8L3RlbXBsYXRlPlxuICogICA8bGk+PC9saT5cbiAqIDwvdWw+XG4gKiBgYGBcbiAqXG4gKiBOb3RlIGFsc28gdGhhdCBhbHRob3VnaCB0aGUgYDxsaT48L2xpPmAgdGVtcGxhdGUgc3RpbGwgZXhpc3RzIGluc2lkZSB0aGUgYDx0ZW1wbGF0ZT48L3RlbXBsYXRlPmAsXG4gKiB0aGUgaW5zdGFudGlhdGVkXG4gKiB2aWV3IG9jY3VycyBvbiB0aGUgc2Vjb25kIGA8bGk+PC9saT5gIHdoaWNoIGlzIGEgc2libGluZyB0byB0aGUgYDx0ZW1wbGF0ZT5gIGVsZW1lbnQuXG4gKi9cbmV4cG9ydCB2YXIgRGlyZWN0aXZlOiBEaXJlY3RpdmVGYWN0b3J5ID0gPERpcmVjdGl2ZUZhY3Rvcnk+bWFrZURlY29yYXRvcihEaXJlY3RpdmVNZXRhZGF0YSk7XG5cbi8vIFRPRE8oYWxleGVhZ2xlKTogcmVtb3ZlIHRoZSBkdXBsaWNhdGlvbiBvZiB0aGlzIGRvYy4gSXQgaXMgY29waWVkIGZyb20gVmlld01ldGFkYXRhLlxuLyoqXG4gKiBNZXRhZGF0YSBwcm9wZXJ0aWVzIGF2YWlsYWJsZSBmb3IgY29uZmlndXJpbmcgVmlld3MuXG4gKlxuICogRWFjaCBBbmd1bGFyIGNvbXBvbmVudCByZXF1aXJlcyBhIHNpbmdsZSBgQENvbXBvbmVudGAgYW5kIGF0IGxlYXN0IG9uZSBgQFZpZXdgIGFubm90YXRpb24uIFRoZVxuICogYEBWaWV3YCBhbm5vdGF0aW9uIHNwZWNpZmllcyB0aGUgSFRNTCB0ZW1wbGF0ZSB0byB1c2UsIGFuZCBsaXN0cyB0aGUgZGlyZWN0aXZlcyB0aGF0IGFyZSBhY3RpdmVcbiAqIHdpdGhpbiB0aGUgdGVtcGxhdGUuXG4gKlxuICogV2hlbiBhIGNvbXBvbmVudCBpcyBpbnN0YW50aWF0ZWQsIHRoZSB0ZW1wbGF0ZSBpcyBsb2FkZWQgaW50byB0aGUgY29tcG9uZW50J3Mgc2hhZG93IHJvb3QsIGFuZFxuICogdGhlIGV4cHJlc3Npb25zIGFuZCBzdGF0ZW1lbnRzIGluIHRoZSB0ZW1wbGF0ZSBhcmUgZXZhbHVhdGVkIGFnYWluc3QgdGhlIGNvbXBvbmVudC5cbiAqXG4gKiBGb3IgZGV0YWlscyBvbiB0aGUgYEBDb21wb25lbnRgIGFubm90YXRpb24sIHNlZSB7QGxpbmsgQ29tcG9uZW50TWV0YWRhdGF9LlxuICpcbiAqICMjIyBFeGFtcGxlXG4gKlxuICogYGBgXG4gKiBAQ29tcG9uZW50KHtcbiAqICAgc2VsZWN0b3I6ICdncmVldCcsXG4gKiAgIHRlbXBsYXRlOiAnSGVsbG8ge3tuYW1lfX0hJyxcbiAqICAgZGlyZWN0aXZlczogW0dyZWV0VXNlciwgQm9sZF1cbiAqIH0pXG4gKiBjbGFzcyBHcmVldCB7XG4gKiAgIG5hbWU6IHN0cmluZztcbiAqXG4gKiAgIGNvbnN0cnVjdG9yKCkge1xuICogICAgIHRoaXMubmFtZSA9ICdXb3JsZCc7XG4gKiAgIH1cbiAqIH1cbiAqIGBgYFxuICovXG5leHBvcnQgdmFyIFZpZXc6IFZpZXdGYWN0b3J5ID1cbiAgICA8Vmlld0ZhY3Rvcnk+bWFrZURlY29yYXRvcihWaWV3TWV0YWRhdGEsIChmbjogYW55KSA9PiBmbi5WaWV3ID0gVmlldyk7XG5cbi8qKlxuICogU3BlY2lmaWVzIHRoYXQgYSBjb25zdGFudCBhdHRyaWJ1dGUgdmFsdWUgc2hvdWxkIGJlIGluamVjdGVkLlxuICpcbiAqIFRoZSBkaXJlY3RpdmUgY2FuIGluamVjdCBjb25zdGFudCBzdHJpbmcgbGl0ZXJhbHMgb2YgaG9zdCBlbGVtZW50IGF0dHJpYnV0ZXMuXG4gKlxuICogIyMjIEV4YW1wbGVcbiAqXG4gKiBTdXBwb3NlIHdlIGhhdmUgYW4gYDxpbnB1dD5gIGVsZW1lbnQgYW5kIHdhbnQgdG8ga25vdyBpdHMgYHR5cGVgLlxuICpcbiAqIGBgYGh0bWxcbiAqIDxpbnB1dCB0eXBlPVwidGV4dFwiPlxuICogYGBgXG4gKlxuICogQSBkZWNvcmF0b3IgY2FuIGluamVjdCBzdHJpbmcgbGl0ZXJhbCBgdGV4dGAgbGlrZSBzbzpcbiAqXG4gKiB7QGV4YW1wbGUgY29yZS90cy9tZXRhZGF0YS9tZXRhZGF0YS50cyByZWdpb249J2F0dHJpYnV0ZU1ldGFkYXRhJ31cbiAqL1xuZXhwb3J0IHZhciBBdHRyaWJ1dGU6IEF0dHJpYnV0ZUZhY3RvcnkgPSBtYWtlUGFyYW1EZWNvcmF0b3IoQXR0cmlidXRlTWV0YWRhdGEpO1xuXG4vLyBUT0RPKGFsZXhlYWdsZSk6IHJlbW92ZSB0aGUgZHVwbGljYXRpb24gb2YgdGhpcyBkb2MuIEl0IGlzIGNvcGllZCBmcm9tIFF1ZXJ5TWV0YWRhdGEuXG4vKipcbiAqIERlY2xhcmVzIGFuIGluamVjdGFibGUgcGFyYW1ldGVyIHRvIGJlIGEgbGl2ZSBsaXN0IG9mIGRpcmVjdGl2ZXMgb3IgdmFyaWFibGVcbiAqIGJpbmRpbmdzIGZyb20gdGhlIGNvbnRlbnQgY2hpbGRyZW4gb2YgYSBkaXJlY3RpdmUuXG4gKlxuICogIyMjIEV4YW1wbGUgKFtsaXZlIGRlbW9dKGh0dHA6Ly9wbG5rci5jby9lZGl0L2xZOW04SEx5N3owNnZEb1VhU04yP3A9cHJldmlldykpXG4gKlxuICogQXNzdW1lIHRoYXQgYDx0YWJzPmAgY29tcG9uZW50IHdvdWxkIGxpa2UgdG8gZ2V0IGEgbGlzdCBpdHMgY2hpbGRyZW4gYDxwYW5lPmBcbiAqIGNvbXBvbmVudHMgYXMgc2hvd24gaW4gdGhpcyBleGFtcGxlOlxuICpcbiAqIGBgYGh0bWxcbiAqIDx0YWJzPlxuICogICA8cGFuZSB0aXRsZT1cIk92ZXJ2aWV3XCI+Li4uPC9wYW5lPlxuICogICA8cGFuZSAqbmdGb3I9XCIjbyBvZiBvYmplY3RzXCIgW3RpdGxlXT1cIm8udGl0bGVcIj57e28udGV4dH19PC9wYW5lPlxuICogPC90YWJzPlxuICogYGBgXG4gKlxuICogVGhlIHByZWZlcnJlZCBzb2x1dGlvbiBpcyB0byBxdWVyeSBmb3IgYFBhbmVgIGRpcmVjdGl2ZXMgdXNpbmcgdGhpcyBkZWNvcmF0b3IuXG4gKlxuICogYGBgamF2YXNjcmlwdFxuICogQENvbXBvbmVudCh7XG4gKiAgIHNlbGVjdG9yOiAncGFuZScsXG4gKiAgIGlucHV0czogWyd0aXRsZSddXG4gKiB9KVxuICogY2xhc3MgUGFuZSB7XG4gKiAgIHRpdGxlOnN0cmluZztcbiAqIH1cbiAqXG4gKiBAQ29tcG9uZW50KHtcbiAqICBzZWxlY3RvcjogJ3RhYnMnLFxuICogIHRlbXBsYXRlOiBgXG4gKiAgICA8dWw+XG4gKiAgICAgIDxsaSAqbmdGb3I9XCIjcGFuZSBvZiBwYW5lc1wiPnt7cGFuZS50aXRsZX19PC9saT5cbiAqICAgIDwvdWw+XG4gKiAgICA8Y29udGVudD48L2NvbnRlbnQ+XG4gKiAgYFxuICogfSlcbiAqIGNsYXNzIFRhYnMge1xuICogICBwYW5lczogUXVlcnlMaXN0PFBhbmU+O1xuICogICBjb25zdHJ1Y3RvcihAUXVlcnkoUGFuZSkgcGFuZXM6UXVlcnlMaXN0PFBhbmU+KSB7XG4gKiAgICAgdGhpcy5wYW5lcyA9IHBhbmVzO1xuICogICB9XG4gKiB9XG4gKiBgYGBcbiAqXG4gKiBBIHF1ZXJ5IGNhbiBsb29rIGZvciB2YXJpYWJsZSBiaW5kaW5ncyBieSBwYXNzaW5nIGluIGEgc3RyaW5nIHdpdGggZGVzaXJlZCBiaW5kaW5nIHN5bWJvbC5cbiAqXG4gKiAjIyMgRXhhbXBsZSAoW2xpdmUgZGVtb10oaHR0cDovL3BsbmtyLmNvL2VkaXQvc1QyajI1Y0gxZFVSQXlCUkNLeDE/cD1wcmV2aWV3KSlcbiAqIGBgYGh0bWxcbiAqIDxzZWVrZXI+XG4gKiAgIDxkaXYgI2ZpbmRtZT4uLi48L2Rpdj5cbiAqIDwvc2Vla2VyPlxuICpcbiAqIEBDb21wb25lbnQoeyBzZWxlY3RvcjogJ2ZvbycgfSlcbiAqIGNsYXNzIHNlZWtlciB7XG4gKiAgIGNvbnN0cnVjdG9yKEBRdWVyeSgnZmluZG1lJykgZWxMaXN0OiBRdWVyeUxpc3Q8RWxlbWVudFJlZj4pIHsuLi59XG4gKiB9XG4gKiBgYGBcbiAqXG4gKiBJbiB0aGlzIGNhc2UgdGhlIG9iamVjdCB0aGF0IGlzIGluamVjdGVkIGRlcGVuZCBvbiB0aGUgdHlwZSBvZiB0aGUgdmFyaWFibGVcbiAqIGJpbmRpbmcuIEl0IGNhbiBiZSBhbiBFbGVtZW50UmVmLCBhIGRpcmVjdGl2ZSBvciBhIGNvbXBvbmVudC5cbiAqXG4gKiBQYXNzaW5nIGluIGEgY29tbWEgc2VwYXJhdGVkIGxpc3Qgb2YgdmFyaWFibGUgYmluZGluZ3Mgd2lsbCBxdWVyeSBmb3IgYWxsIG9mIHRoZW0uXG4gKlxuICogYGBgaHRtbFxuICogPHNlZWtlcj5cbiAqICAgPGRpdiAjZmluZE1lPi4uLjwvZGl2PlxuICogICA8ZGl2ICNmaW5kTWVUb28+Li4uPC9kaXY+XG4gKiA8L3NlZWtlcj5cbiAqXG4gKiAgQENvbXBvbmVudCh7XG4gKiAgIHNlbGVjdG9yOiAnZm9vJ1xuICogfSlcbiAqIGNsYXNzIFNlZWtlciB7XG4gKiAgIGNvbnN0cnVjdG9yKEBRdWVyeSgnZmluZE1lLCBmaW5kTWVUb28nKSBlbExpc3Q6IFF1ZXJ5TGlzdDxFbGVtZW50UmVmPikgey4uLn1cbiAqIH1cbiAqIGBgYFxuICpcbiAqIENvbmZpZ3VyZSB3aGV0aGVyIHF1ZXJ5IGxvb2tzIGZvciBkaXJlY3QgY2hpbGRyZW4gb3IgYWxsIGRlc2NlbmRhbnRzXG4gKiBvZiB0aGUgcXVlcnlpbmcgZWxlbWVudCwgYnkgdXNpbmcgdGhlIGBkZXNjZW5kYW50c2AgcGFyYW1ldGVyLlxuICogSXQgaXMgc2V0IHRvIGBmYWxzZWAgYnkgZGVmYXVsdC5cbiAqXG4gKiAjIyMgRXhhbXBsZSAoW2xpdmUgZGVtb10oaHR0cDovL3BsbmtyLmNvL2VkaXQvd3RHZUI5NzdidjdxdkE1RlRZbDk/cD1wcmV2aWV3KSlcbiAqIGBgYGh0bWxcbiAqIDxjb250YWluZXIgI2ZpcnN0PlxuICogICA8aXRlbT5hPC9pdGVtPlxuICogICA8aXRlbT5iPC9pdGVtPlxuICogICA8Y29udGFpbmVyICNzZWNvbmQ+XG4gKiAgICAgPGl0ZW0+YzwvaXRlbT5cbiAqICAgPC9jb250YWluZXI+XG4gKiA8L2NvbnRhaW5lcj5cbiAqIGBgYFxuICpcbiAqIFdoZW4gcXVlcnlpbmcgZm9yIGl0ZW1zLCB0aGUgZmlyc3QgY29udGFpbmVyIHdpbGwgc2VlIG9ubHkgYGFgIGFuZCBgYmAgYnkgZGVmYXVsdCxcbiAqIGJ1dCB3aXRoIGBRdWVyeShUZXh0RGlyZWN0aXZlLCB7ZGVzY2VuZGFudHM6IHRydWV9KWAgaXQgd2lsbCBzZWUgYGNgIHRvby5cbiAqXG4gKiBUaGUgcXVlcmllZCBkaXJlY3RpdmVzIGFyZSBrZXB0IGluIGEgZGVwdGgtZmlyc3QgcHJlLW9yZGVyIHdpdGggcmVzcGVjdCB0byB0aGVpclxuICogcG9zaXRpb25zIGluIHRoZSBET00uXG4gKlxuICogUXVlcnkgZG9lcyBub3QgbG9vayBkZWVwIGludG8gYW55IHN1YmNvbXBvbmVudCB2aWV3cy5cbiAqXG4gKiBRdWVyeSBpcyB1cGRhdGVkIGFzIHBhcnQgb2YgdGhlIGNoYW5nZS1kZXRlY3Rpb24gY3ljbGUuIFNpbmNlIGNoYW5nZSBkZXRlY3Rpb25cbiAqIGhhcHBlbnMgYWZ0ZXIgY29uc3RydWN0aW9uIG9mIGEgZGlyZWN0aXZlLCBRdWVyeUxpc3Qgd2lsbCBhbHdheXMgYmUgZW1wdHkgd2hlbiBvYnNlcnZlZCBpbiB0aGVcbiAqIGNvbnN0cnVjdG9yLlxuICpcbiAqIFRoZSBpbmplY3RlZCBvYmplY3QgaXMgYW4gdW5tb2RpZmlhYmxlIGxpdmUgbGlzdC5cbiAqIFNlZSB7QGxpbmsgUXVlcnlMaXN0fSBmb3IgbW9yZSBkZXRhaWxzLlxuICovXG5leHBvcnQgdmFyIFF1ZXJ5OiBRdWVyeUZhY3RvcnkgPSBtYWtlUGFyYW1EZWNvcmF0b3IoUXVlcnlNZXRhZGF0YSk7XG5cbi8vIFRPRE8oYWxleGVhZ2xlKTogcmVtb3ZlIHRoZSBkdXBsaWNhdGlvbiBvZiB0aGlzIGRvYy4gSXQgaXMgY29waWVkIGZyb20gQ29udGVudENoaWxkcmVuTWV0YWRhdGEuXG4vKipcbiAqIENvbmZpZ3VyZXMgYSBjb250ZW50IHF1ZXJ5LlxuICpcbiAqIENvbnRlbnQgcXVlcmllcyBhcmUgc2V0IGJlZm9yZSB0aGUgYG5nQWZ0ZXJDb250ZW50SW5pdGAgY2FsbGJhY2sgaXMgY2FsbGVkLlxuICpcbiAqICMjIyBFeGFtcGxlXG4gKlxuICogYGBgXG4gKiBARGlyZWN0aXZlKHtcbiAqICAgc2VsZWN0b3I6ICdzb21lRGlyJ1xuICogfSlcbiAqIGNsYXNzIFNvbWVEaXIge1xuICogICBAQ29udGVudENoaWxkcmVuKENoaWxkRGlyZWN0aXZlKSBjb250ZW50Q2hpbGRyZW46IFF1ZXJ5TGlzdDxDaGlsZERpcmVjdGl2ZT47XG4gKlxuICogICBuZ0FmdGVyQ29udGVudEluaXQoKSB7XG4gKiAgICAgLy8gY29udGVudENoaWxkcmVuIGlzIHNldFxuICogICB9XG4gKiB9XG4gKiBgYGBcbiAqL1xuZXhwb3J0IHZhciBDb250ZW50Q2hpbGRyZW46IENvbnRlbnRDaGlsZHJlbkZhY3RvcnkgPSBtYWtlUHJvcERlY29yYXRvcihDb250ZW50Q2hpbGRyZW5NZXRhZGF0YSk7XG5cbi8vIFRPRE8oYWxleGVhZ2xlKTogcmVtb3ZlIHRoZSBkdXBsaWNhdGlvbiBvZiB0aGlzIGRvYy4gSXQgaXMgY29waWVkIGZyb20gQ29udGVudENoaWxkTWV0YWRhdGEuXG4vKipcbiAqIENvbmZpZ3VyZXMgYSBjb250ZW50IHF1ZXJ5LlxuICpcbiAqIENvbnRlbnQgcXVlcmllcyBhcmUgc2V0IGJlZm9yZSB0aGUgYG5nQWZ0ZXJDb250ZW50SW5pdGAgY2FsbGJhY2sgaXMgY2FsbGVkLlxuICpcbiAqICMjIyBFeGFtcGxlXG4gKlxuICogYGBgXG4gKiBARGlyZWN0aXZlKHtcbiAqICAgc2VsZWN0b3I6ICdzb21lRGlyJ1xuICogfSlcbiAqIGNsYXNzIFNvbWVEaXIge1xuICogICBAQ29udGVudENoaWxkKENoaWxkRGlyZWN0aXZlKSBjb250ZW50Q2hpbGQ7XG4gKlxuICogICBuZ0FmdGVyQ29udGVudEluaXQoKSB7XG4gKiAgICAgLy8gY29udGVudENoaWxkIGlzIHNldFxuICogICB9XG4gKiB9XG4gKiBgYGBcbiAqL1xuZXhwb3J0IHZhciBDb250ZW50Q2hpbGQ6IENvbnRlbnRDaGlsZEZhY3RvcnkgPSBtYWtlUHJvcERlY29yYXRvcihDb250ZW50Q2hpbGRNZXRhZGF0YSk7XG5cbi8vIFRPRE8oYWxleGVhZ2xlKTogcmVtb3ZlIHRoZSBkdXBsaWNhdGlvbiBvZiB0aGlzIGRvYy4gSXQgaXMgY29waWVkIGZyb20gVmlld0NoaWxkcmVuTWV0YWRhdGEuXG4vKipcbiAqIENvbmZpZ3VyZXMgYSB2aWV3IHF1ZXJ5LlxuICpcbiAqIFZpZXcgcXVlcmllcyBhcmUgc2V0IGJlZm9yZSB0aGUgYG5nQWZ0ZXJWaWV3SW5pdGAgY2FsbGJhY2sgaXMgY2FsbGVkLlxuICpcbiAqICMjIyBFeGFtcGxlXG4gKlxuICogYGBgXG4gKiBAQ29tcG9uZW50KHtcbiAqICAgc2VsZWN0b3I6ICdzb21lRGlyJyxcbiAqICAgdGVtcGxhdGVVcmw6ICdzb21lVGVtcGxhdGUnLFxuICogICBkaXJlY3RpdmVzOiBbSXRlbURpcmVjdGl2ZV1cbiAqIH0pXG4gKiBjbGFzcyBTb21lRGlyIHtcbiAqICAgQFZpZXdDaGlsZHJlbihJdGVtRGlyZWN0aXZlKSB2aWV3Q2hpbGRyZW46IFF1ZXJ5TGlzdDxJdGVtRGlyZWN0aXZlPjtcbiAqXG4gKiAgIG5nQWZ0ZXJWaWV3SW5pdCgpIHtcbiAqICAgICAvLyB2aWV3Q2hpbGRyZW4gaXMgc2V0XG4gKiAgIH1cbiAqIH1cbiAqIGBgYFxuICovXG5leHBvcnQgdmFyIFZpZXdDaGlsZHJlbjogVmlld0NoaWxkcmVuRmFjdG9yeSA9IG1ha2VQcm9wRGVjb3JhdG9yKFZpZXdDaGlsZHJlbk1ldGFkYXRhKTtcblxuLy8gVE9ETyhhbGV4ZWFnbGUpOiByZW1vdmUgdGhlIGR1cGxpY2F0aW9uIG9mIHRoaXMgZG9jLiBJdCBpcyBjb3BpZWQgZnJvbSBWaWV3Q2hpbGRNZXRhZGF0YS5cbi8qKlxuICogQ29uZmlndXJlcyBhIHZpZXcgcXVlcnkuXG4gKlxuICogVmlldyBxdWVyaWVzIGFyZSBzZXQgYmVmb3JlIHRoZSBgbmdBZnRlclZpZXdJbml0YCBjYWxsYmFjayBpcyBjYWxsZWQuXG4gKlxuICogIyMjIEV4YW1wbGVcbiAqXG4gKiBgYGBcbiAqIEBDb21wb25lbnQoe1xuICogICBzZWxlY3RvcjogJ3NvbWVEaXInLFxuICogICB0ZW1wbGF0ZVVybDogJ3NvbWVUZW1wbGF0ZScsXG4gKiAgIGRpcmVjdGl2ZXM6IFtJdGVtRGlyZWN0aXZlXVxuICogfSlcbiAqIGNsYXNzIFNvbWVEaXIge1xuICogICBAVmlld0NoaWxkKEl0ZW1EaXJlY3RpdmUpIHZpZXdDaGlsZDpJdGVtRGlyZWN0aXZlO1xuICpcbiAqICAgbmdBZnRlclZpZXdJbml0KCkge1xuICogICAgIC8vIHZpZXdDaGlsZCBpcyBzZXRcbiAqICAgfVxuICogfVxuICogYGBgXG4gKi9cbmV4cG9ydCB2YXIgVmlld0NoaWxkOiBWaWV3Q2hpbGRGYWN0b3J5ID0gbWFrZVByb3BEZWNvcmF0b3IoVmlld0NoaWxkTWV0YWRhdGEpO1xuXG4vLyBUT0RPKGFsZXhlYWdsZSk6IHJlbW92ZSB0aGUgZHVwbGljYXRpb24gb2YgdGhpcyBkb2MuIEl0IGlzIGNvcGllZCBmcm9tIFZpZXdRdWVyeU1ldGFkYXRhLlxuLyoqXG4gKiBTaW1pbGFyIHRvIHtAbGluayBRdWVyeU1ldGFkYXRhfSwgYnV0IHF1ZXJ5aW5nIHRoZSBjb21wb25lbnQgdmlldywgaW5zdGVhZCBvZlxuICogdGhlIGNvbnRlbnQgY2hpbGRyZW4uXG4gKlxuICogIyMjIEV4YW1wbGUgKFtsaXZlIGRlbW9dKGh0dHA6Ly9wbG5rci5jby9lZGl0L2VOc0ZIRGY3WWp5TTZJekt4TTFqP3A9cHJldmlldykpXG4gKlxuICogYGBgamF2YXNjcmlwdFxuICogQENvbXBvbmVudCh7Li4ufSlcbiAqIEBWaWV3KHtcbiAqICAgdGVtcGxhdGU6IGBcbiAqICAgICA8aXRlbT4gYSA8L2l0ZW0+XG4gKiAgICAgPGl0ZW0+IGIgPC9pdGVtPlxuICogICAgIDxpdGVtPiBjIDwvaXRlbT5cbiAqICAgYFxuICogfSlcbiAqIGNsYXNzIE15Q29tcG9uZW50IHtcbiAqICAgc2hvd246IGJvb2xlYW47XG4gKlxuICogICBjb25zdHJ1Y3Rvcihwcml2YXRlIEBRdWVyeShJdGVtKSBpdGVtczpRdWVyeUxpc3Q8SXRlbT4pIHtcbiAqICAgICBpdGVtcy5vbkNoYW5nZSgoKSA9PiBjb25zb2xlLmxvZyhpdGVtcy5sZW5ndGgpKTtcbiAqICAgfVxuICogfVxuICogYGBgXG4gKlxuICogU3VwcG9ydHMgdGhlIHNhbWUgcXVlcnlpbmcgcGFyYW1ldGVycyBhcyB7QGxpbmsgUXVlcnlNZXRhZGF0YX0sIGV4Y2VwdFxuICogYGRlc2NlbmRhbnRzYC4gVGhpcyBhbHdheXMgcXVlcmllcyB0aGUgd2hvbGUgdmlldy5cbiAqXG4gKiBBcyBgc2hvd25gIGlzIGZsaXBwZWQgYmV0d2VlbiB0cnVlIGFuZCBmYWxzZSwgaXRlbXMgd2lsbCBjb250YWluIHplcm8gb2Ygb25lXG4gKiBpdGVtcy5cbiAqXG4gKiBTcGVjaWZpZXMgdGhhdCBhIHtAbGluayBRdWVyeUxpc3R9IHNob3VsZCBiZSBpbmplY3RlZC5cbiAqXG4gKiBUaGUgaW5qZWN0ZWQgb2JqZWN0IGlzIGFuIGl0ZXJhYmxlIGFuZCBvYnNlcnZhYmxlIGxpdmUgbGlzdC5cbiAqIFNlZSB7QGxpbmsgUXVlcnlMaXN0fSBmb3IgbW9yZSBkZXRhaWxzLlxuICovXG5leHBvcnQgdmFyIFZpZXdRdWVyeTogUXVlcnlGYWN0b3J5ID0gbWFrZVBhcmFtRGVjb3JhdG9yKFZpZXdRdWVyeU1ldGFkYXRhKTtcblxuLy8gVE9ETyhhbGV4ZWFnbGUpOiByZW1vdmUgdGhlIGR1cGxpY2F0aW9uIG9mIHRoaXMgZG9jLiBJdCBpcyBjb3BpZWQgZnJvbSBQaXBlTWV0YWRhdGEuXG4vKipcbiAqIERlY2xhcmUgcmV1c2FibGUgcGlwZSBmdW5jdGlvbi5cbiAqXG4gKiAjIyMgRXhhbXBsZVxuICpcbiAqIHtAZXhhbXBsZSBjb3JlL3RzL21ldGFkYXRhL21ldGFkYXRhLnRzIHJlZ2lvbj0ncGlwZSd9XG4gKi9cbmV4cG9ydCB2YXIgUGlwZTogUGlwZUZhY3RvcnkgPSA8UGlwZUZhY3Rvcnk+bWFrZURlY29yYXRvcihQaXBlTWV0YWRhdGEpO1xuXG4vLyBUT0RPKGFsZXhlYWdsZSk6IHJlbW92ZSB0aGUgZHVwbGljYXRpb24gb2YgdGhpcyBkb2MuIEl0IGlzIGNvcGllZCBmcm9tIElucHV0TWV0YWRhdGEuXG4vKipcbiAqIERlY2xhcmVzIGEgZGF0YS1ib3VuZCBpbnB1dCBwcm9wZXJ0eS5cbiAqXG4gKiBBbmd1bGFyIGF1dG9tYXRpY2FsbHkgdXBkYXRlcyBkYXRhLWJvdW5kIHByb3BlcnRpZXMgZHVyaW5nIGNoYW5nZSBkZXRlY3Rpb24uXG4gKlxuICogYElucHV0TWV0YWRhdGFgIHRha2VzIGFuIG9wdGlvbmFsIHBhcmFtZXRlciB0aGF0IHNwZWNpZmllcyB0aGUgbmFtZVxuICogdXNlZCB3aGVuIGluc3RhbnRpYXRpbmcgYSBjb21wb25lbnQgaW4gdGhlIHRlbXBsYXRlLiBXaGVuIG5vdCBwcm92aWRlZCxcbiAqIHRoZSBuYW1lIG9mIHRoZSBkZWNvcmF0ZWQgcHJvcGVydHkgaXMgdXNlZC5cbiAqXG4gKiAjIyMgRXhhbXBsZVxuICpcbiAqIFRoZSBmb2xsb3dpbmcgZXhhbXBsZSBjcmVhdGVzIGEgY29tcG9uZW50IHdpdGggdHdvIGlucHV0IHByb3BlcnRpZXMuXG4gKlxuICogYGBgdHlwZXNjcmlwdFxuICogQENvbXBvbmVudCh7XG4gKiAgIHNlbGVjdG9yOiAnYmFuay1hY2NvdW50JyxcbiAqICAgdGVtcGxhdGU6IGBcbiAqICAgICBCYW5rIE5hbWU6IHt7YmFua05hbWV9fVxuICogICAgIEFjY291bnQgSWQ6IHt7aWR9fVxuICogICBgXG4gKiB9KVxuICogY2xhc3MgQmFua0FjY291bnQge1xuICogICBASW5wdXQoKSBiYW5rTmFtZTogc3RyaW5nO1xuICogICBASW5wdXQoJ2FjY291bnQtaWQnKSBpZDogc3RyaW5nO1xuICpcbiAqICAgLy8gdGhpcyBwcm9wZXJ0eSBpcyBub3QgYm91bmQsIGFuZCB3b24ndCBiZSBhdXRvbWF0aWNhbGx5IHVwZGF0ZWQgYnkgQW5ndWxhclxuICogICBub3JtYWxpemVkQmFua05hbWU6IHN0cmluZztcbiAqIH1cbiAqXG4gKiBAQ29tcG9uZW50KHtcbiAqICAgc2VsZWN0b3I6ICdhcHAnLFxuICogICB0ZW1wbGF0ZTogYFxuICogICAgIDxiYW5rLWFjY291bnQgYmFuay1uYW1lPVwiUkJDXCIgYWNjb3VudC1pZD1cIjQ3NDdcIj48L2JhbmstYWNjb3VudD5cbiAqICAgYCxcbiAqICAgZGlyZWN0aXZlczogW0JhbmtBY2NvdW50XVxuICogfSlcbiAqIGNsYXNzIEFwcCB7fVxuICpcbiAqIGJvb3RzdHJhcChBcHApO1xuICogYGBgXG4gKi9cbmV4cG9ydCB2YXIgSW5wdXQ6IElucHV0RmFjdG9yeSA9IG1ha2VQcm9wRGVjb3JhdG9yKElucHV0TWV0YWRhdGEpO1xuXG4vLyBUT0RPKGFsZXhlYWdsZSk6IHJlbW92ZSB0aGUgZHVwbGljYXRpb24gb2YgdGhpcyBkb2MuIEl0IGlzIGNvcGllZCBmcm9tIE91dHB1dE1ldGFkYXRhLlxuLyoqXG4gKiBEZWNsYXJlcyBhbiBldmVudC1ib3VuZCBvdXRwdXQgcHJvcGVydHkuXG4gKlxuICogV2hlbiBhbiBvdXRwdXQgcHJvcGVydHkgZW1pdHMgYW4gZXZlbnQsIGFuIGV2ZW50IGhhbmRsZXIgYXR0YWNoZWQgdG8gdGhhdCBldmVudFxuICogdGhlIHRlbXBsYXRlIGlzIGludm9rZWQuXG4gKlxuICogYE91dHB1dE1ldGFkYXRhYCB0YWtlcyBhbiBvcHRpb25hbCBwYXJhbWV0ZXIgdGhhdCBzcGVjaWZpZXMgdGhlIG5hbWVcbiAqIHVzZWQgd2hlbiBpbnN0YW50aWF0aW5nIGEgY29tcG9uZW50IGluIHRoZSB0ZW1wbGF0ZS4gV2hlbiBub3QgcHJvdmlkZWQsXG4gKiB0aGUgbmFtZSBvZiB0aGUgZGVjb3JhdGVkIHByb3BlcnR5IGlzIHVzZWQuXG4gKlxuICogIyMjIEV4YW1wbGVcbiAqXG4gKiBgYGB0eXBlc2NyaXB0XG4gKiBARGlyZWN0aXZlKHtcbiAqICAgc2VsZWN0b3I6ICdpbnRlcnZhbC1kaXInLFxuICogfSlcbiAqIGNsYXNzIEludGVydmFsRGlyIHtcbiAqICAgQE91dHB1dCgpIGV2ZXJ5U2Vjb25kID0gbmV3IEV2ZW50RW1pdHRlcigpO1xuICogICBAT3V0cHV0KCdldmVyeUZpdmVTZWNvbmRzJykgZml2ZTVTZWNzID0gbmV3IEV2ZW50RW1pdHRlcigpO1xuICpcbiAqICAgY29uc3RydWN0b3IoKSB7XG4gKiAgICAgc2V0SW50ZXJ2YWwoKCkgPT4gdGhpcy5ldmVyeVNlY29uZC5lbWl0KFwiZXZlbnRcIiksIDEwMDApO1xuICogICAgIHNldEludGVydmFsKCgpID0+IHRoaXMuZml2ZTVTZWNzLmVtaXQoXCJldmVudFwiKSwgNTAwMCk7XG4gKiAgIH1cbiAqIH1cbiAqXG4gKiBAQ29tcG9uZW50KHtcbiAqICAgc2VsZWN0b3I6ICdhcHAnLFxuICogICB0ZW1wbGF0ZTogYFxuICogICAgIDxpbnRlcnZhbC1kaXIgKGV2ZXJ5LXNlY29uZCk9XCJldmVyeVNlY29uZCgpXCIgKGV2ZXJ5LWZpdmUtc2Vjb25kcyk9XCJldmVyeUZpdmVTZWNvbmRzKClcIj5cbiAqICAgICA8L2ludGVydmFsLWRpcj5cbiAqICAgYCxcbiAqICAgZGlyZWN0aXZlczogW0ludGVydmFsRGlyXVxuICogfSlcbiAqIGNsYXNzIEFwcCB7XG4gKiAgIGV2ZXJ5U2Vjb25kKCkgeyBjb25zb2xlLmxvZygnc2Vjb25kJyk7IH1cbiAqICAgZXZlcnlGaXZlU2Vjb25kcygpIHsgY29uc29sZS5sb2coJ2ZpdmUgc2Vjb25kcycpOyB9XG4gKiB9XG4gKiBib290c3RyYXAoQXBwKTtcbiAqIGBgYFxuICovXG5leHBvcnQgdmFyIE91dHB1dDogT3V0cHV0RmFjdG9yeSA9IG1ha2VQcm9wRGVjb3JhdG9yKE91dHB1dE1ldGFkYXRhKTtcblxuLy8gVE9ETyhhbGV4ZWFnbGUpOiByZW1vdmUgdGhlIGR1cGxpY2F0aW9uIG9mIHRoaXMgZG9jLiBJdCBpcyBjb3BpZWQgZnJvbSBIb3N0QmluZGluZ01ldGFkYXRhLlxuLyoqXG4gKiBEZWNsYXJlcyBhIGhvc3QgcHJvcGVydHkgYmluZGluZy5cbiAqXG4gKiBBbmd1bGFyIGF1dG9tYXRpY2FsbHkgY2hlY2tzIGhvc3QgcHJvcGVydHkgYmluZGluZ3MgZHVyaW5nIGNoYW5nZSBkZXRlY3Rpb24uXG4gKiBJZiBhIGJpbmRpbmcgY2hhbmdlcywgaXQgd2lsbCB1cGRhdGUgdGhlIGhvc3QgZWxlbWVudCBvZiB0aGUgZGlyZWN0aXZlLlxuICpcbiAqIGBIb3N0QmluZGluZ01ldGFkYXRhYCB0YWtlcyBhbiBvcHRpb25hbCBwYXJhbWV0ZXIgdGhhdCBzcGVjaWZpZXMgdGhlIHByb3BlcnR5XG4gKiBuYW1lIG9mIHRoZSBob3N0IGVsZW1lbnQgdGhhdCB3aWxsIGJlIHVwZGF0ZWQuIFdoZW4gbm90IHByb3ZpZGVkLFxuICogdGhlIGNsYXNzIHByb3BlcnR5IG5hbWUgaXMgdXNlZC5cbiAqXG4gKiAjIyMgRXhhbXBsZVxuICpcbiAqIFRoZSBmb2xsb3dpbmcgZXhhbXBsZSBjcmVhdGVzIGEgZGlyZWN0aXZlIHRoYXQgc2V0cyB0aGUgYHZhbGlkYCBhbmQgYGludmFsaWRgIGNsYXNzZXNcbiAqIG9uIHRoZSBET00gZWxlbWVudCB0aGF0IGhhcyBuZ01vZGVsIGRpcmVjdGl2ZSBvbiBpdC5cbiAqXG4gKiBgYGB0eXBlc2NyaXB0XG4gKiBARGlyZWN0aXZlKHtzZWxlY3RvcjogJ1tuZ01vZGVsXSd9KVxuICogY2xhc3MgTmdNb2RlbFN0YXR1cyB7XG4gKiAgIGNvbnN0cnVjdG9yKHB1YmxpYyBjb250cm9sOk5nTW9kZWwpIHt9XG4gKiAgIEBIb3N0QmluZGluZygnW2NsYXNzLnZhbGlkXScpIGdldCB2YWxpZCB7IHJldHVybiB0aGlzLmNvbnRyb2wudmFsaWQ7IH1cbiAqICAgQEhvc3RCaW5kaW5nKCdbY2xhc3MuaW52YWxpZF0nKSBnZXQgaW52YWxpZCB7IHJldHVybiB0aGlzLmNvbnRyb2wuaW52YWxpZDsgfVxuICogfVxuICpcbiAqIEBDb21wb25lbnQoe1xuICogICBzZWxlY3RvcjogJ2FwcCcsXG4gKiAgIHRlbXBsYXRlOiBgPGlucHV0IFsobmdNb2RlbCldPVwicHJvcFwiPmAsXG4gKiAgIGRpcmVjdGl2ZXM6IFtGT1JNX0RJUkVDVElWRVMsIE5nTW9kZWxTdGF0dXNdXG4gKiB9KVxuICogY2xhc3MgQXBwIHtcbiAqICAgcHJvcDtcbiAqIH1cbiAqXG4gKiBib290c3RyYXAoQXBwKTtcbiAqIGBgYFxuICovXG5leHBvcnQgdmFyIEhvc3RCaW5kaW5nOiBIb3N0QmluZGluZ0ZhY3RvcnkgPSBtYWtlUHJvcERlY29yYXRvcihIb3N0QmluZGluZ01ldGFkYXRhKTtcblxuLy8gVE9ETyhhbGV4ZWFnbGUpOiByZW1vdmUgdGhlIGR1cGxpY2F0aW9uIG9mIHRoaXMgZG9jLiBJdCBpcyBjb3BpZWQgZnJvbSBIb3N0TGlzdGVuZXJNZXRhZGF0YS5cbi8qKlxuICogRGVjbGFyZXMgYSBob3N0IGxpc3RlbmVyLlxuICpcbiAqIEFuZ3VsYXIgd2lsbCBpbnZva2UgdGhlIGRlY29yYXRlZCBtZXRob2Qgd2hlbiB0aGUgaG9zdCBlbGVtZW50IGVtaXRzIHRoZSBzcGVjaWZpZWQgZXZlbnQuXG4gKlxuICogSWYgdGhlIGRlY29yYXRlZCBtZXRob2QgcmV0dXJucyBgZmFsc2VgLCB0aGVuIGBwcmV2ZW50RGVmYXVsdGAgaXMgYXBwbGllZCBvbiB0aGUgRE9NXG4gKiBldmVudC5cbiAqXG4gKiAjIyMgRXhhbXBsZVxuICpcbiAqIFRoZSBmb2xsb3dpbmcgZXhhbXBsZSBkZWNsYXJlcyBhIGRpcmVjdGl2ZSB0aGF0IGF0dGFjaGVzIGEgY2xpY2sgbGlzdGVuZXIgdG8gdGhlIGJ1dHRvbiBhbmRcbiAqIGNvdW50cyBjbGlja3MuXG4gKlxuICogYGBgdHlwZXNjcmlwdFxuICogQERpcmVjdGl2ZSh7c2VsZWN0b3I6ICdidXR0b25bY291bnRpbmddJ30pXG4gKiBjbGFzcyBDb3VudENsaWNrcyB7XG4gKiAgIG51bWJlck9mQ2xpY2tzID0gMDtcbiAqXG4gKiAgIEBIb3N0TGlzdGVuZXIoJ2NsaWNrJywgWyckZXZlbnQudGFyZ2V0J10pXG4gKiAgIG9uQ2xpY2soYnRuKSB7XG4gKiAgICAgY29uc29sZS5sb2coXCJidXR0b25cIiwgYnRuLCBcIm51bWJlciBvZiBjbGlja3M6XCIsIHRoaXMubnVtYmVyT2ZDbGlja3MrKyk7XG4gKiAgIH1cbiAqIH1cbiAqXG4gKiBAQ29tcG9uZW50KHtcbiAqICAgc2VsZWN0b3I6ICdhcHAnLFxuICogICB0ZW1wbGF0ZTogYDxidXR0b24gY291bnRpbmc+SW5jcmVtZW50PC9idXR0b24+YCxcbiAqICAgZGlyZWN0aXZlczogW0NvdW50Q2xpY2tzXVxuICogfSlcbiAqIGNsYXNzIEFwcCB7fVxuICpcbiAqIGJvb3RzdHJhcChBcHApO1xuICogYGBgXG4gKi9cbmV4cG9ydCB2YXIgSG9zdExpc3RlbmVyOiBIb3N0TGlzdGVuZXJGYWN0b3J5ID0gbWFrZVByb3BEZWNvcmF0b3IoSG9zdExpc3RlbmVyTWV0YWRhdGEpO1xuIl19