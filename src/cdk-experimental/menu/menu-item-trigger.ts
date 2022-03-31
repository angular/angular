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
import {TemplatePortal} from '@angular/cdk/portal';
import {
  ConnectedPosition,
  FlexibleConnectedPositionStrategy,
  Overlay,
  OverlayConfig,
  STANDARD_DROPDOWN_ADJACENT_POSITIONS,
  STANDARD_DROPDOWN_BELOW_POSITIONS,
} from '@angular/cdk/overlay';
import {DOWN_ARROW, ENTER, LEFT_ARROW, RIGHT_ARROW, SPACE, UP_ARROW} from '@angular/cdk/keycodes';
import {fromEvent} from 'rxjs';
import {filter, takeUntil} from 'rxjs/operators';
import {CDK_MENU, Menu} from './menu-interface';
import {MENU_STACK, MenuStack, PARENT_OR_NEW_MENU_STACK_PROVIDER} from './menu-stack';
import {MENU_AIM, MenuAim} from './menu-aim';
import {MENU_TRIGGER, MenuTrigger} from './menu-trigger';

/**
 * Whether the target element is a menu item to be ignored by the overlay background click handler.
 */
export function isClickInsideMenuOverlay(target: Element): boolean {
  while (target?.parentElement) {
    const isOpenTrigger =
      target.getAttribute('aria-expanded') === 'true' &&
      target.classList.contains('cdk-menu-trigger');
    const isOverlayMenu =
      target.classList.contains('cdk-menu') && !target.classList.contains('cdk-menu-inline');

    if (isOpenTrigger || isOverlayMenu) {
      return true;
    }
    target = target.parentElement;
  }
  return false;
}

/**
 * A directive to be combined with CdkMenuItem which opens the Menu it is bound to. If the
 * element is in a top level MenuBar it will open the menu on click, or if a sibling is already
 * opened it will open on hover. If it is inside of a Menu it will open the attached Submenu on
 * hover regardless of its sibling state.
 *
 * The directive must be placed along with the `cdkMenuItem` directive in order to enable full
 * functionality.
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
  inputs: ['_menuTemplateRef: cdkMenuTriggerFor', 'menuPosition: cdkMenuPosition'],
  outputs: ['opened: cdkMenuOpened', 'closed: cdkMenuClosed'],
  providers: [
    {provide: MENU_TRIGGER, useExisting: CdkMenuItemTrigger},
    PARENT_OR_NEW_MENU_STACK_PROVIDER,
  ],
})
export class CdkMenuItemTrigger extends MenuTrigger implements OnDestroy {
  constructor(
    injector: Injector,
    private readonly _elementRef: ElementRef<HTMLElement>,
    protected readonly _viewContainerRef: ViewContainerRef,
    private readonly _overlay: Overlay,
    private readonly _ngZone: NgZone,
    @Inject(MENU_STACK) menuStack: MenuStack,
    @Optional() @Inject(CDK_MENU) private readonly _parentMenu?: Menu,
    @Optional() @Inject(MENU_AIM) private readonly _menuAim?: MenuAim,
    @Optional() private readonly _directionality?: Directionality,
  ) {
    super(injector, menuStack);
    this._registerCloseHandler();
    this._subscribeToMenuStackClosed();
    this._subscribeToMouseEnter();
    this._subscribeToHasFocus();
  }

  /** Open/close the attached menu if the trigger has been configured with one */
  toggle() {
    this.isOpen() ? this.close() : this.open();
  }

  /** Open the attached menu. */
  open() {
    if (!this.isOpen()) {
      this.opened.next();

      this._overlayRef = this._overlayRef || this._overlay.create(this._getOverlayConfig());
      this._overlayRef.attach(this._getPortal());
      this._subscribeToOutsideClicks();
    }
  }

  /** Close the opened menu. */
  close() {
    if (this.isOpen()) {
      this.closed.next();

      this._overlayRef!.detach();
    }
    this._closeSiblingTriggers();
  }

  /**
   * Get a reference to the rendered Menu if the Menu is open and it is visible in the DOM.
   * @return the menu if it is open, otherwise undefined.
   */
  getMenu(): Menu | undefined {
    return this.childMenu;
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
          takeUntil(this._destroyed),
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

  /**
   * Handles keyboard events for the menu item, specifically opening/closing the attached menu and
   * focusing the appropriate submenu item.
   * @param event the keyboard event to handle
   */
  _toggleOnKeydown(event: KeyboardEvent) {
    const keyCode = event.keyCode;
    switch (keyCode) {
      case SPACE:
      case ENTER:
        event.preventDefault();
        this.toggle();
        this.childMenu?.focusFirstItem('keyboard');
        break;

      case RIGHT_ARROW:
        if (this._parentMenu && this._isParentVertical() && this._directionality?.value !== 'rtl') {
          event.preventDefault();
          this.open();
          this.childMenu?.focusFirstItem('keyboard');
        }
        break;

      case LEFT_ARROW:
        if (this._parentMenu && this._isParentVertical() && this._directionality?.value === 'rtl') {
          event.preventDefault();
          this.open();
          this.childMenu?.focusFirstItem('keyboard');
        }
        break;

      case DOWN_ARROW:
      case UP_ARROW:
        if (!this._isParentVertical()) {
          event.preventDefault();
          this.open();
          keyCode === DOWN_ARROW
            ? this.childMenu?.focusFirstItem('keyboard')
            : this.childMenu?.focusLastItem('keyboard');
        }
        break;
    }
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

  /** Get the configuration object used to create the overlay */
  private _getOverlayConfig() {
    return new OverlayConfig({
      positionStrategy: this._getOverlayPositionStrategy(),
      scrollStrategy: this._overlay.scrollStrategies.block(),
      direction: this._directionality,
    });
  }

  /** Build the position strategy for the overlay which specifies where to place the menu */
  private _getOverlayPositionStrategy(): FlexibleConnectedPositionStrategy {
    return this._overlay
      .position()
      .flexibleConnectedTo(this._elementRef)
      .withPositions(this._getOverlayPositions());
  }

  /** Determine and return where to position the opened menu relative to the menu item */
  private _getOverlayPositions(): ConnectedPosition[] {
    return (
      this.menuPosition ??
      (!this._parentMenu || this._parentMenu.orientation === 'horizontal'
        ? STANDARD_DROPDOWN_BELOW_POSITIONS
        : STANDARD_DROPDOWN_ADJACENT_POSITIONS)
    );
  }

  /**
   * Get the portal to be attached to the overlay which contains the menu. Allows for the menu
   * content to change dynamically and be reflected in the application.
   */
  private _getPortal() {
    const hasMenuContentChanged = this._menuTemplateRef !== this._menuPortal?.templateRef;
    if (this._menuTemplateRef && (!this._menuPortal || hasMenuContentChanged)) {
      this._menuPortal = new TemplatePortal(
        this._menuTemplateRef,
        this._viewContainerRef,
        undefined,
        this.getChildMenuInjector(),
      );
    }

    return this._menuPortal;
  }

  /**
   * @return true if if the enclosing parent menu is configured in a vertical orientation.
   */
  private _isParentVertical() {
    return this._parentMenu?.orientation === 'vertical';
  }

  /**
   * Subscribe to the MenuStack close events if this is a standalone trigger and close out the menu
   * this triggers when requested.
   */
  private _registerCloseHandler() {
    if (!this._parentMenu) {
      this.menuStack.closed.pipe(takeUntil(this._destroyed)).subscribe(({item}) => {
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
    if (this._overlayRef) {
      this._overlayRef
        .outsidePointerEvents()
        .pipe(takeUntil(this._stopOutsideClicksListener))
        .subscribe(event => {
          if (!isClickInsideMenuOverlay(event.target as Element)) {
            this.menuStack.closeAll();
          }
        });
    }
  }

  private _subscribeToHasFocus() {
    if (!this._parentMenu) {
      this.menuStack.hasFocus.pipe(takeUntil(this._destroyed)).subscribe(hasFocus => {
        if (!hasFocus) {
          this.menuStack.closeAll();
        }
      });
    }
  }

  _setHasFocus(hasFocus: boolean) {
    if (!this._parentMenu) {
      this.menuStack.setHasFocus(hasFocus);
    }
  }

  private _subscribeToMenuStackClosed() {
    if (!this._parentMenu) {
      this.menuStack.closed.subscribe(({focusParentMenu}) => {
        if (focusParentMenu && !this.menuStack.length()) {
          this._elementRef.nativeElement.focus();
        }
      });
    }
  }
}
