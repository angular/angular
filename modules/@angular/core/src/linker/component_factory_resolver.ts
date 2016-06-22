/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Inject, OpaqueToken, Optional, SkipSelf} from '../di';
import {BaseException} from '../facade/exceptions';
import {ClassWithConstructor, stringify} from '../facade/lang';

import {ComponentFactory} from './component_factory';

export class NoComponentFactoryError extends BaseException {
  constructor(public component: Function) {
    super(`No component factory found for ${stringify(component)}`);
  }
}

class _NullComponentFactoryResolver implements ComponentFactoryResolver {
  resolveComponentFactory<T>(component: {new (...args: any[]): T}): ComponentFactory<T> {
    throw new NoComponentFactoryError(component);
  }
}

export abstract class ComponentFactoryResolver {
  static NULL: ComponentFactoryResolver = new _NullComponentFactoryResolver();
  abstract resolveComponentFactory<T>(component: ClassWithConstructor<T>): ComponentFactory<T>;
}

export class CodegenComponentFactoryResolver implements ComponentFactoryResolver {
  private _factories = new Map<any, ComponentFactory<any>>();

  constructor(factories: ComponentFactory<any>[], private _parent: ComponentFactoryResolver) {
    for (let i = 0; i < factories.length; i++) {
      let factory = factories[i];
      this._factories.set(factory.componentType, factory);
    }
  }

  resolveComponentFactory<T>(component: {new (...args: any[]): T}): ComponentFactory<T> {
    let result = this._factories.get(component);
    if (!result) {
      result = this._parent.resolveComponentFactory(component);
    }
    return result;
  }
}
