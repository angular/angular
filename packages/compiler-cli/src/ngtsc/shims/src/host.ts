/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import * as ts from 'typescript';
import {AbsoluteFsPath, absoluteFrom, resolve} from '../../file_system';

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

/**
 * A wrapper around a `ts.CompilerHost` which supports generated files.
 */
export class GeneratedShimsHostWrapper implements ts.CompilerHost {
  constructor(private delegate: ts.CompilerHost, private shimGenerators: ShimGenerator[]) {
    if (delegate.resolveModuleNames !== undefined) {
      this.resolveModuleNames =
          (moduleNames: string[], containingFile: string, reusedNames?: string[],
           redirectedReference?: ts.ResolvedProjectReference) =>
              delegate.resolveModuleNames !(
                  moduleNames, containingFile, reusedNames, redirectedReference);
    }
    if (delegate.resolveTypeReferenceDirectives) {
      // Backward compatibility with TypeScript 2.9 and older since return
      // type has changed from (ts.ResolvedTypeReferenceDirective | undefined)[]
      // to ts.ResolvedTypeReferenceDirective[] in Typescript 3.0
      type ts3ResolveTypeReferenceDirectives = (names: string[], containingFile: string) =>
          ts.ResolvedTypeReferenceDirective[];
      this.resolveTypeReferenceDirectives = (names: string[], containingFile: string) =>
          (delegate.resolveTypeReferenceDirectives as ts3ResolveTypeReferenceDirectives) !(
              names, containingFile);
    }
    if (delegate.directoryExists !== undefined) {
      this.directoryExists = (directoryName: string) => delegate.directoryExists !(directoryName);
    }
    if (delegate.getDirectories !== undefined) {
      this.getDirectories = (path: string) => delegate.getDirectories !(path);
    }
  }

  resolveModuleNames?:
      (moduleNames: string[], containingFile: string, reusedNames?: string[],
       redirectedReference?: ts.ResolvedProjectReference) => (ts.ResolvedModule | undefined)[];

  resolveTypeReferenceDirectives?:
      (names: string[], containingFile: string) => ts.ResolvedTypeReferenceDirective[];

  directoryExists?: (directoryName: string) => boolean;

  getSourceFile(
      fileName: string, languageVersion: ts.ScriptTarget,
      onError?: ((message: string) => void)|undefined,
      shouldCreateNewSourceFile?: boolean|undefined): ts.SourceFile|undefined {
    for (let i = 0; i < this.shimGenerators.length; i++) {
      const generator = this.shimGenerators[i];
      // TypeScript internal paths are guaranteed to be POSIX-like absolute file paths.
      const absoluteFsPath = resolve(fileName);
      if (generator.recognize(absoluteFsPath)) {
        const readFile = (originalFile: string) => {
          return this.delegate.getSourceFile(
                     originalFile, languageVersion, onError, shouldCreateNewSourceFile) ||
              null;
        };

        return generator.generate(absoluteFsPath, readFile) || undefined;
      }
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
      sourceFiles: ReadonlyArray<ts.SourceFile>|undefined): void {
    return this.delegate.writeFile(fileName, data, writeByteOrderMark, onError, sourceFiles);
  }

  getCurrentDirectory(): string { return this.delegate.getCurrentDirectory(); }

  getDirectories?: (path: string) => string[];

  getCanonicalFileName(fileName: string): string {
    return this.delegate.getCanonicalFileName(fileName);
  }

  useCaseSensitiveFileNames(): boolean { return this.delegate.useCaseSensitiveFileNames(); }

  getNewLine(): string { return this.delegate.getNewLine(); }

  fileExists(fileName: string): boolean {
    // Consider the file as existing whenever
    //  1) it really does exist in the delegate host, or
    //  2) at least one of the shim generators recognizes it
    // Note that we can pass the file name as branded absolute fs path because TypeScript
    // internally only passes POSIX-like paths.
    return this.delegate.fileExists(fileName) ||
        this.shimGenerators.some(gen => gen.recognize(absoluteFrom(fileName)));
  }

  readFile(fileName: string): string|undefined { return this.delegate.readFile(fileName); }
}
