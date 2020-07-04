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
import {ɵɵclassMap, ɵɵstyleMap} from '../../../../src/render3/instructions/styling';
import {RenderFlags} from '../../../../src/render3/interfaces/definition';
import {TVIEW} from '../../../../src/render3/interfaces/view';
import {createBenchmark} from '../micro_bench';
import {setupRootViewWithEmbeddedViews} from '../setup';
import {defineBenchmarkTestDirective} from '../shared';

`<ng-template>
  <section>
    <div [style]="{width, height}"
         [class]="'foo active'"
         dir-that-sets-styles
         dir-that-sets-classes></div>

    <div [style]="{width, height}"
         [class]="'foo active'"
         dir-that-sets-styles
         dir-that-sets-classes></div>

    <div [style]="{width, height}"
         [class]="'foo active'"
         dir-that-sets-styles
         dir-that-sets-classes></div>

    <div [style]="{width, height}"
         [class]="'foo active'"
         dir-that-sets-styles
         dir-that-sets-classes></div>

    <div [style]="{width, height}"
         [class]="'foo active'"
         dir-that-sets-styles
         dir-that-sets-classes></div>

    <div [style]="{width, height}"
         [class]="'foo active'"
         dir-that-sets-styles
         dir-that-sets-classes></div>

    <div [style]="{width, height}"
         [class]="'foo active'"
         dir-that-sets-styles
         dir-that-sets-classes></div>

    <div [style]="{width, height}"
         [class]="'foo active'"
         dir-that-sets-styles
         dir-that-sets-classes></div>

    <div [style]="{width, height}"
         [class]="'foo active'"
         dir-that-sets-styles
         dir-that-sets-classes></div>

    <div [style]="{width, height}"
         [class]="'foo active'"
         dir-that-sets-styles
         dir-that-sets-classes></div>
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
    ɵɵstyleMap({width: '100px', height: '1000px'});
    ɵɵclassMap('foo active');
    ɵɵadvance(1);

    // 2
    ɵɵstyleMap({width: '200px', height: '2000px'});
    ɵɵclassMap('foo active');
    ɵɵadvance(1);

    // 3
    ɵɵstyleMap({width: '300px', height: '3000px'});
    ɵɵclassMap('foo active');
    ɵɵadvance(1);

    // 4
    ɵɵstyleMap({width: '400px', height: '4000px'});
    ɵɵclassMap('foo active');
    ɵɵadvance(1);

    // 5
    ɵɵstyleMap({width: '500px', height: '5000px'});
    ɵɵclassMap('foo active');
    ɵɵadvance(1);

    // 6
    ɵɵstyleMap({width: '600px', height: '6000px'});
    ɵɵclassMap('foo active');
    ɵɵadvance(1);

    // 7
    ɵɵstyleMap({width: '700px', height: '7000px'});
    ɵɵclassMap('foo active');
    ɵɵadvance(1);

    // 8
    ɵɵstyleMap({width: '800px', height: '8000px'});
    ɵɵclassMap('foo active');
    ɵɵadvance(1);

    // 9
    ɵɵstyleMap({width: '900px', height: '9000px'});
    ɵɵclassMap('foo active');
    ɵɵadvance(1);

    // 10
    ɵɵstyleMap({width: '1000px', height: '10000px'});
    ɵɵclassMap('foo active');
    ɵɵadvance(1);
  }
}

function dirThatSetsStylesHostBindings(rf: RenderFlags, ctx: any) {
  if (rf & 2) {
    ɵɵstyleMap({opacity: '0.5'});
  }
}

function dirThatSetsFooClassesHostBindings(rf: RenderFlags, ctx: any) {
  if (rf & 2) {
    ɵɵclassMap({bar: true, baz: true});
  }
}

const rootLView = setupRootViewWithEmbeddedViews(
    testTemplate, 11, 40, 1000, null,
    [
      ['dir-that-sets-width', '', 'dir-that-sets-foo-class', ''],
    ],
    [
      defineBenchmarkTestDirective('dir-that-sets-styles', dirThatSetsStylesHostBindings),
      defineBenchmarkTestDirective('dir-that-sets-classes', dirThatSetsFooClassesHostBindings),
    ]);
const rootTView = rootLView[TVIEW];

// scenario to benchmark
const duplicateMapBasedStyleAndClassBindingsBenchmark =
    createBenchmark('duplicate map-based style and class bindings');
const refreshTime = duplicateMapBasedStyleAndClassBindingsBenchmark('refresh');

// run change detection in the update mode
console.profile('duplicate_map_based_style_and_class_bindings_refresh');
while (refreshTime()) {
  refreshView(rootTView, rootLView, null, null);
}
console.profileEnd();

// report results
duplicateMapBasedStyleAndClassBindingsBenchmark.report();
