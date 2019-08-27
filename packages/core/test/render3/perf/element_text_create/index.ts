/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {ɵɵelementEnd, ɵɵelementStart} from '../../../../src/render3/instructions/element';
import {createTNode, createTView} from '../../../../src/render3/instructions/shared';
import {ɵɵtext} from '../../../../src/render3/instructions/text';
import {RenderFlags} from '../../../../src/render3/interfaces/definition';
import {TNodeType, TViewNode} from '../../../../src/render3/interfaces/node';
import {createAndRenderLView} from '../setup';

`<div>
    <button>0</button>
    <button>1</button>
    <button>2</button>
    <button>3</button>
    <button>4</button>
    <button>5</button>
    <button>6</button>
    <button>7</button>
    <button>8</button>
    <button>9</button>
  </div>
</ng-template>`;
function testTemplate(rf: RenderFlags, ctx: any) {
  if (rf & 1) {
    ɵɵelementStart(0, 'div');
    ɵɵelementStart(1, 'button');
    ɵɵtext(2, '0');
    ɵɵelementEnd();
    ɵɵelementStart(3, 'button');
    ɵɵtext(4, '1');
    ɵɵelementEnd();
    ɵɵelementStart(5, 'button');
    ɵɵtext(6, '2');
    ɵɵelementEnd();
    ɵɵelementStart(7, 'button');
    ɵɵtext(8, '3');
    ɵɵelementEnd();
    ɵɵelementStart(9, 'button');
    ɵɵtext(10, '4');
    ɵɵelementEnd();
    ɵɵelementStart(11, 'button');
    ɵɵtext(12, '5');
    ɵɵelementEnd();
    ɵɵelementStart(13, 'button');
    ɵɵtext(14, '6');
    ɵɵelementEnd();
    ɵɵelementStart(15, 'button');
    ɵɵtext(16, '7');
    ɵɵelementEnd();
    ɵɵelementStart(17, 'button');
    ɵɵtext(18, '8');
    ɵɵelementEnd();
    ɵɵelementStart(19, 'button');
    ɵɵtext(20, '9');
    ɵɵelementEnd();
    ɵɵelementEnd();
  }
}

const viewTNode = createTNode(null !, null, TNodeType.View, -1, null, null) as TViewNode;
const embeddedTView = createTView(-1, testTemplate, 21, 0, null, null, null, null);

// create view once so we don't profile first template pass
createAndRenderLView(null, embeddedTView, viewTNode);

// profile create views (run templates in creation mode)
console.profile('create');
for (let i = 0; i < 500000; i++) {
  createAndRenderLView(null, embeddedTView, viewTNode);
}
console.profileEnd();