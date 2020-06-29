/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Injector} from '../di/injector';
import {Type} from '../interface/type';
import {stringify} from '../util/stringify';

import {ComponentFactory, ComponentRef} from './component_factory';
import {NgModuleRef} from './ng_module_factory';

export function noComponentFactoryError(component: Function) {
  const error = Error(`No component factory found for ${
      stringify(component)}. Did you add it to @NgModule.entryComponents?`);
  (error as any)[ERROR_COMPONENT] = component;
  return error;
}

const ERROR_COMPONENT = 'ngComponent';

export function getComponent(error: Error): Type<any> {
  return (error as any)[ERROR_COMPONENT];
}


class _NullComponentFactoryResolver implements ComponentFactoryResolver {
  resolveComponentFactory<T>(component: {new(...args: any[]): T}): ComponentFactory<T> {
    throw noComponentFactoryError(component);
  }
}

/**
 * A simple registry that maps `Components` to generated `ComponentFactory` classes
 * that can be used to create instances of components.
 * Use to obtain the factory for a given component type,
 * then use the factory's `create()` method to create a component of that type.
 *
 * @see [Dynamic Components](guide/dynamic-component-loader)
 * @publicApi
 */
export abstract class ComponentFactoryResolver {
  static NULL: ComponentFactoryResolver = new _NullComponentFactoryResolver();
  /**
   * Retrieves the factory object that creates a component of the given type.
   * @param component The component type.
   */
  abstract resolveComponentFactory<T>(component: Type<T>): ComponentFactory<T>;
}

export class CodegenComponentFactoryResolver implements ComponentFactoryResolver {
  private _factories = new Map<any, ComponentFactory<any>>();

  constructor(
      factories: ComponentFactory<any>[], private _parent: ComponentFactoryResolver,
      private _ngModule: NgModuleRef<any>) {
    for (let i = 0; i < factories.length; i++) {
      const factory = factories[i];
      this._factories.set(factory.componentType, factory);
    }
  }

  resolveComponentFactory<T>(component: {new(...args: any[]): T}): ComponentFactory<T> {
    let factory = this._factories.get(component);
    if (!factory && this._parent) {
      factory = this._parent.resolveComponentFactory(component);
    }
    if (!factory) {
      throw noComponentFactoryError(component);
    }
    return new ComponentFactoryBoundToModule(factory, this._ngModule);
  }
}

export class ComponentFactoryBoundToModule<C> extends ComponentFactory<C> {
  readonly selector: string;
  readonly componentType: Type<any>;
  readonly ngContentSelectors: string[];
  readonly inputs: {propName: string, templateName: string}[];
  readonly outputs: {propName: string, templateName: string}[];

  constructor(private factory: ComponentFactory<C>, private ngModule: NgModuleRef<any>) {
    super();
    this.selector = factory.selector;
    this.componentType = factory.componentType;
    this.ngContentSelectors = factory.ngContentSelectors;
    this.inputs = factory.inputs;
    this.outputs = factory.outputs;
  }

  create(
      injector: Injector, projectableNodes?: any[][], rootSelectorOrNode?: string|any,
      ngModule?: NgModuleRef<any>): ComponentRef<C> {
    return this.factory.create(
        injector, projectableNodes, rootSelectorOrNode, ngModule || this.ngModule);
  }
}
