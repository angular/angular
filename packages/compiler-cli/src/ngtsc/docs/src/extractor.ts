/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Reference} from '@angular/compiler-cli/src/ngtsc/imports';
import ts from 'typescript';

import {DirectiveMeta, InputMapping, InputOrOutput, MetadataReader} from '../../metadata';
import {ClassDeclaration, isNamedClassDeclaration} from '../../reflection';

import {extractClass} from './class-extractor';
import {ClassEntry, DirectiveEntry, DocEntry, EntryType, FunctionEntry, MemberEntry, MemberTags, MemberType, MethodEntry, ParameterEntry, PropertyEntry} from './entities';


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
