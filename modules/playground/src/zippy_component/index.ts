/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Component, NgModule} from '@angular/core';
import {BrowserModule, platformBrowser} from '@angular/platform-browser';

import {Zippy} from './app/zippy';

@Component({
  selector: 'zippy-app',
  template: `
    <zippy (open)="pushLog('open')" (close)="pushLog('close')" title="Details">
      This is some content.
    </zippy>
    <ul>
      <li *ngFor="let log of logs">{{ log }}</li>
    </ul>
  `,
  standalone: false,
})
export class ZippyApp {
  logs: string[] = [];

  pushLog(log: string) {
    this.logs.push(log);
  }
}

@NgModule({declarations: [ZippyApp, Zippy], bootstrap: [ZippyApp], imports: [BrowserModule]})
export class ExampleModule {}

platformBrowser().bootstrapModule(ExampleModule);
