/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {CustomTransformers} from '@angular/compiler-cli';
import {setAugmentHostForTest} from '@angular/compiler-cli/src/transformers/compiler_host';
import * as fs from 'fs';
import * as path from 'path';
import * as ts from 'typescript';

import {createCompilerHost, createProgram} from '../../ngtools2';
import {main, mainDiagnosticsForTest, readNgcCommandLineAndConfiguration} from '../../src/main';
import {LazyRoute} from '../../src/ngtsc/routing';
import {resolveNpmTreeArtifact} from '../runfile_helpers';
import {TestSupport, setup} from '../test_support';

function setupFakeCore(support: TestSupport): void {
  if (!process.env.TEST_SRCDIR) {
    throw new Error('`setupFakeCore` must be run within a Bazel test');
  }

  const fakeNpmPackageDir =
      resolveNpmTreeArtifact('angular/packages/compiler-cli/test/ngtsc/fake_core/npm_package');

  const nodeModulesPath = path.join(support.basePath, 'node_modules');
  const angularCoreDirectory = path.join(nodeModulesPath, '@angular/core');

  fs.symlinkSync(fakeNpmPackageDir, angularCoreDirectory, 'dir');
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
    const support = setup();
    const outDir = path.join(support.basePath, 'built');
    process.chdir(support.basePath);

    setupFakeCore(support);
    setAugmentHostForTest(null);

    const env = new NgtscTestEnvironment(support, outDir);

    env.write('tsconfig-base.json', `{
      "compilerOptions": {
        "emitDecoratorMetadata": true,
        "experimentalDecorators": true,
        "skipLibCheck": true,
        "noImplicitAny": true,
        "strictNullChecks": true,
        "outDir": "built",
        "rootDir": ".",
        "baseUrl": ".",
        "declaration": true,
        "target": "es5",
        "newLine": "lf",
        "module": "es2015",
        "moduleResolution": "node",
        "lib": ["es6", "dom"],
        "typeRoots": ["node_modules/@types"]
      },
      "angularCompilerOptions": {
        "enableIvy": true
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
      angularCompilerOptions: {...extraOpts, enableIvy: true},
    };
    if (extraRootDirs !== undefined) {
      tsconfig.compilerOptions = {
        rootDirs: ['.', ...extraRootDirs],
      };
    }
    this.write('tsconfig.json', JSON.stringify(tsconfig, null, 2));

    if (extraOpts['_useHostForImportGeneration'] === true) {
      const cwd = process.cwd();
      setAugmentHostForTest({
        fileNameToModuleName: (importedFilePath: string) => {
          return 'root' + importedFilePath.substr(cwd.length).replace(/(\.d)?.ts$/, '');
        }
      });
    }
  }

  /**
   * Run the compiler to completion, and assert that no errors occurred.
   */
  driveMain(customTransformers?: CustomTransformers): void {
    const errorSpy = jasmine.createSpy('consoleError').and.callFake(console.error);
    const exitCode = main(['-p', this.basePath], errorSpy, undefined, customTransformers);
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

  driveRoutes(entryPoint?: string): LazyRoute[] {
    const {rootNames, options} = readNgcCommandLineAndConfiguration(['-p', this.basePath]);
    const host = createCompilerHost({options});
    const program = createProgram({rootNames, host, options});
    return program.listLazyRoutes(entryPoint);
  }
}
