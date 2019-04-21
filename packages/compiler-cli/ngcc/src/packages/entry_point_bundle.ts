/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import * as ts from 'typescript';

import {AbsoluteFsPath} from '../../../src/ngtsc/path';
import {FileSystem} from '../file_system/file_system';
import {PathMappings} from '../utils';
import {BundleProgram, makeBundleProgram} from './bundle_program';
import {EntryPointFormat, EntryPointJsonProperty} from './entry_point';
import {NgccCompilerHost} from './ngcc_compiler_host';

/**
 * A bundle of files and paths (and TS programs) that correspond to a particular
 * format of a package entry-point.
 */
export interface EntryPointBundle {
  formatProperty: EntryPointJsonProperty;
  format: EntryPointFormat;
  isCore: boolean;
  isFlatCore: boolean;
  rootDirs: AbsoluteFsPath[];
  src: BundleProgram;
  dts: BundleProgram|null;
}

/**
 * Get an object that describes a formatted bundle for an entry-point.
 * @param entryPointPath The path to the entry-point that contains the bundle.
 * @param formatPath The path to the source files for this bundle.
 * @param typingsPath The path to the typings files if we should transform them with this bundle.
 * @param isCore This entry point is the Angular core package.
 * @param format The underlying format of the bundle.
 * @param transformDts Whether to transform the typings along with this bundle.
 */
export function makeEntryPointBundle(
    fs: FileSystem, entryPointPath: string, formatPath: string, typingsPath: string,
    isCore: boolean, formatProperty: EntryPointJsonProperty, format: EntryPointFormat,
    transformDts: boolean, pathMappings?: PathMappings): EntryPointBundle|null {
  // Create the TS program and necessary helpers.
  const options: ts.CompilerOptions = {
    allowJs: true,
    maxNodeModuleJsDepth: Infinity,
    noLib: true,
    rootDir: entryPointPath, ...pathMappings
  };
  const host = new NgccCompilerHost(fs, options);
  const rootDirs = [AbsoluteFsPath.from(entryPointPath)];

  // Create the bundle programs, as necessary.
  const src = makeBundleProgram(
      fs, isCore, AbsoluteFsPath.resolve(entryPointPath, formatPath), 'r3_symbols.js', options,
      host);
  const dts = transformDts ? makeBundleProgram(
                                 fs, isCore, AbsoluteFsPath.resolve(entryPointPath, typingsPath),
                                 'r3_symbols.d.ts', options, host) :
                             null;
  const isFlatCore = isCore && src.r3SymbolsFile === null;

  return {format, formatProperty, rootDirs, isCore, isFlatCore, src, dts};
}

/**
 * Create a compiler host that resolves a module import as a JavaScript source file if available,
 * instead of the .d.ts typings file that would have been resolved by TypeScript. This is necessary
 * for packages that have their typings in the same directory as the sources, which would otherwise
 * let TypeScript prefer the .d.ts file instead of the JavaScript source file.
 * @param entryPointPath The path of the directly where the entry-point resides in.
 * @param options The compiler options to create the host from.
 */
function createCompilerHostThatPrefersJs(
    entryPointPath: string, options: ts.CompilerOptions): ts.CompilerHost {
  const host = ts.createCompilerHost(options);
  const cache = ts.createModuleResolutionCache(
      host.getCurrentDirectory(), file => host.getCanonicalFileName(file));
  host.resolveModuleNames = (moduleNames, containingFile, reusedNames, redirectedReference) => {
    return moduleNames.map(moduleName => {
      const {resolvedModule} = ts.resolveModuleName(
          moduleName, containingFile, options, host, cache, redirectedReference);

      // If the module request originated from a relative import in a JavaScript source file,
      // TypeScript may have resolved the module to its .d.ts declaration file if the .js source
      // file was in the same directory. This is undesirable, as we need to have the actual
      // JavaScript being present in the program. This logic recognizes this scenario and rewires
      // the resolved .d.ts declaration file to its .js counterpart, if it exists.
      if (resolvedModule !== undefined && resolvedModule.extension === ts.Extension.Dts &&
          containingFile.endsWith('js') &&
          (moduleName.startsWith('./') || moduleName.startsWith('../')) &&
          resolvedModule.resolvedFileName.startsWith(entryPointPath)) {
        const jsFile = resolvedModule.resolvedFileName.replace(/\.d\.ts$/, '.js');
        if (host.fileExists(jsFile)) {
          return {...resolvedModule, resolvedFileName: jsFile, extension: ts.Extension.Js};
        }
      }
      return resolvedModule;
    });
  };
  return host;
}
