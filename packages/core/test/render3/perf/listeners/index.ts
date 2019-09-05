/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {ɵɵelementEnd, ɵɵelementStart} from '../../../../src/render3/instructions/element';
import {ɵɵlistener} from '../../../../src/render3/instructions/listener';
import {createTNode, createTView} from '../../../../src/render3/instructions/shared';
import {RenderFlags} from '../../../../src/render3/interfaces/definition';
import {TNodeType, TViewNode} from '../../../../src/render3/interfaces/node';
import {resetComponentState} from '../../../../src/render3/state';
import {createBenchmark} from '../micro_bench';
import {createAndRenderLView} from '../setup';

`
<div>
  <button (click)="clickListener()" (input)="inputListener()"></button>
  <button (click)="clickListener()" (input)="inputListener()"></button>
  <button (click)="clickListener()" (input)="inputListener()"></button>
  <button (click)="clickListener()" (input)="inputListener()"></button>
  <button (click)="clickListener()" (input)="inputListener()"></button>
  <button (click)="clickListener()" (input)="inputListener()"></button>
  <button (click)="clickListener()" (input)="inputListener()"></button>
  <button (click)="clickListener()" (input)="inputListener()"></button>
  <button (click)="clickListener()" (input)="inputListener()"></button>
  <button (click)="clickListener()" (input)="inputListener()"></button>
</div>
`;
const _c0 = [3, 'click', 'input'];
function testTemplate(rf: RenderFlags, ctx: any) {
  if (rf & 1) {
    ɵɵelementStart(0, 'div');
    ɵɵelementStart(1, 'button', _c0);
    ɵɵlistener('click', function clickListener() {});
    ɵɵlistener('input', function inputListener() {});
    ɵɵelementEnd();
    ɵɵelementStart(2, 'button', _c0);
    ɵɵlistener('click', function clickListener() {});
    ɵɵlistener('input', function inputListener() {});
    ɵɵelementEnd();
    ɵɵelementStart(3, 'button', _c0);
    ɵɵlistener('click', function clickListener() {});
    ɵɵlistener('input', function inputListener() {});
    ɵɵelementEnd();
    ɵɵelementStart(4, 'button', _c0);
    ɵɵlistener('click', function clickListener() {});
    ɵɵlistener('input', function inputListener() {});
    ɵɵelementEnd();
    ɵɵelementStart(5, 'button', _c0);
    ɵɵlistener('click', function clickListener() {});
    ɵɵlistener('input', function inputListener() {});
    ɵɵelementEnd();
    ɵɵelementStart(6, 'button', _c0);
    ɵɵlistener('click', function clickListener() {});
    ɵɵlistener('input', function inputListener() {});
    ɵɵelementEnd();
    ɵɵelementStart(7, 'button', _c0);
    ɵɵlistener('click', function clickListener() {});
    ɵɵlistener('input', function inputListener() {});
    ɵɵelementEnd();
    ɵɵelementStart(8, 'button', _c0);
    ɵɵlistener('click', function clickListener() {});
    ɵɵlistener('input', function inputListener() {});
    ɵɵelementEnd();
    ɵɵelementStart(9, 'button', _c0);
    ɵɵlistener('click', function clickListener() {});
    ɵɵlistener('input', function inputListener() {});
    ɵɵelementEnd();
    ɵɵelementStart(10, 'button', _c0);
    ɵɵlistener('click', function clickListener() {});
    ɵɵlistener('input', function inputListener() {});
    ɵɵelementEnd();
    ɵɵelementEnd();
  }
}

const viewTNode = createTNode(null !, null, TNodeType.View, -1, null, null) as TViewNode;
const embeddedTView = createTView(-1, testTemplate, 11, 0, null, null, null, null);

// initialize global state
resetComponentState();

// create view once so we don't profile first template pass
createAndRenderLView(null, embeddedTView, viewTNode);

const listenersCreate = createBenchmark('listeners create', 500000, 20);
const createTime = listenersCreate('create');

// profile create views (run templates in creation mode)
console.profile('create listeners');
while (createTime.run()) {
  while (createTime()) {
    createAndRenderLView(null, embeddedTView, viewTNode);
  }
}
console.profileEnd();

// report results
listenersCreate.report();