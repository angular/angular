/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as ts from 'typescript';

import {Reference} from '../../imports';
import {ClassDeclaration, ReflectionHost, isNamedClassDeclaration} from '../../reflection';

import {DirectiveMeta, MetadataReader, NgModuleMeta, PipeMeta} from './api';
import {extractDirectiveGuards, extractReferencesFromType, readStringArrayType, readStringMapType, readStringType} from './util';

/**
 * A `MetadataReader` that can read metadata from `.d.ts` files, which have static Ivy properties
 * from an upstream compilation already.
 */
export class DtsMetadataReader implements MetadataReader {
  constructor(private checker: ts.TypeChecker, private reflector: ReflectionHost) {}

  /**
   * Read the metadata from a class that has already been compiled somehow (either it's in a .d.ts
   * file, or in a .ts file with a handwritten definition).
   *
   * @param ref `Reference` to the class of interest, with the context of how it was obtained.
   */
  getNgModuleMetadata(ref: Reference<ClassDeclaration>): NgModuleMeta|null {
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
      ref,
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
  getDirectiveMetadata(ref: Reference<ClassDeclaration>): DirectiveMeta|null {
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
      baseClass: readBaseClass(clazz, this.checker, this.reflector),
    };
  }

  /**
   * Read pipe metadata from a referenced class in a .d.ts file.
   */
  getPipeMetadata(ref: Reference<ClassDeclaration>): PipeMeta|null {
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
}

function readBaseClass(clazz: ClassDeclaration, checker: ts.TypeChecker, reflector: ReflectionHost):
    Reference<ClassDeclaration>|'dynamic'|null {
  if (!isNamedClassDeclaration(clazz)) {
    // Technically this is an error in a .d.ts file, but for the purposes of finding the base class
    // it's ignored.
    return reflector.hasBaseClass(clazz) ? 'dynamic' : null;
  }

  if (clazz.heritageClauses !== undefined) {
    for (const clause of clazz.heritageClauses) {
      if (clause.token === ts.SyntaxKind.ExtendsKeyword) {
        const baseExpr = clause.types[0].expression;
        let symbol = checker.getSymbolAtLocation(baseExpr);
        if (symbol === undefined) {
          return 'dynamic';
        } else if (symbol.flags & ts.SymbolFlags.Alias) {
          symbol = checker.getAliasedSymbol(symbol);
        }
        if (symbol.valueDeclaration !== undefined &&
            isNamedClassDeclaration(symbol.valueDeclaration)) {
          return new Reference(symbol.valueDeclaration);
        } else {
          return 'dynamic';
        }
      }
    }
  }
  return null;
}
