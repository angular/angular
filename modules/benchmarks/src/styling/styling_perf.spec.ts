/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {$, by, element} from 'protractor';
import {openBrowser, verifyNoBrowserErrors} from '../../../e2e_util/e2e_util';
import {runBenchmark} from '../../../e2e_util/perf_util';

/** List of possible scenarios that should be tested.  */
const SCENARIOS = [
  {optionIndex: 0, id: 'no_styling_involved'}, {optionIndex: 1, id: 'static_class'},
  {optionIndex: 2, id: 'static_class_with_interpolation'}, {optionIndex: 3, id: 'class_binding'},
  {optionIndex: 4, id: 'static_class_and_class_binding'},
  {optionIndex: 5, id: 'static_class_and_ngclass_binding'},
  {optionIndex: 6, id: 'static_class_and_ngstyle_binding_and_style_binding'}
];

describe('styling benchmark spec', () => {
  afterEach(verifyNoBrowserErrors);

  it('should render and interact to update and detect changes', () => {
    openBrowser({url: '/', ignoreBrowserSynchronization: true});
    create();
    const items = element.all(by.css('styling-bindings button'));
    expect(items.count()).toBe(2000);
    expect(items.first().getAttribute('title')).toBe('bar');
    update();
    expect(items.first().getAttribute('title')).toBe('baz');
  });

  it('should render and run noop change detection', () => {
    openBrowser({url: '/', ignoreBrowserSynchronization: true});
    create();
    const items = element.all(by.css('styling-bindings button'));
    expect(items.count()).toBe(2000);
    expect(items.first().getAttribute('title')).toBe('bar');
    detectChanges();
    expect(items.first().getAttribute('title')).toBe('bar');
  });

  // Create benchmarks for each possible test scenario.
  SCENARIOS.forEach(({optionIndex, id}) => {
    describe(id, () => {
      it('should run update benchmark', done => {
        runStylingBenchmark(`styling.${id}.update`, {
          work: () => update(),
          prepare: () => {
            selectScenario(optionIndex);
            create();
          },
        }).then(done, done.fail);
      });

      it('should run detect changes benchmark', done => {
        runStylingBenchmark(`styling.${id}.noop_cd`, {
          work: () => detectChanges(),
          prepare: () => {
            selectScenario(optionIndex);
            create();
          },
        }).then(done, done.fail);
      });
    });
  });
});

function selectScenario(optionIndex: number) {
  // Switch to the current scenario by clicking the corresponding option.
  element.all(by.tagName('option')).get(optionIndex).click();
}

function create() {
  $('#create').click();
}

function update() {
  $('#update').click();
}

function detectChanges() {
  $('#detect_changes').click();
}

/**
 * Runs the styling benchmark with the given id and worker. The worker describes
 * the actions that should run for preparation and measurement.
 */
function runStylingBenchmark(id: string, worker: {prepare: () => void, work: () => void}) {
  return runBenchmark({
    id,
    url: '/',
    params: [],
    ignoreBrowserSynchronization: true,
    prepare: worker.prepare,
    work: worker.work
  });
}
