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
  const OriginalResponse = global.Response;
  const placeholder = function() {};

  const createFetchTask =
      (source: string, data: TaskData|undefined, originalImpl: any, self: any, args: any[],
       ac?: AbortController) => new Promise((resolve, reject) => {
        const task = Zone.current.scheduleMacroTask(
            source, placeholder, data,
            () => {
              // The promise object returned by the original implementation passed into the
              // function. This might be a `fetch` promise, `Response.prototype.json` promise,
              // etc.
              let implPromise;
              let zone = Zone.current;

              try {
                (zone as any)[fetchTaskScheduling] = true;
                implPromise = originalImpl.apply(self, args);
              } catch (error) {
                reject(error);
                return;
              } finally {
                (zone as any)[fetchTaskScheduling] = false;
              }

              if (!(implPromise instanceof ZoneAwarePromise)) {
                let ctor = implPromise.constructor;
                if (!ctor[symbolThenPatched]) {
                  api.patchThen(ctor);
                }
              }

              implPromise.then(
                  (resource: any) => {
                    if (task.state !== 'notScheduled') {
                      task.invoke();
                    }
                    resolve(resource);
                  },
                  (error: any) => {
                    if (task.state !== 'notScheduled') {
                      task.invoke();
                    }
                    reject(error);
                  });
            },
            () => {
              ac?.abort();
            });
      });

  global['fetch'] = function() {
    const args = Array.prototype.slice.call(arguments);
    const options = args.length > 1 ? args[1] : {};
    const signal: AbortSignal|undefined = options?.signal;
    const ac = new AbortController();
    const fetchSignal = ac.signal;
    options.signal = fetchSignal;
    args[1] = options;

    if (signal) {
      const nativeAddEventListener =
          signal[Zone.__symbol__('addEventListener') as 'addEventListener'] ||
          signal.addEventListener;

      nativeAddEventListener.call(signal, 'abort', function() {
        ac!.abort();
      }, {once: true});
    }

    return createFetchTask('fetch', {fetchArgs: args} as FetchTaskData, fetch, this, args, ac);
  };

  if (OriginalResponse?.prototype) {
    // https://fetch.spec.whatwg.org/#body-mixin
    ['arrayBuffer', 'blob', 'formData', 'json', 'text']
        // Safely check whether the method exists on the `Response` prototype before patching.
        .filter(method => typeof OriginalResponse.prototype[method] === 'function')
        .forEach(method => {
          api.patchMethod(
              OriginalResponse.prototype, method,
              (delegate: Function) => (self, args) => createFetchTask(
                  `Response.${method}`, undefined, delegate, self, args, undefined));
        });
  }
});
