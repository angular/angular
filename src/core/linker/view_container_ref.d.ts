import { ResolvedProvider } from 'angular2/src/core/di';
import { AppElement } from './element';
import { ElementRef, ElementRef_ } from './element_ref';
import { TemplateRef } from './template_ref';
import { EmbeddedViewRef, HostViewRef, HostViewFactoryRef, ViewRef } from './view_ref';
/**
 * Represents a container where one or more Views can be attached.
 *
 * The container can contain two kinds of Views. Host Views, created by instantiating a
 * {@link Component} via {@link #createHostView}, and Embedded Views, created by instantiating an
 * {@link TemplateRef Embedded Template} via {@link #createEmbeddedView}.
 *
 * The location of the View Container within the containing View is specified by the Anchor
 * `element`. Each View Container can have only one Anchor Element and each Anchor Element can only
 * have a single View Container.
 *
 * Root elements of Views attached to this container become siblings of the Anchor Element in
 * the Rendered View.
 *
 * To access a `ViewContainerRef` of an Element, you can either place a {@link Directive} injected
 * with `ViewContainerRef` on the Element, or you obtain it via
 * {@link AppViewManager#getViewContainer}.
 *
 * <!-- TODO(i): we are also considering ElementRef#viewContainer api -->
 */
export declare abstract class ViewContainerRef {
    /**
     * Anchor element that specifies the location of this container in the containing View.
     * <!-- TODO: rename to anchorElement -->
     */
    element: ElementRef;
    /**
     * Destroys all Views in this container.
     */
    clear(): void;
    /**
     * Returns the {@link ViewRef} for the View located in this container at the specified index.
     */
    abstract get(index: number): ViewRef;
    /**
     * Returns the number of Views currently attached to this container.
     */
    length: number;
    /**
     * Instantiates an Embedded View based on the {@link TemplateRef `templateRef`} and inserts it
     * into this container at the specified `index`.
     *
     * If `index` is not specified, the new View will be inserted as the last View in the container.
     *
     * Returns the {@link ViewRef} for the newly created View.
     */
    abstract createEmbeddedView(templateRef: TemplateRef, index?: number): EmbeddedViewRef;
    /**
     * Instantiates a single {@link Component} and inserts its Host View into this container at the
     * specified `index`.
     *
     * The component is instantiated using its {@link ProtoViewRef `protoView`} which can be
     * obtained via {@link Compiler#compileInHost}.
     *
     * If `index` is not specified, the new View will be inserted as the last View in the container.
     *
     * You can optionally specify `dynamicallyCreatedProviders`, which configure the {@link Injector}
     * that will be created for the Host View.
     *
     * Returns the {@link HostViewRef} of the Host View created for the newly instantiated Component.
     */
    abstract createHostView(hostViewFactoryRef: HostViewFactoryRef, index?: number, dynamicallyCreatedProviders?: ResolvedProvider[], projectableNodes?: any[][]): HostViewRef;
    /**
     * Inserts a View identified by a {@link ViewRef} into the container at the specified `index`.
     *
     * If `index` is not specified, the new View will be inserted as the last View in the container.
     *
     * Returns the inserted {@link ViewRef}.
     */
    abstract insert(viewRef: EmbeddedViewRef, index?: number): EmbeddedViewRef;
    /**
     * Returns the index of the View, specified via {@link ViewRef}, within the current container or
     * `-1` if this container doesn't contain the View.
     */
    abstract indexOf(viewRef: ViewRef): number;
    /**
     * Destroys a View attached to this container at the specified `index`.
     *
     * If `index` is not specified, the last View in the container will be removed.
     */
    abstract remove(index?: number): void;
    /**
     * Use along with {@link #insert} to move a View within the current container.
     *
     * If the `index` param is omitted, the last {@link ViewRef} is detached.
     */
    abstract detach(index?: number): EmbeddedViewRef;
}
export declare class ViewContainerRef_ extends ViewContainerRef {
    private _element;
    constructor(_element: AppElement);
    get(index: number): EmbeddedViewRef;
    length: number;
    element: ElementRef_;
    createEmbeddedView(templateRef: TemplateRef, index?: number): EmbeddedViewRef;
    createHostView(hostViewFactoryRef: HostViewFactoryRef, index?: number, dynamicallyCreatedProviders?: ResolvedProvider[], projectableNodes?: any[][]): HostViewRef;
    insert(viewRef: ViewRef, index?: number): EmbeddedViewRef;
    indexOf(viewRef: ViewRef): number;
    remove(index?: number): void;
    detach(index?: number): EmbeddedViewRef;
}
