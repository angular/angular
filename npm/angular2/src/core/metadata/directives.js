'use strict';"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
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
 * @ts2dart_const
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
    return DirectiveMetadata;
}(metadata_1.InjectableMetadata));
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
 * When the component class implements some {@link ../../guide/lifecycle-hooks.html} the callbacks
 * are called by the change detection at defined points in time during the life of the component.
 *
 * ### Example
 *
 * {@example core/ts/metadata/metadata.ts region='component'}
 * @ts2dart_const
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
    return ComponentMetadata;
}(DirectiveMetadata));
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
 * @ts2dart_const
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
    return PipeMetadata;
}(metadata_1.InjectableMetadata));
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
 * @ts2dart_const
 */
var InputMetadata = (function () {
    function InputMetadata(
        /**
         * Name used when instantiating a component in the template.
         */
        bindingPropertyName) {
        this.bindingPropertyName = bindingPropertyName;
    }
    return InputMetadata;
}());
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
 * @ts2dart_const
 */
var OutputMetadata = (function () {
    function OutputMetadata(bindingPropertyName) {
        this.bindingPropertyName = bindingPropertyName;
    }
    return OutputMetadata;
}());
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
 *   @HostBinding('class.valid') get valid { return this.control.valid; }
 *   @HostBinding('class.invalid') get invalid { return this.control.invalid; }
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
 * @ts2dart_const
 */
var HostBindingMetadata = (function () {
    function HostBindingMetadata(hostPropertyName) {
        this.hostPropertyName = hostPropertyName;
    }
    return HostBindingMetadata;
}());
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
 * @ts2dart_const
 */
var HostListenerMetadata = (function () {
    function HostListenerMetadata(eventName, args) {
        this.eventName = eventName;
        this.args = args;
    }
    return HostListenerMetadata;
}());
exports.HostListenerMetadata = HostListenerMetadata;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGlyZWN0aXZlcy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImRpZmZpbmdfcGx1Z2luX3dyYXBwZXItb3V0cHV0X3BhdGgtcjVQckpLOWgudG1wL2FuZ3VsYXIyL3NyYy9jb3JlL21ldGFkYXRhL2RpcmVjdGl2ZXMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBQUEscUJBQThCLDBCQUEwQixDQUFDLENBQUE7QUFDekQseUJBQWlDLCtCQUErQixDQUFDLENBQUE7QUFDakUsaUNBQXNDLG9DQUFvQyxDQUFDLENBQUE7QUFHM0U7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztHQTBYRztBQUNIO0lBQXVDLHFDQUFrQjtJQTZWdkQsMkJBQVksRUFZTjtZQVpNLDRCQVlOLEVBWk8sc0JBQVEsRUFBRSxrQkFBTSxFQUFFLG9CQUFPLEVBQUUsMEJBQVUsRUFBRSxrQkFBTSxFQUFFLGNBQUksRUFBRSxzQkFBUSxFQUFFLHdCQUFTLEVBQUUsc0JBQVEsRUFDbEYsb0JBQU87UUFZbEIsaUJBQU8sQ0FBQztRQUNSLElBQUksQ0FBQyxRQUFRLEdBQUcsUUFBUSxDQUFDO1FBQ3pCLElBQUksQ0FBQyxPQUFPLEdBQUcsTUFB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UUFBekMsY0FBUyxHQUFULFNBQVMsQ0FBUTtRQUFTLFNBQUksR0FBSixJQUFJLENBQVc7SUFBRyxDQUFDO0lBQ2xFLDJCQUFDO0FBQUQsQ0FBQyxBQUZELElBRUM7QUFGWSw0QkFBb0IsdUJBRWhDLENBQUEiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge2lzUHJlc2VudCwgVHlwZX0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9sYW5nJztcbmltcG9ydCB7SW5qZWN0YWJsZU1ldGFkYXRhfSBmcm9tICdhbmd1bGFyMi9zcmMvY29yZS9kaS9tZXRhZGF0YSc7XG5pbXBvcnQge0NoYW5nZURldGVjdGlvblN0cmF0ZWd5fSBmcm9tICdhbmd1bGFyMi9zcmMvY29yZS9jaGFuZ2VfZGV0ZWN0aW9uJztcbmltcG9ydCB7Vmlld0VuY2Fwc3VsYXRpb259IGZyb20gJ2FuZ3VsYXIyL3NyYy9jb3JlL21ldGFkYXRhL3ZpZXcnO1xuXG4vKipcbiAqIERpcmVjdGl2ZXMgYWxsb3cgeW91IHRvIGF0dGFjaCBiZWhhdmlvciB0byBlbGVtZW50cyBpbiB0aGUgRE9NLlxuICpcbiAqIHtAbGluayBEaXJlY3RpdmVNZXRhZGF0YX1zIHdpdGggYW4gZW1iZWRkZWQgdmlldyBhcmUgY2FsbGVkIHtAbGluayBDb21wb25lbnRNZXRhZGF0YX1zLlxuICpcbiAqIEEgZGlyZWN0aXZlIGNvbnNpc3RzIG9mIGEgc2luZ2xlIGRpcmVjdGl2ZSBhbm5vdGF0aW9uIGFuZCBhIGNvbnRyb2xsZXIgY2xhc3MuIFdoZW4gdGhlXG4gKiBkaXJlY3RpdmUncyBgc2VsZWN0b3JgIG1hdGNoZXNcbiAqIGVsZW1lbnRzIGluIHRoZSBET00sIHRoZSBmb2xsb3dpbmcgc3RlcHMgb2NjdXI6XG4gKlxuICogMS4gRm9yIGVhY2ggZGlyZWN0aXZlLCB0aGUgYEVsZW1lbnRJbmplY3RvcmAgYXR0ZW1wdHMgdG8gcmVzb2x2ZSB0aGUgZGlyZWN0aXZlJ3MgY29uc3RydWN0b3JcbiAqIGFyZ3VtZW50cy5cbiAqIDIuIEFuZ3VsYXIgaW5zdGFudGlhdGVzIGRpcmVjdGl2ZXMgZm9yIGVhY2ggbWF0Y2hlZCBlbGVtZW50IHVzaW5nIGBFbGVtZW50SW5qZWN0b3JgIGluIGFcbiAqIGRlcHRoLWZpcnN0IG9yZGVyLFxuICogICAgYXMgZGVjbGFyZWQgaW4gdGhlIEhUTUwuXG4gKlxuICogIyMgVW5kZXJzdGFuZGluZyBIb3cgSW5qZWN0aW9uIFdvcmtzXG4gKlxuICogVGhlcmUgYXJlIHRocmVlIHN0YWdlcyBvZiBpbmplY3Rpb24gcmVzb2x1dGlvbi5cbiAqIC0gKlByZS1leGlzdGluZyBJbmplY3RvcnMqOlxuICogICAtIFRoZSB0ZXJtaW5hbCB7QGxpbmsgSW5qZWN0b3J9IGNhbm5vdCByZXNvbHZlIGRlcGVuZGVuY2llcy4gSXQgZWl0aGVyIHRocm93cyBhbiBlcnJvciBvciwgaWZcbiAqIHRoZSBkZXBlbmRlbmN5IHdhc1xuICogICAgIHNwZWNpZmllZCBhcyBgQE9wdGlvbmFsYCwgcmV0dXJucyBgbnVsbGAuXG4gKiAgIC0gVGhlIHBsYXRmb3JtIGluamVjdG9yIHJlc29sdmVzIGJyb3dzZXIgc2luZ2xldG9uIHJlc291cmNlcywgc3VjaCBhczogY29va2llcywgdGl0bGUsXG4gKiBsb2NhdGlvbiwgYW5kIG90aGVycy5cbiAqIC0gKkNvbXBvbmVudCBJbmplY3RvcnMqOiBFYWNoIGNvbXBvbmVudCBpbnN0YW5jZSBoYXMgaXRzIG93biB7QGxpbmsgSW5qZWN0b3J9LCBhbmQgdGhleSBmb2xsb3dcbiAqIHRoZSBzYW1lIHBhcmVudC1jaGlsZCBoaWVyYXJjaHlcbiAqICAgICBhcyB0aGUgY29tcG9uZW50IGluc3RhbmNlcyBpbiB0aGUgRE9NLlxuICogLSAqRWxlbWVudCBJbmplY3RvcnMqOiBFYWNoIGNvbXBvbmVudCBpbnN0YW5jZSBoYXMgYSBTaGFkb3cgRE9NLiBXaXRoaW4gdGhlIFNoYWRvdyBET00gZWFjaFxuICogZWxlbWVudCBoYXMgYW4gYEVsZW1lbnRJbmplY3RvcmBcbiAqICAgICB3aGljaCBmb2xsb3cgdGhlIHNhbWUgcGFyZW50LWNoaWxkIGhpZXJhcmNoeSBhcyB0aGUgRE9NIGVsZW1lbnRzIHRoZW1zZWx2ZXMuXG4gKlxuICogV2hlbiBhIHRlbXBsYXRlIGlzIGluc3RhbnRpYXRlZCwgaXQgYWxzbyBtdXN0IGluc3RhbnRpYXRlIHRoZSBjb3JyZXNwb25kaW5nIGRpcmVjdGl2ZXMgaW4gYVxuICogZGVwdGgtZmlyc3Qgb3JkZXIuIFRoZVxuICogY3VycmVudCBgRWxlbWVudEluamVjdG9yYCByZXNvbHZlcyB0aGUgY29uc3RydWN0b3IgZGVwZW5kZW5jaWVzIGZvciBlYWNoIGRpcmVjdGl2ZS5cbiAqXG4gKiBBbmd1bGFyIHRoZW4gcmVzb2x2ZXMgZGVwZW5kZW5jaWVzIGFzIGZvbGxvd3MsIGFjY29yZGluZyB0byB0aGUgb3JkZXIgaW4gd2hpY2ggdGhleSBhcHBlYXIgaW4gdGhlXG4gKiB7QGxpbmsgVmlld01ldGFkYXRhfTpcbiAqXG4gKiAxLiBEZXBlbmRlbmNpZXMgb24gdGhlIGN1cnJlbnQgZWxlbWVudFxuICogMi4gRGVwZW5kZW5jaWVzIG9uIGVsZW1lbnQgaW5qZWN0b3JzIGFuZCB0aGVpciBwYXJlbnRzIHVudGlsIGl0IGVuY291bnRlcnMgYSBTaGFkb3cgRE9NIGJvdW5kYXJ5XG4gKiAzLiBEZXBlbmRlbmNpZXMgb24gY29tcG9uZW50IGluamVjdG9ycyBhbmQgdGhlaXIgcGFyZW50cyB1bnRpbCBpdCBlbmNvdW50ZXJzIHRoZSByb290IGNvbXBvbmVudFxuICogNC4gRGVwZW5kZW5jaWVzIG9uIHByZS1leGlzdGluZyBpbmplY3RvcnNcbiAqXG4gKlxuICogVGhlIGBFbGVtZW50SW5qZWN0b3JgIGNhbiBpbmplY3Qgb3RoZXIgZGlyZWN0aXZlcywgZWxlbWVudC1zcGVjaWZpYyBzcGVjaWFsIG9iamVjdHMsIG9yIGl0IGNhblxuICogZGVsZWdhdGUgdG8gdGhlIHBhcmVudFxuICogaW5qZWN0b3IuXG4gKlxuICogVG8gaW5qZWN0IG90aGVyIGRpcmVjdGl2ZXMsIGRlY2xhcmUgdGhlIGNvbnN0cnVjdG9yIHBhcmFtZXRlciBhczpcbiAqIC0gYGRpcmVjdGl2ZTpEaXJlY3RpdmVUeXBlYDogYSBkaXJlY3RpdmUgb24gdGhlIGN1cnJlbnQgZWxlbWVudCBvbmx5XG4gKiAtIGBASG9zdCgpIGRpcmVjdGl2ZTpEaXJlY3RpdmVUeXBlYDogYW55IGRpcmVjdGl2ZSB0aGF0IG1hdGNoZXMgdGhlIHR5cGUgYmV0d2VlbiB0aGUgY3VycmVudFxuICogZWxlbWVudCBhbmQgdGhlXG4gKiAgICBTaGFkb3cgRE9NIHJvb3QuXG4gKiAtIGBAUXVlcnkoRGlyZWN0aXZlVHlwZSkgcXVlcnk6UXVlcnlMaXN0PERpcmVjdGl2ZVR5cGU+YDogQSBsaXZlIGNvbGxlY3Rpb24gb2YgZGlyZWN0IGNoaWxkXG4gKiBkaXJlY3RpdmVzLlxuICogLSBgQFF1ZXJ5RGVzY2VuZGFudHMoRGlyZWN0aXZlVHlwZSkgcXVlcnk6UXVlcnlMaXN0PERpcmVjdGl2ZVR5cGU+YDogQSBsaXZlIGNvbGxlY3Rpb24gb2YgYW55XG4gKiBjaGlsZCBkaXJlY3RpdmVzLlxuICpcbiAqIFRvIGluamVjdCBlbGVtZW50LXNwZWNpZmljIHNwZWNpYWwgb2JqZWN0cywgZGVjbGFyZSB0aGUgY29uc3RydWN0b3IgcGFyYW1ldGVyIGFzOlxuICogLSBgZWxlbWVudDogRWxlbWVudFJlZmAgdG8gb2J0YWluIGEgcmVmZXJlbmNlIHRvIGxvZ2ljYWwgZWxlbWVudCBpbiB0aGUgdmlldy5cbiAqIC0gYHZpZXdDb250YWluZXI6IFZpZXdDb250YWluZXJSZWZgIHRvIGNvbnRyb2wgY2hpbGQgdGVtcGxhdGUgaW5zdGFudGlhdGlvbiwgZm9yXG4gKiB7QGxpbmsgRGlyZWN0aXZlTWV0YWRhdGF9IGRpcmVjdGl2ZXMgb25seVxuICogLSBgYmluZGluZ1Byb3BhZ2F0aW9uOiBCaW5kaW5nUHJvcGFnYXRpb25gIHRvIGNvbnRyb2wgY2hhbmdlIGRldGVjdGlvbiBpbiBhIG1vcmUgZ3JhbnVsYXIgd2F5LlxuICpcbiAqICMjIyBFeGFtcGxlXG4gKlxuICogVGhlIGZvbGxvd2luZyBleGFtcGxlIGRlbW9uc3RyYXRlcyBob3cgZGVwZW5kZW5jeSBpbmplY3Rpb24gcmVzb2x2ZXMgY29uc3RydWN0b3IgYXJndW1lbnRzIGluXG4gKiBwcmFjdGljZS5cbiAqXG4gKlxuICogQXNzdW1lIHRoaXMgSFRNTCB0ZW1wbGF0ZTpcbiAqXG4gKiBgYGBcbiAqIDxkaXYgZGVwZW5kZW5jeT1cIjFcIj5cbiAqICAgPGRpdiBkZXBlbmRlbmN5PVwiMlwiPlxuICogICAgIDxkaXYgZGVwZW5kZW5jeT1cIjNcIiBteS1kaXJlY3RpdmU+XG4gKiAgICAgICA8ZGl2IGRlcGVuZGVuY3k9XCI0XCI+XG4gKiAgICAgICAgIDxkaXYgZGVwZW5kZW5jeT1cIjVcIj48L2Rpdj5cbiAqICAgICAgIDwvZGl2PlxuICogICAgICAgPGRpdiBkZXBlbmRlbmN5PVwiNlwiPjwvZGl2PlxuICogICAgIDwvZGl2PlxuICogICA8L2Rpdj5cbiAqIDwvZGl2PlxuICogYGBgXG4gKlxuICogV2l0aCB0aGUgZm9sbG93aW5nIGBkZXBlbmRlbmN5YCBkZWNvcmF0b3IgYW5kIGBTb21lU2VydmljZWAgaW5qZWN0YWJsZSBjbGFzcy5cbiAqXG4gKiBgYGBcbiAqIEBJbmplY3RhYmxlKClcbiAqIGNsYXNzIFNvbWVTZXJ2aWNlIHtcbiAqIH1cbiAqXG4gKiBARGlyZWN0aXZlKHtcbiAqICAgc2VsZWN0b3I6ICdbZGVwZW5kZW5jeV0nLFxuICogICBpbnB1dHM6IFtcbiAqICAgICAnaWQ6IGRlcGVuZGVuY3knXG4gKiAgIF1cbiAqIH0pXG4gKiBjbGFzcyBEZXBlbmRlbmN5IHtcbiAqICAgaWQ6c3RyaW5nO1xuICogfVxuICogYGBgXG4gKlxuICogTGV0J3Mgc3RlcCB0aHJvdWdoIHRoZSBkaWZmZXJlbnQgd2F5cyBpbiB3aGljaCBgTXlEaXJlY3RpdmVgIGNvdWxkIGJlIGRlY2xhcmVkLi4uXG4gKlxuICpcbiAqICMjIyBObyBpbmplY3Rpb25cbiAqXG4gKiBIZXJlIHRoZSBjb25zdHJ1Y3RvciBpcyBkZWNsYXJlZCB3aXRoIG5vIGFyZ3VtZW50cywgdGhlcmVmb3JlIG5vdGhpbmcgaXMgaW5qZWN0ZWQgaW50b1xuICogYE15RGlyZWN0aXZlYC5cbiAqXG4gKiBgYGBcbiAqIEBEaXJlY3RpdmUoeyBzZWxlY3RvcjogJ1tteS1kaXJlY3RpdmVdJyB9KVxuICogY2xhc3MgTXlEaXJlY3RpdmUge1xuICogICBjb25zdHJ1Y3RvcigpIHtcbiAqICAgfVxuICogfVxuICogYGBgXG4gKlxuICogVGhpcyBkaXJlY3RpdmUgd291bGQgYmUgaW5zdGFudGlhdGVkIHdpdGggbm8gZGVwZW5kZW5jaWVzLlxuICpcbiAqXG4gKiAjIyMgQ29tcG9uZW50LWxldmVsIGluamVjdGlvblxuICpcbiAqIERpcmVjdGl2ZXMgY2FuIGluamVjdCBhbnkgaW5qZWN0YWJsZSBpbnN0YW5jZSBmcm9tIHRoZSBjbG9zZXN0IGNvbXBvbmVudCBpbmplY3RvciBvciBhbnkgb2YgaXRzXG4gKiBwYXJlbnRzLlxuICpcbiAqIEhlcmUsIHRoZSBjb25zdHJ1Y3RvciBkZWNsYXJlcyBhIHBhcmFtZXRlciwgYHNvbWVTZXJ2aWNlYCwgYW5kIGluamVjdHMgdGhlIGBTb21lU2VydmljZWAgdHlwZVxuICogZnJvbSB0aGUgcGFyZW50XG4gKiBjb21wb25lbnQncyBpbmplY3Rvci5cbiAqIGBgYFxuICogQERpcmVjdGl2ZSh7IHNlbGVjdG9yOiAnW215LWRpcmVjdGl2ZV0nIH0pXG4gKiBjbGFzcyBNeURpcmVjdGl2ZSB7XG4gKiAgIGNvbnN0cnVjdG9yKHNvbWVTZXJ2aWNlOiBTb21lU2VydmljZSkge1xuICogICB9XG4gKiB9XG4gKiBgYGBcbiAqXG4gKiBUaGlzIGRpcmVjdGl2ZSB3b3VsZCBiZSBpbnN0YW50aWF0ZWQgd2l0aCBhIGRlcGVuZGVuY3kgb24gYFNvbWVTZXJ2aWNlYC5cbiAqXG4gKlxuICogIyMjIEluamVjdGluZyBhIGRpcmVjdGl2ZSBmcm9tIHRoZSBjdXJyZW50IGVsZW1lbnRcbiAqXG4gKiBEaXJlY3RpdmVzIGNhbiBpbmplY3Qgb3RoZXIgZGlyZWN0aXZlcyBkZWNsYXJlZCBvbiB0aGUgY3VycmVudCBlbGVtZW50LlxuICpcbiAqIGBgYFxuICogQERpcmVjdGl2ZSh7IHNlbGVjdG9yOiAnW215LWRpcmVjdGl2ZV0nIH0pXG4gKiBjbGFzcyBNeURpcmVjdGl2ZSB7XG4gKiAgIGNvbnN0cnVjdG9yKGRlcGVuZGVuY3k6IERlcGVuZGVuY3kpIHtcbiAqICAgICBleHBlY3QoZGVwZW5kZW5jeS5pZCkudG9FcXVhbCgzKTtcbiAqICAgfVxuICogfVxuICogYGBgXG4gKiBUaGlzIGRpcmVjdGl2ZSB3b3VsZCBiZSBpbnN0YW50aWF0ZWQgd2l0aCBgRGVwZW5kZW5jeWAgZGVjbGFyZWQgYXQgdGhlIHNhbWUgZWxlbWVudCwgaW4gdGhpcyBjYXNlXG4gKiBgZGVwZW5kZW5jeT1cIjNcImAuXG4gKlxuICogIyMjIEluamVjdGluZyBhIGRpcmVjdGl2ZSBmcm9tIGFueSBhbmNlc3RvciBlbGVtZW50c1xuICpcbiAqIERpcmVjdGl2ZXMgY2FuIGluamVjdCBvdGhlciBkaXJlY3RpdmVzIGRlY2xhcmVkIG9uIGFueSBhbmNlc3RvciBlbGVtZW50IChpbiB0aGUgY3VycmVudCBTaGFkb3dcbiAqIERPTSksIGkuZS4gb24gdGhlIGN1cnJlbnQgZWxlbWVudCwgdGhlXG4gKiBwYXJlbnQgZWxlbWVudCwgb3IgaXRzIHBhcmVudHMuXG4gKiBgYGBcbiAqIEBEaXJlY3RpdmUoeyBzZWxlY3RvcjogJ1tteS1kaXJlY3RpdmVdJyB9KVxuICogY2xhc3MgTXlEaXJlY3RpdmUge1xuICogICBjb25zdHJ1Y3RvcihASG9zdCgpIGRlcGVuZGVuY3k6IERlcGVuZGVuY3kpIHtcbiAqICAgICBleHBlY3QoZGVwZW5kZW5jeS5pZCkudG9FcXVhbCgyKTtcbiAqICAgfVxuICogfVxuICogYGBgXG4gKlxuICogYEBIb3N0YCBjaGVja3MgdGhlIGN1cnJlbnQgZWxlbWVudCwgdGhlIHBhcmVudCwgYXMgd2VsbCBhcyBpdHMgcGFyZW50cyByZWN1cnNpdmVseS4gSWZcbiAqIGBkZXBlbmRlbmN5PVwiMlwiYCBkaWRuJ3RcbiAqIGV4aXN0IG9uIHRoZSBkaXJlY3QgcGFyZW50LCB0aGlzIGluamVjdGlvbiB3b3VsZFxuICogaGF2ZSByZXR1cm5lZFxuICogYGRlcGVuZGVuY3k9XCIxXCJgLlxuICpcbiAqXG4gKiAjIyMgSW5qZWN0aW5nIGEgbGl2ZSBjb2xsZWN0aW9uIG9mIGRpcmVjdCBjaGlsZCBkaXJlY3RpdmVzXG4gKlxuICpcbiAqIEEgZGlyZWN0aXZlIGNhbiBhbHNvIHF1ZXJ5IGZvciBvdGhlciBjaGlsZCBkaXJlY3RpdmVzLiBTaW5jZSBwYXJlbnQgZGlyZWN0aXZlcyBhcmUgaW5zdGFudGlhdGVkXG4gKiBiZWZvcmUgY2hpbGQgZGlyZWN0aXZlcywgYSBkaXJlY3RpdmUgY2FuJ3Qgc2ltcGx5IGluamVjdCB0aGUgbGlzdCBvZiBjaGlsZCBkaXJlY3RpdmVzLiBJbnN0ZWFkLFxuICogdGhlIGRpcmVjdGl2ZSBpbmplY3RzIGEge0BsaW5rIFF1ZXJ5TGlzdH0sIHdoaWNoIHVwZGF0ZXMgaXRzIGNvbnRlbnRzIGFzIGNoaWxkcmVuIGFyZSBhZGRlZCxcbiAqIHJlbW92ZWQsIG9yIG1vdmVkIGJ5IGEgZGlyZWN0aXZlIHRoYXQgdXNlcyBhIHtAbGluayBWaWV3Q29udGFpbmVyUmVmfSBzdWNoIGFzIGEgYG5nRm9yYCwgYW5cbiAqIGBuZ0lmYCwgb3IgYW4gYG5nU3dpdGNoYC5cbiAqXG4gKiBgYGBcbiAqIEBEaXJlY3RpdmUoeyBzZWxlY3RvcjogJ1tteS1kaXJlY3RpdmVdJyB9KVxuICogY2xhc3MgTXlEaXJlY3RpdmUge1xuICogICBjb25zdHJ1Y3RvcihAUXVlcnkoRGVwZW5kZW5jeSkgZGVwZW5kZW5jaWVzOlF1ZXJ5TGlzdDxEZXBlbmRlbmN5Pikge1xuICogICB9XG4gKiB9XG4gKiBgYGBcbiAqXG4gKiBUaGlzIGRpcmVjdGl2ZSB3b3VsZCBiZSBpbnN0YW50aWF0ZWQgd2l0aCBhIHtAbGluayBRdWVyeUxpc3R9IHdoaWNoIGNvbnRhaW5zIGBEZXBlbmRlbmN5YCA0IGFuZFxuICogYERlcGVuZGVuY3lgIDYuIEhlcmUsIGBEZXBlbmRlbmN5YCA1IHdvdWxkIG5vdCBiZSBpbmNsdWRlZCwgYmVjYXVzZSBpdCBpcyBub3QgYSBkaXJlY3QgY2hpbGQuXG4gKlxuICogIyMjIEluamVjdGluZyBhIGxpdmUgY29sbGVjdGlvbiBvZiBkZXNjZW5kYW50IGRpcmVjdGl2ZXNcbiAqXG4gKiBCeSBwYXNzaW5nIHRoZSBkZXNjZW5kYW50IGZsYWcgdG8gYEBRdWVyeWAgYWJvdmUsIHdlIGNhbiBpbmNsdWRlIHRoZSBjaGlsZHJlbiBvZiB0aGUgY2hpbGRcbiAqIGVsZW1lbnRzLlxuICpcbiAqIGBgYFxuICogQERpcmVjdGl2ZSh7IHNlbGVjdG9yOiAnW215LWRpcmVjdGl2ZV0nIH0pXG4gKiBjbGFzcyBNeURpcmVjdGl2ZSB7XG4gKiAgIGNvbnN0cnVjdG9yKEBRdWVyeShEZXBlbmRlbmN5LCB7ZGVzY2VuZGFudHM6IHRydWV9KSBkZXBlbmRlbmNpZXM6UXVlcnlMaXN0PERlcGVuZGVuY3k+KSB7XG4gKiAgIH1cbiAqIH1cbiAqIGBgYFxuICpcbiAqIFRoaXMgZGlyZWN0aXZlIHdvdWxkIGJlIGluc3RhbnRpYXRlZCB3aXRoIGEgUXVlcnkgd2hpY2ggd291bGQgY29udGFpbiBgRGVwZW5kZW5jeWAgNCwgNSBhbmQgNi5cbiAqXG4gKiAjIyMgT3B0aW9uYWwgaW5qZWN0aW9uXG4gKlxuICogVGhlIG5vcm1hbCBiZWhhdmlvciBvZiBkaXJlY3RpdmVzIGlzIHRvIHJldHVybiBhbiBlcnJvciB3aGVuIGEgc3BlY2lmaWVkIGRlcGVuZGVuY3kgY2Fubm90IGJlXG4gKiByZXNvbHZlZC4gSWYgeW91XG4gKiB3b3VsZCBsaWtlIHRvIGluamVjdCBgbnVsbGAgb24gdW5yZXNvbHZlZCBkZXBlbmRlbmN5IGluc3RlYWQsIHlvdSBjYW4gYW5ub3RhdGUgdGhhdCBkZXBlbmRlbmN5XG4gKiB3aXRoIGBAT3B0aW9uYWwoKWAuXG4gKiBUaGlzIGV4cGxpY2l0bHkgcGVybWl0cyB0aGUgYXV0aG9yIG9mIGEgdGVtcGxhdGUgdG8gdHJlYXQgc29tZSBvZiB0aGUgc3Vycm91bmRpbmcgZGlyZWN0aXZlcyBhc1xuICogb3B0aW9uYWwuXG4gKlxuICogYGBgXG4gKiBARGlyZWN0aXZlKHsgc2VsZWN0b3I6ICdbbXktZGlyZWN0aXZlXScgfSlcbiAqIGNsYXNzIE15RGlyZWN0aXZlIHtcbiAqICAgY29uc3RydWN0b3IoQE9wdGlvbmFsKCkgZGVwZW5kZW5jeTpEZXBlbmRlbmN5KSB7XG4gKiAgIH1cbiAqIH1cbiAqIGBgYFxuICpcbiAqIFRoaXMgZGlyZWN0aXZlIHdvdWxkIGJlIGluc3RhbnRpYXRlZCB3aXRoIGEgYERlcGVuZGVuY3lgIGRpcmVjdGl2ZSBmb3VuZCBvbiB0aGUgY3VycmVudCBlbGVtZW50LlxuICogSWYgbm9uZSBjYW4gYmVcbiAqIGZvdW5kLCB0aGUgaW5qZWN0b3Igc3VwcGxpZXMgYG51bGxgIGluc3RlYWQgb2YgdGhyb3dpbmcgYW4gZXJyb3IuXG4gKlxuICogIyMjIEV4YW1wbGVcbiAqXG4gKiBIZXJlIHdlIHVzZSBhIGRlY29yYXRvciBkaXJlY3RpdmUgdG8gc2ltcGx5IGRlZmluZSBiYXNpYyB0b29sLXRpcCBiZWhhdmlvci5cbiAqXG4gKiBgYGBcbiAqIEBEaXJlY3RpdmUoe1xuICogICBzZWxlY3RvcjogJ1t0b29sdGlwXScsXG4gKiAgIGlucHV0czogW1xuICogICAgICd0ZXh0OiB0b29sdGlwJ1xuICogICBdLFxuICogICBob3N0OiB7XG4gKiAgICAgJyhtb3VzZWVudGVyKSc6ICdvbk1vdXNlRW50ZXIoKScsXG4gKiAgICAgJyhtb3VzZWxlYXZlKSc6ICdvbk1vdXNlTGVhdmUoKSdcbiAqICAgfVxuICogfSlcbiAqIGNsYXNzIFRvb2x0aXB7XG4gKiAgIHRleHQ6c3RyaW5nO1xuICogICBvdmVybGF5Ok92ZXJsYXk7IC8vIE5PVCBZRVQgSU1QTEVNRU5URURcbiAqICAgb3ZlcmxheU1hbmFnZXI6T3ZlcmxheU1hbmFnZXI7IC8vIE5PVCBZRVQgSU1QTEVNRU5URURcbiAqXG4gKiAgIGNvbnN0cnVjdG9yKG92ZXJsYXlNYW5hZ2VyOk92ZXJsYXlNYW5hZ2VyKSB7XG4gKiAgICAgdGhpcy5vdmVybGF5ID0gb3ZlcmxheTtcbiAqICAgfVxuICpcbiAqICAgb25Nb3VzZUVudGVyKCkge1xuICogICAgIC8vIGV4YWN0IHNpZ25hdHVyZSB0byBiZSBkZXRlcm1pbmVkXG4gKiAgICAgdGhpcy5vdmVybGF5ID0gdGhpcy5vdmVybGF5TWFuYWdlci5vcGVuKHRleHQsIC4uLik7XG4gKiAgIH1cbiAqXG4gKiAgIG9uTW91c2VMZWF2ZSgpIHtcbiAqICAgICB0aGlzLm92ZXJsYXkuY2xvc2UoKTtcbiAqICAgICB0aGlzLm92ZXJsYXkgPSBudWxsO1xuICogICB9XG4gKiB9XG4gKiBgYGBcbiAqIEluIG91ciBIVE1MIHRlbXBsYXRlLCB3ZSBjYW4gdGhlbiBhZGQgdGhpcyBiZWhhdmlvciB0byBhIGA8ZGl2PmAgb3IgYW55IG90aGVyIGVsZW1lbnQgd2l0aCB0aGVcbiAqIGB0b29sdGlwYCBzZWxlY3RvcixcbiAqIGxpa2Ugc286XG4gKlxuICogYGBgXG4gKiA8ZGl2IHRvb2x0aXA9XCJzb21lIHRleHQgaGVyZVwiPjwvZGl2PlxuICogYGBgXG4gKlxuICogRGlyZWN0aXZlcyBjYW4gYWxzbyBjb250cm9sIHRoZSBpbnN0YW50aWF0aW9uLCBkZXN0cnVjdGlvbiwgYW5kIHBvc2l0aW9uaW5nIG9mIGlubGluZSB0ZW1wbGF0ZVxuICogZWxlbWVudHM6XG4gKlxuICogQSBkaXJlY3RpdmUgdXNlcyBhIHtAbGluayBWaWV3Q29udGFpbmVyUmVmfSB0byBpbnN0YW50aWF0ZSwgaW5zZXJ0LCBtb3ZlLCBhbmQgZGVzdHJveSB2aWV3cyBhdFxuICogcnVudGltZS5cbiAqIFRoZSB7QGxpbmsgVmlld0NvbnRhaW5lclJlZn0gaXMgY3JlYXRlZCBhcyBhIHJlc3VsdCBvZiBgPHRlbXBsYXRlPmAgZWxlbWVudCwgYW5kIHJlcHJlc2VudHMgYVxuICogbG9jYXRpb24gaW4gdGhlIGN1cnJlbnQgdmlld1xuICogd2hlcmUgdGhlc2UgYWN0aW9ucyBhcmUgcGVyZm9ybWVkLlxuICpcbiAqIFZpZXdzIGFyZSBhbHdheXMgY3JlYXRlZCBhcyBjaGlsZHJlbiBvZiB0aGUgY3VycmVudCB7QGxpbmsgVmlld01ldGFkYXRhfSwgYW5kIGFzIHNpYmxpbmdzIG9mIHRoZVxuICogYDx0ZW1wbGF0ZT5gIGVsZW1lbnQuIFRodXMgYVxuICogZGlyZWN0aXZlIGluIGEgY2hpbGQgdmlldyBjYW5ub3QgaW5qZWN0IHRoZSBkaXJlY3RpdmUgdGhhdCBjcmVhdGVkIGl0LlxuICpcbiAqIFNpbmNlIGRpcmVjdGl2ZXMgdGhhdCBjcmVhdGUgdmlld3MgdmlhIFZpZXdDb250YWluZXJzIGFyZSBjb21tb24gaW4gQW5ndWxhciwgYW5kIHVzaW5nIHRoZSBmdWxsXG4gKiBgPHRlbXBsYXRlPmAgZWxlbWVudCBzeW50YXggaXMgd29yZHksIEFuZ3VsYXJcbiAqIGFsc28gc3VwcG9ydHMgYSBzaG9ydGhhbmQgbm90YXRpb246IGA8bGkgKmZvbz1cImJhclwiPmAgYW5kIGA8bGkgdGVtcGxhdGU9XCJmb286IGJhclwiPmAgYXJlXG4gKiBlcXVpdmFsZW50LlxuICpcbiAqIFRodXMsXG4gKlxuICogYGBgXG4gKiA8dWw+XG4gKiAgIDxsaSAqZm9vPVwiYmFyXCIgdGl0bGU9XCJ0ZXh0XCI+PC9saT5cbiAqIDwvdWw+XG4gKiBgYGBcbiAqXG4gKiBFeHBhbmRzIGluIHVzZSB0bzpcbiAqXG4gKiBgYGBcbiAqIDx1bD5cbiAqICAgPHRlbXBsYXRlIFtmb29dPVwiYmFyXCI+XG4gKiAgICAgPGxpIHRpdGxlPVwidGV4dFwiPjwvbGk+XG4gKiAgIDwvdGVtcGxhdGU+XG4gKiA8L3VsPlxuICogYGBgXG4gKlxuICogTm90aWNlIHRoYXQgYWx0aG91Z2ggdGhlIHNob3J0aGFuZCBwbGFjZXMgYCpmb289XCJiYXJcImAgd2l0aGluIHRoZSBgPGxpPmAgZWxlbWVudCwgdGhlIGJpbmRpbmcgZm9yXG4gKiB0aGUgZGlyZWN0aXZlXG4gKiBjb250cm9sbGVyIGlzIGNvcnJlY3RseSBpbnN0YW50aWF0ZWQgb24gdGhlIGA8dGVtcGxhdGU+YCBlbGVtZW50IHJhdGhlciB0aGFuIHRoZSBgPGxpPmAgZWxlbWVudC5cbiAqXG4gKiAjIyBMaWZlY3ljbGUgaG9va3NcbiAqXG4gKiBXaGVuIHRoZSBkaXJlY3RpdmUgY2xhc3MgaW1wbGVtZW50cyBzb21lIHtAbGluayAuLi8uLi9ndWlkZS9saWZlY3ljbGUtaG9va3MuaHRtbH0gdGhlIGNhbGxiYWNrc1xuICogYXJlIGNhbGxlZCBieSB0aGUgY2hhbmdlIGRldGVjdGlvbiBhdCBkZWZpbmVkIHBvaW50cyBpbiB0aW1lIGR1cmluZyB0aGUgbGlmZSBvZiB0aGUgZGlyZWN0aXZlLlxuICpcbiAqICMjIyBFeGFtcGxlXG4gKlxuICogTGV0J3Mgc3VwcG9zZSB3ZSB3YW50IHRvIGltcGxlbWVudCB0aGUgYHVubGVzc2AgYmVoYXZpb3IsIHRvIGNvbmRpdGlvbmFsbHkgaW5jbHVkZSBhIHRlbXBsYXRlLlxuICpcbiAqIEhlcmUgaXMgYSBzaW1wbGUgZGlyZWN0aXZlIHRoYXQgdHJpZ2dlcnMgb24gYW4gYHVubGVzc2Agc2VsZWN0b3I6XG4gKlxuICogYGBgXG4gKiBARGlyZWN0aXZlKHtcbiAqICAgc2VsZWN0b3I6ICdbdW5sZXNzXScsXG4gKiAgIGlucHV0czogWyd1bmxlc3MnXVxuICogfSlcbiAqIGV4cG9ydCBjbGFzcyBVbmxlc3Mge1xuICogICB2aWV3Q29udGFpbmVyOiBWaWV3Q29udGFpbmVyUmVmO1xuICogICB0ZW1wbGF0ZVJlZjogVGVtcGxhdGVSZWY7XG4gKiAgIHByZXZDb25kaXRpb246IGJvb2xlYW47XG4gKlxuICogICBjb25zdHJ1Y3Rvcih2aWV3Q29udGFpbmVyOiBWaWV3Q29udGFpbmVyUmVmLCB0ZW1wbGF0ZVJlZjogVGVtcGxhdGVSZWYpIHtcbiAqICAgICB0aGlzLnZpZXdDb250YWluZXIgPSB2aWV3Q29udGFpbmVyO1xuICogICAgIHRoaXMudGVtcGxhdGVSZWYgPSB0ZW1wbGF0ZVJlZjtcbiAqICAgICB0aGlzLnByZXZDb25kaXRpb24gPSBudWxsO1xuICogICB9XG4gKlxuICogICBzZXQgdW5sZXNzKG5ld0NvbmRpdGlvbikge1xuICogICAgIGlmIChuZXdDb25kaXRpb24gJiYgKGlzQmxhbmsodGhpcy5wcmV2Q29uZGl0aW9uKSB8fCAhdGhpcy5wcmV2Q29uZGl0aW9uKSkge1xuICogICAgICAgdGhpcy5wcmV2Q29uZGl0aW9uID0gdHJ1ZTtcbiAqICAgICAgIHRoaXMudmlld0NvbnRhaW5lci5jbGVhcigpO1xuICogICAgIH0gZWxzZSBpZiAoIW5ld0NvbmRpdGlvbiAmJiAoaXNCbGFuayh0aGlzLnByZXZDb25kaXRpb24pIHx8IHRoaXMucHJldkNvbmRpdGlvbikpIHtcbiAqICAgICAgIHRoaXMucHJldkNvbmRpdGlvbiA9IGZhbHNlO1xuICogICAgICAgdGhpcy52aWV3Q29udGFpbmVyLmNyZWF0ZSh0aGlzLnRlbXBsYXRlUmVmKTtcbiAqICAgICB9XG4gKiAgIH1cbiAqIH1cbiAqIGBgYFxuICpcbiAqIFdlIGNhbiB0aGVuIHVzZSB0aGlzIGB1bmxlc3NgIHNlbGVjdG9yIGluIGEgdGVtcGxhdGU6XG4gKiBgYGBcbiAqIDx1bD5cbiAqICAgPGxpICp1bmxlc3M9XCJleHByXCI+PC9saT5cbiAqIDwvdWw+XG4gKiBgYGBcbiAqXG4gKiBPbmNlIHRoZSBkaXJlY3RpdmUgaW5zdGFudGlhdGVzIHRoZSBjaGlsZCB2aWV3LCB0aGUgc2hvcnRoYW5kIG5vdGF0aW9uIGZvciB0aGUgdGVtcGxhdGUgZXhwYW5kc1xuICogYW5kIHRoZSByZXN1bHQgaXM6XG4gKlxuICogYGBgXG4gKiA8dWw+XG4gKiAgIDx0ZW1wbGF0ZSBbdW5sZXNzXT1cImV4cFwiPlxuICogICAgIDxsaT48L2xpPlxuICogICA8L3RlbXBsYXRlPlxuICogICA8bGk+PC9saT5cbiAqIDwvdWw+XG4gKiBgYGBcbiAqXG4gKiBOb3RlIGFsc28gdGhhdCBhbHRob3VnaCB0aGUgYDxsaT48L2xpPmAgdGVtcGxhdGUgc3RpbGwgZXhpc3RzIGluc2lkZSB0aGUgYDx0ZW1wbGF0ZT48L3RlbXBsYXRlPmAsXG4gKiB0aGUgaW5zdGFudGlhdGVkXG4gKiB2aWV3IG9jY3VycyBvbiB0aGUgc2Vjb25kIGA8bGk+PC9saT5gIHdoaWNoIGlzIGEgc2libGluZyB0byB0aGUgYDx0ZW1wbGF0ZT5gIGVsZW1lbnQuXG4gKiBAdHMyZGFydF9jb25zdFxuICovXG5leHBvcnQgY2xhc3MgRGlyZWN0aXZlTWV0YWRhdGEgZXh0ZW5kcyBJbmplY3RhYmxlTWV0YWRhdGEge1xuICAvKipcbiAgICogVGhlIENTUyBzZWxlY3RvciB0aGF0IHRyaWdnZXJzIHRoZSBpbnN0YW50aWF0aW9uIG9mIGEgZGlyZWN0aXZlLlxuICAgKlxuICAgKiBBbmd1bGFyIG9ubHkgYWxsb3dzIGRpcmVjdGl2ZXMgdG8gdHJpZ2dlciBvbiBDU1Mgc2VsZWN0b3JzIHRoYXQgZG8gbm90IGNyb3NzIGVsZW1lbnRcbiAgICogYm91bmRhcmllcy5cbiAgICpcbiAgICogYHNlbGVjdG9yYCBtYXkgYmUgZGVjbGFyZWQgYXMgb25lIG9mIHRoZSBmb2xsb3dpbmc6XG4gICAqXG4gICAqIC0gYGVsZW1lbnQtbmFtZWA6IHNlbGVjdCBieSBlbGVtZW50IG5hbWUuXG4gICAqIC0gYC5jbGFzc2A6IHNlbGVjdCBieSBjbGFzcyBuYW1lLlxuICAgKiAtIGBbYXR0cmlidXRlXWA6IHNlbGVjdCBieSBhdHRyaWJ1dGUgbmFtZS5cbiAgICogLSBgW2F0dHJpYnV0ZT12YWx1ZV1gOiBzZWxlY3QgYnkgYXR0cmlidXRlIG5hbWUgYW5kIHZhbHVlLlxuICAgKiAtIGA6bm90KHN1Yl9zZWxlY3RvcilgOiBzZWxlY3Qgb25seSBpZiB0aGUgZWxlbWVudCBkb2VzIG5vdCBtYXRjaCB0aGUgYHN1Yl9zZWxlY3RvcmAuXG4gICAqIC0gYHNlbGVjdG9yMSwgc2VsZWN0b3IyYDogc2VsZWN0IGlmIGVpdGhlciBgc2VsZWN0b3IxYCBvciBgc2VsZWN0b3IyYCBtYXRjaGVzLlxuICAgKlxuICAgKlxuICAgKiAjIyMgRXhhbXBsZVxuICAgKlxuICAgKiBTdXBwb3NlIHdlIGhhdmUgYSBkaXJlY3RpdmUgd2l0aCBhbiBgaW5wdXRbdHlwZT10ZXh0XWAgc2VsZWN0b3IuXG4gICAqXG4gICAqIEFuZCB0aGUgZm9sbG93aW5nIEhUTUw6XG4gICAqXG4gICAqIGBgYGh0bWxcbiAgICogPGZvcm0+XG4gICAqICAgPGlucHV0IHR5cGU9XCJ0ZXh0XCI+XG4gICAqICAgPGlucHV0IHR5cGU9XCJyYWRpb1wiPlxuICAgKiA8Zm9ybT5cbiAgICogYGBgXG4gICAqXG4gICAqIFRoZSBkaXJlY3RpdmUgd291bGQgb25seSBiZSBpbnN0YW50aWF0ZWQgb24gdGhlIGA8aW5wdXQgdHlwZT1cInRleHRcIj5gIGVsZW1lbnQuXG4gICAqXG4gICAqL1xuICBzZWxlY3Rvcjogc3RyaW5nO1xuXG4gIC8qKlxuICAgKiBFbnVtZXJhdGVzIHRoZSBzZXQgb2YgZGF0YS1ib3VuZCBpbnB1dCBwcm9wZXJ0aWVzIGZvciBhIGRpcmVjdGl2ZVxuICAgKlxuICAgKiBBbmd1bGFyIGF1dG9tYXRpY2FsbHkgdXBkYXRlcyBpbnB1dCBwcm9wZXJ0aWVzIGR1cmluZyBjaGFuZ2UgZGV0ZWN0aW9uLlxuICAgKlxuICAgKiBUaGUgYGlucHV0c2AgcHJvcGVydHkgZGVmaW5lcyBhIHNldCBvZiBgZGlyZWN0aXZlUHJvcGVydHlgIHRvIGBiaW5kaW5nUHJvcGVydHlgXG4gICAqIGNvbmZpZ3VyYXRpb246XG4gICAqXG4gICAqIC0gYGRpcmVjdGl2ZVByb3BlcnR5YCBzcGVjaWZpZXMgdGhlIGNvbXBvbmVudCBwcm9wZXJ0eSB3aGVyZSB0aGUgdmFsdWUgaXMgd3JpdHRlbi5cbiAgICogLSBgYmluZGluZ1Byb3BlcnR5YCBzcGVjaWZpZXMgdGhlIERPTSBwcm9wZXJ0eSB3aGVyZSB0aGUgdmFsdWUgaXMgcmVhZCBmcm9tLlxuICAgKlxuICAgKiBXaGVuIGBiaW5kaW5nUHJvcGVydHlgIGlzIG5vdCBwcm92aWRlZCwgaXQgaXMgYXNzdW1lZCB0byBiZSBlcXVhbCB0byBgZGlyZWN0aXZlUHJvcGVydHlgLlxuICAgKlxuICAgKiAjIyMgRXhhbXBsZSAoW2xpdmUgZGVtb10oaHR0cDovL3BsbmtyLmNvL2VkaXQvaXZoZlhZP3A9cHJldmlldykpXG4gICAqXG4gICAqIFRoZSBmb2xsb3dpbmcgZXhhbXBsZSBjcmVhdGVzIGEgY29tcG9uZW50IHdpdGggdHdvIGRhdGEtYm91bmQgcHJvcGVydGllcy5cbiAgICpcbiAgICogYGBgdHlwZXNjcmlwdFxuICAgKiBAQ29tcG9uZW50KHtcbiAgICogICBzZWxlY3RvcjogJ2JhbmstYWNjb3VudCcsXG4gICAqICAgaW5wdXRzOiBbJ2JhbmtOYW1lJywgJ2lkOiBhY2NvdW50LWlkJ10sXG4gICAqICAgdGVtcGxhdGU6IGBcbiAgICogICAgIEJhbmsgTmFtZToge3tiYW5rTmFtZX19XG4gICAqICAgICBBY2NvdW50IElkOiB7e2lkfX1cbiAgICogICBgXG4gICAqIH0pXG4gICAqIGNsYXNzIEJhbmtBY2NvdW50IHtcbiAgICogICBiYW5rTmFtZTogc3RyaW5nO1xuICAgKiAgIGlkOiBzdHJpbmc7XG4gICAqXG4gICAqICAgLy8gdGhpcyBwcm9wZXJ0eSBpcyBub3QgYm91bmQsIGFuZCB3b24ndCBiZSBhdXRvbWF0aWNhbGx5IHVwZGF0ZWQgYnkgQW5ndWxhclxuICAgKiAgIG5vcm1hbGl6ZWRCYW5rTmFtZTogc3RyaW5nO1xuICAgKiB9XG4gICAqXG4gICAqIEBDb21wb25lbnQoe1xuICAgKiAgIHNlbGVjdG9yOiAnYXBwJyxcbiAgICogICB0ZW1wbGF0ZTogYFxuICAgKiAgICAgPGJhbmstYWNjb3VudCBiYW5rLW5hbWU9XCJSQkNcIiBhY2NvdW50LWlkPVwiNDc0N1wiPjwvYmFuay1hY2NvdW50PlxuICAgKiAgIGAsXG4gICAqICAgZGlyZWN0aXZlczogW0JhbmtBY2NvdW50XVxuICAgKiB9KVxuICAgKiBjbGFzcyBBcHAge31cbiAgICpcbiAgICogYm9vdHN0cmFwKEFwcCk7XG4gICAqIGBgYFxuICAgKlxuICAgKi9cbiAgZ2V0IGlucHV0cygpOiBzdHJpbmdbXSB7XG4gICAgcmV0dXJuIGlzUHJlc2VudCh0aGlzLl9wcm9wZXJ0aWVzKSAmJiB0aGlzLl9wcm9wZXJ0aWVzLmxlbmd0aCA+IDAgPyB0aGlzLl9wcm9wZXJ0aWVzIDpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuX2lucHV0cztcbiAgfVxuICBnZXQgcHJvcGVydGllcygpOiBzdHJpbmdbXSB7IHJldHVybiB0aGlzLmlucHV0czsgfVxuICBwcml2YXRlIF9pbnB1dHM6IHN0cmluZ1tdO1xuICBwcml2YXRlIF9wcm9wZXJ0aWVzOiBzdHJpbmdbXTtcblxuICAvKipcbiAgICogRW51bWVyYXRlcyB0aGUgc2V0IG9mIGV2ZW50LWJvdW5kIG91dHB1dCBwcm9wZXJ0aWVzLlxuICAgKlxuICAgKiBXaGVuIGFuIG91dHB1dCBwcm9wZXJ0eSBlbWl0cyBhbiBldmVudCwgYW4gZXZlbnQgaGFuZGxlciBhdHRhY2hlZCB0byB0aGF0IGV2ZW50XG4gICAqIHRoZSB0ZW1wbGF0ZSBpcyBpbnZva2VkLlxuICAgKlxuICAgKiBUaGUgYG91dHB1dHNgIHByb3BlcnR5IGRlZmluZXMgYSBzZXQgb2YgYGRpcmVjdGl2ZVByb3BlcnR5YCB0byBgYmluZGluZ1Byb3BlcnR5YFxuICAgKiBjb25maWd1cmF0aW9uOlxuICAgKlxuICAgKiAtIGBkaXJlY3RpdmVQcm9wZXJ0eWAgc3BlY2lmaWVzIHRoZSBjb21wb25lbnQgcHJvcGVydHkgdGhhdCBlbWl0cyBldmVudHMuXG4gICAqIC0gYGJpbmRpbmdQcm9wZXJ0eWAgc3BlY2lmaWVzIHRoZSBET00gcHJvcGVydHkgdGhlIGV2ZW50IGhhbmRsZXIgaXMgYXR0YWNoZWQgdG8uXG4gICAqXG4gICAqICMjIyBFeGFtcGxlIChbbGl2ZSBkZW1vXShodHRwOi8vcGxua3IuY28vZWRpdC9kNUNOcTc/cD1wcmV2aWV3KSlcbiAgICpcbiAgICogYGBgdHlwZXNjcmlwdFxuICAgKiBARGlyZWN0aXZlKHtcbiAgICogICBzZWxlY3RvcjogJ2ludGVydmFsLWRpcicsXG4gICAqICAgb3V0cHV0czogWydldmVyeVNlY29uZCcsICdmaXZlNVNlY3M6IGV2ZXJ5Rml2ZVNlY29uZHMnXVxuICAgKiB9KVxuICAgKiBjbGFzcyBJbnRlcnZhbERpciB7XG4gICAqICAgZXZlcnlTZWNvbmQgPSBuZXcgRXZlbnRFbWl0dGVyKCk7XG4gICAqICAgZml2ZTVTZWNzID0gbmV3IEV2ZW50RW1pdHRlcigpO1xuICAgKlxuICAgKiAgIGNvbnN0cnVjdG9yKCkge1xuICAgKiAgICAgc2V0SW50ZXJ2YWwoKCkgPT4gdGhpcy5ldmVyeVNlY29uZC5lbWl0KFwiZXZlbnRcIiksIDEwMDApO1xuICAgKiAgICAgc2V0SW50ZXJ2YWwoKCkgPT4gdGhpcy5maXZlNVNlY3MuZW1pdChcImV2ZW50XCIpLCA1MDAwKTtcbiAgICogICB9XG4gICAqIH1cbiAgICpcbiAgICogQENvbXBvbmVudCh7XG4gICAqICAgc2VsZWN0b3I6ICdhcHAnLFxuICAgKiAgIHRlbXBsYXRlOiBgXG4gICAqICAgICA8aW50ZXJ2YWwtZGlyIChldmVyeVNlY29uZCk9XCJldmVyeVNlY29uZCgpXCIgKGV2ZXJ5Rml2ZVNlY29uZHMpPVwiZXZlcnlGaXZlU2Vjb25kcygpXCI+XG4gICAqICAgICA8L2ludGVydmFsLWRpcj5cbiAgICogICBgLFxuICAgKiAgIGRpcmVjdGl2ZXM6IFtJbnRlcnZhbERpcl1cbiAgICogfSlcbiAgICogY2xhc3MgQXBwIHtcbiAgICogICBldmVyeVNlY29uZCgpIHsgY29uc29sZS5sb2coJ3NlY29uZCcpOyB9XG4gICAqICAgZXZlcnlGaXZlU2Vjb25kcygpIHsgY29uc29sZS5sb2coJ2ZpdmUgc2Vjb25kcycpOyB9XG4gICAqIH1cbiAgICogYm9vdHN0cmFwKEFwcCk7XG4gICAqIGBgYFxuICAgKlxuICAgKi9cbiAgZ2V0IG91dHB1dHMoKTogc3RyaW5nW10ge1xuICAgIHJldHVybiBpc1ByZXNlbnQodGhpcy5fZXZlbnRzKSAmJiB0aGlzLl9ldmVudHMubGVuZ3RoID4gMCA/IHRoaXMuX2V2ZW50cyA6IHRoaXMuX291dHB1dHM7XG4gIH1cbiAgZ2V0IGV2ZW50cygpOiBzdHJpbmdbXSB7IHJldHVybiB0aGlzLm91dHB1dHM7IH1cbiAgcHJpdmF0ZSBfb3V0cHV0czogc3RyaW5nW107XG4gIHByaXZhdGUgX2V2ZW50czogc3RyaW5nW107XG5cbiAgLyoqXG4gICAqIFNwZWNpZnkgdGhlIGV2ZW50cywgYWN0aW9ucywgcHJvcGVydGllcyBhbmQgYXR0cmlidXRlcyByZWxhdGVkIHRvIHRoZSBob3N0IGVsZW1lbnQuXG4gICAqXG4gICAqICMjIEhvc3QgTGlzdGVuZXJzXG4gICAqXG4gICAqIFNwZWNpZmllcyB3aGljaCBET00gZXZlbnRzIGEgZGlyZWN0aXZlIGxpc3RlbnMgdG8gdmlhIGEgc2V0IG9mIGAoZXZlbnQpYCB0byBgbWV0aG9kYFxuICAgKiBrZXktdmFsdWUgcGFpcnM6XG4gICAqXG4gICAqIC0gYGV2ZW50YDogdGhlIERPTSBldmVudCB0aGF0IHRoZSBkaXJlY3RpdmUgbGlzdGVucyB0by5cbiAgICogLSBgc3RhdGVtZW50YDogdGhlIHN0YXRlbWVudCB0byBleGVjdXRlIHdoZW4gdGhlIGV2ZW50IG9jY3Vycy5cbiAgICogSWYgdGhlIGV2YWx1YXRpb24gb2YgdGhlIHN0YXRlbWVudCByZXR1cm5zIGBmYWxzZWAsIHRoZW4gYHByZXZlbnREZWZhdWx0YGlzIGFwcGxpZWQgb24gdGhlIERPTVxuICAgKiBldmVudC5cbiAgICpcbiAgICogVG8gbGlzdGVuIHRvIGdsb2JhbCBldmVudHMsIGEgdGFyZ2V0IG11c3QgYmUgYWRkZWQgdG8gdGhlIGV2ZW50IG5hbWUuXG4gICAqIFRoZSB0YXJnZXQgY2FuIGJlIGB3aW5kb3dgLCBgZG9jdW1lbnRgIG9yIGBib2R5YC5cbiAgICpcbiAgICogV2hlbiB3cml0aW5nIGEgZGlyZWN0aXZlIGV2ZW50IGJpbmRpbmcsIHlvdSBjYW4gYWxzbyByZWZlciB0byB0aGUgJGV2ZW50IGxvY2FsIHZhcmlhYmxlLlxuICAgKlxuICAgKiAjIyMgRXhhbXBsZSAoW2xpdmUgZGVtb10oaHR0cDovL3BsbmtyLmNvL2VkaXQvRGxBNUtVP3A9cHJldmlldykpXG4gICAqXG4gICAqIFRoZSBmb2xsb3dpbmcgZXhhbXBsZSBkZWNsYXJlcyBhIGRpcmVjdGl2ZSB0aGF0IGF0dGFjaGVzIGEgY2xpY2sgbGlzdGVuZXIgdG8gdGhlIGJ1dHRvbiBhbmRcbiAgICogY291bnRzIGNsaWNrcy5cbiAgICpcbiAgICogYGBgdHlwZXNjcmlwdFxuICAgKiBARGlyZWN0aXZlKHtcbiAgICogICBzZWxlY3RvcjogJ2J1dHRvbltjb3VudGluZ10nLFxuICAgKiAgIGhvc3Q6IHtcbiAgICogICAgICcoY2xpY2spJzogJ29uQ2xpY2soJGV2ZW50LnRhcmdldCknXG4gICAqICAgfVxuICAgKiB9KVxuICAgKiBjbGFzcyBDb3VudENsaWNrcyB7XG4gICAqICAgbnVtYmVyT2ZDbGlja3MgPSAwO1xuICAgKlxuICAgKiAgIG9uQ2xpY2soYnRuKSB7XG4gICAqICAgICBjb25zb2xlLmxvZyhcImJ1dHRvblwiLCBidG4sIFwibnVtYmVyIG9mIGNsaWNrczpcIiwgdGhpcy5udW1iZXJPZkNsaWNrcysrKTtcbiAgICogICB9XG4gICAqIH1cbiAgICpcbiAgICogQENvbXBvbmVudCh7XG4gICAqICAgc2VsZWN0b3I6ICdhcHAnLFxuICAgKiAgIHRlbXBsYXRlOiBgPGJ1dHRvbiBjb3VudGluZz5JbmNyZW1lbnQ8L2J1dHRvbj5gLFxuICAgKiAgIGRpcmVjdGl2ZXM6IFtDb3VudENsaWNrc11cbiAgICogfSlcbiAgICogY2xhc3MgQXBwIHt9XG4gICAqXG4gICAqIGJvb3RzdHJhcChBcHApO1xuICAgKiBgYGBcbiAgICpcbiAgICogIyMgSG9zdCBQcm9wZXJ0eSBCaW5kaW5nc1xuICAgKlxuICAgKiBTcGVjaWZpZXMgd2hpY2ggRE9NIHByb3BlcnRpZXMgYSBkaXJlY3RpdmUgdXBkYXRlcy5cbiAgICpcbiAgICogQW5ndWxhciBhdXRvbWF0aWNhbGx5IGNoZWNrcyBob3N0IHByb3BlcnR5IGJpbmRpbmdzIGR1cmluZyBjaGFuZ2UgZGV0ZWN0aW9uLlxuICAgKiBJZiBhIGJpbmRpbmcgY2hhbmdlcywgaXQgd2lsbCB1cGRhdGUgdGhlIGhvc3QgZWxlbWVudCBvZiB0aGUgZGlyZWN0aXZlLlxuICAgKlxuICAgKiAjIyMgRXhhbXBsZSAoW2xpdmUgZGVtb10oaHR0cDovL3BsbmtyLmNvL2VkaXQvZ05nMEVEP3A9cHJldmlldykpXG4gICAqXG4gICAqIFRoZSBmb2xsb3dpbmcgZXhhbXBsZSBjcmVhdGVzIGEgZGlyZWN0aXZlIHRoYXQgc2V0cyB0aGUgYHZhbGlkYCBhbmQgYGludmFsaWRgIGNsYXNzZXNcbiAgICogb24gdGhlIERPTSBlbGVtZW50IHRoYXQgaGFzIG5nTW9kZWwgZGlyZWN0aXZlIG9uIGl0LlxuICAgKlxuICAgKiBgYGB0eXBlc2NyaXB0XG4gICAqIEBEaXJlY3RpdmUoe1xuICAgKiAgIHNlbGVjdG9yOiAnW25nTW9kZWxdJyxcbiAgICogICBob3N0OiB7XG4gICAqICAgICAnW2NsYXNzLnZhbGlkXSc6ICd2YWxpZCcsXG4gICAqICAgICAnW2NsYXNzLmludmFsaWRdJzogJ2ludmFsaWQnXG4gICAqICAgfVxuICAgKiB9KVxuICAgKiBjbGFzcyBOZ01vZGVsU3RhdHVzIHtcbiAgICogICBjb25zdHJ1Y3RvcihwdWJsaWMgY29udHJvbDpOZ01vZGVsKSB7fVxuICAgKiAgIGdldCB2YWxpZCB7IHJldHVybiB0aGlzLmNvbnRyb2wudmFsaWQ7IH1cbiAgICogICBnZXQgaW52YWxpZCB7IHJldHVybiB0aGlzLmNvbnRyb2wuaW52YWxpZDsgfVxuICAgKiB9XG4gICAqXG4gICAqIEBDb21wb25lbnQoe1xuICAgKiAgIHNlbGVjdG9yOiAnYXBwJyxcbiAgICogICB0ZW1wbGF0ZTogYDxpbnB1dCBbKG5nTW9kZWwpXT1cInByb3BcIj5gLFxuICAgKiAgIGRpcmVjdGl2ZXM6IFtGT1JNX0RJUkVDVElWRVMsIE5nTW9kZWxTdGF0dXNdXG4gICAqIH0pXG4gICAqIGNsYXNzIEFwcCB7XG4gICAqICAgcHJvcDtcbiAgICogfVxuICAgKlxuICAgKiBib290c3RyYXAoQXBwKTtcbiAgICogYGBgXG4gICAqXG4gICAqICMjIEF0dHJpYnV0ZXNcbiAgICpcbiAgICogU3BlY2lmaWVzIHN0YXRpYyBhdHRyaWJ1dGVzIHRoYXQgc2hvdWxkIGJlIHByb3BhZ2F0ZWQgdG8gYSBob3N0IGVsZW1lbnQuXG4gICAqXG4gICAqICMjIyBFeGFtcGxlXG4gICAqXG4gICAqIEluIHRoaXMgZXhhbXBsZSB1c2luZyBgbXktYnV0dG9uYCBkaXJlY3RpdmUgKGV4LjogYDxkaXYgbXktYnV0dG9uPjwvZGl2PmApIG9uIGEgaG9zdCBlbGVtZW50XG4gICAqIChoZXJlOiBgPGRpdj5gICkgd2lsbCBlbnN1cmUgdGhhdCB0aGlzIGVsZW1lbnQgd2lsbCBnZXQgdGhlIFwiYnV0dG9uXCIgcm9sZS5cbiAgICpcbiAgICogYGBgdHlwZXNjcmlwdFxuICAgKiBARGlyZWN0aXZlKHtcbiAgICogICBzZWxlY3RvcjogJ1tteS1idXR0b25dJyxcbiAgICogICBob3N0OiB7XG4gICAqICAgICAncm9sZSc6ICdidXR0b24nXG4gICAqICAgfVxuICAgKiB9KVxuICAgKiBjbGFzcyBNeUJ1dHRvbiB7XG4gICAqIH1cbiAgICogYGBgXG4gICAqL1xuICBob3N0OiB7W2tleTogc3RyaW5nXTogc3RyaW5nfTtcblxuICAvKipcbiAgICogRGVmaW5lcyB0aGUgc2V0IG9mIGluamVjdGFibGUgb2JqZWN0cyB0aGF0IGFyZSB2aXNpYmxlIHRvIGEgRGlyZWN0aXZlIGFuZCBpdHMgbGlnaHQgRE9NXG4gICAqIGNoaWxkcmVuLlxuICAgKlxuICAgKiAjIyBTaW1wbGUgRXhhbXBsZVxuICAgKlxuICAgKiBIZXJlIGlzIGFuIGV4YW1wbGUgb2YgYSBjbGFzcyB0aGF0IGNhbiBiZSBpbmplY3RlZDpcbiAgICpcbiAgICogYGBgXG4gICAqIGNsYXNzIEdyZWV0ZXIge1xuICAgKiAgICBncmVldChuYW1lOnN0cmluZykge1xuICAgKiAgICAgIHJldHVybiAnSGVsbG8gJyArIG5hbWUgKyAnISc7XG4gICAqICAgIH1cbiAgICogfVxuICAgKlxuICAgKiBARGlyZWN0aXZlKHtcbiAgICogICBzZWxlY3RvcjogJ2dyZWV0JyxcbiAgICogICBiaW5kaW5nczogW1xuICAgKiAgICAgR3JlZXRlclxuICAgKiAgIF1cbiAgICogfSlcbiAgICogY2xhc3MgSGVsbG9Xb3JsZCB7XG4gICAqICAgZ3JlZXRlcjpHcmVldGVyO1xuICAgKlxuICAgKiAgIGNvbnN0cnVjdG9yKGdyZWV0ZXI6R3JlZXRlcikge1xuICAgKiAgICAgdGhpcy5ncmVldGVyID0gZ3JlZXRlcjtcbiAgICogICB9XG4gICAqIH1cbiAgICogYGBgXG4gICAqL1xuICBnZXQgcHJvdmlkZXJzKCk6IGFueVtdIHtcbiAgICByZXR1cm4gaXNQcmVzZW50KHRoaXMuX2JpbmRpbmdzKSAmJiB0aGlzLl9iaW5kaW5ncy5sZW5ndGggPiAwID8gdGhpcy5fYmluZGluZ3MgOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLl9wcm92aWRlcnM7XG4gIH1cbiAgLyoqIEBkZXByZWNhdGVkICovXG4gIGdldCBiaW5kaW5ncygpOiBhbnlbXSB7IHJldHVybiB0aGlzLnByb3ZpZGVyczsgfVxuICBwcml2YXRlIF9wcm92aWRlcnM6IGFueVtdO1xuICBwcml2YXRlIF9iaW5kaW5nczogYW55W107XG5cbiAgLyoqXG4gICAqIERlZmluZXMgdGhlIG5hbWUgdGhhdCBjYW4gYmUgdXNlZCBpbiB0aGUgdGVtcGxhdGUgdG8gYXNzaWduIHRoaXMgZGlyZWN0aXZlIHRvIGEgdmFyaWFibGUuXG4gICAqXG4gICAqICMjIFNpbXBsZSBFeGFtcGxlXG4gICAqXG4gICAqIGBgYFxuICAgKiBARGlyZWN0aXZlKHtcbiAgICogICBzZWxlY3RvcjogJ2NoaWxkLWRpcicsXG4gICAqICAgZXhwb3J0QXM6ICdjaGlsZCdcbiAgICogfSlcbiAgICogY2xhc3MgQ2hpbGREaXIge1xuICAgKiB9XG4gICAqXG4gICAqIEBDb21wb25lbnQoe1xuICAgKiAgIHNlbGVjdG9yOiAnbWFpbicsXG4gICAqICAgdGVtcGxhdGU6IGA8Y2hpbGQtZGlyICNjPVwiY2hpbGRcIj48L2NoaWxkLWRpcj5gLFxuICAgKiAgIGRpcmVjdGl2ZXM6IFtDaGlsZERpcl1cbiAgICogfSlcbiAgICogY2xhc3MgTWFpbkNvbXBvbmVudCB7XG4gICAqIH1cbiAgICpcbiAgICogYGBgXG4gICAqL1xuICBleHBvcnRBczogc3RyaW5nO1xuXG4gIC8vIFRPRE86IGFkZCBhbiBleGFtcGxlIGFmdGVyIENvbnRlbnRDaGlsZHJlbiBhbmQgVmlld0NoaWxkcmVuIGFyZSBpbiBtYXN0ZXJcbiAgLyoqXG4gICAqIENvbmZpZ3VyZXMgdGhlIHF1ZXJpZXMgdGhhdCB3aWxsIGJlIGluamVjdGVkIGludG8gdGhlIGRpcmVjdGl2ZS5cbiAgICpcbiAgICogQ29udGVudCBxdWVyaWVzIGFyZSBzZXQgYmVmb3JlIHRoZSBgbmdBZnRlckNvbnRlbnRJbml0YCBjYWxsYmFjayBpcyBjYWxsZWQuXG4gICAqIFZpZXcgcXVlcmllcyBhcmUgc2V0IGJlZm9yZSB0aGUgYG5nQWZ0ZXJWaWV3SW5pdGAgY2FsbGJhY2sgaXMgY2FsbGVkLlxuICAgKlxuICAgKiAjIyMgRXhhbXBsZVxuICAgKlxuICAgKiBgYGBcbiAgICogQENvbXBvbmVudCh7XG4gICAqICAgc2VsZWN0b3I6ICdzb21lRGlyJyxcbiAgICogICBxdWVyaWVzOiB7XG4gICAqICAgICBjb250ZW50Q2hpbGRyZW46IG5ldyBDb250ZW50Q2hpbGRyZW4oQ2hpbGREaXJlY3RpdmUpLFxuICAgKiAgICAgdmlld0NoaWxkcmVuOiBuZXcgVmlld0NoaWxkcmVuKENoaWxkRGlyZWN0aXZlKVxuICAgKiAgIH0sXG4gICAqICAgdGVtcGxhdGU6ICc8Y2hpbGQtZGlyZWN0aXZlPjwvY2hpbGQtZGlyZWN0aXZlPicsXG4gICAqICAgZGlyZWN0aXZlczogW0NoaWxkRGlyZWN0aXZlXVxuICAgKiB9KVxuICAgKiBjbGFzcyBTb21lRGlyIHtcbiAgICogICBjb250ZW50Q2hpbGRyZW46IFF1ZXJ5TGlzdDxDaGlsZERpcmVjdGl2ZT4sXG4gICAqICAgdmlld0NoaWxkcmVuOiBRdWVyeUxpc3Q8Q2hpbGREaXJlY3RpdmU+XG4gICAqXG4gICAqICAgbmdBZnRlckNvbnRlbnRJbml0KCkge1xuICAgKiAgICAgLy8gY29udGVudENoaWxkcmVuIGlzIHNldFxuICAgKiAgIH1cbiAgICpcbiAgICogICBuZ0FmdGVyVmlld0luaXQoKSB7XG4gICAqICAgICAvLyB2aWV3Q2hpbGRyZW4gaXMgc2V0XG4gICAqICAgfVxuICAgKiB9XG4gICAqIGBgYFxuICAgKi9cbiAgcXVlcmllczoge1trZXk6IHN0cmluZ106IGFueX07XG5cbiAgY29uc3RydWN0b3Ioe3NlbGVjdG9yLCBpbnB1dHMsIG91dHB1dHMsIHByb3BlcnRpZXMsIGV2ZW50cywgaG9zdCwgYmluZGluZ3MsIHByb3ZpZGVycywgZXhwb3J0QXMsXG4gICAgICAgICAgICAgICBxdWVyaWVzfToge1xuICAgIHNlbGVjdG9yPzogc3RyaW5nLFxuICAgIGlucHV0cz86IHN0cmluZ1tdLFxuICAgIG91dHB1dHM/OiBzdHJpbmdbXSxcbiAgICBwcm9wZXJ0aWVzPzogc3RyaW5nW10sXG4gICAgZXZlbnRzPzogc3RyaW5nW10sXG4gICAgaG9zdD86IHtba2V5OiBzdHJpbmddOiBzdHJpbmd9LFxuICAgIHByb3ZpZGVycz86IGFueVtdLFxuICAgIC8qKiBAZGVwcmVjYXRlZCAqLyBiaW5kaW5ncz86IGFueVtdLFxuICAgIGV4cG9ydEFzPzogc3RyaW5nLFxuICAgIHF1ZXJpZXM/OiB7W2tleTogc3RyaW5nXTogYW55fVxuICB9ID0ge30pIHtcbiAgICBzdXBlcigpO1xuICAgIHRoaXMuc2VsZWN0b3IgPSBzZWxlY3RvcjtcbiAgICB0aGlzLl9pbnB1dHMgPSBpbnB1dHM7XG4gICAgdGhpcy5fcHJvcGVydGllcyA9IHByb3BlcnRpZXM7XG4gICAgdGhpcy5fb3V0cHV0cyA9IG91dHB1dHM7XG4gICAgdGhpcy5fZXZlbnRzID0gZXZlbnRzO1xuICAgIHRoaXMuaG9zdCA9IGhvc3Q7XG4gICAgdGhpcy5leHBvcnRBcyA9IGV4cG9ydEFzO1xuICAgIHRoaXMucXVlcmllcyA9IHF1ZXJpZXM7XG4gICAgdGhpcy5fcHJvdmlkZXJzID0gcHJvdmlkZXJzO1xuICAgIHRoaXMuX2JpbmRpbmdzID0gYmluZGluZ3M7XG4gIH1cbn1cblxuLyoqXG4gKiBEZWNsYXJlIHJldXNhYmxlIFVJIGJ1aWxkaW5nIGJsb2NrcyBmb3IgYW4gYXBwbGljYXRpb24uXG4gKlxuICogRWFjaCBBbmd1bGFyIGNvbXBvbmVudCByZXF1aXJlcyBhIHNpbmdsZSBgQENvbXBvbmVudGAgYW5ub3RhdGlvbi4gVGhlXG4gKiBgQENvbXBvbmVudGBcbiAqIGFubm90YXRpb24gc3BlY2lmaWVzIHdoZW4gYSBjb21wb25lbnQgaXMgaW5zdGFudGlhdGVkLCBhbmQgd2hpY2ggcHJvcGVydGllcyBhbmQgaG9zdExpc3RlbmVycyBpdFxuICogYmluZHMgdG8uXG4gKlxuICogV2hlbiBhIGNvbXBvbmVudCBpcyBpbnN0YW50aWF0ZWQsIEFuZ3VsYXJcbiAqIC0gY3JlYXRlcyBhIHNoYWRvdyBET00gZm9yIHRoZSBjb21wb25lbnQuXG4gKiAtIGxvYWRzIHRoZSBzZWxlY3RlZCB0ZW1wbGF0ZSBpbnRvIHRoZSBzaGFkb3cgRE9NLlxuICogLSBjcmVhdGVzIGFsbCB0aGUgaW5qZWN0YWJsZSBvYmplY3RzIGNvbmZpZ3VyZWQgd2l0aCBgcHJvdmlkZXJzYCBhbmQgYHZpZXdQcm92aWRlcnNgLlxuICpcbiAqIEFsbCB0ZW1wbGF0ZSBleHByZXNzaW9ucyBhbmQgc3RhdGVtZW50cyBhcmUgdGhlbiBldmFsdWF0ZWQgYWdhaW5zdCB0aGUgY29tcG9uZW50IGluc3RhbmNlLlxuICpcbiAqIEZvciBkZXRhaWxzIG9uIHRoZSBgQFZpZXdgIGFubm90YXRpb24sIHNlZSB7QGxpbmsgVmlld01ldGFkYXRhfS5cbiAqXG4gKiAjIyBMaWZlY3ljbGUgaG9va3NcbiAqXG4gKiBXaGVuIHRoZSBjb21wb25lbnQgY2xhc3MgaW1wbGVtZW50cyBzb21lIHtAbGluayAuLi8uLi9ndWlkZS9saWZlY3ljbGUtaG9va3MuaHRtbH0gdGhlIGNhbGxiYWNrc1xuICogYXJlIGNhbGxlZCBieSB0aGUgY2hhbmdlIGRldGVjdGlvbiBhdCBkZWZpbmVkIHBvaW50cyBpbiB0aW1lIGR1cmluZyB0aGUgbGlmZSBvZiB0aGUgY29tcG9uZW50LlxuICpcbiAqICMjIyBFeGFtcGxlXG4gKlxuICoge0BleGFtcGxlIGNvcmUvdHMvbWV0YWRhdGEvbWV0YWRhdGEudHMgcmVnaW9uPSdjb21wb25lbnQnfVxuICogQHRzMmRhcnRfY29uc3RcbiAqL1xuZXhwb3J0IGNsYXNzIENvbXBvbmVudE1ldGFkYXRhIGV4dGVuZHMgRGlyZWN0aXZlTWV0YWRhdGEge1xuICAvKipcbiAgICogRGVmaW5lcyB0aGUgdXNlZCBjaGFuZ2UgZGV0ZWN0aW9uIHN0cmF0ZWd5LlxuICAgKlxuICAgKiBXaGVuIGEgY29tcG9uZW50IGlzIGluc3RhbnRpYXRlZCwgQW5ndWxhciBjcmVhdGVzIGEgY2hhbmdlIGRldGVjdG9yLCB3aGljaCBpcyByZXNwb25zaWJsZSBmb3JcbiAgICogcHJvcGFnYXRpbmcgdGhlIGNvbXBvbmVudCdzIGJpbmRpbmdzLlxuICAgKlxuICAgKiBUaGUgYGNoYW5nZURldGVjdGlvbmAgcHJvcGVydHkgZGVmaW5lcywgd2hldGhlciB0aGUgY2hhbmdlIGRldGVjdGlvbiB3aWxsIGJlIGNoZWNrZWQgZXZlcnkgdGltZVxuICAgKiBvciBvbmx5IHdoZW4gdGhlIGNvbXBvbmVudCB0ZWxscyBpdCB0byBkbyBzby5cbiAgICovXG4gIGNoYW5nZURldGVjdGlvbjogQ2hhbmdlRGV0ZWN0aW9uU3RyYXRlZ3k7XG5cbiAgLyoqXG4gICAqIERlZmluZXMgdGhlIHNldCBvZiBpbmplY3RhYmxlIG9iamVjdHMgdGhhdCBhcmUgdmlzaWJsZSB0byBpdHMgdmlldyBET00gY2hpbGRyZW4uXG4gICAqXG4gICAqICMjIFNpbXBsZSBFeGFtcGxlXG4gICAqXG4gICAqIEhlcmUgaXMgYW4gZXhhbXBsZSBvZiBhIGNsYXNzIHRoYXQgY2FuIGJlIGluamVjdGVkOlxuICAgKlxuICAgKiBgYGBcbiAgICogY2xhc3MgR3JlZXRlciB7XG4gICAqICAgIGdyZWV0KG5hbWU6c3RyaW5nKSB7XG4gICAqICAgICAgcmV0dXJuICdIZWxsbyAnICsgbmFtZSArICchJztcbiAgICogICAgfVxuICAgKiB9XG4gICAqXG4gICAqIEBEaXJlY3RpdmUoe1xuICAgKiAgIHNlbGVjdG9yOiAnbmVlZHMtZ3JlZXRlcidcbiAgICogfSlcbiAgICogY2xhc3MgTmVlZHNHcmVldGVyIHtcbiAgICogICBncmVldGVyOkdyZWV0ZXI7XG4gICAqXG4gICAqICAgY29uc3RydWN0b3IoZ3JlZXRlcjpHcmVldGVyKSB7XG4gICAqICAgICB0aGlzLmdyZWV0ZXIgPSBncmVldGVyO1xuICAgKiAgIH1cbiAgICogfVxuICAgKlxuICAgKiBAQ29tcG9uZW50KHtcbiAgICogICBzZWxlY3RvcjogJ2dyZWV0JyxcbiAgICogICB2aWV3UHJvdmlkZXJzOiBbXG4gICAqICAgICBHcmVldGVyXG4gICAqICAgXSxcbiAgICogICB0ZW1wbGF0ZTogYDxuZWVkcy1ncmVldGVyPjwvbmVlZHMtZ3JlZXRlcj5gLFxuICAgKiAgIGRpcmVjdGl2ZXM6IFtOZWVkc0dyZWV0ZXJdXG4gICAqIH0pXG4gICAqIGNsYXNzIEhlbGxvV29ybGQge1xuICAgKiB9XG4gICAqXG4gICAqIGBgYFxuICAgKi9cbiAgZ2V0IHZpZXdQcm92aWRlcnMoKTogYW55W10ge1xuICAgIHJldHVybiBpc1ByZXNlbnQodGhpcy5fdmlld0JpbmRpbmdzKSAmJiB0aGlzLl92aWV3QmluZGluZ3MubGVuZ3RoID4gMCA/IHRoaXMuX3ZpZXdCaW5kaW5ncyA6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5fdmlld1Byb3ZpZGVycztcbiAgfVxuICBnZXQgdmlld0JpbmRpbmdzKCk6IGFueVtdIHsgcmV0dXJuIHRoaXMudmlld1Byb3ZpZGVyczsgfVxuICBwcml2YXRlIF92aWV3UHJvdmlkZXJzOiBhbnlbXTtcbiAgcHJpdmF0ZSBfdmlld0JpbmRpbmdzOiBhbnlbXTtcblxuICAvKipcbiAgICogVGhlIG1vZHVsZSBpZCBvZiB0aGUgbW9kdWxlIHRoYXQgY29udGFpbnMgdGhlIGNvbXBvbmVudC5cbiAgICogTmVlZGVkIHRvIGJlIGFibGUgdG8gcmVzb2x2ZSByZWxhdGl2ZSB1cmxzIGZvciB0ZW1wbGF0ZXMgYW5kIHN0eWxlcy5cbiAgICogSW4gRGFydCwgdGhpcyBjYW4gYmUgZGV0ZXJtaW5lZCBhdXRvbWF0aWNhbGx5IGFuZCBkb2VzIG5vdCBuZWVkIHRvIGJlIHNldC5cbiAgICogSW4gQ29tbW9uSlMsIHRoaXMgY2FuIGFsd2F5cyBiZSBzZXQgdG8gYG1vZHVsZS5pZGAuXG4gICAqXG4gICAqICMjIFNpbXBsZSBFeGFtcGxlXG4gICAqXG4gICAqIGBgYFxuICAgKiBARGlyZWN0aXZlKHtcbiAgICogICBzZWxlY3RvcjogJ3NvbWVEaXInLFxuICAgKiAgIG1vZHVsZUlkOiBtb2R1bGUuaWRcbiAgICogfSlcbiAgICogY2xhc3MgU29tZURpciB7XG4gICAqIH1cbiAgICpcbiAgICogYGBgXG4gICAqL1xuICBtb2R1bGVJZDogc3RyaW5nO1xuXG4gIHRlbXBsYXRlVXJsOiBzdHJpbmc7XG5cbiAgdGVtcGxhdGU6IHN0cmluZztcblxuICBzdHlsZVVybHM6IHN0cmluZ1tdO1xuXG4gIHN0eWxlczogc3RyaW5nW107XG5cbiAgZGlyZWN0aXZlczogQXJyYXk8VHlwZSB8IGFueVtdPjtcblxuICBwaXBlczogQXJyYXk8VHlwZSB8IGFueVtdPjtcblxuICBlbmNhcHN1bGF0aW9uOiBWaWV3RW5jYXBzdWxhdGlvbjtcblxuICBjb25zdHJ1Y3Rvcih7c2VsZWN0b3IsIGlucHV0cywgb3V0cHV0cywgcHJvcGVydGllcywgZXZlbnRzLCBob3N0LCBleHBvcnRBcywgbW9kdWxlSWQsIGJpbmRpbmdzLFxuICAgICAgICAgICAgICAgcHJvdmlkZXJzLCB2aWV3QmluZGluZ3MsIHZpZXdQcm92aWRlcnMsXG4gICAgICAgICAgICAgICBjaGFuZ2VEZXRlY3Rpb24gPSBDaGFuZ2VEZXRlY3Rpb25TdHJhdGVneS5EZWZhdWx0LCBxdWVyaWVzLCB0ZW1wbGF0ZVVybCwgdGVtcGxhdGUsXG4gICAgICAgICAgICAgICBzdHlsZVVybHMsIHN0eWxlcywgZGlyZWN0aXZlcywgcGlwZXMsIGVuY2Fwc3VsYXRpb259OiB7XG4gICAgc2VsZWN0b3I/OiBzdHJpbmcsXG4gICAgaW5wdXRzPzogc3RyaW5nW10sXG4gICAgb3V0cHV0cz86IHN0cmluZ1tdLFxuICAgIHByb3BlcnRpZXM/OiBzdHJpbmdbXSxcbiAgICBldmVudHM/OiBzdHJpbmdbXSxcbiAgICBob3N0Pzoge1trZXk6IHN0cmluZ106IHN0cmluZ30sXG4gICAgLyoqIEBkZXByZWNhdGVkICovIGJpbmRpbmdzPzogYW55W10sXG4gICAgcHJvdmlkZXJzPzogYW55W10sXG4gICAgZXhwb3J0QXM/OiBzdHJpbmcsXG4gICAgbW9kdWxlSWQ/OiBzdHJpbmcsXG4gICAgLyoqIEBkZXByZWNhdGVkICovIHZpZXdCaW5kaW5ncz86IGFueVtdLFxuICAgIHZpZXdQcm92aWRlcnM/OiBhbnlbXSxcbiAgICBxdWVyaWVzPzoge1trZXk6IHN0cmluZ106IGFueX0sXG4gICAgY2hhbmdlRGV0ZWN0aW9uPzogQ2hhbmdlRGV0ZWN0aW9uU3RyYXRlZ3ksXG4gICAgdGVtcGxhdGVVcmw/OiBzdHJpbmcsXG4gICAgdGVtcGxhdGU/OiBzdHJpbmcsXG4gICAgc3R5bGVVcmxzPzogc3RyaW5nW10sXG4gICAgc3R5bGVzPzogc3RyaW5nW10sXG4gICAgZGlyZWN0aXZlcz86IEFycmF5PFR5cGUgfCBhbnlbXT4sXG4gICAgcGlwZXM/OiBBcnJheTxUeXBlIHwgYW55W10+LFxuICAgIGVuY2Fwc3VsYXRpb24/OiBWaWV3RW5jYXBzdWxhdGlvblxuICB9ID0ge30pIHtcbiAgICBzdXBlcih7XG4gICAgICBzZWxlY3Rvcjogc2VsZWN0b3IsXG4gICAgICBpbnB1dHM6IGlucHV0cyxcbiAgICAgIG91dHB1dHM6IG91dHB1dHMsXG4gICAgICBwcm9wZXJ0aWVzOiBwcm9wZXJ0aWVzLFxuICAgICAgZXZlbnRzOiBldmVudHMsXG4gICAgICBob3N0OiBob3N0LFxuICAgICAgZXhwb3J0QXM6IGV4cG9ydEFzLFxuICAgICAgYmluZGluZ3M6IGJpbmRpbmdzLFxuICAgICAgcHJvdmlkZXJzOiBwcm92aWRlcnMsXG4gICAgICBxdWVyaWVzOiBxdWVyaWVzXG4gICAgfSk7XG5cbiAgICB0aGlzLmNoYW5nZURldGVjdGlvbiA9IGNoYW5nZURldGVjdGlvbjtcbiAgICB0aGlzLl92aWV3UHJvdmlkZXJzID0gdmlld1Byb3ZpZGVycztcbiAgICB0aGlzLl92aWV3QmluZGluZ3MgPSB2aWV3QmluZGluZ3M7XG4gICAgdGhpcy50ZW1wbGF0ZVVybCA9IHRlbXBsYXRlVXJsO1xuICAgIHRoaXMudGVtcGxhdGUgPSB0ZW1wbGF0ZTtcbiAgICB0aGlzLnN0eWxlVXJscyA9IHN0eWxlVXJscztcbiAgICB0aGlzLnN0eWxlcyA9IHN0eWxlcztcbiAgICB0aGlzLmRpcmVjdGl2ZXMgPSBkaXJlY3RpdmVzO1xuICAgIHRoaXMucGlwZXMgPSBwaXBlcztcbiAgICB0aGlzLmVuY2Fwc3VsYXRpb24gPSBlbmNhcHN1bGF0aW9uO1xuICAgIHRoaXMubW9kdWxlSWQgPSBtb2R1bGVJZDtcbiAgfVxufVxuXG4vKipcbiAqIERlY2xhcmUgcmV1c2FibGUgcGlwZSBmdW5jdGlvbi5cbiAqXG4gKiBBIFwicHVyZVwiIHBpcGUgaXMgb25seSByZS1ldmFsdWF0ZWQgd2hlbiBlaXRoZXIgdGhlIGlucHV0IG9yIGFueSBvZiB0aGUgYXJndW1lbnRzIGNoYW5nZS5cbiAqXG4gKiBXaGVuIG5vdCBzcGVjaWZpZWQsIHBpcGVzIGRlZmF1bHQgdG8gYmVpbmcgcHVyZS5cbiAqXG4gKiAjIyMgRXhhbXBsZVxuICpcbiAqIHtAZXhhbXBsZSBjb3JlL3RzL21ldGFkYXRhL21ldGFkYXRhLnRzIHJlZ2lvbj0ncGlwZSd9XG4gKiBAdHMyZGFydF9jb25zdFxuICovXG5leHBvcnQgY2xhc3MgUGlwZU1ldGFkYXRhIGV4dGVuZHMgSW5qZWN0YWJsZU1ldGFkYXRhIHtcbiAgbmFtZTogc3RyaW5nO1xuICAvKiogQGludGVybmFsICovXG4gIF9wdXJlOiBib29sZWFuO1xuXG4gIGNvbnN0cnVjdG9yKHtuYW1lLCBwdXJlfToge25hbWU6IHN0cmluZywgcHVyZT86IGJvb2xlYW59KSB7XG4gICAgc3VwZXIoKTtcbiAgICB0aGlzLm5hbWUgPSBuYW1lO1xuICAgIHRoaXMuX3B1cmUgPSBwdXJlO1xuICB9XG5cbiAgZ2V0IHB1cmUoKTogYm9vbGVhbiB7IHJldHVybiBpc1ByZXNlbnQodGhpcy5fcHVyZSkgPyB0aGlzLl9wdXJlIDogdHJ1ZTsgfVxufVxuXG4vKipcbiAqIERlY2xhcmVzIGEgZGF0YS1ib3VuZCBpbnB1dCBwcm9wZXJ0eS5cbiAqXG4gKiBBbmd1bGFyIGF1dG9tYXRpY2FsbHkgdXBkYXRlcyBkYXRhLWJvdW5kIHByb3BlcnRpZXMgZHVyaW5nIGNoYW5nZSBkZXRlY3Rpb24uXG4gKlxuICogYElucHV0TWV0YWRhdGFgIHRha2VzIGFuIG9wdGlvbmFsIHBhcmFtZXRlciB0aGF0IHNwZWNpZmllcyB0aGUgbmFtZVxuICogdXNlZCB3aGVuIGluc3RhbnRpYXRpbmcgYSBjb21wb25lbnQgaW4gdGhlIHRlbXBsYXRlLiBXaGVuIG5vdCBwcm92aWRlZCxcbiAqIHRoZSBuYW1lIG9mIHRoZSBkZWNvcmF0ZWQgcHJvcGVydHkgaXMgdXNlZC5cbiAqXG4gKiAjIyMgRXhhbXBsZVxuICpcbiAqIFRoZSBmb2xsb3dpbmcgZXhhbXBsZSBjcmVhdGVzIGEgY29tcG9uZW50IHdpdGggdHdvIGlucHV0IHByb3BlcnRpZXMuXG4gKlxuICogYGBgdHlwZXNjcmlwdFxuICogQENvbXBvbmVudCh7XG4gKiAgIHNlbGVjdG9yOiAnYmFuay1hY2NvdW50JyxcbiAqICAgdGVtcGxhdGU6IGBcbiAqICAgICBCYW5rIE5hbWU6IHt7YmFua05hbWV9fVxuICogICAgIEFjY291bnQgSWQ6IHt7aWR9fVxuICogICBgXG4gKiB9KVxuICogY2xhc3MgQmFua0FjY291bnQge1xuICogICBASW5wdXQoKSBiYW5rTmFtZTogc3RyaW5nO1xuICogICBASW5wdXQoJ2FjY291bnQtaWQnKSBpZDogc3RyaW5nO1xuICpcbiAqICAgLy8gdGhpcyBwcm9wZXJ0eSBpcyBub3QgYm91bmQsIGFuZCB3b24ndCBiZSBhdXRvbWF0aWNhbGx5IHVwZGF0ZWQgYnkgQW5ndWxhclxuICogICBub3JtYWxpemVkQmFua05hbWU6IHN0cmluZztcbiAqIH1cbiAqXG4gKiBAQ29tcG9uZW50KHtcbiAqICAgc2VsZWN0b3I6ICdhcHAnLFxuICogICB0ZW1wbGF0ZTogYFxuICogICAgIDxiYW5rLWFjY291bnQgYmFuay1uYW1lPVwiUkJDXCIgYWNjb3VudC1pZD1cIjQ3NDdcIj48L2JhbmstYWNjb3VudD5cbiAqICAgYCxcbiAqICAgZGlyZWN0aXZlczogW0JhbmtBY2NvdW50XVxuICogfSlcbiAqIGNsYXNzIEFwcCB7fVxuICpcbiAqIGJvb3RzdHJhcChBcHApO1xuICogYGBgXG4gKiBAdHMyZGFydF9jb25zdFxuICovXG5leHBvcnQgY2xhc3MgSW5wdXRNZXRhZGF0YSB7XG4gIGNvbnN0cnVjdG9yKFxuICAgICAgLyoqXG4gICAgICAgKiBOYW1lIHVzZWQgd2hlbiBpbnN0YW50aWF0aW5nIGEgY29tcG9uZW50IGluIHRoZSB0ZW1wbGF0ZS5cbiAgICAgICAqL1xuICAgICAgcHVibGljIGJpbmRpbmdQcm9wZXJ0eU5hbWU/OiBzdHJpbmcpIHt9XG59XG5cbi8qKlxuICogRGVjbGFyZXMgYW4gZXZlbnQtYm91bmQgb3V0cHV0IHByb3BlcnR5LlxuICpcbiAqIFdoZW4gYW4gb3V0cHV0IHByb3BlcnR5IGVtaXRzIGFuIGV2ZW50LCBhbiBldmVudCBoYW5kbGVyIGF0dGFjaGVkIHRvIHRoYXQgZXZlbnRcbiAqIHRoZSB0ZW1wbGF0ZSBpcyBpbnZva2VkLlxuICpcbiAqIGBPdXRwdXRNZXRhZGF0YWAgdGFrZXMgYW4gb3B0aW9uYWwgcGFyYW1ldGVyIHRoYXQgc3BlY2lmaWVzIHRoZSBuYW1lXG4gKiB1c2VkIHdoZW4gaW5zdGFudGlhdGluZyBhIGNvbXBvbmVudCBpbiB0aGUgdGVtcGxhdGUuIFdoZW4gbm90IHByb3ZpZGVkLFxuICogdGhlIG5hbWUgb2YgdGhlIGRlY29yYXRlZCBwcm9wZXJ0eSBpcyB1c2VkLlxuICpcbiAqICMjIyBFeGFtcGxlXG4gKlxuICogYGBgdHlwZXNjcmlwdFxuICogQERpcmVjdGl2ZSh7XG4gKiAgIHNlbGVjdG9yOiAnaW50ZXJ2YWwtZGlyJyxcbiAqIH0pXG4gKiBjbGFzcyBJbnRlcnZhbERpciB7XG4gKiAgIEBPdXRwdXQoKSBldmVyeVNlY29uZCA9IG5ldyBFdmVudEVtaXR0ZXIoKTtcbiAqICAgQE91dHB1dCgnZXZlcnlGaXZlU2Vjb25kcycpIGZpdmU1U2VjcyA9IG5ldyBFdmVudEVtaXR0ZXIoKTtcbiAqXG4gKiAgIGNvbnN0cnVjdG9yKCkge1xuICogICAgIHNldEludGVydmFsKCgpID0+IHRoaXMuZXZlcnlTZWNvbmQuZW1pdChcImV2ZW50XCIpLCAxMDAwKTtcbiAqICAgICBzZXRJbnRlcnZhbCgoKSA9PiB0aGlzLmZpdmU1U2Vjcy5lbWl0KFwiZXZlbnRcIiksIDUwMDApO1xuICogICB9XG4gKiB9XG4gKlxuICogQENvbXBvbmVudCh7XG4gKiAgIHNlbGVjdG9yOiAnYXBwJyxcbiAqICAgdGVtcGxhdGU6IGBcbiAqICAgICA8aW50ZXJ2YWwtZGlyIChldmVyeVNlY29uZCk9XCJldmVyeVNlY29uZCgpXCIgKGV2ZXJ5Rml2ZVNlY29uZHMpPVwiZXZlcnlGaXZlU2Vjb25kcygpXCI+XG4gKiAgICAgPC9pbnRlcnZhbC1kaXI+XG4gKiAgIGAsXG4gKiAgIGRpcmVjdGl2ZXM6IFtJbnRlcnZhbERpcl1cbiAqIH0pXG4gKiBjbGFzcyBBcHAge1xuICogICBldmVyeVNlY29uZCgpIHsgY29uc29sZS5sb2coJ3NlY29uZCcpOyB9XG4gKiAgIGV2ZXJ5Rml2ZVNlY29uZHMoKSB7IGNvbnNvbGUubG9nKCdmaXZlIHNlY29uZHMnKTsgfVxuICogfVxuICogYm9vdHN0cmFwKEFwcCk7XG4gKiBgYGBcbiAqIEB0czJkYXJ0X2NvbnN0XG4gKi9cbmV4cG9ydCBjbGFzcyBPdXRwdXRNZXRhZGF0YSB7XG4gIGNvbnN0cnVjdG9yKHB1YmxpYyBiaW5kaW5nUHJvcGVydHlOYW1lPzogc3RyaW5nKSB7fVxufVxuXG4vKipcbiAqIERlY2xhcmVzIGEgaG9zdCBwcm9wZXJ0eSBiaW5kaW5nLlxuICpcbiAqIEFuZ3VsYXIgYXV0b21hdGljYWxseSBjaGVja3MgaG9zdCBwcm9wZXJ0eSBiaW5kaW5ncyBkdXJpbmcgY2hhbmdlIGRldGVjdGlvbi5cbiAqIElmIGEgYmluZGluZyBjaGFuZ2VzLCBpdCB3aWxsIHVwZGF0ZSB0aGUgaG9zdCBlbGVtZW50IG9mIHRoZSBkaXJlY3RpdmUuXG4gKlxuICogYEhvc3RCaW5kaW5nTWV0YWRhdGFgIHRha2VzIGFuIG9wdGlvbmFsIHBhcmFtZXRlciB0aGF0IHNwZWNpZmllcyB0aGUgcHJvcGVydHlcbiAqIG5hbWUgb2YgdGhlIGhvc3QgZWxlbWVudCB0aGF0IHdpbGwgYmUgdXBkYXRlZC4gV2hlbiBub3QgcHJvdmlkZWQsXG4gKiB0aGUgY2xhc3MgcHJvcGVydHkgbmFtZSBpcyB1c2VkLlxuICpcbiAqICMjIyBFeGFtcGxlXG4gKlxuICogVGhlIGZvbGxvd2luZyBleGFtcGxlIGNyZWF0ZXMgYSBkaXJlY3RpdmUgdGhhdCBzZXRzIHRoZSBgdmFsaWRgIGFuZCBgaW52YWxpZGAgY2xhc3Nlc1xuICogb24gdGhlIERPTSBlbGVtZW50IHRoYXQgaGFzIG5nTW9kZWwgZGlyZWN0aXZlIG9uIGl0LlxuICpcbiAqIGBgYHR5cGVzY3JpcHRcbiAqIEBEaXJlY3RpdmUoe3NlbGVjdG9yOiAnW25nTW9kZWxdJ30pXG4gKiBjbGFzcyBOZ01vZGVsU3RhdHVzIHtcbiAqICAgY29uc3RydWN0b3IocHVibGljIGNvbnRyb2w6TmdNb2RlbCkge31cbiAqICAgQEhvc3RCaW5kaW5nKCdjbGFzcy52YWxpZCcpIGdldCB2YWxpZCB7IHJldHVybiB0aGlzLmNvbnRyb2wudmFsaWQ7IH1cbiAqICAgQEhvc3RCaW5kaW5nKCdjbGFzcy5pbnZhbGlkJykgZ2V0IGludmFsaWQgeyByZXR1cm4gdGhpcy5jb250cm9sLmludmFsaWQ7IH1cbiAqIH1cbiAqXG4gKiBAQ29tcG9uZW50KHtcbiAqICAgc2VsZWN0b3I6ICdhcHAnLFxuICogICB0ZW1wbGF0ZTogYDxpbnB1dCBbKG5nTW9kZWwpXT1cInByb3BcIj5gLFxuICogICBkaXJlY3RpdmVzOiBbRk9STV9ESVJFQ1RJVkVTLCBOZ01vZGVsU3RhdHVzXVxuICogfSlcbiAqIGNsYXNzIEFwcCB7XG4gKiAgIHByb3A7XG4gKiB9XG4gKlxuICogYm9vdHN0cmFwKEFwcCk7XG4gKiBgYGBcbiAqIEB0czJkYXJ0X2NvbnN0XG4gKi9cbmV4cG9ydCBjbGFzcyBIb3N0QmluZGluZ01ldGFkYXRhIHtcbiAgY29uc3RydWN0b3IocHVibGljIGhvc3RQcm9wZXJ0eU5hbWU/OiBzdHJpbmcpIHt9XG59XG5cbi8qKlxuICogRGVjbGFyZXMgYSBob3N0IGxpc3RlbmVyLlxuICpcbiAqIEFuZ3VsYXIgd2lsbCBpbnZva2UgdGhlIGRlY29yYXRlZCBtZXRob2Qgd2hlbiB0aGUgaG9zdCBlbGVtZW50IGVtaXRzIHRoZSBzcGVjaWZpZWQgZXZlbnQuXG4gKlxuICogSWYgdGhlIGRlY29yYXRlZCBtZXRob2QgcmV0dXJucyBgZmFsc2VgLCB0aGVuIGBwcmV2ZW50RGVmYXVsdGAgaXMgYXBwbGllZCBvbiB0aGUgRE9NXG4gKiBldmVudC5cbiAqXG4gKiAjIyMgRXhhbXBsZVxuICpcbiAqIFRoZSBmb2xsb3dpbmcgZXhhbXBsZSBkZWNsYXJlcyBhIGRpcmVjdGl2ZSB0aGF0IGF0dGFjaGVzIGEgY2xpY2sgbGlzdGVuZXIgdG8gdGhlIGJ1dHRvbiBhbmRcbiAqIGNvdW50cyBjbGlja3MuXG4gKlxuICogYGBgdHlwZXNjcmlwdFxuICogQERpcmVjdGl2ZSh7c2VsZWN0b3I6ICdidXR0b25bY291bnRpbmddJ30pXG4gKiBjbGFzcyBDb3VudENsaWNrcyB7XG4gKiAgIG51bWJlck9mQ2xpY2tzID0gMDtcbiAqXG4gKiAgIEBIb3N0TGlzdGVuZXIoJ2NsaWNrJywgWyckZXZlbnQudGFyZ2V0J10pXG4gKiAgIG9uQ2xpY2soYnRuKSB7XG4gKiAgICAgY29uc29sZS5sb2coXCJidXR0b25cIiwgYnRuLCBcIm51bWJlciBvZiBjbGlja3M6XCIsIHRoaXMubnVtYmVyT2ZDbGlja3MrKyk7XG4gKiAgIH1cbiAqIH1cbiAqXG4gKiBAQ29tcG9uZW50KHtcbiAqICAgc2VsZWN0b3I6ICdhcHAnLFxuICogICB0ZW1wbGF0ZTogYDxidXR0b24gY291bnRpbmc+SW5jcmVtZW50PC9idXR0b24+YCxcbiAqICAgZGlyZWN0aXZlczogW0NvdW50Q2xpY2tzXVxuICogfSlcbiAqIGNsYXNzIEFwcCB7fVxuICpcbiAqIGJvb3RzdHJhcChBcHApO1xuICogYGBgXG4gKiBAdHMyZGFydF9jb25zdFxuICovXG5leHBvcnQgY2xhc3MgSG9zdExpc3RlbmVyTWV0YWRhdGEge1xuICBjb25zdHJ1Y3RvcihwdWJsaWMgZXZlbnROYW1lOiBzdHJpbmcsIHB1YmxpYyBhcmdzPzogc3RyaW5nW10pIHt9XG59XG4iXX0=