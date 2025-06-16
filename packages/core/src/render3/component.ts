/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Injector} from '../di/injector';
import {EnvironmentInjector, getNullInjector} from '../di/r3_injector';
import {Type} from '../interface/type';
import {ComponentRef} from '../linker/component_factory';

import {ComponentFactory} from './component_ref';
import {getComponentDef} from './def_getters';
import {Binding, DirectiveWithBindings} from './dynamic_bindings';
import {assertComponentDef} from './errors';

/**
 * Creates a `ComponentRef` instance based on provided component type and a set of options.
 *
 * @usageNotes
 *
 * The example below demonstrates how the `createComponent` function can be used
 * to create an instance of a ComponentRef dynamically and attach it to an ApplicationRef,
 * so that it gets included into change detection cycles.
 *
 * Note: the example uses standalone components, but the function can also be used for
 * non-standalone components (declared in an NgModule) as well.
 *
 * ```angular-ts
 * @Component({
 *   standalone: true,
 *   template: `Hello {{ name }}!`
 * })
 * class HelloComponent {
 *   name = 'Angular';
 * }
 *
 * @Component({
 *   standalone: true,
 *   template: `<div id="hello-component-host"></div>`
 * })
 * class RootComponent {}
 *
 * // Bootstrap an application.
 * const applicationRef = await bootstrapApplication(RootComponent);
 *
 * // Locate a DOM node that would be used as a host.
 * const hostElement = document.getElementById('hello-component-host');
 *
 * // Get an `EnvironmentInjector` instance from the `ApplicationRef`.
 * const environmentInjector = applicationRef.injector;
 *
 * // We can now create a `ComponentRef` instance.
 * const componentRef = createComponent(HelloComponent, {hostElement, environmentInjector});
 *
 * // Last step is to register the newly created ref using the `ApplicationRef` instance
 * // to include the component view into change detection cycles.
 * applicationRef.attachView(componentRef.hostView);
 * componentRef.changeDetectorRef.detectChanges();
 * ```
 *
 * @param component Component class reference.
 * @param options Set of options to use:
 *  * `environmentInjector`: An `EnvironmentInjector` instance to be used for the component.
 *  * `hostElement` (optional): A DOM node that should act as a host node for the component. If not
 * provided, Angular creates one based on the tag name used in the component selector (and falls
 * back to using `div` if selector doesn't have tag name info).
 *  * `elementInjector` (optional): An `ElementInjector` instance, see additional info about it
 * [here](guide/di/hierarchical-dependency-injection#elementinjector).
 *  * `projectableNodes` (optional): A list of DOM nodes that should be projected through
 * [`<ng-content>`](api/core/ng-content) of the new component instance, e.g.,
 * `[[element1, element2]]`: projects `element1` and `element2` into the same `<ng-content>`.
 * `[[element1, element2], [element3]]`: projects `element1` and `element2` into one `<ng-content>`,
 * and `element3` into a separate `<ng-content>`.
 *  * `directives` (optional): Directives that should be applied to the component.
 *  * `binding` (optional): Bindings to apply to the root component.
 * @returns ComponentRef instance that represents a given Component.
 *
 * @publicApi
 */
export function createComponent<C>(
  component: Type<C>,
  options: {
    environmentInjector: EnvironmentInjector;
    hostElement?: Element;
    elementInjector?: Injector;
    projectableNodes?: Node[][];
    directives?: (Type<unknown> | DirectiveWithBindings<unknown>)[];
    bindings?: Binding[];
  },
): ComponentRef<C> {
  ngDevMode && assertComponentDef(component);
  const componentDef = getComponentDef(component)!;
  const elementInjector = options.elementInjector || getNullInjector();
  const factory = new ComponentFactory<C>(componentDef);
  return factory.create(
    elementInjector,
    options.projectableNodes,
    options.hostElement,
    options.environmentInjector,
    options.directives,
    options.bindings,
  );
}

/**
 * An interface that describes the subset of component metadata
 * that can be retrieved using the `reflectComponentType` function.
 *
 * @publicApi
 */
export interface ComponentMirror<C> {
  /**
   * The component's HTML selector.
   */
  get selector(): string;
  /**
   * The type of component the factory will create.
   */
  get type(): Type<C>;
  /**
   * The inputs of the component.
   */
  get inputs(): ReadonlyArray<{
    readonly propName: string;
    readonly templateName: string;
    readonly transform?: (value: any) => any;
    readonly isSignal: boolean;
  }>;
  /**
   * The outputs of the component.
   */
  get outputs(): ReadonlyArray<{readonly propName: string; readonly templateName: string}>;
  /**
   * Selector for all <ng-content> elements in the component.
   */
  get ngContentSelectors(): ReadonlyArray<string>;
  /**
   * Whether this component is marked as standalone.
   * Note: an extra flag, not present in `ComponentFactory`.
   */
  get isStandalone(): boolean;
  /**
   * // TODO(signals): Remove internal and add public documentation
   * @internal
   */
  get isSignal(): boolean;
}

/**
 * Creates an object that allows to retrieve component metadata.
 *
 * @usageNotes
 *
 * The example below demonstrates how to use the function and how the fields
 * of the returned object map to the component metadata.
 *
 * ```angular-ts
 * @Component({
 *   standalone: true,
 *   selector: 'foo-component',
 *   template: `
 *     <ng-content></ng-content>
 *     <ng-content select="content-selector-a"></ng-content>
 *   `,
 * })
 * class FooComponent {
 *   @Input('inputName') inputPropName: string;
 *   @Output('outputName') outputPropName = new EventEmitter<void>();
 * }
 *
 * const mirror = reflectComponentType(FooComponent);
 * expect(mirror.type).toBe(FooComponent);
 * expect(mirror.selector).toBe('foo-component');
 * expect(mirror.isStandalone).toBe(true);
 * expect(mirror.inputs).toEqual([{propName: 'inputName', templateName: 'inputPropName'}]);
 * expect(mirror.outputs).toEqual([{propName: 'outputName', templateName: 'outputPropName'}]);
 * expect(mirror.ngContentSelectors).toEqual([
 *   '*',                 // first `<ng-content>` in a template, the selector defaults to `*`
 *   'content-selector-a' // second `<ng-content>` in a template
 * ]);
 * ```
 *
 * @param component Component class reference.
 * @returns An object that allows to retrieve component metadata.
 *
 * @publicApi
 */
export function reflectComponentType<C>(component: Type<C>): ComponentMirror<C> | null {
  const componentDef = getComponentDef(component);
  if (!componentDef) return null;

  const factory = new ComponentFactory<C>(componentDef);
  return {
    get selector(): string {
      return factory.selector;
    },
    get type(): Type<C> {
      return factory.componentType;
    },
    get inputs(): ReadonlyArray<{
      propName: string;
      templateName: string;
      transform?: (value: any) => any;
      isSignal: boolean;
    }> {
      return factory.inputs;
    },
    get outputs(): ReadonlyArray<{propName: string; templateName: string}> {
      return factory.outputs;
    },
    get ngContentSelectors(): ReadonlyArray<string> {
      return factory.ngContentSelectors;
    },
    get isStandalone(): boolean {
      return componentDef.standalone;
    },
    get isSignal(): boolean {
      return componentDef.signals;
    },
  };
}
