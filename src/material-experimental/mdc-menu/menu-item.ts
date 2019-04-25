/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Component, ChangeDetectionStrategy, ViewEncapsulation} from '@angular/core';
import {MatMenuItem as BaseMatMenuItem} from '@angular/material/menu';

/**
 * This directive is intended to be used inside an mat-menu tag.
 * It exists mostly to set the role attribute.
 */
@Component({
  moduleId: module.id,
  selector: '[mat-menu-item]',
  exportAs: 'matMenuItem',
  inputs: ['disabled', 'disableRipple'],
  host: {
    '[attr.role]': 'role',
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
export class MatMenuItem extends BaseMatMenuItem {}
