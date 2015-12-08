import { Scheduler } from '../Scheduler';
import { QueueAction } from './QueueAction';
import { Subscription } from '../Subscription';
import { Action } from './Action';
export declare class QueueScheduler implements Scheduler {
    actions: QueueAction<any>[];
    active: boolean;
    scheduled: boolean;
    now(): number;
    flush(): void;
    schedule<T>(work: (x?: any) => Subscription<T> | void, delay?: number, state?: any): Subscription<T>;
    scheduleNow<T>(work: (x?: any) => Subscription<T> | void, state?: any): Action;
    scheduleLater<T>(work: (x?: any) => Subscription<T> | void, delay: number, state?: any): Action;
}
