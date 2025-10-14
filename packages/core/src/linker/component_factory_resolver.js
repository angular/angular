/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {RuntimeError} from '../errors';
import {stringify} from '../util/stringify';
class _NullComponentFactoryResolver {
  resolveComponentFactory(component) {
    throw new RuntimeError(
      917 /* RuntimeErrorCode.NO_COMPONENT_FACTORY_FOUND */,
      typeof ngDevMode !== 'undefined' &&
        ngDevMode &&
        `No component factory found for ${stringify(component)}.`,
    );
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
export class ComponentFactoryResolver {}
ComponentFactoryResolver.NULL = new _NullComponentFactoryResolver();
//# sourceMappingURL=component_factory_resolver.js.map
