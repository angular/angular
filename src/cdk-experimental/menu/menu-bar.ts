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
  Inject,
  NgZone,
  OnDestroy,
  Optional,
  Self,
} from '@angular/core';
import {Directionality} from '@angular/cdk/bidi';
import {DOWN_ARROW, ESCAPE, LEFT_ARROW, RIGHT_ARROW, TAB, UP_ARROW} from '@angular/cdk/keycodes';
import {takeUntil} from 'rxjs/operators';
import {CdkMenuGroup} from './menu-group';
import {CDK_MENU} from './menu-interface';
import {FocusNext, MENU_STACK, MenuStack} from './menu-stack';
import {PointerFocusTracker} from './pointer-focus-tracker';
import {MENU_AIM, MenuAim} from './menu-aim';
import {CdkMenuBase} from './menu-base';

/**
 * Directive applied to an element which configures it as a MenuBar by setting the appropriate
 * role, aria attributes, and accessible keyboard and mouse handling logic. The component that
 * this directive is applied to should contain components marked with CdkMenuItem.
 *
 */
@Directive({
  selector: '[cdkMenuBar]',
  exportAs: 'cdkMenuBar',
  host: {
    'role': 'menubar',
    'class': 'cdk-menu-bar',
    'tabindex': '0',
    '(keydown)': '_handleKeyEvent($event)',
  },
  providers: [
    {provide: CdkMenuGroup, useExisting: CdkMenuBar},
    {provide: CDK_MENU, useExisting: CdkMenuBar},
    {provide: MENU_STACK, useClass: MenuStack},
  ],
})
export class CdkMenuBar extends CdkMenuBase implements AfterContentInit, OnDestroy {
  override readonly orientation: 'horizontal' | 'vertical' = 'horizontal';

  override menuStack: MenuStack;

  constructor(
    private readonly _ngZone: NgZone,
    elementRef: ElementRef<HTMLElement>,
    @Inject(MENU_STACK) menuStack: MenuStack,
    @Self() @Optional() @Inject(MENU_AIM) private readonly _menuAim?: MenuAim,
    @Optional() dir?: Directionality,
  ) {
    super(elementRef, menuStack, dir);
  }

  override ngAfterContentInit() {
    super.ngAfterContentInit();
    this._subscribeToMenuStackEmptied();
    this._subscribeToMouseManager();
    this._menuAim?.initialize(this, this.pointerTracker!);
  }

  override ngOnDestroy() {
    super.ngOnDestroy();
    this.pointerTracker?.destroy();
  }

  /**
   * Handle keyboard events, specifically changing the focused element and/or toggling the active
   * items menu.
   * @param event the KeyboardEvent to handle.
   */
  _handleKeyEvent(event: KeyboardEvent) {
    const keyManager = this.keyManager;
    switch (event.keyCode) {
      case UP_ARROW:
      case DOWN_ARROW:
      case LEFT_ARROW:
      case RIGHT_ARROW:
        const horizontalArrows = event.keyCode === LEFT_ARROW || event.keyCode === RIGHT_ARROW;
        // For a horizontal menu if the left/right keys were clicked, or a vertical menu if the
        // up/down keys were clicked: if the current menu is open, close it then focus and open the
        // next  menu.
        if (
          (this.isHorizontal() && horizontalArrows) ||
          (!this.isHorizontal() && !horizontalArrows)
        ) {
          event.preventDefault();

          const prevIsOpen = keyManager.activeItem?.isMenuOpen();
          keyManager.activeItem?.getMenuTrigger()?.closeMenu();

          keyManager.setFocusOrigin('keyboard');
          keyManager.onKeydown(event);
          if (prevIsOpen) {
            keyManager.activeItem?.getMenuTrigger()?.openMenu();
          }
        }
        break;

      case ESCAPE:
        event.preventDefault();
        keyManager.activeItem?.getMenuTrigger()?.closeMenu();
        break;

      case TAB:
        keyManager.activeItem?.getMenuTrigger()?.closeMenu();
        break;

      default:
        keyManager.onKeydown(event);
    }
  }

  /**
   * Set the PointerFocusTracker and ensure that when mouse focus changes the key manager is updated
   * with the latest menu item under mouse focus.
   */
  private _subscribeToMouseManager() {
    this._ngZone.runOutsideAngular(() => {
      this.pointerTracker = new PointerFocusTracker(this.items);
      this.pointerTracker.entered.pipe(takeUntil(this.destroyed)).subscribe(item => {
        if (this.hasOpenSubmenu()) {
          this.keyManager.setActiveItem(item);
        }
      });
    });
  }

  /**
   * Set focus to either the current, previous or next item based on the FocusNext event, then
   * open the previous or next item.
   */
  private _toggleOpenMenu(event: FocusNext | undefined) {
    const keyManager = this.keyManager;
    switch (event) {
      case FocusNext.nextItem:
        keyManager.setFocusOrigin('keyboard');
        keyManager.setNextItemActive();
        keyManager.activeItem?.getMenuTrigger()?.openMenu();
        break;

      case FocusNext.previousItem:
        keyManager.setFocusOrigin('keyboard');
        keyManager.setPreviousItemActive();
        keyManager.activeItem?.getMenuTrigger()?.openMenu();
        break;

      case FocusNext.currentItem:
        if (keyManager.activeItem) {
          keyManager.setFocusOrigin('keyboard');
          keyManager.setActiveItem(keyManager.activeItem);
        }
        break;
    }
  }

  private _subscribeToMenuStackEmptied() {
    this.menuStack?.emptied
      .pipe(takeUntil(this.destroyed))
      .subscribe(event => this._toggleOpenMenu(event));
  }
}
