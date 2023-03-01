/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {AbstractType, Type} from '../interface/type';
import {InjectionToken} from './injection_token';

/**
 * @description
 *
 * Token that can be used to retrieve an instance from an injector or through a query.
 *
 * @publicApi
 */
export type ProviderToken<T> = Type<T>|AbstractType<T>|InjectionToken<T>;
