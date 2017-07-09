/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Component, ElementRef, ChangeDetectionStrategy} from '@angular/core';
import {Focusable} from '../core/a11y/focus-key-manager';
import {CanDisable, mixinDisabled} from '../core/common-behaviors/disabled';

// Boilerplate for applying mixins to MdMenuItem.
/** @docs-private */
export class MdMenuItemBase {}
export const _MdMenuItemMixinBase = mixinDisabled(MdMenuItemBase);

/**
 * This directive is intended to be used inside an md-menu tag.
 * It exists mostly to set the role attribute.
 */
@Component({
  moduleId: module.id,
  selector: '[md-menu-item], [mat-menu-item]',
  inputs: ['disabled'],
  host: {
    'role': 'menuitem',
    'class': 'mat-menu-item',
    '[attr.tabindex]': '_getTabIndex()',
    '[attr.aria-disabled]': 'disabled.toString()',
    '[attr.disabled]': 'disabled || null',
    '(click)': '_checkDisabled($event)',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: 'menu-item.html',
  exportAs: 'mdMenuItem',
})
export class MdMenuItem extends _MdMenuItemMixinBase implements Focusable, CanDisable {

  constructor(private _elementRef: ElementRef) {
    super();
  }

  /** Focuses the menu item. */
  focus(): void {
    this._getHostElement().focus();
  }

  /** Used to set the `tabindex`. */
  _getTabIndex(): string {
    return this.disabled ? '-1' : '0';
  }

  /** Returns the host DOM element. */
  _getHostElement(): HTMLElement {
    return this._elementRef.nativeElement;
  }

  /** Prevents the default element actions if it is disabled. */
  _checkDisabled(event: Event): void {
    if (this.disabled) {
      event.preventDefault();
      event.stopPropagation();
    }
  }
}

