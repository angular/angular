/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import ts from 'typescript';

import {MetadataReader} from '../../metadata';

import {DocClass, DocData} from './data';

export class DocsAnalyzer {
  constructor(private checker: ts.TypeChecker, private reader: MetadataReader) {}

  analyze(sf: ts.SourceFile): DocData {
    const classes: DocClass[] = [];
    for (const stmt of sf.statements) {
      if (ts.isClassDeclaration(stmt)) {
        if (stmt.name !== undefined) {
          classes.push({
            name: stmt.name.text,
          });
        }
      }
    }

    return {
      classes,
    };
  }
}
