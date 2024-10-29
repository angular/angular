/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {InjectionToken} from '../di/injection_token';

/**
 * Internal token that specifies whether DOM reuse logic
 * during hydration is enabled.
 */
export const IS_HYDRATION_DOM_REUSE_ENABLED = new InjectionToken<boolean>(
  typeof ngDevMode === 'undefined' || !!ngDevMode ? 'IS_HYDRATION_DOM_REUSE_ENABLED' : '',
);

// By default (in client rendering mode), we remove all the contents
// of the host element and render an application after that.
export const PRESERVE_HOST_CONTENT_DEFAULT = false;

/**
 * Internal token that indicates whether host element content should be
 * retained during the bootstrap.
 */
export const PRESERVE_HOST_CONTENT = new InjectionToken<boolean>(
  typeof ngDevMode === 'undefined' || !!ngDevMode ? 'PRESERVE_HOST_CONTENT' : '',
  {
    providedIn: 'root',
    factory: () => PRESERVE_HOST_CONTENT_DEFAULT,
  },
);

/**
 * Internal token that indicates whether hydration support for i18n
 * is enabled.
 */
export const IS_I18N_HYDRATION_ENABLED = new InjectionToken<boolean>(
  typeof ngDevMode === 'undefined' || !!ngDevMode ? 'IS_I18N_HYDRATION_ENABLED' : '',
);

/**
 * Internal token that indicates whether event replay support for SSR
 * is enabled.
 */
export const IS_EVENT_REPLAY_ENABLED = new InjectionToken<boolean>(
  typeof ngDevMode === 'undefined' || !!ngDevMode ? 'IS_EVENT_REPLAY_ENABLED' : '',
);

export const EVENT_REPLAY_ENABLED_DEFAULT = false;

/**
 * Internal token that indicates whether incremental hydration support
 * is enabled.
 */
export const IS_INCREMENTAL_HYDRATION_ENABLED = new InjectionToken<boolean>(
  typeof ngDevMode === 'undefined' || !!ngDevMode ? 'IS_INCREMENTAL_HYDRATION_ENABLED' : '',
);

/**
 * A map of DOM elements with `jsaction` attributes grouped by action names.
 */
export const JSACTION_BLOCK_ELEMENT_MAP = new InjectionToken<Map<string, Set<Element>>>(
  ngDevMode ? 'JSACTION_BLOCK_ELEMENT_MAP' : '',
  {
    providedIn: 'root',
    factory: () => new Map<string, Set<Element>>(),
  },
);
