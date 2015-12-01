import { Promise } from 'angular2/src/facade/async';
import { DynamicComponentLoader, ElementRef } from 'angular2/core';
import * as routerMod from './router';
import { ComponentInstruction } from './instruction';
/**
 * A router outlet is a placeholder that Angular dynamically fills based on the application's route.
 *
 * ## Use
 *
 * ```
 * <router-outlet></router-outlet>
 * ```
 */
export declare class RouterOutlet {
    private _elementRef;
    private _loader;
    private _parentRouter;
    name: string;
    private _componentRef;
    private _currentInstruction;
    constructor(_elementRef: ElementRef, _loader: DynamicComponentLoader, _parentRouter: routerMod.Router, nameAttr: string);
    /**
     * Called by the Router to instantiate a new component during the commit phase of a navigation.
     * This method in turn is responsible for calling the `routerOnActivate` hook of its child.
     */
    activate(nextInstruction: ComponentInstruction): Promise<any>;
    /**
     * Called by the {@link Router} during the commit phase of a navigation when an outlet
     * reuses a component between different routes.
     * This method in turn is responsible for calling the `routerOnReuse` hook of its child.
     */
    reuse(nextInstruction: ComponentInstruction): Promise<any>;
    /**
     * Called by the {@link Router} when an outlet disposes of a component's contents.
     * This method in turn is responsible for calling the `routerOnDeactivate` hook of its child.
     */
    deactivate(nextInstruction: ComponentInstruction): Promise<any>;
    /**
     * Called by the {@link Router} during recognition phase of a navigation.
     *
     * If this resolves to `false`, the given navigation is cancelled.
     *
     * This method delegates to the child component's `routerCanDeactivate` hook if it exists,
     * and otherwise resolves to true.
     */
    routerCanDeactivate(nextInstruction: ComponentInstruction): Promise<boolean>;
    /**
     * Called by the {@link Router} during recognition phase of a navigation.
     *
     * If the new child component has a different Type than the existing child component,
     * this will resolve to `false`. You can't reuse an old component when the new component
     * is of a different Type.
     *
     * Otherwise, this method delegates to the child component's `routerCanReuse` hook if it exists,
     * or resolves to true if the hook is not present.
     */
    routerCanReuse(nextInstruction: ComponentInstruction): Promise<boolean>;
}
