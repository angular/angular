import { Scheduler } from '../Scheduler';
import { Operator } from '../Operator';
import { Subscriber } from '../Subscriber';
export declare class ObserveOnOperator<T, R> implements Operator<T, R> {
    private scheduler;
    private delay;
    constructor(scheduler: Scheduler, delay?: number);
    call(subscriber: Subscriber<T>): Subscriber<T>;
}
export declare class ObserveOnSubscriber<T> extends Subscriber<T> {
    private scheduler;
    private delay;
    static dispatch({notification, destination}: {
        notification: any;
        destination: any;
    }): void;
    constructor(destination: Subscriber<T>, scheduler: Scheduler, delay?: number);
    private scheduleMessage(notification);
    _next(value: T): void;
    _error(err: any): void;
    _complete(): void;
}
