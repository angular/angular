/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as ts from 'typescript';
import {DisplayInfoKind} from '../display_parts';

import {LanguageService} from '../language_service';

import {APP_COMPONENT, setup} from './mock_host';

describe('completions', () => {
  const {project, service, tsLS} = setup();
  const ngLS = new LanguageService(project, tsLS);

  beforeEach(() => {
    service.reset();
  });

  describe('in the global scope', () => {
    it('should be able to complete an interpolation', () => {
      const {position} = service.overwriteInlineTemplate(APP_COMPONENT, '{{ti¦}}');
      const completions =
          ngLS.getCompletionsAtPosition(APP_COMPONENT, position, /* options */ undefined);
      expectContain(completions, ts.ScriptElementKind.memberVariableElement, ['title', 'hero']);
    });

    it('should be able to complete a property binding', () => {
      const {position} = service.overwriteInlineTemplate(APP_COMPONENT, '<h1 [model]="ti¦"></h1>');
      const completions =
          ngLS.getCompletionsAtPosition(APP_COMPONENT, position, /* options */ undefined);
      expectContain(completions, ts.ScriptElementKind.memberVariableElement, ['title', 'hero']);
    });

    it('should be able to retrieve details for completions', () => {
      const {position} = service.overwriteInlineTemplate(APP_COMPONENT, '{{ti¦}}');
      const details = ngLS.getCompletionEntryDetails(
          APP_COMPONENT, position, 'title', /* formatOptions */ undefined,
          /* preferences */ undefined)!;
      expect(details).toBeDefined();
      expect(toText(details.displayParts)).toEqual('(property) AppComponent.title: string');
      expect(toText(details.documentation))
          .toEqual('This is the title of the `AppComponent` Component.');
    });

    it('should return reference completions when available', () => {
      const {position} = service.overwriteInlineTemplate(APP_COMPONENT, `
        <div #todo></div>
        {{t¦}}
      `);
      const completions =
          ngLS.getCompletionsAtPosition(APP_COMPONENT, position, /* options */ undefined);
      expectContain(completions, ts.ScriptElementKind.memberVariableElement, ['title']);
      expectContain(completions, DisplayInfoKind.REFERENCE, ['todo']);
    });

    it('should return variable completions when available', () => {
      const {position} = service.overwriteInlineTemplate(APP_COMPONENT, `
        <div *ngFor="let hero of heroes">
          {{h¦}}
        </div>
      `);
      const completions =
          ngLS.getCompletionsAtPosition(APP_COMPONENT, position, /* options */ undefined);
      expectContain(completions, ts.ScriptElementKind.memberVariableElement, ['heroes']);
      expectContain(completions, DisplayInfoKind.VARIABLE, ['hero']);
    });

    it('should return completions inside an event binding', () => {
      const {position} = service.overwriteInlineTemplate(APP_COMPONENT, `
        <button (click)="t¦"></button>
      `);
      const completions =
          ngLS.getCompletionsAtPosition(APP_COMPONENT, position, /* options */ undefined);
      expectContain(completions, ts.ScriptElementKind.memberVariableElement, ['title']);
    });

    it('should return completions inside the RHS of a two-way binding', () => {
      const {position} = service.overwriteInlineTemplate(APP_COMPONENT, `
        <h1 [(model)]="t¦"></h1>
      `);
      const completions =
          ngLS.getCompletionsAtPosition(APP_COMPONENT, position, /* options */ undefined);
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
