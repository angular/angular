/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import ts from 'typescript';

import {AliasingHost, Reference} from '../../imports';
import {DirectiveMeta, MetadataReader, PipeMeta} from '../../metadata';
import {ClassDeclaration} from '../../reflection';

import {ExportScope} from './api';

export interface DtsModuleScopeResolver {
  resolve(ref: Reference<ClassDeclaration>): ExportScope|null;
}

/**
 * Reads Angular metadata from classes declared in .d.ts files and computes an `ExportScope`.
 *
 * Given an NgModule declared in a .d.ts file, this resolver can produce a transitive `ExportScope`
 * of all of the directives/pipes it exports. It does this by reading metadata off of Ivy static
 * fields on directives, components, pipes, and NgModules.
 */
export class MetadataDtsModuleScopeResolver implements DtsModuleScopeResolver {
  /**
   * Cache which holds fully resolved scopes for NgModule classes from .d.ts files.
   */
  private cache = new Map<ClassDeclaration, ExportScope|null>();

  /**
   * @param dtsMetaReader a `MetadataReader` which can read metadata from `.d.ts` files.
   */
  constructor(private dtsMetaReader: MetadataReader, private aliasingHost: AliasingHost|null) {}

  /**
   * Resolve a `Reference`'d NgModule from a .d.ts file and produce a transitive `ExportScope`
   * listing the directives and pipes which that NgModule exports to others.
   *
   * This operation relies on a `Reference` instead of a direct TypeScrpt node as the `Reference`s
   * produced depend on how the original NgModule was imported.
   */
  resolve(ref: Reference<ClassDeclaration>): ExportScope|null {
    const clazz = ref.node;
    const sourceFile = clazz.getSourceFile();
    if (!sourceFile.isDeclarationFile) {
      throw new Error(`Debug error: DtsModuleScopeResolver.read(${ref.debugName} from ${
          sourceFile.fileName}), but not a .d.ts file`);
    }

    if (this.cache.has(clazz)) {
      return this.cache.get(clazz)!;
    }

    // Build up the export scope - those directives and pipes made visible by this module.
    const dependencies: Array<DirectiveMeta|PipeMeta> = [];

    const meta = this.dtsMetaReader.getNgModuleMetadata(ref);
    if (meta === null) {
      this.cache.set(clazz, null);
      return null;
    }

    const declarations = new Set<ClassDeclaration>();
    for (const declRef of meta.declarations) {
      declarations.add(declRef.node);
    }

    // Only the 'exports' field of the NgModule's metadata is important. Imports and declarations
    // don't affect the export scope.
    for (const exportRef of meta.exports) {
      // Attempt to process the export as a directive.
      const directive = this.dtsMetaReader.getDirectiveMetadata(exportRef);
      if (directive !== null) {
        const isReExport = !declarations.has(exportRef.node);
        dependencies.push(this.maybeAlias(directive, sourceFile, isReExport));
        continue;
      }

      // Attempt to process the export as a pipe.
      const pipe = this.dtsMetaReader.getPipeMetadata(exportRef);
      if (pipe !== null) {
        const isReExport = !declarations.has(exportRef.node);
        dependencies.push(this.maybeAlias(pipe, sourceFile, isReExport));
        continue;
      }

      // Attempt to process the export as a module.
      const exportScope = this.resolve(exportRef);
      if (exportScope !== null) {
        // It is a module. Add exported directives and pipes to the current scope. This might
        // involve rewriting the `Reference`s to those types to have an alias expression if one is
        // required.
        if (this.aliasingHost === null) {
          // Fast path when aliases aren't required.
          dependencies.push(...exportScope.exported.dependencies);
        } else {
          // It's necessary to rewrite the `Reference`s to add alias expressions. This way, imports
          // generated to these directives and pipes will use a shallow import to `sourceFile`
          // instead of a deep import directly to the directive or pipe class.
          //
          // One important check here is whether the directive/pipe is declared in the same
          // source file as the re-exporting NgModule. This can happen if both a directive, its
          // NgModule, and the re-exporting NgModule are all in the same file. In this case,
          // no import alias is needed as it would go to the same file anyway.
          for (const dep of exportScope.exported.dependencies) {
            dependencies.push(this.maybeAlias(dep, sourceFile, /* isReExport */ true));
          }
        }
      }
      continue;

      // The export was not a directive, a pipe, or a module. This is an error.
      // TODO(alxhub): produce a ts.Diagnostic
    }

    const exportScope: ExportScope = {
      exported: {
        dependencies,
        isPoisoned: false,
      },
    };
    this.cache.set(clazz, exportScope);
    return exportScope;
  }

  private maybeAlias<T extends DirectiveMeta|PipeMeta>(
      dirOrPipe: T, maybeAliasFrom: ts.SourceFile, isReExport: boolean): T {
    const ref = dirOrPipe.ref;
    if (this.aliasingHost === null || ref.node.getSourceFile() === maybeAliasFrom) {
      return dirOrPipe;
    }

    const alias = this.aliasingHost.getAliasIn(ref.node, maybeAliasFrom, isReExport);
    if (alias === null) {
      return dirOrPipe;
    }

    // TypeScript incorrectly narrows the type here:
    // https://github.com/microsoft/TypeScript/issues/43966.
    // TODO: Remove/Update once https://github.com/microsoft/TypeScript/issues/43966 is resolved.
    return {
      ...dirOrPipe,
      ref: ref.cloneWithAlias(alias),
    } as T;
  }
}
