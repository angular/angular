/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {ɵɵtemplate} from '../../../../src/render3/instructions/container';
import {createTNode, createTView} from '../../../../src/render3/instructions/shared';
import {RenderFlags} from '../../../../src/render3/interfaces/definition';
import {TNodeType, TViewNode} from '../../../../src/render3/interfaces/node';
import {createBenchmark} from '../micro_bench';
import {createAndRenderLView} from '../setup';

`<div>
    <ng-template></ng-template>
    <ng-template></ng-template>
    <ng-template></ng-template>
    <ng-template></ng-template>
    <ng-template></ng-template>
    <ng-template></ng-template>
    <ng-template></ng-template>
    <ng-template></ng-template>
    <ng-template></ng-template>
    <ng-template></ng-template>
  </div>
</ng-template>`;
function testTemplate(rf: RenderFlags, ctx: any) {
  if (rf & 1) {
    ɵɵtemplate(0, null, 0, 0);
    ɵɵtemplate(1, null, 0, 0);
    ɵɵtemplate(2, null, 0, 0);
    ɵɵtemplate(3, null, 0, 0);
    ɵɵtemplate(4, null, 0, 0);
    ɵɵtemplate(5, null, 0, 0);
    ɵɵtemplate(6, null, 0, 0);
    ɵɵtemplate(7, null, 0, 0);
    ɵɵtemplate(8, null, 0, 0);
    ɵɵtemplate(9, null, 0, 0);
  }
}

const viewTNode = createTNode(null !, null, TNodeType.View, -1, null, null) as TViewNode;
const embeddedTView = createTView(-1, testTemplate, 10, 0, null, null, null, null, null);

// create view once so we don't profile first template pass
createAndRenderLView(null, embeddedTView, viewTNode);

// scenario to benchmark
const elementTextCreate = createBenchmark('ng_template');
const createTime = elementTextCreate('create');

console.profile('ng_template_create');
while (createTime()) {
  createAndRenderLView(null, embeddedTView, viewTNode);
}
console.profileEnd();

// report results
elementTextCreate.report();
