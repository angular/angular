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
import {ɵɵclassMap, ɵɵstyleMap} from '../../../../src/render3/instructions/styling';
import {RenderFlags} from '../../../../src/render3/interfaces/definition';
import {TVIEW} from '../../../../src/render3/interfaces/view';
import {createBenchmark} from '../micro_bench';
import {setupRootViewWithEmbeddedViews} from '../setup';

`<ng-template>
  <div>
    <div [style]="{width:'0px', height: '100px'}" [class]="'one two'"></div>
    <div [style]="{width:'10px', height: '200px'}" [class]="'one two'"></div>
    <div [style]="{width:'20px', height: '300px'}" [class]="'one two'"></div>
    <div [style]="{width:'30px', height: '400px'}" [class]="'one two'"></div>
    <div [style]="{width:'40px', height: '500px'}" [class]="'one two'"></div>
    <div [style]="{width:'50px', height: '600px'}" [class]="'one two'"></div>
    <div [style]="{width:'60px', height: '700px'}" [class]="'one two'"></div>
    <div [style]="{width:'70px', height: '800px'}" [class]="'one two'"></div>
    <div [style]="{width:'80px', height: '900px'}" [class]="'one two'"></div>
    <div [style]="{width:'90px', height: '1000px'}" [class]="'one two'"></div>
  </div>
</ng-template>`;
function testTemplate(rf: RenderFlags, ctx: any) {
  if (rf & 1) {
    ɵɵelementStart(0, 'div');
    ɵɵelement(1, 'div');
    ɵɵelement(2, 'div');
    ɵɵelement(3, 'div');
    ɵɵelement(4, 'div');
    ɵɵelement(5, 'div');
    ɵɵelement(6, 'div');
    ɵɵelement(7, 'div');
    ɵɵelement(8, 'div');
    ɵɵelement(9, 'div');
    ɵɵelement(10, 'div');
    ɵɵelementEnd();
  }
  if (rf & 2) {
    ɵɵadvance(1);
    ɵɵstyleMap({width: '0px', height: '0px'});
    ɵɵclassMap('one two');
    ɵɵadvance(1);
    ɵɵstyleMap({width: '10px', height: '100px'});
    ɵɵclassMap('one two');
    ɵɵadvance(1);
    ɵɵstyleMap({width: '20px', height: '200px'});
    ɵɵclassMap('one two');
    ɵɵadvance(1);
    ɵɵstyleMap({width: '30px', height: '300px'});
    ɵɵclassMap('one two');
    ɵɵadvance(1);
    ɵɵstyleMap({width: '40px', height: '400px'});
    ɵɵclassMap('one two');
    ɵɵadvance(1);
    ɵɵstyleMap({width: '50px', height: '500px'});
    ɵɵclassMap('one two');
    ɵɵadvance(1);
    ɵɵstyleMap({width: '60px', height: '600px'});
    ɵɵclassMap('one two');
    ɵɵadvance(1);
    ɵɵstyleMap({width: '70px', height: '700px'});
    ɵɵclassMap('one two');
    ɵɵadvance(1);
    ɵɵstyleMap({width: '80px', height: '800px'});
    ɵɵclassMap('one two');
    ɵɵadvance(1);
    ɵɵstyleMap({width: '90px', height: '900px'});
    ɵɵclassMap('one two');
  }
}


const rootLView = setupRootViewWithEmbeddedViews(testTemplate, 11, 40, 1000);
const rootTView = rootLView[TVIEW];

// scenario to benchmark
const styleAndClassBindingMapBenchmark = createBenchmark('style and class map binding');
const refreshTime = styleAndClassBindingMapBenchmark('refresh');

// run change detection in the update mode
console.profile('style_and_class_map_binding_refresh');
while (refreshTime()) {
  refreshView(rootTView, rootLView, null, null);
}
console.profileEnd();

// report results
styleAndClassBindingMapBenchmark.report();
