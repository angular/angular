/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {
  AfterContentInit,
  Directive,
  ElementRef,
  EventEmitter,
  Inject,
  NgZone,
  OnDestroy,
  Optional,
  Output,
  Self,
} from '@angular/core';
import {ESCAPE, hasModifierKey, LEFT_ARROW, RIGHT_ARROW, TAB} from '@angular/cdk/keycodes';
import {Directionality} from '@angular/cdk/bidi';
import {takeUntil} from 'rxjs/operators';
import {CdkMenuGroup} from './menu-group';
import {CDK_MENU} from './menu-interface';
import {
  FocusNext,
  MENU_STACK,
  MenuStack,
  PARENT_OR_NEW_INLINE_MENU_STACK_PROVIDER,
} from './menu-stack';
import {MENU_AIM, MenuAim} from './menu-aim';
import {MENU_TRIGGER, CdkMenuTriggerBase} from './menu-trigger-base';
import {CdkMenuBase} from './menu-base';

/**
 * Directive which configures the element as a Menu which should contain child elements marked as
 * CdkMenuItem or CdkMenuGroup. Sets the appropriate role and aria-attributes for a menu and
 * contains accessible keyboard and mouse handling logic.
 *
 * It also acts as a RadioGroup for elements marked with role `menuitemradio`.
 */
@Directive({
  selector: '[cdkMenu]',
  exportAs: 'cdkMenu',
  host: {
    'role': 'menu',
    'class': 'cdk-menu',
    '[class.cdk-menu-inline]': 'isInline',
    '(keydown)': '_handleKeyEvent($event)',
  },
  providers: [
    {provide: CdkMenuGroup, useExisting: CdkMenu},
    {provide: CDK_MENU, useExisting: CdkMenu},
    PARENT_OR_NEW_INLINE_MENU_STACK_PROVIDER('vertical'),
  ],
})
export class CdkMenu extends CdkMenuBase implements AfterContentInit, OnDestroy {
  /** Event emitted when the menu is closed. */
  @Output() readonly closed: EventEmitter<void> = new EventEmitter();

  /** The direction items in the menu flow. */
  override readonly orientation = 'vertical';

  /** Whether the menu is displayed inline (i.e. always present vs a conditional popup that the user triggers with a trigger element). */
  override readonly isInline = !this._parentTrigger;

  constructor(
    /** The host element. */
    elementRef: ElementRef<HTMLElement>,
    /** The Angular zone. */
    ngZone: NgZone,
    /** The menu stack this menu is part of. */
    @Inject(MENU_STACK) menuStack: MenuStack,
    /** The trigger that opened this menu. */
    @Optional() @Inject(MENU_TRIGGER) private _parentTrigger?: CdkMenuTriggerBase,
    /** The menu aim service used by this menu. */
    @Self() @Optional() @Inject(MENU_AIM) menuAim?: MenuAim,
    /** The directionality of the page. */
    @Optional() dir?: Directionality,
  ) {
    super(elementRef, ngZone, menuStack, menuAim, dir);
    this.destroyed.subscribe(this.closed);
    this._parentTrigger?.registerChildMenu(this);
  }

  override ngAfterContentInit() {
    super.ngAfterContentInit();
    this._subscribeToMenuStackEmptied();
  }

  override ngOnDestroy() {
    super.ngOnDestroy();
    this.closed.complete();
  }

  /**
   * Handle keyboard events for the Menu.
   * @param event The keyboard event to be handled.
   */
  _handleKeyEvent(event: KeyboardEvent) {
    const keyManager = this.keyManager;
    switch (event.keyCode) {
      case LEFT_ARROW:
      case RIGHT_ARROW:
        if (!hasModifierKey(event)) {
          event.preventDefault();
          keyManager.setFocusOrigin('keyboard');
          keyManager.onKeydown(event);
        }
        break;

      case ESCAPE:
        if (!hasModifierKey(event)) {
          event.preventDefault();
          this.menuStack.close(this, {
            focusNextOnEmpty: FocusNext.currentItem,
            focusParentTrigger: true,
          });
        }
        break;

      case TAB:
        if (!hasModifierKey(event, 'altKey', 'metaKey', 'ctrlKey')) {
          this.menuStack.closeAll({focusParentTrigger: true});
        }
        break;

      default:
        keyManager.onKeydown(event);
    }
  }

  /**
   * Set focus the either the current, previous or next item based on the FocusNext event.
   * @param focusNext The element to focus.
   */
  private _toggleMenuFocus(focusNext: FocusNext | undefined) {
    const keyManager = this.keyManager;
    switch (focusNext) {
      case FocusNext.nextItem:
        keyManager.setFocusOrigin('keyboard');
        keyManager.setNextItemActive();
        break;

      case FocusNext.previousItem:
        keyManager.setFocusOrigin('keyboard');
        keyManager.setPreviousItemActive();
        break;

      case FocusNext.currentItem:
        if (keyManager.activeItem) {
          keyManager.setFocusOrigin('keyboard');
          keyManager.setActiveItem(keyManager.activeItem);
        }
        break;
    }
  }

  /** Subscribe to the MenuStack emptied events. */
  private _subscribeToMenuStackEmptied() {
    this.menuStack.emptied
      .pipe(takeUntil(this.destroyed))
      .subscribe(event => this._toggleMenuFocus(event));
  }
}
