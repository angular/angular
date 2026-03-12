/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {isBrowser, zoneSymbol} from '../../lib/common/utils';
import {ifEnvSupports, isSafari, isSupportSetErrorStack} from '../test-util';

const defineProperty = (Object as any)[zoneSymbol('defineProperty')] || Object.defineProperty;

describe(
  'longStackTraceZone',
  ifEnvSupports(isSupportSetErrorStack, function () {
    let log: Error[];
    let lstz: Zone;
    let longStackTraceZoneSpec = (Zone as any)['longStackTraceZoneSpec'];
    let defaultTimeout = jasmine.DEFAULT_TIMEOUT_INTERVAL;

    beforeEach(function () {
      lstz = Zone.current.fork(longStackTraceZoneSpec).fork({
        name: 'long-stack-trace-zone-test',
        onHandleError: (
          parentZoneDelegate: ZoneDelegate,
          currentZone: Zone,
          targetZone: Zone,
          error: any,
        ): boolean => {
          parentZoneDelegate.handleError(targetZone, error);
          log.push(error);
          return false;
        },
      });

      log = [];
      jasmine.DEFAULT_TIMEOUT_INTERVAL = 10000;
    });

    afterEach(function () {
      jasmine.DEFAULT_TIMEOUT_INTERVAL = defaultTimeout;
    });

    function expectElapsed(stack: string, expectedCount: number) {
      try {
        let actualCount = stack.split('_Elapsed_').length;
        if (actualCount !== expectedCount) {
          expect(actualCount).toEqual(expectedCount);
          console.log(stack);
        }
      } catch (e) {
        expect(e).toBe(null);
      }
    }

    it('should produce long stack traces', function (done) {
      lstz.run(function () {
        setTimeout(function () {
          setTimeout(function () {
            setTimeout(function () {
              expectElapsed(log[0].stack!, 3);
              done();
            }, 0);
            throw new Error('Hello');
          }, 0);
        }, 0);
      });
    });

    it(
      'should produce long stack traces for optimized eventTask',
      ifEnvSupports(
        () => isBrowser,
        function () {
          lstz.run(function () {
            const button = document.createElement('button');
            const clickEvent = document.createEvent('Event');
            clickEvent.initEvent('click', true, true);
            document.body.appendChild(button);

            button.addEventListener('click', function () {
              expectElapsed(log[0].stack!, 1);
            });

            button.dispatchEvent(clickEvent);

            document.body.removeChild(button);
          });
        },
      ),
    );

    it(
      'should not overwrite long stack traces data for different optimized eventTasks',
      ifEnvSupports(
        () => isBrowser,
        function () {
          lstz.run(function () {
            const button = document.createElement('button');
            const clickEvent = document.createEvent('Event');
            clickEvent.initEvent('click', true, true);
            document.body.appendChild(button);

            const div = document.createElement('div');
            const enterEvent = document.createEvent('Event');
            enterEvent.initEvent('mouseenter', true, true);
            document.body.appendChild(div);

            button.addEventListener('click', function () {
              throw new Error('clickError');
            });

            div.addEventListener('mouseenter', function () {
              throw new Error('enterError');
            });

            button.dispatchEvent(clickEvent);
            div.dispatchEvent(enterEvent);

            expect(log.length).toBe(2);
            if (!isSafari()) {
              expect(log[0].stack === log[1].stack).toBe(false);
            }

            document.body.removeChild(button);
            document.body.removeChild(div);
          });
        },
      ),
    );

    it('should produce a long stack trace even if stack setter throws', (done) => {
      let wasStackAssigned = false;
      let error = new Error('Expected error');
      defineProperty(error, 'stack', {
        configurable: false,
        get: () => 'someStackTrace',
        set: (v: any) => {
          throw new Error('no writes');
        },
      });
      lstz.run(() => {
        setTimeout(() => {
          throw error;
        });
      });
      setTimeout(() => {
        const e = log[0];
        expect((e as any).longStack).toBeTruthy();
        done();
      });
    });

    it('should produce long stack traces when has uncaught error in promise', function (done) {
      lstz.runGuarded(function () {
        setTimeout(function () {
          setTimeout(function () {
            let promise = new Promise(function (resolve, reject) {
              setTimeout(function () {
                reject(new Error('Hello Promise'));
              }, 0);
            });
            promise.then(function () {
              fail('should not get here');
            });
            setTimeout(function () {
              expectElapsed(log[0].stack!, 5);
              done();
            }, 0);
          }, 0);
        }, 0);
      });
    });

    it('should produce long stack traces when handling error in promise', function (done) {
      lstz.runGuarded(function () {
        setTimeout(function () {
          setTimeout(function () {
            let promise = new Promise(function (resolve, reject) {
              setTimeout(function () {
                try {
                  throw new Error('Hello Promise');
                } catch (err) {
                  reject(err);
                }
              }, 0);
            });
            promise.catch(function (error) {
              // should be able to get long stack trace
              const longStackFrames: string = longStackTraceZoneSpec.getLongStackTrace(error);
              expectElapsed(longStackFrames, 4);
              done();
            });
          }, 0);
        }, 0);
      });
    });

    it('should not produce long stack traces if Error.stackTraceLimit = 0', function (done) {
      const originalStackTraceLimit = Error.stackTraceLimit;
      lstz.run(function () {
        setTimeout(function () {
          setTimeout(function () {
            setTimeout(function () {
              if (log[0].stack) {
                expectElapsed(log[0].stack!, 1);
              }
              Error.stackTraceLimit = originalStackTraceLimit;
              done();
            }, 0);
            Error.stackTraceLimit = 0;
            throw new Error('Hello');
          }, 0);
        }, 0);
      });
    });
  }),
);
