/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {FocusableOption} from '@angular/cdk/a11y';
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  OnDestroy,
  ViewEncapsulation,
} from '@angular/core';
import {CanDisable, mixinDisabled} from '@angular/material/core';
import {Subject} from 'rxjs/Subject';

// Boilerplate for applying mixins to MatMenuItem.
/** @docs-private */
export class MatMenuItemBase {}
export const _MatMenuItemMixinBase = mixinDisabled(MatMenuItemBase);

/**
 * This directive is intended to be used inside an mat-menu tag.
 * It exists mostly to set the role attribute.
 */
@Component({
  moduleId: module.id,
  selector: '[mat-menu-item]',
  inputs: ['disabled'],
  host: {
    'role': 'menuitem',
    'class': 'mat-menu-item',
    '[class.mat-menu-item-highlighted]': '_highlighted',
    '[class.mat-menu-item-submenu-trigger]': '_triggersSubmenu',
    '[attr.tabindex]': '_getTabIndex()',
    '[attr.aria-disabled]': 'disabled.toString()',
    '[attr.disabled]': 'disabled || null',
    '(click)': '_checkDisabled($event)',
    '(mouseenter)': '_emitHoverEvent()',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  preserveWhitespaces: false,
  templateUrl: 'menu-item.html',
  exportAs: 'matMenuItem',
})
export class MatMenuItem extends _MatMenuItemMixinBase implements FocusableOption, CanDisable,
  OnDestroy {

  /** Stream that emits when the menu item is hovered. */
  hover: Subject<MatMenuItem> = new Subject();

  /** Whether the menu item is highlighted. */
  _highlighted: boolean = false;

  /** Whether the menu item acts as a trigger for a sub-menu. */
  _triggersSubmenu: boolean = false;

  constructor(private _elementRef: ElementRef) {
    super();
  }

  /** Focuses the menu item. */
  focus(): void {
    this._getHostElement().focus();
  }

  ngOnDestroy() {
    this.hover.complete();
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

  /** Emits to the hover stream. */
  _emitHoverEvent() {
    if (!this.disabled) {
      this.hover.next(this);
    }
  }

}

