import {Injectable} from 'angular2/src/core/di';
import {NgZone} from 'angular2/src/core/zone/ng_zone';
import {EventEmitter, ObservableWrapper} from 'angular2/src/facade/async';

/**
 * A mock implementation of {@link NgZone}.
 */
@Injectable()
export class MockNgZone extends NgZone {
  /** @internal */
  private _mockOnStable: EventEmitter<any> = new EventEmitter(false);
  private _mockOnMicrotaskEmpty: EventEmitter<any> = new EventEmitter(false);

  constructor() { super({enableLongStackTrace: false}); }

  get onStable() { return this._mockOnStable; }

  get onMicrotaskEmpty() { return this._mockOnMicrotaskEmpty; }

  run(fn: Function): any { return fn(); }

  runOutsideAngular(fn: Function): any { return fn(); }

  simulateZoneExit(): void { ObservableWrapper.callNext(this.onStable, null); }

  simulateMicrotaskEmpty(): void { ObservableWrapper.callNext(this.onMicrotaskEmpty, null); }
}
