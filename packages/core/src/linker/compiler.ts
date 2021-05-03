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
 */
export class ModuleWithComponentFactories<T> {
  constructor(
      public ngModuleFactory: NgModuleFactory<T>,
      public componentFactories: ComponentFactory<any>[]) {}
}


function _throwError() {
  throw new Error(`Runtime compiler is not loaded`);
}

const Compiler_compileModuleSync__PRE_R3__: <T>(moduleType: Type<T>) => NgModuleFactory<T> =
    _throwError as any;
export const Compiler_compileModuleSync__POST_R3__: <T>(moduleType: Type<T>) =>
    NgModuleFactory<T> = function<T>(moduleType: Type<T>): NgModuleFactory<T> {
  return new NgModuleFactoryR3(moduleType);
};
const Compiler_compileModuleSync = Compiler_compileModuleSync__PRE_R3__;

const Compiler_compileModuleAsync__PRE_R3__: <T>(moduleType: Type<T>) =>
    Promise<NgModuleFactory<T>> = _throwError as any;
export const Compiler_compileModuleAsync__POST_R3__: <T>(moduleType: Type<T>) =>
    Promise<NgModuleFactory<T>> = function<T>(moduleType: Type<T>): Promise<NgModuleFactory<T>> {
  return Promise.resolve(Compiler_compileModuleSync__POST_R3__(moduleType));
};
const Compiler_compileModuleAsync = Compiler_compileModuleAsync__PRE_R3__;

const Compiler_compileModuleAndAllComponentsSync__PRE_R3__: <T>(moduleType: Type<T>) =>
    ModuleWithComponentFactories<T> = _throwError as any;
export const Compiler_compileModuleAndAllComponentsSync__POST_R3__: <T>(moduleType: Type<T>) =>
    ModuleWithComponentFactories<T> = function<T>(moduleType: Type<T>):
        ModuleWithComponentFactories<T> {
  const ngModuleFactory = Compiler_compileModuleSync__POST_R3__(moduleType);
  const moduleDef = getNgModuleDef(moduleType)!;
  const componentFactories =
      maybeUnwrapFn(moduleDef.declarations)
          .reduce((factories: ComponentFactory<any>[], declaration: Type<any>) => {
            const componentDef = getComponentDef(declaration);
            componentDef && factories.push(new ComponentFactoryR3(componentDef));
            return factories;
          }, [] as ComponentFactory<any>[]);
  return new ModuleWithComponentFactories(ngModuleFactory, componentFactories);
};
const Compiler_compileModuleAndAllComponentsSync =
    Compiler_compileModuleAndAllComponentsSync__PRE_R3__;

const Compiler_compileModuleAndAllComponentsAsync__PRE_R3__: <T>(moduleType: Type<T>) =>
    Promise<ModuleWithComponentFactories<T>> = _throwError as any;
export const Compiler_compileModuleAndAllComponentsAsync__POST_R3__: <T>(moduleType: Type<T>) =>
    Promise<ModuleWithComponentFactories<T>> = function<T>(moduleType: Type<T>):
        Promise<ModuleWithComponentFactories<T>> {
  return Promise.resolve(Compiler_compileModuleAndAllComponentsSync__POST_R3__(moduleType));
};
const Compiler_compileModuleAndAllComponentsAsync =
    Compiler_compileModuleAndAllComponentsAsync__PRE_R3__;

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
 */
@Injectable()
export class Compiler {
  /**
   * Compiles the given NgModule and all of its components. All templates of the components listed
   * in `entryComponents` have to be inlined.
   */
  compileModuleSync: <T>(moduleType: Type<T>) => NgModuleFactory<T> = Compiler_compileModuleSync;

  /**
   * Compiles the given NgModule and all of its components
   */
  compileModuleAsync:
      <T>(moduleType: Type<T>) => Promise<NgModuleFactory<T>> = Compiler_compileModuleAsync;

  /**
   * Same as {@link #compileModuleSync} but also creates ComponentFactories for all components.
   */
  compileModuleAndAllComponentsSync: <T>(moduleType: Type<T>) => ModuleWithComponentFactories<T> =
      Compiler_compileModuleAndAllComponentsSync;

  /**
   * Same as {@link #compileModuleAsync} but also creates ComponentFactories for all components.
   */
  compileModuleAndAllComponentsAsync: <T>(moduleType: Type<T>) =>
      Promise<ModuleWithComponentFactories<T>> = Compiler_compileModuleAndAllComponentsAsync;

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
 * Options for creating a compiler
 *
 * @publicApi
 */
export type CompilerOptions = {
  useJit?: boolean,
  defaultEncapsulation?: ViewEncapsulation,
  providers?: StaticProvider[],
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
 */
export abstract class CompilerFactory {
  abstract createCompiler(options?: CompilerOptions[]): Compiler;
}
