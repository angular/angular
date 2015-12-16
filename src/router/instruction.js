'use strict';var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var collection_1 = require('angular2/src/facade/collection');
var lang_1 = require('angular2/src/facade/lang');
var async_1 = require('angular2/src/facade/async');
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
var RouteParams = (function () {
    function RouteParams(params) {
        this.params = params;
    }
    RouteParams.prototype.get = function (param) { return lang_1.normalizeBlank(collection_1.StringMapWrapper.get(this.params, param)); };
    return RouteParams;
})();
exports.RouteParams = RouteParams;
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
var RouteData = (function () {
    function RouteData(data) {
        if (data === void 0) { data = lang_1.CONST_EXPR({}); }
        this.data = data;
    }
    RouteData.prototype.get = function (key) { return lang_1.normalizeBlank(collection_1.StringMapWrapper.get(this.data, key)); };
    return RouteData;
})();
exports.RouteData = RouteData;
exports.BLANK_ROUTE_DATA = new RouteData();
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
var Instruction = (function () {
    function Instruction() {
        this.auxInstruction = {};
    }
    Object.defineProperty(Instruction.prototype, "urlPath", {
        get: function () { return lang_1.isPresent(this.component) ? this.component.urlPath : ''; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Instruction.prototype, "urlParams", {
        get: function () { return lang_1.isPresent(this.component) ? this.component.urlParams : []; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Instruction.prototype, "specificity", {
        get: function () {
            var total = 0;
            if (lang_1.isPresent(this.component)) {
                total += this.component.specificity;
            }
            if (lang_1.isPresent(this.child)) {
                total += this.child.specificity;
            }
            return total;
        },
        enumerable: true,
        configurable: true
    });
    /**
     * converts the instruction into a URL string
     */
    Instruction.prototype.toRootUrl = function () { return this.toUrlPath() + this.toUrlQuery(); };
    /** @internal */
    Instruction.prototype._toNonRootUrl = function () {
        return this._stringifyPathMatrixAuxPrefixed() +
            (lang_1.isPresent(this.child) ? this.child._toNonRootUrl() : '');
    };
    Instruction.prototype.toUrlQuery = function () { return this.urlParams.length > 0 ? ('?' + this.urlParams.join('&')) : ''; };
    /**
     * Returns a new instruction that shares the state of the existing instruction, but with
     * the given child {@link Instruction} replacing the existing child.
     */
    Instruction.prototype.replaceChild = function (child) {
        return new ResolvedInstruction(this.component, child, this.auxInstruction);
    };
    /**
     * If the final URL for the instruction is ``
     */
    Instruction.prototype.toUrlPath = function () {
        return this.urlPath + this._stringifyAux() +
            (lang_1.isPresent(this.child) ? this.child._toNonRootUrl() : '');
    };
    // default instructions override these
    Instruction.prototype.toLinkUrl = function () {
        return this.urlPath + this._stringifyAux() +
            (lang_1.isPresent(this.child) ? this.child._toLinkUrl() : '');
    };
    // this is the non-root version (called recursively)
    /** @internal */
    Instruction.prototype._toLinkUrl = function () {
        return this._stringifyPathMatrixAuxPrefixed() +
            (lang_1.isPresent(this.child) ? this.child._toLinkUrl() : '');
    };
    /** @internal */
    Instruction.prototype._stringifyPathMatrixAuxPrefixed = function () {
        var primary = this._stringifyPathMatrixAux();
        if (primary.length > 0) {
            primary = '/' + primary;
        }
        return primary;
    };
    /** @internal */
    Instruction.prototype._stringifyMatrixParams = function () {
        return this.urlParams.length > 0 ? (';' + this.urlParams.join(';')) : '';
    };
    /** @internal */
    Instruction.prototype._stringifyPathMatrixAux = function () {
        if (lang_1.isBlank(this.component)) {
            return '';
        }
        return this.urlPath + this._stringifyMatrixParams() + this._stringifyAux();
    };
    /** @internal */
    Instruction.prototype._stringifyAux = function () {
        var routes = [];
        collection_1.StringMapWrapper.forEach(this.auxInstruction, function (auxInstruction, _) {
            routes.push(auxInstruction._stringifyPathMatrixAux());
        });
        if (routes.length > 0) {
            return '(' + routes.join('//') + ')';
        }
        return '';
    };
    return Instruction;
})();
exports.Instruction = Instruction;
/**
 * a resolved instruction has an outlet instruction for itself, but maybe not for...
 */
var ResolvedInstruction = (function (_super) {
    __extends(ResolvedInstruction, _super);
    function ResolvedInstruction(component, child, auxInstruction) {
        _super.call(this);
        this.component = component;
        this.child = child;
        this.auxInstruction = auxInstruction;
    }
    ResolvedInstruction.prototype.resolveComponent = function () {
        return async_1.PromiseWrapper.resolve(this.component);
    };
    return ResolvedInstruction;
})(Instruction);
exports.ResolvedInstruction = ResolvedInstruction;
/**
 * Represents a resolved default route
 */
var DefaultInstruction = (function (_super) {
    __extends(DefaultInstruction, _super);
    function DefaultInstruction(component, child) {
        _super.call(this);
        this.component = component;
        this.child = child;
    }
    DefaultInstruction.prototype.resolveComponent = function () {
        return async_1.PromiseWrapper.resolve(this.component);
    };
    DefaultInstruction.prototype.toLinkUrl = function () { return ''; };
    /** @internal */
    DefaultInstruction.prototype._toLinkUrl = function () { return ''; };
    return DefaultInstruction;
})(Instruction);
exports.DefaultInstruction = DefaultInstruction;
/**
 * Represents a component that may need to do some redirection or lazy loading at a later time.
 */
var UnresolvedInstruction = (function (_super) {
    __extends(UnresolvedInstruction, _super);
    function UnresolvedInstruction(_resolver, _urlPath, _urlParams) {
        if (_urlPath === void 0) { _urlPath = ''; }
        if (_urlParams === void 0) { _urlParams = lang_1.CONST_EXPR([]); }
        _super.call(this);
        this._resolver = _resolver;
        this._urlPath = _urlPath;
        this._urlParams = _urlParams;
    }
    Object.defineProperty(UnresolvedInstruction.prototype, "urlPath", {
        get: function () {
            if (lang_1.isPresent(this.component)) {
                return this.component.urlPath;
            }
            if (lang_1.isPresent(this._urlPath)) {
                return this._urlPath;
            }
            return '';
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(UnresolvedInstruction.prototype, "urlParams", {
        get: function () {
            if (lang_1.isPresent(this.component)) {
                return this.component.urlParams;
            }
            if (lang_1.isPresent(this._urlParams)) {
                return this._urlParams;
            }
            return [];
        },
        enumerable: true,
        configurable: true
    });
    UnresolvedInstruction.prototype.resolveComponent = function () {
        var _this = this;
        if (lang_1.isPresent(this.component)) {
            return async_1.PromiseWrapper.resolve(this.component);
        }
        return this._resolver().then(function (resolution) {
            _this.child = resolution.child;
            return _this.component = resolution.component;
        });
    };
    return UnresolvedInstruction;
})(Instruction);
exports.UnresolvedInstruction = UnresolvedInstruction;
var RedirectInstruction = (function (_super) {
    __extends(RedirectInstruction, _super);
    function RedirectInstruction(component, child, auxInstruction) {
        _super.call(this, component, child, auxInstruction);
    }
    return RedirectInstruction;
})(ResolvedInstruction);
exports.RedirectInstruction = RedirectInstruction;
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
var ComponentInstruction = (function () {
    function ComponentInstruction(urlPath, urlParams, data, componentType, terminal, specificity, params) {
        if (params === void 0) { params = null; }
        this.urlPath = urlPath;
        this.urlParams = urlParams;
        this.componentType = componentType;
        this.terminal = terminal;
        this.specificity = specificity;
        this.params = params;
        this.reuse = false;
        this.routeData = lang_1.isPresent(data) ? data : exports.BLANK_ROUTE_DATA;
    }
    return ComponentInstruction;
})();
exports.ComponentInstruction = ComponentInstruction;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5zdHJ1Y3Rpb24uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJhbmd1bGFyMi9zcmMvcm91dGVyL2luc3RydWN0aW9uLnRzIl0sIm5hbWVzIjpbIlJvdXRlUGFyYW1zIiwiUm91dGVQYXJhbXMuY29uc3RydWN0b3IiLCJSb3V0ZVBhcmFtcy5nZXQiLCJSb3V0ZURhdGEiLCJSb3V0ZURhdGEuY29uc3RydWN0b3IiLCJSb3V0ZURhdGEuZ2V0IiwiSW5zdHJ1Y3Rpb24iLCJJbnN0cnVjdGlvbi5jb25zdHJ1Y3RvciIsIkluc3RydWN0aW9uLnVybFBhdGgiLCJJbnN0cnVjdGlvbi51cmxQYXJhbXMiLCJJbnN0cnVjdGlvbi5zcGVjaWZpY2l0eSIsIkluc3RydWN0aW9uLnRvUm9vdFVybCIsIkluc3RydWN0aW9uLl90b05vblJvb3RVcmwiLCJJbnN0cnVjdGlvbi50b1VybFF1ZXJ5IiwiSW5zdHJ1Y3Rpb24ucmVwbGFjZUNoaWxkIiwiSW5zdHJ1Y3Rpb24udG9VcmxQYXRoIiwiSW5zdHJ1Y3Rpb24udG9MaW5rVXJsIiwiSW5zdHJ1Y3Rpb24uX3RvTGlua1VybCIsIkluc3RydWN0aW9uLl9zdHJpbmdpZnlQYXRoTWF0cml4QXV4UHJlZml4ZWQiLCJJbnN0cnVjdGlvbi5fc3RyaW5naWZ5TWF0cml4UGFyYW1zIiwiSW5zdHJ1Y3Rpb24uX3N0cmluZ2lmeVBhdGhNYXRyaXhBdXgiLCJJbnN0cnVjdGlvbi5fc3RyaW5naWZ5QXV4IiwiUmVzb2x2ZWRJbnN0cnVjdGlvbiIsIlJlc29sdmVkSW5zdHJ1Y3Rpb24uY29uc3RydWN0b3IiLCJSZXNvbHZlZEluc3RydWN0aW9uLnJlc29sdmVDb21wb25lbnQiLCJEZWZhdWx0SW5zdHJ1Y3Rpb24iLCJEZWZhdWx0SW5zdHJ1Y3Rpb24uY29uc3RydWN0b3IiLCJEZWZhdWx0SW5zdHJ1Y3Rpb24ucmVzb2x2ZUNvbXBvbmVudCIsIkRlZmF1bHRJbnN0cnVjdGlvbi50b0xpbmtVcmwiLCJEZWZhdWx0SW5zdHJ1Y3Rpb24uX3RvTGlua1VybCIsIlVucmVzb2x2ZWRJbnN0cnVjdGlvbiIsIlVucmVzb2x2ZWRJbnN0cnVjdGlvbi5jb25zdHJ1Y3RvciIsIlVucmVzb2x2ZWRJbnN0cnVjdGlvbi51cmxQYXRoIiwiVW5yZXNvbHZlZEluc3RydWN0aW9uLnVybFBhcmFtcyIsIlVucmVzb2x2ZWRJbnN0cnVjdGlvbi5yZXNvbHZlQ29tcG9uZW50IiwiUmVkaXJlY3RJbnN0cnVjdGlvbiIsIlJlZGlyZWN0SW5zdHJ1Y3Rpb24uY29uc3RydWN0b3IiLCJDb21wb25lbnRJbnN0cnVjdGlvbiIsIkNvbXBvbmVudEluc3RydWN0aW9uLmNvbnN0cnVjdG9yIl0sIm1hcHBpbmdzIjoiOzs7OztBQUFBLDJCQUE2RCxnQ0FBZ0MsQ0FBQyxDQUFBO0FBQzlGLHFCQUFtRSwwQkFBMEIsQ0FBQyxDQUFBO0FBQzlGLHNCQUFzQywyQkFBMkIsQ0FBQyxDQUFBO0FBR2xFOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztHQTZCRztBQUNIO0lBQ0VBLHFCQUFtQkEsTUFBK0JBO1FBQS9CQyxXQUFNQSxHQUFOQSxNQUFNQSxDQUF5QkE7SUFBR0EsQ0FBQ0E7SUFFdERELHlCQUFHQSxHQUFIQSxVQUFJQSxLQUFhQSxJQUFZRSxNQUFNQSxDQUFDQSxxQkFBY0EsQ0FBQ0EsNkJBQWdCQSxDQUFDQSxHQUFHQSxDQUFDQSxJQUFJQSxDQUFDQSxNQUFNQSxFQUFFQSxLQUFLQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTtJQUNqR0Ysa0JBQUNBO0FBQURBLENBQUNBLEFBSkQsSUFJQztBQUpZLG1CQUFXLGNBSXZCLENBQUE7QUFFRDs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0dBOEJHO0FBQ0g7SUFDRUcsbUJBQW1CQSxJQUEyQ0E7UUFBbERDLG9CQUFrREEsR0FBbERBLE9BQW9DQSxpQkFBVUEsQ0FBQ0EsRUFBRUEsQ0FBQ0E7UUFBM0NBLFNBQUlBLEdBQUpBLElBQUlBLENBQXVDQTtJQUFHQSxDQUFDQTtJQUVsRUQsdUJBQUdBLEdBQUhBLFVB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QVNBLFNBQW1CQSxFQUFFQSxJQUFlQSxFQUM1REEsYUFBYUEsRUFBU0EsUUFBaUJBLEVBQVNBLFdBQW1CQSxFQUNuRUEsTUFBbUNBO1FBQTFDQyxzQkFBMENBLEdBQTFDQSxhQUEwQ0E7UUFGbkNBLFlBQU9BLEdBQVBBLE9BQU9BLENBQVFBO1FBQVNBLGNBQVNBLEdBQVRBLFNBQVNBLENBQVVBO1FBQzNDQSxrQkFBYUEsR0FBYkEsYUFBYUEsQ0FBQUE7UUFBU0EsYUFBUUEsR0FBUkEsUUFBUUEsQ0FBU0E7UUFBU0EsZ0JBQVdBLEdBQVhBLFdBQVdBLENBQVFBO1FBQ25FQSxXQUFNQSxHQUFOQSxNQUFNQSxDQUE2QkE7UUFMdERBLFVBQUtBLEdBQVlBLEtBQUtBLENBQUNBO1FBTXJCQSxJQUFJQSxDQUFDQSxTQUFTQSxHQUFHQSxnQkFBU0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsR0FBR0EsSUFBSUEsR0FBR0Esd0JBQWdCQSxDQUFDQTtJQUM3REEsQ0FBQ0E7SUFDSEQsMkJBQUNBO0FBQURBLENBQUNBLEFBVEQsSUFTQztBQVRZLDRCQUFvQix1QkFTaEMsQ0FBQSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7TWFwLCBNYXBXcmFwcGVyLCBTdHJpbmdNYXBXcmFwcGVyLCBMaXN0V3JhcHBlcn0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9jb2xsZWN0aW9uJztcbmltcG9ydCB7aXNQcmVzZW50LCBpc0JsYW5rLCBub3JtYWxpemVCbGFuaywgVHlwZSwgQ09OU1RfRVhQUn0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9sYW5nJztcbmltcG9ydCB7UHJvbWlzZSwgUHJvbWlzZVdyYXBwZXJ9IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvYXN5bmMnO1xuXG5cbi8qKlxuICogYFJvdXRlUGFyYW1zYCBpcyBhbiBpbW11dGFibGUgbWFwIG9mIHBhcmFtZXRlcnMgZm9yIHRoZSBnaXZlbiByb3V0ZVxuICogYmFzZWQgb24gdGhlIHVybCBtYXRjaGVyIGFuZCBvcHRpb25hbCBwYXJhbWV0ZXJzIGZvciB0aGF0IHJvdXRlLlxuICpcbiAqIFlvdSBjYW4gaW5qZWN0IGBSb3V0ZVBhcmFtc2AgaW50byB0aGUgY29uc3RydWN0b3Igb2YgYSBjb21wb25lbnQgdG8gdXNlIGl0LlxuICpcbiAqICMjIyBFeGFtcGxlXG4gKlxuICogYGBgXG4gKiBpbXBvcnQge0NvbXBvbmVudH0gZnJvbSAnYW5ndWxhcjIvY29yZSc7XG4gKiBpbXBvcnQge2Jvb3RzdHJhcH0gZnJvbSAnYW5ndWxhcjIvcGxhdGZvcm0vYnJvd3Nlcic7XG4gKiBpbXBvcnQge1JvdXRlciwgUk9VVEVSX0RJUkVDVElWRVMsIFJPVVRFUl9QUk9WSURFUlMsIFJvdXRlQ29uZmlnfSBmcm9tICdhbmd1bGFyMi9yb3V0ZXInO1xuICpcbiAqIEBDb21wb25lbnQoe2RpcmVjdGl2ZXM6IFtST1VURVJfRElSRUNUSVZFU119KVxuICogQFJvdXRlQ29uZmlnKFtcbiAqICB7cGF0aDogJy91c2VyLzppZCcsIGNvbXBvbmVudDogVXNlckNtcCwgYXM6ICdVc2VyQ21wJ30sXG4gKiBdKVxuICogY2xhc3MgQXBwQ21wIHt9XG4gKlxuICogQENvbXBvbmVudCh7IHRlbXBsYXRlOiAndXNlcjoge3tpZH19JyB9KVxuICogY2xhc3MgVXNlckNtcCB7XG4gKiAgIGlkOiBzdHJpbmc7XG4gKiAgIGNvbnN0cnVjdG9yKHBhcmFtczogUm91dGVQYXJhbXMpIHtcbiAqICAgICB0aGlzLmlkID0gcGFyYW1zLmdldCgnaWQnKTtcbiAqICAgfVxuICogfVxuICpcbiAqIGJvb3RzdHJhcChBcHBDbXAsIFJPVVRFUl9QUk9WSURFUlMpO1xuICogYGBgXG4gKi9cbmV4cG9ydCBjbGFzcyBSb3V0ZVBhcmFtcyB7XG4gIGNvbnN0cnVjdG9yKHB1YmxpYyBwYXJhbXM6IHtba2V5OiBzdHJpbmddOiBzdHJpbmd9KSB7fVxuXG4gIGdldChwYXJhbTogc3RyaW5nKTogc3RyaW5nIHsgcmV0dXJuIG5vcm1hbGl6ZUJsYW5rKFN0cmluZ01hcFdyYXBwZXIuZ2V0KHRoaXMucGFyYW1zLCBwYXJhbSkpOyB9XG59XG5cbi8qKlxuICogYFJvdXRlRGF0YWAgaXMgYW4gaW1tdXRhYmxlIG1hcCBvZiBhZGRpdGlvbmFsIGRhdGEgeW91IGNhbiBjb25maWd1cmUgaW4geW91ciB7QGxpbmsgUm91dGV9LlxuICpcbiAqIFlvdSBjYW4gaW5qZWN0IGBSb3V0ZURhdGFgIGludG8gdGhlIGNvbnN0cnVjdG9yIG9mIGEgY29tcG9uZW50IHRvIHVzZSBpdC5cbiAqXG4gKiAjIyMgRXhhbXBsZVxuICpcbiAqIGBgYFxuICogaW1wb3J0IHtDb21wb25lbnQsIFZpZXd9IGZyb20gJ2FuZ3VsYXIyL2NvcmUnO1xuICogaW1wb3J0IHtib290c3RyYXB9IGZyb20gJ2FuZ3VsYXIyL3BsYXRmb3JtL2Jyb3dzZXInO1xuICogaW1wb3J0IHtSb3V0ZXIsIFJPVVRFUl9ESVJFQ1RJVkVTLCByb3V0ZXJCaW5kaW5ncywgUm91dGVDb25maWd9IGZyb20gJ2FuZ3VsYXIyL3JvdXRlcic7XG4gKlxuICogQENvbXBvbmVudCh7Li4ufSlcbiAqIEBWaWV3KHtkaXJlY3RpdmVzOiBbUk9VVEVSX0RJUkVDVElWRVNdfSlcbiAqIEBSb3V0ZUNvbmZpZyhbXG4gKiAge3BhdGg6ICcvdXNlci86aWQnLCBjb21wb25lbnQ6IFVzZXJDbXAsIGFzOiAnVXNlckNtcCcsIGRhdGE6IHtpc0FkbWluOiB0cnVlfX0sXG4gKiBdKVxuICogY2xhc3MgQXBwQ21wIHt9XG4gKlxuICogQENvbXBvbmVudCh7Li4ufSlcbiAqIEBWaWV3KHsgdGVtcGxhdGU6ICd1c2VyOiB7e2lzQWRtaW59fScgfSlcbiAqIGNsYXNzIFVzZXJDbXAge1xuICogICBzdHJpbmc6IGlzQWRtaW47XG4gKiAgIGNvbnN0cnVjdG9yKGRhdGE6IFJvdXRlRGF0YSkge1xuICogICAgIHRoaXMuaXNBZG1pbiA9IGRhdGEuZ2V0KCdpc0FkbWluJyk7XG4gKiAgIH1cbiAqIH1cbiAqXG4gKiBib290c3RyYXAoQXBwQ21wLCByb3V0ZXJCaW5kaW5ncyhBcHBDbXApKTtcbiAqIGBgYFxuICovXG5leHBvcnQgY2xhc3MgUm91dGVEYXRhIHtcbiAgY29uc3RydWN0b3IocHVibGljIGRhdGE6IHtba2V5OiBzdHJpbmddOiBhbnl9ID0gQ09OU1RfRVhQUih7fSkpIHt9XG5cbiAgZ2V0KGtleTogc3RyaW5nKTogYW55IHsgcmV0dXJuIG5vcm1hbGl6ZUJsYW5rKFN0cmluZ01hcFdyYXBwZXIuZ2V0KHRoaXMuZGF0YSwga2V5KSk7IH1cbn1cblxuZXhwb3J0IHZhciBCTEFOS19ST1VURV9EQVRBID0gbmV3IFJvdXRlRGF0YSgpO1xuXG4vKipcbiAqIGBJbnN0cnVjdGlvbmAgaXMgYSB0cmVlIG9mIHtAbGluayBDb21wb25lbnRJbnN0cnVjdGlvbn1zIHdpdGggYWxsIHRoZSBpbmZvcm1hdGlvbiBuZWVkZWRcbiAqIHRvIHRyYW5zaXRpb24gZWFjaCBjb21wb25lbnQgaW4gdGhlIGFwcCB0byBhIGdpdmVuIHJvdXRlLCBpbmNsdWRpbmcgYWxsIGF1eGlsaWFyeSByb3V0ZXMuXG4gKlxuICogYEluc3RydWN0aW9uYHMgY2FuIGJlIGNyZWF0ZWQgdXNpbmcge0BsaW5rIFJvdXRlciNnZW5lcmF0ZX0sIGFuZCBjYW4gYmUgdXNlZCB0b1xuICogcGVyZm9ybSByb3V0ZSBjaGFuZ2VzIHdpdGgge0BsaW5rIFJvdXRlciNuYXZpZ2F0ZUJ5SW5zdHJ1Y3Rpb259LlxuICpcbiAqICMjIyBFeGFtcGxlXG4gKlxuICogYGBgXG4gKiBpbXBvcnQge0NvbXBvbmVudH0gZnJvbSAnYW5ndWxhcjIvY29yZSc7XG4gKiBpbXBvcnQge2Jvb3RzdHJhcH0gZnJvbSAnYW5ndWxhcjIvcGxhdGZvcm0vYnJvd3Nlcic7XG4gKiBpbXBvcnQge1JvdXRlciwgUk9VVEVSX0RJUkVDVElWRVMsIFJPVVRFUl9QUk9WSURFUlMsIFJvdXRlQ29uZmlnfSBmcm9tICdhbmd1bGFyMi9yb3V0ZXInO1xuICpcbiAqIEBDb21wb25lbnQoe2RpcmVjdGl2ZXM6IFtST1VURVJfRElSRUNUSVZFU119KVxuICogQFJvdXRlQ29uZmlnKFtcbiAqICB7Li4ufSxcbiAqIF0pXG4gKiBjbGFzcyBBcHBDbXAge1xuICogICBjb25zdHJ1Y3Rvcihyb3V0ZXI6IFJvdXRlcikge1xuICogICAgIHZhciBpbnN0cnVjdGlvbiA9IHJvdXRlci5nZW5lcmF0ZShbJy9NeVJvdXRlJ10pO1xuICogICAgIHJvdXRlci5uYXZpZ2F0ZUJ5SW5zdHJ1Y3Rpb24oaW5zdHJ1Y3Rpb24pO1xuICogICB9XG4gKiB9XG4gKlxuICogYm9vdHN0cmFwKEFwcENtcCwgUk9VVEVSX1BST1ZJREVSUyk7XG4gKiBgYGBcbiAqL1xuZXhwb3J0IGFic3RyYWN0IGNsYXNzIEluc3RydWN0aW9uIHtcbiAgcHVibGljIGNvbXBvbmVudDogQ29tcG9uZW50SW5zdHJ1Y3Rpb247XG4gIHB1YmxpYyBjaGlsZDogSW5zdHJ1Y3Rpb247XG4gIHB1YmxpYyBhdXhJbnN0cnVjdGlvbjoge1trZXk6IHN0cmluZ106IEluc3RydWN0aW9ufSA9IHt9O1xuXG4gIGdldCB1cmxQYXRoKCk6IHN0cmluZyB7IHJldHVybiBpc1ByZXNlbnQodGhpcy5jb21wb25lbnQpID8gdGhpcy5jb21wb25lbnQudXJsUGF0aCA6ICcnOyB9XG5cbiAgZ2V0IHVybFBhcmFtcygpOiBzdHJpbmdbXSB7IHJldHVybiBpc1ByZXNlbnQodGhpcy5jb21wb25lbnQpID8gdGhpcy5jb21wb25lbnQudXJsUGFyYW1zIDogW107IH1cblxuICBnZXQgc3BlY2lmaWNpdHkoKTogbnVtYmVyIHtcbiAgICB2YXIgdG90YWwgPSAwO1xuICAgIGlmIChpc1ByZXNlbnQodGhpcy5jb21wb25lbnQpKSB7XG4gICAgICB0b3RhbCArPSB0aGlzLmNvbXBvbmVudC5zcGVjaWZpY2l0eTtcbiAgICB9XG4gICAgaWYgKGlzUHJlc2VudCh0aGlzLmNoaWxkKSkge1xuICAgICAgdG90YWwgKz0gdGhpcy5jaGlsZC5zcGVjaWZpY2l0eTtcbiAgICB9XG4gICAgcmV0dXJuIHRvdGFsO1xuICB9XG5cbiAgYWJzdHJhY3QgcmVzb2x2ZUNvbXBvbmVudCgpOiBQcm9taXNlPENvbXBvbmVudEluc3RydWN0aW9uPjtcblxuICAvKipcbiAgICogY29udmVydHMgdGhlIGluc3RydWN0aW9uIGludG8gYSBVUkwgc3RyaW5nXG4gICAqL1xuICB0b1Jvb3RVcmwoKTogc3RyaW5nIHsgcmV0dXJuIHRoaXMudG9VcmxQYXRoKCkgKyB0aGlzLnRvVXJsUXVlcnkoKTsgfVxuXG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgX3RvTm9uUm9vdFVybCgpOiBzdHJpbmcge1xuICAgIHJldHVybiB0aGlzLl9zdHJpbmdpZnlQYXRoTWF0cml4QXV4UHJlZml4ZWQoKSArXG4gICAgICAgICAgIChpc1ByZXNlbnQodGhpcy5jaGlsZCkgPyB0aGlzLmNoaWxkLl90b05vblJvb3RVcmwoKSA6ICcnKTtcbiAgfVxuXG4gIHRvVXJsUXVlcnkoKTogc3RyaW5nIHsgcmV0dXJuIHRoaXMudXJsUGFyYW1zLmxlbmd0aCA+IDAgPyAoJz8nICsgdGhpcy51cmxQYXJhbXMuam9pbignJicpKSA6ICcnOyB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgYSBuZXcgaW5zdHJ1Y3Rpb24gdGhhdCBzaGFyZXMgdGhlIHN0YXRlIG9mIHRoZSBleGlzdGluZyBpbnN0cnVjdGlvbiwgYnV0IHdpdGhcbiAgICogdGhlIGdpdmVuIGNoaWxkIHtAbGluayBJbnN0cnVjdGlvbn0gcmVwbGFjaW5nIHRoZSBleGlzdGluZyBjaGlsZC5cbiAgICovXG4gIHJlcGxhY2VDaGlsZChjaGlsZDogSW5zdHJ1Y3Rpb24pOiBJbnN0cnVjdGlvbiB7XG4gICAgcmV0dXJuIG5ldyBSZXNvbHZlZEluc3RydWN0aW9uKHRoaXMuY29tcG9uZW50LCBjaGlsZCwgdGhpcy5hdXhJbnN0cnVjdGlvbik7XG4gIH1cblxuICAvKipcbiAgICogSWYgdGhlIGZpbmFsIFVSTCBmb3IgdGhlIGluc3RydWN0aW9uIGlzIGBgXG4gICAqL1xuICB0b1VybFBhdGgoKTogc3RyaW5nIHtcbiAgICByZXR1cm4gdGhpcy51cmxQYXRoICsgdGhpcy5fc3RyaW5naWZ5QXV4KCkgK1xuICAgICAgICAgICAoaXNQcmVzZW50KHRoaXMuY2hpbGQpID8gdGhpcy5jaGlsZC5fdG9Ob25Sb290VXJsKCkgOiAnJyk7XG4gIH1cblxuICAvLyBkZWZhdWx0IGluc3RydWN0aW9ucyBvdmVycmlkZSB0aGVzZVxuICB0b0xpbmtVcmwoKTogc3RyaW5nIHtcbiAgICByZXR1cm4gdGhpcy51cmxQYXRoICsgdGhpcy5fc3RyaW5naWZ5QXV4KCkgK1xuICAgICAgICAgICAoaXNQcmVzZW50KHRoaXMuY2hpbGQpID8gdGhpcy5jaGlsZC5fdG9MaW5rVXJsKCkgOiAnJyk7XG4gIH1cblxuICAvLyB0aGlzIGlzIHRoZSBub24tcm9vdCB2ZXJzaW9uIChjYWxsZWQgcmVjdXJzaXZlbHkpXG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgX3RvTGlua1VybCgpOiBzdHJpbmcge1xuICAgIHJldHVybiB0aGlzLl9zdHJpbmdpZnlQYXRoTWF0cml4QXV4UHJlZml4ZWQoKSArXG4gICAgICAgICAgIChpc1ByZXNlbnQodGhpcy5jaGlsZCkgPyB0aGlzLmNoaWxkLl90b0xpbmtVcmwoKSA6ICcnKTtcbiAgfVxuXG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgX3N0cmluZ2lmeVBhdGhNYXRyaXhBdXhQcmVmaXhlZCgpOiBzdHJpbmcge1xuICAgIHZhciBwcmltYXJ5ID0gdGhpcy5fc3RyaW5naWZ5UGF0aE1hdHJpeEF1eCgpO1xuICAgIGlmIChwcmltYXJ5Lmxlbmd0aCA+IDApIHtcbiAgICAgIHByaW1hcnkgPSAnLycgKyBwcmltYXJ5O1xuICAgIH1cbiAgICByZXR1cm4gcHJpbWFyeTtcbiAgfVxuXG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgX3N0cmluZ2lmeU1hdHJpeFBhcmFtcygpOiBzdHJpbmcge1xuICAgIHJldHVybiB0aGlzLnVybFBhcmFtcy5sZW5ndGggPiAwID8gKCc7JyArIHRoaXMudXJsUGFyYW1zLmpvaW4oJzsnKSkgOiAnJztcbiAgfVxuXG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgX3N0cmluZ2lmeVBhdGhNYXRyaXhBdXgoKTogc3RyaW5nIHtcbiAgICBpZiAoaXNCbGFuayh0aGlzLmNvbXBvbmVudCkpIHtcbiAgICAgIHJldHVybiAnJztcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMudXJsUGF0aCArIHRoaXMuX3N0cmluZ2lmeU1hdHJpeFBhcmFtcygpICsgdGhpcy5fc3RyaW5naWZ5QXV4KCk7XG4gIH1cblxuICAvKiogQGludGVybmFsICovXG4gIF9zdHJpbmdpZnlBdXgoKTogc3RyaW5nIHtcbiAgICB2YXIgcm91dGVzID0gW107XG4gICAgU3RyaW5nTWFwV3JhcHBlci5mb3JFYWNoKHRoaXMuYXV4SW5zdHJ1Y3Rpb24sIChhdXhJbnN0cnVjdGlvbiwgXykgPT4ge1xuICAgICAgcm91dGVzLnB1c2goYXV4SW5zdHJ1Y3Rpb24uX3N0cmluZ2lmeVBhdGhNYXRyaXhBdXgoKSk7XG4gICAgfSk7XG4gICAgaWYgKHJvdXRlcy5sZW5ndGggPiAwKSB7XG4gICAgICByZXR1cm4gJygnICsgcm91dGVzLmpvaW4oJy8vJykgKyAnKSc7XG4gICAgfVxuICAgIHJldHVybiAnJztcbiAgfVxufVxuXG5cbi8qKlxuICogYSByZXNvbHZlZCBpbnN0cnVjdGlvbiBoYXMgYW4gb3V0bGV0IGluc3RydWN0aW9uIGZvciBpdHNlbGYsIGJ1dCBtYXliZSBub3QgZm9yLi4uXG4gKi9cbmV4cG9ydCBjbGFzcyBSZXNvbHZlZEluc3RydWN0aW9uIGV4dGVuZHMgSW5zdHJ1Y3Rpb24ge1xuICBjb25zdHJ1Y3RvcihwdWJsaWMgY29tcG9uZW50OiBDb21wb25lbnRJbnN0cnVjdGlvbiwgcHVibGljIGNoaWxkOiBJbnN0cnVjdGlvbixcbiAgICAgICAgICAgICAgcHVibGljIGF1eEluc3RydWN0aW9uOiB7W2tleTogc3RyaW5nXTogSW5zdHJ1Y3Rpb259KSB7XG4gICAgc3VwZXIoKTtcbiAgfVxuXG4gIHJlc29sdmVDb21wb25lbnQoKTogUHJvbWlzZTxDb21wb25lbnRJbnN0cnVjdGlvbj4ge1xuICAgIHJldHVybiBQcm9taXNlV3JhcHBlci5yZXNvbHZlKHRoaXMuY29tcG9uZW50KTtcbiAgfVxufVxuXG5cbi8qKlxuICogUmVwcmVzZW50cyBhIHJlc29sdmVkIGRlZmF1bHQgcm91dGVcbiAqL1xuZXhwb3J0IGNsYXNzIERlZmF1bHRJbnN0cnVjdGlvbiBleHRlbmRzIEluc3RydWN0aW9uIHtcbiAgY29uc3RydWN0b3IocHVibGljIGNvbXBvbmVudDogQ29tcG9uZW50SW5zdHJ1Y3Rpb24sIHB1YmxpYyBjaGlsZDogRGVmYXVsdEluc3RydWN0aW9uKSB7IHN1cGVyKCk7IH1cblxuICByZXNvbHZlQ29tcG9uZW50KCk6IFByb21pc2U8Q29tcG9uZW50SW5zdHJ1Y3Rpb24+IHtcbiAgICByZXR1cm4gUHJvbWlzZVdyYXBwZXIucmVzb2x2ZSh0aGlzLmNvbXBvbmVudCk7XG4gIH1cblxuICB0b0xpbmtVcmwoKTogc3RyaW5nIHsgcmV0dXJuICcnOyB9XG5cbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBfdG9MaW5rVXJsKCk6IHN0cmluZyB7IHJldHVybiAnJzsgfVxufVxuXG5cbi8qKlxuICogUmVwcmVzZW50cyBhIGNvbXBvbmVudCB0aGF0IG1heSBuZWVkIHRvIGRvIHNvbWUgcmVkaXJlY3Rpb24gb3IgbGF6eSBsb2FkaW5nIGF0IGEgbGF0ZXIgdGltZS5cbiAqL1xuZXhwb3J0IGNsYXNzIFVucmVzb2x2ZWRJbnN0cnVjdGlvbiBleHRlbmRzIEluc3RydWN0aW9uIHtcbiAgY29uc3RydWN0b3IocHJpdmF0ZSBfcmVzb2x2ZXI6ICgpID0+IFByb21pc2U8SW5zdHJ1Y3Rpb24+LCBwcml2YXRlIF91cmxQYXRoOiBzdHJpbmcgPSAnJyxcbiAgICAgICAgICAgICAgcHJpdmF0ZSBfdXJsUGFyYW1zOiBzdHJpbmdbXSA9IENPTlNUX0VYUFIoW10pKSB7XG4gICAgc3VwZXIoKTtcbiAgfVxuXG4gIGdldCB1cmxQYXRoKCk6IHN0cmluZyB7XG4gICAgaWYgKGlzUHJlc2VudCh0aGlzLmNvbXBvbmVudCkpIHtcbiAgICAgIHJldHVybiB0aGlzLmNvbXBvbmVudC51cmxQYXRoO1xuICAgIH1cbiAgICBpZiAoaXNQcmVzZW50KHRoaXMuX3VybFBhdGgpKSB7XG4gICAgICByZXR1cm4gdGhpcy5fdXJsUGF0aDtcbiAgICB9XG4gICAgcmV0dXJuICcnO1xuICB9XG5cbiAgZ2V0IHVybFBhcmFtcygpOiBzdHJpbmdbXSB7XG4gICAgaWYgKGlzUHJlc2VudCh0aGlzLmNvbXBvbmVudCkpIHtcbiAgICAgIHJldHVybiB0aGlzLmNvbXBvbmVudC51cmxQYXJhbXM7XG4gICAgfVxuICAgIGlmIChpc1ByZXNlbnQodGhpcy5fdXJsUGFyYW1zKSkge1xuICAgICAgcmV0dXJuIHRoaXMuX3VybFBhcmFtcztcbiAgICB9XG4gICAgcmV0dXJuIFtdO1xuICB9XG5cbiAgcmVzb2x2ZUNvbXBvbmVudCgpOiBQcm9taXNlPENvbXBvbmVudEluc3RydWN0aW9uPiB7XG4gICAgaWYgKGlzUHJlc2VudCh0aGlzLmNvbXBvbmVudCkpIHtcbiAgICAgIHJldHVybiBQcm9taXNlV3JhcHBlci5yZXNvbHZlKHRoaXMuY29tcG9uZW50KTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMuX3Jlc29sdmVyKCkudGhlbigocmVzb2x1dGlvbjogSW5zdHJ1Y3Rpb24pID0+IHtcbiAgICAgIHRoaXMuY2hpbGQgPSByZXNvbHV0aW9uLmNoaWxkO1xuICAgICAgcmV0dXJuIHRoaXMuY29tcG9uZW50ID0gcmVzb2x1dGlvbi5jb21wb25lbnQ7XG4gICAgfSk7XG4gIH1cbn1cblxuXG5leHBvcnQgY2xhc3MgUmVkaXJlY3RJbnN0cnVjdGlvbiBleHRlbmRzIFJlc29sdmVkSW5zdHJ1Y3Rpb24ge1xuICBjb25zdHJ1Y3Rvcihjb21wb25lbnQ6IENvbXBvbmVudEluc3RydWN0aW9uLCBjaGlsZDogSW5zdHJ1Y3Rpb24sXG4gICAgICAgICAgICAgIGF1eEluc3RydWN0aW9uOiB7W2tleTogc3RyaW5nXTogSW5zdHJ1Y3Rpb259KSB7XG4gICAgc3VwZXIoY29tcG9uZW50LCBjaGlsZCwgYXV4SW5zdHJ1Y3Rpb24pO1xuICB9XG59XG5cblxuLyoqXG4gKiBBIGBDb21wb25lbnRJbnN0cnVjdGlvbmAgcmVwcmVzZW50cyB0aGUgcm91dGUgc3RhdGUgZm9yIGEgc2luZ2xlIGNvbXBvbmVudC4gQW4gYEluc3RydWN0aW9uYCBpc1xuICogY29tcG9zZWQgb2YgYSB0cmVlIG9mIHRoZXNlIGBDb21wb25lbnRJbnN0cnVjdGlvbmBzLlxuICpcbiAqIGBDb21wb25lbnRJbnN0cnVjdGlvbnNgIGlzIGEgcHVibGljIEFQSS4gSW5zdGFuY2VzIG9mIGBDb21wb25lbnRJbnN0cnVjdGlvbmAgYXJlIHBhc3NlZFxuICogdG8gcm91dGUgbGlmZWN5Y2xlIGhvb2tzLCBsaWtlIHtAbGluayBDYW5BY3RpdmF0ZX0uXG4gKlxuICogYENvbXBvbmVudEluc3RydWN0aW9uYHMgYXJlIFtodHRwczovL2VuLndpa2lwZWRpYS5vcmcvd2lraS9IYXNoX2NvbnNpbmddKGhhc2ggY29uc2VkKS4gWW91IHNob3VsZFxuICogbmV2ZXIgY29uc3RydWN0IG9uZSB5b3Vyc2VsZiB3aXRoIFwibmV3LlwiIEluc3RlYWQsIHJlbHkgb24ge0BsaW5rIFJvdXRlci9Sb3V0ZVJlY29nbml6ZXJ9IHRvXG4gKiBjb25zdHJ1Y3QgYENvbXBvbmVudEluc3RydWN0aW9uYHMuXG4gKlxuICogWW91IHNob3VsZCBub3QgbW9kaWZ5IHRoaXMgb2JqZWN0LiBJdCBzaG91bGQgYmUgdHJlYXRlZCBhcyBpbW11dGFibGUuXG4gKi9cbmV4cG9ydCBjbGFzcyBDb21wb25lbnRJbnN0cnVjdGlvbiB7XG4gIHJldXNlOiBib29sZWFuID0gZmFsc2U7XG4gIHB1YmxpYyByb3V0ZURhdGE6IFJvdXRlRGF0YTtcblxuICBjb25zdHJ1Y3RvcihwdWJsaWMgdXJsUGF0aDogc3RyaW5nLCBwdWJsaWMgdXJsUGFyYW1zOiBzdHJpbmdbXSwgZGF0YTogUm91dGVEYXRhLFxuICAgICAgICAgICAgICBwdWJsaWMgY29tcG9uZW50VHlwZSwgcHVibGljIHRlcm1pbmFsOiBib29sZWFuLCBwdWJsaWMgc3BlY2lmaWNpdHk6IG51bWJlcixcbiAgICAgICAgICAgICAgcHVibGljIHBhcmFtczoge1trZXk6IHN0cmluZ106IGFueX0gPSBudWxsKSB7XG4gICAgdGhpcy5yb3V0ZURhdGEgPSBpc1ByZXNlbnQoZGF0YSkgPyBkYXRhIDogQkxBTktfUk9VVEVfREFUQTtcbiAgfVxufVxuIl19