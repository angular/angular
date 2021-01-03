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
import {ɵɵclassProp, ɵɵstyleProp} from '../../../../src/render3/instructions/styling';
import {RenderFlags} from '../../../../src/render3/interfaces/definition';
import {TVIEW} from '../../../../src/render3/interfaces/view';
import {createBenchmark} from '../micro_bench';
import {setupRootViewWithEmbeddedViews} from '../setup';
import {defineBenchmarkTestDirective} from '../shared';

`<ng-template>
  <section>
    <div [style.width]="'width1'"
         [class.foo]="'foo1'"
         dir-that-sets-width
         dir-that-sets-foo-class></div>

    <div [style.width]="'width2'"
         [class.foo]="'foo2'"
         dir-that-sets-width
         dir-that-sets-foo-class></div>

    <div [style.width]="'width3'"
         [class.foo]="'foo3'"
         dir-that-sets-width
         dir-that-sets-foo-class></div>

    <div [style.width]="'width4'"
         [class.foo]="'foo4'"
         dir-that-sets-width
         dir-that-sets-foo-class></div>

    <div [style.width]="'width5'"
         [class.foo]="'foo5'"
         dir-that-sets-width
         dir-that-sets-foo-class></div>

    <div [style.width]="'width6'"
         [class.foo]="'foo6'"
         dir-that-sets-width
         dir-that-sets-foo-class></div>

    <div [style.width]="'width7'"
         [class.foo]="'foo7'"
         dir-that-sets-width
         dir-that-sets-foo-class></div>

    <div [style.width]="'width8'"
         [class.foo]="'foo8'"
         dir-that-sets-width
         dir-that-sets-foo-class></div>

    <div [style.width]="'width9'"
         [class.foo]="'foo9'"
         dir-that-sets-width
         dir-that-sets-foo-class></div>

    <div [style.width]="'width10'"
         [class.foo]="'foo10'"
         dir-that-sets-width
         dir-that-sets-foo-class></div>
  </section>
</ng-template>`;
function testTemplate(rf: RenderFlags, ctx: any) {
  if (rf & 1) {
    ɵɵelementStart(0, 'section');
    ɵɵelement(1, 'div', 0);
    ɵɵelement(2, 'div', 0);
    ɵɵelement(3, 'div', 0);
    ɵɵelement(4, 'div', 0);
    ɵɵelement(5, 'div', 0);
    ɵɵelement(6, 'div', 0);
    ɵɵelement(7, 'div', 0);
    ɵɵelement(8, 'div', 0);
    ɵɵelement(9, 'div', 0);
    ɵɵelement(10, 'div', 0);
    ɵɵelementEnd();
  }
  if (rf & 2) {
    // 1
    ɵɵadvance(1);
    ɵɵstyleProp('width', '100px');
    ɵɵclassProp('foo', true);

    // 2
    ɵɵadvance(1);
    ɵɵstyleProp('width', '200px');
    ɵɵclassProp('foo', true);

    // 3
    ɵɵadvance(1);
    ɵɵstyleProp('width', '300px');
    ɵɵclassProp('foo', true);

    // 4
    ɵɵadvance(1);
    ɵɵstyleProp('width', '400px');
    ɵɵclassProp('foo', true);

    // 5
    ɵɵadvance(1);
    ɵɵstyleProp('width', '500px');
    ɵɵclassProp('foo', true);

    // 6
    ɵɵadvance(1);
    ɵɵstyleProp('width', '600px');
    ɵɵclassProp('foo', true);

    // 7
    ɵɵadvance(1);
    ɵɵstyleProp('width', '700px');
    ɵɵclassProp('foo', true);

    // 8
    ɵɵadvance(1);
    ɵɵstyleProp('width', '800px');
    ɵɵclassProp('foo', true);

    // 9
    ɵɵadvance(1);
    ɵɵstyleProp('width', '900px');
    ɵɵclassProp('foo', true);

    // 10
    ɵɵadvance(1);
    ɵɵstyleProp('width', '1000px');
    ɵɵclassProp('foo', true);
  }
}

function dirThatSetsWidthHostBindings(rf: RenderFlags, ctx: any) {
  if (rf & 2) {
    ɵɵstyleProp('width', '999px');
  }
}

function dirThatSetsFooClassHostBindings(rf: RenderFlags, ctx: any) {
  if (rf & 2) {
    ɵɵclassProp('foo', false);
  }
}

const rootLView = setupRootViewWithEmbeddedViews(
    testTemplate, 11, 10, 1000, null,
    [
      ['dir-that-sets-width', '', 'dir-that-sets-foo-class', ''],
    ],
    [
      defineBenchmarkTestDirective('dir-that-sets-width', dirThatSetsWidthHostBindings),
      defineBenchmarkTestDirective('dir-that-sets-foo-class', dirThatSetsFooClassHostBindings),
    ]);
const rootTView = rootLView[TVIEW];

// scenario to benchmark
const duplicateStyleAndClassBindingsBenchmark =
    createBenchmark('duplicate style and class bindings');
const refreshTime = duplicateStyleAndClassBindingsBenchmark('refresh');

// run change detection in the update mode
console.profile('duplicate_style_and_class_bindings_refresh');
while (refreshTime()) {
  refreshView(rootTView, rootLView, null, null);
}
console.profileEnd();

// report results
duplicateStyleAndClassBindingsBenchmark.report();
