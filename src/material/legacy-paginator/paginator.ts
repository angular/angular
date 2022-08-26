/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Inject,
  InjectionToken,
  Optional,
  ViewEncapsulation,
} from '@angular/core';
import {MatLegacyFormFieldAppearance} from '@angular/material/legacy-form-field';
import {_MatPaginatorBase, MatPaginatorIntl} from '@angular/material/paginator';

/** Object that can be used to configure the default options for the paginator module. */
export interface MatLegacyPaginatorDefaultOptions {
  /** Number of items to display on a page. By default set to 50. */
  pageSize?: number;

  /** The set of provided page size options to display to the user. */
  pageSizeOptions?: number[];

  /** Whether to hide the page size selection UI from the user. */
  hidePageSize?: boolean;

  /** Whether to show the first/last buttons UI to the user. */
  showFirstLastButtons?: boolean;

  /** The default form-field appearance to apply to the page size options selector. */
  formFieldAppearance?: MatLegacyFormFieldAppearance;
}

/** Injection token that can be used to provide the default options for the paginator module. */
export const MAT_LEGACY_PAGINATOR_DEFAULT_OPTIONS =
  new InjectionToken<MatLegacyPaginatorDefaultOptions>('MAT_LEGACY_PAGINATOR_DEFAULT_OPTIONS');

/**
 * Component to provide navigation between paged information. Displays the size of the current
 * page, user-selectable options to change that size, what items are being shown, and
 * navigational button to go to the previous or next page.
 */
@Component({
  selector: 'mat-paginator',
  exportAs: 'matPaginator',
  templateUrl: 'paginator.html',
  styleUrls: ['paginator.css'],
  inputs: ['disabled'],
  host: {
    'class': 'mat-paginator',
    'role': 'group',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class MatLegacyPaginator extends _MatPaginatorBase<MatLegacyPaginatorDefaultOptions> {
  /** If set, styles the "page size" form field with the designated style. */
  _formFieldAppearance?: MatLegacyFormFieldAppearance;

  constructor(
    intl: MatPaginatorIntl,
    changeDetectorRef: ChangeDetectorRef,
    @Optional()
    @Inject(MAT_LEGACY_PAGINATOR_DEFAULT_OPTIONS)
    defaults?: MatLegacyPaginatorDefaultOptions,
  ) {
    super(intl, changeDetectorRef, defaults);

    if (defaults && defaults.formFieldAppearance != null) {
      this._formFieldAppearance = defaults.formFieldAppearance;
    }
  }
}
