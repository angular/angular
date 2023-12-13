/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/**
 * @fileoverview
 * @suppress {missingRequire}
 */

Zone.__load_patch('fetch', (global: any, Zone: ZoneType, api: _ZonePrivate) => {
  interface FetchTaskData extends TaskData {
    fetchArgs?: any[];
  }
  let fetch = global['fetch'];
  if (typeof fetch !== 'function') {
    return;
  }
  const originalFetch = global[api.symbol('fetch')];
  if (originalFetch) {
    // restore unpatched fetch first
    fetch = originalFetch;
  }
  const ZoneAwarePromise = global.Promise;
  const symbolThenPatched = api.symbol('thenPatched');
  const fetchTaskScheduling = api.symbol('fetchTaskScheduling');
  const placeholder = function() {};
  global['fetch'] = function() {
    const args = Array.prototype.slice.call(arguments);
    const options = args.length > 1 ? args[1] : {};
    const signal = options && options.signal;
    const ac = new AbortController();
    const fetchSignal = ac.signal;
    options.signal = fetchSignal;
    args[1] = options;
    if (signal) {
      const nativeAddEventListener =
          signal[Zone.__symbol__('addEventListener')] || signal.addEventListener;
      nativeAddEventListener.call(signal, 'abort', function() {
        ac!.abort();
      }, {once: true});
    }
    return new Promise((res, rej) => {
      const task = Zone.current.scheduleMacroTask(
          'fetch', placeholder, {fetchArgs: args} as FetchTaskData,
          () => {
            let fetchPromise;
            let zone = Zone.current;
            try {
              (zone as any)[fetchTaskScheduling] = true;
              fetchPromise = fetch.apply(this, args);
            } catch (error) {
              rej(error);
              return;
            } finally {
              (zone as any)[fetchTaskScheduling] = false;
            }

            if (!(fetchPromise instanceof ZoneAwarePromise)) {
              let ctor = fetchPromise.constructor;
              if (!ctor[symbolThenPatched]) {
                api.patchThen(ctor);
              }
            }
            fetchPromise.then(
                (resource: any) => {
                  if (task.state !== 'notScheduled') {
                    task.invoke();
                  }
                  res(resource);
                },
                (error: any) => {
                  if (task.state !== 'notScheduled') {
                    task.invoke();
                  }
                  rej(error);
                });
          },
          () => {
            ac.abort();
          });
    });
  };
});
