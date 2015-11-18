import { RenderViewRef, RenderEventDispatcher } from 'angular2/src/core/render/api';
import { Serializer } from 'angular2/src/web_workers/shared/serializer';
import { MessageBus } from 'angular2/src/web_workers/shared/message_bus';
export declare class WebWorkerEventDispatcher {
    private _serializer;
    private _eventDispatchRegistry;
    constructor(bus: MessageBus, _serializer: Serializer);
    private _dispatchEvent(eventData);
    registerEventDispatcher(viewRef: RenderViewRef, dispatcher: RenderEventDispatcher): void;
}
