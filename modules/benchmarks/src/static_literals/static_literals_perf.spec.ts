/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {openBrowser, runBenchmark, verifyNoBrowserErrors} from '../../../utilities/index.js';
import {$, by, element} from 'protractor';

const SCENARIOS = [
  {optionIndex: 0, id: 'flat_literals'},
  {optionIndex: 1, id: 'nested_literals'},
];

describe('static literals benchmark spec', () => {
  afterEach(verifyNoBrowserErrors);

  SCENARIOS.forEach(({optionIndex, id}) => {
    describe(id, () => {
      it('should run create benchmark', async () => {
        await runBenchmark({
          id: `static_literals.${id}.create`,
          url: '/',
          params: [],
          ignoreBrowserSynchronization: true,
          prepare: () => {
            element.all(by.tagName('option')).get(optionIndex).click();
            $('#destroy').click();
          },
          work: () => $('#create').click(),
        });
      });

      it('should run update benchmark', async () => {
        await runBenchmark({
          id: `static_literals.${id}.update`,
          url: '/',
          params: [],
          ignoreBrowserSynchronization: true,
          prepare: () => {
            element.all(by.tagName('option')).get(optionIndex).click();
            $('#create').click();
          },
          work: () => $('#update').click(),
        });
      });
    });
  });
});
