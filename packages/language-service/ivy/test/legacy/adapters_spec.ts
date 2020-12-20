/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import * as ts from 'typescript/lib/tsserverlibrary';

import {LanguageServiceAdapter} from '../../adapters';

import {MockService, setup, TEST_TEMPLATE} from './mock_host';

describe('Language service adapter', () => {
  let project: ts.server.Project;
  let service: MockService;

  beforeAll(() => {
    const {project: _project, service: _service} = setup();
    project = _project;
    service = _service;
  });

  it('should mark template dirty if it has not seen the template before', () => {
    const adapter = new LanguageServiceAdapter(project);
    expect(adapter.isTemplateDirty(TEST_TEMPLATE)).toBeTrue();
  });

  it('should not mark template dirty if template has not changed', () => {
    const adapter = new LanguageServiceAdapter(project);
    adapter.readResource(TEST_TEMPLATE);
    expect(adapter.isTemplateDirty(TEST_TEMPLATE)).toBeFalse();
  });

  it('should mark template dirty if template has changed', () => {
    const adapter = new LanguageServiceAdapter(project);
    service.overwrite(TEST_TEMPLATE, '<p>Hello World</p>');
    expect(adapter.isTemplateDirty(TEST_TEMPLATE)).toBeTrue();
  });
});
