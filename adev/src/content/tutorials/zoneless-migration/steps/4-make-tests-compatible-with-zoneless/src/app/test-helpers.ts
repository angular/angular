import 'zone.js';
import {fakeAsync as fakeAsyncInternal} from '@angular/core/testing';

export function fakeAsync(fn: Function): Function {
  return withProxyZone(fn);
}
export function withProxyZone(fn: Function): Function {
  const autoProxyFn = function (this: unknown, ...args: any[]) {
    const proxyZoneSpec = (Zone as any)['ProxyZoneSpec'];

    const _sharedAutoProxyZoneSpec = new proxyZoneSpec();
    const zone = Zone.root.fork(_sharedAutoProxyZoneSpec);

    return zone.run(fakeAsyncInternal(fn), this, args);
  };
  return autoProxyFn;
}
