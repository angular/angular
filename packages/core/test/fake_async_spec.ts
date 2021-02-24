/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {discardAllTasks, discardPeriodicTasks, fakeAsync, flush, flushMicrotasks, flushOnlyPendingTasks, getFakeSystemTime, getRealSystemTime, getTaskCount, setFakeSystemTime, tick, tickToNext} from '@angular/core/testing';
import {beforeEach, describe, inject, it, Log} from '@angular/core/testing/src/testing_internal';
import {EventManager} from '@angular/platform-browser';
import {expect} from '@angular/platform-browser/testing/src/matchers';

const resolvedPromise = Promise.resolve(null);
const ProxyZoneSpec: {assertPresent: () => void} = (Zone as any)['ProxyZoneSpec'];

{
  describe('fake async', () => {
    it('should run synchronous code', () => {
      let ran = false;
      fakeAsync(() => {
        ran = true;
      })();

      expect(ran).toEqual(true);
    });

    it('should pass arguments to the wrapped function', () => {
      fakeAsync((foo: any /** TODO #9100 */, bar: any /** TODO #9100 */) => {
        expect(foo).toEqual('foo');
        expect(bar).toEqual('bar');
      })('foo', 'bar');
    });

    it('should work with inject()',
       fakeAsync(inject([EventManager], (eventManager: EventManager) => {
         expect(eventManager).toBeAnInstanceOf(EventManager);
       })));

    it('should throw on nested calls', () => {
      expect(() => {
        fakeAsync(() => {
          fakeAsync((): any /** TODO #9100 */ => null)();
        })();
      }).toThrowError('fakeAsync() calls can not be nested');
    });

    it('should flush microtasks before returning', () => {
      let thenRan = false;

      fakeAsync(() => {
        resolvedPromise.then(_ => {
          thenRan = true;
        });
      })();

      expect(thenRan).toEqual(true);
    });


    it('should propagate the return value', () => {
      expect(fakeAsync(() => 'foo')()).toEqual('foo');
    });

    describe('Promise', () => {
      it('should run asynchronous code', fakeAsync(() => {
           let thenRan = false;
           resolvedPromise.then((_) => {
             thenRan = true;
           });

           expect(thenRan).toEqual(false);

           flushMicrotasks();
           expect(thenRan).toEqual(true);
         }));

      it('should run chained thens', fakeAsync(() => {
           const log = new Log();

           resolvedPromise.then((_) => log.add(1)).then((_) => log.add(2));

           expect(log.result()).toEqual('');

           flushMicrotasks();
           expect(log.result()).toEqual('1; 2');
         }));

      it('should run Promise created in Promise', fakeAsync(() => {
           const log = new Log();

           resolvedPromise.then((_) => {
             log.add(1);
             resolvedPromise.then((_) => log.add(2));
           });

           expect(log.result()).toEqual('');

           flushMicrotasks();
           expect(log.result()).toEqual('1; 2');
         }));

      it('should complain if the test throws an exception during async calls', () => {
        expect(() => {
          fakeAsync(() => {
            resolvedPromise.then((_) => {
              throw new Error('async');
            });
            flushMicrotasks();
          })();
        }).toThrow();
      });

      it('should complain if a test throws an exception', () => {
        expect(() => {
          fakeAsync(() => {
            throw new Error('sync');
          })();
        }).toThrowError('sync');
      });
    });

    describe('timers', () => {
      it('should run queued zero duration timer on zero tick', fakeAsync(() => {
           let ran = false;
           setTimeout(() => {
             ran = true;
           }, 0);

           expect(ran).toEqual(false);

           tick();
           expect(ran).toEqual(true);
         }));


      it('should run queued timer after sufficient clock ticks', fakeAsync(() => {
           let ran = false;
           setTimeout(() => {
             ran = true;
           }, 10);

           tick(6);
           expect(ran).toEqual(false);

           tick(6);
           expect(ran).toEqual(true);
         }));

      it('should run new macro tasks created by timer callback', fakeAsync(() => {
           function nestedTimer(callback: () => any): void {
             setTimeout(() => setTimeout(() => callback()));
           }
           const callback = jasmine.createSpy('callback');
           nestedTimer(callback);
           expect(callback).not.toHaveBeenCalled();
           tick(0);
           expect(callback).toHaveBeenCalled();
         }));

      it('should not queue nested timer on tick with processNewMacroTasksSynchronously=false',
         fakeAsync(() => {
           function nestedTimer(callback: () => any): void {
             setTimeout(() => setTimeout(() => callback()));
           }
           const callback = jasmine.createSpy('callback');
           nestedTimer(callback);
           expect(callback).not.toHaveBeenCalled();
           tick(0, {processNewMacroTasksSynchronously: false});
           expect(callback).not.toHaveBeenCalled();
           flush();
           expect(callback).toHaveBeenCalled();
         }));

      it('should run queued timer only once', fakeAsync(() => {
           let cycles = 0;
           setTimeout(() => {
             cycles++;
           }, 10);

           tick(10);
           expect(cycles).toEqual(1);

           tick(10);
           expect(cycles).toEqual(1);

           tick(10);
           expect(cycles).toEqual(1);
         }));

      it('should not run cancelled timer', fakeAsync(() => {
           let ran = false;
           const id = setTimeout(() => {
             ran = true;
           }, 10);
           clearTimeout(id);

           tick(10);
           expect(ran).toEqual(false);
         }));

      it('should throw an error on dangling timers', () => {
        expect(() => {
          fakeAsync(() => {
            setTimeout(() => {}, 10);
          })();
        }).toThrowError('1 timer(s) still in the queue.');
      });

      it('should throw an error on dangling periodic timers', () => {
        expect(() => {
          fakeAsync(() => {
            setInterval(() => {}, 10);
          })();
        }).toThrowError('1 periodic timer(s) still in the queue.');
      });

      it('should run periodic timers', fakeAsync(() => {
           let cycles = 0;
           const id = setInterval(() => {
             cycles++;
           }, 10);

           tick(10);
           expect(cycles).toEqual(1);

           tick(10);
           expect(cycles).toEqual(2);

           tick(10);
           expect(cycles).toEqual(3);
           clearInterval(id);
         }));

      it('should not run cancelled periodic timer', fakeAsync(() => {
           let ran = false;
           const id = setInterval(() => {
             ran = true;
           }, 10);
           clearInterval(id);

           tick(10);
           expect(ran).toEqual(false);
         }));

      it('should be able to cancel periodic timers from a callback', fakeAsync(() => {
           let cycles = 0;
           let id: any /** TODO #9100 */;

           id = setInterval(() => {
             cycles++;
             clearInterval(id);
           }, 10);

           tick(10);
           expect(cycles).toEqual(1);

           tick(10);
           expect(cycles).toEqual(1);
         }));

      it('should clear periodic timers', fakeAsync(() => {
           let cycles = 0;
           const id = setInterval(() => {
             cycles++;
           }, 10);

           tick(10);
           expect(cycles).toEqual(1);

           discardPeriodicTasks();

           // Tick once to clear out the timer which already started.
           tick(10);
           expect(cycles).toEqual(2);

           tick(10);
           // Nothing should change
           expect(cycles).toEqual(2);
         }));

      it('should process microtasks before timers', fakeAsync(() => {
           const log = new Log();

           resolvedPromise.then((_) => log.add('microtask'));

           setTimeout(() => log.add('timer'), 9);

           const id = setInterval(() => log.add('periodic timer'), 10);

           expect(log.result()).toEqual('');

           tick(10);
           expect(log.result()).toEqual('microtask; timer; periodic timer');
           clearInterval(id);
         }));

      it('should process micro-tasks created in timers before next timers', fakeAsync(() => {
           const log = new Log();

           resolvedPromise.then((_) => log.add('microtask'));

           setTimeout(() => {
             log.add('timer');
             resolvedPromise.then((_) => log.add('t microtask'));
           }, 9);

           const id = setInterval(() => {
             log.add('periodic timer');
             resolvedPromise.then((_) => log.add('pt microtask'));
           }, 10);

           tick(10);
           expect(log.result())
               .toEqual('microtask; timer; t microtask; periodic timer; pt microtask');

           tick(10);
           expect(log.result())
               .toEqual(
                   'microtask; timer; t microtask; periodic timer; pt microtask; periodic timer; pt microtask');
           clearInterval(id);
         }));

      it('should flush tasks', fakeAsync(() => {
           let ran = false;
           setTimeout(() => {
             ran = true;
           }, 10);

           flush();
           expect(ran).toEqual(true);
         }));

      it('should flush multiple tasks', fakeAsync(() => {
           let ran = false;
           let ran2 = false;
           setTimeout(() => {
             ran = true;
           }, 10);
           setTimeout(() => {
             ran2 = true;
           }, 30);

           let elapsed = flush();

           expect(ran).toEqual(true);
           expect(ran2).toEqual(true);
           expect(elapsed).toEqual(30);
         }));

      it('should move periodic tasks', fakeAsync(() => {
           let ran = false;
           let count = 0;
           setInterval(() => {
             count++;
           }, 10);
           setTimeout(() => {
             ran = true;
           }, 35);

           let elapsed = flush();

           expect(count).toEqual(3);
           expect(ran).toEqual(true);
           expect(elapsed).toEqual(35);

           discardPeriodicTasks();
         }));
    });

    describe('outside of the fakeAsync zone', () => {
      it('calling flushMicrotasks should throw', () => {
        expect(() => {
          flushMicrotasks();
        }).toThrowError('The code should be running in the fakeAsync zone to call this function');
      });

      it('calling tick should throw', () => {
        expect(() => {
          tick();
        }).toThrowError('The code should be running in the fakeAsync zone to call this function');
      });

      it('calling flush should throw', () => {
        expect(() => {
          flush();
        }).toThrowError('The code should be running in the fakeAsync zone to call this function');
      });

      it('calling discardPeriodicTasks should throw', () => {
        expect(() => {
          discardPeriodicTasks();
        }).toThrowError('The code should be running in the fakeAsync zone to call this function');
      });
    });

    describe('only one `fakeAsync` zone per test', () => {
      let zoneInBeforeEach: Zone;
      let zoneInTest1: Zone;
      beforeEach(fakeAsync(() => {
        zoneInBeforeEach = Zone.current;
      }));

      it('should use the same zone as in beforeEach', fakeAsync(() => {
           zoneInTest1 = Zone.current;
           expect(zoneInTest1).toBe(zoneInBeforeEach);
         }));
    });
  });

  describe('ProxyZone', () => {
    beforeEach(() => {
      ProxyZoneSpec.assertPresent();
    });

    afterEach(() => {
      ProxyZoneSpec.assertPresent();
    });

    it('should allow fakeAsync zone to retroactively set a zoneSpec outside of fakeAsync', () => {
      ProxyZoneSpec.assertPresent();
      let state: string = 'not run';
      const testZone = Zone.current.fork({name: 'test-zone'});
      (fakeAsync(() => {
        testZone.run(() => {
          Promise.resolve('works').then((v) => state = v);
          expect(state).toEqual('not run');
          flushMicrotasks();
          expect(state).toEqual('works');
        });
      }))();
      expect(state).toEqual('works');
    });
  });

  describe(
      'util methods inspired from jest',
      () => {

          it('getFakeSystemTime', fakeAsync(() => {
               let d = getRealSystemTime();
               setFakeSystemTime(d);
               expect(Date.now()).toEqual(d);
               expect(getFakeSystemTime()).toEqual(d);
               let j = 0;
               for (let i = 0; i < 100000; i++) {
                 j++;
               }
               expect(j).toEqual(100000);
               expect(getRealSystemTime()).not.toEqual(d);
               d = getRealSystemTime();
               let timeoutTriggered1 = false;
               let timeoutTriggered2 = false;
               setTimeout(() => {
                 timeoutTriggered1 = true;
               }, 100);
               setTimeout(() => {
                 timeoutTriggered2 = true;
               }, 200);
               tick(100);
               expect(timeoutTriggered1).toBe(true);
               setFakeSystemTime(d);
               expect(getFakeSystemTime()).toEqual(d);
               tick(100);
               expect(timeoutTriggered2).toBe(true);
               expect(Date.now()).toEqual(d + 100);
               expect(getFakeSystemTime()).toEqual(d + 100);
             }))});

  it('flushOnlyPendingTasks should run all macroTasks and ignore new spawn macroTasks',
     fakeAsync(() => {
       const logs: any[] = [];
       Promise.resolve(1).then(v => logs.push(v));
       let nestedTimeoutId;
       setTimeout(() => {
         logs.push('timeout');
         nestedTimeoutId = setTimeout(() => {logs.push('new timeout')});
       });
       expect(logs).toEqual([]);
       flushOnlyPendingTasks();
       expect(logs).toEqual([1, 'timeout']);
       clearTimeout(nestedTimeoutId);
     }));

  it('tickToNext() should tick to the next (steps) timeout correctly', fakeAsync(() => {
       const logs: any[] = [];
       setTimeout(() => {logs.push('timeout1')}, 100);
       setTimeout(() => {logs.push('timeout11')}, 100);
       setTimeout(() => {logs.push('timeout2')}, 200);
       setTimeout(() => {logs.push('timeout3')}, 300);
       expect(logs).toEqual([]);
       tickToNext();
       expect(logs).toEqual(['timeout1', 'timeout11']);
       tickToNext(2);
       expect(logs).toEqual(['timeout1', 'timeout11', 'timeout2', 'timeout3']);
     }));

  it('discardAllTasks should clear all tasks', fakeAsync(() => {
       const logs: any[] = [];
       setTimeout(() => {logs.push('timeout1')}, 100);
       setTimeout(() => {logs.push('timeout2')}, 200);
       setInterval(() => {logs.push('interval')}, 100);
       expect(logs).toEqual([]);
       discardAllTasks();
       tick(300);
       expect(logs).toEqual([]);
     }));

  it('getTaskCount should get the count of macroTasks correctly', fakeAsync(() => {
       const logs: any[] = [];
       setTimeout(() => {logs.push('timeout1')}, 100);
       setTimeout(() => {logs.push('timeout2')}, 200);
       setInterval(() => {logs.push('interval')}, 100);
       Promise.resolve().then(_ => logs.push('promise'));
       expect(logs).toEqual([]);
       expect(getTaskCount()).toEqual(4);
       expect(getTaskCount('macroTask')).toEqual(2);
       expect(getTaskCount('periodicTask')).toEqual(1);
       expect(getTaskCount('microTask')).toEqual(1);
       discardAllTasks();
     }));
}
