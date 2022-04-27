/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {ɵɵadvance} from '../../../../src/render3/instructions/advance.js';
import {ɵɵelementEnd, ɵɵelementStart} from '../../../../src/render3/instructions/element.js';
import {refreshView} from '../../../../src/render3/instructions/shared.js';
import {ɵɵtext} from '../../../../src/render3/instructions/text.js';
import {ɵɵtextInterpolate} from '../../../../src/render3/instructions/text_interpolation.js';
import {RenderFlags} from '../../../../src/render3/interfaces/definition.js';
import {TVIEW} from '../../../../src/render3/interfaces/view.js';
import {createBenchmark} from '../micro_bench.js';
import {setupRootViewWithEmbeddedViews} from '../setup.js';

`<div>
    <button>{{'0'}}</button>
    <button>{{'1'}}</button>
    <button>{{'2'}}</button>
    <button>{{'3'}}</button>
    <button>{{'4'}}</button>
    <button>{{'5'}}</button>
    <button>{{'6'}}</button>
    <button>{{'7'}}</button>
    <button>{{'8'}}</button>
    <button>{{'9'}}</button>
  </div>
</ng-template>`;
function TestInterpolationComponent_ng_template_0_Template(rf: RenderFlags, ctx: any) {
  if (rf & 1) {
    ɵɵelementStart(0, 'div');
    ɵɵelementStart(1, 'button');
    ɵɵtext(2);
    ɵɵelementEnd();
    ɵɵelementStart(3, 'button');
    ɵɵtext(4);
    ɵɵelementEnd();
    ɵɵelementStart(5, 'button');
    ɵɵtext(6);
    ɵɵelementEnd();
    ɵɵelementStart(7, 'button');
    ɵɵtext(8);
    ɵɵelementEnd();
    ɵɵelementStart(9, 'button');
    ɵɵtext(10);
    ɵɵelementEnd();
    ɵɵelementStart(11, 'button');
    ɵɵtext(12);
    ɵɵelementEnd();
    ɵɵelementStart(13, 'button');
    ɵɵtext(14);
    ɵɵelementEnd();
    ɵɵelementStart(15, 'button');
    ɵɵtext(16);
    ɵɵelementEnd();
    ɵɵelementStart(17, 'button');
    ɵɵtext(18);
    ɵɵelementEnd();
    ɵɵelementStart(19, 'button');
    ɵɵtext(20);
    ɵɵelementEnd();
    ɵɵelementEnd();
  }
  if (rf & 2) {
    ɵɵadvance(2);
    ɵɵtextInterpolate('0');
    ɵɵadvance(2);
    ɵɵtextInterpolate('1');
    ɵɵadvance(2);
    ɵɵtextInterpolate('2');
    ɵɵadvance(2);
    ɵɵtextInterpolate('3');
    ɵɵadvance(2);
    ɵɵtextInterpolate('4');
    ɵɵadvance(2);
    ɵɵtextInterpolate('5');
    ɵɵadvance(2);
    ɵɵtextInterpolate('6');
    ɵɵadvance(2);
    ɵɵtextInterpolate('7');
    ɵɵadvance(2);
    ɵɵtextInterpolate('8');
    ɵɵadvance(2);
    ɵɵtextInterpolate('9');
  }
}


const rootLView =
    setupRootViewWithEmbeddedViews(TestInterpolationComponent_ng_template_0_Template, 21, 10, 1000);
const rootTView = rootLView[TVIEW];

// scenario to benchmark
const interpolationRefresh = createBenchmark('interpolation refresh');
const refreshTime = interpolationRefresh('refresh');

// run change detection in the update mode
console.profile('interpolation_refresh');
while (refreshTime()) {
  refreshView(rootTView, rootLView, null, null);
}
console.profileEnd();

// report results
interpolationRefresh.report();
