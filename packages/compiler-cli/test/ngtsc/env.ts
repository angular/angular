/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {CustomTransformers, Program} from '@angular/compiler-cli';
import * as api from '@angular/compiler-cli/src/transformers/api';
import * as ts from 'typescript';

import {createCompilerHost, createProgram} from '../../ngtools2';
import {main, mainDiagnosticsForTest, readNgcCommandLineAndConfiguration} from '../../src/main';
import {AbsoluteFsPath, FileSystem, NgtscCompilerHost, absoluteFrom, getFileSystem} from '../../src/ngtsc/file_system';
import {Folder, MockFileSystem} from '../../src/ngtsc/file_system/testing';
import {IndexedComponent} from '../../src/ngtsc/indexer';
import {NgtscProgram} from '../../src/ngtsc/program';
import {LazyRoute} from '../../src/ngtsc/routing';
import {setWrapHostForTest} from '../../src/transformers/compiler_host';


/**
 * Manages a temporary testing directory structure and environment for testing ngtsc by feeding it
 * TypeScript code.
 */
export class NgtscTestEnvironment {
  private multiCompileHostExt: MultiCompileHostExt|null = null;
  private oldProgram: Program|null = null;
  private changedResources: Set<string>|null = null;

  private constructor(
      private fs: FileSystem, readonly outDir: AbsoluteFsPath, readonly basePath: AbsoluteFsPath) {}

  /**
   * Set up a new testing environment.
   */
  static setup(files?: Folder): NgtscTestEnvironment {
    const fs = getFileSystem();
    if (files !== undefined && fs instanceof MockFileSystem) {
      fs.init(files);
    }

    const host = new AugmentedCompilerHost(fs);
    setWrapHostForTest(makeWrapHost(host));

    const env = new NgtscTestEnvironment(fs, fs.resolve('/built'), absoluteFrom('/'));

    env.write(absoluteFrom('/tsconfig-base.json'), `{
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
    if (!this.fs.exists(this.fs.resolve(this.outDir, fileName))) {
      throw new Error(`Expected ${fileName} to be emitted (outDir: ${this.outDir})`);
    }
  }

  assertDoesNotExist(fileName: string) {
    if (this.fs.exists(this.fs.resolve(this.outDir, fileName))) {
      throw new Error(`Did not expect ${fileName} to be emitted (outDir: ${this.outDir})`);
    }
  }

  getContents(fileName: string): string {
    this.assertExists(fileName);
    const modulePath = this.fs.resolve(this.outDir, fileName);
    return this.fs.readFile(modulePath);
  }

  enableMultipleCompilations(): void {
    this.changedResources = new Set();
    this.multiCompileHostExt = new MultiCompileHostExt(this.fs);
    setWrapHostForTest(makeWrapHost(this.multiCompileHostExt));
  }

  flushWrittenFileTracking(): void {
    if (this.multiCompileHostExt === null) {
      throw new Error(`Not tracking written files - call enableMultipleCompilations()`);
    }
    this.changedResources !.clear();
    this.multiCompileHostExt.flushWrittenFileTracking();
  }

  /**
   * Older versions of the CLI do not provide the `CompilerHost.getModifiedResourceFiles()` method.
   * This results in the `changedResources` set being `null`.
   */
  simulateLegacyCLICompilerHost() { this.changedResources = null; }

  getFilesWrittenSinceLastFlush(): Set<string> {
    if (this.multiCompileHostExt === null) {
      throw new Error(`Not tracking written files - call enableMultipleCompilations()`);
    }
    const writtenFiles = new Set<string>();
    this.multiCompileHostExt.getFilesWrittenSinceLastFlush().forEach(rawFile => {
      if (rawFile.startsWith(this.outDir)) {
        writtenFiles.add(rawFile.substr(this.outDir.length));
      }
    });
    return writtenFiles;
  }

  write(fileName: string, content: string) {
    const absFilePath = this.fs.resolve(this.basePath, fileName);
    if (this.multiCompileHostExt !== null) {
      this.multiCompileHostExt.invalidate(absFilePath);
      this.changedResources !.add(absFilePath);
    }
    this.fs.ensureDir(this.fs.dirname(absFilePath));
    this.fs.writeFile(absFilePath, content);
  }

  invalidateCachedFile(fileName: string): void {
    const absFilePath = this.fs.resolve(this.basePath, fileName);
    if (this.multiCompileHostExt === null) {
      throw new Error(`Not caching files - call enableMultipleCompilations()`);
    }
    this.multiCompileHostExt.invalidate(absFilePath);
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
      setWrapHostForTest(makeWrapHost(new FileNameToModuleNameHost(this.fs)));
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
  driveDiagnostics(): ReadonlyArray<ts.Diagnostic|api.Diagnostic> {
    return mainDiagnosticsForTest(['-p', this.basePath]);
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

class AugmentedCompilerHost extends NgtscCompilerHost {
  delegate !: ts.CompilerHost;
}

class FileNameToModuleNameHost extends AugmentedCompilerHost {
  fileNameToModuleName(importedFilePath: string): string {
    const relativeFilePath = this.fs.relative(this.fs.pwd(), this.fs.resolve(importedFilePath));
    const rootedPath = this.fs.join('root', relativeFilePath);
    return rootedPath.replace(/(\.d)?.ts$/, '');
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
    const sf = super.getSourceFile(fileName, languageVersion);
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
    super.writeFile(fileName, data, writeByteOrderMark, onError, sourceFiles);
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
