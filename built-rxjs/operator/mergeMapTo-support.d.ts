import { Operator } from '../Operator';
import { Observer } from '../Observer';
import { Subscriber } from '../Subscriber';
import { OuterSubscriber } from '../OuterSubscriber';
import { InnerSubscriber } from '../InnerSubscriber';
export declare class MergeMapToOperator<T, R, R2> implements Operator<T, R> {
    private ish;
    private resultSelector;
    private concurrent;
    constructor(ish: any, resultSelector?: (outerValue: T, innerValue: R, outerIndex: number, innerIndex: number) => R2, concurrent?: number);
    call(observer: Subscriber<R>): Subscriber<T>;
}
export declare class MergeMapToSubscriber<T, R, R2> extends OuterSubscriber<T, R> {
    private ish;
    private resultSelector;
    private concurrent;
    private hasCompleted;
    private buffer;
    private active;
    protected index: number;
    constructor(destination: Subscriber<R>, ish: any, resultSelector?: (outerValue: T, innerValue: R, outerIndex: number, innerIndex: number) => R2, concurrent?: number);
    _next(value: any): void;
    _innerSub(ish: any, destination: Observer<R>, resultSelector: (outerValue: T, innerValue: R, outerIndex: number, innerIndex: number) => R2, value: T, index: number): void;
    _complete(): void;
    notifyNext(outerValue: T, innerValue: R, outerIndex: number, innerIndex: number): void;
    notifyError(err: any): void;
    notifyComplete(innerSub: InnerSubscriber<T, R>): void;
}
