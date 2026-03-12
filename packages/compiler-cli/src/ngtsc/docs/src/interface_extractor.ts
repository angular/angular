/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import ts from 'typescript';

import {ClassDeclaration} from '../../reflection';

import {EntryType, InterfaceEntry} from './entities';
import {extractJsDocDescription, extractJsDocTags, extractRawJsDoc} from './jsdoc_extractor';
import {PropertiesExtractor} from './properties_extractor';

// For the purpose of extraction, we can largely treat properties and accessors the same.

/** Type representing either a class declaration ro an interface declaration. */
type ClassDeclarationLike = ts.ClassDeclaration | ts.InterfaceDeclaration;

/** Extractor to pull info for API reference documentation for a TypeScript class or interface. */
class InterfaceExtractor extends PropertiesExtractor {
  constructor(declaration: ClassDeclaration & ClassDeclarationLike, typeChecker: ts.TypeChecker) {
    super(declaration, typeChecker);
  }

  /** Extract docs info specific to classes. */
  override extract(): InterfaceEntry {
    return {
      name: this.declaration.name.text,
      entryType: EntryType.Interface,
      ...super.extract(),
      description: extractJsDocDescription(this.declaration),
      jsdocTags: extractJsDocTags(this.declaration),
      rawComment: extractRawJsDoc(this.declaration),
      extends: this.extractInheritance(this.declaration),
      implements: this.extractInterfaceConformance(this.declaration),
    };
  }

  private extractInheritance(declaration: ClassDeclaration & ClassDeclarationLike): string[] {
    if (!declaration.heritageClauses) {
      return [];
    }

    for (const clause of declaration.heritageClauses) {
      if (clause.token === ts.SyntaxKind.ExtendsKeyword) {
        // We are assuming a single class can only extend one class.
        const types = clause.types;
        if (types.length > 0) {
          return types.map((t) => t.getText());
        }
      }
    }

    return [];
  }
}

/** Extracts documentation info for an interface. */
export function extractInterface(
  declaration: ts.InterfaceDeclaration,
  typeChecker: ts.TypeChecker,
): InterfaceEntry {
  const extractor = new InterfaceExtractor(declaration, typeChecker);
  return extractor.extract();
}
