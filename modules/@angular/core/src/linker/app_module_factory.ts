/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Injector, THROW_IF_NOT_FOUND} from '../di/injector';
import {unimplemented} from '../facade/exceptions';
import {ConcreteType} from '../facade/lang';

import {ComponentFactory} from './component_factory';
import {CodegenComponentFactoryResolver, ComponentFactoryResolver} from './component_factory_resolver';


/**
 * Represents an instance of an AppModule created via a {@link AppModuleFactory}.
 *
 * `AppModuleRef` provides access to the AppModule Instance as well other objects related to this
 * AppModule Instance.
 * @stable
 */
export abstract class AppModuleRef<T> {
  /**
   * The injector that contains all of the providers of the AppModule.
   */
  get injector(): Injector { return unimplemented(); }

  /**
   * The ComponentFactoryResolver to get hold of the ComponentFactories
   * delcared in the `precompile` property of the module.
   */
  get componentFactoryResolver(): ComponentFactoryResolver { return unimplemented(); }

  /**
   * The AppModule instance.
   */
  get instance(): T { return unimplemented(); }
}

/**
 * @stable
 */
export class AppModuleFactory<T> {
  constructor(
      private _injectorClass: {new (parentInjector: Injector): AppModuleInjector<T>},
      private _moduleype: ConcreteType<T>) {}

  get moduleType(): ConcreteType<T> { return this._moduleype; }

  create(parentInjector: Injector = null): AppModuleRef<T> {
    if (!parentInjector) {
      parentInjector = Injector.NULL;
    }
    var instance = new this._injectorClass(parentInjector);
    instance.create();
    return instance;
  }
}

const _UNDEFINED = new Object();

export abstract class AppModuleInjector<T> extends CodegenComponentFactoryResolver implements
    Injector,
    AppModuleRef<T> {
  public instance: T;

  constructor(public parent: Injector, factories: ComponentFactory<any>[]) {
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
}
