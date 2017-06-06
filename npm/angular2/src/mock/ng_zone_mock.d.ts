import { NgZone } from 'angular2/src/core/zone/ng_zone';
import { EventEmitter } from 'angular2/src/facade/async';
/**
 * A mock implementation of {@link NgZone}.
 */
export declare class MockNgZone extends NgZone {
    constructor();
    onStable: EventEmitter<any>;
    run(fn: Function): any;
    runOutsideAngular(fn: Function): any;
    simulateZoneExit(): void;
}
