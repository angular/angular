import { Observable } from '../Observable';
import { Subscriber } from '../Subscriber';
import { Subscription } from '../Subscription';
import { Scheduler } from '../Scheduler';
import { AsyncSubject } from '../subject/AsyncSubject';
export declare class BoundCallbackObservable<T> extends Observable<T> {
    private callbackFunc;
    private selector;
    private args;
    scheduler: Scheduler;
    subject: AsyncSubject<T>;
    static create<T>(callbackFunc: Function, selector?: Function, scheduler?: Scheduler): Function;
    constructor(callbackFunc: Function, selector: any, args: any[], scheduler: Scheduler);
    _subscribe(subscriber: Subscriber<T | T[]>): Subscription<T>;
}
