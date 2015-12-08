import { Subject } from '../Subject';
import { Observable } from '../Observable';
import { Subscription } from '../Subscription';
export declare class ConnectableObservable<T> extends Observable<T> {
    source: Observable<T>;
    protected subjectFactory: () => Subject<T>;
    subject: Subject<T>;
    subscription: Subscription<T>;
    constructor(source: Observable<T>, subjectFactory: () => Subject<T>);
    _subscribe(subscriber: any): Subscription<T>;
    _getSubject(): Subject<T>;
    connect(): Subscription<T>;
    refCount(): Observable<T>;
}
