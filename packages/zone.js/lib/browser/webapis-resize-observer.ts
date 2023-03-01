/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
Zone.__load_patch('ResizeObserver', (global: any, Zone: any, api: _ZonePrivate) => {
  const ResizeObserver = global['ResizeObserver'];
  if (!ResizeObserver) {
    return;
  }

  const resizeObserverSymbol = api.symbol('ResizeObserver');

  api.patchMethod(global, 'ResizeObserver', (delegate: Function) => (self: any, args: any[]) => {
    const callback = args.length > 0 ? args[0] : null;
    if (callback) {
      args[0] = function(entries: any, observer: any) {
        const zones: {[zoneName: string]: any} = {};
        const currZone = Zone.current;
        for (let entry of entries) {
          let zone = entry.target[resizeObserverSymbol];
          if (!zone) {
            zone = currZone;
          }
          let zoneEntriesInfo = zones[zone.name];
          if (!zoneEntriesInfo) {
            zones[zone.name] = zoneEntriesInfo = {entries: [], zone: zone};
          }
          zoneEntriesInfo.entries.push(entry);
        }

        Object.keys(zones).forEach(zoneName => {
          const zoneEntriesInfo = zones[zoneName];
          if (zoneEntriesInfo.zone !== Zone.current) {
            zoneEntriesInfo.zone.run(
                callback, this, [zoneEntriesInfo.entries, observer], 'ResizeObserver');
          } else {
            callback.call(this, zoneEntriesInfo.entries, observer);
          }
        });
      };
    }
    return args.length > 0 ? new ResizeObserver(args[0]) : new ResizeObserver();
  });

  api.patchMethod(
      ResizeObserver.prototype, 'observe', (delegate: Function) => (self: any, args: any[]) => {
        const target = args.length > 0 ? args[0] : null;
        if (!target) {
          return delegate.apply(self, args);
        }
        let targets = self[resizeObserverSymbol];
        if (!targets) {
          targets = self[resizeObserverSymbol] = [];
        }
        targets.push(target);
        target[resizeObserverSymbol] = Zone.current;
        return delegate.apply(self, args);
      });

  api.patchMethod(
      ResizeObserver.prototype, 'unobserve', (delegate: Function) => (self: any, args: any[]) => {
        const target = args.length > 0 ? args[0] : null;
        if (!target) {
          return delegate.apply(self, args);
        }
        let targets = self[resizeObserverSymbol];
        if (targets) {
          for (let i = 0; i < targets.length; i++) {
            if (targets[i] === target) {
              targets.splice(i, 1);
              break;
            }
          }
        }
        target[resizeObserverSymbol] = undefined;
        return delegate.apply(self, args);
      });

  api.patchMethod(
      ResizeObserver.prototype, 'disconnect', (delegate: Function) => (self: any, args: any[]) => {
        const targets = self[resizeObserverSymbol];
        if (targets) {
          targets.forEach((target: any) => {
            target[resizeObserverSymbol] = undefined;
          });
          self[resizeObserverSymbol] = undefined;
        }
        return delegate.apply(self, args);
      });
});
