/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import '../../lib/rxjs/rxjs-fake-async';

import {Observable} from 'rxjs';
import {delay} from 'rxjs/operators';

import {isNode, patchMacroTask, zoneSymbol} from '../../lib/common/utils';
import {ifEnvSupports} from '../test-util';

function supportNode() {
  return isNode;
}

(supportNode as any).message = 'support node';

function supportClock() {
  const _global: any = typeof window === 'undefined' ? global : window;
  return typeof jasmine.clock === 'function' &&
      _global[zoneSymbol('fakeTimeAutoFakeTimeWhenClockPatched')];
}

(supportClock as any).message = 'support patch clock';

describe('FakeTimeTestZoneSpec', () => {
  let FakeTimeTestZoneSpec = (Zone as any)['FakeTimeTestZoneSpec'];
  let testZoneSpec: any;
  let fakeTimeTestZone: Zone;

  beforeEach(() => {
    testZoneSpec = new FakeTimeTestZoneSpec('name');
    fakeTimeTestZone = Zone.current.fork(testZoneSpec);
  });

  it('sets the FakeTimeTestZoneSpec property', () => {
    fakeTimeTestZone.run(() => {
      expect(Zone.current.get('FakeTimeTestZoneSpec')).toEqual(testZoneSpec);
    });
  });

  describe('synchronous code', () => {
    it('should run', () => {
      let ran = false;
      fakeTimeTestZone.run(() => {
        ran = true;
      });

      expect(ran).toEqual(true);
    });

    it('should throw the error in the code', () => {
      expect(() => {
        fakeTimeTestZone.run(() => {
          throw new Error('sync');
        });
      }).toThrowError('sync');
    });

    it('should throw error on Rejected promise', () => {
      expect(() => {
        fakeTimeTestZone.run(() => {
          Promise.reject('myError');
          testZoneSpec.flushMicrotasks();
        });
      }).toThrowError('Uncaught (in promise): myError');
    });
  });

  describe('synchronous code', () => {
    it('should run', () => {
      fakeTimeTestZone.run(() => {
        let thenRan = false;
        Promise.resolve(null).then((_) => {
          thenRan = true;
        });

        expect(thenRan).toEqual(false);

        testZoneSpec.flushMicrotasks();
        expect(thenRan).toEqual(true);
      });
    });

    it('should rethrow the exception on flushMicroTasks for error thrown in Promise callback',
       () => {
         fakeTimeTestZone.run(() => {
           Promise.resolve(null).then((_) => {
             throw new Error('time');
           });
           expect(() => {
             testZoneSpec.flushMicrotasks();
           }).toThrowError(/Uncaught \(in promise\): Error: time/);
         });
       });

    it('should run chained thens', () => {
      fakeTimeTestZone.run(() => {
        let log: number[] = [];

        Promise.resolve(null).then((_) => log.push(1)).then((_) => log.push(2));

        expect(log).toEqual([]);

        testZoneSpec.flushMicrotasks();
        expect(log).toEqual([1, 2]);
      });
    });

    it('should run Promise created in Promise', () => {
      fakeTimeTestZone.run(() => {
        let log: number[] = [];

        Promise.resolve(null).then((_) => {
          log.push(1);
          Promise.resolve(null).then((_) => log.push(2));
        });

        expect(log).toEqual([]);

        testZoneSpec.flushMicrotasks();
        expect(log).toEqual([1, 2]);
      });
    });
  });

  describe('timers', () => {
    it('should run queued zero duration timer on zero tick', () => {
      fakeTimeTestZone.run(() => {
        let ran = false;
        setTimeout(() => {
          ran = true;
        }, 0);

        expect(ran).toEqual(false);

        testZoneSpec.tickClock();
        expect(ran).toEqual(true);
      });
    });

    it('should run queued immediate timer on zero tick', ifEnvSupports('setImmediate', () => {
         fakeTimeTestZone.run(() => {
           let ran = false;
           setImmediate(() => {
             ran = true;
           });

           expect(ran).toEqual(false);

           testZoneSpec.tickClock();
           expect(ran).toEqual(true);
         });
       }));

    it('should default to processNewMacroTasksSynchronously if providing other flags', () => {
      function nestedTimer(callback: () => any): void {
        setTimeout(() => setTimeout(() => callback()));
      }
      fakeTimeTestZone.run(() => {
        const callback = jasmine.createSpy('callback');
        nestedTimer(callback);
        expect(callback).not.toHaveBeenCalled();
        testZoneSpec.tickClock(0, null, {});
        expect(callback).toHaveBeenCalled();
      });
    });


    it('should not queue new macro task on tick with processNewMacroTasksSynchronously=false',
       () => {
         function nestedTimer(callback: () => any): void {
           setTimeout(() => setTimeout(() => callback()));
         }
         fakeTimeTestZone.run(() => {
           const callback = jasmine.createSpy('callback');
           nestedTimer(callback);
           expect(callback).not.toHaveBeenCalled();
           testZoneSpec.tickClock(0, null, {processNewMacroTasksSynchronously: false});
           expect(callback).not.toHaveBeenCalled();
           testZoneSpec.flush();
           expect(callback).toHaveBeenCalled();
         });
       });

    it('should run queued timer after sufficient clock ticks', () => {
      fakeTimeTestZone.run(() => {
        let ran = false;
        setTimeout(() => {
          ran = true;
        }, 10);

        testZoneSpec.tickClock(6);
        expect(ran).toEqual(false);

        testZoneSpec.tickClock(4);
        expect(ran).toEqual(true);
      });
    });

    it('should run doTick callback even if no work ran', () => {
      fakeTimeTestZone.run(() => {
        let totalElapsed = 0;
        function doTick(elapsed: number) {
          totalElapsed += elapsed;
        }
        setTimeout(() => {}, 10);

        testZoneSpec.tickClock(6, doTick);
        expect(totalElapsed).toEqual(6);

        testZoneSpec.tickClock(6, doTick);
        expect(totalElapsed).toEqual(12);

        testZoneSpec.tickClock(6, doTick);
        expect(totalElapsed).toEqual(18);
      });
    });

    it('should run queued timer created by timer callback', () => {
      fakeTimeTestZone.run(() => {
        let counter = 0;
        const startCounterLoop = () => {
          counter++;
          setTimeout(startCounterLoop, 10);
        };

        startCounterLoop();

        expect(counter).toEqual(1);

        testZoneSpec.tickClock(10);
        expect(counter).toEqual(2);

        testZoneSpec.tickClock(10);
        expect(counter).toEqual(3);

        testZoneSpec.tickClock(30);
        expect(counter).toEqual(6);
      });
    });

    it('should run queued timer only once', () => {
      fakeTimeTestZone.run(() => {
        let cycles = 0;
        setTimeout(() => {
          cycles++;
        }, 10);

        testZoneSpec.tickClock(10);
        expect(cycles).toEqual(1);

        testZoneSpec.tickClock(10);
        expect(cycles).toEqual(1);

        testZoneSpec.tickClock(10);
        expect(cycles).toEqual(1);
      });
      expect(testZoneSpec.pendingTimers.length).toBe(0);
    });

    it('should not run cancelled timer', () => {
      fakeTimeTestZone.run(() => {
        let ran = false;
        let id: any = setTimeout(() => {
          ran = true;
        }, 10);
        clearTimeout(id);

        testZoneSpec.tickClock(10);
        expect(ran).toEqual(false);
      });
    });

    it('should pass arguments to times', () => {
      fakeTimeTestZone.run(() => {
        let value = 'genuine value';
        let id = setTimeout((arg1, arg2) => {
          value = arg1 + arg2;
        }, 0, 'expected', ' value');

        testZoneSpec.tickClock();
        expect(value).toEqual('expected value');
      });
    });

    it('should clear internal timerId cache', () => {
      let taskSpy: jasmine.Spy = jasmine.createSpy('taskGetState');
      fakeTimeTestZone
          .fork({
            name: 'scheduleZone',
            onScheduleTask: (delegate: ZoneDelegate, curr: Zone, target: Zone, task: Task) => {
              (task as any)._state = task.state;
              Object.defineProperty(task, 'state', {
                configurable: true,
                enumerable: true,
                get: () => {
                  taskSpy();
                  return (task as any)._state;
                },
                set: (newState: string) => {
                  (task as any)._state = newState;
                }
              });
              return delegate.scheduleTask(target, task);
            }
          })
          .run(() => {
            const id = setTimeout(() => {}, 0);
            testZoneSpec.tickClock();
            clearTimeout(id);
            // This is a hack way to test the timerId cache is cleaned or not
            // since the tasksByHandleId cache is an internal variable held by
            // zone.js timer patch, if the cache is not cleared, the code in `timer.ts`
            // will call `task.state` one more time to check whether to clear the
            // task or not, so here we use this count to check the issue is fixed or not
            // For details, please refer to https://github.com/angular/angular/issues/40387
            expect(taskSpy.calls.count()).toEqual(5);
          });
    });
    it('should pass arguments to setImmediate', ifEnvSupports('setImmediate', () => {
         fakeTimeTestZone.run(() => {
           let value = 'genuine value';
           let id = setImmediate((arg1, arg2) => {
             value = arg1 + arg2;
           }, 'expected', ' value');

           testZoneSpec.tickClock();
           expect(value).toEqual('expected value');
         });
       }));

    it('should run periodic timers', () => {
      fakeTimeTestZone.run(() => {
        let cycles = 0;
        let id = setInterval(() => {
          cycles++;
        }, 10);

        expect(id).toBeGreaterThan(0);

        testZoneSpec.tickClock(10);
        expect(cycles).toEqual(1);

        testZoneSpec.tickClock(10);
        expect(cycles).toEqual(2);

        testZoneSpec.tickClock(10);
        expect(cycles).toEqual(3);

        testZoneSpec.tickClock(30);
        expect(cycles).toEqual(6);
      });
    });

    it('should pass arguments to periodic timers', () => {
      fakeTimeTestZone.run(() => {
        let value = 'genuine value';
        let id = setInterval((arg1, arg2) => {
          value = arg1 + arg2;
        }, 10, 'expected', ' value');

        testZoneSpec.tickClock(10);
        expect(value).toEqual('expected value');
      });
    });

    it('should not run cancelled periodic timer', () => {
      fakeTimeTestZone.run(() => {
        let ran = false;
        let id = setInterval(() => {
          ran = true;
        }, 10);

        testZoneSpec.tickClock(10);
        expect(ran).toEqual(true);

        ran = false;
        clearInterval(id);
        testZoneSpec.tickClock(10);
        expect(ran).toEqual(false);
      });
    });

    it('should be able to cancel periodic timers from a callback', () => {
      fakeTimeTestZone.run(() => {
        let cycles = 0;
        let id: number;

        id = setInterval(() => {
               cycles++;
               clearInterval(id);
             }, 10) as any as number;

        testZoneSpec.tickClock(10);
        expect(cycles).toEqual(1);

        testZoneSpec.tickClock(10);
        expect(cycles).toEqual(1);
      });
    });

    it('should process microtasks before timers', () => {
      fakeTimeTestZone.run(() => {
        let log: string[] = [];

        Promise.resolve(null).then((_) => log.push('microtask'));

        setTimeout(() => log.push('timer'), 9);

        setInterval(() => log.push('periodic timer'), 10);

        expect(log).toEqual([]);

        testZoneSpec.tickClock(10);
        expect(log).toEqual(['microtask', 'timer', 'periodic timer']);
      });
    });

    it('should process micro-tasks created in timers before next timers', () => {
      fakeTimeTestZone.run(() => {
        let log: string[] = [];

        Promise.resolve(null).then((_) => log.push('microtask'));

        setTimeout(() => {
          log.push('timer');
          Promise.resolve(null).then((_) => log.push('t microtask'));
        }, 9);

        let id = setInterval(() => {
          log.push('periodic timer');
          Promise.resolve(null).then((_) => log.push('pt microtask'));
        }, 10);

        testZoneSpec.tickClock(10);
        expect(log).toEqual(
            ['microtask', 'timer', 't microtask', 'periodic timer', 'pt microtask']);

        testZoneSpec.tickClock(10);
        expect(log).toEqual([
          'microtask', 'timer', 't microtask', 'periodic timer', 'pt microtask', 'periodic timer',
          'pt microtask'
        ]);
      });
    });

    it('should throw the exception from tick for error thrown in timer callback', () => {
      fakeTimeTestZone.run(() => {
        setTimeout(() => {
          throw new Error('timer');
        }, 10);
        expect(() => {
          testZoneSpec.tickClock(10);
        }).toThrowError('timer');
      });
      // There should be no pending timers after the error in timer callback.
      expect(testZoneSpec.pendingTimers.length).toBe(0);
    });

    it('should throw the exception from tick for error thrown in periodic timer callback', () => {
      fakeTimeTestZone.run(() => {
        let count = 0;
        setInterval(() => {
          count++;
          throw new Error(count.toString());
        }, 10);

        expect(() => {
          testZoneSpec.tickClock(10);
        }).toThrowError('1');

        // Periodic timer is cancelled on first error.
        expect(count).toBe(1);
        testZoneSpec.tickClock(10);
        expect(count).toBe(1);
      });
      // Periodic timer is removed from pending queue on error.
      expect(testZoneSpec.pendingPeriodicTimers.length).toBe(0);
    });
  });

  it('should be able to resume processing timer callbacks after handling an error', async () => {
    await fakeTimeTestZone.run(async () => {
      let ran = false;
      let caught = false;
      setTimeout(() => {
        throw new Error('timer');
      }, 10);
      setTimeout(() => {
        ran = true;
      }, 20);

      try {
        await testZoneSpec.tickClock(10);
      } catch (e) {
        expect(e.message).toEqual('timer');
        caught = true;
      }
      expect(ran).toBe(false);

      // Restart timer queue processing.
      await testZoneSpec.tickClock(10);
      expect(ran).toBe(true);
    });
    // There should be no pending timers after the error in timer callback.
    expect(testZoneSpec.pendingTimers.length).toBe(0);
  });

  describe('flushing all tasks', () => {
    it('should flush all pending timers', () => {
      fakeTimeTestZone.run(() => {
        let x = false;
        let y = false;
        let z = false;

        setTimeout(() => {
          x = true;
        }, 10);
        setTimeout(() => {
          y = true;
        }, 100);
        setTimeout(() => {
          z = true;
        }, 70);

        let elapsed = testZoneSpec.flush();

        expect(elapsed).toEqual(100);
        expect(x).toBe(true);
        expect(y).toBe(true);
        expect(z).toBe(true);
      });
    });

    it('should flush nested timers', () => {
      fakeTimeTestZone.run(() => {
        let x = true;
        let y = true;
        setTimeout(() => {
          x = true;
          setTimeout(() => {
            y = true;
          }, 100);
        }, 200);

        let elapsed = testZoneSpec.flush();

        expect(elapsed).toEqual(300);
        expect(x).toBe(true);
        expect(y).toBe(true);
      });
    });

    it('should advance intervals', () => {
      fakeTimeTestZone.run(() => {
        let x = false;
        let y = false;
        let z = 0;

        setTimeout(() => {
          x = true;
        }, 50);
        setTimeout(() => {
          y = true;
        }, 141);
        setInterval(() => {
          z++;
        }, 10);

        let elapsed = testZoneSpec.flush();

        expect(elapsed).toEqual(141);
        expect(x).toBe(true);
        expect(y).toBe(true);
        expect(z).toEqual(14);
      });
    });

    it('should not wait for intervals', () => {
      fakeTimeTestZone.run(() => {
        let z = 0;

        setInterval(() => {
          z++;
        }, 10);

        let elapsed = testZoneSpec.flush();

        expect(elapsed).toEqual(0);
        expect(z).toEqual(0);
      });
    });


    it('should process micro-tasks created in timers before next timers', () => {
      fakeTimeTestZone.run(() => {
        let log: string[] = [];

        Promise.resolve(null).then((_) => log.push('microtask'));

        setTimeout(() => {
          log.push('timer');
          Promise.resolve(null).then((_) => log.push('t microtask'));
        }, 20);

        let id = setInterval(() => {
          log.push('periodic timer');
          Promise.resolve(null).then((_) => log.push('pt microtask'));
        }, 10);

        testZoneSpec.flush();
        expect(log).toEqual(
            ['microtask', 'periodic timer', 'pt microtask', 'timer', 't microtask']);
      });
    });

    it('should throw the exception from tick for error thrown in timer callback', () => {
      fakeTimeTestZone.run(() => {
        setTimeout(() => {
          throw new Error('timer');
        }, 10);
        expect(() => {
          testZoneSpec.flush();
        }).toThrowError('timer');
      });
      // There should be no pending timers after the error in timer callback.
      expect(testZoneSpec.pendingTimers.length).toBe(0);
    });

    it('should do something reasonable with polling timeouts', () => {
      expect(() => {
        fakeTimeTestZone.run(() => {
          let z = 0;

          let poll = () => {
            setTimeout(() => {
              z++;
              poll();
            }, 10);
          };

          poll();
          testZoneSpec.flush();
        });
      })
          .toThrowError(
              'flush failed after reaching the limit of 20 tasks. Does your code use a polling timeout?');
    });

    it('accepts a custom limit', () => {
      expect(() => {
        fakeTimeTestZone.run(() => {
          let z = 0;

          let poll = () => {
            setTimeout(() => {
              z++;
              poll();
            }, 10);
          };

          poll();
          testZoneSpec.flush(10);
        });
      })
          .toThrowError(
              'flush failed after reaching the limit of 10 tasks. Does your code use a polling timeout?');
    });

    it('can flush periodic timers if flushPeriodic is true', () => {
      fakeTimeTestZone.run(() => {
        let x = 0;

        setInterval(() => {
          x++;
        }, 10);

        let elapsed = testZoneSpec.flush(20, true);

        expect(elapsed).toEqual(10);
        expect(x).toEqual(1);
      });
    });

    it('can flush multiple periodic timers if flushPeriodic is true', () => {
      fakeTimeTestZone.run(() => {
        let x = 0;
        let y = 0;

        setInterval(() => {
          x++;
        }, 10);

        setInterval(() => {
          y++;
        }, 100);

        let elapsed = testZoneSpec.flush(20, true);

        expect(elapsed).toEqual(100);
        expect(x).toEqual(10);
        expect(y).toEqual(1);
      });
    });

    it('can flush till the last periodic task is processed', () => {
      fakeTimeTestZone.run(() => {
        let x = 0;
        let y = 0;

        setInterval(() => {
          x++;
        }, 10);

        // This shouldn't cause the flush to throw an exception even though
        // it would require 100 iterations of the shorter timer.
        setInterval(() => {
          y++;
        }, 1000);

        let elapsed = testZoneSpec.flush(20, true);

        // Should stop right after the longer timer has been processed.
        expect(elapsed).toEqual(1000);

        expect(x).toEqual(100);
        expect(y).toEqual(1);
      });
    });
  });

  describe('outside of FakeTime Zone', () => {
    it('calling flushMicrotasks should throw exception', () => {
      expect(() => {
        testZoneSpec.flushMicrotasks();
      }).toThrowError('The code should be running in the fakeTime zone to call this function');
    });
    it('calling tick should throw exception', () => {
      expect(() => {
        testZoneSpec.tickClock();
      }).toThrowError('The code should be running in the fakeTime zone to call this function');
    });
  });

  describe('requestAnimationFrame', () => {
    const functions =
        ['requestAnimationFrame', 'webkitRequestAnimationFrame', 'mozRequestAnimationFrame'];
    functions.forEach((fnName) => {
      describe(fnName, ifEnvSupports(fnName, () => {
                 it('should schedule a requestAnimationFrame with timeout of 16ms', () => {
                   fakeTimeTestZone.run(() => {
                     let ran = false;
                     requestAnimationFrame(() => {
                       ran = true;
                     });

                     testZoneSpec.tickClock(6);
                     expect(ran).toEqual(false);

                     testZoneSpec.tickClock(10);
                     expect(ran).toEqual(true);
                   });
                 });
                 it('does not count as a pending timer', () => {
                   fakeTimeTestZone.run(() => {
                     requestAnimationFrame(() => {});
                   });
                   expect(testZoneSpec.pendingTimers.length).toBe(0);
                   expect(testZoneSpec.pendingPeriodicTimers.length).toBe(0);
                 });
                 it('should cancel a scheduled requestAnimatiomFrame', () => {
                   fakeTimeTestZone.run(() => {
                     let ran = false;
                     const id = requestAnimationFrame(() => {
                       ran = true;
                     });

                     testZoneSpec.tickClock(6);
                     expect(ran).toEqual(false);

                     cancelAnimationFrame(id);

                     testZoneSpec.tickClock(10);
                     expect(ran).toEqual(false);
                   });
                 });
                 it('is not flushed when flushPeriodic is false', () => {
                   let ran = false;
                   fakeTimeTestZone.run(() => {
                     requestAnimationFrame(() => {
                       ran = true;
                     });
                     testZoneSpec.flush(20);
                     expect(ran).toEqual(false);
                   });
                 });
                 it('is flushed when flushPeriodic is true', () => {
                   let ran = false;
                   fakeTimeTestZone.run(() => {
                     requestAnimationFrame(() => {
                       ran = true;
                     });
                     const elapsed = testZoneSpec.flush(20, true);
                     expect(elapsed).toEqual(16);
                     expect(ran).toEqual(true);
                   });
                 });
                 it('should pass timestamp as parameter', () => {
                   let timestamp = 0;
                   let timestamp1 = 0;
                   fakeTimeTestZone.run(() => {
                     requestAnimationFrame((ts) => {
                       timestamp = ts;
                       requestAnimationFrame(ts1 => {
                         timestamp1 = ts1;
                       });
                     });
                     const elapsed = testZoneSpec.flush(20, true);
                     const elapsed1 = testZoneSpec.flush(20, true);
                     expect(elapsed).toEqual(16);
                     expect(elapsed1).toEqual(16);
                     expect(timestamp).toEqual(16);
                     expect(timestamp1).toEqual(32);
                   });
                 });
               }));
    });
  });

  describe('XHRs', ifEnvSupports('XMLHttpRequest', () => {
             it('should throw an exception if an XHR is initiated in the zone', () => {
               expect(() => {
                 fakeTimeTestZone.run(() => {
                   let finished = false;
                   let req = new XMLHttpRequest();

                   req.onreadystatechange = () => {
                     if (req.readyState === XMLHttpRequest.DONE) {
                       finished = true;
                     }
                   };

                   req.open('GET', '/test', true);
                   req.send();
                 });
               }).toThrowError('Cannot make XHRs from within a fake time test. Request URL: /test');
             });
           }));

  describe('node process', ifEnvSupports(supportNode, () => {
             it('should be able to schedule microTask with additional arguments', () => {
               const process = global['process'];
               const nextTick = process && process['nextTick'];
               if (!nextTick) {
                 return;
               }
               fakeTimeTestZone.run(() => {
                 let tickRun = false;
                 let cbArgRun = false;
                 nextTick(
                     (strArg: string, cbArg: Function) => {
                       tickRun = true;
                       expect(strArg).toEqual('stringArg');
                       cbArg();
                     },
                     'stringArg',
                     () => {
                       cbArgRun = true;
                     });

                 expect(tickRun).toEqual(false);

                 testZoneSpec.flushMicrotasks();
                 expect(tickRun).toEqual(true);
                 expect(cbArgRun).toEqual(true);
               });
             });
           }));

  describe('should allow user define which macroTask fakeTimeTest', () => {
    let FakeTimeTestZoneSpec = (Zone as any)['FakeTimeTestZoneSpec'];
    let testZoneSpec: any;
    let fakeTimeTestZone: Zone;
    it('should support custom non perodic macroTask', () => {
      testZoneSpec = new FakeTimeTestZoneSpec(
          'name', false, [{source: 'TestClass.myTimeout', callbackArgs: ['test']}]);
      class TestClass {
        myTimeout(callback: Function) {}
      }
      fakeTimeTestZone = Zone.current.fork(testZoneSpec);
      fakeTimeTestZone.run(() => {
        let ran = false;
        patchMacroTask(
            TestClass.prototype, 'myTimeout',
            (self: any, args: any[]) =>
                ({name: 'TestClass.myTimeout', target: self, cbIdx: 0, args: args}));

        const testClass = new TestClass();
        testClass.myTimeout(function(callbackArgs: any) {
          ran = true;
          expect(callbackArgs).toEqual('test');
        });

        expect(ran).toEqual(false);

        testZoneSpec.tickClock();
        expect(ran).toEqual(true);
      });
    });

    it('should support custom non perodic macroTask by global flag', () => {
      testZoneSpec = new FakeTimeTestZoneSpec('name');
      class TestClass {
        myTimeout(callback: Function) {}
      }
      fakeTimeTestZone = Zone.current.fork(testZoneSpec);
      fakeTimeTestZone.run(() => {
        let ran = false;
        patchMacroTask(
            TestClass.prototype, 'myTimeout',
            (self: any, args: any[]) =>
                ({name: 'TestClass.myTimeout', target: self, cbIdx: 0, args: args}));

        const testClass = new TestClass();
        testClass.myTimeout(() => {
          ran = true;
        });

        expect(ran).toEqual(false);

        testZoneSpec.tickClock();
        expect(ran).toEqual(true);
      });
    });


    it('should support custom perodic macroTask', () => {
      testZoneSpec = new FakeTimeTestZoneSpec(
          'name', false, [{source: 'TestClass.myInterval', isPeriodic: true}]);
      fakeTimeTestZone = Zone.current.fork(testZoneSpec);
      fakeTimeTestZone.run(() => {
        let cycle = 0;
        class TestClass {
          myInterval(callback: Function, interval: number): any {
            return null;
          }
        }
        patchMacroTask(
            TestClass.prototype, 'myInterval',
            (self: any, args: any[]) =>
                ({name: 'TestClass.myInterval', target: self, cbIdx: 0, args: args}));

        const testClass = new TestClass();
        const id = testClass.myInterval(() => {
          cycle++;
        }, 10);

        expect(cycle).toEqual(0);

        testZoneSpec.tickClock(10);
        expect(cycle).toEqual(1);

        testZoneSpec.tickClock(10);
        expect(cycle).toEqual(2);
        clearInterval(id);
      });
    });
  });

  describe('return promise', () => {
    let log: string[];
    beforeEach(() => {
      log = [];
    });

    it('should wait for promise to resolve', () => {
      return new Promise<void>((res, _) => {
        setTimeout(() => {
          log.push('resolved');
          res();
        }, 100);
      });
    });

    afterEach(() => {
      expect(log).toEqual(['resolved']);
    });
  });

  describe('fakeTimeTest should patch Date', () => {
    let FakeTimeTestZoneSpec = (Zone as any)['FakeTimeTestZoneSpec'];
    let testZoneSpec: any;
    let fakeTimeTestZone: Zone;

    beforeEach(() => {
      testZoneSpec = new FakeTimeTestZoneSpec('name', false);
      fakeTimeTestZone = Zone.current.fork(testZoneSpec);
    });

    it('should get date diff correctly', () => {
      fakeTimeTestZone.run(() => {
        const start = Date.now();
        testZoneSpec.tickClock(100);
        const end = Date.now();
        expect(end - start).toBe(100);
      });
    });

    it('should check date type correctly', () => {
      fakeTimeTestZone.run(() => {
        const d: any = new Date();
        expect(d instanceof Date).toBe(true);
      });
    });

    it('should new Date with parameter correctly', () => {
      fakeTimeTestZone.run(() => {
        const d: Date = new Date(0);
        expect(d.getFullYear()).toBeLessThan(1971);
        const d1: Date = new Date('December 17, 1995 03:24:00');
        expect(d1.getFullYear()).toEqual(1995);
        const d2: Date = new Date(1995, 11, 17, 3, 24, 0);
        expect(d2.getFullYear()).toEqual(1995);

        d2.setFullYear(1985);
        expect(isNaN(d2.getTime())).toBeFalsy();
        expect(d2.getFullYear()).toBe(1985);
        expect(d2.getMonth()).toBe(11);
        expect(d2.getDate()).toBe(17);
      });
    });

    it('should get Date.UTC() correctly', () => {
      fakeTimeTestZone.run(() => {
        const utcDate = new Date(Date.UTC(96, 11, 1, 0, 0, 0));
        expect(utcDate.getFullYear()).toBe(1996);
      });
    });

    it('should call Date.parse() correctly', () => {
      fakeTimeTestZone.run(() => {
        const unixTimeZero = Date.parse('01 Jan 1970 00:00:00 GMT');
        expect(unixTimeZero).toBe(0);
      });
    });
  });

  describe(
      'fakeTimeTest should work without patch jasmine.clock',
      ifEnvSupports(
          () => {
            return !supportClock() && supportNode();
          },
          () => {
            const fakeTime = (Zone as any)[Zone.__symbol__('fakeTimeTest')].fakeTime;
            let spy: any;
            beforeEach(() => {
              spy = jasmine.createSpy('timer');
              jasmine.clock().install();
            });

            afterEach(() => {
              jasmine.clock().uninstall();
            });

            it('should check date type correctly', fakeTime(async () => {
                 const d: any = new Date();
                 expect(d instanceof Date).toBe(true);
               }));

            it('should check date type correctly without fakeTime', () => {
              const d: any = new Date();
              expect(d instanceof Date).toBe(true);
            });

            it('should tick correctly', fakeTime(async () => {
                 jasmine.clock().mockDate();
                 const start = Date.now();
                 jasmine.clock().tick(100);
                 const end = Date.now();
                 expect(end - start).toBe(100);
               }));

            it('should tick correctly without fakeTime', () => {
              jasmine.clock().mockDate();
              const start = Date.now();
              jasmine.clock().tick(100);
              const end = Date.now();
              expect(end - start).toBe(100);
            });

            it('should mock date correctly', fakeTime(async () => {
                 const baseTime = new Date(2013, 9, 23);
                 jasmine.clock().mockDate(baseTime);
                 const start = Date.now();
                 expect(start).toBe(baseTime.getTime());
                 jasmine.clock().tick(100);
                 const end = Date.now();
                 expect(end - start).toBe(100);
                 expect(end).toBe(baseTime.getTime() + 100);
                 expect(new Date().getFullYear()).toEqual(2013);
               }));

            it('should mock date correctly without fakeTime', () => {
              const baseTime = new Date(2013, 9, 23);
              jasmine.clock().mockDate(baseTime);
              const start = Date.now();
              expect(start).toBe(baseTime.getTime());
              jasmine.clock().tick(100);
              const end = Date.now();
              expect(end - start).toBe(100);
              expect(end).toBe(baseTime.getTime() + 100);
              expect(new Date().getFullYear()).toEqual(2013);
            });

            it('should handle new Date correctly', fakeTime(async () => {
                 const baseTime = new Date(2013, 9, 23);
                 jasmine.clock().mockDate(baseTime);
                 const start = new Date();
                 expect(start.getTime()).toBe(baseTime.getTime());
                 jasmine.clock().tick(100);
                 const end = new Date();
                 expect(end.getTime() - start.getTime()).toBe(100);
                 expect(end.getTime()).toBe(baseTime.getTime() + 100);
               }));

            it('should handle new Date correctly without fakeTime', () => {
              const baseTime = new Date(2013, 9, 23);
              jasmine.clock().mockDate(baseTime);
              const start = new Date();
              expect(start.getTime()).toBe(baseTime.getTime());
              jasmine.clock().tick(100);
              const end = new Date();
              expect(end.getTime() - start.getTime()).toBe(100);
              expect(end.getTime()).toBe(baseTime.getTime() + 100);
            });

            it('should handle setTimeout correctly', fakeTime(async () => {
                 setTimeout(spy, 100);
                 expect(spy).not.toHaveBeenCalled();
                 jasmine.clock().tick(100);
                 expect(spy).toHaveBeenCalled();
               }));

            it('should handle setTimeout correctly without fakeTime', () => {
              setTimeout(spy, 100);
              expect(spy).not.toHaveBeenCalled();
              jasmine.clock().tick(100);
              expect(spy).toHaveBeenCalled();
            });
          }));

  describe('fakeTimeTest should patch jasmine.clock', ifEnvSupports(supportClock, () => {
             let spy: any;
             beforeEach(() => {
               spy = jasmine.createSpy('timer');
               jasmine.clock().install();
             });

             afterEach(() => {
               jasmine.clock().uninstall();
             });

             it('should check date type correctly', () => {
               const d: any = new Date();
               expect(d instanceof Date).toBe(true);
             });

             it('should get date diff correctly', () => {
               const start = Date.now();
               jasmine.clock().tick(100);
               const end = Date.now();
               expect(end - start).toBe(100);
             });

             it('should tick correctly', () => {
               const start = Date.now();
               jasmine.clock().tick(100);
               const end = Date.now();
               expect(end - start).toBe(100);
             });

             it('should mock date correctly', () => {
               const baseTime = new Date(2013, 9, 23);
               jasmine.clock().mockDate(baseTime);
               const start = Date.now();
               expect(start).toBe(baseTime.getTime());
               jasmine.clock().tick(100);
               const end = Date.now();
               expect(end - start).toBe(100);
               expect(end).toBe(baseTime.getTime() + 100);
             });

             it('should handle new Date correctly', () => {
               const baseTime = new Date(2013, 9, 23);
               jasmine.clock().mockDate(baseTime);
               const start = new Date();
               expect(start.getTime()).toBe(baseTime.getTime());
               jasmine.clock().tick(100);
               const end = new Date();
               expect(end.getTime() - start.getTime()).toBe(100);
               expect(end.getTime()).toBe(baseTime.getTime() + 100);
             });

             it('should handle setTimeout correctly', () => {
               setTimeout(spy, 100);
               expect(spy).not.toHaveBeenCalled();
               jasmine.clock().tick(100);
               expect(spy).toHaveBeenCalled();
             });
           }));

  describe('fakeTimeTest should patch rxjs scheduler', ifEnvSupports(supportClock, () => {
             let FakeTimeTestZoneSpec = (Zone as any)['FakeTimeTestZoneSpec'];
             let testZoneSpec: any;
             let fakeTimeTestZone: Zone;

             beforeEach(() => {
               testZoneSpec = new FakeTimeTestZoneSpec('name', false);
               fakeTimeTestZone = Zone.current.fork(testZoneSpec);
             });

             it('should get date diff correctly', (done) => {
               fakeTimeTestZone.run(() => {
                 let result: any = null;
                 const observable = new Observable((subscribe: any) => {
                   subscribe.next('hello');
                   subscribe.complete();
                 });
                 observable.pipe(delay(1000)).subscribe((v: any) => {
                   result = v;
                 });
                 expect(result).toBe(null);
                 testZoneSpec.tickClock(1000);
                 expect(result).toBe('hello');
                 done();
               });
             });
           }));
});

class Log {
  logItems: any[];

  constructor() {
    this.logItems = [];
  }

  add(value: any /** TODO #9100 */): void {
    this.logItems.push(value);
  }

  fn(value: any /** TODO #9100 */) {
    return (a1: any = null, a2: any = null, a3: any = null, a4: any = null, a5: any = null) => {
      this.logItems.push(value);
    };
  }

  clear(): void {
    this.logItems = [];
  }

  result(): string {
    return this.logItems.join('; ');
  }
}

const resolvedPromise = Promise.resolve(null);
const ProxyZoneSpec: {assertPresent: () => void} = (Zone as any)['ProxyZoneSpec'];
const fakeTimeTestModule = (Zone as any)[Zone.__symbol__('fakeTimeTest')];
const {fakeTime, tickClock, discardPeriodicTasks, flush, flushMicrotasks} = fakeTimeTestModule;

{
  describe('fake time', () => {
    it('should run synchronous code', async () => {
      let ran = false;
      await fakeTime(async () => {
        ran = true;
      })();

      expect(ran).toEqual(true);
    });

    it('should pass arguments to the wrapped function', async () => {
      await fakeTime(async (foo: any /** TODO #9100 */, bar: any /** TODO #9100 */) => {
        expect(foo).toEqual('foo');
        expect(bar).toEqual('bar');
      })('foo', 'bar');
    });


    it('should throw on nested calls', async () => {
      try {
        await fakeTime(async () => {
          await fakeTime(async () => null)();
        })();
      } catch (e) {
        expect(e.message).toEqual('fakeTime() calls can not be nested');
      }
    });

    it('should flush microtasks before returning', async () => {
      let thenRan = false;

      await fakeTime(async () => {
        resolvedPromise.then(_ => {
          thenRan = true;
        });
      })();

      expect(thenRan).toEqual(true);
    });


    it('should propagate the return value', async () => {
      expect(await fakeTime(async () => 'foo')()).toEqual('foo');
    });

    describe('Promise', () => {
      it('should run synchronous code', fakeTime(async () => {
           let thenRan = false;
           resolvedPromise.then((_) => {
             thenRan = true;
           });

           expect(thenRan).toEqual(false);

           await flushMicrotasks();
           expect(thenRan).toEqual(true);
         }));

      it('should run chained thens', fakeTime(async () => {
           const log = new Log();

           resolvedPromise.then((_) => log.add(1)).then((_) => log.add(2));

           expect(log.result()).toEqual('');

           await flushMicrotasks();
           expect(log.result()).toEqual('1; 2');
         }));

      it('should run Promise created in Promise', fakeTime(async () => {
           const log = new Log();

           resolvedPromise.then((_) => {
             log.add(1);
             resolvedPromise.then((_) => log.add(2));
           });

           expect(log.result()).toEqual('');

           await flushMicrotasks();
           expect(log.result()).toEqual('1; 2');
         }));

      it('should complain if the test throws an exception during time calls', async () => {
        try {
          await fakeTime(async () => {
            resolvedPromise.then((_) => {
              throw new Error('time');
            });
            await flushMicrotasks();
          })();
        } catch (e) {
          expect(e.message).toMatch(/Uncaught \(in promise\): Error: time/);
        }
      });

      it('should complain if a test throws an exception', async () => {
        try {
          await fakeTime(async () => {
            throw new Error('sync');
          });
        } catch (e) {
          expect(e.message).toEqual('sync');
        }
      });
    });
  });

  describe('timers', () => {
    it('should run queued zero duration timer on zero tick', fakeTime(async () => {
         let ran = false;
         setTimeout(() => {
           ran = true;
         }, 0);

         expect(ran).toEqual(false);

         await tickClock();
         expect(ran).toEqual(true);
       }));


    it('should run queued timer after sufficient clock ticks', fakeTime(async () => {
         let ran = false;
         setTimeout(() => {
           ran = true;
         }, 10);

         await tickClock(6);
         expect(ran).toEqual(false);

         await tickClock(6);
         expect(ran).toEqual(true);
       }));

    it('should run queued timer only once', fakeTime(async () => {
         let cycles = 0;
         setTimeout(() => {
           cycles++;
         }, 10);

         await tickClock(10);
         expect(cycles).toEqual(1);

         await tickClock(10);
         expect(cycles).toEqual(1);

         await tickClock(10);
         expect(cycles).toEqual(1);
       }));

    it('should not run cancelled timer', fakeTime(async () => {
         let ran = false;
         const id = setTimeout(() => {
           ran = true;
         }, 10);
         clearTimeout(id);

         await tickClock(10);
         expect(ran).toEqual(false);
       }));

    it('should throw an error on dangling timers', async () => {
      try {
        await fakeTime(async () => {
          setTimeout(() => {}, 10);
        })();
      } catch (e) {
        expect(e.message).toEqual('1 timer(s) still in the queue.');
      }
    });

    it('should throw an error on dangling periodic timers', async () => {
      try {
        await fakeTime(async () => {
          setInterval(() => {}, 10);
        })();
      } catch (e) {
        expect(e.message).toEqual('1 periodic timer(s) still in the queue.');
      }
    });

    it('should run periodic timers', fakeTime(async () => {
         let cycles = 0;
         const id = setInterval(() => {
           cycles++;
         }, 10);

         await tickClock(10);
         expect(cycles).toEqual(1);

         await tickClock(10);
         expect(cycles).toEqual(2);

         await tickClock(10);
         expect(cycles).toEqual(3);
         clearInterval(id);
       }));

    it('should not run cancelled periodic timer', fakeTime(async () => {
         let ran = false;
         const id = setInterval(() => {
           ran = true;
         }, 10);
         clearInterval(id);

         await tickClock(10);
         expect(ran).toEqual(false);
       }));

    it('should be able to cancel periodic timers from a callback', fakeTime(async () => {
         let cycles = 0;
         let id: any /** TODO #9100 */;

         id = setInterval(() => {
           cycles++;
           clearInterval(id);
         }, 10);

         await tickClock(10);
         expect(cycles).toEqual(1);

         await tickClock(10);
         expect(cycles).toEqual(1);
       }));

    it('should clear periodic timers', fakeTime(async () => {
         let cycles = 0;
         const id = setInterval(() => {
           cycles++;
         }, 10);

         await tickClock(10);
         expect(cycles).toEqual(1);

         discardPeriodicTasks();

         // Tick once to clear out the timer which already started.
         await tickClock(10);
         expect(cycles).toEqual(2);

         await tickClock(10);
         // Nothing should change
         expect(cycles).toEqual(2);
       }));

    it('should process microtasks before timers', fakeTime(async () => {
         const log = new Log();

         resolvedPromise.then((_) => log.add('microtask'));

         setTimeout(() => log.add('timer'), 9);

         const id = setInterval(() => log.add('periodic timer'), 10);

         expect(log.result()).toEqual('');

         await tickClock(10);
         expect(log.result()).toEqual('microtask; timer; periodic timer');
         clearInterval(id);
       }));

    it('should process micro-tasks created in timers before next timers', fakeTime(async () => {
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

         await tickClock(10);
         expect(log.result())
             .toEqual('microtask; timer; t microtask; periodic timer; pt microtask');

         await tickClock(10);
         expect(log.result())
             .toEqual(
                 'microtask; timer; t microtask; periodic timer; pt microtask; periodic timer; pt microtask');
         clearInterval(id);
       }));

    it('should flush tasks', fakeTime(async () => {
         let ran = false;
         setTimeout(() => {
           ran = true;
         }, 10);

         flush();
         expect(ran).toEqual(true);
       }));

    it('should flush multiple tasks', fakeTime(async () => {
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

    it('should move periodic tasks', fakeTime(async () => {
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

  describe('outside of the fakeTime zone', () => {
    it('calling flushMicrotasks should throw', async () => {
      try {
        await flushMicrotasks();
      } catch (e) {
        expect(e.message).toEqual(
            'The code should be running in the fakeTime zone to call this function');
      }
    });

    it('calling tick should throw', async () => {
      try {
        await tickClock();
      } catch (e) {
        expect(e.message).toEqual(
            'The code should be running in the fakeTime zone to call this function');
      }
    });

    it('calling flush should throw', () => {
      expect(() => {
        flush();
      }).toThrowError('The code should be running in the fakeTime zone to call this function');
    });

    it('calling discardPeriodicTasks should throw', () => {
      expect(() => {
        discardPeriodicTasks();
      }).toThrowError('The code should be running in the fakeTime zone to call this function');
    });
  });

  describe('only one `fakeTime` zone per test', () => {
    let zoneInBeforeEach: Zone;
    let zoneInTest1: Zone;
    beforeEach(fakeTime(async () => {
      zoneInBeforeEach = Zone.current;
    }));

    it('should use the same zone as in beforeEach', fakeTime(async () => {
         zoneInTest1 = Zone.current;
         expect(zoneInTest1).toBe(zoneInBeforeEach);
       }));
  });

  describe('fakeTime should work with Date', () => {
    it('should get date diff correctly', fakeTime(async () => {
         const start = Date.now();
         await tickClock(100);
         const end = Date.now();
         expect(end - start).toBe(100);
       }));

    it('should check date type correctly', fakeTime(async () => {
         const d: any = new Date();
         expect(d instanceof Date).toBe(true);
       }));

    it('should new Date with parameter correctly', fakeTime(async () => {
         const d: Date = new Date(0);
         expect(d.getFullYear()).toBeLessThan(1971);
         const d1: Date = new Date('December 17, 1995 03:24:00');
         expect(d1.getFullYear()).toEqual(1995);
         const d2: Date = new Date(1995, 11, 17, 3, 24, 0);
         expect(isNaN(d2.getTime())).toBeFalsy();
         expect(d2.getFullYear()).toEqual(1995);
         d2.setFullYear(1985);
         expect(d2.getFullYear()).toBe(1985);
         expect(d2.getMonth()).toBe(11);
         expect(d2.getDate()).toBe(17);
       }));

    it('should get Date.UTC() correctly', fakeTime(async () => {
         const utcDate = new Date(Date.UTC(96, 11, 1, 0, 0, 0));
         expect(utcDate.getFullYear()).toBe(1996);
       }));

    it('should call Date.parse() correctly', fakeTime(async () => {
         const unixTimeZero = Date.parse('01 Jan 1970 00:00:00 GMT');
         expect(unixTimeZero).toBe(0);
       }));
  });
}

describe('ProxyZone', () => {
  beforeEach(() => {
    ProxyZoneSpec.assertPresent();
  });

  afterEach(() => {
    ProxyZoneSpec.assertPresent();
  });

  // it('should allow fakeTime zone to retroactively set a zoneSpec outside of fakeTime',
  // () => {
  //   ProxyZoneSpec.assertPresent();
  //   let state: string = 'not run';
  //   const testZone = Zone.current.fork({name: 'test-zone'});
  //   (fakeTime(async () => {
  //     testZone.run(() => {
  //       Promise.resolve('works').then((v) => state = v);
  //       expect(state).toEqual('not run');
  //       await flushMicrotasks();
  //       expect(state).toEqual('works');
  //     });
  //   }))();
  //   expect(state).toEqual('works');
  // });
});
