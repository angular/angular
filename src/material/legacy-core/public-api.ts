/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

export * from './option/index';

export {
  /**
   * @deprecated Use `VERSION` from `@angular/material/core` instead. See https://material.angular.io/guide/mdc-migration for information about migrating.
   * @breaking-change 17.0.0
   */
  VERSION,

  /**
   * @deprecated Use `AnimationCurves` from `@angular/material/core` instead. See https://material.angular.io/guide/mdc-migration for information about migrating.
   * @breaking-change 17.0.0
   */
  AnimationCurves,

  /**
   * @deprecated Use `AnimationDurations` from `@angular/material/core` instead. See https://material.angular.io/guide/mdc-migration for information about migrating.
   * @breaking-change 17.0.0
   */
  AnimationDurations,

  /**
   * @deprecated Use `MatCommonModule` from `@angular/material/core` instead. See https://material.angular.io/guide/mdc-migration for information about migrating.
   * @breaking-change 17.0.0
   */
  MatCommonModule as MatLegacyCommonModule,

  /**
   * @deprecated Use `MATERIAL_SANITY_CHECKS` from `@angular/material/core` instead. See https://material.angular.io/guide/mdc-migration for information about migrating.
   * @breaking-change 17.0.0
   */
  MATERIAL_SANITY_CHECKS,

  /**
   * @deprecated Use `SanityChecks` from `@angular/material/core` instead. See https://material.angular.io/guide/mdc-migration for information about migrating.
   * @breaking-change 17.0.0
   */
  SanityChecks,

  /**
   * @deprecated Use `GranularSanityChecks` from `@angular/material/core` instead. See https://material.angular.io/guide/mdc-migration for information about migrating.
   * @breaking-change 17.0.0
   */
  GranularSanityChecks,

  /**
   * @deprecated Use `CanDisable` from `@angular/material/core` instead. See https://material.angular.io/guide/mdc-migration for information about migrating.
   * @breaking-change 17.0.0
   */
  CanDisable,

  /**
   * @deprecated Use `mixinDisabled` from `@angular/material/core` instead. See https://material.angular.io/guide/mdc-migration for information about migrating.
   * @breaking-change 17.0.0
   */
  mixinDisabled,

  /**
   * @deprecated Use `CanColor` from `@angular/material/core` instead. See https://material.angular.io/guide/mdc-migration for information about migrating.
   * @breaking-change 17.0.0
   */
  CanColor,

  /**
   * @deprecated Use `mixinColor` from `@angular/material/core` instead. See https://material.angular.io/guide/mdc-migration for information about migrating.
   * @breaking-change 17.0.0
   */
  mixinColor,

  /**
   * @deprecated Use `ThemePalette` from `@angular/material/core` instead. See https://material.angular.io/guide/mdc-migration for information about migrating.
   * @breaking-change 17.0.0
   */
  ThemePalette,

  /**
   * @deprecated Use `CanDisableRipple` from `@angular/material/core` instead. See https://material.angular.io/guide/mdc-migration for information about migrating.
   * @breaking-change 17.0.0
   */
  CanDisableRipple,

  /**
   * @deprecated Use `mixinDisableRipple` from `@angular/material/core` instead. See https://material.angular.io/guide/mdc-migration for information about migrating.
   * @breaking-change 17.0.0
   */
  mixinDisableRipple,

  /**
   * @deprecated Use `HasTabIndex` from `@angular/material/core` instead. See https://material.angular.io/guide/mdc-migration for information about migrating.
   * @breaking-change 17.0.0
   */
  HasTabIndex,

  /**
   * @deprecated Use `mixinTabIndex` from `@angular/material/core` instead. See https://material.angular.io/guide/mdc-migration for information about migrating.
   * @breaking-change 17.0.0
   */
  mixinTabIndex,

  /**
   * @deprecated Use `CanUpdateErrorState` from `@angular/material/core` instead. See https://material.angular.io/guide/mdc-migration for information about migrating.
   * @breaking-change 17.0.0
   */
  CanUpdateErrorState,

  /**
   * @deprecated Use `mixinErrorState` from `@angular/material/core` instead. See https://material.angular.io/guide/mdc-migration for information about migrating.
   * @breaking-change 17.0.0
   */
  mixinErrorState,

  /**
   * @deprecated Use `HasInitialized` from `@angular/material/core` instead. See https://material.angular.io/guide/mdc-migration for information about migrating.
   * @breaking-change 17.0.0
   */
  HasInitialized,

  /**
   * @deprecated Use `mixinInitialized` from `@angular/material/core` instead. See https://material.angular.io/guide/mdc-migration for information about migrating.
   * @breaking-change 17.0.0
   */
  mixinInitialized,

  /**
   * @deprecated Use `MAT_DATE_LOCALE` from `@angular/material/core` instead. See https://material.angular.io/guide/mdc-migration for information about migrating.
   * @breaking-change 17.0.0
   */
  MAT_DATE_LOCALE,

  /**
   * @deprecated Use `MAT_DATE_LOCALE_FACTORY` from `@angular/material/core` instead. See https://material.angular.io/guide/mdc-migration for information about migrating.
   * @breaking-change 17.0.0
   */
  MAT_DATE_LOCALE_FACTORY,

  /**
   * @deprecated Use `DateAdapter` from `@angular/material/core` instead. See https://material.angular.io/guide/mdc-migration for information about migrating.
   * @breaking-change 17.0.0
   */
  DateAdapter,

  /**
   * @deprecated Use `MatDateFormats` from `@angular/material/core` instead. See https://material.angular.io/guide/mdc-migration for information about migrating.
   * @breaking-change 17.0.0
   */
  MatDateFormats as MatLegacyDateFormats,

  /**
   * @deprecated Use `MAT_DATE_FORMATS` from `@angular/material/core` instead. See https://material.angular.io/guide/mdc-migration for information about migrating.
   * @breaking-change 17.0.0
   */
  MAT_DATE_FORMATS,

  /**
   * @deprecated Use `NativeDateAdapter` from `@angular/material/core` instead. See https://material.angular.io/guide/mdc-migration for information about migrating.
   * @breaking-change 17.0.0
   */
  NativeDateAdapter,

  /**
   * @deprecated Use `MAT_NATIVE_DATE_FORMATS` from `@angular/material/core` instead. See https://material.angular.io/guide/mdc-migration for information about migrating.
   * @breaking-change 17.0.0
   */
  MAT_NATIVE_DATE_FORMATS,

  /**
   * @deprecated Use `NativeDateModule` from `@angular/material/core` instead. See https://material.angular.io/guide/mdc-migration for information about migrating.
   * @breaking-change 17.0.0
   */
  NativeDateModule,

  /**
   * @deprecated Use `MatNativeDateModule` from `@angular/material/core` instead. See https://material.angular.io/guide/mdc-migration for information about migrating.
   * @breaking-change 17.0.0
   */
  MatNativeDateModule as MatLegacyNativeDateModule,

  /**
   * @deprecated Use `ShowOnDirtyErrorStateMatcher` from `@angular/material/core` instead. See https://material.angular.io/guide/mdc-migration for information about migrating.
   * @breaking-change 17.0.0
   */
  ShowOnDirtyErrorStateMatcher,

  /**
   * @deprecated Use `ErrorStateMatcher` from `@angular/material/core` instead. See https://material.angular.io/guide/mdc-migration for information about migrating.
   * @breaking-change 17.0.0
   */
  ErrorStateMatcher,

  /**
   * @deprecated Use `MatLine` from `@angular/material/core` instead. See https://material.angular.io/guide/mdc-migration for information about migrating.
   * @breaking-change 17.0.0
   */
  MatLine,

  /**
   * @deprecated Use `setLines` from `@angular/material/core` instead. See https://material.angular.io/guide/mdc-migration for information about migrating.
   * @breaking-change 17.0.0
   */
  setLines,

  /**
   * @deprecated Use `MatLineModule` from `@angular/material/core` instead. See https://material.angular.io/guide/mdc-migration for information about migrating.
   * @breaking-change 17.0.0
   */
  MatLineModule as MatLegacyLineModule,

  /**
   * @deprecated Use `RippleGlobalOptions` from `@angular/material/core` instead. See https://material.angular.io/guide/mdc-migration for information about migrating.
   * @breaking-change 17.0.0
   */
  RippleGlobalOptions,

  /**
   * @deprecated Use `MAT_RIPPLE_GLOBAL_OPTIONS` from `@angular/material/core` instead. See https://material.angular.io/guide/mdc-migration for information about migrating.
   * @breaking-change 17.0.0
   */
  MAT_RIPPLE_GLOBAL_OPTIONS,

  /**
   * @deprecated Use `MatRipple` from `@angular/material/core` instead. See https://material.angular.io/guide/mdc-migration for information about migrating.
   * @breaking-change 17.0.0
   */
  MatRipple as MatLegacyRipple,

  /**
   * @deprecated Use `RippleState` from `@angular/material/core` instead. See https://material.angular.io/guide/mdc-migration for information about migrating.
   * @breaking-change 17.0.0
   */
  RippleState,

  /**
   * @deprecated Use `RippleConfig` from `@angular/material/core` instead. See https://material.angular.io/guide/mdc-migration for information about migrating.
   * @breaking-change 17.0.0
   */
  RippleConfig,

  /**
   * @deprecated Use `RippleAnimationConfig` from `@angular/material/core` instead. See https://material.angular.io/guide/mdc-migration for information about migrating.
   * @breaking-change 17.0.0
   */
  RippleAnimationConfig,

  /**
   * @deprecated Use `RippleRef` from `@angular/material/core` instead. See https://material.angular.io/guide/mdc-migration for information about migrating.
   * @breaking-change 17.0.0
   */
  RippleRef,

  /**
   * @deprecated Use `RippleTarget` from `@angular/material/core` instead. See https://material.angular.io/guide/mdc-migration for information about migrating.
   * @breaking-change 17.0.0
   */
  RippleTarget,

  /**
   * @deprecated Use `defaultRippleAnimationConfig` from `@angular/material/core` instead. See https://material.angular.io/guide/mdc-migration for information about migrating.
   * @breaking-change 17.0.0
   */
  defaultRippleAnimationConfig,

  /**
   * @deprecated Use `RippleRenderer` from `@angular/material/core` instead. See https://material.angular.io/guide/mdc-migration for information about migrating.
   * @breaking-change 17.0.0
   */
  RippleRenderer,

  /**
   * @deprecated Use `MatRippleModule` from `@angular/material/core` instead. See https://material.angular.io/guide/mdc-migration for information about migrating.
   * @breaking-change 17.0.0
   */
  MatRippleModule as MatLegacyRippleModule,

  /**
   * @deprecated Use `MatPseudoCheckboxState` from `@angular/material/core` instead. See https://material.angular.io/guide/mdc-migration for information about migrating.
   * @breaking-change 17.0.0
   */
  MatPseudoCheckboxState as MatLegacyPseudoCheckboxState,

  /**
   * @deprecated Use `MatPseudoCheckbox` from `@angular/material/core` instead. See https://material.angular.io/guide/mdc-migration for information about migrating.
   * @breaking-change 17.0.0
   */
  MatPseudoCheckbox as MatLegacyPseudoCheckbox,

  /**
   * @deprecated Use `MatPseudoCheckboxModule` from `@angular/material/core` instead. See https://material.angular.io/guide/mdc-migration for information about migrating.
   * @breaking-change 17.0.0
   */
  MatPseudoCheckboxModule as MatLegacyPseudoCheckboxModule,
} from '@angular/material/core';
