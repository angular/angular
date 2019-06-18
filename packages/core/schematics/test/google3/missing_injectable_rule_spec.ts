/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
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
    tmpDir = join(process.env['TEST_TMPDIR'] !, 'google3-test');
    shx.mkdir('-p', tmpDir);

    writeFile('tsconfig.json', JSON.stringify({compilerOptions: {module: 'es2015'}}));
  });

  afterEach(() => shx.rm('-r', tmpDir));

  function runTSLint(fix = true) {
    const program = Linter.createProgram(join(tmpDir, 'tsconfig.json'));
    const linter = new Linter({fix, rulesDirectory: [rulesDirectory]}, program);
    const config = Configuration.parseConfigFile(
        {rules: {'no-missing-injectable': true}, linterOptions: {typeCheck: true}});

    program.getRootFileNames().forEach(fileName => {
      linter.lint(fileName, program.getSourceFile(fileName) !.getFullText(), config);
    });

    return linter;
  }

  function writeFile(fileName: string, content: string) {
    writeFileSync(join(tmpDir, fileName), content);
  }

  function getFile(fileName: string) { return readFileSync(join(tmpDir, fileName), 'utf8'); }

  it('should create proper failures for missing injectable providers', () => {
    writeFile('index.ts', `
      import { NgModule } from '@angular/core';

      export class A {}

      @NgModule({providers: [A]})
      export class AppModule {}
    `);

    const linter = runTSLint(false);
    const failures = linter.getResult().failures;

    expect(failures.length).toBe(2);
    expect(failures[0].getFailure())
        .toMatch(/Class needs to be decorated with "@Injectable\(\)".*provided by "AppModule"/);
    expect(failures[0].getStartPosition().getLineAndCharacter()).toEqual({line: 3, character: 6});
    expect(failures[1].getFailure()).toMatch(/Import needs to be updated to import.*Injectable/);
    expect(failures[1].getStartPosition().getLineAndCharacter()).toEqual({line: 1, character: 13});
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
          
      @NgModule({providers: [
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
      ]})
      export class MyModule {}
    `);


    runTSLint();

    expect(getFile('/index.ts')).toMatch(/'@angular\/core';\s+@Pipe\(\)\s+export class WithPipe/);
    expect(getFile('/index.ts'))
        .toMatch(/WithPipe {}\s+@Directive\(\)\s+export class WithDirective/);
    expect(getFile('/index.ts'))
        .toMatch(/WithDirective {}\s+@Component\(\)\s+export class WithComponent/);
    expect(getFile('/index.ts')).toMatch(/@Injectable\(\)\s+export class MyServiceA/);
    expect(getFile('/index.ts')).toMatch(/@Injectable\(\)\s+export class MyServiceB/);
    expect(getFile('/index.ts')).toMatch(/@Injectable\(\)\s+export class MyServiceC/);
    expect(getFile('/index.ts')).toMatch(/@Injectable\(\)\s+export class MyServiceD/);
    expect(getFile('/index.ts')).toMatch(/@Injectable\(\)\s+export class MyServiceE/);
    expect(getFile('/index.ts')).toMatch(/MyServiceE {}\s+export class MyServiceF/);
    expect(getFile('/index.ts')).toMatch(/MyServiceF {}\s+export class MyServiceG/);
  });

  it('should migrate provider once if referenced in multiple NgModule definitions', () => {
    writeFile('/index.ts', `
      import {NgModule} from '@angular/core';
    
      export class ServiceA {}
                
      @NgModule({providers: [ServiceA]})
      export class MyModule {}
    `);

    writeFile('/second.ts', `
      import {NgModule} from '@angular/core';
      import {ServiceA} from './index';
      
      export class ServiceB {}
      
      @NgModule({providers: [ServiceA, ServiceB]})
      export class SecondModule {}
    `);

    runTSLint();

    expect(getFile('/index.ts'))
        .toMatch(/@angular\/core';\s+@Injectable\(\)\s+export class ServiceA/);
    expect(getFile('/index.ts')).toMatch(/{ NgModule, Injectable } from '@angular\/core/);
    expect(getFile('/second.ts')).toMatch(/@Injectable\(\)\s+export class ServiceB/);
    expect(getFile('/second.ts')).toMatch(/{ NgModule, Injectable } from '@angular\/core/);
  });

  it('should warn if a referenced provider could not be resolved', () => {
    writeFile('/index.ts', `
      import {NgModule} from '@angular/core';
      
      @NgModule({providers: [NotPresent]})
      export class MyModule {}
    `);

    const linter = runTSLint();
    const failures = linter.getResult().failures;

    expect(failures.length).toBe(1);
    expect(failures[0].getFailure()).toMatch(/Provider is not statically analyzable./);
    expect(failures[0].getStartPosition().getLineAndCharacter()).toEqual({line: 3, character: 29});
  });

  it('should warn if the module providers could not be resolved', () => {
    writeFile('/index.ts', `
      import {NgModule} from '@angular/core';
      
      @NgModule({providers: NOT_ANALYZABLE)
      export class MyModule {}
    `);

    const linter = runTSLint();
    const failures = linter.getResult().failures;

    expect(failures.length).toBe(1);
    expect(failures[0].getFailure()).toMatch(/Providers of module.*not statically analyzable./);
    expect(failures[0].getStartPosition().getLineAndCharacter()).toEqual({line: 3, character: 28});
  });

  it('should create new import for @Injectable when migrating provider', () => {
    writeFile('/index.ts', `
      import {NgModule} from '@angular/core';
      import {MyService, MySecondService} from './service';
                    
      @NgModule({providers: [MyService, MySecondService]})
      export class MyModule {}
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
      import {NgModule} from '@angular/core';
      import {MyService} from './service';
             
      @NgModule({providers: [MyService]})
      export class MyModule {}
    `);

    writeFile('/service.ts', `
      import {Inject} from '@angular/core';
    
      @Inject()
      export class MyService {}
    `);

    runTSLint();

    expect(getFile('/service.ts')).toMatch(/core';\s+@Injectable\(\)\s+export class MyService/);
    expect(getFile('/service.ts')).toMatch(/import { Inject, Injectable } from '@angular\/core';/);
  });
});
