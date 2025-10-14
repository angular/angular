/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {__decorate} from 'tslib';
import {ChangeDetectionStrategy, Component, input} from '@angular/core';
let ExecutionDetailsComponent = class ExecutionDetailsComponent {
  constructor() {
    this.data = input.required();
  }
};
ExecutionDetailsComponent = __decorate(
  [
    Component({
      selector: 'ng-execution-details',
      templateUrl: './execution-details.component.html',
      styleUrls: ['./execution-details.component.scss'],
      changeDetection: ChangeDetectionStrategy.OnPush,
    }),
  ],
  ExecutionDetailsComponent,
);
export {ExecutionDetailsComponent};
//# sourceMappingURL=execution-details.component.js.map
