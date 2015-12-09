import { Operator } from '../Operator';
import { Subscriber } from '../Subscriber';
export declare class ReduceOperator<T, R> implements Operator<T, R> {
    private project;
    private seed;
    constructor(project: (acc: R, x: T) => R, seed?: R);
    call(subscriber: Subscriber<T>): Subscriber<T>;
}
export declare class ReduceSubscriber<T, R> extends Subscriber<T> {
    acc: R;
    hasSeed: boolean;
    hasValue: boolean;
    project: (acc: R, x: T) => R;
    constructor(destination: Subscriber<T>, project: (acc: R, x: T) => R, seed?: R);
    _next(x: any): void;
    _complete(): void;
}
