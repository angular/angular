/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {BooleanInput} from '@angular/cdk/coercion';
import {Component, ChangeDetectionStrategy, ViewEncapsulation} from '@angular/core';
import {MatMenuItem as BaseMatMenuItem} from '@angular/material/menu';

/**
 * This directive is intended to be used inside an mat-menu tag.
 * It exists mostly to set the role attribute.
 */
@Component({
  selector: '[mat-menu-item]',
  exportAs: 'matMenuItem',
  inputs: ['disabled', 'disableRipple'],
  host: {
    '[attr.role]': 'role',
    // The MatMenuItem parent class adds `mat-menu-item` to the CSS classlist, but this should
    // not be added for this MDC equivalent menu item.
    '[class.mat-menu-item]': 'false',
    'class': 'mat-mdc-menu-item',
    '[class.mat-mdc-menu-item-highlighted]': '_highlighted',
    '[class.mat-mdc-menu-item-submenu-trigger]': '_triggersSubmenu',
    '[attr.tabindex]': '_getTabIndex()',
    '[attr.aria-disabled]': 'disabled',
    '[attr.disabled]': 'disabled || null',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  templateUrl: 'menu-item.html',
  providers: [
    {provide: BaseMatMenuItem, useExisting: MatMenuItem},
  ]
})
export class MatMenuItem extends BaseMatMenuItem {
  static ngAcceptInputType_disabled: BooleanInput;
  static ngAcceptInputType_disableRipple: BooleanInput;
}
