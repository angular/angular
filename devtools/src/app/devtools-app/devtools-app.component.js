/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {__decorate} from 'tslib';
import {Component, viewChild} from '@angular/core';
import {DevToolsComponent} from '../../../projects/ng-devtools';
import {SplitAreaDirective} from '../../../projects/ng-devtools/src/lib/shared/split/splitArea.directive';
import {SplitComponent} from '../../../projects/ng-devtools/src/lib/shared/split/split.component';
let AppDevToolsComponent = class AppDevToolsComponent {
  constructor() {
    this.messageBus = null;
    this.iframe = viewChild('ref');
  }
};
AppDevToolsComponent = __decorate(
  [
    Component({
      templateUrl: './devtools-app.component.html',
      styleUrls: ['./devtools-app.component.scss'],
      imports: [DevToolsComponent, SplitAreaDirective, SplitComponent],
    }),
  ],
  AppDevToolsComponent,
);
export {AppDevToolsComponent};
//# sourceMappingURL=devtools-app.component.js.map
