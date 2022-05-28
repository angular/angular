/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {BooleanInput, coerceBooleanProperty} from '@angular/cdk/coercion';
import {ENTER, SPACE} from '@angular/cdk/keycodes';
import {Directive, ElementRef, Inject, Input} from '@angular/core';
import {HasTabIndex, mixinTabIndex} from '@angular/material-experimental/mdc-core';
import {MAT_CHIP} from './tokens';

abstract class _MatChipActionBase {
  abstract disabled: boolean;
}

const _MatChipActionMixinBase = mixinTabIndex(_MatChipActionBase, -1);

/**
 * Section within a chip.
 * @docs-private
 */
@Directive({
  selector: '[matChipAction]',
  inputs: ['disabled', 'tabIndex'],
  host: {
    'class': 'mdc-evolution-chip__action mat-mdc-chip-action',
    '[class.mdc-evolution-chip__action--primary]': '_isPrimary',
    // Note that while our actions are interactive, we have to add the `--presentational` class,
    // in order to avoid some super-specific `:hover` styles from MDC.
    '[class.mdc-evolution-chip__action--presentational]': '_isPrimary',
    '[class.mdc-evolution-chip__action--trailing]': '!_isPrimary',
    '[attr.tabindex]': '(disabled || !isInteractive) ? null : tabIndex',
    '[attr.disabled]': "disabled ? '' : null",
    '[attr.aria-disabled]': 'disabled',
    '(click)': '_handleClick($event)',
    '(keydown)': '_handleKeydown($event)',
  },
})
export class MatChipAction extends _MatChipActionMixinBase implements HasTabIndex {
  /** Whether the action is interactive. */
  @Input() isInteractive = true;

  /** Whether this is the primary action in the chip. */
  _isPrimary = true;

  /** Whether the action is disabled. */
  @Input()
  get disabled(): boolean {
    return this._disabled || this._parentChip.disabled;
  }
  set disabled(value: BooleanInput) {
    this._disabled = coerceBooleanProperty(value);
  }
  private _disabled = false;

  constructor(
    public _elementRef: ElementRef<HTMLElement>,
    @Inject(MAT_CHIP)
    protected _parentChip: {
      _handlePrimaryActionInteraction(): void;
      remove(): void;
      disabled: boolean;
    },
  ) {
    super();

    if (_elementRef.nativeElement.nodeName === 'BUTTON') {
      _elementRef.nativeElement.setAttribute('type', 'button');
    }
  }

  focus() {
    this._elementRef.nativeElement.focus();
  }

  _handleClick(event: MouseEvent) {
    if (!this.disabled && this.isInteractive && this._isPrimary) {
      event.preventDefault();
      this._parentChip._handlePrimaryActionInteraction();
    }
  }

  _handleKeydown(event: KeyboardEvent) {
    if (
      (event.keyCode === ENTER || event.keyCode === SPACE) &&
      !this.disabled &&
      this.isInteractive &&
      this._isPrimary
    ) {
      event.preventDefault();
      this._parentChip._handlePrimaryActionInteraction();
    }
  }
}
