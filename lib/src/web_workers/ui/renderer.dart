library angular2.src.web_workers.ui.renderer;

import "package:angular2/src/core/di.dart" show Injectable;
import "package:angular2/src/web_workers/shared/message_bus.dart"
    show MessageBus;
import "package:angular2/src/web_workers/shared/serializer.dart"
    show Serializer, PRIMITIVE;
import "package:angular2/src/core/render/api.dart"
    show
        RenderViewRef,
        RenderFragmentRef,
        RenderProtoViewRef,
        Renderer,
        RenderTemplateCmd,
        RenderComponentTemplate;
import "package:angular2/src/web_workers/shared/api.dart"
    show WebWorkerElementRef, WebWorkerTemplateCmd;
import "package:angular2/src/web_workers/shared/messaging_api.dart"
    show EVENT_CHANNEL, RENDERER_CHANNEL;
import "package:angular2/src/facade/lang.dart" show Type;
import "bind.dart" show bind;
import "package:angular2/src/web_workers/ui/event_dispatcher.dart"
    show EventDispatcher;
import "package:angular2/src/web_workers/shared/render_proto_view_ref_store.dart"
    show RenderProtoViewRefStore;
import "package:angular2/src/web_workers/shared/render_view_with_fragments_store.dart"
    show RenderViewWithFragmentsStore;
import "package:angular2/src/web_workers/shared/service_message_broker.dart"
    show ServiceMessageBrokerFactory;

@Injectable()
class MessageBasedRenderer {
  ServiceMessageBrokerFactory _brokerFactory;
  MessageBus _bus;
  Serializer _serializer;
  RenderProtoViewRefStore _renderProtoViewRefStore;
  RenderViewWithFragmentsStore _renderViewWithFragmentsStore;
  Renderer _renderer;
  MessageBasedRenderer(
      this._brokerFactory,
      this._bus,
      this._serializer,
      this._renderProtoViewRefStore,
      this._renderViewWithFragmentsStore,
      this._renderer) {}
  void start() {
    var broker = this._brokerFactory.createMessageBroker(RENDERER_CHANNEL);
    this._bus.initChannel(EVENT_CHANNEL);
    broker.registerMethod(
        "registerComponentTemplate",
        [RenderComponentTemplate],
        bind(this._renderer.registerComponentTemplate, this._renderer));
    broker.registerMethod(
        "createProtoView",
        [PRIMITIVE, WebWorkerTemplateCmd, PRIMITIVE],
        bind(this._createProtoView, this));
    broker.registerMethod(
        "createRootHostView",
        [RenderProtoViewRef, PRIMITIVE, PRIMITIVE, PRIMITIVE],
        bind(this._createRootHostView, this));
    broker.registerMethod(
        "createView",
        [RenderProtoViewRef, PRIMITIVE, PRIMITIVE],
        bind(this._createView, this));
    broker.registerMethod(
        "destroyView", [RenderViewRef], bind(this._destroyView, this));
    broker.registerMethod(
        "attachFragmentAfterFragment",
        [RenderFragmentRef, RenderFragmentRef],
        bind(this._renderer.attachFragmentAfterFragment, this._renderer));
    broker.registerMethod(
        "attachFragmentAfterElement",
        [WebWorkerElementRef, RenderFragmentRef],
        bind(this._renderer.attachFragmentAfterElement, this._renderer));
    broker.registerMethod("detachFragment", [RenderFragmentRef],
        bind(this._renderer.detachFragment, this._renderer));
    broker.registerMethod("hydrateView", [RenderViewRef],
        bind(this._renderer.hydrateView, this._renderer));
    broker.registerMethod("dehydrateView", [RenderViewRef],
        bind(this._renderer.dehydrateView, this._renderer));
    broker.registerMethod("setText", [RenderViewRef, PRIMITIVE, PRIMITIVE],
        bind(this._renderer.setText, this._renderer));
    broker.registerMethod(
        "setElementProperty",
        [WebWorkerElementRef, PRIMITIVE, PRIMITIVE],
        bind(this._renderer.setElementProperty, this._renderer));
    broker.registerMethod(
        "setElementAttribute",
        [WebWorkerElementRef, PRIMITIVE, PRIMITIVE],
        bind(this._renderer.setElementAttribute, this._renderer));
    broker.registerMethod(
        "setElementClass",
        [WebWorkerElementRef, PRIMITIVE, PRIMITIVE],
        bind(this._renderer.setElementClass, this._renderer));
    broker.registerMethod(
        "setElementStyle",
        [WebWorkerElementRef, PRIMITIVE, PRIMITIVE],
        bind(this._renderer.setElementStyle, this._renderer));
    broker.registerMethod(
        "invokeElementMethod",
        [WebWorkerElementRef, PRIMITIVE, PRIMITIVE],
        bind(this._renderer.invokeElementMethod, this._renderer));
    broker.registerMethod("setEventDispatcher", [RenderViewRef],
        bind(this._setEventDispatcher, this));
  }

  void _destroyView(RenderViewRef viewRef) {
    this._renderer.destroyView(viewRef);
    this._renderViewWithFragmentsStore.remove(viewRef);
  }

  _createProtoView(
      String componentTemplateId, List<RenderTemplateCmd> cmds, num refIndex) {
    var protoViewRef =
        this._renderer.createProtoView(componentTemplateId, cmds);
    this._renderProtoViewRefStore.store(protoViewRef, refIndex);
  }

  _createRootHostView(RenderProtoViewRef ref, num fragmentCount,
      String selector, num startIndex) {
    var renderViewWithFragments =
        this._renderer.createRootHostView(ref, fragmentCount, selector);
    this
        ._renderViewWithFragmentsStore
        .store(renderViewWithFragments, startIndex);
  }

  _createView(RenderProtoViewRef ref, num fragmentCount, num startIndex) {
    var renderViewWithFragments = this._renderer.createView(ref, fragmentCount);
    this
        ._renderViewWithFragmentsStore
        .store(renderViewWithFragments, startIndex);
  }

  _setEventDispatcher(RenderViewRef viewRef) {
    var dispatcher = new EventDispatcher(
        viewRef, this._bus.to(EVENT_CHANNEL), this._serializer);
    this._renderer.setEventDispatcher(viewRef, dispatcher);
  }
}
