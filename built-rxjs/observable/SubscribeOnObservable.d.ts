import { Scheduler } from '../Scheduler';
import { Subscriber } from '../Subscriber';
import { Subscription } from '../Subscription';
import { Observable } from '../Observable';
export declare class SubscribeOnObservable<T> extends Observable<T> {
    source: Observable<T>;
    private delayTime;
    private scheduler;
    static create<T>(source: Observable<T>, delay?: number, scheduler?: Scheduler): Observable<T>;
    static dispatch<T>({source, subscriber}: {
        source: any;
        subscriber: any;
    }): Subscription<T>;
    constructor(source: Observable<T>, delayTime?: number, scheduler?: Scheduler);
    _subscribe(subscriber: Subscriber<T>): void;
}
