/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
export function patchCallbacks(
  api: _ZonePrivate,
  target: any,
  targetName: string,
  method: string,
  callbacks: string[],
) {
  const symbol = Zone.__symbol__(method);
  if (target[symbol]) {
    return;
  }
  const nativeDelegate = (target[symbol] = target[method]);
  target[method] = function (name: any, opts: any, options?: any) {
    if (opts && opts.prototype) {
      callbacks.forEach(function (callback) {
        const source = `${targetName}.${method}::` + callback;
        const prototype = opts.prototype;
        // Note: the `patchCallbacks` is used for patching the `document.registerElement` and
        // `customElements.define`. We explicitly wrap the patching code into try-catch since
        // callbacks may be already patched by other web components frameworks (e.g. LWC), and they
        // make those properties non-writable. This means that patching callback will throw an error
        // `cannot assign to read-only property`. See this code as an example:
        // https://github.com/salesforce/lwc/blob/master/packages/@lwc/engine-core/src/framework/base-bridge-element.ts#L180-L186
        // We don't want to stop the application rendering if we couldn't patch some
        // callback, e.g. `attributeChangedCallback`.
        try {
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
        } catch {
          // Note: we leave the catch block empty since there's no way to handle the error related
          // to non-writable property.
        }
      });
    }

    return nativeDelegate.call(target, name, opts, options);
  };

  api.attachOriginToPatched(target[method], nativeDelegate);
}
