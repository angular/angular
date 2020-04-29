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
  const {project, service, tsLS} = setup();

  beforeEach(() => {
    service.reset();
  });

  it('can load test project from Bazel runfiles', () => {
    expect(project).toBeInstanceOf(ts.server.ConfiguredProject);
    const configPath = (project as ts.server.ConfiguredProject).getConfigFilePath();
    expect(configPath.substring(TEST_SRCDIR.length))
        .toBe('/angular/packages/language-service/test/project/tsconfig.json');
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
    const errors = project.getAllProjectErrors();
    expect(errors).toEqual([]);
    const globalErrors = project.getGlobalProjectErrors();
    expect(globalErrors).toEqual([]);
    const diags = tsLS.getSemanticDiagnostics(APP_MAIN);
    expect(diags).toEqual([]);
  });

  it('can overwrite test file', () => {
    service.overwrite(APP_MAIN, `const x: string = 0`);
    const scriptInfo = service.getScriptInfo(APP_MAIN);
    expect(getText(scriptInfo)).toBe('const x: string = 0');
  });

  it('can find the cursor', () => {
    const content = service.overwrite(APP_MAIN, `const fo¦o = 'hello world';`);
    // content returned by overwrite() is the original content with cursor
    expect(content).toBe(`const fo¦o = 'hello world';`);
    const scriptInfo = service.getScriptInfo(APP_MAIN);
    // script info content should not contain cursor
    expect(getText(scriptInfo)).toBe(`const foo = 'hello world';`);
  });
});

function getText(scriptInfo: ts.server.ScriptInfo): string {
  const snapshot = scriptInfo.getSnapshot();
  return snapshot.getText(0, snapshot.getLength());
}
