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
import {ɵɵstyleProp, ɵɵstyling, ɵɵstylingApply} from '../../../../src/render3/styling_next/instructions';
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
    ɵɵelementStart(1, 'button');
    ɵɵstyling();
    ɵɵelementEnd();
    ɵɵelementStart(2, 'button');
    ɵɵstyling();
    ɵɵelementEnd();
    ɵɵelementStart(3, 'button');
    ɵɵstyling();
    ɵɵelementEnd();
    ɵɵelementStart(4, 'button');
    ɵɵstyling();
    ɵɵelementEnd();
    ɵɵelementStart(5, 'button');
    ɵɵstyling();
    ɵɵelementEnd();
    ɵɵelementStart(6, 'button');
    ɵɵstyling();
    ɵɵelementEnd();
    ɵɵelementStart(7, 'button');
    ɵɵstyling();
    ɵɵelementEnd();
    ɵɵelementStart(8, 'button');
    ɵɵstyling();
    ɵɵelementEnd();
    ɵɵelementStart(9, 'button');
    ɵɵstyling();
    ɵɵelementEnd();
    ɵɵelementStart(10, 'button');
    ɵɵstyling();
    ɵɵelementEnd();
    ɵɵelementEnd();
  }
  if (rf & 2) {
    ɵɵselect(1);
    ɵɵstyleProp('background-color', 'color1');
    ɵɵstylingApply();
    ɵɵselect(2);
    ɵɵstyleProp('background-color', 'color2');
    ɵɵstylingApply();
    ɵɵselect(3);
    ɵɵstyleProp('background-color', 'color3');
    ɵɵstylingApply();
    ɵɵselect(4);
    ɵɵstyleProp('background-color', 'color4');
    ɵɵstylingApply();
    ɵɵselect(5);
    ɵɵstyleProp('background-color', 'color5');
    ɵɵstylingApply();
    ɵɵselect(6);
    ɵɵstyleProp('background-color', 'color6');
    ɵɵstylingApply();
    ɵɵselect(7);
    ɵɵstyleProp('background-color', 'color7');
    ɵɵstylingApply();
    ɵɵselect(8);
    ɵɵstyleProp('background-color', 'color8');
    ɵɵstylingApply();
    ɵɵselect(9);
    ɵɵstyleProp('background-color', 'color9');
    ɵɵstylingApply();
    ɵɵselect(10);
    ɵɵstyleProp('background-color', 'color10');
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