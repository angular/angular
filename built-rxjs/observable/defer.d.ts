import { Observable } from '../Observable';
import { Subscriber } from '../Subscriber';
export declare class DeferObservable<T> extends Observable<T> {
    private observableFactory;
    static create<T>(observableFactory: () => Observable<T>): Observable<T>;
    constructor(observableFactory: () => Observable<T>);
    _subscribe(subscriber: Subscriber<T>): void;
}
