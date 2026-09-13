/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {ApplicationRef} from '@angular/core';

import {bindAction} from '../util';
import {benchmarkCases} from './benchmark';

export function init(appRef: ApplicationRef): void {
  const cases = benchmarkCases();
  const metrics = document.querySelector('#metrics')!;

  for (const [name, benchmarkCase] of Object.entries(cases)) {
    bindAction(`#update-${name}`, () => {
      benchmarkCase.clock.update((value) => value + 1);
      appRef._tick();
    });
  }

  bindAction('#reset-metrics', () => {
    for (const benchmarkCase of Object.values(cases)) {
      benchmarkCase.parentRefreshes = 0;
      benchmarkCase.heavyBindingChecks = 0;
      benchmarkCase.clockRefreshes = 0;
    }
  });

  bindAction('#read-metrics', () => {
    metrics.textContent = JSON.stringify(
      Object.fromEntries(
        Object.entries(cases).map(([name, benchmarkCase]) => [
          name,
          {
            parentRefreshes: benchmarkCase.parentRefreshes,
            heavyBindingChecks: benchmarkCase.heavyBindingChecks,
            clockRefreshes: benchmarkCase.clockRefreshes,
          },
        ]),
      ),
    );
  });
}
