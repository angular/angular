/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {refreshView} from '../../../../src/render3/instructions/shared';
import {TVIEW} from '../../../../src/render3/interfaces/view';
import {createBenchmark} from '../micro_bench';
import {setupRootViewWithEmbeddedViews} from '../setup';

const rootLView = setupRootViewWithEmbeddedViews(null, 0, 0, 1000);
const rootTView = rootLView[TVIEW];

// scenario to benchmark
const noopChangeDetection = createBenchmark('noop change detection');
const refreshTime = noopChangeDetection('refresh');

// run change detection in the update mode
console.profile('noop_change_detection');
while (refreshTime()) {
  refreshView(rootTView, rootLView, null, null);
}
console.profileEnd();

// report results
noopChangeDetection.report();
