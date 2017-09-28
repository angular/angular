/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {AotCompilerHost, StaticSymbol, UrlResolver, createOfflineCompileUrlResolver, syntaxError} from '@angular/compiler';
import * as fs from 'fs';
import * as path from 'path';
import * as ts from 'typescript';

import {CollectorOptions, METADATA_VERSION, MetadataCollector, ModuleMetadata} from './metadata/index';
import {CompilerOptions} from './transformers/api';

const EXT = /(\.ts|\.d\.ts|\.js|\.jsx|\.tsx)$/;
const DTS = /\.d\.ts$/;
const NODE_MODULES = '/node_modules/';
const IS_GENERATED = /\.(ngfactory|ngstyle|ngsummary)$/;
const GENERATED_FILES = /\.ngfactory\.ts$|\.ngstyle\.ts$|\.ngsummary\.ts$/;
const GENERATED_OR_DTS_FILES = /\.d\.ts$|\.ngfactory\.ts$|\.ngstyle\.ts$|\.ngsummary\.ts$/;
const SHALLOW_IMPORT = /^((\w|-)+|(@(\w|-)+(\/(\w|-)+)+))$/;

export interface BaseAotCompilerHostContext extends ts.ModuleResolutionHost {
  readResource?(fileName: string): Promise<string>|string;
}

export abstract class BaseAotCompilerHost<C extends BaseAotCompilerHostContext> implements
    AotCompilerHost {
  private resolverCache = new Map<string, ModuleMetadata[]>();
  private flatModuleIndexCache = new Map<string, boolean>();
  private flatModuleIndexNames = new Set<string>();
  private flatModuleIndexRedirectNames = new Set<string>();

  constructor(protected options: CompilerOptions, protected context: C) {}

  abstract moduleNameToFileName(m: string, containingFile: string): string|null;

  abstract resourceNameToFileName(m: string, containingFile: string): string|null;

  abstract fileNameToModuleName(importedFile: string, containingFile: string): string;

  abstract toSummaryFileName(fileName: string, referringSrcFileName: string): string;

  abstract fromSummaryFileName(fileName: string, referringLibFileName: string): string;

  abstract getMetadataForSourceFile(filePath: string): ModuleMetadata|undefined;

  getMetadataFor(filePath: string): ModuleMetadata[]|undefined {
    if (!this.context.fileExists(filePath)) {
      // If the file doesn't exists then we cannot return metadata for the file.
      // This will occur if the user referenced a declared module for which no file
      // exists for the module (i.e. jQuery or angularjs).
      return;
    }

    if (DTS.test(filePath)) {
      let metadatas = this.readMetadata(filePath);
      if (!metadatas) {
        // If there is a .d.ts file but no metadata file we need to produce a
        // metadata from the .d.ts file as metadata files capture reexports
        // (starting with v3).
        metadatas = [this.upgradeMetadataWithDtsData(
            {'__symbolic': 'module', 'version': 1, 'metadata': {}}, filePath)];
      }
      return metadatas;
    }

    // Attention: don't cache this, so that e.g. the LanguageService
    // can read in changes from source files in the metadata!
    const metadata = this.getMetadataForSourceFile(filePath);
    return metadata ? [metadata] : [];
  }

  protected readMetadata(dtsFilePath: string): ModuleMetadata[]|undefined {
    let metadatas = this.resolverCache.get(dtsFilePath);
    if (metadatas) {
      return metadatas;
    }
    const metadataPath = dtsFilePath.replace(DTS, '.metadata.json');
    if (!this.context.fileExists(metadataPath)) {
      return undefined;
    }
    try {
      const metadataOrMetadatas = JSON.parse(this.context.readFile(metadataPath));
      const metadatas: ModuleMetadata[] = metadataOrMetadatas ?
          (Array.isArray(metadataOrMetadatas) ? metadataOrMetadatas : [metadataOrMetadatas]) :
          [];
      if (metadatas.length) {
        let maxMetadata = metadatas.reduce((p, c) => p.version > c.version ? p : c);
        if (maxMetadata.version < METADATA_VERSION) {
          metadatas.push(this.upgradeMetadataWithDtsData(maxMetadata, dtsFilePath));
        }
      }
      this.resolverCache.set(dtsFilePath, metadatas);
      return metadatas;
    } catch (e) {
      console.error(`Failed to read JSON file ${metadataPath}`);
      throw e;
    }
  }

  private upgradeMetadataWithDtsData(oldMetadata: ModuleMetadata, dtsFilePath: string):
      ModuleMetadata {
    // patch v1 to v3 by adding exports and the `extends` clause.
    // patch v3 to v4 by adding `interface` symbols for TypeAlias
    let newMetadata: ModuleMetadata = {
      '__symbolic': 'module',
      'version': METADATA_VERSION,
      'metadata': {...oldMetadata.metadata},
    };
    if (oldMetadata.exports) {
      newMetadata.exports = oldMetadata.exports;
    }
    if (oldMetadata.importAs) {
      newMetadata.importAs = oldMetadata.importAs;
    }
    if (oldMetadata.origins) {
      newMetadata.origins = oldMetadata.origins;
    }
    const dtsMetadata = this.getMetadataForSourceFile(dtsFilePath);
    if (dtsMetadata) {
      for (let prop in dtsMetadata.metadata) {
        if (!newMetadata.metadata[prop]) {
          newMetadata.metadata[prop] = dtsMetadata.metadata[prop];
        }
      }

      // Only copy exports from exports from metadata prior to version 3.
      // Starting with version 3 the collector began collecting exports and
      // this should be redundant. Also, with bundler will rewrite the exports
      // which will hoist the exports from modules referenced indirectly causing
      // the imports to be different than the .d.ts files and using the .d.ts file
      // exports would cause the StaticSymbolResolver to redirect symbols to the
      // incorrect location.
      if ((!oldMetadata.version || oldMetadata.version < 3) && dtsMetadata.exports) {
        newMetadata.exports = dtsMetadata.exports;
      }
    }
    return newMetadata;
  }

  loadResource(filePath: string): Promise<string>|string {
    if (this.context.readResource) return this.context.readResource(filePath);
    if (!this.context.fileExists(filePath)) {
      throw syntaxError(`Error: Resource file not found: ${filePath}`);
    }
    return this.context.readFile(filePath);
  }

  loadSummary(filePath: string): string|null {
    if (this.context.fileExists(filePath)) {
      return this.context.readFile(filePath);
    }
    return null;
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
            if (this.context.fileExists(packageFile)) {
              // Once we see a package.json file, assume false until it we find the bundle index.
              result = false;
              const packageContent: any = JSON.parse(this.context.readFile(packageFile));
              if (packageContent.typings) {
                const typings = path.normalize(path.join(directory, packageContent.typings));
                if (DTS.test(typings)) {
                  const metadataFile = typings.replace(DTS, '.metadata.json');
                  if (this.context.fileExists(metadataFile)) {
                    const metadata = JSON.parse(this.context.readFile(metadataFile));
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

export interface CompilerHostContext extends ts.ModuleResolutionHost {
  readResource?(fileName: string): Promise<string>|string;
  assumeFileExists(fileName: string): void;
}

// TODO(tbosch): remove this once G3 uses the transformer compiler!
export class CompilerHost extends BaseAotCompilerHost<CompilerHostContext> {
  protected metadataProvider: MetadataCollector;
  protected basePath: string;
  private moduleFileNames = new Map<string, string|null>();
  private isGenDirChildOfRootDir: boolean;
  private genDir: string;
  protected resolveModuleNameHost: CompilerHostContext;
  private urlResolver: UrlResolver;

  constructor(
      protected program: ts.Program, options: CompilerOptions, context: CompilerHostContext,
      collectorOptions?: CollectorOptions) {
    super(options, context);
    this.metadataProvider = new MetadataCollector(collectorOptions);
    // normalize the path so that it never ends with '/'.
    this.basePath = path.normalize(path.join(this.options.basePath !, '.')).replace(/\\/g, '/');
    this.genDir = path.normalize(path.join(this.options.genDir !, '.')).replace(/\\/g, '/');

    const genPath: string = path.relative(this.basePath, this.genDir);
    this.isGenDirChildOfRootDir = genPath === '' || !genPath.startsWith('..');

    this.resolveModuleNameHost = Object.create(this.context);

    // When calling ts.resolveModuleName,
    // additional allow checks for .d.ts files to be done based on
    // checks for .ngsummary.json files,
    // so that our codegen depends on fewer inputs and requires to be called
    // less often.
    // This is needed as we use ts.resolveModuleName in reflector_host
    // and it should be able to resolve summary file names.
    this.resolveModuleNameHost.fileExists = (fileName: string): boolean => {
      if (this.context.fileExists(fileName)) {
        return true;
      }
      if (DTS.test(fileName)) {
        const base = fileName.substring(0, fileName.length - 5);
        return this.context.fileExists(base + '.ngsummary.json');
      }
      return false;
    };
    this.urlResolver = createOfflineCompileUrlResolver();
  }

  protected getSourceFile(filePath: string): ts.SourceFile {
    let sf = this.program.getSourceFile(filePath);
    if (!sf) {
      if (this.context.fileExists(filePath)) {
        const sourceText = this.context.readFile(filePath);
        sf = ts.createSourceFile(filePath, sourceText, ts.ScriptTarget.Latest, true);
      } else {
        throw new Error(`Source file ${filePath} not present in program.`);
      }
    }
    return sf;
  }

  getMetadataForSourceFile(filePath: string): ModuleMetadata|undefined {
    return this.metadataProvider.getMetadata(this.getSourceFile(filePath));
  }

  toSummaryFileName(fileName: string, referringSrcFileName: string): string {
    return fileName.replace(EXT, '') + '.d.ts';
  }

  fromSummaryFileName(fileName: string, referringLibFileName: string): string { return fileName; }

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

    return path.join(this.options.genDir !, relativePath);
  }

  // We use absolute paths on disk as canonical.
  getCanonicalFileName(fileName: string): string { return fileName; }

  moduleNameToFileName(m: string, containingFile: string): string|null {
    const key = m + ':' + (containingFile || '');
    let result: string|null = this.moduleFileNames.get(key) || null;
    if (!result) {
      if (!containingFile || !containingFile.length) {
        if (m.indexOf('.') === 0) {
          throw new Error('Resolution of relative paths requires a containing file.');
        }
        // Any containing file gives the same result for absolute imports
        containingFile = this.getCanonicalFileName(path.join(this.basePath, 'index.ts'));
      }
      m = m.replace(EXT, '');
      const resolved =
          ts.resolveModuleName(
                m, containingFile.replace(/\\/g, '/'), this.options, this.resolveModuleNameHost)
              .resolvedModule;
      result = resolved ? this.getCanonicalFileName(resolved.resolvedFileName) : null;
      this.moduleFileNames.set(key, result);
    }
    return result;
  }

  /**
   * We want a moduleId that will appear in import statements in the generated code.
   * These need to be in a form that system.js can load, so absolute file paths don't work.
   *
   * The `containingFile` is always in the `genDir`, where as the `importedFile` can be in
   * `genDir`, `node_module` or `basePath`.  The `importedFile` is either a generated file or
   * existing file.
   *
   *               | genDir   | node_module |  rootDir
   * --------------+----------+-------------+----------
   * generated     | relative |   relative  |   n/a
   * existing file |   n/a    |   absolute  |  relative(*)
   *
   * NOTE: (*) the relative path is computed depending on `isGenDirChildOfRootDir`.
   */
  fileNameToModuleName(importedFile: string, containingFile: string): string {
    // If a file does not yet exist (because we compile it later), we still need to
    // assume it exists it so that the `resolve` method works!
    if (importedFile !== containingFile && !this.context.fileExists(importedFile)) {
      this.context.assumeFileExists(importedFile);
    }

    containingFile = this.rewriteGenDirPath(containingFile);
    const containingDir = path.dirname(containingFile);
    // drop extension
    importedFile = importedFile.replace(EXT, '');

    const nodeModulesIndex = importedFile.indexOf(NODE_MODULES);
    const importModule = nodeModulesIndex === -1 ?
        null :
        importedFile.substring(nodeModulesIndex + NODE_MODULES.length);
    const isGeneratedFile = IS_GENERATED.test(importedFile);

    if (isGeneratedFile) {
      // rewrite to genDir path
      if (importModule) {
        // it is generated, therefore we do a relative path to the factory
        return this.dotRelative(containingDir, this.genDir + NODE_MODULES + importModule);
      } else {
        // assume that import is also in `genDir`
        importedFile = this.rewriteGenDirPath(importedFile);
        return this.dotRelative(containingDir, importedFile);
      }
    } else {
      // user code import
      if (importModule) {
        return importModule;
      } else {
        if (!this.isGenDirChildOfRootDir) {
          // assume that they are on top of each other.
          importedFile = importedFile.replace(this.basePath, this.genDir);
        }
        if (SHALLOW_IMPORT.test(importedFile)) {
          return importedFile;
        }
        return this.dotRelative(containingDir, importedFile);
      }
    }
  }

  resourceNameToFileName(m: string, containingFile: string): string {
    return this.urlResolver.resolve(containingFile, m);
  }

  /**
   * Moves the path into `genDir` folder while preserving the `node_modules` directory.
   */
  private rewriteGenDirPath(filepath: string) {
    const nodeModulesIndex = filepath.indexOf(NODE_MODULES);
    if (nodeModulesIndex !== -1) {
      // If we are in node_modules, transplant them into `genDir`.
      return path.join(this.genDir, filepath.substring(nodeModulesIndex));
    } else {
      // pretend that containing file is on top of the `genDir` to normalize the paths.
      // we apply the `genDir` => `rootDir` delta through `rootDirPrefix` later.
      return filepath.replace(this.basePath, this.genDir);
    }
  }

  private dotRelative(from: string, to: string): string {
    const rPath: string = path.relative(from, to).replace(/\\/g, '/');
    return rPath.startsWith('.') ? rPath : './' + rPath;
  }
}

export class CompilerHostContextAdapter {
  protected assumedExists: {[fileName: string]: boolean} = {};

  assumeFileExists(fileName: string): void { this.assumedExists[fileName] = true; }
}

export class ModuleResolutionHostAdapter extends CompilerHostContextAdapter implements
    CompilerHostContext {
  public directoryExists: ((directoryName: string) => boolean)|undefined;

  constructor(private host: ts.ModuleResolutionHost) {
    super();
    if (host.directoryExists) {
      this.directoryExists = (directoryName: string) => host.directoryExists !(directoryName);
    }
  }

  fileExists(fileName: string): boolean {
    return this.assumedExists[fileName] || this.host.fileExists(fileName);
  }

  readFile(fileName: string): string { return this.host.readFile(fileName); }

  readResource(s: string) {
    if (!this.host.fileExists(s)) {
      // TODO: We should really have a test for error cases like this!
      throw new Error(`Compilation failed. Resource file not found: ${s}`);
    }
    return Promise.resolve(this.host.readFile(s));
  }
}

export class NodeCompilerHostContext extends CompilerHostContextAdapter implements
    CompilerHostContext {
  fileExists(fileName: string): boolean {
    return this.assumedExists[fileName] || fs.existsSync(fileName);
  }

  directoryExists(directoryName: string): boolean {
    try {
      return fs.statSync(directoryName).isDirectory();
    } catch (e) {
      return false;
    }
  }

  readFile(fileName: string): string { return fs.readFileSync(fileName, 'utf8'); }

  readResource(s: string) {
    if (!this.fileExists(s)) {
      // TODO: We should really have a test for error cases like this!
      throw new Error(`Compilation failed. Resource file not found: ${s}`);
    }
    return Promise.resolve(this.readFile(s));
  }
}
