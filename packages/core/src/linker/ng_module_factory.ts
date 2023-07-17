/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Injector} from '../di/injector';
import {EnvironmentInjector} from '../di/r3_injector';
import {Type} from '../interface/type';

import {ComponentFactoryResolver} from './component_factory_resolver';


/**
 * Represents an instance of an `NgModule` created by an `NgModuleFactory`.
 * Provides access to the `NgModule` instance and related objects.
 *
 * @publicApi
 */
export abstract class NgModuleRef<T> {
  /**
   * The injector that contains all of the providers of the `NgModule`.
   */
  abstract get injector(): EnvironmentInjector;

  /**
   * The resolver that can retrieve component factories in a context of this module.
   *
   * Note: since v13, dynamic component creation via
   * [`ViewContainerRef.createComponent`](api/core/ViewContainerRef#createComponent)
   * does **not** require resolving component factory: component class can be used directly.
   *
   * @deprecated Angular no longer requires Component factories. Please use other APIs where
   *     Component class can be used directly.
   */
  abstract get componentFactoryResolver(): ComponentFactoryResolver;

  /**
   * The `NgModule` instance.
   */
  abstract get instance(): T;

  /**
   * Destroys the module instance and all of the data structures associated with it.
   */
  abstract destroy(): void;

  /**
   * Registers a callback to be executed when the module is destroyed.
   */
  abstract onDestroy(callback: () => void): void;
}

export interface InternalNgModuleRef<T> extends NgModuleRef<T> {
  // Note: we are using the prefix _ as NgModuleData is an NgModuleRef and therefore directly
  // exposed to the user.
  _bootstrapComponents: Type<any>[];
}

/**
 * @publicApi
 *
 * @deprecated
 * This class was mostly used as a part of ViewEngine-based JIT API and is no longer needed in Ivy
 * JIT mode. See [JIT API changes due to ViewEngine deprecation](guide/deprecations#jit-api-changes)
 * for additional context. Angular provides APIs that accept NgModule classes directly (such as
 * [PlatformRef.bootstrapModule](api/core/PlatformRef#bootstrapModule) and
 * [createNgModule](api/core/createNgModule)), consider switching to those APIs instead of
 * using factory-based ones.
 */
export abstract class NgModuleFactory<T> {
  abstract get moduleType(): Type<T>;
  abstract create(parentInjector: Injector|null): NgModuleRef<T>;
}
