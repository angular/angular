/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {CommonModule} from '@angular/common';
import {Component, NgModule, ɵdetectChanges} from '@angular/core';

import {buildTree, emptyTree} from '../util';

export function destroyDom(component: TreeComponent) {
  component.data = emptyTree;
  ɵdetectChanges(component);
}

export function createDom(component: TreeComponent) {
  component.data = buildTree();
  ɵdetectChanges(component);
}

const numberOfChecksEl = document.getElementById('numberOfChecks')!;
let detectChangesRuns = 0;
export function detectChanges(component: TreeComponent) {
  for (let i = 0; i < 10; i++) {
    ɵdetectChanges(component);
  }
  detectChangesRuns += 10;
  numberOfChecksEl.textContent = `${detectChangesRuns}`;
}

@Component({
  selector: 'tree',
  inputs: ['data'],
  template: `
    <span [style.backgroundColor]="bgColor"> {{data.value}} </span>
    <tree *ngIf='data.right != null' [data]='data.right'></tree>
    <tree *ngIf='data.left != null' [data]='data.left'></tree>
  `,
})
export class TreeComponent {
  data: any = emptyTree;
  get bgColor() {
    return this.data.depth % 2 ? '' : 'grey';
  }
}

@NgModule({declarations: [TreeComponent], imports: [CommonModule]})
export class TreeModule {
}
