/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {$} from 'protractor';

import {openBrowser, verifyNoBrowserErrors} from '../../../../dev-infra/benchmark/driver-utilities';

describe('change detection benchmark', () => {
  afterEach(verifyNoBrowserErrors);

  it(`should render and update`, async () => {
    openBrowser({
      url: '',
      ignoreBrowserSynchronization: true,
      params: [{name: 'viewCount', value: 1}],
    });
    await $('#destroyDom').click();
    expect(await $('#root').getText()).toEqual('');
    await $('#createDom').click();
    expect($('#root').getText()).toContain('1');
    await $('#detectChanges').click();
    expect($('#root').getText()).toContain('2');
    await $('#destroyDom').click();
    expect(await $('#root').getText()).toEqual('');
  });
});
