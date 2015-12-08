import { Operator } from '../Operator';
import { Observer } from '../Observer';
import { Subscription } from '../Subscription';
import { OuterSubscriber } from '../OuterSubscriber';
export declare class MergeAllOperator<T, R> implements Operator<T, R> {
    private concurrent;
    constructor(concurrent: number);
    call(observer: Observer<T>): MergeAllSubscriber<T, {}>;
}
export declare class MergeAllSubscriber<T, R> extends OuterSubscriber<T, R> {
    private concurrent;
    private hasCompleted;
    private buffer;
    private active;
    constructor(destination: Observer<T>, concurrent: number);
    _next(observable: any): void;
    _complete(): void;
    notifyComplete(innerSub: Subscription<T>): void;
}
