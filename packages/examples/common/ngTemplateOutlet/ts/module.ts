/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Component, NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';

// #docregion NgTemplateOutlet
@Component({
  selector: 'ng-template-outlet-example',
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
  standalone: false,
})
export class NgTemplateOutletExample {
  myContext = {$implicit: 'World', localSk: 'Svet'};
}
// #enddocregion

@Component({
  selector: 'example-app',
  template: `<ng-template-outlet-example></ng-template-outlet-example>`,
  standalone: false,
})
export class AppComponent {}

@NgModule({
  imports: [BrowserModule],
  declarations: [AppComponent, NgTemplateOutletExample],
})
export class AppModule {}
