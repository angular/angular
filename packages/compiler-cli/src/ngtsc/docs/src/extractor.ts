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
import {isNamedClassDeclaration} from '../../reflection';

import {extractClass} from './class_extractor';
import {extractConstant, isSyntheticAngularConstant} from './constant_extractor';
import {DocEntry} from './entities';


/**
 * Extracts all information from a source file that may be relevant for generating
 * public API documentation.
 */
export class DocsExtractor {
  constructor(private typeChecker: ts.TypeChecker, private metadataReader: MetadataReader) {}

  /**
   * Gets the set of all documentable entries from a source file.
   * @param sourceFile The file from which to extract documentable entries.
   */
  extractAll(sourceFile: ts.SourceFile): DocEntry[] {
    const entries: DocEntry[] = [];

    for (const statement of sourceFile.statements) {
      if (!this.isExported(statement)) continue;

      // Ignore anonymous classes.
      if (isNamedClassDeclaration(statement)) {
        entries.push(extractClass(statement, this.metadataReader, this.typeChecker));
      }

      if (ts.isFunctionDeclaration(statement)) {
        const functionExtractor = new FunctionExtractor(statement, this.typeChecker);
        entries.push(functionExtractor.extract());
      }

      if (ts.isVariableStatement(statement)) {
        statement.declarationList.forEachChild(declaration => {
          if (ts.isVariableDeclaration(declaration) && !isSyntheticAngularConstant(declaration)) {
            entries.push(extractConstant(declaration, this.typeChecker));
          }
        });
      }

      if (ts.isEnumDeclaration(statement)) {
        entries.push(extractEnum(statement, this.typeChecker));
      }
    }

    return entries;
  }

  /** Gets whether the given AST node has an `export` modifier. */
  private isExported(node: ts.Node): boolean {
    return ts.canHaveModifiers(node) &&
        (ts.getModifiers(node) ?? []).some(mod => mod.kind === ts.SyntaxKind.ExportKeyword);
  }
}
