library angular2.src.web_workers.ui.renderer;

import "package:angular2/src/core/di.dart" show Injectable;
import "package:angular2/src/web_workers/shared/message_bus.dart"
    show MessageBus;
import "package:angular2/src/web_workers/shared/serializer.dart"
    show Serializer, PRIMITIVE, RenderStoreObject;
import "package:angular2/src/core/render/api.dart"
    show RootRenderer, Renderer, RenderComponentType;
import "package:angular2/src/web_workers/shared/messaging_api.dart"
    show EVENT_CHANNEL, RENDERER_CHANNEL;
import "package:angular2/src/facade/lang.dart" show Type;
import "bind.dart" show bind;
import "package:angular2/src/web_workers/ui/event_dispatcher.dart"
    show EventDispatcher;
import "package:angular2/src/web_workers/shared/render_store.dart"
    show RenderStore;
import "package:angular2/src/web_workers/shared/service_message_broker.dart"
    show ServiceMessageBrokerFactory;

@Injectable()
class MessageBasedRenderer {
  ServiceMessageBrokerFactory _brokerFactory;
  MessageBus _bus;
  Serializer _serializer;
  RenderStore _renderStore;
  RootRenderer _rootRenderer;
  EventDispatcher _eventDispatcher;
  MessageBasedRenderer(this._brokerFactory, this._bus, this._serializer,
      this._renderStore, this._rootRenderer) {}
  void start() {
    var broker = this._brokerFactory.createMessageBroker(RENDERER_CHANNEL);
    this._bus.initChannel(EVENT_CHANNEL);
    this._eventDispatcher =
        new EventDispatcher(this._bus.to(EVENT_CHANNEL), this._serializer);
    broker.registerMethod("renderComponent", [RenderComponentType, PRIMITIVE],
        bind(this._renderComponent, this));
    broker.registerMethod(
        "selectRootElement",
        [RenderStoreObject, PRIMITIVE, PRIMITIVE],
        bind(this._selectRootElement, this));
    broker.registerMethod(
        "createElement",
        [RenderStoreObject, RenderStoreObject, PRIMITIVE, PRIMITIVE],
        bind(this._createElement, this));
    broker.registerMethod(
        "createViewRoot",
        [RenderStoreObject, RenderStoreObject, PRIMITIVE],
        bind(this._createViewRoot, this));
    broker.registerMethod(
        "createTemplateAnchor",
        [RenderStoreObject, RenderStoreObject, PRIMITIVE],
        bind(this._createTemplateAnchor, this));
    broker.registerMethod(
        "createText",
        [RenderStoreObject, RenderStoreObject, PRIMITIVE, PRIMITIVE],
        bind(this._createText, this));
    broker.registerMethod(
        "projectNodes",
        [RenderStoreObject, RenderStoreObject, RenderStoreObject],
        bind(this._projectNodes, this));
    broker.registerMethod(
        "attachViewAfter",
        [RenderStoreObject, RenderStoreObject, RenderStoreObject],
        bind(this._attachViewAfter, this));
    broker.registerMethod("detachView", [RenderStoreObject, RenderStoreObject],
        bind(this._detachView, this));
    broker.registerMethod(
        "destroyView",
        [RenderStoreObject, RenderStoreObject, RenderStoreObject],
        bind(this._destroyView, this));
    broker.registerMethod(
        "setElementProperty",
        [RenderStoreObject, RenderStoreObject, PRIMITIVE, PRIMITIVE],
        bind(this._setElementProperty, this));
    broker.registerMethod(
        "setElementAttribute",
        [RenderStoreObject, RenderStoreObject, PRIMITIVE, PRIMITIVE],
        bind(this._setElementAttribute, this));
    broker.registerMethod(
        "setBindingDebugInfo",
        [RenderStoreObject, RenderStoreObject, PRIMITIVE, PRIMITIVE],
        bind(this._setBindingDebugInfo, this));
    broker.registerMethod(
        "setElementClass",
        [RenderStoreObject, RenderStoreObject, PRIMITIVE, PRIMITIVE],
        bind(this._setElementClass, this));
    broker.registerMethod(
        "setElementStyle",
        [RenderStoreObject, RenderStoreObject, PRIMITIVE, PRIMITIVE],
        bind(this._setElementStyle, this));
    broker.registerMethod(
        "invokeElementMethod",
        [RenderStoreObject, RenderStoreObject, PRIMITIVE, PRIMITIVE],
        bind(this._invokeElementMethod, this));
    broker.registerMethod(
        "setText",
        [RenderStoreObject, RenderStoreObject, PRIMITIVE],
        bind(this._setText, this));
    broker.registerMethod(
        "listen",
        [RenderStoreObject, RenderStoreObject, PRIMITIVE],
        bind(this._listen, this));
    broker.registerMethod(
        "listenGlobal",
        [RenderStoreObject, PRIMITIVE, PRIMITIVE, PRIMITIVE],
        bind(this._listenGlobal, this));
    broker.registerMethod(
        "listenGlobalDone",
        [RenderStoreObject, RenderStoreObject],
        bind(this._listenGlobalDone, this));
  }

  _renderComponent(RenderComponentType renderComponentType, num rendererId) {
    var renderer = this._rootRenderer.renderComponent(renderComponentType);
    this._renderStore.store(renderer, rendererId);
  }

  _selectRootElement(Renderer renderer, String selector, num elId) {
    this._renderStore.store(renderer.selectRootElement(selector), elId);
  }

  _createElement(
      Renderer renderer, dynamic parentElement, String name, num elId) {
    this._renderStore.store(renderer.createElement(parentElement, name), elId);
  }

  _createViewRoot(Renderer renderer, dynamic hostElement, num elId) {
    var viewRoot = renderer.createViewRoot(hostElement);
    if (!identical(this._renderStore.serialize(hostElement), elId)) {
      this._renderStore.store(viewRoot, elId);
    }
  }

  _createTemplateAnchor(Renderer renderer, dynamic parentElement, num elId) {
    this._renderStore.store(renderer.createTemplateAnchor(parentElement), elId);
  }

  _createText(
      Renderer renderer, dynamic parentElement, String value, num elId) {
    this._renderStore.store(renderer.createText(parentElement, value), elId);
  }

  _projectNodes(Renderer renderer, dynamic parentElement, List<dynamic> nodes) {
    renderer.projectNodes(parentElement, nodes);
  }

  _attachViewAfter(
      Renderer renderer, dynamic node, List<dynamic> viewRootNodes) {
    renderer.attachViewAfter(node, viewRootNodes);
  }

  _detachView(Renderer renderer, List<dynamic> viewRootNodes) {
    renderer.detachView(viewRootNodes);
  }

  _destroyView(
      Renderer renderer, dynamic hostElement, List<dynamic> viewAllNodes) {
    renderer.destroyView(hostElement, viewAllNodes);
    for (var i = 0; i < viewAllNodes.length; i++) {
      this._renderStore.remove(viewAllNodes[i]);
    }
  }

  _setElementProperty(Renderer renderer, dynamic renderElement,
      String propertyName, dynamic propertyValue) {
    renderer.setElementProperty(renderElement, propertyName, propertyValue);
  }

  _setElementAttribute(Renderer renderer, dynamic renderElement,
      String attributeName, String attributeValue) {
    renderer.setElementAttribute(renderElement, attributeName, attributeValue);
  }

  _setBindingDebugInfo(Renderer renderer, dynamic renderElement,
      String propertyName, String propertyValue) {
    renderer.setBindingDebugInfo(renderElement, propertyName, propertyValue);
  }

  _setElementClass(
      Renderer renderer, dynamic renderElement, String className, bool isAdd) {
    renderer.setElementClass(renderElement, className, isAdd);
  }

  _setElementStyle(Renderer renderer, dynamic renderElement, String styleName,
      String styleValue) {
    renderer.setElementStyle(renderElement, styleName, styleValue);
  }

  _invokeElementMethod(Renderer renderer, dynamic renderElement,
      String methodName, List<dynamic> args) {
    renderer.invokeElementMethod(renderElement, methodName, args);
  }

  _setText(Renderer renderer, dynamic renderNode, String text) {
    renderer.setText(renderNode, text);
  }

  _listen(Renderer renderer, dynamic renderElement, String eventName) {
    renderer.listen(
        renderElement,
        eventName,
        (event) => this
            ._eventDispatcher
            .dispatchRenderEvent(renderElement, null, eventName, event));
  }

  _listenGlobal(
      Renderer renderer, String eventTarget, String eventName, num unlistenId) {
    var unregisterCallback = renderer.listenGlobal(
        eventTarget,
        eventName,
        (event) => this
            ._eventDispatcher
            .dispatchRenderEvent(null, eventTarget, eventName, event));
    this._renderStore.store(unregisterCallback, unlistenId);
  }

  _listenGlobalDone(Renderer renderer, Function unlistenCallback) {
    unlistenCallback();
  }
}
