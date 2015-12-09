import { Operator } from './Operator';
import { Observer } from './Observer';
import { Observable } from './Observable';
import { Subscriber } from './Subscriber';
import { Subscription } from './Subscription';
export declare class Subject<T> extends Observable<T> implements Observer<T>, Subscription<T> {
    _subscriptions: Subscription<T>[];
    _unsubscribe: () => void;
    static create<T>(source: Observable<T>, destination: Observer<T>): Subject<T>;
    protected destination: Observer<T>;
    observers: Observer<T>[];
    isUnsubscribed: boolean;
    dispatching: boolean;
    errorSignal: boolean;
    errorInstance: any;
    completeSignal: boolean;
    lift<T, R>(operator: Operator<T, R>): Observable<T>;
    _subscribe(subscriber: Subscriber<any>): Subscription<T>;
    add(subscription?: any): void;
    remove(subscription?: any): void;
    unsubscribe(): void;
    next(value: T): void;
    error(err?: any): void;
    complete(): void;
    _next(value: T): void;
    _error(err: any): void;
    _complete(): void;
}
