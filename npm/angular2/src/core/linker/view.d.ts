import { Injector } from 'angular2/src/core/di';
import { AppElement } from './element';
import { Renderer, RenderComponentType, RenderDebugInfo } from 'angular2/src/core/render/api';
import { ViewRef_ } from './view_ref';
import { ViewType } from './view_type';
import { ViewUtils } from './view_utils';
import { ChangeDetectorRef, ChangeDetectionStrategy, ChangeDetectorState } from 'angular2/src/core/change_detection/change_detection';
import { StaticNodeDebugInfo, DebugContext } from './debug_context';
/**
 * Cost of making objects: http://jsperf.com/instantiate-size-of-object
 *
 */
export declare abstract class AppView<T> {
    clazz: any;
    componentType: RenderComponentType;
    type: ViewType;
    viewUtils: ViewUtils;
    parentInjector: Injector;
    declarationAppElement: AppElement;
    cdMode: ChangeDetectionStrategy;
    ref: ViewRef_<T>;
    rootNodesOrAppElements: any[];
    allNodes: any[];
    disposables: Function[];
    subscriptions: any[];
    contentChildren: AppView<any>[];
    viewChildren: AppView<any>[];
    viewContainerElement: AppElement;
    cdState: ChangeDetectorState;
    projectableNodes: Array<any | any[]>;
    destroyed: boolean;
    renderer: Renderer;
    private _hasExternalHostElement;
    context: T;
    constructor(clazz: any, componentType: RenderComponentType, type: ViewType, viewUtils: ViewUtils, parentInjector: Injector, declarationAppElement: AppElement, cdMode: ChangeDetectionStrategy);
    create(context: T, givenProjectableNodes: Array<any | any[]>, rootSelectorOrNode: string | any): AppElement;
    /**
     * Overwritten by implementations.
     * Returns the AppElement for the host element for ViewType.HOST.
     */
    createInternal(rootSelectorOrNode: string | any): AppElement;
    init(rootNodesOrAppElements: any[], allNodes: any[], disposables: Function[], subscriptions: any[]): void;
    selectOrCreateHostElement(elementName: string, rootSelectorOrNode: string | any, debugInfo: RenderDebugInfo): any;
    injectorGet(token: any, nodeIndex: number, notFoundResult: any): any;
    /**
     * Overwritten by implementations
     */
    injectorGetInternal(token: any, nodeIndex: number, notFoundResult: any): any;
    injector(nodeIndex: number): Injector;
    destroy(): void;
    private _destroyRecurse();
    destroyLocal(): void;
    /**
     * Overwritten by implementations
     */
    destroyInternal(): void;
    changeDetectorRef: ChangeDetectorRef;
    parent: AppView<any>;
    flatRootNodes: any[];
    lastRootNode: any;
    /**
     * Overwritten by implementations
     */
    dirtyParentQueriesInternal(): void;
    detectChanges(throwOnChange: boolean): void;
    /**
     * Overwritten by implementations
     */
    detectChangesInternal(throwOnChange: boolean): void;
    detectContentChildrenChanges(throwOnChange: boolean): void;
    detectViewChildrenChanges(throwOnChange: boolean): void;
    addToContentChildren(renderAppElement: AppElement): void;
    removeFromContentChildren(renderAppElement: AppElement): void;
    markAsCheckOnce(): void;
    markPathToRootAsCheckOnce(): void;
    eventHandler(cb: Function): Function;
    throwDestroyedError(details: string): void;
}
export declare class DebugAppView<T> extends AppView<T> {
    staticNodeDebugInfos: StaticNodeDebugInfo[];
    private _currentDebugContext;
    constructor(clazz: any, componentType: RenderComponentType, type: ViewType, viewUtils: ViewUtils, parentInjector: Injector, declarationAppElement: AppElement, cdMode: ChangeDetectionStrategy, staticNodeDebugInfos: StaticNodeDebugInfo[]);
    create(context: T, givenProjectableNodes: Array<any | any[]>, rootSelectorOrNode: string | any): AppElement;
    injectorGet(token: any, nodeIndex: number, notFoundResult: any): any;
    destroyLocal(): void;
    detectChanges(throwOnChange: boolean): void;
    private _resetDebug();
    debug(nodeIndex: number, rowNum: number, colNum: number): DebugContext;
    private _rethrowWithContext(e, stack);
    eventHandler(cb: Function): Function;
}
