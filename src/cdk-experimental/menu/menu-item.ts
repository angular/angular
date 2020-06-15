/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Directive, Output, Input, AfterContentInit, EventEmitter, OnDestroy} from '@angular/core';
import {coerceBooleanProperty, BooleanInput} from '@angular/cdk/coercion';
import {CdkMenuPanel} from './menu-panel';
import {CdkMenuGroup} from './menu-group';
import {MenuItem} from './menu-item-interface';
import {takeUntil} from 'rxjs/operators';

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
    '[attr.aria-disabled]': 'disabled || null',
  },
})
export class CdkMenuItem implements AfterContentInit, MenuItem, OnDestroy {
  /** Template reference variable to the menu this trigger opens */
  @Input('cdkMenuTriggerFor') _menuPanel?: CdkMenuPanel;

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

  /**  Whether the CdkMenuItem is disabled - defaults to false */
  @Input()
  get disabled(): boolean {
    return this._disabled;
  }
  set disabled(value: boolean) {
    this._disabled = coerceBooleanProperty(value);
  }
  private _disabled = false;

  /** Emits when the attached submenu is opened */
  @Output() opened: EventEmitter<void> = new EventEmitter();

  /** Emits when the component gets destroyed */
  private readonly _destroyed: EventEmitter<void> = new EventEmitter();

  constructor(
    /** reference a parent CdkMenuGroup component */
    private readonly _menuGroup: CdkMenuGroup
  ) {}

  /** Configure event subscriptions */
  ngAfterContentInit() {
    if (this.role !== 'menuitem') {
      this._menuGroup.change
        .pipe(takeUntil(this._destroyed))
        .subscribe((button: MenuItem) => this._toggleCheckedState(button));
    }
  }

  /**
   * If the role is menuitemcheckbox or menuitemradio and not disabled, emits a change event
   * on the enclosing parent MenuGroup.
   */
  trigger() {
    if (this.disabled) {
      return;
    }

    if (this.hasSubmenu()) {
      // TODO(andy): open the menu
    }
    this._menuGroup._registerTriggeredItem(this);
  }

  /** Whether the menu item opens a menu */
  hasSubmenu() {
    return !!this._menuPanel;
  }

  /** get the aria-checked value only if element is `menuitemradio` or `menuitemcheckbox` */
  _getAriaChecked(): boolean | null {
    if (this.role === 'menuitem') {
      return null;
    }
    return this.checked;
  }

  /**
   * Toggle the checked state of the menuitemradio or menuitemcheckbox component
   */
  private _toggleCheckedState(selected: MenuItem) {
    if (this.role === 'menuitemradio') {
      this.checked = selected === this;
    } else if (this.role === 'menuitemcheckbox' && selected === this) {
      this.checked = !this.checked;
    }
  }

  ngOnDestroy() {
    this._destroyed.next();
    this._destroyed.complete();
  }

  static ngAcceptInputType_checked: BooleanInput;
  static ngAcceptInputType_disabled: BooleanInput;
}
