/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Directive, InjectionToken, Input} from '@angular/core';

let nextUniqueId = 0;

/**
 * Injection token that can be used to reference instances of `MatHint`. It serves as
 * alternative token to the actual `MatHint` class which could cause unnecessary
 * retention of the class and its directive metadata.
 *
 * *Note*: This is not part of the public API as the MDC-based form-field will not
 * need a lightweight token for `MatHint` and we want to reduce breaking changes.
 */
export const _MAT_HINT = new InjectionToken<MatLegacyHint>('MatHint');

/** Hint text to be shown underneath the form field control. */
@Directive({
  selector: 'mat-hint',
  host: {
    'class': 'mat-hint',
    '[class.mat-form-field-hint-end]': 'align === "end"',
    '[attr.id]': 'id',
    // Remove align attribute to prevent it from interfering with layout.
    '[attr.align]': 'null',
  },
  providers: [{provide: _MAT_HINT, useExisting: MatLegacyHint}],
})
export class MatLegacyHint {
  /** Whether to align the hint label at the start or end of the line. */
  @Input() align: 'start' | 'end' = 'start';

  /** Unique ID for the hint. Used for the aria-describedby on the form field control. */
  @Input() id: string = `mat-hint-${nextUniqueId++}`;
}
