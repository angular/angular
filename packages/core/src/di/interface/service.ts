/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {Type} from '../../interface/type';
import {ɵɵInjectableDeclaration} from './defs';

/**
 * Construct a definition which defines how a service will be constructed by the DI system.
 *
 * This should be assigned to a static `ɵprov` field on a type.
 *
 * Options:
 * * `autoProvided` determines whether the service should be provided automatically or whether
 *   the user should be responsible for providing it.
 * * `factory` gives the zero argument function which will create an instance of the injectable.
 *
 * @codeGenApi
 * @publicApi
 */
export function ɵɵdefineService<T>(opts: {
  token: unknown;
  autoProvided?: boolean;
  factory: (parent?: Type<unknown>) => T;
}): ɵɵInjectableDeclaration<T> {
  return {
    token: opts.token,
    providedIn: opts.autoProvided === false ? null : 'root',
    factory: opts.factory,
    value: undefined,
  };
}
