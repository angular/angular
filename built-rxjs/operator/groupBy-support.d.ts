import { Subscription } from '../Subscription';
import { Subject } from '../Subject';
import { Subscriber } from '../Subscriber';
import { Observable } from '../Observable';
export declare class RefCountSubscription<T> extends Subscription<T> {
    primary: Subscription<T>;
    attemptedToUnsubscribePrimary: boolean;
    count: number;
    constructor();
    setPrimary(subscription: Subscription<T>): void;
    unsubscribe(): void;
}
export declare class GroupedObservable<T> extends Observable<T> {
    key: string;
    private groupSubject;
    private refCountSubscription;
    constructor(key: string, groupSubject: Subject<T>, refCountSubscription?: RefCountSubscription<T>);
    _subscribe(subscriber: Subscriber<T>): Subscription<{}>;
}
export declare class InnerRefCountSubscription<T> extends Subscription<T> {
    private parent;
    constructor(parent: RefCountSubscription<T>);
    unsubscribe(): void;
}
