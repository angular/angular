import { Scheduler } from '../Scheduler';
import { Observable } from '../Observable';
export declare class IteratorObservable<T> extends Observable<T> {
    private project;
    private thisArg;
    private scheduler;
    private iterator;
    static create<T>(iterator: any, project?: (x?: any, i?: number) => T, thisArg?: any, scheduler?: Scheduler): IteratorObservable<T>;
    static dispatch(state: any): void;
    constructor(iterator: any, project?: (x?: any, i?: number) => T, thisArg?: any, scheduler?: Scheduler);
    _subscribe(subscriber: any): void;
}
