import {Injectable} from 'angular2/di';
import {MessageBus} from 'angular2/src/web_workers/shared/message_bus';
import {Serializer, PRIMITIVE} from 'angular2/src/web_workers/shared/serializer';
import {
  RenderViewRef,
  RenderFragmentRef,
  RenderProtoViewRef,
  Renderer
} from 'angular2/src/core/render/api';
import {WebWorkerElementRef} from 'angular2/src/web_workers/shared/api';
import {EVENT_CHANNEL, RENDERER_CHANNEL} from 'angular2/src/web_workers/shared/messaging_api';
import {BaseException, Type} from 'angular2/src/core/facade/lang';
import {bind} from './bind';
import {EventDispatcher} from 'angular2/src/web_workers/ui/event_dispatcher';
import {
  RenderViewWithFragmentsStore
} from 'angular2/src/web_workers/shared/render_view_with_fragments_store';
import {ServiceMessageBrokerFactory} from 'angular2/src/web_workers/shared/service_message_broker';

@Injectable()
export class MessageBasedRenderer {
  constructor(private _brokerFactory: ServiceMessageBrokerFactory, private _bus: MessageBus,
              private _serializer: Serializer,
              private _renderViewWithFragmentsStore: RenderViewWithFragmentsStore,
              private _renderer: Renderer) {}

  start(): void {
    var broker = this._brokerFactory.createMessageBroker(RENDERER_CHANNEL);
    broker.registerMethod("createRootHostView",
                          [RenderProtoViewRef, PRIMITIVE, PRIMITIVE, PRIMITIVE],
                          bind(this._createRootHostView, this));
    broker.registerMethod("createView", [RenderProtoViewRef, PRIMITIVE, PRIMITIVE],
                          bind(this._createView, this));
    broker.registerMethod("destroyView", [RenderViewRef], bind(this._destroyView, this));
    broker.registerMethod("attachFragmentAfterFragment", [RenderFragmentRef, RenderFragmentRef],
                          bind(this._renderer.attachFragmentAfterFragment, this._renderer));
    broker.registerMethod("attachFragmentAfterElement", [WebWorkerElementRef, RenderFragmentRef],
                          bind(this._renderer.attachFragmentAfterElement, this._renderer));
    broker.registerMethod("detachFragment", [RenderFragmentRef],
                          bind(this._renderer.detachFragment, this._renderer));
    broker.registerMethod("hydrateView", [RenderViewRef],
                          bind(this._renderer.hydrateView, this._renderer));
    broker.registerMethod("dehydrateView", [RenderViewRef],
                          bind(this._renderer.dehydrateView, this._renderer));
    broker.registerMethod("setText", [RenderViewRef, PRIMITIVE, PRIMITIVE],
                          bind(this._renderer.setText, this._renderer));
    broker.registerMethod("setElementProperty", [WebWorkerElementRef, PRIMITIVE, PRIMITIVE],
                          bind(this._renderer.setElementProperty, this._renderer));
    broker.registerMethod("setElementAttribute", [WebWorkerElementRef, PRIMITIVE, PRIMITIVE],
                          bind(this._renderer.setElementAttribute, this._renderer));
    broker.registerMethod("setElementClass", [WebWorkerElementRef, PRIMITIVE, PRIMITIVE],
                          bind(this._renderer.setElementClass, this._renderer));
    broker.registerMethod("setElementStyle", [WebWorkerElementRef, PRIMITIVE, PRIMITIVE],
                          bind(this._renderer.setElementStyle, this._renderer));
    broker.registerMethod("invokeElementMethod", [WebWorkerElementRef, PRIMITIVE, PRIMITIVE],
                          bind(this._renderer.invokeElementMethod, this._renderer));
    broker.registerMethod("setEventDispatcher", [RenderViewRef],
                          bind(this._setEventDispatcher, this));
  }

  private _destroyView(viewRef: RenderViewRef): void {
    this._renderer.destroyView(viewRef);
    this._renderViewWithFragmentsStore.remove(viewRef);
  }

  private _createRootHostView(ref: RenderProtoViewRef, fragmentCount: number, selector: string,
                              startIndex: number) {
    var renderViewWithFragments = this._renderer.createRootHostView(ref, fragmentCount, selector);
    this._renderViewWithFragmentsStore.store(renderViewWithFragments, startIndex);
  }

  private _createView(ref: RenderProtoViewRef, fragmentCount: number, startIndex: number) {
    var renderViewWithFragments = this._renderer.createView(ref, fragmentCount);
    this._renderViewWithFragmentsStore.store(renderViewWithFragments, startIndex);
  }

  private _setEventDispatcher(viewRef: RenderViewRef) {
    var dispatcher = new EventDispatcher(viewRef, this._bus.to(EVENT_CHANNEL), this._serializer);
    this._renderer.setEventDispatcher(viewRef, dispatcher);
  }
}
