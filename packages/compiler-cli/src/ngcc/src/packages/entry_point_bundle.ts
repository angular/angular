/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import * as ts from 'typescript';

import {BundleProgram, makeBundleProgram} from './bundle_program';
import {EntryPoint, EntryPointFormat} from './entry_point';


/**
 * A bundle of files and paths (and TS programs) that correspond to a particular
 * format of a package entry-point.
 */
export interface EntryPointBundle {
  format: EntryPointFormat;
  isFlat: boolean;
  rootDirs: string[];
  src: BundleProgram;
  dts: BundleProgram|null;
}

/**
 * Get an object that describes a formatted bundle for an entry-point.
 * @param entryPoint The entry-point that contains the bundle.
 * @param format The format of the bundle.
 * @param transformDts True if processing this bundle should also process its `.d.ts` files.
 */
export function makeEntryPointBundle(
    entryPoint: EntryPoint, isCore: boolean, format: EntryPointFormat,
    transformDts: boolean): EntryPointBundle|null {
  // Bail out if the entry-point does not have this format.
  const path = entryPoint[format];
  if (!path) {
    return null;
  }

  // Create the TS program and necessary helpers.
  const options: ts.CompilerOptions = {
    allowJs: true,
    maxNodeModuleJsDepth: Infinity,
    rootDir: entryPoint.path,
  };
  const host = ts.createCompilerHost(options);
  const rootDirs = [entryPoint.path];

  // Create the bundle programs, as necessary.
  const src = makeBundleProgram(isCore, path, 'r3_symbols.js', options, host);
  const dts = transformDts ?
      makeBundleProgram(isCore, entryPoint.typings, 'r3_symbols.d.ts', options, host) :
      null;
  const isFlat = src.r3SymbolsFile === null;

  return {format, rootDirs, isFlat, src, dts};
}
