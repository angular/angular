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
  inject,
  InjectFlags,
  Input,
  NgZone,
  OnDestroy,
  Output,
} from '@angular/core';
import {BooleanInput, coerceBooleanProperty} from '@angular/cdk/coercion';
import {FocusableOption} from '@angular/cdk/a11y';
import {ENTER, hasModifierKey, LEFT_ARROW, RIGHT_ARROW, SPACE} from '@angular/cdk/keycodes';
import {Directionality} from '@angular/cdk/bidi';
import {fromEvent, Subject} from 'rxjs';
import {filter, takeUntil} from 'rxjs/operators';
import {CdkMenuTrigger} from './menu-trigger';
import {CDK_MENU, Menu} from './menu-interface';
import {FocusNext, MENU_STACK} from './menu-stack';
import {FocusableElement} from './pointer-focus-tracker';
import {MENU_AIM, Toggler} from './menu-aim';

/**
 * Directive which provides the ability for an element to be focused and navigated to using the
 * keyboard when residing in a CdkMenu, CdkMenuBar, or CdkMenuGroup. It performs user defined
 * behavior when clicked.
 */
@Directive({
  selector: '[cdkMenuItem]',
  exportAs: 'cdkMenuItem',
  host: {
    'role': 'menuitem',
    'class': 'cdk-menu-item',
    '[tabindex]': '_tabindex',
    '[attr.aria-disabled]': 'disabled || null',
    '(blur)': '_resetTabIndex()',
    '(focus)': '_setTabIndex()',
    '(click)': 'trigger()',
    '(keydown)': '_onKeydown($event)',
  },
})
export class CdkMenuItem implements FocusableOption, FocusableElement, Toggler, OnDestroy {
  /** The directionality (text direction) of the current page. */
  protected readonly _dir = inject(Directionality, InjectFlags.Optional);

  /** The menu's native DOM host element. */
  readonly _elementRef: ElementRef<HTMLElement> = inject(ElementRef);

  /** The Angular zone. */
  protected _ngZone = inject(NgZone);

  /** The menu aim service used by this menu. */
  private readonly _menuAim = inject(MENU_AIM, InjectFlags.Optional);

  /** The stack of menus this menu belongs to. */
  private readonly _menuStack = inject(MENU_STACK);

  /** The parent menu in which this menuitem resides. */
  private readonly _parentMenu = inject(CDK_MENU, InjectFlags.Optional);

  /** Reference to the CdkMenuItemTrigger directive if one is added to the same element */
  private readonly _menuTrigger = inject(CdkMenuTrigger, InjectFlags.Optional | InjectFlags.Self);

  /**  Whether the CdkMenuItem is disabled - defaults to false */
  @Input('cdkMenuItemDisabled')
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
  @Input('cdkMenuitemTypeaheadLabel') typeaheadLabel: string | null;

  /**
   * If this MenuItem is a regular MenuItem, outputs when it is triggered by a keyboard or mouse
   * event.
   */
  @Output('cdkMenuItemTriggered') readonly triggered: EventEmitter<void> = new EventEmitter();

  /** Whether the menu item opens a menu. */
  readonly hasMenu = !!this._menuTrigger;

  /**
   * The tabindex for this menu item managed internally and used for implementing roving a
   * tab index.
   */
  _tabindex: 0 | -1 = -1;

  /** Whether the item should close the menu if triggered by the spacebar. */
  protected closeOnSpacebarTrigger = true;

  /** Emits when the menu item is destroyed. */
  protected readonly destroyed = new Subject<void>();

  constructor() {
    this._setupMouseEnter();
    this._setType();

    if (this._isStandaloneItem()) {
      this._tabindex = 0;
    }
  }

  ngOnDestroy() {
    this.destroyed.next();
    this.destroyed.complete();
  }

  /** Place focus on the element. */
  focus() {
    this._elementRef.nativeElement.focus();
  }

  /**
   * If the menu item is not disabled and the element does not have a menu trigger attached, emit
   * on the cdkMenuItemTriggered emitter and close all open menus.
   * @param options Options the configure how the item is triggered
   *   - keepOpen: specifies that the menu should be kept open after triggering the item.
   */
  trigger(options?: {keepOpen: boolean}) {
    const {keepOpen} = {...options};
    if (!this.disabled && !this.hasMenu) {
      this.triggered.next();
      if (!keepOpen) {
        this._menuStack.closeAll({focusParentTrigger: true});
      }
    }
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

  /** Get the CdkMenuTrigger associated with this element. */
  getMenuTrigger(): CdkMenuTrigger | null {
    return this._menuTrigger;
  }

  /** Get the label for this element which is required by the FocusableOption interface. */
  getLabel(): string {
    return this.typeaheadLabel || this._elementRef.nativeElement.textContent?.trim() || '';
  }

  /** Reset the tabindex to -1. */
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
        if (!hasModifierKey(event)) {
          this.trigger({keepOpen: event.keyCode === SPACE && !this.closeOnSpacebarTrigger});
        }
        break;

      case RIGHT_ARROW:
        if (!hasModifierKey(event)) {
          if (this._parentMenu && this._isParentVertical()) {
            if (this._dir?.value !== 'rtl') {
              this._forwardArrowPressed(event);
            } else {
              this._backArrowPressed(event);
            }
          }
        }
        break;

      case LEFT_ARROW:
        if (!hasModifierKey(event)) {
          if (this._parentMenu && this._isParentVertical()) {
            if (this._dir?.value !== 'rtl') {
              this._backArrowPressed(event);
            } else {
              this._forwardArrowPressed(event);
            }
          }
        }
        break;
    }
  }

  /** Whether this menu item is standalone or within a menu or menu bar. */
  private _isStandaloneItem() {
    return !this._parentMenu;
  }

  /**
   * Handles the user pressing the back arrow key.
   * @param event The keyboard event.
   */
  private _backArrowPressed(event: KeyboardEvent) {
    const parentMenu = this._parentMenu!;
    if (this._menuStack.hasInlineMenu() || this._menuStack.length() > 1) {
      event.preventDefault();
      this._menuStack.close(parentMenu, {
        focusNextOnEmpty:
          this._menuStack.inlineMenuOrientation() === 'horizontal'
            ? FocusNext.previousItem
            : FocusNext.currentItem,
        focusParentTrigger: true,
      });
    }
  }

  /**
   * Handles the user pressing the forward arrow key.
   * @param event The keyboard event.
   */
  private _forwardArrowPressed(event: KeyboardEvent) {
    if (!this.hasMenu && this._menuStack.inlineMenuOrientation() === 'horizontal') {
      event.preventDefault();
      this._menuStack.closeAll({
        focusNextOnEmpty: FocusNext.nextItem,
        focusParentTrigger: true,
      });
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
            filter(() => !this._menuStack.isEmpty() && !this.hasMenu),
            takeUntil(this.destroyed),
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

  /** Sets the `type` attribute of the menu item. */
  private _setType() {
    const element = this._elementRef.nativeElement;

    if (element.nodeName === 'BUTTON' && !element.getAttribute('type')) {
      // Prevent form submissions.
      element.setAttribute('type', 'button');
    }
  }
}
