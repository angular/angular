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
  ElementRef,
  ViewContainerRef,
  Inject,
  OnDestroy,
  Optional,
} from '@angular/core';
import {Directionality} from '@angular/cdk/bidi';
import {TemplatePortal} from '@angular/cdk/portal';
import {
  OverlayRef,
  Overlay,
  OverlayConfig,
  ConnectedPosition,
  FlexibleConnectedPositionStrategy,
} from '@angular/cdk/overlay';
import {SPACE, ENTER, RIGHT_ARROW, LEFT_ARROW, DOWN_ARROW, UP_ARROW} from '@angular/cdk/keycodes';
import {CdkMenuPanel} from './menu-panel';
import {Menu, CDK_MENU} from './menu-interface';
import {FocusNext} from './menu-stack';

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
  selector: '[cdkMenuItem][cdkMenuTriggerFor]',
  exportAs: 'cdkMenuTriggerFor',
  host: {
    '(keydown)': '_toggleOnKeydown($event)',
    'tabindex': '-1',
    'aria-haspopup': 'menu',
    '[attr.aria-expanded]': 'isMenuOpen()',
  },
})
export class CdkMenuItemTrigger implements OnDestroy {
  /** Template reference variable to the menu this trigger opens */
  @Input('cdkMenuTriggerFor')
  get menuPanel(): CdkMenuPanel | undefined {
    return this._menuPanel;
  }
  set menuPanel(panel: CdkMenuPanel | undefined) {
    this._menuPanel = panel;

    if (this._menuPanel) {
      this._menuPanel._menuStack = this._getMenuStack();
    }
  }

  /** Reference to the MenuPanel this trigger toggles. */
  private _menuPanel?: CdkMenuPanel;

  /** Emits when the attached menu is requested to open */
  @Output('cdkMenuOpened') readonly opened: EventEmitter<void> = new EventEmitter();

  /** Emits when the attached menu is requested to close */
  @Output('cdkMenuClosed') readonly closed: EventEmitter<void> = new EventEmitter();

  /** A reference to the overlay which manages the triggered menu */
  private _overlayRef: OverlayRef | null = null;

  /** The content of the menu panel opened by this trigger. */
  private _panelContent: TemplatePortal;

  constructor(
    private readonly _elementRef: ElementRef<HTMLElement>,
    protected readonly _viewContainerRef: ViewContainerRef,
    private readonly _overlay: Overlay,
    @Inject(CDK_MENU) private readonly _parentMenu: Menu,
    @Optional() private readonly _directionality?: Directionality
  ) {}

  /** Open/close the attached menu if the trigger has been configured with one */
  toggle() {
    if (this.hasMenu()) {
      this.isMenuOpen() ? this.closeMenu() : this.openMenu();
    }
  }

  /** Open the attached menu. */
  openMenu() {
    if (!this.isMenuOpen()) {
      this.opened.next();

      this._overlayRef = this._overlayRef || this._overlay.create(this._getOverlayConfig());
      this._overlayRef.attach(this._getPortal());
    }
  }

  /** Close the opened menu. */
  closeMenu() {
    if (this.isMenuOpen()) {
      this.closed.next();

      this._overlayRef!.detach();
    }
    this._getMenuStack().closeSubMenuOf(this._parentMenu);
  }

  /** Return true if the trigger has an attached menu */
  hasMenu() {
    return !!this.menuPanel;
  }

  /** Whether the menu this button is a trigger for is open */
  isMenuOpen() {
    return this._overlayRef ? this._overlayRef.hasAttached() : false;
  }

  /**
   * Get a reference to the rendered Menu if the Menu is open and it is visible in the DOM.
   * @return the menu if it is open, otherwise undefined.
   */
  getMenu(): Menu | undefined {
    return this.menuPanel?._menu;
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
        this.menuPanel?._menu?.focusFirstItem('keyboard');
        break;

      case RIGHT_ARROW:
        if (this._isParentVertical()) {
          event.preventDefault();
          if (this._directionality?.value === 'rtl') {
            this._getMenuStack().close(this._parentMenu, FocusNext.currentItem);
          } else {
            this.openMenu();
            this.menuPanel?._menu?.focusFirstItem('keyboard');
          }
        }
        break;

      case LEFT_ARROW:
        if (this._isParentVertical()) {
          event.preventDefault();
          if (this._directionality?.value === 'rtl') {
            this.openMenu();
            this.menuPanel?._menu?.focusFirstItem('keyboard');
          } else {
            this._getMenuStack().close(this._parentMenu, FocusNext.currentItem);
          }
        }
        break;

      case DOWN_ARROW:
      case UP_ARROW:
        if (!this._isParentVertical()) {
          event.preventDefault();
          this.openMenu();
          keyCode === DOWN_ARROW
            ? this.menuPanel?._menu?.focusFirstItem('keyboard')
            : this.menuPanel?._menu?.focusLastItem('keyboard');
        }
        break;
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
    // TODO: use a common positioning config from (possibly) cdk/overlay
    return this._parentMenu.orientation === 'horizontal'
      ? [
          {originX: 'start', originY: 'bottom', overlayX: 'start', overlayY: 'top'},
          {originX: 'start', originY: 'top', overlayX: 'start', overlayY: 'bottom'},
          {originX: 'end', originY: 'bottom', overlayX: 'end', overlayY: 'top'},
          {originX: 'end', originY: 'top', overlayX: 'end', overlayY: 'bottom'},
        ]
      : [
          {originX: 'end', originY: 'top', overlayX: 'start', overlayY: 'top'},
          {originX: 'end', originY: 'bottom', overlayX: 'start', overlayY: 'bottom'},
          {originX: 'start', originY: 'top', overlayX: 'end', overlayY: 'top'},
          {originX: 'start', originY: 'bottom', overlayX: 'end', overlayY: 'bottom'},
        ];
  }

  /**
   * Get the portal to be attached to the overlay which contains the menu. Allows for the menu
   * content to change dynamically and be reflected in the application.
   */
  private _getPortal() {
    const hasMenuContentChanged = this.menuPanel?._templateRef !== this._panelContent?.templateRef;
    if (this.menuPanel && (!this._panelContent || hasMenuContentChanged)) {
      this._panelContent = new TemplatePortal(this.menuPanel._templateRef, this._viewContainerRef);
    }

    return this._panelContent;
  }

  /**
   * @return true if if the enclosing parent menu is configured in a vertical orientation.
   */
  private _isParentVertical() {
    return this._parentMenu.orientation === 'vertical';
  }

  /** Get the menu stack from the parent. */
  private _getMenuStack() {
    // We use a function since at the construction of the MenuItemTrigger the parent Menu won't have
    // its menu stack set. Therefore we need to reference the menu stack from the parent each time
    // we want to use it.
    return this._parentMenu._menuStack;
  }

  ngOnDestroy() {
    this._destroyOverlay();
  }

  /** Destroy and unset the overlay reference it if exists */
  private _destroyOverlay() {
    if (this._overlayRef) {
      this._overlayRef.dispose();
      this._overlayRef = null;
    }
  }
}
