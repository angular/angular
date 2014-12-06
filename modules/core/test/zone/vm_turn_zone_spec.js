import {describe, ddescribe, it, iit, xit, xdescribe, expect, beforeEach, async, tick} from 'test_lib/test_lib';
import {Log, once} from 'test_lib/utils';
import {PromiseWrapper} from 'facade/async';
import {BaseException} from 'facade/lang';
import {VmTurnZone} from 'core/zone/vm_turn_zone';

export function main() {
  describe("VmTurnZone", () => {
    var log, zone;

    beforeEach(() => {
      log = new Log();
      zone = new VmTurnZone();
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


      it('should call onTurnStart and onTurnDone before and after each turn', (done) => {
        var a = PromiseWrapper.completer();
        var b = PromiseWrapper.completer();

        zone.run(() => {
          log.add('run start');
          a.promise.then((_) => log.add('a then'));
          b.promise.then((_) => log.add('b then'));
        });

        a.complete("a");
        b.complete("b");

        PromiseWrapper.all([a.promise, b.promise]).then((_) => {
          expect(log.result()).toEqual('onTurnStart; run start; onTurnDone; onTurnStart; a then; onTurnDone; onTurnStart; b then; onTurnDone');
          done();
        });
      });
    });

    describe("runOutsideAngular", () => {
      it("should run a function outside of the angular zone", () => {
        zone.runOutsideAngular(log.fn('run'));

        expect(log.result()).toEqual('run');
      });
    });

    describe("exceptions", () => {
      it('should rethrow exceptions from the body', () => {
        expect(() => {
          zone.run(() => {
            throw new BaseException('hello');
          });
        }).toThrowError('hello');
      });
    });
  });
}
