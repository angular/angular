/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as ts from 'typescript';

import {AbsoluteFsPath} from '../../file_system';
import {ShimGenerator} from '../../shims/api';

export class TypeCheckShimGenerator implements ShimGenerator {
  constructor(private typeCheckFile: AbsoluteFsPath) {}

  recognize(fileName: AbsoluteFsPath): boolean { return fileName === this.typeCheckFile; }

  generate(genFileName: AbsoluteFsPath, readFile: (fileName: string) => ts.SourceFile | null):
      ts.SourceFile|null {
    return ts.createSourceFile(
        genFileName, 'export const USED_FOR_NG_TYPE_CHECKING = true;', ts.ScriptTarget.Latest, true,
        ts.ScriptKind.TS);
  }
}
