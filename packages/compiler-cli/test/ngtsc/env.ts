/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {CustomTransformers, Program} from '@angular/compiler-cli';
import {IndexedComponent} from '@angular/compiler-cli/src/ngtsc/indexer';
import {NgtscProgram} from '@angular/compiler-cli/src/ngtsc/program';
import {setWrapHostForTest} from '@angular/compiler-cli/src/transformers/compiler_host';
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

  fs.symlinkSync(fakeNpmPackageDir, angularCoreDirectory, 'junction');
}

/**
 * Manages a temporary testing directory structure and environment for testing ngtsc by feeding it
 * TypeScript code.
 */
export class NgtscTestEnvironment {
  private multiCompileHostExt: MultiCompileHostExt|null = null;
  private oldProgram: Program|null = null;
  private changedResources: Set<string>|undefined = undefined;

  private constructor(private support: TestSupport, readonly outDir: string) {}

  get basePath(): string { return this.support.basePath; }

  /**
   * Set up a new testing environment.
   */
  static setup(): NgtscTestEnvironment {
    const support = setup();
    const outDir = path.posix.join(support.basePath, 'built');
    process.chdir(support.basePath);

    setupFakeCore(support);
    setWrapHostForTest(null);

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
        "enableIvy": true,
        "ivyTemplateTypeCheck": false
      },
      "exclude": [
        "built"
      ]
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

  enableMultipleCompilations(): void {
    this.changedResources = new Set();
    this.multiCompileHostExt = new MultiCompileHostExt();
    setWrapHostForTest(makeWrapHost(this.multiCompileHostExt));
  }

  flushWrittenFileTracking(): void {
    if (this.multiCompileHostExt === null) {
      throw new Error(`Not tracking written files - call enableMultipleCompilations()`);
    }
    this.changedResources !.clear();
    this.multiCompileHostExt.flushWrittenFileTracking();
  }

  getFilesWrittenSinceLastFlush(): Set<string> {
    if (this.multiCompileHostExt === null) {
      throw new Error(`Not tracking written files - call enableMultipleCompilations()`);
    }
    const outDir = path.posix.join(this.support.basePath, 'built');
    const writtenFiles = new Set<string>();
    this.multiCompileHostExt.getFilesWrittenSinceLastFlush().forEach(rawFile => {
      if (rawFile.startsWith(outDir)) {
        writtenFiles.add(rawFile.substr(outDir.length));
      }
    });
    return writtenFiles;
  }

  write(fileName: string, content: string) {
    if (this.multiCompileHostExt !== null) {
      const absFilePath = path.resolve(this.support.basePath, fileName).replace(/\\/g, '/');
      this.multiCompileHostExt.invalidate(absFilePath);
      this.changedResources !.add(absFilePath);
    }
    this.support.write(fileName, content);
  }

  invalidateCachedFile(fileName: string): void {
    if (this.multiCompileHostExt === null) {
      throw new Error(`Not caching files - call enableMultipleCompilations()`);
    }
    const fullFile = path.posix.join(this.support.basePath, fileName);
    this.multiCompileHostExt.invalidate(fullFile);
  }

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
      setWrapHostForTest(makeWrapHost(new FileNameToModuleNameHost()));
    }
  }

  /**
   * Run the compiler to completion, and assert that no errors occurred.
   */
  driveMain(customTransformers?: CustomTransformers): void {
    const errorSpy = jasmine.createSpy('consoleError').and.callFake(console.error);
    let reuseProgram: {program: Program | undefined}|undefined = undefined;
    if (this.multiCompileHostExt !== null) {
      reuseProgram = {
        program: this.oldProgram || undefined,
      };
    }
    const exitCode = main(
        ['-p', this.basePath], errorSpy, undefined, customTransformers, reuseProgram,
        this.changedResources);
    expect(errorSpy).not.toHaveBeenCalled();
    expect(exitCode).toBe(0);
    if (this.multiCompileHostExt !== null) {
      this.oldProgram = reuseProgram !.program !;
    }
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

  driveIndexer(): Map<ts.Declaration, IndexedComponent> {
    const {rootNames, options} = readNgcCommandLineAndConfiguration(['-p', this.basePath]);
    const host = createCompilerHost({options});
    const program = createProgram({rootNames, host, options});
    return (program as NgtscProgram).getIndexedComponents();
  }
}

class AugmentedCompilerHost {
  delegate !: ts.CompilerHost;
}

class FileNameToModuleNameHost extends AugmentedCompilerHost {
  // CWD must be initialized lazily as `this.delegate` is not set until later.
  private cwd: string|null = null;
  fileNameToModuleName(importedFilePath: string): string {
    if (this.cwd === null) {
      this.cwd = this.delegate.getCurrentDirectory();
    }
    return 'root' + importedFilePath.substr(this.cwd.length).replace(/(\.d)?.ts$/, '');
  }
}

class MultiCompileHostExt extends AugmentedCompilerHost implements Partial<ts.CompilerHost> {
  private cache = new Map<string, ts.SourceFile>();
  private writtenFiles = new Set<string>();

  getSourceFile(
      fileName: string, languageVersion: ts.ScriptTarget, onError?: (message: string) => void,
      shouldCreateNewSourceFile?: boolean): ts.SourceFile|undefined {
    if (this.cache.has(fileName)) {
      return this.cache.get(fileName) !;
    }
    const sf =
        this.delegate.getSourceFile(fileName, languageVersion, onError, shouldCreateNewSourceFile);
    if (sf !== undefined) {
      this.cache.set(sf.fileName, sf);
    }
    return sf;
  }

  flushWrittenFileTracking(): void { this.writtenFiles.clear(); }

  writeFile(
      fileName: string, data: string, writeByteOrderMark: boolean,
      onError: ((message: string) => void)|undefined,
      sourceFiles?: ReadonlyArray<ts.SourceFile>): void {
    this.delegate.writeFile(fileName, data, writeByteOrderMark, onError, sourceFiles);
    this.writtenFiles.add(fileName);
  }

  getFilesWrittenSinceLastFlush(): Set<string> { return this.writtenFiles; }

  invalidate(fileName: string): void { this.cache.delete(fileName); }
}

function makeWrapHost(wrapped: AugmentedCompilerHost): (host: ts.CompilerHost) => ts.CompilerHost {
  return (delegate) => {
    wrapped.delegate = delegate;
    return new Proxy(delegate, {
      get: (target: ts.CompilerHost, name: string): any => {
        if ((wrapped as any)[name] !== undefined) {
          return (wrapped as any)[name] !.bind(wrapped);
        }
        return (target as any)[name];
      }
    });
  };
}
