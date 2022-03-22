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
  EventEmitter,
  Inject,
  Injector,
  Input,
  NgZone,
  OnDestroy,
  Optional,
  Output,
  SkipSelf,
  TemplateRef,
  ViewContainerRef,
} from '@angular/core';
import {Directionality} from '@angular/cdk/bidi';
import {TemplatePortal} from '@angular/cdk/portal';
import {
  ConnectedPosition,
  FlexibleConnectedPositionStrategy,
  Overlay,
  OverlayConfig,
  OverlayRef,
  STANDARD_DROPDOWN_ADJACENT_POSITIONS,
  STANDARD_DROPDOWN_BELOW_POSITIONS,
} from '@angular/cdk/overlay';
import {DOWN_ARROW, ENTER, LEFT_ARROW, RIGHT_ARROW, SPACE, UP_ARROW} from '@angular/cdk/keycodes';
import {fromEvent, merge, Subject} from 'rxjs';
import {filter, takeUntil} from 'rxjs/operators';
import {CDK_MENU, Menu} from './menu-interface';
import {FocusNext, MENU_STACK, MenuStack} from './menu-stack';
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
    '(keydown)': '_toggleOnKeydown($event)',
    '(click)': 'toggle()',
    'class': 'cdk-menu-trigger',
    'aria-haspopup': 'menu',
    '[attr.aria-expanded]': 'isMenuOpen()',
  },
  providers: [
    {provide: MENU_TRIGGER, useExisting: CdkMenuItemTrigger},
    {
      provide: MENU_STACK,
      deps: [[new Optional(), new SkipSelf(), new Inject(MENU_STACK)]],
      useFactory: (parentMenuStack?: MenuStack) => parentMenuStack || new MenuStack(),
    },
  ],
})
export class CdkMenuItemTrigger extends MenuTrigger implements OnDestroy {
  /** Template reference variable to the menu this trigger opens */
  @Input('cdkMenuTriggerFor')
  _menuTemplateRef?: TemplateRef<unknown>;

  /** A list of preferred menu positions to be used when constructing the `FlexibleConnectedPositionStrategy` for this trigger's menu. */
  @Input('cdkMenuPosition') menuPosition: ConnectedPosition[];

  /** Emits when the attached menu is requested to open */
  @Output('cdkMenuOpened') readonly opened: EventEmitter<void> = new EventEmitter();

  /** Emits when the attached menu is requested to close */
  @Output('cdkMenuClosed') readonly closed: EventEmitter<void> = new EventEmitter();

  /** A reference to the overlay which manages the triggered menu */
  private _overlayRef: OverlayRef | null = null;

  /** The content of the menu panel opened by this trigger. */
  private _menuPortal: TemplatePortal;

  /** Emits when this trigger is destroyed. */
  private readonly _destroyed: Subject<void> = new Subject();

  /** Emits when the outside pointer events listener on the overlay should be stopped. */
  private readonly _stopOutsideClicksListener = merge(this.closed, this._destroyed);

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
    this._subscribeToMouseEnter();
  }

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
      this._subscribeToOutsideClicks();
    }
  }

  /** Close the opened menu. */
  closeMenu() {
    if (this.isMenuOpen()) {
      this.closed.next();

      this._overlayRef!.detach();
    }
    this._closeSiblingTriggers();
  }

  /** Return true if the trigger has an attached menu */
  hasMenu() {
    return !!this._menuTemplateRef;
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
        this.openMenu();
      });

    this._ngZone.runOutsideAngular(() => {
      fromEvent(this._elementRef.nativeElement, 'mouseenter')
        .pipe(
          filter(() => !this.menuStack.isEmpty() && !this.isMenuOpen()),
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
        if (this._parentMenu && this._isParentVertical()) {
          event.preventDefault();
          if (this._directionality?.value === 'rtl') {
            this.menuStack.close(this._parentMenu, FocusNext.currentItem);
          } else {
            this.openMenu();
            this.childMenu?.focusFirstItem('keyboard');
          }
        }
        break;

      case LEFT_ARROW:
        if (this._parentMenu && this._isParentVertical()) {
          event.preventDefault();
          if (this._directionality?.value === 'rtl') {
            this.openMenu();
            this.childMenu?.focusFirstItem('keyboard');
          } else {
            this.menuStack.close(this._parentMenu, FocusNext.currentItem);
          }
        }
        break;

      case DOWN_ARROW:
      case UP_ARROW:
        if (!this._isParentVertical()) {
          event.preventDefault();
          this.openMenu();
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
      this.menuStack.closed.pipe(takeUntil(this._destroyed)).subscribe(item => {
        if (item === this.childMenu) {
          this.closeMenu();
        }
      });
    }
  }

  ngOnDestroy() {
    this._destroyOverlay();

    this._destroyed.next();
    this._destroyed.complete();
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

  /** Destroy and unset the overlay reference it if exists */
  private _destroyOverlay() {
    if (this._overlayRef) {
      this._overlayRef.dispose();
      this._overlayRef = null;
    }
  }
}
