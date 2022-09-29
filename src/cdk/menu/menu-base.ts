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
  inject,
  InjectFlags,
  Input,
  NgZone,
  OnDestroy,
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
import {MENU_AIM} from './menu-aim';

/** Counter used to create unique IDs for menus. */
let nextId = 0;

/**
 * Abstract directive that implements shared logic common to all menus.
 * This class can be extended to create custom menu types.
 */
@Directive({
  host: {
    'role': 'menu',
    'class': '', // reset the css class added by the super-class
    '[tabindex]': '_getTabIndex()',
    '[id]': 'id',
    '[attr.aria-orientation]': 'orientation',
    '[attr.data-cdk-menu-stack-id]': 'menuStack.id',
    '(focus)': 'focusFirstItem()',
    '(focusin)': 'menuStack.setHasFocus(true)',
    '(focusout)': 'menuStack.setHasFocus(false)',
  },
})
export abstract class CdkMenuBase
  extends CdkMenuGroup
  implements Menu, AfterContentInit, OnDestroy
{
  /** The menu's native DOM host element. */
  readonly nativeElement: HTMLElement = inject(ElementRef).nativeElement;

  /** The Angular zone. */
  protected ngZone = inject(NgZone);

  /** The stack of menus this menu belongs to. */
  readonly menuStack: MenuStack = inject(MENU_STACK);

  /** The menu aim service used by this menu. */
  protected readonly menuAim = inject(MENU_AIM, InjectFlags.Optional | InjectFlags.Self);

  /** The directionality (text direction) of the current page. */
  protected readonly dir = inject(Directionality, InjectFlags.Optional);

  /** The id of the menu's host element. */
  @Input() id = `cdk-menu-${nextId++}`;

  /** All child MenuItem elements nested in this Menu. */
  @ContentChildren(CdkMenuItem, {descendants: true})
  readonly items: QueryList<CdkMenuItem>;

  /** The direction items in the menu flow. */
  orientation: 'horizontal' | 'vertical' = 'vertical';

  /**
   * Whether the menu is displayed inline (i.e. always present vs a conditional popup that the
   * user triggers with a trigger element).
   */
  isInline = false;

  /** Handles keyboard events for the menu. */
  protected keyManager: FocusKeyManager<CdkMenuItem>;

  /** Emits when the MenuBar is destroyed. */
  protected readonly destroyed: Subject<void> = new Subject();

  /** The Menu Item which triggered the open submenu. */
  protected triggerItem?: CdkMenuItem;

  /** Tracks the users mouse movements over the menu. */
  protected pointerTracker?: PointerFocusTracker<CdkMenuItem>;

  /** Whether this menu's menu stack has focus. */
  private _menuStackHasFocus = false;

  ngAfterContentInit() {
    if (!this.isInline) {
      this.menuStack.push(this);
    }
    this._setKeyManager();
    this._subscribeToMenuStackHasFocus();
    this._subscribeToMenuOpen();
    this._subscribeToMenuStackClosed();
    this._setUpPointerTracker();
  }

  ngOnDestroy() {
    this.keyManager?.destroy();
    this.destroyed.next();
    this.destroyed.complete();
    this.pointerTracker?.destroy();
  }

  /**
   * Place focus on the first MenuItem in the menu and set the focus origin.
   * @param focusOrigin The origin input mode of the focus event.
   */
  focusFirstItem(focusOrigin: FocusOrigin = 'program') {
    this.keyManager.setFocusOrigin(focusOrigin);
    this.keyManager.setFirstItemActive();
  }

  /**
   * Place focus on the last MenuItem in the menu and set the focus origin.
   * @param focusOrigin The origin input mode of the focus event.
   */
  focusLastItem(focusOrigin: FocusOrigin = 'program') {
    this.keyManager.setFocusOrigin(focusOrigin);
    this.keyManager.setLastItemActive();
  }

  /** Gets the tabindex for this menu. */
  _getTabIndex() {
    const tabindexIfInline = this._menuStackHasFocus ? -1 : 0;
    return this.isInline ? tabindexIfInline : null;
  }

  /**
   * Close the open menu if the current active item opened the requested MenuStackItem.
   * @param menu The menu requested to be closed.
   * @param options Options to configure the behavior on close.
   *   - `focusParentTrigger` Whether to focus the parent trigger after closing the menu.
   */
  protected closeOpenMenu(menu: MenuStackItem, options?: {focusParentTrigger?: boolean}) {
    const {focusParentTrigger} = {...options};
    const keyManager = this.keyManager;
    const trigger = this.triggerItem;
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

    if (this.orientation === 'horizontal') {
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
            .filter(item => item.hasMenu)
            .map(item => item.getMenuTrigger()!.opened.pipe(mapTo(item), takeUntil(exitCondition))),
        ),
        mergeAll(),
        switchMap((item: CdkMenuItem) => {
          this.triggerItem = item;
          return item.getMenuTrigger()!.closed;
        }),
        takeUntil(this.destroyed),
      )
      .subscribe(() => (this.triggerItem = undefined));
  }

  /** Subscribe to the MenuStack close events. */
  private _subscribeToMenuStackClosed() {
    this.menuStack.closed
      .pipe(takeUntil(this.destroyed))
      .subscribe(({item, focusParentTrigger}) => this.closeOpenMenu(item, {focusParentTrigger}));
  }

  /** Subscribe to the MenuStack hasFocus events. */
  private _subscribeToMenuStackHasFocus() {
    if (this.isInline) {
      this.menuStack.hasFocus.pipe(takeUntil(this.destroyed)).subscribe(hasFocus => {
        this._menuStackHasFocus = hasFocus;
      });
    }
  }

  /**
   * Set the PointerFocusTracker and ensure that when mouse focus changes the key manager is updated
   * with the latest menu item under mouse focus.
   */
  private _setUpPointerTracker() {
    if (this.menuAim) {
      this.ngZone.runOutsideAngular(() => {
        this.pointerTracker = new PointerFocusTracker(this.items);
      });
      this.menuAim.initialize(this, this.pointerTracker!);
    }
  }
}
