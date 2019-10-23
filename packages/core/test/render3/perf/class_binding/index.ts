/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {ɵɵproperty} from '@angular/core/src/core';
import {AttributeMarker, TAttributes} from '@angular/core/src/render3/interfaces/node';
import {ɵɵelement} from '../../../../src/render3/instructions/element';
import {ɵɵclassMap, ɵɵclassProp} from '../../../../src/render3/instructions/styling';
import {ComponentTemplate, RenderFlags} from '../../../../src/render3/interfaces/definition';
import {createBenchmark} from '../micro_bench';
import {setupTestHarness} from '../setup';


const CLASSES_1_A = 'one';
const CLASSES_1_B = CLASSES_1_A.toUpperCase();
const CLASSES_2_A = 'one two';
const CLASSES_2_B = CLASSES_2_A.toUpperCase();
const CLASSES_10_A = 'one two three four five six seven eight nine ten';
const CLASSES_10_B = CLASSES_10_A.toUpperCase();
let toggleClasses = true;

const consts: TAttributes[] = [
  [AttributeMarker.Classes, 'A', 'B']  // 0
];
const context: any = {};
const createClassBindingBenchmark = createBenchmark('class binding: create:');
const updateClassBindingBenchmark = createBenchmark('class binding: update:');
const noopClassBindingBenchmark = createBenchmark('class binding: noop:');
function benchmark(name: string, template: ComponentTemplate<any>) {
  const harness = setupTestHarness(template, 1, 1, 1000, context, consts);

  const createProfile = createClassBindingBenchmark(name);
  console.profile('create: ' + name);
  while (createProfile()) {
    harness.createEmbeddedLView();
  }
  console.profileEnd();


  const updateProfile = updateClassBindingBenchmark(name);
  console.profile('update: ' + name);
  while (updateProfile()) {
    toggleClasses = !toggleClasses;
    harness.detectChanges();
  }
  console.profileEnd();

  const noopProfile = noopClassBindingBenchmark(name);
  console.profile('nop: ' + name);
  while (noopProfile()) {
    harness.detectChanges();
  }
  console.profileEnd();
}

`<div [class]="toggleClasses ? CLASSES_1_A : CLASSES_1_B">`;
benchmark(`[class]="CLASSES_1"`, function(rf: RenderFlags, ctx: any) {
  if (rf & 1) {
    ɵɵelement(0, 'div');
  }
  if (rf & 2) {
    ɵɵclassMap(toggleClasses ? CLASSES_1_A : CLASSES_1_B);
  }
});


`<div [class]="toggleClasses ? CLASSES_2_A : CLASSES_2_B">`;
benchmark(`[class]="CLASSES_2"`, function(rf: RenderFlags, ctx: any) {
  if (rf & 1) {
    ɵɵelement(0, 'div');
  }
  if (rf & 2) {
    ɵɵclassMap(toggleClasses ? CLASSES_2_A : CLASSES_2_B);
  }
});


`<div [class]="toggleClasses ? CLASSES_10_A : CLASSES_10_B">`;
benchmark(`[class]="CLASSES_10"`, function(rf: RenderFlags, ctx: any) {
  if (rf & 1) {
    ɵɵelement(0, 'div');
  }
  if (rf & 2) {
    ɵɵclassMap(toggleClasses ? CLASSES_10_A : CLASSES_10_B);
  }
});


`<div class="A B">`;
benchmark(`class="A B"`, function(rf: RenderFlags, ctx: any) {
  if (rf & 1) {
    ɵɵelement(0, 'div', 0);
  }
  if (rf & 2) {
  }
});


`<div class="A B" 
      [class]="toggleClasses ? CLASSES_1_A : CLASSES_1_B">`;
benchmark(`class="A B" [class]="CLASSES_1"`, function(rf: RenderFlags, ctx: any) {
  if (rf & 1) {
    ɵɵelement(0, 'div', 0);
  }
  if (rf & 2) {
    ɵɵclassMap(toggleClasses ? CLASSES_1_A : CLASSES_1_B);
  }
});


`<div class="A B" 
      [class]="toggleClasses ? CLASSES_10_A : CLASSES_10_B">`;
benchmark(`class="A B" [class]="CLASSES_10"`, function(rf: RenderFlags, ctx: any) {
  if (rf & 1) {
    ɵɵelement(0, 'div', 0);
  }
  if (rf & 2) {
    ɵɵclassMap(toggleClasses ? CLASSES_10_A : CLASSES_10_B);
  }
});

`<div class="A B" 
      [class]="toggleClasses ? CLASSES_1_A : CLASSES_1_B"
      [class.foo]="toggleClasses">`;
benchmark(`class="A B" [class]="CLASSES_1" [class.foo]="exp"`, function(rf: RenderFlags, ctx: any) {
  if (rf & 1) {
    ɵɵelement(0, 'div', 0);
  }
  if (rf & 2) {
    ɵɵclassMap(toggleClasses ? CLASSES_1_A : CLASSES_1_B);
    ɵɵclassProp('foo', toggleClasses);
  }
});

`<div class="A B" 
      [class]="toggleClasses ? CLASSES_10_A : CLASSES_10_B"
      [class.foo]="toggleClasses">`;
benchmark(
    `class="A B" [class]="CLASSES_10" [class.foo]="exp"`, function(rf: RenderFlags, ctx: any) {
      if (rf & 1) {
        ɵɵelement(0, 'div', 0);
      }
      if (rf & 2) {
        ɵɵclassMap(toggleClasses ? CLASSES_10_A : CLASSES_10_B);
        ɵɵclassProp('foo', toggleClasses);
      }
    });


`<div [className]="toggleClasses ? CLASSES_10_A : CLASSES_10_B">`;
benchmark(`[className]="CLASSES_10"`, function(rf: RenderFlags, ctx: any) {
  if (rf & 1) {
    ɵɵelement(0, 'div');
  }
  if (rf & 2) {
    ɵɵproperty('className', toggleClasses ? CLASSES_10_A : CLASSES_10_B);
  }
});

createClassBindingBenchmark.report();
updateClassBindingBenchmark.report();
noopClassBindingBenchmark.report();