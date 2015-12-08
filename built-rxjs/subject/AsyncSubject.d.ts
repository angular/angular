import { Subject } from '../Subject';
import { Subscriber } from '../Subscriber';
import { Subscription } from '../Subscription';
export declare class AsyncSubject<T> extends Subject<T> {
    _value: T;
    _hasNext: boolean;
    _isScalar: boolean;
    constructor();
    _subscribe(subscriber: Subscriber<any>): Subscription<T>;
    _next(value: T): void;
    _complete(): void;
}
