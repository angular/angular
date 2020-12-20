/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {compile, expectNoDiagnostics, MockDirectory, setup} from './test_util';

describe('regressions', () => {
  let angularFiles = setup();

  it('should compile components with empty templates', () => {
    const appDir = {
      'app.module.ts': `
        import { Component, NgModule } from '@angular/core';

        @Component({template: ''})
        export class EmptyComp {}

        @NgModule({declarations: [EmptyComp]})
        export class MyModule {}
      `
    };
    const rootDir = {'app': appDir};
    const {genFiles} = compile(
        [rootDir, angularFiles], {postCompile: expectNoDiagnostics},
        {noUnusedLocals: true, noUnusedParameters: true});
    expect(genFiles.find((f) => f.genFileUrl === '/app/app.module.ngfactory.ts')).toBeTruthy();
  });
});
