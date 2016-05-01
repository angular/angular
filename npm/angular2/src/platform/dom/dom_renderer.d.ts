import { AnimationBuilder } from 'angular2/src/animate/animation_builder';
import { DomSharedStylesHost } from './shared_styles_host';
import { Renderer, RootRenderer, RenderComponentType, RenderDebugInfo } from 'angular2/src/core/render/api';
import { EventManager } from './events/event_manager';
export declare abstract class DomRootRenderer implements RootRenderer {
    document: any;
    eventManager: EventManager;
    sharedStylesHost: DomSharedStylesHost;
    animate: AnimationBuilder;
    private _registeredComponents;
    constructor(document: any, eventManager: EventManager, sharedStylesHost: DomSharedStylesHost, animate: AnimationBuilder);
    renderComponent(componentProto: RenderComponentType): Renderer;
}
export declare class DomRootRenderer_ extends DomRootRenderer {
    constructor(_document: any, _eventManager: EventManager, sharedStylesHost: DomSharedStylesHost, animate: AnimationBuilder);
}
export declare class DomRenderer implements Renderer {
    private _rootRenderer;
    private componentProto;
    private _contentAttr;
    private _hostAttr;
    private _styles;
    constructor(_rootRenderer: DomRootRenderer, componentProto: RenderComponentType);
    selectRootElement(selectorOrNode: string | any, debugInfo: RenderDebugInfo): Element;
    createElement(parent: Element, name: string, debugInfo: RenderDebugInfo): Node;
    createViewRoot(hostElement: any): any;
    createTemplateAnchor(parentElement: any, debugInfo: RenderDebugInfo): any;
    createText(parentElement: any, value: string, debugInfo: RenderDebugInfo): any;
    projectNodes(parentElement: any, nodes: any[]): void;
    attachViewAfter(node: any, viewRootNodes: any[]): void;
    detachView(viewRootNodes: any[]): void;
    destroyView(hostElement: any, viewAllNodes: any[]): void;
    listen(renderElement: any, name: string, callback: Function): Function;
    listenGlobal(target: string, name: string, callback: Function): Function;
    setElementProperty(renderElement: any, propertyName: string, propertyValue: any): void;
    setElementAttribute(renderElement: any, attributeName: string, attributeValue: string): void;
    setBindingDebugInfo(renderElement: any, propertyName: string, propertyValue: string): void;
    setElementClass(renderElement: any, className: string, isAdd: boolean): void;
    setElementStyle(renderElement: any, styleName: string, styleValue: string): void;
    invokeElementMethod(renderElement: any, methodName: string, args: any[]): void;
    setText(renderNode: any, text: string): void;
    /**
     * Performs animations if necessary
     * @param node
     */
    animateNodeEnter(node: Node): void;
    /**
     * If animations are necessary, performs animations then removes the element; otherwise, it just
     * removes the element.
     * @param node
     */
    animateNodeLeave(node: Node): void;
}
export declare const COMPONENT_VARIABLE: string;
export declare const HOST_ATTR: string;
export declare const CONTENT_ATTR: string;
