import {describe, ddescribe, it, iit, xit, xdescribe, expect, beforeEach} from 'angular2/test_lib';
import {Testability} from 'angular2/src/core/testability/testability';
import {NgZone} from 'angular2/src/core/zone/ng_zone';
import {normalizeBlank} from 'angular2/src/facade/lang';


class MockNgZone extends NgZone {
  _onTurnStart: () => void;
  _onEventDone: () => void;

  constructor() { super({enableLongStackTrace: false}); }

  start(): void { this._onTurnStart(); }

  finish(): void { this._onEventDone(); }

  overrideOnTurnStart(onTurnStartFn: Function): void {
    this._onTurnStart = normalizeBlank(onTurnStartFn);
  }

  overrideOnEventDone(onEventDoneFn: Function, waitForAsync: boolean = false): void {
    this._onEventDone = normalizeBlank(onEventDoneFn);
  }
}

export function main() {
  describe('Testability', () => {
    var testability, executed, ngZone;

    beforeEach(() => {
      ngZone = new MockNgZone();
      testability = new Testability(ngZone);
      executed = false;
    });

    describe('Pending count logic', () => {
      it('should start with a pending count of 0',
         () => { expect(testability.getPendingCount()).toEqual(0); });

      it('should fire whenstable callbacks if pending count is 0', () => {
        testability.whenStable(() => executed = true);
        expect(executed).toBe(true);
      });

      it('should not call whenstable callbacks when there are pending counts', () => {
        testability.increaseCount(2);
        testability.whenStable(() => executed = true);

        expect(executed).toBe(false);
        testability.decreaseCount(1);
        expect(executed).toBe(false);
      });

      it('should fire whenstable callbacks when pending drops to 0', () => {
        testability.increaseCount(2);
        testability.whenStable(() => executed = true);

        expect(executed).toBe(false);

        testability.decreaseCount(2);
        expect(executed).toBe(true);
      });
    });

    describe('NgZone callback logic', () => {
      it('should start being ready',
         () => { expect(testability.isAngularEventDone()).toEqual(true); });

      it('should fire whenstable callback if event is already finished', () => {
        ngZone.start();
        ngZone.finish();
        testability.whenStable(() => executed = true);

        expect(executed).toBe(true);
      });

      it('should fire whenstable callback when event finishes', () => {
        ngZone.start();
        testability.whenStable(() => executed = true);

        expect(executed).toBe(false);

        ngZone.finish();
        expect(executed).toBe(true);
      });

      it('should not fire whenstable callback when event did not finish', () => {
        ngZone.start();
        testability.increaseCount(2);
        testability.whenStable(() => executed = true);

        expect(executed).toBe(false);

        testability.decreaseCount(2);
        expect(executed).toBe(false);

        ngZone.finish();
        expect(executed).toBe(true);
      });

      it('should not fire whenstable callback when there are pending counts', () => {
        ngZone.start();
        testability.increaseCount(2);
        testability.whenStable(() => executed = true);

        expect(executed).toBe(false);

        ngZone.finish();
        expect(executed).toBe(false);

        testability.decreaseCount(1);
        expect(executed).toBe(false);

        testability.decreaseCount(1);
        expect(executed).toBe(true);
      });
    });
  });
}
