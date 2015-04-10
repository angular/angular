import 'package:angular2/test_lib.dart' show
    AsyncTestCompleter,
    beforeEach,
    ddescribe,
    describe,
    expect,
    iit,
    inject,
    it,
    xdescribe,
    xit;

import 'package:angular2/test_lib.dart' show Log, once;
import 'package:angular2/src/facade/async.dart' show PromiseWrapper;
import 'package:angular2/src/facade/lang.dart' show BaseException;
import 'package:angular2/src/core/zone/vm_turn_zone.dart' show VmTurnZone;

import 'dart:async' show Future, Completer;

main() {
  ddescribe('all tests', () {

    describe('old tests', () {
      oldtests();
    });

    describe('new tests', () {
      newTests();
    });

  });

}

oldtests() {
  describe("VmTurnZone", () {
    var log;
    var zone;

    beforeEach(() {
      log = new Log();
      zone = new VmTurnZone(enableLongStackTrace: true);
      zone.initCallbacks(
          onTurnStart: log.fn('onTurnStart'), onTurnDone: log.fn('onTurnDone'));
    });

    describe("run", () {

      it('should not run onTurnStart and onTurnDone for nested Zone.run', () {
        zone.run(() {
          zone.run(log.fn('run'));
        });
        expect(log.result()).toEqual('onTurnStart; run; onTurnDone');
      });

      it('should call onTurnStart and onTurnDone before and after each top-level run', () {
        zone.run(log.fn('run1'));
        zone.run(log.fn('run2'));
        expect(log.result()).toEqual(
            'onTurnStart; run1; onTurnDone; onTurnStart; run2; onTurnDone');
      });

      it('should call onTurnStart and onTurnDone before and after each turn',
      inject([AsyncTestCompleter], (async) {
        var a = PromiseWrapper.completer();
        var b = PromiseWrapper.completer();
        zone.run(() {
          log.add('run start');
          a.promise.then((_) {
            return log.add('a then');
          });
          b.promise.then((_) {
            return log.add('b then');
          });
        });
        a.resolve("a");
        b.resolve("b");
        PromiseWrapper.all([a.promise, b.promise]).then((_) {
          expect(log.result()).toEqual(
              'onTurnStart; run start; onTurnDone; onTurnStart; a then; onTurnDone; onTurnStart; b then; onTurnDone');
          async.done();
        });
      }));
    });

    describe("runOutsideAngular", () {
      it("should run a function outside of the angular zone", () {
        zone.runOutsideAngular(log.fn('run'));
        expect(log.result()).toEqual('run');
      });
    });

    describe("exceptions", () {
      var trace;
      var exception;
      var saveStackTrace;
      beforeEach(() {
        trace = null;
        exception = null;
        saveStackTrace = (e, t) {
          exception = e;
          trace = t;
        };
      });

      it('should call the on error callback when it is defined', () {
        zone.initCallbacks(onErrorHandler: saveStackTrace);
        zone.run(() {
          throw new BaseException('aaa');
        });
        expect(exception).toBeDefined();
      });

      it('should rethrow exceptions from the body when no callback defined',
          () {
        expect(() {
          zone.run(() {
            throw new BaseException('bbb');
          });
        }).toThrowError('bbb');
      });

      it('should produce long stack traces', inject([AsyncTestCompleter],
          (async) {
        zone.initCallbacks(onErrorHandler: saveStackTrace);
        var c = PromiseWrapper.completer();
        zone.run(() {
          PromiseWrapper.setTimeout(() {
            PromiseWrapper.setTimeout(() {
              c.resolve(null);
              throw new BaseException('ccc');
            }, 0);
          }, 0);
        });
        c.promise.then((_) {
          expect(trace.length).toBeGreaterThan(1);
          async.done();
        });
      }));

      it('should produce long stack traces (when using promises)', inject(
          [AsyncTestCompleter], (async) {
            zone.initCallbacks(onErrorHandler: saveStackTrace);
            var c = PromiseWrapper.completer();
            zone.run(() {
              PromiseWrapper.resolve(null).then((_) {
                return PromiseWrapper.resolve(null).then((__) {
                  c.resolve(null);
                  throw new BaseException("ddd");
                });
              });
            });
            c.promise.then((_) {
              expect(trace.length).toBeGreaterThan(1);
              async.done();
            });
          }));

      it('should disable long stack traces', inject([AsyncTestCompleter],
          (async) {
        var zone = new VmTurnZone(enableLongStackTrace: false);
        zone.initCallbacks(onErrorHandler: saveStackTrace);
        var c = PromiseWrapper.completer();
        zone.run(() {
          PromiseWrapper.setTimeout(() {
            PromiseWrapper.setTimeout(() {
              c.resolve(null);
              throw new BaseException('ccc');
            }, 0);
          }, 0);
        });
        c.promise.then((_) {
          expect(trace.length).toEqual(1);
          async.done();
        });
      }));
    });
  });
}

// from https://github.com/angular/angular.dart/blob/master/test/core/zone_spec.dart
newTests() {
  var log;
  var zone;

  beforeEach(() {
    log = new Log();
    zone = new VmTurnZone(enableLongStackTrace: true);
    zone.initCallbacks(
        onTurnStart: log.fn('onTurnStart'),
        onTurnDone: log.fn('onTurnDone'));
  });

  describe('exceptions', () {
    // TODO(vicb): run() does not rethrow in ng2, check why
    xit('should rethrow exceptions from the body and call onError', () {
      var errors = [];
      zone.initCallbacks(onErrorHandler: (e, s) { errors.add(e); });

      expect(() {
        zone.run(() {
          throw 'hello';
        });
      }).toThrowWith(message: 'hello');

      expect(errors).toEqual(['hello']);
    });

    it('should call onError for errors from microtasks', (() {
      var errors = [];
      zone.initCallbacks(onErrorHandler: (e, s) { errors.add(e); });

      zone.run(() {
        new Future.value(null).then((_) {
          throw "async exception";
        });
      });

      expect(errors).toEqual(["async exception"]);
    }));

    // TODO(vicb)
    it('should rethrow exceptions from the onTurnDone and call onError when the zone is sync', () {
      var errors = [];
      zone.initCallbacks(
        onErrorHandler: (e, s) { errors.add(e); },
        onTurnDone: () { throw "fromOnTurnDone"; });

//      expect(() {
//        zone.run(() { });
//      }).toThrowWith(message: 'fromOnTurnDone');
      zone.run(() {});

      expect(errors).toEqual(["fromOnTurnDone"]);
    });

    it('should rethrow exceptions from the onTurnDone and call onError when the zone is async', () {
      var errors = [];
      var asyncRan = false;

      zone.initCallbacks(
        onErrorHandler: (e, s) { errors.add(e); },
        onTurnDone: () { throw "fromOnTurnDone"; });

//      expect(() {
//        zone.run(() {
//          new Future.value(null).then((_) {
//            asyncRan = true;
//          });
//        });
//      }).toThrowWith(message: 'fromOnTurnDone');

      zone.run(() {
        new Future.value(null).then((_) {
          asyncRan = true;
        });
      });


      expect(asyncRan).toBe(true);
      expect(errors).toEqual(["fromOnTurnDone"]);
    });


  });

  it('should call onTurnStart and onTurnDone', () {
    zone.run(log.fn('run'));
    expect(log.result()).toEqual('onTurnStart; run; onTurnDone');
  });

  it('should return the body return value from run', () {
    expect(zone.run(() {
      return 6;
    })).toEqual(6);
  });

  it('should call onTurnStart before executing a microtask scheduled in onTurnDone as well as '
      'onTurnDone after executing the task', (() {
    var ran = false;
    zone.initCallbacks(
      onTurnStart: log.fn('onTurnStart'),
      onTurnDone: () {
        log.add('onTurnDone(begin)');
        if (!ran) {
          new Future.value(null).then((_) {
            ran = true;
            log.add('executedMicrotask');});
        }

        log.add('onTurnDone(end)');
      });

    zone.run(() {
      log.add('run');
    });

    zone.run(() {
      expect(log.result()).toEqual(
          // First VM turn => 'run' macrotask
          'onTurnStart; run; onTurnDone(begin); onTurnDone(end); '
          // Second VM Turn => microtask enqueued from onTurnDone
          'onTurnStart; executedMicrotask; onTurnDone(begin); onTurnDone(end); '
          // Current VM Turn
          'onTurnStart'
      );
    });
  }));

  it('should call onTurnStart and onTurnDone for a scheduleMicrotask in onTurnDone triggered by '
     'a scheduleMicrotask in run', (() {
    var ran = false;
    zone.initCallbacks(
      onTurnStart: log.fn('onTurnStart'),
      onTurnDone: () {
        log.add('onTurnDone(begin)');
        if (!ran) {
          log.add('onTurnDone(scheduleMicrotask)');
          new Future.value(null).then((_) {
            ran = true;
            log.add('onTurnDone(executeMicrotask)');
          });
        }
        log.add('onTurnDone(end)');
      });

    zone.run(() {
      log.add('scheduleMicrotask');
      new Future.value(null).then((_) {
        log.add('run(executeMicrotask)');
      });
    });

    zone.run(() {
      expect(log.result()).toEqual(
          // First VM Turn => a macrotask + the microtask it enqueues
          'onTurnStart; scheduleMicrotask; run(executeMicrotask); onTurnDone(begin); onTurnDone(scheduleMicrotask); onTurnDone(end); '
          // Second VM Turn => the microtask enqueued from onTurnDone
          'onTurnStart; onTurnDone(executeMicrotask); onTurnDone(begin); onTurnDone(end); '
          // Current VM Turn
          'onTurnStart'
      );
    });
  }));

  it('should call onTurnStart once before a turn and onTurnDone once after the turn', (() {
    zone.run(() {
      log.add('run start');
      new Future.value(null).then((_) {
        log.add('async');
      });
      log.add('run end');
    });

    // The microtask (async) is executed after the macrotask (run)
    expect(log.result()).toEqual('onTurnStart; run start; run end; async; onTurnDone');
  }));

  // TODO(vicb)
  // Future.value is already tested as a way to enqueue microtasks (for JS compatibility)
  // Is testing chained future valuable ?
  // it('should work for Future.value as well', async((Logger log) {

  it('should execute futures scheduled in onTurnStart before Futures scheduled in run', (() {
    var doneFutureRan = false;
    var startFutureRan = false;

    zone.initCallbacks(
      onTurnStart: () {
        log.add('onTurnStart(begin)');
        if (!startFutureRan) {
          log.add('onTurnStart(scheduleFuture)');
          new Future.value(null).then((_) { log.add('onTurnStart(executeFuture)'); });
          startFutureRan = true;
        }
        log.add('onTurnStart(end)');
      },
      onTurnDone: () {
        log.add('onTurnDone(begin)');
        if (!doneFutureRan) {
          log.add('onTurnDone(scheduleFuture)');
          new Future.value(null).then((_) { log.add('onTurnDone(executeFuture)'); });
          doneFutureRan = true;
        }
        log.add('onTurnDone(end)');
    });

    zone.run(() {
      log.add('run start');
      new Future.value(null)
      .then((_) {
        log.add('future then');
        new Future.value(null)
        .then((_) { log.add('future foo'); });
        return new Future.value(null);
      })
      .then((_) {
        log.add('future bar');
      });
      log.add('run end');
    });

    zone.run(() {
      expect(log.result()).toEqual(
          // First VM turn: enqueue a microtask in onTurnStart
          'onTurnStart(begin); onTurnStart(scheduleFuture); onTurnStart(end); '
          // First VM turn: execute the macrotask which enqueues microtasks
          'run start; run end; '
          // First VM turn: execute enqueued microtasks
          'onTurnStart(executeFuture); future then; future foo; future bar; '
          // First VM turn: onTurnEnd, enqueue a microtask
          'onTurnDone(begin); onTurnDone(scheduleFuture); onTurnDone(end); '
          // Second VM turn: execute the microtask from onTurnEnd
          'onTurnStart(begin); onTurnStart(end); onTurnDone(executeFuture); onTurnDone(begin); onTurnDone(end); '
          // Current VM turn
          'onTurnStart(begin); onTurnStart(end)'
      );
    });
  }));

  it('should call onTurnStart and onTurnDone before and after each turn, respectively', (() {
    Completer a, b;
    zone.run(() {
      a = new Completer();
      b = new Completer();
      a.future.then((_) => log.add('a then'));
      b.future.then((_) => log.add('b then'));
      log.add('run start');
    });

    zone.run(() {
      a.complete(null);
    });

    zone.run(() {
      b.complete(null);
    });

    zone.run(() {
      expect(log.result()).toEqual(
          // First VM turn
          'onTurnStart; run start; onTurnDone; '
          // Second VM turn
          'onTurnStart; a then; onTurnDone; '
          // Third VM turn
          'onTurnStart; b then; onTurnDone; '
          // Current VM turn
          'onTurnStart');
    });
  }));

  it('should call onTurnStart and onTurnDone before and after (respectively) all turns in a chain', (() {
    zone.run(() {
      log.add('run start');
      new Future.value(null).then((_) {
        log.add('async1');
        new Future.value(null).then((_) {
          log.add('async2');
        });
      });
      log.add('run end');
    });

    zone.run(() {
      expect(log.result()).toEqual(
          // First VM turn
          'onTurnStart; run start; run end; async1; async2; onTurnDone; '
          // Current VM turn
          'onTurnStart');
    });
  }));

  it('should call onTurnStart and onTurnDone for futures created outside of run body', inject(
          [AsyncTestCompleter], (async) {
    var turn = 0;
    var future = new Future.value(4).then((x) => new Future.value(x));

    zone.initCallbacks(
      onTurnStart: log.fn('onTurnStart'),
      onTurnDone: () {
        turn++;
        log.add('onTurnDone');
        if (turn == 2) {
          expect(log.result()).toEqual(
              'onTurnStart; zone run; onTurnDone; '
              'onTurnStart; future then; onTurnDone');
          async.done();
        }
      });

    zone.run(() {
      future.then((_) {
        log.add('future then');
      });
      log.add('zone run');
    });
  }));

  it('should call onTurnDone even if there was an exception in body', (() {
    zone.initCallbacks(
      onTurnStart: log.fn('onTurnStart'),
      onTurnDone: log.fn('onTurnDone'),
      onErrorHandler: (e, s) { log.add('onError'); }
    );

//    expect(() => zone.run(() {
//      log.add('zone run');
//      throw 'zoneError';
//    })).toThrowError('zoneError');

    // TODO(vicb): ng.dart rethrow the error while ng2 doesn't
    // is that something that we want ?
    // check with vics
    zone.run(() {
      log.add('zone run');
      throw 'zoneError';
    });

    expect(log.result()).toEqual('onTurnStart; zone run; onError; onTurnDone');
  }));

  it('should call onTurnDone even if there was an exception in onTurnStart', (() {

    zone.initCallbacks(
      onTurnStart: () { log.add('onTurnStart'); throw 'zoneError';},
      onTurnDone: log.fn('onTurnDone'),
      onErrorHandler: (e, s) { log.add('onError'); }
    );

    // TODO(vicb): see above
//    expect(() => zone.run(() {
//      log('zone run');
//    })).toThrowWith(message: 'zoneError');

    zone.run(() {
      log('zone run');
    });

    expect(log.result()).toEqual('onTurnStart; onError; onTurnDone');
  }));

  it('should call onTurnDone even if there was an exception in scheduleMicrotask', (() {
    zone.initCallbacks(
      onTurnStart: log.fn('onTurnStart'),
      onTurnDone: log.fn('onTurnDone'),
      onErrorHandler: (e, s) { log.add('onError'); }
    );

    zone.run(() {
      log.add('zone run');
      new Future.value(null).then((_) {
        log('scheduleMicrotask');
        throw new Error();
      });
    });

    zone.run(() {
      expect(log.result()).toEqual('onTurnStart; zone run; scheduleMicrotask; onError; onTurnDone');
    });
  }));


}
