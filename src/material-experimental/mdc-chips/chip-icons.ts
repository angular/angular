/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Directive, InjectionToken} from '@angular/core';
import {MDCChipActionAdapter, MDCChipTrailingActionFoundation} from '@material/chips';
import {MatChipAction} from './chip-action';

/**
 * Injection token that can be used to reference instances of `MatChipAvatar`. It serves as
 * alternative token to the actual `MatChipAvatar` class which could cause unnecessary
 * retention of the class and its directive metadata.
 */
export const MAT_CHIP_AVATAR = new InjectionToken<MatChipAvatar>('MatChipAvatar');

/**
 * Directive to add CSS classes to chip leading icon.
 * @docs-private
 */
@Directive({
  selector: 'mat-chip-avatar, [matChipAvatar]',
  host: {
    'class': 'mat-mdc-chip-avatar mdc-evolution-chip__icon mdc-evolution-chip__icon--primary',
    'role': 'img',
  },
  providers: [{provide: MAT_CHIP_AVATAR, useExisting: MatChipAvatar}],
})
export class MatChipAvatar {}

/**
 * Injection token that can be used to reference instances of `MatChipTrailingIcon`. It serves as
 * alternative token to the actual `MatChipTrailingIcon` class which could cause unnecessary
 * retention of the class and its directive metadata.
 */
export const MAT_CHIP_TRAILING_ICON = new InjectionToken<MatChipTrailingIcon>(
  'MatChipTrailingIcon',
);

/**
 * Directive to add CSS classes to and configure attributes for chip trailing icon.
 * @docs-private
 */
@Directive({
  selector: 'mat-chip-trailing-icon, [matChipTrailingIcon]',
  host: {
    'class':
      'mat-mdc-chip-trailing-icon mdc-evolution-chip__icon mdc-evolution-chip__icon--trailing',
    'aria-hidden': 'true',
  },
  providers: [{provide: MAT_CHIP_TRAILING_ICON, useExisting: MatChipTrailingIcon}],
})
export class MatChipTrailingIcon extends MatChipAction {
  /**
   * MDC considers all trailing actions as a remove icon,
   * but we support non-interactive trailing icons.
   */
  override isInteractive = false;

  protected override _createFoundation(adapter: MDCChipActionAdapter) {
    return new MDCChipTrailingActionFoundation(adapter);
  }
}

/**
 * Injection token that can be used to reference instances of `MatChipRemove`. It serves as
 * alternative token to the actual `MatChipRemove` class which could cause unnecessary
 * retention of the class and its directive metadata.
 */
export const MAT_CHIP_REMOVE = new InjectionToken<MatChipRemove>('MatChipRemove');

/**
 * Directive to remove the parent chip when the trailing icon is clicked or
 * when the ENTER key is pressed on it.
 *
 * Recommended for use with the Material Design "cancel" icon
 * available at https://material.io/icons/#ic_cancel.
 *
 * Example:
 *
 * ```
 * <mat-chip>
 *   <mat-icon matChipRemove>cancel</mat-icon>
 * </mat-chip>
 * ```
 */

@Directive({
  selector: '[matChipRemove]',
  host: {
    'class':
      'mat-mdc-chip-remove mat-mdc-chip-trailing-icon mat-mdc-focus-indicator ' +
      'mdc-evolution-chip__icon mdc-evolution-chip__icon--trailing',
    'role': 'button',
    '[attr.aria-hidden]': 'null',
  },
  providers: [{provide: MAT_CHIP_REMOVE, useExisting: MatChipRemove}],
})
export class MatChipRemove extends MatChipAction {
  protected override _createFoundation(adapter: MDCChipActionAdapter) {
    return new MDCChipTrailingActionFoundation(adapter);
  }

  override _handleClick(event: MouseEvent) {
    // Some consumers bind `click` events directly on the chip
    // which will also pick up clicks on the remove button.
    event.stopPropagation();
    super._handleClick(event);
  }

  override _handleKeydown(event: KeyboardEvent) {
    event.stopPropagation();
    super._handleKeydown(event);
  }
}
