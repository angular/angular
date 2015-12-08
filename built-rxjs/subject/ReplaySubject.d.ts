import { Subject } from '../Subject';
import { Scheduler } from '../Scheduler';
import { Subscriber } from '../Subscriber';
import { Subscription } from '../Subscription';
export declare class ReplaySubject<T> extends Subject<T> {
    private bufferSize;
    private _windowTime;
    private scheduler;
    private events;
    constructor(bufferSize?: number, windowTime?: number, scheduler?: Scheduler);
    _next(value: T): void;
    _subscribe(subscriber: Subscriber<any>): Subscription<T>;
    private _getNow();
    private _trimBufferThenGetEvents(now);
}
