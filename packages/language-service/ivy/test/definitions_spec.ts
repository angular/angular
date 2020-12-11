/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {absoluteFrom} from '@angular/compiler-cli/src/ngtsc/file_system';
import {initMockFileSystem, TestFile} from '@angular/compiler-cli/src/ngtsc/file_system/testing';

import {LanguageServiceTestEnvironment} from './env';
import {humanizeDefinitionInfo} from './test_utils';

describe('definitions', () => {
  let env: LanguageServiceTestEnvironment;

  it('returns the pipe class as definition when checkTypeOfPipes is false', () => {
    initMockFileSystem('Native');
    const testFiles: TestFile[] = [
      {
        name: absoluteFrom('/app.ts'),
        contents: `
        import {Component, NgModule} from '@angular/core';
        import {CommonModule} from '@angular/common';

        @Component({templateUrl: 'app.html'})
        export class AppCmp {}

        @NgModule({declarations: [AppCmp], imports: [CommonModule]})
        export class AppModule {}
      `,
        isRoot: true
      },
      {
        name: absoluteFrom('/app.html'),
        contents: `Will be overridden`,
      }
    ];
    // checkTypeOfPipes is set to false when strict templates is false
    env = LanguageServiceTestEnvironment.setup(testFiles, {strictTemplates: false});
    const definitions = getDefinitionsAndAssertBoundSpan(
        {templateOverride: '{{"1/1/2020" | dat¦e}}', expectedSpanText: 'date'});
    expect(definitions!.length).toEqual(1);

    const [def] = definitions;
    expect(def.textSpan).toContain('DatePipe');
    expect(def.contextSpan).toContain('DatePipe');
  });

  function getDefinitionsAndAssertBoundSpan(
      {templateOverride, expectedSpanText}: {templateOverride: string, expectedSpanText: string}):
      Array<{textSpan: string, contextSpan: string | undefined, fileName: string}> {
    const {cursor, text} =
        env.overrideTemplateWithCursor(absoluteFrom('/app.ts'), 'AppCmp', templateOverride);
    env.expectNoSourceDiagnostics();
    env.expectNoTemplateDiagnostics(absoluteFrom('/app.ts'), 'AppCmp');
    const definitionAndBoundSpan =
        env.ngLS.getDefinitionAndBoundSpan(absoluteFrom('/app.html'), cursor);
    const {textSpan, definitions} = definitionAndBoundSpan!;
    expect(text.substring(textSpan.start, textSpan.start + textSpan.length))
        .toEqual(expectedSpanText);
    expect(definitions).toBeTruthy();
    const overrides = new Map<string, string>();
    overrides.set(absoluteFrom('/app.ts'), text);
    return definitions!.map(d => humanizeDefinitionInfo(d, env.host, overrides));
  }
});
