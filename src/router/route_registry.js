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
 * import {Component} from 'angular2/core';
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicm91dGVfcmVnaXN0cnkuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJhbmd1bGFyMi9zcmMvcm91dGVyL3JvdXRlX3JlZ2lzdHJ5LnRzIl0sIm5hbWVzIjpbIlJvdXRlUmVnaXN0cnkiLCJSb3V0ZVJlZ2lzdHJ5LmNvbnN0cnVjdG9yIiwiUm91dGVSZWdpc3RyeS5jb25maWciLCJSb3V0ZVJlZ2lzdHJ5LmNvbmZpZ0Zyb21Db21wb25lbnQiLCJSb3V0ZVJlZ2lzdHJ5LnJlY29nbml6ZSIsIlJvdXRlUmVnaXN0cnkuX3JlY29nbml6ZSIsIlJvdXRlUmVnaXN0cnkuX2F1eFJvdXRlc1RvVW5yZXNvbHZlZCIsIlJvdXRlUmVnaXN0cnkuZ2VuZXJhdGUiLCJSb3V0ZVJlZ2lzdHJ5Ll9nZW5lcmF0ZSIsIlJvdXRlUmVnaXN0cnkuaGFzUm91dGUiLCJSb3V0ZVJlZ2lzdHJ5LmdlbmVyYXRlRGVmYXVsdCIsInNwbGl0QW5kRmxhdHRlbkxpbmtQYXJhbXMiLCJtb3N0U3BlY2lmaWMiLCJhc3NlcnRUZXJtaW5hbENvbXBvbmVudCJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7O0FBQUEsMkJBQTZELGdDQUFnQyxDQUFDLENBQUE7QUFDOUYsc0JBQXNDLDJCQUEyQixDQUFDLENBQUE7QUFDbEUscUJBVU8sMEJBQTBCLENBQUMsQ0FBQTtBQUNsQywyQkFBOEMsZ0NBQWdDLENBQUMsQ0FBQTtBQUMvRSwyQkFBd0IseUNBQXlDLENBQUMsQ0FBQTtBQUNsRSxxQkFBOEMsZUFBZSxDQUFDLENBQUE7QUFFOUQsa0NBT08scUJBQXFCLENBQUMsQ0FBQTtBQUM3QixpQ0FBbUQsb0JBQW9CLENBQUMsQ0FBQTtBQUN4RSxxQ0FBa0Msd0JBQXdCLENBQUMsQ0FBQTtBQUMzRCw0QkFNTyxlQUFlLENBQUMsQ0FBQTtBQUV2Qix1Q0FBMEQsMEJBQTBCLENBQUMsQ0FBQTtBQUNyRiwyQkFBNkMsY0FBYyxDQUFDLENBQUE7QUFFNUQsSUFBSSxjQUFjLEdBQUcsc0JBQWMsQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUM7QUFJbEQ7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztHQXdCRztBQUNVLGdDQUF3QixHQUNqQyxpQkFBVSxDQUFDLElBQUksa0JBQVcsQ0FBQyx3QkFBd0IsQ0FBQyxDQUFDLENBQUM7QUFHMUQ7Ozs7R0FJRztBQUNIO0lBSUVBLHVCQUFzREEsY0FBb0JBO1FBQXBCQyxtQkFBY0EsR0FBZEEsY0FBY0EsQ0FBTUE7UUFGbEVBLFdBQU1BLEdBQUdBLElBQUlBLGdCQUFHQSxFQUE0QkEsQ0FBQ0E7SUFFd0JBLENBQUNBO0lBRTlFRDs7T0FFR0E7SUFDSEEsOEJBQU1BLEdBQU5BLFVBQU9BLGVBQW9CQSxFQUFFQSxNQUF1QkE7UUFDbERFLE1BQU1BLEdBQUdBLDZDQUFvQkEsQ0FBQ0EsTUFBTUEsRUFBRUEsSUFBSUEsQ0FBQ0EsQ0FBQ0E7UUFFNUNBLCtDQUErQ0E7UUFDL0NBLEVBQUVBLENBQUNBLENBQUNBLE1BQU1BLFlBQVlBLHlCQUFLQSxDQUFDQSxDQUFDQSxDQUFDQTtZQUM1QkEsOENBQXFCQSxDQUFDQSxNQUFNQSxDQUFDQSxTQUFTQSxFQUFFQSxNQUFNQSxDQUFDQSxJQUFJQSxDQUFDQSxDQUFDQTtRQUN2REEsQ0FBQ0E7UUFBQ0EsSUFBSUEsQ0FBQ0EsRUFBRUEsQ0FBQ0EsQ0FBQ0EsTUFBTUEsWUFBWUEsNEJBQVFBLENBQUNBLENBQUNBLENBQUNBO1lBQ3RDQSw4Q0FBcUJBLENBQUNBLE1BQU1BLENBQUNBLFNBQVNBLEVBQUVBLE1BQU1BLENBQUNBLElBQUlBLENBQUNBLENBQUNBO1FBQ3ZEQSxDQUFDQTtRQUVEQSxJQUFJQSxVQUFVQSxHQUF3QkEsSUFBSUEsQ0FBQ0EsTUFBTUEsQ0FBQ0EsR0FBR0EsQ0FBQ0EsZUFBZUEsQ0FBQ0EsQ0FBQ0E7UUFFdkVBLEVBQUVBLENBQUNBLENBQUNBLGNBQU9BLENBQUNBLFVBQVVBLENBQUNBLENBQUNBLENBQUNBLENBQUNBO1lBQ3hCQSxVQUFVQSxHQUFHQSxJQUFJQSwwQ0FBbUJBLEVBQUVBLENBQUNBO1lBQ3ZDQSxJQUFJQSxDQUFDQSxNQUFNQSxDQUFDQSxHQUFHQSxDQUFDQSxlQUFlQSxFQUFFQSxVQUFVQSxDQUFDQSxDQUFDQTtRQUMvQ0EsQ0FBQ0E7UUFFREEsSUFBSUEsUUFBUUEsR0FBR0EsVUFBVUEsQ0FBQ0EsTUFBTUEsQ0FBQ0EsTUFBTUEsQ0FBQ0EsQ0FBQ0E7UUFFekNBLEVBQUVBLENBQUNBLENBQUNBLE1BQU1BLFlBQVlBLHlCQUFLQSxDQUFDQSxDQUFDQSxDQUFDQTtZQUM1QkEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsUUFBUUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7Z0JBQ2JBLHVCQUF1QkEsQ0FBQ0EsTUFBTUEsQ0FBQ0EsU0FBU0EsRUFBRUEsTUFBTUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsQ0FBQ0E7WUFDekRBLENBQUNBO1lBQUNBLElBQUlBLENBQUNBLENBQUNBO2dCQUNOQSxJQUFJQSxDQUFDQSxtQkFBbUJBLENBQUNBLE1BQU1BLENBQUNBLFNBQVNBLENBQUNBLENBQUNBO1lBQzdDQSxDQUFDQTtRQUNIQSxDQUFDQTtJQUNIQSxDQUFDQTtJQUVERjs7T0FFR0E7SUFDSEEsMkNBQW1CQSxHQUFuQkEsVUFBb0JBLFNBQWNBO1FBQWxDRyxpQkFxQkNBO1FBcEJDQSxFQUFFQSxDQUFDQSxDQUFDQSxDQUFDQSxhQUFNQSxDQUFDQSxTQUFTQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTtZQUN2QkEsTUFBTUEsQ0FBQ0E7UUFDVEEsQ0FBQ0E7UUFFREEsMERBQTBEQTtRQUMxREEsb0VBQW9FQTtRQUNwRUEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsTUFBTUEsQ0FBQ0EsR0FBR0EsQ0FBQ0EsU0FBU0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7WUFDL0JBLE1BQU1BLENBQUNBO1FBQ1RBLENBQUNBO1FBQ0RBLElBQUlBLFdBQVdBLEdBQUdBLHNCQUFTQSxDQUFDQSxXQUFXQSxDQUFDQSxTQUFTQSxDQUFDQSxDQUFDQTtRQUNuREEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsZ0JBQVNBLENBQUNBLFdBQVdBLENBQUNBLENBQUNBLENBQUNBLENBQUNBO1lBQzNCQSxHQUFHQSxDQUFDQSxDQUFDQSxHQUFHQSxDQUFDQSxDQUFDQSxHQUFHQSxDQUFDQSxFQUFFQSxDQUFDQSxHQUFHQSxXQUFXQSxDQUFDQSxNQUFNQSxFQUFFQSxDQUFDQSxFQUFFQSxFQUFFQSxDQUFDQTtnQkFDNUNBLElBQUlBLFVBQVVBLEdBQUdBLFdBQVdBLENBQUNBLENBQUNBLENBQUNBLENBQUNBO2dCQUVoQ0EsRUFBRUEsQ0FBQ0EsQ0FBQ0EsVUFBVUEsWUFBWUEsK0JBQVdBLENBQUNBLENBQUNBLENBQUNBO29CQUN0Q0EsSUFBSUEsU0FBU0EsR0FBc0JBLFVBQVVBLENBQUNBLE9BQU9BLENBQUNBO29CQUN0REEsU0FBU0EsQ0FBQ0EsT0FBT0EsQ0FBQ0EsVUFBQUEsTUFBTUEsSUFBSUEsT0FBQUEsS0FBSUEsQ0FBQ0EsTUFBTUEsQ0FBQ0EsU0FBU0EsRUFBRUEsTUFBTUEsQ0FBQ0EsRUFBOUJBLENBQThCQSxDQUFDQSxDQUFDQTtnQkFDOURBLENBQUNBO1lBQ0hBLENBQUNBO1FBQ0hBLENBQUNBO0lBQ0hBLENBQUNBO0lBR0RIOzs7T0FHR0E7SUFDSEEsaUNBQVNBLEdBQVRBLFVBQVVBLEdBQVdBLEVBQUVBLG9CQUFtQ0E7UUFDeERJLElBQUlBLFNBQVNBLEdBQUdBLG1CQUFNQSxDQUFDQSxLQUFLQSxDQUFDQSxHQUFHQSxDQUFDQSxDQUFDQTtRQUNsQ0EsTUFBTUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsVUFBVUEsQ0FBQ0EsU0FBU0EsRUFBRUEsb0JBQW9CQSxDQUFDQSxDQUFDQTtJQUMxREEsQ0FBQ0E7SUFHREo7O09BRUdBO0lBRUtBLGtDQUFVQSxHQUFsQkEsVUFBbUJBLFNBQWNBLEVBQUVBLG9CQUFtQ0EsRUFDbkRBLElBQVlBO1FBRC9CSyxpQkE4RENBO1FBN0RrQkEsb0JBQVlBLEdBQVpBLFlBQVlBO1FBQzdCQSxJQUFJQSxlQUFlQSxHQUNmQSxvQkFBb0JBLENBQUNBLE1BQU1BLEdBQUdBLENBQUNBO1lBQzNCQSxvQkFBb0JBLENBQUNBLG9CQUFvQkEsQ0FBQ0EsTUFBTUEsR0FBR0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsU0FBU0EsQ0FBQ0EsYUFBYUE7WUFDN0VBLElBQUlBLENBQUNBLGNBQWNBLENBQUNBO1FBRTVCQSxJQUFJQSxtQkFBbUJBLEdBQUdBLElBQUlBLENBQUNBLE1BQU1BLENBQUNBLEdBQUdBLENBQUNBLGVBQWVBLENBQUNBLENBQUNBO1FBQzNEQSxFQUFFQSxDQUFDQSxDQUFDQSxjQUFPQSxDQUFDQSxtQkFBbUJBLENBQUNBLENBQUNBLENBQUNBLENBQUNBO1lBQ2pDQSxNQUFNQSxDQUFDQSxjQUFjQSxDQUFDQTtRQUN4QkEsQ0FBQ0E7UUFFREEsK0NBQStDQTtRQUMvQ0EsSUFBSUEsZUFBZUEsR0FDZkEsSUFBSUEsR0FBR0EsbUJBQW1CQSxDQUFDQSxrQkFBa0JBLENBQUNBLFNBQVNBLENBQUNBO1lBQ2pEQSxtQkFBbUJBLENBQUNBLFNBQVNBLENBQUNBLFNBQVNBLENBQUNBLENBQUNBO1FBRXBEQSxJQUFJQSxhQUFhQSxHQUEyQkEsZUFBZUEsQ0FBQ0EsR0FBR0EsQ0FDM0RBLFVBQUNBLFNBQThCQSxJQUFLQSxPQUFBQSxTQUFTQSxDQUFDQSxJQUFJQSxDQUFDQSxVQUFDQSxTQUFxQkE7WUFFdkVBLEVBQUVBLENBQUNBLENBQUNBLFNBQVNBLFlBQVlBLDRCQUFTQSxDQUFDQSxDQUFDQSxDQUFDQTtnQkFDbkNBLElBQUlBLHFCQUFxQkEsR0FDckJBLG9CQUFvQkEsQ0FBQ0EsTUFBTUEsR0FBR0EsQ0FBQ0E7b0JBQzNCQSxDQUFDQSxvQkFBb0JBLENBQUNBLG9CQUFvQkEsQ0FBQ0EsTUFBTUEsR0FBR0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7b0JBQ3ZEQSxFQUFFQSxDQUFDQTtnQkFDWEEsSUFBSUEsZUFBZUEsR0FDZkEsS0FBSUEsQ0FBQ0Esc0JBQXNCQSxDQUFDQSxTQUFTQSxDQUFDQSxZQUFZQSxFQUFFQSxxQkFBcUJBLENBQUNBLENBQUNBO2dCQUMvRUEsSUFBSUEsV0FBV0EsR0FBR0EsSUFBSUEsaUNBQW1CQSxDQUFDQSxTQUFTQSxDQUFDQSxXQUFXQSxFQUFFQSxJQUFJQSxFQUFFQSxlQUFlQSxDQUFDQSxDQUFDQTtnQkFFeEZBLEVBQUVBLENBQUNBLENBQUNBLFNBQVNBLENBQUNBLFdBQVdBLENBQUNBLFFBQVFBLENBQUNBLENBQUNBLENBQUNBO29CQUNuQ0EsTUFBTUEsQ0FBQ0EsV0FBV0EsQ0FBQ0E7Z0JBQ3JCQSxDQUFDQTtnQkFFREEsSUFBSUEscUJBQXFCQSxHQUFHQSxvQkFBb0JBLENBQUNBLE1BQU1BLENBQUNBLENBQUNBLFdBQVdBLENBQUNBLENBQUNBLENBQUNBO2dCQUV2RUEsTUFBTUEsQ0FBQ0EsS0FBSUEsQ0FBQ0EsVUFBVUEsQ0FBQ0EsU0FBU0EsQ0FBQ0EsU0FBU0EsRUFBRUEscUJBQXFCQSxDQUFDQTtxQkFDN0RBLElBQUlBLENBQUNBLFVBQUNBLGdCQUFnQkE7b0JBQ3JCQSxFQUFFQSxDQUFDQSxDQUFDQSxjQUFPQSxDQUFDQSxnQkFBZ0JBLENBQUNBLENBQUNBLENBQUNBLENBQUNBO3dCQUM5QkEsTUFBTUEsQ0FBQ0EsSUFBSUEsQ0FBQ0E7b0JBQ2RBLENBQUNBO29CQUVEQSw2Q0FBNkNBO29CQUM3Q0EsRUFBRUEsQ0FBQ0EsQ0FBQ0EsZ0JBQWdCQSxZQUFZQSxpQ0FBbUJBLENBQUNBLENBQUNBLENBQUNBO3dCQUNwREEsTUFBTUEsQ0FBQ0EsZ0JBQWdCQSxDQUFDQTtvQkFDMUJBLENBQUNBO29CQUNEQSxXQUFXQSxDQUFDQSxLQUFLQSxHQUFHQSxnQkFBZ0JBLENBQUNBO29CQUNyQ0EsTUFBTUEsQ0FBQ0EsV0FBV0EsQ0FBQ0E7Z0JBQ3JCQSxDQUFDQSxDQUFDQSxDQUFDQTtZQUNUQSxDQUFDQTtZQUVEQSxFQUFFQSxDQUFDQSxDQUFDQSxTQUFTQSxZQUFZQSxnQ0FBYUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7Z0JBQ3ZDQSxJQUFJQSxXQUFXQSxHQUFHQSxLQUFJQSxDQUFDQSxRQUFRQSxDQUFDQSxTQUFTQSxDQUFDQSxVQUFVQSxFQUFFQSxvQkFBb0JBLENBQUNBLENBQUNBO2dCQUM1RUEsTUFBTUEsQ0FBQ0EsSUFBSUEsaUNBQW1CQSxDQUFDQSxXQUFXQSxDQUFDQSxTQUFTQSxFQUFFQSxXQUFXQSxDQUFDQSxLQUFLQSxFQUN4Q0EsV0FBV0EsQ0FBQ0EsY0FBY0EsQ0FBQ0EsQ0FBQ0E7WUFDN0RBLENBQUNBO1FBQ0hBLENBQUNBLENBQUNBLEVBckNrQ0EsQ0FxQ2xDQSxDQUFDQSxDQUFDQTtRQUVSQSxFQUFFQSxDQUFDQSxDQUFDQSxDQUFDQSxjQUFPQSxDQUFDQSxTQUFTQSxDQUFDQSxJQUFJQSxTQUFTQSxDQUFDQSxJQUFJQSxJQUFJQSxFQUFFQSxDQUFDQSxJQUFJQSxlQUFlQSxDQUFDQSxNQUFNQSxJQUFJQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTtZQUNoRkEsTUFBTUEsQ0FBQ0Esc0JBQWNBLENBQUNBLE9BQU9BLENBQUNBLElBQUlBLENBQUNBLGVBQWVBLENBQUNBLGVBQWVBLENBQUNBLENBQUNBLENBQUNBO1FBQ3ZFQSxDQUFDQTtRQUVEQSxNQUFNQSxDQUFDQSxzQkFBY0EsQ0FBQ0EsR0FBR0EsQ0FBQ0EsYUFBYUEsQ0FBQ0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsWUFBWUEsQ0FBQ0EsQ0FBQ0E7SUFDOURBLENBQUNBO0lBRU9MLDhDQUFzQkEsR0FBOUJBLFVBQStCQSxTQUFnQkEsRUFDaEJBLGtCQUFpQ0E7UUFEaEVNLGlCQVVDQTtRQVJDQSxJQUFJQSx5QkFBeUJBLEdBQWlDQSxFQUFFQSxDQUFDQTtRQUVqRUEsU0FBU0EsQ0FBQ0EsT0FBT0EsQ0FBQ0EsVUFBQ0EsTUFBV0E7WUFDNUJBLHlCQUF5QkEsQ0FBQ0EsTUFBTUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsR0FBR0EsSUFBSUEsbUNBQXFCQSxDQUM5REEsY0FBUUEsTUFBTUEsQ0FBQ0EsS0FBSUEsQ0FBQ0EsVUFBVUEsQ0FBQ0EsTUFBTUEsRUFBRUEsa0JBQWtCQSxFQUFFQSxJQUFJQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTtRQUMzRUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7UUFFSEEsTUFBTUEsQ0FBQ0EseUJBQXlCQSxDQUFDQTtJQUNuQ0EsQ0FBQ0E7SUFHRE47Ozs7OztPQU1HQTtJQUNIQSxnQ0FBUUEsR0FBUkEsVUFBU0EsVUFBaUJBLEVBQUVBLG9CQUFtQ0EsRUFBRUEsSUFBWUE7UUFBWk8sb0JBQVlBLEdBQVpBLFlBQVlBO1FBQzNFQSxJQUFJQSxvQkFBb0JBLEdBQUdBLHlCQUF5QkEsQ0FBQ0EsVUFBVUEsQ0FBQ0EsQ0FBQ0E7UUFFakVBLElBQUlBLEtBQUtBLEdBQUdBLHdCQUFXQSxDQUFDQSxLQUFLQSxDQUFDQSxvQkFBb0JBLENBQUNBLENBQUNBO1FBQ3BEQSxJQUFJQSxJQUFJQSxHQUFHQSx3QkFBV0EsQ0FBQ0EsS0FBS0EsQ0FBQ0Esb0JBQW9CQSxFQUFFQSxDQUFDQSxDQUFDQSxDQUFDQTtRQUV0REEsNEZBQTRGQTtRQUM1RkEsMEZBQTBGQTtRQUMxRkEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsS0FBS0EsSUFBSUEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7WUFDaEJBLG9CQUFvQkEsR0FBR0EsRUFBRUEsQ0FBQ0E7UUFDNUJBLENBQUNBO1FBQUNBLElBQUlBLENBQUNBLEVBQUVBLENBQUNBLENBQUNBLEtBQUtBLElBQUlBLElBQUlBLENBQUNBLENBQUNBLENBQUNBO1lBQ3pCQSxvRkFBb0ZBO1lBQ3BGQSxvQkFBb0JBLENBQUNBLEdBQUdBLEVBQUVBLENBQUNBO1lBQzNCQSxPQUFPQSx3QkFBV0EsQ0FBQ0EsS0FBS0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsSUFBSUEsSUFBSUEsRUFBRUEsQ0FBQ0E7Z0JBQ3ZDQSxJQUFJQSxHQUFHQSx3QkFBV0EsQ0FBQ0EsS0FBS0EsQ0FBQ0EsSUFBSUEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7Z0JBQ2xDQSxvQkFBb0JBLENBQUNBLEdBQUdBLEVBQUVBLENBQUNBO2dCQUMzQkEsRUFBRUEsQ0FBQ0EsQ0FBQ0Esb0JBQW9CQSxDQUFDQSxNQUFNQSxJQUFJQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTtvQkFDckNBLE1BQU1BLElBQUlBLDBCQUFhQSxDQUNuQkEsWUFBU0Esd0JBQVdBLENBQUNBLE1BQU1BLENBQUNBLFVBQVVBLENBQUNBLHNDQUFnQ0EsQ0FBQ0EsQ0FBQ0E7Z0JBQy9FQSxDQUFDQTtZQUNIQSxDQUFDQTtRQUNIQSxDQUFDQTtRQUFDQSxJQUFJQSxDQUFDQSxFQUFFQSxDQUFDQSxDQUFDQSxLQUFLQSxJQUFJQSxHQUFHQSxDQUFDQSxDQUFDQSxDQUFDQTtZQUN4QkEsSUFBSUEsZUFBZUEsR0FBR0EsSUFBSUEsQ0FBQ0EsY0FBY0EsQ0FBQ0E7WUFDMUNBLElBQUlBLG9CQUFvQkEsR0FBR0EsSUFBSUEsQ0FBQ0E7WUFDaENBLEVBQUVBLENBQUNBLENBQUNBLG9CQUFvQkEsQ0FBQ0EsTUFBTUEsR0FBR0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7Z0JBQ3BDQSxlQUFlQTtvQkFDWEEsb0JBQW9CQSxDQUFDQSxvQkFBb0JBLENBQUNBLE1BQU1BLEdBQUdBLENBQUNBLENBQUNBLENBQUNBLFNBQVNBLENBQUNBLGFBQWFBLENBQUNBO2dCQUNsRkEsb0JBQW9CQTtvQkFDaEJBLG9CQUFvQkEsQ0FBQ0Esb0JBQW9CQSxDQUFDQSxNQUFNQSxHQUFHQSxDQUFDQSxDQUFDQSxDQUFDQSxTQUFTQSxDQUFDQSxhQUFhQSxDQUFDQTtZQUNwRkEsQ0FBQ0E7WUFBQ0EsSUFBSUEsQ0FBQ0EsRUFBRUEsQ0FBQ0EsQ0FBQ0Esb0JBQW9CQSxDQUFDQSxNQUFNQSxJQUFJQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTtnQkFDNUNBLGVBQWVBLEdBQUdBLG9CQUFvQkEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsU0FBU0EsQ0FBQ0EsYUFBYUEsQ0FBQ0E7Z0JBQ2xFQSxvQkFBb0JBLEdBQUdBLElBQUlBLENBQUNBLGNBQWNBLENBQUNBO1lBQzdDQSxDQUFDQTtZQUVEQSxtRkFBbUZBO1lBQ25GQSxrRUFBa0VBO1lBQ2xFQSxJQUFJQSxnQkFBZ0JBLEdBQUdBLElBQUlBLENBQUNBLFFBQVFBLENBQUNBLEtBQUtBLEVBQUVBLGVBQWVBLENBQUNBLENBQUNBO1lBQzdEQSxJQUFJQSxpQkFBaUJBLEdBQ2pCQSxnQkFBU0EsQ0FBQ0Esb0JBQW9CQSxDQUFDQSxJQUFJQSxJQUFJQSxDQUFDQSxRQUFRQSxDQUFDQSxLQUFLQSxFQUFFQSxvQkFBb0JBLENBQUNBLENBQUNBO1lBRWxGQSxFQUFFQSxDQUFDQSxDQUFDQSxpQkFBaUJBLElBQUlBLGdCQUFnQkEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7Z0JBQzFDQSxJQUFJQSxHQUFHQSxHQUNIQSxZQUFTQSx3QkFBV0EsQ0FBQ0EsTUFBTUEsQ0FBQ0EsVUFBVUEsQ0FBQ0EsNERBQW9EQSxDQUFDQTtnQkFDaEdBLE1BQU1BLElBQUlBLDBCQUFhQSxDQUFDQSxHQUFHQSxDQUFDQSxDQUFDQTtZQUMvQkEsQ0FBQ0E7WUFDREEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsaUJBQWlCQSxDQUFDQSxDQUFDQSxDQUFDQTtnQkFDdEJBLG9CQUFvQkEsQ0FBQ0EsR0FBR0EsRUFBRUEsQ0FBQ0E7WUFDN0JBLENBQUNBO1lBQ0RBLElBQUlBLEdBQUdBLFVBQVVBLENBQUNBO1FBQ3BCQSxDQUFDQTtRQUVEQSxFQUFFQSxDQUFDQSxDQUFDQSxJQUFJQSxDQUFDQSxJQUFJQSxDQUFDQSxNQUFNQSxHQUFHQSxDQUFDQSxDQUFDQSxJQUFJQSxFQUFFQSxDQUFDQSxDQUFDQSxDQUFDQTtZQUNoQ0EsSUFBSUEsQ0FBQ0EsR0FBR0EsRUFBRUEsQ0FBQ0E7UUFDYkEsQ0FBQ0E7UUFFREEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsSUFBSUEsQ0FBQ0EsTUFBTUEsR0FBR0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7WUFDcEJBLElBQUlBLEdBQUdBLEdBQUdBLFlBQVNBLHdCQUFXQSxDQUFDQSxNQUFNQSxDQUFDQSxVQUFVQSxDQUFDQSxrQ0FBOEJBLENBQUNBO1lBQ2hGQSxNQUFNQSxJQUFJQSwwQkFBYUEsQ0FBQ0EsR0FBR0EsQ0FBQ0EsQ0FBQ0E7UUFDL0JBLENBQUNBO1FBRURBLElBQUlBLG9CQUFvQkEsR0FBR0EsSUFBSUEsQ0FBQ0EsU0FBU0EsQ0FBQ0EsSUFBSUEsRUFBRUEsb0JBQW9CQSxFQUFFQSxJQUFJQSxDQUFDQSxDQUFDQTtRQUU1RUEsR0FBR0EsQ0FBQ0EsQ0FBQ0EsR0FBR0EsQ0FBQ0EsQ0FBQ0EsR0FBR0Esb0JBQW9CQSxDQUFDQSxNQUFNQSxHQUFHQSxDQUFDQSxFQUFFQSxDQUFDQSxJQUFJQSxDQUFDQSxFQUFFQSxDQUFDQSxFQUFFQSxFQUFFQSxDQUFDQTtZQUMxREEsSUFBSUEsbUJBQW1CQSxHQUFHQSxvQkFBb0JBLENBQUNBLENBQUNBLENBQUNBLENBQUNBO1lBQ2xEQSxvQkFBb0JBLEdBQUdBLG1CQUFtQkEsQ0FBQ0EsWUFBWUEsQ0FBQ0Esb0JBQW9CQSxDQUFDQSxDQUFDQTtRQUNoRkEsQ0FBQ0E7UUFFREEsTUFBTUEsQ0FBQ0Esb0JBQW9CQSxDQUFDQTtJQUM5QkEsQ0FBQ0E7SUFHRFA7O09BRUdBO0lBQ0tBLGlDQUFTQSxHQUFqQkEsVUFBa0JBLFVBQWlCQSxFQUFFQSxvQkFBbUNBLEVBQ3REQSxJQUFZQTtRQUQ5QlEsaUJBNEZDQTtRQTNGaUJBLG9CQUFZQSxHQUFaQSxZQUFZQTtRQUM1QkEsSUFBSUEsZUFBZUEsR0FDZkEsb0JBQW9CQSxDQUFDQSxNQUFNQSxHQUFHQSxDQUFDQTtZQUMzQkEsb0JBQW9CQSxDQUFDQSxvQkFBb0JBLENBQUNBLE1BQU1BLEdBQUdBLENBQUNBLENBQUNBLENBQUNBLFNBQVNBLENBQUNBLGFBQWFBO1lBQzdFQSxJQUFJQSxDQUFDQSxjQUFjQSxDQUFDQTtRQUc1QkEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsVUFBVUEsQ0FBQ0EsTUFBTUEsSUFBSUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7WUFDM0JBLE1BQU1BLENBQUNBLElBQUlBLENBQUNBLGVBQWVBLENBQUNBLGVBQWVBLENBQUNBLENBQUNBO1FBQy9DQSxDQUFDQTtRQUNEQSxJQUFJQSxTQUFTQSxHQUFHQSxDQUFDQSxDQUFDQTtRQUNsQkEsSUFBSUEsU0FBU0EsR0FBR0EsVUFBVUEsQ0FBQ0EsU0FBU0EsQ0FBQ0EsQ0FBQ0E7UUFFdENBLEVBQUVBLENBQUNBLENBQUNBLENBQUNBLGVBQVFBLENBQUNBLFNBQVNBLENBQUNBLENBQUNBLENBQUNBLENBQUNBO1lBQ3pCQSxNQUFNQSxJQUFJQSwwQkFBYUEsQ0FBQ0EsMEJBQXVCQSxTQUFTQSx1Q0FBbUNBLENBQUNBLENBQUNBO1FBQy9GQSxDQUFDQTtRQUFDQSxJQUFJQSxDQUFDQSxFQUFFQSxDQUFDQSxDQUFDQSxTQUFTQSxJQUFJQSxFQUFFQSxJQUFJQSxTQUFTQSxJQUFJQSxHQUFHQSxJQUFJQSxTQUFTQSxJQUFJQSxJQUFJQSxDQUFDQSxDQUFDQSxDQUFDQTtZQUNwRUEsTUFBTUEsSUFBSUEsMEJBQWFBLENBQUNBLE9BQUlBLFNBQVNBLHdEQUFvREEsQ0FBQ0EsQ0FBQ0E7UUFDN0ZBLENBQUNBO1FBRURBLElBQUlBLE1BQU1BLEdBQUdBLEVBQUVBLENBQUNBO1FBQ2hCQSxFQUFFQSxDQUFDQSxDQUFDQSxTQUFTQSxHQUFHQSxDQUFDQSxHQUFHQSxVQUFVQSxDQUFDQSxNQUFNQSxDQUFDQSxDQUFDQSxDQUFDQTtZQUN0Q0EsSUFBSUEsYUFBV0EsR0FBR0EsVUFBVUEsQ0FBQ0EsU0FBU0EsR0FBR0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7WUFDNUNBLEVBQUVBLENBQUNBLENBQUNBLGtCQUFXQSxDQUFDQSxhQUFXQSxDQUFDQSxJQUFJQSxDQUFDQSxjQUFPQSxDQUFDQSxhQUFXQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTtnQkFDdERBLE1BQU1BLEdBQUdBLGFBQVdBLENBQUNBO2dCQUNyQkEsU0FBU0EsSUFBSUEsQ0FBQ0EsQ0FBQ0E7WUFDakJBLENBQUNBO1FBQ0hBLENBQUNBO1FBRURBLElBQUlBLGVBQWVBLEdBQWlDQSxFQUFFQSxDQUFDQTtRQUN2REEsSUFBSUEsV0FBV0EsQ0FBQ0E7UUFDaEJBLE9BQU9BLFNBQVNBLEdBQUdBLENBQUNBLEdBQUdBLFVBQVVBLENBQUNBLE1BQU1BLElBQUlBLGNBQU9BLENBQUNBLFdBQVdBLEdBQUdBLFVBQVVBLENBQUNBLFNBQVNBLEdBQUdBLENBQUNBLENBQUNBLENBQUNBLEVBQUVBLENBQUNBO1lBQzdGQSxJQUFJQSxvQkFBb0JBLEdBQUdBLG9CQUFvQkEsQ0FBQ0EsTUFBTUEsR0FBR0EsQ0FBQ0E7Z0JBQzNCQSxDQUFDQSxvQkFBb0JBLENBQUNBLG9CQUFvQkEsQ0FBQ0EsTUFBTUEsR0FBR0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7Z0JBQ3ZEQSxFQUFFQSxDQUFDQTtZQUNsQ0EsSUFBSUEsY0FBY0EsR0FBR0EsSUFBSUEsQ0FBQ0EsU0FBU0EsQ0FBQ0EsV0FBV0EsRUFBRUEsb0JBQW9CQSxFQUFFQSxJQUFJQSxDQUFDQSxDQUFDQTtZQUU3RUEsK0VBQStFQTtZQUMvRUEsZUFBZUEsQ0FBQ0EsY0FBY0EsQ0FBQ0EsU0FBU0EsQ0FBQ0EsT0FBT0EsQ0FBQ0EsR0FBR0EsY0FBY0EsQ0FBQ0E7WUFDbkVBLFNBQVNBLElBQUlBLENBQUNBLENBQUNBO1FBQ2pCQSxDQUFDQTtRQUVEQSxJQUFJQSxtQkFBbUJBLEdBQUdBLElBQUlBLENBQUNBLE1BQU1BLENBQUNBLEdBQUdBLENBQUNBLGVBQWVBLENBQUNBLENBQUNBO1FBQzNEQSxFQUFFQSxDQUFDQSxDQUFDQSxjQUFPQSxDQUFDQSxtQkFBbUJBLENBQUNBLENBQUNBLENBQUNBLENBQUNBO1lBQ2pDQSxNQUFNQSxJQUFJQSwwQkFBYUEsQ0FDbkJBLGlCQUFjQSw4QkFBdUJBLENBQUNBLGVBQWVBLENBQUNBLDRCQUF3QkEsQ0FBQ0EsQ0FBQ0E7UUFDdEZBLENBQUNBO1FBRURBLElBQUlBLGVBQWVBLEdBQ2ZBLENBQUNBLElBQUlBLEdBQUdBLG1CQUFtQkEsQ0FBQ0EsUUFBUUEsR0FBR0EsbUJBQW1CQSxDQUFDQSxLQUFLQSxDQUFDQSxDQUFDQSxHQUFHQSxDQUFDQSxTQUFTQSxDQUFDQSxDQUFDQTtRQUVyRkEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsZ0JBQVNBLENBQUNBLGVBQWVBLENBQUNBLENBQUNBLENBQUNBLENBQUNBO1lBQ2hDQSxNQUFNQSxJQUFJQSwwQkFBYUEsQ0FDbkJBLGlCQUFjQSw4QkFBdUJBLENBQUNBLGVBQWVBLENBQUNBLGdDQUF5QkEsU0FBU0EsUUFBSUEsQ0FBQ0EsQ0FBQ0E7UUFDcEdBLENBQUNBO1FBRURBLEVBQUVBLENBQUNBLENBQUNBLENBQUNBLGdCQUFTQSxDQUFDQSxlQUFlQSxDQUFDQSxPQUFPQSxDQUFDQSxhQUFhQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTtZQUN0REEsSUFBSUEsZUFBZUEsR0FBR0EsZUFBZUEsQ0FBQ0EsMkJBQTJCQSxDQUFDQSxNQUFNQSxDQUFDQSxDQUFDQTtZQUMxRUEsTUFBTUEsQ0FBQ0EsSUFBSUEsbUNBQXFCQSxDQUFDQTtnQkFDL0JBLE1BQU1BLENBQUNBLGVBQWVBLENBQUNBLE9BQU9BLENBQUNBLG9CQUFvQkEsRUFBRUEsQ0FBQ0EsSUFBSUEsQ0FDdERBLFVBQUNBLENBQUNBLElBQU9BLE1BQU1BLENBQUNBLEtBQUlBLENBQUNBLFNBQVNBLENBQUNBLFVBQVVBLEVBQUVBLG9CQUFvQkEsRUFBRUEsSUFBSUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7WUFDakZBLENBQUNBLEVBQUVBLGVBQWVBLENBQUNBLFNBQVNBLENBQUNBLEVBQUVBLGVBQWVBLENBQUNBLFdBQVdBLENBQUNBLENBQUNBLENBQUNBO1FBQy9EQSxDQUFDQTtRQUVEQSxJQUFJQSxvQkFBb0JBLEdBQUdBLElBQUlBLEdBQUdBLG1CQUFtQkEsQ0FBQ0EsaUJBQWlCQSxDQUFDQSxTQUFTQSxFQUFFQSxNQUFNQSxDQUFDQTtZQUN4REEsbUJBQW1CQSxDQUFDQSxRQUFRQSxDQUFDQSxTQUFTQSxFQUFFQSxNQUFNQSxDQUFDQSxDQUFDQTtRQUlsRkEsSUFBSUEsU0FBU0EsR0FBR0EsVUFBVUEsQ0FBQ0EsS0FBS0EsQ0FBQ0EsU0FBU0EsR0FBR0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7UUFFaERBLElBQUlBLFdBQVdBLEdBQUdBLElBQUlBLGlDQUFtQkEsQ0FBQ0Esb0JBQW9CQSxFQUFFQSxJQUFJQSxFQUFFQSxlQUFlQSxDQUFDQSxDQUFDQTtRQUV2RkEsd0JBQXdCQTtRQUN4QkEsRUFBRUEsQ0FBQ0EsQ0FBQ0EsZ0JBQVNBLENBQUNBLG9CQUFvQkEsQ0FBQ0EsYUFBYUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7WUFDbERBLElBQUlBLGdCQUFnQkEsR0FBZ0JBLElBQUlBLENBQUNBO1lBQ3pDQSxFQUFFQSxDQUFDQSxDQUFDQSxTQUFTQSxHQUFHQSxDQUFDQSxHQUFHQSxVQUFVQSxDQUFDQSxNQUFNQSxDQUFDQSxDQUFDQSxDQUFDQTtnQkFDdENBLElBQUlBLHVCQUF1QkEsR0FBR0Esb0JBQW9CQSxDQUFDQSxNQUFNQSxDQUFDQSxDQUFDQSxXQUFXQSxDQUFDQSxDQUFDQSxDQUFDQTtnQkFDekVBLGdCQUFnQkEsR0FBR0EsSUFBSUEsQ0FBQ0EsU0FBU0EsQ0FBQ0EsU0FBU0EsRUFBRUEsdUJBQXVCQSxDQUFDQSxDQUFDQTtZQUN4RUEsQ0FBQ0E7WUFBQ0EsSUFBSUEsQ0FBQ0EsRUFBRUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0Esb0JBQW9CQSxDQUFDQSxRQUFRQSxDQUFDQSxDQUFDQSxDQUFDQTtnQkFDMUNBLHdCQUF3QkE7Z0JBQ3hCQSxnQkFBZ0JBLEdBQUdBLElBQUlBLENBQUNBLGVBQWVBLENBQUNBLG9CQUFvQkEsQ0FBQ0EsYUFBYUEsQ0FBQ0EsQ0FBQ0E7Z0JBRTVFQSxFQUFFQSxDQUFDQSxDQUFDQSxjQUFPQSxDQUFDQSxnQkFBZ0JBLENBQUNBLENBQUNBLENBQUNBLENBQUNBO29CQUM5QkEsTUFBTUEsSUFBSUEsMEJBQWFBLENBQ25CQSxZQUFTQSx3QkFBV0EsQ0FBQ0EsTUFBTUEsQ0FBQ0EsVUFBVUEsQ0FBQ0EsbURBQStDQSxDQUFDQSxDQUFDQTtnQkFDOUZBLENBQUNBO1lBQ0hBLENBQUNBO1lBQ0RBLFdBQVdBLENBQUNBLEtBQUtBLEdBQUdBLGdCQUFnQkEsQ0FBQ0E7UUFDdkNBLENBQUNBO1FBRURBLE1BQU1BLENBQUNBLFdBQVdBLENBQUNBO0lBQ3JCQSxDQUFDQTtJQUVNUixnQ0FBUUEsR0FBZkEsVUFBZ0JBLElBQVlBLEVBQUVBLGVBQW9CQTtRQUNoRFMsSUFBSUEsbUJBQW1CQSxHQUF3QkEsSUFBSUEsQ0FBQ0EsTUFBTUEsQ0FBQ0EsR0FBR0EsQ0FBQ0EsZUFBZUEsQ0FBQ0EsQ0FBQ0E7UUFDaEZBLEVBQUVBLENBQUNBLENBQUNBLGNBQU9BLENBQUNBLG1CQUFtQkEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7WUFDakNBLE1BQU1BLENBQUNBLEtBQUtBLENBQUNBO1FBQ2ZBLENBQUNBO1FBQ0RBLE1BQU1BLENBQUNBLG1CQUFtQkEsQ0FBQ0EsUUFBUUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsQ0FBQ0E7SUFDNUNBLENBQUNBO0lBRU1ULHVDQUFlQSxHQUF0QkEsVUFBdUJBLGVBQXFCQTtRQUE1Q1UsaUJBd0JDQTtRQXZCQ0EsRUFBRUEsQ0FBQ0EsQ0FBQ0EsY0FBT0EsQ0FBQ0EsZUFBZUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7WUFDN0JBLE1BQU1BLENBQUNBLElBQUlBLENBQUNBO1FBQ2RBLENBQUNBO1FBRURBLElBQUlBLG1CQUFtQkEsR0FBR0EsSUFBSUEsQ0FBQ0EsTUFBTUEsQ0FBQ0EsR0FBR0EsQ0FBQ0EsZUFBZUEsQ0FBQ0EsQ0FBQ0E7UUFDM0RBLEVBQUVBLENBQUNBLENBQUNBLGNBQU9BLENBQUNBLG1CQUFtQkEsQ0FBQ0EsSUFBSUEsY0FBT0EsQ0FBQ0EsbUJBQW1CQSxDQUFDQSxZQUFZQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTtZQUM5RUEsTUFBTUEsQ0FBQ0EsSUFBSUEsQ0FBQ0E7UUFDZEEsQ0FBQ0E7UUFHREEsSUFBSUEsWUFBWUEsR0FBR0EsSUFBSUEsQ0FBQ0E7UUFDeEJBLEVBQUVBLENBQUNBLENBQUNBLGdCQUFTQSxDQUFDQSxtQkFBbUJBLENBQUNBLFlBQVlBLENBQUNBLE9BQU9BLENBQUNBLGFBQWFBLENBQUNBLENBQUNBLENBQUNBLENBQUNBO1lBQ3RFQSxJQUFJQSxvQkFBb0JBLEdBQUdBLG1CQUFtQkEsQ0FBQ0EsWUFBWUEsQ0FBQ0EsUUFBUUEsQ0FBQ0EsRUFBRUEsQ0FBQ0EsQ0FBQ0E7WUFDekVBLEVBQUVBLENBQUNBLENBQUNBLENBQUNBLG1CQUFtQkEsQ0FBQ0EsWUFB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QSxDQUFDQTtRQUNIQSxDQUFDQTtJQUNIQSxDQUFDQTtBQUNIQSxDQUFDQSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7TGlzdFdyYXBwZXIsIE1hcCwgTWFwV3JhcHBlciwgU3RyaW5nTWFwV3JhcHBlcn0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9jb2xsZWN0aW9uJztcbmltcG9ydCB7UHJvbWlzZSwgUHJvbWlzZVdyYXBwZXJ9IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvYXN5bmMnO1xuaW1wb3J0IHtcbiAgaXNQcmVzZW50LFxuICBpc0FycmF5LFxuICBpc0JsYW5rLFxuICBpc1R5cGUsXG4gIGlzU3RyaW5nLFxuICBpc1N0cmluZ01hcCxcbiAgVHlwZSxcbiAgZ2V0VHlwZU5hbWVGb3JEZWJ1Z2dpbmcsXG4gIENPTlNUX0VYUFJcbn0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9sYW5nJztcbmltcG9ydCB7QmFzZUV4Y2VwdGlvbiwgV3JhcHBlZEV4Y2VwdGlvbn0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9leGNlcHRpb25zJztcbmltcG9ydCB7cmVmbGVjdG9yfSBmcm9tICdhbmd1bGFyMi9zcmMvY29yZS9yZWZsZWN0aW9uL3JlZmxlY3Rpb24nO1xuaW1wb3J0IHtJbmplY3RhYmxlLCBJbmplY3QsIE9wYXF1ZVRva2VufSBmcm9tICdhbmd1bGFyMi9jb3JlJztcblxuaW1wb3J0IHtcbiAgUm91dGVDb25maWcsXG4gIEFzeW5jUm91dGUsXG4gIFJvdXRlLFxuICBBdXhSb3V0ZSxcbiAgUmVkaXJlY3QsXG4gIFJvdXRlRGVmaW5pdGlvblxufSBmcm9tICcuL3JvdXRlX2NvbmZpZ19pbXBsJztcbmltcG9ydCB7UGF0aE1hdGNoLCBSZWRpcmVjdE1hdGNoLCBSb3V0ZU1hdGNofSBmcm9tICcuL3JvdXRlX3JlY29nbml6ZXInO1xuaW1wb3J0IHtDb21wb25lbnRSZWNvZ25pemVyfSBmcm9tICcuL2NvbXBvbmVudF9yZWNvZ25pemVyJztcbmltcG9ydCB7XG4gIEluc3RydWN0aW9uLFxuICBSZXNvbHZlZEluc3RydWN0aW9uLFxuICBSZWRpcmVjdEluc3RydWN0aW9uLFxuICBVbnJlc29sdmVkSW5zdHJ1Y3Rpb24sXG4gIERlZmF1bHRJbnN0cnVjdGlvblxufSBmcm9tICcuL2luc3RydWN0aW9uJztcblxuaW1wb3J0IHtub3JtYWxpemVSb3V0ZUNvbmZpZywgYXNzZXJ0Q29tcG9uZW50RXhpc3RzfSBmcm9tICcuL3JvdXRlX2NvbmZpZ19ub21hbGl6ZXInO1xuaW1wb3J0IHtwYXJzZXIsIFVybCwgcGF0aFNlZ21lbnRzVG9Vcmx9IGZyb20gJy4vdXJsX3BhcnNlcic7XG5cbnZhciBfcmVzb2x2ZVRvTnVsbCA9IFByb21pc2VXcmFwcGVyLnJlc29sdmUobnVsbCk7XG5cblxuXG4vKipcbiAqIFRva2VuIHVzZWQgdG8gYmluZCB0aGUgY29tcG9uZW50IHdpdGggdGhlIHRvcC1sZXZlbCB7QGxpbmsgUm91dGVDb25maWd9cyBmb3IgdGhlXG4gKiBhcHBsaWNhdGlvbi5cbiAqXG4gKiAjIyMgRXhhbXBsZSAoW2xpdmUgZGVtb10oaHR0cDovL3BsbmtyLmNvL2VkaXQvaVJVUDhCNU9VYnhDV1EzQWNJRG0pKVxuICpcbiAqIGBgYFxuICogaW1wb3J0IHtDb21wb25lbnR9IGZyb20gJ2FuZ3VsYXIyL2NvcmUnO1xuICogaW1wb3J0IHtcbiAqICAgUk9VVEVSX0RJUkVDVElWRVMsXG4gKiAgIFJPVVRFUl9QUk9WSURFUlMsXG4gKiAgIFJvdXRlQ29uZmlnXG4gKiB9IGZyb20gJ2FuZ3VsYXIyL3JvdXRlcic7XG4gKlxuICogQENvbXBvbmVudCh7ZGlyZWN0aXZlczogW1JPVVRFUl9ESVJFQ1RJVkVTXX0pXG4gKiBAUm91dGVDb25maWcoW1xuICogIHsuLi59LFxuICogXSlcbiAqIGNsYXNzIEFwcENtcCB7XG4gKiAgIC8vIC4uLlxuICogfVxuICpcbiAqIGJvb3RzdHJhcChBcHBDbXAsIFtST1VURVJfUFJPVklERVJTXSk7XG4gKiBgYGBcbiAqL1xuZXhwb3J0IGNvbnN0IFJPVVRFUl9QUklNQVJZX0NPTVBPTkVOVDogT3BhcXVlVG9rZW4gPVxuICAgIENPTlNUX0VYUFIobmV3IE9wYXF1ZVRva2VuKCdSb3V0ZXJQcmltYXJ5Q29tcG9uZW50JykpO1xuXG5cbi8qKlxuICogVGhlIFJvdXRlUmVnaXN0cnkgaG9sZHMgcm91dGUgY29uZmlndXJhdGlvbnMgZm9yIGVhY2ggY29tcG9uZW50IGluIGFuIEFuZ3VsYXIgYXBwLlxuICogSXQgaXMgcmVzcG9uc2libGUgZm9yIGNyZWF0aW5nIEluc3RydWN0aW9ucyBmcm9tIFVSTHMsIGFuZCBnZW5lcmF0aW5nIFVSTHMgYmFzZWQgb24gcm91dGUgYW5kXG4gKiBwYXJhbWV0ZXJzLlxuICovXG5ASW5qZWN0YWJsZSgpXG5leHBvcnQgY2xhc3MgUm91dGVSZWdpc3RyeSB7XG4gIHByaXZhdGUgX3J1bGVzID0gbmV3IE1hcDxhbnksIENvbXBvbmVudFJlY29nbml6ZXI+KCk7XG5cbiAgY29uc3RydWN0b3IoQEluamVjdChST1VURVJfUFJJTUFSWV9DT01QT05FTlQpIHByaXZhdGUgX3Jvb3RDb21wb25lbnQ6IFR5cGUpIHt9XG5cbiAgLyoqXG4gICAqIEdpdmVuIGEgY29tcG9uZW50IGFuZCBhIGNvbmZpZ3VyYXRpb24gb2JqZWN0LCBhZGQgdGhlIHJvdXRlIHRvIHRoaXMgcmVnaXN0cnlcbiAgICovXG4gIGNvbmZpZyhwYXJlbnRDb21wb25lbnQ6IGFueSwgY29uZmlnOiBSb3V0ZURlZmluaXRpb24pOiB2b2lkIHtcbiAgICBjb25maWcgPSBub3JtYWxpemVSb3V0ZUNvbmZpZyhjb25maWcsIHRoaXMpO1xuXG4gICAgLy8gdGhpcyBpcyBoZXJlIGJlY2F1c2UgRGFydCB0eXBlIGd1YXJkIHJlYXNvbnNcbiAgICBpZiAoY29uZmlnIGluc3RhbmNlb2YgUm91dGUpIHtcbiAgICAgIGFzc2VydENvbXBvbmVudEV4aXN0cyhjb25maWcuY29tcG9uZW50LCBjb25maWcucGF0aCk7XG4gICAgfSBlbHNlIGlmIChjb25maWcgaW5zdGFuY2VvZiBBdXhSb3V0ZSkge1xuICAgICAgYXNzZXJ0Q29tcG9uZW50RXhpc3RzKGNvbmZpZy5jb21wb25lbnQsIGNvbmZpZy5wYXRoKTtcbiAgICB9XG5cbiAgICB2YXIgcmVjb2duaXplcjogQ29tcG9uZW50UmVjb2duaXplciA9IHRoaXMuX3J1bGVzLmdldChwYXJlbnRDb21wb25lbnQpO1xuXG4gICAgaWYgKGlzQmxhbmsocmVjb2duaXplcikpIHtcbiAgICAgIHJlY29nbml6ZXIgPSBuZXcgQ29tcG9uZW50UmVjb2duaXplcigpO1xuICAgICAgdGhpcy5fcnVsZXMuc2V0KHBhcmVudENvbXBvbmVudCwgcmVjb2duaXplcik7XG4gICAgfVxuXG4gICAgdmFyIHRlcm1pbmFsID0gcmVjb2duaXplci5jb25maWcoY29uZmlnKTtcblxuICAgIGlmIChjb25maWcgaW5zdGFuY2VvZiBSb3V0ZSkge1xuICAgICAgaWYgKHRlcm1pbmFsKSB7XG4gICAgICAgIGFzc2VydFRlcm1pbmFsQ29tcG9uZW50KGNvbmZpZy5jb21wb25lbnQsIGNvbmZpZy5wYXRoKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMuY29uZmlnRnJvbUNvbXBvbmVudChjb25maWcuY29tcG9uZW50KTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogUmVhZHMgdGhlIGFubm90YXRpb25zIG9mIGEgY29tcG9uZW50IGFuZCBjb25maWd1cmVzIHRoZSByZWdpc3RyeSBiYXNlZCBvbiB0aGVtXG4gICAqL1xuICBjb25maWdGcm9tQ29tcG9uZW50KGNvbXBvbmVudDogYW55KTogdm9pZCB7XG4gICAgaWYgKCFpc1R5cGUoY29tcG9uZW50KSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIC8vIERvbid0IHJlYWQgdGhlIGFubm90YXRpb25zIGZyb20gYSB0eXBlIG1vcmUgdGhhbiBvbmNlIOKAk1xuICAgIC8vIHRoaXMgcHJldmVudHMgYW4gaW5maW5pdGUgbG9vcCBpZiBhIGNvbXBvbmVudCByb3V0ZXMgcmVjdXJzaXZlbHkuXG4gICAgaWYgKHRoaXMuX3J1bGVzLmhhcyhjb21wb25lbnQpKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIHZhciBhbm5vdGF0aW9ucyA9IHJlZmxlY3Rvci5hbm5vdGF0aW9ucyhjb21wb25lbnQpO1xuICAgIGlmIChpc1ByZXNlbnQoYW5ub3RhdGlvbnMpKSB7XG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGFubm90YXRpb25zLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIHZhciBhbm5vdGF0aW9uID0gYW5ub3RhdGlvbnNbaV07XG5cbiAgICAgICAgaWYgKGFubm90YXRpb24gaW5zdGFuY2VvZiBSb3V0ZUNvbmZpZykge1xuICAgICAgICAgIGxldCByb3V0ZUNmZ3M6IFJvdXRlRGVmaW5pdGlvbltdID0gYW5ub3RhdGlvbi5jb25maWdzO1xuICAgICAgICAgIHJvdXRlQ2Zncy5mb3JFYWNoKGNvbmZpZyA9PiB0aGlzLmNvbmZpZyhjb21wb25lbnQsIGNvbmZpZykpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9XG5cblxuICAvKipcbiAgICogR2l2ZW4gYSBVUkwgYW5kIGEgcGFyZW50IGNvbXBvbmVudCwgcmV0dXJuIHRoZSBtb3N0IHNwZWNpZmljIGluc3RydWN0aW9uIGZvciBuYXZpZ2F0aW5nXG4gICAqIHRoZSBhcHBsaWNhdGlvbiBpbnRvIHRoZSBzdGF0ZSBzcGVjaWZpZWQgYnkgdGhlIHVybFxuICAgKi9cbiAgcmVjb2duaXplKHVybDogc3RyaW5nLCBhbmNlc3Rvckluc3RydWN0aW9uczogSW5zdHJ1Y3Rpb25bXSk6IFByb21pc2U8SW5zdHJ1Y3Rpb24+IHtcbiAgICB2YXIgcGFyc2VkVXJsID0gcGFyc2VyLnBhcnNlKHVybCk7XG4gICAgcmV0dXJuIHRoaXMuX3JlY29nbml6ZShwYXJzZWRVcmwsIGFuY2VzdG9ySW5zdHJ1Y3Rpb25zKTtcbiAgfVxuXG5cbiAgLyoqXG4gICAqIFJlY29nbml6ZXMgYWxsIHBhcmVudC1jaGlsZCByb3V0ZXMsIGJ1dCBjcmVhdGVzIHVucmVzb2x2ZWQgYXV4aWxpYXJ5IHJvdXRlc1xuICAgKi9cblxuICBwcml2YXRlIF9yZWNvZ25pemUocGFyc2VkVXJsOiBVcmwsIGFuY2VzdG9ySW5zdHJ1Y3Rpb25zOiBJbnN0cnVjdGlvbltdLFxuICAgICAgICAgICAgICAgICAgICAgX2F1eCA9IGZhbHNlKTogUHJvbWlzZTxJbnN0cnVjdGlvbj4ge1xuICAgIHZhciBwYXJlbnRDb21wb25lbnQgPVxuICAgICAgICBhbmNlc3Rvckluc3RydWN0aW9ucy5sZW5ndGggPiAwID9cbiAgICAgICAgICAgIGFuY2VzdG9ySW5zdHJ1Y3Rpb25zW2FuY2VzdG9ySW5zdHJ1Y3Rpb25zLmxlbmd0aCAtIDFdLmNvbXBvbmVudC5jb21wb25lbnRUeXBlIDpcbiAgICAgICAgICAgIHRoaXMuX3Jvb3RDb21wb25lbnQ7XG5cbiAgICB2YXIgY29tcG9uZW50UmVjb2duaXplciA9IHRoaXMuX3J1bGVzLmdldChwYXJlbnRDb21wb25lbnQpO1xuICAgIGlmIChpc0JsYW5rKGNvbXBvbmVudFJlY29nbml6ZXIpKSB7XG4gICAgICByZXR1cm4gX3Jlc29sdmVUb051bGw7XG4gICAgfVxuXG4gICAgLy8gTWF0Y2hlcyBzb21lIGJlZ2lubmluZyBwYXJ0IG9mIHRoZSBnaXZlbiBVUkxcbiAgICB2YXIgcG9zc2libGVNYXRjaGVzOiBQcm9taXNlPFJvdXRlTWF0Y2g+W10gPVxuICAgICAgICBfYXV4ID8gY29tcG9uZW50UmVjb2duaXplci5yZWNvZ25pemVBdXhpbGlhcnkocGFyc2VkVXJsKSA6XG4gICAgICAgICAgICAgICBjb21wb25lbnRSZWNvZ25pemVyLnJlY29nbml6ZShwYXJzZWRVcmwpO1xuXG4gICAgdmFyIG1hdGNoUHJvbWlzZXM6IFByb21pc2U8SW5zdHJ1Y3Rpb24+W10gPSBwb3NzaWJsZU1hdGNoZXMubWFwKFxuICAgICAgICAoY2FuZGlkYXRlOiBQcm9taXNlPFJvdXRlTWF0Y2g+KSA9PiBjYW5kaWRhdGUudGhlbigoY2FuZGlkYXRlOiBSb3V0ZU1hdGNoKSA9PiB7XG5cbiAgICAgICAgICBpZiAoY2FuZGlkYXRlIGluc3RhbmNlb2YgUGF0aE1hdGNoKSB7XG4gICAgICAgICAgICB2YXIgYXV4UGFyZW50SW5zdHJ1Y3Rpb25zID1cbiAgICAgICAgICAgICAgICBhbmNlc3Rvckluc3RydWN0aW9ucy5sZW5ndGggPiAwID9cbiAgICAgICAgICAgICAgICAgICAgW2FuY2VzdG9ySW5zdHJ1Y3Rpb25zW2FuY2VzdG9ySW5zdHJ1Y3Rpb25zLmxlbmd0aCAtIDFdXSA6XG4gICAgICAgICAgICAgICAgICAgIFtdO1xuICAgICAgICAgICAgdmFyIGF1eEluc3RydWN0aW9ucyA9XG4gICAgICAgICAgICAgICAgdGhpcy5fYXV4Um91dGVzVG9VbnJlc29sdmVkKGNhbmRpZGF0ZS5yZW1haW5pbmdBdXgsIGF1eFBhcmVudEluc3RydWN0aW9ucyk7XG4gICAgICAgICAgICB2YXIgaW5zdHJ1Y3Rpb24gPSBuZXcgUmVzb2x2ZWRJbnN0cnVjdGlvbihjYW5kaWRhdGUuaW5zdHJ1Y3Rpb24sIG51bGwsIGF1eEluc3RydWN0aW9ucyk7XG5cbiAgICAgICAgICAgIGlmIChjYW5kaWRhdGUuaW5zdHJ1Y3Rpb24udGVybWluYWwpIHtcbiAgICAgICAgICAgICAgcmV0dXJuIGluc3RydWN0aW9uO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB2YXIgbmV3QW5jZXN0b3JDb21wb25lbnRzID0gYW5jZXN0b3JJbnN0cnVjdGlvbnMuY29uY2F0KFtpbnN0cnVjdGlvbl0pO1xuXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5fcmVjb2duaXplKGNhbmRpZGF0ZS5yZW1haW5pbmcsIG5ld0FuY2VzdG9yQ29tcG9uZW50cylcbiAgICAgICAgICAgICAgICAudGhlbigoY2hpbGRJbnN0cnVjdGlvbikgPT4ge1xuICAgICAgICAgICAgICAgICAgaWYgKGlzQmxhbmsoY2hpbGRJbnN0cnVjdGlvbikpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgIC8vIHJlZGlyZWN0IGluc3RydWN0aW9ucyBhcmUgYWxyZWFkeSBhYnNvbHV0ZVxuICAgICAgICAgICAgICAgICAgaWYgKGNoaWxkSW5zdHJ1Y3Rpb24gaW5zdGFuY2VvZiBSZWRpcmVjdEluc3RydWN0aW9uKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBjaGlsZEluc3RydWN0aW9uO1xuICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgaW5zdHJ1Y3Rpb24uY2hpbGQgPSBjaGlsZEluc3RydWN0aW9uO1xuICAgICAgICAgICAgICAgICAgcmV0dXJuIGluc3RydWN0aW9uO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGlmIChjYW5kaWRhdGUgaW5zdGFuY2VvZiBSZWRpcmVjdE1hdGNoKSB7XG4gICAgICAgICAgICB2YXIgaW5zdHJ1Y3Rpb24gPSB0aGlzLmdlbmVyYXRlKGNhbmRpZGF0ZS5yZWRpcmVjdFRvLCBhbmNlc3Rvckluc3RydWN0aW9ucyk7XG4gICAgICAgICAgICByZXR1cm4gbmV3IFJlZGlyZWN0SW5zdHJ1Y3Rpb24oaW5zdHJ1Y3Rpb24uY29tcG9uZW50LCBpbnN0cnVjdGlvbi5jaGlsZCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpbnN0cnVjdGlvbi5hdXhJbnN0cnVjdGlvbik7XG4gICAgICAgICAgfVxuICAgICAgICB9KSk7XG5cbiAgICBpZiAoKGlzQmxhbmsocGFyc2VkVXJsKSB8fCBwYXJzZWRVcmwucGF0aCA9PSAnJykgJiYgcG9zc2libGVNYXRjaGVzLmxlbmd0aCA9PSAwKSB7XG4gICAgICByZXR1cm4gUHJvbWlzZVdyYXBwZXIucmVzb2x2ZSh0aGlzLmdlbmVyYXRlRGVmYXVsdChwYXJlbnRDb21wb25lbnQpKTtcbiAgICB9XG5cbiAgICByZXR1cm4gUHJvbWlzZVdyYXBwZXIuYWxsKG1hdGNoUHJvbWlzZXMpLnRoZW4obW9zdFNwZWNpZmljKTtcbiAgfVxuXG4gIHByaXZhdGUgX2F1eFJvdXRlc1RvVW5yZXNvbHZlZChhdXhSb3V0ZXM6IFVybFtdLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcGFyZW50SW5zdHJ1Y3Rpb25zOiBJbnN0cnVjdGlvbltdKToge1trZXk6IHN0cmluZ106IEluc3RydWN0aW9ufSB7XG4gICAgdmFyIHVucmVzb2x2ZWRBdXhJbnN0cnVjdGlvbnM6IHtba2V5OiBzdHJpbmddOiBJbnN0cnVjdGlvbn0gPSB7fTtcblxuICAgIGF1eFJvdXRlcy5mb3JFYWNoKChhdXhVcmw6IFVybCkgPT4ge1xuICAgICAgdW5yZXNvbHZlZEF1eEluc3RydWN0aW9uc1thdXhVcmwucGF0aF0gPSBuZXcgVW5yZXNvbHZlZEluc3RydWN0aW9uKFxuICAgICAgICAgICgpID0+IHsgcmV0dXJuIHRoaXMuX3JlY29nbml6ZShhdXhVcmwsIHBhcmVudEluc3RydWN0aW9ucywgdHJ1ZSk7IH0pO1xuICAgIH0pO1xuXG4gICAgcmV0dXJuIHVucmVzb2x2ZWRBdXhJbnN0cnVjdGlvbnM7XG4gIH1cblxuXG4gIC8qKlxuICAgKiBHaXZlbiBhIG5vcm1hbGl6ZWQgbGlzdCB3aXRoIGNvbXBvbmVudCBuYW1lcyBhbmQgcGFyYW1zIGxpa2U6IGBbJ3VzZXInLCB7aWQ6IDMgfV1gXG4gICAqIGdlbmVyYXRlcyBhIHVybCB3aXRoIGEgbGVhZGluZyBzbGFzaCByZWxhdGl2ZSB0byB0aGUgcHJvdmlkZWQgYHBhcmVudENvbXBvbmVudGAuXG4gICAqXG4gICAqIElmIHRoZSBvcHRpb25hbCBwYXJhbSBgX2F1eGAgaXMgYHRydWVgLCB0aGVuIHdlIGdlbmVyYXRlIHN0YXJ0aW5nIGF0IGFuIGF1eGlsaWFyeVxuICAgKiByb3V0ZSBib3VuZGFyeS5cbiAgICovXG4gIGdlbmVyYXRlKGxpbmtQYXJhbXM6IGFueVtdLCBhbmNlc3Rvckluc3RydWN0aW9uczogSW5zdHJ1Y3Rpb25bXSwgX2F1eCA9IGZhbHNlKTogSW5zdHJ1Y3Rpb24ge1xuICAgIGxldCBub3JtYWxpemVkTGlua1BhcmFtcyA9IHNwbGl0QW5kRmxhdHRlbkxpbmtQYXJhbXMobGlua1BhcmFtcyk7XG5cbiAgICB2YXIgZmlyc3QgPSBMaXN0V3JhcHBlci5maXJzdChub3JtYWxpemVkTGlua1BhcmFtcyk7XG4gICAgdmFyIHJlc3QgPSBMaXN0V3JhcHBlci5zbGljZShub3JtYWxpemVkTGlua1BhcmFtcywgMSk7XG5cbiAgICAvLyBUaGUgZmlyc3Qgc2VnbWVudCBzaG91bGQgYmUgZWl0aGVyICcuJyAoZ2VuZXJhdGUgZnJvbSBwYXJlbnQpIG9yICcnIChnZW5lcmF0ZSBmcm9tIHJvb3QpLlxuICAgIC8vIFdoZW4gd2Ugbm9ybWFsaXplIGFib3ZlLCB3ZSBzdHJpcCBhbGwgdGhlIHNsYXNoZXMsICcuLycgYmVjb21lcyAnLicgYW5kICcvJyBiZWNvbWVzICcnLlxuICAgIGlmIChmaXJzdCA9PSAnJykge1xuICAgICAgYW5jZXN0b3JJbnN0cnVjdGlvbnMgPSBbXTtcbiAgICB9IGVsc2UgaWYgKGZpcnN0ID09ICcuLicpIHtcbiAgICAgIC8vIHdlIGFscmVhZHkgY2FwdHVyZWQgdGhlIGZpcnN0IGluc3RhbmNlIG9mIFwiLi5cIiwgc28gd2UgbmVlZCB0byBwb3Agb2ZmIGFuIGFuY2VzdG9yXG4gICAgICBhbmNlc3Rvckluc3RydWN0aW9ucy5wb3AoKTtcbiAgICAgIHdoaWxlIChMaXN0V3JhcHBlci5maXJzdChyZXN0KSA9PSAnLi4nKSB7XG4gICAgICAgIHJlc3QgPSBMaXN0V3JhcHBlci5zbGljZShyZXN0LCAxKTtcbiAgICAgICAgYW5jZXN0b3JJbnN0cnVjdGlvbnMucG9wKCk7XG4gICAgICAgIGlmIChhbmNlc3Rvckluc3RydWN0aW9ucy5sZW5ndGggPD0gMCkge1xuICAgICAgICAgIHRocm93IG5ldyBCYXNlRXhjZXB0aW9uKFxuICAgICAgICAgICAgICBgTGluayBcIiR7TGlzdFdyYXBwZXIudG9KU09OKGxpbmtQYXJhbXMpfVwiIGhhcyB0b28gbWFueSBcIi4uL1wiIHNlZ21lbnRzLmApO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSBlbHNlIGlmIChmaXJzdCAhPSAnLicpIHtcbiAgICAgIGxldCBwYXJlbnRDb21wb25lbnQgPSB0aGlzLl9yb290Q29tcG9uZW50O1xuICAgICAgbGV0IGdyYW5kcGFyZW50Q29tcG9uZW50ID0gbnVsbDtcbiAgICAgIGlmIChhbmNlc3Rvckluc3RydWN0aW9ucy5sZW5ndGggPiAxKSB7XG4gICAgICAgIHBhcmVudENvbXBvbmVudCA9XG4gICAgICAgICAgICBhbmNlc3Rvckluc3RydWN0aW9uc1thbmNlc3Rvckluc3RydWN0aW9ucy5sZW5ndGggLSAxXS5jb21wb25lbnQuY29tcG9uZW50VHlwZTtcbiAgICAgICAgZ3JhbmRwYXJlbnRDb21wb25lbnQgPVxuICAgICAgICAgICAgYW5jZXN0b3JJbnN0cnVjdGlvbnNbYW5jZXN0b3JJbnN0cnVjdGlvbnMubGVuZ3RoIC0gMl0uY29tcG9uZW50LmNvbXBvbmVudFR5cGU7XG4gICAgICB9IGVsc2UgaWYgKGFuY2VzdG9ySW5zdHJ1Y3Rpb25zLmxlbmd0aCA9PSAxKSB7XG4gICAgICAgIHBhcmVudENvbXBvbmVudCA9IGFuY2VzdG9ySW5zdHJ1Y3Rpb25zWzBdLmNvbXBvbmVudC5jb21wb25lbnRUeXBlO1xuICAgICAgICBncmFuZHBhcmVudENvbXBvbmVudCA9IHRoaXMuX3Jvb3RDb21wb25lbnQ7XG4gICAgICB9XG5cbiAgICAgIC8vIEZvciBhIGxpbmsgd2l0aCBubyBsZWFkaW5nIGAuL2AsIGAvYCwgb3IgYC4uL2AsIHdlIGxvb2sgZm9yIGEgc2libGluZyBhbmQgY2hpbGQuXG4gICAgICAvLyBJZiBib3RoIGV4aXN0LCB3ZSB0aHJvdy4gT3RoZXJ3aXNlLCB3ZSBwcmVmZXIgd2hpY2hldmVyIGV4aXN0cy5cbiAgICAgIHZhciBjaGlsZFJvdXRlRXhpc3RzID0gdGhpcy5oYXNSb3V0ZShmaXJzdCwgcGFyZW50Q29tcG9uZW50KTtcbiAgICAgIHZhciBwYXJlbnRSb3V0ZUV4aXN0cyA9XG4gICAgICAgICAgaXNQcmVzZW50KGdyYW5kcGFyZW50Q29tcG9uZW50KSAmJiB0aGlzLmhhc1JvdXRlKGZpcnN0LCBncmFuZHBhcmVudENvbXBvbmVudCk7XG5cbiAgICAgIGlmIChwYXJlbnRSb3V0ZUV4aXN0cyAmJiBjaGlsZFJvdXRlRXhpc3RzKSB7XG4gICAgICAgIGxldCBtc2cgPVxuICAgICAgICAgICAgYExpbmsgXCIke0xpc3RXcmFwcGVyLnRvSlNPTihsaW5rUGFyYW1zKX1cIiBpcyBhbWJpZ3VvdXMsIHVzZSBcIi4vXCIgb3IgXCIuLi9cIiB0byBkaXNhbWJpZ3VhdGUuYDtcbiAgICAgICAgdGhyb3cgbmV3IEJhc2VFeGNlcHRpb24obXNnKTtcbiAgICAgIH1cbiAgICAgIGlmIChwYXJlbnRSb3V0ZUV4aXN0cykge1xuICAgICAgICBhbmNlc3Rvckluc3RydWN0aW9ucy5wb3AoKTtcbiAgICAgIH1cbiAgICAgIHJlc3QgPSBsaW5rUGFyYW1zO1xuICAgIH1cblxuICAgIGlmIChyZXN0W3Jlc3QubGVuZ3RoIC0gMV0gPT0gJycpIHtcbiAgICAgIHJlc3QucG9wKCk7XG4gICAgfVxuXG4gICAgaWYgKHJlc3QubGVuZ3RoIDwgMSkge1xuICAgICAgbGV0IG1zZyA9IGBMaW5rIFwiJHtMaXN0V3JhcHBlci50b0pTT04obGlua1BhcmFtcyl9XCIgbXVzdCBpbmNsdWRlIGEgcm91dGUgbmFtZS5gO1xuICAgICAgdGhyb3cgbmV3IEJhc2VFeGNlcHRpb24obXNnKTtcbiAgICB9XG5cbiAgICB2YXIgZ2VuZXJhdGVkSW5zdHJ1Y3Rpb24gPSB0aGlzLl9nZW5lcmF0ZShyZXN0LCBhbmNlc3Rvckluc3RydWN0aW9ucywgX2F1eCk7XG5cbiAgICBmb3IgKHZhciBpID0gYW5jZXN0b3JJbnN0cnVjdGlvbnMubGVuZ3RoIC0gMTsgaSA+PSAwOyBpLS0pIHtcbiAgICAgIGxldCBhbmNlc3Rvckluc3RydWN0aW9uID0gYW5jZXN0b3JJbnN0cnVjdGlvbnNbaV07XG4gICAgICBnZW5lcmF0ZWRJbnN0cnVjdGlvbiA9IGFuY2VzdG9ySW5zdHJ1Y3Rpb24ucmVwbGFjZUNoaWxkKGdlbmVyYXRlZEluc3RydWN0aW9uKTtcbiAgICB9XG5cbiAgICByZXR1cm4gZ2VuZXJhdGVkSW5zdHJ1Y3Rpb247XG4gIH1cblxuXG4gIC8qXG4gICAqIEludGVybmFsIGhlbHBlciB0aGF0IGRvZXMgbm90IG1ha2UgYW55IGFzc2VydGlvbnMgYWJvdXQgdGhlIGJlZ2lubmluZyBvZiB0aGUgbGluayBEU0xcbiAgICovXG4gIHByaXZhdGUgX2dlbmVyYXRlKGxpbmtQYXJhbXM6IGFueVtdLCBhbmNlc3Rvckluc3RydWN0aW9uczogSW5zdHJ1Y3Rpb25bXSxcbiAgICAgICAgICAgICAgICAgICAgX2F1eCA9IGZhbHNlKTogSW5zdHJ1Y3Rpb24ge1xuICAgIGxldCBwYXJlbnRDb21wb25lbnQgPVxuICAgICAgICBhbmNlc3Rvckluc3RydWN0aW9ucy5sZW5ndGggPiAwID9cbiAgICAgICAgICAgIGFuY2VzdG9ySW5zdHJ1Y3Rpb25zW2FuY2VzdG9ySW5zdHJ1Y3Rpb25zLmxlbmd0aCAtIDFdLmNvbXBvbmVudC5jb21wb25lbnRUeXBlIDpcbiAgICAgICAgICAgIHRoaXMuX3Jvb3RDb21wb25lbnQ7XG5cblxuICAgIGlmIChsaW5rUGFyYW1zLmxlbmd0aCA9PSAwKSB7XG4gICAgICByZXR1cm4gdGhpcy5nZW5lcmF0ZURlZmF1bHQocGFyZW50Q29tcG9uZW50KTtcbiAgICB9XG4gICAgbGV0IGxpbmtJbmRleCA9IDA7XG4gICAgbGV0IHJvdXRlTmFtZSA9IGxpbmtQYXJhbXNbbGlua0luZGV4XTtcblxuICAgIGlmICghaXNTdHJpbmcocm91dGVOYW1lKSkge1xuICAgICAgdGhyb3cgbmV3IEJhc2VFeGNlcHRpb24oYFVuZXhwZWN0ZWQgc2VnbWVudCBcIiR7cm91dGVOYW1lfVwiIGluIGxpbmsgRFNMLiBFeHBlY3RlZCBhIHN0cmluZy5gKTtcbiAgICB9IGVsc2UgaWYgKHJvdXRlTmFtZSA9PSAnJyB8fCByb3V0ZU5hbWUgPT0gJy4nIHx8IHJvdXRlTmFtZSA9PSAnLi4nKSB7XG4gICAgICB0aHJvdyBuZXcgQmFzZUV4Y2VwdGlvbihgXCIke3JvdXRlTmFtZX0vXCIgaXMgb25seSBhbGxvd2VkIGF0IHRoZSBiZWdpbm5pbmcgb2YgYSBsaW5rIERTTC5gKTtcbiAgICB9XG5cbiAgICBsZXQgcGFyYW1zID0ge307XG4gICAgaWYgKGxpbmtJbmRleCArIDEgPCBsaW5rUGFyYW1zLmxlbmd0aCkge1xuICAgICAgbGV0IG5leHRTZWdtZW50ID0gbGlua1BhcmFtc1tsaW5rSW5kZXggKyAxXTtcbiAgICAgIGlmIChpc1N0cmluZ01hcChuZXh0U2VnbWVudCkgJiYgIWlzQXJyYXkobmV4dFNlZ21lbnQpKSB7XG4gICAgICAgIHBhcmFtcyA9IG5leHRTZWdtZW50O1xuICAgICAgICBsaW5rSW5kZXggKz0gMTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBsZXQgYXV4SW5zdHJ1Y3Rpb25zOiB7W2tleTogc3RyaW5nXTogSW5zdHJ1Y3Rpb259ID0ge307XG4gICAgdmFyIG5leHRTZWdtZW50O1xuICAgIHdoaWxlIChsaW5rSW5kZXggKyAxIDwgbGlua1BhcmFtcy5sZW5ndGggJiYgaXNBcnJheShuZXh0U2VnbWVudCA9IGxpbmtQYXJhbXNbbGlua0luZGV4ICsgMV0pKSB7XG4gICAgICBsZXQgYXV4UGFyZW50SW5zdHJ1Y3Rpb24gPSBhbmNlc3Rvckluc3RydWN0aW9ucy5sZW5ndGggPiAwID9cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBbYW5jZXN0b3JJbnN0cnVjdGlvbnNbYW5jZXN0b3JJbnN0cnVjdGlvbnMubGVuZ3RoIC0gMV1dIDpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBbXTtcbiAgICAgIGxldCBhdXhJbnN0cnVjdGlvbiA9IHRoaXMuX2dlbmVyYXRlKG5leHRTZWdtZW50LCBhdXhQYXJlbnRJbnN0cnVjdGlvbiwgdHJ1ZSk7XG5cbiAgICAgIC8vIFRPRE86IHRoaXMgd2lsbCBub3Qgd29yayBmb3IgYXV4IHJvdXRlcyB3aXRoIHBhcmFtZXRlcnMgb3IgbXVsdGlwbGUgc2VnbWVudHNcbiAgICAgIGF1eEluc3RydWN0aW9uc1thdXhJbnN0cnVjdGlvbi5jb21wb25lbnQudXJsUGF0aF0gPSBhdXhJbnN0cnVjdGlvbjtcbiAgICAgIGxpbmtJbmRleCArPSAxO1xuICAgIH1cblxuICAgIHZhciBjb21wb25lbnRSZWNvZ25pemVyID0gdGhpcy5fcnVsZXMuZ2V0KHBhcmVudENvbXBvbmVudCk7XG4gICAgaWYgKGlzQmxhbmsoY29tcG9uZW50UmVjb2duaXplcikpIHtcbiAgICAgIHRocm93IG5ldyBCYXNlRXhjZXB0aW9uKFxuICAgICAgICAgIGBDb21wb25lbnQgXCIke2dldFR5cGVOYW1lRm9yRGVidWdnaW5nKHBhcmVudENvbXBvbmVudCl9XCIgaGFzIG5vIHJvdXRlIGNvbmZpZy5gKTtcbiAgICB9XG5cbiAgICB2YXIgcm91dGVSZWNvZ25pemVyID1cbiAgICAgICAgKF9hdXggPyBjb21wb25lbnRSZWNvZ25pemVyLmF1eE5hbWVzIDogY29tcG9uZW50UmVjb2duaXplci5uYW1lcykuZ2V0KHJvdXRlTmFtZSk7XG5cbiAgICBpZiAoIWlzUHJlc2VudChyb3V0ZVJlY29nbml6ZXIpKSB7XG4gICAgICB0aHJvdyBuZXcgQmFzZUV4Y2VwdGlvbihcbiAgICAgICAgICBgQ29tcG9uZW50IFwiJHtnZXRUeXBlTmFtZUZvckRlYnVnZ2luZyhwYXJlbnRDb21wb25lbnQpfVwiIGhhcyBubyByb3V0ZSBuYW1lZCBcIiR7cm91dGVOYW1lfVwiLmApO1xuICAgIH1cblxuICAgIGlmICghaXNQcmVzZW50KHJvdXRlUmVjb2duaXplci5oYW5kbGVyLmNvbXBvbmVudFR5cGUpKSB7XG4gICAgICB2YXIgY29tcEluc3RydWN0aW9uID0gcm91dGVSZWNvZ25pemVyLmdlbmVyYXRlQ29tcG9uZW50UGF0aFZhbHVlcyhwYXJhbXMpO1xuICAgICAgcmV0dXJuIG5ldyBVbnJlc29sdmVkSW5zdHJ1Y3Rpb24oKCkgPT4ge1xuICAgICAgICByZXR1cm4gcm91dGVSZWNvZ25pemVyLmhhbmRsZXIucmVzb2x2ZUNvbXBvbmVudFR5cGUoKS50aGVuKFxuICAgICAgICAgICAgKF8pID0+IHsgcmV0dXJuIHRoaXMuX2dlbmVyYXRlKGxpbmtQYXJhbXMsIGFuY2VzdG9ySW5zdHJ1Y3Rpb25zLCBfYXV4KTsgfSk7XG4gICAgICB9LCBjb21wSW5zdHJ1Y3Rpb25bJ3VybFBhdGgnXSwgY29tcEluc3RydWN0aW9uWyd1cmxQYXJhbXMnXSk7XG4gICAgfVxuXG4gICAgdmFyIGNvbXBvbmVudEluc3RydWN0aW9uID0gX2F1eCA/IGNvbXBvbmVudFJlY29nbml6ZXIuZ2VuZXJhdGVBdXhpbGlhcnkocm91dGVOYW1lLCBwYXJhbXMpIDpcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29tcG9uZW50UmVjb2duaXplci5nZW5lcmF0ZShyb3V0ZU5hbWUsIHBhcmFtcyk7XG5cblxuXG4gICAgdmFyIHJlbWFpbmluZyA9IGxpbmtQYXJhbXMuc2xpY2UobGlua0luZGV4ICsgMSk7XG5cbiAgICB2YXIgaW5zdHJ1Y3Rpb24gPSBuZXcgUmVzb2x2ZWRJbnN0cnVjdGlvbihjb21wb25lbnRJbnN0cnVjdGlvbiwgbnVsbCwgYXV4SW5zdHJ1Y3Rpb25zKTtcblxuICAgIC8vIHRoZSBjb21wb25lbnQgaXMgc3luY1xuICAgIGlmIChpc1ByZXNlbnQoY29tcG9uZW50SW5zdHJ1Y3Rpb24uY29tcG9uZW50VHlwZSkpIHtcbiAgICAgIGxldCBjaGlsZEluc3RydWN0aW9uOiBJbnN0cnVjdGlvbiA9IG51bGw7XG4gICAgICBpZiAobGlua0luZGV4ICsgMSA8IGxpbmtQYXJhbXMubGVuZ3RoKSB7XG4gICAgICAgIGxldCBjaGlsZEFuY2VzdG9yQ29tcG9uZW50cyA9IGFuY2VzdG9ySW5zdHJ1Y3Rpb25zLmNvbmNhdChbaW5zdHJ1Y3Rpb25dKTtcbiAgICAgICAgY2hpbGRJbnN0cnVjdGlvbiA9IHRoaXMuX2dlbmVyYXRlKHJlbWFpbmluZywgY2hpbGRBbmNlc3RvckNvbXBvbmVudHMpO1xuICAgICAgfSBlbHNlIGlmICghY29tcG9uZW50SW5zdHJ1Y3Rpb24udGVybWluYWwpIHtcbiAgICAgICAgLy8gLi4uIGxvb2sgZm9yIGRlZmF1bHRzXG4gICAgICAgIGNoaWxkSW5zdHJ1Y3Rpb24gPSB0aGlzLmdlbmVyYXRlRGVmYXVsdChjb21wb25lbnRJbnN0cnVjdGlvbi5jb21wb25lbnRUeXBlKTtcblxuICAgICAgICBpZiAoaXNCbGFuayhjaGlsZEluc3RydWN0aW9uKSkge1xuICAgICAgICAgIHRocm93IG5ldyBCYXNlRXhjZXB0aW9uKFxuICAgICAgICAgICAgICBgTGluayBcIiR7TGlzdFdyYXBwZXIudG9KU09OKGxpbmtQYXJhbXMpfVwiIGRvZXMgbm90IHJlc29sdmUgdG8gYSB0ZXJtaW5hbCBpbnN0cnVjdGlvbi5gKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgaW5zdHJ1Y3Rpb24uY2hpbGQgPSBjaGlsZEluc3RydWN0aW9uO1xuICAgIH1cblxuICAgIHJldHVybiBpbnN0cnVjdGlvbjtcbiAgfVxuXG4gIHB1YmxpYyBoYXNSb3V0ZShuYW1lOiBzdHJpbmcsIHBhcmVudENvbXBvbmVudDogYW55KTogYm9vbGVhbiB7XG4gICAgdmFyIGNvbXBvbmVudFJlY29nbml6ZXI6IENvbXBvbmVudFJlY29nbml6ZXIgPSB0aGlzLl9ydWxlcy5nZXQocGFyZW50Q29tcG9uZW50KTtcbiAgICBpZiAoaXNCbGFuayhjb21wb25lbnRSZWNvZ25pemVyKSkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICByZXR1cm4gY29tcG9uZW50UmVjb2duaXplci5oYXNSb3V0ZShuYW1lKTtcbiAgfVxuXG4gIHB1YmxpYyBnZW5lcmF0ZURlZmF1bHQoY29tcG9uZW50Q3Vyc29yOiBUeXBlKTogSW5zdHJ1Y3Rpb24ge1xuICAgIGlmIChpc0JsYW5rKGNvbXBvbmVudEN1cnNvcikpIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cblxuICAgIHZhciBjb21wb25lbnRSZWNvZ25pemVyID0gdGhpcy5fcnVsZXMuZ2V0KGNvbXBvbmVudEN1cnNvcik7XG4gICAgaWYgKGlzQmxhbmsoY29tcG9uZW50UmVjb2duaXplcikgfHwgaXNCbGFuayhjb21wb25lbnRSZWNvZ25pemVyLmRlZmF1bHRSb3V0ZSkpIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cblxuXG4gICAgdmFyIGRlZmF1bHRDaGlsZCA9IG51bGw7XG4gICAgaWYgKGlzUHJlc2VudChjb21wb25lbnRSZWNvZ25pemVyLmRlZmF1bHRSb3V0ZS5oYW5kbGVyLmNvbXBvbmVudFR5cGUpKSB7XG4gICAgICB2YXIgY29tcG9uZW50SW5zdHJ1Y3Rpb24gPSBjb21wb25lbnRSZWNvZ25pemVyLmRlZmF1bHRSb3V0ZS5nZW5lcmF0ZSh7fSk7XG4gICAgICBpZiAoIWNvbXBvbmVudFJlY29nbml6ZXIuZGVmYXVsdFJvdXRlLnRlcm1pbmFsKSB7XG4gICAgICAgIGRlZmF1bHRDaGlsZCA9IHRoaXMuZ2VuZXJhdGVEZWZhdWx0KGNvbXBvbmVudFJlY29nbml6ZXIuZGVmYXVsdFJvdXRlLmhhbmRsZXIuY29tcG9uZW50VHlwZSk7XG4gICAgICB9XG4gICAgICByZXR1cm4gbmV3IERlZmF1bHRJbnN0cnVjdGlvbihjb21wb25lbnRJbnN0cnVjdGlvbiwgZGVmYXVsdENoaWxkKTtcbiAgICB9XG5cbiAgICByZXR1cm4gbmV3IFVucmVzb2x2ZWRJbnN0cnVjdGlvbigoKSA9PiB7XG4gICAgICByZXR1cm4gY29tcG9uZW50UmVjb2duaXplci5kZWZhdWx0Um91dGUuaGFuZGxlci5yZXNvbHZlQ29tcG9uZW50VHlwZSgpLnRoZW4oXG4gICAgICAgICAgKF8pID0+IHRoaXMuZ2VuZXJhdGVEZWZhdWx0KGNvbXBvbmVudEN1cnNvcikpO1xuICAgIH0pO1xuICB9XG59XG5cbi8qXG4gKiBHaXZlbjogWycvYS9iJywge2M6IDJ9XVxuICogUmV0dXJuczogWycnLCAnYScsICdiJywge2M6IDJ9XVxuICovXG5mdW5jdGlvbiBzcGxpdEFuZEZsYXR0ZW5MaW5rUGFyYW1zKGxpbmtQYXJhbXM6IGFueVtdKTogYW55W10ge1xuICByZXR1cm4gbGlua1BhcmFtcy5yZWR1Y2UoKGFjY3VtdWxhdGlvbjogYW55W10sIGl0ZW0pID0+IHtcbiAgICBpZiAoaXNTdHJpbmcoaXRlbSkpIHtcbiAgICAgIGxldCBzdHJJdGVtOiBzdHJpbmcgPSBpdGVtO1xuICAgICAgcmV0dXJuIGFjY3VtdWxhdGlvbi5jb25jYXQoc3RySXRlbS5zcGxpdCgnLycpKTtcbiAgICB9XG4gICAgYWNjdW11bGF0aW9uLnB1c2goaXRlbSk7XG4gICAgcmV0dXJuIGFjY3VtdWxhdGlvbjtcbiAgfSwgW10pO1xufVxuXG4vKlxuICogR2l2ZW4gYSBsaXN0IG9mIGluc3RydWN0aW9ucywgcmV0dXJucyB0aGUgbW9zdCBzcGVjaWZpYyBpbnN0cnVjdGlvblxuICovXG5mdW5jdGlvbiBtb3N0U3BlY2lmaWMoaW5zdHJ1Y3Rpb25zOiBJbnN0cnVjdGlvbltdKTogSW5zdHJ1Y3Rpb24ge1xuICByZXR1cm4gTGlzdFdyYXBwZXIubWF4aW11bShpbnN0cnVjdGlvbnMsIChpbnN0cnVjdGlvbjogSW5zdHJ1Y3Rpb24pID0+IGluc3RydWN0aW9uLnNwZWNpZmljaXR5KTtcbn1cblxuZnVuY3Rpb24gYXNzZXJ0VGVybWluYWxDb21wb25lbnQoY29tcG9uZW50LCBwYXRoKSB7XG4gIGlmICghaXNUeXBlKGNvbXBvbmVudCkpIHtcbiAgICByZXR1cm47XG4gIH1cblxuICB2YXIgYW5ub3RhdGlvbnMgPSByZWZsZWN0b3IuYW5ub3RhdGlvbnMoY29tcG9uZW50KTtcbiAgaWYgKGlzUHJlc2VudChhbm5vdGF0aW9ucykpIHtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGFubm90YXRpb25zLmxlbmd0aDsgaSsrKSB7XG4gICAgICB2YXIgYW5ub3RhdGlvbiA9IGFubm90YXRpb25zW2ldO1xuXG4gICAgICBpZiAoYW5ub3RhdGlvbiBpbnN0YW5jZW9mIFJvdXRlQ29uZmlnKSB7XG4gICAgICAgIHRocm93IG5ldyBCYXNlRXhjZXB0aW9uKFxuICAgICAgICAgICAgYENoaWxkIHJvdXRlcyBhcmUgbm90IGFsbG93ZWQgZm9yIFwiJHtwYXRofVwiLiBVc2UgXCIuLi5cIiBvbiB0aGUgcGFyZW50J3Mgcm91dGUgcGF0aC5gKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cbn1cbiJdfQ==