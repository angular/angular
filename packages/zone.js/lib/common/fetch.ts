/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
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
  const fetchTaskAborting = api.symbol('fetchTaskAborting');
  const OriginalAbortController = global['AbortController'];
  const supportAbort = typeof OriginalAbortController === 'function';
  let abortNative: Function|null = null;
  if (supportAbort) {
    global['AbortController'] = function() {
      const abortController = new OriginalAbortController();
      const signal = abortController.signal;
      signal.abortController = abortController;
      return abortController;
    };
    abortNative = api.patchMethod(
        OriginalAbortController.prototype, 'abort',
        (delegate: Function) => (self: any, args: any) => {
          if (self.task) {
            return self.task.zone.cancelTask(self.task);
          }
          return delegate.apply(self, args);
        });
  }
  const placeholder = function() {};
  global['fetch'] = function() {
    const args = Array.prototype.slice.call(arguments);
    const options = args.length > 1 ? args[1] : null;
    const signal = options && options.signal;
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
            if (!supportAbort) {
              rej('No AbortController supported, can not cancel fetch');
              return;
            }
            if (signal && signal.abortController && !signal.aborted &&
                typeof signal.abortController.abort === 'function' && abortNative) {
              try {
                (Zone.current as any)[fetchTaskAborting] = true;
                abortNative.call(signal.abortController);
              } finally {
                (Zone.current as any)[fetchTaskAborting] = false;
              }
            } else {
              rej('cancel fetch need a AbortController.signal');
            }
          });
      if (signal && signal.abortController) {
        signal.abortController.task = task;
      }
    });
  };
});
