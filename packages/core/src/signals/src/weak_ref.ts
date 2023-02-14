/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {global} from '../../util/global';

// `WeakRef` is not always defined in every TS environment where Angular is compiled. Instead,
// alias it as a local export by reading it off of the global context.

export interface WeakRef<T extends object> {
  deref(): T|undefined;
}

export interface WeakRefCtor {
  new<T extends object>(value: T): WeakRef<T>;
}

// tslint:disable-next-line: no-toplevel-property-access
export const WeakRef: WeakRefCtor = global['WeakRef'];
