import { Subscriber } from './Subscriber';
import { OuterSubscriber } from './OuterSubscriber';
export declare class InnerSubscriber<T, R> extends Subscriber<R> {
    private parent;
    private outerValue;
    private outerIndex;
    index: number;
    constructor(parent: OuterSubscriber<T, R>, outerValue: T, outerIndex: number);
    _next(value: R): void;
    _error(error: any): void;
    _complete(): void;
}
