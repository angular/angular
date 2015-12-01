var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") return Reflect.decorate(decorators, target, key, desc);
    switch (arguments.length) {
        case 2: return decorators.reduceRight(function(o, d) { return (d && d(o)) || o; }, target);
        case 3: return decorators.reduceRight(function(o, d) { return (d && d(target, key)), void 0; }, void 0);
        case 4: return decorators.reduceRight(function(o, d) { return (d && d(target, key, o)) || o; }, desc);
    }
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { isPresent, CONST } from 'angular2/src/facade/lang';
import { InjectableMetadata } from 'angular2/src/core/di/metadata';
import { ChangeDetectionStrategy } from 'angular2/src/core/change_detection';
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
 * `Dependency` 6. Here, `Dependency` 5 would not be included, because it is not a direct child.
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
export let DirectiveMetadata = class extends InjectableMetadata {
    constructor({ selector, inputs, outputs, properties, events, host, bindings, providers, exportAs, moduleId, queries } = {}) {
        super();
        this.selector = selector;
        this._inputs = inputs;
        this._properties = properties;
        this._outputs = outputs;
        this._events = events;
        this.host = host;
        this.exportAs = exportAs;
        this.moduleId = moduleId;
        this.queries = queries;
        this._providers = providers;
        this._bindings = bindings;
    }
    /**
     * Enumerates the set of data-bound input properties for a directive
     *
     * Angular automatically updates input properties during change detection.
     *
     * The `inputs` property defines a set of `directiveProperty` to `bindingProperty`
     * configuration:
     *
     * - `directiveProperty` specifies the component property where the value is written.
     * - `bindingProperty` specifies the DOM property where the value is read from.
     *
     * When `bindingProperty` is not provided, it is assumed to be equal to `directiveProperty`.
     *
     * ### Example ([live demo](http://plnkr.co/edit/ivhfXY?p=preview))
     *
     * The following example creates a component with two data-bound properties.
     *
     * ```typescript
     * @Component({
     *   selector: 'bank-account',
     *   inputs: ['bankName', 'id: account-id'],
     *   template: `
     *     Bank Name: {{bankName}}
     *     Account Id: {{id}}
     *   `
     * })
     * class BankAccount {
     *   bankName: string;
     *   id: string;
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
     *
     */
    get inputs() {
        return isPresent(this._properties) && this._properties.length > 0 ? this._properties :
            this._inputs;
    }
    get properties() { return this.inputs; }
    /**
     * Enumerates the set of event-bound output properties.
     *
     * When an output property emits an event, an event handler attached to that event
     * the template is invoked.
     *
     * The `outputs` property defines a set of `directiveProperty` to `bindingProperty`
     * configuration:
     *
     * - `directiveProperty` specifies the component property that emits events.
     * - `bindingProperty` specifies the DOM property the event handler is attached to.
     *
     * ### Example ([live demo](http://plnkr.co/edit/d5CNq7?p=preview))
     *
     * ```typescript
     * @Directive({
     *   selector: 'interval-dir',
     *   outputs: ['everySecond', 'five5Secs: everyFiveSeconds']
     * })
     * class IntervalDir {
     *   everySecond = new EventEmitter();
     *   five5Secs = new EventEmitter();
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
     *
     */
    get outputs() {
        return isPresent(this._events) && this._events.length > 0 ? this._events : this._outputs;
    }
    get events() { return this.outputs; }
    /**
     * Defines the set of injectable objects that are visible to a Directive and its light DOM
     * children.
     *
     * ## Simple Example
     *
     * Here is an example of a class that can be injected:
     *
     * ```
     * class Greeter {
     *    greet(name:string) {
     *      return 'Hello ' + name + '!';
     *    }
     * }
     *
     * @Directive({
     *   selector: 'greet',
     *   bindings: [
     *     Greeter
     *   ]
     * })
     * class HelloWorld {
     *   greeter:Greeter;
     *
     *   constructor(greeter:Greeter) {
     *     this.greeter = greeter;
     *   }
     * }
     * ```
     */
    get providers() {
        return isPresent(this._bindings) && this._bindings.length > 0 ? this._bindings :
            this._providers;
    }
    /** @deprecated */
    get bindings() { return this.providers; }
};
DirectiveMetadata = __decorate([
    CONST(), 
    __metadata('design:paramtypes', [Object])
], DirectiveMetadata);
/**
 * Declare reusable UI building blocks for an application.
 *
 * Each Angular component requires a single `@Component` annotation. The
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
export let ComponentMetadata = class extends DirectiveMetadata {
    constructor({ selector, inputs, outputs, properties, events, host, exportAs, moduleId, bindings, providers, viewBindings, viewProviders, changeDetection = ChangeDetectionStrategy.Default, queries, templateUrl, template, styleUrls, styles, directives, pipes, encapsulation } = {}) {
        super({
            selector: selector,
            inputs: inputs,
            outputs: outputs,
            properties: properties,
            events: events,
            host: host,
            exportAs: exportAs,
            moduleId: moduleId,
            bindings: bindings,
            providers: providers,
            queries: queries
        });
        this.changeDetection = changeDetection;
        this._viewProviders = viewProviders;
        this._viewBindings = viewBindings;
        this.templateUrl = templateUrl;
        this.template = template;
        this.styleUrls = styleUrls;
        this.styles = styles;
        this.directives = directives;
        this.pipes = pipes;
        this.encapsulation = encapsulation;
    }
    /**
     * Defines the set of injectable objects that are visible to its view DOM children.
     *
     * ## Simple Example
     *
     * Here is an example of a class that can be injected:
     *
     * ```
     * class Greeter {
     *    greet(name:string) {
     *      return 'Hello ' + name + '!';
     *    }
     * }
     *
     * @Directive({
     *   selector: 'needs-greeter'
     * })
     * class NeedsGreeter {
     *   greeter:Greeter;
     *
     *   constructor(greeter:Greeter) {
     *     this.greeter = greeter;
     *   }
     * }
     *
     * @Component({
     *   selector: 'greet',
     *   viewProviders: [
     *     Greeter
     *   ],
     *   template: `<needs-greeter></needs-greeter>`,
     *   directives: [NeedsGreeter]
     * })
     * class HelloWorld {
     * }
     *
     * ```
     */
    get viewProviders() {
        return isPresent(this._viewBindings) && this._viewBindings.length > 0 ? this._viewBindings :
            this._viewProviders;
    }
    get viewBindings() { return this.viewProviders; }
};
ComponentMetadata = __decorate([
    CONST(), 
    __metadata('design:paramtypes', [Object])
], ComponentMetadata);
/**
 * Declare reusable pipe function.
 *
 * A "pure" pipe is only re-evaluated when either the input or any of the arguments change.
 *
 * When not specified, pipes default to being pure.
 *
 * ### Example
 *
 * ```
 * @Pipe({name: 'lowercase'})
 * class Lowercase {
 *   transform(v, args) { return v.toLowerCase(); }
 * }
 * ```
 */
export let PipeMetadata = class extends InjectableMetadata {
    constructor({ name, pure }) {
        super();
        this.name = name;
        this._pure = pure;
    }
    get pure() { return isPresent(this._pure) ? this._pure : true; }
};
PipeMetadata = __decorate([
    CONST(), 
    __metadata('design:paramtypes', [Object])
], PipeMetadata);
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
export let InputMetadata = class {
    constructor(
        /**
         * Name used when instantiating a component in the temlate.
         */
        bindingPropertyName) {
        this.bindingPropertyName = bindingPropertyName;
    }
};
InputMetadata = __decorate([
    CONST(), 
    __metadata('design:paramtypes', [String])
], InputMetadata);
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
export let OutputMetadata = class {
    constructor(bindingPropertyName) {
        this.bindingPropertyName = bindingPropertyName;
    }
};
OutputMetadata = __decorate([
    CONST(), 
    __metadata('design:paramtypes', [String])
], OutputMetadata);
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
export let HostBindingMetadata = class {
    constructor(hostPropertyName) {
        this.hostPropertyName = hostPropertyName;
    }
};
HostBindingMetadata = __decorate([
    CONST(), 
    __metadata('design:paramtypes', [String])
], HostBindingMetadata);
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
export let HostListenerMetadata = class {
    constructor(eventName, args) {
        this.eventName = eventName;
        this.args = args;
    }
};
HostListenerMetadata = __decorate([
    CONST(), 
    __metadata('design:paramtypes', [String, Array])
], HostListenerMetadata);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGlyZWN0aXZlcy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImFuZ3VsYXIyL3NyYy9jb3JlL21ldGFkYXRhL2RpcmVjdGl2ZXMudHMiXSwibmFtZXMiOlsiRGlyZWN0aXZlTWV0YWRhdGEiLCJEaXJlY3RpdmVNZXRhZGF0YS5jb25zdHJ1Y3RvciIsIkRpcmVjdGl2ZU1ldGFkYXRhLmlucHV0cyIsIkRpcmVjdGl2ZU1ldGFkYXRhLnByb3BlcnRpZXMiLCJEaXJlY3RpdmVNZXRhZGF0YS5vdXRwdXRzIiwiRGlyZWN0aXZlTWV0YWRhdGEuZXZlbnRzIiwiRGlyZWN0aXZlTWV0YWRhdGEucHJvdmlkZXJzIiwiRGlyZWN0aXZlTWV0YWRhdGEuYmluZGluZ3MiLCJDb21wb25lbnRNZXRhZGF0YSIsIkNvbXBvbmVudE1ldGFkYXRhLmNvbnN0cnVjdG9yIiwiQ29tcG9uZW50TWV0YWRhdGEudmlld1Byb3ZpZGVycyIsIkNvbXBvbmVudE1ldGFkYXRhLnZpZXdCaW5kaW5ncyIsIlBpcGVNZXRhZGF0YSIsIlBpcGVNZXRhZGF0YS5jb25zdHJ1Y3RvciIsIlBpcGVNZXRhZGF0YS5wdXJlIiwiSW5wdXRNZXRhZGF0YSIsIklucHV0TWV0YWRhdGEuY29uc3RydWN0b3IiLCJPdXRwdXRNZXRhZGF0YSIsIk91dHB1dE1ldGFkYXRhLmNvbnN0cnVjdG9yIiwiSG9zdEJpbmRpbmdNZXRhZGF0YSIsIkhvc3RCaW5kaW5nTWV0YWRhdGEuY29uc3RydWN0b3IiLCJIb3N0TGlzdGVuZXJNZXRhZGF0YSIsIkhvc3RMaXN0ZW5lck1ldGFkYXRhLmNvbnN0cnVjdG9yIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7OztPQUFPLEVBQUMsU0FBUyxFQUFFLEtBQUssRUFBbUIsTUFBTSwwQkFBMEI7T0FDcEUsRUFBQyxrQkFBa0IsRUFBQyxNQUFNLCtCQUErQjtPQUN6RCxFQUFDLHVCQUF1QixFQUFDLE1BQU0sb0NBQW9DO0FBRzFFOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7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SUEsR0FBSkEsSUFBSUEsQ0FBV0E7SUFBR0EsQ0FBQ0E7QUFDbEVELENBQUNBO0FBSEQ7SUFBQyxLQUFLLEVBQUU7O3lCQUdQO0FBQUEiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge2lzUHJlc2VudCwgQ09OU1QsIENPTlNUX0VYUFIsIFR5cGV9IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvbGFuZyc7XG5pbXBvcnQge0luamVjdGFibGVNZXRhZGF0YX0gZnJvbSAnYW5ndWxhcjIvc3JjL2NvcmUvZGkvbWV0YWRhdGEnO1xuaW1wb3J0IHtDaGFuZ2VEZXRlY3Rpb25TdHJhdGVneX0gZnJvbSAnYW5ndWxhcjIvc3JjL2NvcmUvY2hhbmdlX2RldGVjdGlvbic7XG5pbXBvcnQge1ZpZXdFbmNhcHN1bGF0aW9ufSBmcm9tICdhbmd1bGFyMi9zcmMvY29yZS9tZXRhZGF0YS92aWV3JztcblxuLyoqXG4gKiBEaXJlY3RpdmVzIGFsbG93IHlvdSB0byBhdHRhY2ggYmVoYXZpb3IgdG8gZWxlbWVudHMgaW4gdGhlIERPTS5cbiAqXG4gKiB7QGxpbmsgRGlyZWN0aXZlTWV0YWRhdGF9cyB3aXRoIGFuIGVtYmVkZGVkIHZpZXcgYXJlIGNhbGxlZCB7QGxpbmsgQ29tcG9uZW50TWV0YWRhdGF9cy5cbiAqXG4gKiBBIGRpcmVjdGl2ZSBjb25zaXN0cyBvZiBhIHNpbmdsZSBkaXJlY3RpdmUgYW5ub3RhdGlvbiBhbmQgYSBjb250cm9sbGVyIGNsYXNzLiBXaGVuIHRoZVxuICogZGlyZWN0aXZlJ3MgYHNlbGVjdG9yYCBtYXRjaGVzXG4gKiBlbGVtZW50cyBpbiB0aGUgRE9NLCB0aGUgZm9sbG93aW5nIHN0ZXBzIG9jY3VyOlxuICpcbiAqIDEuIEZvciBlYWNoIGRpcmVjdGl2ZSwgdGhlIGBFbGVtZW50SW5qZWN0b3JgIGF0dGVtcHRzIHRvIHJlc29sdmUgdGhlIGRpcmVjdGl2ZSdzIGNvbnN0cnVjdG9yXG4gKiBhcmd1bWVudHMuXG4gKiAyLiBBbmd1bGFyIGluc3RhbnRpYXRlcyBkaXJlY3RpdmVzIGZvciBlYWNoIG1hdGNoZWQgZWxlbWVudCB1c2luZyBgRWxlbWVudEluamVjdG9yYCBpbiBhXG4gKiBkZXB0aC1maXJzdCBvcmRlcixcbiAqICAgIGFzIGRlY2xhcmVkIGluIHRoZSBIVE1MLlxuICpcbiAqICMjIFVuZGVyc3RhbmRpbmcgSG93IEluamVjdGlvbiBXb3Jrc1xuICpcbiAqIFRoZXJlIGFyZSB0aHJlZSBzdGFnZXMgb2YgaW5qZWN0aW9uIHJlc29sdXRpb24uXG4gKiAtICpQcmUtZXhpc3RpbmcgSW5qZWN0b3JzKjpcbiAqICAgLSBUaGUgdGVybWluYWwge0BsaW5rIEluamVjdG9yfSBjYW5ub3QgcmVzb2x2ZSBkZXBlbmRlbmNpZXMuIEl0IGVpdGhlciB0aHJvd3MgYW4gZXJyb3Igb3IsIGlmXG4gKiB0aGUgZGVwZW5kZW5jeSB3YXNcbiAqICAgICBzcGVjaWZpZWQgYXMgYEBPcHRpb25hbGAsIHJldHVybnMgYG51bGxgLlxuICogICAtIFRoZSBwbGF0Zm9ybSBpbmplY3RvciByZXNvbHZlcyBicm93c2VyIHNpbmdsZXRvbiByZXNvdXJjZXMsIHN1Y2ggYXM6IGNvb2tpZXMsIHRpdGxlLFxuICogbG9jYXRpb24sIGFuZCBvdGhlcnMuXG4gKiAtICpDb21wb25lbnQgSW5qZWN0b3JzKjogRWFjaCBjb21wb25lbnQgaW5zdGFuY2UgaGFzIGl0cyBvd24ge0BsaW5rIEluamVjdG9yfSwgYW5kIHRoZXkgZm9sbG93XG4gKiB0aGUgc2FtZSBwYXJlbnQtY2hpbGQgaGllcmFyY2h5XG4gKiAgICAgYXMgdGhlIGNvbXBvbmVudCBpbnN0YW5jZXMgaW4gdGhlIERPTS5cbiAqIC0gKkVsZW1lbnQgSW5qZWN0b3JzKjogRWFjaCBjb21wb25lbnQgaW5zdGFuY2UgaGFzIGEgU2hhZG93IERPTS4gV2l0aGluIHRoZSBTaGFkb3cgRE9NIGVhY2hcbiAqIGVsZW1lbnQgaGFzIGFuIGBFbGVtZW50SW5qZWN0b3JgXG4gKiAgICAgd2hpY2ggZm9sbG93IHRoZSBzYW1lIHBhcmVudC1jaGlsZCBoaWVyYXJjaHkgYXMgdGhlIERPTSBlbGVtZW50cyB0aGVtc2VsdmVzLlxuICpcbiAqIFdoZW4gYSB0ZW1wbGF0ZSBpcyBpbnN0YW50aWF0ZWQsIGl0IGFsc28gbXVzdCBpbnN0YW50aWF0ZSB0aGUgY29ycmVzcG9uZGluZyBkaXJlY3RpdmVzIGluIGFcbiAqIGRlcHRoLWZpcnN0IG9yZGVyLiBUaGVcbiAqIGN1cnJlbnQgYEVsZW1lbnRJbmplY3RvcmAgcmVzb2x2ZXMgdGhlIGNvbnN0cnVjdG9yIGRlcGVuZGVuY2llcyBmb3IgZWFjaCBkaXJlY3RpdmUuXG4gKlxuICogQW5ndWxhciB0aGVuIHJlc29sdmVzIGRlcGVuZGVuY2llcyBhcyBmb2xsb3dzLCBhY2NvcmRpbmcgdG8gdGhlIG9yZGVyIGluIHdoaWNoIHRoZXkgYXBwZWFyIGluIHRoZVxuICoge0BsaW5rIFZpZXdNZXRhZGF0YX06XG4gKlxuICogMS4gRGVwZW5kZW5jaWVzIG9uIHRoZSBjdXJyZW50IGVsZW1lbnRcbiAqIDIuIERlcGVuZGVuY2llcyBvbiBlbGVtZW50IGluamVjdG9ycyBhbmQgdGhlaXIgcGFyZW50cyB1bnRpbCBpdCBlbmNvdW50ZXJzIGEgU2hhZG93IERPTSBib3VuZGFyeVxuICogMy4gRGVwZW5kZW5jaWVzIG9uIGNvbXBvbmVudCBpbmplY3RvcnMgYW5kIHRoZWlyIHBhcmVudHMgdW50aWwgaXQgZW5jb3VudGVycyB0aGUgcm9vdCBjb21wb25lbnRcbiAqIDQuIERlcGVuZGVuY2llcyBvbiBwcmUtZXhpc3RpbmcgaW5qZWN0b3JzXG4gKlxuICpcbiAqIFRoZSBgRWxlbWVudEluamVjdG9yYCBjYW4gaW5qZWN0IG90aGVyIGRpcmVjdGl2ZXMsIGVsZW1lbnQtc3BlY2lmaWMgc3BlY2lhbCBvYmplY3RzLCBvciBpdCBjYW5cbiAqIGRlbGVnYXRlIHRvIHRoZSBwYXJlbnRcbiAqIGluamVjdG9yLlxuICpcbiAqIFRvIGluamVjdCBvdGhlciBkaXJlY3RpdmVzLCBkZWNsYXJlIHRoZSBjb25zdHJ1Y3RvciBwYXJhbWV0ZXIgYXM6XG4gKiAtIGBkaXJlY3RpdmU6RGlyZWN0aXZlVHlwZWA6IGEgZGlyZWN0aXZlIG9uIHRoZSBjdXJyZW50IGVsZW1lbnQgb25seVxuICogLSBgQEhvc3QoKSBkaXJlY3RpdmU6RGlyZWN0aXZlVHlwZWA6IGFueSBkaXJlY3RpdmUgdGhhdCBtYXRjaGVzIHRoZSB0eXBlIGJldHdlZW4gdGhlIGN1cnJlbnRcbiAqIGVsZW1lbnQgYW5kIHRoZVxuICogICAgU2hhZG93IERPTSByb290LlxuICogLSBgQFF1ZXJ5KERpcmVjdGl2ZVR5cGUpIHF1ZXJ5OlF1ZXJ5TGlzdDxEaXJlY3RpdmVUeXBlPmA6IEEgbGl2ZSBjb2xsZWN0aW9uIG9mIGRpcmVjdCBjaGlsZFxuICogZGlyZWN0aXZlcy5cbiAqIC0gYEBRdWVyeURlc2NlbmRhbnRzKERpcmVjdGl2ZVR5cGUpIHF1ZXJ5OlF1ZXJ5TGlzdDxEaXJlY3RpdmVUeXBlPmA6IEEgbGl2ZSBjb2xsZWN0aW9uIG9mIGFueVxuICogY2hpbGQgZGlyZWN0aXZlcy5cbiAqXG4gKiBUbyBpbmplY3QgZWxlbWVudC1zcGVjaWZpYyBzcGVjaWFsIG9iamVjdHMsIGRlY2xhcmUgdGhlIGNvbnN0cnVjdG9yIHBhcmFtZXRlciBhczpcbiAqIC0gYGVsZW1lbnQ6IEVsZW1lbnRSZWZgIHRvIG9idGFpbiBhIHJlZmVyZW5jZSB0byBsb2dpY2FsIGVsZW1lbnQgaW4gdGhlIHZpZXcuXG4gKiAtIGB2aWV3Q29udGFpbmVyOiBWaWV3Q29udGFpbmVyUmVmYCB0byBjb250cm9sIGNoaWxkIHRlbXBsYXRlIGluc3RhbnRpYXRpb24sIGZvclxuICoge0BsaW5rIERpcmVjdGl2ZU1ldGFkYXRhfSBkaXJlY3RpdmVzIG9ubHlcbiAqIC0gYGJpbmRpbmdQcm9wYWdhdGlvbjogQmluZGluZ1Byb3BhZ2F0aW9uYCB0byBjb250cm9sIGNoYW5nZSBkZXRlY3Rpb24gaW4gYSBtb3JlIGdyYW51bGFyIHdheS5cbiAqXG4gKiAjIyMgRXhhbXBsZVxuICpcbiAqIFRoZSBmb2xsb3dpbmcgZXhhbXBsZSBkZW1vbnN0cmF0ZXMgaG93IGRlcGVuZGVuY3kgaW5qZWN0aW9uIHJlc29sdmVzIGNvbnN0cnVjdG9yIGFyZ3VtZW50cyBpblxuICogcHJhY3RpY2UuXG4gKlxuICpcbiAqIEFzc3VtZSB0aGlzIEhUTUwgdGVtcGxhdGU6XG4gKlxuICogYGBgXG4gKiA8ZGl2IGRlcGVuZGVuY3k9XCIxXCI+XG4gKiAgIDxkaXYgZGVwZW5kZW5jeT1cIjJcIj5cbiAqICAgICA8ZGl2IGRlcGVuZGVuY3k9XCIzXCIgbXktZGlyZWN0aXZlPlxuICogICAgICAgPGRpdiBkZXBlbmRlbmN5PVwiNFwiPlxuICogICAgICAgICA8ZGl2IGRlcGVuZGVuY3k9XCI1XCI+PC9kaXY+XG4gKiAgICAgICA8L2Rpdj5cbiAqICAgICAgIDxkaXYgZGVwZW5kZW5jeT1cIjZcIj48L2Rpdj5cbiAqICAgICA8L2Rpdj5cbiAqICAgPC9kaXY+XG4gKiA8L2Rpdj5cbiAqIGBgYFxuICpcbiAqIFdpdGggdGhlIGZvbGxvd2luZyBgZGVwZW5kZW5jeWAgZGVjb3JhdG9yIGFuZCBgU29tZVNlcnZpY2VgIGluamVjdGFibGUgY2xhc3MuXG4gKlxuICogYGBgXG4gKiBASW5qZWN0YWJsZSgpXG4gKiBjbGFzcyBTb21lU2VydmljZSB7XG4gKiB9XG4gKlxuICogQERpcmVjdGl2ZSh7XG4gKiAgIHNlbGVjdG9yOiAnW2RlcGVuZGVuY3ldJyxcbiAqICAgaW5wdXRzOiBbXG4gKiAgICAgJ2lkOiBkZXBlbmRlbmN5J1xuICogICBdXG4gKiB9KVxuICogY2xhc3MgRGVwZW5kZW5jeSB7XG4gKiAgIGlkOnN0cmluZztcbiAqIH1cbiAqIGBgYFxuICpcbiAqIExldCdzIHN0ZXAgdGhyb3VnaCB0aGUgZGlmZmVyZW50IHdheXMgaW4gd2hpY2ggYE15RGlyZWN0aXZlYCBjb3VsZCBiZSBkZWNsYXJlZC4uLlxuICpcbiAqXG4gKiAjIyMgTm8gaW5qZWN0aW9uXG4gKlxuICogSGVyZSB0aGUgY29uc3RydWN0b3IgaXMgZGVjbGFyZWQgd2l0aCBubyBhcmd1bWVudHMsIHRoZXJlZm9yZSBub3RoaW5nIGlzIGluamVjdGVkIGludG9cbiAqIGBNeURpcmVjdGl2ZWAuXG4gKlxuICogYGBgXG4gKiBARGlyZWN0aXZlKHsgc2VsZWN0b3I6ICdbbXktZGlyZWN0aXZlXScgfSlcbiAqIGNsYXNzIE15RGlyZWN0aXZlIHtcbiAqICAgY29uc3RydWN0b3IoKSB7XG4gKiAgIH1cbiAqIH1cbiAqIGBgYFxuICpcbiAqIFRoaXMgZGlyZWN0aXZlIHdvdWxkIGJlIGluc3RhbnRpYXRlZCB3aXRoIG5vIGRlcGVuZGVuY2llcy5cbiAqXG4gKlxuICogIyMjIENvbXBvbmVudC1sZXZlbCBpbmplY3Rpb25cbiAqXG4gKiBEaXJlY3RpdmVzIGNhbiBpbmplY3QgYW55IGluamVjdGFibGUgaW5zdGFuY2UgZnJvbSB0aGUgY2xvc2VzdCBjb21wb25lbnQgaW5qZWN0b3Igb3IgYW55IG9mIGl0c1xuICogcGFyZW50cy5cbiAqXG4gKiBIZXJlLCB0aGUgY29uc3RydWN0b3IgZGVjbGFyZXMgYSBwYXJhbWV0ZXIsIGBzb21lU2VydmljZWAsIGFuZCBpbmplY3RzIHRoZSBgU29tZVNlcnZpY2VgIHR5cGVcbiAqIGZyb20gdGhlIHBhcmVudFxuICogY29tcG9uZW50J3MgaW5qZWN0b3IuXG4gKiBgYGBcbiAqIEBEaXJlY3RpdmUoeyBzZWxlY3RvcjogJ1tteS1kaXJlY3RpdmVdJyB9KVxuICogY2xhc3MgTXlEaXJlY3RpdmUge1xuICogICBjb25zdHJ1Y3Rvcihzb21lU2VydmljZTogU29tZVNlcnZpY2UpIHtcbiAqICAgfVxuICogfVxuICogYGBgXG4gKlxuICogVGhpcyBkaXJlY3RpdmUgd291bGQgYmUgaW5zdGFudGlhdGVkIHdpdGggYSBkZXBlbmRlbmN5IG9uIGBTb21lU2VydmljZWAuXG4gKlxuICpcbiAqICMjIyBJbmplY3RpbmcgYSBkaXJlY3RpdmUgZnJvbSB0aGUgY3VycmVudCBlbGVtZW50XG4gKlxuICogRGlyZWN0aXZlcyBjYW4gaW5qZWN0IG90aGVyIGRpcmVjdGl2ZXMgZGVjbGFyZWQgb24gdGhlIGN1cnJlbnQgZWxlbWVudC5cbiAqXG4gKiBgYGBcbiAqIEBEaXJlY3RpdmUoeyBzZWxlY3RvcjogJ1tteS1kaXJlY3RpdmVdJyB9KVxuICogY2xhc3MgTXlEaXJlY3RpdmUge1xuICogICBjb25zdHJ1Y3RvcihkZXBlbmRlbmN5OiBEZXBlbmRlbmN5KSB7XG4gKiAgICAgZXhwZWN0KGRlcGVuZGVuY3kuaWQpLnRvRXF1YWwoMyk7XG4gKiAgIH1cbiAqIH1cbiAqIGBgYFxuICogVGhpcyBkaXJlY3RpdmUgd291bGQgYmUgaW5zdGFudGlhdGVkIHdpdGggYERlcGVuZGVuY3lgIGRlY2xhcmVkIGF0IHRoZSBzYW1lIGVsZW1lbnQsIGluIHRoaXMgY2FzZVxuICogYGRlcGVuZGVuY3k9XCIzXCJgLlxuICpcbiAqICMjIyBJbmplY3RpbmcgYSBkaXJlY3RpdmUgZnJvbSBhbnkgYW5jZXN0b3IgZWxlbWVudHNcbiAqXG4gKiBEaXJlY3RpdmVzIGNhbiBpbmplY3Qgb3RoZXIgZGlyZWN0aXZlcyBkZWNsYXJlZCBvbiBhbnkgYW5jZXN0b3IgZWxlbWVudCAoaW4gdGhlIGN1cnJlbnQgU2hhZG93XG4gKiBET00pLCBpLmUuIG9uIHRoZSBjdXJyZW50IGVsZW1lbnQsIHRoZVxuICogcGFyZW50IGVsZW1lbnQsIG9yIGl0cyBwYXJlbnRzLlxuICogYGBgXG4gKiBARGlyZWN0aXZlKHsgc2VsZWN0b3I6ICdbbXktZGlyZWN0aXZlXScgfSlcbiAqIGNsYXNzIE15RGlyZWN0aXZlIHtcbiAqICAgY29uc3RydWN0b3IoQEhvc3QoKSBkZXBlbmRlbmN5OiBEZXBlbmRlbmN5KSB7XG4gKiAgICAgZXhwZWN0KGRlcGVuZGVuY3kuaWQpLnRvRXF1YWwoMik7XG4gKiAgIH1cbiAqIH1cbiAqIGBgYFxuICpcbiAqIGBASG9zdGAgY2hlY2tzIHRoZSBjdXJyZW50IGVsZW1lbnQsIHRoZSBwYXJlbnQsIGFzIHdlbGwgYXMgaXRzIHBhcmVudHMgcmVjdXJzaXZlbHkuIElmXG4gKiBgZGVwZW5kZW5jeT1cIjJcImAgZGlkbid0XG4gKiBleGlzdCBvbiB0aGUgZGlyZWN0IHBhcmVudCwgdGhpcyBpbmplY3Rpb24gd291bGRcbiAqIGhhdmUgcmV0dXJuZWRcbiAqIGBkZXBlbmRlbmN5PVwiMVwiYC5cbiAqXG4gKlxuICogIyMjIEluamVjdGluZyBhIGxpdmUgY29sbGVjdGlvbiBvZiBkaXJlY3QgY2hpbGQgZGlyZWN0aXZlc1xuICpcbiAqXG4gKiBBIGRpcmVjdGl2ZSBjYW4gYWxzbyBxdWVyeSBmb3Igb3RoZXIgY2hpbGQgZGlyZWN0aXZlcy4gU2luY2UgcGFyZW50IGRpcmVjdGl2ZXMgYXJlIGluc3RhbnRpYXRlZFxuICogYmVmb3JlIGNoaWxkIGRpcmVjdGl2ZXMsIGEgZGlyZWN0aXZlIGNhbid0IHNpbXBseSBpbmplY3QgdGhlIGxpc3Qgb2YgY2hpbGQgZGlyZWN0aXZlcy4gSW5zdGVhZCxcbiAqIHRoZSBkaXJlY3RpdmUgaW5qZWN0cyBhIHtAbGluayBRdWVyeUxpc3R9LCB3aGljaCB1cGRhdGVzIGl0cyBjb250ZW50cyBhcyBjaGlsZHJlbiBhcmUgYWRkZWQsXG4gKiByZW1vdmVkLCBvciBtb3ZlZCBieSBhIGRpcmVjdGl2ZSB0aGF0IHVzZXMgYSB7QGxpbmsgVmlld0NvbnRhaW5lclJlZn0gc3VjaCBhcyBhIGBuZy1mb3JgLCBhblxuICogYG5nLWlmYCwgb3IgYW4gYG5nLXN3aXRjaGAuXG4gKlxuICogYGBgXG4gKiBARGlyZWN0aXZlKHsgc2VsZWN0b3I6ICdbbXktZGlyZWN0aXZlXScgfSlcbiAqIGNsYXNzIE15RGlyZWN0aXZlIHtcbiAqICAgY29uc3RydWN0b3IoQFF1ZXJ5KERlcGVuZGVuY3kpIGRlcGVuZGVuY2llczpRdWVyeUxpc3Q8RGVwZW5kZW5jeT4pIHtcbiAqICAgfVxuICogfVxuICogYGBgXG4gKlxuICogVGhpcyBkaXJlY3RpdmUgd291bGQgYmUgaW5zdGFudGlhdGVkIHdpdGggYSB7QGxpbmsgUXVlcnlMaXN0fSB3aGljaCBjb250YWlucyBgRGVwZW5kZW5jeWAgNCBhbmRcbiAqIGBEZXBlbmRlbmN5YCA2LiBIZXJlLCBgRGVwZW5kZW5jeWAgNSB3b3VsZCBub3QgYmUgaW5jbHVkZWQsIGJlY2F1c2UgaXQgaXMgbm90IGEgZGlyZWN0IGNoaWxkLlxuICpcbiAqICMjIyBJbmplY3RpbmcgYSBsaXZlIGNvbGxlY3Rpb24gb2YgZGVzY2VuZGFudCBkaXJlY3RpdmVzXG4gKlxuICogQnkgcGFzc2luZyB0aGUgZGVzY2VuZGFudCBmbGFnIHRvIGBAUXVlcnlgIGFib3ZlLCB3ZSBjYW4gaW5jbHVkZSB0aGUgY2hpbGRyZW4gb2YgdGhlIGNoaWxkXG4gKiBlbGVtZW50cy5cbiAqXG4gKiBgYGBcbiAqIEBEaXJlY3RpdmUoeyBzZWxlY3RvcjogJ1tteS1kaXJlY3RpdmVdJyB9KVxuICogY2xhc3MgTXlEaXJlY3RpdmUge1xuICogICBjb25zdHJ1Y3RvcihAUXVlcnkoRGVwZW5kZW5jeSwge2Rlc2NlbmRhbnRzOiB0cnVlfSkgZGVwZW5kZW5jaWVzOlF1ZXJ5TGlzdDxEZXBlbmRlbmN5Pikge1xuICogICB9XG4gKiB9XG4gKiBgYGBcbiAqXG4gKiBUaGlzIGRpcmVjdGl2ZSB3b3VsZCBiZSBpbnN0YW50aWF0ZWQgd2l0aCBhIFF1ZXJ5IHdoaWNoIHdvdWxkIGNvbnRhaW4gYERlcGVuZGVuY3lgIDQsIDUgYW5kIDYuXG4gKlxuICogIyMjIE9wdGlvbmFsIGluamVjdGlvblxuICpcbiAqIFRoZSBub3JtYWwgYmVoYXZpb3Igb2YgZGlyZWN0aXZlcyBpcyB0byByZXR1cm4gYW4gZXJyb3Igd2hlbiBhIHNwZWNpZmllZCBkZXBlbmRlbmN5IGNhbm5vdCBiZVxuICogcmVzb2x2ZWQuIElmIHlvdVxuICogd291bGQgbGlrZSB0byBpbmplY3QgYG51bGxgIG9uIHVucmVzb2x2ZWQgZGVwZW5kZW5jeSBpbnN0ZWFkLCB5b3UgY2FuIGFubm90YXRlIHRoYXQgZGVwZW5kZW5jeVxuICogd2l0aCBgQE9wdGlvbmFsKClgLlxuICogVGhpcyBleHBsaWNpdGx5IHBlcm1pdHMgdGhlIGF1dGhvciBvZiBhIHRlbXBsYXRlIHRvIHRyZWF0IHNvbWUgb2YgdGhlIHN1cnJvdW5kaW5nIGRpcmVjdGl2ZXMgYXNcbiAqIG9wdGlvbmFsLlxuICpcbiAqIGBgYFxuICogQERpcmVjdGl2ZSh7IHNlbGVjdG9yOiAnW215LWRpcmVjdGl2ZV0nIH0pXG4gKiBjbGFzcyBNeURpcmVjdGl2ZSB7XG4gKiAgIGNvbnN0cnVjdG9yKEBPcHRpb25hbCgpIGRlcGVuZGVuY3k6RGVwZW5kZW5jeSkge1xuICogICB9XG4gKiB9XG4gKiBgYGBcbiAqXG4gKiBUaGlzIGRpcmVjdGl2ZSB3b3VsZCBiZSBpbnN0YW50aWF0ZWQgd2l0aCBhIGBEZXBlbmRlbmN5YCBkaXJlY3RpdmUgZm91bmQgb24gdGhlIGN1cnJlbnQgZWxlbWVudC5cbiAqIElmIG5vbmUgY2FuIGJlXG4gKiBmb3VuZCwgdGhlIGluamVjdG9yIHN1cHBsaWVzIGBudWxsYCBpbnN0ZWFkIG9mIHRocm93aW5nIGFuIGVycm9yLlxuICpcbiAqICMjIyBFeGFtcGxlXG4gKlxuICogSGVyZSB3ZSB1c2UgYSBkZWNvcmF0b3IgZGlyZWN0aXZlIHRvIHNpbXBseSBkZWZpbmUgYmFzaWMgdG9vbC10aXAgYmVoYXZpb3IuXG4gKlxuICogYGBgXG4gKiBARGlyZWN0aXZlKHtcbiAqICAgc2VsZWN0b3I6ICdbdG9vbHRpcF0nLFxuICogICBpbnB1dHM6IFtcbiAqICAgICAndGV4dDogdG9vbHRpcCdcbiAqICAgXSxcbiAqICAgaG9zdDoge1xuICogICAgICcobW91c2VlbnRlciknOiAnb25Nb3VzZUVudGVyKCknLFxuICogICAgICcobW91c2VsZWF2ZSknOiAnb25Nb3VzZUxlYXZlKCknXG4gKiAgIH1cbiAqIH0pXG4gKiBjbGFzcyBUb29sdGlwe1xuICogICB0ZXh0OnN0cmluZztcbiAqICAgb3ZlcmxheTpPdmVybGF5OyAvLyBOT1QgWUVUIElNUExFTUVOVEVEXG4gKiAgIG92ZXJsYXlNYW5hZ2VyOk92ZXJsYXlNYW5hZ2VyOyAvLyBOT1QgWUVUIElNUExFTUVOVEVEXG4gKlxuICogICBjb25zdHJ1Y3RvcihvdmVybGF5TWFuYWdlcjpPdmVybGF5TWFuYWdlcikge1xuICogICAgIHRoaXMub3ZlcmxheSA9IG92ZXJsYXk7XG4gKiAgIH1cbiAqXG4gKiAgIG9uTW91c2VFbnRlcigpIHtcbiAqICAgICAvLyBleGFjdCBzaWduYXR1cmUgdG8gYmUgZGV0ZXJtaW5lZFxuICogICAgIHRoaXMub3ZlcmxheSA9IHRoaXMub3ZlcmxheU1hbmFnZXIub3Blbih0ZXh0LCAuLi4pO1xuICogICB9XG4gKlxuICogICBvbk1vdXNlTGVhdmUoKSB7XG4gKiAgICAgdGhpcy5vdmVybGF5LmNsb3NlKCk7XG4gKiAgICAgdGhpcy5vdmVybGF5ID0gbnVsbDtcbiAqICAgfVxuICogfVxuICogYGBgXG4gKiBJbiBvdXIgSFRNTCB0ZW1wbGF0ZSwgd2UgY2FuIHRoZW4gYWRkIHRoaXMgYmVoYXZpb3IgdG8gYSBgPGRpdj5gIG9yIGFueSBvdGhlciBlbGVtZW50IHdpdGggdGhlXG4gKiBgdG9vbHRpcGAgc2VsZWN0b3IsXG4gKiBsaWtlIHNvOlxuICpcbiAqIGBgYFxuICogPGRpdiB0b29sdGlwPVwic29tZSB0ZXh0IGhlcmVcIj48L2Rpdj5cbiAqIGBgYFxuICpcbiAqIERpcmVjdGl2ZXMgY2FuIGFsc28gY29udHJvbCB0aGUgaW5zdGFudGlhdGlvbiwgZGVzdHJ1Y3Rpb24sIGFuZCBwb3NpdGlvbmluZyBvZiBpbmxpbmUgdGVtcGxhdGVcbiAqIGVsZW1lbnRzOlxuICpcbiAqIEEgZGlyZWN0aXZlIHVzZXMgYSB7QGxpbmsgVmlld0NvbnRhaW5lclJlZn0gdG8gaW5zdGFudGlhdGUsIGluc2VydCwgbW92ZSwgYW5kIGRlc3Ryb3kgdmlld3MgYXRcbiAqIHJ1bnRpbWUuXG4gKiBUaGUge0BsaW5rIFZpZXdDb250YWluZXJSZWZ9IGlzIGNyZWF0ZWQgYXMgYSByZXN1bHQgb2YgYDx0ZW1wbGF0ZT5gIGVsZW1lbnQsIGFuZCByZXByZXNlbnRzIGFcbiAqIGxvY2F0aW9uIGluIHRoZSBjdXJyZW50IHZpZXdcbiAqIHdoZXJlIHRoZXNlIGFjdGlvbnMgYXJlIHBlcmZvcm1lZC5cbiAqXG4gKiBWaWV3cyBhcmUgYWx3YXlzIGNyZWF0ZWQgYXMgY2hpbGRyZW4gb2YgdGhlIGN1cnJlbnQge0BsaW5rIFZpZXdNZXRhZGF0YX0sIGFuZCBhcyBzaWJsaW5ncyBvZiB0aGVcbiAqIGA8dGVtcGxhdGU+YCBlbGVtZW50LiBUaHVzIGFcbiAqIGRpcmVjdGl2ZSBpbiBhIGNoaWxkIHZpZXcgY2Fubm90IGluamVjdCB0aGUgZGlyZWN0aXZlIHRoYXQgY3JlYXRlZCBpdC5cbiAqXG4gKiBTaW5jZSBkaXJlY3RpdmVzIHRoYXQgY3JlYXRlIHZpZXdzIHZpYSBWaWV3Q29udGFpbmVycyBhcmUgY29tbW9uIGluIEFuZ3VsYXIsIGFuZCB1c2luZyB0aGUgZnVsbFxuICogYDx0ZW1wbGF0ZT5gIGVsZW1lbnQgc3ludGF4IGlzIHdvcmR5LCBBbmd1bGFyXG4gKiBhbHNvIHN1cHBvcnRzIGEgc2hvcnRoYW5kIG5vdGF0aW9uOiBgPGxpICpmb289XCJiYXJcIj5gIGFuZCBgPGxpIHRlbXBsYXRlPVwiZm9vOiBiYXJcIj5gIGFyZVxuICogZXF1aXZhbGVudC5cbiAqXG4gKiBUaHVzLFxuICpcbiAqIGBgYFxuICogPHVsPlxuICogICA8bGkgKmZvbz1cImJhclwiIHRpdGxlPVwidGV4dFwiPjwvbGk+XG4gKiA8L3VsPlxuICogYGBgXG4gKlxuICogRXhwYW5kcyBpbiB1c2UgdG86XG4gKlxuICogYGBgXG4gKiA8dWw+XG4gKiAgIDx0ZW1wbGF0ZSBbZm9vXT1cImJhclwiPlxuICogICAgIDxsaSB0aXRsZT1cInRleHRcIj48L2xpPlxuICogICA8L3RlbXBsYXRlPlxuICogPC91bD5cbiAqIGBgYFxuICpcbiAqIE5vdGljZSB0aGF0IGFsdGhvdWdoIHRoZSBzaG9ydGhhbmQgcGxhY2VzIGAqZm9vPVwiYmFyXCJgIHdpdGhpbiB0aGUgYDxsaT5gIGVsZW1lbnQsIHRoZSBiaW5kaW5nIGZvclxuICogdGhlIGRpcmVjdGl2ZVxuICogY29udHJvbGxlciBpcyBjb3JyZWN0bHkgaW5zdGFudGlhdGVkIG9uIHRoZSBgPHRlbXBsYXRlPmAgZWxlbWVudCByYXRoZXIgdGhhbiB0aGUgYDxsaT5gIGVsZW1lbnQuXG4gKlxuICogIyMgTGlmZWN5Y2xlIGhvb2tzXG4gKlxuICogV2hlbiB0aGUgZGlyZWN0aXZlIGNsYXNzIGltcGxlbWVudHMgc29tZSB7QGxpbmsgYW5ndWxhcjIvbGlmZWN5Y2xlX2hvb2tzfSB0aGUgY2FsbGJhY2tzIGFyZVxuICogY2FsbGVkIGJ5IHRoZSBjaGFuZ2UgZGV0ZWN0aW9uIGF0IGRlZmluZWQgcG9pbnRzIGluIHRpbWUgZHVyaW5nIHRoZSBsaWZlIG9mIHRoZSBkaXJlY3RpdmUuXG4gKlxuICogIyMjIEV4YW1wbGVcbiAqXG4gKiBMZXQncyBzdXBwb3NlIHdlIHdhbnQgdG8gaW1wbGVtZW50IHRoZSBgdW5sZXNzYCBiZWhhdmlvciwgdG8gY29uZGl0aW9uYWxseSBpbmNsdWRlIGEgdGVtcGxhdGUuXG4gKlxuICogSGVyZSBpcyBhIHNpbXBsZSBkaXJlY3RpdmUgdGhhdCB0cmlnZ2VycyBvbiBhbiBgdW5sZXNzYCBzZWxlY3RvcjpcbiAqXG4gKiBgYGBcbiAqIEBEaXJlY3RpdmUoe1xuICogICBzZWxlY3RvcjogJ1t1bmxlc3NdJyxcbiAqICAgaW5wdXRzOiBbJ3VubGVzcyddXG4gKiB9KVxuICogZXhwb3J0IGNsYXNzIFVubGVzcyB7XG4gKiAgIHZpZXdDb250YWluZXI6IFZpZXdDb250YWluZXJSZWY7XG4gKiAgIHRlbXBsYXRlUmVmOiBUZW1wbGF0ZVJlZjtcbiAqICAgcHJldkNvbmRpdGlvbjogYm9vbGVhbjtcbiAqXG4gKiAgIGNvbnN0cnVjdG9yKHZpZXdDb250YWluZXI6IFZpZXdDb250YWluZXJSZWYsIHRlbXBsYXRlUmVmOiBUZW1wbGF0ZVJlZikge1xuICogICAgIHRoaXMudmlld0NvbnRhaW5lciA9IHZpZXdDb250YWluZXI7XG4gKiAgICAgdGhpcy50ZW1wbGF0ZVJlZiA9IHRlbXBsYXRlUmVmO1xuICogICAgIHRoaXMucHJldkNvbmRpdGlvbiA9IG51bGw7XG4gKiAgIH1cbiAqXG4gKiAgIHNldCB1bmxlc3MobmV3Q29uZGl0aW9uKSB7XG4gKiAgICAgaWYgKG5ld0NvbmRpdGlvbiAmJiAoaXNCbGFuayh0aGlzLnByZXZDb25kaXRpb24pIHx8ICF0aGlzLnByZXZDb25kaXRpb24pKSB7XG4gKiAgICAgICB0aGlzLnByZXZDb25kaXRpb24gPSB0cnVlO1xuICogICAgICAgdGhpcy52aWV3Q29udGFpbmVyLmNsZWFyKCk7XG4gKiAgICAgfSBlbHNlIGlmICghbmV3Q29uZGl0aW9uICYmIChpc0JsYW5rKHRoaXMucHJldkNvbmRpdGlvbikgfHwgdGhpcy5wcmV2Q29uZGl0aW9uKSkge1xuICogICAgICAgdGhpcy5wcmV2Q29uZGl0aW9uID0gZmFsc2U7XG4gKiAgICAgICB0aGlzLnZpZXdDb250YWluZXIuY3JlYXRlKHRoaXMudGVtcGxhdGVSZWYpO1xuICogICAgIH1cbiAqICAgfVxuICogfVxuICogYGBgXG4gKlxuICogV2UgY2FuIHRoZW4gdXNlIHRoaXMgYHVubGVzc2Agc2VsZWN0b3IgaW4gYSB0ZW1wbGF0ZTpcbiAqIGBgYFxuICogPHVsPlxuICogICA8bGkgKnVubGVzcz1cImV4cHJcIj48L2xpPlxuICogPC91bD5cbiAqIGBgYFxuICpcbiAqIE9uY2UgdGhlIGRpcmVjdGl2ZSBpbnN0YW50aWF0ZXMgdGhlIGNoaWxkIHZpZXcsIHRoZSBzaG9ydGhhbmQgbm90YXRpb24gZm9yIHRoZSB0ZW1wbGF0ZSBleHBhbmRzXG4gKiBhbmQgdGhlIHJlc3VsdCBpczpcbiAqXG4gKiBgYGBcbiAqIDx1bD5cbiAqICAgPHRlbXBsYXRlIFt1bmxlc3NdPVwiZXhwXCI+XG4gKiAgICAgPGxpPjwvbGk+XG4gKiAgIDwvdGVtcGxhdGU+XG4gKiAgIDxsaT48L2xpPlxuICogPC91bD5cbiAqIGBgYFxuICpcbiAqIE5vdGUgYWxzbyB0aGF0IGFsdGhvdWdoIHRoZSBgPGxpPjwvbGk+YCB0ZW1wbGF0ZSBzdGlsbCBleGlzdHMgaW5zaWRlIHRoZSBgPHRlbXBsYXRlPjwvdGVtcGxhdGU+YCxcbiAqIHRoZSBpbnN0YW50aWF0ZWRcbiAqIHZpZXcgb2NjdXJzIG9uIHRoZSBzZWNvbmQgYDxsaT48L2xpPmAgd2hpY2ggaXMgYSBzaWJsaW5nIHRvIHRoZSBgPHRlbXBsYXRlPmAgZWxlbWVudC5cbiAqL1xuQENPTlNUKClcbmV4cG9ydCBjbGFzcyBEaXJlY3RpdmVNZXRhZGF0YSBleHRlbmRzIEluamVjdGFibGVNZXRhZGF0YSB7XG4gIC8qKlxuICAgKiBUaGUgQ1NTIHNlbGVjdG9yIHRoYXQgdHJpZ2dlcnMgdGhlIGluc3RhbnRpYXRpb24gb2YgYSBkaXJlY3RpdmUuXG4gICAqXG4gICAqIEFuZ3VsYXIgb25seSBhbGxvd3MgZGlyZWN0aXZlcyB0byB0cmlnZ2VyIG9uIENTUyBzZWxlY3RvcnMgdGhhdCBkbyBub3QgY3Jvc3MgZWxlbWVudFxuICAgKiBib3VuZGFyaWVzLlxuICAgKlxuICAgKiBgc2VsZWN0b3JgIG1heSBiZSBkZWNsYXJlZCBhcyBvbmUgb2YgdGhlIGZvbGxvd2luZzpcbiAgICpcbiAgICogLSBgZWxlbWVudC1uYW1lYDogc2VsZWN0IGJ5IGVsZW1lbnQgbmFtZS5cbiAgICogLSBgLmNsYXNzYDogc2VsZWN0IGJ5IGNsYXNzIG5hbWUuXG4gICAqIC0gYFthdHRyaWJ1dGVdYDogc2VsZWN0IGJ5IGF0dHJpYnV0ZSBuYW1lLlxuICAgKiAtIGBbYXR0cmlidXRlPXZhbHVlXWA6IHNlbGVjdCBieSBhdHRyaWJ1dGUgbmFtZSBhbmQgdmFsdWUuXG4gICAqIC0gYDpub3Qoc3ViX3NlbGVjdG9yKWA6IHNlbGVjdCBvbmx5IGlmIHRoZSBlbGVtZW50IGRvZXMgbm90IG1hdGNoIHRoZSBgc3ViX3NlbGVjdG9yYC5cbiAgICogLSBgc2VsZWN0b3IxLCBzZWxlY3RvcjJgOiBzZWxlY3QgaWYgZWl0aGVyIGBzZWxlY3RvcjFgIG9yIGBzZWxlY3RvcjJgIG1hdGNoZXMuXG4gICAqXG4gICAqXG4gICAqICMjIyBFeGFtcGxlXG4gICAqXG4gICAqIFN1cHBvc2Ugd2UgaGF2ZSBhIGRpcmVjdGl2ZSB3aXRoIGFuIGBpbnB1dFt0eXBlPXRleHRdYCBzZWxlY3Rvci5cbiAgICpcbiAgICogQW5kIHRoZSBmb2xsb3dpbmcgSFRNTDpcbiAgICpcbiAgICogYGBgaHRtbFxuICAgKiA8Zm9ybT5cbiAgICogICA8aW5wdXQgdHlwZT1cInRleHRcIj5cbiAgICogICA8aW5wdXQgdHlwZT1cInJhZGlvXCI+XG4gICAqIDxmb3JtPlxuICAgKiBgYGBcbiAgICpcbiAgICogVGhlIGRpcmVjdGl2ZSB3b3VsZCBvbmx5IGJlIGluc3RhbnRpYXRlZCBvbiB0aGUgYDxpbnB1dCB0eXBlPVwidGV4dFwiPmAgZWxlbWVudC5cbiAgICpcbiAgICovXG4gIHNlbGVjdG9yOiBzdHJpbmc7XG5cbiAgLyoqXG4gICAqIEVudW1lcmF0ZXMgdGhlIHNldCBvZiBkYXRhLWJvdW5kIGlucHV0IHByb3BlcnRpZXMgZm9yIGEgZGlyZWN0aXZlXG4gICAqXG4gICAqIEFuZ3VsYXIgYXV0b21hdGljYWxseSB1cGRhdGVzIGlucHV0IHByb3BlcnRpZXMgZHVyaW5nIGNoYW5nZSBkZXRlY3Rpb24uXG4gICAqXG4gICAqIFRoZSBgaW5wdXRzYCBwcm9wZXJ0eSBkZWZpbmVzIGEgc2V0IG9mIGBkaXJlY3RpdmVQcm9wZXJ0eWAgdG8gYGJpbmRpbmdQcm9wZXJ0eWBcbiAgICogY29uZmlndXJhdGlvbjpcbiAgICpcbiAgICogLSBgZGlyZWN0aXZlUHJvcGVydHlgIHNwZWNpZmllcyB0aGUgY29tcG9uZW50IHByb3BlcnR5IHdoZXJlIHRoZSB2YWx1ZSBpcyB3cml0dGVuLlxuICAgKiAtIGBiaW5kaW5nUHJvcGVydHlgIHNwZWNpZmllcyB0aGUgRE9NIHByb3BlcnR5IHdoZXJlIHRoZSB2YWx1ZSBpcyByZWFkIGZyb20uXG4gICAqXG4gICAqIFdoZW4gYGJpbmRpbmdQcm9wZXJ0eWAgaXMgbm90IHByb3ZpZGVkLCBpdCBpcyBhc3N1bWVkIHRvIGJlIGVxdWFsIHRvIGBkaXJlY3RpdmVQcm9wZXJ0eWAuXG4gICAqXG4gICAqICMjIyBFeGFtcGxlIChbbGl2ZSBkZW1vXShodHRwOi8vcGxua3IuY28vZWRpdC9pdmhmWFk/cD1wcmV2aWV3KSlcbiAgICpcbiAgICogVGhlIGZvbGxvd2luZyBleGFtcGxlIGNyZWF0ZXMgYSBjb21wb25lbnQgd2l0aCB0d28gZGF0YS1ib3VuZCBwcm9wZXJ0aWVzLlxuICAgKlxuICAgKiBgYGB0eXBlc2NyaXB0XG4gICAqIEBDb21wb25lbnQoe1xuICAgKiAgIHNlbGVjdG9yOiAnYmFuay1hY2NvdW50JyxcbiAgICogICBpbnB1dHM6IFsnYmFua05hbWUnLCAnaWQ6IGFjY291bnQtaWQnXSxcbiAgICogICB0ZW1wbGF0ZTogYFxuICAgKiAgICAgQmFuayBOYW1lOiB7e2JhbmtOYW1lfX1cbiAgICogICAgIEFjY291bnQgSWQ6IHt7aWR9fVxuICAgKiAgIGBcbiAgICogfSlcbiAgICogY2xhc3MgQmFua0FjY291bnQge1xuICAgKiAgIGJhbmtOYW1lOiBzdHJpbmc7XG4gICAqICAgaWQ6IHN0cmluZztcbiAgICpcbiAgICogICAvLyB0aGlzIHByb3BlcnR5IGlzIG5vdCBib3VuZCwgYW5kIHdvbid0IGJlIGF1dG9tYXRpY2FsbHkgdXBkYXRlZCBieSBBbmd1bGFyXG4gICAqICAgbm9ybWFsaXplZEJhbmtOYW1lOiBzdHJpbmc7XG4gICAqIH1cbiAgICpcbiAgICogQENvbXBvbmVudCh7XG4gICAqICAgc2VsZWN0b3I6ICdhcHAnLFxuICAgKiAgIHRlbXBsYXRlOiBgXG4gICAqICAgICA8YmFuay1hY2NvdW50IGJhbmstbmFtZT1cIlJCQ1wiIGFjY291bnQtaWQ9XCI0NzQ3XCI+PC9iYW5rLWFjY291bnQ+XG4gICAqICAgYCxcbiAgICogICBkaXJlY3RpdmVzOiBbQmFua0FjY291bnRdXG4gICAqIH0pXG4gICAqIGNsYXNzIEFwcCB7fVxuICAgKlxuICAgKiBib290c3RyYXAoQXBwKTtcbiAgICogYGBgXG4gICAqXG4gICAqL1xuICBnZXQgaW5wdXRzKCk6IHN0cmluZ1tdIHtcbiAgICByZXR1cm4gaXNQcmVzZW50KHRoaXMuX3Byb3BlcnRpZXMpICYmIHRoaXMuX3Byb3BlcnRpZXMubGVuZ3RoID4gMCA/IHRoaXMuX3Byb3BlcnRpZXMgOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5faW5wdXRzO1xuICB9XG4gIGdldCBwcm9wZXJ0aWVzKCk6IHN0cmluZ1tdIHsgcmV0dXJuIHRoaXMuaW5wdXRzOyB9XG4gIHByaXZhdGUgX2lucHV0czogc3RyaW5nW107XG4gIHByaXZhdGUgX3Byb3BlcnRpZXM6IHN0cmluZ1tdO1xuXG4gIC8qKlxuICAgKiBFbnVtZXJhdGVzIHRoZSBzZXQgb2YgZXZlbnQtYm91bmQgb3V0cHV0IHByb3BlcnRpZXMuXG4gICAqXG4gICAqIFdoZW4gYW4gb3V0cHV0IHByb3BlcnR5IGVtaXRzIGFuIGV2ZW50LCBhbiBldmVudCBoYW5kbGVyIGF0dGFjaGVkIHRvIHRoYXQgZXZlbnRcbiAgICogdGhlIHRlbXBsYXRlIGlzIGludm9rZWQuXG4gICAqXG4gICAqIFRoZSBgb3V0cHV0c2AgcHJvcGVydHkgZGVmaW5lcyBhIHNldCBvZiBgZGlyZWN0aXZlUHJvcGVydHlgIHRvIGBiaW5kaW5nUHJvcGVydHlgXG4gICAqIGNvbmZpZ3VyYXRpb246XG4gICAqXG4gICAqIC0gYGRpcmVjdGl2ZVByb3BlcnR5YCBzcGVjaWZpZXMgdGhlIGNvbXBvbmVudCBwcm9wZXJ0eSB0aGF0IGVtaXRzIGV2ZW50cy5cbiAgICogLSBgYmluZGluZ1Byb3BlcnR5YCBzcGVjaWZpZXMgdGhlIERPTSBwcm9wZXJ0eSB0aGUgZXZlbnQgaGFuZGxlciBpcyBhdHRhY2hlZCB0by5cbiAgICpcbiAgICogIyMjIEV4YW1wbGUgKFtsaXZlIGRlbW9dKGh0dHA6Ly9wbG5rci5jby9lZGl0L2Q1Q05xNz9wPXByZXZpZXcpKVxuICAgKlxuICAgKiBgYGB0eXBlc2NyaXB0XG4gICAqIEBEaXJlY3RpdmUoe1xuICAgKiAgIHNlbGVjdG9yOiAnaW50ZXJ2YWwtZGlyJyxcbiAgICogICBvdXRwdXRzOiBbJ2V2ZXJ5U2Vjb25kJywgJ2ZpdmU1U2VjczogZXZlcnlGaXZlU2Vjb25kcyddXG4gICAqIH0pXG4gICAqIGNsYXNzIEludGVydmFsRGlyIHtcbiAgICogICBldmVyeVNlY29uZCA9IG5ldyBFdmVudEVtaXR0ZXIoKTtcbiAgICogICBmaXZlNVNlY3MgPSBuZXcgRXZlbnRFbWl0dGVyKCk7XG4gICAqXG4gICAqICAgY29uc3RydWN0b3IoKSB7XG4gICAqICAgICBzZXRJbnRlcnZhbCgoKSA9PiB0aGlzLmV2ZXJ5U2Vjb25kLmVtaXQoXCJldmVudFwiKSwgMTAwMCk7XG4gICAqICAgICBzZXRJbnRlcnZhbCgoKSA9PiB0aGlzLmZpdmU1U2Vjcy5lbWl0KFwiZXZlbnRcIiksIDUwMDApO1xuICAgKiAgIH1cbiAgICogfVxuICAgKlxuICAgKiBAQ29tcG9uZW50KHtcbiAgICogICBzZWxlY3RvcjogJ2FwcCcsXG4gICAqICAgdGVtcGxhdGU6IGBcbiAgICogICAgIDxpbnRlcnZhbC1kaXIgKGV2ZXJ5LXNlY29uZCk9XCJldmVyeVNlY29uZCgpXCIgKGV2ZXJ5LWZpdmUtc2Vjb25kcyk9XCJldmVyeUZpdmVTZWNvbmRzKClcIj5cbiAgICogICAgIDwvaW50ZXJ2YWwtZGlyPlxuICAgKiAgIGAsXG4gICAqICAgZGlyZWN0aXZlczogW0ludGVydmFsRGlyXVxuICAgKiB9KVxuICAgKiBjbGFzcyBBcHAge1xuICAgKiAgIGV2ZXJ5U2Vjb25kKCkgeyBjb25zb2xlLmxvZygnc2Vjb25kJyk7IH1cbiAgICogICBldmVyeUZpdmVTZWNvbmRzKCkgeyBjb25zb2xlLmxvZygnZml2ZSBzZWNvbmRzJyk7IH1cbiAgICogfVxuICAgKiBib290c3RyYXAoQXBwKTtcbiAgICogYGBgXG4gICAqXG4gICAqL1xuICBnZXQgb3V0cHV0cygpOiBzdHJpbmdbXSB7XG4gICAgcmV0dXJuIGlzUHJlc2VudCh0aGlzLl9ldmVudHMpICYmIHRoaXMuX2V2ZW50cy5sZW5ndGggPiAwID8gdGhpcy5fZXZlbnRzIDogdGhpcy5fb3V0cHV0cztcbiAgfVxuICBnZXQgZXZlbnRzKCk6IHN0cmluZ1tdIHsgcmV0dXJuIHRoaXMub3V0cHV0czsgfVxuICBwcml2YXRlIF9vdXRwdXRzOiBzdHJpbmdbXTtcbiAgcHJpdmF0ZSBfZXZlbnRzOiBzdHJpbmdbXTtcblxuICAvKipcbiAgICogU3BlY2lmeSB0aGUgZXZlbnRzLCBhY3Rpb25zLCBwcm9wZXJ0aWVzIGFuZCBhdHRyaWJ1dGVzIHJlbGF0ZWQgdG8gdGhlIGhvc3QgZWxlbWVudC5cbiAgICpcbiAgICogIyMgSG9zdCBMaXN0ZW5lcnNcbiAgICpcbiAgICogU3BlY2lmaWVzIHdoaWNoIERPTSBldmVudHMgYSBkaXJlY3RpdmUgbGlzdGVucyB0byB2aWEgYSBzZXQgb2YgYChldmVudClgIHRvIGBtZXRob2RgXG4gICAqIGtleS12YWx1ZSBwYWlyczpcbiAgICpcbiAgICogLSBgZXZlbnQxYDogdGhlIERPTSBldmVudCB0aGF0IHRoZSBkaXJlY3RpdmUgbGlzdGVucyB0by5cbiAgICogLSBgc3RhdGVtZW50YDogdGhlIHN0YXRlbWVudCB0byBleGVjdXRlIHdoZW4gdGhlIGV2ZW50IG9jY3Vycy5cbiAgICogSWYgdGhlIGV2YWx1YXRpb24gb2YgdGhlIHN0YXRlbWVudCByZXR1cm5zIGBmYWxzZWAsIHRoZW4gYHByZXZlbnREZWZhdWx0YGlzIGFwcGxpZWQgb24gdGhlIERPTVxuICAgKiBldmVudC5cbiAgICpcbiAgICogVG8gbGlzdGVuIHRvIGdsb2JhbCBldmVudHMsIGEgdGFyZ2V0IG11c3QgYmUgYWRkZWQgdG8gdGhlIGV2ZW50IG5hbWUuXG4gICAqIFRoZSB0YXJnZXQgY2FuIGJlIGB3aW5kb3dgLCBgZG9jdW1lbnRgIG9yIGBib2R5YC5cbiAgICpcbiAgICogV2hlbiB3cml0aW5nIGEgZGlyZWN0aXZlIGV2ZW50IGJpbmRpbmcsIHlvdSBjYW4gYWxzbyByZWZlciB0byB0aGUgJGV2ZW50IGxvY2FsIHZhcmlhYmxlLlxuICAgKlxuICAgKiAjIyMgRXhhbXBsZSAoW2xpdmUgZGVtb10oaHR0cDovL3BsbmtyLmNvL2VkaXQvRGxBNUtVP3A9cHJldmlldykpXG4gICAqXG4gICAqIFRoZSBmb2xsb3dpbmcgZXhhbXBsZSBkZWNsYXJlcyBhIGRpcmVjdGl2ZSB0aGF0IGF0dGFjaGVzIGEgY2xpY2sgbGlzdGVuZXIgdG8gdGhlIGJ1dHRvbiBhbmRcbiAgICogY291bnRzIGNsaWNrcy5cbiAgICpcbiAgICogYGBgdHlwZXNjcmlwdFxuICAgKiBARGlyZWN0aXZlKHtcbiAgICogICBzZWxlY3RvcjogJ2J1dHRvbltjb3VudGluZ10nLFxuICAgKiAgIGhvc3Q6IHtcbiAgICogICAgICcoY2xpY2spJzogJ29uQ2xpY2soJGV2ZW50LnRhcmdldCknXG4gICAqICAgfVxuICAgKiB9KVxuICAgKiBjbGFzcyBDb3VudENsaWNrcyB7XG4gICAqICAgbnVtYmVyT2ZDbGlja3MgPSAwO1xuICAgKlxuICAgKiAgIG9uQ2xpY2soYnRuKSB7XG4gICAqICAgICBjb25zb2xlLmxvZyhcImJ1dHRvblwiLCBidG4sIFwibnVtYmVyIG9mIGNsaWNrczpcIiwgdGhpcy5udW1iZXJPZkNsaWNrcysrKTtcbiAgICogICB9XG4gICAqIH1cbiAgICpcbiAgICogQENvbXBvbmVudCh7XG4gICAqICAgc2VsZWN0b3I6ICdhcHAnLFxuICAgKiAgIHRlbXBsYXRlOiBgPGJ1dHRvbiBjb3VudGluZz5JbmNyZW1lbnQ8L2J1dHRvbj5gLFxuICAgKiAgIGRpcmVjdGl2ZXM6IFtDb3VudENsaWNrc11cbiAgICogfSlcbiAgICogY2xhc3MgQXBwIHt9XG4gICAqXG4gICAqIGJvb3RzdHJhcChBcHApO1xuICAgKiBgYGBcbiAgICpcbiAgICogIyMgSG9zdCBQcm9wZXJ0eSBCaW5kaW5nc1xuICAgKlxuICAgKiBTcGVjaWZpZXMgd2hpY2ggRE9NIHByb3BlcnRpZXMgYSBkaXJlY3RpdmUgdXBkYXRlcy5cbiAgICpcbiAgICogQW5ndWxhciBhdXRvbWF0aWNhbGx5IGNoZWNrcyBob3N0IHByb3BlcnR5IGJpbmRpbmdzIGR1cmluZyBjaGFuZ2UgZGV0ZWN0aW9uLlxuICAgKiBJZiBhIGJpbmRpbmcgY2hhbmdlcywgaXQgd2lsbCB1cGRhdGUgdGhlIGhvc3QgZWxlbWVudCBvZiB0aGUgZGlyZWN0aXZlLlxuICAgKlxuICAgKiAjIyMgRXhhbXBsZSAoW2xpdmUgZGVtb10oaHR0cDovL3BsbmtyLmNvL2VkaXQvZ05nMEVEP3A9cHJldmlldykpXG4gICAqXG4gICAqIFRoZSBmb2xsb3dpbmcgZXhhbXBsZSBjcmVhdGVzIGEgZGlyZWN0aXZlIHRoYXQgc2V0cyB0aGUgYHZhbGlkYCBhbmQgYGludmFsaWRgIGNsYXNzZXNcbiAgICogb24gdGhlIERPTSBlbGVtZW50IHRoYXQgaGFzIG5nLW1vZGVsIGRpcmVjdGl2ZSBvbiBpdC5cbiAgICpcbiAgICogYGBgdHlwZXNjcmlwdFxuICAgKiBARGlyZWN0aXZlKHtcbiAgICogICBzZWxlY3RvcjogJ1tuZy1tb2RlbF0nLFxuICAgKiAgIGhvc3Q6IHtcbiAgICogICAgICdbY2xhc3MudmFsaWRdJzogJ3ZhbGlkJyxcbiAgICogICAgICdbY2xhc3MuaW52YWxpZF0nOiAnaW52YWxpZCdcbiAgICogICB9XG4gICAqIH0pXG4gICAqIGNsYXNzIE5nTW9kZWxTdGF0dXMge1xuICAgKiAgIGNvbnN0cnVjdG9yKHB1YmxpYyBjb250cm9sOk5nTW9kZWwpIHt9XG4gICAqICAgZ2V0IHZhbGlkIHsgcmV0dXJuIHRoaXMuY29udHJvbC52YWxpZDsgfVxuICAgKiAgIGdldCBpbnZhbGlkIHsgcmV0dXJuIHRoaXMuY29udHJvbC5pbnZhbGlkOyB9XG4gICAqIH1cbiAgICpcbiAgICogQENvbXBvbmVudCh7XG4gICAqICAgc2VsZWN0b3I6ICdhcHAnLFxuICAgKiAgIHRlbXBsYXRlOiBgPGlucHV0IFsobmctbW9kZWwpXT1cInByb3BcIj5gLFxuICAgKiAgIGRpcmVjdGl2ZXM6IFtGT1JNX0RJUkVDVElWRVMsIE5nTW9kZWxTdGF0dXNdXG4gICAqIH0pXG4gICAqIGNsYXNzIEFwcCB7XG4gICAqICAgcHJvcDtcbiAgICogfVxuICAgKlxuICAgKiBib290c3RyYXAoQXBwKTtcbiAgICogYGBgXG4gICAqXG4gICAqICMjIEF0dHJpYnV0ZXNcbiAgICpcbiAgICogU3BlY2lmaWVzIHN0YXRpYyBhdHRyaWJ1dGVzIHRoYXQgc2hvdWxkIGJlIHByb3BhZ2F0ZWQgdG8gYSBob3N0IGVsZW1lbnQuXG4gICAqXG4gICAqICMjIyBFeGFtcGxlXG4gICAqXG4gICAqIEluIHRoaXMgZXhhbXBsZSB1c2luZyBgbXktYnV0dG9uYCBkaXJlY3RpdmUgKGV4LjogYDxkaXYgbXktYnV0dG9uPjwvZGl2PmApIG9uIGEgaG9zdCBlbGVtZW50XG4gICAqIChoZXJlOiBgPGRpdj5gICkgd2lsbCBlbnN1cmUgdGhhdCB0aGlzIGVsZW1lbnQgd2lsbCBnZXQgdGhlIFwiYnV0dG9uXCIgcm9sZS5cbiAgICpcbiAgICogYGBgdHlwZXNjcmlwdFxuICAgKiBARGlyZWN0aXZlKHtcbiAgICogICBzZWxlY3RvcjogJ1tteS1idXR0b25dJyxcbiAgICogICBob3N0OiB7XG4gICAqICAgICAncm9sZSc6ICdidXR0b24nXG4gICAqICAgfVxuICAgKiB9KVxuICAgKiBjbGFzcyBNeUJ1dHRvbiB7XG4gICAqIH1cbiAgICogYGBgXG4gICAqL1xuICBob3N0OiB7W2tleTogc3RyaW5nXTogc3RyaW5nfTtcblxuICAvKipcbiAgICogRGVmaW5lcyB0aGUgc2V0IG9mIGluamVjdGFibGUgb2JqZWN0cyB0aGF0IGFyZSB2aXNpYmxlIHRvIGEgRGlyZWN0aXZlIGFuZCBpdHMgbGlnaHQgRE9NXG4gICAqIGNoaWxkcmVuLlxuICAgKlxuICAgKiAjIyBTaW1wbGUgRXhhbXBsZVxuICAgKlxuICAgKiBIZXJlIGlzIGFuIGV4YW1wbGUgb2YgYSBjbGFzcyB0aGF0IGNhbiBiZSBpbmplY3RlZDpcbiAgICpcbiAgICogYGBgXG4gICAqIGNsYXNzIEdyZWV0ZXIge1xuICAgKiAgICBncmVldChuYW1lOnN0cmluZykge1xuICAgKiAgICAgIHJldHVybiAnSGVsbG8gJyArIG5hbWUgKyAnISc7XG4gICAqICAgIH1cbiAgICogfVxuICAgKlxuICAgKiBARGlyZWN0aXZlKHtcbiAgICogICBzZWxlY3RvcjogJ2dyZWV0JyxcbiAgICogICBiaW5kaW5nczogW1xuICAgKiAgICAgR3JlZXRlclxuICAgKiAgIF1cbiAgICogfSlcbiAgICogY2xhc3MgSGVsbG9Xb3JsZCB7XG4gICAqICAgZ3JlZXRlcjpHcmVldGVyO1xuICAgKlxuICAgKiAgIGNvbnN0cnVjdG9yKGdyZWV0ZXI6R3JlZXRlcikge1xuICAgKiAgICAgdGhpcy5ncmVldGVyID0gZ3JlZXRlcjtcbiAgICogICB9XG4gICAqIH1cbiAgICogYGBgXG4gICAqL1xuICBnZXQgcHJvdmlkZXJzKCk6IGFueVtdIHtcbiAgICByZXR1cm4gaXNQcmVzZW50KHRoaXMuX2JpbmRpbmdzKSAmJiB0aGlzLl9iaW5kaW5ncy5sZW5ndGggPiAwID8gdGhpcy5fYmluZGluZ3MgOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLl9wcm92aWRlcnM7XG4gIH1cbiAgLyoqIEBkZXByZWNhdGVkICovXG4gIGdldCBiaW5kaW5ncygpOiBhbnlbXSB7IHJldHVybiB0aGlzLnByb3ZpZGVyczsgfVxuICBwcml2YXRlIF9wcm92aWRlcnM6IGFueVtdO1xuICBwcml2YXRlIF9iaW5kaW5nczogYW55W107XG5cbiAgLyoqXG4gICAqIERlZmluZXMgdGhlIG5hbWUgdGhhdCBjYW4gYmUgdXNlZCBpbiB0aGUgdGVtcGxhdGUgdG8gYXNzaWduIHRoaXMgZGlyZWN0aXZlIHRvIGEgdmFyaWFibGUuXG4gICAqXG4gICAqICMjIFNpbXBsZSBFeGFtcGxlXG4gICAqXG4gICAqIGBgYFxuICAgKiBARGlyZWN0aXZlKHtcbiAgICogICBzZWxlY3RvcjogJ2NoaWxkLWRpcicsXG4gICAqICAgZXhwb3J0QXM6ICdjaGlsZCdcbiAgICogfSlcbiAgICogY2xhc3MgQ2hpbGREaXIge1xuICAgKiB9XG4gICAqXG4gICAqIEBDb21wb25lbnQoe1xuICAgKiAgIHNlbGVjdG9yOiAnbWFpbicsXG4gICAqICAgdGVtcGxhdGU6IGA8Y2hpbGQtZGlyICNjPVwiY2hpbGRcIj48L2NoaWxkLWRpcj5gLFxuICAgKiAgIGRpcmVjdGl2ZXM6IFtDaGlsZERpcl1cbiAgICogfSlcbiAgICogY2xhc3MgTWFpbkNvbXBvbmVudCB7XG4gICAqIH1cbiAgICpcbiAgICogYGBgXG4gICAqL1xuICBleHBvcnRBczogc3RyaW5nO1xuXG4gIC8qKlxuICAgKiBUaGUgbW9kdWxlIGlkIG9mIHRoZSBtb2R1bGUgdGhhdCBjb250YWlucyB0aGUgZGlyZWN0aXZlLlxuICAgKiBOZWVkZWQgdG8gYmUgYWJsZSB0byByZXNvbHZlIHJlbGF0aXZlIHVybHMgZm9yIHRlbXBsYXRlcyBhbmQgc3R5bGVzLlxuICAgKiBJbiBEYXJ0LCB0aGlzIGNhbiBiZSBkZXRlcm1pbmVkIGF1dG9tYXRpY2FsbHkgYW5kIGRvZXMgbm90IG5lZWQgdG8gYmUgc2V0LlxuICAgKiBJbiBDb21tb25KUywgdGhpcyBjYW4gYWx3YXlzIGJlIHNldCB0byBgbW9kdWxlLmlkYC5cbiAgICpcbiAgICogIyMgU2ltcGxlIEV4YW1wbGVcbiAgICpcbiAgICogYGBgXG4gICAqIEBEaXJlY3RpdmUoe1xuICAgKiAgIHNlbGVjdG9yOiAnc29tZURpcicsXG4gICAqICAgbW9kdWxlSWQ6IG1vZHVsZS5pZFxuICAgKiB9KVxuICAgKiBjbGFzcyBTb21lRGlyIHtcbiAgICogfVxuICAgKlxuICAgKiBgYGBcbiAgICovXG4gIG1vZHVsZUlkOiBzdHJpbmc7XG5cbiAgLy8gVE9ETzogYWRkIGFuIGV4YW1wbGUgYWZ0ZXIgQ29udGVudENoaWxkcmVuIGFuZCBWaWV3Q2hpbGRyZW4gYXJlIGluIG1hc3RlclxuICAvKipcbiAgICogQ29uZmlndXJlcyB0aGUgcXVlcmllcyB0aGF0IHdpbGwgYmUgaW5qZWN0ZWQgaW50byB0aGUgZGlyZWN0aXZlLlxuICAgKlxuICAgKiBDb250ZW50IHF1ZXJpZXMgYXJlIHNldCBiZWZvcmUgdGhlIGBhZnRlckNvbnRlbnRJbml0YCBjYWxsYmFjayBpcyBjYWxsZWQuXG4gICAqIFZpZXcgcXVlcmllcyBhcmUgc2V0IGJlZm9yZSB0aGUgYGFmdGVyVmlld0luaXRgIGNhbGxiYWNrIGlzIGNhbGxlZC5cbiAgICpcbiAgICogIyMjIEV4YW1wbGVcbiAgICpcbiAgICogYGBgXG4gICAqIEBDb21wb25lbnQoe1xuICAgKiAgIHNlbGVjdG9yOiAnc29tZURpcicsXG4gICAqICAgcXVlcmllczoge1xuICAgKiAgICAgY29udGVudENoaWxkcmVuOiBuZXcgQ29udGVudENoaWxkcmVuKENoaWxkRGlyZWN0aXZlKSxcbiAgICogICAgIHZpZXdDaGlsZHJlbjogbmV3IFZpZXdDaGlsZHJlbihDaGlsZERpcmVjdGl2ZSlcbiAgICogICB9LFxuICAgKiAgIHRlbXBsYXRlOiAnPGNoaWxkLWRpcmVjdGl2ZT48L2NoaWxkLWRpcmVjdGl2ZT4nLFxuICAgKiAgIGRpcmVjdGl2ZXM6IFtDaGlsZERpcmVjdGl2ZV1cbiAgICogfSlcbiAgICogY2xhc3MgU29tZURpciB7XG4gICAqICAgY29udGVudENoaWxkcmVuOiBRdWVyeUxpc3Q8Q2hpbGREaXJlY3RpdmU+LFxuICAgKiAgIHZpZXdDaGlsZHJlbjogUXVlcnlMaXN0PENoaWxkRGlyZWN0aXZlPlxuICAgKlxuICAgKiAgIGFmdGVyQ29udGVudEluaXQoKSB7XG4gICAqICAgICAvLyBjb250ZW50Q2hpbGRyZW4gaXMgc2V0XG4gICAqICAgfVxuICAgKlxuICAgKiAgIGFmdGVyVmlld0luaXQoKSB7XG4gICAqICAgICAvLyB2aWV3Q2hpbGRyZW4gaXMgc2V0XG4gICAqICAgfVxuICAgKiB9XG4gICAqIGBgYFxuICAgKi9cbiAgcXVlcmllczoge1trZXk6IHN0cmluZ106IGFueX07XG5cbiAgY29uc3RydWN0b3Ioe3NlbGVjdG9yLCBpbnB1dHMsIG91dHB1dHMsIHByb3BlcnRpZXMsIGV2ZW50cywgaG9zdCwgYmluZGluZ3MsIHByb3ZpZGVycywgZXhwb3J0QXMsXG4gICAgICAgICAgICAgICBtb2R1bGVJZCwgcXVlcmllc306IHtcbiAgICBzZWxlY3Rvcj86IHN0cmluZyxcbiAgICBpbnB1dHM/OiBzdHJpbmdbXSxcbiAgICBvdXRwdXRzPzogc3RyaW5nW10sXG4gICAgcHJvcGVydGllcz86IHN0cmluZ1tdLFxuICAgIGV2ZW50cz86IHN0cmluZ1tdLFxuICAgIGhvc3Q/OiB7W2tleTogc3RyaW5nXTogc3RyaW5nfSxcbiAgICBwcm92aWRlcnM/OiBhbnlbXSxcbiAgICAvKiogQGRlcHJlY2F0ZWQgKi8gYmluZGluZ3M/OiBhbnlbXSxcbiAgICBleHBvcnRBcz86IHN0cmluZyxcbiAgICBtb2R1bGVJZD86IHN0cmluZyxcbiAgICBxdWVyaWVzPzoge1trZXk6IHN0cmluZ106IGFueX1cbiAgfSA9IHt9KSB7XG4gICAgc3VwZXIoKTtcbiAgICB0aGlzLnNlbGVjdG9yID0gc2VsZWN0b3I7XG4gICAgdGhpcy5faW5wdXRzID0gaW5wdXRzO1xuICAgIHRoaXMuX3Byb3BlcnRpZXMgPSBwcm9wZXJ0aWVzO1xuICAgIHRoaXMuX291dHB1dHMgPSBvdXRwdXRzO1xuICAgIHRoaXMuX2V2ZW50cyA9IGV2ZW50cztcbiAgICB0aGlzLmhvc3QgPSBob3N0O1xuICAgIHRoaXMuZXhwb3J0QXMgPSBleHBvcnRBcztcbiAgICB0aGlzLm1vZHVsZUlkID0gbW9kdWxlSWQ7XG4gICAgdGhpcy5xdWVyaWVzID0gcXVlcmllcztcbiAgICB0aGlzLl9wcm92aWRlcnMgPSBwcm92aWRlcnM7XG4gICAgdGhpcy5fYmluZGluZ3MgPSBiaW5kaW5ncztcbiAgfVxufVxuXG4vKipcbiAqIERlY2xhcmUgcmV1c2FibGUgVUkgYnVpbGRpbmcgYmxvY2tzIGZvciBhbiBhcHBsaWNhdGlvbi5cbiAqXG4gKiBFYWNoIEFuZ3VsYXIgY29tcG9uZW50IHJlcXVpcmVzIGEgc2luZ2xlIGBAQ29tcG9uZW50YCBhbm5vdGF0aW9uLiBUaGVcbiAqIGBAQ29tcG9uZW50YFxuICogYW5ub3RhdGlvbiBzcGVjaWZpZXMgd2hlbiBhIGNvbXBvbmVudCBpcyBpbnN0YW50aWF0ZWQsIGFuZCB3aGljaCBwcm9wZXJ0aWVzIGFuZCBob3N0TGlzdGVuZXJzIGl0XG4gKiBiaW5kcyB0by5cbiAqXG4gKiBXaGVuIGEgY29tcG9uZW50IGlzIGluc3RhbnRpYXRlZCwgQW5ndWxhclxuICogLSBjcmVhdGVzIGEgc2hhZG93IERPTSBmb3IgdGhlIGNvbXBvbmVudC5cbiAqIC0gbG9hZHMgdGhlIHNlbGVjdGVkIHRlbXBsYXRlIGludG8gdGhlIHNoYWRvdyBET00uXG4gKiAtIGNyZWF0ZXMgYWxsIHRoZSBpbmplY3RhYmxlIG9iamVjdHMgY29uZmlndXJlZCB3aXRoIGBwcm92aWRlcnNgIGFuZCBgdmlld1Byb3ZpZGVyc2AuXG4gKlxuICogQWxsIHRlbXBsYXRlIGV4cHJlc3Npb25zIGFuZCBzdGF0ZW1lbnRzIGFyZSB0aGVuIGV2YWx1YXRlZCBhZ2FpbnN0IHRoZSBjb21wb25lbnQgaW5zdGFuY2UuXG4gKlxuICogRm9yIGRldGFpbHMgb24gdGhlIGBAVmlld2AgYW5ub3RhdGlvbiwgc2VlIHtAbGluayBWaWV3TWV0YWRhdGF9LlxuICpcbiAqICMjIExpZmVjeWNsZSBob29rc1xuICpcbiAqIFdoZW4gdGhlIGNvbXBvbmVudCBjbGFzcyBpbXBsZW1lbnRzIHNvbWUge0BsaW5rIGFuZ3VsYXIyL2xpZmVjeWNsZV9ob29rc30gdGhlIGNhbGxiYWNrcyBhcmVcbiAqIGNhbGxlZCBieSB0aGUgY2hhbmdlIGRldGVjdGlvbiBhdCBkZWZpbmVkIHBvaW50cyBpbiB0aW1lIGR1cmluZyB0aGUgbGlmZSBvZiB0aGUgY29tcG9uZW50LlxuICpcbiAqICMjIyBFeGFtcGxlXG4gKlxuICogYGBgXG4gKiBAQ29tcG9uZW50KHtcbiAqICAgc2VsZWN0b3I6ICdncmVldCcsXG4gKiAgIHRlbXBsYXRlOiAnSGVsbG8ge3tuYW1lfX0hJ1xuICogfSlcbiAqIGNsYXNzIEdyZWV0IHtcbiAqICAgbmFtZTogc3RyaW5nO1xuICpcbiAqICAgY29uc3RydWN0b3IoKSB7XG4gKiAgICAgdGhpcy5uYW1lID0gJ1dvcmxkJztcbiAqICAgfVxuICogfVxuICogYGBgXG4gKlxuICovXG5AQ09OU1QoKVxuZXhwb3J0IGNsYXNzIENvbXBvbmVudE1ldGFkYXRhIGV4dGVuZHMgRGlyZWN0aXZlTWV0YWRhdGEge1xuICAvKipcbiAgICogRGVmaW5lcyB0aGUgdXNlZCBjaGFuZ2UgZGV0ZWN0aW9uIHN0cmF0ZWd5LlxuICAgKlxuICAgKiBXaGVuIGEgY29tcG9uZW50IGlzIGluc3RhbnRpYXRlZCwgQW5ndWxhciBjcmVhdGVzIGEgY2hhbmdlIGRldGVjdG9yLCB3aGljaCBpcyByZXNwb25zaWJsZSBmb3JcbiAgICogcHJvcGFnYXRpbmcgdGhlIGNvbXBvbmVudCdzIGJpbmRpbmdzLlxuICAgKlxuICAgKiBUaGUgYGNoYW5nZURldGVjdGlvbmAgcHJvcGVydHkgZGVmaW5lcywgd2hldGhlciB0aGUgY2hhbmdlIGRldGVjdGlvbiB3aWxsIGJlIGNoZWNrZWQgZXZlcnkgdGltZVxuICAgKiBvciBvbmx5IHdoZW4gdGhlIGNvbXBvbmVudCB0ZWxscyBpdCB0byBkbyBzby5cbiAgICovXG4gIGNoYW5nZURldGVjdGlvbjogQ2hhbmdlRGV0ZWN0aW9uU3RyYXRlZ3k7XG5cbiAgLyoqXG4gICAqIERlZmluZXMgdGhlIHNldCBvZiBpbmplY3RhYmxlIG9iamVjdHMgdGhhdCBhcmUgdmlzaWJsZSB0byBpdHMgdmlldyBET00gY2hpbGRyZW4uXG4gICAqXG4gICAqICMjIFNpbXBsZSBFeGFtcGxlXG4gICAqXG4gICAqIEhlcmUgaXMgYW4gZXhhbXBsZSBvZiBhIGNsYXNzIHRoYXQgY2FuIGJlIGluamVjdGVkOlxuICAgKlxuICAgKiBgYGBcbiAgICogY2xhc3MgR3JlZXRlciB7XG4gICAqICAgIGdyZWV0KG5hbWU6c3RyaW5nKSB7XG4gICAqICAgICAgcmV0dXJuICdIZWxsbyAnICsgbmFtZSArICchJztcbiAgICogICAgfVxuICAgKiB9XG4gICAqXG4gICAqIEBEaXJlY3RpdmUoe1xuICAgKiAgIHNlbGVjdG9yOiAnbmVlZHMtZ3JlZXRlcidcbiAgICogfSlcbiAgICogY2xhc3MgTmVlZHNHcmVldGVyIHtcbiAgICogICBncmVldGVyOkdyZWV0ZXI7XG4gICAqXG4gICAqICAgY29uc3RydWN0b3IoZ3JlZXRlcjpHcmVldGVyKSB7XG4gICAqICAgICB0aGlzLmdyZWV0ZXIgPSBncmVldGVyO1xuICAgKiAgIH1cbiAgICogfVxuICAgKlxuICAgKiBAQ29tcG9uZW50KHtcbiAgICogICBzZWxlY3RvcjogJ2dyZWV0JyxcbiAgICogICB2aWV3UHJvdmlkZXJzOiBbXG4gICAqICAgICBHcmVldGVyXG4gICAqICAgXSxcbiAgICogICB0ZW1wbGF0ZTogYDxuZWVkcy1ncmVldGVyPjwvbmVlZHMtZ3JlZXRlcj5gLFxuICAgKiAgIGRpcmVjdGl2ZXM6IFtOZWVkc0dyZWV0ZXJdXG4gICAqIH0pXG4gICAqIGNsYXNzIEhlbGxvV29ybGQge1xuICAgKiB9XG4gICAqXG4gICAqIGBgYFxuICAgKi9cbiAgZ2V0IHZpZXdQcm92aWRlcnMoKTogYW55W10ge1xuICAgIHJldHVybiBpc1ByZXNlbnQodGhpcy5fdmlld0JpbmRpbmdzKSAmJiB0aGlzLl92aWV3QmluZGluZ3MubGVuZ3RoID4gMCA/IHRoaXMuX3ZpZXdCaW5kaW5ncyA6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5fdmlld1Byb3ZpZGVycztcbiAgfVxuICBnZXQgdmlld0JpbmRpbmdzKCk6IGFueVtdIHsgcmV0dXJuIHRoaXMudmlld1Byb3ZpZGVyczsgfVxuICBwcml2YXRlIF92aWV3UHJvdmlkZXJzOiBhbnlbXTtcbiAgcHJpdmF0ZSBfdmlld0JpbmRpbmdzOiBhbnlbXTtcblxuICB0ZW1wbGF0ZVVybDogc3RyaW5nO1xuXG4gIHRlbXBsYXRlOiBzdHJpbmc7XG5cbiAgc3R5bGVVcmxzOiBzdHJpbmdbXTtcblxuICBzdHlsZXM6IHN0cmluZ1tdO1xuXG4gIGRpcmVjdGl2ZXM6IEFycmF5PFR5cGUgfCBhbnlbXT47XG5cbiAgcGlwZXM6IEFycmF5PFR5cGUgfCBhbnlbXT47XG5cbiAgZW5jYXBzdWxhdGlvbjogVmlld0VuY2Fwc3VsYXRpb247XG5cbiAgY29uc3RydWN0b3Ioe3NlbGVjdG9yLCBpbnB1dHMsIG91dHB1dHMsIHByb3BlcnRpZXMsIGV2ZW50cywgaG9zdCwgZXhwb3J0QXMsIG1vZHVsZUlkLCBiaW5kaW5ncyxcbiAgICAgICAgICAgICAgIHByb3ZpZGVycywgdmlld0JpbmRpbmdzLCB2aWV3UHJvdmlkZXJzLFxuICAgICAgICAgICAgICAgY2hhbmdlRGV0ZWN0aW9uID0gQ2hhbmdlRGV0ZWN0aW9uU3RyYXRlZ3kuRGVmYXVsdCwgcXVlcmllcywgdGVtcGxhdGVVcmwsIHRlbXBsYXRlLFxuICAgICAgICAgICAgICAgc3R5bGVVcmxzLCBzdHlsZXMsIGRpcmVjdGl2ZXMsIHBpcGVzLCBlbmNhcHN1bGF0aW9ufToge1xuICAgIHNlbGVjdG9yPzogc3RyaW5nLFxuICAgIGlucHV0cz86IHN0cmluZ1tdLFxuICAgIG91dHB1dHM/OiBzdHJpbmdbXSxcbiAgICBwcm9wZXJ0aWVzPzogc3RyaW5nW10sXG4gICAgZXZlbnRzPzogc3RyaW5nW10sXG4gICAgaG9zdD86IHtba2V5OiBzdHJpbmddOiBzdHJpbmd9LFxuICAgIC8qKiBAZGVwcmVjYXRlZCAqLyBiaW5kaW5ncz86IGFueVtdLFxuICAgIHByb3ZpZGVycz86IGFueVtdLFxuICAgIGV4cG9ydEFzPzogc3RyaW5nLFxuICAgIG1vZHVsZUlkPzogc3RyaW5nLFxuICAgIC8qKiBAZGVwcmVjYXRlZCAqLyB2aWV3QmluZGluZ3M/OiBhbnlbXSxcbiAgICB2aWV3UHJvdmlkZXJzPzogYW55W10sXG4gICAgcXVlcmllcz86IHtba2V5OiBzdHJpbmddOiBhbnl9LFxuICAgIGNoYW5nZURldGVjdGlvbj86IENoYW5nZURldGVjdGlvblN0cmF0ZWd5LFxuICAgIHRlbXBsYXRlVXJsPzogc3RyaW5nLFxuICAgIHRlbXBsYXRlPzogc3RyaW5nLFxuICAgIHN0eWxlVXJscz86IHN0cmluZ1tdLFxuICAgIHN0eWxlcz86IHN0cmluZ1tdLFxuICAgIGRpcmVjdGl2ZXM/OiBBcnJheTxUeXBlIHwgYW55W10+LFxuICAgIHBpcGVzPzogQXJyYXk8VHlwZSB8IGFueVtdPixcbiAgICBlbmNhcHN1bGF0aW9uPzogVmlld0VuY2Fwc3VsYXRpb25cbiAgfSA9IHt9KSB7XG4gICAgc3VwZXIoe1xuICAgICAgc2VsZWN0b3I6IHNlbGVjdG9yLFxuICAgICAgaW5wdXRzOiBpbnB1dHMsXG4gICAgICBvdXRwdXRzOiBvdXRwdXRzLFxuICAgICAgcHJvcGVydGllczogcHJvcGVydGllcyxcbiAgICAgIGV2ZW50czogZXZlbnRzLFxuICAgICAgaG9zdDogaG9zdCxcbiAgICAgIGV4cG9ydEFzOiBleHBvcnRBcyxcbiAgICAgIG1vZHVsZUlkOiBtb2R1bGVJZCxcbiAgICAgIGJpbmRpbmdzOiBiaW5kaW5ncyxcbiAgICAgIHByb3ZpZGVyczogcHJvdmlkZXJzLFxuICAgICAgcXVlcmllczogcXVlcmllc1xuICAgIH0pO1xuXG4gICAgdGhpcy5jaGFuZ2VEZXRlY3Rpb24gPSBjaGFuZ2VEZXRlY3Rpb247XG4gICAgdGhpcy5fdmlld1Byb3ZpZGVycyA9IHZpZXdQcm92aWRlcnM7XG4gICAgdGhpcy5fdmlld0JpbmRpbmdzID0gdmlld0JpbmRpbmdzO1xuICAgIHRoaXMudGVtcGxhdGVVcmwgPSB0ZW1wbGF0ZVVybDtcbiAgICB0aGlzLnRlbXBsYXRlID0gdGVtcGxhdGU7XG4gICAgdGhpcy5zdHlsZVVybHMgPSBzdHlsZVVybHM7XG4gICAgdGhpcy5zdHlsZXMgPSBzdHlsZXM7XG4gICAgdGhpcy5kaXJlY3RpdmVzID0gZGlyZWN0aXZlcztcbiAgICB0aGlzLnBpcGVzID0gcGlwZXM7XG4gICAgdGhpcy5lbmNhcHN1bGF0aW9uID0gZW5jYXBzdWxhdGlvbjtcbiAgfVxufVxuXG4vKipcbiAqIERlY2xhcmUgcmV1c2FibGUgcGlwZSBmdW5jdGlvbi5cbiAqXG4gKiBBIFwicHVyZVwiIHBpcGUgaXMgb25seSByZS1ldmFsdWF0ZWQgd2hlbiBlaXRoZXIgdGhlIGlucHV0IG9yIGFueSBvZiB0aGUgYXJndW1lbnRzIGNoYW5nZS5cbiAqXG4gKiBXaGVuIG5vdCBzcGVjaWZpZWQsIHBpcGVzIGRlZmF1bHQgdG8gYmVpbmcgcHVyZS5cbiAqXG4gKiAjIyMgRXhhbXBsZVxuICpcbiAqIGBgYFxuICogQFBpcGUoe25hbWU6ICdsb3dlcmNhc2UnfSlcbiAqIGNsYXNzIExvd2VyY2FzZSB7XG4gKiAgIHRyYW5zZm9ybSh2LCBhcmdzKSB7IHJldHVybiB2LnRvTG93ZXJDYXNlKCk7IH1cbiAqIH1cbiAqIGBgYFxuICovXG5AQ09OU1QoKVxuZXhwb3J0IGNsYXNzIFBpcGVNZXRhZGF0YSBleHRlbmRzIEluamVjdGFibGVNZXRhZGF0YSB7XG4gIG5hbWU6IHN0cmluZztcbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBfcHVyZTogYm9vbGVhbjtcblxuICBjb25zdHJ1Y3Rvcih7bmFtZSwgcHVyZX06IHtuYW1lOiBzdHJpbmcsIHB1cmU/OiBib29sZWFufSkge1xuICAgIHN1cGVyKCk7XG4gICAgdGhpcy5uYW1lID0gbmFtZTtcbiAgICB0aGlzLl9wdXJlID0gcHVyZTtcbiAgfVxuXG4gIGdldCBwdXJlKCk6IGJvb2xlYW4geyByZXR1cm4gaXNQcmVzZW50KHRoaXMuX3B1cmUpID8gdGhpcy5fcHVyZSA6IHRydWU7IH1cbn1cblxuLyoqXG4gKiBEZWNsYXJlcyBhIGRhdGEtYm91bmQgaW5wdXQgcHJvcGVydHkuXG4gKlxuICogQW5ndWxhciBhdXRvbWF0aWNhbGx5IHVwZGF0ZXMgZGF0YS1ib3VuZCBwcm9wZXJ0aWVzIGR1cmluZyBjaGFuZ2UgZGV0ZWN0aW9uLlxuICpcbiAqIGBJbnB1dE1ldGFkYXRhYCB0YWtlcyBhbiBvcHRpb25hbCBwYXJhbWV0ZXIgdGhhdCBzcGVjaWZpZXMgdGhlIG5hbWVcbiAqIHVzZWQgd2hlbiBpbnN0YW50aWF0aW5nIGEgY29tcG9uZW50IGluIHRoZSB0ZW1wbGF0ZS4gV2hlbiBub3QgcHJvdmlkZWQsXG4gKiB0aGUgbmFtZSBvZiB0aGUgZGVjb3JhdGVkIHByb3BlcnR5IGlzIHVzZWQuXG4gKlxuICogIyMjIEV4YW1wbGVcbiAqXG4gKiBUaGUgZm9sbG93aW5nIGV4YW1wbGUgY3JlYXRlcyBhIGNvbXBvbmVudCB3aXRoIHR3byBpbnB1dCBwcm9wZXJ0aWVzLlxuICpcbiAqIGBgYHR5cGVzY3JpcHRcbiAqIEBDb21wb25lbnQoe1xuICogICBzZWxlY3RvcjogJ2JhbmstYWNjb3VudCcsXG4gKiAgIHRlbXBsYXRlOiBgXG4gKiAgICAgQmFuayBOYW1lOiB7e2JhbmtOYW1lfX1cbiAqICAgICBBY2NvdW50IElkOiB7e2lkfX1cbiAqICAgYFxuICogfSlcbiAqIGNsYXNzIEJhbmtBY2NvdW50IHtcbiAqICAgQElucHV0KCkgYmFua05hbWU6IHN0cmluZztcbiAqICAgQElucHV0KCdhY2NvdW50LWlkJykgaWQ6IHN0cmluZztcbiAqXG4gKiAgIC8vIHRoaXMgcHJvcGVydHkgaXMgbm90IGJvdW5kLCBhbmQgd29uJ3QgYmUgYXV0b21hdGljYWxseSB1cGRhdGVkIGJ5IEFuZ3VsYXJcbiAqICAgbm9ybWFsaXplZEJhbmtOYW1lOiBzdHJpbmc7XG4gKiB9XG4gKlxuICogQENvbXBvbmVudCh7XG4gKiAgIHNlbGVjdG9yOiAnYXBwJyxcbiAqICAgdGVtcGxhdGU6IGBcbiAqICAgICA8YmFuay1hY2NvdW50IGJhbmstbmFtZT1cIlJCQ1wiIGFjY291bnQtaWQ9XCI0NzQ3XCI+PC9iYW5rLWFjY291bnQ+XG4gKiAgIGAsXG4gKiAgIGRpcmVjdGl2ZXM6IFtCYW5rQWNjb3VudF1cbiAqIH0pXG4gKiBjbGFzcyBBcHAge31cbiAqXG4gKiBib290c3RyYXAoQXBwKTtcbiAqIGBgYFxuICovXG5AQ09OU1QoKVxuZXhwb3J0IGNsYXNzIElucHV0TWV0YWRhdGEge1xuICBjb25zdHJ1Y3RvcihcbiAgICAgIC8qKlxuICAgICAgICogTmFtZSB1c2VkIHdoZW4gaW5zdGFudGlhdGluZyBhIGNvbXBvbmVudCBpbiB0aGUgdGVtbGF0ZS5cbiAgICAgICAqL1xuICAgICAgcHVibGljIGJpbmRpbmdQcm9wZXJ0eU5hbWU/OiBzdHJpbmcpIHt9XG59XG5cbi8qKlxuICogRGVjbGFyZXMgYW4gZXZlbnQtYm91bmQgb3V0cHV0IHByb3BlcnR5LlxuICpcbiAqIFdoZW4gYW4gb3V0cHV0IHByb3BlcnR5IGVtaXRzIGFuIGV2ZW50LCBhbiBldmVudCBoYW5kbGVyIGF0dGFjaGVkIHRvIHRoYXQgZXZlbnRcbiAqIHRoZSB0ZW1wbGF0ZSBpcyBpbnZva2VkLlxuICpcbiAqIGBPdXRwdXRNZXRhZGF0YWAgdGFrZXMgYW4gb3B0aW9uYWwgcGFyYW1ldGVyIHRoYXQgc3BlY2lmaWVzIHRoZSBuYW1lXG4gKiB1c2VkIHdoZW4gaW5zdGFudGlhdGluZyBhIGNvbXBvbmVudCBpbiB0aGUgdGVtcGxhdGUuIFdoZW4gbm90IHByb3ZpZGVkLFxuICogdGhlIG5hbWUgb2YgdGhlIGRlY29yYXRlZCBwcm9wZXJ0eSBpcyB1c2VkLlxuICpcbiAqICMjIyBFeGFtcGxlXG4gKlxuICogYGBgdHlwZXNjcmlwdFxuICogQERpcmVjdGl2ZSh7XG4gKiAgIHNlbGVjdG9yOiAnaW50ZXJ2YWwtZGlyJyxcbiAqIH0pXG4gKiBjbGFzcyBJbnRlcnZhbERpciB7XG4gKiAgIEBPdXRwdXQoKSBldmVyeVNlY29uZCA9IG5ldyBFdmVudEVtaXR0ZXIoKTtcbiAqICAgQE91dHB1dCgnZXZlcnlGaXZlU2Vjb25kcycpIGZpdmU1U2VjcyA9IG5ldyBFdmVudEVtaXR0ZXIoKTtcbiAqXG4gKiAgIGNvbnN0cnVjdG9yKCkge1xuICogICAgIHNldEludGVydmFsKCgpID0+IHRoaXMuZXZlcnlTZWNvbmQuZW1pdChcImV2ZW50XCIpLCAxMDAwKTtcbiAqICAgICBzZXRJbnRlcnZhbCgoKSA9PiB0aGlzLmZpdmU1U2Vjcy5lbWl0KFwiZXZlbnRcIiksIDUwMDApO1xuICogICB9XG4gKiB9XG4gKlxuICogQENvbXBvbmVudCh7XG4gKiAgIHNlbGVjdG9yOiAnYXBwJyxcbiAqICAgdGVtcGxhdGU6IGBcbiAqICAgICA8aW50ZXJ2YWwtZGlyIChldmVyeS1zZWNvbmQpPVwiZXZlcnlTZWNvbmQoKVwiIChldmVyeS1maXZlLXNlY29uZHMpPVwiZXZlcnlGaXZlU2Vjb25kcygpXCI+XG4gKiAgICAgPC9pbnRlcnZhbC1kaXI+XG4gKiAgIGAsXG4gKiAgIGRpcmVjdGl2ZXM6IFtJbnRlcnZhbERpcl1cbiAqIH0pXG4gKiBjbGFzcyBBcHAge1xuICogICBldmVyeVNlY29uZCgpIHsgY29uc29sZS5sb2coJ3NlY29uZCcpOyB9XG4gKiAgIGV2ZXJ5Rml2ZVNlY29uZHMoKSB7IGNvbnNvbGUubG9nKCdmaXZlIHNlY29uZHMnKTsgfVxuICogfVxuICogYm9vdHN0cmFwKEFwcCk7XG4gKiBgYGBcbiAqL1xuQENPTlNUKClcbmV4cG9ydCBjbGFzcyBPdXRwdXRNZXRhZGF0YSB7XG4gIGNvbnN0cnVjdG9yKHB1YmxpYyBiaW5kaW5nUHJvcGVydHlOYW1lPzogc3RyaW5nKSB7fVxufVxuXG4vKipcbiAqIERlY2xhcmVzIGEgaG9zdCBwcm9wZXJ0eSBiaW5kaW5nLlxuICpcbiAqIEFuZ3VsYXIgYXV0b21hdGljYWxseSBjaGVja3MgaG9zdCBwcm9wZXJ0eSBiaW5kaW5ncyBkdXJpbmcgY2hhbmdlIGRldGVjdGlvbi5cbiAqIElmIGEgYmluZGluZyBjaGFuZ2VzLCBpdCB3aWxsIHVwZGF0ZSB0aGUgaG9zdCBlbGVtZW50IG9mIHRoZSBkaXJlY3RpdmUuXG4gKlxuICogYEhvc3RCaW5kaW5nTWV0YWRhdGFgIHRha2VzIGFuIG9wdGlvbmFsIHBhcmFtZXRlciB0aGF0IHNwZWNpZmllcyB0aGUgcHJvcGVydHlcbiAqIG5hbWUgb2YgdGhlIGhvc3QgZWxlbWVudCB0aGF0IHdpbGwgYmUgdXBkYXRlZC4gV2hlbiBub3QgcHJvdmlkZWQsXG4gKiB0aGUgY2xhc3MgcHJvcGVydHkgbmFtZSBpcyB1c2VkLlxuICpcbiAqICMjIyBFeGFtcGxlXG4gKlxuICogVGhlIGZvbGxvd2luZyBleGFtcGxlIGNyZWF0ZXMgYSBkaXJlY3RpdmUgdGhhdCBzZXRzIHRoZSBgdmFsaWRgIGFuZCBgaW52YWxpZGAgY2xhc3Nlc1xuICogb24gdGhlIERPTSBlbGVtZW50IHRoYXQgaGFzIG5nLW1vZGVsIGRpcmVjdGl2ZSBvbiBpdC5cbiAqXG4gKiBgYGB0eXBlc2NyaXB0XG4gKiBARGlyZWN0aXZlKHtzZWxlY3RvcjogJ1tuZy1tb2RlbF0nfSlcbiAqIGNsYXNzIE5nTW9kZWxTdGF0dXMge1xuICogICBjb25zdHJ1Y3RvcihwdWJsaWMgY29udHJvbDpOZ01vZGVsKSB7fVxuICogICBASG9zdEJpbmRpbmcoJ1tjbGFzcy52YWxpZF0nKSBnZXQgdmFsaWQgeyByZXR1cm4gdGhpcy5jb250cm9sLnZhbGlkOyB9XG4gKiAgIEBIb3N0QmluZGluZygnW2NsYXNzLmludmFsaWRdJykgZ2V0IGludmFsaWQgeyByZXR1cm4gdGhpcy5jb250cm9sLmludmFsaWQ7IH1cbiAqIH1cbiAqXG4gKiBAQ29tcG9uZW50KHtcbiAqICAgc2VsZWN0b3I6ICdhcHAnLFxuICogICB0ZW1wbGF0ZTogYDxpbnB1dCBbKG5nLW1vZGVsKV09XCJwcm9wXCI+YCxcbiAqICAgZGlyZWN0aXZlczogW0ZPUk1fRElSRUNUSVZFUywgTmdNb2RlbFN0YXR1c11cbiAqIH0pXG4gKiBjbGFzcyBBcHAge1xuICogICBwcm9wO1xuICogfVxuICpcbiAqIGJvb3RzdHJhcChBcHApO1xuICogYGBgXG4gKi9cbkBDT05TVCgpXG5leHBvcnQgY2xhc3MgSG9zdEJpbmRpbmdNZXRhZGF0YSB7XG4gIGNvbnN0cnVjdG9yKHB1YmxpYyBob3N0UHJvcGVydHlOYW1lPzogc3RyaW5nKSB7fVxufVxuXG4vKipcbiAqIERlY2xhcmVzIGEgaG9zdCBsaXN0ZW5lci5cbiAqXG4gKiBBbmd1bGFyIHdpbGwgaW52b2tlIHRoZSBkZWNvcmF0ZWQgbWV0aG9kIHdoZW4gdGhlIGhvc3QgZWxlbWVudCBlbWl0cyB0aGUgc3BlY2lmaWVkIGV2ZW50LlxuICpcbiAqIElmIHRoZSBkZWNvcmF0ZWQgbWV0aG9kIHJldHVybnMgYGZhbHNlYCwgdGhlbiBgcHJldmVudERlZmF1bHRgIGlzIGFwcGxpZWQgb24gdGhlIERPTVxuICogZXZlbnQuXG4gKlxuICogIyMjIEV4YW1wbGVcbiAqXG4gKiBUaGUgZm9sbG93aW5nIGV4YW1wbGUgZGVjbGFyZXMgYSBkaXJlY3RpdmUgdGhhdCBhdHRhY2hlcyBhIGNsaWNrIGxpc3RlbmVyIHRvIHRoZSBidXR0b24gYW5kXG4gKiBjb3VudHMgY2xpY2tzLlxuICpcbiAqIGBgYHR5cGVzY3JpcHRcbiAqIEBEaXJlY3RpdmUoe3NlbGVjdG9yOiAnYnV0dG9uW2NvdW50aW5nXSd9KVxuICogY2xhc3MgQ291bnRDbGlja3Mge1xuICogICBudW1iZXJPZkNsaWNrcyA9IDA7XG4gKlxuICogICBASG9zdExpc3RlbmVyKCdjbGljaycsIFsnJGV2ZW50LnRhcmdldCddKVxuICogICBvbkNsaWNrKGJ0bikge1xuICogICAgIGNvbnNvbGUubG9nKFwiYnV0dG9uXCIsIGJ0biwgXCJudW1iZXIgb2YgY2xpY2tzOlwiLCB0aGlzLm51bWJlck9mQ2xpY2tzKyspO1xuICogICB9XG4gKiB9XG4gKlxuICogQENvbXBvbmVudCh7XG4gKiAgIHNlbGVjdG9yOiAnYXBwJyxcbiAqICAgdGVtcGxhdGU6IGA8YnV0dG9uIGNvdW50aW5nPkluY3JlbWVudDwvYnV0dG9uPmAsXG4gKiAgIGRpcmVjdGl2ZXM6IFtDb3VudENsaWNrc11cbiAqIH0pXG4gKiBjbGFzcyBBcHAge31cbiAqXG4gKiBib290c3RyYXAoQXBwKTtcbiAqIGBgYFxuICovXG5AQ09OU1QoKVxuZXhwb3J0IGNsYXNzIEhvc3RMaXN0ZW5lck1ldGFkYXRhIHtcbiAgY29uc3RydWN0b3IocHVibGljIGV2ZW50TmFtZTogc3RyaW5nLCBwdWJsaWMgYXJncz86IHN0cmluZ1tdKSB7fVxufVxuIl19