/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as ts from 'typescript';

import {LanguageService} from '../language_service';

import {APP_COMPONENT, setup} from './mock_host';

describe('completions', () => {
  const {project, service, tsLS} = setup();
  const ngLS = new LanguageService(project, tsLS);

  beforeEach(() => {
    service.reset();
  });


  it('should be able to complete at the end of an interpolation', () => {
    const {position} = service.overwriteInlineTemplate(APP_COMPONENT, '{{ti¦}}');
    const completions =
        ngLS.getCompletionsAtPosition(APP_COMPONENT, position, /* options */ undefined);
    expectContain(completions, ts.ScriptElementKind.memberVariableElement, ['title', 'hero']);
  });

  it('should be able to retrieve details for a completion at the end of an interpolation', () => {
    const {position} = service.overwriteInlineTemplate(APP_COMPONENT, '{{ti¦}}');
    const details = ngLS.getCompletionEntryDetails(
        APP_COMPONENT, position, 'title', /* formatOptions */ undefined,
        /* preferences */ undefined)!;
    expect(details).toBeDefined();
    expect(toText(details.displayParts)).toEqual('(property) AppComponent.title: string');
    expect(toText(details.documentation))
        .toEqual('This is the title of the `AppComponent` Component.');
  });
});

function expectContain(
    completions: ts.CompletionInfo|undefined, kind: ts.ScriptElementKind, names: string[]) {
  expect(completions).toBeDefined();
  for (const name of names) {
    expect(completions!.entries).toContain(jasmine.objectContaining({name, kind} as any));
  }
}

function toText(displayParts?: ts.SymbolDisplayPart[]): string {
  return (displayParts ?? []).map(p => p.text).join('');
}
