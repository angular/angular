/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {BooleanInput, coerceBooleanProperty} from '@angular/cdk/coercion';
import {SelectionModel} from '@angular/cdk/collections';
import {
  ANIMATION_MODULE_TYPE,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ContentChildren,
  ElementRef,
  EventEmitter,
  Inject,
  InjectionToken,
  Input,
  NgZone,
  OnDestroy,
  OnInit,
  Optional,
  Output,
  QueryList,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import {
  MAT_RIPPLE_GLOBAL_OPTIONS,
  RippleGlobalOptions,
  ThemePalette,
} from '@angular/material-experimental/mdc-core';
import {MatListBase, MatListItemBase} from './list-base';
import {LIST_OPTION, ListOption, MatListOptionCheckboxPosition} from './list-option-types';
import {MatListItemLine, MatListItemTitle} from './list-item-sections';
import {Platform} from '@angular/cdk/platform';

/**
 * Injection token that can be used to reference instances of an `SelectionList`. It serves
 * as alternative token to an actual implementation which would result in circular references.
 * @docs-private
 */
export const SELECTION_LIST = new InjectionToken<SelectionList>('SelectionList');

/**
 * Interface describing the containing list of an list option. This is used to avoid
 * circular dependencies between the list-option and the selection list.
 * @docs-private
 */
export interface SelectionList extends MatListBase {
  multiple: boolean;
  color: ThemePalette;
  selectedOptions: SelectionModel<MatListOption>;
  compareWith: (o1: any, o2: any) => boolean;
  _value: string[] | null;
  _reportValueChange(): void;
  _emitChangeEvent(options: MatListOption[]): void;
  _onTouched(): void;
}

@Component({
  selector: 'mat-list-option',
  exportAs: 'matListOption',
  styleUrls: ['list-option.css'],
  host: {
    'class': 'mat-mdc-list-item mat-mdc-list-option mdc-list-item',
    'role': 'option',
    // As per MDC, only list items in single selection mode should receive the `--selected`
    // class. For multi selection, the checkbox is used as indicator.
    '[class.mdc-list-item--selected]': 'selected && !_selectionList.multiple',
    // Based on the checkbox position and whether there are icons or avatars, we apply MDC's
    // list-item `--leading` and `--trailing` classes.
    '[class.mdc-list-item--with-leading-avatar]': '_hasProjected("avatars", "before")',
    '[class.mdc-list-item--with-leading-icon]': '_hasProjected("icons", "before")',
    '[class.mdc-list-item--with-trailing-icon]': '_hasProjected("icons", "after")',
    '[class.mat-mdc-list-option-with-trailing-avatar]': '_hasProjected("avatars", "after")',
    // Based on the checkbox position, we apply the `--leading` or `--trailing` MDC classes
    // which ensure that the checkbox is positioned correctly within the list item.
    '[class.mdc-list-item--with-leading-checkbox]': '_hasCheckboxAt("before")',
    '[class.mdc-list-item--with-trailing-checkbox]': '_hasCheckboxAt("after")',
    '[class.mat-accent]': 'color !== "primary" && color !== "warn"',
    '[class.mat-warn]': 'color === "warn"',
    '[class._mat-animation-noopable]': '_noopAnimations',
    '[attr.aria-selected]': 'selected',
    '(blur)': '_handleBlur()',
    '(click)': '_toggleOnInteraction()',
  },
  templateUrl: 'list-option.html',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {provide: MatListItemBase, useExisting: MatListOption},
    {provide: LIST_OPTION, useExisting: MatListOption},
  ],
})
export class MatListOption extends MatListItemBase implements ListOption, OnInit, OnDestroy {
  @ContentChildren(MatListItemLine, {descendants: true}) _lines: QueryList<MatListItemLine>;
  @ContentChildren(MatListItemTitle, {descendants: true}) _titles: QueryList<MatListItemTitle>;
  @ViewChild('unscopedContent') _unscopedContent: ElementRef<HTMLSpanElement>;

  /**
   * Emits when the selected state of the option has changed.
   * Use to facilitate two-data binding to the `selected` property.
   * @docs-private
   */
  @Output()
  readonly selectedChange: EventEmitter<boolean> = new EventEmitter<boolean>();

  /** Whether the label should appear before or after the checkbox. Defaults to 'after' */
  @Input() checkboxPosition: MatListOptionCheckboxPosition = 'after';

  /** Theme color of the list option. This sets the color of the checkbox. */
  @Input()
  get color(): ThemePalette {
    return this._color || this._selectionList.color;
  }
  set color(newValue: ThemePalette) {
    this._color = newValue;
  }
  private _color: ThemePalette;

  /** Value of the option */
  @Input()
  get value(): any {
    return this._value;
  }
  set value(newValue: any) {
    if (this.selected && newValue !== this.value && this._inputsInitialized) {
      this.selected = false;
    }

    this._value = newValue;
  }
  private _value: any;

  /** Whether the option is selected. */
  @Input()
  get selected(): boolean {
    return this._selectionList.selectedOptions.isSelected(this);
  }
  set selected(value: BooleanInput) {
    const isSelected = coerceBooleanProperty(value);

    if (isSelected !== this._selected) {
      this._setSelected(isSelected);

      if (isSelected || this._selectionList.multiple) {
        this._selectionList._reportValueChange();
      }
    }
  }
  private _selected = false;

  /**
   * This is set to true after the first OnChanges cycle so we don't
   * clear the value of `selected` in the first cycle.
   */
  private _inputsInitialized = false;

  constructor(
    elementRef: ElementRef<HTMLElement>,
    ngZone: NgZone,
    @Inject(SELECTION_LIST) private _selectionList: SelectionList,
    platform: Platform,
    private _changeDetectorRef: ChangeDetectorRef,
    @Optional()
    @Inject(MAT_RIPPLE_GLOBAL_OPTIONS)
    globalRippleOptions?: RippleGlobalOptions,
    @Optional() @Inject(ANIMATION_MODULE_TYPE) animationMode?: string,
  ) {
    super(elementRef, ngZone, _selectionList, platform, globalRippleOptions, animationMode);
  }

  ngOnInit() {
    const list = this._selectionList;

    if (list._value && list._value.some(value => list.compareWith(this._value, value))) {
      this._setSelected(true);
    }

    const wasSelected = this._selected;

    // List options that are selected at initialization can't be reported properly to the form
    // control. This is because it takes some time until the selection-list knows about all
    // available options. Also it can happen that the ControlValueAccessor has an initial value
    // that should be used instead. Deferring the value change report to the next tick ensures
    // that the form control value is not being overwritten.
    Promise.resolve().then(() => {
      if (this._selected || wasSelected) {
        this.selected = true;
        this._changeDetectorRef.markForCheck();
      }
    });
    this._inputsInitialized = true;
  }

  override ngOnDestroy(): void {
    super.ngOnDestroy();

    if (this.selected) {
      // We have to delay this until the next tick in order
      // to avoid changed after checked errors.
      Promise.resolve().then(() => {
        this.selected = false;
      });
    }
  }

  /** Toggles the selection state of the option. */
  toggle(): void {
    this.selected = !this.selected;
  }

  /** Allows for programmatic focusing of the option. */
  focus(): void {
    this._hostElement.focus();
  }

  /** Gets the text label of the list option. Used for the typeahead functionality in the list. */
  getLabel() {
    const titleElement = this._titles?.get(0)?._elementRef.nativeElement;
    // If there is no explicit title element, the unscoped text content
    // is treated as the list item title.
    const labelEl = titleElement || this._unscopedContent?.nativeElement;
    return labelEl?.textContent || '';
  }

  /** Whether a checkbox is shown at the given position. */
  _hasCheckboxAt(position: MatListOptionCheckboxPosition): boolean {
    return this._selectionList.multiple && this._getCheckboxPosition() === position;
  }

  /** Whether icons or avatars are shown at the given position. */
  _hasIconsOrAvatarsAt(position: 'before' | 'after'): boolean {
    return this._hasProjected('icons', position) || this._hasProjected('avatars', position);
  }

  /** Gets whether the given type of element is projected at the specified position. */
  _hasProjected(type: 'icons' | 'avatars', position: 'before' | 'after'): boolean {
    // If the checkbox is shown at the specified position, neither icons or
    // avatars can be shown at the position.
    return (
      this._getCheckboxPosition() !== position &&
      (type === 'avatars' ? this._avatars.length !== 0 : this._icons.length !== 0)
    );
  }

  _handleBlur() {
    this._selectionList._onTouched();
  }

  /** Gets the current position of the checkbox. */
  _getCheckboxPosition() {
    return this.checkboxPosition || 'after';
  }

  /**
   * Sets the selected state of the option.
   * @returns Whether the value has changed.
   */
  _setSelected(selected: boolean): boolean {
    if (selected === this._selected) {
      return false;
    }

    this._selected = selected;

    if (selected) {
      this._selectionList.selectedOptions.select(this);
    } else {
      this._selectionList.selectedOptions.deselect(this);
    }

    this.selectedChange.emit(selected);
    this._changeDetectorRef.markForCheck();
    return true;
  }

  /**
   * Notifies Angular that the option needs to be checked in the next change detection run.
   * Mainly used to trigger an update of the list option if the disabled state of the selection
   * list changed.
   */
  _markForCheck() {
    this._changeDetectorRef.markForCheck();
  }

  /** Toggles the option's value based on a user interacion. */
  _toggleOnInteraction() {
    if (!this.disabled) {
      if (this._selectionList.multiple) {
        this.selected = !this.selected;
        this._selectionList._emitChangeEvent([this]);
      } else if (!this.selected) {
        this.selected = true;
        this._selectionList._emitChangeEvent([this]);
      }
    }
  }

  /** Sets the tabindex of the list option. */
  _setTabindex(value: number) {
    this._hostElement.setAttribute('tabindex', value + '');
  }
}
