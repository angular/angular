/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {$, by, element, ElementFinder, Key} from 'protractor';
import {runBenchmark} from '@angular/dev-infra-private/benchmark/driver-utilities';

// Clicking to close a menu is problematic. This is a solution that uses `.sendKeys()` avoids
// issues with `.click()`.

async function closeMenu(trigger: ElementFinder) {
  const backdropId = await trigger.getAttribute('aria-controls');
  if (await $(`#${backdropId}`).isPresent()) {
    await $(`#${backdropId}`).sendKeys(Key.ESCAPE);
  }
}

describe('menu performance benchmarks', () => {
  it('opens a basic menu', async () => {
    let trigger: ElementFinder;
    await runBenchmark({
      id: 'basic-menu-open',
      url: '',
      ignoreBrowserSynchronization: true,
      params: [],
      setup: async () => trigger = element(by.buttonText('Basic Menu')),
      work: async () => {
        await trigger.click();
        await closeMenu(trigger);
      }
    });
  });

  it('opens the root menu of a set of nested menus', async () => {
    let trigger: ElementFinder;
    await runBenchmark({
      id: 'nested-menu-open-shallow',
      url: '',
      ignoreBrowserSynchronization: true,
      params: [],
      setup: async () => trigger = element(by.buttonText('Nested Menu')),
      work: async () => {
        await trigger.click();
        await closeMenu(trigger);
      },
    });
  });

  it('fully opens a menu with nested menus', async () => {
    let trigger: ElementFinder;
    await runBenchmark({
      id: 'menu-open-deep',
      url: '',
      ignoreBrowserSynchronization: true,
      params: [],
      setup: async () => trigger = element(by.buttonText('Nested Menu')),
      work: async () => {
        await trigger.click();
        await element(by.buttonText('Sub Menu 1')).click();
        await element(by.buttonText('Sub Menu 2')).click();
        await closeMenu(trigger);
      },
    });
  });
});
