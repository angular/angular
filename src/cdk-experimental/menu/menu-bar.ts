/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {
  Directive,
  Input,
  ContentChildren,
  QueryList,
  AfterContentInit,
  OnDestroy,
  Optional,
  NgZone,
  ElementRef,
  Inject,
  Self,
} from '@angular/core';
import {Directionality} from '@angular/cdk/bidi';
import {FocusKeyManager, FocusOrigin} from '@angular/cdk/a11y';
import {LEFT_ARROW, RIGHT_ARROW, UP_ARROW, DOWN_ARROW, ESCAPE, TAB} from '@angular/cdk/keycodes';
import {takeUntil, mergeAll, mapTo, startWith, mergeMap, switchMap} from 'rxjs/operators';
import {Subject, merge} from 'rxjs';
import {CdkMenuGroup} from './menu-group';
import {CDK_MENU, Menu} from './menu-interface';
import {CdkMenuItem} from './menu-item';
import {MenuStack, MenuStackItem, FocusNext, MENU_STACK} from './menu-stack';
import {PointerFocusTracker} from './pointer-focus-tracker';
import {MenuAim, MENU_AIM} from './menu-aim';

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
    '[attr.aria-orientation]': 'orientation',
    '(focus)': 'focusFirstItem()',
    '(keydown)': '_handleKeyEvent($event)',
  },
  providers: [
    {provide: CdkMenuGroup, useExisting: CdkMenuBar},
    {provide: CDK_MENU, useExisting: CdkMenuBar},
    {provide: MENU_STACK, useClass: MenuStack},
  ],
})
export class CdkMenuBar extends CdkMenuGroup implements Menu, AfterContentInit, OnDestroy {
  /**
   * Sets the aria-orientation attribute and determines where menus will be opened.
   * Does not affect styling/layout.
   */
  @Input('cdkMenuBarOrientation') orientation: 'horizontal' | 'vertical' = 'horizontal';

  /** Handles keyboard events for the MenuBar. */
  private _keyManager: FocusKeyManager<CdkMenuItem>;

  /** Manages items under mouse focus */
  private _pointerTracker?: PointerFocusTracker<CdkMenuItem>;

  /** Emits when the MenuBar is destroyed. */
  private readonly _destroyed: Subject<void> = new Subject();

  /** All child MenuItem elements nested in this MenuBar. */
  @ContentChildren(CdkMenuItem, {descendants: true})
  private readonly _allItems: QueryList<CdkMenuItem>;

  /** The Menu Item which triggered the open submenu. */
  private _openItem?: CdkMenuItem;

  constructor(
    private readonly _ngZone: NgZone,
    readonly _elementRef: ElementRef<HTMLElement>,
    @Inject(MENU_STACK) readonly _menuStack: MenuStack,
    @Self() @Optional() @Inject(MENU_AIM) private readonly _menuAim?: MenuAim,
    @Optional() private readonly _dir?: Directionality,
  ) {
    super();
  }

  override ngAfterContentInit() {
    super.ngAfterContentInit();

    this._setKeyManager();
    this._subscribeToMenuOpen();
    this._subscribeToMenuStack();
    this._subscribeToMouseManager();

    this._menuAim?.initialize(this, this._pointerTracker!);
  }

  /** Place focus on the first MenuItem in the menu and set the focus origin. */
  focusFirstItem(focusOrigin: FocusOrigin = 'program') {
    this._keyManager.setFocusOrigin(focusOrigin);
    this._keyManager.setFirstItemActive();
  }

  /** Place focus on the last MenuItem in the menu and set the focus origin. */
  focusLastItem(focusOrigin: FocusOrigin = 'program') {
    this._keyManager.setFocusOrigin(focusOrigin);
    this._keyManager.setLastItemActive();
  }

  /**
   * Handle keyboard events, specifically changing the focused element and/or toggling the active
   * items menu.
   * @param event the KeyboardEvent to handle.
   */
  _handleKeyEvent(event: KeyboardEvent) {
    const keyManager = this._keyManager;
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
          (this._isHorizontal() && horizontalArrows) ||
          (!this._isHorizontal() && !horizontalArrows)
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

  /** Setup the FocusKeyManager with the correct orientation for the menu bar. */
  private _setKeyManager() {
    this._keyManager = new FocusKeyManager(this._allItems)
      .withWrap()
      .withTypeAhead()
      .withHomeAndEnd();

    if (this._isHorizontal()) {
      this._keyManager.withHorizontalOrientation(this._dir?.value || 'ltr');
    } else {
      this._keyManager.withVerticalOrientation();
    }
  }

  /**
   * Set the PointerFocusTracker and ensure that when mouse focus changes the key manager is updated
   * with the latest menu item under mouse focus.
   */
  private _subscribeToMouseManager() {
    this._ngZone.runOutsideAngular(() => {
      this._pointerTracker = new PointerFocusTracker(this._allItems);
      this._pointerTracker.entered.pipe(takeUntil(this._destroyed)).subscribe(item => {
        if (this._hasOpenSubmenu()) {
          this._keyManager.setActiveItem(item);
        }
      });
    });
  }

  /** Subscribe to the MenuStack close and empty observables. */
  private _subscribeToMenuStack() {
    this._menuStack.closed
      .pipe(takeUntil(this._destroyed))
      .subscribe(item => this._closeOpenMenu(item));

    this._menuStack.emptied
      .pipe(takeUntil(this._destroyed))
      .subscribe(event => this._toggleOpenMenu(event));
  }

  /**
   * Close the open menu if the current active item opened the requested MenuStackItem.
   * @param item the MenuStackItem requested to be closed.
   */
  private _closeOpenMenu(menu: MenuStackItem | undefined) {
    const trigger = this._openItem;
    const keyManager = this._keyManager;
    if (menu === trigger?.getMenuTrigger()?.getMenu()) {
      trigger?.getMenuTrigger()?.closeMenu();
      // If the user has moused over a sibling item we want to focus the element under mouse focus
      // not the trigger which previously opened the now closed menu.
      if (trigger) {
        keyManager.setActiveItem(this._pointerTracker?.activeElement || trigger);
      }
    }
  }

  /**
   * Set focus to either the current, previous or next item based on the FocusNext event, then
   * open the previous or next item.
   */
  private _toggleOpenMenu(event: FocusNext | undefined) {
    const keyManager = this._keyManager;
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

  /**
   * @return true if the menu bar is configured to be horizontal.
   */
  private _isHorizontal() {
    return this.orientation === 'horizontal';
  }

  /**
   * Subscribe to the menu trigger's open events in order to track the trigger which opened the menu
   * and stop tracking it when the menu is closed.
   */
  private _subscribeToMenuOpen() {
    const exitCondition = merge(this._allItems.changes, this._destroyed);
    this._allItems.changes
      .pipe(
        startWith(this._allItems),
        mergeMap((list: QueryList<CdkMenuItem>) =>
          list
            .filter(item => item.hasMenu())
            .map(item => item.getMenuTrigger()!.opened.pipe(mapTo(item), takeUntil(exitCondition))),
        ),
        mergeAll(),
        switchMap((item: CdkMenuItem) => {
          this._openItem = item;
          return item.getMenuTrigger()!.closed;
        }),
        takeUntil(this._destroyed),
      )
      .subscribe(() => (this._openItem = undefined));
  }

  /** Return true if the MenuBar has an open submenu. */
  private _hasOpenSubmenu() {
    return !!this._openItem;
  }

  override ngOnDestroy() {
    super.ngOnDestroy();

    this._destroyed.next();
    this._destroyed.complete();

    this._pointerTracker?.destroy();
  }
}
