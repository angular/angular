/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Injectable} from '../di/injectable';
import {InjectionToken} from '../di/injection_token';
import {StaticProvider} from '../di/interface/provider';
import {MissingTranslationStrategy} from '../i18n/tokens';
import {Type} from '../interface/type';
import {ViewEncapsulation} from '../metadata/view';
import {ComponentFactory as ComponentFactoryR3} from '../render3/component_ref';
import {getComponentDef, getNgModuleDef} from '../render3/definition';
import {NgModuleFactory as NgModuleFactoryR3} from '../render3/ng_module_ref';
import {maybeUnwrapFn} from '../render3/util/misc_utils';

import {ComponentFactory} from './component_factory';
import {NgModuleFactory} from './ng_module_factory';

/**
 * Combination of NgModuleFactory and ComponentFactories.
 *
 * @publicApi
 *
 * @deprecated
 * Ivy JIT mode doesn't require accessing this symbol.
 * See [JIT API changes due to ViewEngine deprecation](guide/deprecations#jit-api-changes) for
 * additional context.
 */
export class ModuleWithComponentFactories<T> {
  constructor(
      public ngModuleFactory: NgModuleFactory<T>,
      public componentFactories: ComponentFactory<any>[]) {}
}

/**
 * Low-level service for running the angular compiler during runtime
 * to create {@link ComponentFactory}s, which
 * can later be used to create and render a Component instance.
 *
 * Each `@NgModule` provides an own `Compiler` to its injector,
 * that will use the directives/pipes of the ng module for compilation
 * of components.
 *
 * @publicApi
 *
 * @deprecated
 * Ivy JIT mode doesn't require accessing this symbol.
 * See [JIT API changes due to ViewEngine deprecation](guide/deprecations#jit-api-changes) for
 * additional context.
 */
@Injectable({providedIn: 'root'})
export class Compiler {
  /**
   * Compiles the given NgModule and all of its components. All templates of the components
   * have to be inlined.
   */
  compileModuleSync<T>(moduleType: Type<T>): NgModuleFactory<T> {
    return new NgModuleFactoryR3(moduleType);
  }

  /**
   * Compiles the given NgModule and all of its components
   */
  compileModuleAsync<T>(moduleType: Type<T>): Promise<NgModuleFactory<T>> {
    return Promise.resolve(this.compileModuleSync(moduleType));
  }

  /**
   * Same as {@link #compileModuleSync} but also creates ComponentFactories for all components.
   */
  compileModuleAndAllComponentsSync<T>(moduleType: Type<T>): ModuleWithComponentFactories<T> {
    const ngModuleFactory = this.compileModuleSync(moduleType);
    const moduleDef = getNgModuleDef(moduleType)!;
    const componentFactories =
        maybeUnwrapFn(moduleDef.declarations)
            .reduce((factories: ComponentFactory<any>[], declaration: Type<any>) => {
              const componentDef = getComponentDef(declaration);
              componentDef && factories.push(new ComponentFactoryR3(componentDef));
              return factories;
            }, [] as ComponentFactory<any>[]);
    return new ModuleWithComponentFactories(ngModuleFactory, componentFactories);
  }

  /**
   * Same as {@link #compileModuleAsync} but also creates ComponentFactories for all components.
   */
  compileModuleAndAllComponentsAsync<T>(moduleType: Type<T>):
      Promise<ModuleWithComponentFactories<T>> {
    return Promise.resolve(this.compileModuleAndAllComponentsSync(moduleType));
  }

  /**
   * Clears all caches.
   */
  clearCache(): void {}

  /**
   * Clears the cache for the given component/ngModule.
   */
  clearCacheFor(type: Type<any>) {}

  /**
   * Returns the id for a given NgModule, if one is defined and known to the compiler.
   */
  getModuleId(moduleType: Type<any>): string|undefined {
    return undefined;
  }
}

/**
 * Options for creating a compiler.
 *
 * Note: the `useJit` and `missingTranslation` config options are not used in Ivy, passing them has
 * no effect. Those config options are deprecated since v13.
 *
 * @publicApi
 */
export type CompilerOptions = {
  /**
   * @deprecated not used at all in Ivy, providing this config option has no effect.
   */
  useJit?: boolean,
  defaultEncapsulation?: ViewEncapsulation,
  providers?: StaticProvider[],
  /**
   * @deprecated not used at all in Ivy, providing this config option has no effect.
   */
  missingTranslation?: MissingTranslationStrategy,
  preserveWhitespaces?: boolean,
};

/**
 * Token to provide CompilerOptions in the platform injector.
 *
 * @publicApi
 */
export const COMPILER_OPTIONS = new InjectionToken<CompilerOptions[]>('compilerOptions');

/**
 * A factory for creating a Compiler
 *
 * @publicApi
 *
 * @deprecated
 * Ivy JIT mode doesn't require accessing this symbol.
 * See [JIT API changes due to ViewEngine deprecation](guide/deprecations#jit-api-changes) for
 * additional context.
 */
export abstract class CompilerFactory {
  abstract createCompiler(options?: CompilerOptions[]): Compiler;
}
