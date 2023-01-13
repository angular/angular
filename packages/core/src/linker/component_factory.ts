/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ChangeDetectorRef} from '../change_detection/change_detection';
import {Injector} from '../di/injector';
import {EnvironmentInjector} from '../di/r3_injector';
import {Type} from '../interface/type';

import {ElementRef} from './element_ref';
import {NgModuleRef} from './ng_module_factory';
import {ViewRef} from './view_ref';

/**
 * Represents a component created by a `ComponentFactory`.
 * Provides access to the component instance and related objects,
 * and provides the means of destroying the instance.
 *
 * @publicApi
 */
export abstract class ComponentRef<C> {
  /**
   * Updates a specified input name to a new value. Using this method will properly mark for check
   * component using the `OnPush` change detection strategy. It will also assure that the
   * `OnChanges` lifecycle hook runs when a dynamically created component is change-detected.
   *
   * @param name The name of an input.
   * @param value The new value of an input.
   */
  abstract setInput(name: string, value: unknown): void;

  /**
   * The host or anchor [element](guide/glossary#element) for this component instance.
   */
  abstract get location(): ElementRef;

  /**
   * The [dependency injector](guide/glossary#injector) for this component instance.
   */
  abstract get injector(): Injector;

  /**
   * This component instance.
   */
  abstract get instance(): C;

  /**
   * The [host view](guide/glossary#view-hierarchy) defined by the template
   * for this component instance.
   */
  abstract get hostView(): ViewRef;

  /**
   * The change detector for this component instance.
   */
  abstract get changeDetectorRef(): ChangeDetectorRef;

  /**
   * The type of this component (as created by a `ComponentFactory` class).
   */
  abstract get componentType(): Type<any>;

  /**
   * Destroys the component instance and all of the data structures associated with it.
   */
  abstract destroy(): void;

  /**
   * A lifecycle hook that provides additional developer-defined cleanup
   * functionality for the component.
   * @param callback A handler function that cleans up developer-defined data
   * associated with this component. Called when the `destroy()` method is invoked.
   */
  abstract onDestroy(callback: Function): void;
}

/**
 * Base class for a factory that can create a component dynamically.
 * Instantiate a factory for a given type of component with `resolveComponentFactory()`.
 * Use the resulting `ComponentFactory.create()` method to create a component of that type.
 *
 * @see [Dynamic Components](guide/dynamic-component-loader)
 *
 * @publicApi
 *
 * @deprecated Angular no longer requires Component factories. Please use other APIs where
 *     Component class can be used directly.
 */
export abstract class ComponentFactory<C> {
  /**
   * The component's HTML selector.
   */
  abstract get selector(): string;
  /**
   * The type of component the factory will create.
   */
  abstract get componentType(): Type<any>;
  /**
   * Selector for all <ng-content> elements in the component.
   */
  abstract get ngContentSelectors(): string[];
  /**
   * The inputs of the component.
   */
  abstract get inputs(): {propName: string, templateName: string}[];
  /**
   * The outputs of the component.
   */
  abstract get outputs(): {propName: string, templateName: string}[];
  /**
   * Creates a new component.
   */
  abstract create(
      injector: Injector, projectableNodes?: any[][], rootSelectorOrNode?: string|any,
      environmentInjector?: EnvironmentInjector|NgModuleRef<any>): ComponentRef<C>;
}
