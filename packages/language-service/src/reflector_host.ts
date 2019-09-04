/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {StaticSymbolResolverHost} from '@angular/compiler';
import {MetadataCollector, MetadataReaderHost, createMetadataReaderCache, readMetadata} from '@angular/compiler-cli/src/language_services';
import * as path from 'path';
import * as ts from 'typescript';

class ReflectorModuleModuleResolutionHost implements ts.ModuleResolutionHost, MetadataReaderHost {
  // Note: verboseInvalidExpressions is important so that
  // the collector will collect errors instead of throwing
  private metadataCollector = new MetadataCollector({verboseInvalidExpression: true});

  constructor(private host: ts.LanguageServiceHost, private getProgram: () => ts.Program) {
    if (host.directoryExists)
      this.directoryExists = directoryName => this.host.directoryExists !(directoryName);
  }

  fileExists(fileName: string): boolean { return !!this.host.getScriptSnapshot(fileName); }

  readFile(fileName: string): string {
    let snapshot = this.host.getScriptSnapshot(fileName);
    if (snapshot) {
      return snapshot.getText(0, snapshot.getLength());
    }

    // Typescript readFile() declaration should be `readFile(fileName: string): string | undefined
    return undefined !;
  }

  // TODO(issue/24571): remove '!'.
  directoryExists !: (directoryName: string) => boolean;

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

  constructor(
      getProgram: () => ts.Program, private readonly tsLSHost: ts.LanguageServiceHost, _: {}) {
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

  getOutputName(filePath: string) { return filePath; }
}
