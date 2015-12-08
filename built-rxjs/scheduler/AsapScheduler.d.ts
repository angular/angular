import { QueueScheduler } from './QueueScheduler';
import { Subscription } from '../Subscription';
import { Action } from './Action';
export declare class AsapScheduler extends QueueScheduler {
    scheduleNow<T>(work: (x?: any) => Subscription<T>, state?: any): Action;
}
