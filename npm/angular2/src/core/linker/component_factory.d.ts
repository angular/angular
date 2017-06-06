import { Injector } from 'angular2/src/core/di';
import { Type } from 'angular2/src/facade/lang';
import { ElementRef } from './element_ref';
import { ViewRef } from './view_ref';
import { AppElement } from './element';
import { ChangeDetectorRef } from '../change_detection/change_detection';
/**
 * Represents an instance of a Component created via a {@link ComponentFactory}.
 *
 * `ComponentRef` provides access to the Component Instance as well other objects related to this
 * Component Instance and allows you to destroy the Component Instance via the {@link #destroy}
 * method.
 */
export declare abstract class ComponentRef<C> {
    /**
     * Location of the Host Element of this Component Instance.
     */
    location: ElementRef;
    /**
     * The injector on which the component instance exists.
     */
    injector: Injector;
    /**
     * The instance of the Component.
     */
    instance: C;
    /**
     * The {@link ViewRef} of the Host View of this Component instance.
     */
    hostView: ViewRef;
    /**
     * The {@link ChangeDetectorRef} of the Component instance.
     */
    changeDetectorRef: ChangeDetectorRef;
    /**
     * The component type.
     */
    componentType: Type;
    /**
     * Destroys the component instance and all of the data structures associated with it.
     */
    abstract destroy(): void;
    /**
     * Allows to register a callback that will be called when the component is destroyed.
     */
    abstract onDestroy(callback: Function): void;
}
export declare class ComponentRef_<C> extends ComponentRef<C> {
    private _hostElement;
    private _componentType;
    constructor(_hostElement: AppElement, _componentType: Type);
    location: ElementRef;
    injector: Injector;
    instance: C;
    hostView: ViewRef;
    changeDetectorRef: ChangeDetectorRef;
    componentType: Type;
    destroy(): void;
    onDestroy(callback: Function): void;
}
export declare class ComponentFactory<C> {
    selector: string;
    private _viewFactory;
    private _componentType;
    constructor(selector: string, _viewFactory: Function, _componentType: Type);
    componentType: Type;
    /**
     * Creates a new component.
     */
    create(injector: Injector, projectableNodes?: any[][], rootSelectorOrNode?: string | any): ComponentRef<C>;
}
