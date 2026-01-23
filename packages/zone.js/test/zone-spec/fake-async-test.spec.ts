/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import '../../lib/rxjs/rxjs-fake-async';

import {Observable} from 'rxjs';
import {delay} from 'rxjs/operators';

import {isNode, patchMacroTask} from '../../lib/common/utils';
import {ifEnvSupports} from '../test-util';

function supportNode() {
  return isNode;
}

function emptyRun() {
  // Jasmine will throw if there are no tests.
  it('should pass', () => {});
}

(supportNode as any).message = 'support node';

describe('FakeAsyncTestZoneSpec', () => {
  let FakeAsyncTestZoneSpec = (Zone as any)['FakeAsyncTestZoneSpec'];
  let testZoneSpec: any;
  let fakeAsyncTestZone: Zone;

  beforeEach(() => {
    testZoneSpec = new FakeAsyncTestZoneSpec('name');
    fakeAsyncTestZone = Zone.current.fork(testZoneSpec);
  });

  it('sets the FakeAsyncTestZoneSpec property', () => {
    fakeAsyncTestZone.run(() => {
      expect(Zone.current.get('FakeAsyncTestZoneSpec')).toEqual(testZoneSpec);
    });
  });

  describe('synchronous code', () => {
    it('should run', () => {
      let ran = false;
      fakeAsyncTestZone.run(() => {
        ran = true;
      });

      expect(ran).toEqual(true);
    });

    it('should throw the error in the code', () => {
      expect(() => {
        fakeAsyncTestZone.run(() => {
          throw new Error('sync');
        });
      }).toThrowError('sync');
    });

    it('should throw error on Rejected promise', () => {
      expect(() => {
        fakeAsyncTestZone.run(() => {
          Promise.reject('myError');
          testZoneSpec.flushMicrotasks();
        });
      }).toThrowError('Uncaught (in promise): myError');
    });
  });

  describe('asynchronous code', () => {
    it('should run', () => {
      fakeAsyncTestZone.run(() => {
        let thenRan = false;
        Promise.resolve(null).then((_) => {
          thenRan = true;
        });

        expect(thenRan).toEqual(false);

        testZoneSpec.flushMicrotasks();
        expect(thenRan).toEqual(true);
      });
    });

    it('should rethrow the exception on flushMicroTasks for error thrown in Promise callback', () => {
      fakeAsyncTestZone.run(() => {
        Promise.resolve(null).then((_) => {
          throw new Error('async');
        });
        expect(() => {
          testZoneSpec.flushMicrotasks();
        }).toThrowError(/Uncaught \(in promise\): Error: async/);
      });
    });

    it('should run chained thens', () => {
      fakeAsyncTestZone.run(() => {
        let log: number[] = [];

        Promise.resolve(null)
          .then((_) => log.push(1))
          .then((_) => log.push(2));

        expect(log).toEqual([]);

        testZoneSpec.flushMicrotasks();
        expect(log).toEqual([1, 2]);
      });
    });

    it('should run Promise created in Promise', () => {
      fakeAsyncTestZone.run(() => {
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
      fakeAsyncTestZone.run(() => {
        let ran = false;
        setTimeout(() => {
          ran = true;
        }, 0);

        expect(ran).toEqual(false);

        testZoneSpec.tick();
        expect(ran).toEqual(true);
      });
    });

    it(
      'should run queued immediate timer on zero tick',
      ifEnvSupports('setImmediate', () => {
        fakeAsyncTestZone.run(() => {
          let ran = false;
          setImmediate(() => {
            ran = true;
          });

          expect(ran).toEqual(false);

          testZoneSpec.tick();
          expect(ran).toEqual(true);
        });
      }),
    );

    it('should default to processNewMacroTasksSynchronously if providing other flags', () => {
      function nestedTimer(callback: () => any): void {
        setTimeout(() => setTimeout(() => callback()));
      }
      fakeAsyncTestZone.run(() => {
        const callback = jasmine.createSpy('callback');
        nestedTimer(callback);
        expect(callback).not.toHaveBeenCalled();
        testZoneSpec.tick(0, null, {});
        expect(callback).toHaveBeenCalled();
      });
    });

    it('should not queue new macro task on tick with processNewMacroTasksSynchronously=false', () => {
      function nestedTimer(callback: () => any): void {
        setTimeout(() => setTimeout(() => callback()));
      }
      fakeAsyncTestZone.run(() => {
        const callback = jasmine.createSpy('callback');
        nestedTimer(callback);
        expect(callback).not.toHaveBeenCalled();
        testZoneSpec.tick(0, null, {processNewMacroTasksSynchronously: false});
        expect(callback).not.toHaveBeenCalled();
        testZoneSpec.flush();
        expect(callback).toHaveBeenCalled();
      });
    });

    it('should run queued timer after sufficient clock ticks', () => {
      fakeAsyncTestZone.run(() => {
        let ran = false;
        setTimeout(() => {
          ran = true;
        }, 10);

        testZoneSpec.tick(6);
        expect(ran).toEqual(false);

        testZoneSpec.tick(4);
        expect(ran).toEqual(true);
      });
    });

    it('should run doTick callback even if no work ran', () => {
      fakeAsyncTestZone.run(() => {
        let totalElapsed = 0;
        function doTick(elapsed: number) {
          totalElapsed += elapsed;
        }
        setTimeout(() => {}, 10);

        testZoneSpec.tick(6, doTick);
        expect(totalElapsed).toEqual(6);

        testZoneSpec.tick(6, doTick);
        expect(totalElapsed).toEqual(12);

        testZoneSpec.tick(6, doTick);
        expect(totalElapsed).toEqual(18);
      });
    });

    it('should run queued timer created by timer callback', () => {
      fakeAsyncTestZone.run(() => {
        let counter = 0;
        const startCounterLoop = () => {
          counter++;
          setTimeout(startCounterLoop, 10);
        };

        startCounterLoop();

        expect(counter).toEqual(1);

        testZoneSpec.tick(10);
        expect(counter).toEqual(2);

        testZoneSpec.tick(10);
        expect(counter).toEqual(3);

        testZoneSpec.tick(30);
        expect(counter).toEqual(6);
      });
    });

    it('should run queued timer only once', () => {
      fakeAsyncTestZone.run(() => {
        let cycles = 0;
        setTimeout(() => {
          cycles++;
        }, 10);

        testZoneSpec.tick(10);
        expect(cycles).toEqual(1);

        testZoneSpec.tick(10);
        expect(cycles).toEqual(1);

        testZoneSpec.tick(10);
        expect(cycles).toEqual(1);
      });
      expect(testZoneSpec.pendingTimers.length).toBe(0);
    });

    it('should not run cancelled timer', () => {
      fakeAsyncTestZone.run(() => {
        let ran = false;
        let id: any = setTimeout(() => {
          ran = true;
        }, 10);
        clearTimeout(id);

        testZoneSpec.tick(10);
        expect(ran).toEqual(false);
      });
    });

    it('should pass arguments to times', () => {
      fakeAsyncTestZone.run(() => {
        let value = 'genuine value';
        let id = setTimeout(
          (arg1, arg2) => {
            value = arg1 + arg2;
          },
          0,
          'expected',
          ' value',
        );

        testZoneSpec.tick();
        expect(value).toEqual('expected value');
      });
    });

    it('should clear internal timerId cache', () => {
      let taskSpy: jasmine.Spy = jasmine.createSpy('taskGetState');
      fakeAsyncTestZone
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
              },
            });
            return delegate.scheduleTask(target, task);
          },
        })
        .run(() => {
          const id = setTimeout(() => {}, 0);
          testZoneSpec.tick();
          clearTimeout(id);
          // This is a hack way to test the timerId cache is cleaned or not
          // since the tasksByHandleId cache is an internal variable held by
          // zone.js timer patch, if the cache is not cleared, the code in `timer.ts`
          // will call `task.state` one more time to check whether to clear the
          // task or not, so here we use this count to check the issue is fixed or not
          // For details, please refer to https://github.com/angular/angular/issues/40387
          expect(taskSpy.calls.count()).toBe(4);
        });
    });
    it(
      'should pass arguments to setImmediate',
      ifEnvSupports('setImmediate', () => {
        fakeAsyncTestZone.run(() => {
          let value = 'genuine value';
          let id = setImmediate(
            (arg1, arg2) => {
              value = arg1 + arg2;
            },
            'expected',
            ' value',
          );

          testZoneSpec.tick();
          expect(value).toEqual('expected value');
        });
      }),
    );

    it('should run periodic timers', () => {
      fakeAsyncTestZone.run(() => {
        let cycles = 0;
        let id = setInterval(() => {
          cycles++;
        }, 10);

        expect(id).toBeGreaterThan(0);

        testZoneSpec.tick(10);
        expect(cycles).toEqual(1);

        testZoneSpec.tick(10);
        expect(cycles).toEqual(2);

        testZoneSpec.tick(10);
        expect(cycles).toEqual(3);

        testZoneSpec.tick(30);
        expect(cycles).toEqual(6);
      });
    });

    it('should pass arguments to periodic timers', () => {
      fakeAsyncTestZone.run(() => {
        let value = 'genuine value';
        let id = setInterval(
          (arg1, arg2) => {
            value = arg1 + arg2;
          },
          10,
          'expected',
          ' value',
        );

        testZoneSpec.tick(10);
        expect(value).toEqual('expected value');
      });
    });

    it('should not run cancelled periodic timer', () => {
      fakeAsyncTestZone.run(() => {
        let ran = false;
        let id = setInterval(() => {
          ran = true;
        }, 10);

        testZoneSpec.tick(10);
        expect(ran).toEqual(true);

        ran = false;
        clearInterval(id);
        testZoneSpec.tick(10);
        expect(ran).toEqual(false);
      });
    });

    it('should be able to cancel periodic timers from a callback', () => {
      fakeAsyncTestZone.run(() => {
        let cycles = 0;
        let id: number;

        id = setInterval(() => {
          cycles++;
          clearInterval(id);
        }, 10) as any as number;

        testZoneSpec.tick(10);
        expect(cycles).toEqual(1);

        testZoneSpec.tick(10);
        expect(cycles).toEqual(1);
      });
    });

    it('should process microtasks before timers', () => {
      fakeAsyncTestZone.run(() => {
        let log: string[] = [];

        Promise.resolve(null).then((_) => log.push('microtask'));

        setTimeout(() => log.push('timer'), 9);

        setInterval(() => log.push('periodic timer'), 10);

        expect(log).toEqual([]);

        testZoneSpec.tick(10);
        expect(log).toEqual(['microtask', 'timer', 'periodic timer']);
      });
    });

    it('should process micro-tasks created in timers before next timers', () => {
      fakeAsyncTestZone.run(() => {
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

        testZoneSpec.tick(10);
        expect(log).toEqual([
          'microtask',
          'timer',
          't microtask',
          'periodic timer',
          'pt microtask',
        ]);

        testZoneSpec.tick(10);
        expect(log).toEqual([
          'microtask',
          'timer',
          't microtask',
          'periodic timer',
          'pt microtask',
          'periodic timer',
          'pt microtask',
        ]);
      });
    });

    it('should throw the exception from tick for error thrown in timer callback', () => {
      fakeAsyncTestZone.run(() => {
        setTimeout(() => {
          throw new Error('timer');
        }, 10);
        expect(() => {
          testZoneSpec.tick(10);
        }).toThrowError('timer');
      });
      // There should be no pending timers after the error in timer callback.
      expect(testZoneSpec.pendingTimers.length).toBe(0);
    });

    it('should throw the exception from tick for error thrown in periodic timer callback', () => {
      fakeAsyncTestZone.run(() => {
        let count = 0;
        setInterval(() => {
          count++;
          throw new Error(count.toString());
        }, 10);

        expect(() => {
          testZoneSpec.tick(10);
        }).toThrowError('1');

        // Periodic timer is cancelled on first error.
        expect(count).toBe(1);
        testZoneSpec.tick(10);
        expect(count).toBe(1);
      });
      // Periodic timer is removed from pending queue on error.
      expect(testZoneSpec.pendingPeriodicTimers.length).toBe(0);
    });
  });

  it('should be able to resume processing timer callbacks after handling an error', () => {
    fakeAsyncTestZone.run(() => {
      let ran = false;
      setTimeout(() => {
        throw new Error('timer');
      }, 10);
      setTimeout(() => {
        ran = true;
      }, 10);
      expect(() => {
        testZoneSpec.tick(10);
      }).toThrowError('timer');
      expect(ran).toBe(false);

      // Restart timer queue processing.
      testZoneSpec.tick(0);
      expect(ran).toBe(true);
    });
    // There should be no pending timers after the error in timer callback.
    expect(testZoneSpec.pendingTimers.length).toBe(0);
  });

  describe('flushing all tasks', () => {
    it('should flush all pending timers', () => {
      fakeAsyncTestZone.run(() => {
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
      fakeAsyncTestZone.run(() => {
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
      fakeAsyncTestZone.run(() => {
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
      fakeAsyncTestZone.run(() => {
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
      fakeAsyncTestZone.run(() => {
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
        expect(log).toEqual([
          'microtask',
          'periodic timer',
          'pt microtask',
          'timer',
          't microtask',
        ]);
      });
    });

    it('should throw the exception from tick for error thrown in timer callback', () => {
      fakeAsyncTestZone.run(() => {
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
        fakeAsyncTestZone.run(() => {
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
      }).toThrowError(
        'flush failed after reaching the limit of 20 tasks. Does your code use a polling timeout?',
      );
    });

    it('accepts a custom limit', () => {
      expect(() => {
        fakeAsyncTestZone.run(() => {
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
      }).toThrowError(
        'flush failed after reaching the limit of 10 tasks. Does your code use a polling timeout?',
      );
    });

    it('can flush periodic timers if flushPeriodic is true', () => {
      fakeAsyncTestZone.run(() => {
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
      fakeAsyncTestZone.run(() => {
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
      fakeAsyncTestZone.run(() => {
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

  describe('outside of FakeAsync Zone', () => {
    it('calling flushMicrotasks should throw exception', () => {
      expect(() => {
        testZoneSpec.flushMicrotasks();
      }).toThrowError('The code should be running in the fakeAsync zone to call this function');
    });
    it('calling tick should throw exception', () => {
      expect(() => {
        testZoneSpec.tick();
      }).toThrowError('The code should be running in the fakeAsync zone to call this function');
    });
  });

  const animationFrameFns = [
    ['requestAnimationFrame', 'cancelAnimationFrame'],
    ['webkitRequestAnimationFrame', 'webkitCancelAnimationFrame'],
    ['mozRequestAnimationFrame', 'mozCancelAnimationFrame'],
  ];

  const availableAnimationFrameFns = animationFrameFns
    .map(([fnName, cancelFnName]) => [
      fnName,
      (global as any)[fnName],
      (global as any)[cancelFnName],
    ])
    .filter(([_, fn]) => fn !== undefined) as [
    string,
    typeof requestAnimationFrame,
    typeof cancelAnimationFrame,
  ][];

  if (availableAnimationFrameFns.length > 0) {
    describe('requestAnimationFrame', () => {
      availableAnimationFrameFns.forEach(
        ([name, requestAnimationFrameFn, cancelAnimationFrameFn]) => {
          describe(name, () => {
            it('should schedule a requestAnimationFrame with timeout of 16ms', () => {
              fakeAsyncTestZone.run(() => {
                let ran = false;
                requestAnimationFrameFn(() => {
                  ran = true;
                });

                testZoneSpec.tick(6);
                expect(ran).toEqual(false);

                testZoneSpec.tick(10);
                expect(ran).toEqual(true);
              });
            });
            it('does not count as a pending timer', () => {
              fakeAsyncTestZone.run(() => {
                requestAnimationFrameFn(() => {});
              });
              expect(testZoneSpec.pendingTimers.length).toBe(0);
              expect(testZoneSpec.pendingPeriodicTimers.length).toBe(0);
            });
            it('should cancel a scheduled requestAnimationFrame', () => {
              fakeAsyncTestZone.run(() => {
                let ran = false;
                const id = requestAnimationFrameFn(() => {
                  ran = true;
                });

                testZoneSpec.tick(6);
                expect(ran).toEqual(false);

                cancelAnimationFrameFn(id);

                testZoneSpec.tick(10);
                expect(ran).toEqual(false);
              });
            });
            it('is not flushed when flushPeriodic is false', () => {
              let ran = false;
              fakeAsyncTestZone.run(() => {
                requestAnimationFrameFn(() => {
                  ran = true;
                });
                testZoneSpec.flush(20);
                expect(ran).toEqual(false);
              });
            });
            it('is flushed when flushPeriodic is true', () => {
              let ran = false;
              fakeAsyncTestZone.run(() => {
                requestAnimationFrameFn(() => {
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
              fakeAsyncTestZone.run(() => {
                requestAnimationFrameFn((ts) => {
                  timestamp = ts;
                  requestAnimationFrameFn((ts1) => {
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
          });
        },
      );
    });
  }

  describe(
    'XHRs',
    ifEnvSupports(
      'XMLHttpRequest',
      () => {
        it('should throw an exception if an XHR is initiated in the zone', () => {
          expect(() => {
            fakeAsyncTestZone.run(() => {
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
          }).toThrowError('Cannot make XHRs from within a fake async test. Request URL: /test');
        });
      },
      emptyRun,
    ),
  );

  describe(
    'node process',
    ifEnvSupports(
      supportNode,
      () => {
        it('should be able to schedule microTask with additional arguments', () => {
          const process = global['process'];
          const nextTick = process && process['nextTick'];
          if (!nextTick) {
            return;
          }
          fakeAsyncTestZone.run(() => {
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
              },
            );

            expect(tickRun).toEqual(false);

            testZoneSpec.flushMicrotasks();
            expect(tickRun).toEqual(true);
            expect(cbArgRun).toEqual(true);
          });
        });
      },
      emptyRun,
    ),
  );

  describe('should allow user define which macroTask fakeAsyncTest', () => {
    let FakeAsyncTestZoneSpec = (Zone as any)['FakeAsyncTestZoneSpec'];
    let testZoneSpec: any;
    let fakeAsyncTestZone: Zone;
    it('should support custom non perodic macroTask', () => {
      testZoneSpec = new FakeAsyncTestZoneSpec('name', false, [
        {source: 'TestClass.myTimeout', callbackArgs: ['test']},
      ]);
      class TestClass {
        myTimeout(callback: Function) {}
      }
      fakeAsyncTestZone = Zone.current.fork(testZoneSpec);
      fakeAsyncTestZone.run(() => {
        let ran = false;
        patchMacroTask(TestClass.prototype, 'myTimeout', (self: any, args: any[]) => ({
          name: 'TestClass.myTimeout',
          target: self,
          cbIdx: 0,
          args: args,
        }));

        const testClass = new TestClass();
        testClass.myTimeout(function (callbackArgs: any) {
          ran = true;
          expect(callbackArgs).toEqual('test');
        });

        expect(ran).toEqual(false);

        testZoneSpec.tick();
        expect(ran).toEqual(true);
      });
    });

    it('should support custom non perodic macroTask by global flag', () => {
      testZoneSpec = new FakeAsyncTestZoneSpec('name');
      class TestClass {
        myTimeout(callback: Function) {}
      }
      fakeAsyncTestZone = Zone.current.fork(testZoneSpec);
      fakeAsyncTestZone.run(() => {
        let ran = false;
        patchMacroTask(TestClass.prototype, 'myTimeout', (self: any, args: any[]) => ({
          name: 'TestClass.myTimeout',
          target: self,
          cbIdx: 0,
          args: args,
        }));

        const testClass = new TestClass();
        testClass.myTimeout(() => {
          ran = true;
        });

        expect(ran).toEqual(false);

        testZoneSpec.tick();
        expect(ran).toEqual(true);
      });
    });

    it('should support custom perodic macroTask', () => {
      testZoneSpec = new FakeAsyncTestZoneSpec('name', false, [
        {source: 'TestClass.myInterval', isPeriodic: true},
      ]);
      fakeAsyncTestZone = Zone.current.fork(testZoneSpec);
      fakeAsyncTestZone.run(() => {
        let cycle = 0;
        class TestClass {
          myInterval(callback: Function, interval: number): any {
            return null;
          }
        }
        patchMacroTask(TestClass.prototype, 'myInterval', (self: any, args: any[]) => ({
          name: 'TestClass.myInterval',
          target: self,
          cbIdx: 0,
          args: args,
        }));

        const testClass = new TestClass();
        const id = testClass.myInterval(() => {
          cycle++;
        }, 10);

        expect(cycle).toEqual(0);

        testZoneSpec.tick(10);
        expect(cycle).toEqual(1);

        testZoneSpec.tick(10);
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

  describe('fakeAsyncTest should patch Date', () => {
    let FakeAsyncTestZoneSpec = (Zone as any)['FakeAsyncTestZoneSpec'];
    let testZoneSpec: any;
    let fakeAsyncTestZone: Zone;

    beforeEach(() => {
      testZoneSpec = new FakeAsyncTestZoneSpec('name', false);
      fakeAsyncTestZone = Zone.current.fork(testZoneSpec);
    });

    it('should get date diff correctly', () => {
      fakeAsyncTestZone.run(() => {
        const start = Date.now();
        testZoneSpec.tick(100);
        const end = Date.now();
        expect(end - start).toBe(100);
      });
    });

    it('should check date type correctly', () => {
      fakeAsyncTestZone.run(() => {
        const d: any = new Date();
        expect(d instanceof Date).toBe(true);
      });
    });

    it('should new Date with parameter correctly', () => {
      fakeAsyncTestZone.run(() => {
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
      fakeAsyncTestZone.run(() => {
        const utcDate = new Date(Date.UTC(96, 11, 1, 0, 0, 0));
        expect(utcDate.getFullYear()).toBe(1996);
      });
    });

    it('should call Date.parse() correctly', () => {
      fakeAsyncTestZone.run(() => {
        const unixTimeZero = Date.parse('01 Jan 1970 00:00:00 GMT');
        expect(unixTimeZero).toBe(0);
      });
    });
  });

  describe(
    'fakeAsyncTest should patch rxjs scheduler',
    ifEnvSupports(
      () => isNode,
      () => {
        let FakeAsyncTestZoneSpec = (Zone as any)['FakeAsyncTestZoneSpec'];
        let testZoneSpec: any;
        let fakeAsyncTestZone: Zone;

        beforeEach(() => {
          testZoneSpec = new FakeAsyncTestZoneSpec('name', false);
          fakeAsyncTestZone = Zone.current.fork(testZoneSpec);
        });

        it('should get date diff correctly', (done) => {
          fakeAsyncTestZone.run(() => {
            let result: any = null;
            const observable = new Observable((subscribe: any) => {
              subscribe.next('hello');
              subscribe.complete();
            });
            observable.pipe(delay(1000)).subscribe((v: any) => {
              result = v;
            });
            expect(result).toBe(null);
            testZoneSpec.tick(1000);
            expect(result).toBe('hello');
            done();
          });
        });
      },
      emptyRun,
    ),
  );

  describe('setTickMode', () => {
    it('should execute timers automatically when mode is set to automatic', async () => {
      let ran = false;
      await new Promise<void>((resolve) => {
        fakeAsyncTestZone.run(() => {
          setTimeout(() => {
            ran = true;
            resolve();
          }, 10);
          testZoneSpec.setTickMode('automatic');
        });
      });

      expect(ran).toBe(true);
      fakeAsyncTestZone.run(() => {
        testZoneSpec.setTickMode('manual');
      });
    });

    it('should execute multiple timers automatically', async () => {
      const log: string[] = [];
      const promise = new Promise<void>((resolve) => {
        fakeAsyncTestZone.run(() => {
          setTimeout(() => {
            log.push('timer A');
          }, 10);
          setTimeout(() => {
            log.push('timer B');
            resolve();
          }, 20);
          testZoneSpec.setTickMode('automatic');
        });
      });

      await promise;
      expect(log).toEqual(['timer A', 'timer B']);
      fakeAsyncTestZone.run(() => {
        testZoneSpec.setTickMode('manual');
      });
    });

    it('should allow mutation observers to execute between timers', async () => {
      if (isNode) {
        return;
      }
      const log: string[] = [];
      const el = document.createElement('div');
      let observer: MutationObserver;

      await new Promise<void>((resolve) => {
        fakeAsyncTestZone.run(() => {
          document.body.appendChild(el);
          observer = new MutationObserver(() => {
            log.push('mutation');
          });
          observer.observe(el, {attributes: true});

          setTimeout(() => {
            log.push('timer A');
            el.style.width = '100px'; // trigger mutation observer
          }, 10);
          setTimeout(() => {
            debugger;
            log.push('timer B');
            resolve();
          }, 10);

          testZoneSpec.setTickMode('automatic');
        });
      });

      expect(log).toEqual(['timer A', 'mutation', 'timer B']);
      fakeAsyncTestZone.run(() => {
        testZoneSpec.setTickMode('manual');
        observer.disconnect();
      });
      document.body.removeChild(el);
    });
  });
});

class Log<T> {
  logItems: T[];

  constructor() {
    this.logItems = [];
  }

  add(value: T): void {
    this.logItems.push(value);
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
const fakeAsyncTestModule = (Zone as any)[Zone.__symbol__('fakeAsyncTest')];
const {fakeAsync, tick, discardPeriodicTasks, flush, flushMicrotasks} = fakeAsyncTestModule;

describe('fake async', () => {
  it('should run synchronous code', () => {
    let ran = false;
    fakeAsync(() => {
      ran = true;
    })();

    expect(ran).toEqual(true);
  });

  it('should pass arguments to the wrapped function', () => {
    fakeAsync((foo: string, bar: string) => {
      expect(foo).toEqual('foo');
      expect(bar).toEqual('bar');
    })('foo', 'bar');
  });

  it('should throw on nested calls', () => {
    expect(() => {
      fakeAsync(() => {
        fakeAsync((): null => null)();
      })();
    }).toThrowError('fakeAsync() calls can not be nested');
  });

  it('should flush microtasks before returning', () => {
    let thenRan = false;

    fakeAsync(() => {
      resolvedPromise.then((_) => {
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
      const log = new Log<number>();

      resolvedPromise.then((_) => log.add(1)).then((_) => log.add(2));

      expect(log.result()).toEqual('');

      flushMicrotasks();
      expect(log.result()).toEqual('1; 2');
    }));

    it('should run Promise created in Promise', fakeAsync(() => {
      const log = new Log<number>();

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
      }).toThrowError(/Uncaught \(in promise\): Error: async/);
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
        fakeAsync(
          () => {
            setTimeout(() => {}, 10);
          },
          {flush: false},
        )();
      }).toThrowError('1 timer(s) still in the queue.');
    });

    it('should throw an error on dangling periodic timers', () => {
      expect(() => {
        fakeAsync(
          () => {
            setInterval(() => {}, 10);
          },
          {flush: false},
        )();
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
      let id = setInterval(() => {
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
      const log = new Log<string>();

      resolvedPromise.then((_) => log.add('microtask'));

      setTimeout(() => log.add('timer'), 9);

      const id = setInterval(() => log.add('periodic timer'), 10);

      expect(log.result()).toEqual('');

      tick(10);
      expect(log.result()).toEqual('microtask; timer; periodic timer');
      clearInterval(id);
    }));

    it('should process micro-tasks created in timers before next timers', fakeAsync(() => {
      const log = new Log<string>();

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
      expect(log.result()).toEqual('microtask; timer; t microtask; periodic timer; pt microtask');

      tick(10);
      expect(log.result()).toEqual(
        'microtask; timer; t microtask; periodic timer; pt microtask; periodic timer; pt microtask',
      );
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

  describe('fakeAsync should work with Date', () => {
    it('should get date diff correctly', fakeAsync(() => {
      const start = Date.now();
      tick(100);
      const end = Date.now();
      expect(end - start).toBe(100);
    }));

    it('should check date type correctly', fakeAsync(() => {
      const d: any = new Date();
      expect(d instanceof Date).toBe(true);
    }));

    it('should new Date with parameter correctly', fakeAsync(() => {
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

    it('should get Date.UTC() correctly', fakeAsync(() => {
      const utcDate = new Date(Date.UTC(96, 11, 1, 0, 0, 0));
      expect(utcDate.getFullYear()).toBe(1996);
    }));

    it('should call Date.parse() correctly', fakeAsync(() => {
      const unixTimeZero = Date.parse('01 Jan 1970 00:00:00 GMT');
      expect(unixTimeZero).toBe(0);
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
    fakeAsync(() => {
      testZone.run(() => {
        Promise.resolve('works').then((v) => (state = v));
        expect(state).toEqual('not run');
        flushMicrotasks();
        expect(state).toEqual('works');
      });
    })();
    expect(state).toEqual('works');
  });
});
