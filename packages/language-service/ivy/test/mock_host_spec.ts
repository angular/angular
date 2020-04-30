/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as ts from 'typescript/lib/tsserverlibrary';

import {APP_MAIN, setup, TEST_SRCDIR} from './mock_host';

describe('mock host', () => {
  it('can load test project from Bazel runfiles', () => {
    const {project, tsLS} = setup();
    expect(project).toBeInstanceOf(ts.server.ConfiguredProject);
    const program = tsLS.getProgram();
    expect(program).toBeDefined();
    const sourceFiles = program!.getSourceFiles().map(sf => {
      const {fileName} = sf;
      if (fileName.startsWith(TEST_SRCDIR)) {
        return fileName.substring(TEST_SRCDIR.length);
      }
      return fileName;
    });
    expect(sourceFiles).toEqual(jasmine.arrayContaining([
      // This shows that module resolution works
      '/angular/packages/common/src/common.d.ts',
      '/angular/packages/core/src/core.d.ts',
      '/angular/packages/forms/src/forms.d.ts',
      // This shows that project files are present
      '/angular/packages/language-service/test/project/app/app.component.ts',
      '/angular/packages/language-service/test/project/app/main.ts',
      '/angular/packages/language-service/test/project/app/parsing-cases.ts',
    ]));
  });

  it('produces no TS error for test project', () => {
    const {project, tsLS} = setup();
    const errors = project.getAllProjectErrors();
    expect(errors).toEqual([]);
    const globalErrors = project.getGlobalProjectErrors();
    expect(globalErrors).toEqual([]);
    const diags = tsLS.getSemanticDiagnostics(APP_MAIN);
    expect(diags).toEqual([]);
  });
});
