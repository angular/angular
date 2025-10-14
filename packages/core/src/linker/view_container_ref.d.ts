/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */
import { Injector } from '../di/injector';
import { EnvironmentInjector } from '../di/r3_injector';
import { Type } from '../interface/type';
import { LContainer } from '../render3/interfaces/container';
import { TContainerNode, TElementContainerNode, TElementNode, TNode } from '../render3/interfaces/node';
import { LView } from '../render3/interfaces/view';
import { ComponentFactory, ComponentRef } from './component_factory';
import { ElementRef } from './element_ref';
import { NgModuleRef } from './ng_module_factory';
import { TemplateRef } from './template_ref';
import { EmbeddedViewRef, ViewRef } from './view_ref';
import { Binding, DirectiveWithBindings } from '../render3/dynamic_bindings';
/**
 * Represents a container where one or more views can be attached to a component.
 *
 * Can contain *host views* (created by instantiating a
 * component with the `createComponent()` method), and *embedded views*
 * (created by instantiating a `TemplateRef` with the `createEmbeddedView()` method).
 *
 * A view container instance can contain other view containers,
 * creating a view hierarchy.
 *
 * @usageNotes
 *
 * The example below demonstrates how the `createComponent` function can be used
 * to create an instance of a ComponentRef dynamically and attach it to an ApplicationRef,
 * so that it gets included into change detection cycles.
 *
 * Note: the example uses standalone components, but the function can also be used for
 * non-standalone components (declared in an NgModule) as well.
 *
 * ```angular-ts
 * @Component({
 *   selector: 'dynamic',
 *   template: `<span>This is a content of a dynamic component.</span>`,
 * })
 * class DynamicComponent {
 *   vcr = inject(ViewContainerRef);
 * }
 *
 * @Component({
 *   selector: 'app',
 *   template: `<main>Hi! This is the main content.</main>`,
 * })
 * class AppComponent {
 *   vcr = inject(ViewContainerRef);
 *
 *   ngAfterViewInit() {
 *     const compRef = this.vcr.createComponent(DynamicComponent);
 *     compRef.changeDetectorRef.detectChanges();
 *   }
 * }
 * ```
 *
 * @see {@link ComponentRef}
 * @see {@link EmbeddedViewRef}
 *
 * @publicApi
 */
export declare abstract class ViewContainerRef {
    /**
     * Anchor element that specifies the location of this container in the containing view.
     * Each view container can have only one anchor element, and each anchor element
     * can have only a single view container.
     *
     * Root elements of views attached to this container become siblings of the anchor element in
     * the rendered view.
     *
     * Access the `ViewContainerRef` of an element by placing a `Directive` injected
     * with `ViewContainerRef` on the element, or use a `ViewChild` query.
     *
     * <!-- TODO: rename to anchorElement -->
     */
    abstract get element(): ElementRef;
    /**
     * The dependency injector for this view container.
     */
    abstract get injector(): Injector;
    /** @deprecated No replacement */
    abstract get parentInjector(): Injector;
    /**
     * Destroys all views in this container.
     */
    abstract clear(): void;
    /**
     * Retrieves a view from this container.
     * @param index The 0-based index of the view to retrieve.
     * @returns The `ViewRef` instance, or null if the index is out of range.
     */
    abstract get(index: number): ViewRef | null;
    /**
     * Reports how many views are currently attached to this container.
     * @returns The number of views.
     */
    abstract get length(): number;
    /**
     * Instantiates an embedded view and inserts it
     * into this container.
     * @param templateRef The HTML template that defines the view.
     * @param context The data-binding context of the embedded view, as declared
     * in the `<ng-template>` usage.
     * @param options Extra configuration for the created view. Includes:
     *  * index: The 0-based index at which to insert the new view into this container.
     *           If not specified, appends the new view as the last entry.
     *  * injector: Injector to be used within the embedded view.
     *
     * @returns The `ViewRef` instance for the newly created view.
     */
    abstract createEmbeddedView<C>(templateRef: TemplateRef<C>, context?: C, options?: {
        index?: number;
        injector?: Injector;
    }): EmbeddedViewRef<C>;
    /**
     * Instantiates an embedded view and inserts it
     * into this container.
     * @param templateRef The HTML template that defines the view.
     * @param context The data-binding context of the embedded view, as declared
     * in the `<ng-template>` usage.
     * @param index The 0-based index at which to insert the new view into this container.
     * If not specified, appends the new view as the last entry.
     *
     * @returns The `ViewRef` instance for the newly created view.
     */
    abstract createEmbeddedView<C>(templateRef: TemplateRef<C>, context?: C, index?: number): EmbeddedViewRef<C>;
    /**
     * Instantiates a component and inserts its host view into this view container.
     *
     * @param componentType Component Type to use.
     * @param options An object that contains extra parameters:
     *  * index: the index at which to insert the new component's host view into this container.
     *           If not specified, appends the new view as the last entry.
     *  * injector: the injector to use as the parent for the new component.
     *  * ngModuleRef: an NgModuleRef of the component's NgModule, you should almost always provide
     *                 this to ensure that all expected providers are available for the component
     *                 instantiation.
     *  * environmentInjector: an EnvironmentInjector which will provide the component's environment.
     *                 you should almost always provide this to ensure that all expected providers
     *                 are available for the component instantiation. This option is intended to
     *                 replace the `ngModuleRef` parameter.
     *  * projectableNodes: list of DOM nodes that should be projected through
     *                      [`<ng-content>`](api/core/ng-content) of the new component instance.
     *  * directives: Directives that should be applied to the component.
     *  * bindings: Bindings that should be applied to the component.
     *
     * @returns The new `ComponentRef` which contains the component instance and the host view.
     */
    abstract createComponent<C>(componentType: Type<C>, options?: {
        index?: number;
        injector?: Injector;
        ngModuleRef?: NgModuleRef<unknown>;
        environmentInjector?: EnvironmentInjector | NgModuleRef<unknown>;
        projectableNodes?: Node[][];
        directives?: (Type<unknown> | DirectiveWithBindings<unknown>)[];
        bindings?: Binding[];
    }): ComponentRef<C>;
    /**
     * Instantiates a single component and inserts its host view into this container.
     *
     * @param componentFactory Component factory to use.
     * @param index The index at which to insert the new component's host view into this container.
     * If not specified, appends the new view as the last entry.
     * @param injector The injector to use as the parent for the new component.
     * @param projectableNodes List of DOM nodes that should be projected through
     *     [`<ng-content>`](api/core/ng-content) of the new component instance.
     * @param ngModuleRef An instance of the NgModuleRef that represent an NgModule.
     * This information is used to retrieve corresponding NgModule injector.
     * @param directives Directives that should be applied to the component.
     * @param bindings Bindings that should be applied to the component.
     *
     * @returns The new `ComponentRef` which contains the component instance and the host view.
     *
     * @deprecated Angular no longer requires component factories to dynamically create components.
     *     Use different signature of the `createComponent` method, which allows passing
     *     Component class directly.
     */
    abstract createComponent<C>(componentFactory: ComponentFactory<C>, index?: number, injector?: Injector, projectableNodes?: any[][], environmentInjector?: EnvironmentInjector | NgModuleRef<any>, directives?: (Type<unknown> | DirectiveWithBindings<unknown>)[], bindings?: Binding[]): ComponentRef<C>;
    /**
     * Inserts a view into this container.
     * @param viewRef The view to insert.
     * @param index The 0-based index at which to insert the view.
     * If not specified, appends the new view as the last entry.
     * @returns The inserted `ViewRef` instance.
     *
     */
    abstract insert(viewRef: ViewRef, index?: number): ViewRef;
    /**
     * Moves a view to a new location in this container.
     * @param viewRef The view to move.
     * @param index The 0-based index of the new location.
     * @returns The moved `ViewRef` instance.
     */
    abstract move(viewRef: ViewRef, currentIndex: number): ViewRef;
    /**
     * Returns the index of a view within the current container.
     * @param viewRef The view to query.
     * @returns The 0-based index of the view's position in this container,
     * or `-1` if this container doesn't contain the view.
     */
    abstract indexOf(viewRef: ViewRef): number;
    /**
     * Destroys a view attached to this container
     * @param index The 0-based index of the view to destroy.
     * If not specified, the last view in the container is removed.
     */
    abstract remove(index?: number): void;
    /**
     * Detaches a view from this container without destroying it.
     * Use along with `insert()` to move a view within the current container.
     * @param index The 0-based index of the view to detach.
     * If not specified, the last view in the container is detached.
     */
    abstract detach(index?: number): ViewRef | null;
    /**
     * @internal
     * @nocollapse
     */
    static __NG_ELEMENT_ID__: () => ViewContainerRef;
}
/**
 * Creates a ViewContainerRef and stores it on the injector. Or, if the ViewContainerRef
 * already exists, retrieves the existing ViewContainerRef.
 *
 * @returns The ViewContainerRef instance to use
 */
export declare function injectViewContainerRef(): ViewContainerRef;
/**
 * Creates a ViewContainerRef and stores it on the injector.
 *
 * @param hostTNode The node that is requesting a ViewContainerRef
 * @param hostLView The view to which the node belongs
 * @returns The ViewContainerRef instance to use
 */
export declare function createContainerRef(hostTNode: TElementNode | TContainerNode | TElementContainerNode, hostLView: LView): ViewContainerRef;
/**
 * Looks up dehydrated views that belong to a given LContainer and populates
 * this information into the `LContainer[DEHYDRATED_VIEWS]` slot. When running
 * in client-only mode, this function is a noop.
 *
 * @param lContainer LContainer that should be populated.
 * @param tNode Corresponding TNode.
 * @param hostLView LView that hosts LContainer.
 * @returns a boolean flag that indicates whether a populating operation
 *   was successful. The operation might be unsuccessful in case is has completed
 *   previously, we are rendering in client-only mode or this content is located
 *   in a skip hydration section.
 */
export declare function populateDehydratedViewsInLContainer(lContainer: LContainer, tNode: TNode, hostLView: LView): boolean;
export declare function enableLocateOrCreateContainerRefImpl(): void;
