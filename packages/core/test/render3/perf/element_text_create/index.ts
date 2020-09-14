/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {ɵɵelementEnd, ɵɵelementStart} from '../../../../src/render3/instructions/element';
import {createLView, createTNode, createTView} from '../../../../src/render3/instructions/shared';
import {ɵɵtext} from '../../../../src/render3/instructions/text';
import {RenderFlags} from '../../../../src/render3/interfaces/definition';
import {TNodeType} from '../../../../src/render3/interfaces/node';
import {LViewFlags, TViewType} from '../../../../src/render3/interfaces/view';
import {createBenchmark} from '../micro_bench';
import {createAndRenderLView} from '../setup';

`<div>
    <button name1="value1" name2="value2" name3="value3" name4="value4" name5="value5">0</button>
    <button name1="value1" name2="value2" name3="value3" name4="value4" name5="value5>1</button>
    <button name1="value1" name2="value2" name3="value3" name4="value4" name5="value5>2</button>
    <button name1="value1" name2="value2" name3="value3" name4="value4" name5="value5>3</button>
    <button name1="value1" name2="value2" name3="value3" name4="value4" name5="value5>4</button>
    <button name1="value1" name2="value2" name3="value3" name4="value4" name5="value5>5</button>
    <button name1="value1" name2="value2" name3="value3" name4="value4" name5="value5>6</button>
    <button name1="value1" name2="value2" name3="value3" name4="value4" name5="value5>7</button>
    <button name1="value1" name2="value2" name3="value3" name4="value4" name5="value5>8</button>
    <button name1="value1" name2="value2" name3="value3" name4="value4" name5="value5>9</button>
  </div>`;
function testTemplate(rf: RenderFlags, ctx: any) {
  if (rf & 1) {
    ɵɵelementStart(0, 'div');
    ɵɵelementStart(1, 'button', 0);
    ɵɵtext(2, '0');
    ɵɵelementEnd();
    ɵɵelementStart(3, 'button', 0);
    ɵɵtext(4, '1');
    ɵɵelementEnd();
    ɵɵelementStart(5, 'button', 0);
    ɵɵtext(6, '2');
    ɵɵelementEnd();
    ɵɵelementStart(7, 'button', 0);
    ɵɵtext(8, '3');
    ɵɵelementEnd();
    ɵɵelementStart(9, 'button', 0);
    ɵɵtext(10, '4');
    ɵɵelementEnd();
    ɵɵelementStart(11, 'button', 0);
    ɵɵtext(12, '5');
    ɵɵelementEnd();
    ɵɵelementStart(13, 'button', 0);
    ɵɵtext(14, '6');
    ɵɵelementEnd();
    ɵɵelementStart(15, 'button', 0);
    ɵɵtext(16, '7');
    ɵɵelementEnd();
    ɵɵelementStart(17, 'button', 0);
    ɵɵtext(18, '8');
    ɵɵelementEnd();
    ɵɵelementStart(19, 'button', 0);
    ɵɵtext(20, '9');
    ɵɵelementEnd();
    ɵɵelementEnd();
  }
}

const rootLView = createLView(
    null, createTView(TViewType.Root, null, null, 0, 0, null, null, null, null, null), {},
    LViewFlags.IsRoot, null, null, null, null, null, null);

const viewTNode = createTNode(null!, null, TNodeType.Element, -1, null, null);
const embeddedTView = createTView(
    TViewType.Embedded, null, testTemplate, 21, 0, null, null, null, null, [[
      'name1', 'value1', 'name2', 'value2', 'name3', 'value3', 'name4', 'value4', 'name5', 'value5'
    ]]);

// create view once so we don't profile the first create pass
createAndRenderLView(rootLView, embeddedTView, viewTNode);

// scenario to benchmark
const elementTextCreate = createBenchmark('element and text create');
const createTime = elementTextCreate('create');

console.profile('element_text_create');
while (createTime()) {
  createAndRenderLView(rootLView, embeddedTView, viewTNode);
}
console.profileEnd();

// report results
elementTextCreate.report();
