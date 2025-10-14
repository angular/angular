/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {InjectionToken} from '../di/injection_token';
/** Actions that are supported by the tracing framework. */
export var TracingAction;
(function (TracingAction) {
  TracingAction[(TracingAction['CHANGE_DETECTION'] = 0)] = 'CHANGE_DETECTION';
  TracingAction[(TracingAction['AFTER_NEXT_RENDER'] = 1)] = 'AFTER_NEXT_RENDER';
})(TracingAction || (TracingAction = {}));
/**
 * Injection token for a `TracingService`, optionally provided.
 */
export const TracingService = new InjectionToken(
  typeof ngDevMode !== undefined && ngDevMode ? 'TracingService' : '',
);
//# sourceMappingURL=tracing.js.map
