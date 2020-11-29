/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as ts from 'typescript/lib/tsserverlibrary';

import {LanguageService} from '../../language_service';

import {APP_COMPONENT, MockService, setup, TEST_TEMPLATE} from './mock_host';

describe('getSemanticDiagnostics', () => {
  let service: MockService;
  let ngLS: LanguageService;

  beforeAll(() => {
    const {project, service: _service, tsLS} = setup();
    service = _service;
    ngLS = new LanguageService(project, tsLS);
  });

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

  it('should process external template', () => {
    const diags = ngLS.getSemanticDiagnostics(TEST_TEMPLATE);
    expect(diags).toEqual([]);
  });

  it('should report member does not exist in external template', () => {
    const {text} = service.overwrite(TEST_TEMPLATE, `{{ nope }}`);
    const diags = ngLS.getSemanticDiagnostics(TEST_TEMPLATE);
    expect(diags.length).toBe(1);
    const {category, file, start, length, messageText} = diags[0];
    expect(category).toBe(ts.DiagnosticCategory.Error);
    expect(file?.fileName).toBe(TEST_TEMPLATE);
    expect(text.substring(start!, start! + length!)).toBe('nope');
    expect(messageText).toBe(`Property 'nope' does not exist on type 'TemplateReference'.`);
  });

  it('should retrieve external template from latest snapshot', () => {
    // This test is to make sure we are reading from snapshot instead of disk
    // if content from snapshot is newer. It also makes sure the internal cache
    // of the resource loader is invalidated on content change.
    service.overwrite(TEST_TEMPLATE, `{{ foo }}`);
    const d1 = ngLS.getSemanticDiagnostics(TEST_TEMPLATE);
    expect(d1.length).toBe(1);
    expect(d1[0].messageText).toBe(`Property 'foo' does not exist on type 'TemplateReference'.`);

    service.overwrite(TEST_TEMPLATE, `{{ bar }}`);
    const d2 = ngLS.getSemanticDiagnostics(TEST_TEMPLATE);
    expect(d2.length).toBe(1);
    expect(d2[0].messageText).toBe(`Property 'bar' does not exist on type 'TemplateReference'.`);
  });
});
