/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import ts from 'typescript';

import {AbsoluteFsPath, FileSystem, PathManipulation, ReadonlyFileSystem} from '../../../src/ngtsc/file_system';
import {initMockFileSystem} from '../../../src/ngtsc/file_system/testing';
import {loadStandardTestFiles, loadTestDirectory, NgtscTestCompilerHost} from '../../../src/ngtsc/testing';
import {performCompilation} from '../../../src/perform_compile';
import {CompilerOptions} from '../../../src/transformers/api';

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
  monkeyPatchReadFile(fs);
  return fs;
}

/** The result of compiling a test-case. */
export interface CompileResult {
  emittedFiles: AbsoluteFsPath[];
  errors: string[];
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
    angularCompilerOptions: ConfigOptions|undefined): CompileResult {
  const rootDir = getRootDirectory(fs);
  const outDir = getBuildOutputDirectory(fs);
  const options = getOptions(rootDir, outDir, compilerOptions, angularCompilerOptions);
  const rootNames = files.map(f => fs.resolve(f));
  const host = new NgtscTestCompilerHost(fs, options);
  const {diagnostics, emitResult} = performCompilation({rootNames, host, options});
  const emittedFiles = emitResult ? emitResult.emittedFiles!.map(p => fs.resolve(rootDir, p)) : [];
  const errors = parseDiagnostics(diagnostics);
  return {errors, emittedFiles};
}

/**
 * Gets an absolute path (in the mock file-system) of the root directory where the compilation is to
 * be done.
 *
 * @param fs the mock file-system where the compilation is happening.
 */
export function getRootDirectory(fs: PathManipulation): AbsoluteFsPath {
  return fs.resolve('/');
}

/**
 * Gets an absolute path (in the mock file-system) of the directory where the compiled files are
 * stored.
 *
 * @param fs the mock file-system where the compilation is happening.
 */
export function getBuildOutputDirectory(fs: PathManipulation): AbsoluteFsPath {
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
  const convertedCompilerOptions = ts.convertCompilerOptionsFromJson(compilerOptions, rootDir);
  if (convertedCompilerOptions.errors.length > 0) {
    throw new Error(
        'Invalid compilerOptions in test-case::\n' +
        convertedCompilerOptions.errors.map(d => d.messageText).join('\n'));
  }
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
    moduleResolution: ts.ModuleResolutionKind.Node10,
    typeRoots: ['node_modules/@types'],
    ...convertedCompilerOptions.options,
    enableI18nLegacyMessageIdFormat: false,
    ...angularCompilerOptions,
  };
}

/**
 * Replace escaped line-ending markers (\r\n) with real line-ending characters.
 *
 * This allows us to simulate, more reliably, files that have `\r\n` line-endings.
 * (See `test_cases/r3_view_compiler_i18n/line_ending_normalization/template.html`.)
 */
function monkeyPatchReadFile(fs: ReadonlyFileSystem): void {
  const originalReadFile = fs.readFile;
  fs.readFile = (path: AbsoluteFsPath): string => {
    const file = originalReadFile.call(fs, path);
    return file
        // First convert actual `\r\n` sequences to `\n`
        .replace(/\r\n/g, '\n')
        // unescape `\r\n` at the end of a line
        .replace(/\\r\\n\n/g, '\r\n')
        // unescape `\\r\\n`, at the end of a line, to `\r\n`
        .replace(/\\\\r\\\\n(\r?\n)/g, '\\r\\n$1');
  };
}

/**
 * Parse the `diagnostics` to extract an error message string.
 *
 * The error message includes the location if available.
 *
 * @param diagnostics The diagnostics to parse.
 */
function parseDiagnostics(diagnostics: readonly ts.Diagnostic[]): string[] {
  return diagnostics.map(diagnostic => {
    const message = ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n');
    if ('file' in diagnostic && diagnostic.file !== undefined && diagnostic.start !== undefined) {
      const {line, character} = diagnostic.file.getLineAndCharacterOfPosition(diagnostic.start);
      return `${diagnostic.file.fileName} (${line + 1},${character + 1}): ${message}`;
    } else {
      return message;
    }
  });
}
