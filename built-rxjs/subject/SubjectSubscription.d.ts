import { Subject } from '../Subject';
import { Subscription } from '../Subscription';
import { Observer } from '../Observer';
export declare class SubjectSubscription<T> extends Subscription<T> {
    subject: Subject<T>;
    observer: Observer<any>;
    isUnsubscribed: boolean;
    constructor(subject: Subject<T>, observer: Observer<any>);
    unsubscribe(): void;
}
