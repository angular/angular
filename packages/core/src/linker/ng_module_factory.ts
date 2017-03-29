/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Injector, THROW_IF_NOT_FOUND} from '../di/injector';
import {Type} from '../type';
import {stringify} from '../util';

import {ComponentFactory} from './component_factory';
import {CodegenComponentFactoryResolver, ComponentFactoryBoundToModule, ComponentFactoryResolver} from './component_factory_resolver';


/**
 * Represents an instance of an NgModule created via a {@link NgModuleFactory}.
 *
 * `NgModuleRef` provides access to the NgModule Instance as well other objects related to this
 * NgModule Instance.
 *
 * @stable
 */
export abstract class NgModuleRef<T> {
  /**
   * The injector that contains all of the providers of the NgModule.
   */
  abstract get injector(): Injector;

  /**
   * The ComponentFactoryResolver to get hold of the ComponentFactories
   * declared in the `entryComponents` property of the module.
   */
  abstract get componentFactoryResolver(): ComponentFactoryResolver;

  /**
   * The NgModule instance.
   */
  abstract get instance(): T;

  /**
   * Destroys the module instance and all of the data structures associated with it.
   */
  abstract destroy(): void;

  /**
   * Allows to register a callback that will be called when the module is destroyed.
   */
  abstract onDestroy(callback: () => void): void;
}

/**
 * @experimental
 */
export class NgModuleFactory<T> {
  constructor(
      private _injectorClass: {new (parentInjector: Injector): NgModuleInjector<T>},
      private _moduleType: Type<T>) {}

  get moduleType(): Type<T> { return this._moduleType; }

  create(parentInjector: Injector|null): NgModuleRef<T> {
    const instance = new this._injectorClass(parentInjector || Injector.NULL);
    instance.create();
    return instance;
  }
}

const _UNDEFINED = new Object();

export abstract class NgModuleInjector<T> implements Injector, NgModuleRef<T> {
  bootstrapFactories: ComponentFactory<any>[];
  instance: T;

  private _destroyListeners: (() => void)[] = [];
  private _destroyed: boolean = false;
  private _cmpFactoryResolver: CodegenComponentFactoryResolver;

  constructor(
      public parent: Injector, factories: ComponentFactory<any>[],
      bootstrapFactories: ComponentFactory<any>[]) {
    this.bootstrapFactories =
        bootstrapFactories.map(f => new ComponentFactoryBoundToModule(f, this));
    this._cmpFactoryResolver = new CodegenComponentFactoryResolver(
        factories, parent.get(ComponentFactoryResolver, ComponentFactoryResolver.NULL), this);
  }

  create() { this.instance = this.createInternal(); }

  abstract createInternal(): T;

  get(token: any, notFoundValue: any = THROW_IF_NOT_FOUND): any {
    if (token === Injector || token === NgModuleRef) {
      return this;
    }

    if (token === ComponentFactoryResolver) {
      return this._cmpFactoryResolver;
    }

    const result = this.getInternal(token, _UNDEFINED);
    return result === _UNDEFINED ? this.parent.get(token, notFoundValue) : result;
  }

  abstract getInternal(token: any, notFoundValue: any): any;

  get injector(): Injector { return this; }

  get componentFactoryResolver(): ComponentFactoryResolver { return this._cmpFactoryResolver; }

  destroy(): void {
    if (this._destroyed) {
      throw new Error(
          `The ng module ${stringify(this.instance.constructor)} has already been destroyed.`);
    }
    this._destroyed = true;
    this.destroyInternal();
    this._destroyListeners.forEach((listener) => listener());
  }

  onDestroy(callback: () => void): void { this._destroyListeners.push(callback); }

  abstract destroyInternal(): void;
}
