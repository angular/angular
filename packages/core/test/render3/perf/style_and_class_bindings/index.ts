/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {ɵɵadvance} from '../../../../src/render3/instructions/advance';
import {ɵɵelementEnd, ɵɵelementStart} from '../../../../src/render3/instructions/element';
import {refreshView} from '../../../../src/render3/instructions/shared';
import {RenderFlags} from '../../../../src/render3/interfaces/definition';
import {AttributeMarker} from '../../../../src/render3/interfaces/node';
import {TVIEW} from '../../../../src/render3/interfaces/view';
import {ɵɵclassProp, ɵɵstyleProp, ɵɵstyling, ɵɵstylingApply} from '../../../../src/render3/styling_next/instructions';
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
    ɵɵelementStart(0, 'div', [AttributeMarker.Classes, 'list']);
    ɵɵelementStart(
        1, 'div', [AttributeMarker.Classes, 'item', AttributeMarker.Styles, 'width', '50px']);
    ɵɵstyling();
    ɵɵelementEnd();
    ɵɵelementStart(
        2, 'div', [AttributeMarker.Classes, 'item', AttributeMarker.Styles, 'width', '50px']);
    ɵɵstyling();
    ɵɵelementEnd();
    ɵɵelementStart(
        3, 'div', [AttributeMarker.Classes, 'item', AttributeMarker.Styles, 'width', '50px']);
    ɵɵstyling();
    ɵɵelementEnd();
    ɵɵelementStart(
        4, 'div', [AttributeMarker.Classes, 'item', AttributeMarker.Styles, 'width', '50px']);
    ɵɵstyling();
    ɵɵelementEnd();
    ɵɵelementStart(
        5, 'div', [AttributeMarker.Classes, 'item', AttributeMarker.Styles, 'width', '50px']);
    ɵɵstyling();
    ɵɵelementEnd();
    ɵɵelementStart(
        6, 'div', [AttributeMarker.Classes, 'item', AttributeMarker.Styles, 'width', '50px']);
    ɵɵstyling();
    ɵɵelementEnd();
    ɵɵelementStart(
        7, 'div', [AttributeMarker.Classes, 'item', AttributeMarker.Styles, 'width', '50px']);
    ɵɵstyling();
    ɵɵelementEnd();
    ɵɵelementStart(
        8, 'div', [AttributeMarker.Classes, 'item', AttributeMarker.Styles, 'width', '50px']);
    ɵɵstyling();
    ɵɵelementEnd();
    ɵɵelementStart(
        9, 'div', [AttributeMarker.Classes, 'item', AttributeMarker.Styles, 'width', '50px']);
    ɵɵstyling();
    ɵɵelementEnd();
    ɵɵelementStart(
        10, 'div', [AttributeMarker.Classes, 'item', AttributeMarker.Styles, 'width', '50px']);
    ɵɵstyling();
    ɵɵelementEnd();
    ɵɵelementEnd();
  }
  if (rf & 2) {
    ɵɵadvance(1);
    ɵɵstyleProp('width', '0px');
    ɵɵclassProp('scale', true);
    ɵɵstylingApply();
    ɵɵadvance(1);
    ɵɵstyleProp('width', '100px');
    ɵɵclassProp('scale', true);
    ɵɵstylingApply();
    ɵɵadvance(1);
    ɵɵstyleProp('width', '200px');
    ɵɵclassProp('scale', true);
    ɵɵstylingApply();
    ɵɵadvance(1);
    ɵɵstyleProp('width', '300px');
    ɵɵclassProp('scale', true);
    ɵɵstylingApply();
    ɵɵadvance(1);
    ɵɵstyleProp('width', '400px');
    ɵɵclassProp('scale', true);
    ɵɵstylingApply();
    ɵɵadvance(1);
    ɵɵstyleProp('width', '500px');
    ɵɵclassProp('scale', true);
    ɵɵstylingApply();
    ɵɵadvance(1);
    ɵɵstyleProp('width', '600px');
    ɵɵclassProp('scale', true);
    ɵɵstylingApply();
    ɵɵadvance(1);
    ɵɵstyleProp('width', '700px');
    ɵɵclassProp('scale', true);
    ɵɵstylingApply();
    ɵɵadvance(1);
    ɵɵstyleProp('width', '800px');
    ɵɵclassProp('scale', true);
    ɵɵstylingApply();
    ɵɵadvance(1);
    ɵɵstyleProp('width', '900px');
    ɵɵclassProp('scale', true);
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
