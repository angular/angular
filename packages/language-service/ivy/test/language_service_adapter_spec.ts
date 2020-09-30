/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {LanguageServiceAdapter} from '../language_service_adapter';
import {setup, TEST_TEMPLATE} from './mock_host';

const {project, service} = setup();

describe('Language service adapter', () => {
  it('should register update if it has not seen the template before', () => {
    const adapter = new LanguageServiceAdapter(project);
    // Note that readResource() has never been called, so the adapter has no
    // knowledge of the template at all.
    const isRegistered = adapter.registerTemplateUpdate(TEST_TEMPLATE);
    expect(isRegistered).toBeTrue();
    expect(adapter.getModifiedResourceFiles().size).toBe(1);
  });

  it('should not register update if template has not changed', () => {
    const adapter = new LanguageServiceAdapter(project);
    adapter.readResource(TEST_TEMPLATE);
    const isRegistered = adapter.registerTemplateUpdate(TEST_TEMPLATE);
    expect(isRegistered).toBeFalse();
    expect(adapter.getModifiedResourceFiles().size).toBe(0);
  });

  it('should register update if template has changed', () => {
    const adapter = new LanguageServiceAdapter(project);
    adapter.readResource(TEST_TEMPLATE);
    service.overwrite(TEST_TEMPLATE, '<p>Hello World</p>');
    const isRegistered = adapter.registerTemplateUpdate(TEST_TEMPLATE);
    expect(isRegistered).toBe(true);
    expect(adapter.getModifiedResourceFiles().size).toBe(1);
  });

  it('should clear template updates on read', () => {
    const adapter = new LanguageServiceAdapter(project);
    const isRegistered = adapter.registerTemplateUpdate(TEST_TEMPLATE);
    expect(isRegistered).toBeTrue();
    expect(adapter.getModifiedResourceFiles().size).toBe(1);
    adapter.readResource(TEST_TEMPLATE);
    expect(adapter.getModifiedResourceFiles().size).toBe(0);
  });
});
