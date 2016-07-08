/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Console} from '../console';
import {Injectable} from '../di';
import {Type, global, isString} from '../facade/lang';

import {ComponentFactory} from './component_factory';
import {ComponentResolver} from './component_resolver';

const _SEPARATOR = '#';

/**
 * Component resolver that can load components lazily
 *
 * @deprecated Lazy loading of components is deprecated. Use {@link SystemJsAppModuleLoader} to lazy
 * load
 * {@link AppModuleFactory}s instead.
 */
@Injectable()
export class SystemJsComponentResolver implements ComponentResolver {
  constructor(private _resolver: ComponentResolver, private _console: Console) {}

  resolveComponent(componentType: string|Type): Promise<ComponentFactory<any>> {
    if (isString(componentType)) {
      this._console.warn(ComponentResolver.LazyLoadingDeprecationMsg);
      let [module, component] = componentType.split(_SEPARATOR);

      if (component === void(0)) {
        // Use the default export when no component is specified
        component = 'default';
      }

      return (<any>global)
          .System.import(module)
          .then((module: any) => this._resolver.resolveComponent(module[component]));
    }

    return this._resolver.resolveComponent(componentType);
  }

  clearCache(): void {}
}

const FACTORY_MODULE_SUFFIX = '.ngfactory';
const FACTORY_CLASS_SUFFIX = 'NgFactory';

/**
 * Component resolver that can load component factories lazily
 *
 * @deprecated Lazy loading of components is deprecated. Use {@link SystemJsAppModuleFactoryLoader}
 * to lazy
 * load {@link AppModuleFactory}s instead.
 */
@Injectable()
export class SystemJsCmpFactoryResolver implements ComponentResolver {
  constructor(private _console: Console) {}
  resolveComponent(componentType: string|Type): Promise<ComponentFactory<any>> {
    if (isString(componentType)) {
      this._console.warn(ComponentResolver.LazyLoadingDeprecationMsg);
      let [module, factory] = componentType.split(_SEPARATOR);
      return (<any>global)
          .System.import(module + FACTORY_MODULE_SUFFIX)
          .then((module: any) => module[factory + FACTORY_CLASS_SUFFIX]);
    }

    return Promise.resolve(null);
  }

  clearCache(): void {}
}
