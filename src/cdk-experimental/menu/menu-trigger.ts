/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {
  Directive,
  ElementRef,
  Inject,
  Injector,
  NgZone,
  OnDestroy,
  Optional,
  ViewContainerRef,
} from '@angular/core';
import {Directionality} from '@angular/cdk/bidi';
import {
  ConnectedPosition,
  FlexibleConnectedPositionStrategy,
  Overlay,
  OverlayConfig,
  STANDARD_DROPDOWN_ADJACENT_POSITIONS,
  STANDARD_DROPDOWN_BELOW_POSITIONS,
} from '@angular/cdk/overlay';
import {
  DOWN_ARROW,
  ENTER,
  hasModifierKey,
  LEFT_ARROW,
  RIGHT_ARROW,
  SPACE,
  UP_ARROW,
} from '@angular/cdk/keycodes';
import {fromEvent} from 'rxjs';
import {filter, takeUntil} from 'rxjs/operators';
import {CDK_MENU, Menu} from './menu-interface';
import {MENU_STACK, MenuStack, PARENT_OR_NEW_MENU_STACK_PROVIDER} from './menu-stack';
import {MENU_AIM, MenuAim} from './menu-aim';
import {CdkMenuTriggerBase, MENU_TRIGGER} from './menu-trigger-base';

/**
 * A directive that turns its host element into a trigger for a popup menu.
 * It can be combined with cdkMenuItem to create sub-menus. If the element is in a top level
 * MenuBar it will open the menu on click, or if a sibling is already opened it will open on hover.
 * If it is inside of a Menu it will open the attached Submenu on hover regardless of its sibling
 * state.
 */
@Directive({
  selector: '[cdkMenuTriggerFor]',
  exportAs: 'cdkMenuTriggerFor',
  host: {
    'class': 'cdk-menu-trigger',
    'aria-haspopup': 'menu',
    '[attr.aria-expanded]': 'isOpen()',
    '(focusin)': '_setHasFocus(true)',
    '(focusout)': '_setHasFocus(false)',
    '(keydown)': '_toggleOnKeydown($event)',
    '(click)': 'toggle()',
  },
  inputs: ['menuTemplateRef: cdkMenuTriggerFor', 'menuPosition: cdkMenuPosition'],
  outputs: ['opened: cdkMenuOpened', 'closed: cdkMenuClosed'],
  providers: [
    {provide: MENU_TRIGGER, useExisting: CdkMenuTrigger},
    PARENT_OR_NEW_MENU_STACK_PROVIDER,
  ],
})
export class CdkMenuTrigger extends CdkMenuTriggerBase implements OnDestroy {
  constructor(
    /** The DI injector for this component. */
    injector: Injector,
    /** The host element. */
    private readonly _elementRef: ElementRef<HTMLElement>,
    /** The view container ref for this component. */
    viewContainerRef: ViewContainerRef,
    /** The CDK overlay service. */
    private readonly _overlay: Overlay,
    /** The Angular zone. */
    private readonly _ngZone: NgZone,
    /** The menu stack this trigger belongs to. */
    @Inject(MENU_STACK) menuStack: MenuStack,
    /** The parent menu this trigger belongs to. */
    @Optional() @Inject(CDK_MENU) private readonly _parentMenu?: Menu,
    /** The menu aim service used by this menu. */
    @Optional() @Inject(MENU_AIM) private readonly _menuAim?: MenuAim,
    /** The directionality of the page. */
    @Optional() private readonly _directionality?: Directionality,
  ) {
    super(injector, viewContainerRef, menuStack);
    this._registerCloseHandler();
    this._subscribeToMenuStackClosed();
    this._subscribeToMouseEnter();
    this._subscribeToMenuStackHasFocus();
  }

  /** Toggle the attached menu. */
  toggle() {
    this.isOpen() ? this.close() : this.open();
  }

  /** Open the attached menu. */
  open() {
    if (!this.isOpen()) {
      this.opened.next();

      this.overlayRef = this.overlayRef || this._overlay.create(this._getOverlayConfig());
      this.overlayRef.attach(this.getMenuContentPortal());
      this._subscribeToOutsideClicks();
    }
  }

  /** Close the opened menu. */
  close() {
    if (this.isOpen()) {
      this.closed.next();

      this.overlayRef!.detach();
    }
    this._closeSiblingTriggers();
  }

  /**
   * Get a reference to the rendered Menu if the Menu is open and rendered in the DOM.
   */
  getMenu(): Menu | undefined {
    return this.childMenu;
  }

  /**
   * Handles keyboard events for the menu item.
   * @param event The keyboard event to handle
   */
  _toggleOnKeydown(event: KeyboardEvent) {
    const isParentVertical = this._parentMenu?.orientation === 'vertical';
    const keyCode = event.keyCode;
    switch (keyCode) {
      case SPACE:
      case ENTER:
        if (!hasModifierKey(event)) {
          event.preventDefault();
          this.toggle();
          this.childMenu?.focusFirstItem('keyboard');
        }
        break;

      case RIGHT_ARROW:
        if (!hasModifierKey(event)) {
          if (this._parentMenu && isParentVertical && this._directionality?.value !== 'rtl') {
            event.preventDefault();
            this.open();
            this.childMenu?.focusFirstItem('keyboard');
          }
        }
        break;

      case LEFT_ARROW:
        if (!hasModifierKey(event)) {
          if (this._parentMenu && isParentVertical && this._directionality?.value === 'rtl') {
            event.preventDefault();
            this.open();
            this.childMenu?.focusFirstItem('keyboard');
          }
        }
        break;

      case DOWN_ARROW:
      case UP_ARROW:
        if (!hasModifierKey(event)) {
          if (!isParentVertical) {
            event.preventDefault();
            this.open();
            keyCode === DOWN_ARROW
              ? this.childMenu?.focusFirstItem('keyboard')
              : this.childMenu?.focusLastItem('keyboard');
          }
        }
        break;
    }
  }

  /**
   * Sets whether the trigger's menu stack has focus.
   * @param hasFocus Whether the menu stack has focus.
   */
  _setHasFocus(hasFocus: boolean) {
    if (!this._parentMenu) {
      this.menuStack.setHasFocus(hasFocus);
    }
  }

  /**
   * Subscribe to the mouseenter events and close any sibling menu items if this element is moused
   * into.
   */
  private _subscribeToMouseEnter() {
    // Closes any sibling menu items and opens the menu associated with this trigger.
    const toggleMenus = () =>
      this._ngZone.run(() => {
        this._closeSiblingTriggers();
        this.open();
      });

    this._ngZone.runOutsideAngular(() => {
      fromEvent(this._elementRef.nativeElement, 'mouseenter')
        .pipe(
          filter(() => !this.menuStack.isEmpty() && !this.isOpen()),
          takeUntil(this.destroyed),
        )
        .subscribe(() => {
          if (this._menuAim) {
            this._menuAim.toggle(toggleMenus);
          } else {
            toggleMenus();
          }
        });
    });
  }

  /** Close out any sibling menu trigger menus. */
  private _closeSiblingTriggers() {
    if (this._parentMenu) {
      // If nothing was removed from the stack and the last element is not the parent item
      // that means that the parent menu is a menu bar since we don't put the menu bar on the
      // stack
      const isParentMenuBar =
        !this.menuStack.closeSubMenuOf(this._parentMenu) &&
        this.menuStack.peek() !== this._parentMenu;

      if (isParentMenuBar) {
        this.menuStack.closeAll();
      }
    } else {
      this.menuStack.closeAll();
    }
  }

  /** Get the configuration object used to create the overlay. */
  private _getOverlayConfig() {
    return new OverlayConfig({
      positionStrategy: this._getOverlayPositionStrategy(),
      scrollStrategy: this._overlay.scrollStrategies.block(),
      direction: this._directionality,
    });
  }

  /** Build the position strategy for the overlay which specifies where to place the menu. */
  private _getOverlayPositionStrategy(): FlexibleConnectedPositionStrategy {
    return this._overlay
      .position()
      .flexibleConnectedTo(this._elementRef)
      .withPositions(this._getOverlayPositions());
  }

  /** Get the preferred positions for the opened menu relative to the menu item. */
  private _getOverlayPositions(): ConnectedPosition[] {
    return (
      this.menuPosition ??
      (!this._parentMenu || this._parentMenu.orientation === 'horizontal'
        ? STANDARD_DROPDOWN_BELOW_POSITIONS
        : STANDARD_DROPDOWN_ADJACENT_POSITIONS)
    );
  }

  /**
   * Subscribe to the MenuStack close events if this is a standalone trigger and close out the menu
   * this triggers when requested.
   */
  private _registerCloseHandler() {
    if (!this._parentMenu) {
      this.menuStack.closed.pipe(takeUntil(this.destroyed)).subscribe(({item}) => {
        if (item === this.childMenu) {
          this.close();
        }
      });
    }
  }

  /**
   * Subscribe to the overlays outside pointer events stream and handle closing out the stack if a
   * click occurs outside the menus.
   */
  private _subscribeToOutsideClicks() {
    if (this.overlayRef) {
      this.overlayRef
        .outsidePointerEvents()
        .pipe(
          filter(
            e =>
              e.target != this._elementRef.nativeElement &&
              !this._elementRef.nativeElement.contains(e.target as Element),
          ),
          takeUntil(this.stopOutsideClicksListener),
        )
        .subscribe(event => {
          if (!this.isElementInsideMenuStack(event.target as Element)) {
            this.menuStack.closeAll();
          } else {
            this._closeSiblingTriggers();
          }
        });
    }
  }

  /** Subscribe to the MenuStack hasFocus events. */
  private _subscribeToMenuStackHasFocus() {
    if (!this._parentMenu) {
      this.menuStack.hasFocus.pipe(takeUntil(this.destroyed)).subscribe(hasFocus => {
        if (!hasFocus) {
          this.menuStack.closeAll();
        }
      });
    }
  }

  /** Subscribe to the MenuStack closed events. */
  private _subscribeToMenuStackClosed() {
    if (!this._parentMenu) {
      this.menuStack.closed.subscribe(({focusParentTrigger}) => {
        if (focusParentTrigger && !this.menuStack.length()) {
          this._elementRef.nativeElement.focus();
        }
      });
    }
  }
}
