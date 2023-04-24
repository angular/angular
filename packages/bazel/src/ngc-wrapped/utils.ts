/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 *
 * @fileoverview A set of common helpers related to ng compiler wrapper.
 */

import {CompilerHost as NgCompilerHost} from '@angular/compiler-cli';
import * as fs from 'fs';
import * as path from 'path';
import ts from 'typescript';

const NODE_MODULES = 'node_modules/';

export const EXT = /(\.ts|\.d\.ts|\.js|\.jsx|\.tsx)$/;

export function relativeToRootDirs(filePath: string, rootDirs: string[]): string {
  if (!filePath) return filePath;
  // NB: the rootDirs should have been sorted longest-first
  for (let i = 0; i < rootDirs.length; i++) {
    const dir = rootDirs[i];
    const rel = path.posix.relative(dir, filePath);
    if (rel.indexOf('.') !== 0) return rel;
  }
  return filePath;
}

/**
 * Adds support for the optional `fileNameToModuleName` operation to a given `ng.CompilerHost`.
 *
 * This is used within `ngc-wrapped` and the Bazel compilation flow, but is exported here to allow
 * for other consumers of the compiler to access this same logic. For example, the xi18n operation
 * in g3 configures its own `ng.CompilerHost` which also requires `fileNameToModuleName` to work
 * correctly.
 */
export function patchNgHostWithFileNameToModuleName(
    ngHost: NgCompilerHost, compilerOpts: ts.CompilerOptions, rootDirs: string[],
    workspaceName: string, compilationTargetSrc: string[],
    useManifestPathsAsModuleName: boolean): void {
  const fileNameToModuleNameCache = new Map<string, string>();
  ngHost.fileNameToModuleName = (importedFilePath: string, containingFilePath?: string) => {
    const cacheKey = `${importedFilePath}:${containingFilePath}`;
    // Memoize this lookup to avoid expensive re-parses of the same file
    // When run as a worker, the actual ts.SourceFile is cached
    // but when we don't run as a worker, there is no cache.
    // For one example target in g3, we saw a cache hit rate of 7590/7695
    if (fileNameToModuleNameCache.has(cacheKey)) {
      return fileNameToModuleNameCache.get(cacheKey)!;
    }
    const result = doFileNameToModuleName(importedFilePath, containingFilePath);
    fileNameToModuleNameCache.set(cacheKey, result);
    return result;
  };

  function doFileNameToModuleName(importedFilePath: string, containingFilePath?: string): string {
    const relativeTargetPath = relativeToRootDirs(importedFilePath, rootDirs).replace(EXT, '');
    const manifestTargetPath = `${workspaceName}/${relativeTargetPath}`;
    if (useManifestPathsAsModuleName === true) {
      return manifestTargetPath;
    }

    // Unless manifest paths are explicitly enforced, we initially check if a module name is
    // set for the given source file. The compiler host from `@bazel/concatjs` sets source
    // file module names if the compilation targets either UMD or AMD. To ensure that the AMD
    // module names match, we first consider those.
    try {
      const sourceFile = ngHost.getSourceFile(importedFilePath, ts.ScriptTarget.Latest);
      if (sourceFile && sourceFile.moduleName) {
        return sourceFile.moduleName;
      }
    } catch (err) {
      // File does not exist or parse error. Ignore this case and continue onto the
      // other methods of resolving the module below.
    }

    // It can happen that the ViewEngine compiler needs to write an import in a factory file,
    // and is using an ngsummary file to get the symbols.
    // The ngsummary comes from an upstream ng_module rule.
    // The upstream rule based its imports on ngsummary file which was generated from a
    // metadata.json file that was published to npm in an Angular library.
    // However, the ngsummary doesn't propagate the 'importAs' from the original metadata.json
    // so we would normally not be able to supply the correct module name for it.
    // For example, if the rootDir-relative filePath is
    //  node_modules/@angular/material/toolbar/typings/index
    // we would supply a module name
    //  @angular/material/toolbar/typings/index
    // but there is no JavaScript file to load at this path.
    // This is a workaround for https://github.com/angular/angular/issues/29454
    if (importedFilePath.indexOf('node_modules') >= 0) {
      const maybeMetadataFile = importedFilePath.replace(EXT, '') + '.metadata.json';
      if (fs.existsSync(maybeMetadataFile)) {
        const moduleName = (JSON.parse(fs.readFileSync(maybeMetadataFile, {encoding: 'utf-8'})) as {
                             importAs: string
                           }).importAs;
        if (moduleName) {
          return moduleName;
        }
      }
    }

    if ((compilerOpts.module === ts.ModuleKind.UMD || compilerOpts.module === ts.ModuleKind.AMD) &&
        ngHost.amdModuleName) {
      const amdName = ngHost.amdModuleName({fileName: importedFilePath} as ts.SourceFile);
      if (amdName !== undefined) {
        return amdName;
      }
    }

    // If no AMD module name has been set for the source file by the `@bazel/concatjs` compiler
    // host, and the target file is not part of a flat module node module package, we use the
    // following rules (in order):
    //    1. If target file is part of `node_modules/`, we use the package module name.
    //    2. If no containing file is specified, or the target file is part of a different
    //       compilation unit, we use a Bazel manifest path. Relative paths are not possible
    //       since we don't have a containing file, and the target file could be located in the
    //       output directory, or in an external Bazel repository.
    //    3. If both rules above didn't match, we compute a relative path between the source files
    //       since they are part of the same compilation unit.
    // Note that we don't want to always use (2) because it could mean that compilation outputs
    // are always leaking Bazel-specific paths, and the output is not self-contained. This could
    // break `esm2015` or `esm5` output for Angular package release output
    // Omit the `node_modules` prefix if the module name of an NPM package is requested.
    if (relativeTargetPath.startsWith(NODE_MODULES)) {
      return relativeTargetPath.slice(NODE_MODULES.length);
    } else if (containingFilePath == null || !compilationTargetSrc.includes(importedFilePath)) {
      return manifestTargetPath;
    }
    const containingFileDir = path.dirname(relativeToRootDirs(containingFilePath, rootDirs));
    const relativeImportPath = path.posix.relative(containingFileDir, relativeTargetPath);
    return relativeImportPath.startsWith('.') ? relativeImportPath : `./${relativeImportPath}`;
  }
}
