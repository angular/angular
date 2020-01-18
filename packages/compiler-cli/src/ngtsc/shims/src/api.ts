/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import * as ts from 'typescript';
import {AbsoluteFsPath} from '../../file_system';

export interface ShimGenerator {
  /**
   * Returns `true` if this generator is intended to handle the given file.
   */
  recognize(fileName: AbsoluteFsPath): boolean;

  /**
   * Generate a shim's `ts.SourceFile` for the given original file.
   *
   * `readFile` is a function which allows the generator to look up the contents of existing source
   * files. It returns null if the requested file doesn't exist.
   *
   * If `generate` returns null, then the shim generator declines to generate the file after all.
   */
  generate(genFileName: AbsoluteFsPath, readFile: (fileName: string) => ts.SourceFile | null):
      ts.SourceFile|null;
}