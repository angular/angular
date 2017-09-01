/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {
  AfterViewInit,
  Directive,
  ElementRef,
  EventEmitter,
  Inject,
  InjectionToken,
  Input,
  OnDestroy,
  Optional,
  Output,
  Self,
  ViewContainerRef,
} from '@angular/core';
import {Direction, Directionality} from '@angular/cdk/bidi';
import {isFakeMousedownFromScreenReader} from '@angular/cdk/a11y';
import {TemplatePortal} from '@angular/cdk/portal';
import {LEFT_ARROW, RIGHT_ARROW} from '@angular/cdk/keycodes';
import {
  ConnectedPositionStrategy,
  HorizontalConnectionPos,
  Overlay,
  OverlayRef,
  OverlayState,
  RepositionScrollStrategy,
  VerticalConnectionPos,
  // This import is only used to define a generic type. The current TypeScript version incorrectly
  // considers such imports as unused (https://github.com/Microsoft/TypeScript/issues/14953)
  // tslint:disable-next-line:no-unused-variable
  ScrollStrategy,
} from '@angular/cdk/overlay';
import {filter, RxChain} from '@angular/cdk/rxjs';
import {MdMenu} from './menu-directive';
import {MdMenuItem} from './menu-item';
import {MdMenuPanel} from './menu-panel';
import {MenuPositionX, MenuPositionY} from './menu-positions';
import {throwMdMenuMissingError} from './menu-errors';
import {of as observableOf} from 'rxjs/observable/of';
import {merge} from 'rxjs/observable/merge';
import {Subscription} from 'rxjs/Subscription';

/** Injection token that determines the scroll handling while the menu is open. */
export const MD_MENU_SCROLL_STRATEGY =
    new InjectionToken<() => ScrollStrategy>('md-menu-scroll-strategy');

/** @docs-private */
export function MD_MENU_SCROLL_STRATEGY_PROVIDER_FACTORY(overlay: Overlay):
    () => RepositionScrollStrategy {
  return () => overlay.scrollStrategies.reposition();
}

/** @docs-private */
export const MD_MENU_SCROLL_STRATEGY_PROVIDER = {
  provide: MD_MENU_SCROLL_STRATEGY,
  deps: [Overlay],
  useFactory: MD_MENU_SCROLL_STRATEGY_PROVIDER_FACTORY,
};


// TODO(andrewseguin): Remove the kebab versions in favor of camelCased attribute selectors

/** Default top padding of the menu panel. */
export const MENU_PANEL_TOP_PADDING = 8;

/**
 * This directive is intended to be used in conjunction with an md-menu tag.  It is
 * responsible for toggling the display of the provided menu instance.
 */
@Directive({
  selector: `[md-menu-trigger-for], [mat-menu-trigger-for],
             [mdMenuTriggerFor], [matMenuTriggerFor]`,
  host: {
    'aria-haspopup': 'true',
    '(mousedown)': '_handleMousedown($event)',
    '(keydown)': '_handleKeydown($event)',
    '(click)': '_handleClick($event)',
  },
  exportAs: 'mdMenuTrigger'
})
export class MdMenuTrigger implements AfterViewInit, OnDestroy {
  private _portal: TemplatePortal<any>;
  private _overlayRef: OverlayRef | null = null;
  private _menuOpen: boolean = false;
  private _closeSubscription = Subscription.EMPTY;
  private _positionSubscription = Subscription.EMPTY;
  private _hoverSubscription = Subscription.EMPTY;

  // Tracking input type is necessary so it's possible to only auto-focus
  // the first item of the list when the menu is opened via the keyboard
  private _openedByMouse: boolean = false;

  /** @deprecated */
  @Input('md-menu-trigger-for')
  get _deprecatedMdMenuTriggerFor(): MdMenuPanel {
    return this.menu;
  }

  set _deprecatedMdMenuTriggerFor(v: MdMenuPanel) {
    this.menu = v;
  }

  /** @deprecated */
  @Input('mat-menu-trigger-for')
  get _deprecatedMatMenuTriggerFor(): MdMenuPanel {
    return this.menu;
  }

  set _deprecatedMatMenuTriggerFor(v: MdMenuPanel) {
    this.menu = v;
  }

  // Trigger input for compatibility mode
  @Input('matMenuTriggerFor')
  get _matMenuTriggerFor(): MdMenuPanel {
    return this.menu;
  }

  set _matMenuTriggerFor(v: MdMenuPanel) {
    this.menu = v;
  }

  /** References the menu instance that the trigger is associated with. */
  @Input('mdMenuTriggerFor') menu: MdMenuPanel;

  /** Event emitted when the associated menu is opened. */
  @Output() onMenuOpen = new EventEmitter<void>();

  /** Event emitted when the associated menu is closed. */
  @Output() onMenuClose = new EventEmitter<void>();

  constructor(private _overlay: Overlay,
              private _element: ElementRef,
              private _viewContainerRef: ViewContainerRef,
              @Inject(MD_MENU_SCROLL_STRATEGY) private _scrollStrategy,
              @Optional() private _parentMenu: MdMenu,
              @Optional() @Self() private _menuItemInstance: MdMenuItem,
              @Optional() private _dir: Directionality) {

    if (_menuItemInstance) {
      _menuItemInstance._triggersSubmenu = this.triggersSubmenu();
    }
  }

  ngAfterViewInit() {
    this._checkMenu();

    this.menu.close.subscribe(reason => {
      this.closeMenu();

      // If a click closed the menu, we should close the entire chain of nested menus.
      if (reason === 'click' && this._parentMenu) {
        this._parentMenu.close.emit(reason);
      }
    });

    if (this.triggersSubmenu()) {
      // Subscribe to changes in the hovered item in order to toggle the panel.
      this._hoverSubscription = filter
          .call(this._parentMenu.hover(), active => active === this._menuItemInstance)
          .subscribe(() => {
            this._openedByMouse = true;
            this.openMenu();
          });
    }
  }

  ngOnDestroy() {
    if (this._overlayRef) {
      this._overlayRef.dispose();
      this._overlayRef = null;
    }

    this._cleanUpSubscriptions();
  }

  /** Whether the menu is open. */
  get menuOpen(): boolean {
    return this._menuOpen;
  }

  /** The text direction of the containing app. */
  get dir(): Direction {
    return this._dir && this._dir.value === 'rtl' ? 'rtl' : 'ltr';
  }

  /** Whether the menu triggers a sub-menu or a top-level one. */
  triggersSubmenu(): boolean {
    return !!(this._menuItemInstance && this._parentMenu);
  }

  /** Toggles the menu between the open and closed states. */
  toggleMenu(): void {
    return this._menuOpen ? this.closeMenu() : this.openMenu();
  }

  /** Opens the menu. */
  openMenu(): void {
    if (!this._menuOpen) {
      this._createOverlay().attach(this._portal);
      this._closeSubscription = this._menuClosingActions().subscribe(() => this.menu.close.emit());
      this._initMenu();

      if (this.menu instanceof MdMenu) {
        this.menu._startAnimation();
      }
    }
  }

  /** Closes the menu. */
  closeMenu(): void {
    if (this._overlayRef && this.menuOpen) {
      this._resetMenu();
      this._overlayRef.detach();
      this._closeSubscription.unsubscribe();
      this.menu.close.emit();

      if (this.menu instanceof MdMenu) {
        this.menu._resetAnimation();
      }
    }
  }

  /** Focuses the menu trigger. */
  focus() {
    this._element.nativeElement.focus();
  }

  /**
   * This method sets the menu state to open and focuses the first item if
   * the menu was opened via the keyboard.
   */
  private _initMenu(): void {
    this.menu.parentMenu = this.triggersSubmenu() ? this._parentMenu : undefined;
    this.menu.direction = this.dir;
    this._setMenuElevation();
    this._setIsMenuOpen(true);

    // Should only set focus if opened via the keyboard, so keyboard users can
    // can easily navigate menu items. According to spec, mouse users should not
    // see the focus style.
    if (!this._openedByMouse) {
      this.menu.focusFirstItem();
    }
  }

  /** Updates the menu elevation based on the amount of parent menus that it has. */
  private _setMenuElevation(): void {
    if (this.menu.setElevation) {
      let depth = 0;
      let parentMenu = this.menu.parentMenu;

      while (parentMenu) {
        depth++;
        parentMenu = parentMenu.parentMenu;
      }

      this.menu.setElevation(depth);
    }
  }

  /**
   * This method resets the menu when it's closed, most importantly restoring
   * focus to the menu trigger if the menu was opened via the keyboard.
   */
  private _resetMenu(): void {
    this._setIsMenuOpen(false);

    // Focus only needs to be reset to the host element if the menu was opened
    // by the keyboard and manually shifted to the first menu item.
    if (!this._openedByMouse) {
      this.focus();
    }

    this._openedByMouse = false;
  }

  // set state rather than toggle to support triggers sharing a menu
  private _setIsMenuOpen(isOpen: boolean): void {
    this._menuOpen = isOpen;
    this._menuOpen ? this.onMenuOpen.emit() : this.onMenuClose.emit();

    if (this.triggersSubmenu()) {
      this._menuItemInstance._highlighted = isOpen;
    }
  }

  /**
   * This method checks that a valid instance of MdMenu has been passed into
   * mdMenuTriggerFor. If not, an exception is thrown.
   */
  private _checkMenu() {
    if (!this.menu) {
      throwMdMenuMissingError();
    }
  }

  /**
   * This method creates the overlay from the provided menu's template and saves its
   * OverlayRef so that it can be attached to the DOM when openMenu is called.
   */
  private _createOverlay(): OverlayRef {
    if (!this._overlayRef) {
      this._portal = new TemplatePortal(this.menu.templateRef, this._viewContainerRef);
      const config = this._getOverlayConfig();
      this._subscribeToPositions(config.positionStrategy as ConnectedPositionStrategy);
      this._overlayRef = this._overlay.create(config);
    }

    return this._overlayRef;
  }

  /**
   * This method builds the configuration object needed to create the overlay, the OverlayState.
   * @returns OverlayState
   */
  private _getOverlayConfig(): OverlayState {
    return new OverlayState({
      positionStrategy: this._getPosition(),
      hasBackdrop: !this.triggersSubmenu(),
      backdropClass: 'cdk-overlay-transparent-backdrop',
      direction: this.dir,
      scrollStrategy: this._scrollStrategy()
    });
  }

  /**
   * Listens to changes in the position of the overlay and sets the correct classes
   * on the menu based on the new position. This ensures the animation origin is always
   * correct, even if a fallback position is used for the overlay.
   */
  private _subscribeToPositions(position: ConnectedPositionStrategy): void {
    this._positionSubscription = position.onPositionChange.subscribe(change => {
      const posX: MenuPositionX = change.connectionPair.overlayX === 'start' ? 'after' : 'before';
      const posY: MenuPositionY = change.connectionPair.overlayY === 'top' ? 'below' : 'above';

      this.menu.setPositionClasses(posX, posY);
    });
  }

  /**
   * This method builds the position strategy for the overlay, so the menu is properly connected
   * to the trigger.
   * @returns ConnectedPositionStrategy
   */
  private _getPosition(): ConnectedPositionStrategy {
    let [originX, originFallbackX]: HorizontalConnectionPos[] =
        this.menu.xPosition === 'before' ? ['end', 'start'] : ['start', 'end'];

    let [overlayY, overlayFallbackY]: VerticalConnectionPos[] =
        this.menu.yPosition === 'above' ? ['bottom', 'top'] : ['top', 'bottom'];

    let [originY, originFallbackY] = [overlayY, overlayFallbackY];
    let [overlayX, overlayFallbackX] = [originX, originFallbackX];
    let offsetY = 0;

    if (this.triggersSubmenu()) {
      // When the menu is a sub-menu, it should always align itself
      // to the edges of the trigger, instead of overlapping it.
      overlayFallbackX = originX = this.menu.xPosition === 'before' ? 'start' : 'end';
      originFallbackX = overlayX = originX === 'end' ? 'start' : 'end';

      // TODO(crisbeto): this should be a function, once the overlay supports it.
      // Right now it will be wrong for the fallback positions.
      offsetY = overlayY === 'bottom' ? MENU_PANEL_TOP_PADDING : -MENU_PANEL_TOP_PADDING;
    } else if (!this.menu.overlapTrigger) {
      originY = overlayY === 'top' ? 'bottom' : 'top';
      originFallbackY = overlayFallbackY === 'top' ? 'bottom' : 'top';
    }

    return this._overlay.position()
        .connectedTo(this._element, {originX, originY}, {overlayX, overlayY})
        .withDirection(this.dir)
        .withOffsetY(offsetY)
        .withFallbackPosition(
            {originX: originFallbackX, originY},
            {overlayX: overlayFallbackX, overlayY})
        .withFallbackPosition(
            {originX, originY: originFallbackY},
            {overlayX, overlayY: overlayFallbackY})
        .withFallbackPosition(
            {originX: originFallbackX, originY: originFallbackY},
            {overlayX: overlayFallbackX, overlayY: overlayFallbackY});
  }

  /** Cleans up the active subscriptions. */
  private _cleanUpSubscriptions(): void {
    this._closeSubscription.unsubscribe();
    this._positionSubscription.unsubscribe();
    this._hoverSubscription.unsubscribe();
  }

  /** Returns a stream that emits whenever an action that should close the menu occurs. */
  private _menuClosingActions() {
    const backdrop = this._overlayRef!.backdropClick();
    const parentClose = this._parentMenu ? this._parentMenu.close : observableOf(null);
    const hover = this._parentMenu ? RxChain.from(this._parentMenu.hover())
        .call(filter, active => active !== this._menuItemInstance)
        .call(filter, () => this._menuOpen)
        .result() : observableOf(null);

    return merge(backdrop, parentClose, hover);
  }

  /** Handles mouse presses on the trigger. */
  _handleMousedown(event: MouseEvent): void {
    if (!isFakeMousedownFromScreenReader(event)) {
      this._openedByMouse = true;
    }
  }

  /** Handles key presses on the trigger. */
  _handleKeydown(event: KeyboardEvent): void {
    const keyCode = event.keyCode;

    if (this.triggersSubmenu() && (
            (keyCode === RIGHT_ARROW && this.dir === 'ltr') ||
            (keyCode === LEFT_ARROW && this.dir === 'rtl'))) {
      this.openMenu();
    }
  }

  /** Handles click events on the trigger. */
  _handleClick(event: MouseEvent): void {
    if (this.triggersSubmenu()) {
      // Stop event propagation to avoid closing the parent menu.
      event.stopPropagation();
      this.openMenu();
    } else {
      this.toggleMenu();
    }
  }

}
