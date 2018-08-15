/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
Zone.__load_patch('bluebird', (global: any, Zone: ZoneType, api: _ZonePrivate) => {
  // TODO: @JiaLiPassion, we can automatically patch bluebird
  // if global.Promise = Bluebird, but sometimes in nodejs,
  // global.Promise is not Bluebird, and Bluebird is just be
  // used by other libraries such as sequelize, so I think it is
  // safe to just expose a method to patch Bluebird explicitly
  const BLUEBIRD = 'bluebird';
  (Zone as any)[Zone.__symbol__(BLUEBIRD)] = function patchBluebird(Bluebird: any) {
    // patch method of Bluebird.prototype which not using `then` internally
    const bluebirdApis: string[] = ['then', 'spread', 'finally'];
    bluebirdApis.forEach(bapi => {
      api.patchMethod(
          Bluebird.prototype, bapi, (delegate: Function) => (self: any, args: any[]) => {
            const zone = Zone.current;
            for (let i = 0; i < args.length; i++) {
              const func = args[i];
              if (typeof func === 'function') {
                args[i] = function() {
                  const argSelf: any = this;
                  const argArgs: any = arguments;
                  return new Bluebird((res: any, rej: any) => {
                    zone.scheduleMicroTask('Promise.then', () => {
                      try {
                        res(func.apply(argSelf, argArgs));
                      } catch (error) {
                        rej(error);
                      }
                    });
                  });
                };
              }
            }
            return delegate.apply(self, args);
          });
    });

    if (typeof window !== 'undefined') {
      window.addEventListener('unhandledrejection', function(event: any) {
        const error = event.detail && event.detail.reason;
        if (error && error.isHandledByZone) {
          event.preventDefault();
          if (typeof event.stopImmediatePropagation === 'function') {
            event.stopImmediatePropagation();
          }
        }
      });
    } else if (typeof process !== 'undefined') {
      process.on('unhandledRejection', (reason: any, p: any) => {
        if (reason && reason.isHandledByZone) {
          const listeners = process.listeners('unhandledRejection');
          if (listeners) {
            // remove unhandledRejection listeners so the callback
            // will not be triggered.
            process.removeAllListeners('unhandledRejection');
            process.nextTick(() => {
              listeners.forEach(listener => process.on('unhandledRejection', listener));
            });
          }
        }
      });
    }

    Bluebird.onPossiblyUnhandledRejection(function(e: any, promise: any) {
      try {
        Zone.current.runGuarded(() => {
          e.isHandledByZone = true;
          throw e;
        });
      } catch (err) {
        err.isHandledByZone = false;
        api.onUnhandledError(err);
      }
    });

    // override global promise
    global.Promise = Bluebird;
  };
});
