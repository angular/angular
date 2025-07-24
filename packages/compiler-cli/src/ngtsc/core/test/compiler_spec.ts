/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import ts from 'typescript';

import {
  absoluteFrom as _,
  FileSystem,
  getFileSystem,
  getSourceFileOrError,
  NgtscCompilerHost,
  setFileSystem,
} from '../../file_system';
import {runInEachFileSystem} from '../../file_system/testing';
import {IncrementalBuildStrategy, NoopIncrementalBuildStrategy} from '../../incremental';
import {ProgramDriver, TsCreateProgramDriver} from '../../program_driver';
import {ClassDeclaration, isNamedClassDeclaration} from '../../reflection';
import {OptimizeFor} from '../../typecheck/api';

import {NgCompilerOptions} from '../api';

import {freshCompilationTicket, NgCompiler, resourceChangeTicket} from '../src/compiler';
import {NgCompilerHost} from '../src/host';

function makeFreshCompiler(
  host: NgCompilerHost,
  options: NgCompilerOptions,
  program: ts.Program,
  programStrategy: ProgramDriver,
  incrementalStrategy: IncrementalBuildStrategy,
  enableTemplateTypeChecker: boolean,
  usePoisonedData: boolean,
): NgCompiler {
  const ticket = freshCompilationTicket(
    program,
    options,
    incrementalStrategy,
    programStrategy,
    /* perfRecorder */ null,
    enableTemplateTypeChecker,
    usePoisonedData,
  );
  return NgCompiler.fromTicket(ticket, host);
}

runInEachFileSystem(() => {
  describe('NgCompiler', () => {
    let fs: FileSystem;

    beforeEach(() => {
      fs = getFileSystem();
      fs.ensureDir(_('/node_modules/@angular/core'));
      fs.writeFile(
        _('/node_modules/@angular/core/index.d.ts'),
        `
        export declare const Component: any;
      `,
      );
    });

    it('should also return template diagnostics when asked for component diagnostics', () => {
      const COMPONENT = _('/cmp.ts');
      fs.writeFile(
        COMPONENT,
        `
        import {Component} from '@angular/core';
        @Component({
          selector: 'test-cmp',
          templateUrl: './template.html',
        })
        export class Cmp {}
      `,
      );
      fs.writeFile(_('/template.html'), `{{does_not_exist.foo}}`);

      const options: NgCompilerOptions = {
        strictTemplates: true,
      };
      const baseHost = new NgtscCompilerHost(getFileSystem(), options);
      const host = NgCompilerHost.wrap(baseHost, [COMPONENT], options, /* oldProgram */ null);
      const program = ts.createProgram({host, options, rootNames: host.inputFiles});
      const compiler = makeFreshCompiler(
        host,
        options,
        program,
        new TsCreateProgramDriver(program, host, options, []),
        new NoopIncrementalBuildStrategy(),
        /** enableTemplateTypeChecker */ false,
        /* usePoisonedData */ false,
      );

      const diags = compiler.getDiagnosticsForFile(
        getSourceFileOrError(program, COMPONENT),
        OptimizeFor.SingleFile,
      );
      expect(diags.length).toBe(1);
      expect(diags[0].messageText).toContain('does_not_exist');
    });

    describe('getComponentsWithTemplateFile', () => {
      it('should return the component(s) using a template file', () => {
        const templateFile = _('/template.html');
        fs.writeFile(templateFile, `This is the template, used by components CmpA and CmpC`);
        const cmpAFile = _('/cmp-a.ts');
        fs.writeFile(
          cmpAFile,
          `
            import {Component} from '@angular/core';
            @Component({
              selector: 'cmp-a',
              templateUrl: './template.html',
            })
            export class CmpA {}
          `,
        );
        const cmpBFile = _('/cmp-b.ts');
        fs.writeFile(
          cmpBFile,
          `
            import {Component} from '@angular/core';
            @Component({
              selector: 'cmp-b',
              template: 'CmpB does not use an external template',
            })
            export class CmpB {}
          `,
        );
        const cmpCFile = _('/cmp-c.ts');
        fs.writeFile(
          cmpCFile,
          `
            import {Component} from '@angular/core';
            @Component({
              selector: 'cmp-c',
              templateUrl: './template.html',
            })
            export class CmpC {}
          `,
        );

        const options: NgCompilerOptions = {};

        const baseHost = new NgtscCompilerHost(getFileSystem(), options);
        const host = NgCompilerHost.wrap(
          baseHost,
          [cmpAFile, cmpBFile, cmpCFile],
          options,
          /* oldProgram */ null,
        );
        const program = ts.createProgram({host, options, rootNames: host.inputFiles});
        const CmpA = getClass(getSourceFileOrError(program, cmpAFile), 'CmpA');
        const CmpC = getClass(getSourceFileOrError(program, cmpCFile), 'CmpC');

        const compiler = makeFreshCompiler(
          host,
          options,
          program,
          new TsCreateProgramDriver(program, host, options, []),
          new NoopIncrementalBuildStrategy(),
          /** enableTemplateTypeChecker */ false,
          /* usePoisonedData */ false,
        );
        const components = compiler.getComponentsWithTemplateFile(templateFile);
        expect(components).toEqual(new Set([CmpA, CmpC]));
      });
    });

    describe('getComponentsWithStyle', () => {
      it('should return the component(s) using a style file', () => {
        const styleFile = _('/style.css');
        fs.writeFile(styleFile, `/* This is the style, used by components CmpA and CmpC */`);
        const cmpAFile = _('/cmp-a.ts');
        fs.writeFile(
          cmpAFile,
          `
            import {Component} from '@angular/core';
            @Component({
              selector: 'cmp-a',
              template: '',
              styleUrls: ['./style.css'],
            })
            export class CmpA {}
          `,
        );
        const cmpBFile = _('/cmp-b.ts');
        fs.writeFile(
          cmpBFile,
          `
            import {Component} from '@angular/core';
            @Component({
              selector: 'cmp-b',
              template: '',
              styles: ['/* CmpB does not use external style */'],
            })
            export class CmpB {}
          `,
        );
        const cmpCFile = _('/cmp-c.ts');
        fs.writeFile(
          cmpCFile,
          `
            import {Component} from '@angular/core';
            @Component({
              selector: 'cmp-c',
              template: '',
              styleUrls: ['./style.css']
            })
            export class CmpC {}
          `,
        );

        const options: NgCompilerOptions = {};

        const baseHost = new NgtscCompilerHost(getFileSystem(), options);
        const host = NgCompilerHost.wrap(
          baseHost,
          [cmpAFile, cmpBFile, cmpCFile],
          options,
          /* oldProgram */ null,
        );
        const program = ts.createProgram({host, options, rootNames: host.inputFiles});
        const CmpA = getClass(getSourceFileOrError(program, cmpAFile), 'CmpA');
        const CmpC = getClass(getSourceFileOrError(program, cmpCFile), 'CmpC');
        const compiler = makeFreshCompiler(
          host,
          options,
          program,
          new TsCreateProgramDriver(program, host, options, []),
          new NoopIncrementalBuildStrategy(),
          /** enableTemplateTypeChecker */ false,
          /* usePoisonedData */ false,
        );
        const components = compiler.getComponentsWithStyleFile(styleFile);
        expect(components).toEqual(new Set([CmpA, CmpC]));
      });
    });

    describe('getDirectiveResources', () => {
      it('should return the component resources', () => {
        const styleFile = _('/style.css');
        fs.writeFile(styleFile, `/* This is the template, used by components CmpA */`);
        const styleFile2 = _('/style2.css');
        fs.writeFile(styleFile2, `/* This is the template, used by components CmpA */`);
        const templateFile = _('/template.ng.html');
        fs.writeFile(templateFile, `This is the template, used by components CmpA`);
        const cmpAFile = _('/cmp-a.ts');
        fs.writeFile(
          cmpAFile,
          `
            import {Component} from '@angular/core';
            @Component({
              selector: 'cmp-a',
              templateUrl: './template.ng.html',
              styleUrls: ['./style.css', '../../style2.css'],
            })
            export class CmpA {}
          `,
        );

        const options: NgCompilerOptions = {};

        const baseHost = new NgtscCompilerHost(getFileSystem(), options);
        const host = NgCompilerHost.wrap(baseHost, [cmpAFile], options, /* oldProgram */ null);
        const program = ts.createProgram({host, options, rootNames: host.inputFiles});
        const CmpA = getClass(getSourceFileOrError(program, cmpAFile), 'CmpA');
        const compiler = makeFreshCompiler(
          host,
          options,
          program,
          new TsCreateProgramDriver(program, host, options, []),
          new NoopIncrementalBuildStrategy(),
          /** enableTemplateTypeChecker */ false,
          /* usePoisonedData */ false,
        );
        const resources = compiler.getDirectiveResources(CmpA);
        expect(resources).not.toBeNull();
        const {template, styles} = resources!;
        expect(template!.path).toEqual(templateFile);
        expect(styles?.size).toEqual(2);
        const actualPaths = new Set(Array.from(styles || []).map((r) => r.path));
        expect(actualPaths).toEqual(new Set([styleFile, styleFile2]));
      });

      it('does not return component style resources if not an array of strings', () => {
        const styleFile = _('/style.css');
        fs.writeFile(styleFile, `/* This is the template, used by components CmpA */`);
        const styleFile2 = _('/style2.css');
        fs.writeFile(styleFile2, `/* This is the template, used by components CmpA */`);
        const cmpAFile = _('/cmp-a.ts');
        fs.writeFile(
          cmpAFile,
          `
            import {Component} from '@angular/core';
            const STYLES = ['./style.css', '../../style2.css'];
            @Component({
              selector: 'cmp-a',
              template: '',
              styleUrls: STYLES,
            })
            export class CmpA {}
          `,
        );

        const options: NgCompilerOptions = {};

        const baseHost = new NgtscCompilerHost(getFileSystem(), options);
        const host = NgCompilerHost.wrap(baseHost, [cmpAFile], options, /* oldProgram */ null);
        const program = ts.createProgram({host, options, rootNames: host.inputFiles});
        const CmpA = getClass(getSourceFileOrError(program, cmpAFile), 'CmpA');
        const compiler = makeFreshCompiler(
          host,
          options,
          program,
          new TsCreateProgramDriver(program, host, options, []),
          new NoopIncrementalBuildStrategy(),
          /** enableTemplateTypeChecker */ false,
          /* usePoisonedData */ false,
        );
        const resources = compiler.getDirectiveResources(CmpA);
        expect(resources).not.toBeNull();
        const {styles} = resources!;
        expect(styles?.size).toEqual(0);
      });
    });

    describe('getResourceDependencies', () => {
      it('should return resource dependencies of a component source file', () => {
        const COMPONENT = _('/cmp.ts');
        fs.writeFile(
          COMPONENT,
          `
          import {Component} from '@angular/core';
          @Component({
            selector: 'test-cmp',
            templateUrl: './template.html',
            styleUrls: ['./style.css'],
          })
          export class Cmp {}
        `,
        );
        fs.writeFile(_('/template.html'), `<h1>Resource</h1>`);
        fs.writeFile(_('/style.css'), `h1 { }`);

        const options: NgCompilerOptions = {
          strictTemplates: true,
        };
        const baseHost = new NgtscCompilerHost(getFileSystem(), options);
        const host = NgCompilerHost.wrap(baseHost, [COMPONENT], options, /* oldProgram */ null);
        const program = ts.createProgram({host, options, rootNames: host.inputFiles});
        const compiler = makeFreshCompiler(
          host,
          options,
          program,
          new TsCreateProgramDriver(program, host, options, []),
          new NoopIncrementalBuildStrategy(),
          /** enableTemplateTypeChecker */ false,
          /* usePoisonedData */ false,
        );

        const deps = compiler.getResourceDependencies(getSourceFileOrError(program, COMPONENT));
        expect(deps.length).toBe(2);
        expect(deps).toEqual(
          jasmine.arrayContaining([
            jasmine.stringMatching(/\/template.html$/),
            jasmine.stringMatching(/\/style.css$/),
          ]),
        );
      });
    });

    describe('resource-only changes', () => {
      it('should reuse the full compilation state for a resource-only change', () => {
        const COMPONENT = _('/cmp.ts');
        const TEMPLATE = _('/template.html');
        fs.writeFile(
          COMPONENT,
          `
          import {Component} from '@angular/core';
          @Component({
            selector: 'test-cmp',
            templateUrl: './template.html',
          })
          export class Cmp {}
        `,
        );
        fs.writeFile(TEMPLATE, `<h1>Resource</h1>`);

        const options: NgCompilerOptions = {
          strictTemplates: true,
        };
        const baseHost = new NgtscCompilerHost(getFileSystem(), options);
        const host = NgCompilerHost.wrap(baseHost, [COMPONENT], options, /* oldProgram */ null);
        const program = ts.createProgram({host, options, rootNames: host.inputFiles});
        const compilerA = makeFreshCompiler(
          host,
          options,
          program,
          new TsCreateProgramDriver(program, host, options, []),
          new NoopIncrementalBuildStrategy(),
          /** enableTemplateTypeChecker */ false,
          /* usePoisonedData */ false,
        );

        const componentSf = getSourceFileOrError(program, COMPONENT);

        // There should be no diagnostics for the component.
        expect(compilerA.getDiagnosticsForFile(componentSf, OptimizeFor.WholeProgram).length).toBe(
          0,
        );

        // Change the resource file and introduce an error.
        fs.writeFile(TEMPLATE, `<h1>Resource</h2>`);

        // Perform a resource-only incremental step.
        const resourceTicket = resourceChangeTicket(compilerA, new Set([TEMPLATE]));
        const compilerB = NgCompiler.fromTicket(resourceTicket, host);

        // A resource-only update should reuse the same compiler instance.
        expect(compilerB).toBe(compilerA);

        // The new template error should be reported in component diagnostics.
        expect(compilerB.getDiagnosticsForFile(componentSf, OptimizeFor.WholeProgram).length).toBe(
          1,
        );
      });
    });
  });
});

function getClass(sf: ts.SourceFile, name: string): ClassDeclaration<ts.ClassDeclaration> {
  for (const stmt of sf.statements) {
    if (isNamedClassDeclaration(stmt) && stmt.name.text === name) {
      return stmt;
    }
  }
  throw new Error(`Class ${name} not found in file: ${sf.fileName}: ${sf.text}`);
}
