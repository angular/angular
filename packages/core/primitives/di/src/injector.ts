/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {InjectionToken} from './injection_token';

export interface Injector {
  get<T>(token: InjectionToken<T>, options: unknown): T | undefined;
}
