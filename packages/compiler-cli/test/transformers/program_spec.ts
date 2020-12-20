/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/// <reference types="node" />
import * as ng from '@angular/compiler-cli';
import * as fs from 'fs';
import * as path from 'path';
import * as ts from 'typescript';

import {formatDiagnostics} from '../../src/perform_compile';
import {CompilerHost, EmitFlags, LazyRoute} from '../../src/transformers/api';
import {createSrcToOutPathMapper, resetTempProgramHandlerForTest, setTempProgramHandlerForTest} from '../../src/transformers/program';
import {StructureIsReused, tsStructureIsReused} from '../../src/transformers/util';
import {expectNoDiagnosticsInProgram, setup, stripAnsi, TestSupport} from '../test_support';

describe('ng program', () => {
  let testSupport: TestSupport;
  let errorSpy: jasmine.Spy&((s: string) => void);

  beforeEach(() => {
    errorSpy = jasmine.createSpy('consoleError').and.callFake(console.error);
    testSupport = setup();
  });

  function createModuleAndCompSource(prefix: string, template: string = prefix + 'template') {
    const templateEntry =
        template.endsWith('.html') ? `templateUrl: '${template}'` : `template: \`${template}\``;
    return `
      import {Component, NgModule} from '@angular/core';

      @Component({selector: '${prefix}', ${templateEntry}})
      export class ${prefix}Comp {}

      @NgModule({declarations: [${prefix}Comp]})
      export class ${prefix}Module {}
    `;
  }

  function compileLib(libName: string) {
    testSupport.writeFiles({
      [`${libName}_src/index.ts`]: createModuleAndCompSource(libName),
    });
    const options = testSupport.createCompilerOptions();
    const program = ng.createProgram({
      rootNames: [path.resolve(testSupport.basePath, `${libName}_src/index.ts`)],
      options,
      host: ng.createCompilerHost({options}),
    });
    expectNoDiagnosticsInProgram(options, program);
    fs.symlinkSync(
        path.resolve(testSupport.basePath, 'built', `${libName}_src`),
        path.resolve(testSupport.basePath, 'node_modules', libName), 'dir');
    program.emit({emitFlags: ng.EmitFlags.DTS | ng.EmitFlags.JS | ng.EmitFlags.Metadata});
  }

  function compile(
      oldProgram?: ng.Program, overrideOptions?: ng.CompilerOptions, rootNames?: string[],
      host?: CompilerHost): {program: ng.Program, emitResult: ts.EmitResult} {
    const options = testSupport.createCompilerOptions(overrideOptions);
    if (!rootNames) {
      rootNames = [path.resolve(testSupport.basePath, 'src/index.ts')];
    }
    if (!host) {
      host = ng.createCompilerHost({options});
    }
    const program = ng.createProgram({
      rootNames: rootNames,
      options,
      host,
      oldProgram,
    });
    expectNoDiagnosticsInProgram(options, program);
    const emitResult = program.emit();
    return {emitResult, program};
  }

  function createWatchModeHost(): ng.CompilerHost {
    const options = testSupport.createCompilerOptions();
    const host = ng.createCompilerHost({options});

    const originalGetSourceFile = host.getSourceFile;
    const cache = new Map<string, ts.SourceFile>();
    host.getSourceFile = function(fileName: string, languageVersion: ts.ScriptTarget):
                             ts.SourceFile|
                         undefined {
                           const sf = originalGetSourceFile.call(host, fileName, languageVersion);
                           if (sf) {
                             if (cache.has(sf.fileName)) {
                               const oldSf = cache.get(sf.fileName)!;
                               if (oldSf.getFullText() === sf.getFullText()) {
                                 return oldSf;
                               }
                             }
                             cache.set(sf.fileName, sf);
                           }
                           return sf;
                         };
    return host;
  }

  function resolveFiles(rootNames: string[]) {
    const preOptions = testSupport.createCompilerOptions();
    const preHost = ts.createCompilerHost(preOptions);
    // don't resolve symlinks
    preHost.realpath = (f) => f;
    const preProgram = ts.createProgram(rootNames, preOptions, preHost);
    return preProgram.getSourceFiles().map(sf => sf.fileName);
  }

  describe('reuse of old program', () => {
    it('should reuse generated code for libraries from old programs', () => {
      compileLib('lib');
      testSupport.writeFiles({
        'src/main.ts': createModuleAndCompSource('main'),
        'src/index.ts': `
            export * from './main';
            export * from 'lib/index';
          `
      });
      const p1 = compile().program;
      expect(p1.getTsProgram().getSourceFiles().some(
                 sf => /node_modules\/lib\/.*\.ngfactory\.ts$/.test(sf.fileName)))
          .toBe(true);
      expect(p1.getTsProgram().getSourceFiles().some(
                 sf => /node_modules\/lib2\/.*\.ngfactory.*$/.test(sf.fileName)))
          .toBe(false);
      const p2 = compile(p1).program;
      expect(p2.getTsProgram().getSourceFiles().some(
                 sf => /node_modules\/lib\/.*\.ngfactory.*$/.test(sf.fileName)))
          .toBe(false);
      expect(p2.getTsProgram().getSourceFiles().some(
                 sf => /node_modules\/lib2\/.*\.ngfactory.*$/.test(sf.fileName)))
          .toBe(false);

      // import a library for which we didn't generate code before
      compileLib('lib2');
      testSupport.writeFiles({
        'src/index.ts': `
          export * from './main';
          export * from 'lib/index';
          export * from 'lib2/index';
        `,
      });
      const p3 = compile(p2).program;
      expect(p3.getTsProgram().getSourceFiles().some(
                 sf => /node_modules\/lib\/.*\.ngfactory.*$/.test(sf.fileName)))
          .toBe(false);
      expect(p3.getTsProgram().getSourceFiles().some(
                 sf => /node_modules\/lib2\/.*\.ngfactory\.ts$/.test(sf.fileName)))
          .toBe(true);

      const p4 = compile(p3).program;
      expect(p4.getTsProgram().getSourceFiles().some(
                 sf => /node_modules\/lib\/.*\.ngfactory.*$/.test(sf.fileName)))
          .toBe(false);
      expect(p4.getTsProgram().getSourceFiles().some(
                 sf => /node_modules\/lib2\/.*\.ngfactory.*$/.test(sf.fileName)))
          .toBe(false);
    });

    // Note: this is the case for watch mode with declaration:false
    it('should reuse generated code from libraries from old programs with declaration:false',
       () => {
         compileLib('lib');

         testSupport.writeFiles({
           'src/main.ts': createModuleAndCompSource('main'),
           'src/index.ts': `
            export * from './main';
            export * from 'lib/index';
          `
         });
         const p1 = compile(undefined, {declaration: false}).program;
         expect(p1.getTsProgram().getSourceFiles().some(
                    sf => /node_modules\/lib\/.*\.ngfactory\.ts$/.test(sf.fileName)))
             .toBe(true);
         expect(p1.getTsProgram().getSourceFiles().some(
                    sf => /node_modules\/lib2\/.*\.ngfactory.*$/.test(sf.fileName)))
             .toBe(false);
         const p2 = compile(p1, {declaration: false}).program;
         expect(p2.getTsProgram().getSourceFiles().some(
                    sf => /node_modules\/lib\/.*\.ngfactory.*$/.test(sf.fileName)))
             .toBe(false);
         expect(p2.getTsProgram().getSourceFiles().some(
                    sf => /node_modules\/lib2\/.*\.ngfactory.*$/.test(sf.fileName)))
             .toBe(false);
       });

    it('should only emit changed files', () => {
      testSupport.writeFiles({
        'src/index.ts': createModuleAndCompSource('comp', 'index.html'),
        'src/index.html': `Start`
      });
      const options: ng.CompilerOptions = {declaration: false};
      const host = ng.createCompilerHost({options});
      const originalGetSourceFile = host.getSourceFile;
      const fileCache = new Map<string, ts.SourceFile>();
      host.getSourceFile = (fileName: string, languageVersion: ts.ScriptTarget) => {
        if (fileCache.has(fileName)) {
          return fileCache.get(fileName);
        }
        const sf = originalGetSourceFile.call(host, fileName, languageVersion);
        if (sf !== undefined) {
          fileCache.set(fileName, sf);
        }
        return sf;
      };

      const written = new Map<string, string>();
      host.writeFile = (fileName: string, data: string) => written.set(fileName, data);

      // compile libraries
      const p1 = compile(undefined, options, undefined, host).program;

      // compile without libraries
      const p2 = compile(p1, options, undefined, host).program;
      expect(written.has(path.posix.join(testSupport.basePath, 'built/src/index.js'))).toBe(true);
      let ngFactoryContent =
          written.get(path.posix.join(testSupport.basePath, 'built/src/index.ngfactory.js'));
      expect(ngFactoryContent).toMatch(/Start/);

      // no change -> no emit
      written.clear();
      const p3 = compile(p2, options, undefined, host).program;
      expect(written.size).toBe(0);

      // change a user file
      written.clear();
      fileCache.delete(path.posix.join(testSupport.basePath, 'src/index.ts'));
      const p4 = compile(p3, options, undefined, host).program;
      expect(written.size).toBe(1);
      expect(written.has(path.posix.join(testSupport.basePath, 'built/src/index.js'))).toBe(true);

      // change a file that is input to generated files
      written.clear();
      testSupport.writeFiles({'src/index.html': 'Hello'});
      const p5 = compile(p4, options, undefined, host).program;
      expect(written.size).toBe(1);
      ngFactoryContent =
          written.get(path.posix.join(testSupport.basePath, 'built/src/index.ngfactory.js'));
      expect(ngFactoryContent).toMatch(/Hello/);

      // change a file and create an intermediate program that is not emitted
      written.clear();
      fileCache.delete(path.posix.join(testSupport.basePath, 'src/index.ts'));
      const p6 = ng.createProgram({
        rootNames: [path.posix.join(testSupport.basePath, 'src/index.ts')],
        options: testSupport.createCompilerOptions(options),
        host,
        oldProgram: p5
      });
      const p7 = compile(p6, options, undefined, host).program;
      expect(written.size).toBe(1);
    });

    it('should set emitSkipped to false for full and incremental emit', () => {
      testSupport.writeFiles({
        'src/index.ts': createModuleAndCompSource('main'),
      });
      const {emitResult: emitResult1, program: p1} = compile();
      expect(emitResult1.emitSkipped).toBe(false);
      const {emitResult: emitResult2, program: p2} = compile(p1);
      expect(emitResult2.emitSkipped).toBe(false);
      const {emitResult: emitResult3, program: p3} = compile(p2);
      expect(emitResult3.emitSkipped).toBe(false);
    });

    it('should store library summaries on emit', () => {
      compileLib('lib');
      testSupport.writeFiles({
        'src/main.ts': createModuleAndCompSource('main'),
        'src/index.ts': `
            export * from './main';
            export * from 'lib/index';
          `
      });
      const p1 = compile().program;
      expect(Array.from(p1.getLibrarySummaries().values())
                 .some(sf => /node_modules\/lib\/index\.ngfactory\.d\.ts$/.test(sf.fileName)))
          .toBe(true);
      expect(Array.from(p1.getLibrarySummaries().values())
                 .some(sf => /node_modules\/lib\/index\.ngsummary\.json$/.test(sf.fileName)))
          .toBe(true);
      expect(Array.from(p1.getLibrarySummaries().values())
                 .some(sf => /node_modules\/lib\/index\.d\.ts$/.test(sf.fileName)))
          .toBe(true);

      expect(Array.from(p1.getLibrarySummaries().values())
                 .some(sf => /src\/main.*$/.test(sf.fileName)))
          .toBe(false);
    });

    describe(
        'verify that program structure is reused within tsc in order to speed up incremental compilation',
        () => {
          afterEach(resetTempProgramHandlerForTest);

          function captureStructureReuse(compile: () => void): StructureIsReused|null {
            let structureReuse: StructureIsReused|null = null;
            setTempProgramHandlerForTest(program => {
              structureReuse = tsStructureIsReused(program);
            });
            compile();
            return structureReuse;
          }

          it('should reuse the old ts program completely if nothing changed', () => {
            testSupport.writeFiles({'src/index.ts': createModuleAndCompSource('main')});
            const host = createWatchModeHost();
            // Note: the second compile drops factories for library files,
            // and therefore changes the structure again
            const p1 = compile(undefined, undefined, undefined, host).program;
            const p2 = compile(p1, undefined, undefined, host).program;
            const structureReuse =
                captureStructureReuse(() => compile(p2, undefined, undefined, host));
            expect(structureReuse).toBe(StructureIsReused.Completely);
          });

          it('should reuse the old ts program completely if a template or a ts file changed',
             () => {
               const host = createWatchModeHost();
               testSupport.writeFiles({
                 'src/main.ts': createModuleAndCompSource('main', 'main.html'),
                 'src/main.html': `Some template`,
                 'src/util.ts': `export const x = 1`,
                 'src/index.ts': `
            export * from './main';
            export * from './util';
          `
               });
               // Note: the second compile drops factories for library files,
               // and therefore changes the structure again
               const p1 = compile(undefined, undefined, undefined, host).program;
               const p2 = compile(p1, undefined, undefined, host).program;
               testSupport.writeFiles({
                 'src/main.html': `Another template`,
                 'src/util.ts': `export const x = 2`,
               });
               const structureReuse =
                   captureStructureReuse(() => compile(p2, undefined, undefined, host));
               expect(structureReuse).toBe(StructureIsReused.Completely);
             });

          it('should not reuse the old ts program if an import changed', () => {
            const host = createWatchModeHost();
            testSupport.writeFiles({
              'src/main.ts': createModuleAndCompSource('main'),
              'src/util.ts': `export const x = 1`,
              'src/index.ts': `
            export * from './main';
            export * from './util';
          `
            });
            // Note: the second compile drops factories for library files,
            // and therefore changes the structure again
            const p1 = compile(undefined, undefined, undefined, host).program;
            const p2 = compile(p1, undefined, undefined, host).program;
            testSupport.writeFiles(
                {'src/util.ts': `import {Injectable} from '@angular/core'; export const x = 1;`});
            const structureReuse =
                captureStructureReuse(() => compile(p2, undefined, undefined, host));
            expect(structureReuse).toBe(StructureIsReused.SafeModules);
          });
        });
  });

  it('should not typecheck templates if skipTemplateCodegen is set but fullTemplateTypeCheck is not',
     () => {
       testSupport.writeFiles({
         'src/main.ts': `
        import {NgModule} from '@angular/core';

        @NgModule((() => {if (1==1) return null as any;}) as any)
        export class SomeClassWithInvalidMetadata {}
      `,
       });
       const options = testSupport.createCompilerOptions({skipTemplateCodegen: true});
       const host = ng.createCompilerHost({options});
       const program = ng.createProgram(
           {rootNames: [path.resolve(testSupport.basePath, 'src/main.ts')], options, host});
       expectNoDiagnosticsInProgram(options, program);
       const emitResult = program.emit({emitFlags: EmitFlags.All});
       expect(emitResult.diagnostics.length).toBe(0);

       testSupport.shouldExist('built/src/main.metadata.json');
     });

  it('should typecheck templates if skipTemplateCodegen and fullTemplateTypeCheck is set', () => {
    testSupport.writeFiles({
      'src/main.ts': createModuleAndCompSource('main', `{{nonExistent}}`),
    });
    const options = testSupport.createCompilerOptions({
      skipTemplateCodegen: true,
      fullTemplateTypeCheck: true,
    });
    const host = ng.createCompilerHost({options});
    const program = ng.createProgram(
        {rootNames: [path.resolve(testSupport.basePath, 'src/main.ts')], options, host});
    const diags = program.getNgSemanticDiagnostics();
    expect(diags.length).toBe(1);
    expect(diags[0].messageText).toBe(`Property 'nonExistent' does not exist on type 'mainComp'.`);
  });

  it('should be able to use asynchronously loaded resources', (done) => {
    testSupport.writeFiles({
      'src/main.ts': createModuleAndCompSource('main', 'main.html'),
      // Note: we need to be able to resolve the template synchronously,
      // only the content is delivered asynchronously.
      'src/main.html': '',
    });
    const options = testSupport.createCompilerOptions();
    const host = ng.createCompilerHost({options});
    host.readResource = () => Promise.resolve('Hello world!');
    const program = ng.createProgram(
        {rootNames: [path.resolve(testSupport.basePath, 'src/main.ts')], options, host});
    program.loadNgStructureAsync().then(() => {
      program.emit();
      const ngFactoryPath = path.resolve(testSupport.basePath, 'built/src/main.ngfactory.js');
      const factory = fs.readFileSync(ngFactoryPath, 'utf8');
      expect(factory).toContain('Hello world!');
      done();
    });
  });

  it('should work with noResolve', () => {
    // create a temporary ts program to get the list of all files from angular...
    testSupport.writeFiles({
      'src/main.ts': createModuleAndCompSource('main'),
    });
    const allRootNames = resolveFiles([path.resolve(testSupport.basePath, 'src/main.ts')]);

    // now do the actual test with noResolve
    const program = compile(undefined, {noResolve: true}, allRootNames);

    testSupport.shouldExist('built/src/main.ngfactory.js');
    testSupport.shouldExist('built/src/main.ngfactory.d.ts');
  });

  it('should work with tsx files', () => {
    // create a temporary ts program to get the list of all files from angular...
    testSupport.writeFiles({
      'src/main.tsx': createModuleAndCompSource('main'),
    });
    const allRootNames = resolveFiles([path.resolve(testSupport.basePath, 'src/main.tsx')]);

    const program = compile(undefined, {jsx: ts.JsxEmit.React}, allRootNames);

    testSupport.shouldExist('built/src/main.js');
    testSupport.shouldExist('built/src/main.d.ts');
    testSupport.shouldExist('built/src/main.ngfactory.js');
    testSupport.shouldExist('built/src/main.ngfactory.d.ts');
    testSupport.shouldExist('built/src/main.ngsummary.json');
  });

  it('should emit also empty generated files depending on the options', () => {
    testSupport.writeFiles({
      'src/main.ts': `
        import {Component, NgModule} from '@angular/core';

        @Component({selector: 'main', template: '', styleUrls: ['main.css']})
        export class MainComp {}

        @NgModule({declarations: [MainComp]})
        export class MainModule {}
      `,
      'src/main.css': ``,
      'src/util.ts': 'export const x = 1;',
      'src/index.ts': `
        export * from './util';
        export * from './main';
      `,
    });
    const options = testSupport.createCompilerOptions({
      allowEmptyCodegenFiles: true,
      enableSummariesForJit: true,
    });
    const host = ng.createCompilerHost({options});
    const written = new Map < string, {
      original: ReadonlyArray<ts.SourceFile>|undefined;
      data: string;
    }
    > ();

    host.writeFile =
        (fileName: string, data: string, writeByteOrderMark: boolean,
         onError: ((message: string) => void)|undefined,
         sourceFiles?: ReadonlyArray<ts.SourceFile>) => {
          written.set(fileName, {original: sourceFiles, data});
        };
    const program = ng.createProgram(
        {rootNames: [path.resolve(testSupport.basePath, 'src/index.ts')], options, host});
    program.emit();

    const enum ShouldBe { Empty, EmptyExport, NoneEmpty }
    function assertGenFile(
        fileName: string, checks: {originalFileName: string, shouldBe: ShouldBe}) {
      const writeData = written.get(path.posix.join(testSupport.basePath, fileName));
      expect(writeData).toBeTruthy();
      expect(
          writeData!.original!.some(
              sf => sf.fileName === path.posix.join(testSupport.basePath, checks.originalFileName)))
          .toBe(true);
      switch (checks.shouldBe) {
        case ShouldBe.Empty:
          expect(writeData!.data).toMatch(/^(\s*\/\*([^*]|\*[^\/])*\*\/\s*)?$/);
          break;
        case ShouldBe.EmptyExport:
          expect(writeData!.data)
              .toMatch(/^((\s*\/\*([^*]|\*[^\/])*\*\/\s*)|(\s*export\s*{\s*};\s*))$/m);
          break;
        case ShouldBe.NoneEmpty:
          expect(writeData!.data).not.toBe('');
          break;
      }
    }

    assertGenFile(
        'built/src/util.ngfactory.js',
        {originalFileName: 'src/util.ts', shouldBe: ShouldBe.EmptyExport});
    assertGenFile(
        'built/src/util.ngfactory.d.ts',
        {originalFileName: 'src/util.ts', shouldBe: ShouldBe.EmptyExport});
    assertGenFile(
        'built/src/util.ngsummary.js',
        {originalFileName: 'src/util.ts', shouldBe: ShouldBe.EmptyExport});
    assertGenFile(
        'built/src/util.ngsummary.d.ts',
        {originalFileName: 'src/util.ts', shouldBe: ShouldBe.EmptyExport});
    assertGenFile(
        'built/src/util.ngsummary.json',
        {originalFileName: 'src/util.ts', shouldBe: ShouldBe.NoneEmpty});

    // Note: we always fill non shim and shim style files as they might
    // be shared by component with and without ViewEncapsulation.
    assertGenFile(
        'built/src/main.css.ngstyle.js',
        {originalFileName: 'src/main.ts', shouldBe: ShouldBe.NoneEmpty});
    assertGenFile(
        'built/src/main.css.ngstyle.d.ts',
        {originalFileName: 'src/main.ts', shouldBe: ShouldBe.EmptyExport});
    // Note: this file is not empty as we actually generated code for it
    assertGenFile(
        'built/src/main.css.shim.ngstyle.js',
        {originalFileName: 'src/main.ts', shouldBe: ShouldBe.NoneEmpty});
    assertGenFile(
        'built/src/main.css.shim.ngstyle.d.ts',
        {originalFileName: 'src/main.ts', shouldBe: ShouldBe.EmptyExport});
  });

  it('should not emit /// references in .d.ts files', () => {
    testSupport.writeFiles({
      'src/main.ts': createModuleAndCompSource('main'),
    });
    compile(undefined, {declaration: true}, [path.resolve(testSupport.basePath, 'src/main.ts')]);

    const dts =
        fs.readFileSync(path.resolve(testSupport.basePath, 'built', 'src', 'main.d.ts')).toString();
    expect(dts).toMatch('export declare class');
    expect(dts).not.toMatch('///');
  });

  it('should not emit generated files whose sources are outside of the rootDir', () => {
    testSupport.writeFiles({
      'src/main.ts': createModuleAndCompSource('main'),
      'src/index.ts': `
          export * from './main';
        `
    });
    const options =
        testSupport.createCompilerOptions({rootDir: path.resolve(testSupport.basePath, 'src')});
    const host = ng.createCompilerHost({options});
    const writtenFileNames: string[] = [];
    const oldWriteFile = host.writeFile;
    host.writeFile = (fileName, data, writeByteOrderMark, onError, sourceFiles) => {
      writtenFileNames.push(fileName);
      oldWriteFile(fileName, data, writeByteOrderMark, onError, sourceFiles);
    };

    compile(/*oldProgram*/ undefined, options, /*rootNames*/ undefined, host);

    // no emit for files from node_modules as they are outside of rootDir
    expect(writtenFileNames.some(f => /node_modules/.test(f))).toBe(false);

    // emit all gen files for files under src/
    testSupport.shouldExist('built/main.js');
    testSupport.shouldExist('built/main.d.ts');
    testSupport.shouldExist('built/main.ngfactory.js');
    testSupport.shouldExist('built/main.ngfactory.d.ts');
    testSupport.shouldExist('built/main.ngsummary.json');
  });

  describe('createSrcToOutPathMapper', () => {
    it('should return identity mapping if no outDir is present', () => {
      const mapper = createSrcToOutPathMapper(undefined, undefined, undefined, path.posix);
      expect(mapper('/tmp/b/y.js')).toBe('/tmp/b/y.js');
    });

    it('should return identity mapping if first src and out fileName have same dir', () => {
      const mapper = createSrcToOutPathMapper('/tmp', '/tmp/a/x.ts', '/tmp/a/x.js', path.posix);
      expect(mapper('/tmp/b/y.js')).toBe('/tmp/b/y.js');
    });

    it('should adjust the filename if the outDir is inside of the rootDir', () => {
      const mapper =
          createSrcToOutPathMapper('/tmp/out', '/tmp/a/x.ts', '/tmp/out/a/x.js', path.posix);
      expect(mapper('/tmp/b/y.js')).toBe('/tmp/out/b/y.js');
    });

    it('should adjust the filename if the outDir is outside of the rootDir', () => {
      const mapper = createSrcToOutPathMapper('/out', '/tmp/a/x.ts', '/out/a/x.js', path.posix);
      expect(mapper('/tmp/b/y.js')).toBe('/out/b/y.js');
    });

    it('should adjust the filename if the common prefix of sampleSrc and sampleOut is outside of outDir',
       () => {
         const mapper = createSrcToOutPathMapper(
             '/dist/common', '/src/common/x.ts', '/dist/common/x.js', path.posix);
         expect(mapper('/src/common/y.js')).toBe('/dist/common/y.js');
       });

    it('should work on windows with normalized paths', () => {
      const mapper =
          createSrcToOutPathMapper('c:/tmp/out', 'c:/tmp/a/x.ts', 'c:/tmp/out/a/x.js', path.win32);
      expect(mapper('c:/tmp/b/y.js')).toBe('c:/tmp/out/b/y.js');
    });

    it('should work on windows with non-normalized paths', () => {
      const mapper = createSrcToOutPathMapper(
          'c:\\tmp\\out', 'c:\\tmp\\a\\x.ts', 'c:\\tmp\\out\\a\\x.js', path.win32);
      expect(mapper('c:\\tmp\\b\\y.js')).toBe('c:/tmp/out/b/y.js');
    });
  });

  describe('listLazyRoutes', () => {
    function writeSomeRoutes() {
      testSupport.writeFiles({
        'src/main.ts': `
          import {NgModule} from '@angular/core';
          import {RouterModule} from '@angular/router';

          @NgModule({
            imports: [RouterModule.forRoot([{loadChildren: './child#ChildModule'}])]
          })
          export class MainModule {}
        `,
        'src/child.ts': `
          import {NgModule} from '@angular/core';
          import {RouterModule} from '@angular/router';

          @NgModule({
            imports: [RouterModule.forChild([{loadChildren: './child2#ChildModule2'}])]
          })
          export class ChildModule {}
        `,
        'src/child2.ts': `
          import {NgModule} from '@angular/core';

          @NgModule()
          export class ChildModule2 {}
        `,
      });
    }

    function createProgram(rootNames: string[], overrideOptions: ng.CompilerOptions = {}) {
      const options = testSupport.createCompilerOptions(overrideOptions);
      const host = ng.createCompilerHost({options});
      const program = ng.createProgram(
          {rootNames: rootNames.map(p => path.resolve(testSupport.basePath, p)), options, host});
      return {program, options};
    }

    function normalizeRoutes(lazyRoutes: LazyRoute[]) {
      return lazyRoutes.map(
          r => ({
            route: r.route,
            module: {name: r.module.name, filePath: r.module.filePath},
            referencedModule:
                {name: r.referencedModule.name, filePath: r.referencedModule.filePath},
          }));
    }

    it('should list all lazyRoutes', () => {
      writeSomeRoutes();
      const {program, options} = createProgram(['src/main.ts', 'src/child.ts', 'src/child2.ts']);
      expectNoDiagnosticsInProgram(options, program);
      expect(normalizeRoutes(program.listLazyRoutes())).toEqual([
        {
          module:
              {name: 'MainModule', filePath: path.posix.join(testSupport.basePath, 'src/main.ts')},
          referencedModule: {
            name: 'ChildModule',
            filePath: path.posix.join(testSupport.basePath, 'src/child.ts')
          },
          route: './child#ChildModule'
        },
        {
          module: {
            name: 'ChildModule',
            filePath: path.posix.join(testSupport.basePath, 'src/child.ts')
          },
          referencedModule: {
            name: 'ChildModule2',
            filePath: path.posix.join(testSupport.basePath, 'src/child2.ts')
          },
          route: './child2#ChildModule2'
        },
      ]);
    });

    it('should emit correctly after listing lazyRoutes', () => {
      testSupport.writeFiles({
        'src/main.ts': `
          import {NgModule} from '@angular/core';
          import {RouterModule} from '@angular/router';

          @NgModule({
            imports: [RouterModule.forRoot([{loadChildren: './lazy/lazy#LazyModule'}])]
          })
          export class MainModule {}
        `,
        'src/lazy/lazy.ts': `
          import {NgModule} from '@angular/core';

          @NgModule()
          export class ChildModule {}
        `,
      });
      const {program, options} = createProgram(['src/main.ts', 'src/lazy/lazy.ts']);
      expectNoDiagnosticsInProgram(options, program);
      program.listLazyRoutes();
      program.emit();

      const ngFactoryPath = path.resolve(testSupport.basePath, 'built/src/lazy/lazy.ngfactory.js');
      const lazyNgFactory = fs.readFileSync(ngFactoryPath, 'utf8');

      expect(lazyNgFactory).toContain('import * as i1 from "./lazy";');
    });

    it('should list lazyRoutes given an entryRoute recursively', () => {
      writeSomeRoutes();
      const {program, options} = createProgram(['src/main.ts']);
      expectNoDiagnosticsInProgram(options, program);
      expect(normalizeRoutes(program.listLazyRoutes('src/main#MainModule'))).toEqual([
        {
          module:
              {name: 'MainModule', filePath: path.posix.join(testSupport.basePath, 'src/main.ts')},
          referencedModule: {
            name: 'ChildModule',
            filePath: path.posix.join(testSupport.basePath, 'src/child.ts')
          },
          route: './child#ChildModule'
        },
        {
          module: {
            name: 'ChildModule',
            filePath: path.posix.join(testSupport.basePath, 'src/child.ts')
          },
          referencedModule: {
            name: 'ChildModule2',
            filePath: path.posix.join(testSupport.basePath, 'src/child2.ts')
          },
          route: './child2#ChildModule2'
        },
      ]);

      expect(normalizeRoutes(program.listLazyRoutes('src/child#ChildModule'))).toEqual([
        {
          module: {
            name: 'ChildModule',
            filePath: path.posix.join(testSupport.basePath, 'src/child.ts')
          },
          referencedModule: {
            name: 'ChildModule2',
            filePath: path.posix.join(testSupport.basePath, 'src/child2.ts')
          },
          route: './child2#ChildModule2'
        },
      ]);
    });

    it('should list lazyRoutes pointing to a default export', () => {
      testSupport.writeFiles({
        'src/main.ts': `
          import {NgModule} from '@angular/core';
          import {RouterModule} from '@angular/router';

          @NgModule({
            imports: [RouterModule.forRoot([{loadChildren: './child'}])]
          })
          export class MainModule {}
        `,
        'src/child.ts': `
          import {NgModule} from '@angular/core';

          @NgModule()
          export default class ChildModule {}
        `,
      });
      const {program, options} = createProgram(['src/main.ts']);
      expect(normalizeRoutes(program.listLazyRoutes('src/main#MainModule'))).toEqual([
        {
          module:
              {name: 'MainModule', filePath: path.posix.join(testSupport.basePath, 'src/main.ts')},
          referencedModule: {
            name: undefined as any as string,  // TODO: Review use of `any` here (#19904)
            filePath: path.posix.join(testSupport.basePath, 'src/child.ts')
          },
          route: './child'
        },
      ]);
    });

    it('should list lazyRoutes from imported modules', () => {
      testSupport.writeFiles({
        'src/main.ts': `
          import {NgModule} from '@angular/core';
          import {RouterModule} from '@angular/router';
          import {NestedMainModule} from './nested/main';

          @NgModule({
            imports: [
              RouterModule.forRoot([{loadChildren: './child#ChildModule'}]),
              NestedMainModule,
            ]
          })
          export class MainModule {}
        `,
        'src/child.ts': `
          import {NgModule} from '@angular/core';

          @NgModule()
          export class ChildModule {}
        `,
        'src/nested/main.ts': `
          import {NgModule} from '@angular/core';
          import {RouterModule} from '@angular/router';

          @NgModule({
            imports: [RouterModule.forChild([{loadChildren: './child#NestedChildModule'}])]
          })
          export class NestedMainModule {}
        `,
        'src/nested/child.ts': `
          import {NgModule} from '@angular/core';

          @NgModule()
          export class NestedChildModule {}
        `,
      });
      const {program, options} = createProgram(['src/main.ts']);
      expect(normalizeRoutes(program.listLazyRoutes('src/main#MainModule'))).toEqual([
        {
          module: {
            name: 'NestedMainModule',
            filePath: path.posix.join(testSupport.basePath, 'src/nested/main.ts')
          },
          referencedModule: {
            name: 'NestedChildModule',
            filePath: path.posix.join(testSupport.basePath, 'src/nested/child.ts')
          },
          route: './child#NestedChildModule'
        },
        {
          module:
              {name: 'MainModule', filePath: path.posix.join(testSupport.basePath, 'src/main.ts')},
          referencedModule: {
            name: 'ChildModule',
            filePath: path.posix.join(testSupport.basePath, 'src/child.ts')
          },
          route: './child#ChildModule'
        },
      ]);
    });

    it('should dedupe lazyRoutes given an entryRoute', () => {
      writeSomeRoutes();
      testSupport.writeFiles({
        'src/index.ts': `
          import {NgModule} from '@angular/core';
          import {RouterModule} from '@angular/router';

          @NgModule({
            imports: [
              RouterModule.forRoot([{loadChildren: './main#MainModule'}]),
              RouterModule.forRoot([{loadChildren: './child#ChildModule'}]),
            ]
          })
          export class MainModule {}
        `,
      });
      const {program, options} = createProgram(['src/index.ts']);
      expectNoDiagnosticsInProgram(options, program);
      expect(normalizeRoutes(program.listLazyRoutes('src/main#MainModule'))).toEqual([
        {
          module:
              {name: 'MainModule', filePath: path.posix.join(testSupport.basePath, 'src/main.ts')},
          referencedModule: {
            name: 'ChildModule',
            filePath: path.posix.join(testSupport.basePath, 'src/child.ts')
          },
          route: './child#ChildModule'
        },
        {
          module: {
            name: 'ChildModule',
            filePath: path.posix.join(testSupport.basePath, 'src/child.ts')
          },
          referencedModule: {
            name: 'ChildModule2',
            filePath: path.posix.join(testSupport.basePath, 'src/child2.ts')
          },
          route: './child2#ChildModule2'
        },
      ]);
    });

    it('should list lazyRoutes given an entryRoute even with static errors', () => {
      testSupport.writeFiles({
        'src/main.ts': `
          import {NgModule, Component} from '@angular/core';
          import {RouterModule} from '@angular/router';

          @Component({
            selector: 'url-comp',
            // Non existent external template
            templateUrl: 'non-existent.html',
          })
          export class ErrorComp {}

          @Component({
            selector: 'err-comp',
            // Error in template
            template: '<input/>{{',
          })
          export class ErrorComp2 {}

          // Component with metadata errors.
          @Component(() => {if (1==1) return null as any;})
          export class ErrorComp3 {}

          // Unused component
          @Component({
            selector: 'unused-comp',
            template: ''
          })
          export class UnusedComp {}

          @NgModule({
            declarations: [ErrorComp, ErrorComp2, ErrorComp3, NonExistentComp],
            imports: [RouterModule.forRoot([{loadChildren: './child#ChildModule'}])]
          })
          export class MainModule {}

          @NgModule({
            // Component used in 2 NgModules
            declarations: [ErrorComp],
          })
          export class Mod2 {}
        `,
        'src/child.ts': `
          import {NgModule} from '@angular/core';

          @NgModule()
          export class ChildModule {}
        `,
      });
      const program = createProgram(['src/main.ts'], {collectAllErrors: true}).program;
      expect(normalizeRoutes(program.listLazyRoutes('src/main#MainModule'))).toEqual([{
        module:
            {name: 'MainModule', filePath: path.posix.join(testSupport.basePath, 'src/main.ts')},
        referencedModule:
            {name: 'ChildModule', filePath: path.posix.join(testSupport.basePath, 'src/child.ts')},
        route: './child#ChildModule'
      }]);
    });
  });

  it('should report errors for ts and ng errors on emit with noEmitOnError=true', () => {
    testSupport.writeFiles({
      'src/main.ts': `
        import {Component, NgModule} from '@angular/core';

        // Ts error
        let x: string = 1;

        // Ng error
        @Component({selector: 'comp', templateUrl: './main.html'})
        export class MyComp {}

        @NgModule({declarations: [MyComp]})
        export class MyModule {}
        `,
      'src/main.html': '{{nonExistent}}'
    });
    const options = testSupport.createCompilerOptions({noEmitOnError: true});
    const host = ng.createCompilerHost({options});
    const program1 = ng.createProgram(
        {rootNames: [path.resolve(testSupport.basePath, 'src/main.ts')], options, host});
    const errorDiags =
        program1.emit().diagnostics.filter(d => d.category === ts.DiagnosticCategory.Error);
    expect(stripAnsi(formatDiagnostics(errorDiags)))
        .toContain(
            `src/main.ts:5:13 - error TS2322: Type 'number' is not assignable to type 'string'.`);
    expect(stripAnsi(formatDiagnostics(errorDiags)))
        .toContain(
            `src/main.html:1:1 - error TS100: Property 'nonExistent' does not exist on type 'MyComp'.`);
  });

  it('should not report emit errors with noEmitOnError=false', () => {
    testSupport.writeFiles({
      'src/main.ts': `
        @NgModule()
      `
    });
    const options = testSupport.createCompilerOptions({noEmitOnError: false});
    const host = ng.createCompilerHost({options});
    const program1 = ng.createProgram(
        {rootNames: [path.resolve(testSupport.basePath, 'src/main.ts')], options, host});
    expect(program1.emit().diagnostics.length).toBe(0);
  });

  describe('errors', () => {
    const fileWithStructuralError = `
      import {NgModule} from '@angular/core';

      @NgModule(() => (1===1 ? null as any : null as any))
      export class MyModule {}
    `;
    const fileWithGoodContent = `
      import {NgModule} from '@angular/core';

      @NgModule()
      export class MyModule {}
    `;

    it('should not throw on structural errors but collect them', () => {
      testSupport.write('src/index.ts', fileWithStructuralError);

      const options = testSupport.createCompilerOptions();
      const host = ng.createCompilerHost({options});
      const program = ng.createProgram(
          {rootNames: [path.resolve(testSupport.basePath, 'src/index.ts')], options, host});

      const structuralErrors = program.getNgStructuralDiagnostics();
      expect(structuralErrors.length).toBe(1);
      expect(structuralErrors[0].messageText).toContain('Function expressions are not supported');
    });

    it('should not throw on structural errors but collect them (loadNgStructureAsync)', (done) => {
      testSupport.write('src/index.ts', fileWithStructuralError);

      const options = testSupport.createCompilerOptions();
      const host = ng.createCompilerHost({options});
      const program = ng.createProgram(
          {rootNames: [path.resolve(testSupport.basePath, 'src/index.ts')], options, host});
      program.loadNgStructureAsync().then(() => {
        const structuralErrors = program.getNgStructuralDiagnostics();
        expect(structuralErrors.length).toBe(1);
        expect(structuralErrors[0].messageText).toContain('Function expressions are not supported');
        done();
      });
    });

    it('should include non-formatted errors (e.g. invalid templateUrl)', () => {
      testSupport.write('src/index.ts', `
        import {Component, NgModule} from '@angular/core';

        @Component({
          selector: 'my-component',
          templateUrl: 'template.html',   // invalid template url
        })
        export class MyComponent {}

        @NgModule({
          declarations: [MyComponent]
        })
        export class MyModule {}
      `);

      const options = testSupport.createCompilerOptions();
      const host = ng.createCompilerHost({options});
      const program = ng.createProgram({
        rootNames: [path.resolve(testSupport.basePath, 'src/index.ts')],
        options,
        host,
      });

      const structuralErrors = program.getNgStructuralDiagnostics();
      expect(structuralErrors.length).toBe(1);
      expect(structuralErrors[0].messageText).toContain('Couldn\'t resolve resource template.html');
    });

    it('should be able report structural errors with noResolve:true and generateCodeForLibraries:false ' +
           'even if getSourceFile throws for non existent files',
       () => {
         testSupport.write('src/index.ts', fileWithGoodContent);

         // compile angular and produce .ngsummary.json / ngfactory.d.ts files
         compile();

         testSupport.write('src/ok.ts', fileWithGoodContent);
         testSupport.write('src/error.ts', fileWithStructuralError);

         // Make sure the ok.ts file is before the error.ts file,
         // so we added a .ngfactory.ts file for it.
         const allRootNames = resolveFiles(
             ['src/ok.ts', 'src/error.ts'].map(fn => path.resolve(testSupport.basePath, fn)));

         const options = testSupport.createCompilerOptions({
           noResolve: true,
           generateCodeForLibraries: false,
         });
         const host = ng.createCompilerHost({options});
         const originalGetSourceFile = host.getSourceFile;
         host.getSourceFile =
             (fileName: string, languageVersion: ts.ScriptTarget,
              onError?: ((message: string) => void)|undefined): ts.SourceFile|undefined => {
               // We should never try to load .ngfactory.ts files
               if (fileName.match(/\.ngfactory\.ts$/)) {
                 throw new Error(`Non existent ngfactory file: ` + fileName);
               }
               return originalGetSourceFile.call(host, fileName, languageVersion, onError);
             };
         const program = ng.createProgram({rootNames: allRootNames, options, host});
         const structuralErrors = program.getNgStructuralDiagnostics();
         expect(structuralErrors.length).toBe(1);
         expect(structuralErrors[0].messageText)
             .toContain('Function expressions are not supported');
       });
  });
});
