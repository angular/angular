/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

export {
  AnimationCurves,
  AnimationDurations,
  CanColor,
  CanDisable,
  CanDisableRipple,
  CanUpdateErrorState,
  DateAdapter,
  defaultRippleAnimationConfig,
  ErrorStateMatcher,
  GranularSanityChecks,
  HasInitialized,
  HasTabIndex,
  MAT_DATE_FORMATS,
  MAT_DATE_LOCALE,
  MAT_DATE_LOCALE_FACTORY,
  MAT_NATIVE_DATE_FORMATS,
  MAT_OPTGROUP,
  MAT_RIPPLE_GLOBAL_OPTIONS,
  MatCommonModule,
  MatDateFormats,
  MATERIAL_SANITY_CHECKS,
  MatNativeDateModule,
  MatPseudoCheckbox,
  MatPseudoCheckboxModule,
  MatPseudoCheckboxState,
  MatRipple,
  MatRippleModule,
  mixinColor,
  mixinDisabled,
  mixinDisableRipple,
  mixinErrorState,
  mixinInitialized,
  mixinTabIndex,
  NativeDateAdapter,
  NativeDateModule,
  RippleAnimationConfig,
  RippleConfig,
  RippleGlobalOptions,
  RippleRef,
  RippleRenderer,
  RippleState,
  RippleTarget,
  SanityChecks,
  setLines,
  ShowOnDirtyErrorStateMatcher,
  ThemePalette,
  VERSION,
  MatOptionModule,
  MatOptionSelectionChange,
  MatOption,
  MatOptgroup,
  MatOptionParentComponent,
  MAT_OPTION_PARENT_COMPONENT,
  // Note: These need to be exposed privately for cross-package type inference. e.g. if the
  // experimental package uses a mixin, TS will try to write an explicit type reference that
  // is equivalent to e.g. `CanColorCtor`. For this it needs these two helpers as otherwise it
  // would generate a deep cross-package import that breaks in the NPM package output.
  _AbstractConstructor,
  _Constructor,
} from '@angular/material/core';
