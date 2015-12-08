import { Observer } from './Observer';
import { Observable } from './Observable';
export declare class Notification<T> {
    kind: string;
    value: T;
    exception: any;
    hasValue: boolean;
    constructor(kind: string, value?: T, exception?: any);
    observe(observer: Observer<T>): any;
    do(next: (value: T) => void, error?: (err: any) => void, complete?: () => void): any;
    accept(nextOrObserver: Observer<T> | ((value: T) => void), error?: (err: any) => void, complete?: () => void): any;
    toObservable(): Observable<T>;
    private static completeNotification;
    private static undefinedValueNotification;
    static createNext<T>(value: T): Notification<T>;
    static createError<T>(err?: any): Notification<T>;
    static createComplete(): Notification<any>;
}
