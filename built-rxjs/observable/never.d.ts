import { Observable } from '../Observable';
import { Subscriber } from '../Subscriber';
export declare class InfiniteObservable<T> extends Observable<T> {
    static create<T>(): InfiniteObservable<{}>;
    constructor();
    _subscribe(subscriber: Subscriber<T>): void;
}
