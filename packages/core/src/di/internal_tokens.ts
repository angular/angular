/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Type} from '../interface/type.js';

import {InjectionToken} from './injection_token.js';

export const INJECTOR_DEF_TYPES = new InjectionToken<Type<unknown>>('INJECTOR_DEF_TYPES');
