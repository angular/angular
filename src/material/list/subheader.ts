/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Directive} from '@angular/core';

/**
 * Directive whose purpose is to add the mat- CSS styling to this selector.
 * @docs-private
 */
@Directive({
  selector: '[mat-subheader], [matSubheader]',
  // TODO(mmalerba): MDC's subheader font looks identical to the list item font, figure out why and
  //  make a change in one of the repos to visually distinguish.
  host: {'class': 'mat-mdc-subheader mdc-list-group__subheader'},
})
export class MatListSubheaderCssMatStyler {}
