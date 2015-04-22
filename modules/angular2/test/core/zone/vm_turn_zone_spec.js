import {
  AsyncTestCompleter,
  beforeEach,
  ddescribe,
  describe,
  expect,
  iit,
  inject,
  it,
  xdescribe,
  xit,
  Log
} from 'angular2/test_lib';

import {PromiseWrapper} from 'angular2/src/facade/async';
import {ListWrapper} from 'angular2/src/facade/collection';
import {BaseException} from 'angular2/src/facade/lang';

import {VmTurnZone} from 'angular2/src/core/zone/vm_turn_zone';

function macroTask(fn: Function): void {
  PromiseWrapper.setTimeout(fn, 0);
}

function microTask(fn: Function): void {
  PromiseWrapper.resolve(null).then((_) => { fn(); });
}

export function main() {
  ddescribe("VmTurnZone", () => {
    var log;
    var zone;

    beforeEach(() => {
      log = new Log();
      zone = new VmTurnZone({enableLongStackTrace: true});
      zone.initCallbacks({
          onTurnStart: log.fn('onTurnStart'),
          onTurnDone: log.fn('onTurnDone')
      });
    });

    describe("run", () => {
      it('should not run onTurnStart and onTurnDone for nested Zone.run',
         inject([AsyncTestCompleter], (async) => {
        macroTask(() => {
          zone.run(() => {
            zone.run(log.fn('run'));
          });
        });

        macroTask(() => {
          expect(log.result()).toEqual('onTurnStart; run; onTurnDone');
          async.done();
        });
      }));

      it('should call onTurnStart and onTurnDone before and after each top-level run',
         inject([AsyncTestCompleter], (async) => {
        macroTask(() => {
          zone.run(log.fn('run1'));
          zone.run(log.fn('run2'));
        });

        macroTask(() => {
          expect(log.result()).toEqual('onTurnStart; run1; onTurnDone; onTurnStart; run2; onTurnDone');
          async.done();
        });

      }));

      it('should call onTurnStart and onTurnDone before and after each turn',
      inject([AsyncTestCompleter], (async) => {

        zone.runOutsideAngular(() => {
          macroTask(() => {
            var a = PromiseWrapper.completer();
            var b = PromiseWrapper.completer();

            zone.run(() => {
              log.add('run start');
              a.promise.then((_) => {
                return log.add('a then');
              });
              b.promise.then((_) => {
                return log.add('b then');
              });
            });

            a.resolve("a");
            b.resolve("b");
          });

          macroTask(() => {
            expect(log.result()).toEqual(
                'onTurnStart; run start; onTurnDone; onTurnStart; a then; b then; onTurnDone');
            async.done();
          });

        });
      }));
    });

    describe("runOutsideAngular", () => {
      it("should run a function outside of the angular zone", () => {
        zone.runOutsideAngular(log.fn('run'));
        expect(log.result()).toEqual('run');
      });
    });

    describe("exceptions", () => {
      var trace;
      var exception;
      var saveStackTrace;
      beforeEach(() => {
        trace = null;
        exception = null;
        saveStackTrace = (e, t) => {
          exception = e;
          trace = t;
        };
      });

      it('should call the on error callback when it is defined', inject([AsyncTestCompleter], (async) => {
        zone.initCallbacks({onErrorHandler: saveStackTrace});

        macroTask(() => {
          zone.run(() => {
            throw new BaseException('aaa');
          });
        });

        macroTask(() => {
          expect(exception).toBeDefined();
          async.done();
        });
      }));

      it('should rethrow exceptions from the body when no callback defined', () => {
        expect(() => {
          zone.run(() => {
            throw new BaseException('bbb');
          });
        }).toThrowError('bbb');
      });

      it('should produce long stack traces', inject([AsyncTestCompleter],
          (async) => {
        zone.initCallbacks({onErrorHandler: saveStackTrace});
        var c = PromiseWrapper.completer();
        zone.run(() => {
          macroTask(() => {
            macroTask(() => {
              c.resolve(null);
              throw new BaseException('ccc');
            });
          });
        });

        c.promise.then((_) => {
          expect(trace.length).toBeGreaterThan(1);
          async.done();
        });
      }));

      it('should produce long stack traces (when using microtasks)', inject(
          [AsyncTestCompleter], (async) => {

        zone.initCallbacks({onErrorHandler: saveStackTrace});
        var c = PromiseWrapper.completer();
        zone.run(() => {
          microTask(() => {
            microTask(() => {
              c.resolve(null);
              throw new BaseException("ddd");
            });
          });
        });

        c.promise.then((_) => {
          expect(trace.length).toBeGreaterThan(1);
          async.done();
        });
      }));

      it('should disable long stack traces', inject([AsyncTestCompleter], (async) => {
        var zone = new VmTurnZone({enableLongStackTrace: false});
        zone.initCallbacks({onErrorHandler: saveStackTrace});
        var c = PromiseWrapper.completer();

        zone.run(() => {
          macroTask(() => {
            macroTask(() => {
              c.resolve(null);
              throw new BaseException('ccc');
            });
          });
        });

        c.promise.then((_) => {
          expect(trace.length).toEqual(1);
          async.done();
        });
      }));
    });

    describe('exceptions', () => {
      it('should rethrow exceptions from the body and call onError', () => {
        var errors = [];
        zone.initCallbacks({onErrorHandler: (e, s) => { ListWrapper.push(errors, e); }});

        zone.run(() => {
          throw 'hello';
        });

        expect(errors).toEqual(['hello']);
      });

      it('should call onError for errors from microtasks', inject([AsyncTestCompleter], (async) => {
        var errors = [];
        zone.initCallbacks({onErrorHandler: (e, s) => {
          ListWrapper.push(errors, e);
        }});

        var exception = new BaseException('async exception');

        macroTask(() => {
          zone.run(() => {
            microTask(() => { throw exception; });
          });
        });

        macroTask(() => {
          expect(errors).toEqual([exception]);
          async.done();
        });
      }));

      it('should rethrow exceptions from the onTurnDone and call onError when the zone is sync',
          inject([AsyncTestCompleter], (async) => {
        var errors = [];

        var exception = new BaseException('fromOnTurnDone');

        zone.initCallbacks({
          onErrorHandler: (e, s) => { ListWrapper.push(errors, e); },
          onTurnDone: () => { throw exception; }});

        macroTask(() => {
          zone.run(() => { });
        });

        macroTask(() => {
          expect(errors).toEqual([exception]);
          async.done();
        });
      }));

      it('should rethrow exceptions from the onTurnDone and call onError when the zone is async',
          inject([AsyncTestCompleter], (async) => {
        var errors = [];
        var asyncRan = false;

        var exception = new BaseException('fromOnTurnDone');

        zone.initCallbacks({
          onErrorHandler: (e, s) => { ListWrapper.push(errors, e); },
          onTurnDone: () => { throw exception; }});

        macroTask(() => {
          zone.run(() => {
            microTask(() => { asyncRan = true; });
          });
        });

        macroTask(() => {
          expect(asyncRan).toBe(true);
          expect(errors).toEqual([exception]);
          async.done();
        });
      }));

    });

    it('should call onTurnStart and onTurnDone', () => {
      zone.run(log.fn('run'));
      expect(log.result()).toEqual('onTurnStart; run; onTurnDone');
    });

    it('should call onTurnStart and onTurnDone when an inner microtask is scheduled from outside angular',
          inject([AsyncTestCompleter], (async) => {
      var completer;

      macroTask(() => {
        zone.runOutsideAngular(() => {
          completer = PromiseWrapper.completer();
        });
      });

      macroTask(() => {
        zone.run(() => {
          completer.promise.then((_) => {
            log.add('executedMicrotask');
          });
        });
      });

      macroTask(() => {
        zone.runOutsideAngular(() => {
          log.add('scheduling a microtask');
          completer.resolve(null);
        });
      });

      macroTask(() => {
        expect(log.result()).toEqual(
            // First VM turn => setup Promise then
            'onTurnStart; onTurnDone; ' +
            // Second VM turn (outside of anguler)
            'scheduling a microtask; ' +
            // Third VM Turn => execute the microtask (inside angular)
            'onTurnStart; executedMicrotask; onTurnDone'
        );
        async.done();
      });
    }));

    it('should not call onTurnStart and onTurnDone when an outer microtask is scheduled from inside angular',
          inject([AsyncTestCompleter], (async) => {
      var completer;

      macroTask(() => {
        zone.runOutsideAngular(() => {
         completer = PromiseWrapper.completer();
         completer.promise.then((_) => {
           log.add('executedMicrotask');
         });
        });
      });

      macroTask(() => {
        zone.run(() => {
          log.add('scheduling a microtask');
          completer.resolve(null);
        });
      });

      macroTask(() => {
        expect(log.result()).toEqual(
            'onTurnStart; scheduling a microtask; executedMicrotask; onTurnDone'
        );
        async.done();
      });
    }));

    it('should return the body return value from run', () => {
      expect(zone.run(() => {
        return 6;
      })).toEqual(6);
    });

    it('should call onTurnStart before executing a microtask scheduled in onTurnDone as well as ' +
        'onTurnDone after executing the task', inject([AsyncTestCompleter], (async) => {
      var ran = false;
      zone.initCallbacks({
        onTurnStart: log.fn('onTurnStart'),
        onTurnDone: () => {
          log.add('onTurnDone(begin)');
          if (!ran) {
            microTask(() => {
              ran = true;
              log.add('executedMicrotask');});
          }

          log.add('onTurnDone(end)');
        }});

      macroTask(() => {
        zone.run(() => {
          log.add('run');
        });
      });

      macroTask(() => {
        expect(log.result()).toEqual(
            // First VM turn => 'run' macrotask
            'onTurnStart; run; onTurnDone(begin); onTurnDone(end); ' +
            // Second VM Turn => microtask enqueued from onTurnDone
            'onTurnStart; executedMicrotask; onTurnDone(begin); onTurnDone(end)'
        );
        async.done();
      });
    }));

    it('should call onTurnStart and onTurnDone for a scheduleMicrotask in onTurnDone triggered by ' +
       'a scheduleMicrotask in run', inject([AsyncTestCompleter], (async) => {
      var ran = false;
      zone.initCallbacks({
        onTurnStart: log.fn('onTurnStart'),
        onTurnDone: () => {
          log.add('onTurnDone(begin)');
          if (!ran) {
            log.add('onTurnDone(scheduleMicrotask)');
            microTask(() => {
              ran = true;
              log.add('onTurnDone(executeMicrotask)');
            });
          }
          log.add('onTurnDone(end)');
        }});

      macroTask(() => {
        zone.run(() => {
          log.add('scheduleMicrotask');
          microTask(() => { log.add('run(executeMicrotask)'); });
        });
      });

      macroTask(() => {
        expect(log.result()).toEqual(
            // First VM Turn => a macrotask + the microtask it enqueues
            'onTurnStart; scheduleMicrotask; run(executeMicrotask); onTurnDone(begin); onTurnDone(scheduleMicrotask); onTurnDone(end); ' +
            // Second VM Turn => the microtask enqueued from onTurnDone
            'onTurnStart; onTurnDone(executeMicrotask); onTurnDone(begin); onTurnDone(end)'
        );
        async.done();

      });
    }));

    it('should call onTurnStart once before a turn and onTurnDone once after the turn',
       inject([AsyncTestCompleter], (async) => {

      macroTask(() => {
        zone.run(() => {
          log.add('run start');
          microTask(() => { log.add('async'); });
          log.add('run end');
        });
      });

      macroTask(() => {
        // The microtask (async) is executed after the macrotask (run)
        expect(log.result()).toEqual('onTurnStart; run start; run end; async; onTurnDone');
        async.done();
      });
    }));

    it('should execute promises scheduled in onTurnStart before promises scheduled in run',
       inject([AsyncTestCompleter], (async) => {
      var donePromiseRan = false;
      var startPromiseRan = false;

      zone.initCallbacks({
        onTurnStart: () => {
          log.add('onTurnStart(begin)');
          if (!startPromiseRan) {
            log.add('onTurnStart(schedulePromise)');
            microTask(() => { log.add('onTurnStart(executePromise)'); });
            startPromiseRan = true;
          }
          log.add('onTurnStart(end)');
        },
        onTurnDone: () => {
          log.add('onTurnDone(begin)');
          if (!donePromiseRan) {
            log.add('onTurnDone(schedulePromise)');
            microTask(() => { log.add('onTurnDone(executePromise)'); });
            donePromiseRan = true;
          }
          log.add('onTurnDone(end)');
      }});

      macroTask(() => {
        zone.run(() => {
          log.add('run start');
          PromiseWrapper.resolve(null)
            .then((_) => {
              log.add('promise then');
              PromiseWrapper.resolve(null).then((_) => { log.add('promise foo'); });
              return PromiseWrapper.resolve(null);
            })
            .then((_) => {
              log.add('promise bar');
            });
          log.add('run end');
        });
      });

      macroTask(() => {
        expect(log.result()).toEqual(
            // First VM turn: enqueue a microtask in onTurnStart
            'onTurnStart(begin); onTurnStart(schedulePromise); onTurnStart(end); ' +
            // First VM turn: execute the macrotask which enqueues microtasks
            'run start; run end; ' +
            // First VM turn: execute enqueued microtasks
            'onTurnStart(executePromise); promise then; promise foo; promise bar; ' +
            // First VM turn: onTurnEnd, enqueue a microtask
            'onTurnDone(begin); onTurnDone(schedulePromise); onTurnDone(end); ' +
            // Second VM turn: execute the microtask from onTurnEnd
            'onTurnStart(begin); onTurnStart(end); onTurnDone(executePromise); onTurnDone(begin); onTurnDone(end)'
        );
        async.done();
      });
    }));

    it('should call onTurnStart and onTurnDone before and after each turn, respectively',
       inject([AsyncTestCompleter], (async) => {
      var completerA, completerB;

      macroTask(() => {
        zone.run(() => {
          completerA = PromiseWrapper.completer();
          completerB = PromiseWrapper.completer();
          completerA.promise.then((_) => log.add('a then'));
          completerB.promise.then((_) => log.add('b then'));
          log.add('run start');
        });
      });

      macroTask(() => {
        zone.run(() => {
          completerA.resolve(null);
        });
      });


      macroTask(() => {
        zone.run(() => {
          completerB.resolve(null);
        });
      });

      macroTask(() => {
        expect(log.result()).toEqual(
            // First VM turn
            'onTurnStart; run start; onTurnDone; ' +
            // Second VM turn
            'onTurnStart; a then; onTurnDone; ' +
            // Third VM turn
            'onTurnStart; b then; onTurnDone');
        async.done();
      });
    }));

    it('should call onTurnStart and onTurnDone before and after (respectively) all turns in a chain',
       inject([AsyncTestCompleter], (async) => {
      macroTask(() => {
        zone.run(() => {
          log.add('run start');
          microTask(() => {
            log.add('async1');
            microTask(() => {
              log.add('async2');
            });
          });
          log.add('run end');
        });
      });

      macroTask(() => {
        expect(log.result()).toEqual('onTurnStart; run start; run end; async1; async2; onTurnDone');
        async.done();
      });
    }));

    it('should call onTurnStart and onTurnDone for promises created outside of run body',
       inject([AsyncTestCompleter], (async) => {
      var promise;

      zone.initCallbacks({
        onTurnStart: log.fn('onTurnStart'),
        onTurnDone: log.fn('onTurnDone')
      });

      macroTask(() => {
        zone.runOutsideAngular(() => {
          promise = PromiseWrapper.resolve(4).then((x) => PromiseWrapper.resolve(x));
        });

        zone.run(() => {
          promise.then((_) => {
            log.add('promise then');
          });
          log.add('zone run');
        });
      });

      macroTask(() => {
        expect(log.result()).toEqual('onTurnStart; zone run; promise then; onTurnDone');
        async.done();
      });
    }));

  });
}
