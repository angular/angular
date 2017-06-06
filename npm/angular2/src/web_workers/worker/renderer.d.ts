import { Renderer, RootRenderer, RenderComponentType, RenderDebugInfo } from 'angular2/src/core/render/api';
import { ClientMessageBrokerFactory, FnArg } from "angular2/src/web_workers/shared/client_message_broker";
import { RenderStore } from 'angular2/src/web_workers/shared/render_store';
import { Serializer, RenderStoreObject } from 'angular2/src/web_workers/shared/serializer';
import { MessageBus } from 'angular2/src/web_workers/shared/message_bus';
export declare class WebWorkerRootRenderer implements RootRenderer {
    private _serializer;
    private _renderStore;
    private _messageBroker;
    globalEvents: NamedEventEmitter;
    private _componentRenderers;
    constructor(messageBrokerFactory: ClientMessageBrokerFactory, bus: MessageBus, _serializer: Serializer, _renderStore: RenderStore);
    private _dispatchEvent(message);
    renderComponent(componentType: RenderComponentType): Renderer;
    runOnService(fnName: string, fnArgs: FnArg[]): void;
    allocateNode(): WebWorkerRenderNode;
    allocateId(): number;
    destroyNodes(nodes: any[]): void;
}
export declare class WebWorkerRenderer implements Renderer, RenderStoreObject {
    private _rootRenderer;
    private _componentType;
    constructor(_rootRenderer: WebWorkerRootRenderer, _componentType: RenderComponentType);
    private _runOnService(fnName, fnArgs);
    selectRootElement(selectorOrNode: string, debugInfo: RenderDebugInfo): any;
    createElement(parentElement: any, name: string, debugInfo: RenderDebugInfo): any;
    createViewRoot(hostElement: any): any;
    createTemplateAnchor(parentElement: any, debugInfo: RenderDebugInfo): any;
    createText(parentElement: any, value: string, debugInfo: RenderDebugInfo): any;
    projectNodes(parentElement: any, nodes: any[]): void;
    attachViewAfter(node: any, viewRootNodes: any[]): void;
    detachView(viewRootNodes: any[]): void;
    destroyView(hostElement: any, viewAllNodes: any[]): void;
    setElementProperty(renderElement: any, propertyName: string, propertyValue: any): void;
    setElementAttribute(renderElement: any, attributeName: string, attributeValue: string): void;
    setBindingDebugInfo(renderElement: any, propertyName: string, propertyValue: string): void;
    setElementClass(renderElement: any, className: string, isAdd: boolean): void;
    setElementStyle(renderElement: any, styleName: string, styleValue: string): void;
    invokeElementMethod(renderElement: any, methodName: string, args: any[]): void;
    setText(renderNode: any, text: string): void;
    listen(renderElement: WebWorkerRenderNode, name: string, callback: Function): Function;
    listenGlobal(target: string, name: string, callback: Function): Function;
}
export declare class NamedEventEmitter {
    private _listeners;
    private _getListeners(eventName);
    listen(eventName: string, callback: Function): void;
    unlisten(eventName: string, callback: Function): void;
    dispatchEvent(eventName: string, event: any): void;
}
export declare class WebWorkerRenderNode {
    events: NamedEventEmitter;
}
