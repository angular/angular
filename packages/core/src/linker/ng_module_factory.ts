/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Injector} from '../di/injector';
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
  abstract get injector(): Injector;

  /**
   * The resolver that can retrieve the component factories
   * declared in the `entryComponents` property of the module.
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
 */
export abstract class NgModuleFactory<T> {
  abstract get moduleType(): Type<T>;
  abstract create(parentInjector: Injector|null): NgModuleRef<T>;
}
