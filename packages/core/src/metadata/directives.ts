/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ChangeDetectionStrategy} from '../change_detection/constants';
import {Provider} from '../di/interface/provider';
import {Type} from '../interface/type';
import {compileComponent as render3CompileComponent, compileDirective as render3CompileDirective} from '../render3/jit/directive';
import {compilePipe as render3CompilePipe} from '../render3/jit/pipe';
import {makeDecorator, makePropDecorator, TypeDecorator} from '../util/decorators';
import {noop} from '../util/noop';

import {ViewEncapsulation} from './view';



/**
 * Type of the Directive decorator / constructor function.
 * @publicApi
 */
export interface DirectiveDecorator {
  /**
   * Decorator that marks a class as an Angular directive.
   * You can define your own directives to attach custom behavior to elements in the DOM.
   *
   * The options provide configuration metadata that determines
   * how the directive should be processed, instantiated and used at
   * runtime.
   *
   * Directive classes, like component classes, can implement
   * [life-cycle hooks](guide/lifecycle-hooks) to influence their configuration and behavior.
   *
   *
   * @usageNotes
   * To define a directive, mark the class with the decorator and provide metadata.
   *
   * ```ts
   * import {Directive} from '@angular/core';
   *
   * @Directive({
   *   selector: 'my-directive',
   * })
   * export class MyDirective {
   * ...
   * }
   * ```
   *
   * ### Declaring directives
   *
   * Directives are [declarables](guide/glossary#declarable).
   * They must be declared by an NgModule
   * in order to be usable in an app.
   *
   * A directive must belong to exactly one NgModule. Do not re-declare
   * a directive imported from another module.
   * List the directive class in the `declarations` field of an NgModule.
   *
   * ```ts
   * declarations: [
   *  AppComponent,
   *  MyDirective
   * ],
   * ```
   *
   * @Annotation
   */
  (obj?: Directive): TypeDecorator;

  /**
   * See the `Directive` decorator.
   */
  new(obj?: Directive): Directive;
}

/**
 * Directive decorator and metadata.
 *
 * @Annotation
 * @publicApi
 */
export interface Directive {
  /**
   * The CSS selector that identifies this directive in a template
   * and triggers instantiation of the directive.
   *
   * Declare as one of the following:
   *
   * - `element-name`: Select by element name.
   * - `.class`: Select by class name.
   * - `[attribute]`: Select by attribute name.
   * - `[attribute=value]`: Select by attribute name and value.
   * - `:not(sub_selector)`: Select only if the element does not match the `sub_selector`.
   * - `selector1, selector2`: Select if either `selector1` or `selector2` matches.
   *
   * Angular only allows directives to apply on CSS selectors that do not cross
   * element boundaries.
   *
   * For the following template HTML, a directive with an `input[type=text]` selector,
   * would be instantiated only on the `<input type="text">` element.
   *
   * ```html
   * <form>
   *   <input type="text">
   *   <input type="radio">
   * <form>
   * ```
   *
   */
  selector?: string;

  /**
   * Enumerates the set of data-bound input properties for a directive
   *
   * Angular automatically updates input properties during change detection.
   * The `inputs` property defines a set of `directiveProperty` to `bindingProperty`
   * configuration:
   *
   * - `directiveProperty` specifies the component property where the value is written.
   * - `bindingProperty` specifies the DOM property where the value is read from.
   *
   * When `bindingProperty` is not provided, it is assumed to be equal to `directiveProperty`.
   *
   * @usageNotes
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
   * }
   * ```
   *
   */
  inputs?: string[];

  /**
   * Enumerates the set of event-bound output properties.
   *
   * When an output property emits an event, an event handler attached to that event
   * in the template is invoked.
   *
   * The `outputs` property defines a set of `directiveProperty` to `bindingProperty`
   * configuration:
   *
   * - `directiveProperty` specifies the component property that emits events.
   * - `bindingProperty` specifies the DOM property the event handler is attached to.
   *
   * @usageNotes
   *
   * ```typescript
   * @Component({
   *   selector: 'child-dir',
   *   outputs: [ 'bankNameChange' ]
   *   template: `<input (input)="bankNameChange.emit($event.target.value)" />`
   * })
   * class ChildDir {
   *  bankNameChange: EventEmitter<string> = new EventEmitter<string>();
   * }
   *
   * @Component({
   *   selector: 'main',
   *   template: `
   *     {{ bankName }} <child-dir (bankNameChange)="onBankNameChange($event)"></child-dir>
   *   `
   * })
   * class MainComponent {
   *  bankName: string;
   *
   *   onBankNameChange(bankName: string) {
   *     this.bankName = bankName;
   *   }
   * }
   * ```
   *
   */
  outputs?: string[];

  /**
   * Configures the [injector](guide/glossary#injector) of this
   * directive or component with a [token](guide/glossary#di-token)
   * that maps to a [provider](guide/glossary#provider) of a dependency.
   */
  providers?: Provider[];

  /**
   * Defines the name that can be used in the template to assign this directive to a variable.
   *
   * @usageNotes
   *
   * ```ts
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
   * ```
   *
   */
  exportAs?: string;

  /**
   * Configures the queries that will be injected into the directive.
   *
   * Content queries are set before the `ngAfterContentInit` callback is called.
   * View queries are set before the `ngAfterViewInit` callback is called.
   *
   * @usageNotes
   *
   * The following example shows how queries are defined
   * and when their results are available in lifecycle hooks:
   *
   * ```ts
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
   *
   * @Annotation
   */
  queries?: {[key: string]: any};

  /**
   * Maps class properties to host element bindings for properties,
   * attributes, and events, using a set of key-value pairs.
   *
   * Angular automatically checks host property bindings during change detection.
   * If a binding changes, Angular updates the directive's host element.
   *
   * When the key is a property of the host element, the property value is
   * the propagated to the specified DOM property.
   *
   * When the key is a static attribute in the DOM, the attribute value
   * is propagated to the specified property in the host element.
   *
   * For event handling:
   * - The key is the DOM event that the directive listens to.
   * To listen to global events, add the target to the event name.
   * The target can be `window`, `document` or `body`.
   * - The value is the statement to execute when the event occurs. If the
   * statement evaluates to `false`, then `preventDefault` is applied on the DOM
   * event. A handler method can refer to the `$event` local variable.
   *
   */
  host?: {[key: string]: string};

  /**
   * When present, this directive/component is ignored by the AOT compiler.
   * It remains in distributed code, and the JIT compiler attempts to compile it
   * at run time, in the browser.
   * To ensure the correct behavior, the app must import `@angular/compiler`.
   */
  jit?: true;
}

/**
 * Type of the Directive metadata.
 *
 * @publicApi
 */
export const Directive: DirectiveDecorator = makeDecorator(
    'Directive', (dir: Directive = {}) => dir, undefined, undefined,
    (type: Type<any>, meta: Directive) => SWITCH_COMPILE_DIRECTIVE(type, meta));

/**
 * Component decorator interface
 *
 * @publicApi
 */
export interface ComponentDecorator {
  /**
   * Decorator that marks a class as an Angular component and provides configuration
   * metadata that determines how the component should be processed,
   * instantiated, and used at runtime.
   *
   * Components are the most basic UI building block of an Angular app.
   * An Angular app contains a tree of Angular components.
   *
   * Angular components are a subset of directives, always associated with a template.
   * Unlike other directives, only one component can be instantiated for a given element in a
   * template.
   *
   * A component must belong to an NgModule in order for it to be available
   * to another component or application. To make it a member of an NgModule,
   * list it in the `declarations` field of the `NgModule` metadata.
   *
   * Note that, in addition to these options for configuring a directive,
   * you can control a component's runtime behavior by implementing
   * life-cycle hooks. For more information, see the
   * [Lifecycle Hooks](guide/lifecycle-hooks) guide.
   *
   * @usageNotes
   *
   * ### Setting component inputs
   *
   * The following example creates a component with two data-bound properties,
   * specified by the `inputs` value.
   *
   * <code-example path="core/ts/metadata/directives.ts" region="component-input"></code-example>
   *
   *
   * ### Setting component outputs
   *
   * The following example shows two event emitters that emit on an interval. One
   * emits an output every second, while the other emits every five seconds.
   *
   * {@example core/ts/metadata/directives.ts region='component-output-interval'}
   *
   * ### Injecting a class with a view provider
   *
   * The following simple example injects a class into a component
   * using the view provider specified in component metadata:
   *
   * ```ts
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
   *
   * ### Preserving whitespace
   *
   * Removing whitespace can greatly reduce AOT-generated code size and speed up view creation.
   * As of Angular 6, the default for `preserveWhitespaces` is false (whitespace is removed).
   * To change the default setting for all components in your application, set
   * the `preserveWhitespaces` option of the AOT compiler.
   *
   * By default, the AOT compiler removes whitespace characters as follows:
   * * Trims all whitespaces at the beginning and the end of a template.
   * * Removes whitespace-only text nodes. For example,
   *
   * ```html
   * <button>Action 1</button>  <button>Action 2</button>
   * ```
   *
   * becomes:
   *
   * ```html
   * <button>Action 1</button><button>Action 2</button>
   * ```
   *
   * * Replaces a series of whitespace characters in text nodes with a single space.
   * For example, `<span>\n some text\n</span>` becomes `<span> some text </span>`.
   * * Does NOT alter text nodes inside HTML tags such as `<pre>` or `<textarea>`,
   * where whitespace characters are significant.
   *
   * Note that these transformations can influence DOM nodes layout, although impact
   * should be minimal.
   *
   * You can override the default behavior to preserve whitespace characters
   * in certain fragments of a template. For example, you can exclude an entire
   * DOM sub-tree by using the `ngPreserveWhitespaces` attribute:
   *
   * ```html
   * <div ngPreserveWhitespaces>
   *     whitespaces are preserved here
   *     <span>    and here </span>
   * </div>
   * ```
   *
   * You can force a single space to be preserved in a text node by using `&ngsp;`,
   * which is replaced with a space character by Angular's template
   * compiler:
   *
   * ```html
   * <a>Spaces</a>&ngsp;<a>between</a>&ngsp;<a>links.</a>
   * <!-- compiled to be equivalent to:
   *  <a>Spaces</a> <a>between</a> <a>links.</a>  -->
   * ```
   *
   * Note that sequences of `&ngsp;` are still collapsed to just one space character when
   * the `preserveWhitespaces` option is set to `false`.
   *
   * ```html
   * <a>before</a>&ngsp;&ngsp;&ngsp;<a>after</a>
   * <!-- compiled to be equivalent to:
   *  <a>before</a> <a>after</a> -->
   * ```
   *
   * To preserve sequences of whitespace characters, use the
   * `ngPreserveWhitespaces` attribute.
   *
   * @Annotation
   */
  (obj: Component): TypeDecorator;
  /**
   * See the `Component` decorator.
   */
  new(obj: Component): Component;
}

/**
 * Supplies configuration metadata for an Angular component.
 *
 * @publicApi
 */
export interface Component extends Directive {
  /**
   * The change-detection strategy to use for this component.
   *
   * When a component is instantiated, Angular creates a change detector,
   * which is responsible for propagating the component's bindings.
   * The strategy is one of:
   * - `ChangeDetectionStrategy#OnPush` sets the strategy to `CheckOnce` (on demand).
   * - `ChangeDetectionStrategy#Default` sets the strategy to `CheckAlways`.
   */
  changeDetection?: ChangeDetectionStrategy;

  /**
   * Defines the set of injectable objects that are visible to its view DOM children.
   * See [example](#injecting-a-class-with-a-view-provider).
   *
   */
  viewProviders?: Provider[];

  /**
   * The module ID of the module that contains the component.
   * The component must be able to resolve relative URLs for templates and styles.
   * SystemJS exposes the `__moduleName` variable within each module.
   * In CommonJS, this can  be set to `module.id`.
   *
   */
  moduleId?: string;

  /**
   * The relative path or absolute URL of a template file for an Angular component.
   * If provided, do not supply an inline template using `template`.
   *
   */
  templateUrl?: string;

  /**
   * An inline template for an Angular component. If provided,
   * do not supply a template file using `templateUrl`.
   *
   */
  template?: string;

  /**
   * One or more relative paths or absolute URLs for files containing CSS stylesheets to use
   * in this component.
   */
  styleUrls?: string[];

  /**
   * One or more inline CSS stylesheets to use
   * in this component.
   */
  styles?: string[];

  /**
   * One or more animation `trigger()` calls, containing
   * `state()` and `transition()` definitions.
   * See the [Animations guide](/guide/animations) and animations API documentation.
   *
   */
  animations?: any[];

  /**
   * An encapsulation policy for the template and CSS styles. One of:
   * - `ViewEncapsulation.Emulated`: Use shimmed CSS that
   * emulates the native behavior.
   * - `ViewEncapsulation.None`: Use global CSS without any
   * encapsulation.
   * - `ViewEncapsulation.ShadowDom`: Use Shadow DOM v1 to encapsulate styles.
   *
   * If not supplied, the value is taken from `CompilerOptions`. The default compiler option is
   * `ViewEncapsulation.Emulated`.
   *
   * If the policy is set to `ViewEncapsulation.Emulated` and the component has no `styles`
   * or `styleUrls` specified, the policy is automatically switched to `ViewEncapsulation.None`.
   */
  encapsulation?: ViewEncapsulation;

  /**
   * Overrides the default interpolation start and end delimiters (`{{` and `}}`).
   */
  interpolation?: [string, string];

  /**
   * A set of components that should be compiled along with
   * this component. For each component listed here,
   * Angular creates a {@link ComponentFactory} and stores it in the
   * {@link ComponentFactoryResolver}.
   * @deprecated Since 9.0.0. With Ivy, this property is no longer necessary.
   */
  entryComponents?: Array<Type<any>|any[]>;

  /**
   * True to preserve or false to remove potentially superfluous whitespace characters
   * from the compiled template. Whitespace characters are those matching the `\s`
   * character class in JavaScript regular expressions. Default is false, unless
   * overridden in compiler options.
   */
  preserveWhitespaces?: boolean;
}

/**
 * Component decorator and metadata.
 *
 * @Annotation
 * @publicApi
 */
export const Component: ComponentDecorator = makeDecorator(
    'Component', (c: Component = {}) => ({changeDetection: ChangeDetectionStrategy.Default, ...c}),
    Directive, undefined,
    (type: Type<any>, meta: Component) => SWITCH_COMPILE_COMPONENT(type, meta));

/**
 * Type of the Pipe decorator / constructor function.
 *
 * @publicApi
 */
export interface PipeDecorator {
  /**
   *
   * Decorator that marks a class as pipe and supplies configuration metadata.
   *
   * A pipe class must implement the `PipeTransform` interface.
   * For example, if the name is "myPipe", use a template binding expression
   * such as the following:
   *
   * ```
   * {{ exp | myPipe }}
   * ```
   *
   * The result of the expression is passed to the pipe's `transform()` method.
   *
   * A pipe must belong to an NgModule in order for it to be available
   * to a template. To make it a member of an NgModule,
   * list it in the `declarations` field of the `NgModule` metadata.
   *
   * @see [Style Guide: Pipe Names](guide/styleguide#02-09)
   *
   */
  (obj: Pipe): TypeDecorator;

  /**
   * See the `Pipe` decorator.
   */
  new(obj: Pipe): Pipe;
}

/**
 * Type of the Pipe metadata.
 *
 * @publicApi
 */
export interface Pipe {
  /**
   * The pipe name to use in template bindings.
   * Typically uses [lowerCamelCase](guide/glossary#case-types)
   * because the name cannot contain hyphens.
   */
  name: string;

  /**
   * When true, the pipe is pure, meaning that the
   * `transform()` method is invoked only when its input arguments
   * change. Pipes are pure by default.
   *
   * If the pipe has internal state (that is, the result
   * depends on state other than its arguments), set `pure` to false.
   * In this case, the pipe is invoked on each change-detection cycle,
   * even if the arguments have not changed.
   */
  pure?: boolean;
}

/**
 * @Annotation
 * @publicApi
 */
export const Pipe: PipeDecorator = makeDecorator(
    'Pipe', (p: Pipe) => ({pure: true, ...p}), undefined, undefined,
    (type: Type<any>, meta: Pipe) => SWITCH_COMPILE_PIPE(type, meta));


/**
 * @publicApi
 */
export interface InputDecorator {
  /**
   * Decorator that marks a class field as an input property and supplies configuration metadata.
   * The input property is bound to a DOM property in the template. During change detection,
   * Angular automatically updates the data property with the DOM property's value.
   *
   * @usageNotes
   *
   * You can supply an optional name to use in templates when the
   * component is instantiated, that maps to the
   * name of the bound property. By default, the original
   * name of the bound property is used for input binding.
   *
   * The following example creates a component with two input properties,
   * one of which is given a special binding name.
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
   *   // This property is bound using its original name.
   *   @Input() bankName: string;
   *   // this property value is bound to a different property name
   *   // when this component is instantiated in a template.
   *   @Input('account-id') id: string;
   *
   *   // this property is not bound, and is not automatically updated by Angular
   *   normalizedBankName: string;
   * }
   *
   * @Component({
   *   selector: 'app',
   *   template: `
   *     <bank-account bankName="RBC" account-id="4747"></bank-account>
   *   `
   * })
   * class App {}
   * ```
   *
   * @see [Input and Output properties](guide/inputs-outputs)
   */
  (bindingPropertyName?: string): any;
  new(bindingPropertyName?: string): any;
}

/**
 * Type of metadata for an `Input` property.
 *
 * @publicApi
 */
export interface Input {
  /**
   * The name of the DOM property to which the input property is bound.
   */
  bindingPropertyName?: string;
}

/**
 * @Annotation
 * @publicApi
 */
export const Input: InputDecorator =
    makePropDecorator('Input', (bindingPropertyName?: string) => ({bindingPropertyName}));

/**
 * Type of the Output decorator / constructor function.
 *
 * @publicApi
 */
export interface OutputDecorator {
  /**
   * Decorator that marks a class field as an output property and supplies configuration metadata.
   * The DOM property bound to the output property is automatically updated during change detection.
   *
   * @usageNotes
   *
   * You can supply an optional name to use in templates when the
   * component is instantiated, that maps to the
   * name of the bound property. By default, the original
   * name of the bound property is used for output binding.
   *
   * See `Input` decorator for an example of providing a binding name.
   *
   * @see [Input and Output properties](guide/inputs-outputs)
   *
   */
  (bindingPropertyName?: string): any;
  new(bindingPropertyName?: string): any;
}

/**
 * Type of the Output metadata.
 *
 * @publicApi
 */
export interface Output {
  /**
   * The name of the DOM property to which the output property is bound.
   */
  bindingPropertyName?: string;
}

/**
 * @Annotation
 * @publicApi
 */
export const Output: OutputDecorator =
    makePropDecorator('Output', (bindingPropertyName?: string) => ({bindingPropertyName}));



/**
 * Type of the HostBinding decorator / constructor function.
 *
 * @publicApi
 */
export interface HostBindingDecorator {
  /**
   * Decorator that marks a DOM property as a host-binding property and supplies configuration
   * metadata.
   * Angular automatically checks host property bindings during change detection, and
   * if a binding changes it updates the host element of the directive.
   *
   * @usageNotes
   *
   * The following example creates a directive that sets the `valid` and `invalid`
   * properties on the DOM element that has an `ngModel` directive on it.
   *
   * ```typescript
   * @Directive({selector: '[ngModel]'})
   * class NgModelStatus {
   *   constructor(public control: NgModel) {}
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
   *
   */
  (hostPropertyName?: string): any;
  new(hostPropertyName?: string): any;
}

/**
 * Type of the HostBinding metadata.
 *
 * @publicApi
 */
export interface HostBinding {
  /**
   * The DOM property that is bound to a data property.
   */
  hostPropertyName?: string;
}

/**
 * @Annotation
 * @publicApi
 */
export const HostBinding: HostBindingDecorator =
    makePropDecorator('HostBinding', (hostPropertyName?: string) => ({hostPropertyName}));


/**
 * Type of the HostListener decorator / constructor function.
 *
 * @publicApi
 */
export interface HostListenerDecorator {
  /**
   * Decorator that declares a DOM event to listen for,
   * and provides a handler method to run when that event occurs.
   *
   * Angular invokes the supplied handler method when the host element emits the specified event,
   * and updates the bound element with the result.
   *
   * If the handler method returns false, applies `preventDefault` on the bound element.
   */
  (eventName: string, args?: string[]): any;
  new(eventName: string, args?: string[]): any;
}

/**
 * Type of the HostListener metadata.
 *
 * @publicApi
 */
export interface HostListener {
  /**
   * The DOM event to listen for.
   */
  eventName?: string;
  /**
   * A set of arguments to pass to the handler method when the event occurs.
   */
  args?: string[];
}

/**
 * Decorator that binds a DOM event to a host listener and supplies configuration metadata.
 * Angular invokes the supplied handler method when the host element emits the specified event,
 * and updates the bound element with the result.
 *
 * If the handler method returns false, applies `preventDefault` on the bound element.
 *
 * @usageNotes
 *
 * The following example declares a directive
 * that attaches a click listener to a button and counts clicks.
 *
 * ```ts
 * @Directive({selector: 'button[counting]'})
 * class CountClicks {
 *   numberOfClicks = 0;
 *
 *   @HostListener('click', ['$event.target'])
 *   onClick(btn) {
 *     console.log('button', btn, 'number of clicks:', this.numberOfClicks++);
 *  }
 * }
 *
 * @Component({
 *   selector: 'app',
 *   template: '<button counting>Increment</button>',
 * })
 * class App {}
 *
 * ```
 *
 * The following example registers another DOM event handler that listens for key-press events.
 * ``` ts
 * import { HostListener, Component } from "@angular/core";
 *
 * @Component({
 *   selector: 'app',
 *   template: `<h1>Hello, you have pressed keys {{counter}} number of times!</h1> Press any key to
 * increment the counter.
 *   <button (click)="resetCounter()">Reset Counter</button>`
 * })
 * class AppComponent {
 *   counter = 0;
 *   @HostListener('window:keydown', ['$event'])
 *   handleKeyDown(event: KeyboardEvent) {
 *     this.counter++;
 *   }
 *   resetCounter() {
 *     this.counter = 0;
 *   }
 * }
 * ```
 *
 * @Annotation
 * @publicApi
 */
export const HostListener: HostListenerDecorator =
    makePropDecorator('HostListener', (eventName?: string, args?: string[]) => ({eventName, args}));



export const SWITCH_COMPILE_COMPONENT__POST_R3__ = render3CompileComponent;
export const SWITCH_COMPILE_DIRECTIVE__POST_R3__ = render3CompileDirective;
export const SWITCH_COMPILE_PIPE__POST_R3__ = render3CompilePipe;

const SWITCH_COMPILE_COMPONENT__PRE_R3__ = noop;
const SWITCH_COMPILE_DIRECTIVE__PRE_R3__ = noop;
const SWITCH_COMPILE_PIPE__PRE_R3__ = noop;

const SWITCH_COMPILE_COMPONENT: typeof render3CompileComponent = SWITCH_COMPILE_COMPONENT__PRE_R3__;
const SWITCH_COMPILE_DIRECTIVE: typeof render3CompileDirective = SWITCH_COMPILE_DIRECTIVE__PRE_R3__;
const SWITCH_COMPILE_PIPE: typeof render3CompilePipe = SWITCH_COMPILE_PIPE__PRE_R3__;
