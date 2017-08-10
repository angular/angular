/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {MockDirectory, compile, expectNoDiagnostics, setup, toMockFileArray} from './test_util';

describe('aot stubs', () => {
  let angularFiles = setup();

  it('should create empty .ngfactory and .ngsummary files for every source file', () => {
    const appDir = {'app.ts': `export const x = 1;`};
    const rootDir = {'app': appDir};
    const {genFiles} = compile(
        [rootDir, angularFiles],
        {postCompile: expectNoDiagnostics, stubsOnly: true, enableSummariesForJit: true});
    expect(genFiles.find((f) => f.genFileUrl === '/app/app.ngfactory.ts')).toBeTruthy();
    expect(genFiles.find((f) => f.genFileUrl === '/app/app.ngsummary.ts')).toBeTruthy();
  });

  it('should create empty .ngstyle files for imported css files', () => {
    const appDir = {
      'app.ts': `
        import {Component, NgModule} from '@angular/core';

        @Component({
          template: '',
          styleUrls: ['./style.css']
        })
        export class MyComp {}

        @NgModule({
          declarations: [MyComp]
        })
        export class MyModule {}
        export const x = 1;
      `,
      'style.css': ''
    };
    const rootDir = {'app': appDir};
    const {genFiles} =
        compile([rootDir, angularFiles], {postCompile: expectNoDiagnostics, stubsOnly: true});
    expect(genFiles.find((f) => f.genFileUrl === '/app/style.css.shim.ngstyle.ts')).toBeTruthy();
  });

  it('should create stub exports for NgModules of the right type', () => {
    const appDir = {
      'app.module.ts': `
        import { NgModule } from '@angular/core';

        @NgModule()
        export class MyModule {}
      `,
      'app.boot.ts': `
        import {NgModuleFactory} from '@angular/core';
        import {MyModuleNgFactory} from './app.module.ngfactory';
        import {MyModuleNgSummary} from './app.module.ngsummary';
        import {MyModule} from './app.module';

        export const factory: NgModuleFactory<MyModule> = MyModuleNgFactory;
        export const summary: () => any[] = MyModuleNgSummary;
      `
    };
    const rootDir = {'app': appDir};
    compile(
        [rootDir, angularFiles],
        {postCompile: expectNoDiagnostics, stubsOnly: true, enableSummariesForJit: true});
  });
});
