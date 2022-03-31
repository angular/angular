/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {CdkMenuGroup} from './menu-group';
import {
  AfterContentInit,
  ContentChildren,
  Directive,
  ElementRef,
  Inject,
  OnDestroy,
  Optional,
  QueryList,
} from '@angular/core';
import {FocusKeyManager, FocusOrigin} from '@angular/cdk/a11y';
import {CdkMenuItem} from './menu-item';
import {merge, Subject} from 'rxjs';
import {Directionality} from '@angular/cdk/bidi';
import {mapTo, mergeAll, mergeMap, startWith, switchMap, takeUntil} from 'rxjs/operators';
import {MENU_STACK, MenuStack, MenuStackItem} from './menu-stack';
import {Menu} from './menu-interface';
import {PointerFocusTracker} from './pointer-focus-tracker';

@Directive({
  host: {
    '[tabindex]': '_isInline ? (_hasFocus ? -1 : 0) : null',
    '[attr.aria-orientation]': 'orientation',
    '(focus)': 'focusFirstItem()',
    '(focusin)': 'menuStack.setHasFocus(true)',
    '(focusout)': 'menuStack.setHasFocus(false)',
  },
})
export abstract class CdkMenuBase
  extends CdkMenuGroup
  implements Menu, AfterContentInit, OnDestroy
{
  /**
   * Sets the aria-orientation attribute and determines where menus will be opened.
   * Does not affect styling/layout.
   */
  orientation: 'horizontal' | 'vertical' = 'vertical';

  _isInline = false;

  _hasFocus = false;

  /** All child MenuItem elements nested in this Menu. */
  @ContentChildren(CdkMenuItem, {descendants: true})
  protected readonly items: QueryList<CdkMenuItem>;

  /** Handles keyboard events for the menu. */
  protected keyManager: FocusKeyManager<CdkMenuItem>;

  /** Emits when the MenuBar is destroyed. */
  protected readonly destroyed: Subject<void> = new Subject();

  /** The Menu Item which triggered the open submenu. */
  protected openItem?: CdkMenuItem;

  /** Manages items under mouse focus */
  protected pointerTracker?: PointerFocusTracker<CdkMenuItem>;

  protected constructor(
    readonly _elementRef: ElementRef<HTMLElement>,
    @Inject(MENU_STACK) readonly menuStack: MenuStack,
    @Optional() protected readonly dir?: Directionality,
  ) {
    super();
  }

  override ngAfterContentInit() {
    super.ngAfterContentInit();
    this._setKeyManager();
    this._subscribeToHasFocus();
    this._subscribeToMenuOpen();
    this._subscribeToMenuStackClosed();
  }

  override ngOnDestroy() {
    super.ngOnDestroy();
    this.destroyed.next();
    this.destroyed.complete();
  }

  /** Place focus on the first MenuItem in the menu and set the focus origin. */
  focusFirstItem(focusOrigin: FocusOrigin = 'program') {
    this.keyManager.setFocusOrigin(focusOrigin);
    this.keyManager.setFirstItemActive();
  }

  /** Place focus on the last MenuItem in the menu and set the focus origin. */
  focusLastItem(focusOrigin: FocusOrigin = 'program') {
    this.keyManager.setFocusOrigin(focusOrigin);
    this.keyManager.setLastItemActive();
  }

  /** Return true if this menu has been configured in a horizontal orientation. */
  protected isHorizontal() {
    return this.orientation === 'horizontal';
  }

  /** Return true if the MenuBar has an open submenu. */
  protected hasOpenSubmenu() {
    return !!this.openItem;
  }

  /**
   * Close the open menu if the current active item opened the requested MenuStackItem.
   * @param menu the MenuStackItem requested to be closed.
   * @param focusParentTrigger whether to focus the parent trigger after closing the menu.
   */
  protected closeOpenMenu(menu?: MenuStackItem, focusParentTrigger?: boolean) {
    const keyManager = this.keyManager;
    const trigger = this.openItem;
    if (menu === trigger?.getMenuTrigger()?.getMenu()) {
      trigger?.getMenuTrigger()?.close();
      // If the user has moused over a sibling item we want to focus the element under mouse focus
      // not the trigger which previously opened the now closed menu.
      if (focusParentTrigger) {
        if (trigger) {
          keyManager.setActiveItem(trigger);
        } else {
          keyManager.setFirstItemActive();
        }
      }
    }
  }

  /** Setup the FocusKeyManager with the correct orientation for the menu. */
  private _setKeyManager() {
    this.keyManager = new FocusKeyManager(this.items).withWrap().withTypeAhead().withHomeAndEnd();

    if (this.isHorizontal()) {
      this.keyManager.withHorizontalOrientation(this.dir?.value || 'ltr');
    } else {
      this.keyManager.withVerticalOrientation();
    }
  }

  /**
   * Subscribe to the menu trigger's open events in order to track the trigger which opened the menu
   * and stop tracking it when the menu is closed.
   */
  private _subscribeToMenuOpen() {
    const exitCondition = merge(this.items.changes, this.destroyed);
    this.items.changes
      .pipe(
        startWith(this.items),
        mergeMap((list: QueryList<CdkMenuItem>) =>
          list
            .filter(item => item.hasMenu())
            .map(item => item.getMenuTrigger()!.opened.pipe(mapTo(item), takeUntil(exitCondition))),
        ),
        mergeAll(),
        switchMap((item: CdkMenuItem) => {
          this.openItem = item;
          return item.getMenuTrigger()!.closed;
        }),
        takeUntil(this.destroyed),
      )
      .subscribe(() => (this.openItem = undefined));
  }

  /** Subscribe to the MenuStack close and empty observables. */
  private _subscribeToMenuStackClosed() {
    this.menuStack.closed
      .pipe(takeUntil(this.destroyed))
      .subscribe(({item, focusParentTrigger}) => this.closeOpenMenu(item, focusParentTrigger));
  }

  private _subscribeToHasFocus() {
    if (this._isInline) {
      this.menuStack.hasFocus.pipe(takeUntil(this.destroyed)).subscribe(hasFocus => {
        this._hasFocus = hasFocus;
      });
    }
  }
}
