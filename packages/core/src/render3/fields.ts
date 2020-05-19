/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {getClosureSafeProperty} from '../util/property';

export const NG_COMP_DEF = getClosureSafeProperty({ɵcmp: getClosureSafeProperty});
export const NG_DIR_DEF = getClosureSafeProperty({ɵdir: getClosureSafeProperty});
export const NG_PIPE_DEF = getClosureSafeProperty({ɵpipe: getClosureSafeProperty});
export const NG_MOD_DEF = getClosureSafeProperty({ɵmod: getClosureSafeProperty});
export const NG_LOC_ID_DEF = getClosureSafeProperty({ɵloc: getClosureSafeProperty});
export const NG_FACTORY_DEF = getClosureSafeProperty({ɵfac: getClosureSafeProperty});

/**
 * If a directive is diPublic, bloomAdd sets a property on the type with this constant as
 * the key and the directive's unique ID as the value. This allows us to map directives to their
 * bloom filter bit for DI.
 */
// TODO(misko): This is wrong. The NG_ELEMENT_ID should never be minified.
export const NG_ELEMENT_ID = getClosureSafeProperty({__NG_ELEMENT_ID__: getClosureSafeProperty});
