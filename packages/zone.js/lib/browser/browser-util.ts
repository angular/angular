/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
export function patchCallbacks(
    api: _ZonePrivate, target: any, targetName: string, method: string, callbacks: string[]) {
  const symbol = Zone.__symbol__(method);
  if (target[symbol]) {
    return;
  }
  const nativeDelegate = target[symbol] = target[method];
  target[method] = function(name: any, opts: any, options?: any) {
    if (opts && opts.prototype) {
      callbacks.forEach(function(callback) {
        const source = `${targetName}.${method}::` + callback;
        const prototype = opts.prototype;
        if (prototype.hasOwnProperty(callback)) {
          const descriptor = api.ObjectGetOwnPropertyDescriptor(prototype, callback);
          if (descriptor && descriptor.value) {
            descriptor.value = api.wrapWithCurrentZone(descriptor.value, source);
            api._redefineProperty(opts.prototype, callback, descriptor);
          } else if (prototype[callback]) {
            prototype[callback] = api.wrapWithCurrentZone(prototype[callback], source);
          }
        } else if (prototype[callback]) {
          prototype[callback] = api.wrapWithCurrentZone(prototype[callback], source);
        }
      });
    }

    return nativeDelegate.call(target, name, opts, options);
  };

  api.attachOriginToPatched(target[method], nativeDelegate);
}
