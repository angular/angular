/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ChangeDetectionStrategy} from '../change_detection/constants';
import {Provider} from '../di';
import {R3_COMPILE_COMPONENT, R3_COMPILE_DIRECTIVE, R3_COMPILE_PIPE} from '../ivy_switch/compiler/index';
import {NG_BASE_DEF} from '../render3/fields';
import {Type} from '../type';
import {TypeDecorator, makeDecorator, makePropDecorator} from '../util/decorators';
import {fillProperties} from '../util/property';

import {ViewEncapsulation} from './view';



/**
 * Type of the Directive decorator / constructor function.
 */
export interface DirectiveDecorator {
  /**
   * Marks a class as an Angular directive. You can define your own
   * directives to attach custom behavior to elements in the DOM.
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
   * ```
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
   * ```
   * declarations: [
   *  AppComponent,
   *  MyDirective
   * ],
   * ```
   *
   * @Annotation
   */
  (obj: Directive): TypeDecorator;

  /**
   * See the `Directive` decorator.
   */
  new (obj: Directive): Directive;
}

export interface Directive {
  /**
   * The CSS selector that triggers the instantiation of a directive.
   *
   * Declare as one of the following:
   *
   * - `element-name`: select by element name.
   * - `.class`: select by class name.
   * - `[attribute]`: select by attribute name.
   * - `[attribute=value]`: select by attribute name and value.
   * - `:not(sub_selector)`: select only if the element does not match the `sub_selector`.
   * - `selector1, selector2`: select if either `selector1` or `selector2` matches.
   *
   * Angular only allows directives to trigger on CSS selectors that do not cross element
   * boundaries. For example, consider a directive with an `input[type=text]` selector.
   * For the following HTML, the directive is instantiated only on the
   * `<input type="text">` element.
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
   * @usageNotes
   *
   * ### Example
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
   * ```
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
   * ### Example
   *
   * ```typescript
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
   */
  outputs?: string[];

  /**
   * A set of injection tokens that allow the DI system to
   * provide a dependency to this directive or component.
   */
  providers?: Provider[];

  /**
   * Defines the name that can be used in the template to assign this directive to a variable.
   *
   * @usageNotes
   *
   * ### Simple Example
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
   * ```
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
   * ### Example
   *
   * The following example shows how queries are defined
   * and when their results are available in lifecycle hooks:
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
   *
   * @Annotation
   */
  queries?: {[key: string]: any};

  /**
   * If true, this directive/component will be skipped by the AOT compiler and so will always be
   * compiled using JIT.
   *
   * This exists to support future Ivy work and has no effect currently.
   */
  jit?: true;
}

/**
 * Directive decorator and metadata.
 *
 * @Annotation
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
   * The set of event-bound output properties.
   * When an output property emits an event, an event handler attached
   * to that event in the template is invoked.
   *
   * Each output property maps a `directiveProperty` to a `bindingProperty`:
   * - `directiveProperty` specifies the component property that emits events.
   * - `bindingProperty` specifies the HTML attribute the event handler is attached to.
   *
   */
  outputs?: string[];

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
   * statement evalueates to `false`, then `preventDefault` is applied on the DOM
   * event. A handler method can refer to the `$event` local variable.
   *
   */
  host?: {[key: string]: string};

  /**
   * Configures the [injector](guide/glossary#injector) of this
   * directive or component with a [token](guide/glossary#di-token)
   * that maps to a [provider](guide/glossary#provider) of a dependency.
   */
  providers?: Provider[];

  /**
   * The name or names that can be used in the template to assign this directive to a variable.
   * For multiple names, use a comma-separated string.
   *
   */
  exportAs?: string;

  /**
   * Configures the queries that will be injected into the directive.
   *
   * Content queries are set before the `ngAfterContentInit` callback is called.
   * View queries are set before the `ngAfterViewInit` callback is called.
   *
   */
  queries?: {[key: string]: any};
}

/**
 * Type of the Directive metadata.
 */
export const Directive: DirectiveDecorator = makeDecorator(
    'Directive', (dir: Directive = {}) => dir, undefined, undefined,
    (type: Type<any>, meta: Directive) => R3_COMPILE_DIRECTIVE(type, meta));

/**
 * Component decorator interface
 *
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
   * Unlike other directives, only one component can be instantiated per an element in a template.
   *
   * A component must belong to an NgModule in order for it to be available
   * to another component or application. To make it a member of an NgModule,
   * list it in the `declarations` field of the `@NgModule` metadata.
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
   * <code-example path="core/ts/metadata/directives.ts" region="component-input">
   * </code-example>
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
   *
   *
   * @Annotation
   */
  (obj: Component): TypeDecorator;
  /**
   * See the `@Component` decorator.
   */
  new (obj: Component): Component;
}

/**
 * Supplies configuration metadata for an Angular component.
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
   * The URL of a template file for an Angular component. If provided,
   * do not supply an inline template using `template`.
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
   * One or more URLs for files containing CSS stylesheets to use
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
   * - `ViewEncapsulation.Native`: Use shadow roots. This works
   * only if natively available on the platform.
   * - `ViewEncapsulation.Emulated`: Use shimmed CSS that
   * emulates the native behavior.
   * - `ViewEncapsulation.None`: Use global CSS without any
   * encapsulation.
   *
   * If not supplied, the value is taken from `CompilerOptions`. The default compiler option is
   * `ViewEncapsulation.Emulated`.
   *
   * If the policy is set to `ViewEncapsulation.Emulated` and the component has no `styles`
   * or `styleUrls` specified, the policy is automatically switched to `ViewEncapsulation.None`.
   */
  encapsulation?: ViewEncapsulation;

  /**
   * Overrides the default encapsulation start and end delimiters (`{{` and `}}`)
   */
  interpolation?: [string, string];

  /**
   * A set of components that should be compiled along with
   * this component. For each component listed here,
   * Angular creates a {@link ComponentFactory} and stores it in the
   * {@link ComponentFactoryResolver}.
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
 * @usageNotes
 *
 * ### Using animations
 *
 * The following snippet shows an animation trigger in a component's
 * metadata. The trigger is attached to an element in the component's
 * template, using "@_trigger_name_", and a state expression that is evaluated
 * at run time to determine whether the animation should start.
 *
 * ```typescript
 * @Component({
 *   selector: 'animation-cmp',
 *   templateUrl: 'animation-cmp.html',
 *   animations: [
 *     trigger('myTriggerName', [
 *       state('on', style({ opacity: 1 }),
 *       state('off', style({ opacity: 0 }),
 *       transition('on => off', [
 *         animate("1s")
 *       ])
 *     ])
 *   ]
 * })
 * ```
 *
 * ```html
 * <!-- animation-cmp.html -->
 * <div @myTriggerName="expression">...</div>
 * ```
 *
 * ### Preserving whitespace
 *
 * Removing whitespace can greatly reduce AOT-generated code size, and speed up view creation.
 * As of Angular 6, default for `preserveWhitespaces` is false (whitespace is removed).
 * To change the default setting for all components in your application, set
 * the `preserveWhitespaces` option of the AOT compiler.
 *
 * Current implementation removes whitespace characters as follows:
 * - Trims all whitespaces at the beginning and the end of a template.
 * - Removes whitespace-only text nodes. For example,
 * `<button>Action 1</button>  <button>Action 2</button>` becomes
 * `<button>Action 1</button><button>Action 2</button>`.
 * - Replaces a series of whitespace characters in text nodes with a single space.
 * For example, `<span>\n some text\n</span>` becomes `<span> some text </span>`.
 * - Does NOT alter text nodes inside HTML tags such as `<pre>` or `<textarea>`,
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
 * <!-->compiled to be equivalent to:</>
 *  <a>Spaces</a> <a>between</a> <a>links.</a>
 * ```
 *
 * Note that sequences of `&ngsp;` are still collapsed to just one space character when
 * the `preserveWhitespaces` option is set to `false`.
 *
 * ```html
 * <a>before</a>&ngsp;&ngsp;&ngsp;<a>after</a>
 * <!-->compiled to be equivalent to:</>
 *  <a>Spaces</a> <a>between</a> <a>links.</a>
 * ```
 *
 * To preserve sequences of whitespace characters, use the
 * `ngPreserveWhitespaces` attribute.
 *
 * @Annotation
 */
export const Component: ComponentDecorator = makeDecorator(
    'Component', (c: Component = {}) => ({changeDetection: ChangeDetectionStrategy.Default, ...c}),
    Directive, undefined, (type: Type<any>, meta: Component) => R3_COMPILE_COMPONENT(type, meta));

/**
 * Type of the Pipe decorator / constructor function.
 */
export interface PipeDecorator {
  /**
   * Declares a reusable pipe function, and supplies configuration metadata.
   *
   */
  (obj: Pipe): TypeDecorator;

  /**
   * See the `Pipe` decorator.
   */
  new (obj: Pipe): Pipe;
}

/**
 * Type of the Pipe metadata.
 */
export interface Pipe {
  /**
   * The pipe name to use in template bindings.
   *
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
 *
 *
 * @Annotation
 */
export const Pipe: PipeDecorator = makeDecorator(
    'Pipe', (p: Pipe) => ({pure: true, ...p}), undefined, undefined,
    (type: Type<any>, meta: Pipe) => R3_COMPILE_PIPE(type, meta));


/**
 *
 */
export interface InputDecorator {
  /**
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
   * list it in the `declarations` field of the `@NgModule` metadata.
   *
   */
  (bindingPropertyName?: string): any;
  new (bindingPropertyName?: string): any;
}

/**
 * Type of metadata for an `Input` property.
 *
 *
 */
export interface Input {
  /**
   * Decorator that marks a class field as an input property and supplies configuration metadata.
   * Declares a data-bound input property, which Angular automatically updates
   * during change detection.
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
   *
   * class App {}
   * ```
   */
  bindingPropertyName?: string;
}

const initializeBaseDef = (target: any): void => {
  const constructor = target.constructor;
  const inheritedBaseDef = constructor.ngBaseDef;

  const baseDef = constructor.ngBaseDef = {
    inputs: {},
    outputs: {},
    declaredInputs: {},
  };

  if (inheritedBaseDef) {
    fillProperties(baseDef.inputs, inheritedBaseDef.inputs);
    fillProperties(baseDef.outputs, inheritedBaseDef.outputs);
    fillProperties(baseDef.declaredInputs, inheritedBaseDef.declaredInputs);
  }
};

/**
 * Does the work of creating the `ngBaseDef` property for the @Input and @Output decorators.
 * @param key "inputs" or "outputs"
 */
const updateBaseDefFromIOProp = (getProp: (baseDef: {inputs?: any, outputs?: any}) => any) =>
    (target: any, name: string, ...args: any[]) => {
      const constructor = target.constructor;

      if (!constructor.hasOwnProperty(NG_BASE_DEF)) {
        initializeBaseDef(target);
      }

      const baseDef = constructor.ngBaseDef;
      const defProp = getProp(baseDef);
      defProp[name] = args[0];
    };

/**
 *
 * @Annotation
 */
export const Input: InputDecorator = makePropDecorator(
    'Input', (bindingPropertyName?: string) => ({bindingPropertyName}), undefined,
    updateBaseDefFromIOProp(baseDef => baseDef.inputs || {}));

/**
 * Type of the Output decorator / constructor function.
 */
export interface OutputDecorator {
  /**
  * Decorator that marks a class field as an output property and supplies configuration metadata.
  * Declares a data-bound output property, which Angular automatically updates
  * during change detection.
  *
  * @usageNotes
  *
  * You can supply an optional name to use in templates when the
  * component is instantiated, that maps to the
  * name of the bound property. By default, the original
  * name of the bound property is used for output binding.
  *
  * See `@Input` decorator for an example of providing a binding name.
  *
  */
  (bindingPropertyName?: string): any;
  new (bindingPropertyName?: string): any;
}

/**
 * Type of the Output metadata.
 */
export interface Output { bindingPropertyName?: string; }

/**
 *
 * @Annotation
 */
export const Output: OutputDecorator = makePropDecorator(
    'Output', (bindingPropertyName?: string) => ({bindingPropertyName}), undefined,
    updateBaseDefFromIOProp(baseDef => baseDef.outputs || {}));



/**
 * Type of the HostBinding decorator / constructor function.
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
   */
  (hostPropertyName?: string): any;
  new (hostPropertyName?: string): any;
}

/**
 * Type of the HostBinding metadata.
 *
 */
export interface HostBinding { hostPropertyName?: string; }

/**
 *
 * @Annotation
 */
export const HostBinding: HostBindingDecorator =
    makePropDecorator('HostBinding', (hostPropertyName?: string) => ({hostPropertyName}));


/**
 * Type of the HostListener decorator / constructor function.
 */
export interface HostListenerDecorator {
  (eventName: string, args?: string[]): any;
  new (eventName: string, args?: string[]): any;
}

/**
 * Type of the HostListener metadata.
 */
export interface HostListener {
  /**
   * The CSS event to listen for.
   */
  eventName?: string;
  /**
   * A set of arguments to pass to the handler method when the event occurs.
   */
  args?: string[];
}

/**
 * Binds a CSS event to a host listener and supplies configuration metadata.
 * Angular invokes the supplied handler method when the host element emits the specified event,
 * and updates the bound element with the result.
 * If the handler method returns false, applies `preventDefault` on the bound element.
 *
 * @usageNotes
 *
 * The following example declares a directive
 * that attaches a click listener to a button and counts clicks.
 *
 * ```
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
 * ```
 *
 * @Annotation
 */
export const HostListener: HostListenerDecorator =
    makePropDecorator('HostListener', (eventName?: string, args?: string[]) => ({eventName, args}));
