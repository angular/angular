import { NgZone } from 'angular2/src/core/zone/ng_zone';
export declare class MockNgZone extends NgZone {
    constructor();
    run(fn: Function): any;
    runOutsideAngular(fn: Function): any;
    overrideOnEventDone(fn: () => void, opt_waitForAsync?: boolean): void;
    simulateZoneExit(): void;
}
