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

export function patchObserver(global: any, api: _ZonePrivate, observerTarget: string) {
  if (global[Zone.__symbol__(observerTarget)]) {
    return;
  }
  const OriginalClass = global[Zone.__symbol__(observerTarget)] = global[observerTarget];
  global[observerTarget] = function() {
    const args = Array.prototype.slice.call(arguments);
    const callback: Function = args[0];
    const wrappedCallback = function(this: unknown, entries: any[], observer: any) {
      const zone: Zone = (this as any)[Zone.__symbol__(`${observerTarget}.zone`)];
      const isMultipleZone = (this as any)[Zone.__symbol__(`${observerTarget}.multipleZone`)];
      if (zone && !isMultipleZone) {
        zone.scheduleMicroTask(`${observerTarget}.observe`, () => {
          callback.call(this, entries, observer);
        });
        return;
      } else if (isMultipleZone) {
        const targetZoneMaps: any =
            (this as any)[Zone.__symbol__(`${observerTarget}.targetZoneMaps`)];
        const zoneEntries: {[name: string]: {zone: Zone, entries: any[]}} = {};
        for (let i = 0; i < entries.length; i++) {
          const entry = entries[i];
          for (let j = 0; j < targetZoneMaps.length; j++) {
            const targetZone = targetZoneMaps[j];
            if (entry.target === targetZone.target) {
              let zoneEntry = zoneEntries[targetZone.zone.name];
              if (!zoneEntry) {
                zoneEntry =
                    zoneEntries[targetZone.zone.name] = {zone: targetZone.zone, entries: []};
              }
              zoneEntry.entries.push(entry);
            }
          }
        }
        Object.values(zoneEntries).forEach(zoneEntry => {
          zoneEntry.zone.scheduleMicroTask(`${observerTarget}.observe`, () => {
            callback.call(this, zoneEntry.entries, observer);
          });
        });
      } else {
        return callback.call(this, entries, observer);
      }
    };
    args[0] = wrappedCallback;
    return new OriginalClass(...args);
  };

  global[observerTarget][Zone.__symbol__('OriginalDelegate')] = OriginalClass;
  const proto = global[observerTarget].prototype = OriginalClass.prototype;
  if (proto) {
    api.patchMethod(proto, 'observe', delegate => (self: any, args: any[]) => {
      let isMultipleZone = self[Zone.__symbol__(`${observerTarget}.multipleZone`)];
      const currZone = self[Zone.__symbol__(`${observerTarget}.zone`)];
      let targetZoneMaps: any = self[Zone.__symbol__(`${observerTarget}.targetZoneMaps`)];
      if (!targetZoneMaps) {
        targetZoneMaps = self[Zone.__symbol__(`${observerTarget}.targetZoneMaps`)] = [];
      }
      if (!currZone) {
        self[Zone.__symbol__(`${observerTarget}.zone`)] = Zone.current;
      } else if (currZone !== Zone.current) {
        // More than one zone called observe
        isMultipleZone = self[Zone.__symbol__(`${observerTarget}.multipleZone`)] = true;
      }
      targetZoneMaps.push({zone: Zone.current, target: args[0]});

      return delegate.apply(self, args);
    });

    api.patchMethod(proto, 'unobserve', delegate => (self: any, args: any[]) => {
      const targetZoneMaps: any = self[Zone.__symbol__(`${observerTarget}.targetZoneMaps`)] = [];
      if (targetZoneMaps) {
        for (let i = 0; i < targetZoneMaps.length; i++) {
          if (targetZoneMaps[i].target === args[0]) {
            targetZoneMaps.splice(i, 1);
          }
        }
      }
      return delegate.apply(self, args);
    });

    api.patchMethod(proto, 'disconnect', delegate => (self: any, args: any[]) => {
      self[Zone.__symbol__(`${observerTarget}.targetZoneMaps`)] = undefined;
      return delegate.apply(self, args);
    });
  }
}
