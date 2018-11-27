/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import * as ts from 'typescript';
import * as ng from '../index';

// TEST_TMPDIR is set by bazel.
const tmpdir = process.env.TEST_TMPDIR || os.tmpdir();

function getNgRootDir() {
  const moduleFilename = module.filename.replace(/\\/g, '/');
  const distIndex = moduleFilename.indexOf('/dist/all');
  return moduleFilename.substr(0, distIndex);
}

export function writeTempFile(name: string, contents: string): string {
  const id = (Math.random() * 1000000).toFixed(0);
  const fn = path.join(tmpdir, `tmp.${id}.${name}`);
  fs.writeFileSync(fn, contents);
  return fn;
}

export function makeTempDir(): string {
  let dir: string;
  while (true) {
    const id = (Math.random() * 1000000).toFixed(0);
    dir = path.join(tmpdir, `tmp.${id}`);
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
  // values unless overriden, and freeze them so that they can't be accidentaly changed somewhere
  // in tests.
  const defaultCompilerOptions = {
    basePath,
    'experimentalDecorators': true,
    'skipLibCheck': true,
    'strict': true,
    'strictPropertyInitialization': false,
    'types': Object.freeze<string>([]) as string[],
    'outDir': path.resolve(basePath, 'built'),
    'rootDir': basePath,
    'baseUrl': basePath,
    'declaration': true,
    'target': ts.ScriptTarget.ES5,
    'module': ts.ModuleKind.ES2015,
    'moduleResolution': ts.ModuleResolutionKind.NodeJs,
    'lib': Object.freeze([
      path.resolve(basePath, 'node_modules/typescript/lib/lib.es6.d.ts'),
    ]) as string[],
    // clang-format off
    'paths': Object.freeze({'@angular/*': ['./node_modules/@angular/*']}) as {[index: string]: string[]}
    // clang-format on
  };


  return {basePath, write, writeFiles, createCompilerOptions, shouldExist, shouldNotExist};

  function write(fileName: string, content: string) {
    const dir = path.dirname(fileName);
    if (dir != '.') {
      const newDir = path.resolve(basePath, dir);
      if (!fs.existsSync(newDir)) fs.mkdirSync(newDir);
    }
    fs.writeFileSync(path.resolve(basePath, fileName), content, {encoding: 'utf-8'});
  }

  function writeFiles(...mockDirs: {[fileName: string]: string}[]) {
    mockDirs.forEach(
        (dir) => { Object.keys(dir).forEach((fileName) => { write(fileName, dir[fileName]); }); });
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

export function setupBazelTo(basePath: string) {
  if (!process.env.TEST_SRCDIR) {
    throw new Error('`setupBazelTo()` must only be called from in a Bazel job.');
  }
  const sources = process.env.TEST_SRCDIR;
  const packages = path.join(sources, 'angular/packages');
  const nodeModulesPath = path.join(basePath, 'node_modules');
  const angularDirectory = path.join(nodeModulesPath, '@angular');
  fs.mkdirSync(nodeModulesPath);

  // Link the built angular packages
  fs.mkdirSync(angularDirectory);
  const packageNames = fs.readdirSync(packages).filter(
      name => fs.statSync(path.join(packages, name)).isDirectory() &&
          fs.existsSync(path.join(packages, name, 'npm_package')));
  for (const pkg of packageNames) {
    fs.symlinkSync(path.join(packages, `${pkg}/npm_package`), path.join(angularDirectory, pkg));
  }

  // Link rxjs
  const rxjsSource = path.join(sources, 'rxjs');
  const rxjsDest = path.join(nodeModulesPath, 'rxjs');
  if (fs.existsSync(rxjsSource)) {
    fs.symlinkSync(rxjsSource, rxjsDest);
  }

  // Link typescript
  const typescriptSource = path.join(sources, 'ngdeps/node_modules/typescript');
  const typescriptDest = path.join(nodeModulesPath, 'typescript');
  if (fs.existsSync(typescriptSource)) {
    fs.symlinkSync(typescriptSource, typescriptDest);
  }
}

function setupBazel(): TestSupport {
  const basePath = makeTempDir();
  setupBazelTo(basePath);
  return createTestSupportFor(basePath);
}

function setupTestSh(): TestSupport {
  const basePath = makeTempDir();

  const ngRootDir = getNgRootDir();
  const nodeModulesPath = path.resolve(basePath, 'node_modules');
  fs.mkdirSync(nodeModulesPath);
  fs.symlinkSync(
      path.resolve(ngRootDir, 'dist', 'all', '@angular'),
      path.resolve(nodeModulesPath, '@angular'));
  fs.symlinkSync(
      path.resolve(ngRootDir, 'node_modules', 'rxjs'), path.resolve(nodeModulesPath, 'rxjs'));
  fs.symlinkSync(
      path.resolve(ngRootDir, 'node_modules', 'typescript'),
      path.resolve(nodeModulesPath, 'typescript'));

  return createTestSupportFor(basePath);
}

export function isInBazel() {
  return process.env.TEST_SRCDIR != null;
}

export function setup(): TestSupport {
  return isInBazel() ? setupBazel() : setupTestSh();
}

export function expectNoDiagnostics(options: ng.CompilerOptions, diags: ng.Diagnostics) {
  const errorDiags = diags.filter(d => d.category !== ts.DiagnosticCategory.Message);
  if (errorDiags.length) {
    throw new Error(`Expected no diagnostics: ${ng.formatDiagnostics(errorDiags)}`);
  }
}

export function expectNoDiagnosticsInProgram(options: ng.CompilerOptions, p: ng.Program) {
  expectNoDiagnostics(options, [
    ...p.getNgStructuralDiagnostics(), ...p.getTsSemanticDiagnostics(),
    ...p.getNgSemanticDiagnostics()
  ]);
}
