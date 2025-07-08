/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Component, NgModule, provideZoneChangeDetection} from '@angular/core';
import {BrowserModule, DomSanitizer, SafeStyle} from '@angular/platform-browser';

import {emptyTree, TreeNode} from '../util';

let trustedEmptyColor: SafeStyle;
let trustedGreyColor: SafeStyle;

@Component({
  selector: 'tree',
  inputs: ['data'],
  template: `<span [style.backgroundColor]="bgColor"> {{ data.value }} </span
    ><tree *ngIf="data.right != null" [data]="data.right"></tree
    ><tree *ngIf="data.left != null" [data]="data.left"></tree>`,
  standalone: false,
})
export class TreeComponent {
  data: TreeNode = emptyTree;
  get bgColor() {
    return this.data.depth % 2 ? trustedEmptyColor : trustedGreyColor;
  }
}

@NgModule({
  imports: [BrowserModule],
  providers: [provideZoneChangeDetection()],
  bootstrap: [TreeComponent],
  declarations: [TreeComponent],
})
export class AppModule {
  constructor(sanitizer: DomSanitizer) {
    trustedEmptyColor = sanitizer.bypassSecurityTrustStyle('');
    trustedGreyColor = sanitizer.bypassSecurityTrustStyle('grey');
  }
}
