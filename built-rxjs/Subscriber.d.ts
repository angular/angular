import { Observer } from './Observer';
import { Subscription } from './Subscription';
export declare class Subscriber<T> extends Subscription<T> implements Observer<T> {
    protected destination: Observer<any>;
    protected _subscription: Subscription<T>;
    protected _isUnsubscribed: boolean;
    isUnsubscribed: boolean;
    static create<T>(next?: (x?: T) => void, error?: (e?: any) => void, complete?: () => void): Subscriber<T>;
    constructor(destination?: Observer<any>);
    add(sub: Subscription<T> | Function | void): void;
    remove(sub: Subscription<T>): void;
    unsubscribe(): void;
    _next(value: T): void;
    _error(err: any): void;
    _complete(): void;
    next(value?: T): void;
    error(err?: any): void;
    complete(): void;
}
