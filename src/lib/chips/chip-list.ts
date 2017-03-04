import {
  AfterContentInit,
  ChangeDetectionStrategy,
  Component,
  ContentChildren,
  ElementRef,
  Input,
  QueryList,
  ViewEncapsulation
} from '@angular/core';

import {MdChip} from './chip';
import {FocusKeyManager} from '../core/a11y/focus-key-manager';
import {coerceBooleanProperty} from '../core/coercion/boolean-property';
import {SPACE, LEFT_ARROW, RIGHT_ARROW} from '../core/keyboard/keycodes';

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
  host: {
    // Properties
    'tabindex': '0',
    'role': 'listbox',
    '[class.mat-chip-list]': 'true',

    // Events
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
export class MdChipList implements AfterContentInit {

  /** Track which chips we're listening to for focus/destruction. */
  private _subscribed: WeakMap<MdChip, boolean> = new WeakMap();

  /** Whether or not the chip is selectable. */
  protected _selectable: boolean = true;

  /** The FocusKeyManager which handles focus. */
  _keyManager: FocusKeyManager;

  /** The chip components contained within this chip list. */
  chips: QueryList<MdChip>;

  constructor(private _elementRef: ElementRef) { }

  ngAfterContentInit(): void {
    this._keyManager = new FocusKeyManager(this.chips).withWrap();

    // Go ahead and subscribe all of the initial chips
    this._subscribeChips(this.chips);

    // When the list changes, re-subscribe
    this.chips.changes.subscribe((chips: QueryList<MdChip>) => {
      this._subscribeChips(chips);
    });
  }

  /**
   * Whether or not this chip is selectable. When a chip is not selectable,
   * it's selected state is always ignored.
   */
  @Input() get selectable(): boolean {
    return this._selectable;
  }

  set selectable(value: boolean) {
    this._selectable = coerceBooleanProperty(value);
  }

  /**
   * Programmatically focus the chip list. This in turn focuses the first
   * non-disabled chip in this chip list.
   */
  focus() {
    // TODO: ARIA says this should focus the first `selected` chip.
    this._keyManager.setFirstItemActive();
  }

  /** Passes relevant key presses to our key manager. */
  _keydown(event: KeyboardEvent) {
    let target = event.target as HTMLElement;

    // If they are on a chip, check for space/left/right, otherwise pass to our key manager
    if (target && target.classList.contains('mat-chip')) {
      switch (event.keyCode) {
        case SPACE:
          // If we are selectable, toggle the focused chip
          if (this.selectable) {
            this._toggleSelectOnFocusedChip();
          }

          // Always prevent space from scrolling the page since the list has focus
          event.preventDefault();
          break;
        case LEFT_ARROW:
          this._keyManager.setPreviousItemActive();
          event.preventDefault();
          break;
        case RIGHT_ARROW:
          this._keyManager.setNextItemActive();
          event.preventDefault();
          break;
        default:
          this._keyManager.onKeydown(event);
      }
    }
  }

  /** Toggles the selected state of the currently focused chip. */
  protected _toggleSelectOnFocusedChip(): void {
    // Allow disabling of chip selection
    if (!this.selectable) {
      return;
    }

    let focusedIndex = this._keyManager.activeItemIndex;

    if (this._isValidIndex(focusedIndex)) {
      let focusedChip: MdChip = this.chips.toArray()[focusedIndex];

      if (focusedChip) {
        focusedChip.toggleSelected();
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
   * Add a specific chip to our subscribed list. If the chip has
   * already been subscribed, this ensures it is only subscribed
   * once.
   *
   * @param chip The chip to be subscribed (or checked for existing
   * subscription).
   */
  protected _addChip(chip: MdChip) {
    // If we've already been subscribed to a parent, do nothing
    if (this._subscribed.has(chip)) {
      return;
    }

    // Watch for focus events outside of the keyboard navigation
    chip.onFocus.subscribe(() => {
      let chipIndex: number = this.chips.toArray().indexOf(chip);

      if (this._isValidIndex(chipIndex)) {
        this._keyManager.updateActiveItemIndex(chipIndex);
      }
    });

    // On destroy, remove the item from our list, and check focus
    chip.destroy.subscribe(() => {
      let chipIndex: number = this.chips.toArray().indexOf(chip);

      if (this._isValidIndex(chipIndex)) {
        // Check whether the chip is the last item
        if (chipIndex < this.chips.length - 1) {
          this._keyManager.setActiveItem(chipIndex);
        } else if (chipIndex - 1 >= 0) {
          this._keyManager.setActiveItem(chipIndex - 1);
        }
      }

      this._subscribed.delete(chip);
      chip.destroy.unsubscribe();
    });

    this._subscribed.set(chip, true);
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

}
