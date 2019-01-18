/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {PluginCompilerHost} from '@bazel/typescript/tsc_wrapped/plugin_api';
import * as ts from 'typescript';

/**
 * Extension of the TypeScript compiler host that supports files added to the Program which
 * were never on disk.
 *
 * This is used for backwards-compatibility with the ViewEngine compiler, which used ngsummary
 * and ngfactory files as inputs to the program. We call these inputs "synthetic".
 *
 * They need to be program inputs because user code may import from these generated files.
 *
 * TODO(alxhub): remove this after all ng_module users have migrated to Ivy
 */
export class SyntheticFilesCompilerHost implements PluginCompilerHost {
  /**
   * SourceFiles which are added to the program but which never existed on disk.
   */
  syntheticFiles = new Map<string, ts.SourceFile>();

  constructor(
      private rootFiles: string[], private delegate: ts.CompilerHost,
      generatedFiles: (rootFiles: string[]) => {
        [fileName: string]: (host: ts.CompilerHost) => ts.SourceFile | undefined
      }, ) {
    // Allow ngtsc to contribute in-memory synthetic files, which will be loaded
    // as if they existed on disk as action inputs.
    const angularGeneratedFiles = generatedFiles !(rootFiles);
    for (const f of Object.keys(angularGeneratedFiles)) {
      const generator = angularGeneratedFiles[f];
      const generated = generator(delegate);
      if (generated) {
        this.syntheticFiles.set(generated.fileName, generated);
      }
    }
  }

  fileExists(filePath: string): boolean {
    if (this.syntheticFiles.has(filePath)) {
      return true;
    }
    return this.delegate.fileExists(filePath);
  }

  /** Loads a source file from in-memory map, or delegates. */
  getSourceFile(
      fileName: string, languageVersion: ts.ScriptTarget,
      onError?: (message: string) => void): ts.SourceFile|undefined {
    const syntheticFile = this.syntheticFiles.get(fileName);
    if (syntheticFile) {
      return syntheticFile !;
    }
    return this.delegate.getSourceFile(fileName, languageVersion, onError);
  }

  get inputFiles() { return [...this.rootFiles, ...Array.from(this.syntheticFiles.keys())]; }

  fileNameToModuleId(fileName: string) {
    return fileName;  // TODO: Ivy logic. don't forget that the delegate has the google3 logic
  }

  // Delegate everything else to the original compiler host.

  getDefaultLibFileName(options: ts.CompilerOptions): string {
    return this.delegate.getDefaultLibFileName(options);
  }

  writeFile(
      fileName: string, content: string, writeByteOrderMark: boolean,
      onError: ((message: string) => void)|undefined,
      sourceFiles: ReadonlyArray<ts.SourceFile>|undefined): void {
    this.delegate.writeFile(fileName, content, writeByteOrderMark, onError, sourceFiles);
  }

  getCanonicalFileName(path: string) { return this.delegate.getCanonicalFileName(path); }

  getCurrentDirectory(): string { return this.delegate.getCurrentDirectory(); }

  useCaseSensitiveFileNames(): boolean { return this.delegate.useCaseSensitiveFileNames(); }

  getNewLine(): string { return this.delegate.getNewLine(); }

  getDirectories(path: string) { return this.delegate.getDirectories(path); }

  readFile(fileName: string): string|undefined { return this.delegate.readFile(fileName); }

  trace(s: string): void { console.error(s); }
}
