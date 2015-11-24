import { NgZone } from 'angular2/src/core/zone/ng_zone';
export class MockNgZone extends NgZone {
    constructor() {
        super({ enableLongStackTrace: false });
    }
    run(fn) { return fn(); }
    runOutsideAngular(fn) { return fn(); }
    overrideOnEventDone(fn, opt_waitForAsync = false) {
        this._onEventDone = fn;
    }
    simulateZoneExit() { this._onEventDone(); }
}
//# sourceMappingURL=ng_zone_mock.js.map