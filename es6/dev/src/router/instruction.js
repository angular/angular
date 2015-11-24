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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5zdHJ1Y3Rpb24uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJhbmd1bGFyMi9zcmMvcm91dGVyL2luc3RydWN0aW9uLnRzIl0sIm5hbWVzIjpbIlJvdXRlUGFyYW1zIiwiUm91dGVQYXJhbXMuY29uc3RydWN0b3IiLCJSb3V0ZVBhcmFtcy5nZXQiLCJSb3V0ZURhdGEiLCJSb3V0ZURhdGEuY29uc3RydWN0b3IiLCJSb3V0ZURhdGEuZ2V0IiwiSW5zdHJ1Y3Rpb24iLCJJbnN0cnVjdGlvbi5jb25zdHJ1Y3RvciIsIkluc3RydWN0aW9uLnJlcGxhY2VDaGlsZCIsIlByaW1hcnlJbnN0cnVjdGlvbiIsIlByaW1hcnlJbnN0cnVjdGlvbi5jb25zdHJ1Y3RvciIsInN0cmluZ2lmeUluc3RydWN0aW9uIiwic3RyaW5naWZ5SW5zdHJ1Y3Rpb25QYXRoIiwic3RyaW5naWZ5SW5zdHJ1Y3Rpb25RdWVyeSIsInN0cmluZ2lmeVByaW1hcnlQcmVmaXhlZCIsInN0cmluZ2lmeVByaW1hcnkiLCJzdHJpbmdpZnlBdXgiLCJDb21wb25lbnRJbnN0cnVjdGlvbiIsIkNvbXBvbmVudEluc3RydWN0aW9uLmNvbnN0cnVjdG9yIiwiQ29tcG9uZW50SW5zdHJ1Y3Rpb24uY29tcG9uZW50VHlwZSIsIkNvbXBvbmVudEluc3RydWN0aW9uLnNwZWNpZmljaXR5IiwiQ29tcG9uZW50SW5zdHJ1Y3Rpb24udGVybWluYWwiLCJDb21wb25lbnRJbnN0cnVjdGlvbi5yb3V0ZURhdGEiLCJDb21wb25lbnRJbnN0cnVjdGlvbl8iLCJDb21wb25lbnRJbnN0cnVjdGlvbl8uY29uc3RydWN0b3IiLCJDb21wb25lbnRJbnN0cnVjdGlvbl8uY29tcG9uZW50VHlwZSIsIkNvbXBvbmVudEluc3RydWN0aW9uXy5yZXNvbHZlQ29tcG9uZW50VHlwZSIsIkNvbXBvbmVudEluc3RydWN0aW9uXy5zcGVjaWZpY2l0eSIsIkNvbXBvbmVudEluc3RydWN0aW9uXy50ZXJtaW5hbCIsIkNvbXBvbmVudElu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QUNBO1FBQzNCQSxJQUFJQSxDQUFDQSxNQUFNQSxHQUFHQSxNQUFNQSxDQUFDQTtRQUNyQkEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsU0FBU0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsV0FBV0EsQ0FBQ0EsT0FBT0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7WUFDN0NBLElBQUlBLENBQUNBLFVBQVVBLEdBQUdBLElBQUlBLFNBQVNBLENBQUNBLElBQUlBLENBQUNBLFdBQVdBLENBQUNBLE9BQU9BLENBQUNBLElBQUlBLENBQUNBLENBQUNBO1FBQ2pFQSxDQUFDQTtRQUFDQSxJQUFJQSxDQUFDQSxDQUFDQTtZQUNOQSxJQUFJQSxDQUFDQSxVQUFVQSxHQUFHQSxnQkFBZ0JBLENBQUNBO1FBQ3JDQSxDQUFDQTtJQUNIQSxDQUFDQTtJQUVERCxJQUFJQSxhQUFhQSxLQUFLRSxNQUFNQSxDQUFDQSxJQUFJQSxDQUFDQSxXQUFXQSxDQUFDQSxPQUFPQSxDQUFDQSxhQUFhQSxDQUFDQSxDQUFDQSxDQUFDQTtJQUN0RUYsb0JBQW9CQSxLQUFvQkcsTUFBTUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsV0FBV0EsQ0FBQ0EsT0FBT0EsQ0FBQ0Esb0JBQW9CQSxFQUFFQSxDQUFDQSxDQUFDQSxDQUFDQTtJQUNqR0gsSUFBSUEsV0FBV0EsS0FBS0ksTUFBTUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsV0FBV0EsQ0FBQ0EsV0FBV0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7SUFDMURKLElBQUlBLFFBQVFBLEtBQUtLLE1BQU1BLENBQUNBLElBQUlBLENBQUNBLFdBQVdBLENBQUNBLFFBQVFBLENBQUNBLENBQUNBLENBQUNBO0lBQ3BETCxJQUFJQSxTQUFTQSxLQUFnQk0sTUFBTUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsVUFBVUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7QUFDeEROLENBQUNBO0FBQUEiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge01hcCwgTWFwV3JhcHBlciwgU3RyaW5nTWFwV3JhcHBlciwgTGlzdFdyYXBwZXJ9IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvY29sbGVjdGlvbic7XG5pbXBvcnQge3VuaW1wbGVtZW50ZWR9IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvZXhjZXB0aW9ucyc7XG5pbXBvcnQge2lzUHJlc2VudCwgaXNCbGFuaywgbm9ybWFsaXplQmxhbmssIFR5cGUsIENPTlNUX0VYUFJ9IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvbGFuZyc7XG5pbXBvcnQge1Byb21pc2V9IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvYXN5bmMnO1xuXG5pbXBvcnQge1BhdGhSZWNvZ25pemVyfSBmcm9tICcuL3BhdGhfcmVjb2duaXplcic7XG5pbXBvcnQge1VybH0gZnJvbSAnLi91cmxfcGFyc2VyJztcblxuLyoqXG4gKiBgUm91dGVQYXJhbXNgIGlzIGFuIGltbXV0YWJsZSBtYXAgb2YgcGFyYW1ldGVycyBmb3IgdGhlIGdpdmVuIHJvdXRlXG4gKiBiYXNlZCBvbiB0aGUgdXJsIG1hdGNoZXIgYW5kIG9wdGlvbmFsIHBhcmFtZXRlcnMgZm9yIHRoYXQgcm91dGUuXG4gKlxuICogWW91IGNhbiBpbmplY3QgYFJvdXRlUGFyYW1zYCBpbnRvIHRoZSBjb25zdHJ1Y3RvciBvZiBhIGNvbXBvbmVudCB0byB1c2UgaXQuXG4gKlxuICogIyMjIEV4YW1wbGVcbiAqXG4gKiBgYGBcbiAqIGltcG9ydCB7Ym9vdHN0cmFwLCBDb21wb25lbnR9IGZyb20gJ2FuZ3VsYXIyL2FuZ3VsYXIyJztcbiAqIGltcG9ydCB7Um91dGVyLCBST1VURVJfRElSRUNUSVZFUywgUk9VVEVSX1BST1ZJREVSUywgUm91dGVDb25maWd9IGZyb20gJ2FuZ3VsYXIyL3JvdXRlcic7XG4gKlxuICogQENvbXBvbmVudCh7ZGlyZWN0aXZlczogW1JPVVRFUl9ESVJFQ1RJVkVTXX0pXG4gKiBAUm91dGVDb25maWcoW1xuICogIHtwYXRoOiAnL3VzZXIvOmlkJywgY29tcG9uZW50OiBVc2VyQ21wLCBhczogJ1VzZXJDbXAnfSxcbiAqIF0pXG4gKiBjbGFzcyBBcHBDbXAge31cbiAqXG4gKiBAQ29tcG9uZW50KHsgdGVtcGxhdGU6ICd1c2VyOiB7e2lkfX0nIH0pXG4gKiBjbGFzcyBVc2VyQ21wIHtcbiAqICAgaWQ6IHN0cmluZztcbiAqICAgY29uc3RydWN0b3IocGFyYW1zOiBSb3V0ZVBhcmFtcykge1xuICogICAgIHRoaXMuaWQgPSBwYXJhbXMuZ2V0KCdpZCcpO1xuICogICB9XG4gKiB9XG4gKlxuICogYm9vdHN0cmFwKEFwcENtcCwgUk9VVEVSX1BST1ZJREVSUyk7XG4gKiBgYGBcbiAqL1xuZXhwb3J0IGNsYXNzIFJvdXRlUGFyYW1zIHtcbiAgY29uc3RydWN0b3IocHVibGljIHBhcmFtczoge1trZXk6IHN0cmluZ106IHN0cmluZ30pIHt9XG5cbiAgZ2V0KHBhcmFtOiBzdHJpbmcpOiBzdHJpbmcgeyByZXR1cm4gbm9ybWFsaXplQmxhbmsoU3RyaW5nTWFwV3JhcHBlci5nZXQodGhpcy5wYXJhbXMsIHBhcmFtKSk7IH1cbn1cblxuLyoqXG4gKiBgUm91dGVEYXRhYCBpcyBhbiBpbW11dGFibGUgbWFwIG9mIGFkZGl0aW9uYWwgZGF0YSB5b3UgY2FuIGNvbmZpZ3VyZSBpbiB5b3VyIHtAbGluayBSb3V0ZX0uXG4gKlxuICogWW91IGNhbiBpbmplY3QgYFJvdXRlRGF0YWAgaW50byB0aGUgY29uc3RydWN0b3Igb2YgYSBjb21wb25lbnQgdG8gdXNlIGl0LlxuICpcbiAqICMjIyBFeGFtcGxlXG4gKlxuICogYGBgXG4gKiBpbXBvcnQge2Jvb3RzdHJhcCwgQ29tcG9uZW50LCBWaWV3fSBmcm9tICdhbmd1bGFyMi9hbmd1bGFyMic7XG4gKiBpbXBvcnQge1JvdXRlciwgUk9VVEVSX0RJUkVDVElWRVMsIHJvdXRlckJpbmRpbmdzLCBSb3V0ZUNvbmZpZ30gZnJvbSAnYW5ndWxhcjIvcm91dGVyJztcbiAqXG4gKiBAQ29tcG9uZW50KHsuLi59KVxuICogQFZpZXcoe2RpcmVjdGl2ZXM6IFtST1VURVJfRElSRUNUSVZFU119KVxuICogQFJvdXRlQ29uZmlnKFtcbiAqICB7cGF0aDogJy91c2VyLzppZCcsIGNvbXBvbmVudDogVXNlckNtcCwgYXM6ICdVc2VyQ21wJywgZGF0YToge2lzQWRtaW46IHRydWV9fSxcbiAqIF0pXG4gKiBjbGFzcyBBcHBDbXAge31cbiAqXG4gKiBAQ29tcG9uZW50KHsuLi59KVxuICogQFZpZXcoeyB0ZW1wbGF0ZTogJ3VzZXI6IHt7aXNBZG1pbn19JyB9KVxuICogY2xhc3MgVXNlckNtcCB7XG4gKiAgIHN0cmluZzogaXNBZG1pbjtcbiAqICAgY29uc3RydWN0b3IoZGF0YTogUm91dGVEYXRhKSB7XG4gKiAgICAgdGhpcy5pc0FkbWluID0gZGF0YS5nZXQoJ2lzQWRtaW4nKTtcbiAqICAgfVxuICogfVxuICpcbiAqIGJvb3RzdHJhcChBcHBDbXAsIHJvdXRlckJpbmRpbmdzKEFwcENtcCkpO1xuICogYGBgXG4gKi9cbmV4cG9ydCBjbGFzcyBSb3V0ZURhdGEge1xuICBjb25zdHJ1Y3RvcihwdWJsaWMgZGF0YToge1trZXk6IHN0cmluZ106IGFueX0gPSBDT05TVF9FWFBSKHt9KSkge31cblxuICBnZXQoa2V5OiBzdHJpbmcpOiBhbnkgeyByZXR1cm4gbm9ybWFsaXplQmxhbmsoU3RyaW5nTWFwV3JhcHBlci5nZXQodGhpcy5kYXRhLCBrZXkpKTsgfVxufVxuXG52YXIgQkxBTktfUk9VVEVfREFUQSA9IG5ldyBSb3V0ZURhdGEoKTtcblxuLyoqXG4gKiBgSW5zdHJ1Y3Rpb25gIGlzIGEgdHJlZSBvZiB7QGxpbmsgQ29tcG9uZW50SW5zdHJ1Y3Rpb259cyB3aXRoIGFsbCB0aGUgaW5mb3JtYXRpb24gbmVlZGVkXG4gKiB0byB0cmFuc2l0aW9uIGVhY2ggY29tcG9uZW50IGluIHRoZSBhcHAgdG8gYSBnaXZlbiByb3V0ZSwgaW5jbHVkaW5nIGFsbCBhdXhpbGlhcnkgcm91dGVzLlxuICpcbiAqIGBJbnN0cnVjdGlvbmBzIGNhbiBiZSBjcmVhdGVkIHVzaW5nIHtAbGluayBSb3V0ZXIjZ2VuZXJhdGV9LCBhbmQgY2FuIGJlIHVzZWQgdG9cbiAqIHBlcmZvcm0gcm91dGUgY2hhbmdlcyB3aXRoIHtAbGluayBSb3V0ZXIjbmF2aWdhdGVCeUluc3RydWN0aW9ufS5cbiAqXG4gKiAjIyMgRXhhbXBsZVxuICpcbiAqIGBgYFxuICogaW1wb3J0IHtib290c3RyYXAsIENvbXBvbmVudH0gZnJvbSAnYW5ndWxhcjIvYW5ndWxhcjInO1xuICogaW1wb3J0IHtSb3V0ZXIsIFJPVVRFUl9ESVJFQ1RJVkVTLCBST1VURVJfUFJPVklERVJTLCBSb3V0ZUNvbmZpZ30gZnJvbSAnYW5ndWxhcjIvcm91dGVyJztcbiAqXG4gKiBAQ29tcG9uZW50KHtkaXJlY3RpdmVzOiBbUk9VVEVSX0RJUkVDVElWRVNdfSlcbiAqIEBSb3V0ZUNvbmZpZyhbXG4gKiAgey4uLn0sXG4gKiBdKVxuICogY2xhc3MgQXBwQ21wIHtcbiAqICAgY29uc3RydWN0b3Iocm91dGVyOiBSb3V0ZXIpIHtcbiAqICAgICB2YXIgaW5zdHJ1Y3Rpb24gPSByb3V0ZXIuZ2VuZXJhdGUoWycvTXlSb3V0ZSddKTtcbiAqICAgICByb3V0ZXIubmF2aWdhdGVCeUluc3RydWN0aW9uKGluc3RydWN0aW9uKTtcbiAqICAgfVxuICogfVxuICpcbiAqIGJvb3RzdHJhcChBcHBDbXAsIFJPVVRFUl9QUk9WSURFUlMpO1xuICogYGBgXG4gKi9cbmV4cG9ydCBjbGFzcyBJbnN0cnVjdGlvbiB7XG4gIGNvbnN0cnVjdG9yKHB1YmxpYyBjb21wb25lbnQ6IENvbXBvbmVudEluc3RydWN0aW9uLCBwdWJsaWMgY2hpbGQ6IEluc3RydWN0aW9uLFxuICAgICAgICAgICAgICBwdWJsaWMgYXV4SW5zdHJ1Y3Rpb246IHtba2V5OiBzdHJpbmddOiBJbnN0cnVjdGlvbn0pIHt9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgYSBuZXcgaW5zdHJ1Y3Rpb24gdGhhdCBzaGFyZXMgdGhlIHN0YXRlIG9mIHRoZSBleGlzdGluZyBpbnN0cnVjdGlvbiwgYnV0IHdpdGhcbiAgICogdGhlIGdpdmVuIGNoaWxkIHtAbGluayBJbnN0cnVjdGlvbn0gcmVwbGFjaW5nIHRoZSBleGlzdGluZyBjaGlsZC5cbiAgICovXG4gIHJlcGxhY2VDaGlsZChjaGlsZDogSW5zdHJ1Y3Rpb24pOiBJbnN0cnVjdGlvbiB7XG4gICAgcmV0dXJuIG5ldyBJbnN0cnVjdGlvbih0aGlzLmNvbXBvbmVudCwgY2hpbGQsIHRoaXMuYXV4SW5zdHJ1Y3Rpb24pO1xuICB9XG59XG5cbi8qKlxuICogUmVwcmVzZW50cyBhIHBhcnRpYWxseSBjb21wbGV0ZWQgaW5zdHJ1Y3Rpb24gZHVyaW5nIHJlY29nbml0aW9uIHRoYXQgb25seSBoYXMgdGhlXG4gKiBwcmltYXJ5IChub24tYXV4KSByb3V0ZSBpbnN0cnVjdGlvbnMgbWF0Y2hlZC5cbiAqXG4gKiBgUHJpbWFyeUluc3RydWN0aW9uYCBpcyBhbiBpbnRlcm5hbCBjbGFzcyB1c2VkIGJ5IGBSb3V0ZVJlY29nbml6ZXJgIHdoaWxlIGl0J3NcbiAqIGZpZ3VyaW5nIG91dCB3aGVyZSB0byBuYXZpZ2F0ZS5cbiAqL1xuZXhwb3J0IGNsYXNzIFByaW1hcnlJbnN0cnVjdGlvbiB7XG4gIGNvbnN0cnVjdG9yKHB1YmxpYyBjb21wb25lbnQ6IENvbXBvbmVudEluc3RydWN0aW9uLCBwdWJsaWMgY2hpbGQ6IFByaW1hcnlJbnN0cnVjdGlvbixcbiAgICAgICAgICAgICAgcHVibGljIGF1eFVybHM6IFVybFtdKSB7fVxufVxuXG5leHBvcnQgZnVuY3Rpb24gc3RyaW5naWZ5SW5zdHJ1Y3Rpb24oaW5zdHJ1Y3Rpb246IEluc3RydWN0aW9uKTogc3RyaW5nIHtcbiAgcmV0dXJuIHN0cmluZ2lmeUluc3RydWN0aW9uUGF0aChpbnN0cnVjdGlvbikgKyBzdHJpbmdpZnlJbnN0cnVjdGlvblF1ZXJ5KGluc3RydWN0aW9uKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHN0cmluZ2lmeUluc3RydWN0aW9uUGF0aChpbnN0cnVjdGlvbjogSW5zdHJ1Y3Rpb24pOiBzdHJpbmcge1xuICByZXR1cm4gaW5zdHJ1Y3Rpb24uY29tcG9uZW50LnVybFBhdGggKyBzdHJpbmdpZnlBdXgoaW5zdHJ1Y3Rpb24pICtcbiAgICAgICAgIHN0cmluZ2lmeVByaW1hcnlQcmVmaXhlZChpbnN0cnVjdGlvbi5jaGlsZCk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBzdHJpbmdpZnlJbnN0cnVjdGlvblF1ZXJ5KGluc3RydWN0aW9uOiBJbnN0cnVjdGlvbik6IHN0cmluZyB7XG4gIHJldHVybiBpbnN0cnVjdGlvbi5jb21wb25lbnQudXJsUGFyYW1zLmxlbmd0aCA+IDAgP1xuICAgICAgICAgICAgICgnPycgKyBpbnN0cnVjdGlvbi5jb21wb25lbnQudXJsUGFyYW1zLmpvaW4oJyYnKSkgOlxuICAgICAgICAgICAgICcnO1xufVxuXG5mdW5jdGlvbiBzdHJpbmdpZnlQcmltYXJ5UHJlZml4ZWQoaW5zdHJ1Y3Rpb246IEluc3RydWN0aW9uKTogc3RyaW5nIHtcbiAgdmFyIHByaW1hcnkgPSBzdHJpbmdpZnlQcmltYXJ5KGluc3RydWN0aW9uKTtcbiAgaWYgKHByaW1hcnkubGVuZ3RoID4gMCkge1xuICAgIHByaW1hcnkgPSAnLycgKyBwcmltYXJ5O1xuICB9XG4gIHJldHVybiBwcmltYXJ5O1xufVxuXG5mdW5jdGlvbiBzdHJpbmdpZnlQcmltYXJ5KGluc3RydWN0aW9uOiBJbnN0cnVjdGlvbik6IHN0cmluZyB7XG4gIGlmIChpc0JsYW5rKGluc3RydWN0aW9uKSkge1xuICAgIHJldHVybiAnJztcbiAgfVxuICB2YXIgcGFyYW1zID0gaW5zdHJ1Y3Rpb24uY29tcG9uZW50LnVybFBhcmFtcy5sZW5ndGggPiAwID9cbiAgICAgICAgICAgICAgICAgICAoJzsnICsgaW5zdHJ1Y3Rpb24uY29tcG9uZW50LnVybFBhcmFtcy5qb2luKCc7JykpIDpcbiAgICAgICAgICAgICAgICAgICAnJztcbiAgcmV0dXJuIGluc3RydWN0aW9uLmNvbXBvbmVudC51cmxQYXRoICsgcGFyYW1zICsgc3RyaW5naWZ5QXV4KGluc3RydWN0aW9uKSArXG4gICAgICAgICBzdHJpbmdpZnlQcmltYXJ5UHJlZml4ZWQoaW5zdHJ1Y3Rpb24uY2hpbGQpO1xufVxuXG5mdW5jdGlvbiBzdHJpbmdpZnlBdXgoaW5zdHJ1Y3Rpb246IEluc3RydWN0aW9uKTogc3RyaW5nIHtcbiAgdmFyIHJvdXRlcyA9IFtdO1xuICBTdHJpbmdNYXBXcmFwcGVyLmZvckVhY2goaW5zdHJ1Y3Rpb24uYXV4SW5zdHJ1Y3Rpb24sIChhdXhJbnN0cnVjdGlvbiwgXykgPT4ge1xuICAgIHJvdXRlcy5wdXNoKHN0cmluZ2lmeVByaW1hcnkoYXV4SW5zdHJ1Y3Rpb24pKTtcbiAgfSk7XG4gIGlmIChyb3V0ZXMubGVuZ3RoID4gMCkge1xuICAgIHJldHVybiAnKCcgKyByb3V0ZXMuam9pbignLy8nKSArICcpJztcbiAgfVxuICByZXR1cm4gJyc7XG59XG5cblxuLyoqXG4gKiBBIGBDb21wb25lbnRJbnN0cnVjdGlvbmAgcmVwcmVzZW50cyB0aGUgcm91dGUgc3RhdGUgZm9yIGEgc2luZ2xlIGNvbXBvbmVudC4gQW4gYEluc3RydWN0aW9uYCBpc1xuICogY29tcG9zZWQgb2YgYSB0cmVlIG9mIHRoZXNlIGBDb21wb25lbnRJbnN0cnVjdGlvbmBzLlxuICpcbiAqIGBDb21wb25lbnRJbnN0cnVjdGlvbnNgIGlzIGEgcHVibGljIEFQSS4gSW5zdGFuY2VzIG9mIGBDb21wb25lbnRJbnN0cnVjdGlvbmAgYXJlIHBhc3NlZFxuICogdG8gcm91dGUgbGlmZWN5Y2xlIGhvb2tzLCBsaWtlIHtAbGluayBDYW5BY3RpdmF0ZX0uXG4gKlxuICogYENvbXBvbmVudEluc3RydWN0aW9uYHMgYXJlIFtodHRwczovL2VuLndpa2lwZWRpYS5vcmcvd2lraS9IYXNoX2NvbnNpbmddKGhhc2ggY29uc2VkKS4gWW91IHNob3VsZFxuICogbmV2ZXIgY29uc3RydWN0IG9uZSB5b3Vyc2VsZiB3aXRoIFwibmV3LlwiIEluc3RlYWQsIHJlbHkgb24ge0BsaW5rIFJvdXRlci9QYXRoUmVjb2duaXplcn0gdG9cbiAqIGNvbnN0cnVjdCBgQ29tcG9uZW50SW5zdHJ1Y3Rpb25gcy5cbiAqXG4gKiBZb3Ugc2hvdWxkIG5vdCBtb2RpZnkgdGhpcyBvYmplY3QuIEl0IHNob3VsZCBiZSB0cmVhdGVkIGFzIGltbXV0YWJsZS5cbiAqL1xuZXhwb3J0IGFic3RyYWN0IGNsYXNzIENvbXBvbmVudEluc3RydWN0aW9uIHtcbiAgcmV1c2U6IGJvb2xlYW4gPSBmYWxzZTtcbiAgcHVibGljIHVybFBhdGg6IHN0cmluZztcbiAgcHVibGljIHVybFBhcmFtczogc3RyaW5nW107XG4gIHB1YmxpYyBwYXJhbXM6IHtba2V5OiBzdHJpbmddOiBhbnl9O1xuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoZSBjb21wb25lbnQgdHlwZSBvZiB0aGUgcmVwcmVzZW50ZWQgcm91dGUsIG9yIGBudWxsYCBpZiB0aGlzIGluc3RydWN0aW9uXG4gICAqIGhhc24ndCBiZWVuIHJlc29sdmVkLlxuICAgKi9cbiAgZ2V0IGNvbXBvbmVudFR5cGUoKSB7IHJldHVybiB1bmltcGxlbWVudGVkKCk7IH07XG5cbiAgLyoqXG4gICAqIFJldHVybnMgYSBwcm9taXNlIHRoYXQgd2lsbCByZXNvbHZlIHRvIGNvbXBvbmVudCB0eXBlIG9mIHRoZSByZXByZXNlbnRlZCByb3V0ZS5cbiAgICogSWYgdGhpcyBpbnN0cnVjdGlvbiByZWZlcmVuY2VzIGFuIHtAbGluayBBc3luY1JvdXRlfSwgdGhlIGBsb2FkZXJgIGZ1bmN0aW9uIG9mIHRoYXQgcm91dGVcbiAgICogd2lsbCBydW4uXG4gICAqL1xuICBhYnN0cmFjdCByZXNvbHZlQ29tcG9uZW50VHlwZSgpOiBQcm9taXNlPFR5cGU+O1xuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoZSBzcGVjaWZpY2l0eSBvZiB0aGUgcm91dGUgYXNzb2NpYXRlZCB3aXRoIHRoaXMgYEluc3RydWN0aW9uYC5cbiAgICovXG4gIGdldCBzcGVjaWZpY2l0eSgpIHsgcmV0dXJuIHVuaW1wbGVtZW50ZWQoKTsgfTtcblxuICAvKipcbiAgICogUmV0dXJucyBgdHJ1ZWAgaWYgdGhlIGNvbXBvbmVudCB0eXBlIG9mIHRoaXMgaW5zdHJ1Y3Rpb24gaGFzIG5vIGNoaWxkIHtAbGluayBSb3V0ZUNvbmZpZ30sXG4gICAqIG9yIGBmYWxzZWAgaWYgaXQgZG9lcy5cbiAgICovXG4gIGdldCB0ZXJtaW5hbCgpIHsgcmV0dXJuIHVuaW1wbGVtZW50ZWQoKTsgfTtcblxuICAvKipcbiAgICogUmV0dXJucyB0aGUgcm91dGUgZGF0YSBvZiB0aGUgZ2l2ZW4gcm91dGUgdGhhdCB3YXMgc3BlY2lmaWVkIGluIHRoZSB7QGxpbmsgUm91dGVEZWZpbml0aW9ufSxcbiAgICogb3IgYW4gZW1wdHkgb2JqZWN0IGlmIG5vIHJvdXRlIGRhdGEgd2FzIHNwZWNpZmllZC5cbiAgICovXG4gIGdldCByb3V0ZURhdGEoKTogUm91dGVEYXRhIHsgcmV0dXJuIHVuaW1wbGVtZW50ZWQoKTsgfTtcbn1cblxuZXhwb3J0IGNsYXNzIENvbXBvbmVudEluc3RydWN0aW9uXyBleHRlbmRzIENvbXBvbmVudEluc3RydWN0aW9uIHtcbiAgcHJpdmF0ZSBfcm91dGVEYXRhOiBSb3V0ZURhdGE7XG5cbiAgY29uc3RydWN0b3IodXJsUGF0aDogc3RyaW5nLCB1cmxQYXJhbXM6IHN0cmluZ1tdLCBwcml2YXRlIF9yZWNvZ25pemVyOiBQYXRoUmVjb2duaXplcixcbiAgICAgICAgICAgICAgcGFyYW1zOiB7W2tleTogc3RyaW5nXTogYW55fSA9IG51bGwpIHtcbiAgICBzdXBlcigpO1xuICAgIHRoaXMudXJsUGF0aCA9IHVybFBhdGg7XG4gICAgdGhpcy51cmxQYXJhbXMgPSB1cmxQYXJhbXM7XG4gICAgdGhpcy5wYXJhbXMgPSBwYXJhbXM7XG4gICAgaWYgKGlzUHJlc2VudCh0aGlzLl9yZWNvZ25pemVyLmhhbmRsZXIuZGF0YSkpIHtcbiAgICAgIHRoaXMuX3JvdXRlRGF0YSA9IG5ldyBSb3V0ZURhdGEodGhpcy5fcmVjb2duaXplci5oYW5kbGVyLmRhdGEpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLl9yb3V0ZURhdGEgPSBCTEFOS19ST1VURV9EQVRBO1xuICAgIH1cbiAgfVxuXG4gIGdldCBjb21wb25lbnRUeXBlKCkgeyByZXR1cm4gdGhpcy5fcmVjb2duaXplci5oYW5kbGVyLmNvbXBvbmVudFR5cGU7IH1cbiAgcmVzb2x2ZUNvbXBvbmVudFR5cGUoKTogUHJvbWlzZTxUeXBlPiB7IHJldHVybiB0aGlzLl9yZWNvZ25pemVyLmhhbmRsZXIucmVzb2x2ZUNvbXBvbmVudFR5cGUoKTsgfVxuICBnZXQgc3BlY2lmaWNpdHkoKSB7IHJldHVybiB0aGlzLl9yZWNvZ25pemVyLnNwZWNpZmljaXR5OyB9XG4gIGdldCB0ZXJtaW5hbCgpIHsgcmV0dXJuIHRoaXMuX3JlY29nbml6ZXIudGVybWluYWw7IH1cbiAgZ2V0IHJvdXRlRGF0YSgpOiBSb3V0ZURhdGEgeyByZXR1cm4gdGhpcy5fcm91dGVEYXRhOyB9XG59XG4iXX0=