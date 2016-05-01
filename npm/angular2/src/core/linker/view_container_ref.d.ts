import { Injector } from 'angular2/src/core/di/injector';
import { AppElement } from './element';
import { ElementRef } from './element_ref';
import { TemplateRef } from './template_ref';
import { EmbeddedViewRef, ViewRef } from './view_ref';
import { ComponentFactory, ComponentRef } from './component_factory';
/**
 * Represents a container where one or more Views can be attached.
 *
 * The container can contain two kinds of Views. Host Views, created by instantiating a
 * {@link Component} via {@link #createComponent}, and Embedded Views, created by instantiating an
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
 * with `ViewContainerRef` on the Element, or you obtain it via a {@link ViewChild} query.
 */
export declare abstract class ViewContainerRef {
    /**
     * Anchor element that specifies the location of this container in the containing View.
     * <!-- TODO: rename to anchorElement -->
     */
    element: ElementRef;
    injector: Injector;
    parentInjector: Injector;
    /**
     * Destroys all Views in this container.
     */
    abstract clear(): void;
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
    abstract createEmbeddedView<C>(templateRef: TemplateRef<C>, context?: C, index?: number): EmbeddedViewRef<C>;
    /**
     * Instantiates a single {@link Component} and inserts its Host View into this container at the
     * specified `index`.
     *
     * The component is instantiated using its {@link ComponentFactory} which can be
     * obtained via {@link ComponentResolver#resolveComponent}.
     *
     * If `index` is not specified, the new View will be inserted as the last View in the container.
     *
     * You can optionally specify the {@link Injector} that will be used as parent for the Component.
     *
     * Returns the {@link ComponentRef} of the Host View created for the newly instantiated Component.
     */
    abstract createComponent<C>(componentFactory: ComponentFactory<C>, index?: number, injector?: Injector, projectableNodes?: any[][]): ComponentRef<C>;
    /**
     * Inserts a View identified by a {@link ViewRef} into the container at the specified `index`.
     *
     * If `index` is not specified, the new View will be inserted as the last View in the container.
     *
     * Returns the inserted {@link ViewRef}.
     */
    abstract insert(viewRef: ViewRef, index?: number): ViewRef;
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
    abstract detach(index?: number): ViewRef;
}
export declare class ViewContainerRef_ implements ViewContainerRef {
    private _element;
    constructor(_element: AppElement);
    get(index: number): ViewRef;
    length: number;
    element: ElementRef;
    injector: Injector;
    parentInjector: Injector;
    createEmbeddedView<C>(templateRef: TemplateRef<C>, context?: C, index?: number): EmbeddedViewRef<C>;
    createComponent<C>(componentFactory: ComponentFactory<C>, index?: number, injector?: Injector, projectableNodes?: any[][]): ComponentRef<C>;
    insert(viewRef: ViewRef, index?: number): ViewRef;
    indexOf(viewRef: ViewRef): number;
    remove(index?: number): void;
    detach(index?: number): ViewRef;
    clear(): void;
}
