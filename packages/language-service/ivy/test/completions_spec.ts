/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {TmplAstNode} from '@angular/compiler';
import {absoluteFrom, AbsoluteFsPath} from '@angular/compiler-cli/src/ngtsc/file_system';
import {initMockFileSystem} from '@angular/compiler-cli/src/ngtsc/file_system/testing';
import * as ts from 'typescript';
import {DisplayInfoKind} from '../display_parts';
import {LanguageService} from '../language_service';

import {LanguageServiceTestEnvironment} from './env';

describe('completions', () => {
  beforeEach(() => {
    initMockFileSystem('Native');
  });

  describe('in the global scope', () => {
    it('should be able to complete an interpolation', () => {
      const {ngLS, fileName, cursor} = setup('{{ti¦}}', `title!: string; hero!: number;`);
      const completions = ngLS.getCompletionsAtPosition(fileName, cursor, /* options */ undefined);
      expectContain(completions, ts.ScriptElementKind.memberVariableElement, ['title', 'hero']);
    });

    it('should be able to complete an empty interpolation', () => {
      const {ngLS, fileName, cursor} = setup('{{ ¦ }}', `title!: string; hero!: number;`);
      const completions = ngLS.getCompletionsAtPosition(fileName, cursor, /* options */ undefined);
      expectContain(completions, ts.ScriptElementKind.memberVariableElement, ['title', 'hero']);
    });

    it('should be able to complete a property binding', () => {
      const {ngLS, fileName, cursor} =
          setup('<h1 [model]="ti¦"></h1>', `title!: string; hero!: number;`);
      const completions = ngLS.getCompletionsAtPosition(fileName, cursor, /* options */ undefined);
      expectContain(completions, ts.ScriptElementKind.memberVariableElement, ['title', 'hero']);
    });

    it('should be able to complete an empty property binding', () => {
      const {ngLS, fileName, cursor} =
          setup('<h1 [model]="¦"></h1>', `title!: string; hero!: number;`);
      const completions = ngLS.getCompletionsAtPosition(fileName, cursor, /* options */ undefined);
      expectContain(completions, ts.ScriptElementKind.memberVariableElement, ['title', 'hero']);
    });

    it('should be able to retrieve details for completions', () => {
      const {ngLS, fileName, cursor} = setup('{{ti¦}}', `
        /** This is the title of the 'AppCmp' Component. */
        title!: string;
        /** This comment should not appear in the output of this test. */
        hero!: number;
      `);
      const details = ngLS.getCompletionEntryDetails(
          fileName, cursor, 'title', /* formatOptions */ undefined,
          /* preferences */ undefined)!;
      expect(details).toBeDefined();
      expect(toText(details.displayParts)).toEqual('(property) AppCmp.title: string');
      expect(toText(details.documentation))
          .toEqual('This is the title of the \'AppCmp\' Component.');
    });

    it('should return reference completions when available', () => {
      const {ngLS, fileName, cursor} = setup(`<div #todo></div>{{t¦}}`, `title!: string;`);
      const completions = ngLS.getCompletionsAtPosition(fileName, cursor, /* options */ undefined);
      expectContain(completions, ts.ScriptElementKind.memberVariableElement, ['title']);
      expectContain(completions, DisplayInfoKind.REFERENCE, ['todo']);
    });

    it('should return variable completions when available', () => {
      const {ngLS, fileName, cursor} = setup(
          `<div *ngFor="let hero of heroes">
            {{h¦}}
          </div>
        `,
          `heroes!: {name: string}[];`);
      const completions = ngLS.getCompletionsAtPosition(fileName, cursor, /* options */ undefined);
      expectContain(completions, ts.ScriptElementKind.memberVariableElement, ['heroes']);
      expectContain(completions, DisplayInfoKind.VARIABLE, ['hero']);
    });

    it('should return completions inside an event binding', () => {
      const {ngLS, fileName, cursor} = setup(`<button (click)='t¦'></button>`, `title!: string;`);
      const completions = ngLS.getCompletionsAtPosition(fileName, cursor, /* options */ undefined);
      expectContain(completions, ts.ScriptElementKind.memberVariableElement, ['title']);
    });

    it('should return completions inside an empty event binding', () => {
      const {ngLS, fileName, cursor} = setup(`<button (click)='¦'></button>`, `title!: string;`);
      const completions = ngLS.getCompletionsAtPosition(fileName, cursor, /* options */ undefined);
      expectContain(completions, ts.ScriptElementKind.memberVariableElement, ['title']);
    });

    it('should return completions inside the RHS of a two-way binding', () => {
      const {ngLS, fileName, cursor} = setup(`<h1 [(model)]="t¦"></h1>`, `title!: string;`);
      const completions = ngLS.getCompletionsAtPosition(fileName, cursor, /* options */ undefined);
      expectContain(completions, ts.ScriptElementKind.memberVariableElement, ['title']);
    });

    it('should return completions inside an empty RHS of a two-way binding', () => {
      const {ngLS, fileName, cursor} = setup(`<h1 [(model)]="¦"></h1>`, `title!: string;`);
      const completions = ngLS.getCompletionsAtPosition(fileName, cursor, /* options */ undefined);
      expectContain(completions, ts.ScriptElementKind.memberVariableElement, ['title']);
    });
  });
});

function expectContain(
    completions: ts.CompletionInfo|undefined, kind: ts.ScriptElementKind|DisplayInfoKind,
    names: string[]) {
  expect(completions).toBeDefined();
  for (const name of names) {
    expect(completions!.entries).toContain(jasmine.objectContaining({name, kind} as any));
  }
}

function toText(displayParts?: ts.SymbolDisplayPart[]): string {
  return (displayParts ?? []).map(p => p.text).join('');
}

function setup(templateWithCursor: string, classContents: string): {
  env: LanguageServiceTestEnvironment,
  fileName: AbsoluteFsPath,
  AppCmp: ts.ClassDeclaration,
  ngLS: LanguageService,
  cursor: number,
  nodes: TmplAstNode[],
} {
  const codePath = absoluteFrom('/test.ts');
  const templatePath = absoluteFrom('/test.html');
  const env = LanguageServiceTestEnvironment.setup([
    {
      name: codePath,
      contents: `
        import {Component, NgModule} from '@angular/core';

        @Component({
          templateUrl: './test.html',
          selector: 'app-cmp',
        })
        export class AppCmp {
          ${classContents}
        }
        
        @NgModule({
          declarations: [AppCmp],
        })
        export class AppModule {}
        `,
      isRoot: true,
    },
    {
      name: templatePath,
      contents: 'Placeholder template',
    }
  ]);
  const {nodes, cursor} = env.overrideTemplateWithCursor(codePath, 'AppCmp', templateWithCursor);
  return {
    env,
    fileName: templatePath,
    AppCmp: env.getClass(codePath, 'AppCmp'),
    ngLS: env.ngLS,
    nodes,
    cursor,
  };
}