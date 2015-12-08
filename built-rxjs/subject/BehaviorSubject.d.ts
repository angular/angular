import { Subject } from '../Subject';
import { Subscriber } from '../Subscriber';
import { Subscription } from '../Subscription';
export declare class BehaviorSubject<T> extends Subject<T> {
    private _value;
    private _hasError;
    private _err;
    constructor(_value: T);
    getValue(): T;
    value: T;
    _subscribe(subscriber: Subscriber<any>): Subscription<T>;
    _next(value: T): void;
    _error(err: any): void;
}
