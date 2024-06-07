/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import type {ChangeDetectorRef} from '../change_detection/change_detection';
import type {Injector} from '../di/injector';
import type {EnvironmentInjector} from '../di/r3_injector';
import type {OutputEmitterRef} from '../authoring';
import type {EventEmitter} from '../event_emitter';
import {Type} from '../interface/type';

import type {ElementRef} from './element_ref';
import type {NgModuleRef} from './ng_module_factory';
import type {ViewRef} from './view_ref';

export type ExtractOutputType<T> =
  T extends OutputEmitterRef<infer U> ? U : T extends EventEmitter<infer U> ? U : never;

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
   * Listen to a given output on the component.
   *
   * @param propertyName the output property to listen to
   * @param listenerFn the callback invoked everytime the output fires the event
   *
   * @returns a function to manually clean up the output listening
   */

  abstract listenToOutput<OutputType extends keyof C>(
    propertyName: OutputType,
    listenerFn: (eventArg: ExtractOutputType<C[OutputType]>) => unknown,
  ): () => void;

  /**
   * Listen to a given output on the component.
   * This method does not ensure type safety of the output name nor of the event type.
   *
   * @param outputName the output to listen to
   * @param listenerFn the callback invoked everytime the output fires the event
   *
   * @returns a function to manually clean up the output listening
   */
  abstract unsafeListenToOutput(
    outputName: string,
    listenerFn: (eventArg: unknown) => unknown,
  ): () => void;

  /**
   * The host or anchor element for this component instance.
   */
  abstract get location(): ElementRef;

  /**
   * The dependency injector for this component instance.
   */
  abstract get injector(): Injector;

  /**
   * This component instance.
   */
  abstract get instance(): C;

  /**
   * The host view defined by the template
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
  abstract get inputs(): {
    propName: string;
    templateName: string;
    transform?: (value: any) => any;
    isSignal: boolean;
  }[];
  /**
   * The outputs of the component.
   */
  abstract get outputs(): {propName: string; templateName: string}[];
  /**
   * Creates a new component.
   */
  abstract create(
    injector: Injector,
    projectableNodes?: any[][],
    rootSelectorOrNode?: string | any,
    environmentInjector?: EnvironmentInjector | NgModuleRef<any>,
  ): ComponentRef<C>;
}
