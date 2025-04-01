/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Type} from '../interface/type';

import {InjectionToken} from './injection_token';

export const INJECTOR_DEF_TYPES = new InjectionToken<ReadonlyArray<Type<unknown>>>(
  ngDevMode ? 'INJECTOR_DEF_TYPES' : '',
);
