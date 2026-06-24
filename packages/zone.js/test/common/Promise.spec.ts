/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {isNode} from '../../lib/common/utils';
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
  'Promise',
  ifEnvSupports('Promise', function () {
    if (!global.Promise) return;
    let log: string[];
    let queueZone: Zone;
    let testZone: Zone;
    let pZone: Zone;

    beforeEach(() => {
      testZone = Zone.current.fork({name: 'TestZone'});

      pZone = Zone.current.fork({
        name: 'promise-zone',
        onScheduleTask: (
          parentZoneDelegate: ZoneDelegate,
          currentZone: Zone,
          targetZone: Zone,
          task: Task,
        ): any => {
          log.push('scheduleTask');
          parentZoneDelegate.scheduleTask(targetZone, task);
        },
      });

      queueZone = Zone.current.fork(new MicroTaskQueueZoneSpec());

      log = [];
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

    it('Promise.resolve(subPromise) should equal to subPromise', () => {
      const p1 = Promise.resolve(1);
      const p2 = Promise.resolve(p1);
      expect(p1).toBe(p2);
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

    it('should allow subclassing without Symbol.species if properties are copied (SystemJS case)', () => {
      let value: any = null;
      const promise = Promise.resolve();
      const systemjsModule = Object.create(null);

      // We only copy properties from the `promise` instance onto the `systemjsModule` object.
      // This is what SystemJS is doing internally:
      // https://github.com/systemjs/systemjs/blob/main/src/system-core.js#L107-L113
      for (const property in promise) {
        const value: any = promise[property as keyof typeof promise];
        if (!(value in systemjsModule) || systemjsModule[property] !== value) {
          systemjsModule[property] = value;
        }
      }

      queueZone.run(() => {
        Promise.resolve()
          .then(() => systemjsModule)
          .then((v) => (value = v));
        flushMicrotasks();
        // Note: we want to ensure that the promise has been resolved. In this specific case
        // the promise may resolve to different values in the browser and on the Node.js side.
        // SystemJS runs only in the browser and it only needs the promise to be resolved.
        expect(value).not.toEqual(null);
      });
    });

    it('should allow subclassing with Symbol.species', () => {
      class MyPromise extends Promise<any> {
        constructor(fn: any) {
          super(fn);
        }

        static override get [Symbol.species]() {
          return MyPromise;
        }
      }
      expect(new MyPromise(() => {}).then(() => null) instanceof MyPromise).toBe(true);
    });

    it('should allow subclassing with own then', (done: DoneFn) => {
      class MyPromise extends Promise<any> {
        constructor(private sub: Promise<any>) {
          super((resolve) => {
            resolve(null);
          });
        }

        override then(onFulfilled: any, onRejected: any) {
          return this.sub.then(onFulfilled, onRejected);
        }
      }
      const p = Promise.resolve(1);
      new MyPromise(p).then(
        (v: any) => {
          expect(v).toBe(1);
          done();
        },
        () => done(),
      );
    });

    it('Symbol.species should return ZoneAwarePromise', () => {
      const empty = function () {};
      const promise = Promise.resolve(1);
      const FakePromise = (((promise.constructor = {} as any) as any)[Symbol.species] = function (
        exec: any,
      ) {
        exec(empty, empty);
      });
      expect(promise.then(empty) instanceof FakePromise).toBe(true);
    });

    it('should intercept scheduling of resolution and then', (done) => {
      pZone.run(() => {
        let p: Promise<any> = new Promise(function (resolve, reject) {
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
        const p = new Promise<string>(function (resolve, reject) {
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
        const p = new Promise<string>(function (resolve, reject) {
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

    describe('Promise API', function () {
      it('should work with .then', function (done) {
        let resolve: Function | null = null;

        testZone.run(function () {
          new Promise(function (resolveFn) {
            resolve = resolveFn;
          }).then(function () {
            expect(Zone.current).toBe(testZone);
            done();
          });
        });

        resolve!();
      });

      it('should work with .catch', function (done) {
        let reject: (() => void) | null = null;

        testZone.run(function () {
          new Promise(function (resolveFn, rejectFn) {
            reject = rejectFn;
          })['catch'](function () {
            expect(Zone.current).toBe(testZone);
            done();
          });
        });

        expect(reject!()).toBe(undefined);
      });

      it('should work with .finally with resolved promise', function (done) {
        let resolve: Function | null = null;

        testZone.run(function () {
          (
            new Promise(function (resolveFn) {
              resolve = resolveFn;
            }) as any
          ).finally(function () {
            expect(arguments.length).toBe(0);
            expect(Zone.current).toBe(testZone);
            done();
          });
        });

        resolve!('value');
      });

      it('should work with .finally with rejected promise', function (done) {
        let reject: Function | null = null;

        testZone.run(function () {
          (
            new Promise(function (_, rejectFn) {
              reject = rejectFn;
            }) as any
          ).finally(function () {
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
          Promise.resolve('resolveValue').then((v) => (value = v));
          expect(Zone.current.get('queue').length).toEqual(1);
          flushMicrotasks();
          expect(value).toEqual('resolveValue');
        });
      });

      it('should work with Promise.reject', () => {
        queueZone.run(() => {
          let value: any = null;
          Promise.reject('rejectReason')['catch']((v) => (value = v));
          expect(Zone.current.get('queue').length).toEqual(1);
          flushMicrotasks();
          expect(value).toEqual('rejectReason');
        });
      });

      describe('reject', () => {
        it('should reject promise', () => {
          queueZone.run(() => {
            let value: any = null;
            Promise.reject('rejectReason')['catch']((v) => (value = v));
            flushMicrotasks();
            expect(value).toEqual('rejectReason');
          });
        });

        it('should re-reject promise', () => {
          queueZone.run(() => {
            let value: any = null;
            Promise.reject('rejectReason')
              ['catch']((v) => {
                throw v;
              })
              ['catch']((v) => (value = v));
            flushMicrotasks();
            expect(value).toEqual('rejectReason');
          });
        });

        it('should reject and recover promise', () => {
          queueZone.run(() => {
            let value: any = null;
            Promise.reject('rejectReason')
              ['catch']((v) => v)
              .then((v) => (value = v));
            flushMicrotasks();
            expect(value).toEqual('rejectReason');
          });
        });

        it('should reject if chained promise does not catch promise', () => {
          queueZone.run(() => {
            let value: any = null;
            Promise.reject('rejectReason')
              .then((v) => fail('should not get here'))
              .then(null, (v) => (value = v));
            flushMicrotasks();
            expect(value).toEqual('rejectReason');
          });
        });

        it('should output error to console if ignoreConsoleErrorUncaughtError is false', async () => {
          await jasmine.spyOnGlobalErrorsAsync(() => {
            const originalConsoleError = console.error;
            Zone.current.fork({name: 'promise-error'}).run(() => {
              (Zone as any)[Zone.__symbol__('ignoreConsoleErrorUncaughtError')] = false;
              console.error = jasmine.createSpy('consoleErr');
              const p = new Promise((resolve, reject) => {
                throw new Error('promise error');
              });
            });
            return new Promise((res) => {
              setTimeout(() => {
                expect(console.error).toHaveBeenCalled();
                console.error = originalConsoleError;
                res();
              });
            });
          });
        });

        it('should not output error to console if ignoreConsoleErrorUncaughtError is true', async () => {
          await jasmine.spyOnGlobalErrorsAsync(() => {
            const originalConsoleError = console.error;
            Zone.current.fork({name: 'promise-error'}).run(() => {
              (Zone as any)[Zone.__symbol__('ignoreConsoleErrorUncaughtError')] = true;
              console.error = jasmine.createSpy('consoleErr');
              const p = new Promise((resolve, reject) => {
                throw new Error('promise error');
              });
            });
            return new Promise((res) => {
              setTimeout(() => {
                expect(console.error).not.toHaveBeenCalled();
                console.error = originalConsoleError;
                (Zone as any)[Zone.__symbol__('ignoreConsoleErrorUncaughtError')] = false;
                res();
              });
            });
          });
        });

        it('should notify Zone.onHandleError if no one catches promise', (done) => {
          let promiseError: Error | null = null;
          let zone: Zone | null = null;
          let task: Task | null = null;
          let error: Error | null = null;
          queueZone
            .fork({
              name: 'promise-error',
              onHandleError: (
                delegate: ZoneDelegate,
                current: Zone,
                target: Zone,
                error: any,
              ): boolean => {
                promiseError = error;
                delegate.handleError(target, error);
                return false;
              },
            })
            .run(() => {
              zone = Zone.current;
              task = Zone.currentTask;
              error = new Error('rejectedErrorShouldBeHandled');
              try {
                // throw so that the stack trace is captured
                throw error;
              } catch (e) {}
              Promise.reject(error);
              expect(promiseError).toBe(null);
            });
          setTimeout((): any => null);
          setTimeout(() => {
            expect(promiseError!.message).toBe(
              'Uncaught (in promise): ' + error + (error!.stack ? '\n' + error!.stack : ''),
            );
            expect((promiseError as any)['rejection']).toBe(error);
            expect((promiseError as any)['zone']).toBe(zone);
            expect((promiseError as any)['task']).toBe(task);
            done();
          });
        });

        it('should print readable information when throw a not error object', (done) => {
          let promiseError: Error | null = null;
          let zone: Zone | null = null;
          let task: Task | null = null;
          let rejectObj: TestRejection;
          queueZone
            .fork({
              name: 'promise-error',
              onHandleError: (
                delegate: ZoneDelegate,
                current: Zone,
                target: Zone,
                error: any,
              ): boolean => {
                promiseError = error;
                delegate.handleError(target, error);
                return false;
              },
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
            expect(promiseError!.message).toMatch(
              /Uncaught \(in promise\):.*: {"prop1":"value1","prop2":"value2"}/,
            );
            done();
          });
        });
      });

      describe('Promise.race', () => {
        it('should reject the value', () => {
          queueZone.run(() => {
            let value: any = null;
            (Promise as any)
              .race([Promise.reject('rejection1'), 'v1'])
              ['catch']((v: any) => (value = v));
            flushMicrotasks();
            expect(value).toEqual('rejection1');
          });
        });

        it('should resolve the value', () => {
          queueZone.run(() => {
            let value: any = null;
            (Promise as any)
              .race([Promise.resolve('resolution'), 'v1'])
              .then((v: any) => (value = v));
            flushMicrotasks();
            expect(value).toEqual('resolution');
          });
        });
      });

      describe('Promise.all', () => {
        it('should reject the value', () => {
          queueZone.run(() => {
            let value: any = null;
            Promise.all([Promise.reject('rejection'), 'v1'])['catch']((v: any) => (value = v));
            flushMicrotasks();
            expect(value).toEqual('rejection');
          });
        });

        it('should resolve with the sync then operation', () => {
          queueZone.run(() => {
            let value: any = null;
            const p1 = {
              then: function (thenCallback: Function) {
                return thenCallback('p1');
              },
            };
            const p2 = {
              then: function (thenCallback: Function) {
                return thenCallback('p2');
              },
            };
            Promise.all([p1, 'v1', p2]).then((v: any) => (value = v));
            flushMicrotasks();
            expect(value).toEqual(['p1', 'v1', 'p2']);
          });
        });

        it(
          'should resolve generators',
          ifEnvSupports(
            () => {
              return isNode;
            },
            () => {
              const generators: any = function* () {
                yield Promise.resolve(1);
                yield Promise.resolve(2);
                return;
              };
              queueZone.run(() => {
                let value: any = null;
                Promise.all(generators()).then((val) => {
                  value = val;
                });
                flushMicrotasks();
                expect(value).toEqual([1, 2]);
              });
            },
          ),
        );

        it('should handle object with a truthy `then property`', () => {
          queueZone.run(() => {
            let value: any = null;
            Promise.all([{then: 123}]).then((v: any) => (value = v));
            flushMicrotasks();
            expect(value).toEqual([jasmine.objectContaining({then: 123})]);
          });
        });
      });
    });

    describe('Promise subclasses', function () {
      class MyPromise<T> {
        private _promise: Promise<any>;
        constructor(init: any) {
          this._promise = new Promise(init);
        }

        catch<TResult = never>(
          onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null,
        ): Promise<T | TResult> {
          return this._promise.catch.call(this._promise, onrejected);
        }

        then<TResult1 = T, TResult2 = never>(
          onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null,
          onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null,
        ): Promise<any> {
          return this._promise.then.call(this._promise, onfulfilled, onrejected);
        }
      }

      const setPrototypeOf =
        (Object as any).setPrototypeOf ||
        function (obj: any, proto: any) {
          obj.__proto__ = proto;
          return obj;
        };

      setPrototypeOf(MyPromise.prototype, Promise.prototype);

      it('should reject if the Promise subclass rejects', function () {
        const myPromise = new MyPromise(function (resolve: any, reject: any): void {
          reject('foo');
        });

        return Promise.resolve()
          .then(function () {
            return myPromise;
          })
          .then(
            function () {
              throw new Error('Unexpected resolution');
            },
            function (result) {
              expect(result).toBe('foo');
            },
          );
      });

      function testPromiseSubClass(done?: Function) {
        const myPromise = new MyPromise(function (resolve: any, reject: Function) {
          resolve('foo');
        });

        return Promise.resolve()
          .then(function () {
            return myPromise;
          })
          .then(function (result) {
            expect(result).toBe('foo');
            done && done();
          });
      }

      it(
        'should resolve if the Promise subclass resolves',
        jasmine
          ? function (done) {
              testPromiseSubClass(done);
            }
          : function () {
              testPromiseSubClass();
            },
      );
    });

    describe('Promise.any', () => {
      const any = (Promise as any).any;
      it('undefined parameters', (done: DoneFn) => {
        any().then(
          () => {
            fail('should not get a resolved promise.');
          },
          (err: any) => {
            expect(err.message).toEqual('All promises were rejected');
            expect(err.errors).toEqual([]);
            done();
          },
        );
      });
      it('invalid iterable', (done: DoneFn) => {
        const invalidIterable: any = {};
        invalidIterable[Symbol.iterator] = () => 2;
        any(invalidIterable).then(
          () => {
            fail('should not get a resolved promise.');
          },
          (err: any) => {
            expect(err.message).toEqual('All promises were rejected');
            expect(err.errors).toEqual([]);
            done();
          },
        );
      });
      it('empty parameters', (done: DoneFn) => {
        any([]).then(
          () => {
            fail('should not get a resolved promise.');
          },
          (err: any) => {
            expect(err.message).toEqual('All promises were rejected');
            expect(err.errors).toEqual([]);
            done();
          },
        );
      });
      it('non promises parameters', (done: DoneFn) => {
        any([1, 'test']).then(
          (v: any) => {
            expect(v).toBe(1);
            done();
          },
          (err: any) => {
            fail('should not get a rejected promise.');
          },
        );
      });
      it('mixed parameters, non promise first', (done: DoneFn) => {
        any([1, Promise.resolve(2)]).then(
          (v: any) => {
            expect(v).toBe(1);
            done();
          },
          (err: any) => {
            fail('should not get a rejected promise.');
          },
        );
      });
      it('mixed parameters, promise first', (done: DoneFn) => {
        any([Promise.resolve(1), 2]).then(
          (v: any) => {
            expect(v).toBe(1);
            done();
          },
          (err: any) => {
            fail('should not get a rejected promise.');
          },
        );
      });
      it('all ok promises', (done: DoneFn) => {
        any([Promise.resolve(1), Promise.resolve(2)]).then(
          (v: any) => {
            expect(v).toBe(1);
            done();
          },
          (err: any) => {
            fail('should not get a rejected promise.');
          },
        );
      });
      it('all promises, first rejected', (done: DoneFn) => {
        any([Promise.reject('error'), Promise.resolve(2)]).then(
          (v: any) => {
            expect(v).toBe(2);
            done();
          },
          (err: any) => {
            fail('should not get a rejected promise.');
          },
        );
      });
      it('all promises, second rejected', (done: DoneFn) => {
        any([Promise.resolve(1), Promise.reject('error')]).then(
          (v: any) => {
            expect(v).toBe(1);
            done();
          },
          (err: any) => {
            fail('should not get a rejected promise.');
          },
        );
      });
      it('all rejected promises', (done: DoneFn) => {
        any([Promise.reject('error1'), Promise.reject('error2')]).then(
          (v: any) => {
            fail('should not get a resolved promise.');
          },
          (err: any) => {
            expect(err.message).toEqual('All promises were rejected');
            expect(err.errors).toEqual(['error1', 'error2']);
            done();
          },
        );
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
        allSettled([Promise.resolve(a), Promise.resolve(b), Promise.resolve(c)]).then(
          (results: any[]) => {
            expect(results).toEqual([yes(a), yes(b), yes(c)]);
            done();
          },
        );
      });
      it('all rejected', (done: DoneFn) => {
        allSettled([Promise.reject(a), Promise.reject(b), Promise.reject(c)]).then(
          (results: any[]) => {
            expect(results).toEqual([no(a), no(b), no(c)]);
            done();
          },
        );
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
        const promise = new Promise(function () {});
        promise.then = function () {
          throw new EvalError();
        };
        allSettled([promise]).then(
          () => {
            fail('should not reach here');
          },
          (reason: any) => {
            expect(reason instanceof EvalError).toBe(true);
            done();
          },
        );
      });
      const Subclass = (function () {
        try {
          // eslint-disable-next-line no-new-func
          return Function(
            'class Subclass extends Promise { constructor(...args) { super(...args); this.thenArgs = []; } then(...args) { Subclass.thenArgs.push(args); this.thenArgs.push(args); return super.then(...args); } } Subclass.thenArgs = []; return Subclass;',
          )();
        } catch (e) {
          /**/
        }

        return false;
      })();

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

      describe('resolve/reject multiple times', () => {
        it('should ignore second resolve', (done) => {
          const nested = new Promise((res) => setTimeout(() => res('nested')));
          const p = new Promise((res) => {
            res(nested);
            res(1);
          });
          p.then((v) => {
            expect(v).toBe('nested');
            done();
          });
        });
        it('should ignore second resolve', (done) => {
          const nested = new Promise((res) => setTimeout(() => res('nested')));
          const p = new Promise((res) => {
            res(1);
            res(nested);
          });
          p.then((v) => {
            expect(v).toBe(1);
            done();
          });
        });
        it('should ignore second reject', (done) => {
          const p = new Promise((res, rej) => {
            rej(1);
            rej(2);
          });
          p.then(
            (v) => {
              fail('should not get here');
            },
            (err) => {
              expect(err).toBe(1);
              done();
            },
          );
        });
        it('should ignore resolve after reject', (done) => {
          const p = new Promise((res, rej) => {
            rej(1);
            res(2);
          });
          p.then(
            (v) => {
              fail('should not get here');
            },
            (err) => {
              expect(err).toBe(1);
              done();
            },
          );
        });
        it('should ignore reject after resolve', (done) => {
          const nested = new Promise((res) => setTimeout(() => res('nested')));
          const p = new Promise((res, rej) => {
            res(nested);
            rej(1);
          });
          p.then(
            (v) => {
              expect(v).toBe('nested');
              done();
            },
            (err) => {
              fail('should not be here');
            },
          );
        });
      });
    });

    describe('Promise.withResolvers', () => {
      it('should resolve', (done: DoneFn) => {
        const {promise, resolve, reject} = (Promise as any).withResolvers();
        promise.then((v: any) => {
          expect(v).toBe(1);
          done();
        });
        resolve(1);
      });
      it('should reject', (done: DoneFn) => {
        const {promise, resolve, reject} = (Promise as any).withResolvers();
        const error = new Error('test');
        promise.catch((e: any) => {
          expect(e).toBe(error);
          done();
        });
        reject(error);
      });
    });
  }),
);
