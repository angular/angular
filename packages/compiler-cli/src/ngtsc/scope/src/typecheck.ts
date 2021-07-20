/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {CssSelector, SchemaMetadata, SelectorMatcher} from '@angular/compiler';
import * as ts from 'typescript';

import {Reference} from '../../imports';
import {DirectiveMeta, flattenInheritedDirectiveMetadata, MetadataReader} from '../../metadata';
import {ClassDeclaration} from '../../reflection';
import {ScopeData} from './api';

import {ComponentScopeReader} from './component_scope';

/**
 * The scope that is used for type-check code generation of a component template.
 */
export interface TypeCheckScope {
  /**
   * A `SelectorMatcher` instance that contains the flattened directive metadata of all directives
   * that are in the compilation scope of the declaring NgModule.
   */
  matcher: SelectorMatcher<DirectiveMeta>;

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

  constructor(private scopeReader: ComponentScopeReader, private metaReader: MetadataReader) {}

  /**
   * Computes the type-check scope information for the component declaration. If the NgModule
   * contains an error, then 'error' is returned. If the component is not declared in any NgModule,
   * an empty type-check scope is returned.
   */
  getTypeCheckScope(node: ClassDeclaration, deps: Reference<ClassDeclaration>[]|null):
      TypeCheckScope {
    const matcher = new SelectorMatcher<DirectiveMeta>();
    const directives: DirectiveMeta[] = [];
    const pipes = new Map<string, Reference<ClassDeclaration<ts.ClassDeclaration>>>();

    let compilationScope: ScopeData|null = null;

    let cacheKey: ClassDeclaration|null = null;
    let isPoisoned: boolean = false;
    let schemas: SchemaMetadata[] = [];

    if (deps === null) {
      const scope = this.scopeReader.getScopeForComponent(node);
      if (scope !== null) {
        compilationScope = scope.compilation;
        cacheKey = scope.ngModule;
        isPoisoned = scope.compilation.isPoisoned || scope.exported.isPoisoned;
        schemas = scope.schemas;
      }
    } else {
      compilationScope = this.scopeReader.getSelfContainedScope(deps);
      if (compilationScope !== null) {
        cacheKey = node;
        isPoisoned = compilationScope.isPoisoned;
      }
    }

    if (compilationScope === null || cacheKey === null) {
      return {
        matcher,
        directives,
        pipes,
        schemas: [],
        isPoisoned: false,
      };
    }

    if (this.scopeCache.has(cacheKey)) {
      return this.scopeCache.get(cacheKey)!;
    }

    for (const meta of compilationScope.directives) {
      if (meta.selector !== null) {
        const extMeta = this.getTypeCheckDirectiveMetadata(meta.ref);
        matcher.addSelectables(CssSelector.parse(meta.selector), extMeta);
        directives.push(extMeta);
      }
    }

    for (const {name, ref} of compilationScope.pipes) {
      if (!ts.isClassDeclaration(ref.node)) {
        throw new Error(`Unexpected non-class declaration ${
            ts.SyntaxKind[ref.node.kind]} for pipe ${ref.debugName}`);
      }
      pipes.set(name, ref as Reference<ClassDeclaration<ts.ClassDeclaration>>);
    }

    const typeCheckScope: TypeCheckScope = {
      matcher,
      directives,
      pipes,
      schemas,
      isPoisoned,
    };
    this.scopeCache.set(cacheKey, typeCheckScope);
    return typeCheckScope;
  }

  getTypeCheckDirectiveMetadata(ref: Reference<ClassDeclaration>): DirectiveMeta {
    const clazz = ref.node;
    if (this.flattenedDirectiveMetaCache.has(clazz)) {
      return this.flattenedDirectiveMetaCache.get(clazz)!;
    }

    const meta = flattenInheritedDirectiveMetadata(this.metaReader, ref);
    this.flattenedDirectiveMetaCache.set(clazz, meta);
    return meta;
  }
}
