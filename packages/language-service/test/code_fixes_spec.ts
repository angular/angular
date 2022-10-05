/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {initMockFileSystem} from '@angular/compiler-cli/src/ngtsc/file_system/testing';

import {FixIdForCodeFixesAll} from '../src/codefixes/utils';
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

  it('should fix invalid banana-in-box error', () => {
    const files = {
      'app.ts': `
      import {Component, NgModule} from '@angular/core';

      @Component({
        templateUrl: './app.html'
      })
      export class AppComponent {
        title = '';
      }
    `,
      'app.html': `<input ([ngModel])="title">`,
    };

    const project = createModuleAndProjectWithDeclarations(env, 'test', files);
    const diags = project.getDiagnosticsForFile('app.html');
    const appFile = project.openFile('app.html');
    appFile.moveCursorToText('¦([ngModel');

    const codeActions =
        project.getCodeFixesAtPosition('app.html', appFile.cursor, appFile.cursor, [diags[0].code]);
    expectIncludeReplacementText({
      codeActions,
      content: appFile.contents,
      text: `([ngModel])="title"`,
      newText: `[(ngModel)]="title"`,
      fileName: 'app.html',
      description: `fix invalid banana-in-box for '([ngModel])="title"'`
    });
  });

  it('should fix all invalid banana-in-box errors', () => {
    const files = {
      'app.ts': `
      import {Component, NgModule} from '@angular/core';

      @Component({
        template: '<input ([ngModel])="title"><input ([value])="title">',
      })
      export class AppComponent {
        title = '';
        banner = '';
      }
    `,
    };

    const project = createModuleAndProjectWithDeclarations(env, 'test', files);
    const appFile = project.openFile('app.ts');

    const fixesAllActions =
        project.getCombinedCodeFix('app.ts', FixIdForCodeFixesAll.FIX_INVALID_BANANA_IN_BOX);
    expectIncludeReplacementTextForFileTextChange({
      fileTextChanges: fixesAllActions.changes,
      content: appFile.contents,
      text: `([ngModel])="title"`,
      newText: `[(ngModel)]="title"`,
      fileName: 'app.ts'
    });
    expectIncludeReplacementTextForFileTextChange({
      fileTextChanges: fixesAllActions.changes,
      content: appFile.contents,
      text: `([value])="title"`,
      newText: `[(value)]="title"`,
      fileName: 'app.ts'
    });
  });

  describe('should fix missing selector imports', () => {
    const files = {};
    const standaloneFiles = {
      'foo.ts': ` import {CommonModule} from '@angular/common';
      import {Component} from '@angular/core';

      @Component({
        selector: 'foo',
        template: '<bar></bar>',
        standalone: true
      })
      export class FooComponent {}`,
      'bar.ts': `
      import {CommonModule} from '@angular/common';
      import {Component} from '@angular/core';

      @Component({
        selector: 'bar',
        template: '<div>bar</div>',
        standalone: true
      })
      export class BarComponent {}`,
    };

    it('for a new standalone component import', () => {
      const project =
          createModuleAndProjectWithDeclarations(env, 'test', files, {}, standaloneFiles);
      const diags = project.getDiagnosticsForFile('foo.ts');
      const fixFile = project.openFile('foo.ts');
      fixFile.moveCursorToText('<¦bar>');

      const codeActions =
          project.getCodeFixesAtPosition('foo.ts', fixFile.cursor, fixFile.cursor, [diags[0].code]);
      // TODO(dylhunn): These integration test helpers are hard to debug, and somewhat brittle
      // against formatting. They can be refactored more thoroughly to simplify multiline tests
      // like these, using Jasime expects all the way down.
      expectIncludeReplacementText({
        codeActions,
        content: fixFile.contents,
        text: null,
        newText:
            `{\n    selector: 'foo',\n    template: '<bar></bar>',\n    standalone: true,\n    imports: [BarComponent]\n}`,
        fileName: 'foo.ts',
        description: `Import BarComponent from './bar' on FooComponent`,
        removeWhitespace: false,  // Include whitespace to check multiline formatting
      });
      expectIncludeAddText({
        codeActions,
        position: null,
        text: `import{BarComponent}from"./bar";`,
        fileName: 'foo.ts',
        removeWhitespace: true,
      });
    });
  });
});

function expectNotIncludeFixAllInfo(codeActions: readonly ts.CodeFixAction[]) {
  for (const codeAction of codeActions) {
    expect(codeAction.fixId).toBeUndefined();
    expect(codeAction.fixAllDescription).toBeUndefined();
  }
}

/**
 * The `description` is optional because if the description comes from the ts server, no need to
 * check it.
 */
function expectIncludeReplacementText(
    {codeActions, content, text, newText, fileName, description, removeWhitespace = false}: {
      codeActions: readonly ts.CodeAction[]; content: string; text: string | null; newText: string;
      fileName: string;
      description?: string;
      removeWhitespace?: boolean;
    }) {
  let includeReplacementText = false;
  for (const codeAction of codeActions) {
    includeReplacementText = includeReplacementTextInChanges({
                               fileTextChanges: codeAction.changes,
                               content,
                               text,
                               newText,
                               fileName,
                               removeWhitespace
                             }) &&
        (description === undefined ? true : (description === codeAction.description));
    if (includeReplacementText) {
      return;
    }
  }
  expect(includeReplacementText).toBeTruthy();
}

function expectIncludeAddText({codeActions, position, text, fileName, removeWhitespace = false}: {
  codeActions: readonly ts.CodeAction[]; position: number | null; text: string; fileName: string;
  removeWhitespace?: boolean;
}) {
  let includeAddText = false;
  for (const codeAction of codeActions) {
    includeAddText = includeAddTextInChanges(
        {fileTextChanges: codeAction.changes, position, text, fileName, removeWhitespace});
    if (includeAddText) {
      return;
    }
  }
  expect(includeAddText).toBeTruthy();
}

function expectIncludeReplacementTextForFileTextChange(
    {fileTextChanges, content, text, newText, fileName, removeWhitespace = false}: {
      fileTextChanges: readonly ts.FileTextChanges[]; content: string; text: string;
      newText: string;
      fileName: string;
      removeWhitespace?: boolean;
    }) {
  expect(includeReplacementTextInChanges(
             {fileTextChanges, content, text, newText, fileName, removeWhitespace}))
      .toBeTruthy();
}

function expectIncludeAddTextForFileTextChange(
    {fileTextChanges, position, text, fileName, removeWhitespace = false}: {
      fileTextChanges: readonly ts.FileTextChanges[]; position: number; text: string;
      fileName: string;
      removeWhitespace?: boolean;
    }) {
  expect(includeAddTextInChanges({fileTextChanges, position, text, fileName, removeWhitespace}))
      .toBeTruthy();
}

function includeReplacementTextInChanges(
    {fileTextChanges, content, text, newText, fileName, removeWhitespace = false}: {
      fileTextChanges: readonly ts.FileTextChanges[]; content: string; text: string | null;
      newText: string;
      fileName: string;
      removeWhitespace?: boolean;
    }) {
  for (const change of fileTextChanges) {
    if (!change.fileName.endsWith(fileName)) {
      continue;
    }
    for (const textChange of change.textChanges) {
      if (textChange.span.length === 0) {
        continue;
      }
      const textChangeOldText =
          content.slice(textChange.span.start, textChange.span.start + textChange.span.length);
      let preprocess = removeWhitespace ? deleteWhitespace : (s: string) => s;
      const oldTextMatches = text === null || (preprocess(textChangeOldText) === preprocess(text));
      const newTextMatches = preprocess(newText) === preprocess(textChange.newText);
      if (oldTextMatches && newTextMatches) {
        return true;
      }
    }
  }
  return false;
}

function includeAddTextInChanges(
    {fileTextChanges, position, text, fileName, removeWhitespace = false}: {
      fileTextChanges: readonly ts.FileTextChanges[]; position: number | null; text: string;
      fileName: string;
      removeWhitespace?: boolean;
    }) {
  for (const change of fileTextChanges) {
    if (!change.fileName.endsWith(fileName)) {
      continue;
    }
    for (const textChange of change.textChanges) {
      if (textChange.span.length > 0) {
        continue;
      }
      let preprocess = removeWhitespace ? deleteWhitespace : (s: string) => s;
      const includeAddText = (position === null || position === textChange.span.start) &&
          preprocess(text) === preprocess(textChange.newText);
      if (includeAddText) {
        return true;
      }
    }
  }
  return false;
}

/**
 * For many test input files, there will be extra whitespace from the file formatting,
 * which causes unnecessarily fragile tests.
 */
function deleteWhitespace(str: string) {
  return str.replace(/\s/g, '');
}
