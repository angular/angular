/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {
  AfterContentInit,
  Directive,
  ElementRef,
  EventEmitter,
  Inject,
  NgZone,
  OnDestroy,
  Optional,
  Output,
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
import {takeUntil} from 'rxjs/operators';
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
    '[class.cdk-menu-inline]': '_isInline',
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

  override _isInline = !this._parentTrigger;

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
    if (!this._isInline) {
      this.menuStack.push(this);
    }
    this._parentTrigger?.registerChildMenu(this);
  }

  override ngAfterContentInit() {
    super.ngAfterContentInit();
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
          this.menuStack.close(this, {
            focusNextOnEmpty: FocusNext.currentItem,
            focusParentTrigger: true,
          });
        }
        break;

      case TAB:
        this.menuStack.closeAll({focusParentTrigger: true});
        break;

      default:
        keyManager.onKeydown(event);
    }
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

  private _subscribeToMenuStackEmptied() {
    this.menuStack.emptied
      .pipe(takeUntil(this.destroyed))
      .subscribe(event => this._toggleMenuFocus(event));
  }
}
