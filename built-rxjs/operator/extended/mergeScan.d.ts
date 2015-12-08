import { Operator } from '../../Operator';
import { Observable } from '../../Observable';
import { Subscriber } from '../../Subscriber';
import { Subscription } from '../../Subscription';
import { OuterSubscriber } from '../../OuterSubscriber';
export declare function mergeScan<T, R>(project: (acc: R, x: T) => Observable<R>, seed: R, concurrent?: number): any;
export declare class MergeScanOperator<T, R> implements Operator<T, R> {
    private project;
    private seed;
    private concurrent;
    constructor(project: (acc: R, x: T) => Observable<R>, seed: R, concurrent: number);
    call(subscriber: Subscriber<R>): Subscriber<T>;
}
export declare class MergeScanSubscriber<T, R> extends OuterSubscriber<T, R> {
    private project;
    private acc;
    private concurrent;
    private hasValue;
    private hasCompleted;
    private buffer;
    private active;
    protected index: number;
    constructor(destination: Subscriber<R>, project: (acc: R, x: T) => Observable<R>, acc: R, concurrent: number);
    _next(value: any): void;
    _innerSub(ish: any, value: T, index: number): void;
    _complete(): void;
    notifyNext(outerValue: T, innerValue: R, outerIndex: number, innerIndex: number): void;
    notifyComplete(innerSub: Subscription<T>): void;
}
