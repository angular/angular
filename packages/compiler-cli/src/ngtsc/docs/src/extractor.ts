/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import ts from 'typescript';

import {MetadataReader} from '../../metadata';

import {DocEntry} from './entities';


/**
 * Extracts all information from a source file that may be relevant for generating
 * public API documentation.
 */
export class DocsExtractor {
  constructor(private checker: ts.TypeChecker, private reader: MetadataReader) {}

  /**
   * Gets the set of all documentable entries from a source file.
   * @param sourceFile The file from which to extract documentable entries.
   */
  extract(sourceFile: ts.SourceFile): DocEntry[] {
    let entries: DocEntry[] = [];

    for (const statement of sourceFile.statements) {
      // TODO(jelbourn): get all of rest of the docs
      if (ts.isClassDeclaration(statement)) {
        // Assume that anonymous classes should not be part of public documentation.
        if (!statement.name) continue;

        entries = entries.concat(this.extractClassDocs(statement));
      }
    }

    return entries;
  }

  /** Extract docs info specific to classes. */
  private extractClassDocs(statement: ts.ClassDeclaration): DocEntry {
    // TODO(jelbourn): get all of the rest of the docs
    return {name: statement.name!.text};
  }
}
