'use strict';var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var lang_1 = require('angular2/src/facade/lang');
var metadata_1 = require('angular2/src/core/di/metadata');
var change_detection_1 = require('angular2/src/core/change_detection');
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
var DirectiveMetadata = (function (_super) {
    __extends(DirectiveMetadata, _super);
    function DirectiveMetadata(_a) {
        var _b = _a === void 0 ? {} : _a, selector = _b.selector, inputs = _b.inputs, outputs = _b.outputs, properties = _b.properties, events = _b.events, host = _b.host, bindings = _b.bindings, providers = _b.providers, exportAs = _b.exportAs, queries = _b.queries;
        _super.call(this);
        this.selector = selector;
        this._inputs = inputs;
        this._properties = properties;
        this._outputs = outputs;
        this._events = events;
        this.host = host;
        this.exportAs = exportAs;
        this.queries = queries;
        this._providers = providers;
        this._bindings = bindings;
    }
    Object.defineProperty(DirectiveMetadata.prototype, "inputs", {
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
        get: function () {
            return lang_1.isPresent(this._properties) && this._properties.length > 0 ? this._properties :
                this._inputs;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(DirectiveMetadata.prototype, "properties", {
        get: function () { return this.inputs; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(DirectiveMetadata.prototype, "outputs", {
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
        get: function () {
            return lang_1.isPresent(this._events) && this._events.length > 0 ? this._events : this._outputs;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(DirectiveMetadata.prototype, "events", {
        get: function () { return this.outputs; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(DirectiveMetadata.prototype, "providers", {
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
        get: function () {
            return lang_1.isPresent(this._bindings) && this._bindings.length > 0 ? this._bindings :
                this._providers;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(DirectiveMetadata.prototype, "bindings", {
        /** @deprecated */
        get: function () { return this.providers; },
        enumerable: true,
        configurable: true
    });
    DirectiveMetadata = __decorate([
        lang_1.CONST(), 
        __metadata('design:paramtypes', [Object])
    ], DirectiveMetadata);
    return DirectiveMetadata;
})(metadata_1.InjectableMetadata);
exports.DirectiveMetadata = DirectiveMetadata;
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
 * {@example core/ts/metadata/metadata.ts region='component'}
 */
var ComponentMetadata = (function (_super) {
    __extends(ComponentMetadata, _super);
    function ComponentMetadata(_a) {
        var _b = _a === void 0 ? {} : _a, selector = _b.selector, inputs = _b.inputs, outputs = _b.outputs, properties = _b.properties, events = _b.events, host = _b.host, exportAs = _b.exportAs, moduleId = _b.moduleId, bindings = _b.bindings, providers = _b.providers, viewBindings = _b.viewBindings, viewProviders = _b.viewProviders, _c = _b.changeDetection, changeDetection = _c === void 0 ? change_detection_1.ChangeDetectionStrategy.Default : _c, queries = _b.queries, templateUrl = _b.templateUrl, template = _b.template, styleUrls = _b.styleUrls, styles = _b.styles, directives = _b.directives, pipes = _b.pipes, encapsulation = _b.encapsulation;
        _super.call(this, {
            selector: selector,
            inputs: inputs,
            outputs: outputs,
            properties: properties,
            events: events,
            host: host,
            exportAs: exportAs,
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
        this.moduleId = moduleId;
    }
    Object.defineProperty(ComponentMetadata.prototype, "viewProviders", {
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
        get: function () {
            return lang_1.isPresent(this._viewBindings) && this._viewBindings.length > 0 ? this._viewBindings :
                this._viewProviders;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ComponentMetadata.prototype, "viewBindings", {
        get: function () { return this.viewProviders; },
        enumerable: true,
        configurable: true
    });
    ComponentMetadata = __decorate([
        lang_1.CONST(), 
        __metadata('design:paramtypes', [Object])
    ], ComponentMetadata);
    return ComponentMetadata;
})(DirectiveMetadata);
exports.ComponentMetadata = ComponentMetadata;
/**
 * Declare reusable pipe function.
 *
 * A "pure" pipe is only re-evaluated when either the input or any of the arguments change.
 *
 * When not specified, pipes default to being pure.
 *
 * ### Example
 *
 * {@example core/ts/metadata/metadata.ts region='pipe'}
 */
var PipeMetadata = (function (_super) {
    __extends(PipeMetadata, _super);
    function PipeMetadata(_a) {
        var name = _a.name, pure = _a.pure;
        _super.call(this);
        this.name = name;
        this._pure = pure;
    }
    Object.defineProperty(PipeMetadata.prototype, "pure", {
        get: function () { return lang_1.isPresent(this._pure) ? this._pure : true; },
        enumerable: true,
        configurable: true
    });
    PipeMetadata = __decorate([
        lang_1.CONST(), 
        __metadata('design:paramtypes', [Object])
    ], PipeMetadata);
    return PipeMetadata;
})(metadata_1.InjectableMetadata);
exports.PipeMetadata = PipeMetadata;
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
var InputMetadata = (function () {
    function InputMetadata(
        /**
         * Name used when instantiating a component in the temlate.
         */
        bindingPropertyName) {
        this.bindingPropertyName = bindingPropertyName;
    }
    InputMetadata = __decorate([
        lang_1.CONST(), 
        __metadata('design:paramtypes', [String])
    ], InputMetadata);
    return InputMetadata;
})();
exports.InputMetadata = InputMetadata;
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
var OutputMetadata = (function () {
    function OutputMetadata(bindingPropertyName) {
        this.bindingPropertyName = bindingPropertyName;
    }
    OutputMetadata = __decorate([
        lang_1.CONST(), 
        __metadata('design:paramtypes', [String])
    ], OutputMetadata);
    return OutputMetadata;
})();
exports.OutputMetadata = OutputMetadata;
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
var HostBindingMetadata = (function () {
    function HostBindingMetadata(hostPropertyName) {
        this.hostPropertyName = hostPropertyName;
    }
    HostBindingMetadata = __decorate([
        lang_1.CONST(), 
        __metadata('design:paramtypes', [String])
    ], HostBindingMetadata);
    return HostBindingMetadata;
})();
exports.HostBindingMetadata = HostBindingMetadata;
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
var HostListenerMetadata = (function () {
    function HostListenerMetadata(eventName, args) {
        this.eventName = eventName;
        this.args = args;
    }
    HostListenerMetadata = __decorate([
        lang_1.CONST(), 
        __metadata('design:paramtypes', [String, Array])
    ], HostListenerMetadata);
    return HostListenerMetadata;
})();
exports.HostListenerMetadata = HostListenerMetadata;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGlyZWN0aXZlcy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImFuZ3VsYXIyL3NyYy9jb3JlL21ldGFkYXRhL2RpcmVjdGl2ZXMudHMiXSwibmFtZXMiOlsiRGlyZWN0aXZlTWV0YWRhdGEiLCJEaXJlY3RpdmVNZXRhZGF0YS5jb25zdHJ1Y3RvciIsIkRpcmVjdGl2ZU1ldGFkYXRhLmlucHV0cyIsIkRpcmVjdGl2ZU1ldGFkYXRhLnByb3BlcnRpZXMiLCJEaXJlY3RpdmVNZXRhZGF0YS5vdXRwdXRzIiwiRGlyZWN0aXZlTWV0YWRhdGEuZXZlbnRzIiwiRGlyZWN0aXZlTWV0YWRhdGEucHJvdmlkZXJzIiwiRGlyZWN0aXZlTWV0YWRhdGEuYmluZGluZ3MiLCJDb21wb25lbnRNZXRhZGF0YSIsIkNvbXBvbmVudE1ldGFkYXRhLmNvbnN0cnVjdG9yIiwiQ29tcG9uZW50TWV0YWRhdGEudmlld1Byb3ZpZGVycyIsIkNvbXBvbmVudE1ldGFkYXRhLnZpZXdCaW5kaW5ncyIsIlBpcGVNZXRhZGF0YSIsIlBpcGVNZXRhZGF0YS5jb25zdHJ1Y3RvciIsIlBpcGVNZXRhZGF0YS5wdXJlIiwiSW5wdXRNZXRhZGF0YSIsIklucHV0TWV0YWRhdGEuY29uc3RydWN0b3IiLCJPdXRwdXRNZXRhZGF0YSIsIk91dHB1dE1ldGFkYXRhLmNvbnN0cnVjdG9yIiwiSG9zdEJpbmRpbmdNZXRhZGF0YSIsIkhvc3RCaW5kaW5nTWV0YWRhdGEuY29uc3RydWN0b3IiLCJIb3N0TGlzdGVuZXJNZXRhZGF0YSIsIkhvc3RMaXN0ZW5lck1ldGFkYXRhLmNvbnN0cnVjdG9yIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7OztBQUFBLHFCQUFpRCwwQkFBMEIsQ0FBQyxDQUFBO0FBQzVFLHlCQUFpQywrQkFBK0IsQ0FBQyxDQUFBO0FBQ2pFLGlDQUFzQyxvQ0FBb0MsQ0FBQyxDQUFBO0FBRzNFOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7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bUJBQTRCQTtRQUE1QkMsd0JBQW1CQSxHQUFuQkEsbUJBQW1CQSxDQUFTQTtJQUFHQSxDQUFDQTtJQUZyREQ7UUFBQ0EsWUFBS0EsRUFBRUE7O3VCQUdQQTtJQUFEQSxxQkFBQ0E7QUFBREEsQ0FBQ0EsQUFIRCxJQUdDO0FBRlksc0JBQWMsaUJBRTFCLENBQUE7QUFFRDs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztHQWtDRztBQUNIO0lBRUVFLDZCQUFtQkEsZ0JBQXlCQTtRQUF6QkMscUJBQWdCQSxHQUFoQkEsZ0JBQWdCQSxDQUFTQTtJQUFHQSxDQUFDQTtJQUZsREQ7UUFBQ0EsWUFBS0EsRUFBRUE7OzRCQUdQQTtJQUFEQSwwQkFBQ0E7QUFBREEsQ0FBQ0EsQUFIRCxJQUdDO0FBRlksMkJBQW1CLHNCQUUvQixDQUFBO0FBRUQ7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztHQWlDRztBQUNIO0lBRUVFLDhCQUFtQkEsU0FBaUJBLEVBQVNBLElBQWVBO1FBQXpDQyxjQUFTQSxHQUFUQSxTQUFTQSxDQUFRQTtRQUFTQSxTQUFJQSxHQUFKQSxJQUFJQSxDQUFXQTtJQUFHQSxDQUFDQTtJQUZsRUQ7UUFBQ0EsWUFBS0EsRUFBRUE7OzZCQUdQQTtJQUFEQSwyQkFBQ0E7QUFBREEsQ0FBQ0EsQUFIRCxJQUdDO0FBRlksNEJBQW9CLHVCQUVoQyxDQUFBIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtpc1ByZXNlbnQsIENPTlNULCBDT05TVF9FWFBSLCBUeXBlfSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2xhbmcnO1xuaW1wb3J0IHtJbmplY3RhYmxlTWV0YWRhdGF9IGZyb20gJ2FuZ3VsYXIyL3NyYy9jb3JlL2RpL21ldGFkYXRhJztcbmltcG9ydCB7Q2hhbmdlRGV0ZWN0aW9uU3RyYXRlZ3l9IGZyb20gJ2FuZ3VsYXIyL3NyYy9jb3JlL2NoYW5nZV9kZXRlY3Rpb24nO1xuaW1wb3J0IHtWaWV3RW5jYXBzdWxhdGlvbn0gZnJvbSAnYW5ndWxhcjIvc3JjL2NvcmUvbWV0YWRhdGEvdmlldyc7XG5cbi8qKlxuICogRGlyZWN0aXZlcyBhbGxvdyB5b3UgdG8gYXR0YWNoIGJlaGF2aW9yIHRvIGVsZW1lbnRzIGluIHRoZSBET00uXG4gKlxuICoge0BsaW5rIERpcmVjdGl2ZU1ldGFkYXRhfXMgd2l0aCBhbiBlbWJlZGRlZCB2aWV3IGFyZSBjYWxsZWQge0BsaW5rIENvbXBvbmVudE1ldGFkYXRhfXMuXG4gKlxuICogQSBkaXJlY3RpdmUgY29uc2lzdHMgb2YgYSBzaW5nbGUgZGlyZWN0aXZlIGFubm90YXRpb24gYW5kIGEgY29udHJvbGxlciBjbGFzcy4gV2hlbiB0aGVcbiAqIGRpcmVjdGl2ZSdzIGBzZWxlY3RvcmAgbWF0Y2hlc1xuICogZWxlbWVudHMgaW4gdGhlIERPTSwgdGhlIGZvbGxvd2luZyBzdGVwcyBvY2N1cjpcbiAqXG4gKiAxLiBGb3IgZWFjaCBkaXJlY3RpdmUsIHRoZSBgRWxlbWVudEluamVjdG9yYCBhdHRlbXB0cyB0byByZXNvbHZlIHRoZSBkaXJlY3RpdmUncyBjb25zdHJ1Y3RvclxuICogYXJndW1lbnRzLlxuICogMi4gQW5ndWxhciBpbnN0YW50aWF0ZXMgZGlyZWN0aXZlcyBmb3IgZWFjaCBtYXRjaGVkIGVsZW1lbnQgdXNpbmcgYEVsZW1lbnRJbmplY3RvcmAgaW4gYVxuICogZGVwdGgtZmlyc3Qgb3JkZXIsXG4gKiAgICBhcyBkZWNsYXJlZCBpbiB0aGUgSFRNTC5cbiAqXG4gKiAjIyBVbmRlcnN0YW5kaW5nIEhvdyBJbmplY3Rpb24gV29ya3NcbiAqXG4gKiBUaGVyZSBhcmUgdGhyZWUgc3RhZ2VzIG9mIGluamVjdGlvbiByZXNvbHV0aW9uLlxuICogLSAqUHJlLWV4aXN0aW5nIEluamVjdG9ycyo6XG4gKiAgIC0gVGhlIHRlcm1pbmFsIHtAbGluayBJbmplY3Rvcn0gY2Fubm90IHJlc29sdmUgZGVwZW5kZW5jaWVzLiBJdCBlaXRoZXIgdGhyb3dzIGFuIGVycm9yIG9yLCBpZlxuICogdGhlIGRlcGVuZGVuY3kgd2FzXG4gKiAgICAgc3BlY2lmaWVkIGFzIGBAT3B0aW9uYWxgLCByZXR1cm5zIGBudWxsYC5cbiAqICAgLSBUaGUgcGxhdGZvcm0gaW5qZWN0b3IgcmVzb2x2ZXMgYnJvd3NlciBzaW5nbGV0b24gcmVzb3VyY2VzLCBzdWNoIGFzOiBjb29raWVzLCB0aXRsZSxcbiAqIGxvY2F0aW9uLCBhbmQgb3RoZXJzLlxuICogLSAqQ29tcG9uZW50IEluamVjdG9ycyo6IEVhY2ggY29tcG9uZW50IGluc3RhbmNlIGhhcyBpdHMgb3duIHtAbGluayBJbmplY3Rvcn0sIGFuZCB0aGV5IGZvbGxvd1xuICogdGhlIHNhbWUgcGFyZW50LWNoaWxkIGhpZXJhcmNoeVxuICogICAgIGFzIHRoZSBjb21wb25lbnQgaW5zdGFuY2VzIGluIHRoZSBET00uXG4gKiAtICpFbGVtZW50IEluamVjdG9ycyo6IEVhY2ggY29tcG9uZW50IGluc3RhbmNlIGhhcyBhIFNoYWRvdyBET00uIFdpdGhpbiB0aGUgU2hhZG93IERPTSBlYWNoXG4gKiBlbGVtZW50IGhhcyBhbiBgRWxlbWVudEluamVjdG9yYFxuICogICAgIHdoaWNoIGZvbGxvdyB0aGUgc2FtZSBwYXJlbnQtY2hpbGQgaGllcmFyY2h5IGFzIHRoZSBET00gZWxlbWVudHMgdGhlbXNlbHZlcy5cbiAqXG4gKiBXaGVuIGEgdGVtcGxhdGUgaXMgaW5zdGFudGlhdGVkLCBpdCBhbHNvIG11c3QgaW5zdGFudGlhdGUgdGhlIGNvcnJlc3BvbmRpbmcgZGlyZWN0aXZlcyBpbiBhXG4gKiBkZXB0aC1maXJzdCBvcmRlci4gVGhlXG4gKiBjdXJyZW50IGBFbGVtZW50SW5qZWN0b3JgIHJlc29sdmVzIHRoZSBjb25zdHJ1Y3RvciBkZXBlbmRlbmNpZXMgZm9yIGVhY2ggZGlyZWN0aXZlLlxuICpcbiAqIEFuZ3VsYXIgdGhlbiByZXNvbHZlcyBkZXBlbmRlbmNpZXMgYXMgZm9sbG93cywgYWNjb3JkaW5nIHRvIHRoZSBvcmRlciBpbiB3aGljaCB0aGV5IGFwcGVhciBpbiB0aGVcbiAqIHtAbGluayBWaWV3TWV0YWRhdGF9OlxuICpcbiAqIDEuIERlcGVuZGVuY2llcyBvbiB0aGUgY3VycmVudCBlbGVtZW50XG4gKiAyLiBEZXBlbmRlbmNpZXMgb24gZWxlbWVudCBpbmplY3RvcnMgYW5kIHRoZWlyIHBhcmVudHMgdW50aWwgaXQgZW5jb3VudGVycyBhIFNoYWRvdyBET00gYm91bmRhcnlcbiAqIDMuIERlcGVuZGVuY2llcyBvbiBjb21wb25lbnQgaW5qZWN0b3JzIGFuZCB0aGVpciBwYXJlbnRzIHVudGlsIGl0IGVuY291bnRlcnMgdGhlIHJvb3QgY29tcG9uZW50XG4gKiA0LiBEZXBlbmRlbmNpZXMgb24gcHJlLWV4aXN0aW5nIGluamVjdG9yc1xuICpcbiAqXG4gKiBUaGUgYEVsZW1lbnRJbmplY3RvcmAgY2FuIGluamVjdCBvdGhlciBkaXJlY3RpdmVzLCBlbGVtZW50LXNwZWNpZmljIHNwZWNpYWwgb2JqZWN0cywgb3IgaXQgY2FuXG4gKiBkZWxlZ2F0ZSB0byB0aGUgcGFyZW50XG4gKiBpbmplY3Rvci5cbiAqXG4gKiBUbyBpbmplY3Qgb3RoZXIgZGlyZWN0aXZlcywgZGVjbGFyZSB0aGUgY29uc3RydWN0b3IgcGFyYW1ldGVyIGFzOlxuICogLSBgZGlyZWN0aXZlOkRpcmVjdGl2ZVR5cGVgOiBhIGRpcmVjdGl2ZSBvbiB0aGUgY3VycmVudCBlbGVtZW50IG9ubHlcbiAqIC0gYEBIb3N0KCkgZGlyZWN0aXZlOkRpcmVjdGl2ZVR5cGVgOiBhbnkgZGlyZWN0aXZlIHRoYXQgbWF0Y2hlcyB0aGUgdHlwZSBiZXR3ZWVuIHRoZSBjdXJyZW50XG4gKiBlbGVtZW50IGFuZCB0aGVcbiAqICAgIFNoYWRvdyBET00gcm9vdC5cbiAqIC0gYEBRdWVyeShEaXJlY3RpdmVUeXBlKSBxdWVyeTpRdWVyeUxpc3Q8RGlyZWN0aXZlVHlwZT5gOiBBIGxpdmUgY29sbGVjdGlvbiBvZiBkaXJlY3QgY2hpbGRcbiAqIGRpcmVjdGl2ZXMuXG4gKiAtIGBAUXVlcnlEZXNjZW5kYW50cyhEaXJlY3RpdmVUeXBlKSBxdWVyeTpRdWVyeUxpc3Q8RGlyZWN0aXZlVHlwZT5gOiBBIGxpdmUgY29sbGVjdGlvbiBvZiBhbnlcbiAqIGNoaWxkIGRpcmVjdGl2ZXMuXG4gKlxuICogVG8gaW5qZWN0IGVsZW1lbnQtc3BlY2lmaWMgc3BlY2lhbCBvYmplY3RzLCBkZWNsYXJlIHRoZSBjb25zdHJ1Y3RvciBwYXJhbWV0ZXIgYXM6XG4gKiAtIGBlbGVtZW50OiBFbGVtZW50UmVmYCB0byBvYnRhaW4gYSByZWZlcmVuY2UgdG8gbG9naWNhbCBlbGVtZW50IGluIHRoZSB2aWV3LlxuICogLSBgdmlld0NvbnRhaW5lcjogVmlld0NvbnRhaW5lclJlZmAgdG8gY29udHJvbCBjaGlsZCB0ZW1wbGF0ZSBpbnN0YW50aWF0aW9uLCBmb3JcbiAqIHtAbGluayBEaXJlY3RpdmVNZXRhZGF0YX0gZGlyZWN0aXZlcyBvbmx5XG4gKiAtIGBiaW5kaW5nUHJvcGFnYXRpb246IEJpbmRpbmdQcm9wYWdhdGlvbmAgdG8gY29udHJvbCBjaGFuZ2UgZGV0ZWN0aW9uIGluIGEgbW9yZSBncmFudWxhciB3YXkuXG4gKlxuICogIyMjIEV4YW1wbGVcbiAqXG4gKiBUaGUgZm9sbG93aW5nIGV4YW1wbGUgZGVtb25zdHJhdGVzIGhvdyBkZXBlbmRlbmN5IGluamVjdGlvbiByZXNvbHZlcyBjb25zdHJ1Y3RvciBhcmd1bWVudHMgaW5cbiAqIHByYWN0aWNlLlxuICpcbiAqXG4gKiBBc3N1bWUgdGhpcyBIVE1MIHRlbXBsYXRlOlxuICpcbiAqIGBgYFxuICogPGRpdiBkZXBlbmRlbmN5PVwiMVwiPlxuICogICA8ZGl2IGRlcGVuZGVuY3k9XCIyXCI+XG4gKiAgICAgPGRpdiBkZXBlbmRlbmN5PVwiM1wiIG15LWRpcmVjdGl2ZT5cbiAqICAgICAgIDxkaXYgZGVwZW5kZW5jeT1cIjRcIj5cbiAqICAgICAgICAgPGRpdiBkZXBlbmRlbmN5PVwiNVwiPjwvZGl2PlxuICogICAgICAgPC9kaXY+XG4gKiAgICAgICA8ZGl2IGRlcGVuZGVuY3k9XCI2XCI+PC9kaXY+XG4gKiAgICAgPC9kaXY+XG4gKiAgIDwvZGl2PlxuICogPC9kaXY+XG4gKiBgYGBcbiAqXG4gKiBXaXRoIHRoZSBmb2xsb3dpbmcgYGRlcGVuZGVuY3lgIGRlY29yYXRvciBhbmQgYFNvbWVTZXJ2aWNlYCBpbmplY3RhYmxlIGNsYXNzLlxuICpcbiAqIGBgYFxuICogQEluamVjdGFibGUoKVxuICogY2xhc3MgU29tZVNlcnZpY2Uge1xuICogfVxuICpcbiAqIEBEaXJlY3RpdmUoe1xuICogICBzZWxlY3RvcjogJ1tkZXBlbmRlbmN5XScsXG4gKiAgIGlucHV0czogW1xuICogICAgICdpZDogZGVwZW5kZW5jeSdcbiAqICAgXVxuICogfSlcbiAqIGNsYXNzIERlcGVuZGVuY3kge1xuICogICBpZDpzdHJpbmc7XG4gKiB9XG4gKiBgYGBcbiAqXG4gKiBMZXQncyBzdGVwIHRocm91Z2ggdGhlIGRpZmZlcmVudCB3YXlzIGluIHdoaWNoIGBNeURpcmVjdGl2ZWAgY291bGQgYmUgZGVjbGFyZWQuLi5cbiAqXG4gKlxuICogIyMjIE5vIGluamVjdGlvblxuICpcbiAqIEhlcmUgdGhlIGNvbnN0cnVjdG9yIGlzIGRlY2xhcmVkIHdpdGggbm8gYXJndW1lbnRzLCB0aGVyZWZvcmUgbm90aGluZyBpcyBpbmplY3RlZCBpbnRvXG4gKiBgTXlEaXJlY3RpdmVgLlxuICpcbiAqIGBgYFxuICogQERpcmVjdGl2ZSh7IHNlbGVjdG9yOiAnW215LWRpcmVjdGl2ZV0nIH0pXG4gKiBjbGFzcyBNeURpcmVjdGl2ZSB7XG4gKiAgIGNvbnN0cnVjdG9yKCkge1xuICogICB9XG4gKiB9XG4gKiBgYGBcbiAqXG4gKiBUaGlzIGRpcmVjdGl2ZSB3b3VsZCBiZSBpbnN0YW50aWF0ZWQgd2l0aCBubyBkZXBlbmRlbmNpZXMuXG4gKlxuICpcbiAqICMjIyBDb21wb25lbnQtbGV2ZWwgaW5qZWN0aW9uXG4gKlxuICogRGlyZWN0aXZlcyBjYW4gaW5qZWN0IGFueSBpbmplY3RhYmxlIGluc3RhbmNlIGZyb20gdGhlIGNsb3Nlc3QgY29tcG9uZW50IGluamVjdG9yIG9yIGFueSBvZiBpdHNcbiAqIHBhcmVudHMuXG4gKlxuICogSGVyZSwgdGhlIGNvbnN0cnVjdG9yIGRlY2xhcmVzIGEgcGFyYW1ldGVyLCBgc29tZVNlcnZpY2VgLCBhbmQgaW5qZWN0cyB0aGUgYFNvbWVTZXJ2aWNlYCB0eXBlXG4gKiBmcm9tIHRoZSBwYXJlbnRcbiAqIGNvbXBvbmVudCdzIGluamVjdG9yLlxuICogYGBgXG4gKiBARGlyZWN0aXZlKHsgc2VsZWN0b3I6ICdbbXktZGlyZWN0aXZlXScgfSlcbiAqIGNsYXNzIE15RGlyZWN0aXZlIHtcbiAqICAgY29uc3RydWN0b3Ioc29tZVNlcnZpY2U6IFNvbWVTZXJ2aWNlKSB7XG4gKiAgIH1cbiAqIH1cbiAqIGBgYFxuICpcbiAqIFRoaXMgZGlyZWN0aXZlIHdvdWxkIGJlIGluc3RhbnRpYXRlZCB3aXRoIGEgZGVwZW5kZW5jeSBvbiBgU29tZVNlcnZpY2VgLlxuICpcbiAqXG4gKiAjIyMgSW5qZWN0aW5nIGEgZGlyZWN0aXZlIGZyb20gdGhlIGN1cnJlbnQgZWxlbWVudFxuICpcbiAqIERpcmVjdGl2ZXMgY2FuIGluamVjdCBvdGhlciBkaXJlY3RpdmVzIGRlY2xhcmVkIG9uIHRoZSBjdXJyZW50IGVsZW1lbnQuXG4gKlxuICogYGBgXG4gKiBARGlyZWN0aXZlKHsgc2VsZWN0b3I6ICdbbXktZGlyZWN0aXZlXScgfSlcbiAqIGNsYXNzIE15RGlyZWN0aXZlIHtcbiAqICAgY29uc3RydWN0b3IoZGVwZW5kZW5jeTogRGVwZW5kZW5jeSkge1xuICogICAgIGV4cGVjdChkZXBlbmRlbmN5LmlkKS50b0VxdWFsKDMpO1xuICogICB9XG4gKiB9XG4gKiBgYGBcbiAqIFRoaXMgZGlyZWN0aXZlIHdvdWxkIGJlIGluc3RhbnRpYXRlZCB3aXRoIGBEZXBlbmRlbmN5YCBkZWNsYXJlZCBhdCB0aGUgc2FtZSBlbGVtZW50LCBpbiB0aGlzIGNhc2VcbiAqIGBkZXBlbmRlbmN5PVwiM1wiYC5cbiAqXG4gKiAjIyMgSW5qZWN0aW5nIGEgZGlyZWN0aXZlIGZyb20gYW55IGFuY2VzdG9yIGVsZW1lbnRzXG4gKlxuICogRGlyZWN0aXZlcyBjYW4gaW5qZWN0IG90aGVyIGRpcmVjdGl2ZXMgZGVjbGFyZWQgb24gYW55IGFuY2VzdG9yIGVsZW1lbnQgKGluIHRoZSBjdXJyZW50IFNoYWRvd1xuICogRE9NKSwgaS5lLiBvbiB0aGUgY3VycmVudCBlbGVtZW50LCB0aGVcbiAqIHBhcmVudCBlbGVtZW50LCBvciBpdHMgcGFyZW50cy5cbiAqIGBgYFxuICogQERpcmVjdGl2ZSh7IHNlbGVjdG9yOiAnW215LWRpcmVjdGl2ZV0nIH0pXG4gKiBjbGFzcyBNeURpcmVjdGl2ZSB7XG4gKiAgIGNvbnN0cnVjdG9yKEBIb3N0KCkgZGVwZW5kZW5jeTogRGVwZW5kZW5jeSkge1xuICogICAgIGV4cGVjdChkZXBlbmRlbmN5LmlkKS50b0VxdWFsKDIpO1xuICogICB9XG4gKiB9XG4gKiBgYGBcbiAqXG4gKiBgQEhvc3RgIGNoZWNrcyB0aGUgY3VycmVudCBlbGVtZW50LCB0aGUgcGFyZW50LCBhcyB3ZWxsIGFzIGl0cyBwYXJlbnRzIHJlY3Vyc2l2ZWx5LiBJZlxuICogYGRlcGVuZGVuY3k9XCIyXCJgIGRpZG4ndFxuICogZXhpc3Qgb24gdGhlIGRpcmVjdCBwYXJlbnQsIHRoaXMgaW5qZWN0aW9uIHdvdWxkXG4gKiBoYXZlIHJldHVybmVkXG4gKiBgZGVwZW5kZW5jeT1cIjFcImAuXG4gKlxuICpcbiAqICMjIyBJbmplY3RpbmcgYSBsaXZlIGNvbGxlY3Rpb24gb2YgZGlyZWN0IGNoaWxkIGRpcmVjdGl2ZXNcbiAqXG4gKlxuICogQSBkaXJlY3RpdmUgY2FuIGFsc28gcXVlcnkgZm9yIG90aGVyIGNoaWxkIGRpcmVjdGl2ZXMuIFNpbmNlIHBhcmVudCBkaXJlY3RpdmVzIGFyZSBpbnN0YW50aWF0ZWRcbiAqIGJlZm9yZSBjaGlsZCBkaXJlY3RpdmVzLCBhIGRpcmVjdGl2ZSBjYW4ndCBzaW1wbHkgaW5qZWN0IHRoZSBsaXN0IG9mIGNoaWxkIGRpcmVjdGl2ZXMuIEluc3RlYWQsXG4gKiB0aGUgZGlyZWN0aXZlIGluamVjdHMgYSB7QGxpbmsgUXVlcnlMaXN0fSwgd2hpY2ggdXBkYXRlcyBpdHMgY29udGVudHMgYXMgY2hpbGRyZW4gYXJlIGFkZGVkLFxuICogcmVtb3ZlZCwgb3IgbW92ZWQgYnkgYSBkaXJlY3RpdmUgdGhhdCB1c2VzIGEge0BsaW5rIFZpZXdDb250YWluZXJSZWZ9IHN1Y2ggYXMgYSBgbmdGb3JgLCBhblxuICogYG5nSWZgLCBvciBhbiBgbmdTd2l0Y2hgLlxuICpcbiAqIGBgYFxuICogQERpcmVjdGl2ZSh7IHNlbGVjdG9yOiAnW215LWRpcmVjdGl2ZV0nIH0pXG4gKiBjbGFzcyBNeURpcmVjdGl2ZSB7XG4gKiAgIGNvbnN0cnVjdG9yKEBRdWVyeShEZXBlbmRlbmN5KSBkZXBlbmRlbmNpZXM6UXVlcnlMaXN0PERlcGVuZGVuY3k+KSB7XG4gKiAgIH1cbiAqIH1cbiAqIGBgYFxuICpcbiAqIFRoaXMgZGlyZWN0aXZlIHdvdWxkIGJlIGluc3RhbnRpYXRlZCB3aXRoIGEge0BsaW5rIFF1ZXJ5TGlzdH0gd2hpY2ggY29udGFpbnMgYERlcGVuZGVuY3lgIDQgYW5kXG4gKiBgRGVwZW5kZW5jeWAgNi4gSGVyZSwgYERlcGVuZGVuY3lgIDUgd291bGQgbm90IGJlIGluY2x1ZGVkLCBiZWNhdXNlIGl0IGlzIG5vdCBhIGRpcmVjdCBjaGlsZC5cbiAqXG4gKiAjIyMgSW5qZWN0aW5nIGEgbGl2ZSBjb2xsZWN0aW9uIG9mIGRlc2NlbmRhbnQgZGlyZWN0aXZlc1xuICpcbiAqIEJ5IHBhc3NpbmcgdGhlIGRlc2NlbmRhbnQgZmxhZyB0byBgQFF1ZXJ5YCBhYm92ZSwgd2UgY2FuIGluY2x1ZGUgdGhlIGNoaWxkcmVuIG9mIHRoZSBjaGlsZFxuICogZWxlbWVudHMuXG4gKlxuICogYGBgXG4gKiBARGlyZWN0aXZlKHsgc2VsZWN0b3I6ICdbbXktZGlyZWN0aXZlXScgfSlcbiAqIGNsYXNzIE15RGlyZWN0aXZlIHtcbiAqICAgY29uc3RydWN0b3IoQFF1ZXJ5KERlcGVuZGVuY3ksIHtkZXNjZW5kYW50czogdHJ1ZX0pIGRlcGVuZGVuY2llczpRdWVyeUxpc3Q8RGVwZW5kZW5jeT4pIHtcbiAqICAgfVxuICogfVxuICogYGBgXG4gKlxuICogVGhpcyBkaXJlY3RpdmUgd291bGQgYmUgaW5zdGFudGlhdGVkIHdpdGggYSBRdWVyeSB3aGljaCB3b3VsZCBjb250YWluIGBEZXBlbmRlbmN5YCA0LCA1IGFuZCA2LlxuICpcbiAqICMjIyBPcHRpb25hbCBpbmplY3Rpb25cbiAqXG4gKiBUaGUgbm9ybWFsIGJlaGF2aW9yIG9mIGRpcmVjdGl2ZXMgaXMgdG8gcmV0dXJuIGFuIGVycm9yIHdoZW4gYSBzcGVjaWZpZWQgZGVwZW5kZW5jeSBjYW5ub3QgYmVcbiAqIHJlc29sdmVkLiBJZiB5b3VcbiAqIHdvdWxkIGxpa2UgdG8gaW5qZWN0IGBudWxsYCBvbiB1bnJlc29sdmVkIGRlcGVuZGVuY3kgaW5zdGVhZCwgeW91IGNhbiBhbm5vdGF0ZSB0aGF0IGRlcGVuZGVuY3lcbiAqIHdpdGggYEBPcHRpb25hbCgpYC5cbiAqIFRoaXMgZXhwbGljaXRseSBwZXJtaXRzIHRoZSBhdXRob3Igb2YgYSB0ZW1wbGF0ZSB0byB0cmVhdCBzb21lIG9mIHRoZSBzdXJyb3VuZGluZyBkaXJlY3RpdmVzIGFzXG4gKiBvcHRpb25hbC5cbiAqXG4gKiBgYGBcbiAqIEBEaXJlY3RpdmUoeyBzZWxlY3RvcjogJ1tteS1kaXJlY3RpdmVdJyB9KVxuICogY2xhc3MgTXlEaXJlY3RpdmUge1xuICogICBjb25zdHJ1Y3RvcihAT3B0aW9uYWwoKSBkZXBlbmRlbmN5OkRlcGVuZGVuY3kpIHtcbiAqICAgfVxuICogfVxuICogYGBgXG4gKlxuICogVGhpcyBkaXJlY3RpdmUgd291bGQgYmUgaW5zdGFudGlhdGVkIHdpdGggYSBgRGVwZW5kZW5jeWAgZGlyZWN0aXZlIGZvdW5kIG9uIHRoZSBjdXJyZW50IGVsZW1lbnQuXG4gKiBJZiBub25lIGNhbiBiZVxuICogZm91bmQsIHRoZSBpbmplY3RvciBzdXBwbGllcyBgbnVsbGAgaW5zdGVhZCBvZiB0aHJvd2luZyBhbiBlcnJvci5cbiAqXG4gKiAjIyMgRXhhbXBsZVxuICpcbiAqIEhlcmUgd2UgdXNlIGEgZGVjb3JhdG9yIGRpcmVjdGl2ZSB0byBzaW1wbHkgZGVmaW5lIGJhc2ljIHRvb2wtdGlwIGJlaGF2aW9yLlxuICpcbiAqIGBgYFxuICogQERpcmVjdGl2ZSh7XG4gKiAgIHNlbGVjdG9yOiAnW3Rvb2x0aXBdJyxcbiAqICAgaW5wdXRzOiBbXG4gKiAgICAgJ3RleHQ6IHRvb2x0aXAnXG4gKiAgIF0sXG4gKiAgIGhvc3Q6IHtcbiAqICAgICAnKG1vdXNlZW50ZXIpJzogJ29uTW91c2VFbnRlcigpJyxcbiAqICAgICAnKG1vdXNlbGVhdmUpJzogJ29uTW91c2VMZWF2ZSgpJ1xuICogICB9XG4gKiB9KVxuICogY2xhc3MgVG9vbHRpcHtcbiAqICAgdGV4dDpzdHJpbmc7XG4gKiAgIG92ZXJsYXk6T3ZlcmxheTsgLy8gTk9UIFlFVCBJTVBMRU1FTlRFRFxuICogICBvdmVybGF5TWFuYWdlcjpPdmVybGF5TWFuYWdlcjsgLy8gTk9UIFlFVCBJTVBMRU1FTlRFRFxuICpcbiAqICAgY29uc3RydWN0b3Iob3ZlcmxheU1hbmFnZXI6T3ZlcmxheU1hbmFnZXIpIHtcbiAqICAgICB0aGlzLm92ZXJsYXkgPSBvdmVybGF5O1xuICogICB9XG4gKlxuICogICBvbk1vdXNlRW50ZXIoKSB7XG4gKiAgICAgLy8gZXhhY3Qgc2lnbmF0dXJlIHRvIGJlIGRldGVybWluZWRcbiAqICAgICB0aGlzLm92ZXJsYXkgPSB0aGlzLm92ZXJsYXlNYW5hZ2VyLm9wZW4odGV4dCwgLi4uKTtcbiAqICAgfVxuICpcbiAqICAgb25Nb3VzZUxlYXZlKCkge1xuICogICAgIHRoaXMub3ZlcmxheS5jbG9zZSgpO1xuICogICAgIHRoaXMub3ZlcmxheSA9IG51bGw7XG4gKiAgIH1cbiAqIH1cbiAqIGBgYFxuICogSW4gb3VyIEhUTUwgdGVtcGxhdGUsIHdlIGNhbiB0aGVuIGFkZCB0aGlzIGJlaGF2aW9yIHRvIGEgYDxkaXY+YCBvciBhbnkgb3RoZXIgZWxlbWVudCB3aXRoIHRoZVxuICogYHRvb2x0aXBgIHNlbGVjdG9yLFxuICogbGlrZSBzbzpcbiAqXG4gKiBgYGBcbiAqIDxkaXYgdG9vbHRpcD1cInNvbWUgdGV4dCBoZXJlXCI+PC9kaXY+XG4gKiBgYGBcbiAqXG4gKiBEaXJlY3RpdmVzIGNhbiBhbHNvIGNvbnRyb2wgdGhlIGluc3RhbnRpYXRpb24sIGRlc3RydWN0aW9uLCBhbmQgcG9zaXRpb25pbmcgb2YgaW5saW5lIHRlbXBsYXRlXG4gKiBlbGVtZW50czpcbiAqXG4gKiBBIGRpcmVjdGl2ZSB1c2VzIGEge0BsaW5rIFZpZXdDb250YWluZXJSZWZ9IHRvIGluc3RhbnRpYXRlLCBpbnNlcnQsIG1vdmUsIGFuZCBkZXN0cm95IHZpZXdzIGF0XG4gKiBydW50aW1lLlxuICogVGhlIHtAbGluayBWaWV3Q29udGFpbmVyUmVmfSBpcyBjcmVhdGVkIGFzIGEgcmVzdWx0IG9mIGA8dGVtcGxhdGU+YCBlbGVtZW50LCBhbmQgcmVwcmVzZW50cyBhXG4gKiBsb2NhdGlvbiBpbiB0aGUgY3VycmVudCB2aWV3XG4gKiB3aGVyZSB0aGVzZSBhY3Rpb25zIGFyZSBwZXJmb3JtZWQuXG4gKlxuICogVmlld3MgYXJlIGFsd2F5cyBjcmVhdGVkIGFzIGNoaWxkcmVuIG9mIHRoZSBjdXJyZW50IHtAbGluayBWaWV3TWV0YWRhdGF9LCBhbmQgYXMgc2libGluZ3Mgb2YgdGhlXG4gKiBgPHRlbXBsYXRlPmAgZWxlbWVudC4gVGh1cyBhXG4gKiBkaXJlY3RpdmUgaW4gYSBjaGlsZCB2aWV3IGNhbm5vdCBpbmplY3QgdGhlIGRpcmVjdGl2ZSB0aGF0IGNyZWF0ZWQgaXQuXG4gKlxuICogU2luY2UgZGlyZWN0aXZlcyB0aGF0IGNyZWF0ZSB2aWV3cyB2aWEgVmlld0NvbnRhaW5lcnMgYXJlIGNvbW1vbiBpbiBBbmd1bGFyLCBhbmQgdXNpbmcgdGhlIGZ1bGxcbiAqIGA8dGVtcGxhdGU+YCBlbGVtZW50IHN5bnRheCBpcyB3b3JkeSwgQW5ndWxhclxuICogYWxzbyBzdXBwb3J0cyBhIHNob3J0aGFuZCBub3RhdGlvbjogYDxsaSAqZm9vPVwiYmFyXCI+YCBhbmQgYDxsaSB0ZW1wbGF0ZT1cImZvbzogYmFyXCI+YCBhcmVcbiAqIGVxdWl2YWxlbnQuXG4gKlxuICogVGh1cyxcbiAqXG4gKiBgYGBcbiAqIDx1bD5cbiAqICAgPGxpICpmb289XCJiYXJcIiB0aXRsZT1cInRleHRcIj48L2xpPlxuICogPC91bD5cbiAqIGBgYFxuICpcbiAqIEV4cGFuZHMgaW4gdXNlIHRvOlxuICpcbiAqIGBgYFxuICogPHVsPlxuICogICA8dGVtcGxhdGUgW2Zvb109XCJiYXJcIj5cbiAqICAgICA8bGkgdGl0bGU9XCJ0ZXh0XCI+PC9saT5cbiAqICAgPC90ZW1wbGF0ZT5cbiAqIDwvdWw+XG4gKiBgYGBcbiAqXG4gKiBOb3RpY2UgdGhhdCBhbHRob3VnaCB0aGUgc2hvcnRoYW5kIHBsYWNlcyBgKmZvbz1cImJhclwiYCB3aXRoaW4gdGhlIGA8bGk+YCBlbGVtZW50LCB0aGUgYmluZGluZyBmb3JcbiAqIHRoZSBkaXJlY3RpdmVcbiAqIGNvbnRyb2xsZXIgaXMgY29ycmVjdGx5IGluc3RhbnRpYXRlZCBvbiB0aGUgYDx0ZW1wbGF0ZT5gIGVsZW1lbnQgcmF0aGVyIHRoYW4gdGhlIGA8bGk+YCBlbGVtZW50LlxuICpcbiAqICMjIExpZmVjeWNsZSBob29rc1xuICpcbiAqIFdoZW4gdGhlIGRpcmVjdGl2ZSBjbGFzcyBpbXBsZW1lbnRzIHNvbWUge0BsaW5rIGFuZ3VsYXIyL2xpZmVjeWNsZV9ob29rc30gdGhlIGNhbGxiYWNrcyBhcmVcbiAqIGNhbGxlZCBieSB0aGUgY2hhbmdlIGRldGVjdGlvbiBhdCBkZWZpbmVkIHBvaW50cyBpbiB0aW1lIGR1cmluZyB0aGUgbGlmZSBvZiB0aGUgZGlyZWN0aXZlLlxuICpcbiAqICMjIyBFeGFtcGxlXG4gKlxuICogTGV0J3Mgc3VwcG9zZSB3ZSB3YW50IHRvIGltcGxlbWVudCB0aGUgYHVubGVzc2AgYmVoYXZpb3IsIHRvIGNvbmRpdGlvbmFsbHkgaW5jbHVkZSBhIHRlbXBsYXRlLlxuICpcbiAqIEhlcmUgaXMgYSBzaW1wbGUgZGlyZWN0aXZlIHRoYXQgdHJpZ2dlcnMgb24gYW4gYHVubGVzc2Agc2VsZWN0b3I6XG4gKlxuICogYGBgXG4gKiBARGlyZWN0aXZlKHtcbiAqICAgc2VsZWN0b3I6ICdbdW5sZXNzXScsXG4gKiAgIGlucHV0czogWyd1bmxlc3MnXVxuICogfSlcbiAqIGV4cG9ydCBjbGFzcyBVbmxlc3Mge1xuICogICB2aWV3Q29udGFpbmVyOiBWaWV3Q29udGFpbmVyUmVmO1xuICogICB0ZW1wbGF0ZVJlZjogVGVtcGxhdGVSZWY7XG4gKiAgIHByZXZDb25kaXRpb246IGJvb2xlYW47XG4gKlxuICogICBjb25zdHJ1Y3Rvcih2aWV3Q29udGFpbmVyOiBWaWV3Q29udGFpbmVyUmVmLCB0ZW1wbGF0ZVJlZjogVGVtcGxhdGVSZWYpIHtcbiAqICAgICB0aGlzLnZpZXdDb250YWluZXIgPSB2aWV3Q29udGFpbmVyO1xuICogICAgIHRoaXMudGVtcGxhdGVSZWYgPSB0ZW1wbGF0ZVJlZjtcbiAqICAgICB0aGlzLnByZXZDb25kaXRpb24gPSBudWxsO1xuICogICB9XG4gKlxuICogICBzZXQgdW5sZXNzKG5ld0NvbmRpdGlvbikge1xuICogICAgIGlmIChuZXdDb25kaXRpb24gJiYgKGlzQmxhbmsodGhpcy5wcmV2Q29uZGl0aW9uKSB8fCAhdGhpcy5wcmV2Q29uZGl0aW9uKSkge1xuICogICAgICAgdGhpcy5wcmV2Q29uZGl0aW9uID0gdHJ1ZTtcbiAqICAgICAgIHRoaXMudmlld0NvbnRhaW5lci5jbGVhcigpO1xuICogICAgIH0gZWxzZSBpZiAoIW5ld0NvbmRpdGlvbiAmJiAoaXNCbGFuayh0aGlzLnByZXZDb25kaXRpb24pIHx8IHRoaXMucHJldkNvbmRpdGlvbikpIHtcbiAqICAgICAgIHRoaXMucHJldkNvbmRpdGlvbiA9IGZhbHNlO1xuICogICAgICAgdGhpcy52aWV3Q29udGFpbmVyLmNyZWF0ZSh0aGlzLnRlbXBsYXRlUmVmKTtcbiAqICAgICB9XG4gKiAgIH1cbiAqIH1cbiAqIGBgYFxuICpcbiAqIFdlIGNhbiB0aGVuIHVzZSB0aGlzIGB1bmxlc3NgIHNlbGVjdG9yIGluIGEgdGVtcGxhdGU6XG4gKiBgYGBcbiAqIDx1bD5cbiAqICAgPGxpICp1bmxlc3M9XCJleHByXCI+PC9saT5cbiAqIDwvdWw+XG4gKiBgYGBcbiAqXG4gKiBPbmNlIHRoZSBkaXJlY3RpdmUgaW5zdGFudGlhdGVzIHRoZSBjaGlsZCB2aWV3LCB0aGUgc2hvcnRoYW5kIG5vdGF0aW9uIGZvciB0aGUgdGVtcGxhdGUgZXhwYW5kc1xuICogYW5kIHRoZSByZXN1bHQgaXM6XG4gKlxuICogYGBgXG4gKiA8dWw+XG4gKiAgIDx0ZW1wbGF0ZSBbdW5sZXNzXT1cImV4cFwiPlxuICogICAgIDxsaT48L2xpPlxuICogICA8L3RlbXBsYXRlPlxuICogICA8bGk+PC9saT5cbiAqIDwvdWw+XG4gKiBgYGBcbiAqXG4gKiBOb3RlIGFsc28gdGhhdCBhbHRob3VnaCB0aGUgYDxsaT48L2xpPmAgdGVtcGxhdGUgc3RpbGwgZXhpc3RzIGluc2lkZSB0aGUgYDx0ZW1wbGF0ZT48L3RlbXBsYXRlPmAsXG4gKiB0aGUgaW5zdGFudGlhdGVkXG4gKiB2aWV3IG9jY3VycyBvbiB0aGUgc2Vjb25kIGA8bGk+PC9saT5gIHdoaWNoIGlzIGEgc2libGluZyB0byB0aGUgYDx0ZW1wbGF0ZT5gIGVsZW1lbnQuXG4gKi9cbkBDT05TVCgpXG5leHBvcnQgY2xhc3MgRGlyZWN0aXZlTWV0YWRhdGEgZXh0ZW5kcyBJbmplY3RhYmxlTWV0YWRhdGEge1xuICAvKipcbiAgICogVGhlIENTUyBzZWxlY3RvciB0aGF0IHRyaWdnZXJzIHRoZSBpbnN0YW50aWF0aW9uIG9mIGEgZGlyZWN0aXZlLlxuICAgKlxuICAgKiBBbmd1bGFyIG9ubHkgYWxsb3dzIGRpcmVjdGl2ZXMgdG8gdHJpZ2dlciBvbiBDU1Mgc2VsZWN0b3JzIHRoYXQgZG8gbm90IGNyb3NzIGVsZW1lbnRcbiAgICogYm91bmRhcmllcy5cbiAgICpcbiAgICogYHNlbGVjdG9yYCBtYXkgYmUgZGVjbGFyZWQgYXMgb25lIG9mIHRoZSBmb2xsb3dpbmc6XG4gICAqXG4gICAqIC0gYGVsZW1lbnQtbmFtZWA6IHNlbGVjdCBieSBlbGVtZW50IG5hbWUuXG4gICAqIC0gYC5jbGFzc2A6IHNlbGVjdCBieSBjbGFzcyBuYW1lLlxuICAgKiAtIGBbYXR0cmlidXRlXWA6IHNlbGVjdCBieSBhdHRyaWJ1dGUgbmFtZS5cbiAgICogLSBgW2F0dHJpYnV0ZT12YWx1ZV1gOiBzZWxlY3QgYnkgYXR0cmlidXRlIG5hbWUgYW5kIHZhbHVlLlxuICAgKiAtIGA6bm90KHN1Yl9zZWxlY3RvcilgOiBzZWxlY3Qgb25seSBpZiB0aGUgZWxlbWVudCBkb2VzIG5vdCBtYXRjaCB0aGUgYHN1Yl9zZWxlY3RvcmAuXG4gICAqIC0gYHNlbGVjdG9yMSwgc2VsZWN0b3IyYDogc2VsZWN0IGlmIGVpdGhlciBgc2VsZWN0b3IxYCBvciBgc2VsZWN0b3IyYCBtYXRjaGVzLlxuICAgKlxuICAgKlxuICAgKiAjIyMgRXhhbXBsZVxuICAgKlxuICAgKiBTdXBwb3NlIHdlIGhhdmUgYSBkaXJlY3RpdmUgd2l0aCBhbiBgaW5wdXRbdHlwZT10ZXh0XWAgc2VsZWN0b3IuXG4gICAqXG4gICAqIEFuZCB0aGUgZm9sbG93aW5nIEhUTUw6XG4gICAqXG4gICAqIGBgYGh0bWxcbiAgICogPGZvcm0+XG4gICAqICAgPGlucHV0IHR5cGU9XCJ0ZXh0XCI+XG4gICAqICAgPGlucHV0IHR5cGU9XCJyYWRpb1wiPlxuICAgKiA8Zm9ybT5cbiAgICogYGBgXG4gICAqXG4gICAqIFRoZSBkaXJlY3RpdmUgd291bGQgb25seSBiZSBpbnN0YW50aWF0ZWQgb24gdGhlIGA8aW5wdXQgdHlwZT1cInRleHRcIj5gIGVsZW1lbnQuXG4gICAqXG4gICAqL1xuICBzZWxlY3Rvcjogc3RyaW5nO1xuXG4gIC8qKlxuICAgKiBFbnVtZXJhdGVzIHRoZSBzZXQgb2YgZGF0YS1ib3VuZCBpbnB1dCBwcm9wZXJ0aWVzIGZvciBhIGRpcmVjdGl2ZVxuICAgKlxuICAgKiBBbmd1bGFyIGF1dG9tYXRpY2FsbHkgdXBkYXRlcyBpbnB1dCBwcm9wZXJ0aWVzIGR1cmluZyBjaGFuZ2UgZGV0ZWN0aW9uLlxuICAgKlxuICAgKiBUaGUgYGlucHV0c2AgcHJvcGVydHkgZGVmaW5lcyBhIHNldCBvZiBgZGlyZWN0aXZlUHJvcGVydHlgIHRvIGBiaW5kaW5nUHJvcGVydHlgXG4gICAqIGNvbmZpZ3VyYXRpb246XG4gICAqXG4gICAqIC0gYGRpcmVjdGl2ZVByb3BlcnR5YCBzcGVjaWZpZXMgdGhlIGNvbXBvbmVudCBwcm9wZXJ0eSB3aGVyZSB0aGUgdmFsdWUgaXMgd3JpdHRlbi5cbiAgICogLSBgYmluZGluZ1Byb3BlcnR5YCBzcGVjaWZpZXMgdGhlIERPTSBwcm9wZXJ0eSB3aGVyZSB0aGUgdmFsdWUgaXMgcmVhZCBmcm9tLlxuICAgKlxuICAgKiBXaGVuIGBiaW5kaW5nUHJvcGVydHlgIGlzIG5vdCBwcm92aWRlZCwgaXQgaXMgYXNzdW1lZCB0byBiZSBlcXVhbCB0byBgZGlyZWN0aXZlUHJvcGVydHlgLlxuICAgKlxuICAgKiAjIyMgRXhhbXBsZSAoW2xpdmUgZGVtb10oaHR0cDovL3BsbmtyLmNvL2VkaXQvaXZoZlhZP3A9cHJldmlldykpXG4gICAqXG4gICAqIFRoZSBmb2xsb3dpbmcgZXhhbXBsZSBjcmVhdGVzIGEgY29tcG9uZW50IHdpdGggdHdvIGRhdGEtYm91bmQgcHJvcGVydGllcy5cbiAgICpcbiAgICogYGBgdHlwZXNjcmlwdFxuICAgKiBAQ29tcG9uZW50KHtcbiAgICogICBzZWxlY3RvcjogJ2JhbmstYWNjb3VudCcsXG4gICAqICAgaW5wdXRzOiBbJ2JhbmtOYW1lJywgJ2lkOiBhY2NvdW50LWlkJ10sXG4gICAqICAgdGVtcGxhdGU6IGBcbiAgICogICAgIEJhbmsgTmFtZToge3tiYW5rTmFtZX19XG4gICAqICAgICBBY2NvdW50IElkOiB7e2lkfX1cbiAgICogICBgXG4gICAqIH0pXG4gICAqIGNsYXNzIEJhbmtBY2NvdW50IHtcbiAgICogICBiYW5rTmFtZTogc3RyaW5nO1xuICAgKiAgIGlkOiBzdHJpbmc7XG4gICAqXG4gICAqICAgLy8gdGhpcyBwcm9wZXJ0eSBpcyBub3QgYm91bmQsIGFuZCB3b24ndCBiZSBhdXRvbWF0aWNhbGx5IHVwZGF0ZWQgYnkgQW5ndWxhclxuICAgKiAgIG5vcm1hbGl6ZWRCYW5rTmFtZTogc3RyaW5nO1xuICAgKiB9XG4gICAqXG4gICAqIEBDb21wb25lbnQoe1xuICAgKiAgIHNlbGVjdG9yOiAnYXBwJyxcbiAgICogICB0ZW1wbGF0ZTogYFxuICAgKiAgICAgPGJhbmstYWNjb3VudCBiYW5rLW5hbWU9XCJSQkNcIiBhY2NvdW50LWlkPVwiNDc0N1wiPjwvYmFuay1hY2NvdW50PlxuICAgKiAgIGAsXG4gICAqICAgZGlyZWN0aXZlczogW0JhbmtBY2NvdW50XVxuICAgKiB9KVxuICAgKiBjbGFzcyBBcHAge31cbiAgICpcbiAgICogYm9vdHN0cmFwKEFwcCk7XG4gICAqIGBgYFxuICAgKlxuICAgKi9cbiAgZ2V0IGlucHV0cygpOiBzdHJpbmdbXSB7XG4gICAgcmV0dXJuIGlzUHJlc2VudCh0aGlzLl9wcm9wZXJ0aWVzKSAmJiB0aGlzLl9wcm9wZXJ0aWVzLmxlbmd0aCA+IDAgPyB0aGlzLl9wcm9wZXJ0aWVzIDpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuX2lucHV0cztcbiAgfVxuICBnZXQgcHJvcGVydGllcygpOiBzdHJpbmdbXSB7IHJldHVybiB0aGlzLmlucHV0czsgfVxuICBwcml2YXRlIF9pbnB1dHM6IHN0cmluZ1tdO1xuICBwcml2YXRlIF9wcm9wZXJ0aWVzOiBzdHJpbmdbXTtcblxuICAvKipcbiAgICogRW51bWVyYXRlcyB0aGUgc2V0IG9mIGV2ZW50LWJvdW5kIG91dHB1dCBwcm9wZXJ0aWVzLlxuICAgKlxuICAgKiBXaGVuIGFuIG91dHB1dCBwcm9wZXJ0eSBlbWl0cyBhbiBldmVudCwgYW4gZXZlbnQgaGFuZGxlciBhdHRhY2hlZCB0byB0aGF0IGV2ZW50XG4gICAqIHRoZSB0ZW1wbGF0ZSBpcyBpbnZva2VkLlxuICAgKlxuICAgKiBUaGUgYG91dHB1dHNgIHByb3BlcnR5IGRlZmluZXMgYSBzZXQgb2YgYGRpcmVjdGl2ZVByb3BlcnR5YCB0byBgYmluZGluZ1Byb3BlcnR5YFxuICAgKiBjb25maWd1cmF0aW9uOlxuICAgKlxuICAgKiAtIGBkaXJlY3RpdmVQcm9wZXJ0eWAgc3BlY2lmaWVzIHRoZSBjb21wb25lbnQgcHJvcGVydHkgdGhhdCBlbWl0cyBldmVudHMuXG4gICAqIC0gYGJpbmRpbmdQcm9wZXJ0eWAgc3BlY2lmaWVzIHRoZSBET00gcHJvcGVydHkgdGhlIGV2ZW50IGhhbmRsZXIgaXMgYXR0YWNoZWQgdG8uXG4gICAqXG4gICAqICMjIyBFeGFtcGxlIChbbGl2ZSBkZW1vXShodHRwOi8vcGxua3IuY28vZWRpdC9kNUNOcTc/cD1wcmV2aWV3KSlcbiAgICpcbiAgICogYGBgdHlwZXNjcmlwdFxuICAgKiBARGlyZWN0aXZlKHtcbiAgICogICBzZWxlY3RvcjogJ2ludGVydmFsLWRpcicsXG4gICAqICAgb3V0cHV0czogWydldmVyeVNlY29uZCcsICdmaXZlNVNlY3M6IGV2ZXJ5Rml2ZVNlY29uZHMnXVxuICAgKiB9KVxuICAgKiBjbGFzcyBJbnRlcnZhbERpciB7XG4gICAqICAgZXZlcnlTZWNvbmQgPSBuZXcgRXZlbnRFbWl0dGVyKCk7XG4gICAqICAgZml2ZTVTZWNzID0gbmV3IEV2ZW50RW1pdHRlcigpO1xuICAgKlxuICAgKiAgIGNvbnN0cnVjdG9yKCkge1xuICAgKiAgICAgc2V0SW50ZXJ2YWwoKCkgPT4gdGhpcy5ldmVyeVNlY29uZC5lbWl0KFwiZXZlbnRcIiksIDEwMDApO1xuICAgKiAgICAgc2V0SW50ZXJ2YWwoKCkgPT4gdGhpcy5maXZlNVNlY3MuZW1pdChcImV2ZW50XCIpLCA1MDAwKTtcbiAgICogICB9XG4gICAqIH1cbiAgICpcbiAgICogQENvbXBvbmVudCh7XG4gICAqICAgc2VsZWN0b3I6ICdhcHAnLFxuICAgKiAgIHRlbXBsYXRlOiBgXG4gICAqICAgICA8aW50ZXJ2YWwtZGlyIChldmVyeS1zZWNvbmQpPVwiZXZlcnlTZWNvbmQoKVwiIChldmVyeS1maXZlLXNlY29uZHMpPVwiZXZlcnlGaXZlU2Vjb25kcygpXCI+XG4gICAqICAgICA8L2ludGVydmFsLWRpcj5cbiAgICogICBgLFxuICAgKiAgIGRpcmVjdGl2ZXM6IFtJbnRlcnZhbERpcl1cbiAgICogfSlcbiAgICogY2xhc3MgQXBwIHtcbiAgICogICBldmVyeVNlY29uZCgpIHsgY29uc29sZS5sb2coJ3NlY29uZCcpOyB9XG4gICAqICAgZXZlcnlGaXZlU2Vjb25kcygpIHsgY29uc29sZS5sb2coJ2ZpdmUgc2Vjb25kcycpOyB9XG4gICAqIH1cbiAgICogYm9vdHN0cmFwKEFwcCk7XG4gICAqIGBgYFxuICAgKlxuICAgKi9cbiAgZ2V0IG91dHB1dHMoKTogc3RyaW5nW10ge1xuICAgIHJldHVybiBpc1ByZXNlbnQodGhpcy5fZXZlbnRzKSAmJiB0aGlzLl9ldmVudHMubGVuZ3RoID4gMCA/IHRoaXMuX2V2ZW50cyA6IHRoaXMuX291dHB1dHM7XG4gIH1cbiAgZ2V0IGV2ZW50cygpOiBzdHJpbmdbXSB7IHJldHVybiB0aGlzLm91dHB1dHM7IH1cbiAgcHJpdmF0ZSBfb3V0cHV0czogc3RyaW5nW107XG4gIHByaXZhdGUgX2V2ZW50czogc3RyaW5nW107XG5cbiAgLyoqXG4gICAqIFNwZWNpZnkgdGhlIGV2ZW50cywgYWN0aW9ucywgcHJvcGVydGllcyBhbmQgYXR0cmlidXRlcyByZWxhdGVkIHRvIHRoZSBob3N0IGVsZW1lbnQuXG4gICAqXG4gICAqICMjIEhvc3QgTGlzdGVuZXJzXG4gICAqXG4gICAqIFNwZWNpZmllcyB3aGljaCBET00gZXZlbnRzIGEgZGlyZWN0aXZlIGxpc3RlbnMgdG8gdmlhIGEgc2V0IG9mIGAoZXZlbnQpYCB0byBgbWV0aG9kYFxuICAgKiBrZXktdmFsdWUgcGFpcnM6XG4gICAqXG4gICAqIC0gYGV2ZW50YDogdGhlIERPTSBldmVudCB0aGF0IHRoZSBkaXJlY3RpdmUgbGlzdGVucyB0by5cbiAgICogLSBgc3RhdGVtZW50YDogdGhlIHN0YXRlbWVudCB0byBleGVjdXRlIHdoZW4gdGhlIGV2ZW50IG9jY3Vycy5cbiAgICogSWYgdGhlIGV2YWx1YXRpb24gb2YgdGhlIHN0YXRlbWVudCByZXR1cm5zIGBmYWxzZWAsIHRoZW4gYHByZXZlbnREZWZhdWx0YGlzIGFwcGxpZWQgb24gdGhlIERPTVxuICAgKiBldmVudC5cbiAgICpcbiAgICogVG8gbGlzdGVuIHRvIGdsb2JhbCBldmVudHMsIGEgdGFyZ2V0IG11c3QgYmUgYWRkZWQgdG8gdGhlIGV2ZW50IG5hbWUuXG4gICAqIFRoZSB0YXJnZXQgY2FuIGJlIGB3aW5kb3dgLCBgZG9jdW1lbnRgIG9yIGBib2R5YC5cbiAgICpcbiAgICogV2hlbiB3cml0aW5nIGEgZGlyZWN0aXZlIGV2ZW50IGJpbmRpbmcsIHlvdSBjYW4gYWxzbyByZWZlciB0byB0aGUgJGV2ZW50IGxvY2FsIHZhcmlhYmxlLlxuICAgKlxuICAgKiAjIyMgRXhhbXBsZSAoW2xpdmUgZGVtb10oaHR0cDovL3BsbmtyLmNvL2VkaXQvRGxBNUtVP3A9cHJldmlldykpXG4gICAqXG4gICAqIFRoZSBmb2xsb3dpbmcgZXhhbXBsZSBkZWNsYXJlcyBhIGRpcmVjdGl2ZSB0aGF0IGF0dGFjaGVzIGEgY2xpY2sgbGlzdGVuZXIgdG8gdGhlIGJ1dHRvbiBhbmRcbiAgICogY291bnRzIGNsaWNrcy5cbiAgICpcbiAgICogYGBgdHlwZXNjcmlwdFxuICAgKiBARGlyZWN0aXZlKHtcbiAgICogICBzZWxlY3RvcjogJ2J1dHRvbltjb3VudGluZ10nLFxuICAgKiAgIGhvc3Q6IHtcbiAgICogICAgICcoY2xpY2spJzogJ29uQ2xpY2soJGV2ZW50LnRhcmdldCknXG4gICAqICAgfVxuICAgKiB9KVxuICAgKiBjbGFzcyBDb3VudENsaWNrcyB7XG4gICAqICAgbnVtYmVyT2ZDbGlja3MgPSAwO1xuICAgKlxuICAgKiAgIG9uQ2xpY2soYnRuKSB7XG4gICAqICAgICBjb25zb2xlLmxvZyhcImJ1dHRvblwiLCBidG4sIFwibnVtYmVyIG9mIGNsaWNrczpcIiwgdGhpcy5udW1iZXJPZkNsaWNrcysrKTtcbiAgICogICB9XG4gICAqIH1cbiAgICpcbiAgICogQENvbXBvbmVudCh7XG4gICAqICAgc2VsZWN0b3I6ICdhcHAnLFxuICAgKiAgIHRlbXBsYXRlOiBgPGJ1dHRvbiBjb3VudGluZz5JbmNyZW1lbnQ8L2J1dHRvbj5gLFxuICAgKiAgIGRpcmVjdGl2ZXM6IFtDb3VudENsaWNrc11cbiAgICogfSlcbiAgICogY2xhc3MgQXBwIHt9XG4gICAqXG4gICAqIGJvb3RzdHJhcChBcHApO1xuICAgKiBgYGBcbiAgICpcbiAgICogIyMgSG9zdCBQcm9wZXJ0eSBCaW5kaW5nc1xuICAgKlxuICAgKiBTcGVjaWZpZXMgd2hpY2ggRE9NIHByb3BlcnRpZXMgYSBkaXJlY3RpdmUgdXBkYXRlcy5cbiAgICpcbiAgICogQW5ndWxhciBhdXRvbWF0aWNhbGx5IGNoZWNrcyBob3N0IHByb3BlcnR5IGJpbmRpbmdzIGR1cmluZyBjaGFuZ2UgZGV0ZWN0aW9uLlxuICAgKiBJZiBhIGJpbmRpbmcgY2hhbmdlcywgaXQgd2lsbCB1cGRhdGUgdGhlIGhvc3QgZWxlbWVudCBvZiB0aGUgZGlyZWN0aXZlLlxuICAgKlxuICAgKiAjIyMgRXhhbXBsZSAoW2xpdmUgZGVtb10oaHR0cDovL3BsbmtyLmNvL2VkaXQvZ05nMEVEP3A9cHJldmlldykpXG4gICAqXG4gICAqIFRoZSBmb2xsb3dpbmcgZXhhbXBsZSBjcmVhdGVzIGEgZGlyZWN0aXZlIHRoYXQgc2V0cyB0aGUgYHZhbGlkYCBhbmQgYGludmFsaWRgIGNsYXNzZXNcbiAgICogb24gdGhlIERPTSBlbGVtZW50IHRoYXQgaGFzIG5nTW9kZWwgZGlyZWN0aXZlIG9uIGl0LlxuICAgKlxuICAgKiBgYGB0eXBlc2NyaXB0XG4gICAqIEBEaXJlY3RpdmUoe1xuICAgKiAgIHNlbGVjdG9yOiAnW25nTW9kZWxdJyxcbiAgICogICBob3N0OiB7XG4gICAqICAgICAnW2NsYXNzLnZhbGlkXSc6ICd2YWxpZCcsXG4gICAqICAgICAnW2NsYXNzLmludmFsaWRdJzogJ2ludmFsaWQnXG4gICAqICAgfVxuICAgKiB9KVxuICAgKiBjbGFzcyBOZ01vZGVsU3RhdHVzIHtcbiAgICogICBjb25zdHJ1Y3RvcihwdWJsaWMgY29udHJvbDpOZ01vZGVsKSB7fVxuICAgKiAgIGdldCB2YWxpZCB7IHJldHVybiB0aGlzLmNvbnRyb2wudmFsaWQ7IH1cbiAgICogICBnZXQgaW52YWxpZCB7IHJldHVybiB0aGlzLmNvbnRyb2wuaW52YWxpZDsgfVxuICAgKiB9XG4gICAqXG4gICAqIEBDb21wb25lbnQoe1xuICAgKiAgIHNlbGVjdG9yOiAnYXBwJyxcbiAgICogICB0ZW1wbGF0ZTogYDxpbnB1dCBbKG5nTW9kZWwpXT1cInByb3BcIj5gLFxuICAgKiAgIGRpcmVjdGl2ZXM6IFtGT1JNX0RJUkVDVElWRVMsIE5nTW9kZWxTdGF0dXNdXG4gICAqIH0pXG4gICAqIGNsYXNzIEFwcCB7XG4gICAqICAgcHJvcDtcbiAgICogfVxuICAgKlxuICAgKiBib290c3RyYXAoQXBwKTtcbiAgICogYGBgXG4gICAqXG4gICAqICMjIEF0dHJpYnV0ZXNcbiAgICpcbiAgICogU3BlY2lmaWVzIHN0YXRpYyBhdHRyaWJ1dGVzIHRoYXQgc2hvdWxkIGJlIHByb3BhZ2F0ZWQgdG8gYSBob3N0IGVsZW1lbnQuXG4gICAqXG4gICAqICMjIyBFeGFtcGxlXG4gICAqXG4gICAqIEluIHRoaXMgZXhhbXBsZSB1c2luZyBgbXktYnV0dG9uYCBkaXJlY3RpdmUgKGV4LjogYDxkaXYgbXktYnV0dG9uPjwvZGl2PmApIG9uIGEgaG9zdCBlbGVtZW50XG4gICAqIChoZXJlOiBgPGRpdj5gICkgd2lsbCBlbnN1cmUgdGhhdCB0aGlzIGVsZW1lbnQgd2lsbCBnZXQgdGhlIFwiYnV0dG9uXCIgcm9sZS5cbiAgICpcbiAgICogYGBgdHlwZXNjcmlwdFxuICAgKiBARGlyZWN0aXZlKHtcbiAgICogICBzZWxlY3RvcjogJ1tteS1idXR0b25dJyxcbiAgICogICBob3N0OiB7XG4gICAqICAgICAncm9sZSc6ICdidXR0b24nXG4gICAqICAgfVxuICAgKiB9KVxuICAgKiBjbGFzcyBNeUJ1dHRvbiB7XG4gICAqIH1cbiAgICogYGBgXG4gICAqL1xuICBob3N0OiB7W2tleTogc3RyaW5nXTogc3RyaW5nfTtcblxuICAvKipcbiAgICogRGVmaW5lcyB0aGUgc2V0IG9mIGluamVjdGFibGUgb2JqZWN0cyB0aGF0IGFyZSB2aXNpYmxlIHRvIGEgRGlyZWN0aXZlIGFuZCBpdHMgbGlnaHQgRE9NXG4gICAqIGNoaWxkcmVuLlxuICAgKlxuICAgKiAjIyBTaW1wbGUgRXhhbXBsZVxuICAgKlxuICAgKiBIZXJlIGlzIGFuIGV4YW1wbGUgb2YgYSBjbGFzcyB0aGF0IGNhbiBiZSBpbmplY3RlZDpcbiAgICpcbiAgICogYGBgXG4gICAqIGNsYXNzIEdyZWV0ZXIge1xuICAgKiAgICBncmVldChuYW1lOnN0cmluZykge1xuICAgKiAgICAgIHJldHVybiAnSGVsbG8gJyArIG5hbWUgKyAnISc7XG4gICAqICAgIH1cbiAgICogfVxuICAgKlxuICAgKiBARGlyZWN0aXZlKHtcbiAgICogICBzZWxlY3RvcjogJ2dyZWV0JyxcbiAgICogICBiaW5kaW5nczogW1xuICAgKiAgICAgR3JlZXRlclxuICAgKiAgIF1cbiAgICogfSlcbiAgICogY2xhc3MgSGVsbG9Xb3JsZCB7XG4gICAqICAgZ3JlZXRlcjpHcmVldGVyO1xuICAgKlxuICAgKiAgIGNvbnN0cnVjdG9yKGdyZWV0ZXI6R3JlZXRlcikge1xuICAgKiAgICAgdGhpcy5ncmVldGVyID0gZ3JlZXRlcjtcbiAgICogICB9XG4gICAqIH1cbiAgICogYGBgXG4gICAqL1xuICBnZXQgcHJvdmlkZXJzKCk6IGFueVtdIHtcbiAgICByZXR1cm4gaXNQcmVzZW50KHRoaXMuX2JpbmRpbmdzKSAmJiB0aGlzLl9iaW5kaW5ncy5sZW5ndGggPiAwID8gdGhpcy5fYmluZGluZ3MgOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLl9wcm92aWRlcnM7XG4gIH1cbiAgLyoqIEBkZXByZWNhdGVkICovXG4gIGdldCBiaW5kaW5ncygpOiBhbnlbXSB7IHJldHVybiB0aGlzLnByb3ZpZGVyczsgfVxuICBwcml2YXRlIF9wcm92aWRlcnM6IGFueVtdO1xuICBwcml2YXRlIF9iaW5kaW5nczogYW55W107XG5cbiAgLyoqXG4gICAqIERlZmluZXMgdGhlIG5hbWUgdGhhdCBjYW4gYmUgdXNlZCBpbiB0aGUgdGVtcGxhdGUgdG8gYXNzaWduIHRoaXMgZGlyZWN0aXZlIHRvIGEgdmFyaWFibGUuXG4gICAqXG4gICAqICMjIFNpbXBsZSBFeGFtcGxlXG4gICAqXG4gICAqIGBgYFxuICAgKiBARGlyZWN0aXZlKHtcbiAgICogICBzZWxlY3RvcjogJ2NoaWxkLWRpcicsXG4gICAqICAgZXhwb3J0QXM6ICdjaGlsZCdcbiAgICogfSlcbiAgICogY2xhc3MgQ2hpbGREaXIge1xuICAgKiB9XG4gICAqXG4gICAqIEBDb21wb25lbnQoe1xuICAgKiAgIHNlbGVjdG9yOiAnbWFpbicsXG4gICAqICAgdGVtcGxhdGU6IGA8Y2hpbGQtZGlyICNjPVwiY2hpbGRcIj48L2NoaWxkLWRpcj5gLFxuICAgKiAgIGRpcmVjdGl2ZXM6IFtDaGlsZERpcl1cbiAgICogfSlcbiAgICogY2xhc3MgTWFpbkNvbXBvbmVudCB7XG4gICAqIH1cbiAgICpcbiAgICogYGBgXG4gICAqL1xuICBleHBvcnRBczogc3RyaW5nO1xuXG4gIC8vIFRPRE86IGFkZCBhbiBleGFtcGxlIGFmdGVyIENvbnRlbnRDaGlsZHJlbiBhbmQgVmlld0NoaWxkcmVuIGFyZSBpbiBtYXN0ZXJcbiAgLyoqXG4gICAqIENvbmZpZ3VyZXMgdGhlIHF1ZXJpZXMgdGhhdCB3aWxsIGJlIGluamVjdGVkIGludG8gdGhlIGRpcmVjdGl2ZS5cbiAgICpcbiAgICogQ29udGVudCBxdWVyaWVzIGFyZSBzZXQgYmVmb3JlIHRoZSBgbmdBZnRlckNvbnRlbnRJbml0YCBjYWxsYmFjayBpcyBjYWxsZWQuXG4gICAqIFZpZXcgcXVlcmllcyBhcmUgc2V0IGJlZm9yZSB0aGUgYG5nQWZ0ZXJWaWV3SW5pdGAgY2FsbGJhY2sgaXMgY2FsbGVkLlxuICAgKlxuICAgKiAjIyMgRXhhbXBsZVxuICAgKlxuICAgKiBgYGBcbiAgICogQENvbXBvbmVudCh7XG4gICAqICAgc2VsZWN0b3I6ICdzb21lRGlyJyxcbiAgICogICBxdWVyaWVzOiB7XG4gICAqICAgICBjb250ZW50Q2hpbGRyZW46IG5ldyBDb250ZW50Q2hpbGRyZW4oQ2hpbGREaXJlY3RpdmUpLFxuICAgKiAgICAgdmlld0NoaWxkcmVuOiBuZXcgVmlld0NoaWxkcmVuKENoaWxkRGlyZWN0aXZlKVxuICAgKiAgIH0sXG4gICAqICAgdGVtcGxhdGU6ICc8Y2hpbGQtZGlyZWN0aXZlPjwvY2hpbGQtZGlyZWN0aXZlPicsXG4gICAqICAgZGlyZWN0aXZlczogW0NoaWxkRGlyZWN0aXZlXVxuICAgKiB9KVxuICAgKiBjbGFzcyBTb21lRGlyIHtcbiAgICogICBjb250ZW50Q2hpbGRyZW46IFF1ZXJ5TGlzdDxDaGlsZERpcmVjdGl2ZT4sXG4gICAqICAgdmlld0NoaWxkcmVuOiBRdWVyeUxpc3Q8Q2hpbGREaXJlY3RpdmU+XG4gICAqXG4gICAqICAgbmdBZnRlckNvbnRlbnRJbml0KCkge1xuICAgKiAgICAgLy8gY29udGVudENoaWxkcmVuIGlzIHNldFxuICAgKiAgIH1cbiAgICpcbiAgICogICBuZ0FmdGVyVmlld0luaXQoKSB7XG4gICAqICAgICAvLyB2aWV3Q2hpbGRyZW4gaXMgc2V0XG4gICAqICAgfVxuICAgKiB9XG4gICAqIGBgYFxuICAgKi9cbiAgcXVlcmllczoge1trZXk6IHN0cmluZ106IGFueX07XG5cbiAgY29uc3RydWN0b3Ioe3NlbGVjdG9yLCBpbnB1dHMsIG91dHB1dHMsIHByb3BlcnRpZXMsIGV2ZW50cywgaG9zdCwgYmluZGluZ3MsIHByb3ZpZGVycywgZXhwb3J0QXMsXG4gICAgICAgICAgICAgICBxdWVyaWVzfToge1xuICAgIHNlbGVjdG9yPzogc3RyaW5nLFxuICAgIGlucHV0cz86IHN0cmluZ1tdLFxuICAgIG91dHB1dHM/OiBzdHJpbmdbXSxcbiAgICBwcm9wZXJ0aWVzPzogc3RyaW5nW10sXG4gICAgZXZlbnRzPzogc3RyaW5nW10sXG4gICAgaG9zdD86IHtba2V5OiBzdHJpbmddOiBzdHJpbmd9LFxuICAgIHByb3ZpZGVycz86IGFueVtdLFxuICAgIC8qKiBAZGVwcmVjYXRlZCAqLyBiaW5kaW5ncz86IGFueVtdLFxuICAgIGV4cG9ydEFzPzogc3RyaW5nLFxuICAgIHF1ZXJpZXM/OiB7W2tleTogc3RyaW5nXTogYW55fVxuICB9ID0ge30pIHtcbiAgICBzdXBlcigpO1xuICAgIHRoaXMuc2VsZWN0b3IgPSBzZWxlY3RvcjtcbiAgICB0aGlzLl9pbnB1dHMgPSBpbnB1dHM7XG4gICAgdGhpcy5fcHJvcGVydGllcyA9IHByb3BlcnRpZXM7XG4gICAgdGhpcy5fb3V0cHV0cyA9IG91dHB1dHM7XG4gICAgdGhpcy5fZXZlbnRzID0gZXZlbnRzO1xuICAgIHRoaXMuaG9zdCA9IGhvc3Q7XG4gICAgdGhpcy5leHBvcnRBcyA9IGV4cG9ydEFzO1xuICAgIHRoaXMucXVlcmllcyA9IHF1ZXJpZXM7XG4gICAgdGhpcy5fcHJvdmlkZXJzID0gcHJvdmlkZXJzO1xuICAgIHRoaXMuX2JpbmRpbmdzID0gYmluZGluZ3M7XG4gIH1cbn1cblxuLyoqXG4gKiBEZWNsYXJlIHJldXNhYmxlIFVJIGJ1aWxkaW5nIGJsb2NrcyBmb3IgYW4gYXBwbGljYXRpb24uXG4gKlxuICogRWFjaCBBbmd1bGFyIGNvbXBvbmVudCByZXF1aXJlcyBhIHNpbmdsZSBgQENvbXBvbmVudGAgYW5ub3RhdGlvbi4gVGhlXG4gKiBgQENvbXBvbmVudGBcbiAqIGFubm90YXRpb24gc3BlY2lmaWVzIHdoZW4gYSBjb21wb25lbnQgaXMgaW5zdGFudGlhdGVkLCBhbmQgd2hpY2ggcHJvcGVydGllcyBhbmQgaG9zdExpc3RlbmVycyBpdFxuICogYmluZHMgdG8uXG4gKlxuICogV2hlbiBhIGNvbXBvbmVudCBpcyBpbnN0YW50aWF0ZWQsIEFuZ3VsYXJcbiAqIC0gY3JlYXRlcyBhIHNoYWRvdyBET00gZm9yIHRoZSBjb21wb25lbnQuXG4gKiAtIGxvYWRzIHRoZSBzZWxlY3RlZCB0ZW1wbGF0ZSBpbnRvIHRoZSBzaGFkb3cgRE9NLlxuICogLSBjcmVhdGVzIGFsbCB0aGUgaW5qZWN0YWJsZSBvYmplY3RzIGNvbmZpZ3VyZWQgd2l0aCBgcHJvdmlkZXJzYCBhbmQgYHZpZXdQcm92aWRlcnNgLlxuICpcbiAqIEFsbCB0ZW1wbGF0ZSBleHByZXNzaW9ucyBhbmQgc3RhdGVtZW50cyBhcmUgdGhlbiBldmFsdWF0ZWQgYWdhaW5zdCB0aGUgY29tcG9uZW50IGluc3RhbmNlLlxuICpcbiAqIEZvciBkZXRhaWxzIG9uIHRoZSBgQFZpZXdgIGFubm90YXRpb24sIHNlZSB7QGxpbmsgVmlld01ldGFkYXRhfS5cbiAqXG4gKiAjIyBMaWZlY3ljbGUgaG9va3NcbiAqXG4gKiBXaGVuIHRoZSBjb21wb25lbnQgY2xhc3MgaW1wbGVtZW50cyBzb21lIHtAbGluayBhbmd1bGFyMi9saWZlY3ljbGVfaG9va3N9IHRoZSBjYWxsYmFja3MgYXJlXG4gKiBjYWxsZWQgYnkgdGhlIGNoYW5nZSBkZXRlY3Rpb24gYXQgZGVmaW5lZCBwb2ludHMgaW4gdGltZSBkdXJpbmcgdGhlIGxpZmUgb2YgdGhlIGNvbXBvbmVudC5cbiAqXG4gKiAjIyMgRXhhbXBsZVxuICpcbiAqIHtAZXhhbXBsZSBjb3JlL3RzL21ldGFkYXRhL21ldGFkYXRhLnRzIHJlZ2lvbj0nY29tcG9uZW50J31cbiAqL1xuQENPTlNUKClcbmV4cG9ydCBjbGFzcyBDb21wb25lbnRNZXRhZGF0YSBleHRlbmRzIERpcmVjdGl2ZU1ldGFkYXRhIHtcbiAgLyoqXG4gICAqIERlZmluZXMgdGhlIHVzZWQgY2hhbmdlIGRldGVjdGlvbiBzdHJhdGVneS5cbiAgICpcbiAgICogV2hlbiBhIGNvbXBvbmVudCBpcyBpbnN0YW50aWF0ZWQsIEFuZ3VsYXIgY3JlYXRlcyBhIGNoYW5nZSBkZXRlY3Rvciwgd2hpY2ggaXMgcmVzcG9uc2libGUgZm9yXG4gICAqIHByb3BhZ2F0aW5nIHRoZSBjb21wb25lbnQncyBiaW5kaW5ncy5cbiAgICpcbiAgICogVGhlIGBjaGFuZ2VEZXRlY3Rpb25gIHByb3BlcnR5IGRlZmluZXMsIHdoZXRoZXIgdGhlIGNoYW5nZSBkZXRlY3Rpb24gd2lsbCBiZSBjaGVja2VkIGV2ZXJ5IHRpbWVcbiAgICogb3Igb25seSB3aGVuIHRoZSBjb21wb25lbnQgdGVsbHMgaXQgdG8gZG8gc28uXG4gICAqL1xuICBjaGFuZ2VEZXRlY3Rpb246IENoYW5nZURldGVjdGlvblN0cmF0ZWd5O1xuXG4gIC8qKlxuICAgKiBEZWZpbmVzIHRoZSBzZXQgb2YgaW5qZWN0YWJsZSBvYmplY3RzIHRoYXQgYXJlIHZpc2libGUgdG8gaXRzIHZpZXcgRE9NIGNoaWxkcmVuLlxuICAgKlxuICAgKiAjIyBTaW1wbGUgRXhhbXBsZVxuICAgKlxuICAgKiBIZXJlIGlzIGFuIGV4YW1wbGUgb2YgYSBjbGFzcyB0aGF0IGNhbiBiZSBpbmplY3RlZDpcbiAgICpcbiAgICogYGBgXG4gICAqIGNsYXNzIEdyZWV0ZXIge1xuICAgKiAgICBncmVldChuYW1lOnN0cmluZykge1xuICAgKiAgICAgIHJldHVybiAnSGVsbG8gJyArIG5hbWUgKyAnISc7XG4gICAqICAgIH1cbiAgICogfVxuICAgKlxuICAgKiBARGlyZWN0aXZlKHtcbiAgICogICBzZWxlY3RvcjogJ25lZWRzLWdyZWV0ZXInXG4gICAqIH0pXG4gICAqIGNsYXNzIE5lZWRzR3JlZXRlciB7XG4gICAqICAgZ3JlZXRlcjpHcmVldGVyO1xuICAgKlxuICAgKiAgIGNvbnN0cnVjdG9yKGdyZWV0ZXI6R3JlZXRlcikge1xuICAgKiAgICAgdGhpcy5ncmVldGVyID0gZ3JlZXRlcjtcbiAgICogICB9XG4gICAqIH1cbiAgICpcbiAgICogQENvbXBvbmVudCh7XG4gICAqICAgc2VsZWN0b3I6ICdncmVldCcsXG4gICAqICAgdmlld1Byb3ZpZGVyczogW1xuICAgKiAgICAgR3JlZXRlclxuICAgKiAgIF0sXG4gICAqICAgdGVtcGxhdGU6IGA8bmVlZHMtZ3JlZXRlcj48L25lZWRzLWdyZWV0ZXI+YCxcbiAgICogICBkaXJlY3RpdmVzOiBbTmVlZHNHcmVldGVyXVxuICAgKiB9KVxuICAgKiBjbGFzcyBIZWxsb1dvcmxkIHtcbiAgICogfVxuICAgKlxuICAgKiBgYGBcbiAgICovXG4gIGdldCB2aWV3UHJvdmlkZXJzKCk6IGFueVtdIHtcbiAgICByZXR1cm4gaXNQcmVzZW50KHRoaXMuX3ZpZXdCaW5kaW5ncykgJiYgdGhpcy5fdmlld0JpbmRpbmdzLmxlbmd0aCA+IDAgPyB0aGlzLl92aWV3QmluZGluZ3MgOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuX3ZpZXdQcm92aWRlcnM7XG4gIH1cbiAgZ2V0IHZpZXdCaW5kaW5ncygpOiBhbnlbXSB7IHJldHVybiB0aGlzLnZpZXdQcm92aWRlcnM7IH1cbiAgcHJpdmF0ZSBfdmlld1Byb3ZpZGVyczogYW55W107XG4gIHByaXZhdGUgX3ZpZXdCaW5kaW5nczogYW55W107XG5cbiAgLyoqXG4gICAqIFRoZSBtb2R1bGUgaWQgb2YgdGhlIG1vZHVsZSB0aGF0IGNvbnRhaW5zIHRoZSBjb21wb25lbnQuXG4gICAqIE5lZWRlZCB0byBiZSBhYmxlIHRvIHJlc29sdmUgcmVsYXRpdmUgdXJscyBmb3IgdGVtcGxhdGVzIGFuZCBzdHlsZXMuXG4gICAqIEluIERhcnQsIHRoaXMgY2FuIGJlIGRldGVybWluZWQgYXV0b21hdGljYWxseSBhbmQgZG9lcyBub3QgbmVlZCB0byBiZSBzZXQuXG4gICAqIEluIENvbW1vbkpTLCB0aGlzIGNhbiBhbHdheXMgYmUgc2V0IHRvIGBtb2R1bGUuaWRgLlxuICAgKlxuICAgKiAjIyBTaW1wbGUgRXhhbXBsZVxuICAgKlxuICAgKiBgYGBcbiAgICogQERpcmVjdGl2ZSh7XG4gICAqICAgc2VsZWN0b3I6ICdzb21lRGlyJyxcbiAgICogICBtb2R1bGVJZDogbW9kdWxlLmlkXG4gICAqIH0pXG4gICAqIGNsYXNzIFNvbWVEaXIge1xuICAgKiB9XG4gICAqXG4gICAqIGBgYFxuICAgKi9cbiAgbW9kdWxlSWQ6IHN0cmluZztcblxuICB0ZW1wbGF0ZVVybDogc3RyaW5nO1xuXG4gIHRlbXBsYXRlOiBzdHJpbmc7XG5cbiAgc3R5bGVVcmxzOiBzdHJpbmdbXTtcblxuICBzdHlsZXM6IHN0cmluZ1tdO1xuXG4gIGRpcmVjdGl2ZXM6IEFycmF5PFR5cGUgfCBhbnlbXT47XG5cbiAgcGlwZXM6IEFycmF5PFR5cGUgfCBhbnlbXT47XG5cbiAgZW5jYXBzdWxhdGlvbjogVmlld0VuY2Fwc3VsYXRpb247XG5cbiAgY29uc3RydWN0b3Ioe3NlbGVjdG9yLCBpbnB1dHMsIG91dHB1dHMsIHByb3BlcnRpZXMsIGV2ZW50cywgaG9zdCwgZXhwb3J0QXMsIG1vZHVsZUlkLCBiaW5kaW5ncyxcbiAgICAgICAgICAgICAgIHByb3ZpZGVycywgdmlld0JpbmRpbmdzLCB2aWV3UHJvdmlkZXJzLFxuICAgICAgICAgICAgICAgY2hhbmdlRGV0ZWN0aW9uID0gQ2hhbmdlRGV0ZWN0aW9uU3RyYXRlZ3kuRGVmYXVsdCwgcXVlcmllcywgdGVtcGxhdGVVcmwsIHRlbXBsYXRlLFxuICAgICAgICAgICAgICAgc3R5bGVVcmxzLCBzdHlsZXMsIGRpcmVjdGl2ZXMsIHBpcGVzLCBlbmNhcHN1bGF0aW9ufToge1xuICAgIHNlbGVjdG9yPzogc3RyaW5nLFxuICAgIGlucHV0cz86IHN0cmluZ1tdLFxuICAgIG91dHB1dHM/OiBzdHJpbmdbXSxcbiAgICBwcm9wZXJ0aWVzPzogc3RyaW5nW10sXG4gICAgZXZlbnRzPzogc3RyaW5nW10sXG4gICAgaG9zdD86IHtba2V5OiBzdHJpbmddOiBzdHJpbmd9LFxuICAgIC8qKiBAZGVwcmVjYXRlZCAqLyBiaW5kaW5ncz86IGFueVtdLFxuICAgIHByb3ZpZGVycz86IGFueVtdLFxuICAgIGV4cG9ydEFzPzogc3RyaW5nLFxuICAgIG1vZHVsZUlkPzogc3RyaW5nLFxuICAgIC8qKiBAZGVwcmVjYXRlZCAqLyB2aWV3QmluZGluZ3M/OiBhbnlbXSxcbiAgICB2aWV3UHJvdmlkZXJzPzogYW55W10sXG4gICAgcXVlcmllcz86IHtba2V5OiBzdHJpbmddOiBhbnl9LFxuICAgIGNoYW5nZURldGVjdGlvbj86IENoYW5nZURldGVjdGlvblN0cmF0ZWd5LFxuICAgIHRlbXBsYXRlVXJsPzogc3RyaW5nLFxuICAgIHRlbXBsYXRlPzogc3RyaW5nLFxuICAgIHN0eWxlVXJscz86IHN0cmluZ1tdLFxuICAgIHN0eWxlcz86IHN0cmluZ1tdLFxuICAgIGRpcmVjdGl2ZXM/OiBBcnJheTxUeXBlIHwgYW55W10+LFxuICAgIHBpcGVzPzogQXJyYXk8VHlwZSB8IGFueVtdPixcbiAgICBlbmNhcHN1bGF0aW9uPzogVmlld0VuY2Fwc3VsYXRpb25cbiAgfSA9IHt9KSB7XG4gICAgc3VwZXIoe1xuICAgICAgc2VsZWN0b3I6IHNlbGVjdG9yLFxuICAgICAgaW5wdXRzOiBpbnB1dHMsXG4gICAgICBvdXRwdXRzOiBvdXRwdXRzLFxuICAgICAgcHJvcGVydGllczogcHJvcGVydGllcyxcbiAgICAgIGV2ZW50czogZXZlbnRzLFxuICAgICAgaG9zdDogaG9zdCxcbiAgICAgIGV4cG9ydEFzOiBleHBvcnRBcyxcbiAgICAgIGJpbmRpbmdzOiBiaW5kaW5ncyxcbiAgICAgIHByb3ZpZGVyczogcHJvdmlkZXJzLFxuICAgICAgcXVlcmllczogcXVlcmllc1xuICAgIH0pO1xuXG4gICAgdGhpcy5jaGFuZ2VEZXRlY3Rpb24gPSBjaGFuZ2VEZXRlY3Rpb247XG4gICAgdGhpcy5fdmlld1Byb3ZpZGVycyA9IHZpZXdQcm92aWRlcnM7XG4gICAgdGhpcy5fdmlld0JpbmRpbmdzID0gdmlld0JpbmRpbmdzO1xuICAgIHRoaXMudGVtcGxhdGVVcmwgPSB0ZW1wbGF0ZVVybDtcbiAgICB0aGlzLnRlbXBsYXRlID0gdGVtcGxhdGU7XG4gICAgdGhpcy5zdHlsZVVybHMgPSBzdHlsZVVybHM7XG4gICAgdGhpcy5zdHlsZXMgPSBzdHlsZXM7XG4gICAgdGhpcy5kaXJlY3RpdmVzID0gZGlyZWN0aXZlcztcbiAgICB0aGlzLnBpcGVzID0gcGlwZXM7XG4gICAgdGhpcy5lbmNhcHN1bGF0aW9uID0gZW5jYXBzdWxhdGlvbjtcbiAgICB0aGlzLm1vZHVsZUlkID0gbW9kdWxlSWQ7XG4gIH1cbn1cblxuLyoqXG4gKiBEZWNsYXJlIHJldXNhYmxlIHBpcGUgZnVuY3Rpb24uXG4gKlxuICogQSBcInB1cmVcIiBwaXBlIGlzIG9ubHkgcmUtZXZhbHVhdGVkIHdoZW4gZWl0aGVyIHRoZSBpbnB1dCBvciBhbnkgb2YgdGhlIGFyZ3VtZW50cyBjaGFuZ2UuXG4gKlxuICogV2hlbiBub3Qgc3BlY2lmaWVkLCBwaXBlcyBkZWZhdWx0IHRvIGJlaW5nIHB1cmUuXG4gKlxuICogIyMjIEV4YW1wbGVcbiAqXG4gKiB7QGV4YW1wbGUgY29yZS90cy9tZXRhZGF0YS9tZXRhZGF0YS50cyByZWdpb249J3BpcGUnfVxuICovXG5AQ09OU1QoKVxuZXhwb3J0IGNsYXNzIFBpcGVNZXRhZGF0YSBleHRlbmRzIEluamVjdGFibGVNZXRhZGF0YSB7XG4gIG5hbWU6IHN0cmluZztcbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBfcHVyZTogYm9vbGVhbjtcblxuICBjb25zdHJ1Y3Rvcih7bmFtZSwgcHVyZX06IHtuYW1lOiBzdHJpbmcsIHB1cmU/OiBib29sZWFufSkge1xuICAgIHN1cGVyKCk7XG4gICAgdGhpcy5uYW1lID0gbmFtZTtcbiAgICB0aGlzLl9wdXJlID0gcHVyZTtcbiAgfVxuXG4gIGdldCBwdXJlKCk6IGJvb2xlYW4geyByZXR1cm4gaXNQcmVzZW50KHRoaXMuX3B1cmUpID8gdGhpcy5fcHVyZSA6IHRydWU7IH1cbn1cblxuLyoqXG4gKiBEZWNsYXJlcyBhIGRhdGEtYm91bmQgaW5wdXQgcHJvcGVydHkuXG4gKlxuICogQW5ndWxhciBhdXRvbWF0aWNhbGx5IHVwZGF0ZXMgZGF0YS1ib3VuZCBwcm9wZXJ0aWVzIGR1cmluZyBjaGFuZ2UgZGV0ZWN0aW9uLlxuICpcbiAqIGBJbnB1dE1ldGFkYXRhYCB0YWtlcyBhbiBvcHRpb25hbCBwYXJhbWV0ZXIgdGhhdCBzcGVjaWZpZXMgdGhlIG5hbWVcbiAqIHVzZWQgd2hlbiBpbnN0YW50aWF0aW5nIGEgY29tcG9uZW50IGluIHRoZSB0ZW1wbGF0ZS4gV2hlbiBub3QgcHJvdmlkZWQsXG4gKiB0aGUgbmFtZSBvZiB0aGUgZGVjb3JhdGVkIHByb3BlcnR5IGlzIHVzZWQuXG4gKlxuICogIyMjIEV4YW1wbGVcbiAqXG4gKiBUaGUgZm9sbG93aW5nIGV4YW1wbGUgY3JlYXRlcyBhIGNvbXBvbmVudCB3aXRoIHR3byBpbnB1dCBwcm9wZXJ0aWVzLlxuICpcbiAqIGBgYHR5cGVzY3JpcHRcbiAqIEBDb21wb25lbnQoe1xuICogICBzZWxlY3RvcjogJ2JhbmstYWNjb3VudCcsXG4gKiAgIHRlbXBsYXRlOiBgXG4gKiAgICAgQmFuayBOYW1lOiB7e2JhbmtOYW1lfX1cbiAqICAgICBBY2NvdW50IElkOiB7e2lkfX1cbiAqICAgYFxuICogfSlcbiAqIGNsYXNzIEJhbmtBY2NvdW50IHtcbiAqICAgQElucHV0KCkgYmFua05hbWU6IHN0cmluZztcbiAqICAgQElucHV0KCdhY2NvdW50LWlkJykgaWQ6IHN0cmluZztcbiAqXG4gKiAgIC8vIHRoaXMgcHJvcGVydHkgaXMgbm90IGJvdW5kLCBhbmQgd29uJ3QgYmUgYXV0b21hdGljYWxseSB1cGRhdGVkIGJ5IEFuZ3VsYXJcbiAqICAgbm9ybWFsaXplZEJhbmtOYW1lOiBzdHJpbmc7XG4gKiB9XG4gKlxuICogQENvbXBvbmVudCh7XG4gKiAgIHNlbGVjdG9yOiAnYXBwJyxcbiAqICAgdGVtcGxhdGU6IGBcbiAqICAgICA8YmFuay1hY2NvdW50IGJhbmstbmFtZT1cIlJCQ1wiIGFjY291bnQtaWQ9XCI0NzQ3XCI+PC9iYW5rLWFjY291bnQ+XG4gKiAgIGAsXG4gKiAgIGRpcmVjdGl2ZXM6IFtCYW5rQWNjb3VudF1cbiAqIH0pXG4gKiBjbGFzcyBBcHAge31cbiAqXG4gKiBib290c3RyYXAoQXBwKTtcbiAqIGBgYFxuICovXG5AQ09OU1QoKVxuZXhwb3J0IGNsYXNzIElucHV0TWV0YWRhdGEge1xuICBjb25zdHJ1Y3RvcihcbiAgICAgIC8qKlxuICAgICAgICogTmFtZSB1c2VkIHdoZW4gaW5zdGFudGlhdGluZyBhIGNvbXBvbmVudCBpbiB0aGUgdGVtbGF0ZS5cbiAgICAgICAqL1xuICAgICAgcHVibGljIGJpbmRpbmdQcm9wZXJ0eU5hbWU/OiBzdHJpbmcpIHt9XG59XG5cbi8qKlxuICogRGVjbGFyZXMgYW4gZXZlbnQtYm91bmQgb3V0cHV0IHByb3BlcnR5LlxuICpcbiAqIFdoZW4gYW4gb3V0cHV0IHByb3BlcnR5IGVtaXRzIGFuIGV2ZW50LCBhbiBldmVudCBoYW5kbGVyIGF0dGFjaGVkIHRvIHRoYXQgZXZlbnRcbiAqIHRoZSB0ZW1wbGF0ZSBpcyBpbnZva2VkLlxuICpcbiAqIGBPdXRwdXRNZXRhZGF0YWAgdGFrZXMgYW4gb3B0aW9uYWwgcGFyYW1ldGVyIHRoYXQgc3BlY2lmaWVzIHRoZSBuYW1lXG4gKiB1c2VkIHdoZW4gaW5zdGFudGlhdGluZyBhIGNvbXBvbmVudCBpbiB0aGUgdGVtcGxhdGUuIFdoZW4gbm90IHByb3ZpZGVkLFxuICogdGhlIG5hbWUgb2YgdGhlIGRlY29yYXRlZCBwcm9wZXJ0eSBpcyB1c2VkLlxuICpcbiAqICMjIyBFeGFtcGxlXG4gKlxuICogYGBgdHlwZXNjcmlwdFxuICogQERpcmVjdGl2ZSh7XG4gKiAgIHNlbGVjdG9yOiAnaW50ZXJ2YWwtZGlyJyxcbiAqIH0pXG4gKiBjbGFzcyBJbnRlcnZhbERpciB7XG4gKiAgIEBPdXRwdXQoKSBldmVyeVNlY29uZCA9IG5ldyBFdmVudEVtaXR0ZXIoKTtcbiAqICAgQE91dHB1dCgnZXZlcnlGaXZlU2Vjb25kcycpIGZpdmU1U2VjcyA9IG5ldyBFdmVudEVtaXR0ZXIoKTtcbiAqXG4gKiAgIGNvbnN0cnVjdG9yKCkge1xuICogICAgIHNldEludGVydmFsKCgpID0+IHRoaXMuZXZlcnlTZWNvbmQuZW1pdChcImV2ZW50XCIpLCAxMDAwKTtcbiAqICAgICBzZXRJbnRlcnZhbCgoKSA9PiB0aGlzLmZpdmU1U2Vjcy5lbWl0KFwiZXZlbnRcIiksIDUwMDApO1xuICogICB9XG4gKiB9XG4gKlxuICogQENvbXBvbmVudCh7XG4gKiAgIHNlbGVjdG9yOiAnYXBwJyxcbiAqICAgdGVtcGxhdGU6IGBcbiAqICAgICA8aW50ZXJ2YWwtZGlyIChldmVyeS1zZWNvbmQpPVwiZXZlcnlTZWNvbmQoKVwiIChldmVyeS1maXZlLXNlY29uZHMpPVwiZXZlcnlGaXZlU2Vjb25kcygpXCI+XG4gKiAgICAgPC9pbnRlcnZhbC1kaXI+XG4gKiAgIGAsXG4gKiAgIGRpcmVjdGl2ZXM6IFtJbnRlcnZhbERpcl1cbiAqIH0pXG4gKiBjbGFzcyBBcHAge1xuICogICBldmVyeVNlY29uZCgpIHsgY29uc29sZS5sb2coJ3NlY29uZCcpOyB9XG4gKiAgIGV2ZXJ5Rml2ZVNlY29uZHMoKSB7IGNvbnNvbGUubG9nKCdmaXZlIHNlY29uZHMnKTsgfVxuICogfVxuICogYm9vdHN0cmFwKEFwcCk7XG4gKiBgYGBcbiAqL1xuQENPTlNUKClcbmV4cG9ydCBjbGFzcyBPdXRwdXRNZXRhZGF0YSB7XG4gIGNvbnN0cnVjdG9yKHB1YmxpYyBiaW5kaW5nUHJvcGVydHlOYW1lPzogc3RyaW5nKSB7fVxufVxuXG4vKipcbiAqIERlY2xhcmVzIGEgaG9zdCBwcm9wZXJ0eSBiaW5kaW5nLlxuICpcbiAqIEFuZ3VsYXIgYXV0b21hdGljYWxseSBjaGVja3MgaG9zdCBwcm9wZXJ0eSBiaW5kaW5ncyBkdXJpbmcgY2hhbmdlIGRldGVjdGlvbi5cbiAqIElmIGEgYmluZGluZyBjaGFuZ2VzLCBpdCB3aWxsIHVwZGF0ZSB0aGUgaG9zdCBlbGVtZW50IG9mIHRoZSBkaXJlY3RpdmUuXG4gKlxuICogYEhvc3RCaW5kaW5nTWV0YWRhdGFgIHRha2VzIGFuIG9wdGlvbmFsIHBhcmFtZXRlciB0aGF0IHNwZWNpZmllcyB0aGUgcHJvcGVydHlcbiAqIG5hbWUgb2YgdGhlIGhvc3QgZWxlbWVudCB0aGF0IHdpbGwgYmUgdXBkYXRlZC4gV2hlbiBub3QgcHJvdmlkZWQsXG4gKiB0aGUgY2xhc3MgcHJvcGVydHkgbmFtZSBpcyB1c2VkLlxuICpcbiAqICMjIyBFeGFtcGxlXG4gKlxuICogVGhlIGZvbGxvd2luZyBleGFtcGxlIGNyZWF0ZXMgYSBkaXJlY3RpdmUgdGhhdCBzZXRzIHRoZSBgdmFsaWRgIGFuZCBgaW52YWxpZGAgY2xhc3Nlc1xuICogb24gdGhlIERPTSBlbGVtZW50IHRoYXQgaGFzIG5nTW9kZWwgZGlyZWN0aXZlIG9uIGl0LlxuICpcbiAqIGBgYHR5cGVzY3JpcHRcbiAqIEBEaXJlY3RpdmUoe3NlbGVjdG9yOiAnW25nTW9kZWxdJ30pXG4gKiBjbGFzcyBOZ01vZGVsU3RhdHVzIHtcbiAqICAgY29uc3RydWN0b3IocHVibGljIGNvbnRyb2w6TmdNb2RlbCkge31cbiAqICAgQEhvc3RCaW5kaW5nKCdbY2xhc3MudmFsaWRdJykgZ2V0IHZhbGlkIHsgcmV0dXJuIHRoaXMuY29udHJvbC52YWxpZDsgfVxuICogICBASG9zdEJpbmRpbmcoJ1tjbGFzcy5pbnZhbGlkXScpIGdldCBpbnZhbGlkIHsgcmV0dXJuIHRoaXMuY29udHJvbC5pbnZhbGlkOyB9XG4gKiB9XG4gKlxuICogQENvbXBvbmVudCh7XG4gKiAgIHNlbGVjdG9yOiAnYXBwJyxcbiAqICAgdGVtcGxhdGU6IGA8aW5wdXQgWyhuZ01vZGVsKV09XCJwcm9wXCI+YCxcbiAqICAgZGlyZWN0aXZlczogW0ZPUk1fRElSRUNUSVZFUywgTmdNb2RlbFN0YXR1c11cbiAqIH0pXG4gKiBjbGFzcyBBcHAge1xuICogICBwcm9wO1xuICogfVxuICpcbiAqIGJvb3RzdHJhcChBcHApO1xuICogYGBgXG4gKi9cbkBDT05TVCgpXG5leHBvcnQgY2xhc3MgSG9zdEJpbmRpbmdNZXRhZGF0YSB7XG4gIGNvbnN0cnVjdG9yKHB1YmxpYyBob3N0UHJvcGVydHlOYW1lPzogc3RyaW5nKSB7fVxufVxuXG4vKipcbiAqIERlY2xhcmVzIGEgaG9zdCBsaXN0ZW5lci5cbiAqXG4gKiBBbmd1bGFyIHdpbGwgaW52b2tlIHRoZSBkZWNvcmF0ZWQgbWV0aG9kIHdoZW4gdGhlIGhvc3QgZWxlbWVudCBlbWl0cyB0aGUgc3BlY2lmaWVkIGV2ZW50LlxuICpcbiAqIElmIHRoZSBkZWNvcmF0ZWQgbWV0aG9kIHJldHVybnMgYGZhbHNlYCwgdGhlbiBgcHJldmVudERlZmF1bHRgIGlzIGFwcGxpZWQgb24gdGhlIERPTVxuICogZXZlbnQuXG4gKlxuICogIyMjIEV4YW1wbGVcbiAqXG4gKiBUaGUgZm9sbG93aW5nIGV4YW1wbGUgZGVjbGFyZXMgYSBkaXJlY3RpdmUgdGhhdCBhdHRhY2hlcyBhIGNsaWNrIGxpc3RlbmVyIHRvIHRoZSBidXR0b24gYW5kXG4gKiBjb3VudHMgY2xpY2tzLlxuICpcbiAqIGBgYHR5cGVzY3JpcHRcbiAqIEBEaXJlY3RpdmUoe3NlbGVjdG9yOiAnYnV0dG9uW2NvdW50aW5nXSd9KVxuICogY2xhc3MgQ291bnRDbGlja3Mge1xuICogICBudW1iZXJPZkNsaWNrcyA9IDA7XG4gKlxuICogICBASG9zdExpc3RlbmVyKCdjbGljaycsIFsnJGV2ZW50LnRhcmdldCddKVxuICogICBvbkNsaWNrKGJ0bikge1xuICogICAgIGNvbnNvbGUubG9nKFwiYnV0dG9uXCIsIGJ0biwgXCJudW1iZXIgb2YgY2xpY2tzOlwiLCB0aGlzLm51bWJlck9mQ2xpY2tzKyspO1xuICogICB9XG4gKiB9XG4gKlxuICogQENvbXBvbmVudCh7XG4gKiAgIHNlbGVjdG9yOiAnYXBwJyxcbiAqICAgdGVtcGxhdGU6IGA8YnV0dG9uIGNvdW50aW5nPkluY3JlbWVudDwvYnV0dG9uPmAsXG4gKiAgIGRpcmVjdGl2ZXM6IFtDb3VudENsaWNrc11cbiAqIH0pXG4gKiBjbGFzcyBBcHAge31cbiAqXG4gKiBib290c3RyYXAoQXBwKTtcbiAqIGBgYFxuICovXG5AQ09OU1QoKVxuZXhwb3J0IGNsYXNzIEhvc3RMaXN0ZW5lck1ldGFkYXRhIHtcbiAgY29uc3RydWN0b3IocHVibGljIGV2ZW50TmFtZTogc3RyaW5nLCBwdWJsaWMgYXJncz86IHN0cmluZ1tdKSB7fVxufVxuIl19