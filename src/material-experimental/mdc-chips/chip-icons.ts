/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {
  ChangeDetectorRef,
  Directive,
  ElementRef,
} from '@angular/core';
import {
  CanDisable,
  CanDisableCtor,
  HasTabIndex,
  HasTabIndexCtor,
  mixinDisabled,
  mixinTabIndex,
} from '@angular/material/core';
import {Subject} from 'rxjs';


/**
 * Directive to add CSS classes to chip leading icon.
 * @docs-private
 */
@Directive({
  selector: 'mat-chip-avatar, [matChipAvatar]',
  host: {
    'class': 'mat-mdc-chip-avatar mdc-chip__icon mdc-chip__icon--leading',
    'role': 'img'
  }
})
export class MatChipAvatar {
  constructor(private _changeDetectorRef: ChangeDetectorRef,
              private _elementRef: ElementRef) {}

  /** Sets whether the given CSS class should be applied to the leading icon. */
  setClass(cssClass: string, active: boolean) {
    const element = this._elementRef.nativeElement;
    active ? element.addClass(cssClass) : element.removeClass(cssClass);
    this._changeDetectorRef.markForCheck();
  }
}

/**
 * Directive to add CSS classes to and configure attributes for chip trailing icon.
 * @docs-private
 */
@Directive({
  selector: 'mat-chip-trailing-icon, [matChipTrailingIcon]',
  host: {
    'class': 'mat-mdc-chip-trailing-icon mdc-chip__icon mdc-chip__icon--trailing',
    'tabindex': '-1',
    'aria-hidden': 'true',
  }
})
export class MatChipTrailingIcon {
}

/**
 * Boilerplate for applying mixins to MatChipRemove.
 * @docs-private
 */
class MatChipRemoveBase extends MatChipTrailingIcon {
  constructor(public _elementRef: ElementRef) {
    super();
  }
}

const _MatChipRemoveMixinBase:
  CanDisableCtor &
  HasTabIndexCtor &
  typeof MatChipRemoveBase =
    mixinTabIndex(mixinDisabled(MatChipRemoveBase));

/**
 * Directive to remove the parent chip when the trailing icon is clicked or
 * when the ENTER key is pressed on it.
 *
 * Recommended for use with the Material Design "cancel" icon
 * available at https://material.io/icons/#ic_cancel.
 *
 * Example:
 *
 *     `<mat-chip>
 *       <mat-icon matChipRemove>cancel</mat-icon>
 *     </mat-chip>`
 */
@Directive({
  selector: '[matChipRemove]',
  inputs: ['disabled', 'tabIndex'],
  host: {
    'class': 'mat-chip-remove mat-mdc-chip-trailing-icon mdc-chip__icon mdc-chip__icon--trailing',
    '[tabIndex]': 'tabIndex',
    'role': 'button',
    '(click)': 'interaction.next($event)',
    '(keydown)': 'interaction.next($event)',
  }
})
export class MatChipRemove extends _MatChipRemoveMixinBase implements CanDisable, HasTabIndex {
  /**
   * Emits when the user interacts with the icon.
   * @docs-private
   */
  interaction: Subject<MouseEvent | KeyboardEvent> = new Subject<MouseEvent | KeyboardEvent>();

  constructor(_elementRef: ElementRef) {
    super(_elementRef);
  }
}
