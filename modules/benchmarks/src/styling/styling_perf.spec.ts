/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {openBrowser, runBenchmark, verifyNoBrowserErrors} from '@angular/build-tooling/bazel/benchmark/driver-utilities';
import {$, by, element} from 'protractor';

/** List of possible scenarios that should be tested.  */
const SCENARIOS = [
  {optionIndex: 0, id: 'no_styling_involved'},
  {optionIndex: 1, id: 'static_class'},
  {optionIndex: 2, id: 'static_class_with_interpolation'},
  {optionIndex: 3, id: 'class_binding'},
  {optionIndex: 4, id: 'static_class_and_class_binding'},
  {optionIndex: 5, id: 'static_class_and_ngclass_binding'},
  {optionIndex: 6, id: 'static_class_and_ngstyle_binding_and_style_binding'},
  {optionIndex: 7, id: 'static_style'},
  {optionIndex: 8, id: 'style_property_bindings'},
  {optionIndex: 9, id: 'static_style_and_property_binding'},
  {optionIndex: 10, id: 'ng_style_with_units'},
];

describe('styling benchmark spec', () => {
  afterEach(verifyNoBrowserErrors);

  it('should render and interact to update and detect changes', async () => {
    openBrowser({url: '/', ignoreBrowserSynchronization: true});
    create();
    const items = element.all(by.css('styling-bindings button'));
    expect(await items.count()).toBe(2000);
    expect(await items.first().getAttribute('title')).toBe('bar');
    update();
    expect(await items.first().getAttribute('title')).toBe('baz');
  });

  it('should render and run noop change detection', async () => {
    openBrowser({url: '/', ignoreBrowserSynchronization: true});
    create();
    const items = element.all(by.css('styling-bindings button'));
    expect(await items.count()).toBe(2000);
    expect(await items.first().getAttribute('title')).toBe('bar');
    detectChanges();
    expect(await items.first().getAttribute('title')).toBe('bar');
  });

  // Create benchmarks for each possible test scenario.
  SCENARIOS.forEach(({optionIndex, id}) => {
    describe(id, () => {
      it('should run create benchmark', async () => {
        await runStylingBenchmark(`styling.${id}.create`, {
          work: () => create(),
          prepare: () => {
            selectScenario(optionIndex);
            destroy();
          },
        });
      });

      it('should run update benchmark', async () => {
        await runStylingBenchmark(`styling.${id}.update`, {
          work: () => update(),
          prepare: () => {
            selectScenario(optionIndex);
            create();
          },
        });
      });

      it('should run detect changes benchmark', async () => {
        await runStylingBenchmark(`styling.${id}.noop_cd`, {
          work: () => detectChanges(),
          prepare: () => {
            selectScenario(optionIndex);
            create();
          },
        });
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

function destroy() {
  $('#destroy').click();
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
