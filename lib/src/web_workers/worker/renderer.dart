library angular2.src.web_workers.worker.renderer;

import "package:angular2/src/core/render/api.dart"
    show Renderer, RootRenderer, RenderComponentType;
import "package:angular2/src/web_workers/shared/client_message_broker.dart"
    show ClientMessageBroker, ClientMessageBrokerFactory, FnArg, UiArguments;
import "package:angular2/src/facade/lang.dart" show isPresent, isBlank, print;
import "package:angular2/src/facade/collection.dart" show ListWrapper;
import "package:angular2/src/core/di.dart" show Injectable;
import "package:angular2/src/web_workers/shared/render_store.dart"
    show RenderStore;
import "package:angular2/src/web_workers/shared/messaging_api.dart"
    show RENDERER_CHANNEL;
import "package:angular2/src/web_workers/shared/serializer.dart"
    show Serializer, RenderStoreObject;
import "package:angular2/src/web_workers/shared/messaging_api.dart"
    show EVENT_CHANNEL;
import "package:angular2/src/web_workers/shared/message_bus.dart"
    show MessageBus;
import "package:angular2/src/facade/async.dart"
    show EventEmitter, ObservableWrapper;
import "package:angular2/src/core/metadata/view.dart" show ViewEncapsulation;
import "event_deserializer.dart" show deserializeGenericEvent;

@Injectable()
class WebWorkerRootRenderer implements RootRenderer {
  Serializer _serializer;
  RenderStore _renderStore;
  var _messageBroker;
  NamedEventEmitter globalEvents = new NamedEventEmitter();
  Map<String, WebWorkerRenderer> _componentRenderers =
      new Map<String, WebWorkerRenderer>();
  WebWorkerRootRenderer(ClientMessageBrokerFactory messageBrokerFactory,
      MessageBus bus, this._serializer, this._renderStore) {
    this._messageBroker =
        messageBrokerFactory.createMessageBroker(RENDERER_CHANNEL);
    bus.initChannel(EVENT_CHANNEL);
    var source = bus.from(EVENT_CHANNEL);
    ObservableWrapper.subscribe(
        source, (message) => this._dispatchEvent(message));
  }
  void _dispatchEvent(Map<String, dynamic> message) {
    var eventName = message["eventName"];
    var target = message["eventTarget"];
    var event = deserializeGenericEvent(message["event"]);
    if (isPresent(target)) {
      this
          .globalEvents
          .dispatchEvent(eventNameWithTarget(target, eventName), event);
    } else {
      var element = (this._serializer.deserialize(
          message["element"], RenderStoreObject) as WebWorkerRenderNode);
      element.events.dispatchEvent(eventName, event);
    }
  }

  Renderer renderComponent(RenderComponentType componentType) {
    var result = this._componentRenderers[componentType.id];
    if (isBlank(result)) {
      result = new WebWorkerRenderer(this, componentType);
      this._componentRenderers[componentType.id] = result;
      var id = this._renderStore.allocateId();
      this._renderStore.store(result, id);
      this.runOnService("renderComponent", [
        new FnArg(componentType, RenderComponentType),
        new FnArg(result, RenderStoreObject)
      ]);
    }
    return result;
  }

  runOnService(String fnName, List<FnArg> fnArgs) {
    var args = new UiArguments(fnName, fnArgs);
    this._messageBroker.runOnService(args, null);
  }

  WebWorkerRenderNode allocateNode() {
    var result = new WebWorkerRenderNode();
    var id = this._renderStore.allocateId();
    this._renderStore.store(result, id);
    return result;
  }

  num allocateId() {
    return this._renderStore.allocateId();
  }

  destroyNodes(List<dynamic> nodes) {
    for (var i = 0; i < nodes.length; i++) {
      this._renderStore.remove(nodes[i]);
    }
  }
}

class WebWorkerRenderer implements Renderer, RenderStoreObject {
  WebWorkerRootRenderer _rootRenderer;
  RenderComponentType _componentType;
  WebWorkerRenderer(this._rootRenderer, this._componentType) {}
  Renderer renderComponent(RenderComponentType componentType) {
    return this._rootRenderer.renderComponent(componentType);
  }

  _runOnService(String fnName, List<FnArg> fnArgs) {
    var fnArgsWithRenderer =
        (new List.from([new FnArg(this, RenderStoreObject)])..addAll(fnArgs));
    this._rootRenderer.runOnService(fnName, fnArgsWithRenderer);
  }

  dynamic selectRootElement(String selector) {
    var node = this._rootRenderer.allocateNode();
    this._runOnService("selectRootElement",
        [new FnArg(selector, null), new FnArg(node, RenderStoreObject)]);
    return node;
  }

  dynamic createElement(dynamic parentElement, String name) {
    var node = this._rootRenderer.allocateNode();
    this._runOnService("createElement", [
      new FnArg(parentElement, RenderStoreObject),
      new FnArg(name, null),
      new FnArg(node, RenderStoreObject)
    ]);
    return node;
  }

  dynamic createViewRoot(dynamic hostElement) {
    var viewRoot =
        identical(this._componentType.encapsulation, ViewEncapsulation.Native)
            ? this._rootRenderer.allocateNode()
            : hostElement;
    this._runOnService("createViewRoot", [
      new FnArg(hostElement, RenderStoreObject),
      new FnArg(viewRoot, RenderStoreObject)
    ]);
    return viewRoot;
  }

  dynamic createTemplateAnchor(dynamic parentElement) {
    var node = this._rootRenderer.allocateNode();
    this._runOnService("createTemplateAnchor", [
      new FnArg(parentElement, RenderStoreObject),
      new FnArg(node, RenderStoreObject)
    ]);
    return node;
  }

  dynamic createText(dynamic parentElement, String value) {
    var node = this._rootRenderer.allocateNode();
    this._runOnService("createText", [
      new FnArg(parentElement, RenderStoreObject),
      new FnArg(value, null),
      new FnArg(node, RenderStoreObject)
    ]);
    return node;
  }

  projectNodes(dynamic parentElement, List<dynamic> nodes) {
    this._runOnService("projectNodes", [
      new FnArg(parentElement, RenderStoreObject),
      new FnArg(nodes, RenderStoreObject)
    ]);
  }

  attachViewAfter(dynamic node, List<dynamic> viewRootNodes) {
    this._runOnService("attachViewAfter", [
      new FnArg(node, RenderStoreObject),
      new FnArg(viewRootNodes, RenderStoreObject)
    ]);
  }

  detachView(List<dynamic> viewRootNodes) {
    this._runOnService(
        "detachView", [new FnArg(viewRootNodes, RenderStoreObject)]);
  }

  destroyView(dynamic hostElement, List<dynamic> viewAllNodes) {
    this._runOnService("destroyView", [
      new FnArg(hostElement, RenderStoreObject),
      new FnArg(viewAllNodes, RenderStoreObject)
    ]);
    this._rootRenderer.destroyNodes(viewAllNodes);
  }

  setElementProperty(
      dynamic renderElement, String propertyName, dynamic propertyValue) {
    this._runOnService("setElementProperty", [
      new FnArg(renderElement, RenderStoreObject),
      new FnArg(propertyName, null),
      new FnArg(propertyValue, null)
    ]);
  }

  setElementAttribute(
      dynamic renderElement, String attributeName, String attributeValue) {
    this._runOnService("setElementAttribute", [
      new FnArg(renderElement, RenderStoreObject),
      new FnArg(attributeName, null),
      new FnArg(attributeValue, null)
    ]);
  }

  setBindingDebugInfo(
      dynamic renderElement, String propertyName, String propertyValue) {
    this._runOnService("setBindingDebugInfo", [
      new FnArg(renderElement, RenderStoreObject),
      new FnArg(propertyName, null),
      new FnArg(propertyValue, null)
    ]);
  }

  setElementClass(dynamic renderElement, String className, bool isAdd) {
    this._runOnService("setElementClass", [
      new FnArg(renderElement, RenderStoreObject),
      new FnArg(className, null),
      new FnArg(isAdd, null)
    ]);
  }

  setElementStyle(dynamic renderElement, String styleName, String styleValue) {
    this._runOnService("setElementStyle", [
      new FnArg(renderElement, RenderStoreObject),
      new FnArg(styleName, null),
      new FnArg(styleValue, null)
    ]);
  }

  invokeElementMethod(
      dynamic renderElement, String methodName, List<dynamic> args) {
    this._runOnService("invokeElementMethod", [
      new FnArg(renderElement, RenderStoreObject),
      new FnArg(methodName, null),
      new FnArg(args, null)
    ]);
  }

  setText(dynamic renderNode, String text) {
    this._runOnService("setText",
        [new FnArg(renderNode, RenderStoreObject), new FnArg(text, null)]);
  }

  Function listen(
      WebWorkerRenderNode renderElement, String name, Function callback) {
    renderElement.events.listen(name, callback);
    var unlistenCallbackId = this._rootRenderer.allocateId();
    this._runOnService("listen", [
      new FnArg(renderElement, RenderStoreObject),
      new FnArg(name, null),
      new FnArg(unlistenCallbackId, null)
    ]);
    return () {
      renderElement.events.unlisten(name, callback);
      this._runOnService("listenDone", [new FnArg(unlistenCallbackId, null)]);
    };
  }

  Function listenGlobal(String target, String name, Function callback) {
    this
        ._rootRenderer
        .globalEvents
        .listen(eventNameWithTarget(target, name), callback);
    var unlistenCallbackId = this._rootRenderer.allocateId();
    this._runOnService("listenGlobal", [
      new FnArg(target, null),
      new FnArg(name, null),
      new FnArg(unlistenCallbackId, null)
    ]);
    return () {
      this
          ._rootRenderer
          .globalEvents
          .unlisten(eventNameWithTarget(target, name), callback);
      this._runOnService("listenDone", [new FnArg(unlistenCallbackId, null)]);
    };
  }
}

class NamedEventEmitter {
  Map<String, List<Function>> _listeners;
  List<Function> _getListeners(String eventName) {
    if (isBlank(this._listeners)) {
      this._listeners = new Map<String, List<Function>>();
    }
    var listeners = this._listeners[eventName];
    if (isBlank(listeners)) {
      listeners = [];
      this._listeners[eventName] = listeners;
    }
    return listeners;
  }

  listen(String eventName, Function callback) {
    this._getListeners(eventName).add(callback);
  }

  unlisten(String eventName, Function callback) {
    ListWrapper.remove(this._getListeners(eventName), callback);
  }

  dispatchEvent(String eventName, dynamic event) {
    var listeners = this._getListeners(eventName);
    for (var i = 0; i < listeners.length; i++) {
      listeners[i](event);
    }
  }
}

String eventNameWithTarget(String target, String eventName) {
  return '''${ target}:${ eventName}''';
}

class WebWorkerRenderNode {
  NamedEventEmitter events = new NamedEventEmitter();
}
