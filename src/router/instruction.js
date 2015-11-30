'use strict';var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var collection_1 = require('angular2/src/facade/collection');
var exceptions_1 = require('angular2/src/facade/exceptions');
var lang_1 = require('angular2/src/facade/lang');
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
var RouteData = (function () {
    function RouteData(data) {
        if (data === void 0) { data = lang_1.CONST_EXPR({}); }
        this.data = data;
    }
    RouteData.prototype.get = function (key) { return lang_1.normalizeBlank(collection_1.StringMapWrapper.get(this.data, key)); };
    return RouteData;
})();
exports.RouteData = RouteData;
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
var Instruction = (function () {
    function Instruction(component, child, auxInstruction) {
        this.component = component;
        this.child = child;
        this.auxInstruction = auxInstruction;
    }
    /**
     * Returns a new instruction that shares the state of the existing instruction, but with
     * the given child {@link Instruction} replacing the existing child.
     */
    Instruction.prototype.replaceChild = function (child) {
        return new Instruction(this.component, child, this.auxInstruction);
    };
    return Instruction;
})();
exports.Instruction = Instruction;
/**
 * Represents a partially completed instruction during recognition that only has the
 * primary (non-aux) route instructions matched.
 *
 * `PrimaryInstruction` is an internal class used by `RouteRecognizer` while it's
 * figuring out where to navigate.
 */
var PrimaryInstruction = (function () {
    function PrimaryInstruction(component, child, auxUrls) {
        this.component = component;
        this.child = child;
        this.auxUrls = auxUrls;
    }
    return PrimaryInstruction;
})();
exports.PrimaryInstruction = PrimaryInstruction;
function stringifyInstruction(instruction) {
    return stringifyInstructionPath(instruction) + stringifyInstructionQuery(instruction);
}
exports.stringifyInstruction = stringifyInstruction;
function stringifyInstructionPath(instruction) {
    return instruction.component.urlPath + stringifyAux(instruction) +
        stringifyPrimaryPrefixed(instruction.child);
}
exports.stringifyInstructionPath = stringifyInstructionPath;
function stringifyInstructionQuery(instruction) {
    return instruction.component.urlParams.length > 0 ?
        ('?' + instruction.component.urlParams.join('&')) :
        '';
}
exports.stringifyInstructionQuery = stringifyInstructionQuery;
function stringifyPrimaryPrefixed(instruction) {
    var primary = stringifyPrimary(instruction);
    if (primary.length > 0) {
        primary = '/' + primary;
    }
    return primary;
}
function stringifyPrimary(instruction) {
    if (lang_1.isBlank(instruction)) {
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
    collection_1.StringMapWrapper.forEach(instruction.auxInstruction, function (auxInstruction, _) {
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
var ComponentInstruction = (function () {
    function ComponentInstruction() {
        this.reuse = false;
    }
    Object.defineProperty(ComponentInstruction.prototype, "componentType", {
        /**
         * Returns the component type of the represented route, or `null` if this instruction
         * hasn't been resolved.
         */
        get: function () { return exceptions_1.unimplemented(); },
        enumerable: true,
        configurable: true
    });
    ;
    Object.defineProperty(ComponentInstruction.prototype, "specificity", {
        /**
         * Returns the specificity of the route associated with this `Instruction`.
         */
        get: function () { return exceptions_1.unimplemented(); },
        enumerable: true,
        configurable: true
    });
    ;
    Object.defineProperty(ComponentInstruction.prototype, "terminal", {
        /**
         * Returns `true` if the component type of this instruction has no child {@link RouteConfig},
         * or `false` if it does.
         */
        get: function () { return exceptions_1.unimplemented(); },
        enumerable: true,
        configurable: true
    });
    ;
    Object.defineProperty(ComponentInstruction.prototype, "routeData", {
        /**
         * Returns the route data of the given route that was specified in the {@link RouteDefinition},
         * or an empty object if no route data was specified.
         */
        get: function () { return exceptions_1.unimplemented(); },
        enumerable: true,
        configurable: true
    });
    ;
    return ComponentInstruction;
})();
exports.ComponentInstruction = ComponentInstruction;
var ComponentInstruction_ = (function (_super) {
    __extends(ComponentInstruction_, _super);
    function ComponentInstruction_(urlPath, urlParams, _recognizer, params) {
        if (params === void 0) { params = null; }
        _super.call(this);
        this._recognizer = _recognizer;
        this.urlPath = urlPath;
        this.urlParams = urlParams;
        this.params = params;
        if (lang_1.isPresent(this._recognizer.handler.data)) {
            this._routeData = new RouteData(this._recognizer.handler.data);
        }
        else {
            this._routeData = BLANK_ROUTE_DATA;
        }
    }
    Object.defineProperty(ComponentInstruction_.prototype, "componentType", {
        get: function () { return this._recognizer.handler.componentType; },
        enumerable: true,
        configurable: true
    });
    ComponentInstruction_.prototype.resolveComponentType = function () { return this._recognizer.handler.resolveComponentType(); };
    Object.defineProperty(ComponentInstruction_.prototype, "specificity", {
        get: function () { return this._recognizer.specificity; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ComponentInstruction_.prototype, "terminal", {
        get: function () { return this._recognizer.terminal; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ComponentInstruction_.prototype, "routeData", {
        get: function () { return this._routeData; },
        enumerable: true,
        configurable: true
    });
    return ComponentInstruction_;
})(ComponentInstruction);
exports.ComponentInstruction_ = ComponentInstruction_;
//# sourceMappingURL=instruction.js.map