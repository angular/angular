/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as fs from 'fs';
import * as path from 'path';
import * as ts from 'typescript';

import {main, readCommandLineAndConfiguration, watchMode} from '../../src/main';
import {TestSupport, isInBazel, makeTempDir, setup} from '../test_support';

function setupFakeCore(support: TestSupport): void {
  const fakeCore = path.join(
      process.env.TEST_SRCDIR, 'angular/packages/compiler-cli/test/ngtsc/fake_core/npm_package');

  const nodeModulesPath = path.join(support.basePath, 'node_modules');
  const angularCoreDirectory = path.join(nodeModulesPath, '@angular/core');

  fs.symlinkSync(fakeCore, angularCoreDirectory);
}

function getNgRootDir() {
  const moduleFilename = module.filename.replace(/\\/g, '/');
  const distIndex = moduleFilename.indexOf('/dist/all');
  return moduleFilename.substr(0, distIndex);
}

describe('ngtsc behavioral tests', () => {
  if (!isInBazel()) {
    // These tests should be excluded from the non-Bazel build.
    return;
  }

  let basePath: string;
  let outDir: string;
  let write: (fileName: string, content: string) => void;
  let errorSpy: jasmine.Spy&((s: string) => void);

  function shouldExist(fileName: string) {
    if (!fs.existsSync(path.resolve(outDir, fileName))) {
      throw new Error(`Expected ${fileName} to be emitted (outDir: ${outDir})`);
    }
  }

  function shouldNotExist(fileName: string) {
    if (fs.existsSync(path.resolve(outDir, fileName))) {
      throw new Error(`Did not expect ${fileName} to be emitted (outDir: ${outDir})`);
    }
  }

  function getContents(fileName: string): string {
    shouldExist(fileName);
    const modulePath = path.resolve(outDir, fileName);
    return fs.readFileSync(modulePath, 'utf8');
  }

  function writeConfig(
      tsconfig: string =
          '{"extends": "./tsconfig-base.json", "angularCompilerOptions": {"enableIvy": "ngtsc"}}') {
    write('tsconfig.json', tsconfig);
  }

  beforeEach(() => {
    errorSpy = jasmine.createSpy('consoleError').and.callFake(console.error);
    const support = setup();
    basePath = support.basePath;
    outDir = path.join(basePath, 'built');
    process.chdir(basePath);
    write = (fileName: string, content: string) => { support.write(fileName, content); };

    setupFakeCore(support);
    write('tsconfig-base.json', `{
      "compilerOptions": {
        "experimentalDecorators": true,
        "skipLibCheck": true,
        "noImplicitAny": true,
        "types": [],
        "outDir": "built",
        "rootDir": ".",
        "baseUrl": ".",
        "declaration": true,
        "target": "es5",
        "module": "es2015",
        "moduleResolution": "node",
        "lib": ["es6", "dom"],
        "typeRoots": ["node_modules/@types"]
      },
      "angularCompilerOptions": {
        "enableIvy": "ngtsc"
      }
    }`);
  });

  it('should compile without errors', () => {
    writeConfig();
    write('test.ts', `
        import {Injectable} from '@angular/core';

        @Injectable()
        export class Dep {}

        @Injectable()
        export class Service {
          constructor(dep: Dep) {}
        }
    `);

    const exitCode = main(['-p', basePath], errorSpy);
    expect(errorSpy).not.toHaveBeenCalled();
    expect(exitCode).toBe(0);


    const jsContents = getContents('test.js');
    expect(jsContents).toContain('Dep.ngInjectableDef =');
    expect(jsContents).toContain('Service.ngInjectableDef =');
    expect(jsContents).not.toContain('__decorate');
    const dtsContents = getContents('test.d.ts');
    expect(dtsContents).toContain('static ngInjectableDef: i0.InjectableDef<Dep>;');
    expect(dtsContents).toContain('static ngInjectableDef: i0.InjectableDef<Service>;');
  });
});
