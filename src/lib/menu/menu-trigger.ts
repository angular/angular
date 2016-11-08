import {
    AfterViewInit,
    Directive,
    ElementRef,
    EventEmitter,
    Input,
    OnDestroy,
    Optional,
    Output,
    Renderer,
    ViewContainerRef,
} from '@angular/core';
import {MdMenuPanel} from './menu-panel';
import {MdMenuMissingError} from './menu-errors';
import {
    isFakeMousedownFromScreenReader,
    Dir,
    LayoutDirection,
    Overlay,
    OverlayState,
    OverlayRef,
    TemplatePortal,
    ConnectedPositionStrategy,
    HorizontalConnectionPos,
    VerticalConnectionPos
} from '../core';
import { Subscription } from 'rxjs/Subscription';

/**
 * This directive is intended to be used in conjunction with an md-menu tag.  It is
 * responsible for toggling the display of the provided menu instance.
 */
@Directive({
  selector: '[md-menu-trigger-for]',
  host: {
    'aria-haspopup': 'true',
    '(mousedown)': '_handleMousedown($event)',
    '(click)': 'toggleMenu()',
  },
  exportAs: 'mdMenuTrigger'
})
export class MdMenuTrigger implements AfterViewInit, OnDestroy {
  private _portal: TemplatePortal;
  private _overlayRef: OverlayRef;
  private _menuOpen: boolean = false;
  private _backdropSubscription: Subscription;

  // tracking input type is necessary so it's possible to only auto-focus
  // the first item of the list when the menu is opened via the keyboard
  private _openedByMouse: boolean = false;

  @Input('md-menu-trigger-for') menu: MdMenuPanel;
  @Output() onMenuOpen = new EventEmitter<void>();
  @Output() onMenuClose = new EventEmitter<void>();

  constructor(private _overlay: Overlay, private _element: ElementRef,
              private _viewContainerRef: ViewContainerRef, private _renderer: Renderer,
              @Optional() private _dir: Dir) {}

  ngAfterViewInit() {
    this._checkMenu();
    this.menu.close.subscribe(() => this.closeMenu());
  }

  ngOnDestroy() { this.destroyMenu(); }

  get menuOpen(): boolean { return this._menuOpen; }

  toggleMenu(): void {
    return this._menuOpen ? this.closeMenu() : this.openMenu();
  }

  openMenu(): void {
    if (!this._menuOpen) {
      this._createOverlay();
      this._overlayRef.attach(this._portal);
      this._subscribeToBackdrop();
      this._initMenu();
    }
  }

  closeMenu(): void {
    if (this._overlayRef) {
      this._overlayRef.detach();
      this._backdropSubscription.unsubscribe();
      this._resetMenu();
    }
  }

  destroyMenu(): void {
    if (this._overlayRef) {
      this._overlayRef.dispose();
      this._overlayRef = null;

      if (this._backdropSubscription) {
        this._backdropSubscription.unsubscribe();
      }
    }
  }

  focus() {
    this._renderer.invokeElementMethod(this._element.nativeElement, 'focus');
  }

  /** The text direction of the containing app. */
  get dir(): LayoutDirection {
    return this._dir && this._dir.value === 'rtl' ? 'rtl' : 'ltr';
  }

  /**
   * This method ensures that the menu closes when the overlay backdrop is clicked.
   * We do not use first() here because doing so would not catch clicks from within
   * the menu, and it would fail to unsubscribe properly. Instead, we unsubscribe
   * explicitly when the menu is closed or destroyed.
   */
  private _subscribeToBackdrop(): void {
    this._backdropSubscription = this._overlayRef.backdropClick().subscribe(() => {
      this.closeMenu();
    });
  }

  /**
   * This method sets the menu state to open and focuses the first item if
   * the menu was opened via the keyboard.
   */
  private _initMenu(): void {
    this._setIsMenuOpen(true);

    // Should only set focus if opened via the keyboard, so keyboard users can
    // can easily navigate menu items. According to spec, mouse users should not
    // see the focus style.
    if (!this._openedByMouse) {
      this.menu.focusFirstItem();
    }
  };

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
  }

  /**
   *  This method checks that a valid instance of MdMenu has been passed into
   *  md-menu-trigger-for.  If not, an exception is thrown.
   */
  private _checkMenu() {
    if (!this.menu) {
      throw new MdMenuMissingError();
    }
  }

  /**
   *  This method creates the overlay from the provided menu's template and saves its
   *  OverlayRef so that it can be attached to the DOM when openMenu is called.
   */
  private _createOverlay(): void {
    if (!this._overlayRef) {
      this._portal = new TemplatePortal(this.menu.templateRef, this._viewContainerRef);
      this._overlayRef = this._overlay.create(this._getOverlayConfig());
    }
  }

  /**
   * This method builds the configuration object needed to create the overlay, the OverlayState.
   * @returns OverlayState
   */
  private _getOverlayConfig(): OverlayState {
    const overlayState = new OverlayState();
    overlayState.positionStrategy = this._getPosition()
                                        .withDirection(this.dir);
    overlayState.hasBackdrop = true;
    overlayState.backdropClass = 'md-overlay-transparent-backdrop';
    overlayState.direction = this.dir;
    return overlayState;
  }

  /**
   * This method builds the position strategy for the overlay, so the menu is properly connected
   * to the trigger.
   * @returns ConnectedPositionStrategy
   */
  private _getPosition(): ConnectedPositionStrategy  {
    const positionX: HorizontalConnectionPos = this.menu.positionX === 'before' ? 'end' : 'start';
    const positionY: VerticalConnectionPos = this.menu.positionY === 'above' ? 'bottom' : 'top';

    return this._overlay.position().connectedTo(
      this._element,
      {originX: positionX, originY: positionY},
      {overlayX: positionX, overlayY: positionY}
    );
  }

  _handleMousedown(event: MouseEvent): void {
    if (!isFakeMousedownFromScreenReader(event)) {
      this._openedByMouse = true;
    }
  }

}
