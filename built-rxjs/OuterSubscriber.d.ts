import { InnerSubscriber } from './InnerSubscriber';
import { Subscriber } from './Subscriber';
export declare class OuterSubscriber<T, R> extends Subscriber<T> {
    notifyComplete(inner?: InnerSubscriber<T, R>): void;
    notifyNext(outerValue: T, innerValue: R, outerIndex: number, innerIndex: number): void;
    notifyError(error?: any, inner?: InnerSubscriber<T, R>): void;
}
