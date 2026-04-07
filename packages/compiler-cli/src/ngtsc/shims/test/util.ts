/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import ts from 'typescript';

import {absoluteFromSourceFile, AbsoluteFsPath} from '../../file_system';
import {PerFileShimGenerator} from '../api';

export class TestShimGenerator implements PerFileShimGenerator {
  readonly shouldEmit = false;
  readonly extensionPrefix = 'testshim';

  generateShimForFile(
    sf: ts.SourceFile,
    genFilePath: AbsoluteFsPath,
    priorSf: ts.SourceFile | null,
  ): ts.SourceFile {
    if (priorSf !== null) {
      return priorSf;
    }
    const path = absoluteFromSourceFile(sf);
    return ts.createSourceFile(
      genFilePath,
      `export const SHIM_FOR_FILE = '${path}';\n`,
      ts.ScriptTarget.Latest,
      true,
    );
  }
}
