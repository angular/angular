/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as ts from 'typescript/lib/tsserverlibrary';

import {LanguageService} from '../language_service';

import {APP_COMPONENT, setup} from './mock_host';

describe('diagnostic', () => {
  const {project, service, tsLS} = setup();
  const ngLS = new LanguageService(project, tsLS);

  beforeEach(() => {
    service.reset();
  });

  it('should not produce error for AppComponent', () => {
    const diags = ngLS.getSemanticDiagnostics(APP_COMPONENT);
    expect(diags).toEqual([]);
  });

  it('should report member does not exist', () => {
    const {text} = service.overwriteInlineTemplate(APP_COMPONENT, '{{ nope }}');
    const diags = ngLS.getSemanticDiagnostics(APP_COMPONENT);
    expect(diags.length).toBe(1);
    const {category, file, start, length, messageText} = diags[0];
    expect(category).toBe(ts.DiagnosticCategory.Error);
    expect(file?.fileName).toBe(APP_COMPONENT);
    expect(text.substring(start!, start! + length!)).toBe('nope');
    expect(messageText).toBe(`Property 'nope' does not exist on type 'AppComponent'.`);
  });
});
