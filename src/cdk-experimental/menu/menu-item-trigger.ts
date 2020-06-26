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
import {CdkMenuPanel} from './menu-panel';
import {Menu, CDK_MENU} from './menu-interface';

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
    'aria-haspopup': 'menu',
    '[attr.aria-expanded]': 'isMenuOpen()',
  },
})
export class CdkMenuItemTrigger implements OnDestroy {
  /** Template reference variable to the menu this trigger opens */
  @Input('cdkMenuTriggerFor') _menuPanel?: CdkMenuPanel;

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
    private readonly _directionality: Directionality,
    @Inject(CDK_MENU) private readonly _parentMenu: Menu
  ) {}

  /** Open/close the attached menu if the trigger has been configured with one */
  toggle() {
    if (this.hasMenu()) {
      this.isMenuOpen() ? this._closeMenu() : this._openMenu();
    }
  }

  /** Return true if the trigger has an attached menu */
  hasMenu() {
    return !!this._menuPanel;
  }

  /** Whether the menu this button is a trigger for is open */
  isMenuOpen() {
    return this._overlayRef ? this._overlayRef.hasAttached() : false;
  }

  /** Open the attached menu */
  private _openMenu() {
    this.opened.next();

    this._overlayRef = this._overlay.create(this._getOverlayConfig());
    this._overlayRef.attach(this._getPortal());
  }

  /** Close the opened menu */
  private _closeMenu() {
    if (this.isMenuOpen()) {
      this.closed.next();

      this._overlayRef!.detach();
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
    if (!this._panelContent || this._panelContent.templateRef !== this._menuPanel?._templateRef) {
      this._panelContent = new TemplatePortal(
        this._menuPanel!._templateRef,
        this._viewContainerRef
      );
    }
    return this._panelContent;
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
