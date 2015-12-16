import { StringMapWrapper } from 'angular2/src/facade/collection';
import { isPresent, isBlank, normalizeBlank, CONST_EXPR } from 'angular2/src/facade/lang';
import { PromiseWrapper } from 'angular2/src/facade/async';
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
 * import {Component, View} from 'angular2/core';
 * import {bootstrap} from 'angular2/platform/browser';
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
export var BLANK_ROUTE_DATA = new RouteData();
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
export class Instruction {
    constructor() {
        this.auxInstruction = {};
    }
    get urlPath() { return isPresent(this.component) ? this.component.urlPath : ''; }
    get urlParams() { return isPresent(this.component) ? this.component.urlParams : []; }
    get specificity() {
        var total = 0;
        if (isPresent(this.component)) {
            total += this.component.specificity;
        }
        if (isPresent(this.child)) {
            total += this.child.specificity;
        }
        return total;
    }
    /**
     * converts the instruction into a URL string
     */
    toRootUrl() { return this.toUrlPath() + this.toUrlQuery(); }
    /** @internal */
    _toNonRootUrl() {
        return this._stringifyPathMatrixAuxPrefixed() +
            (isPresent(this.child) ? this.child._toNonRootUrl() : '');
    }
    toUrlQuery() { return this.urlParams.length > 0 ? ('?' + this.urlParams.join('&')) : ''; }
    /**
     * Returns a new instruction that shares the state of the existing instruction, but with
     * the given child {@link Instruction} replacing the existing child.
     */
    replaceChild(child) {
        return new ResolvedInstruction(this.component, child, this.auxInstruction);
    }
    /**
     * If the final URL for the instruction is ``
     */
    toUrlPath() {
        return this.urlPath + this._stringifyAux() +
            (isPresent(this.child) ? this.child._toNonRootUrl() : '');
    }
    // default instructions override these
    toLinkUrl() {
        return this.urlPath + this._stringifyAux() +
            (isPresent(this.child) ? this.child._toLinkUrl() : '');
    }
    // this is the non-root version (called recursively)
    /** @internal */
    _toLinkUrl() {
        return this._stringifyPathMatrixAuxPrefixed() +
            (isPresent(this.child) ? this.child._toLinkUrl() : '');
    }
    /** @internal */
    _stringifyPathMatrixAuxPrefixed() {
        var primary = this._stringifyPathMatrixAux();
        if (primary.length > 0) {
            primary = '/' + primary;
        }
        return primary;
    }
    /** @internal */
    _stringifyMatrixParams() {
        return this.urlParams.length > 0 ? (';' + this.urlParams.join(';')) : '';
    }
    /** @internal */
    _stringifyPathMatrixAux() {
        if (isBlank(this.component)) {
            return '';
        }
        return this.urlPath + this._stringifyMatrixParams() + this._stringifyAux();
    }
    /** @internal */
    _stringifyAux() {
        var routes = [];
        StringMapWrapper.forEach(this.auxInstruction, (auxInstruction, _) => {
            routes.push(auxInstruction._stringifyPathMatrixAux());
        });
        if (routes.length > 0) {
            return '(' + routes.join('//') + ')';
        }
        return '';
    }
}
/**
 * a resolved instruction has an outlet instruction for itself, but maybe not for...
 */
export class ResolvedInstruction extends Instruction {
    constructor(component, child, auxInstruction) {
        super();
        this.component = component;
        this.child = child;
        this.auxInstruction = auxInstruction;
    }
    resolveComponent() {
        return PromiseWrapper.resolve(this.component);
    }
}
/**
 * Represents a resolved default route
 */
export class DefaultInstruction extends Instruction {
    constructor(component, child) {
        super();
        this.component = component;
        this.child = child;
    }
    resolveComponent() {
        return PromiseWrapper.resolve(this.component);
    }
    toLinkUrl() { return ''; }
    /** @internal */
    _toLinkUrl() { return ''; }
}
/**
 * Represents a component that may need to do some redirection or lazy loading at a later time.
 */
export class UnresolvedInstruction extends Instruction {
    constructor(_resolver, _urlPath = '', _urlParams = CONST_EXPR([])) {
        super();
        this._resolver = _resolver;
        this._urlPath = _urlPath;
        this._urlParams = _urlParams;
    }
    get urlPath() {
        if (isPresent(this.component)) {
            return this.component.urlPath;
        }
        if (isPresent(this._urlPath)) {
            return this._urlPath;
        }
        return '';
    }
    get urlParams() {
        if (isPresent(this.component)) {
            return this.component.urlParams;
        }
        if (isPresent(this._urlParams)) {
            return this._urlParams;
        }
        return [];
    }
    resolveComponent() {
        if (isPresent(this.component)) {
            return PromiseWrapper.resolve(this.component);
        }
        return this._resolver().then((resolution) => {
            this.child = resolution.child;
            return this.component = resolution.component;
        });
    }
}
export class RedirectInstruction extends ResolvedInstruction {
    constructor(component, child, auxInstruction) {
        super(component, child, auxInstruction);
    }
}
/**
 * A `ComponentInstruction` represents the route state for a single component. An `Instruction` is
 * composed of a tree of these `ComponentInstruction`s.
 *
 * `ComponentInstructions` is a public API. Instances of `ComponentInstruction` are passed
 * to route lifecycle hooks, like {@link CanActivate}.
 *
 * `ComponentInstruction`s are [https://en.wikipedia.org/wiki/Hash_consing](hash consed). You should
 * never construct one yourself with "new." Instead, rely on {@link Router/RouteRecognizer} to
 * construct `ComponentInstruction`s.
 *
 * You should not modify this object. It should be treated as immutable.
 */
export class ComponentInstruction {
    constructor(urlPath, urlParams, data, componentType, terminal, specificity, params = null) {
        this.urlPath = urlPath;
        this.urlParams = urlParams;
        this.componentType = componentType;
        this.terminal = terminal;
        this.specificity = specificity;
        this.params = params;
        this.reuse = false;
        this.routeData = isPresent(data) ? data : BLANK_ROUTE_DATA;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5zdHJ1Y3Rpb24uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJhbmd1bGFyMi9zcmMvcm91dGVyL2luc3RydWN0aW9uLnRzIl0sIm5hbWVzIjpbIlJvdXRlUGFyYW1zIiwiUm91dGVQYXJhbXMuY29uc3RydWN0b3IiLCJSb3V0ZVBhcmFtcy5nZXQiLCJSb3V0ZURhdGEiLCJSb3V0ZURhdGEuY29uc3RydWN0b3IiLCJSb3V0ZURhdGEuZ2V0IiwiSW5zdHJ1Y3Rpb24iLCJJbnN0cnVjdGlvbi5jb25zdHJ1Y3RvciIsIkluc3RydWN0aW9uLnVybFBhdGgiLCJJbnN0cnVjdGlvbi51cmxQYXJhbXMiLCJJbnN0cnVjdGlvbi5zcGVjaWZpY2l0eSIsIkluc3RydWN0aW9uLnRvUm9vdFVybCIsIkluc3RydWN0aW9uLl90b05vblJvb3RVcmwiLCJJbnN0cnVjdGlvbi50b1VybFF1ZXJ5IiwiSW5zdHJ1Y3Rpb24ucmVwbGFjZUNoaWxkIiwiSW5zdHJ1Y3Rpb24udG9VcmxQYXRoIiwiSW5zdHJ1Y3Rpb24udG9MaW5rVXJsIiwiSW5zdHJ1Y3Rpb24uX3RvTGlua1VybCIsIkluc3RydWN0aW9uLl9zdHJpbmdpZnlQYXRoTWF0cml4QXV4UHJlZml4ZWQiLCJJbnN0cnVjdGlvbi5fc3RyaW5naWZ5TWF0cml4UGFyYW1zIiwiSW5zdHJ1Y3Rpb24uX3N0cmluZ2lmeVBhdGhNYXRyaXhBdXgiLCJJbnN0cnVjdGlvbi5fc3RyaW5naWZ5QXV4IiwiUmVzb2x2ZWRJbnN0cnVjdGlvbiIsIlJlc29sdmVkSW5zdHJ1Y3Rpb24uY29uc3RydWN0b3IiLCJSZXNvbHZlZEluc3RydWN0aW9uLnJlc29sdmVDb21wb25lbnQiLCJEZWZhdWx0SW5zdHJ1Y3Rpb24iLCJEZWZhdWx0SW5zdHJ1Y3Rpb24uY29uc3RydWN0b3IiLCJEZWZhdWx0SW5zdHJ1Y3Rpb24ucmVzb2x2ZUNvbXBvbmVudCIsIkRlZmF1bHRJbnN0cnVjdGlvbi50b0xpbmtVcmwiLCJEZWZhdWx0SW5zdHJ1Y3Rpb24uX3RvTGlua1VybCIsIlVucmVzb2x2ZWRJbnN0cnVjdGlvbiIsIlVucmVzb2x2ZWRJbnN0cnVjdGlvbi5jb25zdHJ1Y3RvciIsIlVucmVzb2x2ZWRJbnN0cnVjdGlvbi51cmxQYXRoIiwiVW5yZXNvbHZlZEluc3RydWN0aW9uLnVybFBhcmFtcyIsIlVucmVzb2x2ZWRJbnN0cnVjdGlvbi5yZXNvbHZlQ29tcG9uZW50IiwiUmVkaXJlY3RJbnN0cnVjdGlvbiIsIlJlZGlyZWN0SW5zdHJ1Y3Rpb24uY29uc3RydWN0b3IiLCJDb21wb25lbnRJbnN0cnVjdGlvbiIsIkNvbXBvbmVudEluc3RydWN0aW9uLmNvbnN0cnVjdG9yIl0sIm1hcHBpbmdzIjoiT0FBTyxFQUFrQixnQkFBZ0IsRUFBYyxNQUFNLGdDQUFnQztPQUN0RixFQUFDLFNBQVMsRUFBRSxPQUFPLEVBQUUsY0FBYyxFQUFRLFVBQVUsRUFBQyxNQUFNLDBCQUEwQjtPQUN0RixFQUFVLGNBQWMsRUFBQyxNQUFNLDJCQUEyQjtBQUdqRTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7R0E2Qkc7QUFDSDtJQUNFQSxZQUFtQkEsTUFBK0JBO1FBQS9CQyxXQUFNQSxHQUFOQSxNQUFNQSxDQUF5QkE7SUFBR0EsQ0FBQ0E7SUFFdERELEdBQUdBLENBQUNBLEtBQWFBLElBQVlFLE1BQU1BLENBQUNBLGNBQWNBLENBQUNBLGdCQUFnQkEsQ0FBQ0EsR0FBR0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsTUFBTUEsRUFBRUEsS0FBS0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7QUFDakdGLENBQUNBO0FBRUQ7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztHQThCRztBQUNIO0lBQ0VHLFlBQW1CQSxJQUFJQSxHQUF5QkEsVUFBVUEsQ0FBQ0EsRUFBRUEsQ0FBQ0E7UUFBM0NDLFNBQUlBLEdBQUpBLElBQUlBLENBQXVDQTtJQUFHQSxDQUFDQTtJQUVsRUQsR0FBR0EsQ0FBQ0EsR0FBV0EsSUFBU0UsTUFBTUEsQ0FBQ0EsY0FBY0EsQ0FBQ0EsZ0JBQWdCQSxD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LENBQUNBLENBQUNBO0lBQ0xBLENBQUNBO0FBQ0hKLENBQUNBO0FBR0QseUNBQXlDLG1CQUFtQjtJQUMxREssWUFBWUEsU0FBK0JBLEVBQUVBLEtBQWtCQSxFQUNuREEsY0FBNENBO1FBQ3REQyxNQUFNQSxTQUFTQSxFQUFFQSxLQUFLQSxFQUFFQSxjQUFjQSxDQUFDQSxDQUFDQTtJQUMxQ0EsQ0FBQ0E7QUFDSEQsQ0FBQ0E7QUFHRDs7Ozs7Ozs7Ozs7O0dBWUc7QUFDSDtJQUlFRSxZQUFtQkEsT0FBZUEsRUFBU0EsU0FBbUJBLEVBQUVBLElBQWVBLEVBQzVEQSxhQUFhQSxFQUFTQSxRQUFpQkEsRUFBU0EsV0FBbUJBLEVBQ25FQSxNQUFNQSxHQUF5QkEsSUFBSUE7UUFGbkNDLFlBQU9BLEdBQVBBLE9BQU9BLENBQVFBO1FBQVNBLGNBQVNBLEdBQVRBLFNBQVNBLENBQVVBO1FBQzNDQSxrQkFBYUEsR0FBYkEsYUFBYUEsQ0FBQUE7UUFBU0EsYUFBUUEsR0FBUkEsUUFBUUEsQ0FBU0E7UUFBU0EsZ0JBQVdBLEdBQVhBLFdBQVdBLENBQVFBO1FBQ25FQSxXQUFNQSxHQUFOQSxNQUFNQSxDQUE2QkE7UUFMdERBLFVBQUtBLEdBQVlBLEtBQUtBLENBQUNBO1FBTXJCQSxJQUFJQSxDQUFDQSxTQUFTQSxHQUFHQSxTQUFTQSxDQUFDQSxJQUFJQSxDQUFDQSxHQUFHQSxJQUFJQSxHQUFHQSxnQkFBZ0JBLENBQUNBO0lBQzdEQSxDQUFDQTtBQUNIRCxDQUFDQTtBQUFBIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtNYXAsIE1hcFdyYXBwZXIsIFN0cmluZ01hcFdyYXBwZXIsIExpc3RXcmFwcGVyfSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2NvbGxlY3Rpb24nO1xuaW1wb3J0IHtpc1ByZXNlbnQsIGlzQmxhbmssIG5vcm1hbGl6ZUJsYW5rLCBUeXBlLCBDT05TVF9FWFBSfSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2xhbmcnO1xuaW1wb3J0IHtQcm9taXNlLCBQcm9taXNlV3JhcHBlcn0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9hc3luYyc7XG5cblxuLyoqXG4gKiBgUm91dGVQYXJhbXNgIGlzIGFuIGltbXV0YWJsZSBtYXAgb2YgcGFyYW1ldGVycyBmb3IgdGhlIGdpdmVuIHJvdXRlXG4gKiBiYXNlZCBvbiB0aGUgdXJsIG1hdGNoZXIgYW5kIG9wdGlvbmFsIHBhcmFtZXRlcnMgZm9yIHRoYXQgcm91dGUuXG4gKlxuICogWW91IGNhbiBpbmplY3QgYFJvdXRlUGFyYW1zYCBpbnRvIHRoZSBjb25zdHJ1Y3RvciBvZiBhIGNvbXBvbmVudCB0byB1c2UgaXQuXG4gKlxuICogIyMjIEV4YW1wbGVcbiAqXG4gKiBgYGBcbiAqIGltcG9ydCB7Q29tcG9uZW50fSBmcm9tICdhbmd1bGFyMi9jb3JlJztcbiAqIGltcG9ydCB7Ym9vdHN0cmFwfSBmcm9tICdhbmd1bGFyMi9wbGF0Zm9ybS9icm93c2VyJztcbiAqIGltcG9ydCB7Um91dGVyLCBST1VURVJfRElSRUNUSVZFUywgUk9VVEVSX1BST1ZJREVSUywgUm91dGVDb25maWd9IGZyb20gJ2FuZ3VsYXIyL3JvdXRlcic7XG4gKlxuICogQENvbXBvbmVudCh7ZGlyZWN0aXZlczogW1JPVVRFUl9ESVJFQ1RJVkVTXX0pXG4gKiBAUm91dGVDb25maWcoW1xuICogIHtwYXRoOiAnL3VzZXIvOmlkJywgY29tcG9uZW50OiBVc2VyQ21wLCBhczogJ1VzZXJDbXAnfSxcbiAqIF0pXG4gKiBjbGFzcyBBcHBDbXAge31cbiAqXG4gKiBAQ29tcG9uZW50KHsgdGVtcGxhdGU6ICd1c2VyOiB7e2lkfX0nIH0pXG4gKiBjbGFzcyBVc2VyQ21wIHtcbiAqICAgaWQ6IHN0cmluZztcbiAqICAgY29uc3RydWN0b3IocGFyYW1zOiBSb3V0ZVBhcmFtcykge1xuICogICAgIHRoaXMuaWQgPSBwYXJhbXMuZ2V0KCdpZCcpO1xuICogICB9XG4gKiB9XG4gKlxuICogYm9vdHN0cmFwKEFwcENtcCwgUk9VVEVSX1BST1ZJREVSUyk7XG4gKiBgYGBcbiAqL1xuZXhwb3J0IGNsYXNzIFJvdXRlUGFyYW1zIHtcbiAgY29uc3RydWN0b3IocHVibGljIHBhcmFtczoge1trZXk6IHN0cmluZ106IHN0cmluZ30pIHt9XG5cbiAgZ2V0KHBhcmFtOiBzdHJpbmcpOiBzdHJpbmcgeyByZXR1cm4gbm9ybWFsaXplQmxhbmsoU3RyaW5nTWFwV3JhcHBlci5nZXQodGhpcy5wYXJhbXMsIHBhcmFtKSk7IH1cbn1cblxuLyoqXG4gKiBgUm91dGVEYXRhYCBpcyBhbiBpbW11dGFibGUgbWFwIG9mIGFkZGl0aW9uYWwgZGF0YSB5b3UgY2FuIGNvbmZpZ3VyZSBpbiB5b3VyIHtAbGluayBSb3V0ZX0uXG4gKlxuICogWW91IGNhbiBpbmplY3QgYFJvdXRlRGF0YWAgaW50byB0aGUgY29uc3RydWN0b3Igb2YgYSBjb21wb25lbnQgdG8gdXNlIGl0LlxuICpcbiAqICMjIyBFeGFtcGxlXG4gKlxuICogYGBgXG4gKiBpbXBvcnQge0NvbXBvbmVudCwgVmlld30gZnJvbSAnYW5ndWxhcjIvY29yZSc7XG4gKiBpbXBvcnQge2Jvb3RzdHJhcH0gZnJvbSAnYW5ndWxhcjIvcGxhdGZvcm0vYnJvd3Nlcic7XG4gKiBpbXBvcnQge1JvdXRlciwgUk9VVEVSX0RJUkVDVElWRVMsIHJvdXRlckJpbmRpbmdzLCBSb3V0ZUNvbmZpZ30gZnJvbSAnYW5ndWxhcjIvcm91dGVyJztcbiAqXG4gKiBAQ29tcG9uZW50KHsuLi59KVxuICogQFZpZXcoe2RpcmVjdGl2ZXM6IFtST1VURVJfRElSRUNUSVZFU119KVxuICogQFJvdXRlQ29uZmlnKFtcbiAqICB7cGF0aDogJy91c2VyLzppZCcsIGNvbXBvbmVudDogVXNlckNtcCwgYXM6ICdVc2VyQ21wJywgZGF0YToge2lzQWRtaW46IHRydWV9fSxcbiAqIF0pXG4gKiBjbGFzcyBBcHBDbXAge31cbiAqXG4gKiBAQ29tcG9uZW50KHsuLi59KVxuICogQFZpZXcoeyB0ZW1wbGF0ZTogJ3VzZXI6IHt7aXNBZG1pbn19JyB9KVxuICogY2xhc3MgVXNlckNtcCB7XG4gKiAgIHN0cmluZzogaXNBZG1pbjtcbiAqICAgY29uc3RydWN0b3IoZGF0YTogUm91dGVEYXRhKSB7XG4gKiAgICAgdGhpcy5pc0FkbWluID0gZGF0YS5nZXQoJ2lzQWRtaW4nKTtcbiAqICAgfVxuICogfVxuICpcbiAqIGJvb3RzdHJhcChBcHBDbXAsIHJvdXRlckJpbmRpbmdzKEFwcENtcCkpO1xuICogYGBgXG4gKi9cbmV4cG9ydCBjbGFzcyBSb3V0ZURhdGEge1xuICBjb25zdHJ1Y3RvcihwdWJsaWMgZGF0YToge1trZXk6IHN0cmluZ106IGFueX0gPSBDT05TVF9FWFBSKHt9KSkge31cblxuICBnZXQoa2V5OiBzdHJpbmcpOiBhbnkgeyByZXR1cm4gbm9ybWFsaXplQmxhbmsoU3RyaW5nTWFwV3JhcHBlci5nZXQodGhpcy5kYXRhLCBrZXkpKTsgfVxufVxuXG5leHBvcnQgdmFyIEJMQU5LX1JPVVRFX0RBVEEgPSBuZXcgUm91dGVEYXRhKCk7XG5cbi8qKlxuICogYEluc3RydWN0aW9uYCBpcyBhIHRyZWUgb2Yge0BsaW5rIENvbXBvbmVudEluc3RydWN0aW9ufXMgd2l0aCBhbGwgdGhlIGluZm9ybWF0aW9uIG5lZWRlZFxuICogdG8gdHJhbnNpdGlvbiBlYWNoIGNvbXBvbmVudCBpbiB0aGUgYXBwIHRvIGEgZ2l2ZW4gcm91dGUsIGluY2x1ZGluZyBhbGwgYXV4aWxpYXJ5IHJvdXRlcy5cbiAqXG4gKiBgSW5zdHJ1Y3Rpb25gcyBjYW4gYmUgY3JlYXRlZCB1c2luZyB7QGxpbmsgUm91dGVyI2dlbmVyYXRlfSwgYW5kIGNhbiBiZSB1c2VkIHRvXG4gKiBwZXJmb3JtIHJvdXRlIGNoYW5nZXMgd2l0aCB7QGxpbmsgUm91dGVyI25hdmlnYXRlQnlJbnN0cnVjdGlvbn0uXG4gKlxuICogIyMjIEV4YW1wbGVcbiAqXG4gKiBgYGBcbiAqIGltcG9ydCB7Q29tcG9uZW50fSBmcm9tICdhbmd1bGFyMi9jb3JlJztcbiAqIGltcG9ydCB7Ym9vdHN0cmFwfSBmcm9tICdhbmd1bGFyMi9wbGF0Zm9ybS9icm93c2VyJztcbiAqIGltcG9ydCB7Um91dGVyLCBST1VURVJfRElSRUNUSVZFUywgUk9VVEVSX1BST1ZJREVSUywgUm91dGVDb25maWd9IGZyb20gJ2FuZ3VsYXIyL3JvdXRlcic7XG4gKlxuICogQENvbXBvbmVudCh7ZGlyZWN0aXZlczogW1JPVVRFUl9ESVJFQ1RJVkVTXX0pXG4gKiBAUm91dGVDb25maWcoW1xuICogIHsuLi59LFxuICogXSlcbiAqIGNsYXNzIEFwcENtcCB7XG4gKiAgIGNvbnN0cnVjdG9yKHJvdXRlcjogUm91dGVyKSB7XG4gKiAgICAgdmFyIGluc3RydWN0aW9uID0gcm91dGVyLmdlbmVyYXRlKFsnL015Um91dGUnXSk7XG4gKiAgICAgcm91dGVyLm5hdmlnYXRlQnlJbnN0cnVjdGlvbihpbnN0cnVjdGlvbik7XG4gKiAgIH1cbiAqIH1cbiAqXG4gKiBib290c3RyYXAoQXBwQ21wLCBST1VURVJfUFJPVklERVJTKTtcbiAqIGBgYFxuICovXG5leHBvcnQgYWJzdHJhY3QgY2xhc3MgSW5zdHJ1Y3Rpb24ge1xuICBwdWJsaWMgY29tcG9uZW50OiBDb21wb25lbnRJbnN0cnVjdGlvbjtcbiAgcHVibGljIGNoaWxkOiBJbnN0cnVjdGlvbjtcbiAgcHVibGljIGF1eEluc3RydWN0aW9uOiB7W2tleTogc3RyaW5nXTogSW5zdHJ1Y3Rpb259ID0ge307XG5cbiAgZ2V0IHVybFBhdGgoKTogc3RyaW5nIHsgcmV0dXJuIGlzUHJlc2VudCh0aGlzLmNvbXBvbmVudCkgPyB0aGlzLmNvbXBvbmVudC51cmxQYXRoIDogJyc7IH1cblxuICBnZXQgdXJsUGFyYW1zKCk6IHN0cmluZ1tdIHsgcmV0dXJuIGlzUHJlc2VudCh0aGlzLmNvbXBvbmVudCkgPyB0aGlzLmNvbXBvbmVudC51cmxQYXJhbXMgOiBbXTsgfVxuXG4gIGdldCBzcGVjaWZpY2l0eSgpOiBudW1iZXIge1xuICAgIHZhciB0b3RhbCA9IDA7XG4gICAgaWYgKGlzUHJlc2VudCh0aGlzLmNvbXBvbmVudCkpIHtcbiAgICAgIHRvdGFsICs9IHRoaXMuY29tcG9uZW50LnNwZWNpZmljaXR5O1xuICAgIH1cbiAgICBpZiAoaXNQcmVzZW50KHRoaXMuY2hpbGQpKSB7XG4gICAgICB0b3RhbCArPSB0aGlzLmNoaWxkLnNwZWNpZmljaXR5O1xuICAgIH1cbiAgICByZXR1cm4gdG90YWw7XG4gIH1cblxuICBhYnN0cmFjdCByZXNvbHZlQ29tcG9uZW50KCk6IFByb21pc2U8Q29tcG9uZW50SW5zdHJ1Y3Rpb24+O1xuXG4gIC8qKlxuICAgKiBjb252ZXJ0cyB0aGUgaW5zdHJ1Y3Rpb24gaW50byBhIFVSTCBzdHJpbmdcbiAgICovXG4gIHRvUm9vdFVybCgpOiBzdHJpbmcgeyByZXR1cm4gdGhpcy50b1VybFBhdGgoKSArIHRoaXMudG9VcmxRdWVyeSgpOyB9XG5cbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBfdG9Ob25Sb290VXJsKCk6IHN0cmluZyB7XG4gICAgcmV0dXJuIHRoaXMuX3N0cmluZ2lmeVBhdGhNYXRyaXhBdXhQcmVmaXhlZCgpICtcbiAgICAgICAgICAgKGlzUHJlc2VudCh0aGlzLmNoaWxkKSA/IHRoaXMuY2hpbGQuX3RvTm9uUm9vdFVybCgpIDogJycpO1xuICB9XG5cbiAgdG9VcmxRdWVyeSgpOiBzdHJpbmcgeyByZXR1cm4gdGhpcy51cmxQYXJhbXMubGVuZ3RoID4gMCA/ICgnPycgKyB0aGlzLnVybFBhcmFtcy5qb2luKCcmJykpIDogJyc7IH1cblxuICAvKipcbiAgICogUmV0dXJucyBhIG5ldyBpbnN0cnVjdGlvbiB0aGF0IHNoYXJlcyB0aGUgc3RhdGUgb2YgdGhlIGV4aXN0aW5nIGluc3RydWN0aW9uLCBidXQgd2l0aFxuICAgKiB0aGUgZ2l2ZW4gY2hpbGQge0BsaW5rIEluc3RydWN0aW9ufSByZXBsYWNpbmcgdGhlIGV4aXN0aW5nIGNoaWxkLlxuICAgKi9cbiAgcmVwbGFjZUNoaWxkKGNoaWxkOiBJbnN0cnVjdGlvbik6IEluc3RydWN0aW9uIHtcbiAgICByZXR1cm4gbmV3IFJlc29sdmVkSW5zdHJ1Y3Rpb24odGhpcy5jb21wb25lbnQsIGNoaWxkLCB0aGlzLmF1eEluc3RydWN0aW9uKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBJZiB0aGUgZmluYWwgVVJMIGZvciB0aGUgaW5zdHJ1Y3Rpb24gaXMgYGBcbiAgICovXG4gIHRvVXJsUGF0aCgpOiBzdHJpbmcge1xuICAgIHJldHVybiB0aGlzLnVybFBhdGggKyB0aGlzLl9zdHJpbmdpZnlBdXgoKSArXG4gICAgICAgICAgIChpc1ByZXNlbnQodGhpcy5jaGlsZCkgPyB0aGlzLmNoaWxkLl90b05vblJvb3RVcmwoKSA6ICcnKTtcbiAgfVxuXG4gIC8vIGRlZmF1bHQgaW5zdHJ1Y3Rpb25zIG92ZXJyaWRlIHRoZXNlXG4gIHRvTGlua1VybCgpOiBzdHJpbmcge1xuICAgIHJldHVybiB0aGlzLnVybFBhdGggKyB0aGlzLl9zdHJpbmdpZnlBdXgoKSArXG4gICAgICAgICAgIChpc1ByZXNlbnQodGhpcy5jaGlsZCkgPyB0aGlzLmNoaWxkLl90b0xpbmtVcmwoKSA6ICcnKTtcbiAgfVxuXG4gIC8vIHRoaXMgaXMgdGhlIG5vbi1yb290IHZlcnNpb24gKGNhbGxlZCByZWN1cnNpdmVseSlcbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBfdG9MaW5rVXJsKCk6IHN0cmluZyB7XG4gICAgcmV0dXJuIHRoaXMuX3N0cmluZ2lmeVBhdGhNYXRyaXhBdXhQcmVmaXhlZCgpICtcbiAgICAgICAgICAgKGlzUHJlc2VudCh0aGlzLmNoaWxkKSA/IHRoaXMuY2hpbGQuX3RvTGlua1VybCgpIDogJycpO1xuICB9XG5cbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBfc3RyaW5naWZ5UGF0aE1hdHJpeEF1eFByZWZpeGVkKCk6IHN0cmluZyB7XG4gICAgdmFyIHByaW1hcnkgPSB0aGlzLl9zdHJpbmdpZnlQYXRoTWF0cml4QXV4KCk7XG4gICAgaWYgKHByaW1hcnkubGVuZ3RoID4gMCkge1xuICAgICAgcHJpbWFyeSA9ICcvJyArIHByaW1hcnk7XG4gICAgfVxuICAgIHJldHVybiBwcmltYXJ5O1xuICB9XG5cbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBfc3RyaW5naWZ5TWF0cml4UGFyYW1zKCk6IHN0cmluZyB7XG4gICAgcmV0dXJuIHRoaXMudXJsUGFyYW1zLmxlbmd0aCA+IDAgPyAoJzsnICsgdGhpcy51cmxQYXJhbXMuam9pbignOycpKSA6ICcnO1xuICB9XG5cbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBfc3RyaW5naWZ5UGF0aE1hdHJpeEF1eCgpOiBzdHJpbmcge1xuICAgIGlmIChpc0JsYW5rKHRoaXMuY29tcG9uZW50KSkge1xuICAgICAgcmV0dXJuICcnO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcy51cmxQYXRoICsgdGhpcy5fc3RyaW5naWZ5TWF0cml4UGFyYW1zKCkgKyB0aGlzLl9zdHJpbmdpZnlBdXgoKTtcbiAgfVxuXG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgX3N0cmluZ2lmeUF1eCgpOiBzdHJpbmcge1xuICAgIHZhciByb3V0ZXMgPSBbXTtcbiAgICBTdHJpbmdNYXBXcmFwcGVyLmZvckVhY2godGhpcy5hdXhJbnN0cnVjdGlvbiwgKGF1eEluc3RydWN0aW9uLCBfKSA9PiB7XG4gICAgICByb3V0ZXMucHVzaChhdXhJbnN0cnVjdGlvbi5fc3RyaW5naWZ5UGF0aE1hdHJpeEF1eCgpKTtcbiAgICB9KTtcbiAgICBpZiAocm91dGVzLmxlbmd0aCA+IDApIHtcbiAgICAgIHJldHVybiAnKCcgKyByb3V0ZXMuam9pbignLy8nKSArICcpJztcbiAgICB9XG4gICAgcmV0dXJuICcnO1xuICB9XG59XG5cblxuLyoqXG4gKiBhIHJlc29sdmVkIGluc3RydWN0aW9uIGhhcyBhbiBvdXRsZXQgaW5zdHJ1Y3Rpb24gZm9yIGl0c2VsZiwgYnV0IG1heWJlIG5vdCBmb3IuLi5cbiAqL1xuZXhwb3J0IGNsYXNzIFJlc29sdmVkSW5zdHJ1Y3Rpb24gZXh0ZW5kcyBJbnN0cnVjdGlvbiB7XG4gIGNvbnN0cnVjdG9yKHB1YmxpYyBjb21wb25lbnQ6IENvbXBvbmVudEluc3RydWN0aW9uLCBwdWJsaWMgY2hpbGQ6IEluc3RydWN0aW9uLFxuICAgICAgICAgICAgICBwdWJsaWMgYXV4SW5zdHJ1Y3Rpb246IHtba2V5OiBzdHJpbmddOiBJbnN0cnVjdGlvbn0pIHtcbiAgICBzdXBlcigpO1xuICB9XG5cbiAgcmVzb2x2ZUNvbXBvbmVudCgpOiBQcm9taXNlPENvbXBvbmVudEluc3RydWN0aW9uPiB7XG4gICAgcmV0dXJuIFByb21pc2VXcmFwcGVyLnJlc29sdmUodGhpcy5jb21wb25lbnQpO1xuICB9XG59XG5cblxuLyoqXG4gKiBSZXByZXNlbnRzIGEgcmVzb2x2ZWQgZGVmYXVsdCByb3V0ZVxuICovXG5leHBvcnQgY2xhc3MgRGVmYXVsdEluc3RydWN0aW9uIGV4dGVuZHMgSW5zdHJ1Y3Rpb24ge1xuICBjb25zdHJ1Y3RvcihwdWJsaWMgY29tcG9uZW50OiBDb21wb25lbnRJbnN0cnVjdGlvbiwgcHVibGljIGNoaWxkOiBEZWZhdWx0SW5zdHJ1Y3Rpb24pIHsgc3VwZXIoKTsgfVxuXG4gIHJlc29sdmVDb21wb25lbnQoKTogUHJvbWlzZTxDb21wb25lbnRJbnN0cnVjdGlvbj4ge1xuICAgIHJldHVybiBQcm9taXNlV3JhcHBlci5yZXNvbHZlKHRoaXMuY29tcG9uZW50KTtcbiAgfVxuXG4gIHRvTGlua1VybCgpOiBzdHJpbmcgeyByZXR1cm4gJyc7IH1cblxuICAvKiogQGludGVybmFsICovXG4gIF90b0xpbmtVcmwoKTogc3RyaW5nIHsgcmV0dXJuICcnOyB9XG59XG5cblxuLyoqXG4gKiBSZXByZXNlbnRzIGEgY29tcG9uZW50IHRoYXQgbWF5IG5lZWQgdG8gZG8gc29tZSByZWRpcmVjdGlvbiBvciBsYXp5IGxvYWRpbmcgYXQgYSBsYXRlciB0aW1lLlxuICovXG5leHBvcnQgY2xhc3MgVW5yZXNvbHZlZEluc3RydWN0aW9uIGV4dGVuZHMgSW5zdHJ1Y3Rpb24ge1xuICBjb25zdHJ1Y3Rvcihwcml2YXRlIF9yZXNvbHZlcjogKCkgPT4gUHJvbWlzZTxJbnN0cnVjdGlvbj4sIHByaXZhdGUgX3VybFBhdGg6IHN0cmluZyA9ICcnLFxuICAgICAgICAgICAgICBwcml2YXRlIF91cmxQYXJhbXM6IHN0cmluZ1tdID0gQ09OU1RfRVhQUihbXSkpIHtcbiAgICBzdXBlcigpO1xuICB9XG5cbiAgZ2V0IHVybFBhdGgoKTogc3RyaW5nIHtcbiAgICBpZiAoaXNQcmVzZW50KHRoaXMuY29tcG9uZW50KSkge1xuICAgICAgcmV0dXJuIHRoaXMuY29tcG9uZW50LnVybFBhdGg7XG4gICAgfVxuICAgIGlmIChpc1ByZXNlbnQodGhpcy5fdXJsUGF0aCkpIHtcbiAgICAgIHJldHVybiB0aGlzLl91cmxQYXRoO1xuICAgIH1cbiAgICByZXR1cm4gJyc7XG4gIH1cblxuICBnZXQgdXJsUGFyYW1zKCk6IHN0cmluZ1tdIHtcbiAgICBpZiAoaXNQcmVzZW50KHRoaXMuY29tcG9uZW50KSkge1xuICAgICAgcmV0dXJuIHRoaXMuY29tcG9uZW50LnVybFBhcmFtcztcbiAgICB9XG4gICAgaWYgKGlzUHJlc2VudCh0aGlzLl91cmxQYXJhbXMpKSB7XG4gICAgICByZXR1cm4gdGhpcy5fdXJsUGFyYW1zO1xuICAgIH1cbiAgICByZXR1cm4gW107XG4gIH1cblxuICByZXNvbHZlQ29tcG9uZW50KCk6IFByb21pc2U8Q29tcG9uZW50SW5zdHJ1Y3Rpb24+IHtcbiAgICBpZiAoaXNQcmVzZW50KHRoaXMuY29tcG9uZW50KSkge1xuICAgICAgcmV0dXJuIFByb21pc2VXcmFwcGVyLnJlc29sdmUodGhpcy5jb21wb25lbnQpO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcy5fcmVzb2x2ZXIoKS50aGVuKChyZXNvbHV0aW9uOiBJbnN0cnVjdGlvbikgPT4ge1xuICAgICAgdGhpcy5jaGlsZCA9IHJlc29sdXRpb24uY2hpbGQ7XG4gICAgICByZXR1cm4gdGhpcy5jb21wb25lbnQgPSByZXNvbHV0aW9uLmNvbXBvbmVudDtcbiAgICB9KTtcbiAgfVxufVxuXG5cbmV4cG9ydCBjbGFzcyBSZWRpcmVjdEluc3RydWN0aW9uIGV4dGVuZHMgUmVzb2x2ZWRJbnN0cnVjdGlvbiB7XG4gIGNvbnN0cnVjdG9yKGNvbXBvbmVudDogQ29tcG9uZW50SW5zdHJ1Y3Rpb24sIGNoaWxkOiBJbnN0cnVjdGlvbixcbiAgICAgICAgICAgICAgYXV4SW5zdHJ1Y3Rpb246IHtba2V5OiBzdHJpbmddOiBJbnN0cnVjdGlvbn0pIHtcbiAgICBzdXBlcihjb21wb25lbnQsIGNoaWxkLCBhdXhJbnN0cnVjdGlvbik7XG4gIH1cbn1cblxuXG4vKipcbiAqIEEgYENvbXBvbmVudEluc3RydWN0aW9uYCByZXByZXNlbnRzIHRoZSByb3V0ZSBzdGF0ZSBmb3IgYSBzaW5nbGUgY29tcG9uZW50LiBBbiBgSW5zdHJ1Y3Rpb25gIGlzXG4gKiBjb21wb3NlZCBvZiBhIHRyZWUgb2YgdGhlc2UgYENvbXBvbmVudEluc3RydWN0aW9uYHMuXG4gKlxuICogYENvbXBvbmVudEluc3RydWN0aW9uc2AgaXMgYSBwdWJsaWMgQVBJLiBJbnN0YW5jZXMgb2YgYENvbXBvbmVudEluc3RydWN0aW9uYCBhcmUgcGFzc2VkXG4gKiB0byByb3V0ZSBsaWZlY3ljbGUgaG9va3MsIGxpa2Uge0BsaW5rIENhbkFjdGl2YXRlfS5cbiAqXG4gKiBgQ29tcG9uZW50SW5zdHJ1Y3Rpb25gcyBhcmUgW2h0dHBzOi8vZW4ud2lraXBlZGlhLm9yZy93aWtpL0hhc2hfY29uc2luZ10oaGFzaCBjb25zZWQpLiBZb3Ugc2hvdWxkXG4gKiBuZXZlciBjb25zdHJ1Y3Qgb25lIHlvdXJzZWxmIHdpdGggXCJuZXcuXCIgSW5zdGVhZCwgcmVseSBvbiB7QGxpbmsgUm91dGVyL1JvdXRlUmVjb2duaXplcn0gdG9cbiAqIGNvbnN0cnVjdCBgQ29tcG9uZW50SW5zdHJ1Y3Rpb25gcy5cbiAqXG4gKiBZb3Ugc2hvdWxkIG5vdCBtb2RpZnkgdGhpcyBvYmplY3QuIEl0IHNob3VsZCBiZSB0cmVhdGVkIGFzIGltbXV0YWJsZS5cbiAqL1xuZXhwb3J0IGNsYXNzIENvbXBvbmVudEluc3RydWN0aW9uIHtcbiAgcmV1c2U6IGJvb2xlYW4gPSBmYWxzZTtcbiAgcHVibGljIHJvdXRlRGF0YTogUm91dGVEYXRhO1xuXG4gIGNvbnN0cnVjdG9yKHB1YmxpYyB1cmxQYXRoOiBzdHJpbmcsIHB1YmxpYyB1cmxQYXJhbXM6IHN0cmluZ1tdLCBkYXRhOiBSb3V0ZURhdGEsXG4gICAgICAgICAgICAgIHB1YmxpYyBjb21wb25lbnRUeXBlLCBwdWJsaWMgdGVybWluYWw6IGJvb2xlYW4sIHB1YmxpYyBzcGVjaWZpY2l0eTogbnVtYmVyLFxuICAgICAgICAgICAgICBwdWJsaWMgcGFyYW1zOiB7W2tleTogc3RyaW5nXTogYW55fSA9IG51bGwpIHtcbiAgICB0aGlzLnJvdXRlRGF0YSA9IGlzUHJlc2VudChkYXRhKSA/IGRhdGEgOiBCTEFOS19ST1VURV9EQVRBO1xuICB9XG59XG4iXX0=