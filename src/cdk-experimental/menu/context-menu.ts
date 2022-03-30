/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {
  Directive,
  Inject,
  Injectable,
  Injector,
  Input,
  OnDestroy,
  Optional,
  ViewContainerRef,
} from '@angular/core';
import {Directionality} from '@angular/cdk/bidi';
import {
  FlexibleConnectedPositionStrategy,
  Overlay,
  OverlayConfig,
  STANDARD_DROPDOWN_BELOW_POSITIONS,
} from '@angular/cdk/overlay';
import {Portal, TemplatePortal} from '@angular/cdk/portal';
import {BooleanInput, coerceBooleanProperty} from '@angular/cdk/coercion';
import {merge, partition} from 'rxjs';
import {skip, takeUntil} from 'rxjs/operators';
import {MENU_STACK, MenuStack} from './menu-stack';
import {isClickInsideMenuOverlay} from './menu-item-trigger';
import {MENU_TRIGGER, MenuTrigger} from './menu-trigger';

// In cases where the first menu item in the context menu is a trigger the submenu opens on a
// hover event. We offset the context menu 2px by default to prevent this from occurring.
const CONTEXT_MENU_POSITIONS = STANDARD_DROPDOWN_BELOW_POSITIONS.map(position => {
  const offsetX = position.overlayX === 'start' ? 2 : -2;
  const offsetY = position.overlayY === 'top' ? 2 : -2;
  return {...position, offsetX, offsetY};
});

/** Tracks the last open context menu trigger across the entire application. */
@Injectable({providedIn: 'root'})
export class ContextMenuTracker {
  /** The last open context menu trigger. */
  private static _openContextMenuTrigger?: CdkContextMenuTrigger;

  /**
   * Close the previous open context menu and set the given one as being open.
   * @param trigger the trigger for the currently open Context Menu.
   */
  update(trigger: CdkContextMenuTrigger) {
    if (ContextMenuTracker._openContextMenuTrigger !== trigger) {
      ContextMenuTracker._openContextMenuTrigger?.close();
      ContextMenuTracker._openContextMenuTrigger = trigger;
    }
  }
}

/** The coordinates of where the context menu should open. */
export type ContextMenuCoordinates = {x: number; y: number};

/**
 * A directive which when placed on some element opens a the Menu it is bound to when a user
 * right-clicks within that element. It is aware of nested Context Menus and the lowest level
 * non-disabled context menu will trigger.
 */
@Directive({
  selector: '[cdkContextMenuTriggerFor]',
  exportAs: 'cdkContextMenuTriggerFor',
  host: {
    '(contextmenu)': '_openOnContextMenu($event)',
  },
  inputs: ['_menuTemplateRef: cdkContextMenuTriggerFor', 'menuPosition: cdkContextMenuPosition'],
  outputs: ['opened: cdkContextMenuOpened', 'closed: cdkContextMenuClosed'],
  providers: [
    {provide: MENU_TRIGGER, useExisting: CdkContextMenuTrigger},
    {provide: MENU_STACK, useClass: MenuStack},
  ],
})
export class CdkContextMenuTrigger extends MenuTrigger implements OnDestroy {
  /** Whether the context menu should be disabled. */
  @Input('cdkContextMenuDisabled')
  get disabled(): boolean {
    return this._disabled;
  }
  set disabled(value: BooleanInput) {
    this._disabled = coerceBooleanProperty(value);
  }
  private _disabled = false;

  constructor(
    injector: Injector,
    protected readonly _viewContainerRef: ViewContainerRef,
    private readonly _overlay: Overlay,
    private readonly _contextMenuTracker: ContextMenuTracker,
    @Inject(MENU_STACK) menuStack: MenuStack,
    @Optional() private readonly _directionality?: Directionality,
  ) {
    super(injector, menuStack);
    this._setMenuStackListener();
  }

  /**
   * Open the attached menu at the specified location.
   * @param coordinates where to open the context menu
   */
  open(coordinates: ContextMenuCoordinates) {
    this._open(coordinates, false);
  }

  private _open(coordinates: ContextMenuCoordinates, ignoreFirstOutsideAuxClick: boolean) {
    if (this.disabled) {
      return;
    } else if (this.isOpen()) {
      // since we're moving this menu we need to close any submenus first otherwise they end up
      // disconnected from this one.
      this.menuStack.closeSubMenuOf(this.childMenu!);

      (
        this._overlayRef!.getConfig().positionStrategy as FlexibleConnectedPositionStrategy
      ).setOrigin(coordinates);
      this._overlayRef!.updatePosition();
    } else {
      this.opened.next();

      if (this._overlayRef) {
        (
          this._overlayRef.getConfig().positionStrategy as FlexibleConnectedPositionStrategy
        ).setOrigin(coordinates);
        this._overlayRef.updatePosition();
      } else {
        this._overlayRef = this._overlay.create(this._getOverlayConfig(coordinates));
      }

      this._overlayRef.attach(this._getMenuContent());
      this._subscribeToOutsideClicks(ignoreFirstOutsideAuxClick);
    }
  }

  /** Close the opened menu. */
  close() {
    this.menuStack.closeAll();
  }

  /**
   * Open the context menu and close any previously open menus.
   * @param event the mouse event which opens the context menu.
   */
  _openOnContextMenu(event: MouseEvent) {
    if (!this.disabled) {
      // Prevent the native context menu from opening because we're opening a custom one.
      event.preventDefault();

      // Stop event propagation to ensure that only the closest enabled context menu opens.
      // Otherwise, any context menus attached to containing elements would *also* open,
      // resulting in multiple stacked context menus being displayed.
      event.stopPropagation();

      this._contextMenuTracker.update(this);
      this._open({x: event.clientX, y: event.clientY}, true);

      // A context menu can be triggered via a mouse right click or a keyboard shortcut.
      if (event.button === 2) {
        this.childMenu?.focusFirstItem('mouse');
      } else if (event.button === 0) {
        this.childMenu?.focusFirstItem('keyboard');
      } else {
        this.childMenu?.focusFirstItem('program');
      }
    }
  }

  /**
   * Get the configuration object used to create the overlay.
   * @param coordinates the location to place the opened menu
   */
  private _getOverlayConfig(coordinates: ContextMenuCoordinates) {
    return new OverlayConfig({
      positionStrategy: this._getOverlayPositionStrategy(coordinates),
      scrollStrategy: this._overlay.scrollStrategies.block(),
      direction: this._directionality,
    });
  }

  /**
   * Build the position strategy for the overlay which specifies where to place the menu.
   * @param coordinates the location to place the opened menu
   */
  private _getOverlayPositionStrategy(
    coordinates: ContextMenuCoordinates,
  ): FlexibleConnectedPositionStrategy {
    return this._overlay
      .position()
      .flexibleConnectedTo(coordinates)
      .withPositions(this.menuPosition ?? CONTEXT_MENU_POSITIONS);
  }

  /**
   * Get the portal to be attached to the overlay which contains the menu. Allows for the menu
   * content to change dynamically and be reflected in the application.
   */
  private _getMenuContent(): Portal<unknown> {
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

  /** Subscribe to the menu stack close events and close this menu when requested. */
  private _setMenuStackListener() {
    this.menuStack.closed.pipe(takeUntil(this._destroyed)).subscribe(item => {
      if (item === this.childMenu && this.isOpen()) {
        this.closed.next();
        this._overlayRef!.detach();
      }
    });
  }

  /**
   * Subscribe to the overlays outside pointer events stream and handle closing out the stack if a
   * click occurs outside the menus.
   */
  private _subscribeToOutsideClicks(ignoreFirstAuxClick: boolean) {
    if (this._overlayRef) {
      let outsideClicks = this._overlayRef.outsidePointerEvents();
      // If the menu was triggered by the `contextmenu` event, skip the first `auxclick` event
      // because it fires when the mouse is released on the same click that opened the menu.
      if (ignoreFirstAuxClick) {
        const [auxClicks, nonAuxClicks] = partition(outsideClicks, ({type}) => type === 'auxclick');
        outsideClicks = merge(nonAuxClicks, auxClicks.pipe(skip(1)));
      }
      outsideClicks.pipe(takeUntil(this._stopOutsideClicksListener)).subscribe(event => {
        if (!isClickInsideMenuOverlay(event.target as Element)) {
          this.menuStack.closeAll();
        }
      });
    }
  }
}
