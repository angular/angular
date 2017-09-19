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

const tmpdir = process.env.TEST_TMPDIR || os.tmpdir();

function getNgRootDir() {
  const moduleFilename = module.filename.replace(/\\/g, '/');
  const distIndex = moduleFilename.indexOf('/dist/all');
  return moduleFilename.substr(0, distIndex);
}

export function writeTempFile(name: string, contents: string): string {
  // TEST_TMPDIR is set by bazel.
  const id = (Math.random() * 1000000).toFixed(0);
  const fn = path.join(tmpdir, `tmp.${id}.${name}`);
  fs.writeFileSync(fn, contents);
  return fn;
}

export function makeTempDir(): string {
  const id = (Math.random() * 1000000).toFixed(0);
  const dir = path.join(tmpdir, `tmp.${id}`);
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

export function setup(): TestSupport {
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

  return {basePath, write, writeFiles, createCompilerOptions, shouldExist, shouldNotExist};

  function write(fileName: string, content: string) {
    const dir = path.dirname(fileName);
    if (dir != '.') {
      const newDir = path.join(basePath, dir);
      if (!fs.existsSync(newDir)) fs.mkdirSync(newDir);
    }
    fs.writeFileSync(path.join(basePath, fileName), content, {encoding: 'utf-8'});
  }

  function writeFiles(...mockDirs: {[fileName: string]: string}[]) {
    mockDirs.forEach(
        (dir) => { Object.keys(dir).forEach((fileName) => { write(fileName, dir[fileName]); }); });
  }

  function createCompilerOptions(overrideOptions: ng.CompilerOptions = {}): ng.CompilerOptions {
    return {
      basePath,
      'experimentalDecorators': true,
      'skipLibCheck': true,
      'strict': true,
      'types': [],
      'outDir': path.resolve(basePath, 'built'),
      'rootDir': basePath,
      'baseUrl': basePath,
      'declaration': true,
      'target': ts.ScriptTarget.ES5,
      'module': ts.ModuleKind.ES2015,
      'moduleResolution': ts.ModuleResolutionKind.NodeJs,
      'lib': [
        path.resolve(basePath, 'node_modules/typescript/lib/lib.es6.d.ts'),
      ],
      ...overrideOptions,
    };
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

export function expectNoDiagnostics(options: ng.CompilerOptions, diags: ng.Diagnostics) {
  if (diags.length) {
    throw new Error(`Expected no diagnostics: ${ng.formatDiagnostics(options, diags)}`);
  }
}

export function expectNoDiagnosticsInProgram(options: ng.CompilerOptions, p: ng.Program) {
  expectNoDiagnostics(options, [
    ...p.getNgStructuralDiagnostics(), ...p.getTsSemanticDiagnostics(),
    ...p.getNgSemanticDiagnostics()
  ]);
}
