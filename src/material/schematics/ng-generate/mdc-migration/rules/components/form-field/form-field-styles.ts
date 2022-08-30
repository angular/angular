/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {ClassNameChange, StyleMigrator} from '../../style-migrator';

export class FormFieldStylesMigrator extends StyleMigrator {
  component = 'form-field';

  deprecatedPrefixes = [
    '.mat-form-field-can-float',
    '.mat-form-field-should-float',
    '.mat-form-field-has-label',
    '.mat-form-field-wrapper',
    '.mat-form-field-flex',
    '.mat-form-field-outline',
    '.mat-form-field-prefix',
    '.mat-form-field-infix',
    '.mat-form-field-suffix',
    '.mat-form-field-label',
    '.mat-form-field-required-marker',
    '.mat-form-field-underline',
    '.mat-form-field-ripple',
    '.mat-form-field-subscript-wrapper',
    '.mat-form-field-hint-wrapper',
    '.mat-form-field-hint-hint-spacer',
  ];

  mixinChanges = [
    {
      old: 'legacy-form-field-theme',
      new: ['form-field-theme', 'form-field-typography'],
    },
  ];

  classChanges: ClassNameChange[] = [
    {
      old: '.mat-form-field',
      new: '.mat-mdc-form-field',
    },
    {
      old: '.mat-hint',
      new: '.mat-mdc-form-field-hint',
    },
    {
      old: '.mat-error',
      new: '.mat-mdc-form-field-error',
    },
  ];
}
