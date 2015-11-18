import {NgZone} from 'angular2/src/core/zone/ng_zone';

export class MockNgZone extends NgZone {
  /** @internal */
  _onEventDone: () => void;

  constructor() { super({enableLongStackTrace: false}); }

  run(fn: Function): any { return fn(); }

  runOutsideAngular(fn: Function): any { return fn(); }

  overrideOnEventDone(fn: () => void, opt_waitForAsync: boolean = false): void {
    this._onEventDone = fn;
  }

  simulateZoneExit(): void { this._onEventDone(); }
}
