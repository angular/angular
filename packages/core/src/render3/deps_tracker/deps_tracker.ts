/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {resolveForwardRef} from '../../di';
import {Type} from '../../interface/type';
import {NgModuleType} from '../../metadata/ng_module_def';
import {getNgModuleDef, getPipeDef, isStandalone} from '../definition';
import {ComponentType, NgModuleScopeInfoFromDecorator} from '../interfaces/definition';
import {verifyStandaloneImport} from '../jit/directive';
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
    if (isNgModule(type)) {
      this.ngModulesScopeCache.delete(type);
    } else if (isComponent(type)) {
      this.standaloneComponentsScopeCache.delete(type);
    }
  }

  /** @override */
  getNgModuleScope(type: NgModuleType<any>): NgModuleScope {
    if (this.ngModulesScopeCache.has(type)) {
      return this.ngModulesScopeCache.get(type)!;
    }

    const ans = this.computeNgModuleScope(type);
    this.ngModulesScopeCache.set(type, ans);

    return ans;
  }

  /** Compute NgModule scope afresh. */
  private computeNgModuleScope(type: NgModuleType<any>): NgModuleScope {
    const def = getNgModuleDef(type, true);
    const ans: NgModuleScope = {
      exported: {directives: new Set(), pipes: new Set()},
      compilation: {directives: new Set(), pipes: new Set()},
    };

    // Analyzing imports
    for (const imported of maybeUnwrapFn(def.imports)) {
      let moduleToProcess: NgModuleType|null = null;

      if (isNgModule(imported)) {
        moduleToProcess = imported;
      } else if (isModuleWithProviders(imported)) {
        moduleToProcess = (type as any).ngModule;
      } else if (isStandalone(imported)) {
        if (isDirective(imported) || isComponent(imported)) {
          ans.compilation.directives.add(imported);
        } else if (isPipe(imported)) {
          ans.compilation.pipes.add(imported);
        } else {
          // The standalone thing is neither a component nor a directive nor a pipe ... (what?) So
          // we short circuit here.
          ans.compilation.isPoisoned = true;
          break;
        }
      } else {
        // The import is neither a module nor a module-with-providers nor a standalone thing. This
        // is going to be an error. So we short circuit.
        ans.compilation.isPoisoned = true;
        break;
      }

      if (moduleToProcess) {
        const importedScope = this.getNgModuleScope(moduleToProcess);

        if (importedScope.exported.isPoisoned) {
          ans.compilation.isPoisoned = true;
          break;
        } else {
          // When this module imports another, the imported module's exported directives and pipes
          // are added to the compilation scope of this module.
          addSet(importedScope.exported.directives, ans.compilation.directives);
          addSet(importedScope.exported.pipes, ans.compilation.pipes);
        }
      }
    }

    // Analyzing declarations
    if (!ans.compilation.isPoisoned) {
      for (const decl of maybeUnwrapFn(def.declarations)) {
        // Cannot declare another NgModule or a standalone thing
        if (isNgModule(decl) || isStandalone(decl)) {
          ans.compilation.isPoisoned = true;
          break;
        }

        if (isPipe(decl)) {
          ans.compilation.pipes.add(decl);
        } else {
          // decl is either a directive or a component. The component may not yet have the ɵcmp due
          // to async compilation.
          ans.compilation.directives.add(decl);
        }
      }
    }

    // Analyzing exports
    if (!ans.compilation.isPoisoned || !ans.exported.isPoisoned) {
      for (const exported of maybeUnwrapFn(def.exports)) {
        if (isNgModule(exported)) {
          // When this module exports another, the exported module's exported directives and pipes
          // are added to both the compilation and exported scopes of this module.
          const exportedScope = this.getNgModuleScope(exported);

          // Short circuit since exportedScope.exported affects both the compilation and exported
          // scopes of this module.
          if (exportedScope.exported.isPoisoned) {
            ans.compilation.isPoisoned = true;
            ans.exported.isPoisoned = true;
            return ans;
          }

          if (!ans.compilation.isPoisoned) {
            addSet(exportedScope.exported.directives, ans.compilation.directives);
            addSet(exportedScope.exported.pipes, ans.compilation.pipes);
          }

          if (!ans.exported.isPoisoned) {
            addSet(exportedScope.exported.directives, ans.exported.directives);
            addSet(exportedScope.exported.pipes, ans.exported.pipes);
          }
        } else if (isPipe(exported)) {
          ans.exported.pipes.add(exported);
        } else {
          ans.exported.directives.add(exported);
        }
      }
    }

    return ans;
  }

  /** @override */
  getStandaloneComponentScope(
      type: ComponentType<any>,
      rawImports: (Type<any>|(() => Type<any>))[]): StandaloneComponentScope {
    if (this.standaloneComponentsScopeCache.has(type)) {
      return this.standaloneComponentsScopeCache.get(type)!;
    }

    const ans = this.computeStandaloneComponentScope(type, rawImports);
    this.standaloneComponentsScopeCache.set(type, ans);

    return ans;
  }

  private computeStandaloneComponentScope(
      type: ComponentType<any>,
      rawImports: (Type<any>|(() => Type<any>))[]): StandaloneComponentScope {
    const ans: StandaloneComponentScope = {
      compilation: {
        // Standalone components are always able to self-reference.
        directives: new Set([type]),
        pipes: new Set(),
      },
    };

    for (const rawImport of rawImports) {
      const imported = resolveForwardRef(rawImport) as Type<any>;

      try {
        verifyStandaloneImport(imported, type);
      } catch (e) {
        // Short-circuit if an import is not valid
        ans.compilation.isPoisoned = true;
        return ans;
      }

      if (isNgModule(imported)) {
        const importedScope = this.getNgModuleScope(imported);

        // Short-circuit if an imported NgModule has corrupted exported scope.
        if (importedScope.exported.isPoisoned) {
          ans.compilation.isPoisoned = true;
          return ans;
        }

        addSet(importedScope.exported.directives, ans.compilation.directives);
        addSet(importedScope.exported.pipes, ans.compilation.pipes);
      } else if (isPipe(imported)) {
        ans.compilation.pipes.add(imported);
      } else if (isDirective(imported) || isComponent(imported)) {
        ans.compilation.directives.add(imported);
      } else {
        // The imported thing is not module/pipe/directive/component, so we error and short-circuit
        // here
        ans.compilation.isPoisoned = true;
        return ans;
      }
    }

    return ans;
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
