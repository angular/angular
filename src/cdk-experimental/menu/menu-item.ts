/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Directive, Output, Input, EventEmitter} from '@angular/core';
import {CdkMenuPanel} from './menu-panel';
import {coerceBooleanProperty, BooleanInput} from '@angular/cdk/coercion';

/**
 * Directive which provides behavior for an element which when clicked:
 *  If located in a CdkMenuBar:
 *    - opens up an attached submenu
 *
 *  If located in a CdkMenu/CdkMenuGroup, one of:
 *    - executes the user defined click handler
 *    - toggles its checkbox state
 *    - toggles its radio button state (in relation to siblings)
 *
 * If it's in a CdkMenu and it triggers a sub-menu, hovering over the
 * CdkMenuItem will open the submenu.
 *
 */
@Directive({
  selector: '[cdkMenuItem], [cdkMenuTriggerFor]',
  exportAs: 'cdkMenuItem',
  host: {
    'type': 'button',
    '[attr.role]': 'role',
    '[attr.aria-checked]': '_getAriaChecked()',
  },
})
export class CdkMenuItem {
  /** Template reference variable to the menu this trigger opens */
  @Input('cdkMenuTriggerFor') _menuPanel: CdkMenuPanel;

  /** ARIA role for the menu item. */
  @Input() role: 'menuitem' | 'menuitemradio' | 'menuitemcheckbox' = 'menuitem';

  /** Whether the checkbox or radiobutton is checked */
  @Input()
  get checked() {
    return this._checked;
  }
  set checked(value: boolean) {
    this._checked = coerceBooleanProperty(value);
  }
  private _checked = false;

  /** Emits when the attached submenu is opened */
  @Output() opened: EventEmitter<void> = new EventEmitter();

  /** get the aria-checked value only if element is `menuitemradio` or `menuitemcheckbox` */
  _getAriaChecked(): boolean | null {
    if (this.role === 'menuitem') {
      return null;
    }
    return this.checked;
  }

  /** Whether the menu item opens a menu */
  hasSubmenu() {
    return !!this._menuPanel;
  }

  static ngAcceptInputType_checked: BooleanInput;
}
