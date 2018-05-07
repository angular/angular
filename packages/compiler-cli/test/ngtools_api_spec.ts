/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {__NGTOOLS_PRIVATE_API_2 as NgTools_InternalApi_NG_2} from '@angular/compiler-cli';
import * as path from 'path';
import * as ts from 'typescript';

import {TestSupport, setup} from './test_support';

describe('ngtools_api (deprecated)', () => {
  let testSupport: TestSupport;

  beforeEach(() => { testSupport = setup(); });

  function createProgram(rootNames: string[]) {
    const options = testSupport.createCompilerOptions();
    const host = ts.createCompilerHost(options, true);
    const program =
        ts.createProgram(rootNames.map(p => path.resolve(testSupport.basePath, p)), options, host);
    return {program, host, options};
  }

  function writeSomeRoutes() {
    testSupport.writeFiles({
      'src/main.ts': `
        import {NgModule, Component} from '@angular/core';
        import {RouterModule} from '@angular/router';

        // Component with metadata errors.
        @Component(() => {if (1==1) return null as any;})
        export class ErrorComp2 {}

        @NgModule({
          declarations: [ErrorComp2, NonExistentComp],
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

  it('should list lazy routes recursively', () => {
    writeSomeRoutes();
    const {program, host, options} = createProgram(['src/main.ts']);
    const routes = NgTools_InternalApi_NG_2.listLazyRoutes({
      program,
      host,
      angularCompilerOptions: options,
      entryModule: 'src/main#MainModule',
    });
    expect(routes).toEqual({
      './child#ChildModule': path.resolve(testSupport.basePath, 'src/child.ts'),
      './child2#ChildModule2': path.resolve(testSupport.basePath, 'src/child2.ts'),
    });
  });

  it('should allow to emit the program after analyzing routes', () => {
    writeSomeRoutes();
    const {program, host, options} = createProgram(['src/main.ts']);
    NgTools_InternalApi_NG_2.listLazyRoutes({
      program,
      host,
      angularCompilerOptions: options,
      entryModule: 'src/main#MainModule',
    });
    program.emit();
    testSupport.shouldExist('built/src/main.js');
  });
});
