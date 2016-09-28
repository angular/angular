/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {AnimationEntryMetadata} from '../animation/metadata';
import {ChangeDetectionStrategy} from '../change_detection/constants';
import {Provider} from '../di';
import {Type} from '../type';
import {TypeDecorator, makeDecorator, makePropDecorator} from '../util/decorators';

import {ViewEncapsulation} from './view';


/**
 * Type of the Directive decorator / constructor function.
 *
 * @stable
 */
export interface DirectiveDecorator {
  /**
   * @whatItDoes Marks a class as an Angular directive and collects directive configuration
   * metadata.
   *
   * @howToUse
   *
   * ```
   * import {Directive} from '@angular/core';
   *
   * @Directive({
   *   selector: 'my-directive',
   * })
   * export class MyDirective {
   * }
   * ```
   *
   * @description
   *
   * Directive decorator allows you to mark a class as an Angular directive and provide additional
   * metadata that determines how the directive should be processed, instantiated and used at
   * runtime.
   *
   * Directives allow you to attach behavior to elements in the DOM..
   *
   * A directive must belong to an NgModule in order for it to be usable
   * by another directive, component, or application. To specify that a directive is a member of an
   * NgModule,
   * you should list it in the `declarations` field of that NgModule.
   *
   * In addition to the metadata configuration specified via the Directive decorator,
   * directives can control their runtime behavior by implementing various Life-Cycle hooks.
   *
   * **Metadata Properties:**
   *
   * * **exportAs** - name under which the component instance is exported in a template
   * * **host** - map of class property to host element bindings for events, properties and
   * attributes
   * * **inputs** - list of class property names to data-bind as component inputs
   * * **outputs** - list of class property names that expose output events that others can
   * subscribe to
   * * **providers** - list of providers available to this component and its children
   * * **queries** -  configure queries that can be injected into the component
   * * **selector** - css selector that identifies this component in a template
   *
   * @stable
   * @Annotation
   */
  (obj: Directive): TypeDecorator;

  /**
   * See the {@link Directive} decorator.
   */
  new (obj: Directive): Directive;
}

export interface Directive {
  /**
   * The CSS selector that triggers the instantiation of a directive.
   *
   * Angular only allows directives to trigger on CSS selectors that do not cross element
   * boundaries.
   *
   * `selector` may be declared as one of the following:
   *
   * - `element-name`: select by element name.
   * - `.class`: select by class name.
   * - `[attribute]`: select by attribute name.
   * - `[attribute=value]`: select by attribute name and value.
   * - `:not(sub_selector)`: select only if the element does not match the `sub_selector`.
   * - `selector1, selector2`: select if either `selector1` or `selector2` matches.
   *
   *
   * ### Example
   *
   * Suppose we have a directive with an `input[type=text]` selector.
   *
   * And the following HTML:
   *
   * ```html
   * <form>
   *   <input type="text">
   *   <input type="radio">
   * <form>
   * ```
   *
   * The directive would only be instantiated on the `<input type="text">` element.
   *
   */
  selector?: string;

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
   *   `
   * })
   * class App {}
   * ```
   *
   */
  inputs?: string[];

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
   *   `
   * })
   * class App {
   *   everySecond() { console.log('second'); }
   *   everyFiveSeconds() { console.log('five seconds'); }
   * }
   * ```
   *
   */
  outputs?: string[];

  /**
   * Specify the events, actions, properties and attributes related to the host element.
   *
   * ## Host Listeners
   *
   * Specifies which DOM events a directive listens to via a set of `(event)` to `method`
   * key-value pairs:
   *
   * - `event`: the DOM event that the directive listens to.
   * - `statement`: the statement to execute when the event occurs.
   * If the evaluation of the statement returns `false`, then `preventDefault`is applied on the DOM
   * event.
   *
   * To listen to global events, a target must be added to the event name.
   * The target can be `window`, `document` or `body`.
   *
   * When writing a directive event binding, you can also refer to the $event local variable.
   *
   * ### Example ([live demo](http://plnkr.co/edit/DlA5KU?p=preview))
   *
   * The following example declares a directive that attaches a click listener to the button and
   * counts clicks.
   *
   * ```typescript
   * @Directive({
   *   selector: 'button[counting]',
   *   host: {
   *     '(click)': 'onClick($event.target)'
   *   }
   * })
   * class CountClicks {
   *   numberOfClicks = 0;
   *
   *   onClick(btn) {
   *     console.log("button", btn, "number of clicks:", this.numberOfClicks++);
   *   }
   * }
   *
   * @Component({
   *   selector: 'app',
   *   template: `<button counting>Increment</button>`
   * })
   * class App {}
   * ```
   *
   * ## Host Property Bindings
   *
   * Specifies which DOM properties a directive updates.
   *
   * Angular automatically checks host property bindings during change detection.
   * If a binding changes, it will update the host element of the directive.
   *
   * ### Example ([live demo](http://plnkr.co/edit/gNg0ED?p=preview))
   *
   * The following example creates a directive that sets the `valid` and `invalid` classes
   * on the DOM element that has ngModel directive on it.
   *
   * ```typescript
   * @Directive({
   *   selector: '[ngModel]',
   *   host: {
   *     '[class.valid]': 'valid',
   *     '[class.invalid]': 'invalid'
   *   }
   * })
   * class NgModelStatus {
   *   constructor(public control:NgModel) {}
   *   get valid { return this.control.valid; }
   *   get invalid { return this.control.invalid; }
   * }
   *
   * @Component({
   *   selector: 'app',
   *   template: `<input [(ngModel)]="prop">`
   * })
   * class App {
   *   prop;
   * }
   * ```
   *
   * ## Attributes
   *
   * Specifies static attributes that should be propagated to a host element.
   *
   * ### Example
   *
   * In this example using `my-button` directive (ex.: `<div my-button></div>`) on a host element
   * (here: `<div>` ) will ensure that this element will get the "button" role.
   *
   * ```typescript
   * @Directive({
   *   selector: '[my-button]',
   *   host: {
   *     'role': 'button'
   *   }
   * })
   * class MyButton {
   * }
   * ```
   */
  host?: {[key: string]: string};

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
   *   providers: [
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
  providers?: Provider[];

  /**
   * Defines the name that can be used in the template to assign this directive to a variable.
   *
   * ## Simple Example
   *
   * ```
   * @Directive({
   *   selector: 'child-dir',
   *   exportAs: 'child'
   * })
   * class ChildDir {
   * }
   *
   * @Component({
   *   selector: 'main',
   *   template: `<child-dir #c="child"></child-dir>`
   * })
   * class MainComponent {
   * }
   *
   * ```
   */
  exportAs?: string;

  /**
   * Configures the queries that will be injected into the directive.
   *
   * Content queries are set before the `ngAfterContentInit` callback is called.
   * View queries are set before the `ngAfterViewInit` callback is called.
   *
   * ### Example
   *
   * ```
   * @Component({
   *   selector: 'someDir',
   *   queries: {
   *     contentChildren: new ContentChildren(ChildDirective),
   *     viewChildren: new ViewChildren(ChildDirective)
   *   },
   *   template: '<child-directive></child-directive>'
   * })
   * class SomeDir {
   *   contentChildren: QueryList<ChildDirective>,
   *   viewChildren: QueryList<ChildDirective>
   *
   *   ngAfterContentInit() {
   *     // contentChildren is set
   *   }
   *
   *   ngAfterViewInit() {
   *     // viewChildren is set
   *   }
   * }
   * ```
   */
  queries?: {[key: string]: any};
}

/**
 * Directive decorator and metadata.
 *
 * @stable
 * @Annotation
 */
export const Directive: DirectiveDecorator = <DirectiveDecorator>makeDecorator('Directive', {
  selector: undefined,
  inputs: undefined,
  outputs: undefined,
  host: undefined,
  providers: undefined,
  exportAs: undefined,
  queries: undefined
});

/**
 * Type of the Component decorator / constructor function.
 *
 * @stable
 */
export interface ComponentDecorator {
  /**
   * @whatItDoes Marks a class as an Angular component and collects component configuration
   * metadata.
   *
   * @howToUse
   *
   * {@example core/ts/metadata/metadata.ts region='component'}
   *
   * @description
   * Component decorator allows you to mark a class as an Angular component and provide additional
   * metadata that determines how the component should be processed, instantiated and used at
   * runtime.
   *
   * Components are the most basic building block of an UI in an Angular application.
   * An Angular application is a tree of Angular components.
   * Angular components are a subset of directives. Unlike directives, components always have
   * a template and only one component can be instantiated per an element in a template.
   *
   * A component must belong to an NgModule in order for it to be usable
   * by another component or application. To specify that a component is a member of an NgModule,
   * you should list it in the `declarations` field of that NgModule.
   *
   * In addition to the metadata configuration specified via the Component decorator,
   * components can control their runtime behavior by implementing various Life-Cycle hooks.
   *
   * **Metadata Properties:**
   *
   * * **animations** - list of animations of this component
   * * **changeDetection** - change detection strategy used by this component
   * * **encapsulation** - style encapsulation strategy used by this component
   * * **entryComponents** - list of components that are dynamically inserted into the view of this
   *   component
   * * **exportAs** - name under which the component instance is exported in a template
   * * **host** - map of class property to host element bindings for events, properties and
   *   attributes
   * * **inputs** - list of class property names to data-bind as component inputs
   * * **interpolation** - custom interpolation markers used in this component's template
   * * **moduleId** - ES/CommonJS module id of the file in which this component is defined
   * * **outputs** - list of class property names that expose output events that others can
   *   subscribe to
   * * **providers** - list of providers available to this component and its children
   * * **queries** -  configure queries that can be injected into the component
   * * **selector** - css selector that identifies this component in a template
   * * **styleUrls** - list of urls to stylesheets to be applied to this component's view
   * * **styles** - inline-defined styles to be applied to this component's view
   * * **template** - inline-defined template for the view
   * * **templateUrl** - url to an external file containing a template for the view
   * * **viewProviders** - list of providers available to this component and its view children
   *
   * ### Example
   *
   * {@example core/ts/metadata/metadata.ts region='component'}
   *
   * @stable
   * @Annotation
   */
  (obj: Component): TypeDecorator;
  /**
   * See the {@link Component} decorator.
   */
  new (obj: Component): Component;
}

/**
 * Type of the Component metadata.
 *
 * @stable
 */
export interface Component extends Directive {
  /**
   * Defines the used change detection strategy.
   *
   * When a component is instantiated, Angular creates a change detector, which is responsible for
   * propagating the component's bindings.
   *
   * The `changeDetection` property defines, whether the change detection will be checked every time
   * or only when the component tells it to do so.
   */
  changeDetection?: ChangeDetectionStrategy;

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
   *   template: `<needs-greeter></needs-greeter>`
   * })
   * class HelloWorld {
   * }
   *
   * ```
   */
  viewProviders?: Provider[];

  /**
   * The module id of the module that contains the component.
   * Needed to be able to resolve relative urls for templates and styles.
   * In CommonJS, this can always be set to `module.id`, similarly SystemJS exposes `__moduleName`
   * variable within each module.
   *
   *
   * ## Simple Example
   *
   * ```
   * @Directive({
   *   selector: 'someDir',
   *   moduleId: module.id
   * })
   * class SomeDir {
   * }
   *
   * ```
   */
  moduleId?: string;

  /**
   * Specifies a template URL for an Angular component.
   *
   *Only one of `templateUrl` or `template` can be defined per View.
   */
  templateUrl?: string;

  /**
   * Specifies an inline template for an Angular component.
   *
   * Only one of `templateUrl` or `template` can be defined per Component.
   */
  template?: string;

  /**
   * Specifies stylesheet URLs for an Angular component.
   */
  styleUrls?: string[];

  /**
   * Specifies inline stylesheets for an Angular component.
   */
  styles?: string[];

  /**
   * Animations are defined on components via an animation-like DSL. This DSL approach to describing
   * animations allows for a flexibility that both benefits developers and the framework.
   *
   * Animations work by listening on state changes that occur on an element within
   * the template. When a state change occurs, Angular can then take advantage and animate the
   * arc in between. This works similar to how CSS transitions work, however, by having a
   * programmatic DSL, animations are not limited to environments that are DOM-specific.
   * (Angular can also perform optimizations behind the scenes to make animations more performant.)
   *
   * For animations to be available for use, animation state changes are placed within
   * {@link trigger animation triggers} which are housed inside of the `animations` annotation
   * metadata. Within a trigger both {@link state state} and {@link transition transition} entries
   * can be placed.
   *
   * ```typescript
   * @Component({
   *   selector: 'animation-cmp',
   *   templateUrl: 'animation-cmp.html',
   *   animations: [
   *     // this here is our animation trigger that
   *     // will contain our state change animations.
   *     trigger('myTriggerName', [
   *       // the styles defined for the `on` and `off`
   *       // states declared below are persisted on the
   *       // element once the animation completes.
   *       state('on', style({ opacity: 1 }),
   *       state('off', style({ opacity: 0 }),
   *
   *       // this here is our animation that kicks off when
   *       // this state change jump is true
   *       transition('on => off', [
   *         animate("1s")
   *       ])
   *     ])
   *   ]
   * })
   * ```
   *
   * As depicted in the code above, a group of related animation states are all contained within
   * an animation `trigger` (the code example above called the trigger `myTriggerName`).
   * When a trigger is created then it can be bound onto an element within the component's
   * template via a property prefixed by an `@` symbol followed by trigger name and an expression
   * that
   * is used to determine the state value for that trigger.
   *
   * ```html
   * <!-- animation-cmp.html -->
   * <div @myTriggerName="expression">...</div>
   * ```
   *
   * For state changes to be executed, the `expression` value must change value from its existing
   * value
   * to something that we have set an animation to animate on (in the example above we are listening
   * to a change of state between `on` and `off`). The `expression` value attached to the trigger
   * must be something that can be evaluated with the template/component context.
   *
   * ### DSL Animation Functions
   *
   * Please visit each of the animation DSL functions listed below to gain a better understanding
   * of how and why they are used for crafting animations in Angular2:
   *
   * - {@link trigger trigger()}
   * - {@link state state()}
   * - {@link transition transition()}
   * - {@link group group()}
   * - {@link sequence sequence()}
   * - {@link style style()}
   * - {@link animate animate()}
   * - {@link keyframes keyframes()}
   */
  animations?: AnimationEntryMetadata[];

  /**
   * Specifies how the template and the styles should be encapsulated:
   * - {@link ViewEncapsulation#Native `ViewEncapsulation.Native`} to use shadow roots - only works
   *   if natively available on the platform,
   * - {@link ViewEncapsulation#Emulated `ViewEncapsulation.Emulated`} to use shimmed CSS that
   *   emulates the native behavior,
   * - {@link ViewEncapsulation#None `ViewEncapsulation.None`} to use global CSS without any
   *   encapsulation.
   *
   * When no `encapsulation` is defined for the component, the default value from the
   * {@link CompilerConfig} is used. The default is `ViewEncapsulation.Emulated`}. Provide a new
   * `CompilerConfig` to override this value.
   *
   * If the encapsulation is set to `ViewEncapsulation.Emulated` and the component has no `styles`
   * nor `styleUrls` the encapsulation will automatically be switched to `ViewEncapsulation.None`.
   */
  encapsulation?: ViewEncapsulation;

  /**
   * Overrides the default encapsulation start and end delimiters (respectively `{{` and `}}`)
   */
  interpolation?: [string, string];

  /**
   * Defines the components that should be compiled as well when
   * this component is defined. For each components listed here,
   * Angular will create a {@link ComponentFactory} and store it in the
   * {@link ComponentFactoryResolver}.
   */
  entryComponents?: Array<Type<any>|any[]>;
}

/**
 * Component decorator and metadata.
 *
 * @stable
 * @Annotation
 */
export const Component: ComponentDecorator = <ComponentDecorator>makeDecorator(
    'Component', {
      selector: undefined,
      inputs: undefined,
      outputs: undefined,
      host: undefined,
      exportAs: undefined,
      moduleId: undefined,
      providers: undefined,
      viewProviders: undefined,
      changeDetection: ChangeDetectionStrategy.Default,
      queries: undefined,
      templateUrl: undefined,
      template: undefined,
      styleUrls: undefined,
      styles: undefined,
      animations: undefined,
      encapsulation: undefined,
      interpolation: undefined,
      entryComponents: undefined
    },
    Directive);

/**
 * Type of the Pipe decorator / constructor function.
 *
 * @stable
 */
export interface PipeDecorator {
  /**
   * Declare reusable pipe function.
   *
   * A "pure" pipe is only re-evaluated when either the input or any of the arguments change.
   *
   * When not specified, pipes default to being pure.
   */
  (obj: Pipe): TypeDecorator;

  /**
   * See the {@link Pipe} decorator.
   */
  new (obj: Pipe): Pipe;
}

/**
 * Type of the Pipe metadata.
 *
 * @stable
 */
export interface Pipe {
  name: string;
  pure?: boolean;
}

/**
 * Pipe decorator and metadata.
 *
 * @stable
 * @Annotation
 */
export const Pipe: PipeDecorator = <PipeDecorator>makeDecorator('Pipe', {
  name: undefined,
  pure: true,
});


/**
 * Type of the Input decorator / constructor function.
 *
 * @stable
 */
export interface InputDecorator {
  /**
   * Declares a data-bound input property.
   *
   * Angular automatically updates data-bound properties during change detection.
   *
   * `Input` takes an optional parameter that specifies the name
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
   *   `
   * })
   *
   * class App {}
   * ```
   * @stable
   */
  (bindingPropertyName?: string): any;
  new (bindingPropertyName?: string): any;
}

/**
 * Type of the Input metadata.
 *
 * @stable
 */
export interface Input {
  /**
   * Name used when instantiating a component in the template.
   */
  bindingPropertyName?: string;
}

/**
 * Input decorator and metadata.
 *
 * @stable
 * @Annotation
 */
export const Input: InputDecorator =
    makePropDecorator('Input', [['bindingPropertyName', undefined]]);

/**
 * Type of the Output decorator / constructor function.
 *
 * @stable
 */
export interface OutputDecorator {
  /**
   * Declares an event-bound output property.
   *
   * When an output property emits an event, an event handler attached to that event
   * the template is invoked.
   *
   * `Output` takes an optional parameter that specifies the name
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
   *   `
   * })
   * class App {
   *   everySecond() { console.log('second'); }
   *   everyFiveSeconds() { console.log('five seconds'); }
   * }
   * ```
   * @stable
   */
  (bindingPropertyName?: string): any;
  new (bindingPropertyName?: string): any;
}

/**
 * Type of the Output metadata.
 *
 * @stable
 */
export interface Output { bindingPropertyName?: string; }

/**
 * Output decorator and metadata.
 *
 * @stable
 * @Annotation
 */
export const Output: OutputDecorator =
    makePropDecorator('Output', [['bindingPropertyName', undefined]]);


/**
 * Type of the HostBinding decorator / constructor function.
 *
 * @stable
 */
export interface HostBindingDecorator {
  /**
   * Declares a host property binding.
   *
   * Angular automatically checks host property bindings during change detection.
   * If a binding changes, it will update the host element of the directive.
   *
   * `HostBinding` takes an optional parameter that specifies the property
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
   *   @HostBinding('class.valid') get valid() { return this.control.valid; }
   *   @HostBinding('class.invalid') get invalid() { return this.control.invalid; }
   * }
   *
   * @Component({
   *   selector: 'app',
   *   template: `<input [(ngModel)]="prop">`,
   * })
   * class App {
   *   prop;
   * }
   * ```
   * @stable
   */
  (hostPropertyName?: string): any;
  new (hostPropertyName?: string): any;
}

/**
 * Type of the HostBinding metadata.
 *
 * @stable
 */
export interface HostBinding { hostPropertyName?: string; }

/**
 * HostBinding decorator and metadata.
 *
 * @stable
 * @Annotation
 */
export const HostBinding: HostBindingDecorator =
    makePropDecorator('HostBinding', [['hostPropertyName', undefined]]);


/**
 * Type of the HostListener decorator / constructor function.
 *
 * @stable
 */
export interface HostListenerDecorator {
  /**
   * Declares a host listener.
   *
   * Angular will invoke the decorated method when the host element emits the specified event.
   *
   * If the decorated method returns `false`, then `preventDefault` is applied on the DOM event.
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
   *     console.log('button', btn, 'number of clicks:', this.numberOfClicks++);
   *   }
   * }
   *
   * @Component({
   *   selector: 'app',
   *   template: '<button counting>Increment</button>',
   * })
   * class App {}
   * ```
   * @stable
   * @Annotation
   */
  (eventName: string, args?: string[]): any;
  new (eventName: string, args?: string[]): any;
}

/**
 * Type of the HostListener metadata.
 *
 * @stable
 */
export interface HostListener {
  eventName?: string;
  args?: string[];
}

/**
 * HostBinding decorator and metadata.
 *
 * @stable
 * @Annotation
 */
export const HostListener: HostListenerDecorator =
    makePropDecorator('HostListener', [['eventName', undefined], ['args', []]]);
