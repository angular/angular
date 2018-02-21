/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {Type} from '../type';
import {InjectionToken} from './injection_token';


// APP_ROOT_SCOPE is cast as a Type to allow for its usage as the scope parameter of @Injectable().

/**
 * A scope which targets the root injector.
 *
 * When specified as the `scope` parameter to `@Injectable` or `InjectionToken`, this special
 * scope indicates the provider for the service or token being configured belongs in the root
 * injector. This is loosely equivalent to the convention of having a `forRoot()` static
 * function within a module that configures the provider, and expecting users to only import that
 * module via its `forRoot()` function in the root injector.
 *
 * @experimental
 */
export const APP_ROOT_SCOPE: Type<any> = new InjectionToken<boolean>(
    'The presence of this token marks an injector as being the root injector.') as any;
