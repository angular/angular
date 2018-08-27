/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as path from 'path';
import * as ts from 'typescript';

import {FactoryGenerator} from './generator';

/**
 * A wrapper around a `ts.CompilerHost` which supports generated files.
 */
export class GeneratedFactoryHostWrapper implements ts.CompilerHost {
  constructor(
      private delegate: ts.CompilerHost, private generator: FactoryGenerator,
      private factoryToSourceMap: Map<string, string>) {}

  getSourceFile(
      fileName: string, languageVersion: ts.ScriptTarget,
      onError?: ((message: string) => void)|undefined,
      shouldCreateNewSourceFile?: boolean|undefined): ts.SourceFile|undefined {
    const canonical = this.getCanonicalFileName(fileName);
    if (this.factoryToSourceMap.has(canonical)) {
      const sourceFileName = this.getCanonicalFileName(this.factoryToSourceMap.get(canonical) !);
      const sourceFile = this.delegate.getSourceFile(
          sourceFileName, languageVersion, onError, shouldCreateNewSourceFile);
      if (sourceFile === undefined) {
        return undefined;
      }
      return this.generator.factoryFor(sourceFile, fileName);
    }
    return this.delegate.getSourceFile(
        fileName, languageVersion, onError, shouldCreateNewSourceFile);
  }

  getDefaultLibFileName(options: ts.CompilerOptions): string {
    return this.delegate.getDefaultLibFileName(options);
  }

  writeFile(
      fileName: string, data: string, writeByteOrderMark: boolean,
      onError: ((message: string) => void)|undefined,
      sourceFiles: ReadonlyArray<ts.SourceFile>): void {
    return this.delegate.writeFile(fileName, data, writeByteOrderMark, onError, sourceFiles);
  }

  getCurrentDirectory(): string { return this.delegate.getCurrentDirectory(); }

  getDirectories(path: string): string[] { return this.delegate.getDirectories(path); }

  getCanonicalFileName(fileName: string): string {
    return this.delegate.getCanonicalFileName(fileName);
  }

  useCaseSensitiveFileNames(): boolean { return this.delegate.useCaseSensitiveFileNames(); }

  getNewLine(): string { return this.delegate.getNewLine(); }

  fileExists(fileName: string): boolean {
    return this.factoryToSourceMap.has(fileName) || this.delegate.fileExists(fileName);
  }

  readFile(fileName: string): string|undefined { return this.delegate.readFile(fileName); }
}
