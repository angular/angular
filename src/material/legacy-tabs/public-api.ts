/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

export {MatLegacyTabsModule} from './tabs-module';
export {MatLegacyTabGroup} from './tab-group';
export {MatLegacyInkBar} from './ink-bar';
export {MatLegacyTabBody, MatLegacyTabBodyPortal} from './tab-body';
export {MatLegacyTabHeader} from './tab-header';
export {MatLegacyTab} from './tab';
export {MatLegacyTabNav, MatLegacyTabLink, MatLegacyTabNavPanel} from './tab-nav-bar/index';
export {MatLegacyTabLabel} from './tab-label';
export {MatLegacyTabLabelWrapper} from './tab-label-wrapper';
export {MatLegacyTabContent} from './tab-content';
export {
  /**
   * @deprecated Use `_MatTabNavBase` from `@angular/material/tabs` instead. See https://material.angular.io/guide/mdc-migration for information about migrating.
   * @breaking-change 17.0.0
   */
  _MatTabNavBase as _MatLegacyTabNavBase,

  /**
   * @deprecated Use `_MatTabLinkBase` from `@angular/material/tabs` instead. See https://material.angular.io/guide/mdc-migration for information about migrating.
   * @breaking-change 17.0.0
   */
  _MatTabLinkBase as _MatLegacyTabLinkBase,

  /**
   * @deprecated Use `MatTabsConfig` from `@angular/material/tabs` instead. See https://material.angular.io/guide/mdc-migration for information about migrating.
   * @breaking-change 17.0.0
   */
  MatTabsConfig as MatLegacyTabsConfig,

  /**
   * @deprecated Use `MAT_TABS_CONFIG` from `@angular/material/tabs` instead. See https://material.angular.io/guide/mdc-migration for information about migrating.
   * @breaking-change 17.0.0
   */
  MAT_TABS_CONFIG as MAT_LEGACY_TABS_CONFIG,

  /**
   * @deprecated Use `_MatTabBase` from `@angular/material/tabs` instead. See https://material.angular.io/guide/mdc-migration for information about migrating.
   * @breaking-change 17.0.0
   */
  _MatTabBase as _MatLegacyTabBase,

  /**
   * @deprecated Use `MAT_TAB` from `@angular/material/tabs` instead. See https://material.angular.io/guide/mdc-migration for information about migrating.
   * @breaking-change 17.0.0
   */
  MAT_TAB as MAT_LEGACY_TAB,

  /**
   * @deprecated Use `ScrollDirection` from `@angular/material/tabs` instead. See https://material.angular.io/guide/mdc-migration for information about migrating.
   * @breaking-change 17.0.0
   */
  ScrollDirection as LegacyScrollDirection,

  /**
   * @deprecated Use `MAT_TAB_GROUP` from `@angular/material/tabs` instead. See https://material.angular.io/guide/mdc-migration for information about migrating.
   * @breaking-change 17.0.0
   */
  MAT_TAB_GROUP as MAT_LEGACY_TAB_GROUP,

  /**
   * @deprecated Use `_MatTabBodyBase` from `@angular/material/tabs` instead. See https://material.angular.io/guide/mdc-migration for information about migrating.
   * @breaking-change 17.0.0
   */
  _MatTabBodyBase as _MatLegacyTabBodyBase,

  /**
   * @deprecated Use `MatTabBodyPositionState` from `@angular/material/tabs` instead. See https://material.angular.io/guide/mdc-migration for information about migrating.
   * @breaking-change 17.0.0
   */
  MatTabBodyPositionState as MatLegacyTabBodyPositionState,

  /**
   * @deprecated Use `matTabsAnimations` from `@angular/material/tabs` instead. See https://material.angular.io/guide/mdc-migration for information about migrating.
   * @breaking-change 17.0.0
   */
  matTabsAnimations as matLegacyTabsAnimations,

  /**
   * @deprecated Use `MAT_TAB_CONTENT` from `@angular/material/tabs` instead. See https://material.angular.io/guide/mdc-migration for information about migrating.
   * @breaking-change 17.0.0
   */
  MAT_TAB_CONTENT as MAT_LEGACY_TAB_CONTENT,

  /**
   * @deprecated Use `MatTabBodyOriginState` from `@angular/material/tabs` instead. See https://material.angular.io/guide/mdc-migration for information about migrating.
   * @breaking-change 17.0.0
   */
  MatTabBodyOriginState as MatLegacyTabBodyOriginState,

  /**
   * @deprecated Use `_MatInkBarPositioner` from `@angular/material/tabs` instead. See https://material.angular.io/guide/mdc-migration for information about migrating.
   * @breaking-change 17.0.0
   */
  _MatInkBarPositioner as _MatLegacyInkBarPositioner,

  /**
   * @deprecated Use `_MAT_INK_BAR_POSITIONER` from `@angular/material/tabs` instead. See https://material.angular.io/guide/mdc-migration for information about migrating.
   * @breaking-change 17.0.0
   */
  _MAT_INK_BAR_POSITIONER as _MAT_LEGACY_INK_BAR_POSITIONER,

  /**
   * @deprecated Use `_MAT_INK_BAR_POSITIONER_FACTORY` from `@angular/material/tabs` instead. See https://material.angular.io/guide/mdc-migration for information about migrating.
   * @breaking-change 17.0.0
   */
  _MAT_INK_BAR_POSITIONER_FACTORY as _MAT_LEGACY_INK_BAR_POSITIONER_FACTORY,

  /**
   * @deprecated Use `MatTabChangeEvent` from `@angular/material/tabs` instead. See https://material.angular.io/guide/mdc-migration for information about migrating.
   * @breaking-change 17.0.0
   */
  MatTabChangeEvent as MatLegacyTabChangeEvent,

  /**
   * @deprecated Use `_MatTabGroupBase` from `@angular/material/tabs` instead. See https://material.angular.io/guide/mdc-migration for information about migrating.
   * @breaking-change 17.0.0
   */
  _MatTabGroupBase as _MatLegacyTabGroupBase,

  /**
   * @deprecated Use `MatTabHeaderPosition` from `@angular/material/tabs` instead. See https://material.angular.io/guide/mdc-migration for information about migrating.
   * @breaking-change 17.0.0
   */
  MatTabHeaderPosition as MatLegacyTabHeaderPosition,

  /**
   * @deprecated Use `_MatTabHeaderBase` from `@angular/material/tabs` instead. See https://material.angular.io/guide/mdc-migration for information about migrating.
   * @breaking-change 17.0.0
   */
  _MatTabHeaderBase as _MatLegacyTabHeaderBase,

  /**
   * @deprecated Use `MatPaginatedTabHeader` from `@angular/material/tabs` instead. See https://material.angular.io/guide/mdc-migration for information about migrating.
   * @breaking-change 17.0.0
   */
  MatPaginatedTabHeader as MatLegacyPaginatedTabHeader,
} from '@angular/material/tabs';
