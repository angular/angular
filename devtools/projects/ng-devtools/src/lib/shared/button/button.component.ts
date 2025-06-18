/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {ChangeDetectionStrategy, Component, input} from '@angular/core';

type ButtonType = 'primary' | 'icon';
type ButtonSize = 'standard' | 'compact';

@Component({
  selector: 'button[ng-button]',
  template: '<ng-content/>',
  styleUrl: './button.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'ng-button',
    '[class.type-primary]': `btnType() === 'primary'`,
    '[class.type-icon]': `btnType() === 'icon'`,
    '[class.size-compact]': `size() === 'compact'`,
  },
})
export class ButtonComponent {
  readonly btnType = input<ButtonType>('primary');
  readonly size = input<ButtonSize>('standard');
}
