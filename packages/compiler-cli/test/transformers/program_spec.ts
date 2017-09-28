/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as ng from '@angular/compiler-cli';
import * as fs from 'fs';
import * as path from 'path';
import * as ts from 'typescript';

import {CompilerHost} from '../../src/transformers/api';
import {createSrcToOutPathMapper} from '../../src/transformers/program';
import {GENERATED_FILES, StructureIsReused, tsStructureIsReused} from '../../src/transformers/util';
import {TestSupport, expectNoDiagnosticsInProgram, setup} from '../test_support';

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
        path.resolve(testSupport.basePath, 'node_modules', libName));
    program.emit({emitFlags: ng.EmitFlags.DTS | ng.EmitFlags.JS | ng.EmitFlags.Metadata});
  }

  function compile(
      oldProgram?: ng.Program, overrideOptions?: ng.CompilerOptions,
      rootNames?: string[]): ng.Program {
    const options = testSupport.createCompilerOptions(overrideOptions);
    if (!rootNames) {
      rootNames = [path.resolve(testSupport.basePath, 'src/index.ts')];
    }

    const program = ng.createProgram({
      rootNames: rootNames,
      options,
      host: ng.createCompilerHost({options}), oldProgram,
    });
    expectNoDiagnosticsInProgram(options, program);
    program.emit();
    return program;
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
      const p1 = compile();
      expect(p1.getTsProgram().getSourceFiles().some(
                 sf => /node_modules\/lib\/.*\.ngfactory\.ts$/.test(sf.fileName)))
          .toBe(true);
      expect(p1.getTsProgram().getSourceFiles().some(
                 sf => /node_modules\/lib2\/.*\.ngfactory.*$/.test(sf.fileName)))
          .toBe(false);
      const p2 = compile(p1);
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
      const p3 = compile(p2);
      expect(p3.getTsProgram().getSourceFiles().some(
                 sf => /node_modules\/lib\/.*\.ngfactory.*$/.test(sf.fileName)))
          .toBe(false);
      expect(p3.getTsProgram().getSourceFiles().some(
                 sf => /node_modules\/lib2\/.*\.ngfactory\.ts$/.test(sf.fileName)))
          .toBe(true);

      const p4 = compile(p3);
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
         const p1 = compile(undefined, {declaration: false});
         expect(p1.getTsProgram().getSourceFiles().some(
                    sf => /node_modules\/lib\/.*\.ngfactory\.ts$/.test(sf.fileName)))
             .toBe(true);
         expect(p1.getTsProgram().getSourceFiles().some(
                    sf => /node_modules\/lib2\/.*\.ngfactory.*$/.test(sf.fileName)))
             .toBe(false);
         const p2 = compile(p1, {declaration: false});
         expect(p2.getTsProgram().getSourceFiles().some(
                    sf => /node_modules\/lib\/.*\.ngfactory.*$/.test(sf.fileName)))
             .toBe(false);
         expect(p2.getTsProgram().getSourceFiles().some(
                    sf => /node_modules\/lib2\/.*\.ngfactory.*$/.test(sf.fileName)))
             .toBe(false);
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
      const p1 = compile();
      expect(p1.getLibrarySummaries().some(
                 sf => /node_modules\/lib\/index\.ngfactory\.d\.ts$/.test(sf.fileName)))
          .toBe(true);
      expect(p1.getLibrarySummaries().some(
                 sf => /node_modules\/lib\/index\.ngsummary\.json$/.test(sf.fileName)))
          .toBe(true);
      expect(
          p1.getLibrarySummaries().some(sf => /node_modules\/lib\/index\.d\.ts$/.test(sf.fileName)))
          .toBe(true);

      expect(p1.getLibrarySummaries().some(sf => /src\/main.*$/.test(sf.fileName))).toBe(false);
    });

    it('should reuse the old ts program completely if nothing changed', () => {
      testSupport.writeFiles({'src/index.ts': createModuleAndCompSource('main')});
      // Note: the second compile drops factories for library files,
      // and therefore changes the structure again
      const p1 = compile();
      const p2 = compile(p1);
      const p3 = compile(p2);
      expect(tsStructureIsReused(p2.getTsProgram())).toBe(StructureIsReused.Completely);
    });

    it('should reuse the old ts program completely if a template or a ts file changed', () => {
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
      const p1 = compile();
      const p2 = compile(p1);
      testSupport.writeFiles({
        'src/main.html': `Another template`,
        'src/util.ts': `export const x = 2`,
      });
      const p3 = compile(p2);
      expect(tsStructureIsReused(p2.getTsProgram())).toBe(StructureIsReused.Completely);
    });

    it('should not reuse the old ts program if an import changed', () => {
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
      const p1 = compile();
      const p2 = compile(p1);
      testSupport.writeFiles(
          {'src/util.ts': `import {Injectable} from '@angular/core'; export const x = 1;`});
      const p3 = compile(p2);
      expect(tsStructureIsReused(p2.getTsProgram())).toBe(StructureIsReused.SafeModules);
    });
  });

  it('should typecheck templates even if skipTemplateCodegen is set', () => {
    testSupport.writeFiles({
      'src/main.ts': createModuleAndCompSource('main', `{{nonExistent}}`),
    });
    const options = testSupport.createCompilerOptions({skipTemplateCodegen: true});
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
      const factory =
          fs.readFileSync(path.resolve(testSupport.basePath, 'built/src/main.ngfactory.js'));
      expect(factory).toContain('Hello world!');
      done();
    });
  });

  it('should work with noResolve', () => {
    // create a temporary ts program to get the list of all files from angular...
    testSupport.writeFiles({
      'src/main.ts': createModuleAndCompSource('main'),
    });
    const preOptions = testSupport.createCompilerOptions();
    const preHost = ts.createCompilerHost(preOptions);
    // don't resolve symlinks
    preHost.realpath = (f) => f;
    const preProgram =
        ts.createProgram([path.resolve(testSupport.basePath, 'src/main.ts')], preOptions, preHost);
    const allRootNames = preProgram.getSourceFiles().map(sf => sf.fileName);

    // now do the actual test with noResolve
    const program = compile(undefined, {noResolve: true}, allRootNames);

    testSupport.shouldExist('built/src/main.ngfactory.js');
    testSupport.shouldExist('built/src/main.ngfactory.d.ts');
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
    const options = testSupport.createCompilerOptions({allowEmptyCodegenFiles: true});
    const host = ng.createCompilerHost({options});
    const written = new Map < string, {
      original: ts.SourceFile[]|undefined;
      data: string;
    }
    > ();

    host.writeFile =
        (fileName: string, data: string, writeByteOrderMark: boolean,
         onError?: (message: string) => void, sourceFiles?: ts.SourceFile[]) => {
          written.set(fileName, {original: sourceFiles, data});
        };
    const program = ng.createProgram(
        {rootNames: [path.resolve(testSupport.basePath, 'src/index.ts')], options, host});
    program.emit();

    function assertGenFile(
        fileName: string, checks: {originalFileName: string, shouldBeEmpty: boolean}) {
      const writeData = written.get(path.join(testSupport.basePath, fileName));
      expect(writeData).toBeTruthy();
      expect(writeData !.original !.some(
                 sf => sf.fileName === path.join(testSupport.basePath, checks.originalFileName)))
          .toBe(true);
      if (checks.shouldBeEmpty) {
        expect(writeData !.data).toBe('');
      } else {
        expect(writeData !.data).not.toBe('');
      }
    }

    assertGenFile(
        'built/src/util.ngfactory.js', {originalFileName: 'src/util.ts', shouldBeEmpty: true});
    assertGenFile(
        'built/src/util.ngfactory.d.ts', {originalFileName: 'src/util.ts', shouldBeEmpty: true});
    assertGenFile(
        'built/src/util.ngsummary.js', {originalFileName: 'src/util.ts', shouldBeEmpty: true});
    assertGenFile(
        'built/src/util.ngsummary.d.ts', {originalFileName: 'src/util.ts', shouldBeEmpty: true});
    assertGenFile(
        'built/src/util.ngsummary.json', {originalFileName: 'src/util.ts', shouldBeEmpty: false});

    // Note: we always fill non shim and shim style files as they might
    // be shared by component with and without ViewEncapsulation.
    assertGenFile(
        'built/src/main.css.ngstyle.js', {originalFileName: 'src/main.ts', shouldBeEmpty: false});
    assertGenFile(
        'built/src/main.css.ngstyle.d.ts', {originalFileName: 'src/main.ts', shouldBeEmpty: true});
    // Note: this file is not empty as we actually generated code for it
    assertGenFile(
        'built/src/main.css.shim.ngstyle.js',
        {originalFileName: 'src/main.ts', shouldBeEmpty: false});
    assertGenFile(
        'built/src/main.css.shim.ngstyle.d.ts',
        {originalFileName: 'src/main.ts', shouldBeEmpty: true});
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
    compileLib('lib');
    testSupport.writeFiles({
      'src/main.ts': createModuleAndCompSource('main'),
      'src/index.ts': `
          export * from './main';
          export * from 'lib/index';
        `
    });
    compile(undefined, {rootDir: path.resolve(testSupport.basePath, 'src')});
    testSupport.shouldExist('built/main.js');
    testSupport.shouldExist('built/main.d.ts');
    testSupport.shouldExist('built/main.ngfactory.js');
    testSupport.shouldExist('built/main.ngfactory.d.ts');
    testSupport.shouldExist('built/main.ngsummary.json');
    testSupport.shouldNotExist('build/node_modules/lib/index.js');
    testSupport.shouldNotExist('build/node_modules/lib/index.d.ts');
    testSupport.shouldNotExist('build/node_modules/lib/index.ngfactory.js');
    testSupport.shouldNotExist('build/node_modules/lib/index.ngfactory.d.ts');
    testSupport.shouldNotExist('build/node_modules/lib/index.ngsummary.json');
  });

  describe('createSrcToOutPathMapper', () => {
    it('should return identity mapping if no outDir is present', () => {
      const mapper = createSrcToOutPathMapper(undefined, undefined, undefined);
      expect(mapper('/tmp/b/y.js')).toBe('/tmp/b/y.js');
    });

    it('should return identity mapping if first src and out fileName have same dir', () => {
      const mapper = createSrcToOutPathMapper('/tmp', '/tmp/a/x.ts', '/tmp/a/x.js');
      expect(mapper('/tmp/b/y.js')).toBe('/tmp/b/y.js');
    });

    it('should adjust the filename if the outDir is inside of the rootDir', () => {
      const mapper = createSrcToOutPathMapper('/tmp/out', '/tmp/a/x.ts', '/tmp/out/a/x.js');
      expect(mapper('/tmp/b/y.js')).toBe('/tmp/out/b/y.js');
    });

    it('should adjust the filename if the outDir is outside of the rootDir', () => {
      const mapper = createSrcToOutPathMapper('/out', '/tmp/a/x.ts', '/a/x.js');
      expect(mapper('/tmp/b/y.js')).toBe('/out/b/y.js');
    });
  });
});
