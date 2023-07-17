/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {CustomTransformers, defaultGatherDiagnostics, Program} from '@angular/compiler-cli';
import * as api from '@angular/compiler-cli/src/transformers/api';
import * as tsickle from 'tsickle';
import ts from 'typescript';

import {createCompilerHost, createProgram} from '../../index';
import {mainXi18n} from '../../src/extract_i18n';
import {main, mainDiagnosticsForTest, readNgcCommandLineAndConfiguration} from '../../src/main';
import {absoluteFrom, AbsoluteFsPath, FileSystem, getFileSystem, relativeFrom} from '../../src/ngtsc/file_system';
import {Folder, MockFileSystem} from '../../src/ngtsc/file_system/testing';
import {IndexedComponent} from '../../src/ngtsc/indexer';
import {NgtscProgram} from '../../src/ngtsc/program';
import {DeclarationNode} from '../../src/ngtsc/reflection';
import {NgtscTestCompilerHost} from '../../src/ngtsc/testing';
import {TemplateTypeChecker} from '../../src/ngtsc/typecheck/api';
import {setWrapHostForTest} from '../../src/transformers/compiler_host';

type TsConfigOptionsValue =
    string|boolean|number|null|TsConfigOptionsValue[]|{[key: string]: TsConfigOptionsValue};
type TsConfigOptions = {
  [key: string]: TsConfigOptionsValue;
};

/**
 * Manages a temporary testing directory structure and environment for testing ngtsc by feeding it
 * TypeScript code.
 */
export class NgtscTestEnvironment {
  private multiCompileHostExt: MultiCompileHostExt|null = null;
  private oldProgram: Program|null = null;
  private changedResources: Set<string>|null = null;
  private commandLineArgs = ['-p', this.basePath];

  private constructor(
      private fs: FileSystem, readonly outDir: AbsoluteFsPath, readonly basePath: AbsoluteFsPath) {}

  /**
   * Set up a new testing environment.
   */
  static setup(files?: Folder, workingDir: AbsoluteFsPath = absoluteFrom('/')):
      NgtscTestEnvironment {
    const fs = getFileSystem();
    if (files !== undefined && fs instanceof MockFileSystem) {
      fs.init(files);
    }

    const host = new AugmentedCompilerHost(fs);
    setWrapHostForTest(makeWrapHost(host));

    const env = new NgtscTestEnvironment(fs, fs.resolve('/built'), workingDir);
    fs.chdir(workingDir);

    env.write(absoluteFrom('/tsconfig-base.json'), `{
      "compilerOptions": {
        "emitDecoratorMetadata": false,
        "experimentalDecorators": true,
        "skipLibCheck": true,
        "noImplicitAny": true,
        "noEmitOnError": true,
        "strictNullChecks": true,
        "outDir": "built",
        "rootDir": ".",
        "baseUrl": ".",
        "allowJs": true,
        "declaration": true,
        "target": "es2015",
        "newLine": "lf",
        "module": "es2015",
        "moduleResolution": "node",
        "lib": ["es2015", "dom"],
        "typeRoots": ["node_modules/@types"]
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

  /**
   * Installs a compiler host that allows for asynchronous reading of resources by implementing the
   * `CompilerHost.readResource` method. Note that only asynchronous compilations are affected, as
   * synchronous compilations do not use the asynchronous resource loader.
   */
  enablePreloading(): void {
    setWrapHostForTest(makeWrapHost(new ResourceLoadingCompileHost(this.fs)));
  }

  addCommandLineArgs(...args: string[]): void {
    this.commandLineArgs.push(...args);
  }

  flushWrittenFileTracking(): void {
    if (this.multiCompileHostExt === null) {
      throw new Error(`Not tracking written files - call enableMultipleCompilations()`);
    }
    this.changedResources!.clear();
    this.multiCompileHostExt.flushWrittenFileTracking();
  }

  getTsProgram(): ts.Program {
    if (this.oldProgram === null) {
      throw new Error('No ts.Program has been created yet.');
    }
    return this.oldProgram.getTsProgram();
  }

  getReuseTsProgram(): ts.Program {
    if (this.oldProgram === null) {
      throw new Error('No ts.Program has been created yet.');
    }
    return (this.oldProgram as NgtscProgram).getReuseTsProgram();
  }

  /**
   * Older versions of the CLI do not provide the `CompilerHost.getModifiedResourceFiles()` method.
   * This results in the `changedResources` set being `null`.
   */
  simulateLegacyCLICompilerHost() {
    this.changedResources = null;
  }

  getFilesWrittenSinceLastFlush(): Set<string> {
    if (this.multiCompileHostExt === null) {
      throw new Error(`Not tracking written files - call enableMultipleCompilations()`);
    }
    const writtenFiles = new Set<string>();
    this.multiCompileHostExt.getFilesWrittenSinceLastFlush().forEach(rawFile => {
      if (rawFile.startsWith(this.outDir)) {
        writtenFiles.add(rawFile.slice(this.outDir.length));
      }
    });
    return writtenFiles;
  }

  write(fileName: string, content: string) {
    const absFilePath = this.fs.resolve(this.basePath, fileName);
    if (this.multiCompileHostExt !== null) {
      this.multiCompileHostExt.invalidate(absFilePath);
      if (!fileName.endsWith('.ts')) {
        this.changedResources!.add(absFilePath);
      }
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
    if (!fileName.endsWith('.ts')) {
      this.changedResources!.add(absFilePath);
    }
  }

  tsconfig(extraOpts: TsConfigOptions = {}, extraRootDirs?: string[], files?: string[]): void {
    const tsconfig: {[key: string]: any} = {
      extends: './tsconfig-base.json',
      angularCompilerOptions: extraOpts,
    };
    if (files !== undefined) {
      tsconfig['files'] = files;
    }
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
    let reuseProgram: {program: Program|undefined}|undefined = undefined;
    if (this.multiCompileHostExt !== null) {
      reuseProgram = {
        program: this.oldProgram || undefined,
      };
    }
    const exitCode = main(
        this.commandLineArgs, errorSpy, undefined, customTransformers, reuseProgram,
        this.changedResources, tsickle);
    expect(errorSpy).not.toHaveBeenCalled();
    expect(exitCode).toBe(0);
    if (this.multiCompileHostExt !== null) {
      this.oldProgram = reuseProgram!.program!;
    }
  }

  /**
   * Run the compiler to completion, and return any `ts.Diagnostic` errors that may have occurred.
   */
  driveDiagnostics(expectedExitCode?: number): ReadonlyArray<ts.Diagnostic> {
    // ngtsc only produces ts.Diagnostic messages.
    let reuseProgram: {program: Program|undefined}|undefined = undefined;
    if (this.multiCompileHostExt !== null) {
      reuseProgram = {
        program: this.oldProgram || undefined,
      };
    }

    const {exitCode, diagnostics} = mainDiagnosticsForTest(
        this.commandLineArgs, undefined, reuseProgram, this.changedResources, tsickle);
    if (expectedExitCode !== undefined) {
      expect(exitCode)
          .withContext(`Expected program to exit with code ${
              expectedExitCode}, but it actually exited with code ${exitCode}.`)
          .toBe(expectedExitCode);
    }

    if (this.multiCompileHostExt !== null) {
      this.oldProgram = reuseProgram!.program!;
    }

    // In ngtsc, only `ts.Diagnostic`s are produced.
    return diagnostics as ReadonlyArray<ts.Diagnostic>;
  }

  async driveDiagnosticsAsync(): Promise<ReadonlyArray<ts.Diagnostic>> {
    const {rootNames, options} = readNgcCommandLineAndConfiguration(this.commandLineArgs);
    const host = createCompilerHost({options});
    const program = createProgram({rootNames, host, options});
    await program.loadNgStructureAsync();

    // ngtsc only produces ts.Diagnostic messages.
    return defaultGatherDiagnostics(program as api.Program) as ts.Diagnostic[];
  }

  driveTemplateTypeChecker(): {program: ts.Program, checker: TemplateTypeChecker} {
    const {rootNames, options} = readNgcCommandLineAndConfiguration(this.commandLineArgs);
    const host = createCompilerHost({options});
    const program = createProgram({rootNames, host, options});
    const checker = (program as NgtscProgram).compiler.getTemplateTypeChecker();
    return {
      program: program.getTsProgram(),
      checker,
    };
  }

  driveIndexer(): Map<DeclarationNode, IndexedComponent> {
    const {rootNames, options} = readNgcCommandLineAndConfiguration(this.commandLineArgs);
    const host = createCompilerHost({options});
    const program = createProgram({rootNames, host, options});
    return (program as NgtscProgram).getIndexedComponents();
  }

  driveXi18n(format: string, outputFileName: string, locale: string|null = null): void {
    const errorSpy = jasmine.createSpy('consoleError').and.callFake(console.error);
    const args = [
      ...this.commandLineArgs,
      `--i18nFormat=${format}`,
      `--outFile=${outputFileName}`,
    ];
    if (locale !== null) {
      args.push(`--locale=${locale}`);
    }
    const exitCode = mainXi18n(args, errorSpy);
    expect(errorSpy).not.toHaveBeenCalled();
    expect(exitCode).toEqual(0);
  }
}

class AugmentedCompilerHost extends NgtscTestCompilerHost {
  delegate!: ts.CompilerHost;
}

const ROOT_PREFIX = 'root/';

class FileNameToModuleNameHost extends AugmentedCompilerHost {
  fileNameToModuleName(importedFilePath: string): string {
    const relativeFilePath =
        relativeFrom(this.fs.relative(this.fs.pwd(), this.fs.resolve(importedFilePath)));
    const rootedPath = this.fs.join('root', relativeFilePath);
    return rootedPath.replace(/(\.d)?.ts$/, '');
  }

  resolveModuleNames(
      moduleNames: string[], containingFile: string, reusedNames: string[]|undefined,
      redirectedReference: ts.ResolvedProjectReference|undefined,
      options: ts.CompilerOptions): (ts.ResolvedModule|undefined)[] {
    return moduleNames.map(moduleName => {
      if (moduleName.startsWith(ROOT_PREFIX)) {
        // Strip the artificially added root prefix.
        moduleName = '/' + moduleName.slice(ROOT_PREFIX.length);
      }

      return ts
          .resolveModuleName(
              moduleName, containingFile, options, this, /* cache */ undefined, redirectedReference)
          .resolvedModule;
    });
  }
}

class MultiCompileHostExt extends AugmentedCompilerHost implements Partial<ts.CompilerHost> {
  private cache = new Map<string, ts.SourceFile>();
  private writtenFiles = new Set<string>();

  override getSourceFile(
      fileName: string, languageVersion: ts.ScriptTarget, onError?: (message: string) => void,
      shouldCreateNewSourceFile?: boolean): ts.SourceFile|undefined {
    if (this.cache.has(fileName)) {
      return this.cache.get(fileName)!;
    }
    const sf = super.getSourceFile(fileName, languageVersion);
    if (sf !== undefined) {
      this.cache.set(sf.fileName, sf);
    }
    return sf;
  }

  flushWrittenFileTracking(): void {
    this.writtenFiles.clear();
  }

  override writeFile(
      fileName: string, data: string, writeByteOrderMark: boolean,
      onError: ((message: string) => void)|undefined,
      sourceFiles?: ReadonlyArray<ts.SourceFile>): void {
    super.writeFile(fileName, data, writeByteOrderMark, onError, sourceFiles);
    this.writtenFiles.add(fileName);
  }

  getFilesWrittenSinceLastFlush(): Set<string> {
    return this.writtenFiles;
  }

  invalidate(fileName: string): void {
    this.cache.delete(fileName);
  }
}

class ResourceLoadingCompileHost extends AugmentedCompilerHost implements api.CompilerHost {
  readResource(fileName: string): Promise<string>|string {
    const resource = this.readFile(fileName);
    if (resource === undefined) {
      throw new Error(`Resource ${fileName} not found`);
    }
    return resource;
  }
}

function makeWrapHost(wrapped: AugmentedCompilerHost): (host: ts.CompilerHost) => ts.CompilerHost {
  return (delegate) => {
    wrapped.delegate = delegate;
    return new Proxy(delegate, {
      get: (target: ts.CompilerHost, name: string): any => {
        if ((wrapped as any)[name] !== undefined) {
          return (wrapped as any)[name]!.bind(wrapped);
        }
        return (target as any)[name];
      }
    });
  };
}
