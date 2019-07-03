/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import * as ts from 'typescript';
import {AbsoluteFsPath, FileSystem, absoluteFrom} from '../../../src/ngtsc/file_system';
import {NgtscCompilerHost} from '../../../src/ngtsc/file_system/src/compiler_host';
import {PathMappings} from '../utils';
import {BundleProgram, makeBundleProgram} from './bundle_program';
import {EntryPoint, EntryPointFormat, EntryPointJsonProperty} from './entry_point';
import {NgccSourcesCompilerHost} from './ngcc_compiler_host';

/**
 * A bundle of files and paths (and TS programs) that correspond to a particular
 * format of a package entry-point.
 */
export interface EntryPointBundle {
  entryPoint: EntryPoint;
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
 * @param fs The current file-system being used.
 * @param entryPoint The entry-point that contains the bundle.
 * @param formatPath The path to the source files for this bundle.
 * @param isCore This entry point is the Angular core package.
 * @param formatProperty The property in the package.json that holds the formatPath.
 * @param format The underlying format of the bundle.
 * @param transformDts Whether to transform the typings along with this bundle.
 * @param pathMappings An optional set of mappings to use when compiling files.
 * @param mirrorDtsFromSrc If true then the `dts` program will contain additional files that
 * were guessed by mapping the `src` files to `dts` files.
 */
export function makeEntryPointBundle(
    fs: FileSystem, entryPoint: EntryPoint, formatPath: string, isCore: boolean,
    formatProperty: EntryPointJsonProperty, format: EntryPointFormat, transformDts: boolean,
    pathMappings?: PathMappings, mirrorDtsFromSrc: boolean = false): EntryPointBundle|null {
  // Create the TS program and necessary helpers.
  const options: ts.CompilerOptions = {
    allowJs: true,
    maxNodeModuleJsDepth: Infinity,
    noLib: true,
    rootDir: entryPoint.path, ...pathMappings
  };
  const srcHost = new NgccSourcesCompilerHost(fs, options, entryPoint.path);
  const dtsHost = new NgtscCompilerHost(fs, options);
  const rootDirs = [absoluteFrom(entryPoint.path)];

  // Create the bundle programs, as necessary.
  const absFormatPath = fs.resolve(entryPoint.path, formatPath);
  const typingsPath = fs.resolve(entryPoint.path, entryPoint.typings);
  const src = makeBundleProgram(fs, isCore, absFormatPath, 'r3_symbols.js', options, srcHost);
  const additionalDtsFiles = transformDts && mirrorDtsFromSrc ?
      computePotentialDtsFilesFromJsFiles(fs, src.program, absFormatPath, typingsPath) :
      [];
  const dts = transformDts ?
      makeBundleProgram(
          fs, isCore, typingsPath, 'r3_symbols.d.ts', options, dtsHost, additionalDtsFiles) :
      null;
  const isFlatCore = isCore && src.r3SymbolsFile === null;

  return {entryPoint, format, formatProperty, rootDirs, isCore, isFlatCore, src, dts};
}

function computePotentialDtsFilesFromJsFiles(
    fs: FileSystem, srcProgram: ts.Program, formatPath: AbsoluteFsPath,
    typingsPath: AbsoluteFsPath) {
  const relativePath = fs.relative(fs.dirname(formatPath), fs.dirname(typingsPath));
  const additionalFiles: AbsoluteFsPath[] = [];
  for (const sf of srcProgram.getSourceFiles()) {
    if (!sf.fileName.endsWith('.js')) {
      continue;
    }
    const dtsPath = fs.resolve(
        fs.dirname(sf.fileName), relativePath, fs.basename(sf.fileName, '.js') + '.d.ts');
    if (fs.exists(dtsPath)) {
      additionalFiles.push(dtsPath);
    }
  }
  return additionalFiles;
}