import { Operator } from '../../Operator';
import { Observable } from '../../Observable';
import { Subscriber } from '../../Subscriber';
export declare class FindValueOperator<T, R> implements Operator<T, R> {
    private predicate;
    private source;
    private yieldIndex;
    private thisArg;
    constructor(predicate: (value: T, index: number, source: Observable<T>) => boolean, source: Observable<T>, yieldIndex: boolean, thisArg?: any);
    call(observer: Subscriber<T>): Subscriber<T>;
}
export declare class FindValueSubscriber<T> extends Subscriber<T> {
    private source;
    private yieldIndex;
    private thisArg;
    private predicate;
    private index;
    constructor(destination: Subscriber<T>, predicate: (value: T, index: number, source: Observable<T>) => boolean, source: Observable<T>, yieldIndex: boolean, thisArg?: any);
    private notifyComplete(value);
    _next(value: T): void;
    _complete(): void;
}
