/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Component, NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
import {platformBrowserDynamic} from '@angular/platform-browser-dynamic';

// #docregion DatePipe
@Component({
  selector: 'date-example',
  template: `<div>
    <p>Today is {{today | date}}</p>
    <p>Or if you prefer, {{today | date:'fullDate'}}</p>
    <p>The time is {{today | date:'jmZ'}}</p>
  </div>`
})
export class DatePipeExample {
  today: number = Date.now();
}
// #enddocregion

@Component({
  selector: 'example-app',
  template: `
    <h1>DatePipe Example</h1>
    <date-example></date-example>
  `
})
export class AppCmp {
}

@NgModule({declarations: [DatePipeExample, AppCmp], imports: [BrowserModule], bootstrap: [AppCmp]})
class AppModule {
}

export function main() {
  platformBrowserDynamic().bootstrapModule(AppModule);
}
