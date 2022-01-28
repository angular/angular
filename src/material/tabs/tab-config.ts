/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {InjectionToken} from '@angular/core';

/** Object that can be used to configure the default options for the tabs module. */
export interface MatTabsConfig {
  /** Duration for the tab animation. Must be a valid CSS value (e.g. 600ms). */
  animationDuration?: string;

  /**
   * Whether pagination should be disabled. This can be used to avoid unnecessary
   * layout recalculations if it's known that pagination won't be required.
   */
  disablePagination?: boolean;

  /**
   * Whether the ink bar should fit its width to the size of the tab label content.
   * This only applies to the MDC-based tabs.
   */
  fitInkBarToContent?: boolean;

  /** Whether the tab group should grow to the size of the active tab. */
  dynamicHeight?: boolean;

  /** `tabindex` to be set on the inner element that wraps the tab content. */
  contentTabIndex?: number;

  /**
   * By default tabs remove their content from the DOM while it's off-screen.
   * Setting this to `true` will keep it in the DOM which will prevent elements
   * like iframes and videos from reloading next time it comes back into the view.
   */
  preserveContent?: boolean;
}

/** Injection token that can be used to provide the default options the tabs module. */
export const MAT_TABS_CONFIG = new InjectionToken<MatTabsConfig>('MAT_TABS_CONFIG');
