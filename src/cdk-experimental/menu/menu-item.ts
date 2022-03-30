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
  Input,
  NgZone,
  OnDestroy,
  Optional,
  Output,
  Self,
} from '@angular/core';
import {BooleanInput, coerceBooleanProperty} from '@angular/cdk/coercion';
import {FocusableOption} from '@angular/cdk/a11y';
import {ENTER, LEFT_ARROW, RIGHT_ARROW, SPACE} from '@angular/cdk/keycodes';
import {Directionality} from '@angular/cdk/bidi';
import {fromEvent, Subject} from 'rxjs';
import {filter, takeUntil} from 'rxjs/operators';
import {CdkMenuItemTrigger} from './menu-item-trigger';
import {CDK_MENU, Menu} from './menu-interface';
import {FocusNext, MENU_STACK, MenuStack} from './menu-stack';
import {FocusableElement} from './pointer-focus-tracker';
import {MENU_AIM, MenuAim, Toggler} from './menu-aim';

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
    '(blur)': '_resetTabIndex()',
    '(mouseout)': '_resetTabIndex()',
    '(focus)': '_setTabIndex()',
    '(mouseenter)': '_setTabIndex($event)',
    '(click)': 'trigger()',
    '(keydown)': '_onKeydown($event)',
  },
})
export class CdkMenuItem implements FocusableOption, FocusableElement, Toggler, OnDestroy {
  /**  Whether the CdkMenuItem is disabled - defaults to false */
  @Input()
  get disabled(): boolean {
    return this._disabled;
  }
  set disabled(value: BooleanInput) {
    this._disabled = coerceBooleanProperty(value);
  }
  private _disabled = false;

  /**
   * The text used to locate this item during menu typeahead. If not specified,
   * the `textContent` of the item will be used.
   */
  @Input() typeahead: string;

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
    @Inject(MENU_STACK) private readonly _menuStack: MenuStack,
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

  /** Reset the _tabindex to -1. */
  _resetTabIndex() {
    if (!this._isStandaloneItem()) {
      this._tabindex = -1;
    }
  }

  /**
   * Set the tab index to 0 if not disabled and it's a focus event, or a mouse enter if this element
   * is not in a menu bar.
   */
  _setTabIndex(event?: MouseEvent) {
    if (this.disabled) {
      return;
    }

    // don't set the tabindex if there are no open sibling or parent menus
    if (!event || !this._menuStack.isEmpty()) {
      this._tabindex = 0;
    }
  }

  /** Whether this menu item is standalone or within a menu or menu bar. */
  _isStandaloneItem() {
    return !this._parentMenu;
  }

  /**
   * If the menu item is not disabled and the element does not have a menu trigger attached, emit
   * on the cdkMenuItemTriggered emitter and close all open menus.
   */
  trigger() {
    if (!this.disabled && !this.hasMenu()) {
      this.triggered.next();
      this._menuStack.closeAll();
    }
  }

  /** Whether the menu item opens a menu. */
  hasMenu() {
    return !!this._menuTrigger;
  }

  /** Return true if this MenuItem has an attached menu and it is open. */
  isMenuOpen() {
    return !!this._menuTrigger?.isOpen();
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
    return this.typeahead || this._elementRef.nativeElement.textContent?.trim() || '';
  }

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
        if (this._parentMenu && this._isParentVertical()) {
          if (this._dir?.value === 'rtl') {
            if (this._menuStack.hasInlineMenu() || this._menuStack.length() > 1) {
              event.preventDefault();
              this._menuStack.close(this._parentMenu, FocusNext.previousItem);
            }
          } else if (!this.hasMenu()) {
            if (this._menuStack.hasInlineMenu()) {
              event.preventDefault();
              this._menuStack.closeAll(FocusNext.nextItem);
            }
          }
        }
        break;

      case LEFT_ARROW:
        if (this._parentMenu && this._isParentVertical()) {
          if (this._dir?.value !== 'rtl') {
            if (this._menuStack.hasInlineMenu() || this._menuStack.length() > 1) {
              event.preventDefault();
              this._menuStack.close(this._parentMenu, FocusNext.previousItem);
            }
          } else if (!this.hasMenu()) {
            if (this._menuStack.hasInlineMenu()) {
              event.preventDefault();
              this._menuStack.closeAll(FocusNext.nextItem);
            }
          }
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
        this._ngZone.run(() => this._menuStack.closeSubMenuOf(this._parentMenu!));

      this._ngZone.runOutsideAngular(() =>
        fromEvent(this._elementRef.nativeElement, 'mouseenter')
          .pipe(
            filter(() => !this._menuStack.isEmpty() && !this.hasMenu()),
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

  ngOnDestroy() {
    this._destroyed.next();
  }
}
