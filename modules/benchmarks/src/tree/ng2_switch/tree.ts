/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Component, Input, NgModule, provideZoneChangeDetection} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';

import {emptyTree, TreeNode} from '../util';

@Component({
  selector: 'tree',
  template: `<ng-container [ngSwitch]="data.depth % 2">
    <span *ngSwitchCase="0" style="background-color: grey"> {{ data.value }} </span>
    <span *ngSwitchDefault> {{ data.value }} </span>
    <tree *ngIf="data.right != null" [data]="data.right"></tree
    ><tree *ngIf="data.left != null" [data]="data.left"></tree
  ></ng-container>`,
  standalone: false,
})
export class TreeComponent {
  @Input() data: TreeNode = emptyTree;
}

@NgModule({
  imports: [BrowserModule],
  bootstrap: [TreeComponent],
  declarations: [TreeComponent],
  providers: [provideZoneChangeDetection()],
})
export class AppModule {}
