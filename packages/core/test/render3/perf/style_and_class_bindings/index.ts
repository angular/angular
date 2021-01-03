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
import {ɵɵclassProp, ɵɵstyleProp} from '../../../../src/render3/instructions/styling';
import {RenderFlags} from '../../../../src/render3/interfaces/definition';
import {AttributeMarker} from '../../../../src/render3/interfaces/node';
import {TVIEW} from '../../../../src/render3/interfaces/view';
import {createBenchmark} from '../micro_bench';
import {setupRootViewWithEmbeddedViews} from '../setup';

`<ng-template>
  <div class="list">
    <div class="item" style="width:50px" [class.scale]="true" [style.width]="'0px'"></div>
    <div class="item" style="width:50px" [class.scale]="true" [style.width]="'100px'"></div>
    <div class="item" style="width:50px" [class.scale]="true" [style.width]="'200px'"></div>
    <div class="item" style="width:50px" [class.scale]="true" [style.width]="'300px'"></div>
    <div class="item" style="width:50px" [class.scale]="true" [style.width]="'400px'"></div>
    <div class="item" style="width:50px" [class.scale]="true" [style.width]="'500px'"></div>
    <div class="item" style="width:50px" [class.scale]="true" [style.width]="'600px'"></div>
    <div class="item" style="width:50px" [class.scale]="true" [style.width]="'700px'"></div>
    <div class="item" style="width:50px" [class.scale]="true" [style.width]="'800px'"></div>
    <div class="item" style="width:50px" [class.scale]="true" [style.width]="'900px'"></div>
  </div>
</ng-template>`;
function testTemplate(rf: RenderFlags, ctx: any) {
  if (rf & 1) {
    ɵɵelementStart(0, 'div', 0);
    ɵɵelement(1, 'div', 1);
    ɵɵelement(2, 'div', 1);
    ɵɵelement(3, 'div', 1);
    ɵɵelement(4, 'div', 1);
    ɵɵelement(5, 'div', 1);
    ɵɵelement(6, 'div', 1);
    ɵɵelement(7, 'div', 1);
    ɵɵelement(8, 'div', 1);
    ɵɵelement(9, 'div', 1);
    ɵɵelement(10, 'div', 1);
    ɵɵelementEnd();
  }
  if (rf & 2) {
    ɵɵadvance(1);
    ɵɵstyleProp('width', '0px');
    ɵɵclassProp('scale', true);
    ɵɵadvance(1);
    ɵɵstyleProp('width', '100px');
    ɵɵclassProp('scale', true);
    ɵɵadvance(1);
    ɵɵstyleProp('width', '200px');
    ɵɵclassProp('scale', true);
    ɵɵadvance(1);
    ɵɵstyleProp('width', '300px');
    ɵɵclassProp('scale', true);
    ɵɵadvance(1);
    ɵɵstyleProp('width', '400px');
    ɵɵclassProp('scale', true);
    ɵɵadvance(1);
    ɵɵstyleProp('width', '500px');
    ɵɵclassProp('scale', true);
    ɵɵadvance(1);
    ɵɵstyleProp('width', '600px');
    ɵɵclassProp('scale', true);
    ɵɵadvance(1);
    ɵɵstyleProp('width', '700px');
    ɵɵclassProp('scale', true);
    ɵɵadvance(1);
    ɵɵstyleProp('width', '800px');
    ɵɵclassProp('scale', true);
    ɵɵadvance(1);
    ɵɵstyleProp('width', '900px');
    ɵɵclassProp('scale', true);
  }
}


const rootLView = setupRootViewWithEmbeddedViews(testTemplate, 11, 10, 1000, undefined, [
  [AttributeMarker.Classes, 'list'],
  [AttributeMarker.Classes, 'item', AttributeMarker.Styles, 'width', '50px']
]);
const rootTView = rootLView[TVIEW];

// scenario to benchmark
const styleAndClassBindingBenchmark = createBenchmark('style and class binding');
const refreshTime = styleAndClassBindingBenchmark('refresh');

// run change detection in the update mode
console.profile('style_and_class_binding_refresh');
while (refreshTime()) {
  refreshView(rootTView, rootLView, null, null);
}
console.profileEnd();

// report results
styleAndClassBindingBenchmark.report();
