/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Directive, Input} from '@angular/core';

let nextUniqueId = 0;

/** Hint text to be shown underneath the form field control. */
@Directive({
  selector: 'mat-hint',
  host: {
    'class': 'mat-mdc-form-field-hint mat-mdc-form-field-bottom-align',
    '[class.mat-mdc-form-field-hint-end]': 'align === "end"',
    '[id]': 'id',
    // Remove align attribute to prevent it from interfering with layout.
    '[attr.align]': 'null',
  },
})
export class MatHint {
  /** Whether to align the hint label at the start or end of the line. */
  @Input() align: 'start' | 'end' = 'start';

  /** Unique ID for the hint. Used for the aria-describedby on the form field control. */
  @Input() id: string = `mat-mdc-hint-${nextUniqueId++}`;
}
