/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import {global} from '../util/global';

interface GlobalWithProxy {
  Proxy: typeof Proxy;
}

export function createProxy(definition: ProxyHandler<any>): {} {
  const g = global as any as GlobalWithProxy;
  if (!g.Proxy) {
    throw new Error('Proxy is not supported in this browser');
  }
  return new g.Proxy({}, definition);
}
