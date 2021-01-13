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
  MAT_OPTGROUP,
  MAT_OPTION_PARENT_COMPONENT,
  MatOptgroup,
  MatOption,
} from '@angular/material-experimental/mdc-core';
import {_MatAutocompleteBase} from '@angular/material/autocomplete';
import {panelAnimation} from './animations';

@Component({
  selector: 'mat-autocomplete',
  templateUrl: 'autocomplete.html',
  styleUrls: ['autocomplete.css'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  exportAs: 'matAutocomplete',
  inputs: ['disableRipple'],
  host: {
    'class': 'mat-mdc-autocomplete'
  },
  providers: [
    {provide: MAT_OPTION_PARENT_COMPONENT, useExisting: MatAutocomplete}
  ],
  animations: [panelAnimation],
})
export class MatAutocomplete extends _MatAutocompleteBase {
  @ContentChildren(MAT_OPTGROUP, {descendants: true}) optionGroups: QueryList<MatOptgroup>;
  @ContentChildren(MatOption, {descendants: true}) options: QueryList<MatOption>;
  protected _visibleClass = 'mat-mdc-autocomplete-visible';
  protected _hiddenClass = 'mat-mdc-autocomplete-hidden';
}

