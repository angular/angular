/**
 * @license
 * Copyright Google LLC All Rights Reserved.
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

    await $('#markInsertionComponentForCheck').click();
    await $('#detectChanges').click();
    // Ivy currently refreshes at *both* declaration and insertion while VE only refreshes at
    // insertion. Simply assert that the view was updated at least once since the first update.
    expect(Number(await $('#root').getText())).toBeGreaterThan(1);

    // The button click causes change detection to trigger at the root
    await $('#destroyDom').click();
    expect(await $('#root').getText()).toEqual('');
  });
});
