/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {initMockFileSystem} from '@angular/compiler-cli/src/ngtsc/file_system/testing';

import {assertFileNames, assertTextSpans, humanizeDocumentSpanLike, LanguageServiceTestEnv, Project} from '../testing';

describe('type definitions', () => {
  let env: LanguageServiceTestEnv;

  it('returns the pipe class as definition when checkTypeOfPipes is false', () => {
    initMockFileSystem('Native');
    const files = {
      'app.ts': `
        import {Component, NgModule} from '@angular/core';
        import {CommonModule} from '@angular/common';

        @Component({templateUrl: 'app.html'})
        export class AppCmp {}

        @NgModule({declarations: [AppCmp], imports: [CommonModule]})
        export class AppModule {}
      `,
      'app.html': `Will be overridden`,
    };
    // checkTypeOfPipes is set to false when strict templates is false
    env = LanguageServiceTestEnv.setup();
    const project = env.addProject('test', files, {strictTemplates: false});
    const definitions =
        getTypeDefinitionsAndAssertBoundSpan(project, {templateOverride: '{{"1/1/2020" | dat¦e}}'});
    expect(definitions!.length).toEqual(3);

    assertTextSpans(definitions, ['transform']);
    assertFileNames(definitions, ['index.d.ts']);
  });

  function getTypeDefinitionsAndAssertBoundSpan(
      project: Project, {templateOverride}: {templateOverride: string}) {
    const text = templateOverride.replace('¦', '');
    const template = project.openFile('app.html');
    template.contents = text;
    env.expectNoSourceDiagnostics();
    project.expectNoTemplateDiagnostics('app.ts', 'AppCmp');

    template.moveCursorToText(templateOverride);
    const defs = template.getTypeDefinitionAtPosition();
    expect(defs).toBeTruthy();
    return defs!.map(d => humanizeDocumentSpanLike(d, env));
  }
});
