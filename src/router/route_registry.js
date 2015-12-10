'use strict';var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var collection_1 = require('angular2/src/facade/collection');
var async_1 = require('angular2/src/facade/async');
var lang_1 = require('angular2/src/facade/lang');
var exceptions_1 = require('angular2/src/facade/exceptions');
var reflection_1 = require('angular2/src/core/reflection/reflection');
var core_1 = require('angular2/core');
var route_config_impl_1 = require('./route_config_impl');
var route_recognizer_1 = require('./route_recognizer');
var component_recognizer_1 = require('./component_recognizer');
var instruction_1 = require('./instruction');
var route_config_nomalizer_1 = require('./route_config_nomalizer');
var url_parser_1 = require('./url_parser');
var _resolveToNull = async_1.PromiseWrapper.resolve(null);
/**
 * Token used to bind the component with the top-level {@link RouteConfig}s for the
 * application.
 *
 * ### Example ([live demo](http://plnkr.co/edit/iRUP8B5OUbxCWQ3AcIDm))
 *
 * ```
 * import {Component} from 'angular2/angular2';
 * import {
 *   ROUTER_DIRECTIVES,
 *   ROUTER_PROVIDERS,
 *   RouteConfig
 * } from 'angular2/router';
 *
 * @Component({directives: [ROUTER_DIRECTIVES]})
 * @RouteConfig([
 *  {...},
 * ])
 * class AppCmp {
 *   // ...
 * }
 *
 * bootstrap(AppCmp, [ROUTER_PROVIDERS]);
 * ```
 */
exports.ROUTER_PRIMARY_COMPONENT = lang_1.CONST_EXPR(new core_1.OpaqueToken('RouterPrimaryComponent'));
/**
 * The RouteRegistry holds route configurations for each component in an Angular app.
 * It is responsible for creating Instructions from URLs, and generating URLs based on route and
 * parameters.
 */
var RouteRegistry = (function () {
    function RouteRegistry(_rootComponent) {
        this._rootComponent = _rootComponent;
        this._rules = new collection_1.Map();
    }
    /**
     * Given a component and a configuration object, add the route to this registry
     */
    RouteRegistry.prototype.config = function (parentComponent, config) {
        config = route_config_nomalizer_1.normalizeRouteConfig(config, this);
        // this is here because Dart type guard reasons
        if (config instanceof route_config_impl_1.Route) {
            route_config_nomalizer_1.assertComponentExists(config.component, config.path);
        }
        else if (config instanceof route_config_impl_1.AuxRoute) {
            route_config_nomalizer_1.assertComponentExists(config.component, config.path);
        }
        var recognizer = this._rules.get(parentComponent);
        if (lang_1.isBlank(recognizer)) {
            recognizer = new component_recognizer_1.ComponentRecognizer();
            this._rules.set(parentComponent, recognizer);
        }
        var terminal = recognizer.config(config);
        if (config instanceof route_config_impl_1.Route) {
            if (terminal) {
                assertTerminalComponent(config.component, config.path);
            }
            else {
                this.configFromComponent(config.component);
            }
        }
    };
    /**
     * Reads the annotations of a component and configures the registry based on them
     */
    RouteRegistry.prototype.configFromComponent = function (component) {
        var _this = this;
        if (!lang_1.isType(component)) {
            return;
        }
        // Don't read the annotations from a type more than once –
        // this prevents an infinite loop if a component routes recursively.
        if (this._rules.has(component)) {
            return;
        }
        var annotations = reflection_1.reflector.annotations(component);
        if (lang_1.isPresent(annotations)) {
            for (var i = 0; i < annotations.length; i++) {
                var annotation = annotations[i];
                if (annotation instanceof route_config_impl_1.RouteConfig) {
                    var routeCfgs = annotation.configs;
                    routeCfgs.forEach(function (config) { return _this.config(component, config); });
                }
            }
        }
    };
    /**
     * Given a URL and a parent component, return the most specific instruction for navigating
     * the application into the state specified by the url
     */
    RouteRegistry.prototype.recognize = function (url, ancestorInstructions) {
        var parsedUrl = url_parser_1.parser.parse(url);
        return this._recognize(parsedUrl, ancestorInstructions);
    };
    /**
     * Recognizes all parent-child routes, but creates unresolved auxiliary routes
     */
    RouteRegistry.prototype._recognize = function (parsedUrl, ancestorInstructions, _aux) {
        var _this = this;
        if (_aux === void 0) { _aux = false; }
        var parentComponent = ancestorInstructions.length > 0 ?
            ancestorInstructions[ancestorInstructions.length - 1].component.componentType :
            this._rootComponent;
        var componentRecognizer = this._rules.get(parentComponent);
        if (lang_1.isBlank(componentRecognizer)) {
            return _resolveToNull;
        }
        // Matches some beginning part of the given URL
        var possibleMatches = _aux ? componentRecognizer.recognizeAuxiliary(parsedUrl) :
            componentRecognizer.recognize(parsedUrl);
        var matchPromises = possibleMatches.map(function (candidate) { return candidate.then(function (candidate) {
            if (candidate instanceof route_recognizer_1.PathMatch) {
                var auxParentInstructions = ancestorInstructions.length > 0 ?
                    [ancestorInstructions[ancestorInstructions.length - 1]] :
                    [];
                var auxInstructions = _this._auxRoutesToUnresolved(candidate.remainingAux, auxParentInstructions);
                var instruction = new instruction_1.ResolvedInstruction(candidate.instruction, null, auxInstructions);
                if (candidate.instruction.terminal) {
                    return instruction;
                }
                var newAncestorComponents = ancestorInstructions.concat([instruction]);
                return _this._recognize(candidate.remaining, newAncestorComponents)
                    .then(function (childInstruction) {
                    if (lang_1.isBlank(childInstruction)) {
                        return null;
                    }
                    // redirect instructions are already absolute
                    if (childInstruction instanceof instruction_1.RedirectInstruction) {
                        return childInstruction;
                    }
                    instruction.child = childInstruction;
                    return instruction;
                });
            }
            if (candidate instanceof route_recognizer_1.RedirectMatch) {
                var instruction = _this.generate(candidate.redirectTo, ancestorInstructions);
                return new instruction_1.RedirectInstruction(instruction.component, instruction.child, instruction.auxInstruction);
            }
        }); });
        if ((lang_1.isBlank(parsedUrl) || parsedUrl.path == '') && possibleMatches.length == 0) {
            return async_1.PromiseWrapper.resolve(this.generateDefault(parentComponent));
        }
        return async_1.PromiseWrapper.all(matchPromises).then(mostSpecific);
    };
    RouteRegistry.prototype._auxRoutesToUnresolved = function (auxRoutes, parentInstructions) {
        var _this = this;
        var unresolvedAuxInstructions = {};
        auxRoutes.forEach(function (auxUrl) {
            unresolvedAuxInstructions[auxUrl.path] = new instruction_1.UnresolvedInstruction(function () { return _this._recognize(auxUrl, parentInstructions, true); });
        });
        return unresolvedAuxInstructions;
    };
    /**
     * Given a normalized list with component names and params like: `['user', {id: 3 }]`
     * generates a url with a leading slash relative to the provided `parentComponent`.
     *
     * If the optional param `_aux` is `true`, then we generate starting at an auxiliary
     * route boundary.
     */
    RouteRegistry.prototype.generate = function (linkParams, ancestorInstructions, _aux) {
        if (_aux === void 0) { _aux = false; }
        var normalizedLinkParams = splitAndFlattenLinkParams(linkParams);
        var first = collection_1.ListWrapper.first(normalizedLinkParams);
        var rest = collection_1.ListWrapper.slice(normalizedLinkParams, 1);
        // The first segment should be either '.' (generate from parent) or '' (generate from root).
        // When we normalize above, we strip all the slashes, './' becomes '.' and '/' becomes ''.
        if (first == '') {
            ancestorInstructions = [];
        }
        else if (first == '..') {
            // we already captured the first instance of "..", so we need to pop off an ancestor
            ancestorInstructions.pop();
            while (collection_1.ListWrapper.first(rest) == '..') {
                rest = collection_1.ListWrapper.slice(rest, 1);
                ancestorInstructions.pop();
                if (ancestorInstructions.length <= 0) {
                    throw new exceptions_1.BaseException("Link \"" + collection_1.ListWrapper.toJSON(linkParams) + "\" has too many \"../\" segments.");
                }
            }
        }
        else if (first != '.') {
            var parentComponent = this._rootComponent;
            var grandparentComponent = null;
            if (ancestorInstructions.length > 1) {
                parentComponent =
                    ancestorInstructions[ancestorInstructions.length - 1].component.componentType;
                grandparentComponent =
                    ancestorInstructions[ancestorInstructions.length - 2].component.componentType;
            }
            else if (ancestorInstructions.length == 1) {
                parentComponent = ancestorInstructions[0].component.componentType;
                grandparentComponent = this._rootComponent;
            }
            // For a link with no leading `./`, `/`, or `../`, we look for a sibling and child.
            // If both exist, we throw. Otherwise, we prefer whichever exists.
            var childRouteExists = this.hasRoute(first, parentComponent);
            var parentRouteExists = lang_1.isPresent(grandparentComponent) && this.hasRoute(first, grandparentComponent);
            if (parentRouteExists && childRouteExists) {
                var msg = "Link \"" + collection_1.ListWrapper.toJSON(linkParams) + "\" is ambiguous, use \"./\" or \"../\" to disambiguate.";
                throw new exceptions_1.BaseException(msg);
            }
            if (parentRouteExists) {
                ancestorInstructions.pop();
            }
            rest = linkParams;
        }
        if (rest[rest.length - 1] == '') {
            rest.pop();
        }
        if (rest.length < 1) {
            var msg = "Link \"" + collection_1.ListWrapper.toJSON(linkParams) + "\" must include a route name.";
            throw new exceptions_1.BaseException(msg);
        }
        var generatedInstruction = this._generate(rest, ancestorInstructions, _aux);
        for (var i = ancestorInstructions.length - 1; i >= 0; i--) {
            var ancestorInstruction = ancestorInstructions[i];
            generatedInstruction = ancestorInstruction.replaceChild(generatedInstruction);
        }
        return generatedInstruction;
    };
    /*
     * Internal helper that does not make any assertions about the beginning of the link DSL
     */
    RouteRegistry.prototype._generate = function (linkParams, ancestorInstructions, _aux) {
        var _this = this;
        if (_aux === void 0) { _aux = false; }
        var parentComponent = ancestorInstructions.length > 0 ?
            ancestorInstructions[ancestorInstructions.length - 1].component.componentType :
            this._rootComponent;
        if (linkParams.length == 0) {
            return this.generateDefault(parentComponent);
        }
        var linkIndex = 0;
        var routeName = linkParams[linkIndex];
        if (!lang_1.isString(routeName)) {
            throw new exceptions_1.BaseException("Unexpected segment \"" + routeName + "\" in link DSL. Expected a string.");
        }
        else if (routeName == '' || routeName == '.' || routeName == '..') {
            throw new exceptions_1.BaseException("\"" + routeName + "/\" is only allowed at the beginning of a link DSL.");
        }
        var params = {};
        if (linkIndex + 1 < linkParams.length) {
            var nextSegment_1 = linkParams[linkIndex + 1];
            if (lang_1.isStringMap(nextSegment_1) && !lang_1.isArray(nextSegment_1)) {
                params = nextSegment_1;
                linkIndex += 1;
            }
        }
        var auxInstructions = {};
        var nextSegment;
        while (linkIndex + 1 < linkParams.length && lang_1.isArray(nextSegment = linkParams[linkIndex + 1])) {
            var auxParentInstruction = ancestorInstructions.length > 0 ?
                [ancestorInstructions[ancestorInstructions.length - 1]] :
                [];
            var auxInstruction = this._generate(nextSegment, auxParentInstruction, true);
            // TODO: this will not work for aux routes with parameters or multiple segments
            auxInstructions[auxInstruction.component.urlPath] = auxInstruction;
            linkIndex += 1;
        }
        var componentRecognizer = this._rules.get(parentComponent);
        if (lang_1.isBlank(componentRecognizer)) {
            throw new exceptions_1.BaseException("Component \"" + lang_1.getTypeNameForDebugging(parentComponent) + "\" has no route config.");
        }
        var routeRecognizer = (_aux ? componentRecognizer.auxNames : componentRecognizer.names).get(routeName);
        if (!lang_1.isPresent(routeRecognizer)) {
            throw new exceptions_1.BaseException("Component \"" + lang_1.getTypeNameForDebugging(parentComponent) + "\" has no route named \"" + routeName + "\".");
        }
        if (!lang_1.isPresent(routeRecognizer.handler.componentType)) {
            var compInstruction = routeRecognizer.generateComponentPathValues(params);
            return new instruction_1.UnresolvedInstruction(function () {
                return routeRecognizer.handler.resolveComponentType().then(function (_) { return _this._generate(linkParams, ancestorInstructions, _aux); });
            }, compInstruction['urlPath'], compInstruction['urlParams']);
        }
        var componentInstruction = _aux ? componentRecognizer.generateAuxiliary(routeName, params) :
            componentRecognizer.generate(routeName, params);
        var remaining = linkParams.slice(linkIndex + 1);
        var instruction = new instruction_1.ResolvedInstruction(componentInstruction, null, auxInstructions);
        // the component is sync
        if (lang_1.isPresent(componentInstruction.componentType)) {
            var childInstruction = null;
            if (linkIndex + 1 < linkParams.length) {
                var childAncestorComponents = ancestorInstructions.concat([instruction]);
                childInstruction = this._generate(remaining, childAncestorComponents);
            }
            else if (!componentInstruction.terminal) {
                // ... look for defaults
                childInstruction = this.generateDefault(componentInstruction.componentType);
                if (lang_1.isBlank(childInstruction)) {
                    throw new exceptions_1.BaseException("Link \"" + collection_1.ListWrapper.toJSON(linkParams) + "\" does not resolve to a terminal instruction.");
                }
            }
            instruction.child = childInstruction;
        }
        return instruction;
    };
    RouteRegistry.prototype.hasRoute = function (name, parentComponent) {
        var componentRecognizer = this._rules.get(parentComponent);
        if (lang_1.isBlank(componentRecognizer)) {
            return false;
        }
        return componentRecognizer.hasRoute(name);
    };
    RouteRegistry.prototype.generateDefault = function (componentCursor) {
        var _this = this;
        if (lang_1.isBlank(componentCursor)) {
            return null;
        }
        var componentRecognizer = this._rules.get(componentCursor);
        if (lang_1.isBlank(componentRecognizer) || lang_1.isBlank(componentRecognizer.defaultRoute)) {
            return null;
        }
        var defaultChild = null;
        if (lang_1.isPresent(componentRecognizer.defaultRoute.handler.componentType)) {
            var componentInstruction = componentRecognizer.defaultRoute.generate({});
            if (!componentRecognizer.defaultRoute.terminal) {
                defaultChild = this.generateDefault(componentRecognizer.defaultRoute.handler.componentType);
            }
            return new instruction_1.DefaultInstruction(componentInstruction, defaultChild);
        }
        return new instruction_1.UnresolvedInstruction(function () {
            return componentRecognizer.defaultRoute.handler.resolveComponentType().then(function (_) { return _this.generateDefault(componentCursor); });
        });
    };
    RouteRegistry = __decorate([
        core_1.Injectable(),
        __param(0, core_1.Inject(exports.ROUTER_PRIMARY_COMPONENT)), 
        __metadata('design:paramtypes', [lang_1.Type])
    ], RouteRegistry);
    return RouteRegistry;
})();
exports.RouteRegistry = RouteRegistry;
/*
 * Given: ['/a/b', {c: 2}]
 * Returns: ['', 'a', 'b', {c: 2}]
 */
function splitAndFlattenLinkParams(linkParams) {
    return linkParams.reduce(function (accumulation, item) {
        if (lang_1.isString(item)) {
            var strItem = item;
            return accumulation.concat(strItem.split('/'));
        }
        accumulation.push(item);
        return accumulation;
    }, []);
}
/*
 * Given a list of instructions, returns the most specific instruction
 */
function mostSpecific(instructions) {
    return collection_1.ListWrapper.maximum(instructions, function (instruction) { return instruction.specificity; });
}
function assertTerminalComponent(component, path) {
    if (!lang_1.isType(component)) {
        return;
    }
    var annotations = reflection_1.reflector.annotations(component);
    if (lang_1.isPresent(annotations)) {
        for (var i = 0; i < annotations.length; i++) {
            var annotation = annotations[i];
            if (annotation instanceof route_config_impl_1.RouteConfig) {
                throw new exceptions_1.BaseException("Child routes are not allowed for \"" + path + "\". Use \"...\" on the parent's route path.");
            }
        }
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicm91dGVfcmVnaXN0cnkuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJhbmd1bGFyMi9zcmMvcm91dGVyL3JvdXRlX3JlZ2lzdHJ5LnRzIl0sIm5hbWVzIjpbIlJvdXRlUmVnaXN0cnkiLCJSb3V0ZVJlZ2lzdHJ5LmNvbnN0cnVjdG9yIiwiUm91dGVSZWdpc3RyeS5jb25maWciLCJSb3V0ZVJlZ2lzdHJ5LmNvbmZpZ0Zyb21Db21wb25lbnQiLCJSb3V0ZVJlZ2lzdHJ5LnJlY29nbml6ZSIsIlJvdXRlUmVnaXN0cnkuX3JlY29nbml6ZSIsIlJvdXRlUmVnaXN0cnkuX2F1eFJvdXRlc1RvVW5yZXNvbHZlZCIsIlJvdXRlUmVnaXN0cnkuZ2VuZXJhdGUiLCJSb3V0ZVJlZ2lzdHJ5Ll9nZW5lcmF0ZSIsIlJvdXRlUmVnaXN0cnkuaGFzUm91dGUiLCJSb3V0ZVJlZ2lzdHJ5LmdlbmVyYXRlRGVmYXVsdCIsInNwbGl0QW5kRmxhdHRlbkxpbmtQYXJhbXMiLCJtb3N0U3BlY2lmaWMiLCJhc3NlcnRUZXJtaW5hbENvbXBvbmVudCJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7O0FBQUEsMkJBQTZELGdDQUFnQyxDQUFDLENBQUE7QUFDOUYsc0JBQXNDLDJCQUEyQixDQUFDLENBQUE7QUFDbEUscUJBVU8sMEJBQTBCLENBQUMsQ0FBQTtBQUNsQywyQkFBOEMsZ0NBQWdDLENBQUMsQ0FBQTtBQUMvRSwyQkFBd0IseUNBQXlDLENBQUMsQ0FBQTtBQUNsRSxxQkFBOEMsZUFBZSxDQUFDLENBQUE7QUFFOUQsa0NBT08scUJBQXFCLENBQUMsQ0FBQTtBQUM3QixpQ0FBbUQsb0JBQW9CLENBQUMsQ0FBQTtBQUN4RSxxQ0FBa0Msd0JBQXdCLENBQUMsQ0FBQTtBQUMzRCw0QkFNTyxlQUFlLENBQUMsQ0FBQTtBQUV2Qix1Q0FBMEQsMEJBQTBCLENBQUMsQ0FBQTtBQUNyRiwyQkFBNkMsY0FBYyxDQUFDLENBQUE7QUFFNUQsSUFBSSxjQUFjLEdBQUcsc0JBQWMsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUM7QUFJbEQ7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztHQXdCRztBQUNVLGdDQUF3QixHQUNqQyxpQkFBVSxDQUFDLElBQUksa0JBQVcsQ0FBQyx3QkFBd0IsQ0FBQyxDQUFDLENBQUM7QUFHMUQ7Ozs7R0FJRztBQUNIO0lBSUVBLHVCQUFzREEsY0FBb0JBO1FBQXBCQyxtQkFBY0EsR0FBZEEsY0FBY0EsQ0FBTUE7UUFGbEVBLFdBQU1BLEdBQUdBLElBQUlBLGdCQUFHQSxFQUE0QkEsQ0FBQ0E7SUFFd0JBLENBQUNBO0lBRTlFRDs7T0FFR0E7SUFDSEEsOEJBQU1BLEdBQU5BLFVBQU9BLGVBQW9CQSxFQUFFQSxNQUF1QkE7UUFDbERFLE1BQU1BLEdBQUdBLDZDQUFvQkEsQ0FBQ0EsTUFBTUEsRUFBRUEsSUFBSUEsQ0FBQ0EsQ0FBQ0E7UUFFNUNBLCtDQUErQ0E7UUFDL0NBLEVBQUVBLENBQUNBLENBQUNBLE1BQU1BLFlBQVlBLHlCQUFLQSxDQUFDQSxDQUFDQSxDQUFDQTtZQUM1QkEsOENBQXFCQSxDQUFDQSxNQUFNQSxDQUFDQSxTQUFTQSxFQUFFQSxNQUFNQSxDQUFDQSxJQUFJQSxDQUFDQSxDQUFDQTtRQUN2REEsQ0FBQ0E7UUFBQ0EsSUFBSUEsQ0FBQ0EsRUFBRUEsQ0FBQ0EsQ0FBQ0EsTUFBTUEsWUFBWUEsNEJBQVFBLENBQUNBLENBQUNBLENBQUNBO1lBQ3RDQSw4Q0FBcUJBLENBQUNBLE1BQU1BLENBQUNBLFNBQVNBLEVBQUVBLE1BQU1BLENBQUNBLElBQUlBLENBQUNBLENBQUNBO1FBQ3ZEQSxDQUFDQTtRQUVEQSxJQUFJQSxVQUFVQSxHQUF3QkEsSUFBSUEsQ0FBQ0EsTUFBTUEsQ0FBQ0EsR0FBR0EsQ0FBQ0EsZUFBZUEsQ0FBQ0EsQ0FBQ0E7UUFFdkVBLEVBQUVBLENBQUNBLENBQUNBLGNBQU9BLENBQUNBLFVBQVVBLENBQUNBLENBQUNBLENBQUNBLENBQUNBO1lBQ3hCQSxVQUFVQSxHQUFHQSxJQUFJQSwwQ0FBbUJBLEVBQUVBLENBQUNBO1lBQ3ZDQSxJQUFJQSxDQUFDQSxNQUFNQSxDQUFDQSxHQUFHQSxDQUFDQSxlQUFlQSxFQUFFQSxVQUFVQSxDQUFDQSxDQUFDQTtRQUMvQ0EsQ0FBQ0E7UUFFREEsSUFBSUEsUUFBUUEsR0FBR0EsVUFBVUEsQ0FBQ0EsTUFBTUEsQ0FBQ0EsTUFBTUEsQ0FBQ0EsQ0FBQ0E7UUFFekNBLEVBQUVBLENBQUNBLENBQUNBLE1BQU1BLFlBQVlBLHlCQUFLQSxDQUFDQSxDQUFDQSxDQUFDQTtZQUM1QkEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsUUFBUUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7Z0JBQ2JBLHVCQUF1QkEsQ0FBQ0EsTUFBTUEsQ0FBQ0EsU0FBU0EsRUFBRUEsTUFBTUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsQ0FBQ0E7WUFDekRBLENBQUNBO1lBQUNBLElBQUlBLENBQUNBLENBQUNBO2dCQUNOQSxJQUFJQSxDQUFDQSxtQkFBbUJBLENBQUNBLE1BQU1BLENBQUNBLFNBQVNBLENBQUNBLENBQUNBO1lBQzdDQSxDQUFDQTtRQUNIQSxDQUFDQTtJQUNIQSxDQUFDQTtJQUVERjs7T0FFR0E7SUFDSEEsMkNBQW1CQSxHQUFuQkEsVUFBb0JBLFNBQWNBO1FBQWxDRyxpQkFxQkNBO1FBcEJDQSxFQUFFQSxDQUFDQSxDQUFDQSxDQUFDQSxhQUFNQSxDQUFDQSxTQUFTQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTtZQUN2QkEsTUFBTUEsQ0FBQ0E7UUFDVEEsQ0FBQ0E7UUFFREEsMERBQTBEQTtRQUMxREEsb0VBQW9FQTtRQUNwRUEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsTUFBTUEsQ0FBQ0EsR0FBR0EsQ0FBQ0EsU0FBU0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7WUFDL0JBLE1BQU1BLENBQUNBO1FBQ1RBLENBQUNBO1FBQ0RBLElBQUlBLFdBQVdBLEdBQUdBLHNCQUFTQSxDQUFDQSxXQUFXQSxDQUFDQSxTQUFTQSxDQUFDQSxDQUFDQTtRQUNuREEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsZ0JBQVNBLENBQUNBLFdBQVdBLENBQUNBLENBQUNBLENBQUNBLENBQUNBO1lBQzNCQSxHQUFHQSxDQUFDQSxDQUFDQSxHQUFHQSxDQUFDQSxDQUFDQSxHQUFHQSxDQUFDQSxFQUFFQSxDQUFDQSxHQUFHQSxXQUFXQSxDQUFDQSxNQUFNQSxFQUFFQSxDQUFDQSxFQUFFQSxFQUFFQSxDQUFDQTtnQkFDNUNBLElBQUlBLFVBQVVBLEdBQUdBLFdBQVdBLENBQUNBLENBQUNBLENBQUNBLENBQUNBO2dCQUVoQ0EsRUFBRUEsQ0FBQ0EsQ0FBQ0EsVUFBVUEsWUFBWUEsK0JBQVdBLENBQUNBLENBQUNBLENBQUNBO29CQUN0Q0EsSUFBSUEsU0FBU0EsR0FBc0JBLFVBQVVBLENBQUNBLE9BQU9BLENBQUNBO29CQUN0REEsU0FBU0EsQ0FBQ0EsT0FBT0EsQ0FBQ0EsVUFBQUEsTUFBTUEsSUFBSUEsT0FBQUEsS0FBSUEsQ0FBQ0EsTUFBTUEsQ0FBQ0EsU0FBU0EsRUFBRUEsTUFBTUEsQ0FBQ0EsRUFBOUJBLENBQThCQSxDQUFDQSxDQUFDQTtnQkFDOURBLENBQUNBO1lBQ0hBLENBQUNBO1FBQ0hBLENBQUNBO0lBQ0hBLENBQUNBO0lBR0RIOzs7T0FHR0E7SUFDSEEsaUNBQVNBLEdBQVRBLFVBQVVBLEdBQVdBLEVBQUVBLG9CQUFtQ0E7UUFDeERJLElBQUlBLFNBQVNBLEdBQUdBLG1CQUFNQSxDQUFDQSxLQUFLQSxDQUFDQSxHQUFHQSxDQUFDQSxDQUFDQTtRQUNsQ0EsTUFBTUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsVUFBVUEsQ0FBQ0EsU0FBU0EsRUFBRUEsb0JBQW9CQSxDQUFDQSxDQUFDQTtJQUMxREEsQ0FBQ0E7SUFHREo7O09BRUdBO0lBRUtBLGtDQUFVQSxHQUFsQkEsVUFBbUJBLFNBQWNBLEVBQUVBLG9CQUFtQ0EsRUFDbkRBLElBQVlBO1FBRC9CSyxpQkE4RENBO1FBN0RrQkEsb0JBQVlBLEdBQVpBLFlBQVlBO1FBQzdCQSxJQUFJQSxlQUFlQSxHQUNmQSxvQkFBb0JBLENBQUNBLE1BQU1BLEdBQUdBLENBQUNBO1lBQzNCQSxvQkFBb0JBLENBQUNBLG9CQUFvQkEsQ0FBQ0EsTUFBTUEsR0FBR0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsU0FBU0EsQ0FBQ0EsYUFBYUE7WUFDN0VBLElBQUlBLENBQUNBLGNBQWNBLENBQUNBO1FBRTVCQSxJQUFJQSxtQkFBbUJBLEdBQUdBLElBQUlBLENBQUNBLE1BQU1BLENBQUNBLEdBQUdBLENBQUNBLGVBQWVBLENBQUNBLENBQUNBO1FBQzNEQSxFQUFFQSxDQUFDQSxDQUFDQSxjQUFPQSxDQUFDQSxtQkFBbUJBLENBQUNBLENBQUNBLENBQUNBLENBQUNBO1lBQ2pDQSxNQUFNQSxDQUFDQSxjQUFjQSxDQUFDQTtRQUN4QkEsQ0FBQ0E7UUFFREEsK0NBQStDQTtRQUMvQ0EsSUFBSUEsZUFBZUEsR0FDZkEsSUFBSUEsR0FBR0EsbUJBQW1CQSxDQUFDQSxrQkFBa0JBLENBQUNBLFNBQVNBLENBQUNBO1lBQ2pEQSxtQkFBbUJBLENBQUNBLFNBQVNBLENBQUNBLFNBQVNBLENBQUNBLENBQUNBO1FBRXBEQSxJQUFJQSxhQUFhQSxHQUEyQkEsZUFBZUEsQ0FBQ0EsR0FBR0EsQ0FDM0RBLFVBQUNBLFNBQThCQSxJQUFLQSxPQUFBQSxTQUFTQSxDQUFDQSxJQUFJQSxDQUFDQSxVQUFDQSxTQUFxQkE7WUFFdkVBLEVBQUVBLENBQUNBLENBQUNBLFNBQVNBLFlBQVlBLDRCQUFTQSxDQUFDQSxDQUFDQSxDQUFDQTtnQkFDbkNBLElBQUlBLHFCQUFxQkEsR0FDckJBLG9CQUFvQkEsQ0FBQ0EsTUFBTUEsR0FBR0EsQ0FBQ0E7b0JBQzNCQSxDQUFDQSxvQkFBb0JBLENBQUNBLG9CQUFvQkEsQ0FBQ0EsTUFBTUEsR0FBR0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7b0JBQ3ZEQSxFQUFFQSxDQUFDQTtnQkFDWEEsSUFBSUEsZUFBZUEsR0FDZkEsS0FBSUEsQ0FBQ0Esc0JBQXNCQSxDQUFDQSxTQUFTQSxDQUFDQSxZQUFZQSxFQUFFQSxxQkFBcUJBLENBQUNBLENBQUNBO2dCQUMvRUEsSUFBSUEsV0FBV0EsR0FBR0EsSUFBSUEsaUNBQW1CQSxDQUFDQSxTQUFTQSxDQUFDQSxXQUFXQSxFQUFFQSxJQUFJQSxFQUFFQSxlQUFlQSxDQUFDQSxDQUFDQTtnQkFFeEZBLEVBQUVBLENBQUNBLENBQUNBLFNBQVNBLENBQUNBLFdBQVdBLENBQUNBLFFBQVFBLENBQUNBLENBQUNBLENBQUNBO29CQUNuQ0EsTUFBTUEsQ0FBQ0EsV0FBV0EsQ0FBQ0E7Z0JBQ3JCQSxDQUFDQTtnQkFFREEsSUFBSUEscUJBQXFCQSxHQUFHQSxvQkFBb0JBLENBQUNBLE1BQU1BLENBQUNBLENBQUNBLFdBQVdBLENBQUNBLENBQUNBLENBQUNBO2dCQUV2RUEsTUFBTUEsQ0FBQ0EsS0FBSUEsQ0FBQ0EsVUFBVUEsQ0FBQ0EsU0FBU0EsQ0FBQ0EsU0FBU0EsRUFBRUEscUJBQXFCQSxDQUFDQTtxQkFDN0RBLElBQUlBLENBQUNBLFVBQUNBLGdCQUFnQkE7b0JBQ3JCQSxFQUFFQSxDQUFDQSxDQUFDQSxjQUFPQSxDQUFDQSxnQkFBZ0JBLENBQUNBLENBQUNBLENBQUNBLENBQUNBO3dCQUM5QkEsTUFBTUEsQ0FBQ0EsSUFBSUEsQ0FBQ0E7b0JBQ2RBLENBQUNBO29CQUVEQSw2Q0FBNkNBO29CQUM3Q0EsRUFBRUEsQ0FBQ0EsQ0FBQ0EsZ0JBQWdCQSxZQUFZQSxpQ0FBbUJBLENBQUNBLENBQUNBLENBQUNBO3dCQUNwREEsTUFBTUEsQ0FBQ0EsZ0JBQWdCQSxDQUFDQTtvQkFDMUJBLENBQUNBO29CQUNEQSxXQUFXQSxDQUFDQSxLQUFLQSxHQUFHQSxnQkFBZ0JBLENBQUNBO29CQUNyQ0EsTUFBTUEsQ0FBQ0EsV0FBV0EsQ0FBQ0E7Z0JBQ3JCQSxDQUFDQSxDQUFDQSxDQUFDQTtZQUNUQSxDQUFDQTtZQUVEQSxFQUFFQSxDQUFDQSxDQUFDQSxTQUFTQSxZQUFZQSxnQ0FBYUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7Z0JBQ3ZDQSxJQUFJQSxXQUFXQSxHQUFHQSxLQUFJQSxDQUFDQSxRQUFRQSxDQUFDQSxTQUFTQSxDQUFDQSxVQUFVQSxFQUFFQSxvQkFBb0JBLENBQUNBLENBQUNBO2dCQUM1RUEsTUFBTUEsQ0FBQ0EsSUFBSUEsaUNBQW1CQSxDQUFDQSxXQUFXQSxDQUFDQSxTQUFTQSxFQUFFQSxXQUFXQSxDQUFDQSxLQUFLQSxFQUN4Q0EsV0FBV0EsQ0FBQ0EsY0FBY0EsQ0FBQ0EsQ0FBQ0E7WUFDN0RBLENBQUNBO1FBQ0hBLENBQUNBLENBQUNBLEVBckNrQ0EsQ0FxQ2xDQSxDQUFDQSxDQUFDQTtRQUVSQSxFQUFFQSxDQUFDQSxDQUFDQSxDQUFDQSxjQUFPQSxDQUFDQSxTQUFTQSxDQUFDQSxJQUFJQSxTQUFTQSxDQUFDQSxJQUFJQSxJQUFJQSxFQUFFQSxDQUFDQSxJQUFJQSxlQUFlQSxDQUFDQSxNQUFNQSxJQUFJQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTtZQUNoRkEsTUFBTUEsQ0FBQ0Esc0JBQWNBLENBQUNBLE9BQU9BLENBQUNBLElBQUlBLENBQUNBLGVBQWVBLENBQUNBLGVBQWVBLENBQUNBLENBQUNBLENBQUNBO1FBQ3ZFQSxDQUFDQTtRQUVEQSxNQUFNQSxDQUFDQSxzQkFBY0EsQ0FBQ0EsR0FBR0EsQ0FBQ0EsYUFBYUEsQ0FBQ0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsWUFBWUEsQ0FBQ0EsQ0FBQ0E7SUFDOURBLENBQUNBO0lBRU9MLDhDQUFzQkEsR0FBOUJBLFVBQStCQSxTQUFnQkEsRUFDaEJBLGtCQUFpQ0E7UUFEaEVNLGlCQVVDQTtRQVJDQSxJQUFJQSx5QkFBeUJBLEdBQWlDQSxFQUFFQSxDQUFDQTtRQUVqRUEsU0FBU0EsQ0FBQ0EsT0FBT0EsQ0FBQ0EsVUFBQ0EsTUFBV0E7WUFDNUJBLHlCQUF5QkEsQ0FBQ0EsTUFBTUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsR0FBR0EsSUFBSUEsbUNBQXFCQSxDQUM5REEsY0FBUUEsTUFBTUEsQ0FBQ0EsS0FBSUEsQ0FBQ0EsVUFBVUEsQ0FBQ0EsTUFBTUEsRUFBRUEsa0JBQWtCQSxFQUFFQSxJQUFJQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTtRQUMzRUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7UUFFSEEsTUFBTUEsQ0FBQ0EseUJBQXlCQSxDQUFDQTtJQUNuQ0EsQ0FBQ0E7SUFHRE47Ozs7OztPQU1HQTtJQUNIQSxnQ0FBUUEsR0FBUkEsVUFBU0EsVUFBaUJBLEVBQUVBLG9CQUFtQ0EsRUFBRUEsSUFBWUE7UUFBWk8sb0JBQVlBLEdBQVpBLFlBQVlBO1FBQzNFQSxJQUFJQSxvQkFBb0JBLEdBQUdBLHlCQUF5QkEsQ0FBQ0EsVUFBVUEsQ0FBQ0EsQ0FBQ0E7UUFFakVBLElBQUlBLEtBQUtBLEdBQUdBLHdCQUFXQSxDQUFDQSxLQUFLQSxDQUFDQSxvQkFBb0JBLENBQUNBLENBQUNBO1FBQ3BEQSxJQUFJQSxJQUFJQSxHQUFHQSx3QkFBV0EsQ0FBQ0EsS0FBS0EsQ0FBQ0Esb0JBQW9CQSxFQUFFQSxDQUFDQSxDQUFDQSxDQUFDQTtRQUV0REEsNEZBQTRGQTtRQUM1RkEsMEZBQTBGQTtRQUMxRkEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsS0FBS0EsSUFBSUEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7WUFDaEJBLG9CQUFvQkEsR0FBR0EsRUFBRUEsQ0FBQ0E7UUFDNUJBLENBQUNBO1FBQUNBLElBQUlBLENBQUNBLEVBQUVBLENBQUNBLENBQUNBLEtBQUtBLElBQUlBLElBQUlBLENBQUNBLENBQUNBLENBQUNBO1lBQ3pCQSxvRkFBb0ZBO1lBQ3BGQSxvQkFBb0JBLENBQUNBLEdBQUdBLEVBQUVBLENBQUNBO1lBQzNCQSxPQUFPQSx3QkFBV0EsQ0FBQ0EsS0FBS0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsSUFBSUEsSUFBSUEsRUFBRUEsQ0FBQ0E7Z0JBQ3ZDQSxJQUFJQSxHQUFHQSx3QkFBV0EsQ0FBQ0EsS0FBS0EsQ0FBQ0EsSUFBSUEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7Z0JBQ2xDQSxvQkFBb0JBLENBQUNBLEdBQUdBLEVBQUVBLENBQUNBO2dCQUMzQkEsRUFBRUEsQ0FBQ0EsQ0FBQ0Esb0JBQW9CQSxDQUFDQSxNQUFNQSxJQUFJQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTtvQkFDckNBLE1BQU1BLElBQUlBLDBCQUFhQSxDQUNuQkEsWUFBU0Esd0JBQVdBLENBQUNBLE1BQU1BLENBQUNBLFVBQVVBLENBQUNBLHNDQUFnQ0EsQ0FBQ0EsQ0FBQ0E7Z0JBQy9FQSxDQUFDQTtZQUNIQSxDQUFDQTtRQUNIQSxDQUFDQTtRQUFDQSxJQUFJQSxDQUFDQSxFQUFFQSxDQUFDQSxDQUFDQSxLQUFLQSxJQUFJQSxHQUFHQSxDQUFDQSxDQUFDQSxDQUFDQTtZQUN4QkEsSUFBSUEsZUFBZUEsR0FBR0EsSUFBSUEsQ0FBQ0EsY0FBY0EsQ0FBQ0E7WUFDMUNBLElBQUlBLG9CQUFvQkEsR0FBR0EsSUFBSUEsQ0FBQ0E7WUFDaENBLEVBQUVBLENBQUNBLENBQUNBLG9CQUFvQkEsQ0FBQ0EsTUFBTUEsR0FBR0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7Z0JBQ3BDQSxlQUFlQTtvQkFDWEEsb0JBQW9CQSxDQUFDQSxvQkFBb0JBLENBQUNBLE1BQU1BLEdBQUdBLENBQUNBLENBQUNBLENBQUNBLFNBQVNBLENBQUNBLGFBQWFBLENBQUNBO2dCQUNsRkEsb0JBQW9CQTtvQkFDaEJBLG9CQUFvQkEsQ0FBQ0Esb0JBQW9CQSxDQUFDQSxNQUFNQSxHQUFHQSxDQUFDQSxDQUFDQSxDQUFDQSxTQUFTQSxDQUFDQSxhQUFhQSxDQUFDQTtZQUNwRkEsQ0FBQ0E7WUFBQ0EsSUFBSUEsQ0FBQ0EsRUFBRUEsQ0FBQ0EsQ0FBQ0Esb0JBQW9CQSxDQUFDQSxNQUFNQSxJQUFJQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTtnQkFDNUNBLGVBQWVBLEdBQUdBLG9CQUFvQkEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsU0FBU0EsQ0FBQ0EsYUFBYUEsQ0FBQ0E7Z0JBQ2xFQSxvQkFBb0JBLEdBQUdBLElBQUlBLENBQUNBLGNBQWNBLENBQUNBO1lBQzdDQSxDQUFDQTtZQUVEQSxtRkFBbUZBO1lBQ25GQSxrRUFBa0VBO1lBQ2xFQSxJQUFJQSxnQkFBZ0JBLEdBQUdBLElBQUlBLENBQUNBLFFBQVFBLENBQUNBLEtBQUtBLEVBQUVBLGVBQWVBLENBQUNBLENBQUNBO1lBQzdEQSxJQUFJQSxpQkFBaUJBLEdBQ2pCQSxnQkFBU0EsQ0FBQ0Esb0JBQW9CQSxDQUFDQSxJQUFJQSxJQUFJQSxDQUFDQSxRQUFRQSxDQUFDQSxLQUFLQSxFQUFFQSxvQkFBb0JBLENBQUNBLENBQUNBO1lBRWxGQSxFQUFFQSxDQUFDQSxDQUFDQSxpQkFBaUJBLElBQUlBLGdCQUFnQkEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7Z0JBQzFDQSxJQUFJQSxHQUFHQSxHQUNIQSxZQUFTQSx3QkFBV0EsQ0FBQ0EsTUFBTUEsQ0FBQ0EsVUFBVUEsQ0FBQ0EsNERBQW9EQSxDQUFDQTtnQkFDaEdBLE1BQU1BLElBQUlBLDBCQUFhQSxDQUFDQSxHQUFHQSxDQUFDQSxDQUFDQTtZQUMvQkEsQ0FBQ0E7WUFDREEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsaUJBQWlCQSxDQUFDQSxDQUFDQSxDQUFDQTtnQkFDdEJBLG9CQUFvQkEsQ0FBQ0EsR0FBR0EsRUFBRUEsQ0FBQ0E7WUFDN0JBLENBQUNBO1lBQ0RBLElBQUlBLEdBQUdBLFVBQVVBLENBQUNBO1FBQ3BCQSxDQUFDQTtRQUVEQSxFQUFFQSxDQUFDQSxDQUFDQSxJQUFJQSxDQUFDQSxJQUFJQSxDQUFDQSxNQUFNQSxHQUFHQSxDQUFDQSxDQUFDQSxJQUFJQSxFQUFFQSxDQUFDQSxDQUFDQSxDQUFDQTtZQUNoQ0EsSUFBSUEsQ0FBQ0EsR0FBR0EsRUFBRUEsQ0FBQ0E7UUFDYkEsQ0FBQ0E7UUFFREEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsTUFBTUEsR0FBR0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7WUFDcEJBLElBQUlBLEdBQUdBLEdBQUdBLFlBQVNBLHdCQUFXQSxDQUFDQSxNQUFNQSxDQUFDQSxVQUFVQSxDQUFDQSxrQ0FBOEJBLENBQUNBO1lBQ2hGQSxNQUFNQSxJQUFJQSwwQkFBYUEsQ0FBQ0EsR0FBR0EsQ0FBQ0EsQ0FBQ0E7UUFDL0JBLENBQUNBO1FBRURBLElBQUlBLG9CQUFvQkEsR0FBR0EsSUFBSUEsQ0FBQ0EsU0FBU0EsQ0FBQ0EsSUFBSUEsRUFBRUEsb0JBQW9CQSxFQUFFQSxJQUFJQSxDQUFDQSxDQUFDQTtRQUU1RUEsR0FBR0EsQ0FBQ0EsQ0FBQ0EsR0FBR0EsQ0FBQ0EsQ0FBQ0EsR0FBR0Esb0JBQW9CQSxDQUFDQSxNQUFNQSxHQUFHQSxDQUFDQSxFQUFFQSxDQUFDQSxJQUFJQSxDQUFDQSxFQUFFQSxDQUFDQSxFQUFFQSxFQUFFQSxDQUFDQTtZQUMxREEsSUFBSUEsbUJBQW1CQSxHQUFHQSxvQkFBb0JBLENBQUNBLENBQUNBLENBQUNBLENBQUNBO1lBQ2xEQSxvQkFBb0JBLEdBQUdBLG1CQUFtQkEsQ0FBQ0EsWUFBWUEsQ0FBQ0Esb0JBQW9CQSxDQUFDQSxDQUFDQTtRQUNoRkEsQ0FBQ0E7UUFFREEsTUFBTUEsQ0FBQ0Esb0JBQW9CQSxDQUFDQTtJQUM5QkEsQ0FBQ0E7SUFHRFA7O09BRUdBO0lBQ0tBLGlDQUFTQSxHQUFqQkEsVUFBa0JBLFVBQWlCQSxFQUFFQSxvQkFBbUNBLEVBQ3REQSxJQUFZQTtRQUQ5QlEsaUJBNEZDQTtRQTNGaUJBLG9CQUFZQSxHQUFaQSxZQUFZQTtRQUM1QkEsSUFBSUEsZUFBZUEsR0FDZkEsb0JBQW9CQSxDQUFDQSxNQUFNQSxHQUFHQSxDQUFDQTtZQUMzQkEsb0JBQW9CQSxDQUFDQSxvQkFBb0JBLENBQUNBLE1BQU1BLEdBQUdBLENBQUNBLENBQUNBLENBQUNBLFNBQVNBLENBQUNBLGFBQWFBO1lBQzdFQSxJQUFJQSxDQUFDQSxjQUFjQSxDQUFDQTtRQUc1QkEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsVUFBVUEsQ0FBQ0EsTUFBTUEsSUFBSUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7WUFDM0JBLE1BQU1BLENBQUNBLElBQUlBLENBQUNBLGVBQWVBLENBQUNBLGVBQWVBLENBQUNBLENBQUNBO1FBQy9DQSxDQUFDQTtRQUNEQSxJQUFJQSxTQUFTQSxHQUFHQSxDQUFDQSxDQUFDQTtRQUNsQkEsSUFBSUEsU0FBU0EsR0FBR0EsVUFBVUEsQ0FBQ0EsU0FBU0EsQ0FBQ0EsQ0FBQ0E7UUFFdENBLEVBQUVBLENBQUNBLENBQUNBLENBQUNBLGVBQVFBLENBQUNBLFNBQVNBLENBQUNBLENBQUNBLENBQUNBLENBQUNBO1lBQ3pCQSxNQUFNQSxJQUFJQSwwQkFBYUEsQ0FBQ0EsMEJBQXVCQSxTQUFTQSx1Q0FBbUNBLENBQUNBLENBQUNBO1FBQy9GQSxDQUFDQTtRQUFDQSxJQUFJQSxDQUFDQSxFQUFFQSxDQUFDQSxDQUFDQSxTQUFTQSxJQUFJQSxFQUFFQSxJQUFJQSxTQUFTQSxJQUFJQSxHQUFHQSxJQUFJQSxTQUFTQSxJQUFJQSxJQUFJQSxDQUFDQSxDQUFDQSxDQUFDQTtZQUNwRUEsTUFBTUEsSUFBSUEsMEJBQWFBLENBQUNBLE9BQUlBLFNBQVNBLHdEQUFvREEsQ0FBQ0EsQ0FBQ0E7UUFDN0ZBLENBQUNBO1FBRURBLElBQUlBLE1BQU1BLEdBQUdBLEVBQUVBLENBQUNBO1FBQ2hCQSxFQUFFQSxDQUFDQSxDQUFDQSxTQUFTQSxHQUFHQSxDQUFDQSxHQUFHQSxVQUFVQSxDQUFDQSxNQUFNQSxDQUFDQSxDQUFDQSxDQUFDQTtZQUN0Q0EsSUFBSUEsYUFBV0EsR0FBR0EsVUFBVUEsQ0FBQ0EsU0FBU0EsR0FBR0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7WUFDNUNBLEVBQUVBLENBQUNBLENBQUNBLGtCQUFXQSxDQUFDQSxhQUFXQSxDQUFDQSxJQUFJQSxDQUFDQSxjQUFPQSxDQUFDQSxhQUFXQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTtnQkFDdERBLE1BQU1BLEdBQUdBLGFBQVdBLENBQUNBO2dCQUNyQkEsU0FBU0EsSUFBSUEsQ0FBQ0EsQ0FBQ0E7WUFDakJBLENBQUNBO1FBQ0hBLENBQUNBO1FBRURBLElBQUlBLGVBQWVBLEdBQWlDQSxFQUFFQSxDQUFDQTtRQUN2REEsSUFBSUEsV0FBV0EsQ0FBQ0E7UUFDaEJBLE9BQU9BLFNBQVNBLEdBQUdBLENBQUNBLEdBQUdBLFVBQVVBLENBQUNBLE1BQU1BLElBQUlBLGNBQU9BLENBQUNBLFdBQVdBLEdBQUdBLFVBQVVBLENBQUNBLFNBQVNBLEdBQUdBLENBQUNBLENBQUNBLENBQUNBLEVBQUVBLENBQUNBO1lBQzdGQSxJQUFJQSxvQkFBb0JBLEdBQUdBLG9CQUFvQkEsQ0FBQ0EsTUFBTUEsR0FBR0EsQ0FBQ0E7Z0JBQzNCQSxDQUFDQSxvQkFBb0JBLENBQUNBLG9CQUFvQkEsQ0FBQ0EsTUFBTUEsR0FBR0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7Z0JBQ3ZEQSxFQUFFQSxDQUFDQTtZQUNsQ0EsSUFBSUEsY0FBY0EsR0FBR0EsSUFBSUEsQ0FBQ0EsU0FBU0EsQ0FBQ0EsV0FBV0EsRUFBRUEsb0JBQW9CQSxFQUFFQSxJQUFJQSxDQUFDQSxDQUFDQTtZQUU3RUEsK0VBQStFQTtZQUMvRUEsZUFBZUEsQ0FBQ0EsY0FBY0EsQ0FBQ0EsU0FBU0EsQ0FBQ0EsT0FBT0EsQ0FBQ0EsR0FBR0EsY0FBY0EsQ0FBQ0E7WUFDbkVBLFNBQVNBLElBQUlBLENBQUNBLENBQUNBO1FBQ2pCQSxDQUFDQTtRQUVEQSxJQUFJQSxtQkFBbUJBLEdBQUdBLElBQUlBLENBQUNBLE1BQU1BLENBQUNBLEdBQUdBLENBQUNBLGVBQWVBLENBQUNBLENBQUNBO1FBQzNEQSxFQUFFQSxDQUFDQSxDQUFDQSxjQUFPQSxDQUFDQSxtQkFBbUJBLENBQUNBLENBQUNBLENBQUNBLENBQUNBO1lBQ2pDQSxNQUFNQSxJQUFJQSwwQkFBYUEsQ0FDbkJBLGlCQUFjQSw4QkFBdUJBLENBQUNBLGVBQWVBLENBQUNBLDRCQUF3QkEsQ0FBQ0EsQ0FBQ0E7UUFDdEZBLENBQUNBO1FBRURBLElBQUlBLGVBQWVBLEdBQ2ZBLENBQUNBLElBQUlBLEdBQUdBLG1CQUFtQkEsQ0FBQ0EsUUFBUUEsR0FBR0EsbUJBQW1CQSxDQUFDQSxLQUFLQSxDQUFDQSxDQUFDQSxHQUFHQSxDQUFDQSxTQUFTQSxDQUFDQSxDQUFDQTtRQUVyRkEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsZ0JBQVNBLENBQUNBLGVBQWVBLENBQUNBLENBQUNBLENBQUNBLENBQUNBO1lBQ2hDQSxNQUFNQSxJQUFJQSwwQkFBYUEsQ0FDbkJBLGlCQUFjQSw4QkFBdUJBLENBQUNBLGVBQWVBLENBQUNBLGdDQUF5QkEsU0FBU0EsUUFBSUEsQ0FBQ0EsQ0FBQ0E7UUFDcEdBLENBQUNBO1FBRURBLEVBQUVBLENBQUNBLENBQUNBLENBQUNBLGdCQUFTQSxDQUFDQSxlQUFlQSxDQUFDQSxPQUFPQSxDQUFDQSxhQUFhQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTtZQUN0REEsSUFBSUEsZUFBZUEsR0FBR0EsZUFBZUEsQ0FBQ0EsMkJBQTJCQSxDQUFDQSxNQUFNQSxDQUFDQSxDQUFDQTtZQUMxRUEsTUFBTUEsQ0FBQ0EsSUFBSUEsbUNBQXFCQSxDQUFDQTtnQkFDL0JBLE1BQU1BLENBQUNBLGVBQWVBLENBQUNBLE9BQU9BLENBQUNBLG9CQUFvQkEsRUFBRUEsQ0FBQ0EsSUFBSUEsQ0FDdERBLFVBQUNBLENBQUNBLElBQU9BLE1BQU1BLENBQUNBLEtBQUlBLENBQUNBLFNBQVNBLENBQUNBLFVBQVVBLEVBQUVBLG9CQUFvQkEsRUFBRUEsSUFBSUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7WUFDakZBLENBQUNBLEVBQUVBLGVBQWVBLENBQUNBLFNBQVNBLENBQUNBLEVBQUVBLGVBQWVBLENBQUNBLFdBQVdBLENBQUNBLENBQUNBLENBQUNBO1FBQy9EQSxDQUFDQTtRQUVEQSxJQUFJQSxvQkFBb0JBLEdBQUdBLElBQUlBLEdBQUdBLG1CQUFtQkEsQ0FBQ0EsaUJBQWlCQSxDQUFDQSxTQUFTQSxFQUFFQSxNQUFNQSxDQUFDQTtZQUN4REEsbUJBQW1CQSxDQUFDQSxRQUFRQSxDQUFDQSxTQUFTQSxFQUFFQSxNQUFNQSxDQUFDQSxDQUFDQTtRQUlsRkEsSUFBSUEsU0FBU0EsR0FBR0EsVUFBVUEsQ0FBQ0EsS0FBS0EsQ0FBQ0EsU0FBU0EsR0FBR0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7UUFFaERBLElBQUlBLFdBQVdBLEdBQUdBLElBQUlBLGlDQUFtQkEsQ0FBQ0Esb0JBQW9CQSxFQUFFQSxJQUFJQSxFQUFFQSxlQUFlQSxDQUFDQSxDQUFDQTtRQUV2RkEsd0JBQXdCQTtRQUN4QkEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsZ0JBQVNBLENBQUNBLG9CQUFvQkEsQ0FBQ0EsYUFBYUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7WUFDbERBLElBQUlBLGdCQUFnQkEsR0FBZ0JBLElBQUlBLENBQUNBO1lBQ3pDQSxFQUFFQSxDQUFDQSxDQUFDQSxTQUFTQSxHQUFHQSxDQUFDQSxHQUFHQSxVQUFVQSxDQUFDQSxNQUFNQSxDQUFDQSxDQUFDQSxDQUFDQTtnQkFDdENBLElBQUlBLHVCQUF1QkEsR0FBR0Esb0JBQW9CQSxDQUFDQSxNQUFNQSxDQUFDQSxDQUFDQSxXQUFXQSxDQUFDQSxDQUFDQSxDQUFDQTtnQkFDekVBLGdCQUFnQkEsR0FBR0EsSUFBSUEsQ0FBQ0EsU0FBU0EsQ0FBQ0EsU0FBU0EsRUFBRUEsdUJBQXVCQSxDQUFDQSxDQUFDQTtZQUN4RUEsQ0FBQ0E7WUFBQ0EsSUFBSUEsQ0FBQ0EsRUFBRUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0Esb0JBQW9CQSxDQUFDQSxRQUFRQSxDQUFDQSxDQUFDQSxDQUFDQTtnQkFDMUNBLHdCQUF3QkE7Z0JBQ3hCQSxnQkFBZ0JBLEdBQUdBLElBQUlBLENBQUNBLGVBQWVBLENBQUNBLG9CQUFvQkEsQ0FBQ0EsYUFBYUEsQ0FBQ0EsQ0FBQ0E7Z0JBRTVFQSxFQUFFQSxDQUFDQSxDQUFDQSxjQUFPQSxDQUFDQSxnQkFBZ0JBLENBQUNBLENBQUNBLENBQUNBLENBQUNBO29CQUM5QkEsTUFBTUEsSUFBSUEsMEJBQWFBLENBQ25CQSxZQUFTQSx3QkFBV0EsQ0FBQ0EsTUFBTUEsQ0FBQ0EsVUFBVUEsQ0FBQ0EsbURBQStDQSxDQUFDQSxDQUFDQTtnQkFDOUZBLENBQUNBO1lBQ0hBLENBQUNBO1lBQ0RBLFdBQVdBLENBQUNBLEtBQUtBLEdBQUdBLGdCQUFnQkEsQ0FBQ0E7UUFDdkNBLENBQUNBO1FBRURBLE1BQU1BLENBQUNBLFdBQVdBLENBQUNBO0lBQ3JCQSxDQUFDQTtJQUVNUixnQ0FBUUEsR0FBZkEsVUFBZ0JBLElBQVlBLEVBQUVBLGVBQW9CQTtRQUNoRFMsSUFBSUEsbUJBQW1CQSxHQUF3QkEsSUFBSUEsQ0FBQ0EsTUFBTUEsQ0FBQ0EsR0FBR0EsQ0FBQ0EsZUFBZUEsQ0FBQ0EsQ0FBQ0E7UUFDaEZBLEVBQUVBLENBQUNBLENBQUNBLGNBQU9BLENBQUNBLG1CQUFtQkEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7WUFDakNBLE1BQU1BLENBQUNBLEtBQUtBLENBQUNBO1FBQ2ZBLENBQUNBO1FBQ0RBLE1BQU1BLENBQUNBLG1CQUFtQkEsQ0FBQ0EsUUFBUUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsQ0FBQ0E7SUFDNUNBLENBQUNBO0lBRU1ULHVDQUFlQSxHQUF0QkEsVUFBdUJBLGVBQXFCQTtRQUE1Q1UsaUJBd0JDQTtRQXZCQ0EsRUFBRUEsQ0FBQ0EsQ0FBQ0EsY0FBT0EsQ0FBQ0EsZUFBZUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7WUFDN0JBLE1BQU1BLENBQUNBLElBQUlBLENBQUNBO1FBQ2RBLENBQUNBO1FBRURBLElBQUlBLG1CQUFtQkEsR0FBR0EsSUFBSUEsQ0FBQ0EsTUFBTUEsQ0FBQ0EsR0FBR0EsQ0FBQ0EsZUFBZUEsQ0FBQ0EsQ0FBQ0E7UUFDM0RBLEVBQUVBLENBQUNBLENBQUNBLGNBQU9BLENBQUNBLG1CQUFtQkEsQ0FBQ0EsSUFBSUEsY0FBT0EsQ0FBQ0EsbUJBQW1CQSxDQUFDQSxZQUFZQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTtZQUM5RUEsTUFBTUEsQ0FBQ0EsSUFBSUEsQ0FBQ0E7UUFDZEEsQ0FBQ0E7UUFHREEsSUFBSUEsWUFBWUEsR0FBR0EsSUFBSUEsQ0FBQ0E7UUFDeEJBLEVBQUVBLENBQUNBLENBQUNBLGdCQUFTQSxDQUFDQSxtQkFBbUJBLENBQUNBLFlBQVlBLENBQUNBLE9BQU9BLENBQUNBLGFBQWFBLENBQUNBLENBQUNBLENBQUNBLENBQUNBO1lBQ3RFQSxJQUFJQSxvQkFBb0JBLEdBQUdBLG1CQUFtQkEsQ0FBQ0EsWUFBWUEsQ0FBQ0EsUUFBUUEsQ0FBQ0EsRUFBRUEsQ0FBQ0EsQ0FBQ0E7WUFDekVBLEVBQUVBLENBQUNBLENBQUNBLENBQUNBLG1CQUFtQkEsQ0FBQ0EsWUFB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QSxDQUFDQTtRQUNIQSxDQUFDQTtJQUNIQSxDQUFDQTtBQUNIQSxDQUFDQSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7TGlzdFdyYXBwZXIsIE1hcCwgTWFwV3JhcHBlciwgU3RyaW5nTWFwV3JhcHBlcn0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9jb2xsZWN0aW9uJztcbmltcG9ydCB7UHJvbWlzZSwgUHJvbWlzZVdyYXBwZXJ9IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvYXN5bmMnO1xuaW1wb3J0IHtcbiAgaXNQcmVzZW50LFxuICBpc0FycmF5LFxuICBpc0JsYW5rLFxuICBpc1R5cGUsXG4gIGlzU3RyaW5nLFxuICBpc1N0cmluZ01hcCxcbiAgVHlwZSxcbiAgZ2V0VHlwZU5hbWVGb3JEZWJ1Z2dpbmcsXG4gIENPTlNUX0VYUFJcbn0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9sYW5nJztcbmltcG9ydCB7QmFzZUV4Y2VwdGlvbiwgV3JhcHBlZEV4Y2VwdGlvbn0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9leGNlcHRpb25zJztcbmltcG9ydCB7cmVmbGVjdG9yfSBmcm9tICdhbmd1bGFyMi9zcmMvY29yZS9yZWZsZWN0aW9uL3JlZmxlY3Rpb24nO1xuaW1wb3J0IHtJbmplY3RhYmxlLCBJbmplY3QsIE9wYXF1ZVRva2VufSBmcm9tICdhbmd1bGFyMi9jb3JlJztcblxuaW1wb3J0IHtcbiAgUm91dGVDb25maWcsXG4gIEFzeW5jUm91dGUsXG4gIFJvdXRlLFxuICBBdXhSb3V0ZSxcbiAgUmVkaXJlY3QsXG4gIFJvdXRlRGVmaW5pdGlvblxufSBmcm9tICcuL3JvdXRlX2NvbmZpZ19pbXBsJztcbmltcG9ydCB7UGF0aE1hdGNoLCBSZWRpcmVjdE1hdGNoLCBSb3V0ZU1hdGNofSBmcm9tICcuL3JvdXRlX3JlY29nbml6ZXInO1xuaW1wb3J0IHtDb21wb25lbnRSZWNvZ25pemVyfSBmcm9tICcuL2NvbXBvbmVudF9yZWNvZ25pemVyJztcbmltcG9ydCB7XG4gIEluc3RydWN0aW9uLFxuICBSZXNvbHZlZEluc3RydWN0aW9uLFxuICBSZWRpcmVjdEluc3RydWN0aW9uLFxuICBVbnJlc29sdmVkSW5zdHJ1Y3Rpb24sXG4gIERlZmF1bHRJbnN0cnVjdGlvblxufSBmcm9tICcuL2luc3RydWN0aW9uJztcblxuaW1wb3J0IHtub3JtYWxpemVSb3V0ZUNvbmZpZywgYXNzZXJ0Q29tcG9uZW50RXhpc3RzfSBmcm9tICcuL3JvdXRlX2NvbmZpZ19ub21hbGl6ZXInO1xuaW1wb3J0IHtwYXJzZXIsIFVybCwgcGF0aFNlZ21lbnRzVG9Vcmx9IGZyb20gJy4vdXJsX3BhcnNlcic7XG5cbnZhciBfcmVzb2x2ZVRvTnVsbCA9IFByb21pc2VXcmFwcGVyLnJlc29sdmUobnVsbCk7XG5cblxuXG4vKipcbiAqIFRva2VuIHVzZWQgdG8gYmluZCB0aGUgY29tcG9uZW50IHdpdGggdGhlIHRvcC1sZXZlbCB7QGxpbmsgUm91dGVDb25maWd9cyBmb3IgdGhlXG4gKiBhcHBsaWNhdGlvbi5cbiAqXG4gKiAjIyMgRXhhbXBsZSAoW2xpdmUgZGVtb10oaHR0cDovL3BsbmtyLmNvL2VkaXQvaVJVUDhCNU9VYnhDV1EzQWNJRG0pKVxuICpcbiAqIGBgYFxuICogaW1wb3J0IHtDb21wb25lbnR9IGZyb20gJ2FuZ3VsYXIyL2FuZ3VsYXIyJztcbiAqIGltcG9ydCB7XG4gKiAgIFJPVVRFUl9ESVJFQ1RJVkVTLFxuICogICBST1VURVJfUFJPVklERVJTLFxuICogICBSb3V0ZUNvbmZpZ1xuICogfSBmcm9tICdhbmd1bGFyMi9yb3V0ZXInO1xuICpcbiAqIEBDb21wb25lbnQoe2RpcmVjdGl2ZXM6IFtST1VURVJfRElSRUNUSVZFU119KVxuICogQFJvdXRlQ29uZmlnKFtcbiAqICB7Li4ufSxcbiAqIF0pXG4gKiBjbGFzcyBBcHBDbXAge1xuICogICAvLyAuLi5cbiAqIH1cbiAqXG4gKiBib290c3RyYXAoQXBwQ21wLCBbUk9VVEVSX1BST1ZJREVSU10pO1xuICogYGBgXG4gKi9cbmV4cG9ydCBjb25zdCBST1VURVJfUFJJTUFSWV9DT01QT05FTlQ6IE9wYXF1ZVRva2VuID1cbiAgICBDT05TVF9FWFBSKG5ldyBPcGFxdWVUb2tlbignUm91dGVyUHJpbWFyeUNvbXBvbmVudCcpKTtcblxuXG4vKipcbiAqIFRoZSBSb3V0ZVJlZ2lzdHJ5IGhvbGRzIHJvdXRlIGNvbmZpZ3VyYXRpb25zIGZvciBlYWNoIGNvbXBvbmVudCBpbiBhbiBBbmd1bGFyIGFwcC5cbiAqIEl0IGlzIHJlc3BvbnNpYmxlIGZvciBjcmVhdGluZyBJbnN0cnVjdGlvbnMgZnJvbSBVUkxzLCBhbmQgZ2VuZXJhdGluZyBVUkxzIGJhc2VkIG9uIHJvdXRlIGFuZFxuICogcGFyYW1ldGVycy5cbiAqL1xuQEluamVjdGFibGUoKVxuZXhwb3J0IGNsYXNzIFJvdXRlUmVnaXN0cnkge1xuICBwcml2YXRlIF9ydWxlcyA9IG5ldyBNYXA8YW55LCBDb21wb25lbnRSZWNvZ25pemVyPigpO1xuXG4gIGNvbnN0cnVjdG9yKEBJbmplY3QoUk9VVEVSX1BSSU1BUllfQ09NUE9ORU5UKSBwcml2YXRlIF9yb290Q29tcG9uZW50OiBUeXBlKSB7fVxuXG4gIC8qKlxuICAgKiBHaXZlbiBhIGNvbXBvbmVudCBhbmQgYSBjb25maWd1cmF0aW9uIG9iamVjdCwgYWRkIHRoZSByb3V0ZSB0byB0aGlzIHJlZ2lzdHJ5XG4gICAqL1xuICBjb25maWcocGFyZW50Q29tcG9uZW50OiBhbnksIGNvbmZpZzogUm91dGVEZWZpbml0aW9uKTogdm9pZCB7XG4gICAgY29uZmlnID0gbm9ybWFsaXplUm91dGVDb25maWcoY29uZmlnLCB0aGlzKTtcblxuICAgIC8vIHRoaXMgaXMgaGVyZSBiZWNhdXNlIERhcnQgdHlwZSBndWFyZCByZWFzb25zXG4gICAgaWYgKGNvbmZpZyBpbnN0YW5jZW9mIFJvdXRlKSB7XG4gICAgICBhc3NlcnRDb21wb25lbnRFeGlzdHMoY29uZmlnLmNvbXBvbmVudCwgY29uZmlnLnBhdGgpO1xuICAgIH0gZWxzZSBpZiAoY29uZmlnIGluc3RhbmNlb2YgQXV4Um91dGUpIHtcbiAgICAgIGFzc2VydENvbXBvbmVudEV4aXN0cyhjb25maWcuY29tcG9uZW50LCBjb25maWcucGF0aCk7XG4gICAgfVxuXG4gICAgdmFyIHJlY29nbml6ZXI6IENvbXBvbmVudFJlY29nbml6ZXIgPSB0aGlzLl9ydWxlcy5nZXQocGFyZW50Q29tcG9uZW50KTtcblxuICAgIGlmIChpc0JsYW5rKHJlY29nbml6ZXIpKSB7XG4gICAgICByZWNvZ25pemVyID0gbmV3IENvbXBvbmVudFJlY29nbml6ZXIoKTtcbiAgICAgIHRoaXMuX3J1bGVzLnNldChwYXJlbnRDb21wb25lbnQsIHJlY29nbml6ZXIpO1xuICAgIH1cblxuICAgIHZhciB0ZXJtaW5hbCA9IHJlY29nbml6ZXIuY29uZmlnKGNvbmZpZyk7XG5cbiAgICBpZiAoY29uZmlnIGluc3RhbmNlb2YgUm91dGUpIHtcbiAgICAgIGlmICh0ZXJtaW5hbCkge1xuICAgICAgICBhc3NlcnRUZXJtaW5hbENvbXBvbmVudChjb25maWcuY29tcG9uZW50LCBjb25maWcucGF0aCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLmNvbmZpZ0Zyb21Db21wb25lbnQoY29uZmlnLmNvbXBvbmVudCk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFJlYWRzIHRoZSBhbm5vdGF0aW9ucyBvZiBhIGNvbXBvbmVudCBhbmQgY29uZmlndXJlcyB0aGUgcmVnaXN0cnkgYmFzZWQgb24gdGhlbVxuICAgKi9cbiAgY29uZmlnRnJvbUNvbXBvbmVudChjb21wb25lbnQ6IGFueSk6IHZvaWQge1xuICAgIGlmICghaXNUeXBlKGNvbXBvbmVudCkpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICAvLyBEb24ndCByZWFkIHRoZSBhbm5vdGF0aW9ucyBmcm9tIGEgdHlwZSBtb3JlIHRoYW4gb25jZSDigJNcbiAgICAvLyB0aGlzIHByZXZlbnRzIGFuIGluZmluaXRlIGxvb3AgaWYgYSBjb21wb25lbnQgcm91dGVzIHJlY3Vyc2l2ZWx5LlxuICAgIGlmICh0aGlzLl9ydWxlcy5oYXMoY29tcG9uZW50KSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB2YXIgYW5ub3RhdGlvbnMgPSByZWZsZWN0b3IuYW5ub3RhdGlvbnMoY29tcG9uZW50KTtcbiAgICBpZiAoaXNQcmVzZW50KGFubm90YXRpb25zKSkge1xuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBhbm5vdGF0aW9ucy5sZW5ndGg7IGkrKykge1xuICAgICAgICB2YXIgYW5ub3RhdGlvbiA9IGFubm90YXRpb25zW2ldO1xuXG4gICAgICAgIGlmIChhbm5vdGF0aW9uIGluc3RhbmNlb2YgUm91dGVDb25maWcpIHtcbiAgICAgICAgICBsZXQgcm91dGVDZmdzOiBSb3V0ZURlZmluaXRpb25bXSA9IGFubm90YXRpb24uY29uZmlncztcbiAgICAgICAgICByb3V0ZUNmZ3MuZm9yRWFjaChjb25maWcgPT4gdGhpcy5jb25maWcoY29tcG9uZW50LCBjb25maWcpKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfVxuXG5cbiAgLyoqXG4gICAqIEdpdmVuIGEgVVJMIGFuZCBhIHBhcmVudCBjb21wb25lbnQsIHJldHVybiB0aGUgbW9zdCBzcGVjaWZpYyBpbnN0cnVjdGlvbiBmb3IgbmF2aWdhdGluZ1xuICAgKiB0aGUgYXBwbGljYXRpb24gaW50byB0aGUgc3RhdGUgc3BlY2lmaWVkIGJ5IHRoZSB1cmxcbiAgICovXG4gIHJlY29nbml6ZSh1cmw6IHN0cmluZywgYW5jZXN0b3JJbnN0cnVjdGlvbnM6IEluc3RydWN0aW9uW10pOiBQcm9taXNlPEluc3RydWN0aW9uPiB7XG4gICAgdmFyIHBhcnNlZFVybCA9IHBhcnNlci5wYXJzZSh1cmwpO1xuICAgIHJldHVybiB0aGlzLl9yZWNvZ25pemUocGFyc2VkVXJsLCBhbmNlc3Rvckluc3RydWN0aW9ucyk7XG4gIH1cblxuXG4gIC8qKlxuICAgKiBSZWNvZ25pemVzIGFsbCBwYXJlbnQtY2hpbGQgcm91dGVzLCBidXQgY3JlYXRlcyB1bnJlc29sdmVkIGF1eGlsaWFyeSByb3V0ZXNcbiAgICovXG5cbiAgcHJpdmF0ZSBfcmVjb2duaXplKHBhcnNlZFVybDogVXJsLCBhbmNlc3Rvckluc3RydWN0aW9uczogSW5zdHJ1Y3Rpb25bXSxcbiAgICAgICAgICAgICAgICAgICAgIF9hdXggPSBmYWxzZSk6IFByb21pc2U8SW5zdHJ1Y3Rpb24+IHtcbiAgICB2YXIgcGFyZW50Q29tcG9uZW50ID1cbiAgICAgICAgYW5jZXN0b3JJbnN0cnVjdGlvbnMubGVuZ3RoID4gMCA/XG4gICAgICAgICAgICBhbmNlc3Rvckluc3RydWN0aW9uc1thbmNlc3Rvckluc3RydWN0aW9ucy5sZW5ndGggLSAxXS5jb21wb25lbnQuY29tcG9uZW50VHlwZSA6XG4gICAgICAgICAgICB0aGlzLl9yb290Q29tcG9uZW50O1xuXG4gICAgdmFyIGNvbXBvbmVudFJlY29nbml6ZXIgPSB0aGlzLl9ydWxlcy5nZXQocGFyZW50Q29tcG9uZW50KTtcbiAgICBpZiAoaXNCbGFuayhjb21wb25lbnRSZWNvZ25pemVyKSkge1xuICAgICAgcmV0dXJuIF9yZXNvbHZlVG9OdWxsO1xuICAgIH1cblxuICAgIC8vIE1hdGNoZXMgc29tZSBiZWdpbm5pbmcgcGFydCBvZiB0aGUgZ2l2ZW4gVVJMXG4gICAgdmFyIHBvc3NpYmxlTWF0Y2hlczogUHJvbWlzZTxSb3V0ZU1hdGNoPltdID1cbiAgICAgICAgX2F1eCA/IGNvbXBvbmVudFJlY29nbml6ZXIucmVjb2duaXplQXV4aWxpYXJ5KHBhcnNlZFVybCkgOlxuICAgICAgICAgICAgICAgY29tcG9uZW50UmVjb2duaXplci5yZWNvZ25pemUocGFyc2VkVXJsKTtcblxuICAgIHZhciBtYXRjaFByb21pc2VzOiBQcm9taXNlPEluc3RydWN0aW9uPltdID0gcG9zc2libGVNYXRjaGVzLm1hcChcbiAgICAgICAgKGNhbmRpZGF0ZTogUHJvbWlzZTxSb3V0ZU1hdGNoPikgPT4gY2FuZGlkYXRlLnRoZW4oKGNhbmRpZGF0ZTogUm91dGVNYXRjaCkgPT4ge1xuXG4gICAgICAgICAgaWYgKGNhbmRpZGF0ZSBpbnN0YW5jZW9mIFBhdGhNYXRjaCkge1xuICAgICAgICAgICAgdmFyIGF1eFBhcmVudEluc3RydWN0aW9ucyA9XG4gICAgICAgICAgICAgICAgYW5jZXN0b3JJbnN0cnVjdGlvbnMubGVuZ3RoID4gMCA/XG4gICAgICAgICAgICAgICAgICAgIFthbmNlc3Rvckluc3RydWN0aW9uc1thbmNlc3Rvckluc3RydWN0aW9ucy5sZW5ndGggLSAxXV0gOlxuICAgICAgICAgICAgICAgICAgICBbXTtcbiAgICAgICAgICAgIHZhciBhdXhJbnN0cnVjdGlvbnMgPVxuICAgICAgICAgICAgICAgIHRoaXMuX2F1eFJvdXRlc1RvVW5yZXNvbHZlZChjYW5kaWRhdGUucmVtYWluaW5nQXV4LCBhdXhQYXJlbnRJbnN0cnVjdGlvbnMpO1xuICAgICAgICAgICAgdmFyIGluc3RydWN0aW9uID0gbmV3IFJlc29sdmVkSW5zdHJ1Y3Rpb24oY2FuZGlkYXRlLmluc3RydWN0aW9uLCBudWxsLCBhdXhJbnN0cnVjdGlvbnMpO1xuXG4gICAgICAgICAgICBpZiAoY2FuZGlkYXRlLmluc3RydWN0aW9uLnRlcm1pbmFsKSB7XG4gICAgICAgICAgICAgIHJldHVybiBpbnN0cnVjdGlvbjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdmFyIG5ld0FuY2VzdG9yQ29tcG9uZW50cyA9IGFuY2VzdG9ySW5zdHJ1Y3Rpb25zLmNvbmNhdChbaW5zdHJ1Y3Rpb25dKTtcblxuICAgICAgICAgICAgcmV0dXJuIHRoaXMuX3JlY29nbml6ZShjYW5kaWRhdGUucmVtYWluaW5nLCBuZXdBbmNlc3RvckNvbXBvbmVudHMpXG4gICAgICAgICAgICAgICAgLnRoZW4oKGNoaWxkSW5zdHJ1Y3Rpb24pID0+IHtcbiAgICAgICAgICAgICAgICAgIGlmIChpc0JsYW5rKGNoaWxkSW5zdHJ1Y3Rpb24pKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAvLyByZWRpcmVjdCBpbnN0cnVjdGlvbnMgYXJlIGFscmVhZHkgYWJzb2x1dGVcbiAgICAgICAgICAgICAgICAgIGlmIChjaGlsZEluc3RydWN0aW9uIGluc3RhbmNlb2YgUmVkaXJlY3RJbnN0cnVjdGlvbikge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gY2hpbGRJbnN0cnVjdGlvbjtcbiAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgIGluc3RydWN0aW9uLmNoaWxkID0gY2hpbGRJbnN0cnVjdGlvbjtcbiAgICAgICAgICAgICAgICAgIHJldHVybiBpbnN0cnVjdGlvbjtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBpZiAoY2FuZGlkYXRlIGluc3RhbmNlb2YgUmVkaXJlY3RNYXRjaCkge1xuICAgICAgICAgICAgdmFyIGluc3RydWN0aW9uID0gdGhpcy5nZW5lcmF0ZShjYW5kaWRhdGUucmVkaXJlY3RUbywgYW5jZXN0b3JJbnN0cnVjdGlvbnMpO1xuICAgICAgICAgICAgcmV0dXJuIG5ldyBSZWRpcmVjdEluc3RydWN0aW9uKGluc3RydWN0aW9uLmNvbXBvbmVudCwgaW5zdHJ1Y3Rpb24uY2hpbGQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaW5zdHJ1Y3Rpb24uYXV4SW5zdHJ1Y3Rpb24pO1xuICAgICAgICAgIH1cbiAgICAgICAgfSkpO1xuXG4gICAgaWYgKChpc0JsYW5rKHBhcnNlZFVybCkgfHwgcGFyc2VkVXJsLnBhdGggPT0gJycpICYmIHBvc3NpYmxlTWF0Y2hlcy5sZW5ndGggPT0gMCkge1xuICAgICAgcmV0dXJuIFByb21pc2VXcmFwcGVyLnJlc29sdmUodGhpcy5nZW5lcmF0ZURlZmF1bHQocGFyZW50Q29tcG9uZW50KSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIFByb21pc2VXcmFwcGVyLmFsbChtYXRjaFByb21pc2VzKS50aGVuKG1vc3RTcGVjaWZpYyk7XG4gIH1cblxuICBwcml2YXRlIF9hdXhSb3V0ZXNUb1VucmVzb2x2ZWQoYXV4Um91dGVzOiBVcmxbXSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBhcmVudEluc3RydWN0aW9uczogSW5zdHJ1Y3Rpb25bXSk6IHtba2V5OiBzdHJpbmddOiBJbnN0cnVjdGlvbn0ge1xuICAgIHZhciB1bnJlc29sdmVkQXV4SW5zdHJ1Y3Rpb25zOiB7W2tleTogc3RyaW5nXTogSW5zdHJ1Y3Rpb259ID0ge307XG5cbiAgICBhdXhSb3V0ZXMuZm9yRWFjaCgoYXV4VXJsOiBVcmwpID0+IHtcbiAgICAgIHVucmVzb2x2ZWRBdXhJbnN0cnVjdGlvbnNbYXV4VXJsLnBhdGhdID0gbmV3IFVucmVzb2x2ZWRJbnN0cnVjdGlvbihcbiAgICAgICAgICAoKSA9PiB7IHJldHVybiB0aGlzLl9yZWNvZ25pemUoYXV4VXJsLCBwYXJlbnRJbnN0cnVjdGlvbnMsIHRydWUpOyB9KTtcbiAgICB9KTtcblxuICAgIHJldHVybiB1bnJlc29sdmVkQXV4SW5zdHJ1Y3Rpb25zO1xuICB9XG5cblxuICAvKipcbiAgICogR2l2ZW4gYSBub3JtYWxpemVkIGxpc3Qgd2l0aCBjb21wb25lbnQgbmFtZXMgYW5kIHBhcmFtcyBsaWtlOiBgWyd1c2VyJywge2lkOiAzIH1dYFxuICAgKiBnZW5lcmF0ZXMgYSB1cmwgd2l0aCBhIGxlYWRpbmcgc2xhc2ggcmVsYXRpdmUgdG8gdGhlIHByb3ZpZGVkIGBwYXJlbnRDb21wb25lbnRgLlxuICAgKlxuICAgKiBJZiB0aGUgb3B0aW9uYWwgcGFyYW0gYF9hdXhgIGlzIGB0cnVlYCwgdGhlbiB3ZSBnZW5lcmF0ZSBzdGFydGluZyBhdCBhbiBhdXhpbGlhcnlcbiAgICogcm91dGUgYm91bmRhcnkuXG4gICAqL1xuICBnZW5lcmF0ZShsaW5rUGFyYW1zOiBhbnlbXSwgYW5jZXN0b3JJbnN0cnVjdGlvbnM6IEluc3RydWN0aW9uW10sIF9hdXggPSBmYWxzZSk6IEluc3RydWN0aW9uIHtcbiAgICBsZXQgbm9ybWFsaXplZExpbmtQYXJhbXMgPSBzcGxpdEFuZEZsYXR0ZW5MaW5rUGFyYW1zKGxpbmtQYXJhbXMpO1xuXG4gICAgdmFyIGZpcnN0ID0gTGlzdFdyYXBwZXIuZmlyc3Qobm9ybWFsaXplZExpbmtQYXJhbXMpO1xuICAgIHZhciByZXN0ID0gTGlzdFdyYXBwZXIuc2xpY2Uobm9ybWFsaXplZExpbmtQYXJhbXMsIDEpO1xuXG4gICAgLy8gVGhlIGZpcnN0IHNlZ21lbnQgc2hvdWxkIGJlIGVpdGhlciAnLicgKGdlbmVyYXRlIGZyb20gcGFyZW50KSBvciAnJyAoZ2VuZXJhdGUgZnJvbSByb290KS5cbiAgICAvLyBXaGVuIHdlIG5vcm1hbGl6ZSBhYm92ZSwgd2Ugc3RyaXAgYWxsIHRoZSBzbGFzaGVzLCAnLi8nIGJlY29tZXMgJy4nIGFuZCAnLycgYmVjb21lcyAnJy5cbiAgICBpZiAoZmlyc3QgPT0gJycpIHtcbiAgICAgIGFuY2VzdG9ySW5zdHJ1Y3Rpb25zID0gW107XG4gICAgfSBlbHNlIGlmIChmaXJzdCA9PSAnLi4nKSB7XG4gICAgICAvLyB3ZSBhbHJlYWR5IGNhcHR1cmVkIHRoZSBmaXJzdCBpbnN0YW5jZSBvZiBcIi4uXCIsIHNvIHdlIG5lZWQgdG8gcG9wIG9mZiBhbiBhbmNlc3RvclxuICAgICAgYW5jZXN0b3JJbnN0cnVjdGlvbnMucG9wKCk7XG4gICAgICB3aGlsZSAoTGlzdFdyYXBwZXIuZmlyc3QocmVzdCkgPT0gJy4uJykge1xuICAgICAgICByZXN0ID0gTGlzdFdyYXBwZXIuc2xpY2UocmVzdCwgMSk7XG4gICAgICAgIGFuY2VzdG9ySW5zdHJ1Y3Rpb25zLnBvcCgpO1xuICAgICAgICBpZiAoYW5jZXN0b3JJbnN0cnVjdGlvbnMubGVuZ3RoIDw9IDApIHtcbiAgICAgICAgICB0aHJvdyBuZXcgQmFzZUV4Y2VwdGlvbihcbiAgICAgICAgICAgICAgYExpbmsgXCIke0xpc3RXcmFwcGVyLnRvSlNPTihsaW5rUGFyYW1zKX1cIiBoYXMgdG9vIG1hbnkgXCIuLi9cIiBzZWdtZW50cy5gKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0gZWxzZSBpZiAoZmlyc3QgIT0gJy4nKSB7XG4gICAgICBsZXQgcGFyZW50Q29tcG9uZW50ID0gdGhpcy5fcm9vdENvbXBvbmVudDtcbiAgICAgIGxldCBncmFuZHBhcmVudENvbXBvbmVudCA9IG51bGw7XG4gICAgICBpZiAoYW5jZXN0b3JJbnN0cnVjdGlvbnMubGVuZ3RoID4gMSkge1xuICAgICAgICBwYXJlbnRDb21wb25lbnQgPVxuICAgICAgICAgICAgYW5jZXN0b3JJbnN0cnVjdGlvbnNbYW5jZXN0b3JJbnN0cnVjdGlvbnMubGVuZ3RoIC0gMV0uY29tcG9uZW50LmNvbXBvbmVudFR5cGU7XG4gICAgICAgIGdyYW5kcGFyZW50Q29tcG9uZW50ID1cbiAgICAgICAgICAgIGFuY2VzdG9ySW5zdHJ1Y3Rpb25zW2FuY2VzdG9ySW5zdHJ1Y3Rpb25zLmxlbmd0aCAtIDJdLmNvbXBvbmVudC5jb21wb25lbnRUeXBlO1xuICAgICAgfSBlbHNlIGlmIChhbmNlc3Rvckluc3RydWN0aW9ucy5sZW5ndGggPT0gMSkge1xuICAgICAgICBwYXJlbnRDb21wb25lbnQgPSBhbmNlc3Rvckluc3RydWN0aW9uc1swXS5jb21wb25lbnQuY29tcG9uZW50VHlwZTtcbiAgICAgICAgZ3JhbmRwYXJlbnRDb21wb25lbnQgPSB0aGlzLl9yb290Q29tcG9uZW50O1xuICAgICAgfVxuXG4gICAgICAvLyBGb3IgYSBsaW5rIHdpdGggbm8gbGVhZGluZyBgLi9gLCBgL2AsIG9yIGAuLi9gLCB3ZSBsb29rIGZvciBhIHNpYmxpbmcgYW5kIGNoaWxkLlxuICAgICAgLy8gSWYgYm90aCBleGlzdCwgd2UgdGhyb3cuIE90aGVyd2lzZSwgd2UgcHJlZmVyIHdoaWNoZXZlciBleGlzdHMuXG4gICAgICB2YXIgY2hpbGRSb3V0ZUV4aXN0cyA9IHRoaXMuaGFzUm91dGUoZmlyc3QsIHBhcmVudENvbXBvbmVudCk7XG4gICAgICB2YXIgcGFyZW50Um91dGVFeGlzdHMgPVxuICAgICAgICAgIGlzUHJlc2VudChncmFuZHBhcmVudENvbXBvbmVudCkgJiYgdGhpcy5oYXNSb3V0ZShmaXJzdCwgZ3JhbmRwYXJlbnRDb21wb25lbnQpO1xuXG4gICAgICBpZiAocGFyZW50Um91dGVFeGlzdHMgJiYgY2hpbGRSb3V0ZUV4aXN0cykge1xuICAgICAgICBsZXQgbXNnID1cbiAgICAgICAgICAgIGBMaW5rIFwiJHtMaXN0V3JhcHBlci50b0pTT04obGlua1BhcmFtcyl9XCIgaXMgYW1iaWd1b3VzLCB1c2UgXCIuL1wiIG9yIFwiLi4vXCIgdG8gZGlzYW1iaWd1YXRlLmA7XG4gICAgICAgIHRocm93IG5ldyBCYXNlRXhjZXB0aW9uKG1zZyk7XG4gICAgICB9XG4gICAgICBpZiAocGFyZW50Um91dGVFeGlzdHMpIHtcbiAgICAgICAgYW5jZXN0b3JJbnN0cnVjdGlvbnMucG9wKCk7XG4gICAgICB9XG4gICAgICByZXN0ID0gbGlua1BhcmFtcztcbiAgICB9XG5cbiAgICBpZiAocmVzdFtyZXN0Lmxlbmd0aCAtIDFdID09ICcnKSB7XG4gICAgICByZXN0LnBvcCgpO1xuICAgIH1cblxuICAgIGlmIChyZXN0Lmxlbmd0aCA8IDEpIHtcbiAgICAgIGxldCBtc2cgPSBgTGluayBcIiR7TGlzdFdyYXBwZXIudG9KU09OKGxpbmtQYXJhbXMpfVwiIG11c3QgaW5jbHVkZSBhIHJvdXRlIG5hbWUuYDtcbiAgICAgIHRocm93IG5ldyBCYXNlRXhjZXB0aW9uKG1zZyk7XG4gICAgfVxuXG4gICAgdmFyIGdlbmVyYXRlZEluc3RydWN0aW9uID0gdGhpcy5fZ2VuZXJhdGUocmVzdCwgYW5jZXN0b3JJbnN0cnVjdGlvbnMsIF9hdXgpO1xuXG4gICAgZm9yICh2YXIgaSA9IGFuY2VzdG9ySW5zdHJ1Y3Rpb25zLmxlbmd0aCAtIDE7IGkgPj0gMDsgaS0tKSB7XG4gICAgICBsZXQgYW5jZXN0b3JJbnN0cnVjdGlvbiA9IGFuY2VzdG9ySW5zdHJ1Y3Rpb25zW2ldO1xuICAgICAgZ2VuZXJhdGVkSW5zdHJ1Y3Rpb24gPSBhbmNlc3Rvckluc3RydWN0aW9uLnJlcGxhY2VDaGlsZChnZW5lcmF0ZWRJbnN0cnVjdGlvbik7XG4gICAgfVxuXG4gICAgcmV0dXJuIGdlbmVyYXRlZEluc3RydWN0aW9uO1xuICB9XG5cblxuICAvKlxuICAgKiBJbnRlcm5hbCBoZWxwZXIgdGhhdCBkb2VzIG5vdCBtYWtlIGFueSBhc3NlcnRpb25zIGFib3V0IHRoZSBiZWdpbm5pbmcgb2YgdGhlIGxpbmsgRFNMXG4gICAqL1xuICBwcml2YXRlIF9nZW5lcmF0ZShsaW5rUGFyYW1zOiBhbnlbXSwgYW5jZXN0b3JJbnN0cnVjdGlvbnM6IEluc3RydWN0aW9uW10sXG4gICAgICAgICAgICAgICAgICAgIF9hdXggPSBmYWxzZSk6IEluc3RydWN0aW9uIHtcbiAgICBsZXQgcGFyZW50Q29tcG9uZW50ID1cbiAgICAgICAgYW5jZXN0b3JJbnN0cnVjdGlvbnMubGVuZ3RoID4gMCA/XG4gICAgICAgICAgICBhbmNlc3Rvckluc3RydWN0aW9uc1thbmNlc3Rvckluc3RydWN0aW9ucy5sZW5ndGggLSAxXS5jb21wb25lbnQuY29tcG9uZW50VHlwZSA6XG4gICAgICAgICAgICB0aGlzLl9yb290Q29tcG9uZW50O1xuXG5cbiAgICBpZiAobGlua1BhcmFtcy5sZW5ndGggPT0gMCkge1xuICAgICAgcmV0dXJuIHRoaXMuZ2VuZXJhdGVEZWZhdWx0KHBhcmVudENvbXBvbmVudCk7XG4gICAgfVxuICAgIGxldCBsaW5rSW5kZXggPSAwO1xuICAgIGxldCByb3V0ZU5hbWUgPSBsaW5rUGFyYW1zW2xpbmtJbmRleF07XG5cbiAgICBpZiAoIWlzU3RyaW5nKHJvdXRlTmFtZSkpIHtcbiAgICAgIHRocm93IG5ldyBCYXNlRXhjZXB0aW9uKGBVbmV4cGVjdGVkIHNlZ21lbnQgXCIke3JvdXRlTmFtZX1cIiBpbiBsaW5rIERTTC4gRXhwZWN0ZWQgYSBzdHJpbmcuYCk7XG4gICAgfSBlbHNlIGlmIChyb3V0ZU5hbWUgPT0gJycgfHwgcm91dGVOYW1lID09ICcuJyB8fCByb3V0ZU5hbWUgPT0gJy4uJykge1xuICAgICAgdGhyb3cgbmV3IEJhc2VFeGNlcHRpb24oYFwiJHtyb3V0ZU5hbWV9L1wiIGlzIG9ubHkgYWxsb3dlZCBhdCB0aGUgYmVnaW5uaW5nIG9mIGEgbGluayBEU0wuYCk7XG4gICAgfVxuXG4gICAgbGV0IHBhcmFtcyA9IHt9O1xuICAgIGlmIChsaW5rSW5kZXggKyAxIDwgbGlua1BhcmFtcy5sZW5ndGgpIHtcbiAgICAgIGxldCBuZXh0U2VnbWVudCA9IGxpbmtQYXJhbXNbbGlua0luZGV4ICsgMV07XG4gICAgICBpZiAoaXNTdHJpbmdNYXAobmV4dFNlZ21lbnQpICYmICFpc0FycmF5KG5leHRTZWdtZW50KSkge1xuICAgICAgICBwYXJhbXMgPSBuZXh0U2VnbWVudDtcbiAgICAgICAgbGlua0luZGV4ICs9IDE7XG4gICAgICB9XG4gICAgfVxuXG4gICAgbGV0IGF1eEluc3RydWN0aW9uczoge1trZXk6IHN0cmluZ106IEluc3RydWN0aW9ufSA9IHt9O1xuICAgIHZhciBuZXh0U2VnbWVudDtcbiAgICB3aGlsZSAobGlua0luZGV4ICsgMSA8IGxpbmtQYXJhbXMubGVuZ3RoICYmIGlzQXJyYXkobmV4dFNlZ21lbnQgPSBsaW5rUGFyYW1zW2xpbmtJbmRleCArIDFdKSkge1xuICAgICAgbGV0IGF1eFBhcmVudEluc3RydWN0aW9uID0gYW5jZXN0b3JJbnN0cnVjdGlvbnMubGVuZ3RoID4gMCA/XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgW2FuY2VzdG9ySW5zdHJ1Y3Rpb25zW2FuY2VzdG9ySW5zdHJ1Y3Rpb25zLmxlbmd0aCAtIDFdXSA6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgW107XG4gICAgICBsZXQgYXV4SW5zdHJ1Y3Rpb24gPSB0aGlzLl9nZW5lcmF0ZShuZXh0U2VnbWVudCwgYXV4UGFyZW50SW5zdHJ1Y3Rpb24sIHRydWUpO1xuXG4gICAgICAvLyBUT0RPOiB0aGlzIHdpbGwgbm90IHdvcmsgZm9yIGF1eCByb3V0ZXMgd2l0aCBwYXJhbWV0ZXJzIG9yIG11bHRpcGxlIHNlZ21lbnRzXG4gICAgICBhdXhJbnN0cnVjdGlvbnNbYXV4SW5zdHJ1Y3Rpb24uY29tcG9uZW50LnVybFBhdGhdID0gYXV4SW5zdHJ1Y3Rpb247XG4gICAgICBsaW5rSW5kZXggKz0gMTtcbiAgICB9XG5cbiAgICB2YXIgY29tcG9uZW50UmVjb2duaXplciA9IHRoaXMuX3J1bGVzLmdldChwYXJlbnRDb21wb25lbnQpO1xuICAgIGlmIChpc0JsYW5rKGNvbXBvbmVudFJlY29nbml6ZXIpKSB7XG4gICAgICB0aHJvdyBuZXcgQmFzZUV4Y2VwdGlvbihcbiAgICAgICAgICBgQ29tcG9uZW50IFwiJHtnZXRUeXBlTmFtZUZvckRlYnVnZ2luZyhwYXJlbnRDb21wb25lbnQpfVwiIGhhcyBubyByb3V0ZSBjb25maWcuYCk7XG4gICAgfVxuXG4gICAgdmFyIHJvdXRlUmVjb2duaXplciA9XG4gICAgICAgIChfYXV4ID8gY29tcG9uZW50UmVjb2duaXplci5hdXhOYW1lcyA6IGNvbXBvbmVudFJlY29nbml6ZXIubmFtZXMpLmdldChyb3V0ZU5hbWUpO1xuXG4gICAgaWYgKCFpc1ByZXNlbnQocm91dGVSZWNvZ25pemVyKSkge1xuICAgICAgdGhyb3cgbmV3IEJhc2VFeGNlcHRpb24oXG4gICAgICAgICAgYENvbXBvbmVudCBcIiR7Z2V0VHlwZU5hbWVGb3JEZWJ1Z2dpbmcocGFyZW50Q29tcG9uZW50KX1cIiBoYXMgbm8gcm91dGUgbmFtZWQgXCIke3JvdXRlTmFtZX1cIi5gKTtcbiAgICB9XG5cbiAgICBpZiAoIWlzUHJlc2VudChyb3V0ZVJlY29nbml6ZXIuaGFuZGxlci5jb21wb25lbnRUeXBlKSkge1xuICAgICAgdmFyIGNvbXBJbnN0cnVjdGlvbiA9IHJvdXRlUmVjb2duaXplci5nZW5lcmF0ZUNvbXBvbmVudFBhdGhWYWx1ZXMocGFyYW1zKTtcbiAgICAgIHJldHVybiBuZXcgVW5yZXNvbHZlZEluc3RydWN0aW9uKCgpID0+IHtcbiAgICAgICAgcmV0dXJuIHJvdXRlUmVjb2duaXplci5oYW5kbGVyLnJlc29sdmVDb21wb25lbnRUeXBlKCkudGhlbihcbiAgICAgICAgICAgIChfKSA9PiB7IHJldHVybiB0aGlzLl9nZW5lcmF0ZShsaW5rUGFyYW1zLCBhbmNlc3Rvckluc3RydWN0aW9ucywgX2F1eCk7IH0pO1xuICAgICAgfSwgY29tcEluc3RydWN0aW9uWyd1cmxQYXRoJ10sIGNvbXBJbnN0cnVjdGlvblsndXJsUGFyYW1zJ10pO1xuICAgIH1cblxuICAgIHZhciBjb21wb25lbnRJbnN0cnVjdGlvbiA9IF9hdXggPyBjb21wb25lbnRSZWNvZ25pemVyLmdlbmVyYXRlQXV4aWxpYXJ5KHJvdXRlTmFtZSwgcGFyYW1zKSA6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbXBvbmVudFJlY29nbml6ZXIuZ2VuZXJhdGUocm91dGVOYW1lLCBwYXJhbXMpO1xuXG5cblxuICAgIHZhciByZW1haW5pbmcgPSBsaW5rUGFyYW1zLnNsaWNlKGxpbmtJbmRleCArIDEpO1xuXG4gICAgdmFyIGluc3RydWN0aW9uID0gbmV3IFJlc29sdmVkSW5zdHJ1Y3Rpb24oY29tcG9uZW50SW5zdHJ1Y3Rpb24sIG51bGwsIGF1eEluc3RydWN0aW9ucyk7XG5cbiAgICAvLyB0aGUgY29tcG9uZW50IGlzIHN5bmNcbiAgICBpZiAoaXNQcmVzZW50KGNvbXBvbmVudEluc3RydWN0aW9uLmNvbXBvbmVudFR5cGUpKSB7XG4gICAgICBsZXQgY2hpbGRJbnN0cnVjdGlvbjogSW5zdHJ1Y3Rpb24gPSBudWxsO1xuICAgICAgaWYgKGxpbmtJbmRleCArIDEgPCBsaW5rUGFyYW1zLmxlbmd0aCkge1xuICAgICAgICBsZXQgY2hpbGRBbmNlc3RvckNvbXBvbmVudHMgPSBhbmNlc3Rvckluc3RydWN0aW9ucy5jb25jYXQoW2luc3RydWN0aW9uXSk7XG4gICAgICAgIGNoaWxkSW5zdHJ1Y3Rpb24gPSB0aGlzLl9nZW5lcmF0ZShyZW1haW5pbmcsIGNoaWxkQW5jZXN0b3JDb21wb25lbnRzKTtcbiAgICAgIH0gZWxzZSBpZiAoIWNvbXBvbmVudEluc3RydWN0aW9uLnRlcm1pbmFsKSB7XG4gICAgICAgIC8vIC4uLiBsb29rIGZvciBkZWZhdWx0c1xuICAgICAgICBjaGlsZEluc3RydWN0aW9uID0gdGhpcy5nZW5lcmF0ZURlZmF1bHQoY29tcG9uZW50SW5zdHJ1Y3Rpb24uY29tcG9uZW50VHlwZSk7XG5cbiAgICAgICAgaWYgKGlzQmxhbmsoY2hpbGRJbnN0cnVjdGlvbikpIHtcbiAgICAgICAgICB0aHJvdyBuZXcgQmFzZUV4Y2VwdGlvbihcbiAgICAgICAgICAgICAgYExpbmsgXCIke0xpc3RXcmFwcGVyLnRvSlNPTihsaW5rUGFyYW1zKX1cIiBkb2VzIG5vdCByZXNvbHZlIHRvIGEgdGVybWluYWwgaW5zdHJ1Y3Rpb24uYCk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGluc3RydWN0aW9uLmNoaWxkID0gY2hpbGRJbnN0cnVjdGlvbjtcbiAgICB9XG5cbiAgICByZXR1cm4gaW5zdHJ1Y3Rpb247XG4gIH1cblxuICBwdWJsaWMgaGFzUm91dGUobmFtZTogc3RyaW5nLCBwYXJlbnRDb21wb25lbnQ6IGFueSk6IGJvb2xlYW4ge1xuICAgIHZhciBjb21wb25lbnRSZWNvZ25pemVyOiBDb21wb25lbnRSZWNvZ25pemVyID0gdGhpcy5fcnVsZXMuZ2V0KHBhcmVudENvbXBvbmVudCk7XG4gICAgaWYgKGlzQmxhbmsoY29tcG9uZW50UmVjb2duaXplcikpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgcmV0dXJuIGNvbXBvbmVudFJlY29nbml6ZXIuaGFzUm91dGUobmFtZSk7XG4gIH1cblxuICBwdWJsaWMgZ2VuZXJhdGVEZWZhdWx0KGNvbXBvbmVudEN1cnNvcjogVHlwZSk6IEluc3RydWN0aW9uIHtcbiAgICBpZiAoaXNCbGFuayhjb21wb25lbnRDdXJzb3IpKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG5cbiAgICB2YXIgY29tcG9uZW50UmVjb2duaXplciA9IHRoaXMuX3J1bGVzLmdldChjb21wb25lbnRDdXJzb3IpO1xuICAgIGlmIChpc0JsYW5rKGNvbXBvbmVudFJlY29nbml6ZXIpIHx8IGlzQmxhbmsoY29tcG9uZW50UmVjb2duaXplci5kZWZhdWx0Um91dGUpKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG5cblxuICAgIHZhciBkZWZhdWx0Q2hpbGQgPSBudWxsO1xuICAgIGlmIChpc1ByZXNlbnQoY29tcG9uZW50UmVjb2duaXplci5kZWZhdWx0Um91dGUuaGFuZGxlci5jb21wb25lbnRUeXBlKSkge1xuICAgICAgdmFyIGNvbXBvbmVudEluc3RydWN0aW9uID0gY29tcG9uZW50UmVjb2duaXplci5kZWZhdWx0Um91dGUuZ2VuZXJhdGUoe30pO1xuICAgICAgaWYgKCFjb21wb25lbnRSZWNvZ25pemVyLmRlZmF1bHRSb3V0ZS50ZXJtaW5hbCkge1xuICAgICAgICBkZWZhdWx0Q2hpbGQgPSB0aGlzLmdlbmVyYXRlRGVmYXVsdChjb21wb25lbnRSZWNvZ25pemVyLmRlZmF1bHRSb3V0ZS5oYW5kbGVyLmNvbXBvbmVudFR5cGUpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIG5ldyBEZWZhdWx0SW5zdHJ1Y3Rpb24oY29tcG9uZW50SW5zdHJ1Y3Rpb24sIGRlZmF1bHRDaGlsZCk7XG4gICAgfVxuXG4gICAgcmV0dXJuIG5ldyBVbnJlc29sdmVkSW5zdHJ1Y3Rpb24oKCkgPT4ge1xuICAgICAgcmV0dXJuIGNvbXBvbmVudFJlY29nbml6ZXIuZGVmYXVsdFJvdXRlLmhhbmRsZXIucmVzb2x2ZUNvbXBvbmVudFR5cGUoKS50aGVuKFxuICAgICAgICAgIChfKSA9PiB0aGlzLmdlbmVyYXRlRGVmYXVsdChjb21wb25lbnRDdXJzb3IpKTtcbiAgICB9KTtcbiAgfVxufVxuXG4vKlxuICogR2l2ZW46IFsnL2EvYicsIHtjOiAyfV1cbiAqIFJldHVybnM6IFsnJywgJ2EnLCAnYicsIHtjOiAyfV1cbiAqL1xuZnVuY3Rpb24gc3BsaXRBbmRGbGF0dGVuTGlua1BhcmFtcyhsaW5rUGFyYW1zOiBhbnlbXSk6IGFueVtdIHtcbiAgcmV0dXJuIGxpbmtQYXJhbXMucmVkdWNlKChhY2N1bXVsYXRpb246IGFueVtdLCBpdGVtKSA9PiB7XG4gICAgaWYgKGlzU3RyaW5nKGl0ZW0pKSB7XG4gICAgICBsZXQgc3RySXRlbTogc3RyaW5nID0gaXRlbTtcbiAgICAgIHJldHVybiBhY2N1bXVsYXRpb24uY29uY2F0KHN0ckl0ZW0uc3BsaXQoJy8nKSk7XG4gICAgfVxuICAgIGFjY3VtdWxhdGlvbi5wdXNoKGl0ZW0pO1xuICAgIHJldHVybiBhY2N1bXVsYXRpb247XG4gIH0sIFtdKTtcbn1cblxuLypcbiAqIEdpdmVuIGEgbGlzdCBvZiBpbnN0cnVjdGlvbnMsIHJldHVybnMgdGhlIG1vc3Qgc3BlY2lmaWMgaW5zdHJ1Y3Rpb25cbiAqL1xuZnVuY3Rpb24gbW9zdFNwZWNpZmljKGluc3RydWN0aW9uczogSW5zdHJ1Y3Rpb25bXSk6IEluc3RydWN0aW9uIHtcbiAgcmV0dXJuIExpc3RXcmFwcGVyLm1heGltdW0oaW5zdHJ1Y3Rpb25zLCAoaW5zdHJ1Y3Rpb246IEluc3RydWN0aW9uKSA9PiBpbnN0cnVjdGlvbi5zcGVjaWZpY2l0eSk7XG59XG5cbmZ1bmN0aW9uIGFzc2VydFRlcm1pbmFsQ29tcG9uZW50KGNvbXBvbmVudCwgcGF0aCkge1xuICBpZiAoIWlzVHlwZShjb21wb25lbnQpKSB7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgdmFyIGFubm90YXRpb25zID0gcmVmbGVjdG9yLmFubm90YXRpb25zKGNvbXBvbmVudCk7XG4gIGlmIChpc1ByZXNlbnQoYW5ub3RhdGlvbnMpKSB7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBhbm5vdGF0aW9ucy5sZW5ndGg7IGkrKykge1xuICAgICAgdmFyIGFubm90YXRpb24gPSBhbm5vdGF0aW9uc1tpXTtcblxuICAgICAgaWYgKGFubm90YXRpb24gaW5zdGFuY2VvZiBSb3V0ZUNvbmZpZykge1xuICAgICAgICB0aHJvdyBuZXcgQmFzZUV4Y2VwdGlvbihcbiAgICAgICAgICAgIGBDaGlsZCByb3V0ZXMgYXJlIG5vdCBhbGxvd2VkIGZvciBcIiR7cGF0aH1cIi4gVXNlIFwiLi4uXCIgb24gdGhlIHBhcmVudCdzIHJvdXRlIHBhdGguYCk7XG4gICAgICB9XG4gICAgfVxuICB9XG59XG4iXX0=