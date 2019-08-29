/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {ɵɵelementEnd, ɵɵelementStart} from '../../../../src/render3/instructions/element';
import {ɵɵselect} from '../../../../src/render3/instructions/select';
import {refreshView} from '../../../../src/render3/instructions/shared';
import {RenderFlags} from '../../../../src/render3/interfaces/definition';
import {TVIEW} from '../../../../src/render3/interfaces/view';
import {ɵɵclassMap, ɵɵstyleMap, ɵɵstyling, ɵɵstylingApply} from '../../../../src/render3/styling_next/instructions';
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
    ɵɵelementStart(1, 'div');
    ɵɵstyling();
    ɵɵelementEnd();
    ɵɵelementStart(2, 'div');
    ɵɵstyling();
    ɵɵelementEnd();
    ɵɵelementStart(3, 'div');
    ɵɵstyling();
    ɵɵelementEnd();
    ɵɵelementStart(4, 'div');
    ɵɵstyling();
    ɵɵelementEnd();
    ɵɵelementStart(5, 'div');
    ɵɵstyling();
    ɵɵelementEnd();
    ɵɵelementStart(6, 'div');
    ɵɵstyling();
    ɵɵelementEnd();
    ɵɵelementStart(7, 'div');
    ɵɵstyling();
    ɵɵelementEnd();
    ɵɵelementStart(8, 'div');
    ɵɵstyling();
    ɵɵelementEnd();
    ɵɵelementStart(9, 'div');
    ɵɵstyling();
    ɵɵelementEnd();
    ɵɵelementStart(10, 'div');
    ɵɵstyling();
    ɵɵelementEnd();
    ɵɵelementEnd();
  }
  if (rf & 2) {
    ɵɵselect(1);
    ɵɵstyleMap({width: '0px', height: '0px'});
    ɵɵclassMap('one two');
    ɵɵstylingApply();
    ɵɵselect(2);
    ɵɵstyleMap({width: '10px', height: '100px'});
    ɵɵclassMap('one two');
    ɵɵstylingApply();
    ɵɵselect(3);
    ɵɵstyleMap({width: '20px', height: '200px'});
    ɵɵclassMap('one two');
    ɵɵstylingApply();
    ɵɵselect(4);
    ɵɵstyleMap({width: '30px', height: '300px'});
    ɵɵclassMap('one two');
    ɵɵstylingApply();
    ɵɵselect(5);
    ɵɵstyleMap({width: '40px', height: '400px'});
    ɵɵclassMap('one two');
    ɵɵstylingApply();
    ɵɵselect(6);
    ɵɵstyleMap({width: '50px', height: '500px'});
    ɵɵclassMap('one two');
    ɵɵstylingApply();
    ɵɵselect(7);
    ɵɵstyleMap({width: '60px', height: '600px'});
    ɵɵclassMap('one two');
    ɵɵstylingApply();
    ɵɵselect(8);
    ɵɵstyleMap({width: '70px', height: '700px'});
    ɵɵclassMap('one two');
    ɵɵstylingApply();
    ɵɵselect(9);
    ɵɵstyleMap({width: '80px', height: '800px'});
    ɵɵclassMap('one two');
    ɵɵstylingApply();
    ɵɵselect(10);
    ɵɵstyleMap({width: '90px', height: '900px'});
    ɵɵclassMap('one two');
    ɵɵstylingApply();
  }
}


const rootLView = setupRootViewWithEmbeddedViews(testTemplate, 11, 10, 1000);
const rootTView = rootLView[TVIEW];

// run change detection in the update mode
console.profile('update');
for (let i = 0; i < 5000; i++) {
  refreshView(rootLView, rootTView, null, null);
}
console.profileEnd();
