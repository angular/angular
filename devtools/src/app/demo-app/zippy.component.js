/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {__decorate} from 'tslib';
import {Component, input} from '@angular/core';
let ZippyComponent = class ZippyComponent {
  constructor() {
    this.title = input('title');
    this.visible = false;
  }
};
ZippyComponent = __decorate(
  [
    Component({
      selector: 'app-zippy',
      templateUrl: './zippy.component.html',
      styleUrls: ['./zippy.component.scss'],
    }),
  ],
  ZippyComponent,
);
export {ZippyComponent};
//# sourceMappingURL=zippy.component.js.map
