/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {resolveForwardRef} from '../../di';
import {RuntimeError, RuntimeErrorCode} from '../../errors';
import {Type} from '../../interface/type';
import {NgModuleType} from '../../metadata/ng_module_def';
import {flatten} from '../../util/array_utils';
import type {
  ComponentType,
  NgModuleScopeInfoFromDecorator,
  RawScopeInfoFromDecorator,
} from '../interfaces/definition';
import {isComponent, isDirective, isNgModule, isPipe, verifyStandaloneImport} from '../jit/util';
import {getComponentDef, getNgModuleDef, getNgModuleDefOrThrow, isStandalone} from '../def_getters';
import {maybeUnwrapFn} from '../util/misc_utils';

import {
  ComponentDependencies,
  DepsTrackerApi,
  NgModuleScope,
  StandaloneComponentScope,
} from './api';

/**
 * An implementation of DepsTrackerApi which will be used for JIT and local compilation.
 */
class DepsTracker implements DepsTrackerApi {
  private ownerNgModule = new Map<ComponentType<any>, NgModuleType<any>>();
  private ngModulesWithSomeUnresolvedDecls = new Set<NgModuleType<any>>();
  private ngModulesScopeCache = new Map<NgModuleType<any>, NgModuleScope>();
  private standaloneComponentsScopeCache = new Map<ComponentType<any>, StandaloneComponentScope>();

  /**
   * Attempts to resolve ng module's forward ref declarations as much as possible and add them to
   * the `ownerNgModule` map. This method normally should be called after the initial parsing when
   * all the forward refs are resolved (e.g., when trying to render a component)
   */
  private resolveNgModulesDecls(): void {
    if (this.ngModulesWithSomeUnresolvedDecls.size === 0) {
      return;
    }

    for (const moduleType of this.ngModulesWithSomeUnresolvedDecls) {
      const def = getNgModuleDef(moduleType);
      if (def?.declarations) {
        for (const decl of maybeUnwrapFn(def.declarations)) {
          if (isComponent(decl)) {
            this.ownerNgModule.set(decl, moduleType);
          }
        }
      }
    }

    this.ngModulesWithSomeUnresolvedDecls.clear();
  }

  /** @override */
  getComponentDependencies(
    type: ComponentType<any>,
    rawImports?: RawScopeInfoFromDecorator[],
  ): ComponentDependencies {
    this.resolveNgModulesDecls();

    const def = getComponentDef(type);
    if (def === null) {
      throw new Error(
        `Attempting to get component dependencies for a type that is not a component: ${type}`,
      );
    }

    if (def.standalone) {
      const scope = this.getStandaloneComponentScope(type, rawImports);

      if (scope.compilation.isPoisoned) {
        return {dependencies: []};
      }

      return {
        dependencies: [
          ...scope.compilation.directives,
          ...scope.compilation.pipes,
          ...scope.compilation.ngModules,
        ],
      };
    } else {
      if (!this.ownerNgModule.has(type)) {
        // This component is orphan! No need to handle the error since the component rendering
        // pipeline (e.g., view_container_ref) will check for this error based on configs.
        return {dependencies: []};
      }

      const scope = this.getNgModuleScope(this.ownerNgModule.get(type)!);

      if (scope.compilation.isPoisoned) {
        return {dependencies: []};
      }

      return {
        dependencies: [...scope.compilation.directives, ...scope.compilation.pipes],
      };
    }
  }

  /**
   * @override
   * This implementation does not make use of param scopeInfo since it assumes the scope info is
   * already added to the type itself through methods like {@link ɵɵsetNgModuleScope}
   */
  registerNgModule(type: Type<any>, scopeInfo: NgModuleScopeInfoFromDecorator): void {
    if (!isNgModule(type)) {
      throw new Error(`Attempting to register a Type which is not NgModule as NgModule: ${type}`);
    }

    // Lazily process the NgModules later when needed.
    this.ngModulesWithSomeUnresolvedDecls.add(type);
  }

  /** @override */
  clearScopeCacheFor(type: Type<any>): void {
    this.ngModulesScopeCache.delete(type as NgModuleType);
    this.standaloneComponentsScopeCache.delete(type as ComponentType<any>);
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
    const def = getNgModuleDefOrThrow(type);
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
            'The standalone imported type is neither a component nor a directive nor a pipe',
          );
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

        // Some test toolings which run in JIT mode depend on this behavior that the exported scope
        // should also be present in the compilation scope, even though AoT does not support this
        // and it is also in odds with NgModule metadata definitions. Without this some tests in
        // Google will fail.
        addSet(exportedScope.exported.directives, scope.compilation.directives);
        addSet(exportedScope.exported.pipes, scope.compilation.pipes);
      } else if (isPipe(exported)) {
        scope.exported.pipes.add(exported);
      } else {
        scope.exported.directives.add(exported);
      }
    }

    return scope;
  }

  /** @override */
  getStandaloneComponentScope(
    type: ComponentType<any>,
    rawImports?: RawScopeInfoFromDecorator[],
  ): StandaloneComponentScope {
    if (this.standaloneComponentsScopeCache.has(type)) {
      return this.standaloneComponentsScopeCache.get(type)!;
    }

    const ans = this.computeStandaloneComponentScope(type, rawImports);
    this.standaloneComponentsScopeCache.set(type, ans);

    return ans;
  }

  private computeStandaloneComponentScope(
    type: ComponentType<any>,
    rawImports?: RawScopeInfoFromDecorator[],
  ): StandaloneComponentScope {
    const ans: StandaloneComponentScope = {
      compilation: {
        // Standalone components are always able to self-reference.
        directives: new Set([type]),
        pipes: new Set(),
        ngModules: new Set(),
      },
    };

    for (const rawImport of flatten(rawImports ?? [])) {
      const imported = resolveForwardRef(rawImport) as Type<any>;

      try {
        verifyStandaloneImport(imported, type);
      } catch (e) {
        // Short-circuit if an import is not valid
        ans.compilation.isPoisoned = true;
        return ans;
      }

      if (isNgModule(imported)) {
        ans.compilation.ngModules.add(imported);
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

  /** @override */
  isOrphanComponent(cmp: Type<any>): boolean {
    const def = getComponentDef(cmp);

    if (!def || def.standalone) {
      return false;
    }

    this.resolveNgModulesDecls();

    return !this.ownerNgModule.has(cmp as ComponentType<any>);
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
