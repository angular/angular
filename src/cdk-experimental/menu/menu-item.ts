/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Directive, Input, Optional, Self} from '@angular/core';
import {coerceBooleanProperty, BooleanInput} from '@angular/cdk/coercion';
import {CdkMenuItemTrigger} from './menu-item-trigger';

/**
 * Directive which provides the ability for an element to be focused and navigated to using the
 * keyboard when residing in a CdkMenu, CdkMenuBar, or CdkMenuGroup. It performs user defined
 * behavior when clicked.
 */
@Directive({
  selector: '[cdkMenuItem]',
  exportAs: 'cdkMenuItem',
  host: {
    'type': 'button',
    'role': 'menuitem',
    '[attr.aria-disabled]': 'disabled || null',
  },
})
export class CdkMenuItem {
  /**  Whether the CdkMenuItem is disabled - defaults to false */
  @Input()
  get disabled(): boolean {
    return this._disabled;
  }
  set disabled(value: boolean) {
    this._disabled = coerceBooleanProperty(value);
  }
  private _disabled = false;

  constructor(
    /** Reference to the CdkMenuItemTrigger directive if one is added to the same element */
    @Self() @Optional() private readonly _menuTrigger?: CdkMenuItemTrigger
  ) {}

  /** Open the submenu if one is attached */
  trigger() {
    if (!this.disabled && this.hasSubmenu()) {
      this._menuTrigger!.toggle();
    }
  }

  /** Whether the menu item opens a menu. */
  hasSubmenu() {
    return !!this._menuTrigger && this._menuTrigger.hasSubmenu();
  }

  static ngAcceptInputType_disabled: BooleanInput;
}
