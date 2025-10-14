/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { InjectionToken } from '../di/injection_token';
/**
 * Internal token that specifies whether DOM reuse logic
 * during hydration is enabled.
 */
export declare const IS_HYDRATION_DOM_REUSE_ENABLED: InjectionToken<boolean>;
export declare const PRESERVE_HOST_CONTENT_DEFAULT = false;
/**
 * Internal token that indicates whether host element content should be
 * retained during the bootstrap.
 */
export declare const PRESERVE_HOST_CONTENT: InjectionToken<boolean>;
/**
 * Internal token that indicates whether hydration support for i18n
 * is enabled.
 */
export declare const IS_I18N_HYDRATION_ENABLED: InjectionToken<boolean>;
/**
 * Internal token that indicates whether event replay support for SSR
 * is enabled.
 */
export declare const IS_EVENT_REPLAY_ENABLED: InjectionToken<boolean>;
export declare const EVENT_REPLAY_ENABLED_DEFAULT = false;
/**
 * Internal token that indicates whether incremental hydration support
 * is enabled.
 */
export declare const IS_INCREMENTAL_HYDRATION_ENABLED: InjectionToken<boolean>;
/**
 * A map of DOM elements with `jsaction` attributes grouped by action names.
 */
export declare const JSACTION_BLOCK_ELEMENT_MAP: InjectionToken<Map<string, Set<Element>>>;
/**
 * Internal token that indicates whether the initial navigation is blocking in the application.
 */
export declare const IS_ENABLED_BLOCKING_INITIAL_NAVIGATION: InjectionToken<boolean>;
