/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {initMockFileSystem} from '@angular/compiler-cli/src/ngtsc/file_system/testing';

import {createModuleAndProjectWithDeclarations, LanguageServiceTestEnv} from '../testing';

describe('get typecheck block', () => {
  beforeEach(() => {
    initMockFileSystem('Native');
  });

  it('should find the typecheck block for an inline template', () => {
    const files = {
      'app.ts': `
      import {Component} from '@angular/core';

      @Component({
        template: '<div>{{ myProp }}</div>',
        standalone: false,
      })
      export class AppCmp {
        myProp!: string;
      }`,
    };
    const env = LanguageServiceTestEnv.setup();
    const project = createModuleAndProjectWithDeclarations(env, 'test', files);
    project.expectNoSourceDiagnostics();

    const appFile = project.openFile('app.ts');
    appFile.moveCursorToText('{{ my¦Prop }}');
    const result = appFile.getTcb();
    if (result === undefined) {
      fail('Expected a valid TCB response');
      return;
    }
    const {content, selections} = result;
    expect(selections.length).toBe(1);
    const {start, length} = selections[0];
    expect(content.substring(start, start + length)).toContain('myProp');
  });

  it('should find the typecheck block for an external template', () => {
    const files = {
      'app.ts': `
            import {Component} from '@angular/core';

            @Component({
              templateUrl: './app.html',
              standalone: false,
            })
            export class AppCmp {
              myProp!: string;
            }`,
      'app.html': '<div>{{ myProp }}</div>',
    };
    const env = LanguageServiceTestEnv.setup();
    const project = createModuleAndProjectWithDeclarations(env, 'test', files);
    project.expectNoSourceDiagnostics();

    const htmlFile = project.openFile('app.html');
    htmlFile.moveCursorToText('{{ my¦Prop }}');
    const result = htmlFile.getTcb();
    if (result === undefined) {
      fail('Expected a valid TCB response');
      return;
    }
    const {content, selections} = result;
    expect(selections.length).toBe(1);
    const {start, length} = selections[0];
    expect(content.substring(start, start + length)).toContain('myProp');
  });

  it('should not find typecheck blocks outside a template', () => {
    const files = {
      'app.ts': `
      import {Component} from '@angular/core';

      @Component({
        template: '<div>{{ myProp }}</div>',
        standalone: false,
      })
      export class AppCmp {
        myProp!: string;
      }`,
    };
    const env = LanguageServiceTestEnv.setup();
    const project = createModuleAndProjectWithDeclarations(env, 'test', files);
    project.expectNoSourceDiagnostics();

    const appFile = project.openFile('app.ts');
    appFile.moveCursorToText('my¦Prop!: string;');
    const result = appFile.getTcb();
    expect(result).toBeUndefined();
  });
});
