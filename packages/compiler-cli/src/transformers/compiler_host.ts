/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {syntaxError} from '@angular/compiler';
import * as path from 'path';
import * as ts from 'typescript';

import {CompilerHost, CompilerOptions} from './api';

const NODE_MODULES_PACKAGE_NAME = /node_modules\/((\w|-)+|(@(\w|-)+\/(\w|-)+))/;
const DTS = /\.d\.ts$/;
const EXT = /(\.ts|\.d\.ts|\.js|\.jsx|\.tsx)$/;

export function createCompilerHost(
    {options, tsHost = ts.createCompilerHost(options, true)}:
        {options: CompilerOptions, tsHost?: ts.CompilerHost}): CompilerHost {
  const mixin = new CompilerHostMixin(tsHost, options);
  const host = Object.create(tsHost);

  host.moduleNameToFileName = mixin.moduleNameToFileName.bind(mixin);
  host.fileNameToModuleName = mixin.fileNameToModuleName.bind(mixin);
  host.toSummaryFileName = mixin.toSummaryFileName.bind(mixin);
  host.fromSummaryFileName = mixin.fromSummaryFileName.bind(mixin);
  host.resourceNameToFileName = mixin.resourceNameToFileName.bind(mixin);

  // Make sure we do not `host.realpath()` from TS as we do not want to resolve symlinks.
  // https://github.com/Microsoft/TypeScript/issues/9552
  host.realpath = (fileName: string) => fileName;

  return host;
}

class CompilerHostMixin {
  private rootDirs: string[];
  private basePath: string;
  private moduleResolutionHost: ModuleFilenameResolutionHost;
  private moduleResolutionCache: ts.ModuleResolutionCache;

  constructor(private context: ts.CompilerHost, private options: CompilerOptions) {
    // normalize the path so that it never ends with '/'.
    this.basePath = normalizePath(this.options.basePath !);
    this.rootDirs = (this.options.rootDirs || [
                      this.options.basePath !
                    ]).map(p => path.resolve(this.basePath, normalizePath(p)));
    this.moduleResolutionHost = createModuleFilenameResolverHost(context);
    this.moduleResolutionCache = ts.createModuleResolutionCache(
        this.context.getCurrentDirectory !(), this.context.getCanonicalFileName.bind(this.context));
  }

  moduleNameToFileName(m: string, containingFile: string): string|null {
    if (!containingFile) {
      if (m.indexOf('.') === 0) {
        throw new Error('Resolution of relative paths requires a containing file.');
      }
      // Any containing file gives the same result for absolute imports
      containingFile = path.join(this.basePath, 'index.ts');
    }
    const resolved = ts.resolveModuleName(
                           m, containingFile.replace(/\\/g, '/'), this.options,
                           this.moduleResolutionHost, this.moduleResolutionCache)
                         .resolvedModule;
    if (resolved) {
      if (this.options.traceResolution) {
        console.error('resolve', m, containingFile, '=>', resolved.resolvedFileName);
      }
      return resolved.resolvedFileName;
    }
    return null;
  }

  /**
   * We want a moduleId that will appear in import statements in the generated code
   * which will be written to `containingFile`.
   *
   * Note that we also generate files for files in node_modules, as libraries
   * only ship .metadata.json files but not the generated code.
   *
   * Logic:
   * 1. if the importedFile and the containingFile are from the project sources
   *    or from the same node_modules package, use a relative path
   * 2. if the importedFile is in a node_modules package,
   *    use a path that starts with the package name.
   * 3. Error if the containingFile is in the node_modules package
   *    and the importedFile is in the project soures,
   *    as that is a violation of the principle that node_modules packages cannot
   *    import project sources.
   */
  fileNameToModuleName(importedFile: string, containingFile: string): string {
    const originalImportedFile = importedFile;
    if (this.options.traceResolution) {
      console.error(
          'fileNameToModuleName from containingFile', containingFile, 'to importedFile',
          importedFile);
    }
    // If a file does not yet exist (because we compile it later), we still need to
    // assume it exists it so that the `resolve` method works!
    if (!this.moduleResolutionHost.fileExists(importedFile)) {
      this.moduleResolutionHost.assumeFileExists(importedFile);
    }
    // drop extension
    importedFile = importedFile.replace(EXT, '');
    const importedFilePackagName = getPackageName(importedFile);
    const containingFilePackageName = getPackageName(containingFile);

    let moduleName: string;
    if (importedFilePackagName === containingFilePackageName) {
      const rootedContainingFile = stripRootDir(this.rootDirs, containingFile);
      const rootedImportedFile = stripRootDir(this.rootDirs, importedFile);

      if (rootedContainingFile !== containingFile && rootedImportedFile !== importedFile) {
        // if both files are contained in the `rootDirs`, then strip the rootDirs
        containingFile = rootedContainingFile;
        importedFile = rootedImportedFile;
      }
      moduleName = dotRelative(path.dirname(containingFile), importedFile);
    } else if (importedFilePackagName) {
      moduleName = stripNodeModulesPrefix(importedFile);
    } else {
      throw new Error(
          `Trying to import a source file from a node_modules package: import ${originalImportedFile} from ${containingFile}`);
    }
    return moduleName;
  }

  toSummaryFileName(fileName: string, referringSrcFileName: string): string {
    return this.fileNameToModuleName(fileName, referringSrcFileName);
  }

  fromSummaryFileName(fileName: string, referringLibFileName: string): string {
    const resolved = this.moduleNameToFileName(fileName, referringLibFileName);
    if (!resolved) {
      throw new Error(`Could not resolve ${fileName} from ${referringLibFileName}`);
    }
    return resolved;
  }

  resourceNameToFileName(resourceName: string, containingFile: string): string|null {
    // Note: we convert package paths into relative paths to be compatible with the the
    // previous implementation of UrlResolver.
    if (resourceName && resourceName.charAt(0) !== '.' && !path.isAbsolute(resourceName)) {
      resourceName = `./${resourceName}`;
    }
    const filePathWithNgResource =
        this.moduleNameToFileName(addNgResourceSuffix(resourceName), containingFile);
    return filePathWithNgResource ? stripNgResourceSuffix(filePathWithNgResource) : null;
  }
}

interface ModuleFilenameResolutionHost extends ts.ModuleResolutionHost {
  assumeFileExists(fileName: string): void;
}

function createModuleFilenameResolverHost(host: ts.ModuleResolutionHost):
    ModuleFilenameResolutionHost {
  const assumedExists = new Set<string>();
  const resolveModuleNameHost = Object.create(host);
  // When calling ts.resolveModuleName, additional allow checks for .d.ts files to be done based on
  // checks for .ngsummary.json files, so that our codegen depends on fewer inputs and requires
  // to be called less often.
  // This is needed as we use ts.resolveModuleName in DefaultModuleFilenameResolver
  // and it should be able to resolve summary file names.
  resolveModuleNameHost.fileExists = (fileName: string): boolean => {
    fileName = stripNgResourceSuffix(fileName);
    if (assumedExists.has(fileName)) {
      return true;
    }

    if (host.fileExists(fileName)) {
      return true;
    }

    if (DTS.test(fileName)) {
      const base = fileName.substring(0, fileName.length - 5);
      return host.fileExists(base + '.ngsummary.json');
    }

    return false;
  };

  resolveModuleNameHost.assumeFileExists = (fileName: string) => assumedExists.add(fileName);
  // Make sure we do not `host.realpath()` from TS as we do not want to resolve symlinks.
  // https://github.com/Microsoft/TypeScript/issues/9552
  resolveModuleNameHost.realpath = (fileName: string) => fileName;

  return resolveModuleNameHost;
}

function dotRelative(from: string, to: string): string {
  const rPath: string = path.relative(from, to).replace(/\\/g, '/');
  return rPath.startsWith('.') ? rPath : './' + rPath;
}

/**
 * Moves the path into `genDir` folder while preserving the `node_modules` directory.
 */
function getPackageName(filePath: string): string|null {
  const match = NODE_MODULES_PACKAGE_NAME.exec(filePath);
  return match ? match[1] : null;
}

function stripRootDir(rootDirs: string[], fileName: string): string {
  if (!fileName) return fileName;
  // NB: the rootDirs should have been sorted longest-first
  for (const dir of rootDirs) {
    if (fileName.indexOf(dir) === 0) {
      fileName = fileName.substring(dir.length);
      break;
    }
  }
  return fileName;
}

function stripNodeModulesPrefix(filePath: string): string {
  return filePath.replace(/.*node_modules\//, '');
}

function getNodeModulesPrefix(filePath: string): string|null {
  const match = /.*node_modules\//.exec(filePath);
  return match ? match[1] : null;
}

function normalizePath(p: string): string {
  return path.normalize(path.join(p, '.')).replace(/\\/g, '/');
}

function stripNgResourceSuffix(fileName: string): string {
  return fileName.replace(/\.\$ngresource\$.*/, '');
}

function addNgResourceSuffix(fileName: string): string {
  return `${fileName}.$ngresource$`;
}
