/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {initMockFileSystem} from '@angular/compiler-cli/src/ngtsc/file_system/testing';
import {spawn} from 'child_process';
import ts from 'typescript';

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
    it('for a new standalone component import', () => {
      const standaloneFiles = {
        'foo.ts': `
         import {Component} from '@angular/core';
         @Component({
           selector: 'foo',
           template: '<bar></bar>',
           standalone: true
         })
         export class FooComponent {}
         `,
        'bar.ts': `
         import {Component} from '@angular/core';
         @Component({
           selector: 'bar',
           template: '<div>bar</div>',
           standalone: true
         })
         export class BarComponent {}
         `,
      };

      const project = createModuleAndProjectWithDeclarations(env, 'test', {}, {}, standaloneFiles);
      const diags = project.getDiagnosticsForFile('foo.ts');
      const fixFile = project.openFile('foo.ts');
      fixFile.moveCursorToText('<¦bar>');

      const codeActions =
          project.getCodeFixesAtPosition('foo.ts', fixFile.cursor, fixFile.cursor, [diags[0].code]);
      const actionChanges = allChangesForCodeActions(fixFile.contents, codeActions);
      actionChangesMatch(actionChanges, `Import BarComponent from './bar' on FooComponent`, [
        [
          ``,
          `import { BarComponent } from "./bar";`,
        ],
        [
          `{`,
          `{ selector: 'foo', template: '<bar></bar>', standalone: true, imports: [BarComponent] }`,
        ]
      ]);
    });

    it('for a new NgModule-based component import', () => {
      const standaloneFiles = {
        'foo.ts': `
         import {Component} from '@angular/core';
         @Component({
           selector: 'foo',
           template: '<bar></bar>',
           standalone: true
         })
         export class FooComponent {}
         `,
        'bar.ts': `
         import {Component, NgModule} from '@angular/core';
         @Component({
           selector: 'bar',
           template: '<div>bar</div>',
         })
         export class BarComponent {}
         @NgModule({
           declarations: [BarComponent],
           exports: [BarComponent],
           imports: []
         })
         export class BarModule {}
         `,
      };

      const project = createModuleAndProjectWithDeclarations(env, 'test', {}, {}, standaloneFiles);
      const diags = project.getDiagnosticsForFile('foo.ts');
      const fixFile = project.openFile('foo.ts');
      fixFile.moveCursorToText('<¦bar>');

      const codeActions =
          project.getCodeFixesAtPosition('foo.ts', fixFile.cursor, fixFile.cursor, [diags[0].code]);
      const actionChanges = allChangesForCodeActions(fixFile.contents, codeActions);
      actionChangesMatch(actionChanges, `Import BarModule from './bar' on FooComponent`, [
        [
          ``,
          `import { BarModule } from "./bar";`,
        ],
        [
          `{`,
          `{ selector: 'foo', template: '<bar></bar>', standalone: true, imports: [BarModule] }`,
        ]
      ]);
    });

    it('for an import of a component onto an ngModule', () => {
      const standaloneFiles = {
        'foo.ts': `
         import {Component, NgModule} from '@angular/core';
         @Component({
           selector: 'foo',
           template: '<bar></bar>',
         })
         export class FooComponent {}
         @NgModule({
           declarations: [FooComponent],
           exports: [],
           imports: []
         })
         export class FooModule {}
         `,
        'bar.ts': `
         import {Component} from '@angular/core';
         @Component({
           selector: 'bar',
           template: '<div>bar</div>',
           standalone: true,
         })
         export class BarComponent {}
         `,
      };

      const project = createModuleAndProjectWithDeclarations(env, 'test', {}, {}, standaloneFiles);
      const diags = project.getDiagnosticsForFile('foo.ts');
      const fixFile = project.openFile('foo.ts');
      fixFile.moveCursorToText('<¦bar>');

      const codeActions =
          project.getCodeFixesAtPosition('foo.ts', fixFile.cursor, fixFile.cursor, [diags[0].code]);
      const actionChanges = allChangesForCodeActions(fixFile.contents, codeActions);
      actionChangesMatch(actionChanges, `Import BarComponent from './bar' on FooModule`, [
        [
          ``,
          `import { BarComponent } from "./bar";`,
        ],
        [
          `{`,
          `{ declarations: [FooComponent], exports: [], imports: [BarComponent] }`,
        ]
      ]);
    });

    it('for a new standalone pipe import', () => {
      const standaloneFiles = {
        'foo.ts': `
        import {Component} from '@angular/core';
        @Component({
          selector: 'foo',
          template: '{{"hello"|bar}}',
          standalone: true
        })
        export class FooComponent {}
        `,
        'bar.ts': `
        import {Pipe} from '@angular/core';
        @Pipe({
          name: 'bar',
          standalone: true
        })
        export class BarPipe implements PipeTransform {
          transform(value: unknown, ...args: unknown[]): unknown {
            return null;
          }
        }
        `,
      };

      const project = createModuleAndProjectWithDeclarations(env, 'test', {}, {}, standaloneFiles);
      const diags = project.getDiagnosticsForFile('foo.ts');
      const fixFile = project.openFile('foo.ts');
      fixFile.moveCursorToText('"hello"|b¦ar');

      const codeActions =
          project.getCodeFixesAtPosition('foo.ts', fixFile.cursor, fixFile.cursor, [diags[0].code]);
      const actionChanges = allChangesForCodeActions(fixFile.contents, codeActions);

      actionChangesMatch(actionChanges, `Import BarPipe from './bar' on FooComponent`, [
        [
          ``,
          `import { BarPipe } from "./bar";`,
        ],
        [
          '{',
          `{ selector: 'foo', template: '{{"hello"|bar}}', standalone: true, imports: [BarPipe] }`,
        ]
      ]);
    });

    it('for a transitive NgModule-based reexport', () => {
      const standaloneFiles = {
        'foo.ts': `
         import {Component} from '@angular/core';
         @Component({
           selector: 'foo',
           template: '<bar></bar>',
           standalone: true
         })
         export class FooComponent {}
         `,
        'bar.ts': `
         import {Component, NgModule} from '@angular/core';
         @Component({
           selector: 'bar',
           template: '<div>bar</div>',
         })
         export class BarComponent {}
         @NgModule({
           declarations: [BarComponent],
           exports: [BarComponent],
           imports: []
         })
         export class BarModule {}
         @NgModule({
          declarations: [],
          exports: [BarModule],
          imports: []
        })
        export class Bar2Module {}
        `,
      };

      const project = createModuleAndProjectWithDeclarations(env, 'test', {}, {}, standaloneFiles);
      const diags = project.getDiagnosticsForFile('foo.ts');
      const fixFile = project.openFile('foo.ts');
      fixFile.moveCursorToText('<¦bar>');

      const codeActions =
          project.getCodeFixesAtPosition('foo.ts', fixFile.cursor, fixFile.cursor, [diags[0].code]);
      const actionChanges = allChangesForCodeActions(fixFile.contents, codeActions);
      actionChangesMatch(actionChanges, `Import BarModule from './bar' on FooComponent`, [
        [
          ``,
          `import { BarModule } from "./bar";`,
        ],
        [
          `{`,
          `{ selector: 'foo', template: '<bar></bar>', standalone: true, imports: [BarModule] }`,
        ]
      ]);
      actionChangesMatch(actionChanges, `Import Bar2Module from './bar' on FooComponent`, [
        [
          ``,
          `import { Bar2Module } from "./bar";`,
        ],
        [
          `{`,
          `{ selector: 'foo', template: '<bar></bar>', standalone: true, imports: [Bar2Module] }`,
        ]
      ]);
    });
  });
});

type ActionChanges = {
  [description: string]: Array<readonly[string, string]>
};

function actionChangesMatch(
    actionChanges: ActionChanges, description: string,
    substitutions: Array<readonly[string, string]>) {
  expect(Object.keys(actionChanges)).toContain(description);
  for (const substitution of substitutions) {
    expect(actionChanges[description]).toContain([substitution[0], substitution[1]]);
  }
}

// Returns the ActionChanges for all changes in the given code actions, collapsing whitespace into a
// single space and trimming at the ends.
function allChangesForCodeActions(
    fileContents: string, codeActions: readonly ts.CodeAction[]): ActionChanges {
  // Replace all whitespace characters with a single space, then deduplicate spaces and trim.
  const collapse = (s: string) => s.replace(/\s/g, ' ').replace(/\s{2,}/g, ' ').trim();
  let allActionChanges: ActionChanges = {};
  // For all code actions, construct a map from descriptions to [oldText, newText] pairs.
  for (const action of codeActions) {
    const actionChanges = action.changes.flatMap(change => {
      return change.textChanges.map(tc => {
        const oldText = collapse(fileContents.slice(tc.span.start, tc.span.start + spawn.length));
        const newText = collapse(tc.newText);
        return [oldText, newText] as const;
      });
    });
    allActionChanges[collapse(action.description)] = actionChanges;
  }
  return allActionChanges;
}

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
    {codeActions, content, text, newText, fileName, description}: {
      codeActions: readonly ts.CodeAction[]; content: string; text: string | null; newText: string;
      fileName: string;
      description?: string;
    }) {
  let includeReplacementText = false;
  for (const codeAction of codeActions) {
    includeReplacementText =
        includeReplacementTextInChanges(
            {fileTextChanges: codeAction.changes, content, text, newText, fileName}) &&
        (description === undefined ? true : (description === codeAction.description));
    if (includeReplacementText) {
      return;
    }
  }
  expect(includeReplacementText).toBeTruthy();
}

function expectIncludeAddText({codeActions, position, text, fileName}: {
  codeActions: readonly ts.CodeAction[]; position: number | null; text: string; fileName: string;
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
  fileTextChanges: readonly ts.FileTextChanges[]; content: string; text: string | null;
  newText: string;
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
      const textChangeOldText =
          content.slice(textChange.span.start, textChange.span.start + textChange.span.length);
      const oldTextMatches = text === null || textChangeOldText === text;
      const newTextMatches = newText === textChange.newText;
      if (oldTextMatches && newTextMatches) {
        return true;
      }
    }
  }
  return false;
}

function includeAddTextInChanges({fileTextChanges, position, text, fileName}: {
  fileTextChanges: readonly ts.FileTextChanges[]; position: number | null; text: string;
  fileName: string;
}) {
  for (const change of fileTextChanges) {
    if (!change.fileName.endsWith(fileName)) {
      continue;
    }
    for (const textChange of change.textChanges) {
      if (textChange.span.length > 0) {
        continue;
      }
      const includeAddText =
          (position === null || position === textChange.span.start) && text === textChange.newText;
      if (includeAddText) {
        return true;
      }
    }
  }
  return false;
}
