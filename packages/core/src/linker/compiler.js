/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {__decorate} from 'tslib';
import {Injectable} from '../di/injectable';
import {InjectionToken} from '../di/injection_token';
import {ComponentFactory as ComponentFactoryR3} from '../render3/component_ref';
import {getComponentDef, getNgModuleDef} from '../render3/def_getters';
import {NgModuleFactory as NgModuleFactoryR3} from '../render3/ng_module_ref';
import {maybeUnwrapFn} from '../render3/util/misc_utils';
/**
 * Combination of NgModuleFactory and ComponentFactories.
 *
 * @publicApi
 *
 * @deprecated
 * Ivy JIT mode doesn't require accessing this symbol.
 */
export class ModuleWithComponentFactories {
  constructor(ngModuleFactory, componentFactories) {
    this.ngModuleFactory = ngModuleFactory;
    this.componentFactories = componentFactories;
  }
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
 */
let Compiler = class Compiler {
  /**
   * Compiles the given NgModule and all of its components. All templates of the components
   * have to be inlined.
   */
  compileModuleSync(moduleType) {
    return new NgModuleFactoryR3(moduleType);
  }
  /**
   * Compiles the given NgModule and all of its components
   */
  compileModuleAsync(moduleType) {
    return Promise.resolve(this.compileModuleSync(moduleType));
  }
  /**
   * Same as {@link Compiler#compileModuleSync compileModuleSync} but also creates ComponentFactories for all components.
   */
  compileModuleAndAllComponentsSync(moduleType) {
    const ngModuleFactory = this.compileModuleSync(moduleType);
    const moduleDef = getNgModuleDef(moduleType);
    const componentFactories = maybeUnwrapFn(moduleDef.declarations).reduce(
      (factories, declaration) => {
        const componentDef = getComponentDef(declaration);
        componentDef && factories.push(new ComponentFactoryR3(componentDef));
        return factories;
      },
      [],
    );
    return new ModuleWithComponentFactories(ngModuleFactory, componentFactories);
  }
  /**
   * Same as {@link Compiler#compileModuleAsync compileModuleAsync} but also creates ComponentFactories for all components.
   */
  compileModuleAndAllComponentsAsync(moduleType) {
    return Promise.resolve(this.compileModuleAndAllComponentsSync(moduleType));
  }
  /**
   * Clears all caches.
   */
  clearCache() {}
  /**
   * Clears the cache for the given component/ngModule.
   */
  clearCacheFor(type) {}
  /**
   * Returns the id for a given NgModule, if one is defined and known to the compiler.
   */
  getModuleId(moduleType) {
    return undefined;
  }
};
Compiler = __decorate([Injectable({providedIn: 'root'})], Compiler);
export {Compiler};
/**
 * Token to provide CompilerOptions in the platform injector.
 *
 * @publicApi
 */
export const COMPILER_OPTIONS = new InjectionToken(
  typeof ngDevMode !== undefined && ngDevMode ? 'compilerOptions' : '',
);
/**
 * A factory for creating a Compiler
 *
 * @publicApi
 *
 * @deprecated
 * Ivy JIT mode doesn't require accessing this symbol.
 */
export class CompilerFactory {}
//# sourceMappingURL=compiler.js.map
