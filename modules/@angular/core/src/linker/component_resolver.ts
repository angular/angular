/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Console} from '../console';
import {Injectable} from '../di/decorators';
import {PromiseWrapper} from '../facade/async';
import {BaseException} from '../facade/exceptions';
import {Type, isBlank, isString, stringify} from '../facade/lang';
import {reflector} from '../reflection/reflection';
import {ComponentFactory} from './component_factory';

/**
 * Low-level service for loading {@link ComponentFactory}s, which
 * can later be used to create and render a Component instance.
 *
 * @deprecated Use {@link ComponentFactoryResolver} together with {@link
 * AppModule}.precompile}/{@link Component}.precompile or
 * {@link ANALYZE_FOR_PRECOMPILE} provider for dynamic component creation.
 * Use {@link AppModuleFactoryLoader} for lazy loading.
 */
export abstract class ComponentResolver {
  static DynamicCompilationDeprecationMsg =
      'ComponentResolver is deprecated for dynamic compilation. Use ComponentFactoryResolver together with @AppModule/@Component.precompile or ANALYZE_FOR_PRECOMPILE provider instead.';
  static LazyLoadingDeprecationMsg =
      'ComponentResolver is deprecated for lazy loading. Use AppModuleFactoryLoader instead.';


  abstract resolveComponent(component: Type|string): Promise<ComponentFactory<any>>;
  abstract clearCache(): void;
}

function _isComponentFactory(type: any): boolean {
  return type instanceof ComponentFactory;
}

@Injectable()
export class ReflectorComponentResolver extends ComponentResolver {
  constructor(private _console: Console) { super(); }
  resolveComponent(component: Type|string): Promise<ComponentFactory<any>> {
    if (isString(component)) {
      return PromiseWrapper.reject(
          new BaseException(`Cannot resolve component using '${component}'.`), null);
    }
    this._console.warn(ComponentResolver.DynamicCompilationDeprecationMsg);

    var metadatas = reflector.annotations(<Type>component);
    var componentFactory = metadatas.find(_isComponentFactory);

    if (isBlank(componentFactory)) {
      throw new BaseException(`No precompiled component ${stringify(component)} found`);
    }
    return PromiseWrapper.resolve(componentFactory);
  }

  clearCache() {}
}
