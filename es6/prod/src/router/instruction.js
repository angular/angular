import { StringMapWrapper } from 'angular2/src/facade/collection';
import { unimplemented } from 'angular2/src/facade/exceptions';
import { isPresent, isBlank, normalizeBlank, CONST_EXPR } from 'angular2/src/facade/lang';
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
export class RouteParams {
    constructor(params) {
        this.params = params;
    }
    get(param) { return normalizeBlank(StringMapWrapper.get(this.params, param)); }
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
export class RouteData {
    constructor(data = CONST_EXPR({})) {
        this.data = data;
    }
    get(key) { return normalizeBlank(StringMapWrapper.get(this.data, key)); }
}
var BLANK_ROUTE_DATA = new RouteData();
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
export class Instruction {
    constructor(component, child, auxInstruction) {
        this.component = component;
        this.child = child;
        this.auxInstruction = auxInstruction;
    }
    /**
     * Returns a new instruction that shares the state of the existing instruction, but with
     * the given child {@link Instruction} replacing the existing child.
     */
    replaceChild(child) {
        return new Instruction(this.component, child, this.auxInstruction);
    }
}
/**
 * Represents a partially completed instruction during recognition that only has the
 * primary (non-aux) route instructions matched.
 *
 * `PrimaryInstruction` is an internal class used by `RouteRecognizer` while it's
 * figuring out where to navigate.
 */
export class PrimaryInstruction {
    constructor(component, child, auxUrls) {
        this.component = component;
        this.child = child;
        this.auxUrls = auxUrls;
    }
}
export function stringifyInstruction(instruction) {
    return stringifyInstructionPath(instruction) + stringifyInstructionQuery(instruction);
}
export function stringifyInstructionPath(instruction) {
    return instruction.component.urlPath + stringifyAux(instruction) +
        stringifyPrimaryPrefixed(instruction.child);
}
export function stringifyInstructionQuery(instruction) {
    return instruction.component.urlParams.length > 0 ?
        ('?' + instruction.component.urlParams.join('&')) :
        '';
}
function stringifyPrimaryPrefixed(instruction) {
    var primary = stringifyPrimary(instruction);
    if (primary.length > 0) {
        primary = '/' + primary;
    }
    return primary;
}
function stringifyPrimary(instruction) {
    if (isBlank(instruction)) {
        return '';
    }
    var params = instruction.component.urlParams.length > 0 ?
        (';' + instruction.component.urlParams.join(';')) :
        '';
    return instruction.component.urlPath + params + stringifyAux(instruction) +
        stringifyPrimaryPrefixed(instruction.child);
}
function stringifyAux(instruction) {
    var routes = [];
    StringMapWrapper.forEach(instruction.auxInstruction, (auxInstruction, _) => {
        routes.push(stringifyPrimary(auxInstruction));
    });
    if (routes.length > 0) {
        return '(' + routes.join('//') + ')';
    }
    return '';
}
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
export class ComponentInstruction {
    constructor() {
        this.reuse = false;
    }
    /**
     * Returns the component type of the represented route, or `null` if this instruction
     * hasn't been resolved.
     */
    get componentType() { return unimplemented(); }
    ;
    /**
     * Returns the specificity of the route associated with this `Instruction`.
     */
    get specificity() { return unimplemented(); }
    ;
    /**
     * Returns `true` if the component type of this instruction has no child {@link RouteConfig},
     * or `false` if it does.
     */
    get terminal() { return unimplemented(); }
    ;
    /**
     * Returns the route data of the given route that was specified in the {@link RouteDefinition},
     * or an empty object if no route data was specified.
     */
    get routeData() { return unimplemented(); }
    ;
}
export class ComponentInstruction_ extends ComponentInstruction {
    constructor(urlPath, urlParams, _recognizer, params = null) {
        super();
        this._recognizer = _recognizer;
        this.urlPath = urlPath;
        this.urlParams = urlParams;
        this.params = params;
        if (isPresent(this._recognizer.handler.data)) {
            this._routeData = new RouteData(this._recognizer.handler.data);
        }
        else {
            this._routeData = BLANK_ROUTE_DATA;
        }
    }
    get componentType() { return this._recognizer.handler.componentType; }
    resolveComponentType() { return this._recognizer.handler.resolveComponentType(); }
    get specificity() { return this._recognizer.specificity; }
    get terminal() { return this._recognizer.terminal; }
    get routeData() { return this._routeData; }
}
