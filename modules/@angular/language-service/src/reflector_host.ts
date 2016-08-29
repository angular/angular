/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {StaticReflectorHost, StaticSymbol} from '@angular/compiler';
import {MetadataCollector} from '@angular/tsc-wrapped/src/collector';
import {ModuleMetadata} from '@angular/tsc-wrapped/src/schema';
import * as path from 'path';
import * as ts from 'typescript';

const EXT = /(\.ts|\.d\.ts|\.js|\.jsx|\.tsx)$/;
const DTS = /\.d\.ts$/;

let serialNumber = 0;

class ReflectorModuleModuleResolutionHost implements ts.ModuleResolutionHost {
  private forceExists: string[] = [];

  constructor(private host: ts.LanguageServiceHost) {
    if (host.directoryExists)
      this.directoryExists = directoryName => this.host.directoryExists(directoryName);
  }

  fileExists(fileName: string): boolean {
    return !!this.host.getScriptSnapshot(fileName) || this.forceExists.indexOf(fileName) >= 0;
  }

  readFile(fileName: string): string {
    let snapshot = this.host.getScriptSnapshot(fileName);
    if (snapshot) {
      return snapshot.getText(0, snapshot.getLength());
    }
  }

  directoryExists: (directoryName: string) => boolean;

  forceExist(fileName: string): void { this.forceExists.push(fileName); }
}

export class ReflectorHost implements StaticReflectorHost {
  private metadataCollector: MetadataCollector;
  private moduleResolverHost: ReflectorModuleModuleResolutionHost;
  private _typeChecker: ts.TypeChecker;
  private metadataCache = new Map<string, MetadataCacheEntry>();

  constructor(
      private getProgram: () => ts.Program, private serviceHost: ts.LanguageServiceHost,
      private options: ts.CompilerOptions, private basePath: string) {
    this.moduleResolverHost = new ReflectorModuleModuleResolutionHost(serviceHost);
    this.metadataCollector = new MetadataCollector();
  }

  getCanonicalFileName(fileName: string): string { return fileName; }

  private get program() { return this.getProgram(); }

  public moduleNameToFileName(moduleName: string, containingFile: string) {
    if (!containingFile || !containingFile.length) {
      if (moduleName.indexOf('.') === 0) {
        throw new Error('Resolution of relative paths requires a containing file.');
      }
      // Any containing file gives the same result for absolute imports
      containingFile = this.getCanonicalFileName(path.join(this.basePath, 'index.ts'));
    }
    moduleName = moduleName.replace(EXT, '');
    const resolved =
        ts.resolveModuleName(moduleName, containingFile, this.options, this.moduleResolverHost)
            .resolvedModule;
    return resolved ? resolved.resolvedFileName : null;
  };

  /**
   * We want a moduleId that will appear in import statements in the generated code.
   * These need to be in a form that system.js can load, so absolute file paths don't work.
   * Relativize the paths by checking candidate prefixes of the absolute path, to see if
   * they are resolvable by the moduleResolution strategy from the CompilerHost.
   */
  fileNameToModuleName(importedFile: string, containingFile: string) {
    // TODO(tbosch): if a file does not yet exist (because we compile it later),
    // we still need to create it so that the `resolve` method works!
    if (!this.moduleResolverHost.fileExists(importedFile)) {
      this.moduleResolverHost.forceExist(importedFile);
    }

    const parts = importedFile.replace(EXT, '').split(path.sep).filter(p => !!p);

    for (let index = parts.length - 1; index >= 0; index--) {
      let candidate = parts.slice(index, parts.length).join(path.sep);
      if (this.moduleNameToFileName('.' + path.sep + candidate, containingFile) === importedFile) {
        return `./${candidate}`;
      }
      if (this.moduleNameToFileName(candidate, containingFile) === importedFile) {
        return candidate;
      }
    }
    throw new Error(
        `Unable to find any resolvable import for ${importedFile} relative to ${containingFile}`);
  }

  private get typeChecker(): ts.TypeChecker {
    let result = this._typeChecker;
    if (!result) {
      result = this._typeChecker = this.program.getTypeChecker();
    }
    return result;
  }

  private typeCache = new Map<string, StaticSymbol>();

  // TODO(alexeagle): take a statictype
  getMetadataFor(filePath: string): ModuleMetadata[] {
    if (!this.moduleResolverHost.fileExists(filePath)) {
      throw new Error(`No such file '${filePath}'`);
    }
    if (DTS.test(filePath)) {
      const metadataPath = filePath.replace(DTS, '.metadata.json');
      if (this.moduleResolverHost.fileExists(metadataPath)) {
        return this.readMetadata(metadataPath);
      }
    }

    let sf = this.program.getSourceFile(filePath);
    if (!sf) {
      throw new Error(`Source file ${filePath} not present in program.`);
    }

    const entry = this.metadataCache.get(sf.path);
    const version = this.serviceHost.getScriptVersion(sf.path);
    if (entry && entry.version == version) {
      if (!entry.content) return undefined;
      return [entry.content];
    }
    const metadata = this.metadataCollector.getMetadata(sf);
    this.metadataCache.set(sf.path, {version, content: metadata});
    if (metadata) return [metadata];
  }

  readMetadata(filePath: string) {
    try {
      const text = this.moduleResolverHost.readFile(filePath);
      const result = JSON.parse(text);
      if (!Array.isArray(result)) return [result];
      return result;
    } catch (e) {
      console.error(`Failed to read JSON file ${filePath}`);
      throw e;
    }
  }
}

interface MetadataCacheEntry {
  version: string;
  content: ModuleMetadata;
}