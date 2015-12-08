import { Scheduler } from '../Scheduler';
import { Observable } from '../Observable';
export declare class TimerObservable<T> extends Observable<T> {
    private period;
    private scheduler;
    static create(dueTime?: number | Date, period?: number | Scheduler, scheduler?: Scheduler): Observable<number>;
    static dispatch(state: any): void;
    _period: number;
    private dueTime;
    constructor(dueTime?: number | Date, period?: number | Scheduler, scheduler?: Scheduler);
    _subscribe(subscriber: any): void;
}
