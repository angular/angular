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
  Output,
  EventEmitter,
  QueryList,
  ContentChildren,
  AfterContentInit,
  OnDestroy,
  Optional,
  OnInit,
  NgZone,
  HostListener,
  ElementRef,
  Inject,
  Self,
} from '@angular/core';
import {FocusKeyManager, FocusOrigin} from '@angular/cdk/a11y';
import {
  LEFT_ARROW,
  RIGHT_ARROW,
  UP_ARROW,
  DOWN_ARROW,
  ESCAPE,
  TAB,
  hasModifierKey,
} from '@angular/cdk/keycodes';
import {Directionality} from '@angular/cdk/bidi';
import {merge} from 'rxjs';
import {take, takeUntil, startWith, mergeMap, mapTo, mergeAll, switchMap} from 'rxjs/operators';
import {CdkMenuGroup} from './menu-group';
import {CdkMenuPanel} from './menu-panel';
import {Menu, CDK_MENU} from './menu-interface';
import {CdkMenuItem} from './menu-item';
import {MenuStack, MenuStackItem, FocusNext, NoopMenuStack} from './menu-stack';
import {PointerFocusTracker} from './pointer-focus-tracker';
import {MENU_AIM, MenuAim} from './menu-aim';

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
    '[tabindex]': '_isInline() ? 0 : null',
    'role': 'menu',
    'class': 'cdk-menu',
    '[class.cdk-menu-inline]': '_isInline()',
    '[attr.aria-orientation]': 'orientation',
  },
  providers: [
    {provide: CdkMenuGroup, useExisting: CdkMenu},
    {provide: CDK_MENU, useExisting: CdkMenu},
  ],
})
export class CdkMenu extends CdkMenuGroup implements Menu, AfterContentInit, OnInit, OnDestroy {
  /**
   * Sets the aria-orientation attribute and determines where menus will be opened.
   * Does not affect styling/layout.
   */
  @Input('cdkMenuOrientation') orientation: 'horizontal' | 'vertical' = 'vertical';

  /** Event emitted when the menu is closed. */
  @Output() readonly closed: EventEmitter<void | 'click' | 'tab' | 'escape'> = new EventEmitter();

  // We provide a default MenuStack implementation in case the menu is an inline menu.
  // For Menus part of a MenuBar nested within a MenuPanel this will be overwritten
  // to the correct parent MenuStack.
  /** Track the Menus making up the open menu stack. */
  _menuStack: MenuStack = new NoopMenuStack();

  /** Handles keyboard events for the menu. */
  private _keyManager: FocusKeyManager<CdkMenuItem>;

  /** Manages items under mouse focus. */
  private _pointerTracker?: PointerFocusTracker<CdkMenuItem>;

  /** List of nested CdkMenuGroup elements */
  @ContentChildren(CdkMenuGroup, {descendants: true})
  private readonly _nestedGroups: QueryList<CdkMenuGroup>;

  /** All child MenuItem elements nested in this Menu. */
  @ContentChildren(CdkMenuItem, {descendants: true})
  private readonly _allItems: QueryList<CdkMenuItem>;

  /** The Menu Item which triggered the open submenu. */
  private _openItem?: CdkMenuItem;

  /**
   * A reference to the enclosing parent menu panel.
   *
   * Required to be set when using ViewEngine since ViewEngine does support injecting a reference to
   * the parent directive if the parent directive is placed on an `ng-template`. If using Ivy, the
   * injected value will be used over this one.
   */
  @Input('cdkMenuPanel') private readonly _explicitPanel?: CdkMenuPanel;

  constructor(
    private readonly _ngZone: NgZone,
    readonly _elementRef: ElementRef<HTMLElement>,
    @Self() @Optional() @Inject(MENU_AIM) private readonly _menuAim?: MenuAim,
    @Optional() private readonly _dir?: Directionality,
    // `CdkMenuPanel` is always used in combination with a `CdkMenu`.
    // tslint:disable-next-line: lightweight-tokens
    @Optional() private readonly _menuPanel?: CdkMenuPanel,
  ) {
    super();
  }

  ngOnInit() {
    this._registerWithParentPanel();
  }

  override ngAfterContentInit() {
    super.ngAfterContentInit();

    this._completeChangeEmitter();
    this._setKeyManager();
    this._subscribeToMenuOpen();
    this._subscribeToMenuStack();
    this._subscribeToMouseManager();

    this._menuAim?.initialize(this, this._pointerTracker!);
  }

  // In Ivy the `host` metadata will be merged, whereas in ViewEngine it is overridden. In order
  // to avoid double event listeners, we need to use `HostListener`. Once Ivy is the default, we
  // can move this back into `host`.
  // tslint:disable:no-host-decorator-in-concrete
  @HostListener('focus')
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

  // In Ivy the `host` metadata will be merged, whereas in ViewEngine it is overridden. In order
  // to avoid double event listeners, we need to use `HostListener`. Once Ivy is the default, we
  // can move this back into `host`.
  // tslint:disable:no-host-decorator-in-concrete
  @HostListener('keydown', ['$event'])
  /** Handle keyboard events for the Menu. */
  _handleKeyEvent(event: KeyboardEvent) {
    const keyManager = this._keyManager;
    switch (event.keyCode) {
      case LEFT_ARROW:
      case RIGHT_ARROW:
        if (this._isHorizontal()) {
          event.preventDefault();
          keyManager.setFocusOrigin('keyboard');
          keyManager.onKeydown(event);
        }
        break;

      case UP_ARROW:
      case DOWN_ARROW:
        if (!this._isHorizontal()) {
          event.preventDefault();
          keyManager.setFocusOrigin('keyboard');
          keyManager.onKeydown(event);
        }
        break;

      case ESCAPE:
        if (!hasModifierKey(event)) {
          event.preventDefault();
          this._menuStack.close(this, FocusNext.currentItem);
        }
        break;

      case TAB:
        this._menuStack.closeAll();
        break;

      default:
        keyManager.onKeydown(event);
    }
  }

  /** Register this menu with its enclosing parent menu panel */
  private _registerWithParentPanel() {
    this._getMenuPanel()?._registerMenu(this);
  }

  /**
   * Get the enclosing CdkMenuPanel defaulting to the injected reference over the developer
   * provided reference.
   */
  private _getMenuPanel() {
    return this._menuPanel || this._explicitPanel;
  }

  /**
   * Complete the change emitter if there are any nested MenuGroups or register to complete the
   * change emitter if a MenuGroup is rendered at some point
   */
  private _completeChangeEmitter() {
    if (this._hasNestedGroups()) {
      this.change.complete();
    } else {
      this._nestedGroups.changes.pipe(take(1)).subscribe(() => this.change.complete());
    }
  }

  /** Return true if there are nested CdkMenuGroup elements within the Menu */
  private _hasNestedGroups() {
    // view engine has a bug where @ContentChildren will return the current element
    // along with children if the selectors match - not just the children.
    // Here, if there is at least one element, we check to see if the first element is a CdkMenu in
    // order to ensure that we return true iff there are child CdkMenuGroup elements.
    return this._nestedGroups.length > 0 && !(this._nestedGroups.first instanceof CdkMenu);
  }

  /** Setup the FocusKeyManager with the correct orientation for the menu. */
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
      this._pointerTracker.entered
        .pipe(takeUntil(this.closed))
        .subscribe(item => this._keyManager.setActiveItem(item));
    });
  }

  /** Subscribe to the MenuStack close and empty observables. */
  private _subscribeToMenuStack() {
    this._menuStack.closed
      .pipe(takeUntil(this.closed))
      .subscribe(item => this._closeOpenMenu(item));

    this._menuStack.emptied
      .pipe(takeUntil(this.closed))
      .subscribe(event => this._toggleMenuFocus(event));
  }

  /**
   * Close the open menu if the current active item opened the requested MenuStackItem.
   * @param item the MenuStackItem requested to be closed.
   */
  private _closeOpenMenu(menu: MenuStackItem | undefined) {
    const keyManager = this._keyManager;
    const trigger = this._openItem;
    if (menu === trigger?.getMenuTrigger()?.getMenu()) {
      trigger?.getMenuTrigger()?.closeMenu();
      // If the user has moused over a sibling item we want to focus the element under mouse focus
      // not the trigger which previously opened the now closed menu.
      if (trigger) {
        keyManager.setActiveItem(this._pointerTracker?.activeElement || trigger);
      }
    }
  }

  /** Set focus the either the current, previous or next item based on the FocusNext event. */
  private _toggleMenuFocus(event: FocusNext | undefined) {
    const keyManager = this._keyManager;
    switch (event) {
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

  // TODO(andy9775): remove duplicate logic between menu an menu bar
  /**
   * Subscribe to the menu trigger's open events in order to track the trigger which opened the menu
   * and stop tracking it when the menu is closed.
   */
  private _subscribeToMenuOpen() {
    const exitCondition = merge(this._allItems.changes, this.closed);
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
        takeUntil(this.closed),
      )
      .subscribe(() => (this._openItem = undefined));
  }

  /** Return true if this menu has been configured in a horizontal orientation. */
  private _isHorizontal() {
    return this.orientation === 'horizontal';
  }

  /**
   * Return true if this menu is an inline menu. That is, it does not exist in a pop-up and is
   * always visible in the dom.
   */
  _isInline() {
    // NoopMenuStack is the default. If this menu is not inline than the NoopMenuStack is replaced
    // automatically.
    return this._menuStack instanceof NoopMenuStack;
  }

  override ngOnDestroy() {
    this._emitClosedEvent();
    this._pointerTracker?.destroy();
  }

  /** Emit and complete the closed event emitter */
  private _emitClosedEvent() {
    this.closed.next();
    this.closed.complete();
  }
}
