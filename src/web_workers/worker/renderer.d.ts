import { Renderer, RenderProtoViewRef, RenderViewRef, RenderElementRef, RenderEventDispatcher, RenderViewWithFragments, RenderFragmentRef, RenderTemplateCmd, RenderComponentTemplate } from 'angular2/src/core/render/api';
import { ClientMessageBrokerFactory } from "angular2/src/web_workers/shared/client_message_broker";
import { RenderProtoViewRefStore } from 'angular2/src/web_workers/shared/render_proto_view_ref_store';
import { RenderViewWithFragmentsStore } from 'angular2/src/web_workers/shared/render_view_with_fragments_store';
import { WebWorkerEventDispatcher } from 'angular2/src/web_workers/worker/event_dispatcher';
export declare class WebWorkerRenderer implements Renderer {
    private _renderProtoViewRefStore;
    private _renderViewStore;
    private _eventDispatcher;
    private _messageBroker;
    constructor(messageBrokerFactory: ClientMessageBrokerFactory, _renderProtoViewRefStore: RenderProtoViewRefStore, _renderViewStore: RenderViewWithFragmentsStore, _eventDispatcher: WebWorkerEventDispatcher);
    registerComponentTemplate(template: RenderComponentTemplate): void;
    createProtoView(componentTemplateId: string, cmds: RenderTemplateCmd[]): RenderProtoViewRef;
    /**
     * Creates a root host view that includes the given element.
     * Note that the fragmentCount needs to be passed in so that we can create a result
     * synchronously even when dealing with webworkers!
     *
     * @param {RenderProtoViewRef} hostProtoViewRef a RenderProtoViewRef of type
     * ProtoViewDto.HOST_VIEW_TYPE
     * @param {any} hostElementSelector css selector for the host element (will be queried against the
     * main document)
     * @return {RenderViewRef} the created view
     */
    createRootHostView(hostProtoViewRef: RenderProtoViewRef, fragmentCount: number, hostElementSelector: string): RenderViewWithFragments;
    /**
     * Creates a regular view out of the given ProtoView
     * Note that the fragmentCount needs to be passed in so that we can create a result
     * synchronously even when dealing with webworkers!
     */
    createView(protoViewRef: RenderProtoViewRef, fragmentCount: number): RenderViewWithFragments;
    private _createViewHelper(protoViewRef, fragmentCount, hostElementSelector?);
    /**
     * Destroys the given view after it has been dehydrated and detached
     */
    destroyView(viewRef: RenderViewRef): void;
    /**
     * Attaches a fragment after another fragment.
     */
    attachFragmentAfterFragment(previousFragmentRef: RenderFragmentRef, fragmentRef: RenderFragmentRef): void;
    /**
     * Attaches a fragment after an element.
     */
    attachFragmentAfterElement(elementRef: RenderElementRef, fragmentRef: RenderFragmentRef): void;
    /**
     * Detaches a fragment.
     */
    detachFragment(fragmentRef: RenderFragmentRef): void;
    /**
     * Hydrates a view after it has been attached. Hydration/dehydration is used for reusing views
     * inside of the view pool.
     */
    hydrateView(viewRef: RenderViewRef): void;
    /**
     * Dehydrates a view after it has been attached. Hydration/dehydration is used for reusing views
     * inside of the view pool.
     */
    dehydrateView(viewRef: RenderViewRef): void;
    /**
     * Returns the native element at the given location.
     * Attention: In a WebWorker scenario, this should always return null!
     */
    getNativeElementSync(location: RenderElementRef): any;
    /**
     * Sets a property on an element.
     */
    setElementProperty(location: RenderElementRef, propertyName: string, propertyValue: any): void;
    /**
     * Sets an attribute on an element.
     */
    setElementAttribute(location: RenderElementRef, attributeName: string, attributeValue: string): void;
    setBindingDebugInfo(location: RenderElementRef, propertyName: string, propertyValue: string): void;
    /**
     * Sets a class on an element.
     */
    setElementClass(location: RenderElementRef, className: string, isAdd: boolean): void;
    /**
     * Sets a style on an element.
     */
    setElementStyle(location: RenderElementRef, styleName: string, styleValue: string): void;
    /**
     * Calls a method on an element.
     * Note: For now we're assuming that everything in the args list are primitive
     */
    invokeElementMethod(location: RenderElementRef, methodName: string, args: any[]): void;
    /**
     * Sets the value of a text node.
     */
    setText(viewRef: RenderViewRef, textNodeIndex: number, text: string): void;
    /**
     * Sets the dispatcher for all events of the given view
     */
    setEventDispatcher(viewRef: RenderViewRef, dispatcher: RenderEventDispatcher): void;
}
