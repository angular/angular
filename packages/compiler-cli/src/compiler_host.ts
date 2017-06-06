/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {AotCompilerHost, StaticSymbol} from '@angular/compiler';
import {AngularCompilerOptions, CollectorOptions, MetadataCollector, ModuleMetadata} from '@angular/tsc-wrapped';
import * as path from 'path';
import * as ts from 'typescript';
import {ModuleFilenameResolver} from './transformers/api';

const EXT = /(\.ts|\.d\.ts|\.js|\.jsx|\.tsx)$/;
const DTS = /\.d\.ts$/;
const GENERATED_FILES = /\.ngfactory\.ts$|\.ngstyle\.ts$|\.ngsummary\.ts$/;
const GENERATED_OR_DTS_FILES = /\.d\.ts$|\.ngfactory\.ts$|\.ngstyle\.ts$|\.ngsummary\.ts$/;

export class CompilerHost implements AotCompilerHost {
  private metadataCollector = new MetadataCollector();
  private basePath: string;
  private genDir: string;
  private resolverCache = new Map<string, ModuleMetadata[]>();
  private flatModuleIndexCache = new Map<string, boolean>();
  private flatModuleIndexNames = new Set<string>();
  private flatModuleIndexRedirectNames = new Set<string>();

  constructor(
      protected program: ts.Program, private options: AngularCompilerOptions,
      private tsHost: ts.ModuleResolutionHost, private moduleFilenameHost: ModuleFilenameResolver,
      collectorOptions?: CollectorOptions) {
    // normalize the path so that it never ends with '/'.
    this.basePath = path.normalize(path.join(this.options.basePath, '.')).replace(/\\/g, '/');
    this.genDir = path.normalize(path.join(this.options.genDir, '.')).replace(/\\/g, '/');
  }

  moduleNameToFileName(moduleName: string, containingFile?: string): string|null {
    return this.moduleFilenameHost.moduleNameToFileName(moduleName, containingFile);
  }

  fileNameToModuleName(importedFilePath: string, containingFilePath: string): string|null {
    return this.moduleFilenameHost.fileNameToModuleName(importedFilePath, containingFilePath);
  }

  protected getSourceFile(filePath: string): ts.SourceFile {
    const sf = this.program.getSourceFile(filePath);
    if (!sf) {
      if (this.tsHost.fileExists(filePath)) {
        const sourceText = this.tsHost.readFile(filePath);
        return ts.createSourceFile(filePath, sourceText, ts.ScriptTarget.Latest, true);
      }
      throw new Error(`Source file ${filePath} not present in program.`);
    }
    return sf;
  }

  getMetadataFor(filePath: string): ModuleMetadata[]|undefined {
    if (!this.options.rootDirs) {
      return this._getMetadataFor(filePath);
    }

    for (const root of this.options.rootDirs) {
      const rootedPath = path.join(root, filePath);
      const metadata = this._getMetadataFor(rootedPath);
      if (metadata) {
        return metadata;
      }
    }
  }

  private _getMetadataFor(filePath: string): ModuleMetadata[]|undefined {
    if (!this.tsHost.fileExists(filePath)) {
      // If the file doesn't exists then we cannot return metadata for the file.
      // This will occur if the user referenced a declared module for which no file
      // exists for the module (i.e. jQuery or angularjs).
      return;
    }

    if (DTS.test(filePath)) {
      const metadataPath = filePath.replace(DTS, '.metadata.json');
      if (this.tsHost.fileExists(metadataPath)) {
        return this.readMetadata(metadataPath, filePath);
      } else {
        // If there is a .d.ts file but no metadata file we need to produce a
        // v3 metadata from the .d.ts file as v3 includes the exports we need
        // to resolve symbols.
        return [this.upgradeVersion1Metadata(
            {'__symbolic': 'module', 'version': 1, 'metadata': {}}, filePath)];
      }
    }

    const sf = this.getSourceFile(filePath);
    const metadata = this.metadataCollector.getMetadata(sf);
    return metadata ? [metadata] : [];
  }

  readMetadata(filePath: string, dtsFilePath: string): ModuleMetadata[] {
    let metadatas = this.resolverCache.get(filePath);
    if (metadatas) {
      return metadatas;
    }
    try {
      const metadataOrMetadatas = JSON.parse(this.tsHost.readFile(filePath));
      const metadatas: ModuleMetadata[] = metadataOrMetadatas ?
          (Array.isArray(metadataOrMetadatas) ? metadataOrMetadatas : [metadataOrMetadatas]) :
          [];
      const v1Metadata = metadatas.find(m => m.version === 1);
      let v3Metadata = metadatas.find(m => m.version === 3);
      if (!v3Metadata && v1Metadata) {
        metadatas.push(this.upgradeVersion1Metadata(v1Metadata, dtsFilePath));
      }
      this.resolverCache.set(filePath, metadatas);
      return metadatas;
    } catch (e) {
      console.error(`Failed to read JSON file ${filePath}`);
      throw e;
    }
  }

  private upgradeVersion1Metadata(v1Metadata: ModuleMetadata, dtsFilePath: string): ModuleMetadata {
    // patch up v1 to v3 by merging the metadata with metadata collected from the d.ts file
    // as the only difference between the versions is whether all exports are contained in
    // the metadata and the `extends` clause.
    let v3Metadata: ModuleMetadata = {'__symbolic': 'module', 'version': 3, 'metadata': {}};
    if (v1Metadata.exports) {
      v3Metadata.exports = v1Metadata.exports;
    }
    for (let prop in v1Metadata.metadata) {
      v3Metadata.metadata[prop] = v1Metadata.metadata[prop];
    }

    const exports = this.metadataCollector.getMetadata(this.getSourceFile(dtsFilePath));
    if (exports) {
      for (let prop in exports.metadata) {
        if (!v3Metadata.metadata[prop]) {
          v3Metadata.metadata[prop] = exports.metadata[prop];
        }
      }
      if (exports.exports) {
        v3Metadata.exports = exports.exports;
      }
    }
    return v3Metadata;
  }

  loadResource(filePath: string): Promise<string>|string {
    if (this.tsHost.fileExists(filePath)) {
      return this.tsHost.readFile(filePath);
    }
    throw new Error(`Couldn't find resource ${filePath}`);
  }

  loadSummary(filePath: string): string|null {
    if (this.tsHost.fileExists(filePath)) {
      return this.tsHost.readFile(filePath);
    }
    return null;
  }

  getOutputFileName(sourceFilePath: string): string {
    return sourceFilePath.replace(EXT, '') + '.d.ts';
  }

  isSourceFile(filePath: string): boolean {
    const excludeRegex =
        this.options.generateCodeForLibraries === false ? GENERATED_OR_DTS_FILES : GENERATED_FILES;
    if (excludeRegex.test(filePath)) {
      return false;
    }
    if (DTS.test(filePath)) {
      // Check for a bundle index.
      if (this.hasBundleIndex(filePath)) {
        const normalFilePath = path.normalize(filePath);
        return this.flatModuleIndexNames.has(normalFilePath) ||
            this.flatModuleIndexRedirectNames.has(normalFilePath);
      }
    }
    return true;
  }

  calculateEmitPath(filePath: string): string {
    // Write codegen in a directory structure matching the sources.
    let root = this.options.basePath !;
    for (const eachRootDir of this.options.rootDirs || []) {
      if (this.options.trace) {
        console.error(`Check if ${filePath} is under rootDirs element ${eachRootDir}`);
      }
      if (path.relative(eachRootDir, filePath).indexOf('.') !== 0) {
        root = eachRootDir;
      }
    }

    // transplant the codegen path to be inside the `genDir`
    let relativePath: string = path.relative(root, filePath);
    while (relativePath.startsWith('..' + path.sep)) {
      // Strip out any `..` path such as: `../node_modules/@foo` as we want to put everything
      // into `genDir`.
      relativePath = relativePath.substr(3);
    }

    return path.join(this.options.genDir, relativePath);
  }

  private hasBundleIndex(filePath: string): boolean {
    const checkBundleIndex = (directory: string): boolean => {
      let result = this.flatModuleIndexCache.get(directory);
      if (result == null) {
        if (path.basename(directory) == 'node_module') {
          // Don't look outside the node_modules this package is installed in.
          result = false;
        } else {
          // A bundle index exists if the typings .d.ts file has a metadata.json that has an
          // importAs.
          try {
            const packageFile = path.join(directory, 'package.json');
            if (this.tsHost.fileExists(packageFile)) {
              // Once we see a package.json file, assume false until it we find the bundle index.
              result = false;
              const packageContent: any = JSON.parse(this.tsHost.readFile(packageFile));
              if (packageContent.typings) {
                const typings = path.normalize(path.join(directory, packageContent.typings));
                if (DTS.test(typings)) {
                  const metadataFile = typings.replace(DTS, '.metadata.json');
                  if (this.tsHost.fileExists(metadataFile)) {
                    const metadata = JSON.parse(this.tsHost.readFile(metadataFile));
                    if (metadata.flatModuleIndexRedirect) {
                      this.flatModuleIndexRedirectNames.add(typings);
                      // Note: don't set result = true,
                      // as this would mark this folder
                      // as having a bundleIndex too early without
                      // filling the bundleIndexNames.
                    } else if (metadata.importAs) {
                      this.flatModuleIndexNames.add(typings);
                      result = true;
                    }
                  }
                }
              }
            } else {
              const parent = path.dirname(directory);
              if (parent != directory) {
                // Try the parent directory.
                result = checkBundleIndex(parent);
              } else {
                result = false;
              }
            }
          } catch (e) {
            // If we encounter any errors assume we this isn't a bundle index.
            result = false;
          }
        }
        this.flatModuleIndexCache.set(directory, result);
      }
      return result;
    };

    return checkBundleIndex(path.dirname(filePath));
  }
}
