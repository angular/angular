/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Attribute, Directive, ElementRef, Input} from '@angular/core';
import {MAT_ERROR} from '@angular/material/form-field';

let nextUniqueId = 0;

/**
 * Single error message to be shown underneath the form field.
 * @deprecated Use `MatError` from `@angular/material/form-field` instead. See https://material.angular.io/guide/mdc-migration for information about migrating.
 * @breaking-change 17.0.0
 */
@Directive({
  selector: 'mat-error',
  host: {
    'class': 'mat-error',
    '[attr.id]': 'id',
    'aria-atomic': 'true',
  },
  providers: [{provide: MAT_ERROR, useExisting: MatLegacyError}],
})
export class MatLegacyError {
  @Input() id: string = `mat-error-${nextUniqueId++}`;

  constructor(@Attribute('aria-live') ariaLive: string, elementRef: ElementRef) {
    // If no aria-live value is set add 'polite' as a default. This is preferred over setting
    // role='alert' so that screen readers do not interrupt the current task to read this aloud.
    if (!ariaLive) {
      elementRef.nativeElement.setAttribute('aria-live', 'polite');
    }
  }
}
