/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import * as ts from 'typescript';

import {AbsoluteFsPath, FileSystem, NgtscCompilerHost} from '../../../src/ngtsc/file_system';
import {initMockFileSystem} from '../../../src/ngtsc/file_system/testing';
import {performCompilation} from '../../../src/perform_compile';
import {CompilerOptions} from '../../../src/transformers/api';
import {loadStandardTestFiles, loadTestDirectory} from '../../helpers';

import {ConfigOptions} from './get_compliance_tests';

/**
 * Setup a mock file-system that is used to generate the partial files.
 *
 * @param realTestPath Absolute path (on the real file-system) to the test case being processed.
 * @returns a mock file-system containing the test case files.
 */
export function initMockTestFileSystem(realTestPath: AbsoluteFsPath): FileSystem {
  const fs = initMockFileSystem('Native');
  const testFiles = loadStandardTestFiles();
  fs.init(testFiles);
  loadTestDirectory(fs, realTestPath, getRootDirectory(fs));
  return fs;
}

/**
 * Compile the input source `files` stored in `fs`, writing the generated files to `fs`.
 *
 * @param fs The mock file-system where the input and generated files live.
 * @param files An array of paths (relative to the testPath) of input files to be compiled.
 * @param compilerOptions Any extra options to pass to the TypeScript compiler.
 * @param angularCompilerOptions Any extra options to pass to the Angular compiler.
 * @returns A collection of paths of the generated files (absolute within the mock file-system).
 */
export function compileTest(
    fs: FileSystem, files: string[], compilerOptions: ConfigOptions|undefined,
    angularCompilerOptions: ConfigOptions|undefined): AbsoluteFsPath[] {
  const rootDir = getRootDirectory(fs);
  const outDir = getBuildOutputDirectory(fs);
  const options = getOptions(rootDir, outDir, compilerOptions, angularCompilerOptions);
  const rootNames = files.map(f => fs.resolve(f));
  const host = new NgtscCompilerHost(fs, options);
  const {diagnostics, emitResult} = performCompilation({rootNames, host, options});
  if (diagnostics.length > 0) {
    console.warn(diagnostics.map(d => d.messageText).join('\n'));
  }
  return emitResult!.emittedFiles!.map(p => fs.resolve(rootDir, p));
}

/**
 * Gets an absolute path (in the mock file-system) of the root directory where the compilation is to
 * be done.
 *
 * @param fs the mock file-system where the compilation is happening.
 */
export function getRootDirectory(fs: FileSystem): AbsoluteFsPath {
  return fs.resolve('/');
}

/**
 * Gets an absolute path (in the mock file-system) of the directory where the compiled files are
 * stored.
 *
 * @param fs the mock file-system where the compilation is happening.
 */
export function getBuildOutputDirectory(fs: FileSystem): AbsoluteFsPath {
  return fs.resolve('/built');
}

/**
 * Get the options object to pass to the compiler.
 *
 * @param rootDir The absolute path (within the mock file-system) that is the root of the
 *     compilation.
 * @param outDir The absolute path (within the mock file-system) where compiled files will be
 *     written.
 * @param compilerOptions Additional options for the TypeScript compiler.
 * @param angularCompilerOptions Additional options for the Angular compiler.
 */
function getOptions(
    rootDir: AbsoluteFsPath, outDir: AbsoluteFsPath, compilerOptions: ConfigOptions|undefined,
    angularCompilerOptions: ConfigOptions|undefined): CompilerOptions {
  return {
    emitDecoratorMetadata: true,
    experimentalDecorators: true,
    skipLibCheck: true,
    noImplicitAny: true,
    noEmitOnError: true,
    listEmittedFiles: true,
    strictNullChecks: true,
    outDir,
    rootDir,
    baseUrl: '.',
    allowJs: true,
    declaration: true,
    target: ts.ScriptTarget.ES2015,
    newLine: ts.NewLineKind.LineFeed,
    module: ts.ModuleKind.ES2015,
    moduleResolution: ts.ModuleResolutionKind.NodeJs,
    typeRoots: ['node_modules/@types'],
    ...ts.convertCompilerOptionsFromJson({compilerOptions}, rootDir).options,
    enableIvy: true,
    ivyTemplateTypeCheck: false,
    ...angularCompilerOptions,
  };
}
