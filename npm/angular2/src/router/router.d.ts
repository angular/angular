import { Type } from 'angular2/src/facade/lang';
import { Location } from 'angular2/platform/common';
import { RouteRegistry } from './route_registry';
import { Instruction } from './instruction';
import { RouterOutlet } from './directives/router_outlet';
import { RouteDefinition } from './route_config/route_config_impl';
/**
 * The `Router` is responsible for mapping URLs to components.
 *
 * You can see the state of the router by inspecting the read-only field `router.navigating`.
 * This may be useful for showing a spinner, for instance.
 *
 * ## Concepts
 *
 * Routers and component instances have a 1:1 correspondence.
 *
 * The router holds reference to a number of {@link RouterOutlet}.
 * An outlet is a placeholder that the router dynamically fills in depending on the current URL.
 *
 * When the router navigates from a URL, it must first recognize it and serialize it into an
 * `Instruction`.
 * The router uses the `RouteRegistry` to get an `Instruction`.
 */
export declare class Router {
    registry: RouteRegistry;
    parent: Router;
    hostComponent: any;
    root: Router;
    navigating: boolean;
    lastNavigationAttempt: string;
    /**
     * The current `Instruction` for the router
     */
    currentInstruction: Instruction;
    private _currentNavigation;
    private _outlet;
    private _auxRouters;
    private _childRouter;
    private _subject;
    constructor(registry: RouteRegistry, parent: Router, hostComponent: any, root?: Router);
    /**
     * Constructs a child router. You probably don't need to use this unless you're writing a reusable
     * component.
     */
    childRouter(hostComponent: any): Router;
    /**
     * Constructs a child router. You probably don't need to use this unless you're writing a reusable
     * component.
     */
    auxRouter(hostComponent: any): Router;
    /**
     * Register an outlet to be notified of primary route changes.
     *
     * You probably don't need to use this unless you're writing a reusable component.
     */
    registerPrimaryOutlet(outlet: RouterOutlet): Promise<any>;
    /**
     * Unregister an outlet (because it was destroyed, etc).
     *
     * You probably don't need to use this unless you're writing a custom outlet implementation.
     */
    unregisterPrimaryOutlet(outlet: RouterOutlet): void;
    /**
     * Register an outlet to notified of auxiliary route changes.
     *
     * You probably don't need to use this unless you're writing a reusable component.
     */
    registerAuxOutlet(outlet: RouterOutlet): Promise<any>;
    /**
     * Given an instruction, returns `true` if the instruction is currently active,
     * otherwise `false`.
     */
    isRouteActive(instruction: Instruction): boolean;
    /**
     * Dynamically update the routing configuration and trigger a navigation.
     *
     * ### Usage
     *
     * ```
     * router.config([
     *   { 'path': '/', 'component': IndexComp },
     *   { 'path': '/user/:id', 'component': UserComp },
     * ]);
     * ```
     */
    config(definitions: RouteDefinition[]): Promise<any>;
    /**
     * Navigate based on the provided Route Link DSL. It's preferred to navigate with this method
     * over `navigateByUrl`.
     *
     * ### Usage
     *
     * This method takes an array representing the Route Link DSL:
     * ```
     * ['./MyCmp', {param: 3}]
     * ```
     * See the {@link RouterLink} directive for more.
     */
    navigate(linkParams: any[]): Promise<any>;
    /**
     * Navigate to a URL. Returns a promise that resolves when navigation is complete.
     * It's preferred to navigate with `navigate` instead of this method, since URLs are more brittle.
     *
     * If the given URL begins with a `/`, router will navigate absolutely.
     * If the given URL does not begin with `/`, the router will navigate relative to this component.
     */
    navigateByUrl(url: string, _skipLocationChange?: boolean): Promise<any>;
    /**
     * Navigate via the provided instruction. Returns a promise that resolves when navigation is
     * complete.
     */
    navigateByInstruction(instruction: Instruction, _skipLocationChange?: boolean): Promise<any>;
    private _emitNavigationFinish(url);
    private _afterPromiseFinishNavigating(promise);
    private _canActivate(nextInstruction);
    private _routerCanDeactivate(instruction);
    /**
     * Updates this router and all descendant routers according to the given instruction
     */
    commit(instruction: Instruction, _skipLocationChange?: boolean): Promise<any>;
    /**
     * Subscribe to URL updates from the router
     */
    subscribe(onNext: (value: any) => void, onError?: (value: any) => void): Object;
    /**
     * Removes the contents of this router's outlet and all descendant outlets
     */
    deactivate(instruction: Instruction): Promise<any>;
    /**
     * Given a URL, returns an instruction representing the component graph
     */
    recognize(url: string): Promise<Instruction>;
    private _getAncestorInstructions();
    /**
     * Navigates to either the last URL successfully navigated to, or the last URL requested if the
     * router has yet to successfully navigate.
     */
    renavigate(): Promise<any>;
    /**
     * Generate an `Instruction` based on the provided Route Link DSL.
     */
    generate(linkParams: any[]): Instruction;
}
export declare class RootRouter extends Router {
    constructor(registry: RouteRegistry, location: Location, primaryComponent: Type);
    commit(instruction: Instruction, _skipLocationChange?: boolean): Promise<any>;
    dispose(): void;
}
