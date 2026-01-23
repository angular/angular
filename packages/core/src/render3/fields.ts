/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {getClosureSafeProperty} from '../util/property';

export const NG_COMP_DEF: string = getClosureSafeProperty({ɵcmp: getClosureSafeProperty});
export const NG_DIR_DEF: string = getClosureSafeProperty({ɵdir: getClosureSafeProperty});
export const NG_PIPE_DEF: string = getClosureSafeProperty({ɵpipe: getClosureSafeProperty});
export const NG_MOD_DEF: string = getClosureSafeProperty({ɵmod: getClosureSafeProperty});
export const NG_FACTORY_DEF: string = getClosureSafeProperty({ɵfac: getClosureSafeProperty});

/**
 * If a directive is diPublic, bloomAdd sets a property on the type with this constant as
 * the key and the directive's unique ID as the value. This allows us to map directives to their
 * bloom filter bit for DI.
 */
// TODO(misko): This is wrong. The NG_ELEMENT_ID should never be minified.
export const NG_ELEMENT_ID: string = getClosureSafeProperty({
  __NG_ELEMENT_ID__: getClosureSafeProperty,
});

/**
 * The `NG_ENV_ID` field on a DI token indicates special processing in the `EnvironmentInjector`:
 * getting such tokens from the `EnvironmentInjector` will bypass the standard DI resolution
 * strategy and instead will return implementation produced by the `NG_ENV_ID` factory function.
 *
 * This particular retrieval of DI tokens is mostly done to eliminate circular dependencies and
 * improve tree-shaking.
 */
export const NG_ENV_ID: string = getClosureSafeProperty({__NG_ENV_ID__: getClosureSafeProperty});
