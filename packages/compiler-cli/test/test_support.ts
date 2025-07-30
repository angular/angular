/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
/// <reference types="node" />
import * as fs from 'fs';
import * as path from 'path';
import ts from 'typescript';

import * as ng from '../index';
import {NodeJSFileSystem, setFileSystem} from '../src/ngtsc/file_system';
import {getAngularPackagesFromRunfiles, resolveFromRunfiles} from '../src/ngtsc/testing';

// TEST_TMPDIR is always set by Bazel.
const tmpdir = process.env['TEST_TMPDIR']!;

export function makeTempDir(): string {
  let dir: string;
  while (true) {
    const id = (Math.random() * 1000000).toFixed(0);
    dir = path.posix.join(tmpdir, `tmp.${id}`);
    if (!fs.existsSync(dir)) break;
  }
  fs.mkdirSync(dir);
  return dir;
}

export interface TestSupport {
  basePath: string;
  write(fileName: string, content: string): void;
  writeFiles(...mockDirs: {[fileName: string]: string}[]): void;
  createCompilerOptions(overrideOptions?: ng.CompilerOptions): ng.CompilerOptions;
  shouldExist(fileName: string): void;
  shouldNotExist(fileName: string): void;
}

function createTestSupportFor(basePath: string) {
  // Typescript uses identity comparison on `paths` and other arrays in order to determine
  // if program structure can be reused for incremental compilation, so we reuse the default
  // values unless overridden, and freeze them so that they can't be accidentally changed somewhere
  // in tests.
  const defaultCompilerOptions = {
    basePath,
    'experimentalDecorators': true,
    'skipLibCheck': true,
    'strict': true,
    'strictPropertyInitialization': false,
    'types': Object.freeze([] as string[]) as string[],
    'outDir': path.resolve(basePath, 'built'),
    'rootDir': basePath,
    'baseUrl': basePath,
    'declaration': true,
    'target': ts.ScriptTarget.ES5,
    'newLine': ts.NewLineKind.LineFeed,
    'module': ts.ModuleKind.ES2015,
    'moduleResolution': ts.ModuleResolutionKind.Node10,
    'lib': Object.freeze([
      path.resolve(basePath, 'node_modules/typescript/lib/lib.es6.d.ts'),
    ]) as string[],
    'paths': Object.freeze({'@angular/*': ['./node_modules/@angular/*']}) as {
      [index: string]: string[];
    },
  };

  return {
    // We normalize the basePath into a posix path, so that multiple assertions which compare
    // paths don't need to normalize the path separators each time.
    basePath: normalizeSeparators(basePath),
    write,
    writeFiles,
    createCompilerOptions,
    shouldExist,
    shouldNotExist,
  };

  function ensureDirExists(absolutePathToDir: string) {
    if (fs.existsSync(absolutePathToDir)) {
      if (!fs.statSync(absolutePathToDir).isDirectory()) {
        throw new Error(`'${absolutePathToDir}' exists and is not a directory.`);
      }
    } else {
      const parentDir = path.dirname(absolutePathToDir);
      ensureDirExists(parentDir);
      fs.mkdirSync(absolutePathToDir);
    }
  }

  function write(fileName: string, content: string) {
    const absolutePathToFile = path.resolve(basePath, fileName);
    ensureDirExists(path.dirname(absolutePathToFile));
    fs.writeFileSync(absolutePathToFile, content);
  }

  function writeFiles(...mockDirs: {[fileName: string]: string}[]) {
    mockDirs.forEach((dir) => {
      Object.keys(dir).forEach((fileName) => {
        write(fileName, dir[fileName]);
      });
    });
  }

  function createCompilerOptions(overrideOptions: ng.CompilerOptions = {}): ng.CompilerOptions {
    return {...defaultCompilerOptions, ...overrideOptions};
  }

  function shouldExist(fileName: string) {
    if (!fs.existsSync(path.resolve(basePath, fileName))) {
      throw new Error(`Expected ${fileName} to be emitted (basePath: ${basePath})`);
    }
  }

  function shouldNotExist(fileName: string) {
    if (fs.existsSync(path.resolve(basePath, fileName))) {
      throw new Error(`Did not expect ${fileName} to be emitted (basePath: ${basePath})`);
    }
  }
}

export function setupBazelTo(tmpDirPath: string) {
  const nodeModulesPath = path.join(tmpDirPath, 'node_modules');
  const angularDirectory = path.join(nodeModulesPath, '@angular');

  fs.mkdirSync(nodeModulesPath);
  fs.mkdirSync(angularDirectory);

  getAngularPackagesFromRunfiles().forEach(({pkgPath, name}) => {
    fs.symlinkSync(pkgPath, path.join(angularDirectory, name), 'junction');
  });

  // Link typescript
  const typeScriptSource = resolveFromRunfiles('angular/node_modules/typescript');
  const typescriptDest = path.join(nodeModulesPath, 'typescript');
  fs.symlinkSync(typeScriptSource, typescriptDest, 'junction');

  // Link "rxjs" if it has been set up as a runfile. "rxjs" is linked optionally because
  // not all compiler-cli tests need "rxjs" set up.
  try {
    const rxjsSource = resolveFromRunfiles('angular/node_modules/rxjs');
    const rxjsDest = path.join(nodeModulesPath, 'rxjs');
    fs.symlinkSync(rxjsSource, rxjsDest, 'junction');
  } catch (e: any) {
    if (e.code !== 'MODULE_NOT_FOUND') throw e;
  }
}

export function setup(): TestSupport {
  // // `TestSupport` provides its own file-system abstraction so we just use
  // // the native `NodeJSFileSystem` under the hood.
  setFileSystem(new NodeJSFileSystem());
  const tmpDirPath = makeTempDir();
  setupBazelTo(tmpDirPath);
  return createTestSupportFor(tmpDirPath);
}

export function expectNoDiagnostics(options: ng.CompilerOptions, diags: readonly ts.Diagnostic[]) {
  const errorDiags = diags.filter((d) => d.category !== ts.DiagnosticCategory.Message);
  if (errorDiags.length) {
    throw new Error(`Expected no diagnostics: ${ng.formatDiagnostics(errorDiags)}`);
  }
}

export function expectNoDiagnosticsInProgram(options: ng.CompilerOptions, p: ng.Program) {
  expectNoDiagnostics(options, [
    ...p.getNgStructuralDiagnostics(),
    ...p.getTsSemanticDiagnostics(),
    ...p.getNgSemanticDiagnostics(),
  ]);
}

export function normalizeSeparators(path: string): string {
  return path.replace(/\\/g, '/');
}

const STRIP_ANSI = /\x1B\x5B\d+m/g;

export function stripAnsi(diags: string): string {
  return diags.replace(STRIP_ANSI, '');
}
