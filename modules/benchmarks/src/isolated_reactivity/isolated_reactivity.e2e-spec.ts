/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {openBrowser, verifyNoBrowserErrors} from '../../../utilities/index.js';
import {$} from 'protractor';

interface Metrics {
  parentRefreshes: number;
  heavyBindingChecks: number;
  clockRefreshes: number;
}

describe('isolated reactivity benchmark', () => {
  afterEach(verifyNoBrowserErrors);

  it('only evaluates heavy bindings for the baseline case', async () => {
    openBrowser({url: '/', ignoreBrowserSynchronization: true});

    const baseline = await updateAndReadMetrics('baseline');
    expect(baseline).toEqual({
      parentRefreshes: 1,
      heavyBindingChecks: 1_000,
      clockRefreshes: 1,
    });

    const isolated = await updateAndReadMetrics('isolated');
    expect(isolated).toEqual({
      parentRefreshes: 0,
      heavyBindingChecks: 0,
      clockRefreshes: 1,
    });

    const component = await updateAndReadMetrics('component');
    expect(component).toEqual({
      parentRefreshes: 0,
      heavyBindingChecks: 0,
      clockRefreshes: 1,
    });
  });
});

async function updateAndReadMetrics(name: string): Promise<Metrics> {
  await $('#reset-metrics').click();
  await $(`#update-${name}`).click();
  await $('#read-metrics').click();
  const allMetrics = JSON.parse(await $('#metrics').getText()) as Record<string, Metrics>;
  return allMetrics[name];
}
