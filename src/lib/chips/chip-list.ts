import {
  AfterContentInit,
  ChangeDetectionStrategy,
  Component,
  ContentChildren,
  ElementRef,
  Input,
  ModuleWithProviders,
  NgModule,
  QueryList,
  ViewEncapsulation
} from '@angular/core';

import {MdChip} from './chip';
import {ListKeyManager} from '../core/a11y/list-key-manager';
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
  selector: 'md-chip-list',
  template: `<div class="md-chip-list-wrapper"><ng-content></ng-content></div>`,
  host: {
    // Properties
    'tabindex': '0',
    'role': 'listbox',
    'class': 'md-chip-list',

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

  /** The ListKeyManager which handles focus. */
  _keyManager: ListKeyManager;

  /** The chip components contained within this chip list. */
  chips: QueryList<MdChip>;

  constructor(private _elementRef: ElementRef) { }

  ngAfterContentInit(): void {
    this._keyManager = new ListKeyManager(this.chips).withFocusWrap();

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
    this._keyManager.focusFirstItem();
  }

  /** Passes relevant key presses to our key manager. */
  _keydown(event: KeyboardEvent) {
    let target = event.target as HTMLElement;

    // If they are on a chip, check for space/left/right, otherwise pass to our key manager
    if (target && target.classList.contains('md-chip')) {
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
          this._keyManager.focusPreviousItem();
          event.preventDefault();
          break;
        case RIGHT_ARROW:
          this._keyManager.focusNextItem();
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

    let focusedIndex = this._keyManager.focusedItemIndex;

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
        this._keyManager.updateFocusedItemIndex(chipIndex);
      }
    });

    // On destroy, remove the item from our list, and check focus
    chip.destroy.subscribe(() => {
      let chipIndex: number = this.chips.toArray().indexOf(chip);

      if (this._isValidIndex(chipIndex)) {
        // Check whether the chip is the last item
        if (chipIndex < this.chips.length - 1) {
          this._keyManager.setFocus(chipIndex);
        } else if (chipIndex - 1 >= 0) {
          this._keyManager.setFocus(chipIndex - 1);
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

@NgModule({
  imports: [],
  exports: [MdChipList, MdChip],
  declarations: [MdChipList, MdChip]
})
export class MdChipsModule {
  /** @deprecated */
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: MdChipsModule,
      providers: []
    };
  }
}
