import { AnimationBuilder } from 'angular2/src/animate/animation_builder';
import { DomSharedStylesHost } from './shared_styles_host';
import { Renderer, RenderProtoViewRef, RenderViewRef, RenderElementRef, RenderFragmentRef, RenderViewWithFragments, RenderTemplateCmd, RenderEventDispatcher, RenderComponentTemplate } from 'angular2/core';
import { EventManager } from './events/event_manager';
import { NodeFactory } from 'angular2/src/core/render/view_factory';
export declare abstract class DomRenderer extends Renderer implements NodeFactory<Node> {
    abstract registerComponentTemplate(template: RenderComponentTemplate): any;
    abstract resolveComponentTemplate(templateId: string): RenderComponentTemplate;
    abstract createProtoView(componentTemplateId: string, cmds: RenderTemplateCmd[]): RenderProtoViewRef;
    abstract createRootHostView(hostProtoViewRef: RenderProtoViewRef, fragmentCount: number, hostElementSelector: string): RenderViewWithFragments;
    abstract createView(protoViewRef: RenderProtoViewRef, fragmentCount: number): RenderViewWithFragments;
    abstract destroyView(viewRef: RenderViewRef): any;
    abstract createRootContentInsertionPoint(): any;
    getNativeElementSync(location: RenderElementRef): any;
    getRootNodes(fragment: RenderFragmentRef): Node[];
    attachFragmentAfterFragment(previousFragmentRef: RenderFragmentRef, fragmentRef: RenderFragmentRef): void;
    /**
     * Iterates through all nodes being added to the DOM and animates them if necessary
     * @param nodes
     */
    animateNodesEnter(nodes: Node[]): void;
    /**
     * Performs animations if necessary
     * @param node
     */
    abstract animateNodeEnter(node: Node): any;
    /**
     * If animations are necessary, performs animations then removes the element; otherwise, it just
     * removes the element.
     * @param node
     */
    abstract animateNodeLeave(node: Node): any;
    attachFragmentAfterElement(elementRef: RenderElementRef, fragmentRef: RenderFragmentRef): void;
    abstract detachFragment(fragmentRef: RenderFragmentRef): any;
    hydrateView(viewRef: RenderViewRef): void;
    dehydrateView(viewRef: RenderViewRef): void;
    createTemplateAnchor(attrNameAndValues: string[]): Node;
    abstract createElement(name: string, attrNameAndValues: string[]): Node;
    abstract mergeElement(existing: Node, attrNameAndValues: string[]): any;
    abstract createShadowRoot(host: Node, templateId: string): Node;
    createText(value: string): Node;
    appendChild(parent: Node, child: Node): void;
    abstract on(element: Node, eventName: string, callback: Function): any;
    abstract globalOn(target: string, eventName: string, callback: Function): Function;
    setElementProperty(location: RenderElementRef, propertyName: string, propertyValue: any): void;
    setElementAttribute(location: RenderElementRef, attributeName: string, attributeValue: string): void;
    /**
     * Used only in debug mode to serialize property changes to comment nodes,
     * such as <template> placeholders.
     */
    setBindingDebugInfo(location: RenderElementRef, propertyName: string, propertyValue: string): void;
    setElementClass(location: RenderElementRef, className: string, isAdd: boolean): void;
    setElementStyle(location: RenderElementRef, styleName: string, styleValue: string): void;
    invokeElementMethod(location: RenderElementRef, methodName: string, args: any[]): void;
    setText(viewRef: RenderViewRef, textNodeIndex: number, text: string): void;
    setEventDispatcher(viewRef: RenderViewRef, dispatcher: RenderEventDispatcher): void;
}
export declare class DomRenderer_ extends DomRenderer {
    private _eventManager;
    private _domSharedStylesHost;
    private _animate;
    private _componentTpls;
    private _document;
    constructor(_eventManager: EventManager, _domSharedStylesHost: DomSharedStylesHost, _animate: AnimationBuilder, document: any);
    registerComponentTemplate(template: RenderComponentTemplate): void;
    createProtoView(componentTemplateId: string, cmds: RenderTemplateCmd[]): RenderProtoViewRef;
    resolveComponentTemplate(templateId: string): RenderComponentTemplate;
    createRootHostView(hostProtoViewRef: RenderProtoViewRef, fragmentCount: number, hostElementSelector: string): RenderViewWithFragments;
    createView(protoViewRef: RenderProtoViewRef, fragmentCount: number): RenderViewWithFragments;
    private _createView(protoViewRef, inplaceElement);
    destroyView(viewRef: RenderViewRef): void;
    animateNodeEnter(node: Node): void;
    animateNodeLeave(node: Node): void;
    detachFragment(fragmentRef: RenderFragmentRef): void;
    createElement(name: string, attrNameAndValues: string[]): Node;
    mergeElement(existing: Node, attrNameAndValues: string[]): void;
    private _setAttributes(node, attrNameAndValues);
    createRootContentInsertionPoint(): Node;
    createShadowRoot(host: Node, templateId: string): Node;
    on(element: Node, eventName: string, callback: Function): void;
    globalOn(target: string, eventName: string, callback: Function): Function;
}
