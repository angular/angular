import { QueueAction } from './QueueAction';
import { Action } from './Action';
export declare class AsapAction<T> extends QueueAction<T> {
    private id;
    schedule(state?: any): Action;
    unsubscribe(): void;
}
