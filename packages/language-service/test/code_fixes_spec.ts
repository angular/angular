/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {initMockFileSystem} from '@angular/compiler-cli/src/ngtsc/file_system/testing';

import {createModuleAndProjectWithDeclarations, LanguageServiceTestEnv} from '../testing';

describe('code fixes', () => {
  let env: LanguageServiceTestEnv;
  beforeEach(() => {
    initMockFileSystem('Native');
    env = LanguageServiceTestEnv.setup();
  });

  it('should fix error when property does not exist on type', () => {
    const files = {
      'app.ts': `
      import {Component, NgModule} from '@angular/core';

      @Component({
        templateUrl: './app.html'
      })
      export class AppComponent {
        title1 = '';
      }
    `,
      'app.html': `{{title}}`
    };

    const project = createModuleAndProjectWithDeclarations(env, 'test', files);
    const diags = project.getDiagnosticsForFile('app.html');
    const appFile = project.openFile('app.html');
    appFile.moveCursorToText('title¦');
    const codeActions =
        project.getCodeFixesAtPosition('app.html', appFile.cursor, appFile.cursor, [diags[0].code]);
    expectIncludeReplacementText({
      codeActions,
      content: appFile.contents,
      text: 'title',
      newText: 'title1',
      fileName: 'app.html'
    });

    const appTsFile = project.openFile('app.ts');
    appTsFile.moveCursorToText(`title1 = '';\n¦`);
    expectIncludeAddText(
        {codeActions, position: appTsFile.cursor, text: 'title: any;\n', fileName: 'app.ts'});
  });

  it('should fix a missing method when property does not exist on type', () => {
    const files = {
      'app.ts': `
      import {Component, NgModule} from '@angular/core';

      @Component({
        templateUrl: './app.html'
      })
      export class AppComponent {
      }
    `,
      'app.html': `{{title('Angular')}}`
    };

    const project = createModuleAndProjectWithDeclarations(env, 'test', files);
    const diags = project.getDiagnosticsForFile('app.html');
    const appFile = project.openFile('app.html');
    appFile.moveCursorToText('title¦');
    const codeActions =
        project.getCodeFixesAtPosition('app.html', appFile.cursor, appFile.cursor, [diags[0].code]);

    const appTsFile = project.openFile('app.ts');
    appTsFile.moveCursorToText(`class AppComponent {¦`);
    expectIncludeAddText({
      codeActions,
      position: appTsFile.cursor,
      text: `\ntitle(arg0: string) {\nthrow new Error('Method not implemented.');\n}`,
      fileName: 'app.ts'
    });
  });

  it('should not show fix all errors when there is only one diagnostic in the template but has two or more diagnostics in TCB',
     () => {
       const files = {
         'app.ts': `
        import {Component, NgModule} from '@angular/core';
  
        @Component({
          templateUrl: './app.html'
        })
        export class AppComponent {
          title1 = '';
        }
      `,
         'app.html': `<div *ngIf="title" />`
       };

       const project = createModuleAndProjectWithDeclarations(env, 'test', files);
       const diags = project.getDiagnosticsForFile('app.html');
       const appFile = project.openFile('app.html');
       appFile.moveCursorToText('title¦');
       const codeActions = project.getCodeFixesAtPosition(
           'app.html', appFile.cursor, appFile.cursor, [diags[0].code]);
       expectNotIncludeFixAllInfo(codeActions);
     });

  it('should fix all errors when property does not exist on type', () => {
    const files = {
      'app.ts': `
      import {Component, NgModule} from '@angular/core';

      @Component({
        template: '{{tite}}{{bannr}}',
      })
      export class AppComponent {
        title = '';
        banner = '';
      }
    `,
    };

    const project = createModuleAndProjectWithDeclarations(env, 'test', files);
    const appFile = project.openFile('app.ts');

    const fixesAllSpelling = project.getCombinedCodeFix('app.ts', 'fixSpelling' as string);
    expectIncludeReplacementTextForFileTextChange({
      fileTextChanges: fixesAllSpelling.changes,
      content: appFile.contents,
      text: 'tite',
      newText: 'title',
      fileName: 'app.ts'
    });
    expectIncludeReplacementTextForFileTextChange({
      fileTextChanges: fixesAllSpelling.changes,
      content: appFile.contents,
      text: 'bannr',
      newText: 'banner',
      fileName: 'app.ts'
    });

    const fixAllMissingMember = project.getCombinedCodeFix('app.ts', 'fixMissingMember' as string);
    appFile.moveCursorToText(`banner = '';\n¦`);
    expectIncludeAddTextForFileTextChange({
      fileTextChanges: fixAllMissingMember.changes,
      position: appFile.cursor,
      text: 'tite: any;\n',
      fileName: 'app.ts'
    });
    expectIncludeAddTextForFileTextChange({
      fileTextChanges: fixAllMissingMember.changes,
      position: appFile.cursor,
      text: 'bannr: any;\n',
      fileName: 'app.ts'
    });
  });
});

function expectNotIncludeFixAllInfo(codeActions: readonly ts.CodeFixAction[]) {
  for (const codeAction of codeActions) {
    expect(codeAction.fixId).toBeUndefined();
    expect(codeAction.fixAllDescription).toBeUndefined();
  }
}

function expectIncludeReplacementText({codeActions, content, text, newText, fileName}: {
  codeActions: readonly ts.CodeAction[]; content: string; text: string; newText: string;
  fileName: string;
}) {
  let includeReplacementText = false;
  for (const codeAction of codeActions) {
    includeReplacementText = includeReplacementTextInChanges(
        {fileTextChanges: codeAction.changes, content, text, newText, fileName});
    if (includeReplacementText) {
      return;
    }
  }
  expect(includeReplacementText).toBeTruthy();
}

function expectIncludeAddText({codeActions, position, text, fileName}: {
  codeActions: readonly ts.CodeAction[]; position: number; text: string; fileName: string;
}) {
  let includeAddText = false;
  for (const codeAction of codeActions) {
    includeAddText =
        includeAddTextInChanges({fileTextChanges: codeAction.changes, position, text, fileName});
    if (includeAddText) {
      return;
    }
  }
  expect(includeAddText).toBeTruthy();
}

function expectIncludeReplacementTextForFileTextChange(
    {fileTextChanges, content, text, newText, fileName}: {
      fileTextChanges: readonly ts.FileTextChanges[]; content: string; text: string;
      newText: string;
      fileName: string;
    }) {
  expect(includeReplacementTextInChanges({fileTextChanges, content, text, newText, fileName}))
      .toBeTruthy();
}

function expectIncludeAddTextForFileTextChange({fileTextChanges, position, text, fileName}: {
  fileTextChanges: readonly ts.FileTextChanges[]; position: number; text: string; fileName: string;
}) {
  expect(includeAddTextInChanges({fileTextChanges, position, text, fileName})).toBeTruthy();
}

function includeReplacementTextInChanges({fileTextChanges, content, text, newText, fileName}: {
  fileTextChanges: readonly ts.FileTextChanges[]; content: string; text: string; newText: string;
  fileName: string;
}) {
  for (const change of fileTextChanges) {
    if (!change.fileName.endsWith(fileName)) {
      continue;
    }
    for (const textChange of change.textChanges) {
      if (textChange.span.length === 0) {
        continue;
      }
      const includeReplaceText =
          content.slice(textChange.span.start, textChange.span.start + textChange.span.length) ===
              text &&
          newText === textChange.newText;
      if (includeReplaceText) {
        return true;
      }
    }
  }
  return false;
}

function includeAddTextInChanges({fileTextChanges, position, text, fileName}: {
  fileTextChanges: readonly ts.FileTextChanges[]; position: number; text: string; fileName: string;
}) {
  for (const change of fileTextChanges) {
    if (!change.fileName.endsWith(fileName)) {
      continue;
    }
    for (const textChange of change.textChanges) {
      if (textChange.span.length > 0) {
        continue;
      }
      const includeAddText = position === textChange.span.start && text === textChange.newText;
      if (includeAddText) {
        return true;
      }
    }
  }
  return false;
}
