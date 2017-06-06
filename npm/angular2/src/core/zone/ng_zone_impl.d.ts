/**
 * Stores error information; delivered via [NgZone.onError] stream.
 */
export declare class NgZoneError {
    error: any;
    stackTrace: any;
    constructor(error: any, stackTrace: any);
}
export declare class NgZoneImpl {
    static isInAngularZone(): boolean;
    private onEnter;
    private onLeave;
    private setMicrotask;
    private setMacrotask;
    private onError;
    constructor({trace, onEnter, onLeave, setMicrotask, setMacrotask, onError}: {
        trace: boolean;
        onEnter: () => void;
        onLeave: () => void;
        setMicrotask: (hasMicrotasks: boolean) => void;
        setMacrotask: (hasMacrotasks: boolean) => void;
        onError: (error: NgZoneError) => void;
    });
    runInner(fn: () => any): any;
    runInnerGuarded(fn: () => any): any;
    runOuter(fn: () => any): any;
}
