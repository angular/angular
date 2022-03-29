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
import {DirectiveMeta, flattenInheritedDirectiveMetadata, MetadataReader, MetaKind} from '../../metadata';
import {ClassDeclaration} from '../../reflection';

import {ComponentScopeReader} from './api';

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
  getTypeCheckScope(node: ClassDeclaration): TypeCheckScope {
    const matcher = new SelectorMatcher<DirectiveMeta>();
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

    if (this.scopeCache.has(scope.ngModule)) {
      return this.scopeCache.get(scope.ngModule)!;
    }

    for (const meta of scope.compilation.dependencies) {
      if (meta.kind === MetaKind.Directive && meta.selector !== null) {
        const extMeta = this.getTypeCheckDirectiveMetadata(meta.ref);
        matcher.addSelectables(CssSelector.parse(meta.selector), extMeta);
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
      isPoisoned: scope.compilation.isPoisoned || scope.exported.isPoisoned,
    };
    this.scopeCache.set(scope.ngModule, typeCheckScope);
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
