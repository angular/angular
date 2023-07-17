/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import ts from 'typescript';
import {NgtscCompilerHost} from '../../file_system';
import {getCachedSourceFile} from './cached_source_files';

/**
 * A compiler host intended to improve test performance by caching default library source files for
 * reuse across tests.
 */
export class NgtscTestCompilerHost extends NgtscCompilerHost {
  override getSourceFile(fileName: string, languageVersion: ts.ScriptTarget): ts.SourceFile
      |undefined {
    const cachedSf = getCachedSourceFile(fileName, () => this.readFile(fileName));
    if (cachedSf !== null) {
      return cachedSf;
    }
    return super.getSourceFile(fileName, languageVersion);
  }
}
