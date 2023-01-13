/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Type} from '../interface/type';
import {stringify} from '../util/stringify';

import {ComponentFactory} from './component_factory';

export function noComponentFactoryError(component: Function) {
  const error = Error(`No component factory found for ${stringify(component)}.`);
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
 * Note: since v13, dynamic component creation via
 * [`ViewContainerRef.createComponent`](api/core/ViewContainerRef#createComponent)
 * does **not** require resolving component factory: component class can be used directly.
 *
 * @publicApi
 *
 * @deprecated Angular no longer requires Component factories. Please use other APIs where
 *     Component class can be used directly.
 */
export abstract class ComponentFactoryResolver {
  static NULL: ComponentFactoryResolver = (/* @__PURE__ */ new _NullComponentFactoryResolver());
  /**
   * Retrieves the factory object that creates a component of the given type.
   * @param component The component type.
   */
  abstract resolveComponentFactory<T>(component: Type<T>): ComponentFactory<T>;
}
