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
  getMatTooltipInvalidPositionError as getMatLegacyTooltipInvalidPositionError,
  MAT_TOOLTIP_SCROLL_STRATEGY_FACTORY as MAT_LEGACY_TOOLTIP_SCROLL_STRATEGY_FACTORY,
  MAT_TOOLTIP_DEFAULT_OPTIONS_FACTORY as MAT_LEGACY_TOOLTIP_DEFAULT_OPTIONS_FACTORY,
  TooltipPosition as LegacyTooltipPosition,
  TooltipTouchGestures as LegacyTooltipTouchGestures,
  TooltipVisibility as LegacyTooltipVisibility,
  SCROLL_THROTTLE_MS as LEGACY_SCROLL_THROTTLE_MS,
  MAT_TOOLTIP_SCROLL_STRATEGY as MAT_LEGACY_TOOLTIP_SCROLL_STRATEGY,
  MAT_TOOLTIP_SCROLL_STRATEGY_FACTORY_PROVIDER as MAT_LEGACY_TOOLTIP_SCROLL_STRATEGY_FACTORY_PROVIDER,
  MatTooltipDefaultOptions as MatLegacyTooltipDefaultOptions,
  MAT_TOOLTIP_DEFAULT_OPTIONS as MAT_LEGACY_TOOLTIP_DEFAULT_OPTIONS,
} from '@angular/material/tooltip';
