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
  Optional,
  Self,
  ElementRef,
  Output,
  EventEmitter,
  Inject,
  HostListener,
  NgZone,
  OnDestroy,
} from '@angular/core';
import {coerceBooleanProperty, BooleanInput} from '@angular/cdk/coercion';
import {FocusableOption} from '@angular/cdk/a11y';
import {SPACE, ENTER, RIGHT_ARROW, LEFT_ARROW} from '@angular/cdk/keycodes';
import {Directionality} from '@angular/cdk/bidi';
import {Subject, fromEvent} from 'rxjs';
import {takeUntil, filter} from 'rxjs/operators';
import {CdkMenuItemTrigger} from './menu-item-trigger';
import {Menu, CDK_MENU} from './menu-interface';
import {FocusNext} from './menu-stack';
import {FocusableElement} from './pointer-focus-tracker';
import {Toggler, MENU_AIM, MenuAim} from './menu-aim';

// TODO refactor this to be configurable allowing for custom elements to be removed
/** Removes all icons from within the given element. */
function removeIcons(element: Element) {
  for (const icon of Array.from(element.querySelectorAll('mat-icon, .material-icons'))) {
    icon.remove();
  }
}

/**
 * Directive which provides the ability for an element to be focused and navigated to using the
 * keyboard when residing in a CdkMenu, CdkMenuBar, or CdkMenuGroup. It performs user defined
 * behavior when clicked.
 */
@Directive({
  selector: '[cdkMenuItem]',
  exportAs: 'cdkMenuItem',
  host: {
    '[tabindex]': '_tabindex',
    'type': 'button',
    'role': 'menuitem',
    'class': 'cdk-menu-item',
    '[attr.aria-disabled]': 'disabled || null',
  },
})
export class CdkMenuItem implements FocusableOption, FocusableElement, Toggler, OnDestroy {
  /**  Whether the CdkMenuItem is disabled - defaults to false */
  @Input()
  get disabled(): boolean {
    return this._disabled;
  }
  set disabled(value: boolean) {
    this._disabled = coerceBooleanProperty(value);
  }
  private _disabled = false;

  /**
   * If this MenuItem is a regular MenuItem, outputs when it is triggered by a keyboard or mouse
   * event.
   */
  @Output('cdkMenuItemTriggered') readonly triggered: EventEmitter<void> = new EventEmitter();

  /**
   * The tabindex for this menu item managed internally and used for implementing roving a
   * tab index.
   */
  _tabindex: 0 | -1 = -1;

  /** Emits when the menu item is destroyed. */
  private readonly _destroyed = new Subject<void>();

  constructor(
    readonly _elementRef: ElementRef<HTMLElement>,
    private readonly _ngZone: NgZone,
    @Optional() @Inject(CDK_MENU) private readonly _parentMenu?: Menu,
    @Optional() @Inject(MENU_AIM) private readonly _menuAim?: MenuAim,
    @Optional() private readonly _dir?: Directionality,
    /** Reference to the CdkMenuItemTrigger directive if one is added to the same element */
    // `CdkMenuItem` is commonly used in combination with a `CdkMenuItemTrigger`.
    // tslint:disable-next-line: lightweight-tokens
    @Self() @Optional() private readonly _menuTrigger?: CdkMenuItemTrigger,
  ) {
    this._setupMouseEnter();

    if (this._isStandaloneItem()) {
      this._tabindex = 0;
    }
  }

  /** Place focus on the element. */
  focus() {
    this._elementRef.nativeElement.focus();
  }

  // In Ivy the `host` metadata will be merged, whereas in ViewEngine it is overridden. In order
  // to avoid double event listeners, we need to use `HostListener`. Once Ivy is the default, we
  // can move this back into `host`.
  // tslint:disable:no-host-decorator-in-concrete
  @HostListener('blur')
  @HostListener('mouseout')
  /** Reset the _tabindex to -1. */
  _resetTabIndex() {
    if (!this._isStandaloneItem()) {
      this._tabindex = -1;
    }
  }

  // In Ivy the `host` metadata will be merged, whereas in ViewEngine it is overridden. In order
  // to avoid double event listeners, we need to use `HostListener`. Once Ivy is the default, we
  // can move this back into `host`.
  // tslint:disable:no-host-decorator-in-concrete
  @HostListener('focus')
  @HostListener('mouseenter', ['$event'])
  /**
   * Set the tab index to 0 if not disabled and it's a focus event, or a mouse enter if this element
   * is not in a menu bar.
   */
  _setTabIndex(event?: MouseEvent) {
    if (this.disabled) {
      return;
    }

    // don't set the tabindex if there are no open sibling or parent menus
    if (!event || !this._getMenuStack()?.isEmpty()) {
      this._tabindex = 0;
    }
  }

  /** Whether this menu item is standalone or within a menu or menu bar. */
  _isStandaloneItem() {
    return !this._parentMenu;
  }

  // In Ivy the `host` metadata will be merged, whereas in ViewEngine it is overridden. In order
  // to avoid double event listeners, we need to use `HostListener`. Once Ivy is the default, we
  // can move this back into `host`.
  // tslint:disable:no-host-decorator-in-concrete
  @HostListener('click')
  /**
   * If the menu item is not disabled and the element does not have a menu trigger attached, emit
   * on the cdkMenuItemTriggered emitter and close all open menus.
   */
  trigger() {
    if (!this.disabled && !this.hasMenu()) {
      this.triggered.next();
      this._getMenuStack()?.closeAll();
    }
  }

  /** Whether the menu item opens a menu. */
  hasMenu() {
    return !!this._menuTrigger?.hasMenu();
  }

  /** Return true if this MenuItem has an attached menu and it is open. */
  isMenuOpen() {
    return !!this._menuTrigger?.isMenuOpen();
  }

  /**
   * Get a reference to the rendered Menu if the Menu is open and it is visible in the DOM.
   * @return the menu if it is open, otherwise undefined.
   */
  getMenu(): Menu | undefined {
    return this._menuTrigger?.getMenu();
  }

  /** Get the MenuItemTrigger associated with this element. */
  getMenuTrigger(): CdkMenuItemTrigger | undefined {
    return this._menuTrigger;
  }

  /** Get the label for this element which is required by the FocusableOption interface. */
  getLabel(): string {
    // TODO cloning the tree may be expensive; implement a better method
    // we know that the current node is an element type
    const clone = this._elementRef.nativeElement.cloneNode(true) as Element;
    removeIcons(clone);

    return clone.textContent?.trim() || '';
  }

  // In Ivy the `host` metadata will be merged, whereas in ViewEngine it is overridden. In order
  // to avoid double event listeners, we need to use `HostListener`. Once Ivy is the default, we
  // can move this back into `host`.
  // tslint:disable:no-host-decorator-in-concrete
  @HostListener('keydown', ['$event'])
  /**
   * Handles keyboard events for the menu item, specifically either triggering the user defined
   * callback or opening/closing the current menu based on whether the left or right arrow key was
   * pressed.
   * @param event the keyboard event to handle
   */
  _onKeydown(event: KeyboardEvent) {
    switch (event.keyCode) {
      case SPACE:
      case ENTER:
        event.preventDefault();
        this.trigger();
        break;

      case RIGHT_ARROW:
        if (this._parentMenu && this._isParentVertical() && !this.hasMenu()) {
          event.preventDefault();
          this._dir?.value === 'rtl'
            ? this._getMenuStack()?.close(this._parentMenu, FocusNext.previousItem)
            : this._getMenuStack()?.closeAll(FocusNext.nextItem);
        }
        break;

      case LEFT_ARROW:
        if (this._parentMenu && this._isParentVertical() && !this.hasMenu()) {
          event.preventDefault();
          this._dir?.value === 'rtl'
            ? this._getMenuStack()?.closeAll(FocusNext.nextItem)
            : this._getMenuStack()?.close(this._parentMenu, FocusNext.previousItem);
        }
        break;
    }
  }

  /**
   * Subscribe to the mouseenter events and close any sibling menu items if this element is moused
   * into.
   */
  private _setupMouseEnter() {
    if (!this._isStandaloneItem()) {
      const closeOpenSiblings = () =>
        this._ngZone.run(() => this._getMenuStack()?.closeSubMenuOf(this._parentMenu!));

      this._ngZone.runOutsideAngular(() =>
        fromEvent(this._elementRef.nativeElement, 'mouseenter')
          .pipe(
            filter(() => !this._getMenuStack()?.isEmpty() && !this.hasMenu()),
            takeUntil(this._destroyed),
          )
          .subscribe(() => {
            if (this._menuAim) {
              this._menuAim.toggle(closeOpenSiblings);
            } else {
              closeOpenSiblings();
            }
          }),
      );
    }
  }

  /**
   * Return true if the enclosing parent menu is configured in a horizontal orientation, false
   * otherwise or if no parent.
   */
  private _isParentVertical() {
    return this._parentMenu?.orientation === 'vertical';
  }

  /** Get the MenuStack from the parent menu. */
  private _getMenuStack() {
    // We use a function since at the construction of the MenuItemTrigger the parent Menu won't have
    // its menu stack set. Therefore we need to reference the menu stack from the parent each time
    // we want to use it.
    return this._parentMenu?._menuStack;
  }

  ngOnDestroy() {
    this._destroyed.next();
  }

  static ngAcceptInputType_disabled: BooleanInput;
}
