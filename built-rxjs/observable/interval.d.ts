import { Subscriber } from '../Subscriber';
import { Scheduler } from '../Scheduler';
import { Observable } from '../Observable';
export declare class IntervalObservable<T> extends Observable<T> {
    private period;
    private scheduler;
    static create(period?: number, scheduler?: Scheduler): Observable<number>;
    static dispatch(state: any): void;
    constructor(period?: number, scheduler?: Scheduler);
    _subscribe(subscriber: Subscriber<T>): void;
}
