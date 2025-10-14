/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {__decorate} from 'tslib';
import {Component} from '@angular/core';
let AppComponent = class AppComponent {
  constructor(_cd) {
    this._cd = _cd;
    this.counter = 0;
  }
  increment() {
    this.counter++;
    this._cd.detectChanges();
  }
};
AppComponent = __decorate(
  [
    Component({
      selector: 'app-root',
      templateUrl: './app.component.html',
    }),
  ],
  AppComponent,
);
export {AppComponent};
//# sourceMappingURL=app.component.js.map
