/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import ts from 'typescript';

import {absoluteFrom, AbsoluteFsPath, getSourceFileOrError} from '../../file_system';
import {PerFileShimGenerator, TopLevelShimGenerator} from '../../shims/api';

/**
 * A `ShimGenerator` which adds type-checking files to the `ts.Program`.
 *
 * This is a requirement for performant template type-checking, as TypeScript will only reuse
 * information in the main program when creating the type-checking program if the set of files in
 * each are exactly the same. Thus, the main program also needs the synthetic type-checking files.
 */
export class TypeCheckShimGenerator implements PerFileShimGenerator {
  readonly extensionPrefix = 'ngtypecheck';
  readonly shouldEmit = false;

  generateShimForFile(
    sf: ts.SourceFile,
    genFilePath: AbsoluteFsPath,
    priorShimSf: ts.SourceFile | null,
  ): ts.SourceFile {
    if (priorShimSf !== null) {
      // If this shim existed in the previous program, reuse it now. It might not be correct, but
      // reusing it in the main program allows the shape of its imports to potentially remain the
      // same and TS can then use the fastest path for incremental program creation. Later during
      // the type-checking phase it's going to either be reused, or replaced anyways. Thus there's
      // no harm in reuse here even if it's out of date.
      return priorShimSf;
    }
    return ts.createSourceFile(
      genFilePath,
      'export const USED_FOR_NG_TYPE_CHECKING = true;',
      ts.ScriptTarget.Latest,
      true,
      ts.ScriptKind.TS,
    );
  }

  static shimFor(fileName: AbsoluteFsPath): AbsoluteFsPath {
    return absoluteFrom(fileName.replace(/\.tsx?$/, '.ngtypecheck.ts'));
  }
}
