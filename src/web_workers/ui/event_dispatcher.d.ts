import { Serializer } from 'angular2/src/web_workers/shared/serializer';
import { EventEmitter } from 'angular2/src/facade/async';
export declare class EventDispatcher {
    private _sink;
    private _serializer;
    constructor(_sink: EventEmitter<any>, _serializer: Serializer);
    dispatchRenderEvent(element: any, eventTarget: string, eventName: string, event: any): boolean;
}
