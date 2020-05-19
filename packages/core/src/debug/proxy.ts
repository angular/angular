/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {global} from '../util/global';

/**
 * Used to inform TS about the `Proxy` class existing globally.
 */
interface GlobalWithProxy {
  Proxy: typeof Proxy;
}

/**
 * Creates an instance of a `Proxy` and creates with an empty target object and binds it to the
 * provided handler.
 *
 * The reason why this function exists is because IE doesn't support
 * the `Proxy` class. For this reason an error must be thrown.
 */
export function createProxy(handler: ProxyHandler<any>): {} {
  const g = global as any as GlobalWithProxy;
  if (!g.Proxy) {
    throw new Error('Proxy is not supported in this browser');
  }
  return new g.Proxy({}, handler);
}
