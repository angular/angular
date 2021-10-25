/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {readFileSync, writeFileSync} from 'fs';
import {dirname, join} from 'path';
import * as shx from 'shelljs';
import {Configuration, Linter} from 'tslint';

describe('Google3 missing injectable tslint rule', () => {
  const rulesDirectory =
      dirname(require.resolve('../../migrations/google3/noMissingInjectableRule'));

  let tmpDir: string;

  beforeEach(() => {
    tmpDir = join(process.env['TEST_TMPDIR']!, 'google3-test');
    shx.mkdir('-p', tmpDir);

    writeFile('tsconfig.json', JSON.stringify({compilerOptions: {module: 'es2015'}}));
  });

  afterEach(() => shx.rm('-r', tmpDir));

  function runTSLint(fix = true) {
    const program = Linter.createProgram(join(tmpDir, 'tsconfig.json'));
    const linter = new Linter({fix, rulesDirectory: [rulesDirectory]}, program);
    const config = Configuration.parseConfigFile({rules: {'no-missing-injectable': true}});

    program.getRootFileNames().forEach(fileName => {
      linter.lint(fileName, program.getSourceFile(fileName)!.getFullText(), config);
    });

    return linter;
  }

  function writeFile(fileName: string, content: string) {
    writeFileSync(join(tmpDir, fileName), content);
  }

  function getFile(fileName: string) {
    return readFileSync(join(tmpDir, fileName), 'utf8');
  }

  describe('NgModule', () => createTests('NgModule', 'providers'));
  describe('Directive', () => createTests('Directive', 'providers'));

  describe('Component', () => {
    createTests('Component', 'providers');
    createTests('Component', 'viewProviders');

    it('should migrate all providers defined in "viewProviders" and "providers" in the ' +
           'same component',
       () => {
         writeFile('/index.ts', `
          import {Component} from '@angular/core';

          export class MyService {}
          export class MySecondService {}

          @Component({
            providers: [MyService],
            viewProviders: [MySecondService],
          })
          export class TestClass {}
        `);

         const result = runTSLint().getResult();

         expect(result.errorCount).toBe(0);
         expect(getFile('/index.ts')).toMatch(/@Injectable\(\)\s+export class MyService/);
         expect(getFile('/index.ts')).toMatch(/@Injectable\(\)\s+export class MySecondService/);
         expect(getFile('/index.ts')).toContain(`{ Component, Injectable } from '@angular/core`);
       });
  });

  function createTests(
      type: 'NgModule'|'Directive'|'Component', propName: 'providers'|'viewProviders') {
    it('should create proper failures for missing injectable providers', () => {
      writeFile('index.ts', `
        import { ${type} } from '@angular/core';

        export class A {}

        @${type}({${propName}: [A]})
        export class TestClass {}
      `);

      const linter = runTSLint(false);
      const failures = linter.getResult().failures;

      expect(failures.length).toBe(2);
      expect(failures[0].getFailure())
          .toMatch(/Class needs to be decorated with "@Injectable\(\)".*provided by "TestClass"/);
      expect(failures[0].getStartPosition().getLineAndCharacter()).toEqual({line: 3, character: 8});
      expect(failures[1].getFailure()).toMatch(/Import needs to be updated to import.*Injectable/);
      expect(failures[1].getStartPosition().getLineAndCharacter())
          .toEqual({line: 1, character: 15});
    });

    it('should update provider classes which need to be migrated in Ivy', () => {
      writeFile('/index.ts', `
        import {Pipe, Directive, Component, NgModule} from '@angular/core';

        @Pipe()
        export class WithPipe {}

        @Directive()
        export class WithDirective {}

        @Component()
        export class WithComponent {}

        export class MyServiceA {}
        export class MyServiceB {}
        export class MyServiceC {}
        export class MyServiceD {}
        export class MyServiceE {}
        export class MyServiceF {}
        export class MyServiceG {}
        export class MyServiceH {}

        @${type}({${propName}: [
          WithPipe,
          [
            WithDirective,
            WithComponent,
            MyServiceA,
          ]
          MyServiceB,
          {provide: MyServiceC},
          {provide: null, useClass: MyServiceD},
          {provide: null, useExisting: MyServiceE},
          {provide: MyServiceF, useFactory: () => null},
          {provide: MyServiceG, useValue: null},
          {provide: MyServiceH, deps: []},
        ]})
        export class TestClass {}
      `);


      runTSLint();

      expect(getFile('/index.ts')).toMatch(/'@angular\/core';\s+@Pipe\(\)\s+export class WithPipe/);
      expect(getFile('/index.ts'))
          .toMatch(/WithPipe {}\s+@Directive\(\)\s+export class WithDirective/);
      expect(getFile('/index.ts'))
          .toMatch(/WithDirective {}\s+@Component\(\)\s+export class WithComponent/);
      expect(getFile('/index.ts')).toMatch(/@Injectable\(\)\s+export class MyServiceA/);
      expect(getFile('/index.ts')).toMatch(/@Injectable\(\)\s+export class MyServiceB/);
      expect(getFile('/index.ts')).toMatch(/MyServiceB {}\s+export class MyServiceC/);
      expect(getFile('/index.ts')).toMatch(/@Injectable\(\)\s+export class MyServiceD/);
      expect(getFile('/index.ts')).toMatch(/MyServiceD {}\s+export class MyServiceE/);
      expect(getFile('/index.ts')).toMatch(/MyServiceE {}\s+export class MyServiceF/);
      expect(getFile('/index.ts')).toMatch(/MyServiceF {}\s+export class MyServiceG/);
      expect(getFile('/index.ts')).toMatch(/MyServiceG {}\s+export class MyServiceH/);
      expect(getFile('/index.ts')).toContain(`{ provide: MyServiceC, useValue: undefined },`);
    });

    it(`should migrate provider once if referenced in multiple ${type} definitions`, () => {
      writeFile('/index.ts', `
        import {${type}} from '@angular/core';

        export class ServiceA {}

        @${type}({${propName}: [ServiceA]})
        export class TestClass {}
      `);

      writeFile('/second.ts', `
        import {${type}} from '@angular/core';
        import {ServiceA} from './index';

        export class ServiceB {}

        @${type}({${propName}: [ServiceA, ServiceB]})
        export class TestClass2 {}
      `);

      runTSLint();

      expect(getFile('/index.ts'))
          .toMatch(/@angular\/core';\s+@Injectable\(\)\s+export class ServiceA/);
      expect(getFile('/index.ts')).toContain(`{ ${type}, Injectable } from '@angular/core`);
      expect(getFile('/second.ts')).toMatch(/@Injectable\(\)\s+export class ServiceB/);
      expect(getFile('/second.ts')).toContain(`{ ${type}, Injectable } from '@angular/core`);
    });

    it('should warn if a referenced provider could not be resolved', () => {
      writeFile('/index.ts', `
        import {${type}} from '@angular/core';

        @${type}({${propName}: [NotPresent]})
        export class TestClass {}
      `);

      const linter = runTSLint();
      const failures = linter.getResult().failures;

      expect(failures.length).toBe(1);
      expect(failures[0].getFailure()).toMatch(/Provider is not statically analyzable./);
      expect(failures[0].getStartPosition().getLineAndCharacter())
          .toEqual({line: 3, character: 14 + type.length + propName.length});
    });

    it(`should warn if the "${propName}" value could not be resolved`, () => {
      writeFile('/index.ts', `
        import {${type}} from '@angular/core';

        @${type}({${propName}: NOT_ANALYZABLE)
        export class TestClass {}
      `);

      const linter = runTSLint();
      const failures = linter.getResult().failures;

      expect(failures.length).toBe(1);
      expect(failures[0].getFailure()).toMatch(/Providers.*not statically analyzable./);
      expect(failures[0].getStartPosition().getLineAndCharacter())
          .toEqual({line: 3, character: 13 + type.length + propName.length});
    });

    it('should create new import for @Injectable when migrating provider', () => {
      writeFile('/index.ts', `
        import {${type}} from '@angular/core';
        import {MyService, MySecondService} from './service';

        @${type}({${propName}: [MyService, MySecondService]})
        export class TestClass {}
      `);

      writeFile('/service.ts', `export class MyService {}

        export class MySecondService {}
      `);

      runTSLint();

      expect(getFile('/service.ts')).toMatch(/@Injectable\(\)\s+export class MyService/);
      expect(getFile('/service.ts')).toMatch(/@Injectable\(\)\s+export class MySecondService/);
      expect(getFile('/service.ts')).toMatch(/import { Injectable } from "@angular\/core";/);
    });

    it('should remove @Inject decorator for providers which are migrated', () => {
      writeFile('/index.ts', `
        import {${type}} from '@angular/core';
        import {MyService} from './service';

        @${type}({${propName}: [MyService]})
        export class TestClass {}
      `);

      writeFile('/service.ts', `
        import {Inject} from '@angular/core';

        @Inject()
        export class MyService {}
      `);

      runTSLint();

      expect(getFile('/service.ts')).toMatch(/core';\s+@Injectable\(\)\s+export class MyService/);
      expect(getFile('/service.ts'))
          .toMatch(/import { Inject, Injectable } from '@angular\/core';/);
    });
  }
});
