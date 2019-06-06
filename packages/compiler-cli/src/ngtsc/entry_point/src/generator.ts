/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

/// <reference types="node" />

import * as ts from 'typescript';

import {AbsoluteFsPath, dirname, join} from '../../file_system';
import {ShimGenerator} from '../../shims';
import {relativePathBetween} from '../../util/src/path';

export class FlatIndexGenerator implements ShimGenerator {
  readonly flatIndexPath: string;

  constructor(
      readonly entryPoint: AbsoluteFsPath, relativeFlatIndexPath: string,
      readonly moduleName: string|null) {
    this.flatIndexPath =
        join(dirname(entryPoint), relativeFlatIndexPath).replace(/\.js$/, '') + '.ts';
  }

  recognize(fileName: string): boolean { return fileName === this.flatIndexPath; }

  generate(): ts.SourceFile {
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
