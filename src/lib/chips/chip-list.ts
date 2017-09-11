/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {
  AfterContentInit,
  ChangeDetectionStrategy,
  Component,
  ContentChildren,
  Input,
  QueryList,
  ViewEncapsulation,
  OnDestroy,
  Optional,
  ElementRef,
  Renderer2,
} from '@angular/core';

import {MdChip} from './chip';
import {FocusKeyManager} from '@angular/cdk/a11y';
import {BACKSPACE, DELETE, LEFT_ARROW, RIGHT_ARROW, UP_ARROW} from '../core/keyboard/keycodes';
import {Directionality} from '@angular/cdk/bidi';
import {Subscription} from 'rxjs/Subscription';
import {coerceBooleanProperty} from '@angular/cdk/coercion';

/**
 * A material design chips component (named ChipList for it's similarity to the List component).
 *
 * Example:
 *
 *     <md-chip-list>
 *       <md-chip>Chip 1<md-chip>
 *       <md-chip>Chip 2<md-chip>
 *     </md-chip-list>
 */
@Component({
  moduleId: module.id,
  selector: 'md-chip-list, mat-chip-list',
  template: `<div class="mat-chip-list-wrapper"><ng-content></ng-content></div>`,
  exportAs: 'mdChipList',
  host: {
    '[attr.tabindex]': '_tabIndex',
    'role': 'listbox',
    '[attr.aria-orientation]': 'ariaOrientation',
    'class': 'mat-chip-list',

    '(focus)': 'focus()',
    '(keydown)': '_keydown($event)'
  },
  queries: {
    chips: new ContentChildren(MdChip)
  },
  styleUrls: ['chips.css'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MdChipList implements AfterContentInit, OnDestroy {

  /** When a chip is destroyed, we track the index so we can focus the appropriate next chip. */
  protected _lastDestroyedIndex: number|null = null;

  /** Track which chips we're listening to for focus/destruction. */
  protected _chipSet: WeakMap<MdChip, boolean> = new WeakMap();

  /** Subscription to tabbing out from the chip list. */
  private _tabOutSubscription = Subscription.EMPTY;

  /** Whether or not the chip is selectable. */
  protected _selectable: boolean = true;

  protected _inputElement: HTMLInputElement;

  /** Tab index for the chip list. */
  _tabIndex = 0;

  /**
   * User defined tab index.
   * When it is not null, use user defined tab index. Otherwise use _tabIndex
   */
  _userTabIndex: number | null = null;

  /** The FocusKeyManager which handles focus. */
  _keyManager: FocusKeyManager<MdChip>;

  /** The chip components contained within this chip list. */
  chips: QueryList<MdChip>;

  /** Orientation of the chip list. */
  @Input('aria-orientation') ariaOrientation: 'horizontal' | 'vertical' = 'horizontal';

  constructor(protected _renderer: Renderer2, protected _elementRef: ElementRef,
              @Optional() private _dir: Directionality) {
  }

  ngAfterContentInit(): void {
    this._keyManager = new FocusKeyManager<MdChip>(this.chips).withWrap();

    // Prevents the chip list from capturing focus and redirecting
    // it back to the first chip when the user tabs out.
    this._tabOutSubscription = this._keyManager.tabOut.subscribe(() => {
      this._tabIndex = -1;
      setTimeout(() => this._tabIndex = this._userTabIndex || 0);
    });

    // Go ahead and subscribe all of the initial chips
    this._subscribeChips(this.chips);

    // Make sure we set our tab index at the start
    this._updateTabIndex();

    // When the list changes, re-subscribe
    this.chips.changes.subscribe((chips: QueryList<MdChip>) => {
      this._subscribeChips(chips);

      // If we have 0 chips, attempt to focus an input (if available)
      if (chips.length === 0) {
        this._focusInput();
      }

      // Check to see if we need to update our tab index
      this._updateTabIndex();

      // Check to see if we have a destroyed chip and need to refocus
      this._updateFocusForDestroyedChips();
    });
  }

  ngOnDestroy(): void {
    this._tabOutSubscription.unsubscribe();
  }

  /**
   * Whether or not this chip is selectable. When a chip is not selectable,
   * it's selected state is always ignored.
   */
  @Input()
  get selectable(): boolean {
    return this._selectable;
  }

  set selectable(value: boolean) {
    this._selectable = coerceBooleanProperty(value);
  }

  @Input()
  set tabIndex(value: number) {
    this._userTabIndex = value;
    this._tabIndex = value;
  }

  /** Associates an HTML input element with this chip list. */
  registerInput(inputElement: HTMLInputElement) {
    this._inputElement = inputElement;
  }

  /**
   * Focuses the the first non-disabled chip in this chip list, or the associated input when there
   * are no eligible chips.
   */
  focus() {
    // TODO: ARIA says this should focus the first `selected` chip if any are selected.
    if (this.chips.length > 0) {
      this._keyManager.setFirstItemActive();
    } else {
      this._focusInput();
    }
  }

  /** Attempt to focus an input if we have one. */
  _focusInput() {
    if (this._inputElement) {
      this._inputElement.focus();
    }
  }

  /**
   * Pass events to the keyboard manager. Available here for tests.
   */
  _keydown(event: KeyboardEvent) {
    let code = event.keyCode;
    let target = event.target as HTMLElement;
    let isInputEmpty = this._isInputEmpty(target);
    let isRtl = this._dir && this._dir.value == 'rtl';

    let isPrevKey = (code === (isRtl ? RIGHT_ARROW : LEFT_ARROW));
    let isNextKey = (code === (isRtl ? LEFT_ARROW : RIGHT_ARROW));
    let isBackKey = (code === BACKSPACE || code == DELETE || code == UP_ARROW || isPrevKey);
    // If they are on an empty input and hit backspace/delete/left arrow, focus the last chip
    if (isInputEmpty && isBackKey) {
      this._keyManager.setLastItemActive();
      event.preventDefault();
      return;
    }

    // If they are on a chip, check for space/left/right, otherwise pass to our key manager (like
    // up/down keys)
    if (target && target.classList.contains('mat-chip')) {
      if (isPrevKey) {
        this._keyManager.setPreviousItemActive();
        event.preventDefault();
      } else if (isNextKey) {
        this._keyManager.setNextItemActive();
        event.preventDefault();
      } else {
        this._keyManager.onKeydown(event);
      }
    }
  }

  /**
   * Iterate through the list of chips and add them to our list of
   * subscribed chips.
   *
   * @param chips The list of chips to be subscribed.
   */
  protected _subscribeChips(chips: QueryList<MdChip>): void {
    chips.forEach(chip => this._addChip(chip));
  }

  /**
   * Check the tab index as you should not be allowed to focus an empty list.
   */
  protected _updateTabIndex(): void {
    // If we have 0 chips, we should not allow keyboard focus
    this._tabIndex = this._userTabIndex || (this.chips.length === 0 ? -1 : 0);
  }

  /**
   * Add a specific chip to our subscribed list. If the chip has
   * already been subscribed, this ensures it is only subscribed
   * once.
   *
   * @param chip The chip to be subscribed (or checked for existing
   * subscription).
   */
  protected _addChip(chip: MdChip) {
    // If we've already been subscribed to a parent, do nothing
    if (this._chipSet.has(chip)) {
      return;
    }

    // Watch for focus events outside of the keyboard navigation
    chip._onFocus.subscribe(() => {
      let chipIndex: number = this.chips.toArray().indexOf(chip);

      if (this._isValidIndex(chipIndex)) {
        this._keyManager.updateActiveItemIndex(chipIndex);
      }
    });

    // On destroy, remove the item from our list, and setup our destroyed focus check
    chip.destroy.subscribe(() => {
      let chipIndex: number = this.chips.toArray().indexOf(chip);
      if (this._isValidIndex(chipIndex)) {
        if (chip._hasFocus) {
          // Check whether the chip is the last item
          if (chipIndex < this.chips.length - 1) {
            this._keyManager.setActiveItem(chipIndex);
          } else if (chipIndex - 1 >= 0) {
            this._keyManager.setActiveItem(chipIndex - 1);
          }
        }
        if (this._keyManager.activeItemIndex === chipIndex) {
          this._lastDestroyedIndex = chipIndex;
        }

      }

      this._chipSet.delete(chip);
      chip.destroy.unsubscribe();
    });

    this._chipSet.set(chip, true);
  }

  /**
   * Checks to see if a focus chip was recently destroyed so that we can refocus the next closest
   * one.
   */
  protected _updateFocusForDestroyedChips() {
    let chipsArray = this.chips;

    if (this._lastDestroyedIndex != null && chipsArray.length > 0) {
      // Check whether the destroyed chip was the last item
      const newFocusIndex = Math.min(this._lastDestroyedIndex, chipsArray.length - 1);
      this._keyManager.setActiveItem(newFocusIndex);
      let focusChip = this._keyManager.activeItem;

      // Focus the chip
      if (focusChip) {
        focusChip.focus();
      }
    }

    // Reset our destroyed index
    this._lastDestroyedIndex = null;
  }

  /**
   * Utility to ensure all indexes are valid.
   *
   * @param index The index to be checked.
   * @returns True if the index is valid for our list of chips.
   */
  private _isValidIndex(index: number): boolean {
    return index >= 0 && index < this.chips.length;
  }

  private _isInputEmpty(element: HTMLElement): boolean {
    if (element && element.nodeName.toLowerCase() === 'input') {
      let input = element as HTMLInputElement;

      return !input.value;
    }

    return false;
  }
}
