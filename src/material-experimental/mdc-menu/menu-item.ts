/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {
  Component,
  ChangeDetectionStrategy,
  ViewEncapsulation,
  Inject,
  ElementRef,
  Optional,
  ChangeDetectorRef,
} from '@angular/core';
import {
  MAT_RIPPLE_GLOBAL_OPTIONS,
  RippleAnimationConfig,
  RippleGlobalOptions,
} from '@angular/material-experimental/mdc-core';
import {MatMenuItem as BaseMatMenuItem, MatMenuPanel, MAT_MENU_PANEL} from '@angular/material/menu';
import {ANIMATION_MODULE_TYPE} from '@angular/platform-browser/animations';
import {FocusMonitor} from '@angular/cdk/a11y';
import {DOCUMENT} from '@angular/common';
import {numbers} from '@material/ripple';

/**
 * Single item inside of a `mat-menu`. Provides the menu item styling and accessibility treatment.
 */
@Component({
  selector: '[mat-menu-item]',
  exportAs: 'matMenuItem',
  inputs: ['disabled', 'disableRipple'],
  host: {
    '[attr.role]': 'role',
     // The MatMenuItem parent class adds `mat-menu-item` and `mat-focus-indicator` to the CSS
     // classlist, but these should not be added for this MDC equivalent menu item.
    '[class.mat-menu-item]': 'false',
    '[class.mat-focus-indicator]': 'false',
    'class': 'mat-mdc-menu-item mat-mdc-focus-indicator',
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
  _rippleAnimation: RippleAnimationConfig;
  _noopAnimations: boolean;

  constructor(elementRef: ElementRef<HTMLElement>,
    @Inject(DOCUMENT) document?: any,
    focusMonitor?: FocusMonitor,
    @Inject(MAT_MENU_PANEL) @Optional() parentMenu?: MatMenuPanel<unknown>,
    @Optional() @Inject(MAT_RIPPLE_GLOBAL_OPTIONS)
      globalRippleOptions?: RippleGlobalOptions,
    @Optional() @Inject(ANIMATION_MODULE_TYPE) animationMode?: string,
    changeDetectorRef?: ChangeDetectorRef) {
    super(elementRef, document, focusMonitor, parentMenu, changeDetectorRef);

    this._noopAnimations = animationMode === 'NoopAnimations';
    this._rippleAnimation = globalRippleOptions?.animation || {
      enterDuration: numbers.DEACTIVATION_TIMEOUT_MS,
      exitDuration: numbers.FG_DEACTIVATION_MS
    };
  }
}
