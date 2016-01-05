import { ChangeDetector, ChangeDispatcher, DirectiveIndex, BindingTarget, Locals } from 'angular2/src/core/change_detection/change_detection';
import { DebugContext } from 'angular2/src/core/change_detection/interfaces';
import { ElementInjector, PreBuiltObjects } from './element_injector';
import { ElementBinder } from './element_binder';
import * as renderApi from 'angular2/src/core/render/api';
import { RenderEventDispatcher } from 'angular2/src/core/render/api';
import { ViewRef, ProtoViewRef } from './view_ref';
import { ElementRef } from './element_ref';
import { ProtoPipes } from 'angular2/src/core/pipes/pipes';
import { TemplateCmd } from './template_commands';
export { DebugContext } from 'angular2/src/core/change_detection/interfaces';
export declare enum ViewType {
    HOST = 0,
    COMPONENT = 1,
    EMBEDDED = 2,
}
export declare class AppViewContainer {
    views: AppView[];
}
/**
 * Cost of making objects: http://jsperf.com/instantiate-size-of-object
 *
 */
export declare class AppView implements ChangeDispatcher, RenderEventDispatcher {
    renderer: renderApi.Renderer;
    proto: AppProtoView;
    viewOffset: number;
    elementOffset: number;
    textOffset: number;
    render: renderApi.RenderViewRef;
    renderFragment: renderApi.RenderFragmentRef;
    containerElementInjector: ElementInjector;
    views: AppView[];
    rootElementInjectors: ElementInjector[];
    elementInjectors: ElementInjector[];
    viewContainers: AppViewContainer[];
    preBuiltObjects: PreBuiltObjects[];
    elementRefs: ElementRef[];
    ref: ViewRef;
    changeDetector: ChangeDetector;
    /**
     * The context against which data-binding expressions in this view are evaluated against.
     * This is always a component instance.
     */
    context: any;
    /**
     * Variables, local to this view, that can be used in binding expressions (in addition to the
     * context). This is used for thing like `<video #player>` or
     * `<li template="for #item of items">`, where "player" and "item" are locals, respectively.
     */
    locals: Locals;
    constructor(renderer: renderApi.Renderer, proto: AppProtoView, viewOffset: number, elementOffset: number, textOffset: number, protoLocals: Map<string, any>, render: renderApi.RenderViewRef, renderFragment: renderApi.RenderFragmentRef, containerElementInjector: ElementInjector);
    init(changeDetector: ChangeDetector, elementInjectors: ElementInjector[], rootElementInjectors: ElementInjector[], preBuiltObjects: PreBuiltObjects[], views: AppView[], elementRefs: ElementRef[], viewContainers: AppViewContainer[]): void;
    setLocal(contextName: string, value: any): void;
    hydrated(): boolean;
    /**
     * Triggers the event handlers for the element and the directives.
     *
     * This method is intended to be called from directive EventEmitters.
     *
     * @param {string} eventName
     * @param {*} eventObj
     * @param {number} boundElementIndex
     */
    triggerEventHandlers(eventName: string, eventObj: Event, boundElementIndex: number): void;
    notifyOnBinding(b: BindingTarget, currentValue: any): void;
    logBindingUpdate(b: BindingTarget, value: any): void;
    notifyAfterContentChecked(): void;
    notifyAfterViewChecked(): void;
    getDirectiveFor(directive: DirectiveIndex): any;
    getNestedView(boundElementIndex: number): AppView;
    getContainerElement(): ElementRef;
    getDebugContext(elementIndex: number, directiveIndex: DirectiveIndex): DebugContext;
    getDetectorFor(directive: DirectiveIndex): any;
    invokeElementMethod(elementIndex: number, methodName: string, args: any[]): void;
    dispatchRenderEvent(boundElementIndex: number, eventName: string, locals: Map<string, any>): boolean;
    dispatchEvent(boundElementIndex: number, eventName: string, locals: Map<string, any>): boolean;
    ownBindersCount: number;
}
export declare class AppProtoViewMergeInfo {
    embeddedViewCount: number;
    elementCount: number;
    viewCount: number;
    constructor(embeddedViewCount: number, elementCount: number, viewCount: number);
}
/**
 *
 */
export declare class AppProtoView {
    templateId: string;
    templateCmds: TemplateCmd[];
    type: ViewType;
    isMergable: boolean;
    changeDetectorFactory: Function;
    templateVariableBindings: Map<string, string>;
    pipes: ProtoPipes;
    ref: ProtoViewRef;
    protoLocals: Map<string, any>;
    elementBinders: ElementBinder[];
    mergeInfo: AppProtoViewMergeInfo;
    variableLocations: Map<string, number>;
    textBindingCount: any;
    render: renderApi.RenderProtoViewRef;
    constructor(templateId: string, templateCmds: TemplateCmd[], type: ViewType, isMergable: boolean, changeDetectorFactory: Function, templateVariableBindings: Map<string, string>, pipes: ProtoPipes);
    init(render: renderApi.RenderProtoViewRef, elementBinders: ElementBinder[], textBindingCount: number, mergeInfo: AppProtoViewMergeInfo, variableLocations: Map<string, number>): void;
    isInitialized(): boolean;
}
