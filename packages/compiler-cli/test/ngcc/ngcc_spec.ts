/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as fs from 'fs';
import * as path from 'path';

import {mainNgcc} from '../../src/ngcc/src/main';

import {TestSupport, isInBazel, setup} from '../test_support';

function setupNodeModules(support: TestSupport): void {
  const corePath = path.join(process.env.TEST_SRCDIR, 'angular/packages/core/npm_package');
  const commonPath = path.join(process.env.TEST_SRCDIR, 'angular/packages/common/npm_package');

  const nodeModulesPath = path.join(support.basePath, 'node_modules');
  const angularCoreDirectory = path.join(nodeModulesPath, '@angular/core');
  const angularCommonDirectory = path.join(nodeModulesPath, '@angular/common');

  // fs.symlinkSync(corePath, angularCoreDirectory);
  // fs.symlinkSync(commonPath, angularCommonDirectory);
}

describe('ngcc behavioral tests', () => {
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

    setupNodeModules(support);
  });

  it('should run ngcc without errors', () => {
    const nodeModulesPath = path.join(basePath, 'node_modules');
    console.error(nodeModulesPath);
    const commonPath = path.join(nodeModulesPath, '@angular/common');
    const exitCode = mainNgcc([commonPath]);

    expect(exitCode).toBe(0);
  });
});
