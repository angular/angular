/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {RuntimeError, RuntimeErrorCode} from '../../errors';
import {Type} from '../../interface/type';
import {NgModuleType} from '../../metadata/ng_module_def';
import {getNgModuleDef, isStandalone} from '../definition';
import {ComponentType, NgModuleScopeInfoFromDecorator} from '../interfaces/definition';
import {isComponent, isDirective, isModuleWithProviders, isNgModule, isPipe} from '../jit/util';
import {maybeUnwrapFn} from '../util/misc_utils';

import {ComponentDependencies, DepsTrackerApi, NgModuleScope, StandaloneComponentScope} from './api';

/**
 * An implementation of DepsTrackerApi which will be used for JIT and local compilation.
 */
class DepsTracker implements DepsTrackerApi {
  private ownerNgModule = new Map<ComponentType<any>, NgModuleType<any>>();
  private ngModulesScopeCache = new Map<NgModuleType<any>, NgModuleScope>();
  private standaloneComponentsScopeCache = new Map<ComponentType<any>, StandaloneComponentScope>();

  /** @override */
  getComponentDependencies(cmp: ComponentType<any>): ComponentDependencies {
    // TODO: implement this.
    return {dependencies: []};
  }

  /** @override */
  registerNgModule(type: Type<any>, scopeInfo: NgModuleScopeInfoFromDecorator): void {
    // TODO: implement this.
  }

  /** @override */
  clearScopeCacheFor(type: ComponentType<any>|NgModuleType): void {
    // TODO: implement this.
  }

  /** @override */
  getNgModuleScope(type: NgModuleType<any>): NgModuleScope {
    if (this.ngModulesScopeCache.has(type)) {
      return this.ngModulesScopeCache.get(type)!;
    }

    const scope = this.computeNgModuleScope(type);
    this.ngModulesScopeCache.set(type, scope);

    return scope;
  }

  /** Compute NgModule scope afresh. */
  private computeNgModuleScope(type: NgModuleType<any>): NgModuleScope {
    const def = getNgModuleDef(type, true);
    const scope: NgModuleScope = {
      exported: {directives: new Set(), pipes: new Set()},
      compilation: {directives: new Set(), pipes: new Set()},
    };

    // Analyzing imports
    for (const imported of maybeUnwrapFn(def.imports)) {
      if (isNgModule(imported)) {
        const importedScope = this.getNgModuleScope(imported);

        // When this module imports another, the imported module's exported directives and pipes
        // are added to the compilation scope of this module.
        addSet(importedScope.exported.directives, scope.compilation.directives);
        addSet(importedScope.exported.pipes, scope.compilation.pipes);
      } else if (isStandalone(imported)) {
        if (isDirective(imported) || isComponent(imported)) {
          scope.compilation.directives.add(imported);
        } else if (isPipe(imported)) {
          scope.compilation.pipes.add(imported);
        } else {
          // The standalone thing is neither a component nor a directive nor a pipe ... (what?)
          throw new RuntimeError(
              RuntimeErrorCode.RUNTIME_DEPS_INVALID_IMPORTED_TYPE,
              'The standalone imported type is neither a component nor a directive nor a pipe');
        }
      } else {
        // The import is neither a module nor a module-with-providers nor a standalone thing. This
        // is going to be an error. So we short circuit.
        scope.compilation.isPoisoned = true;
        break;
      }
    }

    // Analyzing declarations
    if (!scope.compilation.isPoisoned) {
      for (const decl of maybeUnwrapFn(def.declarations)) {
        // Cannot declare another NgModule or a standalone thing
        if (isNgModule(decl) || isStandalone(decl)) {
          scope.compilation.isPoisoned = true;
          break;
        }

        if (isPipe(decl)) {
          scope.compilation.pipes.add(decl);
        } else {
          // decl is either a directive or a component. The component may not yet have the ɵcmp due
          // to async compilation.
          scope.compilation.directives.add(decl);
        }
      }
    }

    // Analyzing exports
    for (const exported of maybeUnwrapFn(def.exports)) {
      if (isNgModule(exported)) {
        // When this module exports another, the exported module's exported directives and pipes
        // are added to both the compilation and exported scopes of this module.
        const exportedScope = this.getNgModuleScope(exported);

        // Based on the current logic there is no way to have poisoned exported scope. So no need to
        // check for it.
        addSet(exportedScope.exported.directives, scope.exported.directives);
        addSet(exportedScope.exported.pipes, scope.exported.pipes);

      } else if (isPipe(exported)) {
        scope.exported.pipes.add(exported);
      } else {
        scope.exported.directives.add(exported);
      }
    }

    return scope;
  }

  /** @override */
  getStandaloneComponentScope(type: ComponentType<any>, imports: Type<any>[]):
      StandaloneComponentScope {
    // TODO: implement this.
    return {compilation: {directives: new Set(), pipes: new Set()}};
  }
}

function addSet<T>(sourceSet: Set<T>, targetSet: Set<T>): void {
  for (const m of sourceSet) {
    targetSet.add(m);
  }
}

/** The deps tracker to be used in the current Angular app in dev mode. */
export const depsTracker = new DepsTracker();

export const TEST_ONLY = {DepsTracker};
