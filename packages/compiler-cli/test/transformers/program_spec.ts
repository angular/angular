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

  describe('reuse of old program', () => {

    function compileLib(libName: string) {
      testSupport.writeFiles({
        [`${libName}_src/index.ts`]: createModuleAndCompSource(libName),
      });
      const options = testSupport.createCompilerOptions({
        skipTemplateCodegen: true,
      });
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

    function compile(oldProgram?: ng.Program): ng.Program {
      const options = testSupport.createCompilerOptions();
      const rootNames = [path.resolve(testSupport.basePath, 'src/index.ts')];

      const program = ng.createProgram({
        rootNames: rootNames,
        options: testSupport.createCompilerOptions(),
        host: ng.createCompilerHost({options}), oldProgram,
      });
      expectNoDiagnosticsInProgram(options, program);
      program.emit();
      return program;
    }

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
});
