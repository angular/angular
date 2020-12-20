/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {isNode, zoneSymbol} from '../../lib/common/utils';
import {ifEnvSupports} from '../test-util';

declare const global: any;

class MicroTaskQueueZoneSpec implements ZoneSpec {
  name: string = 'MicroTaskQueue';
  queue: MicroTask[] = [];
  properties = {queue: this.queue, flush: this.flush.bind(this)};

  flush() {
    while (this.queue.length) {
      const task = this.queue.shift();
      task!.invoke();
    }
  }

  onScheduleTask(delegate: ZoneDelegate, currentZone: Zone, targetZone: Zone, task: Task): any {
    this.queue.push(task as MicroTask);
  }
}

function flushMicrotasks() {
  Zone.current.get('flush')();
}

class TestRejection {
  prop1?: string;
  prop2?: string;
}

describe(
    'Promise', ifEnvSupports('Promise', function() {
      if (!global.Promise) return;
      let log: string[];
      let queueZone: Zone;
      let testZone: Zone;
      let pZone: Zone;

      beforeEach(() => {
        testZone = Zone.current.fork({name: 'TestZone'});

        pZone = Zone.current.fork({
          name: 'promise-zone',
          onScheduleTask:
              (parentZoneDelegate: ZoneDelegate, currentZone: Zone, targetZone: Zone, task: Task):
                  any => {
                    log.push('scheduleTask');
                    parentZoneDelegate.scheduleTask(targetZone, task);
                  }
        });

        queueZone = Zone.current.fork(new MicroTaskQueueZoneSpec());

        log = [];
      });

      xit('should allow set es6 Promise after load ZoneAwarePromise', (done) => {
        const ES6Promise = require('es6-promise').Promise;
        const NativePromise = global[zoneSymbol('Promise')];

        try {
          global['Promise'] = ES6Promise;
          Zone.assertZonePatched();
          expect(global[zoneSymbol('Promise')]).toBe(ES6Promise);
          const promise = Promise.resolve(0);
          console.log('promise', promise);
          promise
              .then(value => {
                expect(value).toBe(0);
                done();
              })
              .catch(error => {
                fail(error);
              });
        } finally {
          global['Promise'] = NativePromise;
          Zone.assertZonePatched();
          expect(global[zoneSymbol('Promise')]).toBe(NativePromise);
        }
      });

      it('should pretend to be a native code', () => {
        expect(String(Promise).indexOf('[native code]') >= 0).toBe(true);
      });

      it('should use native toString for promise instance', () => {
        expect(Object.prototype.toString.call(Promise.resolve())).toEqual('[object Promise]');
      });

      it('should make sure that new Promise is instance of Promise', () => {
        expect(Promise.resolve(123) instanceof Promise).toBe(true);
        expect(new Promise(() => null) instanceof Promise).toBe(true);
      });

      xit('should ensure that Promise this is instanceof Promise', () => {
        expect(() => {
          Promise.call({} as any, () => null);
        }).toThrowError('Must be an instanceof Promise.');
      });

      it('should allow subclassing without Symbol.species', () => {
        class MyPromise extends Promise<any> {
          constructor(fn: any) {
            super(fn);
          }
        }
        expect(new MyPromise(() => {}).then(() => null) instanceof MyPromise).toBe(true);
      });

      it('should allow subclassing with Symbol.species', () => {
        class MyPromise extends Promise<any> {
          constructor(fn: any) {
            super(fn);
          }

          static get[Symbol.species]() {
            return MyPromise;
          }
        }
        expect(new MyPromise(() => {}).then(() => null) instanceof MyPromise).toBe(true);
      });

      it('Symbol.species should return ZoneAwarePromise', () => {
        const empty = function() {};
        const promise = Promise.resolve(1);
        const FakePromise =
            ((promise.constructor = {} as any) as any)[Symbol.species] = function(exec: any) {
              exec(empty, empty);
            };
        expect(promise.then(empty) instanceof FakePromise).toBe(true);
      });

      it('should intercept scheduling of resolution and then', (done) => {
        pZone.run(() => {
          let p: Promise<any> = new Promise(function(resolve, reject) {
            expect(resolve('RValue')).toBe(undefined);
          });
          expect(log).toEqual([]);
          expect(p instanceof Promise).toBe(true);
          p = p.then((v) => {
            log.push(v);
            expect(v).toBe('RValue');
            expect(log).toEqual(['scheduleTask', 'RValue']);
            return 'second value';
          });
          expect(p instanceof Promise).toBe(true);
          expect(log).toEqual(['scheduleTask']);
          p = p.then((v) => {
            log.push(v);
            expect(log).toEqual(['scheduleTask', 'RValue', 'scheduleTask', 'second value']);
            done();
          });
          expect(p instanceof Promise).toBe(true);
          expect(log).toEqual(['scheduleTask']);
        });
      });

      it('should allow sync resolution of promises', () => {
        queueZone.run(() => {
          const flush = Zone.current.get('flush');
          const queue = Zone.current.get('queue');
          const p = new Promise<string>(function(resolve, reject) {
                      resolve('RValue');
                    })
                        .then((v: string) => {
                          log.push(v);
                          return 'second value';
                        })
                        .then((v: string) => {
                          log.push(v);
                        });
          expect(queue.length).toEqual(1);
          expect(log).toEqual([]);
          flush();
          expect(log).toEqual(['RValue', 'second value']);
        });
      });

      it('should allow sync resolution of promises returning promises', () => {
        queueZone.run(() => {
          const flush = Zone.current.get('flush');
          const queue = Zone.current.get('queue');
          const p = new Promise<string>(function(resolve, reject) {
                      resolve(Promise.resolve('RValue'));
                    })
                        .then((v: string) => {
                          log.push(v);
                          return Promise.resolve('second value');
                        })
                        .then((v: string) => {
                          log.push(v);
                        });
          expect(queue.length).toEqual(1);
          expect(log).toEqual([]);
          flush();
          expect(log).toEqual(['RValue', 'second value']);
        });
      });

      describe('Promise API', function() {
        it('should work with .then', function(done) {
          let resolve: Function|null = null;

          testZone.run(function() {
            new Promise(function(resolveFn) {
              resolve = resolveFn;
            }).then(function() {
              expect(Zone.current).toBe(testZone);
              done();
            });
          });

          resolve!();
        });

        it('should work with .catch', function(done) {
          let reject: (() => void)|null = null;

          testZone.run(function() {
            new Promise(function(resolveFn, rejectFn) {
              reject = rejectFn;
            })['catch'](function() {
              expect(Zone.current).toBe(testZone);
              done();
            });
          });


          expect(reject!()).toBe(undefined);
        });

        it('should work with .finally with resolved promise', function(done) {
          let resolve: Function|null = null;

          testZone.run(function() {
            (new Promise(function(resolveFn) {
               resolve = resolveFn;
             }) as any)
                .finally(function() {
                  expect(arguments.length).toBe(0);
                  expect(Zone.current).toBe(testZone);
                  done();
                });
          });

          resolve!('value');
        });

        it('should work with .finally with rejected promise', function(done) {
          let reject: Function|null = null;

          testZone.run(function() {
            (new Promise(function(_, rejectFn) {
               reject = rejectFn;
             }) as any)
                .finally(function() {
                  expect(arguments.length).toBe(0);
                  expect(Zone.current).toBe(testZone);
                  done();
                });
          });

          reject!('error');
        });

        it('should work with Promise.resolve', () => {
          queueZone.run(() => {
            let value: any = null;
            Promise.resolve('resolveValue').then((v) => value = v);
            expect(Zone.current.get('queue').length).toEqual(1);
            flushMicrotasks();
            expect(value).toEqual('resolveValue');
          });
        });

        it('should work with Promise.reject', () => {
          queueZone.run(() => {
            let value: any = null;
            Promise.reject('rejectReason')['catch']((v) => value = v);
            expect(Zone.current.get('queue').length).toEqual(1);
            flushMicrotasks();
            expect(value).toEqual('rejectReason');
          });
        });

        describe('reject', () => {
          it('should reject promise', () => {
            queueZone.run(() => {
              let value: any = null;
              Promise.reject('rejectReason')['catch']((v) => value = v);
              flushMicrotasks();
              expect(value).toEqual('rejectReason');
            });
          });

          it('should re-reject promise', () => {
            queueZone.run(() => {
              let value: any = null;
              Promise.reject('rejectReason')['catch']((v) => {
                throw v;
              })['catch']((v) => value = v);
              flushMicrotasks();
              expect(value).toEqual('rejectReason');
            });
          });

          it('should reject and recover promise', () => {
            queueZone.run(() => {
              let value: any = null;
              Promise.reject('rejectReason')['catch']((v) => v).then((v) => value = v);
              flushMicrotasks();
              expect(value).toEqual('rejectReason');
            });
          });

          it('should reject if chained promise does not catch promise', () => {
            queueZone.run(() => {
              let value: any = null;
              Promise.reject('rejectReason')
                  .then((v) => fail('should not get here'))
                  .then(null, (v) => value = v);
              flushMicrotasks();
              expect(value).toEqual('rejectReason');
            });
          });

          it('should output error to console if ignoreConsoleErrorUncaughtError is false',
             (done) => {
               Zone.current.fork({name: 'promise-error'}).run(() => {
                 (Zone as any)[Zone.__symbol__('ignoreConsoleErrorUncaughtError')] = false;
                 const originalConsoleError = console.error;
                 console.error = jasmine.createSpy('consoleErr');
                 const p = new Promise((resolve, reject) => {
                   throw new Error('promise error');
                 });
                 setTimeout(() => {
                   expect(console.error).toHaveBeenCalled();
                   console.error = originalConsoleError;
                   done();
                 }, 10);
               });
             });

          it('should not output error to console if ignoreConsoleErrorUncaughtError is true',
             (done) => {
               Zone.current.fork({name: 'promise-error'}).run(() => {
                 (Zone as any)[Zone.__symbol__('ignoreConsoleErrorUncaughtError')] = true;
                 const originalConsoleError = console.error;
                 console.error = jasmine.createSpy('consoleErr');
                 const p = new Promise((resolve, reject) => {
                   throw new Error('promise error');
                 });
                 setTimeout(() => {
                   expect(console.error).not.toHaveBeenCalled();
                   console.error = originalConsoleError;
                   (Zone as any)[Zone.__symbol__('ignoreConsoleErrorUncaughtError')] = false;
                   done();
                 }, 10);
               });
             });

          it('should notify Zone.onHandleError if no one catches promise', (done) => {
            let promiseError: Error|null = null;
            let zone: Zone|null = null;
            let task: Task|null = null;
            let error: Error|null = null;
            queueZone
                .fork({
                  name: 'promise-error',
                  onHandleError: (delegate: ZoneDelegate, current: Zone, target: Zone, error: any):
                      boolean => {
                        promiseError = error;
                        delegate.handleError(target, error);
                        return false;
                      }
                })
                .run(() => {
                  zone = Zone.current;
                  task = Zone.currentTask;
                  error = new Error('rejectedErrorShouldBeHandled');
                  try {
                    // throw so that the stack trace is captured
                    throw error;
                  } catch (e) {
                  }
                  Promise.reject(error);
                  expect(promiseError).toBe(null);
                });
            setTimeout((): any => null);
            setTimeout(() => {
              expect(promiseError!.message)
                  .toBe(
                      'Uncaught (in promise): ' + error +
                      (error!.stack ? '\n' + error!.stack : ''));
              expect((promiseError as any)['rejection']).toBe(error);
              expect((promiseError as any)['zone']).toBe(zone);
              expect((promiseError as any)['task']).toBe(task);
              done();
            });
          });

          it('should print readable information when throw a not error object', (done) => {
            let promiseError: Error|null = null;
            let zone: Zone|null = null;
            let task: Task|null = null;
            let rejectObj: TestRejection;
            queueZone
                .fork({
                  name: 'promise-error',
                  onHandleError: (delegate: ZoneDelegate, current: Zone, target: Zone, error: any):
                      boolean => {
                        promiseError = error;
                        delegate.handleError(target, error);
                        return false;
                      }
                })
                .run(() => {
                  zone = Zone.current;
                  task = Zone.currentTask;
                  rejectObj = new TestRejection();
                  rejectObj.prop1 = 'value1';
                  rejectObj.prop2 = 'value2';
                  Promise.reject(rejectObj);
                  expect(promiseError).toBe(null);
                });
            setTimeout((): any => null);
            setTimeout(() => {
              expect(promiseError!.message)
                  .toMatch(/Uncaught \(in promise\):.*: {"prop1":"value1","prop2":"value2"}/);
              done();
            });
          });
        });

        describe('Promise.race', () => {
          it('should reject the value', () => {
            queueZone.run(() => {
              let value: any = null;
              (Promise as any).race([
                Promise.reject('rejection1'), 'v1'
              ])['catch']((v: any) => value = v);
              // expect(Zone.current.get('queue').length).toEqual(2);
              flushMicrotasks();
              expect(value).toEqual('rejection1');
            });
          });

          it('should resolve the value', () => {
            queueZone.run(() => {
              let value: any = null;
              (Promise as any)
                  .race([Promise.resolve('resolution'), 'v1'])
                  .then((v: any) => value = v);
              // expect(Zone.current.get('queue').length).toEqual(2);
              flushMicrotasks();
              expect(value).toEqual('resolution');
            });
          });
        });

        describe('Promise.all', () => {
          it('should reject the value', () => {
            queueZone.run(() => {
              let value: any = null;
              Promise.all([Promise.reject('rejection'), 'v1'])['catch']((v: any) => value = v);
              // expect(Zone.current.get('queue').length).toEqual(2);
              flushMicrotasks();
              expect(value).toEqual('rejection');
            });
          });

          it('should resolve the value', () => {
            queueZone.run(() => {
              let value: any = null;
              Promise.all([Promise.resolve('resolution'), 'v1']).then((v: any) => value = v);
              // expect(Zone.current.get('queue').length).toEqual(2);
              flushMicrotasks();
              expect(value).toEqual(['resolution', 'v1']);
            });
          });

          it('should resolve with the sync then operation', () => {
            queueZone.run(() => {
              let value: any = null;
              const p1 = {
                then: function(thenCallback: Function) {
                  return thenCallback('p1');
                }
              };
              const p2 = {
                then: function(thenCallback: Function) {
                  return thenCallback('p2');
                }
              };
              Promise.all([p1, 'v1', p2]).then((v: any) => value = v);
              // expect(Zone.current.get('queue').length).toEqual(2);
              flushMicrotasks();
              expect(value).toEqual(['p1', 'v1', 'p2']);
            });
          });

          it('should resolve generators',
             ifEnvSupports(
                 () => {
                   return isNode;
                 },
                 () => {
                   const generators: any = function*() {
                     yield Promise.resolve(1);
                     yield Promise.resolve(2);
                     return;
                   };
                   queueZone.run(() => {
                     let value: any = null;
                     Promise.all(generators()).then(val => {
                       value = val;
                     });
                     // expect(Zone.current.get('queue').length).toEqual(2);
                     flushMicrotasks();
                     expect(value).toEqual([1, 2]);
                   });
                 }));
        });
      });

      describe('Promise subclasses', function() {
        class MyPromise<T> {
          private _promise: Promise<any>;
          constructor(init: any) {
            this._promise = new Promise(init);
          }

          catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>)|
                                 undefined|null): Promise<T|TResult> {
            return this._promise.catch.call(this._promise, onrejected);
          };

          then<TResult1 = T, TResult2 = never>(
              onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>)|undefined|null,
              onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>)|undefined|
              null): Promise<any> {
            return this._promise.then.call(this._promise, onfulfilled, onrejected);
          };
        }

        const setPrototypeOf = (Object as any).setPrototypeOf || function(obj: any, proto: any) {
          obj.__proto__ = proto;
          return obj;
        };

        setPrototypeOf(MyPromise.prototype, Promise.prototype);

        it('should reject if the Promise subclass rejects', function() {
          const myPromise = new MyPromise(function(resolve: any, reject: any): void {
            reject('foo');
          });

          return Promise.resolve()
              .then(function() {
                return myPromise;
              })
              .then(
                  function() {
                    throw new Error('Unexpected resolution');
                  },
                  function(result) {
                    expect(result).toBe('foo');
                  });
        });

        function testPromiseSubClass(done?: Function) {
          const myPromise = new MyPromise(function(resolve: any, reject: Function) {
            resolve('foo');
          });

          return Promise.resolve()
              .then(function() {
                return myPromise;
              })
              .then(function(result) {
                expect(result).toBe('foo');
                done && done();
              });
        }

        it('should resolve if the Promise subclass resolves', jasmine ? function(done) {
          testPromiseSubClass(done);
        } : function() {
          testPromiseSubClass();
        });
      });

      describe('Promise.allSettled', () => {
        const yes = function makeFulfilledResult(value: any) {
          return {status: 'fulfilled', value: value};
        };
        const no = function makeRejectedResult(reason: any) {
          return {status: 'rejected', reason: reason};
        };
        const a = {};
        const b = {};
        const c = {};
        const allSettled = (Promise as any).allSettled;
        it('no promise values', (done: DoneFn) => {
          allSettled([a, b, c]).then((results: any[]) => {
            expect(results).toEqual([yes(a), yes(b), yes(c)]);
            done();
          });
        });
        it('all fulfilled', (done: DoneFn) => {
          allSettled([
            Promise.resolve(a), Promise.resolve(b), Promise.resolve(c)
          ]).then((results: any[]) => {
            expect(results).toEqual([yes(a), yes(b), yes(c)]);
            done();
          });
        });
        it('all rejected', (done: DoneFn) => {
          allSettled([
            Promise.reject(a), Promise.reject(b), Promise.reject(c)
          ]).then((results: any[]) => {
            expect(results).toEqual([no(a), no(b), no(c)]);
            done();
          });
        });
        it('mixed', (done: DoneFn) => {
          allSettled([a, Promise.resolve(b), Promise.reject(c)]).then((results: any[]) => {
            expect(results).toEqual([yes(a), yes(b), no(c)]);
            done();
          });
        });
        it('mixed should in zone', (done: DoneFn) => {
          const zone = Zone.current.fork({name: 'settled'});
          const bPromise = Promise.resolve(b);
          const cPromise = Promise.reject(c);
          zone.run(() => {
            allSettled([a, bPromise, cPromise]).then((results: any[]) => {
              expect(results).toEqual([yes(a), yes(b), no(c)]);
              expect(Zone.current.name).toEqual(zone.name);
              done();
            });
          });
        });
        it('poisoned .then', (done: DoneFn) => {
          const promise = new Promise(function() {});
          promise.then = function() {
            throw new EvalError();
          };
          allSettled([promise]).then(
              () => {
                fail('should not reach here');
              },
              (reason: any) => {
                expect(reason instanceof EvalError).toBe(true);
                done();
              });
        });
        const Subclass = (function() {
          try {
            // eslint-disable-next-line no-new-func
            return Function(
                'class Subclass extends Promise { constructor(...args) { super(...args); this.thenArgs = []; } then(...args) { Subclass.thenArgs.push(args); this.thenArgs.push(args); return super.then(...args); } } Subclass.thenArgs = []; return Subclass;')();
          } catch (e) { /**/
          }

          return false;
        }());

        describe('inheritance', () => {
          it('preserves correct subclass', () => {
            const promise = allSettled.call(Subclass, [1]);
            expect(promise instanceof Subclass).toBe(true);
            expect(promise.constructor).toEqual(Subclass);
          });

          it('invoke the subclass', () => {
            Subclass.thenArgs.length = 0;

            const original = Subclass.resolve();
            expect(Subclass.thenArgs.length).toBe(0);
            expect(original.thenArgs.length).toBe(0);

            allSettled.call(Subclass, [original]);

            expect(original.thenArgs.length).toBe(1);
            expect(Subclass.thenArgs.length).toBe(1);
          });
        });
      });
    }));
