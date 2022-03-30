/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {
  AfterContentInit,
  ContentChildren,
  Directive,
  ElementRef,
  EventEmitter,
  Inject,
  NgZone,
  OnDestroy,
  Optional,
  Output,
  QueryList,
  Self,
} from '@angular/core';
import {
  DOWN_ARROW,
  ESCAPE,
  hasModifierKey,
  LEFT_ARROW,
  RIGHT_ARROW,
  TAB,
  UP_ARROW,
} from '@angular/cdk/keycodes';
import {Directionality} from '@angular/cdk/bidi';
import {take, takeUntil} from 'rxjs/operators';
import {CdkMenuGroup} from './menu-group';
import {CDK_MENU} from './menu-interface';
import {
  FocusNext,
  MENU_STACK,
  MenuStack,
  PARENT_OR_NEW_INLINE_MENU_STACK_PROVIDER,
} from './menu-stack';
import {PointerFocusTracker} from './pointer-focus-tracker';
import {MENU_AIM, MenuAim} from './menu-aim';
import {MENU_TRIGGER, MenuTrigger} from './menu-trigger';
import {CdkMenuBase} from './menu-base';

/**
 * Directive which configures the element as a Menu which should contain child elements marked as
 * CdkMenuItem or CdkMenuGroup. Sets the appropriate role and aria-attributes for a menu and
 * contains accessible keyboard and mouse handling logic.
 *
 * It also acts as a RadioGroup for elements marked with role `menuitemradio`.
 */
@Directive({
  selector: '[cdkMenu]',
  exportAs: 'cdkMenu',
  host: {
    'role': 'menu',
    'class': 'cdk-menu',
    '[tabindex]': '_isInline() ? 0 : null',
    '[class.cdk-menu-inline]': '_isInline()',
    '(keydown)': '_handleKeyEvent($event)',
  },
  providers: [
    {provide: CdkMenuGroup, useExisting: CdkMenu},
    {provide: CDK_MENU, useExisting: CdkMenu},
    PARENT_OR_NEW_INLINE_MENU_STACK_PROVIDER,
  ],
})
export class CdkMenu extends CdkMenuBase implements AfterContentInit, OnDestroy {
  /** Event emitted when the menu is closed. */
  @Output() readonly closed: EventEmitter<void> = new EventEmitter();

  /** List of nested CdkMenuGroup elements */
  @ContentChildren(CdkMenuGroup, {descendants: true})
  private readonly _nestedGroups: QueryList<CdkMenuGroup>;

  constructor(
    private readonly _ngZone: NgZone,
    elementRef: ElementRef<HTMLElement>,
    @Inject(MENU_STACK) menuStack: MenuStack,
    @Optional() @Inject(MENU_TRIGGER) private _parentTrigger?: MenuTrigger,
    @Self() @Optional() @Inject(MENU_AIM) private readonly _menuAim?: MenuAim,
    @Optional() dir?: Directionality,
  ) {
    super(elementRef, menuStack, dir);
    this.destroyed.subscribe(this.closed);
    if (!this._isInline()) {
      this.menuStack.push(this);
    }
    this._parentTrigger?.registerChildMenu(this);
  }

  override ngAfterContentInit() {
    super.ngAfterContentInit();
    this._completeChangeEmitter();
    this._subscribeToMenuStackEmptied();
    this._subscribeToMouseManager();
    this._menuAim?.initialize(this, this.pointerTracker!);
  }

  override ngOnDestroy() {
    super.ngOnDestroy();
    this.closed.complete();
    this.pointerTracker?.destroy();
  }

  /** Handle keyboard events for the Menu. */
  _handleKeyEvent(event: KeyboardEvent) {
    const keyManager = this.keyManager;
    switch (event.keyCode) {
      case LEFT_ARROW:
      case RIGHT_ARROW:
        if (this.isHorizontal()) {
          event.preventDefault();
          keyManager.setFocusOrigin('keyboard');
          keyManager.onKeydown(event);
        }
        break;

      case UP_ARROW:
      case DOWN_ARROW:
        if (!this.isHorizontal()) {
          event.preventDefault();
          keyManager.setFocusOrigin('keyboard');
          keyManager.onKeydown(event);
        }
        break;

      case ESCAPE:
        if (!hasModifierKey(event)) {
          event.preventDefault();
          this.menuStack.close(this, FocusNext.currentItem, true);
        }
        break;

      case TAB:
        this.menuStack.closeAll(undefined, true);
        break;

      default:
        keyManager.onKeydown(event);
    }
  }

  /**
   * Complete the change emitter if there are any nested MenuGroups or register to complete the
   * change emitter if a MenuGroup is rendered at some point
   */
  // TODO(mmalerba): This doesnt' quite work. It causes change events to stop
  //  firing for radio items directly in the menu if a second group of options
  //  is added in a menu-group.
  private _completeChangeEmitter() {
    if (this._hasNestedGroups()) {
      this.change.complete();
    } else {
      this._nestedGroups.changes.pipe(take(1)).subscribe(() => this.change.complete());
    }
  }

  /** Return true if there are nested CdkMenuGroup elements within the Menu */
  private _hasNestedGroups() {
    // view engine has a bug where @ContentChildren will return the current element
    // along with children if the selectors match - not just the children.
    // Here, if there is at least one element, we check to see if the first element is a CdkMenu in
    // order to ensure that we return true iff there are child CdkMenuGroup elements.
    return this._nestedGroups.length > 0 && !(this._nestedGroups.first instanceof CdkMenu);
  }

  /**
   * Set the PointerFocusTracker and ensure that when mouse focus changes the key manager is updated
   * with the latest menu item under mouse focus.
   */
  private _subscribeToMouseManager() {
    this._ngZone.runOutsideAngular(() => {
      this.pointerTracker = new PointerFocusTracker(this.items);
    });
  }

  /** Set focus the either the current, previous or next item based on the FocusNext event. */
  private _toggleMenuFocus(event: FocusNext | undefined) {
    const keyManager = this.keyManager;
    switch (event) {
      case FocusNext.nextItem:
        keyManager.setFocusOrigin('keyboard');
        keyManager.setNextItemActive();
        break;

      case FocusNext.previousItem:
        keyManager.setFocusOrigin('keyboard');
        keyManager.setPreviousItemActive();
        break;

      case FocusNext.currentItem:
        if (keyManager.activeItem) {
          keyManager.setFocusOrigin('keyboard');
          keyManager.setActiveItem(keyManager.activeItem);
        }
        break;
    }
  }

  /**
   * Return true if this menu is an inline menu. That is, it does not exist in a pop-up and is
   * always visible in the dom.
   */
  _isInline() {
    return !this._parentTrigger;
  }

  private _subscribeToMenuStackEmptied() {
    this.menuStack.emptied
      .pipe(takeUntil(this.destroyed))
      .subscribe(event => this._toggleMenuFocus(event));
  }
}
