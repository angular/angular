/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {extractEnum} from '@angular/compiler-cli/src/ngtsc/docs/src/enum_extractor';
import {FunctionExtractor} from '@angular/compiler-cli/src/ngtsc/docs/src/function_extractor';
import ts from 'typescript';

import {MetadataReader} from '../../metadata';
import {isNamedClassDeclaration, TypeScriptReflectionHost} from '../../reflection';

import {extractClass, extractInterface} from './class_extractor';
import {extractConstant, isSyntheticAngularConstant} from './constant_extractor';
import {DocEntry} from './entities';


/**
 * Extracts all information from a source file that may be relevant for generating
 * public API documentation.
 */
export class DocsExtractor {
  constructor(private typeChecker: ts.TypeChecker, private metadataReader: MetadataReader) {}

  /**
   * Gets the set of all documentable entries from a source file, including
   * declarations that are re-exported from this file as an entry-point.
   *
   * @param sourceFile The file from which to extract documentable entries.
   */
  extractAll(sourceFile: ts.SourceFile): DocEntry[] {
    const entries: DocEntry[] = [];

    // Use the reflection host to get all the exported declarations from this
    // source file entry point.
    const reflector = new TypeScriptReflectionHost(this.typeChecker);
    const exportedDeclarationMap = reflector.getExportsOfModule(sourceFile);

    // Sort the declaration nodes into declaration position because their order is lost in
    // reading from the export map. This is primarily useful for testing and debugging.
    const exportedDeclarations =
        Array.from(exportedDeclarationMap?.entries() ?? [])
            .map(([exportName, declaration]) => [exportName, declaration.node] as const)
            .sort(([a, declarationA], [b, declarationB]) => declarationA.pos - declarationB.pos);

    for (const [exportName, node] of exportedDeclarations) {
      let entry: DocEntry|undefined = undefined;

      // Ignore anonymous classes.
      if (isNamedClassDeclaration(node)) {
        entry = extractClass(node, this.metadataReader, this.typeChecker);
      }

      if (ts.isInterfaceDeclaration(node)) {
        entry = extractInterface(node, this.typeChecker);
      }

      if (ts.isFunctionDeclaration(node)) {
        const functionExtractor = new FunctionExtractor(node, this.typeChecker);
        entry = functionExtractor.extract();
      }

      if (ts.isVariableDeclaration(node) && !isSyntheticAngularConstant(node)) {
        entry = extractConstant(node, this.typeChecker);
      }

      if (ts.isEnumDeclaration(node)) {
        entry = extractEnum(node, this.typeChecker);
      }

      // The exported name of an API may be different from its declaration name, so
      // use the declaration name.
      if (entry) {
        entry.name = exportName;
        entries.push(entry);
      }
    }

    return entries;
  }
}
