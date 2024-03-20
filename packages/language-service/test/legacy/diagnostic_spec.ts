/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {LanguageService} from '../../src/language_service';

import {MockService, setup, TEST_TEMPLATE} from './mock_host';

describe('getSemanticDiagnostics', () => {
  let service: MockService;
  let ngLS: LanguageService;

  beforeAll(() => {
    const {project, service: _service, tsLS} = setup();
    service = _service;
    ngLS = new LanguageService(project, tsLS, {});
  });

  beforeEach(() => {
    service.reset();
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
