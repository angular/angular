/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import ts from 'typescript';

import {MetadataReader} from '../../metadata';
import {isNamedClassDeclaration} from '../../reflection';

import {extractClass} from './class_extractor';
import {DocEntry} from './entities';


/**
 * Extracts all information from a source file that may be relevant for generating
 * public API documentation.
 */
export class DocsExtractor {
  constructor(private checker: ts.TypeChecker, private metadataReader: MetadataReader) {}

  /**
   * Gets the set of all documentable entries from a source file.
   * @param sourceFile The file from which to extract documentable entries.
   */
  extractAll(sourceFile: ts.SourceFile): DocEntry[] {
    const entries: DocEntry[] = [];

    // TODO(jelbourn): ignore un-exported nodes
    for (const statement of sourceFile.statements) {
      // Ignore anonymous classes.
      if (isNamedClassDeclaration(statement)) {
        entries.push(extractClass(statement, this.metadataReader, this.checker));
      }
    }

    return entries;
  }
}
