import { Scheduler } from '../Scheduler';
import { Observable } from '../Observable';
export declare class EmptyObservable<T> extends Observable<T> {
    private scheduler;
    static create<T>(scheduler?: Scheduler): Observable<T>;
    static dispatch({subscriber}: {
        subscriber: any;
    }): void;
    constructor(scheduler?: Scheduler);
    _subscribe(subscriber: any): void;
}
