import { ChangeDetector, ChangeDispatcher, DirectiveIndex, BindingTarget, Locals, ChangeDetectorRef } from 'angular2/src/core/change_detection/change_detection';
import { ResolvedProvider, Injector } from 'angular2/src/core/di';
import { DebugContext } from 'angular2/src/core/change_detection/interfaces';
import { AppElement } from './element';
import { Type } from 'angular2/src/facade/lang';
import { Renderer } from 'angular2/src/core/render/api';
import { ViewRef_ } from './view_ref';
import { ProtoPipes } from 'angular2/src/core/pipes/pipes';
export { DebugContext } from 'angular2/src/core/change_detection/interfaces';
import { Pipes } from 'angular2/src/core/pipes/pipes';
import { AppViewManager_ } from './view_manager';
import { ResolvedMetadataCache } from './resolved_metadata_cache';
import { ViewType } from './view_type';
/**
 * Cost of making objects: http://jsperf.com/instantiate-size-of-object
 *
 */
export declare class AppView implements ChangeDispatcher {
    proto: AppProtoView;
    renderer: Renderer;
    viewManager: AppViewManager_;
    projectableNodes: Array<any | any[]>;
    containerAppElement: AppElement;
    changeDetector: ChangeDetector;
    ref: ViewRef_;
    rootNodesOrAppElements: any[];
    allNodes: any[];
    disposables: Function[];
    appElements: AppElement[];
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
    pipes: Pipes;
    parentInjector: Injector;
    /**
     * Whether root injectors of this view
     * have a hostBoundary.
     */
    hostInjectorBoundary: boolean;
    destroyed: boolean;
    constructor(proto: AppProtoView, renderer: Renderer, viewManager: AppViewManager_, projectableNodes: Array<any | any[]>, containerAppElement: AppElement, imperativelyCreatedProviders: ResolvedProvider[], rootInjector: Injector, changeDetector: ChangeDetector);
    init(rootNodesOrAppElements: any[], allNodes: any[], disposables: Function[], appElements: AppElement[]): void;
    destroy(): void;
    notifyOnDestroy(): void;
    changeDetectorRef: ChangeDetectorRef;
    flatRootNodes: any[];
    hasLocal(contextName: string): boolean;
    setLocal(contextName: string, value: any): void;
    notifyOnBinding(b: BindingTarget, currentValue: any): void;
    logBindingUpdate(b: BindingTarget, value: any): void;
    notifyAfterContentChecked(): void;
    notifyAfterViewChecked(): void;
    getDebugContext(appElement: AppElement, elementIndex: number, directiveIndex: number): DebugContext;
    getDirectiveFor(directive: DirectiveIndex): any;
    getDetectorFor(directive: DirectiveIndex): ChangeDetector;
    /**
     * Triggers the event handlers for the element and the directives.
     *
     * This method is intended to be called from directive EventEmitters.
     *
     * @param {string} eventName
     * @param {*} eventObj
     * @param {number} boundElementIndex
     * @return false if preventDefault must be applied to the DOM event
     */
    triggerEventHandlers(eventName: string, eventObj: Event, boundElementIndex: number): boolean;
}
/**
 *
 */
export declare class AppProtoView {
    type: ViewType;
    protoPipes: ProtoPipes;
    templateVariableBindings: {
        [key: string]: string;
    };
    static create(metadataCache: ResolvedMetadataCache, type: ViewType, pipes: Type[], templateVariableBindings: {
        [key: string]: string;
    }): AppProtoView;
    constructor(type: ViewType, protoPipes: ProtoPipes, templateVariableBindings: {
        [key: string]: string;
    });
}
export declare class HostViewFactory {
    selector: string;
    viewFactory: Function;
    constructor(selector: string, viewFactory: Function);
}
export declare function flattenNestedViewRenderNodes(nodes: any[]): any[];
export declare function checkSlotCount(componentName: string, expectedSlotCount: number, projectableNodes: any[][]): void;
