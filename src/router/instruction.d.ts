import { Type } from 'angular2/src/facade/lang';
import { Promise } from 'angular2/src/facade/async';
import { PathRecognizer } from './path_recognizer';
import { Url } from './url_parser';
/**
 * `RouteParams` is an immutable map of parameters for the given route
 * based on the url matcher and optional parameters for that route.
 *
 * You can inject `RouteParams` into the constructor of a component to use it.
 *
 * ### Example
 *
 * ```
 * import {bootstrap, Component} from 'angular2/angular2';
 * import {Router, ROUTER_DIRECTIVES, ROUTER_PROVIDERS, RouteConfig} from 'angular2/router';
 *
 * @Component({directives: [ROUTER_DIRECTIVES]})
 * @RouteConfig([
 *  {path: '/user/:id', component: UserCmp, as: 'UserCmp'},
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
 * import {bootstrap, Component, View} from 'angular2/angular2';
 * import {Router, ROUTER_DIRECTIVES, routerBindings, RouteConfig} from 'angular2/router';
 *
 * @Component({...})
 * @View({directives: [ROUTER_DIRECTIVES]})
 * @RouteConfig([
 *  {path: '/user/:id', component: UserCmp, as: 'UserCmp', data: {isAdmin: true}},
 * ])
 * class AppCmp {}
 *
 * @Component({...})
 * @View({ template: 'user: {{isAdmin}}' })
 * class UserCmp {
 *   string: isAdmin;
 *   constructor(data: RouteData) {
 *     this.isAdmin = data.get('isAdmin');
 *   }
 * }
 *
 * bootstrap(AppCmp, routerBindings(AppCmp));
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
 * import {bootstrap, Component} from 'angular2/angular2';
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
export declare class Instruction {
    component: ComponentInstruction;
    child: Instruction;
    auxInstruction: {
        [key: string]: Instruction;
    };
    constructor(component: ComponentInstruction, child: Instruction, auxInstruction: {
        [key: string]: Instruction;
    });
    /**
     * Returns a new instruction that shares the state of the existing instruction, but with
     * the given child {@link Instruction} replacing the existing child.
     */
    replaceChild(child: Instruction): Instruction;
}
/**
 * Represents a partially completed instruction during recognition that only has the
 * primary (non-aux) route instructions matched.
 *
 * `PrimaryInstruction` is an internal class used by `RouteRecognizer` while it's
 * figuring out where to navigate.
 */
export declare class PrimaryInstruction {
    component: ComponentInstruction;
    child: PrimaryInstruction;
    auxUrls: Url[];
    constructor(component: ComponentInstruction, child: PrimaryInstruction, auxUrls: Url[]);
}
export declare function stringifyInstruction(instruction: Instruction): string;
export declare function stringifyInstructionPath(instruction: Instruction): string;
export declare function stringifyInstructionQuery(instruction: Instruction): string;
/**
 * A `ComponentInstruction` represents the route state for a single component. An `Instruction` is
 * composed of a tree of these `ComponentInstruction`s.
 *
 * `ComponentInstructions` is a public API. Instances of `ComponentInstruction` are passed
 * to route lifecycle hooks, like {@link CanActivate}.
 *
 * `ComponentInstruction`s are [https://en.wikipedia.org/wiki/Hash_consing](hash consed). You should
 * never construct one yourself with "new." Instead, rely on {@link Router/PathRecognizer} to
 * construct `ComponentInstruction`s.
 *
 * You should not modify this object. It should be treated as immutable.
 */
export declare abstract class ComponentInstruction {
    reuse: boolean;
    urlPath: string;
    urlParams: string[];
    params: {
        [key: string]: any;
    };
    /**
     * Returns the component type of the represented route, or `null` if this instruction
     * hasn't been resolved.
     */
    componentType: any;
    /**
     * Returns a promise that will resolve to component type of the represented route.
     * If this instruction references an {@link AsyncRoute}, the `loader` function of that route
     * will run.
     */
    abstract resolveComponentType(): Promise<Type>;
    /**
     * Returns the specificity of the route associated with this `Instruction`.
     */
    specificity: any;
    /**
     * Returns `true` if the component type of this instruction has no child {@link RouteConfig},
     * or `false` if it does.
     */
    terminal: any;
    /**
     * Returns the route data of the given route that was specified in the {@link RouteDefinition},
     * or an empty object if no route data was specified.
     */
    routeData: RouteData;
}
export declare class ComponentInstruction_ extends ComponentInstruction {
    private _recognizer;
    private _routeData;
    constructor(urlPath: string, urlParams: string[], _recognizer: PathRecognizer, params?: {
        [key: string]: any;
    });
    componentType: Type;
    resolveComponentType(): Promise<Type>;
    specificity: number;
    terminal: boolean;
    routeData: RouteData;
}
