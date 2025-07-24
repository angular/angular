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
  selector: 'styling-bindings',
  template: `
    <ng-template #t0><button [title]="exp"></button></ng-template>
    <ng-template #t1><button class="static"></button></ng-template>
    <ng-template #t2><button class="foo {{ exp }}"></button></ng-template>
    <ng-template #t3><button [class.bar]="exp === 'bar'"></button></ng-template>
    <ng-template #t4><button class="foo" [class.bar]="exp === 'bar'"></button></ng-template>
    <ng-template #t5><button class="foo" [ngClass]="{bar: exp === 'bar'}"></button></ng-template>
    <ng-template #t6
      ><button
        class="foo"
        [ngStyle]="staticStyle"
        [style.background-color]="exp == 'bar' ? 'yellow' : 'red'"
      ></button
    ></ng-template>
    <ng-template #t7><button style="color: red"></button></ng-template>
    <ng-template #t8
      ><button [style.width.px]="exp === 'bar' ? 10 : 20" [style.color]="exp"></button
    ></ng-template>
    <ng-template #t9><button style="width: 10px" [style.color]="exp"></button></ng-template>
    <ng-template #t10
      ><button [ngStyle]="{'width.px': exp === 'bar' ? 10 : 20, color: exp}"></button
    ></ng-template>

    <div>
      <ng-template
        ngFor
        [ngForOf]="data"
        [ngForTemplate]="getTplRef(t0, t1, t2, t3, t4, t5, t6, t7, t8, t9, t10)"
      ></ng-template>
    </div>
  `,
  standalone: false,
})
export class StylingComponent {
  data: number[] = [];
  exp: string = 'bar';
  tplRefIdx: number = 0;
  staticStyle = {width: '10px'};

  getTplRef(...tplRefs: TemplateRef<any>[]): TemplateRef<any> {
    return tplRefs[this.tplRefIdx];
  }
}

@NgModule({
  imports: [BrowserModule],
  declarations: [StylingComponent],
  bootstrap: [StylingComponent],
})
export class StylingModule {}
