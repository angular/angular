/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {__decorate} from 'tslib';
import {ChangeDetectionStrategy, Component, input} from '@angular/core';
let ButtonComponent = class ButtonComponent {
  constructor() {
    this.btnType = input('primary');
    this.size = input('standard');
  }
};
ButtonComponent = __decorate(
  [
    Component({
      selector: 'button[ng-button]',
      template: '<ng-content/>',
      styleUrl: './button.component.scss',
      changeDetection: ChangeDetectionStrategy.OnPush,
      host: {
        class: 'ng-button',
        '[class.type-primary]': `btnType() === 'primary'`,
        '[class.type-icon]': `btnType() === 'icon'`,
        '[class.size-compact]': `size() === 'compact'`,
        '[class.size-mid]': `size() === 'mid'`,
      },
    }),
  ],
  ButtonComponent,
);
export {ButtonComponent};
//# sourceMappingURL=button.component.js.map
