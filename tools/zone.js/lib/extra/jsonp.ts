/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
Zone.__load_patch('jsonp', (global: any, Zone: ZoneType, api: _ZonePrivate) => {
  const noop = function() {};
  // because jsonp is not a standard api, there are a lot of
  // implementations, so zone.js just provide a helper util to
  // patch the jsonp send and onSuccess/onError callback
  // the options is an object which contains
  // - jsonp, the jsonp object which hold the send function
  // - sendFuncName, the name of the send function
  // - successFuncName, success func name
  // - failedFuncName, failed func name
  (Zone as any)[Zone.__symbol__('jsonp')] = function patchJsonp(options: any) {
    if (!options || !options.jsonp || !options.sendFuncName) {
      return;
    }
    const noop = function() {};

    [options.successFuncName, options.failedFuncName].forEach(methodName => {
      if (!methodName) {
        return;
      }

      const oriFunc = global[methodName];
      if (oriFunc) {
        api.patchMethod(global, methodName, (delegate: Function) => (self: any, args: any[]) => {
          const task = global[api.symbol('jsonTask')];
          if (task) {
            task.callback = delegate;
            return task.invoke.apply(self, args);
          } else {
            return delegate.apply(self, args);
          }
        });
      } else {
        Object.defineProperty(global, methodName, {
          configurable: true,
          enumerable: true,
          get: function() {
            return function() {
              const task = global[api.symbol('jsonpTask')];
              const target = this ? this : global;
              const delegate = global[api.symbol(`jsonp${methodName}callback`)];

              if (task) {
                if (delegate) {
                  task.callback = delegate;
                }
                global[api.symbol('jsonpTask')] = undefined;
                return task.invoke.apply(this, arguments);
              } else {
                if (delegate) {
                  return delegate.apply(this, arguments);
                }
              }
              return null;
            };
          },
          set: function(callback: Function) {
            this[api.symbol(`jsonp${methodName}callback`)] = callback;
          }
        });
      }
    });

    api.patchMethod(
        options.jsonp, options.sendFuncName, (delegate: Function) => (self: any, args: any[]) => {
          global[api.symbol('jsonpTask')] =
              Zone.current.scheduleMacroTask('jsonp', noop, {}, (task: Task) => {
                return delegate.apply(self, args);
              }, noop);
        });
  };
});
