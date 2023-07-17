/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {CssSelector, SchemaMetadata, SelectorMatcher} from '@angular/compiler';
import ts from 'typescript';

import {Reference} from '../../imports';
import {DirectiveMeta, flattenInheritedDirectiveMetadata, HostDirectivesResolver, MetadataReader, MetaKind} from '../../metadata';
import {ClassDeclaration} from '../../reflection';

import {ComponentScopeKind, ComponentScopeReader} from './api';

/**
 * The scope that is used for type-check code generation of a component template.
 */
export interface TypeCheckScope {
  /**
   * A `SelectorMatcher` instance that contains the flattened directive metadata of all directives
   * that are in the compilation scope of the declaring NgModule.
   */
  matcher: SelectorMatcher<DirectiveMeta[]>;

  /**
   * All of the directives available in the compilation scope of the declaring NgModule.
   */
  directives: DirectiveMeta[];

  /**
   * The pipes that are available in the compilation scope.
   */
  pipes: Map<string, Reference<ClassDeclaration<ts.ClassDeclaration>>>;

  /**
   * The schemas that are used in this scope.
   */
  schemas: SchemaMetadata[];

  /**
   * Whether the original compilation scope which produced this `TypeCheckScope` was itself poisoned
   * (contained semantic errors during its production).
   */
  isPoisoned: boolean;
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
      private scopeReader: ComponentScopeReader, private metaReader: MetadataReader,
      private hostDirectivesResolver: HostDirectivesResolver) {}

  /**
   * Computes the type-check scope information for the component declaration. If the NgModule
   * contains an error, then 'error' is returned. If the component is not declared in any NgModule,
   * an empty type-check scope is returned.
   */
  getTypeCheckScope(node: ClassDeclaration): TypeCheckScope {
    const matcher = new SelectorMatcher<DirectiveMeta[]>();
    const directives: DirectiveMeta[] = [];
    const pipes = new Map<string, Reference<ClassDeclaration<ts.ClassDeclaration>>>();

    const scope = this.scopeReader.getScopeForComponent(node);
    if (scope === null) {
      return {
        matcher,
        directives,
        pipes,
        schemas: [],
        isPoisoned: false,
      };
    }

    const cacheKey = scope.kind === ComponentScopeKind.NgModule ? scope.ngModule : scope.component;
    const dependencies = scope.kind === ComponentScopeKind.NgModule ?
        scope.compilation.dependencies :
        scope.dependencies;

    if (this.scopeCache.has(cacheKey)) {
      return this.scopeCache.get(cacheKey)!;
    }

    for (const meta of dependencies) {
      if (meta.kind === MetaKind.Directive && meta.selector !== null) {
        const extMeta = this.getTypeCheckDirectiveMetadata(meta.ref);
        if (extMeta === null) {
          continue;
        }
        matcher.addSelectables(
            CssSelector.parse(meta.selector),
            [...this.hostDirectivesResolver.resolve(extMeta), extMeta]);
        directives.push(extMeta);
      } else if (meta.kind === MetaKind.Pipe) {
        if (!ts.isClassDeclaration(meta.ref.node)) {
          throw new Error(`Unexpected non-class declaration ${
              ts.SyntaxKind[meta.ref.node.kind]} for pipe ${meta.ref.debugName}`);
        }
        pipes.set(meta.name, meta.ref as Reference<ClassDeclaration<ts.ClassDeclaration>>);
      }
    }

    const typeCheckScope: TypeCheckScope = {
      matcher,
      directives,
      pipes,
      schemas: scope.schemas,
      isPoisoned: scope.kind === ComponentScopeKind.NgModule ?
          scope.compilation.isPoisoned || scope.exported.isPoisoned :
          scope.isPoisoned,
    };
    this.scopeCache.set(cacheKey, typeCheckScope);
    return typeCheckScope;
  }

  getTypeCheckDirectiveMetadata(ref: Reference<ClassDeclaration>): DirectiveMeta|null {
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
}
