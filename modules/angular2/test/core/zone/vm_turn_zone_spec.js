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
} from 'angular2/test_lib';
import {Log, once} from 'angular2/test_lib';
import {PromiseWrapper} from 'angular2/src/facade/async';
import {BaseException} from 'angular2/src/facade/lang';
import {VmTurnZone} from 'angular2/src/core/zone/vm_turn_zone';

export function main() {
  describe("VmTurnZone", () => {
    var log, zone;

    beforeEach(() => {
      log = new Log();
      zone = new VmTurnZone({enableLongStackTrace: true});
      zone.initCallbacks({
        onTurnStart: log.fn('onTurnStart'),
        onTurnDone: log.fn('onTurnDone')
      });
    });

    describe("run", () => {
      it('should call onTurnStart and onTurnDone', () => {
        zone.run(log.fn('run'));

        expect(log.result()).toEqual('onTurnStart; run; onTurnDone');
      });

      it('should return the body return value from run', () => {
        expect(zone.run(() => 6)).toEqual(6);
      });

      it('should not run onTurnStart and onTurnDone for nested Zone.run', () => {
        zone.run(() => {
          zone.run(log.fn('run'));
        });
        expect(log.result()).toEqual('onTurnStart; run; onTurnDone');
      });


      it('should call onTurnStart and onTurnDone before and after each top-level run', () => {
        zone.run(log.fn('run1'));
        zone.run(log.fn('run2'));

        expect(log.result()).toEqual('onTurnStart; run1; onTurnDone; onTurnStart; run2; onTurnDone');
      });


      it('should call onTurnStart and onTurnDone before and after each turn', inject([AsyncTestCompleter], (async) => {
        var a = PromiseWrapper.completer();
        var b = PromiseWrapper.completer();

        zone.run(() => {
          log.add('run start');
          a.promise.then((_) => log.add('a then'));
          b.promise.then((_) => log.add('b then'));
        });

        a.resolve("a");
        b.resolve("b");

        PromiseWrapper.all([a.promise, b.promise]).then((_) => {
          expect(log.result()).toEqual('onTurnStart; run start; onTurnDone; onTurnStart; a then; onTurnDone; onTurnStart; b then; onTurnDone');
          async.done();
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
      var trace, exception, saveStackTrace;
      beforeEach(() => {
        trace = null;
        exception = null;
        saveStackTrace = (e, t) => {
          exception = e;
          trace = t;
        };
      });

      it('should call the on error callback when it is defined', () => {
        zone.initCallbacks({onErrorHandler: saveStackTrace});

        zone.run(() => {
          throw new BaseException('aaa');
        });

        expect(exception).toBeDefined();
      });

      it('should rethrow exceptions from the body when no callback defined', () => {
        expect(() => {
          zone.run(() => {
            throw new BaseException('bbb');
          });
        }).toThrowError('bbb');
      });

      it('should produce long stack traces', inject([AsyncTestCompleter], (async) => {
        zone.initCallbacks({onErrorHandler: saveStackTrace});

        var c = PromiseWrapper.completer();

        zone.run(function () {
          PromiseWrapper.setTimeout(function () {
            PromiseWrapper.setTimeout(function () {
              c.resolve(null);
              throw new BaseException('ccc');
            }, 0);
          }, 0);
        });

        c.promise.then((_) => {
          // then number of traces for JS and Dart is different
          expect(trace.length).toBeGreaterThan(1);
          async.done();
        });
      }));

      it('should produce long stack traces (when using promises)', inject([AsyncTestCompleter], (async) => {
        zone.initCallbacks({onErrorHandler: saveStackTrace});

        var c = PromiseWrapper.completer();

        zone.run(function () {
          PromiseWrapper.resolve(null).then((_) => {
            return PromiseWrapper.resolve(null).then((__) => {
              c.resolve(null);
              throw new BaseException("ddd");
            });
          });
        });

        c.promise.then((_) => {
          // then number of traces for JS and Dart is different
          expect(trace.length).toBeGreaterThan(1);
          async.done();
        });
      }));

      it('should disable long stack traces', inject([AsyncTestCompleter], (async) => {
        var zone = new VmTurnZone({enableLongStackTrace: false});
        zone.initCallbacks({onErrorHandler: saveStackTrace});

        var c = PromiseWrapper.completer();

        zone.run(function () {
          PromiseWrapper.setTimeout(function () {
            PromiseWrapper.setTimeout(function () {
              c.resolve(null);
              throw new BaseException('ccc');
            }, 0);
          }, 0);
        });

        c.promise.then((_) => {
          expect(trace.length).toEqual(1);
          async.done();
        });
      }));
    });
  });
}
