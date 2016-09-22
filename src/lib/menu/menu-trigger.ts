import {
    Directive,
    ElementRef,
    Input,
    Output,
    EventEmitter,
    HostListener,
    ViewContainerRef,
    AfterViewInit,
    OnDestroy,
    Renderer
} from '@angular/core';
import {MdMenu} from './menu-directive';
import {MdMenuMissingError} from './menu-errors';
import {
    ENTER,
    Overlay,
    OverlayState,
    OverlayRef,
    TemplatePortal,
    ConnectedPositionStrategy,
    HorizontalConnectionPos,
    VerticalConnectionPos
} from '../core';

/**
 * This directive is intended to be used in conjunction with an md-menu tag.  It is
 * responsible for toggling the display of the provided menu instance.
 */
@Directive({
  selector: '[md-menu-trigger-for]',
  host: {
    'aria-haspopup': 'true',
    '(keydown)': '_handleKeydown($event)'
  },
  exportAs: 'mdMenuTrigger'
})
export class MdMenuTrigger implements AfterViewInit, OnDestroy {
  private _portal: TemplatePortal;
  private _overlayRef: OverlayRef;
  private _menuOpen: boolean = false;

  // tracking input type is necessary so it's possible to only auto-focus
  // the first item of the list when the menu is opened via the keyboard
  private _openedFromKeyboard: boolean = false;

  @Input('md-menu-trigger-for') menu: MdMenu;
  @Output() onMenuOpen = new EventEmitter();
  @Output() onMenuClose = new EventEmitter();

  constructor(private _overlay: Overlay, private _element: ElementRef,
              private _viewContainerRef: ViewContainerRef, private _renderer: Renderer) {}

  ngAfterViewInit() {
    this._checkMenu();
    this.menu.close.subscribe(() => this.closeMenu());
  }

  ngOnDestroy() { this.destroyMenu(); }

  get menuOpen(): boolean { return this._menuOpen; }

  @HostListener('click')
  toggleMenu(): void {
    return this._menuOpen ? this.closeMenu() : this.openMenu();
  }

  openMenu(): void {
    this._createOverlay();
    this._overlayRef.attach(this._portal);
    this._initMenu();
  }

  closeMenu(): void {
    if (this._overlayRef) {
      this._overlayRef.detach();
      this._resetMenu();
    }
  }

  destroyMenu(): void {
    if (this._overlayRef) {
      this._overlayRef.dispose();
      this._overlayRef = null;
    }
  }

  focus() {
    this._renderer.invokeElementMethod(this._element.nativeElement, 'focus');
  }

  /**
   * This method sets the menu state to open and focuses the first item if
   * the menu was opened via the keyboard.
   */
  private _initMenu(): void {
    this._setIsMenuOpen(true);

    if (this._openedFromKeyboard) {
      this.menu._focusFirstItem();
    }
  };

  /**
   * This method resets the menu when it's closed, most importantly restoring
   * focus to the menu trigger if the menu was opened via the keyboard.
   */
  private _resetMenu(): void {
    this._setIsMenuOpen(false);

    if (this._openedFromKeyboard) {
      this.focus();
      this._openedFromKeyboard = false;
    }
  }

  // set state rather than toggle to support triggers sharing a menu
  private _setIsMenuOpen(isOpen: boolean): void {
    this._menuOpen = isOpen;
    this.menu._setClickCatcher(isOpen);
    this._menuOpen ? this.onMenuOpen.emit(null) : this.onMenuClose.emit(null);
  }

  /**
   *  This method checks that a valid instance of MdMenu has been passed into
   *  md-menu-trigger-for.  If not, an exception is thrown.
   */
  private _checkMenu() {
    if (!this.menu || !(this.menu instanceof MdMenu)) {
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
    overlayState.positionStrategy = this._getPosition();
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

  // TODO: internal
  _handleKeydown(event: KeyboardEvent): void {
    if (event.keyCode === ENTER) {
      this._openedFromKeyboard = true;
    }
  }

}
