/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {
  Directive,
  ElementRef,
  EventEmitter,
  Input,
  OnDestroy,
  Output,
  Renderer2,
} from '@angular/core';

import {Focusable} from '../core/a11y/focus-key-manager';
import {coerceBooleanProperty} from '@angular/cdk';
import {CanColor, mixinColor} from '../core/common-behaviors/color';
import {CanDisable, mixinDisabled} from '../core/common-behaviors/disabled';

export interface MdChipEvent {
  chip: MdChip;
}

// Boilerplate for applying mixins to MdChip.
/** @docs-private */
export class MdChipBase {
  constructor(public _renderer: Renderer2, public _elementRef: ElementRef) {}
}
export const _MdChipMixinBase = mixinColor(mixinDisabled(MdChipBase), 'primary');


/**
 * Dummy directive to add CSS class to basic chips.
 * @docs-private
 */
@Directive({
  selector: `md-basic-chip, [md-basic-chip], mat-basic-chip, [mat-basic-chip]`,
  host: {'class': 'mat-basic-chip'}
})
export class MdBasicChip { }

/**
 * Material design styled Chip component. Used inside the MdChipList component.
 */
@Directive({
  selector: `md-basic-chip, [md-basic-chip], md-chip, [md-chip],
             mat-basic-chip, [mat-basic-chip], mat-chip, [mat-chip]`,
  inputs: ['color', 'disabled'],
  host: {
    'class': 'mat-chip',
    'tabindex': '-1',
    'role': 'option',
    '[class.mat-chip-selected]': 'selected',
    '[attr.disabled]': 'disabled || null',
    '[attr.aria-disabled]': 'disabled.toString()',
    '(click)': '_handleClick($event)',
    '(focus)': '_hasFocus = true',
    '(blur)': '_hasFocus = false',
  }
})
export class MdChip extends _MdChipMixinBase implements Focusable, OnDestroy, CanColor, CanDisable {

  /** Whether the chip is selected. */
  @Input() get selected(): boolean { return this._selected; }
  set selected(value: boolean) {
    this._selected = coerceBooleanProperty(value);
    (this.selected ? this.select : this.deselect).emit({chip: this});
  }
  protected _selected: boolean = false;

  /** Whether the chip has focus. */
  _hasFocus: boolean = false;

  /** Emitted when the chip is focused. */
  onFocus = new EventEmitter<MdChipEvent>();

  /** Emitted when the chip is selected. */
  @Output() select = new EventEmitter<MdChipEvent>();

  /** Emitted when the chip is deselected. */
  @Output() deselect = new EventEmitter<MdChipEvent>();

  /** Emitted when the chip is destroyed. */
  @Output() destroy = new EventEmitter<MdChipEvent>();

  constructor(renderer: Renderer2, elementRef: ElementRef) {
    super(renderer, elementRef);
  }

  ngOnDestroy(): void {
    this.destroy.emit({chip: this});
  }

  /**
   * Toggles the current selected state of this chip.
   * @return Whether the chip is selected.
   */
  toggleSelected(): boolean {
    this.selected = !this.selected;
    return this.selected;
  }

  /** Allows for programmatic focusing of the chip. */
  focus(): void {
    this._elementRef.nativeElement.focus();
    this.onFocus.emit({chip: this});
  }

  /** Ensures events fire properly upon click. */
  _handleClick(event: Event) {
    // Check disabled
    if (this.disabled) {
      event.preventDefault();
      event.stopPropagation();
    } else {
      this.focus();
    }
  }
}
