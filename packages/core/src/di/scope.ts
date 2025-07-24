/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {InjectionToken} from './injection_token';

export type InjectorScope = 'root' | 'platform' | 'environment';

/**
 * An internal token whose presence in an injector indicates that the injector should treat itself
 * as a root scoped injector when processing requests for unknown tokens which may indicate
 * they are provided in the root scope.
 */
export const INJECTOR_SCOPE = new InjectionToken<InjectorScope | null>(
  ngDevMode ? 'Set Injector scope.' : '',
);
