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
        var _b = _a === void 0 ? {} : _a, selector = _b.selector, inputs = _b.inputs, outputs = _b.outputs, properties = _b.properties, events = _b.events, host = _b.host, bindings = _b.bindings, providers = _b.providers, exportAs = _b.exportAs, moduleId = _b.moduleId, queries = _b.queries;
        _super.call(this);
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
 * ```
 * @Pipe({name: 'lowercase'})
 * class Lowercase {
 *   transform(v, args) { return v.toLowerCase(); }
 * }
 * ```
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGlyZWN0aXZlcy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImFuZ3VsYXIyL3NyYy9jb3JlL21ldGFkYXRhL2RpcmVjdGl2ZXMudHMiXSwibmFtZXMiOlsiRGlyZWN0aXZlTWV0YWRhdGEiLCJEaXJlY3RpdmVNZXRhZGF0YS5jb25zdHJ1Y3RvciIsIkRpcmVjdGl2ZU1ldGFkYXRhLmlucHV0cyIsIkRpcmVjdGl2ZU1ldGFkYXRhLnByb3BlcnRpZXMiLCJEaXJlY3RpdmVNZXRhZGF0YS5vdXRwdXRzIiwiRGlyZWN0aXZlTWV0YWRhdGEuZXZlbnRzIiwiRGlyZWN0aXZlTWV0YWRhdGEucHJvdmlkZXJzIiwiRGlyZWN0aXZlTWV0YWRhdGEuYmluZGluZ3MiLCJDb21wb25lbnRNZXRhZGF0YSIsIkNvbXBvbmVudE1ldGFkYXRhLmNvbnN0cnVjdG9yIiwiQ29tcG9uZW50TWV0YWRhdGEudmlld1Byb3ZpZGVycyIsIkNvbXBvbmVudE1ldGFkYXRhLnZpZXdCaW5kaW5ncyIsIlBpcGVNZXRhZGF0YSIsIlBpcGVNZXRhZGF0YS5jb25zdHJ1Y3RvciIsIlBpcGVNZXRhZGF0YS5wdXJlIiwiSW5wdXRNZXRhZGF0YSIsIklucHV0TWV0YWRhdGEuY29uc3RydWN0b3IiLCJPdXRwdXRNZXRhZGF0YSIsIk91dHB1dE1ldGFkYXRhLmNvbnN0cnVjdG9yIiwiSG9zdEJpbmRpbmdNZXRhZGF0YSIsIkhvc3RCaW5kaW5nTWV0YWRhdGEuY29uc3RydWN0b3IiLCJIb3N0TGlzdGVuZXJNZXRhZGF0YSIsIkhvc3RMaXN0ZW5lck1ldGFkYXRhLmNvbnN0cnVjdG9yIl0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7OztBQUFBLHFCQUFpRCwwQkFBMEIsQ0FBQyxDQUFBO0FBQzVFLHlCQUFpQywrQkFBK0IsQ0FBQyxDQUFBO0FBQ2pFLGlDQUFzQyxvQ0FBb0MsQ0FBQyxDQUFBO0FBRzNFOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7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Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0dBd0NHO0FBQ0g7SUFFRUUsd0JBQW1CQSxtQkFBNEJBO1FBQTVCQyx3QkFBbUJBLEdBQW5CQSxtQkFBbUJBLENBQVNBO0lBQUdBLENBQUNBO0lBRnJERDtRQUFDQSxZQUFLQSxFQUFFQTs7dUJBR1BBO0lBQURBLHFCQUFDQTtBQUFEQSxDQUFDQSxBQUhELElBR0M7QUFGWSxzQkFBYyxpQkFFMUIsQ0FBQTtBQUVEOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0dBa0NHO0FBQ0g7SUFFRUUsNkJBQW1CQSxnQkFBeUJBO1FBQXpCQyxxQkFBZ0JBLEdBQWhCQSxnQkFBZ0JBLENBQVNBO0lBQUdBLENBQUNBO0lBRmxERDtRQUFDQSxZQUFLQSxFQUFFQTs7NEJBR1BBO0lBQURBLDBCQUFDQTtBQUFEQSxDQUFDQSxBQUhELElBR0M7QUFGWSwyQkFBbUIsc0JBRS9CLENBQUE7QUFFRDs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0dBaUNHO0FBQ0g7SUFFRUUsOEJBQW1CQSxTQUFpQkEsRUFBU0EsSUFBZUE7UUFBekNDLGNBQVNBLEdBQVRBLFNBQVNBLENBQVFBO1FBQVNBLFNBQUlBLEdBQUpBLElBQUlBLENBQVdBO0lBQUdBLENBQUNBO0lBRmxFRDtRQUFDQSxZQUFLQSxFQUFFQTs7NkJBR1BBO0lBQURBLDJCQUFDQTtBQUFEQSxDQUFDQSxBQUhELElBR0M7QUFGWSw0QkFBb0IsdUJBRWhDLENBQUEiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge2lzUHJlc2VudCwgQ09OU1QsIENPTlNUX0VYUFIsIFR5cGV9IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvbGFuZyc7XG5pbXBvcnQge0luamVjdGFibGVNZXRhZGF0YX0gZnJvbSAnYW5ndWxhcjIvc3JjL2NvcmUvZGkvbWV0YWRhdGEnO1xuaW1wb3J0IHtDaGFuZ2VEZXRlY3Rpb25TdHJhdGVneX0gZnJvbSAnYW5ndWxhcjIvc3JjL2NvcmUvY2hhbmdlX2RldGVjdGlvbic7XG5pbXBvcnQge1ZpZXdFbmNhcHN1bGF0aW9ufSBmcm9tICdhbmd1bGFyMi9zcmMvY29yZS9tZXRhZGF0YS92aWV3JztcblxuLyoqXG4gKiBEaXJlY3RpdmVzIGFsbG93IHlvdSB0byBhdHRhY2ggYmVoYXZpb3IgdG8gZWxlbWVudHMgaW4gdGhlIERPTS5cbiAqXG4gKiB7QGxpbmsgRGlyZWN0aXZlTWV0YWRhdGF9cyB3aXRoIGFuIGVtYmVkZGVkIHZpZXcgYXJlIGNhbGxlZCB7QGxpbmsgQ29tcG9uZW50TWV0YWRhdGF9cy5cbiAqXG4gKiBBIGRpcmVjdGl2ZSBjb25zaXN0cyBvZiBhIHNpbmdsZSBkaXJlY3RpdmUgYW5ub3RhdGlvbiBhbmQgYSBjb250cm9sbGVyIGNsYXNzLiBXaGVuIHRoZVxuICogZGlyZWN0aXZlJ3MgYHNlbGVjdG9yYCBtYXRjaGVzXG4gKiBlbGVtZW50cyBpbiB0aGUgRE9NLCB0aGUgZm9sbG93aW5nIHN0ZXBzIG9jY3VyOlxuICpcbiAqIDEuIEZvciBlYWNoIGRpcmVjdGl2ZSwgdGhlIGBFbGVtZW50SW5qZWN0b3JgIGF0dGVtcHRzIHRvIHJlc29sdmUgdGhlIGRpcmVjdGl2ZSdzIGNvbnN0cnVjdG9yXG4gKiBhcmd1bWVudHMuXG4gKiAyLiBBbmd1bGFyIGluc3RhbnRpYXRlcyBkaXJlY3RpdmVzIGZvciBlYWNoIG1hdGNoZWQgZWxlbWVudCB1c2luZyBgRWxlbWVudEluamVjdG9yYCBpbiBhXG4gKiBkZXB0aC1maXJzdCBvcmRlcixcbiAqICAgIGFzIGRlY2xhcmVkIGluIHRoZSBIVE1MLlxuICpcbiAqICMjIFVuZGVyc3RhbmRpbmcgSG93IEluamVjdGlvbiBXb3Jrc1xuICpcbiAqIFRoZXJlIGFyZSB0aHJlZSBzdGFnZXMgb2YgaW5qZWN0aW9uIHJlc29sdXRpb24uXG4gKiAtICpQcmUtZXhpc3RpbmcgSW5qZWN0b3JzKjpcbiAqICAgLSBUaGUgdGVybWluYWwge0BsaW5rIEluamVjdG9yfSBjYW5ub3QgcmVzb2x2ZSBkZXBlbmRlbmNpZXMuIEl0IGVpdGhlciB0aHJvd3MgYW4gZXJyb3Igb3IsIGlmXG4gKiB0aGUgZGVwZW5kZW5jeSB3YXNcbiAqICAgICBzcGVjaWZpZWQgYXMgYEBPcHRpb25hbGAsIHJldHVybnMgYG51bGxgLlxuICogICAtIFRoZSBwbGF0Zm9ybSBpbmplY3RvciByZXNvbHZlcyBicm93c2VyIHNpbmdsZXRvbiByZXNvdXJjZXMsIHN1Y2ggYXM6IGNvb2tpZXMsIHRpdGxlLFxuICogbG9jYXRpb24sIGFuZCBvdGhlcnMuXG4gKiAtICpDb21wb25lbnQgSW5qZWN0b3JzKjogRWFjaCBjb21wb25lbnQgaW5zdGFuY2UgaGFzIGl0cyBvd24ge0BsaW5rIEluamVjdG9yfSwgYW5kIHRoZXkgZm9sbG93XG4gKiB0aGUgc2FtZSBwYXJlbnQtY2hpbGQgaGllcmFyY2h5XG4gKiAgICAgYXMgdGhlIGNvbXBvbmVudCBpbnN0YW5jZXMgaW4gdGhlIERPTS5cbiAqIC0gKkVsZW1lbnQgSW5qZWN0b3JzKjogRWFjaCBjb21wb25lbnQgaW5zdGFuY2UgaGFzIGEgU2hhZG93IERPTS4gV2l0aGluIHRoZSBTaGFkb3cgRE9NIGVhY2hcbiAqIGVsZW1lbnQgaGFzIGFuIGBFbGVtZW50SW5qZWN0b3JgXG4gKiAgICAgd2hpY2ggZm9sbG93IHRoZSBzYW1lIHBhcmVudC1jaGlsZCBoaWVyYXJjaHkgYXMgdGhlIERPTSBlbGVtZW50cyB0aGVtc2VsdmVzLlxuICpcbiAqIFdoZW4gYSB0ZW1wbGF0ZSBpcyBpbnN0YW50aWF0ZWQsIGl0IGFsc28gbXVzdCBpbnN0YW50aWF0ZSB0aGUgY29ycmVzcG9uZGluZyBkaXJlY3RpdmVzIGluIGFcbiAqIGRlcHRoLWZpcnN0IG9yZGVyLiBUaGVcbiAqIGN1cnJlbnQgYEVsZW1lbnRJbmplY3RvcmAgcmVzb2x2ZXMgdGhlIGNvbnN0cnVjdG9yIGRlcGVuZGVuY2llcyBmb3IgZWFjaCBkaXJlY3RpdmUuXG4gKlxuICogQW5ndWxhciB0aGVuIHJlc29sdmVzIGRlcGVuZGVuY2llcyBhcyBmb2xsb3dzLCBhY2NvcmRpbmcgdG8gdGhlIG9yZGVyIGluIHdoaWNoIHRoZXkgYXBwZWFyIGluIHRoZVxuICoge0BsaW5rIFZpZXdNZXRhZGF0YX06XG4gKlxuICogMS4gRGVwZW5kZW5jaWVzIG9uIHRoZSBjdXJyZW50IGVsZW1lbnRcbiAqIDIuIERlcGVuZGVuY2llcyBvbiBlbGVtZW50IGluamVjdG9ycyBhbmQgdGhlaXIgcGFyZW50cyB1bnRpbCBpdCBlbmNvdW50ZXJzIGEgU2hhZG93IERPTSBib3VuZGFyeVxuICogMy4gRGVwZW5kZW5jaWVzIG9uIGNvbXBvbmVudCBpbmplY3RvcnMgYW5kIHRoZWlyIHBhcmVudHMgdW50aWwgaXQgZW5jb3VudGVycyB0aGUgcm9vdCBjb21wb25lbnRcbiAqIDQuIERlcGVuZGVuY2llcyBvbiBwcmUtZXhpc3RpbmcgaW5qZWN0b3JzXG4gKlxuICpcbiAqIFRoZSBgRWxlbWVudEluamVjdG9yYCBjYW4gaW5qZWN0IG90aGVyIGRpcmVjdGl2ZXMsIGVsZW1lbnQtc3BlY2lmaWMgc3BlY2lhbCBvYmplY3RzLCBvciBpdCBjYW5cbiAqIGRlbGVnYXRlIHRvIHRoZSBwYXJlbnRcbiAqIGluamVjdG9yLlxuICpcbiAqIFRvIGluamVjdCBvdGhlciBkaXJlY3RpdmVzLCBkZWNsYXJlIHRoZSBjb25zdHJ1Y3RvciBwYXJhbWV0ZXIgYXM6XG4gKiAtIGBkaXJlY3RpdmU6RGlyZWN0aXZlVHlwZWA6IGEgZGlyZWN0aXZlIG9uIHRoZSBjdXJyZW50IGVsZW1lbnQgb25seVxuICogLSBgQEhvc3QoKSBkaXJlY3RpdmU6RGlyZWN0aXZlVHlwZWA6IGFueSBkaXJlY3RpdmUgdGhhdCBtYXRjaGVzIHRoZSB0eXBlIGJldHdlZW4gdGhlIGN1cnJlbnRcbiAqIGVsZW1lbnQgYW5kIHRoZVxuICogICAgU2hhZG93IERPTSByb290LlxuICogLSBgQFF1ZXJ5KERpcmVjdGl2ZVR5cGUpIHF1ZXJ5OlF1ZXJ5TGlzdDxEaXJlY3RpdmVUeXBlPmA6IEEgbGl2ZSBjb2xsZWN0aW9uIG9mIGRpcmVjdCBjaGlsZFxuICogZGlyZWN0aXZlcy5cbiAqIC0gYEBRdWVyeURlc2NlbmRhbnRzKERpcmVjdGl2ZVR5cGUpIHF1ZXJ5OlF1ZXJ5TGlzdDxEaXJlY3RpdmVUeXBlPmA6IEEgbGl2ZSBjb2xsZWN0aW9uIG9mIGFueVxuICogY2hpbGQgZGlyZWN0aXZlcy5cbiAqXG4gKiBUbyBpbmplY3QgZWxlbWVudC1zcGVjaWZpYyBzcGVjaWFsIG9iamVjdHMsIGRlY2xhcmUgdGhlIGNvbnN0cnVjdG9yIHBhcmFtZXRlciBhczpcbiAqIC0gYGVsZW1lbnQ6IEVsZW1lbnRSZWZgIHRvIG9idGFpbiBhIHJlZmVyZW5jZSB0byBsb2dpY2FsIGVsZW1lbnQgaW4gdGhlIHZpZXcuXG4gKiAtIGB2aWV3Q29udGFpbmVyOiBWaWV3Q29udGFpbmVyUmVmYCB0byBjb250cm9sIGNoaWxkIHRlbXBsYXRlIGluc3RhbnRpYXRpb24sIGZvclxuICoge0BsaW5rIERpcmVjdGl2ZU1ldGFkYXRhfSBkaXJlY3RpdmVzIG9ubHlcbiAqIC0gYGJpbmRpbmdQcm9wYWdhdGlvbjogQmluZGluZ1Byb3BhZ2F0aW9uYCB0byBjb250cm9sIGNoYW5nZSBkZXRlY3Rpb24gaW4gYSBtb3JlIGdyYW51bGFyIHdheS5cbiAqXG4gKiAjIyMgRXhhbXBsZVxuICpcbiAqIFRoZSBmb2xsb3dpbmcgZXhhbXBsZSBkZW1vbnN0cmF0ZXMgaG93IGRlcGVuZGVuY3kgaW5qZWN0aW9uIHJlc29sdmVzIGNvbnN0cnVjdG9yIGFyZ3VtZW50cyBpblxuICogcHJhY3RpY2UuXG4gKlxuICpcbiAqIEFzc3VtZSB0aGlzIEhUTUwgdGVtcGxhdGU6XG4gKlxuICogYGBgXG4gKiA8ZGl2IGRlcGVuZGVuY3k9XCIxXCI+XG4gKiAgIDxkaXYgZGVwZW5kZW5jeT1cIjJcIj5cbiAqICAgICA8ZGl2IGRlcGVuZGVuY3k9XCIzXCIgbXktZGlyZWN0aXZlPlxuICogICAgICAgPGRpdiBkZXBlbmRlbmN5PVwiNFwiPlxuICogICAgICAgICA8ZGl2IGRlcGVuZGVuY3k9XCI1XCI+PC9kaXY+XG4gKiAgICAgICA8L2Rpdj5cbiAqICAgICAgIDxkaXYgZGVwZW5kZW5jeT1cIjZcIj48L2Rpdj5cbiAqICAgICA8L2Rpdj5cbiAqICAgPC9kaXY+XG4gKiA8L2Rpdj5cbiAqIGBgYFxuICpcbiAqIFdpdGggdGhlIGZvbGxvd2luZyBgZGVwZW5kZW5jeWAgZGVjb3JhdG9yIGFuZCBgU29tZVNlcnZpY2VgIGluamVjdGFibGUgY2xhc3MuXG4gKlxuICogYGBgXG4gKiBASW5qZWN0YWJsZSgpXG4gKiBjbGFzcyBTb21lU2VydmljZSB7XG4gKiB9XG4gKlxuICogQERpcmVjdGl2ZSh7XG4gKiAgIHNlbGVjdG9yOiAnW2RlcGVuZGVuY3ldJyxcbiAqICAgaW5wdXRzOiBbXG4gKiAgICAgJ2lkOiBkZXBlbmRlbmN5J1xuICogICBdXG4gKiB9KVxuICogY2xhc3MgRGVwZW5kZW5jeSB7XG4gKiAgIGlkOnN0cmluZztcbiAqIH1cbiAqIGBgYFxuICpcbiAqIExldCdzIHN0ZXAgdGhyb3VnaCB0aGUgZGlmZmVyZW50IHdheXMgaW4gd2hpY2ggYE15RGlyZWN0aXZlYCBjb3VsZCBiZSBkZWNsYXJlZC4uLlxuICpcbiAqXG4gKiAjIyMgTm8gaW5qZWN0aW9uXG4gKlxuICogSGVyZSB0aGUgY29uc3RydWN0b3IgaXMgZGVjbGFyZWQgd2l0aCBubyBhcmd1bWVudHMsIHRoZXJlZm9yZSBub3RoaW5nIGlzIGluamVjdGVkIGludG9cbiAqIGBNeURpcmVjdGl2ZWAuXG4gKlxuICogYGBgXG4gKiBARGlyZWN0aXZlKHsgc2VsZWN0b3I6ICdbbXktZGlyZWN0aXZlXScgfSlcbiAqIGNsYXNzIE15RGlyZWN0aXZlIHtcbiAqICAgY29uc3RydWN0b3IoKSB7XG4gKiAgIH1cbiAqIH1cbiAqIGBgYFxuICpcbiAqIFRoaXMgZGlyZWN0aXZlIHdvdWxkIGJlIGluc3RhbnRpYXRlZCB3aXRoIG5vIGRlcGVuZGVuY2llcy5cbiAqXG4gKlxuICogIyMjIENvbXBvbmVudC1sZXZlbCBpbmplY3Rpb25cbiAqXG4gKiBEaXJlY3RpdmVzIGNhbiBpbmplY3QgYW55IGluamVjdGFibGUgaW5zdGFuY2UgZnJvbSB0aGUgY2xvc2VzdCBjb21wb25lbnQgaW5qZWN0b3Igb3IgYW55IG9mIGl0c1xuICogcGFyZW50cy5cbiAqXG4gKiBIZXJlLCB0aGUgY29uc3RydWN0b3IgZGVjbGFyZXMgYSBwYXJhbWV0ZXIsIGBzb21lU2VydmljZWAsIGFuZCBpbmplY3RzIHRoZSBgU29tZVNlcnZpY2VgIHR5cGVcbiAqIGZyb20gdGhlIHBhcmVudFxuICogY29tcG9uZW50J3MgaW5qZWN0b3IuXG4gKiBgYGBcbiAqIEBEaXJlY3RpdmUoeyBzZWxlY3RvcjogJ1tteS1kaXJlY3RpdmVdJyB9KVxuICogY2xhc3MgTXlEaXJlY3RpdmUge1xuICogICBjb25zdHJ1Y3Rvcihzb21lU2VydmljZTogU29tZVNlcnZpY2UpIHtcbiAqICAgfVxuICogfVxuICogYGBgXG4gKlxuICogVGhpcyBkaXJlY3RpdmUgd291bGQgYmUgaW5zdGFudGlhdGVkIHdpdGggYSBkZXBlbmRlbmN5IG9uIGBTb21lU2VydmljZWAuXG4gKlxuICpcbiAqICMjIyBJbmplY3RpbmcgYSBkaXJlY3RpdmUgZnJvbSB0aGUgY3VycmVudCBlbGVtZW50XG4gKlxuICogRGlyZWN0aXZlcyBjYW4gaW5qZWN0IG90aGVyIGRpcmVjdGl2ZXMgZGVjbGFyZWQgb24gdGhlIGN1cnJlbnQgZWxlbWVudC5cbiAqXG4gKiBgYGBcbiAqIEBEaXJlY3RpdmUoeyBzZWxlY3RvcjogJ1tteS1kaXJlY3RpdmVdJyB9KVxuICogY2xhc3MgTXlEaXJlY3RpdmUge1xuICogICBjb25zdHJ1Y3RvcihkZXBlbmRlbmN5OiBEZXBlbmRlbmN5KSB7XG4gKiAgICAgZXhwZWN0KGRlcGVuZGVuY3kuaWQpLnRvRXF1YWwoMyk7XG4gKiAgIH1cbiAqIH1cbiAqIGBgYFxuICogVGhpcyBkaXJlY3RpdmUgd291bGQgYmUgaW5zdGFudGlhdGVkIHdpdGggYERlcGVuZGVuY3lgIGRlY2xhcmVkIGF0IHRoZSBzYW1lIGVsZW1lbnQsIGluIHRoaXMgY2FzZVxuICogYGRlcGVuZGVuY3k9XCIzXCJgLlxuICpcbiAqICMjIyBJbmplY3RpbmcgYSBkaXJlY3RpdmUgZnJvbSBhbnkgYW5jZXN0b3IgZWxlbWVudHNcbiAqXG4gKiBEaXJlY3RpdmVzIGNhbiBpbmplY3Qgb3RoZXIgZGlyZWN0aXZlcyBkZWNsYXJlZCBvbiBhbnkgYW5jZXN0b3IgZWxlbWVudCAoaW4gdGhlIGN1cnJlbnQgU2hhZG93XG4gKiBET00pLCBpLmUuIG9uIHRoZSBjdXJyZW50IGVsZW1lbnQsIHRoZVxuICogcGFyZW50IGVsZW1lbnQsIG9yIGl0cyBwYXJlbnRzLlxuICogYGBgXG4gKiBARGlyZWN0aXZlKHsgc2VsZWN0b3I6ICdbbXktZGlyZWN0aXZlXScgfSlcbiAqIGNsYXNzIE15RGlyZWN0aXZlIHtcbiAqICAgY29uc3RydWN0b3IoQEhvc3QoKSBkZXBlbmRlbmN5OiBEZXBlbmRlbmN5KSB7XG4gKiAgICAgZXhwZWN0KGRlcGVuZGVuY3kuaWQpLnRvRXF1YWwoMik7XG4gKiAgIH1cbiAqIH1cbiAqIGBgYFxuICpcbiAqIGBASG9zdGAgY2hlY2tzIHRoZSBjdXJyZW50IGVsZW1lbnQsIHRoZSBwYXJlbnQsIGFzIHdlbGwgYXMgaXRzIHBhcmVudHMgcmVjdXJzaXZlbHkuIElmXG4gKiBgZGVwZW5kZW5jeT1cIjJcImAgZGlkbid0XG4gKiBleGlzdCBvbiB0aGUgZGlyZWN0IHBhcmVudCwgdGhpcyBpbmplY3Rpb24gd291bGRcbiAqIGhhdmUgcmV0dXJuZWRcbiAqIGBkZXBlbmRlbmN5PVwiMVwiYC5cbiAqXG4gKlxuICogIyMjIEluamVjdGluZyBhIGxpdmUgY29sbGVjdGlvbiBvZiBkaXJlY3QgY2hpbGQgZGlyZWN0aXZlc1xuICpcbiAqXG4gKiBBIGRpcmVjdGl2ZSBjYW4gYWxzbyBxdWVyeSBmb3Igb3RoZXIgY2hpbGQgZGlyZWN0aXZlcy4gU2luY2UgcGFyZW50IGRpcmVjdGl2ZXMgYXJlIGluc3RhbnRpYXRlZFxuICogYmVmb3JlIGNoaWxkIGRpcmVjdGl2ZXMsIGEgZGlyZWN0aXZlIGNhbid0IHNpbXBseSBpbmplY3QgdGhlIGxpc3Qgb2YgY2hpbGQgZGlyZWN0aXZlcy4gSW5zdGVhZCxcbiAqIHRoZSBkaXJlY3RpdmUgaW5qZWN0cyBhIHtAbGluayBRdWVyeUxpc3R9LCB3aGljaCB1cGRhdGVzIGl0cyBjb250ZW50cyBhcyBjaGlsZHJlbiBhcmUgYWRkZWQsXG4gKiByZW1vdmVkLCBvciBtb3ZlZCBieSBhIGRpcmVjdGl2ZSB0aGF0IHVzZXMgYSB7QGxpbmsgVmlld0NvbnRhaW5lclJlZn0gc3VjaCBhcyBhIGBuZ0ZvcmAsIGFuXG4gKiBgbmdJZmAsIG9yIGFuIGBuZ1N3aXRjaGAuXG4gKlxuICogYGBgXG4gKiBARGlyZWN0aXZlKHsgc2VsZWN0b3I6ICdbbXktZGlyZWN0aXZlXScgfSlcbiAqIGNsYXNzIE15RGlyZWN0aXZlIHtcbiAqICAgY29uc3RydWN0b3IoQFF1ZXJ5KERlcGVuZGVuY3kpIGRlcGVuZGVuY2llczpRdWVyeUxpc3Q8RGVwZW5kZW5jeT4pIHtcbiAqICAgfVxuICogfVxuICogYGBgXG4gKlxuICogVGhpcyBkaXJlY3RpdmUgd291bGQgYmUgaW5zdGFudGlhdGVkIHdpdGggYSB7QGxpbmsgUXVlcnlMaXN0fSB3aGljaCBjb250YWlucyBgRGVwZW5kZW5jeWAgNCBhbmRcbiAqIGBEZXBlbmRlbmN5YCA2LiBIZXJlLCBgRGVwZW5kZW5jeWAgNSB3b3VsZCBub3QgYmUgaW5jbHVkZWQsIGJlY2F1c2UgaXQgaXMgbm90IGEgZGlyZWN0IGNoaWxkLlxuICpcbiAqICMjIyBJbmplY3RpbmcgYSBsaXZlIGNvbGxlY3Rpb24gb2YgZGVzY2VuZGFudCBkaXJlY3RpdmVzXG4gKlxuICogQnkgcGFzc2luZyB0aGUgZGVzY2VuZGFudCBmbGFnIHRvIGBAUXVlcnlgIGFib3ZlLCB3ZSBjYW4gaW5jbHVkZSB0aGUgY2hpbGRyZW4gb2YgdGhlIGNoaWxkXG4gKiBlbGVtZW50cy5cbiAqXG4gKiBgYGBcbiAqIEBEaXJlY3RpdmUoeyBzZWxlY3RvcjogJ1tteS1kaXJlY3RpdmVdJyB9KVxuICogY2xhc3MgTXlEaXJlY3RpdmUge1xuICogICBjb25zdHJ1Y3RvcihAUXVlcnkoRGVwZW5kZW5jeSwge2Rlc2NlbmRhbnRzOiB0cnVlfSkgZGVwZW5kZW5jaWVzOlF1ZXJ5TGlzdDxEZXBlbmRlbmN5Pikge1xuICogICB9XG4gKiB9XG4gKiBgYGBcbiAqXG4gKiBUaGlzIGRpcmVjdGl2ZSB3b3VsZCBiZSBpbnN0YW50aWF0ZWQgd2l0aCBhIFF1ZXJ5IHdoaWNoIHdvdWxkIGNvbnRhaW4gYERlcGVuZGVuY3lgIDQsIDUgYW5kIDYuXG4gKlxuICogIyMjIE9wdGlvbmFsIGluamVjdGlvblxuICpcbiAqIFRoZSBub3JtYWwgYmVoYXZpb3Igb2YgZGlyZWN0aXZlcyBpcyB0byByZXR1cm4gYW4gZXJyb3Igd2hlbiBhIHNwZWNpZmllZCBkZXBlbmRlbmN5IGNhbm5vdCBiZVxuICogcmVzb2x2ZWQuIElmIHlvdVxuICogd291bGQgbGlrZSB0byBpbmplY3QgYG51bGxgIG9uIHVucmVzb2x2ZWQgZGVwZW5kZW5jeSBpbnN0ZWFkLCB5b3UgY2FuIGFubm90YXRlIHRoYXQgZGVwZW5kZW5jeVxuICogd2l0aCBgQE9wdGlvbmFsKClgLlxuICogVGhpcyBleHBsaWNpdGx5IHBlcm1pdHMgdGhlIGF1dGhvciBvZiBhIHRlbXBsYXRlIHRvIHRyZWF0IHNvbWUgb2YgdGhlIHN1cnJvdW5kaW5nIGRpcmVjdGl2ZXMgYXNcbiAqIG9wdGlvbmFsLlxuICpcbiAqIGBgYFxuICogQERpcmVjdGl2ZSh7IHNlbGVjdG9yOiAnW215LWRpcmVjdGl2ZV0nIH0pXG4gKiBjbGFzcyBNeURpcmVjdGl2ZSB7XG4gKiAgIGNvbnN0cnVjdG9yKEBPcHRpb25hbCgpIGRlcGVuZGVuY3k6RGVwZW5kZW5jeSkge1xuICogICB9XG4gKiB9XG4gKiBgYGBcbiAqXG4gKiBUaGlzIGRpcmVjdGl2ZSB3b3VsZCBiZSBpbnN0YW50aWF0ZWQgd2l0aCBhIGBEZXBlbmRlbmN5YCBkaXJlY3RpdmUgZm91bmQgb24gdGhlIGN1cnJlbnQgZWxlbWVudC5cbiAqIElmIG5vbmUgY2FuIGJlXG4gKiBmb3VuZCwgdGhlIGluamVjdG9yIHN1cHBsaWVzIGBudWxsYCBpbnN0ZWFkIG9mIHRocm93aW5nIGFuIGVycm9yLlxuICpcbiAqICMjIyBFeGFtcGxlXG4gKlxuICogSGVyZSB3ZSB1c2UgYSBkZWNvcmF0b3IgZGlyZWN0aXZlIHRvIHNpbXBseSBkZWZpbmUgYmFzaWMgdG9vbC10aXAgYmVoYXZpb3IuXG4gKlxuICogYGBgXG4gKiBARGlyZWN0aXZlKHtcbiAqICAgc2VsZWN0b3I6ICdbdG9vbHRpcF0nLFxuICogICBpbnB1dHM6IFtcbiAqICAgICAndGV4dDogdG9vbHRpcCdcbiAqICAgXSxcbiAqICAgaG9zdDoge1xuICogICAgICcobW91c2VlbnRlciknOiAnb25Nb3VzZUVudGVyKCknLFxuICogICAgICcobW91c2VsZWF2ZSknOiAnb25Nb3VzZUxlYXZlKCknXG4gKiAgIH1cbiAqIH0pXG4gKiBjbGFzcyBUb29sdGlwe1xuICogICB0ZXh0OnN0cmluZztcbiAqICAgb3ZlcmxheTpPdmVybGF5OyAvLyBOT1QgWUVUIElNUExFTUVOVEVEXG4gKiAgIG92ZXJsYXlNYW5hZ2VyOk92ZXJsYXlNYW5hZ2VyOyAvLyBOT1QgWUVUIElNUExFTUVOVEVEXG4gKlxuICogICBjb25zdHJ1Y3RvcihvdmVybGF5TWFuYWdlcjpPdmVybGF5TWFuYWdlcikge1xuICogICAgIHRoaXMub3ZlcmxheSA9IG92ZXJsYXk7XG4gKiAgIH1cbiAqXG4gKiAgIG9uTW91c2VFbnRlcigpIHtcbiAqICAgICAvLyBleGFjdCBzaWduYXR1cmUgdG8gYmUgZGV0ZXJtaW5lZFxuICogICAgIHRoaXMub3ZlcmxheSA9IHRoaXMub3ZlcmxheU1hbmFnZXIub3Blbih0ZXh0LCAuLi4pO1xuICogICB9XG4gKlxuICogICBvbk1vdXNlTGVhdmUoKSB7XG4gKiAgICAgdGhpcy5vdmVybGF5LmNsb3NlKCk7XG4gKiAgICAgdGhpcy5vdmVybGF5ID0gbnVsbDtcbiAqICAgfVxuICogfVxuICogYGBgXG4gKiBJbiBvdXIgSFRNTCB0ZW1wbGF0ZSwgd2UgY2FuIHRoZW4gYWRkIHRoaXMgYmVoYXZpb3IgdG8gYSBgPGRpdj5gIG9yIGFueSBvdGhlciBlbGVtZW50IHdpdGggdGhlXG4gKiBgdG9vbHRpcGAgc2VsZWN0b3IsXG4gKiBsaWtlIHNvOlxuICpcbiAqIGBgYFxuICogPGRpdiB0b29sdGlwPVwic29tZSB0ZXh0IGhlcmVcIj48L2Rpdj5cbiAqIGBgYFxuICpcbiAqIERpcmVjdGl2ZXMgY2FuIGFsc28gY29udHJvbCB0aGUgaW5zdGFudGlhdGlvbiwgZGVzdHJ1Y3Rpb24sIGFuZCBwb3NpdGlvbmluZyBvZiBpbmxpbmUgdGVtcGxhdGVcbiAqIGVsZW1lbnRzOlxuICpcbiAqIEEgZGlyZWN0aXZlIHVzZXMgYSB7QGxpbmsgVmlld0NvbnRhaW5lclJlZn0gdG8gaW5zdGFudGlhdGUsIGluc2VydCwgbW92ZSwgYW5kIGRlc3Ryb3kgdmlld3MgYXRcbiAqIHJ1bnRpbWUuXG4gKiBUaGUge0BsaW5rIFZpZXdDb250YWluZXJSZWZ9IGlzIGNyZWF0ZWQgYXMgYSByZXN1bHQgb2YgYDx0ZW1wbGF0ZT5gIGVsZW1lbnQsIGFuZCByZXByZXNlbnRzIGFcbiAqIGxvY2F0aW9uIGluIHRoZSBjdXJyZW50IHZpZXdcbiAqIHdoZXJlIHRoZXNlIGFjdGlvbnMgYXJlIHBlcmZvcm1lZC5cbiAqXG4gKiBWaWV3cyBhcmUgYWx3YXlzIGNyZWF0ZWQgYXMgY2hpbGRyZW4gb2YgdGhlIGN1cnJlbnQge0BsaW5rIFZpZXdNZXRhZGF0YX0sIGFuZCBhcyBzaWJsaW5ncyBvZiB0aGVcbiAqIGA8dGVtcGxhdGU+YCBlbGVtZW50LiBUaHVzIGFcbiAqIGRpcmVjdGl2ZSBpbiBhIGNoaWxkIHZpZXcgY2Fubm90IGluamVjdCB0aGUgZGlyZWN0aXZlIHRoYXQgY3JlYXRlZCBpdC5cbiAqXG4gKiBTaW5jZSBkaXJlY3RpdmVzIHRoYXQgY3JlYXRlIHZpZXdzIHZpYSBWaWV3Q29udGFpbmVycyBhcmUgY29tbW9uIGluIEFuZ3VsYXIsIGFuZCB1c2luZyB0aGUgZnVsbFxuICogYDx0ZW1wbGF0ZT5gIGVsZW1lbnQgc3ludGF4IGlzIHdvcmR5LCBBbmd1bGFyXG4gKiBhbHNvIHN1cHBvcnRzIGEgc2hvcnRoYW5kIG5vdGF0aW9uOiBgPGxpICpmb289XCJiYXJcIj5gIGFuZCBgPGxpIHRlbXBsYXRlPVwiZm9vOiBiYXJcIj5gIGFyZVxuICogZXF1aXZhbGVudC5cbiAqXG4gKiBUaHVzLFxuICpcbiAqIGBgYFxuICogPHVsPlxuICogICA8bGkgKmZvbz1cImJhclwiIHRpdGxlPVwidGV4dFwiPjwvbGk+XG4gKiA8L3VsPlxuICogYGBgXG4gKlxuICogRXhwYW5kcyBpbiB1c2UgdG86XG4gKlxuICogYGBgXG4gKiA8dWw+XG4gKiAgIDx0ZW1wbGF0ZSBbZm9vXT1cImJhclwiPlxuICogICAgIDxsaSB0aXRsZT1cInRleHRcIj48L2xpPlxuICogICA8L3RlbXBsYXRlPlxuICogPC91bD5cbiAqIGBgYFxuICpcbiAqIE5vdGljZSB0aGF0IGFsdGhvdWdoIHRoZSBzaG9ydGhhbmQgcGxhY2VzIGAqZm9vPVwiYmFyXCJgIHdpdGhpbiB0aGUgYDxsaT5gIGVsZW1lbnQsIHRoZSBiaW5kaW5nIGZvclxuICogdGhlIGRpcmVjdGl2ZVxuICogY29udHJvbGxlciBpcyBjb3JyZWN0bHkgaW5zdGFudGlhdGVkIG9uIHRoZSBgPHRlbXBsYXRlPmAgZWxlbWVudCByYXRoZXIgdGhhbiB0aGUgYDxsaT5gIGVsZW1lbnQuXG4gKlxuICogIyMgTGlmZWN5Y2xlIGhvb2tzXG4gKlxuICogV2hlbiB0aGUgZGlyZWN0aXZlIGNsYXNzIGltcGxlbWVudHMgc29tZSB7QGxpbmsgYW5ndWxhcjIvbGlmZWN5Y2xlX2hvb2tzfSB0aGUgY2FsbGJhY2tzIGFyZVxuICogY2FsbGVkIGJ5IHRoZSBjaGFuZ2UgZGV0ZWN0aW9uIGF0IGRlZmluZWQgcG9pbnRzIGluIHRpbWUgZHVyaW5nIHRoZSBsaWZlIG9mIHRoZSBkaXJlY3RpdmUuXG4gKlxuICogIyMjIEV4YW1wbGVcbiAqXG4gKiBMZXQncyBzdXBwb3NlIHdlIHdhbnQgdG8gaW1wbGVtZW50IHRoZSBgdW5sZXNzYCBiZWhhdmlvciwgdG8gY29uZGl0aW9uYWxseSBpbmNsdWRlIGEgdGVtcGxhdGUuXG4gKlxuICogSGVyZSBpcyBhIHNpbXBsZSBkaXJlY3RpdmUgdGhhdCB0cmlnZ2VycyBvbiBhbiBgdW5sZXNzYCBzZWxlY3RvcjpcbiAqXG4gKiBgYGBcbiAqIEBEaXJlY3RpdmUoe1xuICogICBzZWxlY3RvcjogJ1t1bmxlc3NdJyxcbiAqICAgaW5wdXRzOiBbJ3VubGVzcyddXG4gKiB9KVxuICogZXhwb3J0IGNsYXNzIFVubGVzcyB7XG4gKiAgIHZpZXdDb250YWluZXI6IFZpZXdDb250YWluZXJSZWY7XG4gKiAgIHRlbXBsYXRlUmVmOiBUZW1wbGF0ZVJlZjtcbiAqICAgcHJldkNvbmRpdGlvbjogYm9vbGVhbjtcbiAqXG4gKiAgIGNvbnN0cnVjdG9yKHZpZXdDb250YWluZXI6IFZpZXdDb250YWluZXJSZWYsIHRlbXBsYXRlUmVmOiBUZW1wbGF0ZVJlZikge1xuICogICAgIHRoaXMudmlld0NvbnRhaW5lciA9IHZpZXdDb250YWluZXI7XG4gKiAgICAgdGhpcy50ZW1wbGF0ZVJlZiA9IHRlbXBsYXRlUmVmO1xuICogICAgIHRoaXMucHJldkNvbmRpdGlvbiA9IG51bGw7XG4gKiAgIH1cbiAqXG4gKiAgIHNldCB1bmxlc3MobmV3Q29uZGl0aW9uKSB7XG4gKiAgICAgaWYgKG5ld0NvbmRpdGlvbiAmJiAoaXNCbGFuayh0aGlzLnByZXZDb25kaXRpb24pIHx8ICF0aGlzLnByZXZDb25kaXRpb24pKSB7XG4gKiAgICAgICB0aGlzLnByZXZDb25kaXRpb24gPSB0cnVlO1xuICogICAgICAgdGhpcy52aWV3Q29udGFpbmVyLmNsZWFyKCk7XG4gKiAgICAgfSBlbHNlIGlmICghbmV3Q29uZGl0aW9uICYmIChpc0JsYW5rKHRoaXMucHJldkNvbmRpdGlvbikgfHwgdGhpcy5wcmV2Q29uZGl0aW9uKSkge1xuICogICAgICAgdGhpcy5wcmV2Q29uZGl0aW9uID0gZmFsc2U7XG4gKiAgICAgICB0aGlzLnZpZXdDb250YWluZXIuY3JlYXRlKHRoaXMudGVtcGxhdGVSZWYpO1xuICogICAgIH1cbiAqICAgfVxuICogfVxuICogYGBgXG4gKlxuICogV2UgY2FuIHRoZW4gdXNlIHRoaXMgYHVubGVzc2Agc2VsZWN0b3IgaW4gYSB0ZW1wbGF0ZTpcbiAqIGBgYFxuICogPHVsPlxuICogICA8bGkgKnVubGVzcz1cImV4cHJcIj48L2xpPlxuICogPC91bD5cbiAqIGBgYFxuICpcbiAqIE9uY2UgdGhlIGRpcmVjdGl2ZSBpbnN0YW50aWF0ZXMgdGhlIGNoaWxkIHZpZXcsIHRoZSBzaG9ydGhhbmQgbm90YXRpb24gZm9yIHRoZSB0ZW1wbGF0ZSBleHBhbmRzXG4gKiBhbmQgdGhlIHJlc3VsdCBpczpcbiAqXG4gKiBgYGBcbiAqIDx1bD5cbiAqICAgPHRlbXBsYXRlIFt1bmxlc3NdPVwiZXhwXCI+XG4gKiAgICAgPGxpPjwvbGk+XG4gKiAgIDwvdGVtcGxhdGU+XG4gKiAgIDxsaT48L2xpPlxuICogPC91bD5cbiAqIGBgYFxuICpcbiAqIE5vdGUgYWxzbyB0aGF0IGFsdGhvdWdoIHRoZSBgPGxpPjwvbGk+YCB0ZW1wbGF0ZSBzdGlsbCBleGlzdHMgaW5zaWRlIHRoZSBgPHRlbXBsYXRlPjwvdGVtcGxhdGU+YCxcbiAqIHRoZSBpbnN0YW50aWF0ZWRcbiAqIHZpZXcgb2NjdXJzIG9uIHRoZSBzZWNvbmQgYDxsaT48L2xpPmAgd2hpY2ggaXMgYSBzaWJsaW5nIHRvIHRoZSBgPHRlbXBsYXRlPmAgZWxlbWVudC5cbiAqL1xuQENPTlNUKClcbmV4cG9ydCBjbGFzcyBEaXJlY3RpdmVNZXRhZGF0YSBleHRlbmRzIEluamVjdGFibGVNZXRhZGF0YSB7XG4gIC8qKlxuICAgKiBUaGUgQ1NTIHNlbGVjdG9yIHRoYXQgdHJpZ2dlcnMgdGhlIGluc3RhbnRpYXRpb24gb2YgYSBkaXJlY3RpdmUuXG4gICAqXG4gICAqIEFuZ3VsYXIgb25seSBhbGxvd3MgZGlyZWN0aXZlcyB0byB0cmlnZ2VyIG9uIENTUyBzZWxlY3RvcnMgdGhhdCBkbyBub3QgY3Jvc3MgZWxlbWVudFxuICAgKiBib3VuZGFyaWVzLlxuICAgKlxuICAgKiBgc2VsZWN0b3JgIG1heSBiZSBkZWNsYXJlZCBhcyBvbmUgb2YgdGhlIGZvbGxvd2luZzpcbiAgICpcbiAgICogLSBgZWxlbWVudC1uYW1lYDogc2VsZWN0IGJ5IGVsZW1lbnQgbmFtZS5cbiAgICogLSBgLmNsYXNzYDogc2VsZWN0IGJ5IGNsYXNzIG5hbWUuXG4gICAqIC0gYFthdHRyaWJ1dGVdYDogc2VsZWN0IGJ5IGF0dHJpYnV0ZSBuYW1lLlxuICAgKiAtIGBbYXR0cmlidXRlPXZhbHVlXWA6IHNlbGVjdCBieSBhdHRyaWJ1dGUgbmFtZSBhbmQgdmFsdWUuXG4gICAqIC0gYDpub3Qoc3ViX3NlbGVjdG9yKWA6IHNlbGVjdCBvbmx5IGlmIHRoZSBlbGVtZW50IGRvZXMgbm90IG1hdGNoIHRoZSBgc3ViX3NlbGVjdG9yYC5cbiAgICogLSBgc2VsZWN0b3IxLCBzZWxlY3RvcjJgOiBzZWxlY3QgaWYgZWl0aGVyIGBzZWxlY3RvcjFgIG9yIGBzZWxlY3RvcjJgIG1hdGNoZXMuXG4gICAqXG4gICAqXG4gICAqICMjIyBFeGFtcGxlXG4gICAqXG4gICAqIFN1cHBvc2Ugd2UgaGF2ZSBhIGRpcmVjdGl2ZSB3aXRoIGFuIGBpbnB1dFt0eXBlPXRleHRdYCBzZWxlY3Rvci5cbiAgICpcbiAgICogQW5kIHRoZSBmb2xsb3dpbmcgSFRNTDpcbiAgICpcbiAgICogYGBgaHRtbFxuICAgKiA8Zm9ybT5cbiAgICogICA8aW5wdXQgdHlwZT1cInRleHRcIj5cbiAgICogICA8aW5wdXQgdHlwZT1cInJhZGlvXCI+XG4gICAqIDxmb3JtPlxuICAgKiBgYGBcbiAgICpcbiAgICogVGhlIGRpcmVjdGl2ZSB3b3VsZCBvbmx5IGJlIGluc3RhbnRpYXRlZCBvbiB0aGUgYDxpbnB1dCB0eXBlPVwidGV4dFwiPmAgZWxlbWVudC5cbiAgICpcbiAgICovXG4gIHNlbGVjdG9yOiBzdHJpbmc7XG5cbiAgLyoqXG4gICAqIEVudW1lcmF0ZXMgdGhlIHNldCBvZiBkYXRhLWJvdW5kIGlucHV0IHByb3BlcnRpZXMgZm9yIGEgZGlyZWN0aXZlXG4gICAqXG4gICAqIEFuZ3VsYXIgYXV0b21hdGljYWxseSB1cGRhdGVzIGlucHV0IHByb3BlcnRpZXMgZHVyaW5nIGNoYW5nZSBkZXRlY3Rpb24uXG4gICAqXG4gICAqIFRoZSBgaW5wdXRzYCBwcm9wZXJ0eSBkZWZpbmVzIGEgc2V0IG9mIGBkaXJlY3RpdmVQcm9wZXJ0eWAgdG8gYGJpbmRpbmdQcm9wZXJ0eWBcbiAgICogY29uZmlndXJhdGlvbjpcbiAgICpcbiAgICogLSBgZGlyZWN0aXZlUHJvcGVydHlgIHNwZWNpZmllcyB0aGUgY29tcG9uZW50IHByb3BlcnR5IHdoZXJlIHRoZSB2YWx1ZSBpcyB3cml0dGVuLlxuICAgKiAtIGBiaW5kaW5nUHJvcGVydHlgIHNwZWNpZmllcyB0aGUgRE9NIHByb3BlcnR5IHdoZXJlIHRoZSB2YWx1ZSBpcyByZWFkIGZyb20uXG4gICAqXG4gICAqIFdoZW4gYGJpbmRpbmdQcm9wZXJ0eWAgaXMgbm90IHByb3ZpZGVkLCBpdCBpcyBhc3N1bWVkIHRvIGJlIGVxdWFsIHRvIGBkaXJlY3RpdmVQcm9wZXJ0eWAuXG4gICAqXG4gICAqICMjIyBFeGFtcGxlIChbbGl2ZSBkZW1vXShodHRwOi8vcGxua3IuY28vZWRpdC9pdmhmWFk/cD1wcmV2aWV3KSlcbiAgICpcbiAgICogVGhlIGZvbGxvd2luZyBleGFtcGxlIGNyZWF0ZXMgYSBjb21wb25lbnQgd2l0aCB0d28gZGF0YS1ib3VuZCBwcm9wZXJ0aWVzLlxuICAgKlxuICAgKiBgYGB0eXBlc2NyaXB0XG4gICAqIEBDb21wb25lbnQoe1xuICAgKiAgIHNlbGVjdG9yOiAnYmFuay1hY2NvdW50JyxcbiAgICogICBpbnB1dHM6IFsnYmFua05hbWUnLCAnaWQ6IGFjY291bnQtaWQnXSxcbiAgICogICB0ZW1wbGF0ZTogYFxuICAgKiAgICAgQmFuayBOYW1lOiB7e2JhbmtOYW1lfX1cbiAgICogICAgIEFjY291bnQgSWQ6IHt7aWR9fVxuICAgKiAgIGBcbiAgICogfSlcbiAgICogY2xhc3MgQmFua0FjY291bnQge1xuICAgKiAgIGJhbmtOYW1lOiBzdHJpbmc7XG4gICAqICAgaWQ6IHN0cmluZztcbiAgICpcbiAgICogICAvLyB0aGlzIHByb3BlcnR5IGlzIG5vdCBib3VuZCwgYW5kIHdvbid0IGJlIGF1dG9tYXRpY2FsbHkgdXBkYXRlZCBieSBBbmd1bGFyXG4gICAqICAgbm9ybWFsaXplZEJhbmtOYW1lOiBzdHJpbmc7XG4gICAqIH1cbiAgICpcbiAgICogQENvbXBvbmVudCh7XG4gICAqICAgc2VsZWN0b3I6ICdhcHAnLFxuICAgKiAgIHRlbXBsYXRlOiBgXG4gICAqICAgICA8YmFuay1hY2NvdW50IGJhbmstbmFtZT1cIlJCQ1wiIGFjY291bnQtaWQ9XCI0NzQ3XCI+PC9iYW5rLWFjY291bnQ+XG4gICAqICAgYCxcbiAgICogICBkaXJlY3RpdmVzOiBbQmFua0FjY291bnRdXG4gICAqIH0pXG4gICAqIGNsYXNzIEFwcCB7fVxuICAgKlxuICAgKiBib290c3RyYXAoQXBwKTtcbiAgICogYGBgXG4gICAqXG4gICAqL1xuICBnZXQgaW5wdXRzKCk6IHN0cmluZ1tdIHtcbiAgICByZXR1cm4gaXNQcmVzZW50KHRoaXMuX3Byb3BlcnRpZXMpICYmIHRoaXMuX3Byb3BlcnRpZXMubGVuZ3RoID4gMCA/IHRoaXMuX3Byb3BlcnRpZXMgOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5faW5wdXRzO1xuICB9XG4gIGdldCBwcm9wZXJ0aWVzKCk6IHN0cmluZ1tdIHsgcmV0dXJuIHRoaXMuaW5wdXRzOyB9XG4gIHByaXZhdGUgX2lucHV0czogc3RyaW5nW107XG4gIHByaXZhdGUgX3Byb3BlcnRpZXM6IHN0cmluZ1tdO1xuXG4gIC8qKlxuICAgKiBFbnVtZXJhdGVzIHRoZSBzZXQgb2YgZXZlbnQtYm91bmQgb3V0cHV0IHByb3BlcnRpZXMuXG4gICAqXG4gICAqIFdoZW4gYW4gb3V0cHV0IHByb3BlcnR5IGVtaXRzIGFuIGV2ZW50LCBhbiBldmVudCBoYW5kbGVyIGF0dGFjaGVkIHRvIHRoYXQgZXZlbnRcbiAgICogdGhlIHRlbXBsYXRlIGlzIGludm9rZWQuXG4gICAqXG4gICAqIFRoZSBgb3V0cHV0c2AgcHJvcGVydHkgZGVmaW5lcyBhIHNldCBvZiBgZGlyZWN0aXZlUHJvcGVydHlgIHRvIGBiaW5kaW5nUHJvcGVydHlgXG4gICAqIGNvbmZpZ3VyYXRpb246XG4gICAqXG4gICAqIC0gYGRpcmVjdGl2ZVByb3BlcnR5YCBzcGVjaWZpZXMgdGhlIGNvbXBvbmVudCBwcm9wZXJ0eSB0aGF0IGVtaXRzIGV2ZW50cy5cbiAgICogLSBgYmluZGluZ1Byb3BlcnR5YCBzcGVjaWZpZXMgdGhlIERPTSBwcm9wZXJ0eSB0aGUgZXZlbnQgaGFuZGxlciBpcyBhdHRhY2hlZCB0by5cbiAgICpcbiAgICogIyMjIEV4YW1wbGUgKFtsaXZlIGRlbW9dKGh0dHA6Ly9wbG5rci5jby9lZGl0L2Q1Q05xNz9wPXByZXZpZXcpKVxuICAgKlxuICAgKiBgYGB0eXBlc2NyaXB0XG4gICAqIEBEaXJlY3RpdmUoe1xuICAgKiAgIHNlbGVjdG9yOiAnaW50ZXJ2YWwtZGlyJyxcbiAgICogICBvdXRwdXRzOiBbJ2V2ZXJ5U2Vjb25kJywgJ2ZpdmU1U2VjczogZXZlcnlGaXZlU2Vjb25kcyddXG4gICAqIH0pXG4gICAqIGNsYXNzIEludGVydmFsRGlyIHtcbiAgICogICBldmVyeVNlY29uZCA9IG5ldyBFdmVudEVtaXR0ZXIoKTtcbiAgICogICBmaXZlNVNlY3MgPSBuZXcgRXZlbnRFbWl0dGVyKCk7XG4gICAqXG4gICAqICAgY29uc3RydWN0b3IoKSB7XG4gICAqICAgICBzZXRJbnRlcnZhbCgoKSA9PiB0aGlzLmV2ZXJ5U2Vjb25kLmVtaXQoXCJldmVudFwiKSwgMTAwMCk7XG4gICAqICAgICBzZXRJbnRlcnZhbCgoKSA9PiB0aGlzLmZpdmU1U2Vjcy5lbWl0KFwiZXZlbnRcIiksIDUwMDApO1xuICAgKiAgIH1cbiAgICogfVxuICAgKlxuICAgKiBAQ29tcG9uZW50KHtcbiAgICogICBzZWxlY3RvcjogJ2FwcCcsXG4gICAqICAgdGVtcGxhdGU6IGBcbiAgICogICAgIDxpbnRlcnZhbC1kaXIgKGV2ZXJ5LXNlY29uZCk9XCJldmVyeVNlY29uZCgpXCIgKGV2ZXJ5LWZpdmUtc2Vjb25kcyk9XCJldmVyeUZpdmVTZWNvbmRzKClcIj5cbiAgICogICAgIDwvaW50ZXJ2YWwtZGlyPlxuICAgKiAgIGAsXG4gICAqICAgZGlyZWN0aXZlczogW0ludGVydmFsRGlyXVxuICAgKiB9KVxuICAgKiBjbGFzcyBBcHAge1xuICAgKiAgIGV2ZXJ5U2Vjb25kKCkgeyBjb25zb2xlLmxvZygnc2Vjb25kJyk7IH1cbiAgICogICBldmVyeUZpdmVTZWNvbmRzKCkgeyBjb25zb2xlLmxvZygnZml2ZSBzZWNvbmRzJyk7IH1cbiAgICogfVxuICAgKiBib290c3RyYXAoQXBwKTtcbiAgICogYGBgXG4gICAqXG4gICAqL1xuICBnZXQgb3V0cHV0cygpOiBzdHJpbmdbXSB7XG4gICAgcmV0dXJuIGlzUHJlc2VudCh0aGlzLl9ldmVudHMpICYmIHRoaXMuX2V2ZW50cy5sZW5ndGggPiAwID8gdGhpcy5fZXZlbnRzIDogdGhpcy5fb3V0cHV0cztcbiAgfVxuICBnZXQgZXZlbnRzKCk6IHN0cmluZ1tdIHsgcmV0dXJuIHRoaXMub3V0cHV0czsgfVxuICBwcml2YXRlIF9vdXRwdXRzOiBzdHJpbmdbXTtcbiAgcHJpdmF0ZSBfZXZlbnRzOiBzdHJpbmdbXTtcblxuICAvKipcbiAgICogU3BlY2lmeSB0aGUgZXZlbnRzLCBhY3Rpb25zLCBwcm9wZXJ0aWVzIGFuZCBhdHRyaWJ1dGVzIHJlbGF0ZWQgdG8gdGhlIGhvc3QgZWxlbWVudC5cbiAgICpcbiAgICogIyMgSG9zdCBMaXN0ZW5lcnNcbiAgICpcbiAgICogU3BlY2lmaWVzIHdoaWNoIERPTSBldmVudHMgYSBkaXJlY3RpdmUgbGlzdGVucyB0byB2aWEgYSBzZXQgb2YgYChldmVudClgIHRvIGBtZXRob2RgXG4gICAqIGtleS12YWx1ZSBwYWlyczpcbiAgICpcbiAgICogLSBgZXZlbnRgOiB0aGUgRE9NIGV2ZW50IHRoYXQgdGhlIGRpcmVjdGl2ZSBsaXN0ZW5zIHRvLlxuICAgKiAtIGBzdGF0ZW1lbnRgOiB0aGUgc3RhdGVtZW50IHRvIGV4ZWN1dGUgd2hlbiB0aGUgZXZlbnQgb2NjdXJzLlxuICAgKiBJZiB0aGUgZXZhbHVhdGlvbiBvZiB0aGUgc3RhdGVtZW50IHJldHVybnMgYGZhbHNlYCwgdGhlbiBgcHJldmVudERlZmF1bHRgaXMgYXBwbGllZCBvbiB0aGUgRE9NXG4gICAqIGV2ZW50LlxuICAgKlxuICAgKiBUbyBsaXN0ZW4gdG8gZ2xvYmFsIGV2ZW50cywgYSB0YXJnZXQgbXVzdCBiZSBhZGRlZCB0byB0aGUgZXZlbnQgbmFtZS5cbiAgICogVGhlIHRhcmdldCBjYW4gYmUgYHdpbmRvd2AsIGBkb2N1bWVudGAgb3IgYGJvZHlgLlxuICAgKlxuICAgKiBXaGVuIHdyaXRpbmcgYSBkaXJlY3RpdmUgZXZlbnQgYmluZGluZywgeW91IGNhbiBhbHNvIHJlZmVyIHRvIHRoZSAkZXZlbnQgbG9jYWwgdmFyaWFibGUuXG4gICAqXG4gICAqICMjIyBFeGFtcGxlIChbbGl2ZSBkZW1vXShodHRwOi8vcGxua3IuY28vZWRpdC9EbEE1S1U/cD1wcmV2aWV3KSlcbiAgICpcbiAgICogVGhlIGZvbGxvd2luZyBleGFtcGxlIGRlY2xhcmVzIGEgZGlyZWN0aXZlIHRoYXQgYXR0YWNoZXMgYSBjbGljayBsaXN0ZW5lciB0byB0aGUgYnV0dG9uIGFuZFxuICAgKiBjb3VudHMgY2xpY2tzLlxuICAgKlxuICAgKiBgYGB0eXBlc2NyaXB0XG4gICAqIEBEaXJlY3RpdmUoe1xuICAgKiAgIHNlbGVjdG9yOiAnYnV0dG9uW2NvdW50aW5nXScsXG4gICAqICAgaG9zdDoge1xuICAgKiAgICAgJyhjbGljayknOiAnb25DbGljaygkZXZlbnQudGFyZ2V0KSdcbiAgICogICB9XG4gICAqIH0pXG4gICAqIGNsYXNzIENvdW50Q2xpY2tzIHtcbiAgICogICBudW1iZXJPZkNsaWNrcyA9IDA7XG4gICAqXG4gICAqICAgb25DbGljayhidG4pIHtcbiAgICogICAgIGNvbnNvbGUubG9nKFwiYnV0dG9uXCIsIGJ0biwgXCJudW1iZXIgb2YgY2xpY2tzOlwiLCB0aGlzLm51bWJlck9mQ2xpY2tzKyspO1xuICAgKiAgIH1cbiAgICogfVxuICAgKlxuICAgKiBAQ29tcG9uZW50KHtcbiAgICogICBzZWxlY3RvcjogJ2FwcCcsXG4gICAqICAgdGVtcGxhdGU6IGA8YnV0dG9uIGNvdW50aW5nPkluY3JlbWVudDwvYnV0dG9uPmAsXG4gICAqICAgZGlyZWN0aXZlczogW0NvdW50Q2xpY2tzXVxuICAgKiB9KVxuICAgKiBjbGFzcyBBcHAge31cbiAgICpcbiAgICogYm9vdHN0cmFwKEFwcCk7XG4gICAqIGBgYFxuICAgKlxuICAgKiAjIyBIb3N0IFByb3BlcnR5IEJpbmRpbmdzXG4gICAqXG4gICAqIFNwZWNpZmllcyB3aGljaCBET00gcHJvcGVydGllcyBhIGRpcmVjdGl2ZSB1cGRhdGVzLlxuICAgKlxuICAgKiBBbmd1bGFyIGF1dG9tYXRpY2FsbHkgY2hlY2tzIGhvc3QgcHJvcGVydHkgYmluZGluZ3MgZHVyaW5nIGNoYW5nZSBkZXRlY3Rpb24uXG4gICAqIElmIGEgYmluZGluZyBjaGFuZ2VzLCBpdCB3aWxsIHVwZGF0ZSB0aGUgaG9zdCBlbGVtZW50IG9mIHRoZSBkaXJlY3RpdmUuXG4gICAqXG4gICAqICMjIyBFeGFtcGxlIChbbGl2ZSBkZW1vXShodHRwOi8vcGxua3IuY28vZWRpdC9nTmcwRUQ/cD1wcmV2aWV3KSlcbiAgICpcbiAgICogVGhlIGZvbGxvd2luZyBleGFtcGxlIGNyZWF0ZXMgYSBkaXJlY3RpdmUgdGhhdCBzZXRzIHRoZSBgdmFsaWRgIGFuZCBgaW52YWxpZGAgY2xhc3Nlc1xuICAgKiBvbiB0aGUgRE9NIGVsZW1lbnQgdGhhdCBoYXMgbmdNb2RlbCBkaXJlY3RpdmUgb24gaXQuXG4gICAqXG4gICAqIGBgYHR5cGVzY3JpcHRcbiAgICogQERpcmVjdGl2ZSh7XG4gICAqICAgc2VsZWN0b3I6ICdbbmdNb2RlbF0nLFxuICAgKiAgIGhvc3Q6IHtcbiAgICogICAgICdbY2xhc3MudmFsaWRdJzogJ3ZhbGlkJyxcbiAgICogICAgICdbY2xhc3MuaW52YWxpZF0nOiAnaW52YWxpZCdcbiAgICogICB9XG4gICAqIH0pXG4gICAqIGNsYXNzIE5nTW9kZWxTdGF0dXMge1xuICAgKiAgIGNvbnN0cnVjdG9yKHB1YmxpYyBjb250cm9sOk5nTW9kZWwpIHt9XG4gICAqICAgZ2V0IHZhbGlkIHsgcmV0dXJuIHRoaXMuY29udHJvbC52YWxpZDsgfVxuICAgKiAgIGdldCBpbnZhbGlkIHsgcmV0dXJuIHRoaXMuY29udHJvbC5pbnZhbGlkOyB9XG4gICAqIH1cbiAgICpcbiAgICogQENvbXBvbmVudCh7XG4gICAqICAgc2VsZWN0b3I6ICdhcHAnLFxuICAgKiAgIHRlbXBsYXRlOiBgPGlucHV0IFsobmdNb2RlbCldPVwicHJvcFwiPmAsXG4gICAqICAgZGlyZWN0aXZlczogW0ZPUk1fRElSRUNUSVZFUywgTmdNb2RlbFN0YXR1c11cbiAgICogfSlcbiAgICogY2xhc3MgQXBwIHtcbiAgICogICBwcm9wO1xuICAgKiB9XG4gICAqXG4gICAqIGJvb3RzdHJhcChBcHApO1xuICAgKiBgYGBcbiAgICpcbiAgICogIyMgQXR0cmlidXRlc1xuICAgKlxuICAgKiBTcGVjaWZpZXMgc3RhdGljIGF0dHJpYnV0ZXMgdGhhdCBzaG91bGQgYmUgcHJvcGFnYXRlZCB0byBhIGhvc3QgZWxlbWVudC5cbiAgICpcbiAgICogIyMjIEV4YW1wbGVcbiAgICpcbiAgICogSW4gdGhpcyBleGFtcGxlIHVzaW5nIGBteS1idXR0b25gIGRpcmVjdGl2ZSAoZXguOiBgPGRpdiBteS1idXR0b24+PC9kaXY+YCkgb24gYSBob3N0IGVsZW1lbnRcbiAgICogKGhlcmU6IGA8ZGl2PmAgKSB3aWxsIGVuc3VyZSB0aGF0IHRoaXMgZWxlbWVudCB3aWxsIGdldCB0aGUgXCJidXR0b25cIiByb2xlLlxuICAgKlxuICAgKiBgYGB0eXBlc2NyaXB0XG4gICAqIEBEaXJlY3RpdmUoe1xuICAgKiAgIHNlbGVjdG9yOiAnW215LWJ1dHRvbl0nLFxuICAgKiAgIGhvc3Q6IHtcbiAgICogICAgICdyb2xlJzogJ2J1dHRvbidcbiAgICogICB9XG4gICAqIH0pXG4gICAqIGNsYXNzIE15QnV0dG9uIHtcbiAgICogfVxuICAgKiBgYGBcbiAgICovXG4gIGhvc3Q6IHtba2V5OiBzdHJpbmddOiBzdHJpbmd9O1xuXG4gIC8qKlxuICAgKiBEZWZpbmVzIHRoZSBzZXQgb2YgaW5qZWN0YWJsZSBvYmplY3RzIHRoYXQgYXJlIHZpc2libGUgdG8gYSBEaXJlY3RpdmUgYW5kIGl0cyBsaWdodCBET01cbiAgICogY2hpbGRyZW4uXG4gICAqXG4gICAqICMjIFNpbXBsZSBFeGFtcGxlXG4gICAqXG4gICAqIEhlcmUgaXMgYW4gZXhhbXBsZSBvZiBhIGNsYXNzIHRoYXQgY2FuIGJlIGluamVjdGVkOlxuICAgKlxuICAgKiBgYGBcbiAgICogY2xhc3MgR3JlZXRlciB7XG4gICAqICAgIGdyZWV0KG5hbWU6c3RyaW5nKSB7XG4gICAqICAgICAgcmV0dXJuICdIZWxsbyAnICsgbmFtZSArICchJztcbiAgICogICAgfVxuICAgKiB9XG4gICAqXG4gICAqIEBEaXJlY3RpdmUoe1xuICAgKiAgIHNlbGVjdG9yOiAnZ3JlZXQnLFxuICAgKiAgIGJpbmRpbmdzOiBbXG4gICAqICAgICBHcmVldGVyXG4gICAqICAgXVxuICAgKiB9KVxuICAgKiBjbGFzcyBIZWxsb1dvcmxkIHtcbiAgICogICBncmVldGVyOkdyZWV0ZXI7XG4gICAqXG4gICAqICAgY29uc3RydWN0b3IoZ3JlZXRlcjpHcmVldGVyKSB7XG4gICAqICAgICB0aGlzLmdyZWV0ZXIgPSBncmVldGVyO1xuICAgKiAgIH1cbiAgICogfVxuICAgKiBgYGBcbiAgICovXG4gIGdldCBwcm92aWRlcnMoKTogYW55W10ge1xuICAgIHJldHVybiBpc1ByZXNlbnQodGhpcy5fYmluZGluZ3MpICYmIHRoaXMuX2JpbmRpbmdzLmxlbmd0aCA+IDAgPyB0aGlzLl9iaW5kaW5ncyA6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuX3Byb3ZpZGVycztcbiAgfVxuICAvKiogQGRlcHJlY2F0ZWQgKi9cbiAgZ2V0IGJpbmRpbmdzKCk6IGFueVtdIHsgcmV0dXJuIHRoaXMucHJvdmlkZXJzOyB9XG4gIHByaXZhdGUgX3Byb3ZpZGVyczogYW55W107XG4gIHByaXZhdGUgX2JpbmRpbmdzOiBhbnlbXTtcblxuICAvKipcbiAgICogRGVmaW5lcyB0aGUgbmFtZSB0aGF0IGNhbiBiZSB1c2VkIGluIHRoZSB0ZW1wbGF0ZSB0byBhc3NpZ24gdGhpcyBkaXJlY3RpdmUgdG8gYSB2YXJpYWJsZS5cbiAgICpcbiAgICogIyMgU2ltcGxlIEV4YW1wbGVcbiAgICpcbiAgICogYGBgXG4gICAqIEBEaXJlY3RpdmUoe1xuICAgKiAgIHNlbGVjdG9yOiAnY2hpbGQtZGlyJyxcbiAgICogICBleHBvcnRBczogJ2NoaWxkJ1xuICAgKiB9KVxuICAgKiBjbGFzcyBDaGlsZERpciB7XG4gICAqIH1cbiAgICpcbiAgICogQENvbXBvbmVudCh7XG4gICAqICAgc2VsZWN0b3I6ICdtYWluJyxcbiAgICogICB0ZW1wbGF0ZTogYDxjaGlsZC1kaXIgI2M9XCJjaGlsZFwiPjwvY2hpbGQtZGlyPmAsXG4gICAqICAgZGlyZWN0aXZlczogW0NoaWxkRGlyXVxuICAgKiB9KVxuICAgKiBjbGFzcyBNYWluQ29tcG9uZW50IHtcbiAgICogfVxuICAgKlxuICAgKiBgYGBcbiAgICovXG4gIGV4cG9ydEFzOiBzdHJpbmc7XG5cbiAgLyoqXG4gICAqIFRoZSBtb2R1bGUgaWQgb2YgdGhlIG1vZHVsZSB0aGF0IGNvbnRhaW5zIHRoZSBkaXJlY3RpdmUuXG4gICAqIE5lZWRlZCB0byBiZSBhYmxlIHRvIHJlc29sdmUgcmVsYXRpdmUgdXJscyBmb3IgdGVtcGxhdGVzIGFuZCBzdHlsZXMuXG4gICAqIEluIERhcnQsIHRoaXMgY2FuIGJlIGRldGVybWluZWQgYXV0b21hdGljYWxseSBhbmQgZG9lcyBub3QgbmVlZCB0byBiZSBzZXQuXG4gICAqIEluIENvbW1vbkpTLCB0aGlzIGNhbiBhbHdheXMgYmUgc2V0IHRvIGBtb2R1bGUuaWRgLlxuICAgKlxuICAgKiAjIyBTaW1wbGUgRXhhbXBsZVxuICAgKlxuICAgKiBgYGBcbiAgICogQERpcmVjdGl2ZSh7XG4gICAqICAgc2VsZWN0b3I6ICdzb21lRGlyJyxcbiAgICogICBtb2R1bGVJZDogbW9kdWxlLmlkXG4gICAqIH0pXG4gICAqIGNsYXNzIFNvbWVEaXIge1xuICAgKiB9XG4gICAqXG4gICAqIGBgYFxuICAgKi9cbiAgbW9kdWxlSWQ6IHN0cmluZztcblxuICAvLyBUT0RPOiBhZGQgYW4gZXhhbXBsZSBhZnRlciBDb250ZW50Q2hpbGRyZW4gYW5kIFZpZXdDaGlsZHJlbiBhcmUgaW4gbWFzdGVyXG4gIC8qKlxuICAgKiBDb25maWd1cmVzIHRoZSBxdWVyaWVzIHRoYXQgd2lsbCBiZSBpbmplY3RlZCBpbnRvIHRoZSBkaXJlY3RpdmUuXG4gICAqXG4gICAqIENvbnRlbnQgcXVlcmllcyBhcmUgc2V0IGJlZm9yZSB0aGUgYG5nQWZ0ZXJDb250ZW50SW5pdGAgY2FsbGJhY2sgaXMgY2FsbGVkLlxuICAgKiBWaWV3IHF1ZXJpZXMgYXJlIHNldCBiZWZvcmUgdGhlIGBuZ0FmdGVyVmlld0luaXRgIGNhbGxiYWNrIGlzIGNhbGxlZC5cbiAgICpcbiAgICogIyMjIEV4YW1wbGVcbiAgICpcbiAgICogYGBgXG4gICAqIEBDb21wb25lbnQoe1xuICAgKiAgIHNlbGVjdG9yOiAnc29tZURpcicsXG4gICAqICAgcXVlcmllczoge1xuICAgKiAgICAgY29udGVudENoaWxkcmVuOiBuZXcgQ29udGVudENoaWxkcmVuKENoaWxkRGlyZWN0aXZlKSxcbiAgICogICAgIHZpZXdDaGlsZHJlbjogbmV3IFZpZXdDaGlsZHJlbihDaGlsZERpcmVjdGl2ZSlcbiAgICogICB9LFxuICAgKiAgIHRlbXBsYXRlOiAnPGNoaWxkLWRpcmVjdGl2ZT48L2NoaWxkLWRpcmVjdGl2ZT4nLFxuICAgKiAgIGRpcmVjdGl2ZXM6IFtDaGlsZERpcmVjdGl2ZV1cbiAgICogfSlcbiAgICogY2xhc3MgU29tZURpciB7XG4gICAqICAgY29udGVudENoaWxkcmVuOiBRdWVyeUxpc3Q8Q2hpbGREaXJlY3RpdmU+LFxuICAgKiAgIHZpZXdDaGlsZHJlbjogUXVlcnlMaXN0PENoaWxkRGlyZWN0aXZlPlxuICAgKlxuICAgKiAgIG5nQWZ0ZXJDb250ZW50SW5pdCgpIHtcbiAgICogICAgIC8vIGNvbnRlbnRDaGlsZHJlbiBpcyBzZXRcbiAgICogICB9XG4gICAqXG4gICAqICAgbmdBZnRlclZpZXdJbml0KCkge1xuICAgKiAgICAgLy8gdmlld0NoaWxkcmVuIGlzIHNldFxuICAgKiAgIH1cbiAgICogfVxuICAgKiBgYGBcbiAgICovXG4gIHF1ZXJpZXM6IHtba2V5OiBzdHJpbmddOiBhbnl9O1xuXG4gIGNvbnN0cnVjdG9yKHtzZWxlY3RvciwgaW5wdXRzLCBvdXRwdXRzLCBwcm9wZXJ0aWVzLCBldmVudHMsIGhvc3QsIGJpbmRpbmdzLCBwcm92aWRlcnMsIGV4cG9ydEFzLFxuICAgICAgICAgICAgICAgbW9kdWxlSWQsIHF1ZXJpZXN9OiB7XG4gICAgc2VsZWN0b3I/OiBzdHJpbmcsXG4gICAgaW5wdXRzPzogc3RyaW5nW10sXG4gICAgb3V0cHV0cz86IHN0cmluZ1tdLFxuICAgIHByb3BlcnRpZXM/OiBzdHJpbmdbXSxcbiAgICBldmVudHM/OiBzdHJpbmdbXSxcbiAgICBob3N0Pzoge1trZXk6IHN0cmluZ106IHN0cmluZ30sXG4gICAgcHJvdmlkZXJzPzogYW55W10sXG4gICAgLyoqIEBkZXByZWNhdGVkICovIGJpbmRpbmdzPzogYW55W10sXG4gICAgZXhwb3J0QXM/OiBzdHJpbmcsXG4gICAgbW9kdWxlSWQ/OiBzdHJpbmcsXG4gICAgcXVlcmllcz86IHtba2V5OiBzdHJpbmddOiBhbnl9XG4gIH0gPSB7fSkge1xuICAgIHN1cGVyKCk7XG4gICAgdGhpcy5zZWxlY3RvciA9IHNlbGVjdG9yO1xuICAgIHRoaXMuX2lucHV0cyA9IGlucHV0cztcbiAgICB0aGlzLl9wcm9wZXJ0aWVzID0gcHJvcGVydGllcztcbiAgICB0aGlzLl9vdXRwdXRzID0gb3V0cHV0cztcbiAgICB0aGlzLl9ldmVudHMgPSBldmVudHM7XG4gICAgdGhpcy5ob3N0ID0gaG9zdDtcbiAgICB0aGlzLmV4cG9ydEFzID0gZXhwb3J0QXM7XG4gICAgdGhpcy5tb2R1bGVJZCA9IG1vZHVsZUlkO1xuICAgIHRoaXMucXVlcmllcyA9IHF1ZXJpZXM7XG4gICAgdGhpcy5fcHJvdmlkZXJzID0gcHJvdmlkZXJzO1xuICAgIHRoaXMuX2JpbmRpbmdzID0gYmluZGluZ3M7XG4gIH1cbn1cblxuLyoqXG4gKiBEZWNsYXJlIHJldXNhYmxlIFVJIGJ1aWxkaW5nIGJsb2NrcyBmb3IgYW4gYXBwbGljYXRpb24uXG4gKlxuICogRWFjaCBBbmd1bGFyIGNvbXBvbmVudCByZXF1aXJlcyBhIHNpbmdsZSBgQENvbXBvbmVudGAgYW5ub3RhdGlvbi4gVGhlXG4gKiBgQENvbXBvbmVudGBcbiAqIGFubm90YXRpb24gc3BlY2lmaWVzIHdoZW4gYSBjb21wb25lbnQgaXMgaW5zdGFudGlhdGVkLCBhbmQgd2hpY2ggcHJvcGVydGllcyBhbmQgaG9zdExpc3RlbmVycyBpdFxuICogYmluZHMgdG8uXG4gKlxuICogV2hlbiBhIGNvbXBvbmVudCBpcyBpbnN0YW50aWF0ZWQsIEFuZ3VsYXJcbiAqIC0gY3JlYXRlcyBhIHNoYWRvdyBET00gZm9yIHRoZSBjb21wb25lbnQuXG4gKiAtIGxvYWRzIHRoZSBzZWxlY3RlZCB0ZW1wbGF0ZSBpbnRvIHRoZSBzaGFkb3cgRE9NLlxuICogLSBjcmVhdGVzIGFsbCB0aGUgaW5qZWN0YWJsZSBvYmplY3RzIGNvbmZpZ3VyZWQgd2l0aCBgcHJvdmlkZXJzYCBhbmQgYHZpZXdQcm92aWRlcnNgLlxuICpcbiAqIEFsbCB0ZW1wbGF0ZSBleHByZXNzaW9ucyBhbmQgc3RhdGVtZW50cyBhcmUgdGhlbiBldmFsdWF0ZWQgYWdhaW5zdCB0aGUgY29tcG9uZW50IGluc3RhbmNlLlxuICpcbiAqIEZvciBkZXRhaWxzIG9uIHRoZSBgQFZpZXdgIGFubm90YXRpb24sIHNlZSB7QGxpbmsgVmlld01ldGFkYXRhfS5cbiAqXG4gKiAjIyBMaWZlY3ljbGUgaG9va3NcbiAqXG4gKiBXaGVuIHRoZSBjb21wb25lbnQgY2xhc3MgaW1wbGVtZW50cyBzb21lIHtAbGluayBhbmd1bGFyMi9saWZlY3ljbGVfaG9va3N9IHRoZSBjYWxsYmFja3MgYXJlXG4gKiBjYWxsZWQgYnkgdGhlIGNoYW5nZSBkZXRlY3Rpb24gYXQgZGVmaW5lZCBwb2ludHMgaW4gdGltZSBkdXJpbmcgdGhlIGxpZmUgb2YgdGhlIGNvbXBvbmVudC5cbiAqXG4gKiAjIyMgRXhhbXBsZVxuICpcbiAqIGBgYFxuICogQENvbXBvbmVudCh7XG4gKiAgIHNlbGVjdG9yOiAnZ3JlZXQnLFxuICogICB0ZW1wbGF0ZTogJ0hlbGxvIHt7bmFtZX19ISdcbiAqIH0pXG4gKiBjbGFzcyBHcmVldCB7XG4gKiAgIG5hbWU6IHN0cmluZztcbiAqXG4gKiAgIGNvbnN0cnVjdG9yKCkge1xuICogICAgIHRoaXMubmFtZSA9ICdXb3JsZCc7XG4gKiAgIH1cbiAqIH1cbiAqIGBgYFxuICpcbiAqL1xuQENPTlNUKClcbmV4cG9ydCBjbGFzcyBDb21wb25lbnRNZXRhZGF0YSBleHRlbmRzIERpcmVjdGl2ZU1ldGFkYXRhIHtcbiAgLyoqXG4gICAqIERlZmluZXMgdGhlIHVzZWQgY2hhbmdlIGRldGVjdGlvbiBzdHJhdGVneS5cbiAgICpcbiAgICogV2hlbiBhIGNvbXBvbmVudCBpcyBpbnN0YW50aWF0ZWQsIEFuZ3VsYXIgY3JlYXRlcyBhIGNoYW5nZSBkZXRlY3Rvciwgd2hpY2ggaXMgcmVzcG9uc2libGUgZm9yXG4gICAqIHByb3BhZ2F0aW5nIHRoZSBjb21wb25lbnQncyBiaW5kaW5ncy5cbiAgICpcbiAgICogVGhlIGBjaGFuZ2VEZXRlY3Rpb25gIHByb3BlcnR5IGRlZmluZXMsIHdoZXRoZXIgdGhlIGNoYW5nZSBkZXRlY3Rpb24gd2lsbCBiZSBjaGVja2VkIGV2ZXJ5IHRpbWVcbiAgICogb3Igb25seSB3aGVuIHRoZSBjb21wb25lbnQgdGVsbHMgaXQgdG8gZG8gc28uXG4gICAqL1xuICBjaGFuZ2VEZXRlY3Rpb246IENoYW5nZURldGVjdGlvblN0cmF0ZWd5O1xuXG4gIC8qKlxuICAgKiBEZWZpbmVzIHRoZSBzZXQgb2YgaW5qZWN0YWJsZSBvYmplY3RzIHRoYXQgYXJlIHZpc2libGUgdG8gaXRzIHZpZXcgRE9NIGNoaWxkcmVuLlxuICAgKlxuICAgKiAjIyBTaW1wbGUgRXhhbXBsZVxuICAgKlxuICAgKiBIZXJlIGlzIGFuIGV4YW1wbGUgb2YgYSBjbGFzcyB0aGF0IGNhbiBiZSBpbmplY3RlZDpcbiAgICpcbiAgICogYGBgXG4gICAqIGNsYXNzIEdyZWV0ZXIge1xuICAgKiAgICBncmVldChuYW1lOnN0cmluZykge1xuICAgKiAgICAgIHJldHVybiAnSGVsbG8gJyArIG5hbWUgKyAnISc7XG4gICAqICAgIH1cbiAgICogfVxuICAgKlxuICAgKiBARGlyZWN0aXZlKHtcbiAgICogICBzZWxlY3RvcjogJ25lZWRzLWdyZWV0ZXInXG4gICAqIH0pXG4gICAqIGNsYXNzIE5lZWRzR3JlZXRlciB7XG4gICAqICAgZ3JlZXRlcjpHcmVldGVyO1xuICAgKlxuICAgKiAgIGNvbnN0cnVjdG9yKGdyZWV0ZXI6R3JlZXRlcikge1xuICAgKiAgICAgdGhpcy5ncmVldGVyID0gZ3JlZXRlcjtcbiAgICogICB9XG4gICAqIH1cbiAgICpcbiAgICogQENvbXBvbmVudCh7XG4gICAqICAgc2VsZWN0b3I6ICdncmVldCcsXG4gICAqICAgdmlld1Byb3ZpZGVyczogW1xuICAgKiAgICAgR3JlZXRlclxuICAgKiAgIF0sXG4gICAqICAgdGVtcGxhdGU6IGA8bmVlZHMtZ3JlZXRlcj48L25lZWRzLWdyZWV0ZXI+YCxcbiAgICogICBkaXJlY3RpdmVzOiBbTmVlZHNHcmVldGVyXVxuICAgKiB9KVxuICAgKiBjbGFzcyBIZWxsb1dvcmxkIHtcbiAgICogfVxuICAgKlxuICAgKiBgYGBcbiAgICovXG4gIGdldCB2aWV3UHJvdmlkZXJzKCk6IGFueVtdIHtcbiAgICByZXR1cm4gaXNQcmVzZW50KHRoaXMuX3ZpZXdCaW5kaW5ncykgJiYgdGhpcy5fdmlld0JpbmRpbmdzLmxlbmd0aCA+IDAgPyB0aGlzLl92aWV3QmluZGluZ3MgOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuX3ZpZXdQcm92aWRlcnM7XG4gIH1cbiAgZ2V0IHZpZXdCaW5kaW5ncygpOiBhbnlbXSB7IHJldHVybiB0aGlzLnZpZXdQcm92aWRlcnM7IH1cbiAgcHJpdmF0ZSBfdmlld1Byb3ZpZGVyczogYW55W107XG4gIHByaXZhdGUgX3ZpZXdCaW5kaW5nczogYW55W107XG5cbiAgdGVtcGxhdGVVcmw6IHN0cmluZztcblxuICB0ZW1wbGF0ZTogc3RyaW5nO1xuXG4gIHN0eWxlVXJsczogc3RyaW5nW107XG5cbiAgc3R5bGVzOiBzdHJpbmdbXTtcblxuICBkaXJlY3RpdmVzOiBBcnJheTxUeXBlIHwgYW55W10+O1xuXG4gIHBpcGVzOiBBcnJheTxUeXBlIHwgYW55W10+O1xuXG4gIGVuY2Fwc3VsYXRpb246IFZpZXdFbmNhcHN1bGF0aW9uO1xuXG4gIGNvbnN0cnVjdG9yKHtzZWxlY3RvciwgaW5wdXRzLCBvdXRwdXRzLCBwcm9wZXJ0aWVzLCBldmVudHMsIGhvc3QsIGV4cG9ydEFzLCBtb2R1bGVJZCwgYmluZGluZ3MsXG4gICAgICAgICAgICAgICBwcm92aWRlcnMsIHZpZXdCaW5kaW5ncywgdmlld1Byb3ZpZGVycyxcbiAgICAgICAgICAgICAgIGNoYW5nZURldGVjdGlvbiA9IENoYW5nZURldGVjdGlvblN0cmF0ZWd5LkRlZmF1bHQsIHF1ZXJpZXMsIHRlbXBsYXRlVXJsLCB0ZW1wbGF0ZSxcbiAgICAgICAgICAgICAgIHN0eWxlVXJscywgc3R5bGVzLCBkaXJlY3RpdmVzLCBwaXBlcywgZW5jYXBzdWxhdGlvbn06IHtcbiAgICBzZWxlY3Rvcj86IHN0cmluZyxcbiAgICBpbnB1dHM/OiBzdHJpbmdbXSxcbiAgICBvdXRwdXRzPzogc3RyaW5nW10sXG4gICAgcHJvcGVydGllcz86IHN0cmluZ1tdLFxuICAgIGV2ZW50cz86IHN0cmluZ1tdLFxuICAgIGhvc3Q/OiB7W2tleTogc3RyaW5nXTogc3RyaW5nfSxcbiAgICAvKiogQGRlcHJlY2F0ZWQgKi8gYmluZGluZ3M/OiBhbnlbXSxcbiAgICBwcm92aWRlcnM/OiBhbnlbXSxcbiAgICBleHBvcnRBcz86IHN0cmluZyxcbiAgICBtb2R1bGVJZD86IHN0cmluZyxcbiAgICAvKiogQGRlcHJlY2F0ZWQgKi8gdmlld0JpbmRpbmdzPzogYW55W10sXG4gICAgdmlld1Byb3ZpZGVycz86IGFueVtdLFxuICAgIHF1ZXJpZXM/OiB7W2tleTogc3RyaW5nXTogYW55fSxcbiAgICBjaGFuZ2VEZXRlY3Rpb24/OiBDaGFuZ2VEZXRlY3Rpb25TdHJhdGVneSxcbiAgICB0ZW1wbGF0ZVVybD86IHN0cmluZyxcbiAgICB0ZW1wbGF0ZT86IHN0cmluZyxcbiAgICBzdHlsZVVybHM/OiBzdHJpbmdbXSxcbiAgICBzdHlsZXM/OiBzdHJpbmdbXSxcbiAgICBkaXJlY3RpdmVzPzogQXJyYXk8VHlwZSB8IGFueVtdPixcbiAgICBwaXBlcz86IEFycmF5PFR5cGUgfCBhbnlbXT4sXG4gICAgZW5jYXBzdWxhdGlvbj86IFZpZXdFbmNhcHN1bGF0aW9uXG4gIH0gPSB7fSkge1xuICAgIHN1cGVyKHtcbiAgICAgIHNlbGVjdG9yOiBzZWxlY3RvcixcbiAgICAgIGlucHV0czogaW5wdXRzLFxuICAgICAgb3V0cHV0czogb3V0cHV0cyxcbiAgICAgIHByb3BlcnRpZXM6IHByb3BlcnRpZXMsXG4gICAgICBldmVudHM6IGV2ZW50cyxcbiAgICAgIGhvc3Q6IGhvc3QsXG4gICAgICBleHBvcnRBczogZXhwb3J0QXMsXG4gICAgICBtb2R1bGVJZDogbW9kdWxlSWQsXG4gICAgICBiaW5kaW5nczogYmluZGluZ3MsXG4gICAgICBwcm92aWRlcnM6IHByb3ZpZGVycyxcbiAgICAgIHF1ZXJpZXM6IHF1ZXJpZXNcbiAgICB9KTtcblxuICAgIHRoaXMuY2hhbmdlRGV0ZWN0aW9uID0gY2hhbmdlRGV0ZWN0aW9uO1xuICAgIHRoaXMuX3ZpZXdQcm92aWRlcnMgPSB2aWV3UHJvdmlkZXJzO1xuICAgIHRoaXMuX3ZpZXdCaW5kaW5ncyA9IHZpZXdCaW5kaW5ncztcbiAgICB0aGlzLnRlbXBsYXRlVXJsID0gdGVtcGxhdGVVcmw7XG4gICAgdGhpcy50ZW1wbGF0ZSA9IHRlbXBsYXRlO1xuICAgIHRoaXMuc3R5bGVVcmxzID0gc3R5bGVVcmxzO1xuICAgIHRoaXMuc3R5bGVzID0gc3R5bGVzO1xuICAgIHRoaXMuZGlyZWN0aXZlcyA9IGRpcmVjdGl2ZXM7XG4gICAgdGhpcy5waXBlcyA9IHBpcGVzO1xuICAgIHRoaXMuZW5jYXBzdWxhdGlvbiA9IGVuY2Fwc3VsYXRpb247XG4gIH1cbn1cblxuLyoqXG4gKiBEZWNsYXJlIHJldXNhYmxlIHBpcGUgZnVuY3Rpb24uXG4gKlxuICogQSBcInB1cmVcIiBwaXBlIGlzIG9ubHkgcmUtZXZhbHVhdGVkIHdoZW4gZWl0aGVyIHRoZSBpbnB1dCBvciBhbnkgb2YgdGhlIGFyZ3VtZW50cyBjaGFuZ2UuXG4gKlxuICogV2hlbiBub3Qgc3BlY2lmaWVkLCBwaXBlcyBkZWZhdWx0IHRvIGJlaW5nIHB1cmUuXG4gKlxuICogIyMjIEV4YW1wbGVcbiAqXG4gKiBgYGBcbiAqIEBQaXBlKHtuYW1lOiAnbG93ZXJjYXNlJ30pXG4gKiBjbGFzcyBMb3dlcmNhc2Uge1xuICogICB0cmFuc2Zvcm0odiwgYXJncykgeyByZXR1cm4gdi50b0xvd2VyQ2FzZSgpOyB9XG4gKiB9XG4gKiBgYGBcbiAqL1xuQENPTlNUKClcbmV4cG9ydCBjbGFzcyBQaXBlTWV0YWRhdGEgZXh0ZW5kcyBJbmplY3RhYmxlTWV0YWRhdGEge1xuICBuYW1lOiBzdHJpbmc7XG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgX3B1cmU6IGJvb2xlYW47XG5cbiAgY29uc3RydWN0b3Ioe25hbWUsIHB1cmV9OiB7bmFtZTogc3RyaW5nLCBwdXJlPzogYm9vbGVhbn0pIHtcbiAgICBzdXBlcigpO1xuICAgIHRoaXMubmFtZSA9IG5hbWU7XG4gICAgdGhpcy5fcHVyZSA9IHB1cmU7XG4gIH1cblxuICBnZXQgcHVyZSgpOiBib29sZWFuIHsgcmV0dXJuIGlzUHJlc2VudCh0aGlzLl9wdXJlKSA/IHRoaXMuX3B1cmUgOiB0cnVlOyB9XG59XG5cbi8qKlxuICogRGVjbGFyZXMgYSBkYXRhLWJvdW5kIGlucHV0IHByb3BlcnR5LlxuICpcbiAqIEFuZ3VsYXIgYXV0b21hdGljYWxseSB1cGRhdGVzIGRhdGEtYm91bmQgcHJvcGVydGllcyBkdXJpbmcgY2hhbmdlIGRldGVjdGlvbi5cbiAqXG4gKiBgSW5wdXRNZXRhZGF0YWAgdGFrZXMgYW4gb3B0aW9uYWwgcGFyYW1ldGVyIHRoYXQgc3BlY2lmaWVzIHRoZSBuYW1lXG4gKiB1c2VkIHdoZW4gaW5zdGFudGlhdGluZyBhIGNvbXBvbmVudCBpbiB0aGUgdGVtcGxhdGUuIFdoZW4gbm90IHByb3ZpZGVkLFxuICogdGhlIG5hbWUgb2YgdGhlIGRlY29yYXRlZCBwcm9wZXJ0eSBpcyB1c2VkLlxuICpcbiAqICMjIyBFeGFtcGxlXG4gKlxuICogVGhlIGZvbGxvd2luZyBleGFtcGxlIGNyZWF0ZXMgYSBjb21wb25lbnQgd2l0aCB0d28gaW5wdXQgcHJvcGVydGllcy5cbiAqXG4gKiBgYGB0eXBlc2NyaXB0XG4gKiBAQ29tcG9uZW50KHtcbiAqICAgc2VsZWN0b3I6ICdiYW5rLWFjY291bnQnLFxuICogICB0ZW1wbGF0ZTogYFxuICogICAgIEJhbmsgTmFtZToge3tiYW5rTmFtZX19XG4gKiAgICAgQWNjb3VudCBJZDoge3tpZH19XG4gKiAgIGBcbiAqIH0pXG4gKiBjbGFzcyBCYW5rQWNjb3VudCB7XG4gKiAgIEBJbnB1dCgpIGJhbmtOYW1lOiBzdHJpbmc7XG4gKiAgIEBJbnB1dCgnYWNjb3VudC1pZCcpIGlkOiBzdHJpbmc7XG4gKlxuICogICAvLyB0aGlzIHByb3BlcnR5IGlzIG5vdCBib3VuZCwgYW5kIHdvbid0IGJlIGF1dG9tYXRpY2FsbHkgdXBkYXRlZCBieSBBbmd1bGFyXG4gKiAgIG5vcm1hbGl6ZWRCYW5rTmFtZTogc3RyaW5nO1xuICogfVxuICpcbiAqIEBDb21wb25lbnQoe1xuICogICBzZWxlY3RvcjogJ2FwcCcsXG4gKiAgIHRlbXBsYXRlOiBgXG4gKiAgICAgPGJhbmstYWNjb3VudCBiYW5rLW5hbWU9XCJSQkNcIiBhY2NvdW50LWlkPVwiNDc0N1wiPjwvYmFuay1hY2NvdW50PlxuICogICBgLFxuICogICBkaXJlY3RpdmVzOiBbQmFua0FjY291bnRdXG4gKiB9KVxuICogY2xhc3MgQXBwIHt9XG4gKlxuICogYm9vdHN0cmFwKEFwcCk7XG4gKiBgYGBcbiAqL1xuQENPTlNUKClcbmV4cG9ydCBjbGFzcyBJbnB1dE1ldGFkYXRhIHtcbiAgY29uc3RydWN0b3IoXG4gICAgICAvKipcbiAgICAgICAqIE5hbWUgdXNlZCB3aGVuIGluc3RhbnRpYXRpbmcgYSBjb21wb25lbnQgaW4gdGhlIHRlbWxhdGUuXG4gICAgICAgKi9cbiAgICAgIHB1YmxpYyBiaW5kaW5nUHJvcGVydHlOYW1lPzogc3RyaW5nKSB7fVxufVxuXG4vKipcbiAqIERlY2xhcmVzIGFuIGV2ZW50LWJvdW5kIG91dHB1dCBwcm9wZXJ0eS5cbiAqXG4gKiBXaGVuIGFuIG91dHB1dCBwcm9wZXJ0eSBlbWl0cyBhbiBldmVudCwgYW4gZXZlbnQgaGFuZGxlciBhdHRhY2hlZCB0byB0aGF0IGV2ZW50XG4gKiB0aGUgdGVtcGxhdGUgaXMgaW52b2tlZC5cbiAqXG4gKiBgT3V0cHV0TWV0YWRhdGFgIHRha2VzIGFuIG9wdGlvbmFsIHBhcmFtZXRlciB0aGF0IHNwZWNpZmllcyB0aGUgbmFtZVxuICogdXNlZCB3aGVuIGluc3RhbnRpYXRpbmcgYSBjb21wb25lbnQgaW4gdGhlIHRlbXBsYXRlLiBXaGVuIG5vdCBwcm92aWRlZCxcbiAqIHRoZSBuYW1lIG9mIHRoZSBkZWNvcmF0ZWQgcHJvcGVydHkgaXMgdXNlZC5cbiAqXG4gKiAjIyMgRXhhbXBsZVxuICpcbiAqIGBgYHR5cGVzY3JpcHRcbiAqIEBEaXJlY3RpdmUoe1xuICogICBzZWxlY3RvcjogJ2ludGVydmFsLWRpcicsXG4gKiB9KVxuICogY2xhc3MgSW50ZXJ2YWxEaXIge1xuICogICBAT3V0cHV0KCkgZXZlcnlTZWNvbmQgPSBuZXcgRXZlbnRFbWl0dGVyKCk7XG4gKiAgIEBPdXRwdXQoJ2V2ZXJ5Rml2ZVNlY29uZHMnKSBmaXZlNVNlY3MgPSBuZXcgRXZlbnRFbWl0dGVyKCk7XG4gKlxuICogICBjb25zdHJ1Y3RvcigpIHtcbiAqICAgICBzZXRJbnRlcnZhbCgoKSA9PiB0aGlzLmV2ZXJ5U2Vjb25kLmVtaXQoXCJldmVudFwiKSwgMTAwMCk7XG4gKiAgICAgc2V0SW50ZXJ2YWwoKCkgPT4gdGhpcy5maXZlNVNlY3MuZW1pdChcImV2ZW50XCIpLCA1MDAwKTtcbiAqICAgfVxuICogfVxuICpcbiAqIEBDb21wb25lbnQoe1xuICogICBzZWxlY3RvcjogJ2FwcCcsXG4gKiAgIHRlbXBsYXRlOiBgXG4gKiAgICAgPGludGVydmFsLWRpciAoZXZlcnktc2Vjb25kKT1cImV2ZXJ5U2Vjb25kKClcIiAoZXZlcnktZml2ZS1zZWNvbmRzKT1cImV2ZXJ5Rml2ZVNlY29uZHMoKVwiPlxuICogICAgIDwvaW50ZXJ2YWwtZGlyPlxuICogICBgLFxuICogICBkaXJlY3RpdmVzOiBbSW50ZXJ2YWxEaXJdXG4gKiB9KVxuICogY2xhc3MgQXBwIHtcbiAqICAgZXZlcnlTZWNvbmQoKSB7IGNvbnNvbGUubG9nKCdzZWNvbmQnKTsgfVxuICogICBldmVyeUZpdmVTZWNvbmRzKCkgeyBjb25zb2xlLmxvZygnZml2ZSBzZWNvbmRzJyk7IH1cbiAqIH1cbiAqIGJvb3RzdHJhcChBcHApO1xuICogYGBgXG4gKi9cbkBDT05TVCgpXG5leHBvcnQgY2xhc3MgT3V0cHV0TWV0YWRhdGEge1xuICBjb25zdHJ1Y3RvcihwdWJsaWMgYmluZGluZ1Byb3BlcnR5TmFtZT86IHN0cmluZykge31cbn1cblxuLyoqXG4gKiBEZWNsYXJlcyBhIGhvc3QgcHJvcGVydHkgYmluZGluZy5cbiAqXG4gKiBBbmd1bGFyIGF1dG9tYXRpY2FsbHkgY2hlY2tzIGhvc3QgcHJvcGVydHkgYmluZGluZ3MgZHVyaW5nIGNoYW5nZSBkZXRlY3Rpb24uXG4gKiBJZiBhIGJpbmRpbmcgY2hhbmdlcywgaXQgd2lsbCB1cGRhdGUgdGhlIGhvc3QgZWxlbWVudCBvZiB0aGUgZGlyZWN0aXZlLlxuICpcbiAqIGBIb3N0QmluZGluZ01ldGFkYXRhYCB0YWtlcyBhbiBvcHRpb25hbCBwYXJhbWV0ZXIgdGhhdCBzcGVjaWZpZXMgdGhlIHByb3BlcnR5XG4gKiBuYW1lIG9mIHRoZSBob3N0IGVsZW1lbnQgdGhhdCB3aWxsIGJlIHVwZGF0ZWQuIFdoZW4gbm90IHByb3ZpZGVkLFxuICogdGhlIGNsYXNzIHByb3BlcnR5IG5hbWUgaXMgdXNlZC5cbiAqXG4gKiAjIyMgRXhhbXBsZVxuICpcbiAqIFRoZSBmb2xsb3dpbmcgZXhhbXBsZSBjcmVhdGVzIGEgZGlyZWN0aXZlIHRoYXQgc2V0cyB0aGUgYHZhbGlkYCBhbmQgYGludmFsaWRgIGNsYXNzZXNcbiAqIG9uIHRoZSBET00gZWxlbWVudCB0aGF0IGhhcyBuZ01vZGVsIGRpcmVjdGl2ZSBvbiBpdC5cbiAqXG4gKiBgYGB0eXBlc2NyaXB0XG4gKiBARGlyZWN0aXZlKHtzZWxlY3RvcjogJ1tuZ01vZGVsXSd9KVxuICogY2xhc3MgTmdNb2RlbFN0YXR1cyB7XG4gKiAgIGNvbnN0cnVjdG9yKHB1YmxpYyBjb250cm9sOk5nTW9kZWwpIHt9XG4gKiAgIEBIb3N0QmluZGluZygnW2NsYXNzLnZhbGlkXScpIGdldCB2YWxpZCB7IHJldHVybiB0aGlzLmNvbnRyb2wudmFsaWQ7IH1cbiAqICAgQEhvc3RCaW5kaW5nKCdbY2xhc3MuaW52YWxpZF0nKSBnZXQgaW52YWxpZCB7IHJldHVybiB0aGlzLmNvbnRyb2wuaW52YWxpZDsgfVxuICogfVxuICpcbiAqIEBDb21wb25lbnQoe1xuICogICBzZWxlY3RvcjogJ2FwcCcsXG4gKiAgIHRlbXBsYXRlOiBgPGlucHV0IFsobmdNb2RlbCldPVwicHJvcFwiPmAsXG4gKiAgIGRpcmVjdGl2ZXM6IFtGT1JNX0RJUkVDVElWRVMsIE5nTW9kZWxTdGF0dXNdXG4gKiB9KVxuICogY2xhc3MgQXBwIHtcbiAqICAgcHJvcDtcbiAqIH1cbiAqXG4gKiBib290c3RyYXAoQXBwKTtcbiAqIGBgYFxuICovXG5AQ09OU1QoKVxuZXhwb3J0IGNsYXNzIEhvc3RCaW5kaW5nTWV0YWRhdGEge1xuICBjb25zdHJ1Y3RvcihwdWJsaWMgaG9zdFByb3BlcnR5TmFtZT86IHN0cmluZykge31cbn1cblxuLyoqXG4gKiBEZWNsYXJlcyBhIGhvc3QgbGlzdGVuZXIuXG4gKlxuICogQW5ndWxhciB3aWxsIGludm9rZSB0aGUgZGVjb3JhdGVkIG1ldGhvZCB3aGVuIHRoZSBob3N0IGVsZW1lbnQgZW1pdHMgdGhlIHNwZWNpZmllZCBldmVudC5cbiAqXG4gKiBJZiB0aGUgZGVjb3JhdGVkIG1ldGhvZCByZXR1cm5zIGBmYWxzZWAsIHRoZW4gYHByZXZlbnREZWZhdWx0YCBpcyBhcHBsaWVkIG9uIHRoZSBET01cbiAqIGV2ZW50LlxuICpcbiAqICMjIyBFeGFtcGxlXG4gKlxuICogVGhlIGZvbGxvd2luZyBleGFtcGxlIGRlY2xhcmVzIGEgZGlyZWN0aXZlIHRoYXQgYXR0YWNoZXMgYSBjbGljayBsaXN0ZW5lciB0byB0aGUgYnV0dG9uIGFuZFxuICogY291bnRzIGNsaWNrcy5cbiAqXG4gKiBgYGB0eXBlc2NyaXB0XG4gKiBARGlyZWN0aXZlKHtzZWxlY3RvcjogJ2J1dHRvbltjb3VudGluZ10nfSlcbiAqIGNsYXNzIENvdW50Q2xpY2tzIHtcbiAqICAgbnVtYmVyT2ZDbGlja3MgPSAwO1xuICpcbiAqICAgQEhvc3RMaXN0ZW5lcignY2xpY2snLCBbJyRldmVudC50YXJnZXQnXSlcbiAqICAgb25DbGljayhidG4pIHtcbiAqICAgICBjb25zb2xlLmxvZyhcImJ1dHRvblwiLCBidG4sIFwibnVtYmVyIG9mIGNsaWNrczpcIiwgdGhpcy5udW1iZXJPZkNsaWNrcysrKTtcbiAqICAgfVxuICogfVxuICpcbiAqIEBDb21wb25lbnQoe1xuICogICBzZWxlY3RvcjogJ2FwcCcsXG4gKiAgIHRlbXBsYXRlOiBgPGJ1dHRvbiBjb3VudGluZz5JbmNyZW1lbnQ8L2J1dHRvbj5gLFxuICogICBkaXJlY3RpdmVzOiBbQ291bnRDbGlja3NdXG4gKiB9KVxuICogY2xhc3MgQXBwIHt9XG4gKlxuICogYm9vdHN0cmFwKEFwcCk7XG4gKiBgYGBcbiAqL1xuQENPTlNUKClcbmV4cG9ydCBjbGFzcyBIb3N0TGlzdGVuZXJNZXRhZGF0YSB7XG4gIGNvbnN0cnVjdG9yKHB1YmxpYyBldmVudE5hbWU6IHN0cmluZywgcHVibGljIGFyZ3M/OiBzdHJpbmdbXSkge31cbn1cbiJdfQ==