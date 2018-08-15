/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {StaticSymbolResolverHost} from '@angular/compiler';
import {createMetadataReaderCache, MetadataCollector, MetadataReaderHost, readMetadata} from '@angular/compiler-cli/src/language_services';
import * as path from 'path';
import * as ts from 'typescript';

class ReflectorModuleModuleResolutionHost implements ts.ModuleResolutionHost, MetadataReaderHost {
  private readonly metadataCollector = new MetadataCollector({
    // Note: verboseInvalidExpressions is important so that
    // the collector will collect errors instead of throwing
    verboseInvalidExpression: true,
  });

  readonly directoryExists?: (directoryName: string) => boolean;
  // Resolve a symbolic link.
  realpath?: (path: string) => string;

  constructor(
      private readonly tsLSHost: ts.LanguageServiceHost,
      private readonly getProgram: () => ts.Program) {
    if (tsLSHost.directoryExists) {
      this.directoryExists = directoryName => tsLSHost.directoryExists!(directoryName);
    }
    if (tsLSHost.realpath) {
      this.realpath = path => tsLSHost.realpath!(path);
    }
  }

  fileExists(fileName: string): boolean {
    // TypeScript resolution logic walks through the following sequence in order:
    // package.json (read "types" field) -> .ts -> .tsx -> .d.ts
    // For more info, see
    // https://www.typescriptlang.org/docs/handbook/module-resolution.html
    // For Angular specifically, we can skip .tsx lookup
    if (fileName.endsWith('.tsx')) {
      return false;
    }
    if (this.tsLSHost.fileExists) {
      return this.tsLSHost.fileExists(fileName);
    }
    return !!this.tsLSHost.getScriptSnapshot(fileName);
  }

  readFile(fileName: string): string {
    // readFile() is used by TypeScript to read package.json during module
    // resolution, and it's used by Angular to read metadata.json during
    // metadata resolution.
    if (this.tsLSHost.readFile) {
      return this.tsLSHost.readFile(fileName)!;
    }
    // As a fallback, read the JSON files from the editor snapshot.
    const snapshot = this.tsLSHost.getScriptSnapshot(fileName);
    if (!snapshot) {
      // MetadataReaderHost readFile() declaration should be
      // `readFile(fileName: string): string | undefined`
      return undefined!;
    }
    return snapshot.getText(0, snapshot.getLength());
  }

  getSourceFileMetadata(fileName: string) {
    const sf = this.getProgram().getSourceFile(fileName);
    return sf ? this.metadataCollector.getMetadata(sf) : undefined;
  }

  cacheMetadata(fileName: string) {
    // Don't cache the metadata for .ts files as they might change in the editor!
    return fileName.endsWith('.d.ts');
  }
}

export class ReflectorHost implements StaticSymbolResolverHost {
  private readonly hostAdapter: ReflectorModuleModuleResolutionHost;
  private readonly metadataReaderCache = createMetadataReaderCache();
  private readonly moduleResolutionCache: ts.ModuleResolutionCache;
  private readonly fakeContainingPath: string;

  constructor(getProgram: () => ts.Program, private readonly tsLSHost: ts.LanguageServiceHost) {
    // tsLSHost.getCurrentDirectory() returns the directory where tsconfig.json
    // is located. This is not the same as process.cwd() because the language
    // service host sets the "project root path" as its current directory.
    const currentDir = tsLSHost.getCurrentDirectory();
    this.fakeContainingPath = currentDir ? path.join(currentDir, 'fakeContainingFile.ts') : '';
    this.hostAdapter = new ReflectorModuleModuleResolutionHost(tsLSHost, getProgram);
    this.moduleResolutionCache = ts.createModuleResolutionCache(
        currentDir,
        s => s,  // getCanonicalFileName
        tsLSHost.getCompilationSettings());
  }

  getMetadataFor(modulePath: string): {[key: string]: any}[]|undefined {
    return readMetadata(modulePath, this.hostAdapter, this.metadataReaderCache);
  }

  moduleNameToFileName(moduleName: string, containingFile?: string): string|null {
    if (!containingFile) {
      if (moduleName.startsWith('.')) {
        throw new Error('Resolution of relative paths requires a containing file.');
      }
      if (!this.fakeContainingPath) {
        // If current directory is empty then the file must belong to an inferred
        // project (no tsconfig.json), in which case it's not possible to resolve
        // the module without the caller explicitly providing a containing file.
        throw new Error(`Could not resolve '${moduleName}' without a containing file.`);
      }
      containingFile = this.fakeContainingPath;
    }
    const compilerOptions = this.tsLSHost.getCompilationSettings();
    const resolved = ts.resolveModuleName(
                           moduleName, containingFile, compilerOptions, this.hostAdapter,
                           this.moduleResolutionCache)
                         .resolvedModule;
    return resolved ? resolved.resolvedFileName : null;
  }

  getOutputName(filePath: string) {
    return filePath;
  }
}
