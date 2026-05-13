/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Component, NgModule, TemplateRef} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';

@Component({
  selector: 'static-literals-benchmark',
  template: `
    <ng-template #flat>
      <div [title]="{a: val}"></div>
      <div [title]="{a: val}"></div>
      <div [title]="{a: val}"></div>
      <div [title]="{a: val}"></div>
      <div [title]="{a: val}"></div>
    </ng-template>
    <ng-template #nested>
      <div [title]="{a: {b: val}}"></div>
      <div [title]="{a: {b: val}}"></div>
      <div [title]="{a: {b: val}}"></div>
      <div [title]="{a: {b: val}}"></div>
      <div [title]="{a: {b: val}}"></div>
    </ng-template>

    <div>
      <ng-template ngFor [ngForOf]="data" [ngForTemplate]="getTplRef(flat, nested)"> </ng-template>
    </div>
  `,
  standalone: false,
})
export class StaticLiteralsComponent {
  data: number[] = [];
  scenarioIdx: number = 0;
  val: number = 1;

  getTplRef(...tplRefs: TemplateRef<any>[]): TemplateRef<any> {
    return tplRefs[this.scenarioIdx];
  }
}

@NgModule({
  imports: [BrowserModule],
  declarations: [StaticLiteralsComponent],
  bootstrap: [StaticLiteralsComponent],
})
export class StaticLiteralsModule {}
