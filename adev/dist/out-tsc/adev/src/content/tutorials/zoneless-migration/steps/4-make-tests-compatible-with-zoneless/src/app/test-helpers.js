import 'zone.js';
import {fakeAsync as fakeAsyncInternal} from '@angular/core/testing';
export function fakeAsync(fn) {
  return withProxyZone(fn);
}
export function withProxyZone(fn) {
  const autoProxyFn = function (...args) {
    const proxyZoneSpec = Zone['ProxyZoneSpec'];
    const _sharedAutoProxyZoneSpec = new proxyZoneSpec();
    const zone = Zone.root.fork(_sharedAutoProxyZoneSpec);
    return zone.run(fakeAsyncInternal(fn), this, args);
  };
  return autoProxyFn;
}
//# sourceMappingURL=test-helpers.js.map
