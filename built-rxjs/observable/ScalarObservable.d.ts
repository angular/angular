import { Scheduler } from '../Scheduler';
import { Observable } from '../Observable';
import { Subscriber } from '../Subscriber';
export declare class ScalarObservable<T> extends Observable<T> {
    value: T;
    private scheduler;
    static create<T>(value: T, scheduler?: Scheduler): ScalarObservable<T>;
    static dispatch(state: any): void;
    _isScalar: boolean;
    constructor(value: T, scheduler?: Scheduler);
    _subscribe(subscriber: Subscriber<T>): void;
}
