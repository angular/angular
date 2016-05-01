/**
 * `RouteParams` is an immutable map of parameters for the given route
 * based on the url matcher and optional parameters for that route.
 *
 * You can inject `RouteParams` into the constructor of a component to use it.
 *
 * ### Example
 *
 * ```
 * import {Component} from 'angular2/core';
 * import {bootstrap} from 'angular2/platform/browser';
 * import {Router, ROUTER_DIRECTIVES, ROUTER_PROVIDERS, RouteConfig, RouteParams} from
 * 'angular2/router';
 *
 * @Component({directives: [ROUTER_DIRECTIVES]})
 * @RouteConfig([
 *  {path: '/user/:id', component: UserCmp, name: 'UserCmp'},
 * ])
 * class AppCmp {}
 *
 * @Component({ template: 'user: {{id}}' })
 * class UserCmp {
 *   id: string;
 *   constructor(params: RouteParams) {
 *     this.id = params.get('id');
 *   }
 * }
 *
 * bootstrap(AppCmp, ROUTER_PROVIDERS);
 * ```
 */
export declare class RouteParams {
    params: {
        [key: string]: string;
    };
    constructor(params: {
        [key: string]: string;
    });
    get(param: string): string;
}
/**
 * `RouteData` is an immutable map of additional data you can configure in your {@link Route}.
 *
 * You can inject `RouteData` into the constructor of a component to use it.
 *
 * ### Example
 *
 * ```
 * import {Component} from 'angular2/core';
 * import {bootstrap} from 'angular2/platform/browser';
 * import {Router, ROUTER_DIRECTIVES, ROUTER_PROVIDERS, RouteConfig, RouteData} from
 * 'angular2/router';
 *
 * @Component({directives: [ROUTER_DIRECTIVES]})
 * @RouteConfig([
 *  {path: '/user/:id', component: UserCmp, name: 'UserCmp', data: {isAdmin: true}},
 * ])
 * class AppCmp {}
 *
 * @Component({
 *   ...,
 *   template: 'user: {{isAdmin}}'
 * })
 * class UserCmp {
 *   string: isAdmin;
 *   constructor(data: RouteData) {
 *     this.isAdmin = data.get('isAdmin');
 *   }
 * }
 *
 * bootstrap(AppCmp, ROUTER_PROVIDERS);
 * ```
 */
export declare class RouteData {
    data: {
        [key: string]: any;
    };
    constructor(data?: {
        [key: string]: any;
    });
    get(key: string): any;
}
export declare var BLANK_ROUTE_DATA: RouteData;
/**
 * `Instruction` is a tree of {@link ComponentInstruction}s with all the information needed
 * to transition each component in the app to a given route, including all auxiliary routes.
 *
 * `Instruction`s can be created using {@link Router#generate}, and can be used to
 * perform route changes with {@link Router#navigateByInstruction}.
 *
 * ### Example
 *
 * ```
 * import {Component} from 'angular2/core';
 * import {bootstrap} from 'angular2/platform/browser';
 * import {Router, ROUTER_DIRECTIVES, ROUTER_PROVIDERS, RouteConfig} from 'angular2/router';
 *
 * @Component({directives: [ROUTER_DIRECTIVES]})
 * @RouteConfig([
 *  {...},
 * ])
 * class AppCmp {
 *   constructor(router: Router) {
 *     var instruction = router.generate(['/MyRoute']);
 *     router.navigateByInstruction(instruction);
 *   }
 * }
 *
 * bootstrap(AppCmp, ROUTER_PROVIDERS);
 * ```
 */
export declare abstract class Instruction {
    component: ComponentInstruction;
    child: Instruction;
    auxInstruction: {
        [key: string]: Instruction;
    };
    constructor(component: ComponentInstruction, child: Instruction, auxInstruction: {
        [key: string]: Instruction;
    });
    urlPath: string;
    urlParams: string[];
    specificity: string;
    abstract resolveComponent(): Promise<ComponentInstruction>;
    /**
     * converts the instruction into a URL string
     */
    toRootUrl(): string;
    toUrlQuery(): string;
    /**
     * Returns a new instruction that shares the state of the existing instruction, but with
     * the given child {@link Instruction} replacing the existing child.
     */
    replaceChild(child: Instruction): Instruction;
    /**
     * If the final URL for the instruction is ``
     */
    toUrlPath(): string;
    toLinkUrl(): string;
}
/**
 * a resolved instruction has an outlet instruction for itself, but maybe not for...
 */
export declare class ResolvedInstruction extends Instruction {
    constructor(component: ComponentInstruction, child: Instruction, auxInstruction: {
        [key: string]: Instruction;
    });
    resolveComponent(): Promise<ComponentInstruction>;
}
/**
 * Represents a resolved default route
 */
export declare class DefaultInstruction extends ResolvedInstruction {
    constructor(component: ComponentInstruction, child: DefaultInstruction);
    toLinkUrl(): string;
}
/**
 * Represents a component that may need to do some redirection or lazy loading at a later time.
 */
export declare class UnresolvedInstruction extends Instruction {
    private _resolver;
    private _urlPath;
    private _urlParams;
    constructor(_resolver: () => Promise<Instruction>, _urlPath?: string, _urlParams?: string[]);
    urlPath: string;
    urlParams: string[];
    resolveComponent(): Promise<ComponentInstruction>;
}
export declare class RedirectInstruction extends ResolvedInstruction {
    private _specificity;
    constructor(component: ComponentInstruction, child: Instruction, auxInstruction: {
        [key: string]: Instruction;
    }, _specificity: string);
    specificity: string;
}
/**
 * A `ComponentInstruction` represents the route state for a single component.
 *
 * `ComponentInstructions` is a public API. Instances of `ComponentInstruction` are passed
 * to route lifecycle hooks, like {@link CanActivate}.
 *
 * `ComponentInstruction`s are [hash consed](https://en.wikipedia.org/wiki/Hash_consing). You should
 * never construct one yourself with "new." Instead, rely on router's internal recognizer to
 * construct `ComponentInstruction`s.
 *
 * You should not modify this object. It should be treated as immutable.
 */
export declare class ComponentInstruction {
    urlPath: string;
    urlParams: string[];
    componentType: any;
    terminal: boolean;
    specificity: string;
    params: {
        [key: string]: string;
    };
    routeName: string;
    reuse: boolean;
    routeData: RouteData;
}
