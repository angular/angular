import {Injectable} from 'angular2/src/core/di';
import {NgZone} from 'angular2/src/core/zone/ng_zone';
import {EventEmitter, ObservableWrapper} from 'angular2/src/facade/async';

/**
 * A mock implementation of {@link NgZone}.
 */
@Injectable()
export class MockNgZone extends NgZone {
  /** @internal */
  _mockOnEventDone: EventEmitter<any>;

  constructor() {
    super({enableLongStackTrace: false});
    this._mockOnEventDone = new EventEmitter<any>(false);
  }

  get onEventDone() { return this._mockOnEventDone; }

  run(fn: Function): any { return fn(); }

  runOutsideAngular(fn: Function): any { return fn(); }

  simulateZoneExit(): void { ObservableWrapper.callNext(this.onEventDone, null); }
}
