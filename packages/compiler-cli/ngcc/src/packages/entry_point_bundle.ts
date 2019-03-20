/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {resolve} from 'canonical-path';
import * as ts from 'typescript';

import {AbsoluteFsPath} from '../../../src/ngtsc/path';
import {BundleProgram, makeBundleProgram} from './bundle_program';
import {EntryPointFormat, EntryPointJsonProperty} from './entry_point';



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
    entryPointPath: string, formatPath: string, typingsPath: string, isCore: boolean,
    formatProperty: EntryPointJsonProperty, format: EntryPointFormat,
    transformDts: boolean): EntryPointBundle|null {
  // Create the TS program and necessary helpers.
  const options: ts.CompilerOptions = {
    allowJs: true,
    maxNodeModuleJsDepth: Infinity,
    rootDir: entryPointPath,
  };
  const host = ts.createCompilerHost(options);
  const rootDirs = [AbsoluteFsPath.from(entryPointPath)];

  // Create the bundle programs, as necessary.
  const src = makeBundleProgram(
      isCore, resolve(entryPointPath, formatPath), 'r3_symbols.js', options, host);
  const dts = transformDts ?
      makeBundleProgram(
          isCore, resolve(entryPointPath, typingsPath), 'r3_symbols.d.ts', options, host) :
      null;
  const isFlatCore = isCore && src.r3SymbolsFile === null;

  return {format, formatProperty, rootDirs, isCore, isFlatCore, src, dts};
}
