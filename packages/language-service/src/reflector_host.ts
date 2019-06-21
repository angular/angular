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

  constructor(
    private readonly host: ts.LanguageServiceHost,
    private readonly getProgram: () => ts.Program) {

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

  directoryExists(directoryName: string): boolean {
    if (this.host.directoryExists) {
      return this.host.directoryExists(directoryName);
    }
    return false;
  };

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
  private hostAdapter: ReflectorModuleModuleResolutionHost;
  private metadataReaderCache = createMetadataReaderCache();

  constructor(getProgram: () => ts.Program, private readonly tsLSHost: ts.LanguageServiceHost) {
    this.hostAdapter = new ReflectorModuleModuleResolutionHost(tsLSHost, getProgram);
  }

  getMetadataFor(modulePath: string): {[key: string]: any}[]|undefined {
    return readMetadata(modulePath, this.hostAdapter, this.metadataReaderCache);
  }

  moduleNameToFileName(moduleName: string, containingFile?: string): string|null {
    const compilerOptions = this.tsLSHost.getCompilationSettings();
    if (!containingFile) {
      if (moduleName.startsWith('.')) {
        throw new Error('Resolution of relative paths requires a containing file.');
      }
      let baseUrl = compilerOptions.baseUrl;
      if (!baseUrl) {
        // Make up a context by finding the first script and using that as the base dir.
        const scripts = this.tsLSHost.getScriptFileNames();
        if (scripts.length === 0) {
          throw new Error(
              'ReflectorHost could not find suitable file to resolve absolute imports. ' +
              'There is no scripts in ts.LanguageServiceHost.');
        }
        baseUrl = path.dirname(scripts[0]);
      }
      // Any containing file gives the same result for absolute imports
      containingFile = path.join(baseUrl, 'index.ts').replace(/\\/g, '/');
    }

    const resolved =
        ts.resolveModuleName(moduleName, containingFile, compilerOptions, this.hostAdapter)
            .resolvedModule;
    return resolved ? resolved.resolvedFileName : null;
  }

  getOutputName(filePath: string) { return filePath; }
}
