/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import * as os from 'os';
import * as ts from 'typescript';

import {AbsoluteFsPath} from '../../../src/ngtsc/path';
import {FileSystem} from '../file_system/file_system';

export class NgccCompilerHost implements ts.CompilerHost {
  private _caseSensitive = this.fs.exists(AbsoluteFsPath.fromUnchecked(__filename.toUpperCase()));

  constructor(private fs: FileSystem, private options: ts.CompilerOptions) {}

  getSourceFile(fileName: string, languageVersion: ts.ScriptTarget): ts.SourceFile|undefined {
    const text = this.readFile(fileName);
    return text !== undefined ? ts.createSourceFile(fileName, text, languageVersion) : undefined;
  }

  getDefaultLibFileName(options: ts.CompilerOptions): string {
    return this.getDefaultLibLocation() + '/' + ts.getDefaultLibFileName(options);
  }

  getDefaultLibLocation(): string {
    const nodeLibPath = AbsoluteFsPath.fromUnchecked(require.resolve('typescript'));
    return AbsoluteFsPath.join(nodeLibPath, '..');
  }

  writeFile(fileName: string, data: string): void {
    this.fs.writeFile(AbsoluteFsPath.fromUnchecked(fileName), data);
  }

  getCurrentDirectory(): string { return this.fs.pwd(); }

  getCanonicalFileName(fileName: string): string {
    return this.useCaseSensitiveFileNames ? fileName : fileName.toLowerCase();
  }

  useCaseSensitiveFileNames(): boolean { return this._caseSensitive; }

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
    return this.fs.exists(AbsoluteFsPath.fromUnchecked(fileName));
  }

  readFile(fileName: string): string|undefined {
    if (!this.fileExists(fileName)) {
      return undefined;
    }
    return this.fs.readFile(AbsoluteFsPath.fromUnchecked(fileName));
  }
}
