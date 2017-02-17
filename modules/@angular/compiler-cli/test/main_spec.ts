/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ɵReflectionCapabilities, ɵreflector} from '@angular/core';
import {makeTempDir} from '@angular/tsc-wrapped/test/test_support';
import * as fs from 'fs';
import * as path from 'path';

import {main} from '../src/main';


describe('compiler-cli', () => {
  let basePath: string;
  let write: (fileName: string, content: string) => void;

  beforeEach(() => {
    basePath = makeTempDir();
    write = (fileName: string, content: string) => {
      fs.writeFileSync(path.join(basePath, fileName), content, {encoding: 'utf-8'});
    };
    write('tsconfig.json', `{
      "compilerOptions": {
        "experimentalDecorators": true,
        "types": [],
        "outDir": "built",
        "declaration": true,
        "module": "es2015",
        "moduleResolution": "node"
      },
      "angularCompilerOptions": {
        "annotateForClosureCompiler": true
      },
      "files": ["test.ts"]
    }`);
    const nodeModulesPath = path.resolve(basePath, 'node_modules');
    fs.mkdirSync(nodeModulesPath);
    fs.symlinkSync(path.resolve(__dirname, '..', '..'), path.resolve(nodeModulesPath, '@angular'));
  });

  // Restore reflector since AoT compiler will update it with a new static reflector
  afterEach(() => { ɵreflector.updateCapabilities(new ɵReflectionCapabilities()); });

  it('should compile without errors', (done) => {
    write('test.ts', 'export const A = 1;');

    const mockConsole = {error: (s: string) => {}};

    spyOn(mockConsole, 'error');

    main({p: basePath}, mockConsole.error)
        .then((exitCode) => {
          expect(mockConsole.error).not.toHaveBeenCalled();
          expect(exitCode).toEqual(0);
          done();
        })
        .catch(e => done.fail(e));
  });

  it('should not print the stack trace if user input file does not exist', (done) => {
    const mockConsole = {error: (s: string) => {}};

    spyOn(mockConsole, 'error');

    main({p: basePath}, mockConsole.error)
        .then((exitCode) => {
          expect(mockConsole.error)
              .toHaveBeenCalledWith(
                  `Error File '` + path.join(basePath, 'test.ts') + `' not found.`);
          expect(mockConsole.error).not.toHaveBeenCalledWith('Compilation failed');
          expect(exitCode).toEqual(1);
          done();
        })
        .catch(e => done.fail(e));
  });

  it('should not print the stack trace if user input file is malformed', (done) => {
    write('test.ts', 'foo;');

    const mockConsole = {error: (s: string) => {}};

    spyOn(mockConsole, 'error');

    main({p: basePath}, mockConsole.error)
        .then((exitCode) => {
          expect(mockConsole.error)
              .toHaveBeenCalledWith(
                  'Error at ' + path.join(basePath, 'test.ts') + `:1:1: Cannot find name 'foo'.`);
          expect(mockConsole.error).not.toHaveBeenCalledWith('Compilation failed');
          expect(exitCode).toEqual(1);
          done();
        })
        .catch(e => done.fail(e));
  });

  it('should not print the stack trace if cannot find the imported module', (done) => {
    write('test.ts', `import {MyClass} from './not-exist-deps';`);

    const mockConsole = {error: (s: string) => {}};

    spyOn(mockConsole, 'error');

    main({p: basePath}, mockConsole.error)
        .then((exitCode) => {
          expect(mockConsole.error)
              .toHaveBeenCalledWith(
                  'Error at ' + path.join(basePath, 'test.ts') +
                  `:1:23: Cannot find module './not-exist-deps'.`);
          expect(mockConsole.error).not.toHaveBeenCalledWith('Compilation failed');
          expect(exitCode).toEqual(1);
          done();
        })
        .catch(e => done.fail(e));
  });

  it('should not print the stack trace if cannot import', (done) => {
    write('empty-deps.ts', 'export const A = 1;');
    write('test.ts', `import {MyClass} from './empty-deps';`);

    const mockConsole = {error: (s: string) => {}};

    spyOn(mockConsole, 'error');

    main({p: basePath}, mockConsole.error)
        .then((exitCode) => {
          expect(mockConsole.error)
              .toHaveBeenCalledWith(
                  'Error at ' + path.join(basePath, 'test.ts') + `:1:9: Module '"` +
                  path.join(basePath, 'empty-deps') + `"' has no exported member 'MyClass'.`);
          expect(mockConsole.error).not.toHaveBeenCalledWith('Compilation failed');
          expect(exitCode).toEqual(1);
          done();
        })
        .catch(e => done.fail(e));
  });

  it('should not print the stack trace if type mismatches', (done) => {
    write('empty-deps.ts', 'export const A = "abc";');
    write('test.ts', `
      import {A} from './empty-deps';
      A();
    `);

    const mockConsole = {error: (s: string) => {}};

    spyOn(mockConsole, 'error');

    main({p: basePath}, mockConsole.error)
        .then((exitCode) => {
          expect(mockConsole.error)
              .toHaveBeenCalledWith(
                  'Error at ' + path.join(basePath, 'test.ts') +
                  ':3:7: Cannot invoke an expression whose type lacks a call signature. ' +
                  'Type \'String\' has no compatible call signatures.');
          expect(mockConsole.error).not.toHaveBeenCalledWith('Compilation failed');
          expect(exitCode).toEqual(1);
          done();
        })
        .catch(e => done.fail(e));
  });

  it('should print the stack trace on compiler internal errors', (done) => {
    write('test.ts', 'export const A = 1;');

    const mockConsole = {error: (s: string) => {}};

    spyOn(mockConsole, 'error');

    main({p: 'not-exist'}, mockConsole.error)
        .then((exitCode) => {
          expect(mockConsole.error).toHaveBeenCalled();
          expect(mockConsole.error).toHaveBeenCalledWith('Compilation failed');
          expect(exitCode).toEqual(1);
          done();
        })
        .catch(e => done.fail(e));
  });
});
