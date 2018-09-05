/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {readFileSync} from 'fs';
import * as ts from 'typescript';

import {DtsMapper} from './dts_mapper';
import {Fesm2015ReflectionHost} from './fesm2015_host';

export class Esm2015ReflectionHost extends Fesm2015ReflectionHost {
  constructor(checker: ts.TypeChecker, protected dtsMapper: DtsMapper) { super(checker); }

  /**
   * Get the number of generic type parameters of a given class.
   *
   * @returns the number of type parameters of the class, if known, or `null` if the declaration
   * is not a class or has an unknown number of type parameters.
   */
  getGenericArityOfClass(clazz: ts.Declaration): number|null {
    if (ts.isClassDeclaration(clazz) && clazz.name) {
      const sourcePath = clazz.getSourceFile();
      const dtsPath = this.dtsMapper.getDtsFileNameFor(sourcePath.fileName);
      const dtsContents = readFileSync(dtsPath, 'utf8');
      // TODO: investigate caching parsed .d.ts files as they're needed for several different
      // purposes in ngcc.
      const dtsFile = ts.createSourceFile(
          dtsPath, dtsContents, ts.ScriptTarget.Latest, false, ts.ScriptKind.TS);

      for (let i = dtsFile.statements.length - 1; i >= 0; i--) {
        const stmt = dtsFile.statements[i];
        if (ts.isClassDeclaration(stmt) && stmt.name !== undefined &&
            stmt.name.text === clazz.name.text) {
          return stmt.typeParameters ? stmt.typeParameters.length : 0;
        }
      }
    }
    return null;
  }
}
