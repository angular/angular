/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as ts from 'typescript';

import {AliasGenerator, Reference} from '../../imports';
import {ClassDeclaration, ReflectionHost} from '../../reflection';

import {ExportScope, ScopeDirective, ScopePipe} from './api';
import {extractDirectiveGuards, extractReferencesFromType, readStringArrayType, readStringMapType, readStringType} from './util';

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

  constructor(
      private checker: ts.TypeChecker, private reflector: ReflectionHost,
      private aliasGenerator: AliasGenerator|null) {}

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
      throw new Error(
          `Debug error: DtsModuleScopeResolver.read(${ref.debugName} from ${sourceFile.fileName}), but not a .d.ts file`);
    }

    if (this.cache.has(clazz)) {
      return this.cache.get(clazz) !;
    }

    // Build up the export scope - those directives and pipes made visible by this module.
    const directives: ScopeDirective[] = [];
    const pipes: ScopePipe[] = [];

    const meta = this.readModuleMetadataFromClass(ref);
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
      const directive = this.readScopeDirectiveFromClassWithDef(exportRef);
      if (directive !== null) {
        if (!declarations.has(exportRef.node)) {
          directives.push(this.maybeAlias(directive, sourceFile));
        } else {
          directives.push(directive);
        }
        continue;
      }

      // Attempt to process the export as a pipe.
      const pipe = this.readScopePipeFromClassWithDef(exportRef);
      if (pipe !== null) {
        if (!declarations.has(exportRef.node)) {
          pipes.push(this.maybeAlias(pipe, sourceFile));
        } else {
          pipes.push(pipe);
        }
        continue;
      }

      // Attempt to process the export as a module.
      const exportScope = this.resolve(exportRef);
      if (exportScope !== null) {
        // It is a module. Add exported directives and pipes to the current scope. This might
        // involve rewriting the `Reference`s to those types to have an alias expression if one is
        // required.
        if (this.aliasGenerator === null) {
          // Fast path when aliases aren't required.
          directives.push(...exportScope.exported.directives);
          pipes.push(...exportScope.exported.pipes);
        } else {
          // It's necessary to rewrite the `Reference`s to add alias expressions. This way, imports
          // generated to these directives and pipes will use a shallow import to `sourceFile`
          // instead of a deep import directly to the directive or pipe class.
          //
          // One important check here is whether the directive/pipe is declared in the same
          // source file as the re-exporting NgModule. This can happen if both a directive, its
          // NgModule, and the re-exporting NgModule are all in the same file. In this case,
          // no import alias is needed as it would go to the same file anyway.
          for (const directive of exportScope.exported.directives) {
            directives.push(this.maybeAlias(directive, sourceFile));
          }
          for (const pipe of exportScope.exported.pipes) {
            pipes.push(this.maybeAlias(pipe, sourceFile));
          }
        }
      }
      continue;

      // The export was not a directive, a pipe, or a module. This is an error.
      // TODO(alxhub): produce a ts.Diagnostic
      throw new Error(`Exported value ${exportRef.debugName} was not a directive, pipe, or module`);
    }

    return {
      exported: {directives, pipes},
    };
  }

  /**
   * Read the metadata from a class that has already been compiled somehow (either it's in a .d.ts
   * file, or in a .ts file with a handwritten definition).
   *
   * @param ref `Reference` to the class of interest, with the context of how it was obtained.
   */
  private readModuleMetadataFromClass(ref: Reference<ClassDeclaration>): RawDependencyMetadata
      |null {
    const clazz = ref.node;
    const resolutionContext = clazz.getSourceFile().fileName;
    // This operation is explicitly not memoized, as it depends on `ref.ownedByModuleGuess`.
    // TODO(alxhub): investigate caching of .d.ts module metadata.
    const ngModuleDef = this.reflector.getMembersOfClass(clazz).find(
        member => member.name === 'ngModuleDef' && member.isStatic);
    if (ngModuleDef === undefined) {
      return null;
    } else if (
        // Validate that the shape of the ngModuleDef type is correct.
        ngModuleDef.type === null || !ts.isTypeReferenceNode(ngModuleDef.type) ||
        ngModuleDef.type.typeArguments === undefined ||
        ngModuleDef.type.typeArguments.length !== 4) {
      return null;
    }

    // Read the ModuleData out of the type arguments.
    const [_, declarationMetadata, importMetadata, exportMetadata] = ngModuleDef.type.typeArguments;
    return {
      declarations: extractReferencesFromType(
          this.checker, declarationMetadata, ref.ownedByModuleGuess, resolutionContext),
      exports: extractReferencesFromType(
          this.checker, exportMetadata, ref.ownedByModuleGuess, resolutionContext),
      imports: extractReferencesFromType(
          this.checker, importMetadata, ref.ownedByModuleGuess, resolutionContext),
    };
  }

  /**
   * Read directive (or component) metadata from a referenced class in a .d.ts file.
   */
  private readScopeDirectiveFromClassWithDef(ref: Reference<ClassDeclaration>): ScopeDirective
      |null {
    const clazz = ref.node;
    const def = this.reflector.getMembersOfClass(clazz).find(
        field =>
            field.isStatic && (field.name === 'ngComponentDef' || field.name === 'ngDirectiveDef'));
    if (def === undefined) {
      // No definition could be found.
      return null;
    } else if (
        def.type === null || !ts.isTypeReferenceNode(def.type) ||
        def.type.typeArguments === undefined || def.type.typeArguments.length < 2) {
      // The type metadata was the wrong shape.
      return null;
    }
    const selector = readStringType(def.type.typeArguments[1]);
    if (selector === null) {
      return null;
    }

    return {
      ref,
      name: clazz.name.text,
      isComponent: def.name === 'ngComponentDef', selector,
      exportAs: readStringArrayType(def.type.typeArguments[2]),
      inputs: readStringMapType(def.type.typeArguments[3]),
      outputs: readStringMapType(def.type.typeArguments[4]),
      queries: readStringArrayType(def.type.typeArguments[5]),
      ...extractDirectiveGuards(clazz, this.reflector),
    };
  }

  /**
   * Read pipe metadata from a referenced class in a .d.ts file.
   */
  private readScopePipeFromClassWithDef(ref: Reference<ClassDeclaration>): ScopePipe|null {
    const def = this.reflector.getMembersOfClass(ref.node).find(
        field => field.isStatic && field.name === 'ngPipeDef');
    if (def === undefined) {
      // No definition could be found.
      return null;
    } else if (
        def.type === null || !ts.isTypeReferenceNode(def.type) ||
        def.type.typeArguments === undefined || def.type.typeArguments.length < 2) {
      // The type metadata was the wrong shape.
      return null;
    }
    const type = def.type.typeArguments[1];
    if (!ts.isLiteralTypeNode(type) || !ts.isStringLiteral(type.literal)) {
      // The type metadata was the wrong type.
      return null;
    }
    const name = type.literal.text;
    return {ref, name};
  }

  private maybeAlias<T extends ScopeDirective|ScopePipe>(
      dirOrPipe: T, maybeAliasFrom: ts.SourceFile): T {
    if (this.aliasGenerator === null) {
      return dirOrPipe;
    }
    const ref = dirOrPipe.ref;
    if (ref.node.getSourceFile() !== maybeAliasFrom) {
      return {
        ...dirOrPipe,
        ref: ref.cloneWithAlias(this.aliasGenerator.aliasTo(ref.node, maybeAliasFrom)),
      };
    } else {
      return dirOrPipe;
    }
  }
}

/**
 * Raw metadata read from the .d.ts info of an ngModuleDef field on a compiled NgModule class.
 */
interface RawDependencyMetadata {
  declarations: Reference<ClassDeclaration>[];
  imports: Reference<ClassDeclaration>[];
  exports: Reference<ClassDeclaration>[];
}
