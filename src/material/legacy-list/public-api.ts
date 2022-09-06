/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

export {MatLegacyListModule} from './list-module';
export {
  MatLegacyNavList,
  MatLegacyList,
  MatLegacyListAvatarCssMatStyler,
  MatLegacyListIconCssMatStyler,
  MatLegacyListSubheaderCssMatStyler,
  MatLegacyListItem,
} from './list';
export {
  MAT_LEGACY_SELECTION_LIST_VALUE_ACCESSOR,
  MatLegacySelectionListChange,
  MatLegacyListOptionCheckboxPosition,
  MatLegacyListOption,
  MatLegacySelectionList,
} from './selection-list';

export {
  /**
   * @deprecated Use `MAT_LIST` from `@angular/material/list` instead. See https://material.angular.io/guide/mdc-migration for information about migrating.
   * @breaking-change 17.0.0
   */
  MAT_LIST as MAT_LEGACY_LIST,

  /**
   * @deprecated Use `MAT_NAV_LIST` from `@angular/material/list` instead. See https://material.angular.io/guide/mdc-migration for information about migrating.
   * @breaking-change 17.0.0
   */
  MAT_NAV_LIST as MAT_LEGACY_NAV_LIST,
} from '@angular/material/list';
