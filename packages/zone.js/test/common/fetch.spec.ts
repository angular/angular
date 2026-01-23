/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import {isNode} from '../../lib/common/utils';
import {ifEnvSupports, ifEnvSupportsWithDone, isFirefox, isSafari} from '../test-util';

declare const global: any;

describe(
  'fetch',
  isNode
    ? () => {
        it('is untested for node as the fetch implementation is experimental', () => {});
      }
    : ifEnvSupports(
        'fetch',
        function () {
          let testZone: Zone;
          beforeEach(() => {
            testZone = Zone.current.fork({name: 'TestZone'});
          });
          it('should work for text response', function (done) {
            testZone.run(function () {
              global['fetch']('/packages/zone.js/test/assets/sample.json').then(function (
                response: any,
              ) {
                const fetchZone = Zone.current;
                expect(fetchZone.name).toBe(testZone.name);

                response.text().then(function (text: string) {
                  expect(Zone.current.name).toBe(fetchZone.name);
                  expect(text.trim()).toEqual('{"hello": "world"}');
                  done();
                });
              });
            });
          });

          it('should work for json response', function (done) {
            testZone.run(function () {
              global['fetch']('/packages/zone.js/test/assets/sample.json').then(function (
                response: any,
              ) {
                const fetchZone = Zone.current;
                expect(fetchZone.name).toBe(testZone.name);

                response.json().then(function (obj: any) {
                  expect(Zone.current.name).toBe(fetchZone.name);
                  expect(obj.hello).toEqual('world');
                  done();
                });
              });
            });
          });

          it('should work for blob response', function (done) {
            testZone.run(function () {
              global['fetch']('/packages/zone.js/test/assets/sample.json').then(function (
                response: any,
              ) {
                const fetchZone = Zone.current;
                expect(fetchZone.name).toBe(testZone.name);

                // Android 4.3- doesn't support response.blob()
                if (response.blob) {
                  response.blob().then(function (blob: any) {
                    expect(Zone.current.name).toBe(fetchZone.name);
                    expect(blob instanceof Blob).toEqual(true);
                    done();
                  });
                } else {
                  done();
                }
              });
            });
          });

          it('should work for arrayBuffer response', function (done) {
            testZone.run(function () {
              global['fetch']('/packages/zone.js/test/assets/sample.json').then(function (
                response: any,
              ) {
                const fetchZone = Zone.current;
                expect(fetchZone.name).toBe(testZone.name);

                // Android 4.3- doesn't support response.arrayBuffer()
                if (response.arrayBuffer) {
                  response.arrayBuffer().then(function (blob: any) {
                    expect(Zone.current).toBe(fetchZone);
                    expect(blob instanceof ArrayBuffer).toEqual(true);
                    done();
                  });
                } else {
                  done();
                }
              });
            });
          });

          it(
            'should throw error when send crendential',
            ifEnvSupportsWithDone(isFirefox, function (done: DoneFn) {
              testZone.run(function () {
                global['fetch']('http://user:password@example.com').then(
                  function (response: any) {
                    fail('should not success');
                  },
                  (error: any) => {
                    expect(Zone.current.name).toEqual(testZone.name);
                    expect(error.constructor.name).toEqual('TypeError');
                    done();
                  },
                );
              });
            }),
          );

          describe('macroTask', () => {
            const logs: string[] = [];
            let fetchZone: Zone;
            let fetchTask: any = null;
            beforeEach(() => {
              logs.splice(0);
              fetchZone = Zone.current.fork({
                name: 'fetch',
                onScheduleTask: (delegate: ZoneDelegate, curr: Zone, target: Zone, task: Task) => {
                  if (task.type !== 'eventTask') {
                    logs.push(`scheduleTask:${task.source}:${task.type}`);
                  }
                  if (task.source === 'fetch') {
                    fetchTask = task;
                  }
                  return delegate.scheduleTask(target, task);
                },
                onInvokeTask: (
                  delegate: ZoneDelegate,
                  curr: Zone,
                  target: Zone,
                  task: Task,
                  applyThis: any,
                  applyArgs: any,
                ) => {
                  if (task.type !== 'eventTask') {
                    logs.push(`invokeTask:${task.source}:${task.type}`);
                  }
                  return delegate.invokeTask(target, task, applyThis, applyArgs);
                },
                onCancelTask: (delegate: ZoneDelegate, curr: Zone, target: Zone, task: Task) => {
                  if (task.type !== 'eventTask') {
                    logs.push(`cancelTask:${task.source}:${task.type}`);
                  }
                  return delegate.cancelTask(target, task);
                },
              });
            });
            it('fetch should be considered as macroTask', (done: DoneFn) => {
              fetchZone.run(() => {
                global['fetch']('/packages/zone.js/test/assets/sample.json').then(function (
                  response: any,
                ) {
                  expect(Zone.current.name).toBe(fetchZone.name);
                  expect(logs).toEqual([
                    'scheduleTask:fetch:macroTask',
                    'scheduleTask:Promise.then:microTask',
                    'invokeTask:Promise.then:microTask',
                    'invokeTask:fetch:macroTask',
                    'scheduleTask:Promise.then:microTask',
                    'invokeTask:Promise.then:microTask',

                    // This is the `finally` task, which is used for cleanup.
                    'scheduleTask:Promise.then:microTask',
                    'invokeTask:Promise.then:microTask',
                  ]);
                  done();
                });
              });
            });

            // https://github.com/angular/angular/issues/50327
            it('Response.json() should be considered as macroTask', (done) => {
              fetchZone.run(() => {
                global['fetch']('/packages/zone.js/test/assets/sample.json')
                  .then((response: any) => {
                    const promise = response.json();
                    // Ensure it's a `ZoneAwarePromise`.
                    expect(promise).toBeInstanceOf(global.Promise);
                    return promise;
                  })
                  .then(() => {
                    expect(logs).toEqual([
                      'scheduleTask:fetch:macroTask',
                      'scheduleTask:Promise.then:microTask',
                      'invokeTask:Promise.then:microTask',
                      'invokeTask:fetch:macroTask',
                      'scheduleTask:Promise.then:microTask',
                      'invokeTask:Promise.then:microTask',

                      // This is the `finally` task, which is used for cleanup.
                      'scheduleTask:Promise.then:microTask',
                      'invokeTask:Promise.then:microTask',

                      // Please refer to the issue link above. Previously, `Response` methods were not
                      // patched by zone.js, and their return values were considered only as
                      // microtasks (not macrotasks). The Angular zone stabilized prematurely,
                      // occurring before the resolution of the `response.json()` promise due to the
                      // falsy value of `zone.hasPendingMacrotasks`. We are now ensuring that
                      // `Response` methods are treated as macrotasks, similar to the behavior of
                      // `fetch`.
                      'scheduleTask:Response.json:macroTask',
                      'scheduleTask:Promise.then:microTask',
                      'invokeTask:Promise.then:microTask',
                      'invokeTask:Response.json:macroTask',
                      'scheduleTask:Promise.then:microTask',
                      'invokeTask:Promise.then:microTask',
                      'scheduleTask:Promise.then:microTask',
                      'invokeTask:Promise.then:microTask',
                    ]);

                    done();
                  });
              });
            });

            it(
              'cancel fetch should invoke onCancelTask',
              ifEnvSupportsWithDone('AbortController', (done: DoneFn) => {
                if (isSafari()) {
                  // safari not work with AbortController
                  done();
                  return;
                }
                fetchZone.run(() => {
                  const AbortController = global['AbortController'];
                  const abort = new AbortController();
                  const signal = abort.signal;
                  global['fetch']('/packages/zone.js/test/assets/sample.json', {
                    signal,
                  })
                    .then(function (response: any) {
                      fail('should not get response');
                    })
                    .catch(function (error: any) {
                      expect(error.name).toEqual('AbortError');
                      expect(logs).toEqual([
                        'scheduleTask:fetch:macroTask',
                        'cancelTask:fetch:macroTask',
                        'scheduleTask:Promise.then:microTask',
                        'invokeTask:Promise.then:microTask',
                        'scheduleTask:Promise.then:microTask',
                        'invokeTask:Promise.then:microTask',
                        'scheduleTask:Promise.then:microTask',
                        'invokeTask:Promise.then:microTask',
                      ]);
                      done();
                    });
                  abort.abort();
                });
              }),
            );

            it(
              'cancel fetchTask should trigger abort',
              ifEnvSupportsWithDone('AbortController', (done: DoneFn) => {
                if (isSafari()) {
                  // safari not work with AbortController
                  done();
                  return;
                }
                fetchZone.run(() => {
                  const AbortController = global['AbortController'];
                  const abort = new AbortController();
                  const signal = abort.signal;
                  global['fetch']('/packages/zone.js/test/assets/sample.json', {
                    signal,
                  })
                    .then(function (response: any) {
                      fail('should not get response');
                    })
                    .catch(function (error: any) {
                      expect(error.name).toEqual('AbortError');
                      expect(logs).toEqual([
                        'scheduleTask:fetch:macroTask',
                        'cancelTask:fetch:macroTask',
                        'scheduleTask:Promise.then:microTask',
                        'invokeTask:Promise.then:microTask',
                        'scheduleTask:Promise.then:microTask',
                        'invokeTask:Promise.then:microTask',
                        'scheduleTask:Promise.then:microTask',
                        'invokeTask:Promise.then:microTask',
                      ]);
                      done();
                    });
                  fetchTask.zone.cancelTask(fetchTask);
                });
              }),
            );
          });
        },
        emptyRun,
      ),
);

function emptyRun() {
  // Jasmine will throw if there are no tests.
  it('should pass', () => {});
}
