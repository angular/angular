/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

/// <reference types="node" />

import * as path from 'path';
import * as ts from 'typescript';

import {ShimGenerator} from '../../shims';
import {isNonDeclarationTsPath} from '../../util/src/typescript';

export class FlatIndexGenerator implements ShimGenerator {
  readonly flatIndexPath: string;

  private constructor(
      relativeFlatIndexPath: string, readonly entryPoint: string,
      readonly moduleName: string|null) {
    this.flatIndexPath = path.posix.join(path.posix.dirname(entryPoint), relativeFlatIndexPath)
                             .replace(/\.js$/, '') +
        '.ts';
  }

  static forRootFiles(flatIndexPath: string, files: ReadonlyArray<string>, moduleName: string|null):
      FlatIndexGenerator|null {
    // If there's only one .ts file in the program, it's the entry. Otherwise, look for the shortest
    // (in terms of characters in the filename) file that ends in /index.ts. The second behavior is
    // deprecated; users should always explicitly specify a single .ts entrypoint.
    const tsFiles = files.filter(file => isNonDeclarationTsPath(file));
    if (tsFiles.length === 1) {
      return new FlatIndexGenerator(flatIndexPath, tsFiles[0], moduleName);
    } else {
      let indexFile: string|null = null;
      for (const tsFile of tsFiles) {
        if (tsFile.endsWith('/index.ts') &&
            (indexFile === null || tsFile.length <= indexFile.length)) {
          indexFile = tsFile;
        }
      }
      if (indexFile !== null) {
        return new FlatIndexGenerator(flatIndexPath, indexFile, moduleName);
      } else {
        return null;
      }
    }
  }

  recognize(fileName: string): boolean { return fileName === this.flatIndexPath; }

  generate(): ts.SourceFile {
    const relativeEntryPoint = './' +
        path.posix.relative(path.posix.dirname(this.flatIndexPath), this.entryPoint)
            .replace(/\.tsx?$/, '');

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
