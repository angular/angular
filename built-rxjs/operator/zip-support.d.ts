import { Operator } from '../Operator';
import { Subscriber } from '../Subscriber';
export declare class ZipOperator<T, R> implements Operator<T, R> {
    project: (...values: Array<any>) => R;
    constructor(project?: (...values: Array<any>) => R);
    call(subscriber: Subscriber<R>): Subscriber<T>;
}
export declare class ZipSubscriber<T, R> extends Subscriber<T> {
    private index;
    private values;
    private project;
    private iterators;
    private active;
    constructor(destination: Subscriber<R>, project?: (...values: Array<any>) => R, values?: any);
    _next(value: any): void;
    _complete(): void;
    notifyInactive(): void;
    checkIterators(): void;
}
