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
function TestInterpolationComponent_ng_template_0_Template(rf: RenderFlags, ctx: {value: string}) {
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
    ɵɵproperty('prop1', ctx.value);
    ɵɵadvance(1);
    ɵɵproperty('prop2', ctx.value);
    ɵɵadvance(1);
    ɵɵproperty('prop3', ctx.value);
    ɵɵadvance(1);
    ɵɵproperty('prop4', ctx.value);
    ɵɵadvance(1);
    ɵɵproperty('prop5', ctx.value);
    ɵɵadvance(1);
    ɵɵproperty('prop6', ctx.value);
    ɵɵadvance(1);
    ɵɵproperty('prop7', ctx.value);
    ɵɵadvance(1);
    ɵɵproperty('prop8', ctx.value);
    ɵɵadvance(1);
    ɵɵproperty('prop9', ctx.value);
    ɵɵadvance(1);
    ɵɵproperty('prop10', ctx.value);
  }
}

const ctx = {
  value: 'value'
};

const rootLView = setupRootViewWithEmbeddedViews(
    TestInterpolationComponent_ng_template_0_Template, 11, 10, 1000, ctx);
const rootTView = rootLView[TVIEW];


// scenario to benchmark
const propertyBindingBenchmark = createBenchmark('property binding');
const updateTime = propertyBindingBenchmark('update');

// run change detection where each binding value changes
console.profile('element property update');
let i = 0;
while (updateTime()) {
  ctx.value = `value${i++}`;
  refreshView(rootTView, rootLView, null, ctx);
}
console.profileEnd();

propertyBindingBenchmark.report();
