/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {initMockFileSystem} from '@angular/compiler-cli/src/ngtsc/file_system/testing';

import {assertFileNames, createModuleAndProjectWithDeclarations, humanizeDocumentSpanLike, LanguageServiceTestEnv} from '../testing';

describe('get template location for component', () => {
  beforeEach(() => {
    initMockFileSystem('Native');
  });

  it('finds location of inline template', () => {
    const files = {
      'app.ts': `
      import {Component} from '@angular/core';

      @Component({
        template: '<div>{{ myProp }}</div>',
      })
      export class AppCmp {
        myProp!: string;
      }`
    };
    const env = LanguageServiceTestEnv.setup();
    const project = createModuleAndProjectWithDeclarations(env, 'test', files);
    project.expectNoSourceDiagnostics();

    const appFile = project.openFile('app.ts');
    appFile.moveCursorToText('my¦Prop!: string');
    const result = appFile.getTemplateLocationForComponent()!;
    assertFileNames([result], ['app.ts']);
    expect(humanizeDocumentSpanLike(result, env).textSpan).toEqual(`'<div>{{ myProp }}</div>'`);
  });

  it('finds location of external template', () => {
    const files = {
      'app.ts': `
            import {Component} from '@angular/core';

            @Component({
              templateUrl: './app.html',
            })
            export class AppCmp {
              myProp!: string;
            }`,
      'app.html': '<div>{{ myProp }}</div>'
    };
    const env = LanguageServiceTestEnv.setup();
    const project = createModuleAndProjectWithDeclarations(env, 'test', files);
    project.expectNoSourceDiagnostics();

    const appFile = project.openFile('app.ts');
    appFile.moveCursorToText('my¦Prop!: string');
    const result = appFile.getTemplateLocationForComponent()!;
    assertFileNames([result], ['app.html']);
  });

  it('finds correct location when there are multiple components in one file', () => {
    const files = {
      'app.ts': `
      import {Component} from '@angular/core';

      @Component({
        templateUrl: './template1.html',
      })
      export class Template1 {
      }
      @Component({
        templateUrl: './template2.html',
      })
      export class Template2 {
      }
      `,
      'template1.html': '',
      'template2.html': ''
    };
    const env = LanguageServiceTestEnv.setup();
    const project = createModuleAndProjectWithDeclarations(env, 'test', files);
    project.expectNoSourceDiagnostics();

    const appFile = project.openFile('app.ts');
    appFile.moveCursorToText('export class Temp¦late1');
    const result1 = appFile.getTemplateLocationForComponent()!;
    assertFileNames([result1], ['template1.html']);

    appFile.moveCursorToText('export class Temp¦late2');
    const result2 = appFile.getTemplateLocationForComponent()!;
    assertFileNames([result2], ['template2.html']);
  });

  it('returns nothing when cursor is not in a component', () => {
    const files = {
      'app.ts': `
      import {Directive} from '@angular/core';

      @Directive({selector: 'my-dir'})
      export class MyDir {
      }`,
    };
    const env = LanguageServiceTestEnv.setup();
    const project = createModuleAndProjectWithDeclarations(env, 'test', files);
    project.expectNoSourceDiagnostics();

    const appFile = project.openFile('app.ts');
    appFile.moveCursorToText('MyDir¦');
    expect(appFile.getTemplateLocationForComponent()).toBeUndefined();
  });

  it('returns nothing when cursor is not in a component', () => {
    const files = {
      'app.ts': `
      import {Component} from '@angular/core';

      const x = 1;

      @Component({template: 'abc'})
      export class MyDir {
      }`,
    };
    const env = LanguageServiceTestEnv.setup();
    const project = createModuleAndProjectWithDeclarations(env, 'test', files);
    project.expectNoSourceDiagnostics();

    const appFile = project.openFile('app.ts');
    appFile.moveCursorToText('const x¦');
    expect(appFile.getTemplateLocationForComponent()).toBeUndefined();
  });

  it('returns template when cursor is on `class` keyword', () => {
    const files = {
      'app.ts': `
      import {Component} from '@angular/core';

      @Component({template: 'abc'})
      export class MyDir {
      }`,
    };
    const env = LanguageServiceTestEnv.setup();
    const project = createModuleAndProjectWithDeclarations(env, 'test', files);
    project.expectNoSourceDiagnostics();

    const appFile = project.openFile('app.ts');
    appFile.moveCursorToText('cla¦ss');
    const result = appFile.getTemplateLocationForComponent()!;
    assertFileNames([result], ['app.ts']);
    expect(humanizeDocumentSpanLike(result, env).textSpan).toEqual(`'abc'`);
  });
});
