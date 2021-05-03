/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {ɵɵelementEnd, ɵɵelementStart} from '../../../../src/render3/instructions/element';
import {ɵɵlistener} from '../../../../src/render3/instructions/listener';
import {createLView, createTNode, createTView} from '../../../../src/render3/instructions/shared';
import {RenderFlags} from '../../../../src/render3/interfaces/definition';
import {TNodeType} from '../../../../src/render3/interfaces/node';
import {LViewFlags, TViewType} from '../../../../src/render3/interfaces/view';
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
function testTemplate(rf: RenderFlags, ctx: any) {
  if (rf & 1) {
    ɵɵelementStart(0, 'div');
    ɵɵelementStart(1, 'button', 0);
    ɵɵlistener('click', function clickListener() {})('input', function inputListener() {});
    ɵɵelementEnd();
    ɵɵelementStart(2, 'button', 0);
    ɵɵlistener('click', function clickListener() {})('input', function inputListener() {});
    ɵɵelementEnd();
    ɵɵelementStart(3, 'button', 0);
    ɵɵlistener('click', function clickListener() {})('input', function inputListener() {});
    ɵɵelementEnd();
    ɵɵelementStart(4, 'button', 0);
    ɵɵlistener('click', function clickListener() {})('input', function inputListener() {});
    ɵɵelementEnd();
    ɵɵelementStart(5, 'button', 0);
    ɵɵlistener('click', function clickListener() {})('input', function inputListener() {});
    ɵɵelementEnd();
    ɵɵelementStart(6, 'button', 0);
    ɵɵlistener('click', function clickListener() {})('input', function inputListener() {});
    ɵɵelementEnd();
    ɵɵelementStart(7, 'button', 0);
    ɵɵlistener('click', function clickListener() {})('input', function inputListener() {});
    ɵɵelementEnd();
    ɵɵelementStart(8, 'button', 0);
    ɵɵlistener('click', function clickListener() {})('input', function inputListener() {});
    ɵɵelementEnd();
    ɵɵelementStart(9, 'button', 0);
    ɵɵlistener('click', function clickListener() {})('input', function inputListener() {});
    ɵɵelementEnd();
    ɵɵelementStart(10, 'button', 0);
    ɵɵlistener('click', function clickListener() {})('input', function inputListener() {});
    ɵɵelementEnd();
    ɵɵelementEnd();
  }
}

const rootLView = createLView(
    null, createTView(TViewType.Root, null, null, 0, 0, null, null, null, null, null), {},
    LViewFlags.IsRoot, null, null, null, null, null, null);

const viewTNode = createTNode(null!, null, TNodeType.Element, -1, null, null);
const embeddedTView = createTView(
    TViewType.Embedded, null, testTemplate, 11, 0, null, null, null, null, [[3, 'click', 'input']]);

// create view once so we don't profile the first create pass
createAndRenderLView(rootLView, embeddedTView, viewTNode);

const listenersCreate = createBenchmark('listeners create');
const createTime = listenersCreate('create');

// profile create views (run templates in creation mode)
console.profile('create listeners');
while (createTime()) {
  createAndRenderLView(rootLView, embeddedTView, viewTNode);
}
console.profileEnd();

// report results
listenersCreate.report();
