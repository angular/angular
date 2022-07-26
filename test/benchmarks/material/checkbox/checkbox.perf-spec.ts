/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {$, browser} from 'protractor';
import {runBenchmark} from '@angular/build-tooling/bazel/benchmark/driver-utilities';

describe('checkbox performance benchmarks', () => {
  beforeAll(() => {
    browser.angularAppRoot('#root');
  });

  it('renders a checked checkbox', async () => {
    await runBenchmark({
      id: 'checkbox-render-checked',
      url: '',
      ignoreBrowserSynchronization: true,
      setup: async () => {
        await $('#show').click();
        await $('mat-checkbox').click();
      },
      prepare: async () => {
        expect(await $('mat-checkbox input').isSelected()).toBe(
          true,
          'The checkbox should be in a selected state.',
        );
        await $('#hide').click();
      },
      work: async () => await $('#show').click(),
    });
  });

  it('renders an unchecked checkbox', async () => {
    await runBenchmark({
      id: 'checkbox-render-unchecked',
      url: '',
      ignoreBrowserSynchronization: true,
      setup: async () => await $('#show').click(),
      prepare: async () => {
        expect(await $('mat-checkbox input').isSelected()).toBe(
          false,
          'The checkbox should be in an unselected state.',
        );
        await $('#hide').click();
      },
      work: async () => await $('#show').click(),
    });
  });

  it('renders an indeterminate checkbox', async () => {
    await runBenchmark({
      id: 'checkbox-render-indeterminate',
      url: '',
      ignoreBrowserSynchronization: true,
      setup: async () => {
        await $('#show').click();
        await $('#indeterminate').click();
      },
      prepare: async () => {
        expect(await $('mat-checkbox input').getAttribute('indeterminate')).toBe(
          'true',
          'The checkbox should be in an indeterminate state',
        );
        await $('#hide').click();
      },
      work: async () => await $('#show').click(),
    });
  });

  it('updates from unchecked to checked', async () => {
    await runBenchmark({
      id: 'checkbox-click-unchecked-to-checked',
      url: '',
      ignoreBrowserSynchronization: true,
      setup: async () => {
        await $('#show').click();
        await $('mat-checkbox').click();
      },
      prepare: async () => {
        await $('mat-checkbox').click();
        expect(await $('mat-checkbox input').isSelected()).toBe(
          false,
          'The checkbox should be in an unchecked state.',
        );
      },
      work: async () => await $('mat-checkbox').click(),
    });
  });

  it('updates from checked to unchecked', async () => {
    await runBenchmark({
      id: 'checkbox-click-checked-to-unchecked',
      url: '',
      ignoreBrowserSynchronization: true,
      setup: async () => await $('#show').click(),
      prepare: async () => {
        await $('mat-checkbox').click();
        expect(await $('mat-checkbox input').isSelected()).toBe(
          true,
          'The checkbox should be in a checked state.',
        );
      },
      work: async () => await $('mat-checkbox').click(),
    });
  });
});
