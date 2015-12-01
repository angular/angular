import { Injector, ResolvedProvider } from 'angular2/src/core/di';
import { ElementRef } from './element_ref';
import { ProtoViewRef, ViewRef, HostViewRef } from './view_ref';
import { ViewContainerRef } from './view_container_ref';
import { TemplateRef } from './template_ref';
import { Renderer } from 'angular2/src/core/render/api';
import { AppViewManagerUtils } from './view_manager_utils';
import { AppViewPool } from './view_pool';
import { AppViewListener } from './view_listener';
/**
 * Service exposing low level API for creating, moving and destroying Views.
 *
 * Most applications should use higher-level abstractions like {@link DynamicComponentLoader} and
 * {@link ViewContainerRef} instead.
 */
export declare abstract class AppViewManager {
    /**
     * Returns a {@link ViewContainerRef} of the View Container at the specified location.
     */
    abstract getViewContainer(location: ElementRef): ViewContainerRef;
    /**
     * Returns the {@link ElementRef} that makes up the specified Host View.
     */
    getHostElement(hostViewRef: HostViewRef): ElementRef;
    /**
     * Searches the Component View of the Component specified via `hostLocation` and returns the
     * {@link ElementRef} for the Element identified via a Variable Name `variableName`.
     *
     * Throws an exception if the specified `hostLocation` is not a Host Element of a Component, or if
     * variable `variableName` couldn't be found in the Component View of this Component.
     */
    abstract getNamedElementInComponentView(hostLocation: ElementRef, variableName: string): ElementRef;
    /**
     * Returns the component instance for the provided Host Element.
     */
    abstract getComponent(hostLocation: ElementRef): any;
    /**
     * Creates an instance of a Component and attaches it to the first element in the global View
     * (usually DOM Document) that matches the component's selector or `overrideSelector`.
     *
     * This as a low-level way to bootstrap an application and upgrade an existing Element to a
     * Host Element. Most applications should use {@link DynamicComponentLoader#loadAsRoot} instead.
     *
     * The Component and its View are created based on the `hostProtoViewRef` which can be obtained
     * by compiling the component with {@link Compiler#compileInHost}.
     *
     * Use {@link AppViewManager#destroyRootHostView} to destroy the created Component and it's Host
     * View.
     *
     * ### Example
     *
     * ```
     * @ng.Component({
     *   selector: 'child-component'
     * })
     * @ng.View({
     *   template: 'Child'
     * })
     * class ChildComponent {
     *
     * }
     *
     * @ng.Component({
     *   selector: 'my-app'
     * })
     * @ng.View({
     *   template: `
     *     Parent (<some-component></some-component>)
     *   `
     * })
     * class MyApp implements OnDestroy {
     *   viewRef: ng.ViewRef;
     *
     *   constructor(public appViewManager: ng.AppViewManager, compiler: ng.Compiler) {
     *     compiler.compileInHost(ChildComponent).then((protoView: ng.ProtoViewRef) => {
     *       this.viewRef = appViewManager.createRootHostView(protoView, 'some-component', null);
     *     })
     *   }
     *
     *   ngOnDestroy() {
     *     this.appViewManager.destroyRootHostView(this.viewRef);
     *     this.viewRef = null;
     *   }
     * }
     *
     * ng.bootstrap(MyApp);
     * ```
     */
    abstract createRootHostView(hostProtoViewRef: ProtoViewRef, overrideSelector: string, injector: Injector): HostViewRef;
    /**
     * Destroys the Host View created via {@link AppViewManager#createRootHostView}.
     *
     * Along with the Host View, the Component Instance as well as all nested View and Components are
     * destroyed as well.
     */
    abstract destroyRootHostView(hostViewRef: HostViewRef): any;
    /**
     * Instantiates an Embedded View based on the {@link TemplateRef `templateRef`} and inserts it
     * into the View Container specified via `viewContainerLocation` at the specified `index`.
     *
     * Returns the {@link ViewRef} for the newly created View.
     *
     * This as a low-level way to create and attach an Embedded via to a View Container. Most
     * applications should used {@link ViewContainerRef#createEmbeddedView} instead.
     *
     * Use {@link AppViewManager#destroyViewInContainer} to destroy the created Embedded View.
     */
    abstract createEmbeddedViewInContainer(viewContainerLocation: ElementRef, index: number, templateRef: TemplateRef): ViewRef;
    /**
     * Instantiates a single {@link Component} and inserts its Host View into the View Container
     * found at `viewContainerLocation`. Within the container, the view will be inserted at position
     * specified via `index`.
     *
     * The component is instantiated using its {@link ProtoViewRef `protoViewRef`} which can be
     * obtained via {@link Compiler#compileInHost}.
     *
     * You can optionally specify `imperativelyCreatedInjector`, which configure the {@link Injector}
     * that will be created for the Host View.
     *
     * Returns the {@link HostViewRef} of the Host View created for the newly instantiated Component.
     *
     * Use {@link AppViewManager#destroyViewInContainer} to destroy the created Host View.
     */
    abstract createHostViewInContainer(viewContainerLocation: ElementRef, index: number, protoViewRef: ProtoViewRef, imperativelyCreatedInjector: ResolvedProvider[]): HostViewRef;
    /**
     * Destroys an Embedded or Host View attached to a View Container at the specified `index`.
     *
     * The View Container is located via `viewContainerLocation`.
     */
    abstract destroyViewInContainer(viewContainerLocation: ElementRef, index: number): any;
    /**
     *
     * See {@link AppViewManager#detachViewInContainer}.
     */
    abstract attachViewInContainer(viewContainerLocation: ElementRef, index: number, viewRef: ViewRef): ViewRef;
    /**
     * See {@link AppViewManager#attachViewInContainer}.
     */
    abstract detachViewInContainer(viewContainerLocation: ElementRef, index: number): ViewRef;
}
export declare class AppViewManager_ extends AppViewManager {
    private _viewPool;
    private _viewListener;
    private _utils;
    private _renderer;
    private _protoViewFactory;
    constructor(_viewPool: AppViewPool, _viewListener: AppViewListener, _utils: AppViewManagerUtils, _renderer: Renderer, _protoViewFactory: any);
    getViewContainer(location: ElementRef): ViewContainerRef;
    getNamedElementInComponentView(hostLocation: ElementRef, variableName: string): ElementRef;
    getComponent(hostLocation: ElementRef): any;
    createRootHostView(hostProtoViewRef: ProtoViewRef, overrideSelector: string, injector: Injector): HostViewRef;
    destroyRootHostView(hostViewRef: HostViewRef): void;
    createEmbeddedViewInContainer(viewContainerLocation: ElementRef, index: number, templateRef: TemplateRef): ViewRef;
    createHostViewInContainer(viewContainerLocation: ElementRef, index: number, protoViewRef: ProtoViewRef, imperativelyCreatedInjector: ResolvedProvider[]): HostViewRef;
    destroyViewInContainer(viewContainerLocation: ElementRef, index: number): void;
    attachViewInContainer(viewContainerLocation: ElementRef, index: number, viewRef: ViewRef): ViewRef;
    detachViewInContainer(viewContainerLocation: ElementRef, index: number): ViewRef;
}
