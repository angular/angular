import { MessageBus } from 'angular2/src/web_workers/shared/message_bus';
import { Serializer } from 'angular2/src/web_workers/shared/serializer';
import { Renderer } from 'angular2/src/core/render/api';
import { RenderProtoViewRefStore } from 'angular2/src/web_workers/shared/render_proto_view_ref_store';
import { RenderViewWithFragmentsStore } from 'angular2/src/web_workers/shared/render_view_with_fragments_store';
import { ServiceMessageBrokerFactory } from 'angular2/src/web_workers/shared/service_message_broker';
export declare class MessageBasedRenderer {
    private _brokerFactory;
    private _bus;
    private _serializer;
    private _renderProtoViewRefStore;
    private _renderViewWithFragmentsStore;
    private _renderer;
    constructor(_brokerFactory: ServiceMessageBrokerFactory, _bus: MessageBus, _serializer: Serializer, _renderProtoViewRefStore: RenderProtoViewRefStore, _renderViewWithFragmentsStore: RenderViewWithFragmentsStore, _renderer: Renderer);
    start(): void;
    private _destroyView(viewRef);
    private _createProtoView(componentTemplateId, cmds, refIndex);
    private _createRootHostView(ref, fragmentCount, selector, startIndex);
    private _createView(ref, fragmentCount, startIndex);
    private _setEventDispatcher(viewRef);
}
