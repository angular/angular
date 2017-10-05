/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {FocusableOption, FocusKeyManager} from '@angular/cdk/a11y';
import {coerceBooleanProperty} from '@angular/cdk/coercion';
import {SelectionModel} from '@angular/cdk/collections';
import {SPACE} from '@angular/cdk/keycodes';
import {
  AfterContentInit,
  Attribute,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ContentChildren,
  ElementRef,
  EventEmitter,
  forwardRef,
  Inject,
  Input,
  OnDestroy,
  OnInit,
  Optional,
  Output,
  QueryList,
  Renderer2,
  ViewEncapsulation,
} from '@angular/core';
import {
  CanDisable,
  CanDisableRipple,
  HasTabIndex,
  MatLine,
  MatLineSetter,
  mixinDisabled,
  mixinDisableRipple,
  mixinTabIndex,
} from '@angular/material/core';


/** @docs-private */
export class MatSelectionListBase {}
export const _MatSelectionListMixinBase =
  mixinTabIndex(mixinDisableRipple(mixinDisabled(MatSelectionListBase)));

/** @docs-private */
export class MatListOptionBase {}
export const _MatListOptionMixinBase = mixinDisableRipple(MatListOptionBase);

/** Event emitted by a selection-list whenever the state of an option is changed. */
export interface MatSelectionListOptionEvent {
  option: MatListOption;
}

/**
 * Component for list-options of selection-list. Each list-option can automatically
 * generate a checkbox and can put current item into the selectionModel of selection-list
 * if the current item is checked.
 */
@Component({
  moduleId: module.id,
  selector: 'mat-list-option',
  exportAs: 'matListOption',
  inputs: ['disableRipple'],
  host: {
    'role': 'option',
    'class': 'mat-list-item mat-list-option',
    '(focus)': '_handleFocus()',
    '(blur)': '_hasFocus = false',
    '(click)': '_handleClick()',
    'tabindex': '-1',
    '[class.mat-list-item-disabled]': 'disabled',
    '[class.mat-list-item-focus]': '_hasFocus',
    '[attr.aria-selected]': 'selected.toString()',
    '[attr.aria-disabled]': 'disabled.toString()',
  },
  templateUrl: 'list-option.html',
  encapsulation: ViewEncapsulation.None,
  preserveWhitespaces: false,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MatListOption extends _MatListOptionMixinBase
    implements AfterContentInit, OnInit, OnDestroy, FocusableOption, CanDisableRipple {
  private _lineSetter: MatLineSetter;
  private _selected: boolean = false;
  private _disabled: boolean = false;

  /** Whether the option has focus. */
  _hasFocus: boolean = false;

  @ContentChildren(MatLine) _lines: QueryList<MatLine>;

  /** Whether the label should appear before or after the checkbox. Defaults to 'after' */
  @Input() checkboxPosition: 'before' | 'after' = 'after';

  /** Value of the option */
  @Input() value: any;

  /** Whether the option is disabled. */
  @Input()
  get disabled() { return (this.selectionList && this.selectionList.disabled) || this._disabled; }
  set disabled(value: any) { this._disabled = coerceBooleanProperty(value); }

  /** Whether the option is selected. */
  @Input()
  get selected() { return this._selected; }
  set selected(value: boolean) {
    const isSelected = coerceBooleanProperty(value);

    if (isSelected !== this._selected) {
      const selectionModel = this.selectionList.selectedOptions;

      this._selected = isSelected;
      isSelected ? selectionModel.select(this) : selectionModel.deselect(this);
      this._changeDetector.markForCheck();
    }
  }

  /** Emitted when the option is selected. */
  @Output() selectChange = new EventEmitter<MatSelectionListOptionEvent>();

  /** Emitted when the option is deselected. */
  @Output() deselected = new EventEmitter<MatSelectionListOptionEvent>();

  constructor(private _renderer: Renderer2,
              private _element: ElementRef,
              private _changeDetector: ChangeDetectorRef,
              @Optional() @Inject(forwardRef(() => MatSelectionList))
              public selectionList: MatSelectionList) {
    super();
  }

  ngOnInit() {
    if (this.selected) {
      this.selectionList.selectedOptions.select(this);
    }
  }

  ngAfterContentInit() {
    this._lineSetter = new MatLineSetter(this._lines, this._renderer, this._element);

    if (this.selectionList.disabled) {
      this.disabled = true;
    }
  }

  ngOnDestroy(): void {
    this.selectionList._removeOptionFromList(this);
  }

  /** Toggles the selection state of the option. */
  toggle(): void {
    this.selected = !this.selected;
  }

  /** Allows for programmatic focusing of the option. */
  focus(): void {
    this._element.nativeElement.focus();
  }

  /** Whether this list item should show a ripple effect when clicked.  */
  _isRippleDisabled() {
    return this.disabled || this.disableRipple || this.selectionList.disableRipple;
  }

  _handleClick() {
    if (!this.disabled) {
      this.toggle();
    }
  }

  _handleFocus() {
    this._hasFocus = true;
    this.selectionList._setFocusedOption(this);
  }

  /** Retrieves the DOM element of the component host. */
  _getHostElement(): HTMLElement {
    return this._element.nativeElement;
  }
}


/**
 * Material Design list component where each item is a selectable option. Behaves as a listbox.
 */
@Component({
  moduleId: module.id,
  selector: 'mat-selection-list',
  exportAs: 'matSelectionList',
  inputs: ['disabled', 'disableRipple', 'tabIndex'],
  host: {
    'role': 'listbox',
    '[tabIndex]': 'tabIndex',
    'class': 'mat-selection-list',
    '(focus)': 'focus()',
    '(keydown)': '_keydown($event)',
    '[attr.aria-disabled]': 'disabled.toString()'},
  template: '<ng-content></ng-content>',
  styleUrls: ['list.css'],
  encapsulation: ViewEncapsulation.None,
  preserveWhitespaces: false,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MatSelectionList extends _MatSelectionListMixinBase implements FocusableOption,
    CanDisable, CanDisableRipple, HasTabIndex, AfterContentInit {

  /** The FocusKeyManager which handles focus. */
  _keyManager: FocusKeyManager<MatListOption>;

  /** The option components contained within this selection-list. */
  @ContentChildren(MatListOption) options: QueryList<MatListOption>;

  /** The currently selected options. */
  selectedOptions: SelectionModel<MatListOption> = new SelectionModel<MatListOption>(true);

  constructor(private _element: ElementRef, @Attribute('tabindex') tabIndex: string) {
    super();

    this.tabIndex = parseInt(tabIndex) || 0;
  }

  ngAfterContentInit(): void {
    this._keyManager = new FocusKeyManager<MatListOption>(this.options).withWrap();
  }

  /** Focus the selection-list. */
  focus() {
    this._element.nativeElement.focus();
  }

  /** Selects all of the options. */
  selectAll() {
    this.options.forEach(option => {
      if (!option.selected) {
        option.toggle();
      }
    });
  }

  /** Deselects all of the options. */
  deselectAll() {
    this.options.forEach(option => {
      if (option.selected) {
        option.toggle();
      }
    });
  }

  /** Sets the focused option of the selection-list. */
  _setFocusedOption(option: MatListOption) {
    this._keyManager.updateActiveItemIndex(this._getOptionIndex(option));
  }

  /** Removes an option from the selection list and updates the active item. */
  _removeOptionFromList(option: MatListOption) {
    if (option._hasFocus) {
      const optionIndex = this._getOptionIndex(option);

      // Check whether the option is the last item
      if (optionIndex > 0) {
        this._keyManager.setPreviousItemActive();
      } else if (optionIndex === 0 && this.options.length > 1) {
        this._keyManager.setNextItemActive();
      }
    }
  }

  /** Passes relevant key presses to our key manager. */
  _keydown(event: KeyboardEvent) {
    switch (event.keyCode) {
      case SPACE:
        this._toggleSelectOnFocusedOption();
        // Always prevent space from scrolling the page since the list has focus
        event.preventDefault();
        break;
      default:
        this._keyManager.onKeydown(event);
    }
  }

  /** Toggles the selected state of the currently focused option. */
  private _toggleSelectOnFocusedOption(): void {
    let focusedIndex = this._keyManager.activeItemIndex;

    if (focusedIndex != null && this._isValidIndex(focusedIndex)) {
      let focusedOption: MatListOption = this.options.toArray()[focusedIndex];

      if (focusedOption) {
        focusedOption.toggle();
      }
    }
  }

  /**
   * Utility to ensure all indexes are valid.
   *
   * @param index The index to be checked.
   * @returns True if the index is valid for our list of options.
   */
  private _isValidIndex(index: number): boolean {
    return index >= 0 && index < this.options.length;
  }

  /** Returns the index of the specified list option. */
  private _getOptionIndex(option: MatListOption): number {
    return this.options.toArray().indexOf(option);
  }
}
