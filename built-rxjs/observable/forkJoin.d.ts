import { Observable } from '../Observable';
import { Subscriber } from '../Subscriber';
export declare class ForkJoinObservable<T> extends Observable<T> {
    private sources;
    private resultSelector;
    constructor(sources: Array<Observable<any> | Promise<any>>, resultSelector?: (...values: Array<any>) => any);
    static create(...sources: Array<Observable<any> | Array<Observable<any>> | Promise<any> | ((...values: Array<any>) => any)>): Observable<any>;
    _subscribe(subscriber: Subscriber<any>): void;
}
