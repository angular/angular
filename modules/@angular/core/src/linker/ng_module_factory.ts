/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Injector, THROW_IF_NOT_FOUND} from '../di/injector';
import {unimplemented} from '../facade/errors';
import {stringify} from '../facade/lang';
import {Type} from '../type';
import {ComponentFactory} from './component_factory';
import {CodegenComponentFactoryResolver, ComponentFactoryResolver} from './component_factory_resolver';



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
  get injector(): Injector { return unimplemented(); }

  /**
   * The ComponentFactoryResolver to get hold of the ComponentFactories
   * declared in the `entryComponents` property of the module.
   */
  get componentFactoryResolver(): ComponentFactoryResolver { return unimplemented(); }

  /**
   * The NgModule instance.
   */
  get instance(): T { return unimplemented(); }

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

  create(parentInjector: Injector): NgModuleRef<T> {
    if (!parentInjector) {
      parentInjector = Injector.NULL;
    }
    var instance = new this._injectorClass(parentInjector);
    instance.create();
    return instance;
  }
}

const _UNDEFINED = new Object();

export abstract class NgModuleInjector<T> extends CodegenComponentFactoryResolver implements
    Injector,
    NgModuleRef<T> {
  private _destroyListeners: (() => void)[] = [];
  private _destroyed: boolean = false;

  public instance: T;

  constructor(
      public parent: Injector, factories: ComponentFactory<any>[],
      public bootstrapFactories: ComponentFactory<any>[]) {
    super(factories, parent.get(ComponentFactoryResolver, ComponentFactoryResolver.NULL));
  }

  create() { this.instance = this.createInternal(); }

  abstract createInternal(): T;

  get(token: any, notFoundValue: any = THROW_IF_NOT_FOUND): any {
    if (token === Injector || token === ComponentFactoryResolver) {
      return this;
    }
    var result = this.getInternal(token, _UNDEFINED);
    return result === _UNDEFINED ? this.parent.get(token, notFoundValue) : result;
  }

  abstract getInternal(token: any, notFoundValue: any): any;

  get injector(): Injector { return this; }

  get componentFactoryResolver(): ComponentFactoryResolver { return this; }

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
