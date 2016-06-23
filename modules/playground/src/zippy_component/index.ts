/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {bootstrap} from '@angular/platform-browser-dynamic';
import {Component} from '@angular/core';
import {Zippy} from './app/zippy';

@Component({
  selector: 'zippy-app',
  template: `
    <zippy (open)="pushLog('open')" (close)="pushLog('close')" title="Details">
      This is some content.
    </zippy>
    <ul>
      <li *ngFor="let  log of logs">{{log}}</li>
    </ul>
  `,
  directives: [Zippy]
})
class ZippyApp {
  logs: string[] = [];

  pushLog(log: string) { this.logs.push(log); }
}

export function main() {
  bootstrap(ZippyApp);
}
