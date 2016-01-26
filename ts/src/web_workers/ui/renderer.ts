import {Injectable} from 'angular2/src/core/di';
import {MessageBus} from 'angular2/src/web_workers/shared/message_bus';
import {Serializer, PRIMITIVE, RenderStoreObject} from 'angular2/src/web_workers/shared/serializer';
import {RootRenderer, Renderer, RenderComponentType} from 'angular2/src/core/render/api';
import {EVENT_CHANNEL, RENDERER_CHANNEL} from 'angular2/src/web_workers/shared/messaging_api';
import {Type} from 'angular2/src/facade/lang';
import {bind} from './bind';
import {EventDispatcher} from 'angular2/src/web_workers/ui/event_dispatcher';
import {RenderStore} from 'angular2/src/web_workers/shared/render_store';
import {ServiceMessageBrokerFactory} from 'angular2/src/web_workers/shared/service_message_broker';

@Injectable()
export class MessageBasedRenderer {
  private _eventDispatcher: EventDispatcher;

  constructor(private _brokerFactory: ServiceMessageBrokerFactory, private _bus: MessageBus,
              private _serializer: Serializer, private _renderStore: RenderStore,
              private _rootRenderer: RootRenderer) {}

  start(): void {
    var broker = this._brokerFactory.createMessageBroker(RENDERER_CHANNEL);
    this._bus.initChannel(EVENT_CHANNEL);
    this._eventDispatcher = new EventDispatcher(this._bus.to(EVENT_CHANNEL), this._serializer);

    broker.registerMethod("renderComponent", [RenderComponentType, PRIMITIVE],
                          bind(this._renderComponent, this));

    broker.registerMethod("selectRootElement", [RenderStoreObject, PRIMITIVE, PRIMITIVE],
                          bind(this._selectRootElement, this));
    broker.registerMethod("createElement",
                          [RenderStoreObject, RenderStoreObject, PRIMITIVE, PRIMITIVE],
                          bind(this._createElement, this));
    broker.registerMethod("createViewRoot", [RenderStoreObject, RenderStoreObject, PRIMITIVE],
                          bind(this._createViewRoot, this));
    broker.registerMethod("createTemplateAnchor", [RenderStoreObject, RenderStoreObject, PRIMITIVE],
                          bind(this._createTemplateAnchor, this));
    broker.registerMethod("createText",
                          [RenderStoreObject, RenderStoreObject, PRIMITIVE, PRIMITIVE],
                          bind(this._createText, this));
    broker.registerMethod("projectNodes", [RenderStoreObject, RenderStoreObject, RenderStoreObject],
                          bind(this._projectNodes, this));
    broker.registerMethod("attachViewAfter",
                          [RenderStoreObject, RenderStoreObject, RenderStoreObject],
                          bind(this._attachViewAfter, this));
    broker.registerMethod("detachView", [RenderStoreObject, RenderStoreObject],
                          bind(this._detachView, this));
    broker.registerMethod("destroyView", [RenderStoreObject, RenderStoreObject, RenderStoreObject],
                          bind(this._destroyView, this));
    broker.registerMethod("setElementProperty",
                          [RenderStoreObject, RenderStoreObject, PRIMITIVE, PRIMITIVE],
                          bind(this._setElementProperty, this));
    broker.registerMethod("setElementAttribute",
                          [RenderStoreObject, RenderStoreObject, PRIMITIVE, PRIMITIVE],
                          bind(this._setElementAttribute, this));
    broker.registerMethod("setBindingDebugInfo",
                          [RenderStoreObject, RenderStoreObject, PRIMITIVE, PRIMITIVE],
                          bind(this._setBindingDebugInfo, this));
    broker.registerMethod("setElementClass",
                          [RenderStoreObject, RenderStoreObject, PRIMITIVE, PRIMITIVE],
                          bind(this._setElementClass, this));
    broker.registerMethod("setElementStyle",
                          [RenderStoreObject, RenderStoreObject, PRIMITIVE, PRIMITIVE],
                          bind(this._setElementStyle, this));
    broker.registerMethod("invokeElementMethod",
                          [RenderStoreObject, RenderStoreObject, PRIMITIVE, PRIMITIVE],
                          bind(this._invokeElementMethod, this));
    broker.registerMethod("setText", [RenderStoreObject, RenderStoreObject, PRIMITIVE],
                          bind(this._setText, this));
    broker.registerMethod("listen", [RenderStoreObject, RenderStoreObject, PRIMITIVE, PRIMITIVE],
                          bind(this._listen, this));
    broker.registerMethod("listenGlobal", [RenderStoreObject, PRIMITIVE, PRIMITIVE, PRIMITIVE],
                          bind(this._listenGlobal, this));
    broker.registerMethod("listenDone", [RenderStoreObject, RenderStoreObject],
                          bind(this._listenDone, this));
  }

  private _renderComponent(renderComponentType: RenderComponentType, rendererId: number) {
    var renderer = this._rootRenderer.renderComponent(renderComponentType);
    this._renderStore.store(renderer, rendererId);
  }

  private _selectRootElement(renderer: Renderer, selector: string, elId: number) {
    this._renderStore.store(renderer.selectRootElement(selector), elId);
  }

  private _createElement(renderer: Renderer, parentElement: any, name: string, elId: number) {
    this._renderStore.store(renderer.createElement(parentElement, name), elId);
  }

  private _createViewRoot(renderer: Renderer, hostElement: any, elId: number) {
    var viewRoot = renderer.createViewRoot(hostElement);
    if (this._renderStore.serialize(hostElement) !== elId) {
      this._renderStore.store(viewRoot, elId);
    }
  }

  private _createTemplateAnchor(renderer: Renderer, parentElement: any, elId: number) {
    this._renderStore.store(renderer.createTemplateAnchor(parentElement), elId);
  }

  private _createText(renderer: Renderer, parentElement: any, value: string, elId: number) {
    this._renderStore.store(renderer.createText(parentElement, value), elId);
  }

  private _projectNodes(renderer: Renderer, parentElement: any, nodes: any[]) {
    renderer.projectNodes(parentElement, nodes);
  }

  private _attachViewAfter(renderer: Renderer, node: any, viewRootNodes: any[]) {
    renderer.attachViewAfter(node, viewRootNodes);
  }

  private _detachView(renderer: Renderer, viewRootNodes: any[]) {
    renderer.detachView(viewRootNodes);
  }

  private _destroyView(renderer: Renderer, hostElement: any, viewAllNodes: any[]) {
    renderer.destroyView(hostElement, viewAllNodes);
    for (var i = 0; i < viewAllNodes.length; i++) {
      this._renderStore.remove(viewAllNodes[i]);
    }
  }

  private _setElementProperty(renderer: Renderer, renderElement: any, propertyName: string,
                              propertyValue: any) {
    renderer.setElementProperty(renderElement, propertyName, propertyValue);
  }

  private _setElementAttribute(renderer: Renderer, renderElement: any, attributeName: string,
                               attributeValue: string) {
    renderer.setElementAttribute(renderElement, attributeName, attributeValue);
  }

  private _setBindingDebugInfo(renderer: Renderer, renderElement: any, propertyName: string,
                               propertyValue: string) {
    renderer.setBindingDebugInfo(renderElement, propertyName, propertyValue);
  }

  private _setElementClass(renderer: Renderer, renderElement: any, className: string,
                           isAdd: boolean) {
    renderer.setElementClass(renderElement, className, isAdd);
  }

  private _setElementStyle(renderer: Renderer, renderElement: any, styleName: string,
                           styleValue: string) {
    renderer.setElementStyle(renderElement, styleName, styleValue);
  }

  private _invokeElementMethod(renderer: Renderer, renderElement: any, methodName: string,
                               args: any[]) {
    renderer.invokeElementMethod(renderElement, methodName, args);
  }

  private _setText(renderer: Renderer, renderNode: any, text: string) {
    renderer.setText(renderNode, text);
  }

  private _listen(renderer: Renderer, renderElement: any, eventName: string, unlistenId: number) {
    var unregisterCallback = renderer.listen(renderElement, eventName,
                                             (event) => this._eventDispatcher.dispatchRenderEvent(
                                                 renderElement, null, eventName, event));
    this._renderStore.store(unregisterCallback, unlistenId);
  }

  private _listenGlobal(renderer: Renderer, eventTarget: string, eventName: string,
                        unlistenId: number) {
    var unregisterCallback = renderer.listenGlobal(
        eventTarget, eventName,
        (event) => this._eventDispatcher.dispatchRenderEvent(null, eventTarget, eventName, event));
    this._renderStore.store(unregisterCallback, unlistenId);
  }

  private _listenDone(renderer: Renderer, unlistenCallback: Function) { unlistenCallback(); }
}
