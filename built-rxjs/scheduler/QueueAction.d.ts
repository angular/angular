import { Subscription } from '../Subscription';
import { Scheduler } from '../Scheduler';
import { Action } from './Action';
export declare class QueueAction<T> extends Subscription<T> implements Action {
    scheduler: Scheduler;
    work: (x?: any) => Subscription<T> | void;
    state: any;
    constructor(scheduler: Scheduler, work: (x?: any) => Subscription<T> | void);
    schedule(state?: any): Action;
    execute(): void;
    unsubscribe(): void;
}
