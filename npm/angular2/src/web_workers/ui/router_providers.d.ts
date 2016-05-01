import { MessageBasedPlatformLocation } from './platform_location';
import { BrowserPlatformLocation } from 'angular2/src/platform/browser/location/browser_platform_location';
import { Injector } from 'angular2/core';
export declare const WORKER_RENDER_ROUTER: (typeof MessageBasedPlatformLocation | typeof BrowserPlatformLocation | {
    provide: any;
    useFactory: (injector: Injector) => () => void;
    multi: boolean;
    deps: typeof Injector[];
})[];
