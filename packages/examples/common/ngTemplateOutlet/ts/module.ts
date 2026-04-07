/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {NgTemplateOutlet} from '@angular/common';
import {Component} from '@angular/core';

// #docregion NgTemplateOutlet
@Component({
  selector: 'ng-template-outlet-example',
  imports: [NgTemplateOutlet],
  template: `
    <ng-container *ngTemplateOutlet="greet"></ng-container>
    <hr />
    <ng-container *ngTemplateOutlet="eng; context: myContext"></ng-container>
    <hr />
    <ng-container *ngTemplateOutlet="svk; context: myContext"></ng-container>
    <hr />

    <ng-template #greet><span>Hello</span></ng-template>
    <ng-template #eng let-name
      ><span>Hello {{ name }}!</span></ng-template
    >
    <ng-template #svk let-person="localSk"
      ><span>Ahoj {{ person }}!</span></ng-template
    >
  `,
})
export class NgTemplateOutletExample {
  myContext = {$implicit: 'World', localSk: 'Svet'};
}
// #enddocregion

@Component({
  selector: 'example-app',
  imports: [NgTemplateOutletExample],
  template: `<ng-template-outlet-example />`,
})
export class AppComponent {}
