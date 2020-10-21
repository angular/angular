/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as ts from 'typescript';

import {absoluteFrom as _, FileSystem, getFileSystem, getSourceFileOrError, NgtscCompilerHost, setFileSystem} from '../../file_system';
import {runInEachFileSystem} from '../../file_system/testing';
import {NoopIncrementalBuildStrategy} from '../../incremental';
import {ClassDeclaration, isNamedClassDeclaration} from '../../reflection';
import {ReusedProgramStrategy} from '../../typecheck';

import {NgCompilerOptions} from '../api';

import {NgCompiler} from '../src/compiler';
import {NgCompilerHost} from '../src/host';

runInEachFileSystem(() => {
  describe('NgCompiler', () => {
    let fs: FileSystem;

    beforeEach(() => {
      fs = getFileSystem();
      fs.ensureDir(_('/node_modules/@angular/core'));
      fs.writeFile(_('/node_modules/@angular/core/index.d.ts'), `
        export declare const Component: any;
      `);
    });

    it('should also return template diagnostics when asked for component diagnostics', () => {
      const COMPONENT = _('/cmp.ts');
      fs.writeFile(COMPONENT, `
        import {Component} from '@angular/core';
        @Component({
          selector: 'test-cmp',
          templateUrl: './template.html',
        })
        export class Cmp {}
      `);
      fs.writeFile(_('/template.html'), `{{does_not_exist.foo}}`);

      const options: NgCompilerOptions = {
        strictTemplates: true,
      };
      const baseHost = new NgtscCompilerHost(getFileSystem(), options);
      const host = NgCompilerHost.wrap(baseHost, [COMPONENT], options, /* oldProgram */ null);
      const program = ts.createProgram({host, options, rootNames: host.inputFiles});
      const compiler = new NgCompiler(
          host, options, program, new ReusedProgramStrategy(program, host, options, []),
          new NoopIncrementalBuildStrategy(), /** enableTemplateTypeChecker */ false);

      const diags = compiler.getDiagnostics(getSourceFileOrError(program, COMPONENT));
      expect(diags.length).toBe(1);
      expect(diags[0].messageText).toContain('does_not_exist');
    });

    describe('getComponentsWithTemplateFile', () => {
      it('should return the component(s) using a template file', () => {
        const templateFile = _('/template.html');
        fs.writeFile(templateFile, `This is the template, used by components CmpA and CmpC`);
        const cmpAFile = _('/cmp-a.ts');
        fs.writeFile(cmpAFile, `
            import {Component} from '@angular/core';
            @Component({
              selector: 'cmp-a',
              templateUrl: './template.html',
            })
            export class CmpA {}
          `);
        const cmpBFile = _('/cmp-b.ts');
        fs.writeFile(cmpBFile, `
            import {Component} from '@angular/core';
            @Component({
              selector: 'cmp-b',
              template: 'CmpB does not use an external template',
            })
            export class CmpB {}
          `);
        const cmpCFile = _('/cmp-c.ts');
        fs.writeFile(cmpCFile, `
            import {Component} from '@angular/core';
            @Component({
              selector: 'cmp-c',
              templateUrl: './template.html',
            })
            export class CmpC {}
          `);

        const options: NgCompilerOptions = {};

        const baseHost = new NgtscCompilerHost(getFileSystem(), options);
        const host = NgCompilerHost.wrap(
            baseHost, [cmpAFile, cmpBFile, cmpCFile], options, /* oldProgram */ null);
        const program = ts.createProgram({host, options, rootNames: host.inputFiles});
        const CmpA = getClass(getSourceFileOrError(program, cmpAFile), 'CmpA');
        const CmpC = getClass(getSourceFileOrError(program, cmpCFile), 'CmpC');
        const compiler = new NgCompiler(
            host, options, program, new ReusedProgramStrategy(program, host, options, []),
            new NoopIncrementalBuildStrategy(), /** enableTemplateTypeChecker */ false);
        const components = compiler.getComponentsWithTemplateFile(templateFile);
        expect(components).toEqual(new Set([CmpA, CmpC]));
      });
    });

    describe('getComponentsWithStyle', () => {
      it('should return the component(s) using a style file', () => {
        const styleFile = _('/style.css');
        fs.writeFile(styleFile, `/* This is the style, used by components CmpA and CmpC */`);
        const cmpAFile = _('/cmp-a.ts');
        fs.writeFile(cmpAFile, `
            import {Component} from '@angular/core';
            @Component({
              selector: 'cmp-a',
              template: '',
              styleUrls: ['./style.css'],
            })
            export class CmpA {}
          `);
        const cmpBFile = _('/cmp-b.ts');
        fs.writeFile(cmpBFile, `
            import {Component} from '@angular/core';
            @Component({
              selector: 'cmp-b',
              template: '',
              styles: ['/* CmpB does not use external style */'],
            })
            export class CmpB {}
          `);
        const cmpCFile = _('/cmp-c.ts');
        fs.writeFile(cmpCFile, `
            import {Component} from '@angular/core';
            @Component({
              selector: 'cmp-c',
              template: '',
              styleUrls: ['./style.css']
            })
            export class CmpC {}
          `);

        const options: NgCompilerOptions = {};

        const baseHost = new NgtscCompilerHost(getFileSystem(), options);
        const host = NgCompilerHost.wrap(
            baseHost, [cmpAFile, cmpBFile, cmpCFile], options, /* oldProgram */ null);
        const program = ts.createProgram({host, options, rootNames: host.inputFiles});
        const CmpA = getClass(getSourceFileOrError(program, cmpAFile), 'CmpA');
        const CmpC = getClass(getSourceFileOrError(program, cmpCFile), 'CmpC');
        const compiler = new NgCompiler(
            host, options, program, new ReusedProgramStrategy(program, host, options, []),
            new NoopIncrementalBuildStrategy(), /** enableTemplateTypeChecker */ false);
        const components = compiler.getComponentsWithStyleFile(styleFile);
        expect(components).toEqual(new Set([CmpA, CmpC]));
      });
    });

    describe('getComponentResources', () => {
      it('should return the component resources', () => {
        const styleFile = _('/style.css');
        fs.writeFile(styleFile, `/* This is the template, used by components CmpA */`);
        const styleFile2 = _('/style2.css');
        fs.writeFile(styleFile2, `/* This is the template, used by components CmpA */`);
        const templateFile = _('/template.ng.html');
        fs.writeFile(templateFile, `This is the template, used by components CmpA`);
        const cmpAFile = _('/cmp-a.ts');
        fs.writeFile(cmpAFile, `
            import {Component} from '@angular/core';
            @Component({
              selector: 'cmp-a',
              templateUrl: './template.ng.html',
              styleUrls: ['./style.css', '../../style2.css'],
            })
            export class CmpA {}
          `);

        const options: NgCompilerOptions = {};

        const baseHost = new NgtscCompilerHost(getFileSystem(), options);
        const host = NgCompilerHost.wrap(baseHost, [cmpAFile], options, /* oldProgram */ null);
        const program = ts.createProgram({host, options, rootNames: host.inputFiles});
        const CmpA = getClass(getSourceFileOrError(program, cmpAFile), 'CmpA');
        const compiler = new NgCompiler(
            host, options, program, new ReusedProgramStrategy(program, host, options, []),
            new NoopIncrementalBuildStrategy(), /** enableTemplateTypeChecker */ false);
        const resources = compiler.getComponentResources(CmpA);
        expect(resources).not.toBeNull();
        const {template, styles} = resources!;
        expect(template !.path).toEqual(templateFile);
        expect(styles.size).toEqual(2);
        const actualPaths = new Set(Array.from(styles).map(r => r.path));
        expect(actualPaths).toEqual(new Set([styleFile, styleFile2]));
      });

      it('does not return component style resources if not an array of strings', () => {
        const styleFile = _('/style.css');
        fs.writeFile(styleFile, `/* This is the template, used by components CmpA */`);
        const styleFile2 = _('/style2.css');
        fs.writeFile(styleFile2, `/* This is the template, used by components CmpA */`);
        const cmpAFile = _('/cmp-a.ts');
        fs.writeFile(cmpAFile, `
            import {Component} from '@angular/core';
            const STYLES = ['./style.css', '../../style2.css'];
            @Component({
              selector: 'cmp-a',
              template: '',
              styleUrls: STYLES,
            })
            export class CmpA {}
          `);

        const options: NgCompilerOptions = {};

        const baseHost = new NgtscCompilerHost(getFileSystem(), options);
        const host = NgCompilerHost.wrap(baseHost, [cmpAFile], options, /* oldProgram */ null);
        const program = ts.createProgram({host, options, rootNames: host.inputFiles});
        const CmpA = getClass(getSourceFileOrError(program, cmpAFile), 'CmpA');
        const compiler = new NgCompiler(
            host, options, program, new ReusedProgramStrategy(program, host, options, []),
            new NoopIncrementalBuildStrategy(), /** enableTemplateTypeChecker */ false);
        const resources = compiler.getComponentResources(CmpA);
        expect(resources).not.toBeNull();
        const {styles} = resources!;
        expect(styles.size).toEqual(0);
      });
    });

    describe('getResourceDependencies', () => {
      it('should return resource dependencies of a component source file', () => {
        const COMPONENT = _('/cmp.ts');
        fs.writeFile(COMPONENT, `
          import {Component} from '@angular/core';
          @Component({
            selector: 'test-cmp',
            templateUrl: './template.html',
            styleUrls: ['./style.css'],
          })
          export class Cmp {}
        `);
        fs.writeFile(_('/template.html'), `<h1>Resource</h1>`);
        fs.writeFile(_('/style.css'), `h1 { }`);

        const options: NgCompilerOptions = {
          strictTemplates: true,
        };
        const baseHost = new NgtscCompilerHost(getFileSystem(), options);
        const host = NgCompilerHost.wrap(baseHost, [COMPONENT], options, /* oldProgram */ null);
        const program = ts.createProgram({host, options, rootNames: host.inputFiles});
        const compiler = new NgCompiler(
            host, options, program, new ReusedProgramStrategy(program, host, options, []),
            new NoopIncrementalBuildStrategy(), /** enableTemplateTypeChecker */ false);

        const deps = compiler.getResourceDependencies(getSourceFileOrError(program, COMPONENT));
        expect(deps.length).toBe(2);
        expect(deps).toEqual(jasmine.arrayContaining([
          jasmine.stringMatching(/\/template.html$/),
          jasmine.stringMatching(/\/style.css$/),
        ]));
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
