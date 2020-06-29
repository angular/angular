/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {ɵɵadvance} from '../../../../src/render3/instructions/advance';
import {ɵɵelement, ɵɵelementEnd, ɵɵelementStart} from '../../../../src/render3/instructions/element';
import {refreshView} from '../../../../src/render3/instructions/shared';
import {ɵɵstyleProp} from '../../../../src/render3/instructions/styling';
import {RenderFlags} from '../../../../src/render3/interfaces/definition';
import {TVIEW} from '../../../../src/render3/interfaces/view';
import {createBenchmark} from '../micro_bench';
import {setupRootViewWithEmbeddedViews} from '../setup';

`<ng-template>
  <div>
    <button [style.backgroundColor]="'color1'"></button>
    <button [style.backgroundColor]="'color2'"></button>
    <button [style.backgroundColor]="'color3'"></button>
    <button [style.backgroundColor]="'color4'"></button>
    <button [style.backgroundColor]="'color5'"></button>
    <button [style.backgroundColor]="'color6'"></button>
    <button [style.backgroundColor]="'color7'"></button>
    <button [style.backgroundColor]="'color8'"></button>
    <button [style.backgroundColor]="'color9'"></button>
    <button [style.backgroundColor]="'color10'"></button>
  </div>
</ng-template>`;
function testTemplate(rf: RenderFlags, ctx: any) {
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
    ɵɵstyleProp('background-color', 'color1');
    ɵɵadvance(1);
    ɵɵstyleProp('background-color', 'color2');
    ɵɵadvance(1);
    ɵɵstyleProp('background-color', 'color3');
    ɵɵadvance(1);
    ɵɵstyleProp('background-color', 'color4');
    ɵɵadvance(1);
    ɵɵstyleProp('background-color', 'color5');
    ɵɵadvance(1);
    ɵɵstyleProp('background-color', 'color6');
    ɵɵadvance(1);
    ɵɵstyleProp('background-color', 'color7');
    ɵɵadvance(1);
    ɵɵstyleProp('background-color', 'color8');
    ɵɵadvance(1);
    ɵɵstyleProp('background-color', 'color9');
    ɵɵadvance(1);
    ɵɵstyleProp('background-color', 'color10');
  }
}


const rootLView = setupRootViewWithEmbeddedViews(testTemplate, 11, 10, 1000);
const rootTView = rootLView[TVIEW];

// scenario to benchmark
const styleBindingBenchmark = createBenchmark('style binding');
const refreshTime = styleBindingBenchmark('refresh');

// run change detection in the update mode
console.profile('style_binding_refresh');
while (refreshTime()) {
  refreshView(rootTView, rootLView, null, null);
}
console.profileEnd();

// report results
styleBindingBenchmark.report();
