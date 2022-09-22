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
  VERSION as LEGACY_VERSION,

  /**
   * @deprecated Use `AnimationCurves` from `@angular/material/core` instead. See https://material.angular.io/guide/mdc-migration for information about migrating.
   * @breaking-change 17.0.0
   */
  AnimationCurves as LegacyAnimationCurves,

  /**
   * @deprecated Use `AnimationDurations` from `@angular/material/core` instead. See https://material.angular.io/guide/mdc-migration for information about migrating.
   * @breaking-change 17.0.0
   */
  AnimationDurations as LegacyAnimationDurations,

  /**
   * @deprecated Use `MatCommonModule` from `@angular/material/core` instead. See https://material.angular.io/guide/mdc-migration for information about migrating.
   * @breaking-change 17.0.0
   */
  MatCommonModule as MatLegacyCommonModule,

  /**
   * @deprecated Use `MATERIAL_SANITY_CHECKS` from `@angular/material/core` instead. See https://material.angular.io/guide/mdc-migration for information about migrating.
   * @breaking-change 17.0.0
   */
  MATERIAL_SANITY_CHECKS as MATERIAL_LEGACY_SANITY_CHECKS,

  /**
   * @deprecated Use `SanityChecks` from `@angular/material/core` instead. See https://material.angular.io/guide/mdc-migration for information about migrating.
   * @breaking-change 17.0.0
   */
  SanityChecks as LegacySanityChecks,

  /**
   * @deprecated Use `GranularSanityChecks` from `@angular/material/core` instead. See https://material.angular.io/guide/mdc-migration for information about migrating.
   * @breaking-change 17.0.0
   */
  GranularSanityChecks as LegacyGranularSanityChecks,

  /**
   * @deprecated Use `CanDisable` from `@angular/material/core` instead. See https://material.angular.io/guide/mdc-migration for information about migrating.
   * @breaking-change 17.0.0
   */
  CanDisable as LegacyCanDisable,

  /**
   * @deprecated Use `mixinDisabled` from `@angular/material/core` instead. See https://material.angular.io/guide/mdc-migration for information about migrating.
   * @breaking-change 17.0.0
   */
  mixinDisabled as legacyMixinDisabled,

  /**
   * @deprecated Use `CanColor` from `@angular/material/core` instead. See https://material.angular.io/guide/mdc-migration for information about migrating.
   * @breaking-change 17.0.0
   */
  CanColor as LegacyCanColor,

  /**
   * @deprecated Use `mixinColor` from `@angular/material/core` instead. See https://material.angular.io/guide/mdc-migration for information about migrating.
   * @breaking-change 17.0.0
   */
  mixinColor as legacyMixinColor,

  /**
   * @deprecated Use `ThemePalette` from `@angular/material/core` instead. See https://material.angular.io/guide/mdc-migration for information about migrating.
   * @breaking-change 17.0.0
   */
  ThemePalette as LegacyThemePalette,

  /**
   * @deprecated Use `CanDisableRipple` from `@angular/material/core` instead. See https://material.angular.io/guide/mdc-migration for information about migrating.
   * @breaking-change 17.0.0
   */
  CanDisableRipple as LegacyCanDisableRipple,

  /**
   * @deprecated Use `mixinDisableRipple` from `@angular/material/core` instead. See https://material.angular.io/guide/mdc-migration for information about migrating.
   * @breaking-change 17.0.0
   */
  mixinDisableRipple as legacyMixinDisableRipple,

  /**
   * @deprecated Use `HasTabIndex` from `@angular/material/core` instead. See https://material.angular.io/guide/mdc-migration for information about migrating.
   * @breaking-change 17.0.0
   */
  HasTabIndex as LegacyHasTabIndex,

  /**
   * @deprecated Use `mixinTabIndex` from `@angular/material/core` instead. See https://material.angular.io/guide/mdc-migration for information about migrating.
   * @breaking-change 17.0.0
   */
  mixinTabIndex as legacyMixinTabIndex,

  /**
   * @deprecated Use `CanUpdateErrorState` from `@angular/material/core` instead. See https://material.angular.io/guide/mdc-migration for information about migrating.
   * @breaking-change 17.0.0
   */
  CanUpdateErrorState as LegacyCanUpdateErrorState,

  /**
   * @deprecated Use `mixinErrorState` from `@angular/material/core` instead. See https://material.angular.io/guide/mdc-migration for information about migrating.
   * @breaking-change 17.0.0
   */
  mixinErrorState as legacyMixinErrorState,

  /**
   * @deprecated Use `HasInitialized` from `@angular/material/core` instead. See https://material.angular.io/guide/mdc-migration for information about migrating.
   * @breaking-change 17.0.0
   */
  HasInitialized as LegacyHasInitialized,

  /**
   * @deprecated Use `mixinInitialized` from `@angular/material/core` instead. See https://material.angular.io/guide/mdc-migration for information about migrating.
   * @breaking-change 17.0.0
   */
  mixinInitialized as legacyMixinInitialized,

  /**
   * @deprecated Use `MAT_DATE_LOCALE` from `@angular/material/core` instead. See https://material.angular.io/guide/mdc-migration for information about migrating.
   * @breaking-change 17.0.0
   */
  MAT_DATE_LOCALE as MAT_LEGACY_DATE_LOCALE,

  /**
   * @deprecated Use `MAT_DATE_LOCALE_FACTORY` from `@angular/material/core` instead. See https://material.angular.io/guide/mdc-migration for information about migrating.
   * @breaking-change 17.0.0
   */
  MAT_DATE_LOCALE_FACTORY as MAT_LEGACY_DATE_LOCALE_FACTORY,

  /**
   * @deprecated Use `DateAdapter` from `@angular/material/core` instead. See https://material.angular.io/guide/mdc-migration for information about migrating.
   * @breaking-change 17.0.0
   */
  DateAdapter as LegacyDateAdapter,

  /**
   * @deprecated Use `MatDateFormats` from `@angular/material/core` instead. See https://material.angular.io/guide/mdc-migration for information about migrating.
   * @breaking-change 17.0.0
   */
  MatDateFormats as MatLegacyDateFormats,

  /**
   * @deprecated Use `MAT_DATE_FORMATS` from `@angular/material/core` instead. See https://material.angular.io/guide/mdc-migration for information about migrating.
   * @breaking-change 17.0.0
   */
  MAT_DATE_FORMATS as MAT_LEGACY_DATE_FORMATS,

  /**
   * @deprecated Use `NativeDateAdapter` from `@angular/material/core` instead. See https://material.angular.io/guide/mdc-migration for information about migrating.
   * @breaking-change 17.0.0
   */
  NativeDateAdapter as LegacyNativeDateAdapter,

  /**
   * @deprecated Use `MAT_NATIVE_DATE_FORMATS` from `@angular/material/core` instead. See https://material.angular.io/guide/mdc-migration for information about migrating.
   * @breaking-change 17.0.0
   */
  MAT_NATIVE_DATE_FORMATS as MAT_LEGACY_NATIVE_DATE_FORMATS,

  /**
   * @deprecated Use `NativeDateModule` from `@angular/material/core` instead. See https://material.angular.io/guide/mdc-migration for information about migrating.
   * @breaking-change 17.0.0
   */
  NativeDateModule as LegacyNativeDateModule,

  /**
   * @deprecated Use `MatNativeDateModule` from `@angular/material/core` instead. See https://material.angular.io/guide/mdc-migration for information about migrating.
   * @breaking-change 17.0.0
   */
  MatNativeDateModule as MatLegacyNativeDateModule,

  /**
   * @deprecated Use `ShowOnDirtyErrorStateMatcher` from `@angular/material/core` instead. See https://material.angular.io/guide/mdc-migration for information about migrating.
   * @breaking-change 17.0.0
   */
  ShowOnDirtyErrorStateMatcher as LegacyShowOnDirtyErrorStateMatcher,

  /**
   * @deprecated Use `ErrorStateMatcher` from `@angular/material/core` instead. See https://material.angular.io/guide/mdc-migration for information about migrating.
   * @breaking-change 17.0.0
   */
  ErrorStateMatcher as LegacyErrorStateMatcher,

  /**
   * @deprecated Use `MatLine` from `@angular/material/core` instead. See https://material.angular.io/guide/mdc-migration for information about migrating.
   * @breaking-change 17.0.0
   */
  MatLine as MatLegacyLine,

  /**
   * @deprecated Use `setLines` from `@angular/material/core` instead. See https://material.angular.io/guide/mdc-migration for information about migrating.
   * @breaking-change 17.0.0
   */
  setLines as legacySetLines,

  /**
   * @deprecated Use `MatLineModule` from `@angular/material/core` instead. See https://material.angular.io/guide/mdc-migration for information about migrating.
   * @breaking-change 17.0.0
   */
  MatLineModule as MatLegacyLineModule,

  /**
   * @deprecated Use `RippleGlobalOptions` from `@angular/material/core` instead. See https://material.angular.io/guide/mdc-migration for information about migrating.
   * @breaking-change 17.0.0
   */
  RippleGlobalOptions as LegacyRippleGlobalOptions,

  /**
   * @deprecated Use `MAT_RIPPLE_GLOBAL_OPTIONS` from `@angular/material/core` instead. See https://material.angular.io/guide/mdc-migration for information about migrating.
   * @breaking-change 17.0.0
   */
  MAT_RIPPLE_GLOBAL_OPTIONS as MAT_LEGACY_RIPPLE_GLOBAL_OPTIONS,

  /**
   * @deprecated Use `MatRipple` from `@angular/material/core` instead. See https://material.angular.io/guide/mdc-migration for information about migrating.
   * @breaking-change 17.0.0
   */
  MatRipple as MatLegacyRipple,

  /**
   * @deprecated Use `RippleState` from `@angular/material/core` instead. See https://material.angular.io/guide/mdc-migration for information about migrating.
   * @breaking-change 17.0.0
   */
  RippleState as LegacyRippleState,

  /**
   * @deprecated Use `RippleConfig` from `@angular/material/core` instead. See https://material.angular.io/guide/mdc-migration for information about migrating.
   * @breaking-change 17.0.0
   */
  RippleConfig as LegacyRippleConfig,

  /**
   * @deprecated Use `RippleAnimationConfig` from `@angular/material/core` instead. See https://material.angular.io/guide/mdc-migration for information about migrating.
   * @breaking-change 17.0.0
   */
  RippleAnimationConfig as LegacyRippleAnimationConfig,

  /**
   * @deprecated Use `RippleRef` from `@angular/material/core` instead. See https://material.angular.io/guide/mdc-migration for information about migrating.
   * @breaking-change 17.0.0
   */
  RippleRef as LegacyRippleRef,

  /**
   * @deprecated Use `RippleTarget` from `@angular/material/core` instead. See https://material.angular.io/guide/mdc-migration for information about migrating.
   * @breaking-change 17.0.0
   */
  RippleTarget as LegacyRippleTarget,

  /**
   * @deprecated Use `defaultRippleAnimationConfig` from `@angular/material/core` instead. See https://material.angular.io/guide/mdc-migration for information about migrating.
   * @breaking-change 17.0.0
   */
  defaultRippleAnimationConfig as legacyDefaultRippleAnimationConfig,

  /**
   * @deprecated Use `RippleRenderer` from `@angular/material/core` instead. See https://material.angular.io/guide/mdc-migration for information about migrating.
   * @breaking-change 17.0.0
   */
  RippleRenderer as LegacyRippleRenderer,

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
