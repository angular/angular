/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ChangeDetectionStrategy} from '../change_detection/constants';
import {Component as _Component, Directive as _Directive, HostBinding as _HostBinding, HostListener as _HostListener, Input as _Input, Output as _Output, Pipe as _Pipe} from '../decorators/decorators';
import {Type} from '../interfaces/type';
import {NG_BASE_DEF} from '../render3/interfaces/fields';
import {compileComponent as render3CompileComponent, compileDirective as render3CompileDirective} from '../render3/jit/directive';
import {compilePipe as render3CompilePipe} from '../render3/jit/pipe';
import {TypeDecorator, makeDecorator, makePropDecorator} from '../utils/decorators';
import {noop} from '../utils/noop';
import {fillProperties} from '../utils/property';

export type Directive = _Directive;
export type Component = _Component;
export type Pipe = _Pipe;
export type Input = _Input;
export type Output = _Output;
export type HostBinding = _HostBinding;
export type HostListener = _HostListener;

/**
 * Type of the Directive decorator / constructor function.
 * @publicApi
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
   * ```
   * <button>Action 1</button>  <button>Action 2</button>
   * ```
   *
   * becomes:
   *
   * ```
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
  (obj: Component): TypeDecorator;
  /**
   * See the `@Component` decorator.
   */
  new (obj: Component): Component;
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
 * @Annotation
 * @publicApi
 */
export const Input: InputDecorator = makePropDecorator(
    'Input', (bindingPropertyName?: string) => ({bindingPropertyName}), undefined,
    updateBaseDefFromIOProp(baseDef => baseDef.inputs || {}));

/**
 * Type of the Output decorator / constructor function.
 *
 * @publicApi
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
 * @Annotation
 * @publicApi
 */
export const Output: OutputDecorator = makePropDecorator(
    'Output', (bindingPropertyName?: string) => ({bindingPropertyName}), undefined,
    updateBaseDefFromIOProp(baseDef => baseDef.outputs || {}));



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
  new (hostPropertyName?: string): any;
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
  (eventName: string, args?: string[]): any;
  new (eventName: string, args?: string[]): any;
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
