/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {
  ChangeDetectionStrategy,
  Component,
  ContentChildren,
  QueryList,
  ViewEncapsulation,
} from '@angular/core';
import {
  MAT_LEGACY_OPTGROUP,
  MAT_LEGACY_OPTION_PARENT_COMPONENT,
  MatLegacyOption,
  MatLegacyOptgroup,
} from '@angular/material/legacy-core';
import {_MatAutocompleteBase} from '@angular/material/autocomplete';

/**
 * @deprecated Use `MatAutocomplete` from `@angular/material/autocomplete` instead. See https://material.angular.io/guide/mdc-migration for information about migrating.
 * @breaking-change 17.0.0
 */
@Component({
  selector: 'mat-autocomplete',
  templateUrl: 'autocomplete.html',
  styleUrls: ['autocomplete.css'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  exportAs: 'matAutocomplete',
  inputs: ['disableRipple'],
  host: {
    'class': 'mat-autocomplete',
  },
  providers: [{provide: MAT_LEGACY_OPTION_PARENT_COMPONENT, useExisting: MatLegacyAutocomplete}],
})
export class MatLegacyAutocomplete extends _MatAutocompleteBase {
  /** Reference to all option groups within the autocomplete. */
  @ContentChildren(MAT_LEGACY_OPTGROUP, {descendants: true})
  optionGroups: QueryList<MatLegacyOptgroup>;
  /** Reference to all options within the autocomplete. */
  @ContentChildren(MatLegacyOption, {descendants: true}) options: QueryList<MatLegacyOption>;
  protected _visibleClass = 'mat-autocomplete-visible';
  protected _hiddenClass = 'mat-autocomplete-hidden';
}
