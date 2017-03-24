/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {StaticSymbol} from '@angular/compiler';
import {AngularCompilerOptions, ModuleMetadata} from '@angular/tsc-wrapped';
import * as fs from 'fs';
import * as path from 'path';
import * as ts from 'typescript';

import {CompilerHost, CompilerHostContext} from './compiler_host';

const EXT = /(\.ts|\.d\.ts|\.js|\.jsx|\.tsx)$/;
const DTS = /\.d\.ts$/;

/**
 * This version of the AotCompilerHost expects that the program will be compiled
 * and executed with a "path mapped" directory structure, where generated files
 * are in a parallel tree with the sources, and imported using a `./` relative
 * import. This requires using TS `rootDirs` option and also teaching the module
 * loader what to do.
 */
export class PathMappedCompilerHost extends CompilerHost {
  constructor(program: ts.Program, options: AngularCompilerOptions, context: CompilerHostContext) {
    super(program, options, context);
  }

  getCanonicalFileName(fileName: string): string {
    if (!fileName) return fileName;
    // NB: the rootDirs should have been sorted longest-first
    for (const dir of this.options.rootDirs || []) {
      if (fileName.indexOf(dir) === 0) {
        fileName = fileName.substring(dir.length);
      }
    }
    return fileName;
  }

  moduleNameToFileName(m: string, containingFile: string): string|null {
    if (!containingFile || !containingFile.length) {
      if (m.indexOf('.') === 0) {
        throw new Error('Resolution of relative paths requires a containing file.');
      }
      // Any containing file gives the same result for absolute imports
      containingFile = this.getCanonicalFileName(path.join(this.basePath, 'index.ts'));
    }
    for (const root of this.options.rootDirs || ['']) {
      const rootedContainingFile = path.join(root, containingFile);
      const resolved =
          ts.resolveModuleName(m, rootedContainingFile, this.options, this.context).resolvedModule;
      if (resolved) {
        if (this.options.traceResolution) {
          console.error('resolve', m, containingFile, '=>', resolved.resolvedFileName);
        }
        return this.getCanonicalFileName(resolved.resolvedFileName);
      }
    }
    return null;
  }

  /**
   * We want a moduleId that will appear in import statements in the generated code.
   * These need to be in a form that system.js can load, so absolute file paths don't work.
   * Relativize the paths by checking candidate prefixes of the absolute path, to see if
   * they are resolvable by the moduleResolution strategy from the CompilerHost.
   */
  fileNameToModuleName(importedFile: string, containingFile: string): string {
    if (this.options.traceResolution) {
      console.error(
          'getImportPath from containingFile', containingFile, 'to importedFile', importedFile);
    }

    // If a file does not yet exist (because we compile it later), we still need to
    // assume it exists so that the `resolve` method works!
    if (!this.context.fileExists(importedFile)) {
      if (this.options.rootDirs && this.options.rootDirs.length > 0) {
        this.context.assumeFileExists(path.join(this.options.rootDirs[0], importedFile));
      } else {
        this.context.assumeFileExists(importedFile);
      }
    }

    const resolvable = (candidate: string) => {
      const resolved = this.moduleNameToFileName(candidate, importedFile);
      return resolved && resolved.replace(EXT, '') === importedFile.replace(EXT, '');
    };

    const importModuleName = importedFile.replace(EXT, '');
    const parts = importModuleName.split(path.sep).filter(p => !!p);
    let foundRelativeImport: string = undefined !;
    for (let index = parts.length - 1; index >= 0; index--) {
      let candidate = parts.slice(index, parts.length).join(path.sep);
      if (resolvable(candidate)) {
        return candidate;
      }
      candidate = '.' + path.sep + candidate;
      if (resolvable(candidate)) {
        foundRelativeImport = candidate;
      }
    }

    if (foundRelativeImport) return foundRelativeImport;

    // Try a relative import
    const candidate = path.relative(path.dirname(containingFile), importModuleName);
    if (resolvable(candidate)) {
      return candidate;
    }

    throw new Error(
        `Unable to find any resolvable import for ${importedFile} relative to ${containingFile}`);
  }

  getMetadataFor(filePath: string): ModuleMetadata[] {
    for (const root of this.options.rootDirs || []) {
      const rootedPath = path.join(root, filePath);
      if (!this.context.fileExists(rootedPath)) {
        // If the file doesn't exists then we cannot return metadata for the file.
        // This will occur if the user refernced a declared module for which no file
        // exists for the module (i.e. jQuery or angularjs).
        continue;
      }
      if (DTS.test(rootedPath)) {
        const metadataPath = rootedPath.replace(DTS, '.metadata.json');
        if (this.context.fileExists(metadataPath)) {
          return this.readMetadata(metadataPath, rootedPath);
        }
      } else {
        const sf = this.getSourceFile(rootedPath);
        sf.fileName = sf.fileName;
        const metadata = this.metadataCollector.getMetadata(sf);
        return metadata ? [metadata] : [];
      }
    }
    return null !;
  }
}
