/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {initMockFileSystem} from '@angular/compiler-cli/src/ngtsc/file_system/testing';
import ts from 'typescript';

import {LanguageServiceTestEnv, Project} from '../testing';

describe('let declarations narrowing', () => {
  let env: LanguageServiceTestEnv;
  let project: Project;

  beforeEach(() => {
    initMockFileSystem('Native');
    env = LanguageServiceTestEnv.setup();
  });

  function expectQuickInfo({
    templateOverride,
    expectedSpanText,
    expectedDisplayString,
  }: {
    templateOverride: string;
    expectedSpanText: string;
    expectedDisplayString: string;
  }): ts.QuickInfo {
    const text = templateOverride.replace('¦', '');
    const template = project.openFile('app.html');
    template.contents = text;
    env.expectNoSourceDiagnostics();

    template.moveCursorToText(templateOverride);
    const quickInfo = template.getQuickInfoAtPosition();
    expect(quickInfo).toBeTruthy();
    const {textSpan, displayParts} = quickInfo!;
    expect(text.substring(textSpan.start, textSpan.start + textSpan.length)).toEqual(
      expectedSpanText,
    );
    expect(toText(displayParts)).toEqual(expectedDisplayString);
    return quickInfo!;
  }

  function toText(displayParts?: ts.SymbolDisplayPart[]): string {
    return (displayParts || []).map((p) => p.text).join('');
  }

  it('should show narrowed type for @let declaration in hover', () => {
    const files = {
      'app.ts': `
        import {Component} from '@angular/core';

        @Component({
          selector: 'app-cmp',
          templateUrl: './app.html',
          standalone: true,
        })
        export class AppCmp {
          val: {data: number} | null = {data: 1};
        }
      `,
      'app.html': 'Will be overridden',
    };
    project = env.addProject('test', files);

    expectQuickInfo({
      templateOverride: `
        @let obj = val;
        @if (obj !== null) {
          <div [id]="ob¦j.data"></div>
        }
      `,
      expectedSpanText: 'obj',
      // Current incorrect behavior: (variable) obj: { data: number; } | null
      // Expected behavior: (variable) obj: { data: number; }
      expectedDisplayString: '(let) const obj: {\n    data: number;\n}',
    });
  });
});
