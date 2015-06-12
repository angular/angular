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
  Log,
  isInInnerZone
} from 'angular2/test_lib';

import {PromiseWrapper, TimerWrapper} from 'angular2/src/facade/async';
import {ListWrapper} from 'angular2/src/facade/collection';
import {BaseException} from 'angular2/src/facade/lang';
import {DOM} from 'angular2/src/dom/dom_adapter';

import {NgZone} from 'angular2/src/core/zone/ng_zone';

var isIE = DOM.getUserAgent().indexOf("Trident") > -1;
// Schedules a macrotask (using a timer)
function macroTask(fn: Function, timer = 1): void {
  // adds longer timers for passing tests in IE
  _zone.runOutsideAngular(() => TimerWrapper.setTimeout(fn, isIE ? timer : 1));
}

// Schedules a microtasks (using a resolved promise .then())
function microTask(fn: Function): void {
  PromiseWrapper.resolve(null).then((_) => { fn(); });
}

var _log;
var _errors;
var _traces;
var _zone;

function logError(error, stackTrace) {
  ListWrapper.push(_errors, error);
  ListWrapper.push(_traces, stackTrace);
}

export function main() {
  describe("NgZone", () => {

    function createZone(enableLongStackTrace) {
      var zone = new NgZone({enableLongStackTrace: enableLongStackTrace});
      zone.initCallbacks({onTurnStart: _log.fn('onTurnStart'), onTurnDone: _log.fn('onTurnDone')});
      return zone;
    }

    beforeEach(() => {
      _log = new Log();
      _errors = [];
      _traces = [];
    });

    describe('long stack trace', () => {
      beforeEach(() => { _zone = createZone(true); });

      commonTests();

      it('should produce long stack traces', inject([AsyncTestCompleter], (async) => {
           macroTask(() => {
             _zone.initCallbacks({onErrorHandler: logError});
             var c = PromiseWrapper.completer();

             _zone.run(() => {
               TimerWrapper.setTimeout(() => {
                 TimerWrapper.setTimeout(() => {
                   c.resolve(null);
                   throw new BaseException('ccc');
                 }, 0);
               }, 0);
             });

             c.promise.then((_) => {
               expect(_traces.length).toBe(1);
               expect(_traces[0].length).toBeGreaterThan(1);
               async.done();
             });
           });
         }));

      it('should produce long stack traces (when using microtasks)',
         inject([AsyncTestCompleter], (async) => {
           macroTask(() => {
             _zone.initCallbacks({onErrorHandler: logError});
             var c = PromiseWrapper.completer();

             _zone.run(() => {
               microTask(() => {
                 microTask(() => {
                   c.resolve(null);
                   throw new BaseException("ddd");
                 });
               });
             });

             c.promise.then((_) => {
               expect(_traces.length).toBe(1);
               expect(_traces[0].length).toBeGreaterThan(1);
               async.done();
             });
           });
         }));
    });

    describe('short stack trace', () => {
      beforeEach(() => { _zone = createZone(false); });

      commonTests();

      it('should disable long stack traces', inject([AsyncTestCompleter], (async) => {
           macroTask(() => {
             _zone.initCallbacks({onErrorHandler: logError});
             var c = PromiseWrapper.completer();

             _zone.run(() => {
               TimerWrapper.setTimeout(() => {
                 TimerWrapper.setTimeout(() => {
                   c.resolve(null);
                   throw new BaseException('ccc');
                 }, 0);
               }, 0);
             });

             c.promise.then((_) => {
               expect(_traces.length).toBe(1);
               expect(_traces[0].length).toEqual(1);
               async.done();
             });
           });
         }));
    });
  });
}

function commonTests() {
  describe('isInInnerZone',
           () => {it('should return whether the code executes in the inner zone', () => {
             expect(isInInnerZone()).toEqual(false);
             _zone.run(() => { expect(isInInnerZone()).toEqual(true); });
           })});

  describe('run', () => {
    it('should return the body return value from run', inject([AsyncTestCompleter], (async) => {
         macroTask(() => { expect(_zone.run(() => { return 6; })).toEqual(6); });

         macroTask(() => { async.done(); });
       }));

    it('should call onTurnStart and onTurnDone', inject([AsyncTestCompleter], (async) => {
         macroTask(() => { _zone.run(_log.fn('run')); });

         macroTask(() => {
           expect(_log.result()).toEqual('onTurnStart; run; onTurnDone');
           async.done();
         });
       }));

    it('should call onTurnStart once before a turn and onTurnDone once after the turn',
       inject([AsyncTestCompleter], (async) => {

         macroTask(() => {
           _zone.run(() => {
             _log.add('run start');
             microTask(_log.fn('async'));
             _log.add('run end');
           });
         });

         macroTask(() => {
           // The microtask (async) is executed after the macrotask (run)
           expect(_log.result()).toEqual('onTurnStart; run start; run end; async; onTurnDone');
           async.done();
         }, 50);
       }));

    it('should not run onTurnStart and onTurnDone for nested Zone.run',
       inject([AsyncTestCompleter], (async) => {
         macroTask(() => {
           _zone.run(() => {
             _log.add('start run');
             _zone.run(() => {
               _log.add('nested run');
               microTask(_log.fn('nested run microtask'));
             });
             _log.add('end run');
           });
         });

         macroTask(() => {
           expect(_log.result())
               .toEqual(
                   'onTurnStart; start run; nested run; end run; nested run microtask; onTurnDone');
           async.done();
         }, 50);
       }));

    it('should not run onTurnStart and onTurnDone for nested Zone.run invoked from onTurnDone',
       inject([AsyncTestCompleter], (async) => {
         _zone.initCallbacks({
           onTurnDone: () => {
             _log.add('onTurnDone:started');
             _zone.run(() => _log.add('nested run')) _log.add('onTurnDone:finished');
           }
         });

         macroTask(() => { _zone.run(() => { _log.add('start run'); }); });

         macroTask(() => {
           expect(_log.result())
               .toEqual('start run; onTurnDone:started; nested run; onTurnDone:finished');
           async.done();
         }, 50);
       }));

    it('should call onTurnStart and onTurnDone before and after each top-level run',
       inject([AsyncTestCompleter], (async) => {
         macroTask(() => { _zone.run(_log.fn('run1')); });

         macroTask(() => { _zone.run(_log.fn('run2')); });

         macroTask(() => {
           expect(_log.result())
               .toEqual('onTurnStart; run1; onTurnDone; onTurnStart; run2; onTurnDone');
           async.done();
         });
       }));

    it('should call onTurnStart and onTurnDone before and after each turn',
       inject([AsyncTestCompleter], (async) => {
         var a;
         var b;

         macroTask(() => {
           _zone.run(() => {
             a = PromiseWrapper.completer();
             b = PromiseWrapper.completer();

             _log.add('run start');
             a.promise.then(_log.fn('a then'));
             b.promise.then(_log.fn('b then'));
           });
         });

         macroTask(() => {
           _zone.run(() => {
             a.resolve('a');
             b.resolve('b');
           });
         });

         macroTask(() => {
           expect(_log.result())
               .toEqual(
                   'onTurnStart; run start; onTurnDone; onTurnStart; a then; b then; onTurnDone');
           async.done();
         }, 50);
       }));

    it('should run a function outside of the angular zone',
       inject([AsyncTestCompleter], (async) => {
         macroTask(() => { _zone.runOutsideAngular(_log.fn('run')); });

         macroTask(() => {
           expect(_log.result()).toEqual('run');
           async.done()
         });
       }));

    it('should call onTurnStart and onTurnDone when an inner microtask is scheduled from outside angular',
       inject([AsyncTestCompleter], (async) => {
         var completer;

         macroTask(
             () => { _zone.runOutsideAngular(() => { completer = PromiseWrapper.completer(); }); });

         macroTask(
             () => { _zone.run(() => { completer.promise.then(_log.fn('executedMicrotask')); }); });

         macroTask(() => {
           _zone.runOutsideAngular(() => {
             _log.add('scheduling a microtask');
             completer.resolve(null);
           });
         });

         macroTask(() => {
           expect(_log.result())
               .toEqual(
                   // First VM turn => setup Promise then
                   'onTurnStart; onTurnDone; ' +
                   // Second VM turn (outside of anguler)
                   'scheduling a microtask; ' +
                   // Third VM Turn => execute the microtask (inside angular)
                   'onTurnStart; executedMicrotask; onTurnDone');
           async.done();
         }, 50);
       }));

    it('should call onTurnStart before executing a microtask scheduled in onTurnDone as well as ' +
           'onTurnDone after executing the task',
       inject([AsyncTestCompleter], (async) => {
         var ran = false;
         _zone.initCallbacks({
           onTurnStart: _log.fn('onTurnStart'),
           onTurnDone: () => {
             _log.add('onTurnDone(begin)');
             if (!ran) {
               microTask(() => {
                 ran = true;
                 _log.add('executedMicrotask');
               });
             }

             _log.add('onTurnDone(end)');
           }
         });

         macroTask(() => { _zone.run(_log.fn('run')); });

         macroTask(() => {
           expect(_log.result())
               .toEqual(
                   // First VM turn => 'run' macrotask
                   'onTurnStart; run; onTurnDone(begin); onTurnDone(end); ' +
                   // Second VM Turn => microtask enqueued from onTurnDone
                   'onTurnStart; executedMicrotask; onTurnDone(begin); onTurnDone(end)');
           async.done();
         }, 50);
       }));

    it('should call onTurnStart and onTurnDone for a scheduleMicrotask in onTurnDone triggered by ' +
           'a scheduleMicrotask in run',
       inject([AsyncTestCompleter], (async) => {
         var ran = false;
         _zone.initCallbacks({
           onTurnStart: _log.fn('onTurnStart'),
           onTurnDone: () => {
             _log.add('onTurnDone(begin)');
             if (!ran) {
               _log.add('onTurnDone(scheduleMicrotask)');
               microTask(() => {
                 ran = true;
                 _log.add('onTurnDone(executeMicrotask)');
               });
             }
             _log.add('onTurnDone(end)');
           }
         });

         macroTask(() => {
           _zone.run(() => {
             _log.add('scheduleMicrotask');
             microTask(_log.fn('run(executeMicrotask)'));
           });
         });

         macroTask(() => {
           expect(_log.result())
               .toEqual(
                   // First VM Turn => a macrotask + the microtask it enqueues
                   'onTurnStart; scheduleMicrotask; run(executeMicrotask); onTurnDone(begin); onTurnDone(scheduleMicrotask); onTurnDone(end); ' +
                   // Second VM Turn => the microtask enqueued from onTurnDone
                   'onTurnStart; onTurnDone(executeMicrotask); onTurnDone(begin); onTurnDone(end)');
           async.done();
         }, 50);
       }));

    it('should execute promises scheduled in onTurnStart before promises scheduled in run',
       inject([AsyncTestCompleter], (async) => {
         var donePromiseRan = false;
         var startPromiseRan = false;

         _zone.initCallbacks({
           onTurnStart: () => {
             _log.add('onTurnStart(begin)');
             if (!startPromiseRan) {
               _log.add('onTurnStart(schedulePromise)');
               microTask(_log.fn('onTurnStart(executePromise)'));
               startPromiseRan = true;
             }
             _log.add('onTurnStart(end)');
           },
           onTurnDone: () => {
             _log.add('onTurnDone(begin)');
             if (!donePromiseRan) {
               _log.add('onTurnDone(schedulePromise)');
               microTask(_log.fn('onTurnDone(executePromise)'));
               donePromiseRan = true;
             }
             _log.add('onTurnDone(end)');
           }
         });

         macroTask(() => {
           _zone.run(() => {
             _log.add('run start');
             PromiseWrapper.resolve(null)
                 .then((_) => {
                   _log.add('promise then');
                   PromiseWrapper.resolve(null).then(_log.fn('promise foo'));
                   return PromiseWrapper.resolve(null);
                 })
                 .then(_log.fn('promise bar'));
             _log.add('run end');
           });
         });

         macroTask(() => {
           expect(_log.result())
               .toEqual(
                   // First VM turn: enqueue a microtask in onTurnStart
                   'onTurnStart(begin); onTurnStart(schedulePromise); onTurnStart(end); ' +
                   // First VM turn: execute the macrotask which enqueues microtasks
                   'run start; run end; ' +
                   // First VM turn: execute enqueued microtasks
                   'onTurnStart(executePromise); promise then; promise foo; promise bar; ' +
                   // First VM turn: onTurnEnd, enqueue a microtask
                   'onTurnDone(begin); onTurnDone(schedulePromise); onTurnDone(end); ' +
                   // Second VM turn: execute the microtask from onTurnEnd
                   'onTurnStart(begin); onTurnStart(end); onTurnDone(executePromise); onTurnDone(begin); onTurnDone(end)');
           async.done();
         }, 50);
       }));

    it('should call onTurnStart and onTurnDone before and after each turn, respectively',
       inject([AsyncTestCompleter], (async) => {
         var completerA, completerB;

         macroTask(() => {
           _zone.run(() => {
             completerA = PromiseWrapper.completer();
             completerB = PromiseWrapper.completer();
             completerA.promise.then(_log.fn('a then'));
             completerB.promise.then(_log.fn('b then'));
             _log.add('run start');
           });
         });

         macroTask(() => { _zone.run(() => { completerA.resolve(null); }); }, 10);


         macroTask(() => { _zone.run(() => { completerB.resolve(null); }); }, 30);

         macroTask(() => {
           expect(_log.result())
               .toEqual(
                   // First VM turn
                   'onTurnStart; run start; onTurnDone; ' +
                   // Second VM turn
                   'onTurnStart; a then; onTurnDone; ' +
                   // Third VM turn
                   'onTurnStart; b then; onTurnDone');
           async.done();
         }, 60);
       }));

    it('should call onTurnStart and onTurnDone before and after (respectively) all turns in a chain',
       inject([AsyncTestCompleter], (async) => {
         macroTask(() => {
           _zone.run(() => {
             _log.add('run start');
             microTask(() => {
               _log.add('async1');
               microTask(_log.fn('async2'));
             });
             _log.add('run end');
           });
         });

         macroTask(() => {
           expect(_log.result())
               .toEqual('onTurnStart; run start; run end; async1; async2; onTurnDone');
           async.done();
         }, 50);
       }));

    it('should call onTurnStart and onTurnDone for promises created outside of run body',
       inject([AsyncTestCompleter], (async) => {
         var promise;

         macroTask(() => {
           _zone.runOutsideAngular(() => {
             promise = PromiseWrapper.resolve(4).then((x) => PromiseWrapper.resolve(x));
           });

           _zone.run(() => {
             promise.then(_log.fn('promise then'));
             _log.add('zone run');
           });
         });

         macroTask(() => {
           expect(_log.result())
               .toEqual('onTurnStart; zone run; onTurnDone; onTurnStart; promise then; onTurnDone');
           async.done();
         }, 50);
       }));
  });

  describe('exceptions', () => {
    it('should call the on error callback when it is defined',
       inject([AsyncTestCompleter], (async) => {
         macroTask(() => {
           _zone.initCallbacks({onErrorHandler: logError});

           var exception = new BaseException('sync');

           _zone.run(() => { throw exception; });

           expect(_errors.length).toBe(1);
           expect(_errors[0]).toBe(exception);
           async.done();
         });
       }));

    it('should call onError for errors from microtasks', inject([AsyncTestCompleter], (async) => {
         _zone.initCallbacks({onErrorHandler: logError});

         var exception = new BaseException('async');

         macroTask(() => { _zone.run(() => { microTask(() => { throw exception; }); }); });

         macroTask(() => {
           expect(_errors.length).toBe(1);
           expect(_errors[0]).toEqual(exception);
           async.done();
         }, 50);
       }));

    it('should call onError when onTurnDone throws and the zone is sync',
       inject([AsyncTestCompleter], (async) => {
         var exception = new BaseException('fromOnTurnDone');

         _zone.initCallbacks({onErrorHandler: logError, onTurnDone: () => { throw exception; }});

         macroTask(() => { _zone.run(() => {}); });

         macroTask(() => {
           expect(_errors.length).toBe(1);
           expect(_errors[0]).toEqual(exception);
           async.done();
         }, 50);
       }));

    it('should call onError when onTurnDone throws and the zone is async',
       inject([AsyncTestCompleter], (async) => {
         var asyncRan = false;

         var exception = new BaseException('fromOnTurnDone');

         _zone.initCallbacks({onErrorHandler: logError, onTurnDone: () => { throw exception; }});

         macroTask(() => { _zone.run(() => { microTask(() => { asyncRan = true; }); }); });

         macroTask(() => {
           expect(asyncRan).toBe(true);
           expect(_errors.length).toBe(1);
           expect(_errors[0]).toEqual(exception);
           async.done();
         }, 50);
       }));
  });
}
