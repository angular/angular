import { NgZone } from 'angular2/src/core/zone/ng_zone';
import { EventEmitter, ObservableWrapper } from 'angular2/src/facade/async';
export class MockNgZone extends NgZone {
    constructor() {
        super({ enableLongStackTrace: false });
        this._mockOnEventDone = new EventEmitter(false);
    }
    get onEventDone() { return this._mockOnEventDone; }
    run(fn) { return fn(); }
    runOutsideAngular(fn) { return fn(); }
    simulateZoneExit() { ObservableWrapper.callNext(this.onEventDone, null); }
}
