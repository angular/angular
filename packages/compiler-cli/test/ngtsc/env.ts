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

import {main, mainDiagnosticsForTest} from '../../src/main';
import {TestSupport, isInBazel, setup} from '../test_support';

function setupFakeCore(support: TestSupport): void {
  if (!process.env.TEST_SRCDIR) {
    throw new Error('`setupFakeCore` must be run within a Bazel test');
  }
  const fakeCore = path.join(
      process.env.TEST_SRCDIR, 'angular/packages/compiler-cli/test/ngtsc/fake_core/npm_package');

  const nodeModulesPath = path.join(support.basePath, 'node_modules');
  const angularCoreDirectory = path.join(nodeModulesPath, '@angular/core');

  fs.symlinkSync(fakeCore, angularCoreDirectory);
}

/**
 * Manages a temporary testing directory structure and environment for testing ngtsc by feeding it
 * TypeScript code.
 */
export class NgtscTestEnvironment {
  private constructor(private support: TestSupport, readonly outDir: string) {}

  get basePath(): string { return this.support.basePath; }

  /**
   * Set up a new testing environment.
   */
  static setup(): NgtscTestEnvironment {
    if (!NgtscTestEnvironment.supported) {
      throw new Error(`Attempting to setup ngtsc tests in an unsupported environment`);
    }

    const support = setup();
    const outDir = path.join(support.basePath, 'built');
    process.chdir(support.basePath);

    setupFakeCore(support);

    const env = new NgtscTestEnvironment(support, outDir);

    env.write('tsconfig-base.json', `{
      "compilerOptions": {
        "experimentalDecorators": true,
        "skipLibCheck": true,
        "noImplicitAny": true,
        "strictNullChecks": true,
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

    return env;
  }

  assertExists(fileName: string) {
    if (!fs.existsSync(path.resolve(this.outDir, fileName))) {
      throw new Error(`Expected ${fileName} to be emitted (outDir: ${this.outDir})`);
    }
  }

  assertDoesNotExist(fileName: string) {
    if (fs.existsSync(path.resolve(this.outDir, fileName))) {
      throw new Error(`Did not expect ${fileName} to be emitted (outDir: ${this.outDir})`);
    }
  }

  getContents(fileName: string): string {
    this.assertExists(fileName);
    const modulePath = path.resolve(this.outDir, fileName);
    return fs.readFileSync(modulePath, 'utf8');
  }

  write(fileName: string, content: string) { this.support.write(fileName, content); }

  tsconfig(extraOpts: {[key: string]: string | boolean} = {}, extraRootDirs?: string[]): void {
    const tsconfig: {[key: string]: any} = {
      extends: './tsconfig-base.json',
      angularCompilerOptions: {...extraOpts, enableIvy: 'ngtsc'},
    };
    if (extraRootDirs !== undefined) {
      tsconfig.compilerOptions = {
        rootDirs: ['.', ...extraRootDirs],
      };
    }
    this.write('tsconfig.json', JSON.stringify(tsconfig, null, 2));
  }

  /**
   * Run the compiler to completion, and assert that no errors occurred.
   */
  driveMain(): void {
    const errorSpy = jasmine.createSpy('consoleError').and.callFake(console.error);
    const exitCode = main(['-p', this.basePath], errorSpy);
    expect(errorSpy).not.toHaveBeenCalled();
    expect(exitCode).toBe(0);
  }

  /**
   * Run the compiler to completion, and return any `ts.Diagnostic` errors that may have occurred.
   */
  driveDiagnostics(): ReadonlyArray<ts.Diagnostic> {
    // Cast is safe as ngtsc mode only produces ts.Diagnostics.
    return mainDiagnosticsForTest(['-p', this.basePath]) as ReadonlyArray<ts.Diagnostic>;
  }

  static get supported(): boolean { return isInBazel(); }
}
