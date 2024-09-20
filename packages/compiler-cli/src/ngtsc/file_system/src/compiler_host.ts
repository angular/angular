/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

/// <reference types="node" />
import * as os from 'os';
import ts from 'typescript';

import {absoluteFrom} from './helpers';
import {FileSystem} from './types';

export class NgtscCompilerHost implements ts.CompilerHost {
  constructor(
    protected fs: FileSystem,
    protected options: ts.CompilerOptions = {},
  ) {}

  getSourceFile(fileName: string, languageVersion: ts.ScriptTarget): ts.SourceFile | undefined {
    const text = this.readFile(fileName);
    return text !== undefined
      ? ts.createSourceFile(fileName, text, languageVersion, true)
      : undefined;
  }

  getDefaultLibFileName(options: ts.CompilerOptions): string {
    return this.fs.join(this.getDefaultLibLocation(), ts.getDefaultLibFileName(options));
  }

  getDefaultLibLocation(): string {
    return this.fs.getDefaultLibLocation();
  }

  writeFile(
    fileName: string,
    data: string,
    writeByteOrderMark: boolean,
    onError: ((message: string) => void) | undefined,
    sourceFiles?: ReadonlyArray<ts.SourceFile>,
  ): void {
    const path = absoluteFrom(fileName);
    this.fs.ensureDir(this.fs.dirname(path));
    this.fs.writeFile(path, data);
  }

  getCurrentDirectory(): string {
    return this.fs.pwd();
  }

  getCanonicalFileName(fileName: string): string {
    return this.useCaseSensitiveFileNames() ? fileName : fileName.toLowerCase();
  }

  useCaseSensitiveFileNames(): boolean {
    return this.fs.isCaseSensitive();
  }

  getNewLine(): string {
    switch (this.options.newLine) {
      case ts.NewLineKind.CarriageReturnLineFeed:
        return '\r\n';
      case ts.NewLineKind.LineFeed:
        return '\n';
      default:
        return os.EOL;
    }
  }

  fileExists(fileName: string): boolean {
    const absPath = this.fs.resolve(fileName);
    return this.fs.exists(absPath) && this.fs.stat(absPath).isFile();
  }

  readFile(fileName: string): string | undefined {
    const absPath = this.fs.resolve(fileName);
    if (!this.fileExists(absPath)) {
      return undefined;
    }
    return this.fs.readFile(absPath);
  }

  realpath(path: string): string {
    return this.fs.realpath(this.fs.resolve(path));
  }
}
