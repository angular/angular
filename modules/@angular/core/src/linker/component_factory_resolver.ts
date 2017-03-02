/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {stringify} from '../facade/lang';
import {Type} from '../type';

import {ComponentFactory, ComponentFactoryFromNgModule, ComponentRef} from './component_factory';
import {NgModuleRef} from './ng_module_factory';
import {Injector} from "../di/injector";

export function noComponentFactoryError(component: Function) {
  const error = Error(
      `No component factory found for ${stringify(component)}. Did you add it to @NgModule.entryComponents?`);
  (error as any)[ERROR_COMPONENT] = component;
  return error;
}

const ERROR_COMPONENT = 'ngComponent';

export function getComponent(error: Error): Type<any> {
  return (error as any)[ERROR_COMPONENT];
}

class _NullComponentFactoryResolver implements ComponentFactoryResolver {
  resolveComponentFactory<T>(component: {new (...args: any[]): T}): ComponentFactory<T> {
    throw noComponentFactoryError(component);
  }
}

/**
 * @stable
 */
export abstract class ComponentFactoryResolver {
  static NULL: ComponentFactoryResolver = new _NullComponentFactoryResolver();
  abstract resolveComponentFactory<T>(component: Type<T>): ComponentFactory<T>;
}

export class CodegenComponentFactoryResolver implements ComponentFactoryResolver {
  ngModule: NgModuleRef<any>;

  private _factories = new Map<any, ComponentFactoryFromNgModule<any>>();

  constructor(factories: ComponentFactoryFromNgModule<any>[], private _parent: CodegenComponentFactoryResolver) {
    for (let i = 0; i < factories.length; i++) {
      const factory = factories[i];
      this._factories.set(factory.componentType, factory);
    }
  }

  resolveComponentFactory<T>(component: {new (...args: any[]): T}): ComponentFactory<T> {
    const factory = this._factories.get(component);
    if (factory) {
      return new NgModuleComponentFactory(this.ngModule, factory);
    }

    return this._parent.resolveComponentFactory(component);
  }
}

export class NgModuleComponentFactory<C> implements ComponentFactory<C> {
  constructor(private ngModule: NgModuleRef<any>, private cmpFactory: ComponentFactoryFromNgModule<C>) {}

  get selector() {return this.cmpFactory.selector; }
  get componentType() {return this.cmpFactory.componentType; }

  create(injector: Injector, projectableNodes?: any[][], rootSelectorOrNode?: string|any):
  ComponentRef<C> {
    return this.cmpFactory.create(this.ngModule, injector, projectableNodes, rootSelectorOrNode);
  }
}

