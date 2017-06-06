import { NgZone } from 'angular2/core';
import { PlatformLocation } from 'angular2/platform/common';
import { WebWorkerPlatformLocation } from './platform_location';
export declare var WORKER_APP_ROUTER: (any[] | {
    provide: typeof PlatformLocation;
    useClass: typeof WebWorkerPlatformLocation;
} | {
    provide: any;
    useFactory: (platformLocation: WebWorkerPlatformLocation, zone: NgZone) => () => Promise<boolean>;
    multi: boolean;
    deps: (typeof PlatformLocation | typeof NgZone)[];
})[];
