import { Scheduler } from '../Scheduler';
import { Subscription } from '../Subscription';
import { Action } from './Action';
export declare class VirtualTimeScheduler implements Scheduler {
    actions: Action[];
    active: boolean;
    scheduled: boolean;
    index: number;
    sorted: boolean;
    frame: number;
    maxFrames: number;
    protected static frameTimeFactor: number;
    now(): number;
    flush(): void;
    addAction<T>(action: Action): void;
    schedule<T>(work: (x?: any) => Subscription<T> | void, delay?: number, state?: any): Subscription<T>;
}
