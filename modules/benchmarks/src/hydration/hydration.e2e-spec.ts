/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {openBrowser, verifyNoBrowserErrors} from '../../../utilities/index';
import {$} from 'protractor';

describe('hydration benchmark', () => {
  afterEach(verifyNoBrowserErrors);

  it(`should render the table`, async () => {
    openBrowser({
      url: '',
      ignoreBrowserSynchronization: true,
      params: [
        {name: 'cols', value: 5},
        {name: 'rows', value: 5},
      ],
    });
    await $('#prepare').click();
    await $('#createDom').click();
    expect($('#table').getText()).toContain('0/0');
  });
});
