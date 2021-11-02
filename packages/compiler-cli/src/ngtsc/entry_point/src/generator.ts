/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

/// <reference types="node" />

import ts from 'typescript';

import {AbsoluteFsPath, dirname, join} from '../../file_system';
import {TopLevelShimGenerator} from '../../shims/api';
import {relativePathBetween} from '../../util/src/path';

export class FlatIndexGenerator implements TopLevelShimGenerator {
  readonly flatIndexPath: string;
  readonly shouldEmit = true;

  constructor(
      readonly entryPoint: AbsoluteFsPath, relativeFlatIndexPath: string,
      readonly moduleName: string|null) {
    this.flatIndexPath =
        join(dirname(entryPoint), relativeFlatIndexPath).replace(/\.js$/, '') + '.ts';
  }

  makeTopLevelShim(): ts.SourceFile {
    const relativeEntryPoint = relativePathBetween(this.flatIndexPath, this.entryPoint);
    const contents = `/**
 * Generated bundle index. Do not edit.
 */

export * from '${relativeEntryPoint}';
`;
    const genFile = ts.createSourceFile(
        this.flatIndexPath, contents, ts.ScriptTarget.ES2015, true, ts.ScriptKind.TS);
    if (this.moduleName !== null) {
      genFile.moduleName = this.moduleName;
    }
    return genFile;
  }
}
