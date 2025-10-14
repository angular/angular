/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {__decorate} from 'tslib';
import {ChangeDetectionStrategy, Component, input, output} from '@angular/core';
import {MatIcon} from '@angular/material/icon';
import {SignalsValueTreeComponent} from './signals-value-tree/signals-value-tree.component';
import {ButtonComponent} from '../../../../shared/button/button.component';
const TYPE_CLASS_MAP = {
  'signal': 'type-signal',
  'computed': 'type-computed',
  'effect': 'type-effect',
  'template': 'type-template',
  'linkedSignal': 'type-linked-signal',
};
let SignalsDetailsComponent = class SignalsDetailsComponent {
  constructor() {
    this.node = input.required();
    this.dataSource = input.required();
    this.treeControl = input.required();
    this.gotoSource = output();
    this.close = output();
    this.TYPE_CLASS_MAP = TYPE_CLASS_MAP;
  }
};
SignalsDetailsComponent = __decorate(
  [
    Component({
      selector: 'ng-signals-details',
      templateUrl: './signals-details.component.html',
      styleUrl: './signals-details.component.scss',
      changeDetection: ChangeDetectionStrategy.OnPush,
      imports: [SignalsValueTreeComponent, MatIcon, ButtonComponent],
    }),
  ],
  SignalsDetailsComponent,
);
export {SignalsDetailsComponent};
//# sourceMappingURL=signals-details.component.js.map
