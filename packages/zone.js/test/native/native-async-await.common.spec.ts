const {fakeAsync, tick, flushMicrotasks} = (Zone as any)[Zone.__symbol__('fakeAsyncTest')];

const logs: string[] = [];
let handleError = false;
const zone1 = Zone.current.fork({
  name: 'zone1',
  onScheduleTask: (delegate, curr, target, task) => {
    if (task.source !== 'jasmine.execute().forceTask') {
      logs.push(`zone1 schedule task ${task.source}`);
    }
    return delegate.scheduleTask(target, task);
  },
  onInvokeTask: (delegate, curr, target, task, applyThis, applyArgs) => {
    if (task.source !== 'jasmine.execute().forceTask') {
      logs.push(`zone1 invoke task ${task.source}`);
    }
    return delegate.invokeTask(target, task, applyThis, applyArgs);
  },
  onInvoke: (delegate, curr, target, callback, applyThis, applyArgs, source) => {
    if (source !== 'jasmine.execute().forceTask') {
      logs.push(`zone1 invoke ${source}`);
    }
    return delegate.invoke(target, callback, applyThis, applyArgs, source);
  },
  onHandleError: (delegate, curr, target, error) => {
    logs.push(`zone1 handle error ${error.message}`);
    return handleError;
  },
});

function increase(a: number) {
  return a + 1;
}

function increaseAsync(a: number, throwError = false, timeout = 0): Promise<number> {
  return new Promise((res, rej) => setTimeout(() => {
                       if (throwError) {
                         rej(new Error('throw error in promise'));
                       } else {
                         res(a + 1);
                       }
                     }, timeout));
}

/**
 * Generator test for sync operation, the function before transpile looks like
 * the following code.
 *
 * async function testAsync1(options: {a: number; throwError: boolean} = {
 *   a: 0,
 *   throwError: false,
 * }) {
 *   let a = options.a;
 *   a++;
 *   a = await increase(a);
 *   a++;
 *   if (options.throwError) {
 *     throw new Error('throw error in async function');
 *   }
 *   a = await increase(a);
 *   a++;
 *   return a;
 * }
 */
const generatorTest1 = function*(options: {a: number; throwError: boolean} = {
  a: 0,
  throwError: false,
}) {
  let a = options.a;
  a++;
  logs.push(`before await ${Zone.current.name}`);
  a = yield increase(a);
  logs.push(`after await1 ${Zone.current.name} ${a}`);
  a++;
  if (options.throwError) {
    throw new Error('throw error in async function');
  }
  a = yield increase(a);
  logs.push(`after await2 ${Zone.current.name} ${a}`);
  return a;
};

/**
 * Generator test for async operation, the function before transpile looks like
 * the following code.
 *
 * async function testAsync2(options: {a: number; throwError: boolean} = {
 *  a: 0,
 *  throwError: false,
 * }) {
 *   let a = options.a;
 *   a++;
 *   a = await increaseAsync(a);
 *   a++;
 *   a = await increaseAsync(a, options.throwError);
 *   a++;
 *   return a;
 * }
 */
const generatorTest2 = function*(options: {a: number; throwError: boolean} = {
  a: 0,
  throwError: false,
}) {
  let a = options.a;
  a++;
  logs.push(`before await ${Zone.current.name}`);
  a = yield increaseAsync(a);
  logs.push(`after await1 ${Zone.current.name} ${a}`);
  a++;
  a = yield increaseAsync(a, options.throwError);
  logs.push(`after await2 ${Zone.current.name} ${a}`);
  return a;
};

const generatorTest3 = function*(options: {a: number; throwError: boolean} = {
  a: 0,
  throwError: false,
}) {
  let a = options.a;
  a++;
  logs.push(`before await ${Zone.current.name}`);
  a = yield increaseAsync(a);
  logs.push(`after await1 ${Zone.current.name} ${a}`);
  a++;
  try {
    a = yield increaseAsync(a, options.throwError);
  } catch (error) {
    logs.push(`catch error ${(error as Error).message}`);
  }
  logs.push(`after await2 ${Zone.current.name} ${a}`);
  a = yield increaseAsync(a);
  logs.push(`after await3 ${Zone.current.name} ${a}`);
  a = yield increaseAsync(a);
  logs.push(`after await4 ${Zone.current.name} ${a}`);
  a = yield increaseAsync(a);
  logs.push(`after await5 ${Zone.current.name} ${a}`);
  return a;
};

const generatorTest4 = function*(options: {a: number; throwError: boolean} = {
  a: 0,
  throwError: false,
}) {
  let a = options.a;
  if (options.throwError) {
    throw new Error('throw error in generatorTest4');
  }
  logs.push(`before await ${Zone.current.name}`);
  a = yield increaseAsync(a);
  logs.push(`after await ${Zone.current.name} ${a}`);
  return a;
};

const generatorTest5 = function*(options: {a: number; throwError: boolean} = {
  a: 0,
  throwError: false,
}) {
  let a = options.a;
  try {
    if (options.throwError) {
      throw new Error('throw error in generatorTest4');
    }
  } catch (error) {
    logs.push(`before await ${Zone.current.name}`);
    a = yield increaseAsync(a);
    logs.push(`after await ${Zone.current.name} ${a}`);
  }
  return a;
};

const generatorTest6 = function*(options: {a: number; throwError: boolean} = {
  a: 0,
  throwError: false,
}) {
  let a = options.a;
  a++;
  logs.push(`before await ${Zone.current.name}`);
  a = yield increaseAsync(a);
  logs.push(`after await1 ${Zone.current.name} ${a}`);
  a++;
  a = yield increaseAsync(a, options.throwError, 100);
  logs.push(`after await2 ${Zone.current.name} ${a}`);
  return a;
};

describe('native async/await', () => {
  beforeEach(() => {
    logs.length = 0;
  });
  describe('testAsync1', () => {
    it('should run into the original zone with then instead of await', (done: DoneFn) => {
      zone1.run(() => {
        expect(Zone.current.name).toEqual(zone1.name);
        const r = Zone.__awaiter(undefined, [], generatorTest1);
        r.then((v) => {
          expect(v).toEqual(4);
          expect(Zone.current.name).toEqual(zone1.name);
          done();
        });
      });
    });
    it('should run into the original zone after await without parameter', (done: DoneFn) => {
      // Simulate code like this.
      //
      // zone1.run(async function (this: unknown) {
      //   expect(Zone.current.name).toEqual(zone1.name);
      //   const r = await testAsync1();
      //   expect(r).toEqual(4);
      //   expect(Zone.current.name).toEqual(zone1.name);
      //   expect(logs).toEqual([
      //     'zone1 invoke undefined',
      //     'before await zone1',
      //     'zone1 invoke native await',
      //     'after await1 zone1 2',
      //     'zone1 invoke native await',
      //     'after await2 zone1 4',
      //     'zone1 invoke native await',
      //   ]);
      // });
      zone1.run(function() {
        Zone.__awaiter(undefined, [], function*() {
          expect(Zone.current.name).toEqual(zone1.name);
          const r = yield Zone.__awaiter(undefined, [], generatorTest1);
          expect(r).toEqual(4);
          expect(Zone.current.name).toEqual(zone1.name);
          expect(logs).toEqual([
            'zone1 invoke undefined',
            'before await zone1',
            'zone1 invoke native await',
            'after await1 zone1 2',
            'zone1 invoke native await',
            'after await2 zone1 4',
            'zone1 invoke native await',
          ]);
          done();
        });
      });
    });

    it('should run into the original zone after await with parameter', (done: DoneFn) => {
      zone1.run(function() {
        Zone.__awaiter(undefined, [], function*() {
          expect(Zone.current.name).toEqual(zone1.name);
          const r = yield Zone.__awaiter(undefined, [{a: 1}], generatorTest1);
          expect(r).toEqual(5);
          expect(Zone.current.name).toEqual(zone1.name);
          expect(logs).toEqual([
            'zone1 invoke undefined',
            'before await zone1',
            'zone1 invoke native await',
            'after await1 zone1 3',
            'zone1 invoke native await',
            'after await2 zone1 5',
            'zone1 invoke native await',
          ]);
          done();
        });
      });
    });

    it('should trigger zone onHandleError', (done: DoneFn) => {
      zone1.runGuarded(function() {
        Zone.__awaiter(undefined, [], function*() {
          expect(Zone.current.name).toEqual(zone1.name);
          const r = yield Zone.__awaiter(undefined, [{a: 1, throwError: true}], generatorTest1);
          expect(r).toBeUndefined();
          expect(Zone.current.name).toEqual(zone1.name);
          expect(logs).toEqual([
            'zone1 invoke undefined',
            'before await zone1',
            'zone1 invoke native await',
            'after await1 zone1 3',
            'zone1 invoke native await',
            'zone1 handle error throw error in async function',
            'zone1 invoke native await',
            'zone1 invoke native await',
          ]);
          done();
        });
      });
    });
  });

  describe('testAsync2', () => {
    it('should run into the original zone with then instead of await', (done: DoneFn) => {
      zone1.run(() => {
        expect(Zone.current.name).toEqual(zone1.name);
        const r = Zone.__awaiter<number>(undefined, [{a: 1}], generatorTest2);
        r.then((v) => {
          expect(v).toEqual(5);
          expect(Zone.current.name).toEqual(zone1.name);
          done();
        });
      });
    });
    it('should run into the original zone after await without parameter', (done: DoneFn) => {
      zone1.run(function() {
        Zone.__awaiter(undefined, [], function*() {
          expect(Zone.current.name).toEqual(zone1.name);
          const r = yield Zone.__awaiter(undefined, [], generatorTest2);
          expect(r).toEqual(4);
          expect(Zone.current.name).toEqual(zone1.name);
          expect(logs).toEqual([
            'zone1 invoke undefined',
            'before await zone1',
            'zone1 schedule task setTimeout',
            'zone1 invoke task setTimeout',
            'zone1 invoke native await',
            'after await1 zone1 2',
            'zone1 schedule task setTimeout',
            'zone1 invoke task setTimeout',
            'zone1 invoke native await',
            'after await2 zone1 4',
            'zone1 invoke native await',
          ]);
          done();
        });
      });
    });

    it('should run into the original zone after await with parameter', (done: DoneFn) => {
      zone1.run(function() {
        Zone.__awaiter(undefined, [], function*() {
          expect(Zone.current.name).toEqual(zone1.name);
          const r = yield Zone.__awaiter(undefined, [{a: 1}], generatorTest2);
          expect(r).toEqual(5);
          expect(Zone.current.name).toEqual(zone1.name);
          expect(logs).toEqual([
            'zone1 invoke undefined',
            'before await zone1',
            'zone1 schedule task setTimeout',
            'zone1 invoke task setTimeout',
            'zone1 invoke native await',
            'after await1 zone1 3',
            'zone1 schedule task setTimeout',
            'zone1 invoke task setTimeout',
            'zone1 invoke native await',
            'after await2 zone1 5',
            'zone1 invoke native await',
          ]);
          done();
        });
      });
    });

    it('should trigger zone onHandleError', (done: DoneFn) => {
      zone1.runGuarded(function() {
        Zone.__awaiter(undefined, [], function*() {
          expect(Zone.current.name).toEqual(zone1.name);
          const r = yield Zone.__awaiter(undefined, [{a: 1, throwError: true}], generatorTest2);
          expect(r).toBeUndefined();
          expect(Zone.current.name).toEqual(zone1.name);
          expect(logs).toEqual([
            'zone1 invoke undefined',
            'before await zone1',
            'zone1 schedule task setTimeout',
            'zone1 invoke task setTimeout',
            'zone1 invoke native await',
            'after await1 zone1 3',
            'zone1 schedule task setTimeout',
            'zone1 invoke task setTimeout',
            'zone1 invoke native await',
            'zone1 handle error throw error in promise',
            'zone1 invoke native await',
            'zone1 invoke native await',
          ]);
          done();
        });
      });
    });
  });

  describe('multiple await', () => {
    it('should run into the original zone', (done: DoneFn) => {
      zone1.run(function() {
        Zone.__awaiter(undefined, [], function*() {
          expect(Zone.current.name).toEqual(zone1.name);
          let r = yield Zone.__awaiter(undefined, [], generatorTest1);
          expect(r).toEqual(4);
          r = yield Zone.__awaiter(undefined, [], generatorTest2);
          expect(r).toEqual(4);
          expect(Zone.current.name).toEqual(zone1.name);
          expect(logs).toEqual([
            'zone1 invoke undefined',
            'before await zone1',
            'zone1 invoke native await',
            'after await1 zone1 2',
            'zone1 invoke native await',
            'after await2 zone1 4',
            'zone1 invoke native await',
            'before await zone1',
            'zone1 schedule task setTimeout',
            'zone1 invoke task setTimeout',
            'zone1 invoke native await',
            'after await1 zone1 2',
            'zone1 schedule task setTimeout',
            'zone1 invoke task setTimeout',
            'zone1 invoke native await',
            'after await2 zone1 4',
            'zone1 invoke native await',
          ]);
          done();
        });
      });
    });

    it('should run into the original zone after await with parameter', (done: DoneFn) => {
      zone1.run(function() {
        Zone.__awaiter(undefined, [], function*() {
          expect(Zone.current.name).toEqual(zone1.name);
          let r = yield Zone.__awaiter(undefined, [{a: 1}], generatorTest1);
          expect(r).toEqual(5);
          r = yield Zone.__awaiter(undefined, [{a: 1}], generatorTest2);
          expect(r).toEqual(5);
          expect(Zone.current.name).toEqual(zone1.name);
          expect(logs).toEqual([
            'zone1 invoke undefined',
            'before await zone1',
            'zone1 invoke native await',
            'after await1 zone1 3',
            'zone1 invoke native await',
            'after await2 zone1 5',
            'zone1 invoke native await',
            'before await zone1',
            'zone1 schedule task setTimeout',
            'zone1 invoke task setTimeout',
            'zone1 invoke native await',
            'after await1 zone1 3',
            'zone1 schedule task setTimeout',
            'zone1 invoke task setTimeout',
            'zone1 invoke native await',
            'after await2 zone1 5',
            'zone1 invoke native await',
          ]);
          done();
        });
      });
    });

    it('should trigger zone onHandleError', (done: DoneFn) => {
      zone1.runGuarded(function() {
        Zone.__awaiter(undefined, [], function*() {
          expect(Zone.current.name).toEqual(zone1.name);
          let r = yield Zone.__awaiter(undefined, [{a: 1, throwError: true}], generatorTest1);
          expect(r).toBeUndefined();
          r = yield Zone.__awaiter(undefined, [{a: 1, throwError: true}], generatorTest2);
          expect(r).toBeUndefined();
          expect(Zone.current.name).toEqual(zone1.name);
          expect(logs).toEqual([
            'zone1 invoke undefined',
            'before await zone1',
            'zone1 invoke native await',
            'after await1 zone1 3',
            'zone1 invoke native await',
            'zone1 handle error throw error in async function',
            'zone1 invoke native await',
            'zone1 invoke native await',
            'before await zone1',
            'zone1 schedule task setTimeout',
            'zone1 invoke task setTimeout',
            'zone1 invoke native await',
            'after await1 zone1 3',
            'zone1 schedule task setTimeout',
            'zone1 invoke task setTimeout',
            'zone1 invoke native await',
            'zone1 handle error throw error in promise',
            'zone1 invoke native await',
            'zone1 invoke native await',
          ]);
          done();
        });
      });
    });

    it('should trigger zone onHandleError and continue to invoke the following await',
       (done: DoneFn) => {
         handleError = true;
         zone1.runGuarded(function() {
           Zone.__awaiter(undefined, [], function*() {
             const r = yield Zone.__awaiter(undefined, [{a: 1, throwError: true}], generatorTest3);
             expect(r).toBe(5);
             expect(Zone.current.name).toEqual(zone1.name);
             expect(logs).toEqual([
               'zone1 invoke undefined',         'before await zone1',
               'zone1 schedule task setTimeout', 'zone1 invoke task setTimeout',
               'zone1 invoke native await',      'after await1 zone1 3',
               'zone1 schedule task setTimeout', 'zone1 invoke task setTimeout',
               'zone1 invoke native await',      'catch error throw error in promise',
               'after await2 zone1 4',           'zone1 schedule task setTimeout',
               'zone1 invoke native await',      'after await3 zone1 3',
               'zone1 schedule task setTimeout', 'zone1 invoke task setTimeout',
               'zone1 invoke task setTimeout',   'zone1 invoke native await',
               'after await4 zone1 4',           'zone1 schedule task setTimeout',
               'zone1 invoke task setTimeout',   'zone1 invoke native await',
               'after await5 zone1 5',           'zone1 invoke native await',
             ]);
             handleError = false;
             done();
           });
         });
       });
  });

  describe('throw error', () => {
    it('should be able to catch error in the first generator.next()', (done: DoneFn) => {
      handleError = false;
      zone1.runGuarded(function() {
        Zone.__awaiter(undefined, [], function*() {
          const r = yield Zone.__awaiter(undefined, [{a: 1, throwError: true}], generatorTest4);
          expect(r).toBeUndefined();
          expect(Zone.current.name).toEqual(zone1.name);
          expect(logs).toEqual([
            'zone1 invoke undefined', 'zone1 invoke native await',
            'zone1 handle error throw error in generatorTest4', 'zone1 invoke native await'
          ]);
          done();
        });
      });
    });

    it('should be able to catch error in the first generator.next() and continue to execute',
       (done: DoneFn) => {
         handleError = false;
         zone1.runGuarded(function() {
           Zone.__awaiter(undefined, [], function*() {
             const r = yield Zone.__awaiter(undefined, [{a: 1, throwError: true}], generatorTest5);
             expect(r).toBe(2);
             expect(Zone.current.name).toEqual(zone1.name);
             expect(logs).toEqual([
               'zone1 invoke undefined', 'before await zone1', 'zone1 schedule task setTimeout',
               'zone1 invoke task setTimeout', 'zone1 invoke native await', 'after await zone1 2',
               'zone1 invoke native await'
             ]);
             done();
           });
         });
       });
  });
});

describe('fakeAsync', () => {
  beforeEach(() => {
    logs.length = 0;
  });
  describe('synchronous code', () => {
    it('should throw error on Rejected promise', fakeAsync(() => {
         expect(() => {
           Promise.reject('myError');
           flushMicrotasks();
         }).toThrowError('Uncaught (in promise): myError');
       }));

    it('should throw error on Rejected promise with __fakeAsyncAwaiter()', fakeAsync(() => {
         expect(() => {
           Zone.__awaiter(undefined, [], function*() {
             yield Promise.reject('myError');
           });
           flushMicrotasks();
         }).toThrowError('Uncaught (in promise): myError');
       }));
  });

  describe('asynchronous code', () => {
    it('should run', fakeAsync(() => {
         let thenRan = false;
         Promise.resolve(null).then((_) => {
           thenRan = true;
         });

         expect(thenRan).toEqual(false);

         flushMicrotasks();
         expect(thenRan).toEqual(true);
       }));

    it('should run with __fakeAsyncAwaiter()', fakeAsync(() => {
         let thenRan = false;
         Zone.__awaiter(undefined, [], function*() {
           yield Promise.resolve(null).then((_) => {
             thenRan = true;
           });
         });

         expect(thenRan).toEqual(false);

         flushMicrotasks();
         expect(thenRan).toEqual(true);
       }));

    it('should rethrow the exception on flushMicroTasks for error thrown in Promise callback',
       fakeAsync(() => {
         Promise.resolve(null).then((_) => {
           throw new Error('async');
         });
         expect(() => {
           flushMicrotasks();
         }).toThrowError(/Uncaught \(in promise\): Error: async/);
       }));

    it('should rethrow the exception on flushMicroTasks for error thrown in Promise callback with __fakeAsyncAwaiter()',
       fakeAsync(() => {
         Zone.__awaiter(undefined, [], function*() {
           yield Promise.resolve(null).then((_) => {
             throw new Error('async');
           });
         });
         expect(() => {
           flushMicrotasks();
         }).toThrowError(/Uncaught \(in promise\): Error: async/);
       }));

    it('should run chained thens', fakeAsync(() => {
         let log: number[] = [];

         Promise.resolve(null).then((_) => log.push(1)).then((_) => log.push(2));

         expect(log).toEqual([]);

         flushMicrotasks();
         expect(log).toEqual([1, 2]);
       }));

    it('should run chained thens with __fakeAsyncAwaiter()', fakeAsync(() => {
         let log: number[] = [];
         Zone.__awaiter(undefined, [], function*() {
           yield Promise.resolve(null).then((_) => log.push(1)).then((_) => log.push(2));
         });

         expect(log).toEqual([]);

         flushMicrotasks();
         expect(log).toEqual([1, 2]);
       }));

    it('should run Promise created in Promise', fakeAsync(() => {
         let log: number[] = [];

         Promise.resolve(null).then((_) => {
           log.push(1);
           Promise.resolve(null).then((_) => log.push(2));
         });

         expect(log).toEqual([]);
         flushMicrotasks();
         expect(log).toEqual([1, 2]);
       }));

    it('should run Promise created in Promise with __fakeAsyncAwaiter()', fakeAsync(() => {
         let log: number[] = [];

         Zone.__awaiter(undefined, [], function*() {
           yield Promise.resolve(null).then((_) => {
             log.push(1);
             Promise.resolve(null).then((_) => log.push(2));
           });
         });

         expect(log).toEqual([]);
         flushMicrotasks();
         expect(log).toEqual([1, 2]);
       }));

    it('should run into the original zone after await without parameter with __fakeAsyncAwaiter()',
       fakeAsync(() => {
         let r: any = undefined;
         Zone.__awaiter(undefined, [], function*() {
           r = yield Zone.__awaiter(undefined, [], generatorTest6);
         });
         expect(r).toBeUndefined();
         expect(logs).toEqual(['before await ProxyZone']);
         tick();
         expect(r).toBeUndefined();
         expect(logs).toEqual([
           'before await ProxyZone',
           'after await1 ProxyZone 2',
         ]);
         tick(100);
         expect(r).toBe(4);
         expect(logs).toEqual([
           'before await ProxyZone',
           'after await1 ProxyZone 2',
           'after await2 ProxyZone 4',
         ]);
       }));
  });
});
