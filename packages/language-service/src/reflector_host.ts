/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {StaticSymbolResolverHost} from '@angular/compiler';
import {CompilerOptions, MetadataCollector, MetadataReaderCache, MetadataReaderHost, createMetadataReaderCache, readMetadata} from '@angular/compiler-cli/src/language_services';
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
  private moduleResolutionCache: ts.ModuleResolutionCache;
  private hostAdapter: ReflectorModuleModuleResolutionHost;
  private metadataReaderCache = createMetadataReaderCache();

  constructor(
      getProgram: () => ts.Program, serviceHost: ts.LanguageServiceHost,
      private options: CompilerOptions) {
    this.hostAdapter = new ReflectorModuleModuleResolutionHost(serviceHost, getProgram);
    this.moduleResolutionCache =
        ts.createModuleResolutionCache(serviceHost.getCurrentDirectory(), (s) => s);
  }

  getMetadataFor(modulePath: string): {[key: string]: any}[]|undefined {
    return readMetadata(modulePath, this.hostAdapter, this.metadataReaderCache);
  }

  moduleNameToFileName(moduleName: string, containingFile?: string): string|null {
    if (!containingFile) {
      if (moduleName.indexOf('.') === 0) {
        throw new Error('Resolution of relative paths requires a containing file.');
      }
      // Any containing file gives the same result for absolute imports
      containingFile = path.join(this.options.basePath !, 'index.ts').replace(/\\/g, '/');
    }
    const resolved =
        ts.resolveModuleName(moduleName, containingFile !, this.options, this.hostAdapter)
            .resolvedModule;
    return resolved ? resolved.resolvedFileName : null;
  }

  getOutputName(filePath: string) { return filePath; }
}
