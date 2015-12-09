import { Scheduler } from '../Scheduler';
import { Observable } from '../Observable';
export declare class ErrorObservable<T> extends Observable<T> {
    error: T;
    private scheduler;
    static create<T>(error: T, scheduler?: Scheduler): ErrorObservable<T>;
    static dispatch({error, subscriber}: {
        error: any;
        subscriber: any;
    }): void;
    constructor(error: T, scheduler?: Scheduler);
    _subscribe(subscriber: any): void;
}
