/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {OnDestroy} from '@angular/core';

import {ɵɵdefineDirective, ɵɵelement, ɵɵelementEnd, ɵɵelementStart} from '../../../../src/render3/index';
import {createLView, createTNode, createTView} from '../../../../src/render3/instructions/shared';
import {RenderFlags} from '../../../../src/render3/interfaces/definition';
import {TNodeType} from '../../../../src/render3/interfaces/node';
import {LViewFlags, TViewType} from '../../../../src/render3/interfaces/view';
import {destroyLView} from '../../../../src/render3/node_manipulation';
import {createBenchmark} from '../micro_bench';
import {createAndRenderLView} from '../setup';

class ToDestroy implements OnDestroy {
  static ɵfac = () => new ToDestroy();
  static ɵdir = ɵɵdefineDirective({type: ToDestroy, selectors: [['', 'to-destroy', '']]});
  ngOnDestroy() {}
}

`<div>
    <span to-destroy></span>
    <span to-destroy></span>
    <span to-destroy></span>
    <span to-destroy></span>
    <span to-destroy></span>
    <span to-destroy></span>
    <span to-destroy></span>
    <span to-destroy></span>
    <span to-destroy></span>
    <span to-destroy></span>
  </div>`;
function testTemplate(rf: RenderFlags, ctx: any) {
  if (rf & 1) {
    ɵɵelementStart(0, 'div');
    ɵɵelement(1, 'span', 0);
    ɵɵelement(3, 'span', 0);
    ɵɵelement(5, 'span', 0);
    ɵɵelement(7, 'span', 0);
    ɵɵelement(9, 'span', 0);
    ɵɵelement(11, 'span', 0);
    ɵɵelement(13, 'span', 0);
    ɵɵelement(15, 'span', 0);
    ɵɵelement(17, 'span', 0);
    ɵɵelement(19, 'span', 0);
    ɵɵelementEnd();
  }
}

const rootLView = createLView(
    null, createTView(TViewType.Root, null, null, 0, 0, null, null, null, null, null, null), {},
    LViewFlags.IsRoot, null, null, null, null, null, null, null);

const viewTNode = createTNode(null!, null, TNodeType.Element, -1, null, null);
const embeddedTView = createTView(
    TViewType.Embedded, null, testTemplate, 21, 10, [ToDestroy.ɵdir], null, null, null,
    [['to-destroy']], null);

// create view once so we don't profile the first create pass
createAndRenderLView(rootLView, embeddedTView, viewTNode);

// scenario to benchmark
const viewDestroy = createBenchmark('view destroy hook');
const runBenchmark = viewDestroy('create');

console.profile('view_destroy_hook');
while (runBenchmark()) {
  const currentView = createAndRenderLView(rootLView, embeddedTView, viewTNode);
  destroyLView(embeddedTView, currentView);
}
console.profileEnd();

// report results
viewDestroy.report();
