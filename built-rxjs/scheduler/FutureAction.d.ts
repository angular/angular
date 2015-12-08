import { Subscription } from '../Subscription';
import { QueueScheduler } from './QueueScheduler';
import { Action } from './Action';
import { QueueAction } from './QueueAction';
export declare class FutureAction<T> extends QueueAction<T> {
    scheduler: QueueScheduler;
    work: (x?: any) => Subscription<T> | void;
    id: any;
    delay: number;
    constructor(scheduler: QueueScheduler, work: (x?: any) => Subscription<T> | void);
    schedule(state?: any, delay?: number): Action;
    unsubscribe(): void;
}
