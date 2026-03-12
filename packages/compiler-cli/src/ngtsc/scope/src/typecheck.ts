/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {
  CssSelector,
  DirectiveMatcher,
  SchemaMetadata,
  SelectorlessMatcher,
  SelectorMatcher,
} from '@angular/compiler';

import {Reference} from '../../imports';
import {
  DirectiveMeta,
  flattenInheritedDirectiveMetadata,
  HostDirectivesResolver,
  MetadataReader,
  MetaKind,
  NgModuleMeta,
  PipeMeta,
} from '../../metadata';
import {ClassDeclaration} from '../../reflection';
import {ComponentScopeKind, ComponentScopeReader, SelectorlessScope} from './api';

/**
 * The scope that is used for type-check code generation of a component template.
 */
export interface TypeCheckScope {
  /**
   * A `DirectiveMatcher` instance that contains the flattened directive metadata of all directives
   * that are in the compilation scope of the declaring NgModule.
   */
  matcher: DirectiveMatcher<DirectiveMeta> | null;

  /**
   * All of the directives available in the compilation scope of the declaring NgModule.
   */
  directives: DirectiveMeta[];

  /**
   * The pipes that are available in the compilation scope.
   */
  pipes: Map<string, PipeMeta>;

  /**
   * The schemas that are used in this scope.
   */
  schemas: SchemaMetadata[];

  /**
   * Whether the original compilation scope which produced this `TypeCheckScope` was itself poisoned
   * (contained semantic errors during its production).
   */
  isPoisoned: boolean;

  /**
   * Directives that have been set on the host of the scope.
   */
  directivesOnHost: DirectiveMeta[] | null;
}

/**
 * Computes scope information to be used in template type checking.
 */
export class TypeCheckScopeRegistry {
  /**
   * Cache of flattened directive metadata. Because flattened metadata is scope-invariant it's
   * cached individually, such that all scopes refer to the same flattened metadata.
   */
  private flattenedDirectiveMetaCache = new Map<ClassDeclaration, DirectiveMeta>();

  /**
   * Cache of the computed type check scope per NgModule declaration.
   */
  private scopeCache = new Map<ClassDeclaration, TypeCheckScope>();

  constructor(
    private scopeReader: ComponentScopeReader,
    private metaReader: MetadataReader,
    private hostDirectivesResolver: HostDirectivesResolver,
  ) {}

  /**
   * Computes the type-check scope information for the component declaration. If the NgModule
   * contains an error, then 'error' is returned. If the component is not declared in any NgModule,
   * an empty type-check scope is returned.
   */
  getTypeCheckScope(ref: Reference<ClassDeclaration>): TypeCheckScope {
    const directives: DirectiveMeta[] = [];
    const pipes = new Map<string, PipeMeta>();
    const scope = this.scopeReader.getScopeForComponent(ref.node);
    const hostMeta = this.getTypeCheckDirectiveMetadata(ref);
    const directivesOnHost = hostMeta === null ? null : this.combineWithHostDirectives(hostMeta);

    if (scope === null) {
      return {
        matcher: null,
        directives,
        pipes,
        schemas: [],
        isPoisoned: false,
        directivesOnHost,
      };
    }

    const isNgModuleScope = scope.kind === ComponentScopeKind.NgModule;
    const isSelectorlessScope = scope.kind === ComponentScopeKind.Selectorless;
    const cacheKey = isNgModuleScope ? scope.ngModule : scope.component;

    if (this.scopeCache.has(cacheKey)) {
      return this.scopeCache.get(cacheKey)!;
    }

    let matcher: DirectiveMatcher<DirectiveMeta>;

    if (isSelectorlessScope) {
      matcher = this.getSelectorlessMatcher(scope);

      for (const [name, dep] of scope.dependencies) {
        if (dep.kind === MetaKind.Directive) {
          directives.push(dep);
        } else {
          // Pipes should be available under the imported name in selectorless.
          pipes.set(name, dep);
        }
      }
    } else {
      const dependencies = isNgModuleScope ? scope.compilation.dependencies : scope.dependencies;
      let allDependencies = dependencies;

      if (
        !isNgModuleScope &&
        Array.isArray(scope.deferredDependencies) &&
        scope.deferredDependencies.length > 0
      ) {
        allDependencies = [...allDependencies, ...scope.deferredDependencies];
      }

      matcher = this.getSelectorMatcher(allDependencies);

      for (const dep of allDependencies) {
        if (dep.kind === MetaKind.Directive) {
          directives.push(dep);
        } else if (dep.kind === MetaKind.Pipe && dep.name !== null) {
          pipes.set(dep.name, dep);
        }
      }
    }

    const typeCheckScope: TypeCheckScope = {
      matcher,
      directives,
      pipes,
      schemas: scope.schemas,
      directivesOnHost,
      isPoisoned:
        scope.kind === ComponentScopeKind.NgModule
          ? scope.compilation.isPoisoned || scope.exported.isPoisoned
          : scope.isPoisoned,
    };

    this.scopeCache.set(cacheKey, typeCheckScope);
    return typeCheckScope;
  }

  getTypeCheckDirectiveMetadata(ref: Reference<ClassDeclaration>): DirectiveMeta | null {
    const clazz = ref.node;
    if (this.flattenedDirectiveMetaCache.has(clazz)) {
      return this.flattenedDirectiveMetaCache.get(clazz)!;
    }

    const meta = flattenInheritedDirectiveMetadata(this.metaReader, ref);
    if (meta === null) {
      return null;
    }
    this.flattenedDirectiveMetaCache.set(clazz, meta);
    return meta;
  }

  private applyExplicitlyDeferredFlag<T extends DirectiveMeta | PipeMeta>(
    meta: T,
    isExplicitlyDeferred: boolean,
  ): T {
    return isExplicitlyDeferred === true ? {...meta, isExplicitlyDeferred} : meta;
  }

  private getSelectorMatcher(
    allDependencies: (DirectiveMeta | PipeMeta | NgModuleMeta)[],
  ): SelectorMatcher<DirectiveMeta[]> {
    const matcher = new SelectorMatcher<DirectiveMeta[]>();

    for (const meta of allDependencies) {
      if (meta.kind === MetaKind.Directive && meta.selector !== null) {
        const extMeta = this.getTypeCheckDirectiveMetadata(meta.ref);
        if (extMeta === null) {
          continue;
        }

        // Carry over the `isExplicitlyDeferred` flag from the dependency info.
        const directiveMeta = this.applyExplicitlyDeferredFlag(extMeta, meta.isExplicitlyDeferred);
        matcher.addSelectables(
          CssSelector.parse(meta.selector),
          this.combineWithHostDirectives(directiveMeta),
        );
      }
    }

    return matcher;
  }

  private getSelectorlessMatcher(scope: SelectorlessScope): SelectorlessMatcher<DirectiveMeta> {
    const registry = new Map<string, DirectiveMeta[]>();

    for (const [name, dep] of scope.dependencies) {
      const extMeta =
        dep.kind === MetaKind.Directive ? this.getTypeCheckDirectiveMetadata(dep.ref) : null;
      if (extMeta !== null) {
        registry.set(name, this.combineWithHostDirectives(extMeta));
      }
    }

    return new SelectorlessMatcher(registry);
  }

  private combineWithHostDirectives(meta: DirectiveMeta): DirectiveMeta[] {
    return [...this.hostDirectivesResolver.resolve(meta), meta];
  }
}
