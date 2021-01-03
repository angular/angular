/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {ɵɵadvance} from '../../../../src/render3/instructions/advance';
import {ɵɵelement, ɵɵelementEnd, ɵɵelementStart} from '../../../../src/render3/instructions/element';
import {ɵɵproperty} from '../../../../src/render3/instructions/property';
import {refreshView} from '../../../../src/render3/instructions/shared';
import {RenderFlags} from '../../../../src/render3/interfaces/definition';
import {TVIEW} from '../../../../src/render3/interfaces/view';
import {createBenchmark} from '../micro_bench';
import {setupRootViewWithEmbeddedViews} from '../setup';

`<div>
    <button [title]="'title1'"></button>
    <button [title]="'title2'"></button>
    <button [title]="'title3'"></button>
    <button [title]="'title4'"></button>
    <button [title]="'title5'"></button>
    <button [title]="'title6'"></button>
    <button [title]="'title7'"></button>
    <button [title]="'title8'"></button>
    <button [title]="'title9'"></button>
    <button [title]="'title10'"></button>
  </div>
</ng-template>`;
function TestInterpolationComponent_ng_template_0_Template(rf: RenderFlags, ctx: any) {
  if (rf & 1) {
    ɵɵelementStart(0, 'div');
    ɵɵelement(1, 'button');
    ɵɵelement(2, 'button');
    ɵɵelement(3, 'button');
    ɵɵelement(4, 'button');
    ɵɵelement(5, 'button');
    ɵɵelement(6, 'button');
    ɵɵelement(7, 'button');
    ɵɵelement(8, 'button');
    ɵɵelement(9, 'button');
    ɵɵelement(10, 'button');
    ɵɵelementEnd();
  }
  if (rf & 2) {
    ɵɵadvance(1);
    ɵɵproperty('title', 'title1');
    ɵɵadvance(1);
    ɵɵproperty('title', 'title2');
    ɵɵadvance(1);
    ɵɵproperty('title', 'title3');
    ɵɵadvance(1);
    ɵɵproperty('title', 'title4');
    ɵɵadvance(1);
    ɵɵproperty('title', 'title5');
    ɵɵadvance(1);
    ɵɵproperty('title', 'title6');
    ɵɵadvance(1);
    ɵɵproperty('title', 'title7');
    ɵɵadvance(1);
    ɵɵproperty('title', 'title8');
    ɵɵadvance(1);
    ɵɵproperty('title', 'title9');
    ɵɵadvance(1);
    ɵɵproperty('title', 'title10');
  }
}


const rootLView =
    setupRootViewWithEmbeddedViews(TestInterpolationComponent_ng_template_0_Template, 11, 10, 1000);
const rootTView = rootLView[TVIEW];

// scenario to benchmark
const propertyBindingRefresh = createBenchmark('property binding refresh');
const refreshTime = propertyBindingRefresh('refresh');

// run change detection in the update mode
console.profile('property_binding_refresh');
while (refreshTime()) {
  refreshView(rootTView, rootLView, null, null);
}
console.profileEnd();

// report results
propertyBindingRefresh.report();
