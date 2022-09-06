/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

export {MatLegacyTooltipModule} from './tooltip-module';
export {MatLegacyTooltip, LegacyTooltipComponent} from './tooltip';
export {matLegacyTooltipAnimations} from './tooltip-animations';

export {
  /**
   * @deprecated Use `getMatTooltipInvalidPositionError` from `@angular/material/tooltip` instead. See https://material.angular.io/guide/mdc-migration for information about migrating.
   * @breaking-change 17.0.0
   */
  getMatTooltipInvalidPositionError as getMatLegacyTooltipInvalidPositionError,

  /**
   * @deprecated Use `MAT_TOOLTIP_SCROLL_STRATEGY_FACTORY` from `@angular/material/tooltip` instead. See https://material.angular.io/guide/mdc-migration for information about migrating.
   * @breaking-change 17.0.0
   */
  MAT_TOOLTIP_SCROLL_STRATEGY_FACTORY as MAT_LEGACY_TOOLTIP_SCROLL_STRATEGY_FACTORY,

  /**
   * @deprecated Use `MAT_TOOLTIP_DEFAULT_OPTIONS_FACTORY` from `@angular/material/tooltip` instead. See https://material.angular.io/guide/mdc-migration for information about migrating.
   * @breaking-change 17.0.0
   */
  MAT_TOOLTIP_DEFAULT_OPTIONS_FACTORY as MAT_LEGACY_TOOLTIP_DEFAULT_OPTIONS_FACTORY,

  /**
   * @deprecated Use `TooltipPosition` from `@angular/material/tooltip` instead. See https://material.angular.io/guide/mdc-migration for information about migrating.
   * @breaking-change 17.0.0
   */
  TooltipPosition as LegacyTooltipPosition,

  /**
   * @deprecated Use `TooltipTouchGestures` from `@angular/material/tooltip` instead. See https://material.angular.io/guide/mdc-migration for information about migrating.
   * @breaking-change 17.0.0
   */
  TooltipTouchGestures as LegacyTooltipTouchGestures,

  /**
   * @deprecated Use `TooltipVisibility` from `@angular/material/tooltip` instead. See https://material.angular.io/guide/mdc-migration for information about migrating.
   * @breaking-change 17.0.0
   */
  TooltipVisibility as LegacyTooltipVisibility,

  /**
   * @deprecated Use `SCROLL_THROTTLE_MS` from `@angular/material/tooltip` instead. See https://material.angular.io/guide/mdc-migration for information about migrating.
   * @breaking-change 17.0.0
   */
  SCROLL_THROTTLE_MS as LEGACY_SCROLL_THROTTLE_MS,

  /**
   * @deprecated Use `MAT_TOOLTIP_SCROLL_STRATEGY` from `@angular/material/tooltip` instead. See https://material.angular.io/guide/mdc-migration for information about migrating.
   * @breaking-change 17.0.0
   */
  MAT_TOOLTIP_SCROLL_STRATEGY as MAT_LEGACY_TOOLTIP_SCROLL_STRATEGY,

  /**
   * @deprecated Use `MAT_TOOLTIP_SCROLL_STRATEGY_FACTORY_PROVIDER` from `@angular/material/tooltip` instead. See https://material.angular.io/guide/mdc-migration for information about migrating.
   * @breaking-change 17.0.0
   */
  MAT_TOOLTIP_SCROLL_STRATEGY_FACTORY_PROVIDER as MAT_LEGACY_TOOLTIP_SCROLL_STRATEGY_FACTORY_PROVIDER,

  /**
   * @deprecated Use `MatTooltipDefaultOptions` from `@angular/material/tooltip` instead. See https://material.angular.io/guide/mdc-migration for information about migrating.
   * @breaking-change 17.0.0
   */
  MatTooltipDefaultOptions as MatLegacyTooltipDefaultOptions,

  /**
   * @deprecated Use `MAT_TOOLTIP_DEFAULT_OPTIONS` from `@angular/material/tooltip` instead. See https://material.angular.io/guide/mdc-migration for information about migrating.
   * @breaking-change 17.0.0
   */
  MAT_TOOLTIP_DEFAULT_OPTIONS as MAT_LEGACY_TOOLTIP_DEFAULT_OPTIONS,
} from '@angular/material/tooltip';
