/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {runBenchmark, verifyNoBrowserErrors} from '../../../utilities/index';
import {$} from 'protractor';

interface Worker {
  id: string;
  prepare?(): void;
  work(): void;
}

const SwapFullContext = {
  id: 'swapFullContext',
  work: () => {
    $('#swapOutFull').click();
  },
};

const ModifyContextProperty = {
  id: 'modifyContextProperty',
  work: () => {
    $('#modifyProperty').click();
  },
};

const ModifyContextDeepProperty = {
  id: 'modifyContextDeepProperty',
  work: () => {
    $('#modifyDeepProperty').click();
  },
};

const AddNewContextProperty = {
  id: 'addNewContextProperty',
  work: () => {
    $('#addNewProperty').click();
  },
};

const scenarios = [
  SwapFullContext,
  ModifyContextProperty,
  ModifyContextDeepProperty,
  AddNewContextProperty,
];

describe('ng_template_outlet_context benchmark spec', () => {
  afterEach(verifyNoBrowserErrors);

  scenarios.forEach((worker) => {
    describe(worker.id, () => {
      it('should run for ng2', async () => {
        await runBenchmarkScenario({
          url: '/',
          id: `ngTemplateOutletContext.ng2.${worker.id}`,
          worker: worker,
        });
      });
    });
  });

  function runBenchmarkScenario(config: {id: string; url: string; worker: Worker}) {
    return runBenchmark({
      id: config.id,
      url: config.url,
      ignoreBrowserSynchronization: true,
      prepare: config.worker.prepare,
      work: config.worker.work,
    });
  }
});
