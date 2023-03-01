/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {ɵɵadvance, ɵɵdefineDirective, ɵɵelement, ɵɵproperty} from '../../../../src/render3/index';
import {refreshView} from '../../../../src/render3/instructions/shared';
import {RenderFlags} from '../../../../src/render3/interfaces/definition';
import {TVIEW} from '../../../../src/render3/interfaces/view';
import {createBenchmark} from '../micro_bench';
import {setupRootViewWithEmbeddedViews} from '../setup';

class TestDirective {
  // @Input() foo  = 0;
  foo: number = 0;
  // @Input('bar') barPrivate = 0;
  barPrivate: number = 0;
  static ɵfac = () => new TestDirective();
  static ɵdir = ɵɵdefineDirective({
    type: TestDirective,
    selectors: [['', 'dir', '']],
    inputs: {foo: 'foo', barPrivate: ['bar', 'barPrivate']}
  });
}

`<ng-template>
  <div dir [foo]="counter" [bar]="counter"></div>
  <div dir [foo]="counter" [bar]="counter"></div>
  <div dir [foo]="counter" [bar]="counter"></div>
</ng-template>`;
function testTemplate(rf: RenderFlags, ctx: any) {
  if (rf & 1) {
    ɵɵelement(0, 'div', 0);
    ɵɵelement(1, 'div', 0);
    ɵɵelement(2, 'div', 0);
  }
  if (rf & 2) {
    ɵɵproperty('foo', ctx.counter)('bar', ctx.counter);
    ɵɵadvance(1);
    ɵɵproperty('foo', ctx.counter)('bar', ctx.counter);
    ɵɵadvance(1);
    ɵɵproperty('foo', ctx.counter)('bar', ctx.counter);
  }
}

const ctx = {
  counter: 0
};

const rootLView = setupRootViewWithEmbeddedViews(
    testTemplate, 3, 6, 1000, ctx, [['dir', '', 3, 'foo', 'bar']], [TestDirective.ɵdir]);
const rootTView = rootLView[TVIEW];


// scenario to benchmark
const directiveInputs = createBenchmark('directive inputs');
const updateTime = directiveInputs('update');

console.profile('directive_inputs');
while (updateTime()) {
  ctx.counter++;
  refreshView(rootTView, rootLView, null, null);
}
console.profileEnd();

// report results
directiveInputs.report();
