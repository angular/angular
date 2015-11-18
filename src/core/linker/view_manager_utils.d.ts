import { Injector, ResolvedProvider } from 'angular2/src/core/di';
import * as viewModule from './view';
import * as avmModule from './view_manager';
import { Renderer, RenderViewWithFragments } from 'angular2/src/core/render/api';
export declare class AppViewManagerUtils {
    constructor();
    getComponentInstance(parentView: viewModule.AppView, boundElementIndex: number): any;
    createView(mergedParentViewProto: viewModule.AppProtoView, renderViewWithFragments: RenderViewWithFragments, viewManager: avmModule.AppViewManager, renderer: Renderer): viewModule.AppView;
    hydrateRootHostView(hostView: viewModule.AppView, injector: Injector): void;
    attachViewInContainer(parentView: viewModule.AppView, boundElementIndex: number, contextView: viewModule.AppView, contextBoundElementIndex: number, index: number, view: viewModule.AppView): void;
    detachViewInContainer(parentView: viewModule.AppView, boundElementIndex: number, index: number): void;
    hydrateViewInContainer(parentView: viewModule.AppView, boundElementIndex: number, contextView: viewModule.AppView, contextBoundElementIndex: number, index: number, imperativelyCreatedProviders: ResolvedProvider[]): void;
    dehydrateView(initView: viewModule.AppView): void;
}
