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
        return this._recognize(parsedUrl, []);
    };
    /**
     * Recognizes all parent-child routes, but creates unresolved auxiliary routes
     */
    RouteRegistry.prototype._recognize = function (parsedUrl, ancestorInstructions, _aux) {
        var _this = this;
        if (_aux === void 0) { _aux = false; }
        var parentInstruction = collection_1.ListWrapper.last(ancestorInstructions);
        var parentComponent = lang_1.isPresent(parentInstruction) ? parentInstruction.component.componentType :
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
                var auxParentInstructions = ancestorInstructions.length > 0 ? [collection_1.ListWrapper.last(ancestorInstructions)] : [];
                var auxInstructions = _this._auxRoutesToUnresolved(candidate.remainingAux, auxParentInstructions);
                var instruction = new instruction_1.ResolvedInstruction(candidate.instruction, null, auxInstructions);
                if (lang_1.isBlank(candidate.instruction) || candidate.instruction.terminal) {
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
                var instruction = _this.generate(candidate.redirectTo, ancestorInstructions.concat([null]));
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
        var params = splitAndFlattenLinkParams(linkParams);
        var prevInstruction;
        // The first segment should be either '.' (generate from parent) or '' (generate from root).
        // When we normalize above, we strip all the slashes, './' becomes '.' and '/' becomes ''.
        if (collection_1.ListWrapper.first(params) == '') {
            params.shift();
            prevInstruction = collection_1.ListWrapper.first(ancestorInstructions);
            ancestorInstructions = [];
        }
        else {
            prevInstruction = ancestorInstructions.length > 0 ? ancestorInstructions.pop() : null;
            if (collection_1.ListWrapper.first(params) == '.') {
                params.shift();
            }
            else if (collection_1.ListWrapper.first(params) == '..') {
                while (collection_1.ListWrapper.first(params) == '..') {
                    if (ancestorInstructions.length <= 0) {
                        throw new exceptions_1.BaseException("Link \"" + collection_1.ListWrapper.toJSON(linkParams) + "\" has too many \"../\" segments.");
                    }
                    prevInstruction = ancestorInstructions.pop();
                    params = collection_1.ListWrapper.slice(params, 1);
                }
            }
            else {
                // we must only peak at the link param, and not consume it
                var routeName = collection_1.ListWrapper.first(params);
                var parentComponentType = this._rootComponent;
                var grandparentComponentType = null;
                if (ancestorInstructions.length > 1) {
                    var parentComponentInstruction = ancestorInstructions[ancestorInstructions.length - 1];
                    var grandComponentInstruction = ancestorInstructions[ancestorInstructions.length - 2];
                    parentComponentType = parentComponentInstruction.component.componentType;
                    grandparentComponentType = grandComponentInstruction.component.componentType;
                }
                else if (ancestorInstructions.length == 1) {
                    parentComponentType = ancestorInstructions[0].component.componentType;
                    grandparentComponentType = this._rootComponent;
                }
                // For a link with no leading `./`, `/`, or `../`, we look for a sibling and child.
                // If both exist, we throw. Otherwise, we prefer whichever exists.
                var childRouteExists = this.hasRoute(routeName, parentComponentType);
                var parentRouteExists = lang_1.isPresent(grandparentComponentType) &&
                    this.hasRoute(routeName, grandparentComponentType);
                if (parentRouteExists && childRouteExists) {
                    var msg = "Link \"" + collection_1.ListWrapper.toJSON(linkParams) + "\" is ambiguous, use \"./\" or \"../\" to disambiguate.";
                    throw new exceptions_1.BaseException(msg);
                }
                if (parentRouteExists) {
                    prevInstruction = ancestorInstructions.pop();
                }
            }
        }
        if (params[params.length - 1] == '') {
            params.pop();
        }
        if (params.length > 0 && params[0] == '') {
            params.shift();
        }
        if (params.length < 1) {
            var msg = "Link \"" + collection_1.ListWrapper.toJSON(linkParams) + "\" must include a route name.";
            throw new exceptions_1.BaseException(msg);
        }
        var generatedInstruction = this._generate(params, ancestorInstructions, prevInstruction, _aux, linkParams);
        // we don't clone the first (root) element
        for (var i = ancestorInstructions.length - 1; i >= 0; i--) {
            var ancestorInstruction = ancestorInstructions[i];
            if (lang_1.isBlank(ancestorInstruction)) {
                break;
            }
            generatedInstruction = ancestorInstruction.replaceChild(generatedInstruction);
        }
        return generatedInstruction;
    };
    /*
     * Internal helper that does not make any assertions about the beginning of the link DSL.
     * `ancestorInstructions` are parents that will be cloned.
     * `prevInstruction` is the existing instruction that would be replaced, but which might have
     * aux routes that need to be cloned.
     */
    RouteRegistry.prototype._generate = function (linkParams, ancestorInstructions, prevInstruction, _aux, _originalLink) {
        var _this = this;
        if (_aux === void 0) { _aux = false; }
        var parentComponentType = this._rootComponent;
        var componentInstruction = null;
        var auxInstructions = {};
        var parentInstruction = collection_1.ListWrapper.last(ancestorInstructions);
        if (lang_1.isPresent(parentInstruction) && lang_1.isPresent(parentInstruction.component)) {
            parentComponentType = parentInstruction.component.componentType;
        }
        if (linkParams.length == 0) {
            var defaultInstruction = this.generateDefault(parentComponentType);
            if (lang_1.isBlank(defaultInstruction)) {
                throw new exceptions_1.BaseException("Link \"" + collection_1.ListWrapper.toJSON(_originalLink) + "\" does not resolve to a terminal instruction.");
            }
            return defaultInstruction;
        }
        // for non-aux routes, we want to reuse the predecessor's existing primary and aux routes
        // and only override routes for which the given link DSL provides
        if (lang_1.isPresent(prevInstruction) && !_aux) {
            auxInstructions = collection_1.StringMapWrapper.merge(prevInstruction.auxInstruction, auxInstructions);
            componentInstruction = prevInstruction.component;
        }
        var componentRecognizer = this._rules.get(parentComponentType);
        if (lang_1.isBlank(componentRecognizer)) {
            throw new exceptions_1.BaseException("Component \"" + lang_1.getTypeNameForDebugging(parentComponentType) + "\" has no route config.");
        }
        var linkParamIndex = 0;
        var routeParams = {};
        // first, recognize the primary route if one is provided
        if (linkParamIndex < linkParams.length && lang_1.isString(linkParams[linkParamIndex])) {
            var routeName = linkParams[linkParamIndex];
            if (routeName == '' || routeName == '.' || routeName == '..') {
                throw new exceptions_1.BaseException("\"" + routeName + "/\" is only allowed at the beginning of a link DSL.");
            }
            linkParamIndex += 1;
            if (linkParamIndex < linkParams.length) {
                var linkParam = linkParams[linkParamIndex];
                if (lang_1.isStringMap(linkParam) && !lang_1.isArray(linkParam)) {
                    routeParams = linkParam;
                    linkParamIndex += 1;
                }
            }
            var routeRecognizer = (_aux ? componentRecognizer.auxNames : componentRecognizer.names).get(routeName);
            if (lang_1.isBlank(routeRecognizer)) {
                throw new exceptions_1.BaseException("Component \"" + lang_1.getTypeNameForDebugging(parentComponentType) + "\" has no route named \"" + routeName + "\".");
            }
            // Create an "unresolved instruction" for async routes
            // we'll figure out the rest of the route when we resolve the instruction and
            // perform a navigation
            if (lang_1.isBlank(routeRecognizer.handler.componentType)) {
                var compInstruction = routeRecognizer.generateComponentPathValues(routeParams);
                return new instruction_1.UnresolvedInstruction(function () {
                    return routeRecognizer.handler.resolveComponentType().then(function (_) {
                        return _this._generate(linkParams, ancestorInstructions, prevInstruction, _aux, _originalLink);
                    });
                }, compInstruction['urlPath'], compInstruction['urlParams']);
            }
            componentInstruction = _aux ? componentRecognizer.generateAuxiliary(routeName, routeParams) :
                componentRecognizer.generate(routeName, routeParams);
        }
        // Next, recognize auxiliary instructions.
        // If we have an ancestor instruction, we preserve whatever aux routes are active from it.
        while (linkParamIndex < linkParams.length && lang_1.isArray(linkParams[linkParamIndex])) {
            var auxParentInstruction = [parentInstruction];
            var auxInstruction = this._generate(linkParams[linkParamIndex], auxParentInstruction, null, true, _originalLink);
            // TODO: this will not work for aux routes with parameters or multiple segments
            auxInstructions[auxInstruction.component.urlPath] = auxInstruction;
            linkParamIndex += 1;
        }
        var instruction = new instruction_1.ResolvedInstruction(componentInstruction, null, auxInstructions);
        // If the component is sync, we can generate resolved child route instructions
        // If not, we'll resolve the instructions at navigation time
        if (lang_1.isPresent(componentInstruction) && lang_1.isPresent(componentInstruction.componentType)) {
            var childInstruction = null;
            if (componentInstruction.terminal) {
                if (linkParamIndex >= linkParams.length) {
                }
            }
            else {
                var childAncestorComponents = ancestorInstructions.concat([instruction]);
                var remainingLinkParams = linkParams.slice(linkParamIndex);
                childInstruction = this._generate(remainingLinkParams, childAncestorComponents, null, false, _originalLink);
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
    instructions = instructions.filter(function (instruction) { return lang_1.isPresent(instruction); });
    if (instructions.length == 0) {
        return null;
    }
    if (instructions.length == 1) {
        return instructions[0];
    }
    var first = instructions[0];
    var rest = instructions.slice(1);
    return rest.reduce(function (instruction, contender) {
        if (compareSpecificityStrings(contender.specificity, instruction.specificity) == -1) {
            return contender;
        }
        return instruction;
    }, first);
}
/*
 * Expects strings to be in the form of "[0-2]+"
 * Returns -1 if string A should be sorted above string B, 1 if it should be sorted after,
 * or 0 if they are the same.
 */
function compareSpecificityStrings(a, b) {
    var l = lang_1.Math.min(a.length, b.length);
    for (var i = 0; i < l; i += 1) {
        var ai = lang_1.StringWrapper.charCodeAt(a, i);
        var bi = lang_1.StringWrapper.charCodeAt(b, i);
        var difference = bi - ai;
        if (difference != 0) {
            return difference;
        }
    }
    return a.length - b.length;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicm91dGVfcmVnaXN0cnkuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJhbmd1bGFyMi9zcmMvcm91dGVyL3JvdXRlX3JlZ2lzdHJ5LnRzIl0sIm5hbWVzIjpbIlJvdXRlUmVnaXN0cnkiLCJSb3V0ZVJlZ2lzdHJ5LmNvbnN0cnVjdG9yIiwiUm91dGVSZWdpc3RyeS5jb25maWciLCJSb3V0ZVJlZ2lzdHJ5LmNvbmZpZ0Zyb21Db21wb25lbnQiLCJSb3V0ZVJlZ2lzdHJ5LnJlY29nbml6ZSIsIlJvdXRlUmVnaXN0cnkuX3JlY29nbml6ZSIsIlJvdXRlUmVnaXN0cnkuX2F1eFJvdXRlc1RvVW5yZXNvbHZlZCIsIlJvdXRlUmVnaXN0cnkuZ2VuZXJhdGUiLCJSb3V0ZVJlZ2lzdHJ5Ll9nZW5lcmF0ZSIsIlJvdXRlUmVnaXN0cnkuaGFzUm91dGUiLCJSb3V0ZVJlZ2lzdHJ5LmdlbmVyYXRlRGVmYXVsdCIsInNwbGl0QW5kRmxhdHRlbkxpbmtQYXJhbXMiLCJtb3N0U3BlY2lmaWMiLCJjb21wYXJlU3BlY2lmaWNpdHlTdHJpbmdzIiwiYXNzZXJ0VGVybWluYWxDb21wb25lbnQiXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7OztBQUFBLDJCQUE2RCxnQ0FBZ0MsQ0FBQyxDQUFBO0FBQzlGLHNCQUFzQywyQkFBMkIsQ0FBQyxDQUFBO0FBQ2xFLHFCQVlPLDBCQUEwQixDQUFDLENBQUE7QUFDbEMsMkJBQThDLGdDQUFnQyxDQUFDLENBQUE7QUFDL0UsMkJBQXdCLHlDQUF5QyxDQUFDLENBQUE7QUFDbEUscUJBQThDLGVBQWUsQ0FBQyxDQUFBO0FBRTlELGtDQU9PLHFCQUFxQixDQUFDLENBQUE7QUFDN0IsaUNBQW1ELG9CQUFvQixDQUFDLENBQUE7QUFDeEUscUNBQWtDLHdCQUF3QixDQUFDLENBQUE7QUFDM0QsNEJBTU8sZUFBZSxDQUFDLENBQUE7QUFFdkIsdUNBQTBELDBCQUEwQixDQUFDLENBQUE7QUFDckYsMkJBQTZDLGNBQWMsQ0FBQyxDQUFBO0FBRTVELElB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TWFwLCBNYXBXcmFwcGVyLCBTdHJpbmdNYXBXcmFwcGVyfSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2NvbGxlY3Rpb24nO1xuaW1wb3J0IHtQcm9taXNlLCBQcm9taXNlV3JhcHBlcn0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9hc3luYyc7XG5pbXBvcnQge1xuICBpc1ByZXNlbnQsXG4gIGlzQXJyYXksXG4gIGlzQmxhbmssXG4gIGlzVHlwZSxcbiAgaXNTdHJpbmcsXG4gIGlzU3RyaW5nTWFwLFxuICBUeXBlLFxuICBTdHJpbmdXcmFwcGVyLFxuICBNYXRoLFxuICBnZXRUeXBlTmFtZUZvckRlYnVnZ2luZyxcbiAgQ09OU1RfRVhQUlxufSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2xhbmcnO1xuaW1wb3J0IHtCYXNlRXhjZXB0aW9uLCBXcmFwcGVkRXhjZXB0aW9ufSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2V4Y2VwdGlvbnMnO1xuaW1wb3J0IHtyZWZsZWN0b3J9IGZyb20gJ2FuZ3VsYXIyL3NyYy9jb3JlL3JlZmxlY3Rpb24vcmVmbGVjdGlvbic7XG5pbXBvcnQge0luamVjdGFibGUsIEluamVjdCwgT3BhcXVlVG9rZW59IGZyb20gJ2FuZ3VsYXIyL2NvcmUnO1xuXG5pbXBvcnQge1xuICBSb3V0ZUNvbmZpZyxcbiAgQXN5bmNSb3V0ZSxcbiAgUm91dGUsXG4gIEF1eFJvdXRlLFxuICBSZWRpcmVjdCxcbiAgUm91dGVEZWZpbml0aW9uXG59IGZyb20gJy4vcm91dGVfY29uZmlnX2ltcGwnO1xuaW1wb3J0IHtQYXRoTWF0Y2gsIFJlZGlyZWN0TWF0Y2gsIFJvdXRlTWF0Y2h9IGZyb20gJy4vcm91dGVfcmVjb2duaXplcic7XG5pbXBvcnQge0NvbXBvbmVudFJlY29nbml6ZXJ9IGZyb20gJy4vY29tcG9uZW50X3JlY29nbml6ZXInO1xuaW1wb3J0IHtcbiAgSW5zdHJ1Y3Rpb24sXG4gIFJlc29sdmVkSW5zdHJ1Y3Rpb24sXG4gIFJlZGlyZWN0SW5zdHJ1Y3Rpb24sXG4gIFVucmVzb2x2ZWRJbnN0cnVjdGlvbixcbiAgRGVmYXVsdEluc3RydWN0aW9uXG59IGZyb20gJy4vaW5zdHJ1Y3Rpb24nO1xuXG5pbXBvcnQge25vcm1hbGl6ZVJvdXRlQ29uZmlnLCBhc3NlcnRDb21wb25lbnRFeGlzdHN9IGZyb20gJy4vcm91dGVfY29uZmlnX25vbWFsaXplcic7XG5pbXBvcnQge3BhcnNlciwgVXJsLCBwYXRoU2VnbWVudHNUb1VybH0gZnJvbSAnLi91cmxfcGFyc2VyJztcblxudmFyIF9yZXNvbHZlVG9OdWxsID0gUHJvbWlzZVdyYXBwZXIucmVzb2x2ZShudWxsKTtcblxuXG5cbi8qKlxuICogVG9rZW4gdXNlZCB0byBiaW5kIHRoZSBjb21wb25lbnQgd2l0aCB0aGUgdG9wLWxldmVsIHtAbGluayBSb3V0ZUNvbmZpZ31zIGZvciB0aGVcbiAqIGFwcGxpY2F0aW9uLlxuICpcbiAqICMjIyBFeGFtcGxlIChbbGl2ZSBkZW1vXShodHRwOi8vcGxua3IuY28vZWRpdC9pUlVQOEI1T1VieENXUTNBY0lEbSkpXG4gKlxuICogYGBgXG4gKiBpbXBvcnQge0NvbXBvbmVudH0gZnJvbSAnYW5ndWxhcjIvY29yZSc7XG4gKiBpbXBvcnQge1xuICogICBST1VURVJfRElSRUNUSVZFUyxcbiAqICAgUk9VVEVSX1BST1ZJREVSUyxcbiAqICAgUm91dGVDb25maWdcbiAqIH0gZnJvbSAnYW5ndWxhcjIvcm91dGVyJztcbiAqXG4gKiBAQ29tcG9uZW50KHtkaXJlY3RpdmVzOiBbUk9VVEVSX0RJUkVDVElWRVNdfSlcbiAqIEBSb3V0ZUNvbmZpZyhbXG4gKiAgey4uLn0sXG4gKiBdKVxuICogY2xhc3MgQXBwQ21wIHtcbiAqICAgLy8gLi4uXG4gKiB9XG4gKlxuICogYm9vdHN0cmFwKEFwcENtcCwgW1JPVVRFUl9QUk9WSURFUlNdKTtcbiAqIGBgYFxuICovXG5leHBvcnQgY29uc3QgUk9VVEVSX1BSSU1BUllfQ09NUE9ORU5UOiBPcGFxdWVUb2tlbiA9XG4gICAgQ09OU1RfRVhQUihuZXcgT3BhcXVlVG9rZW4oJ1JvdXRlclByaW1hcnlDb21wb25lbnQnKSk7XG5cblxuLyoqXG4gKiBUaGUgUm91dGVSZWdpc3RyeSBob2xkcyByb3V0ZSBjb25maWd1cmF0aW9ucyBmb3IgZWFjaCBjb21wb25lbnQgaW4gYW4gQW5ndWxhciBhcHAuXG4gKiBJdCBpcyByZXNwb25zaWJsZSBmb3IgY3JlYXRpbmcgSW5zdHJ1Y3Rpb25zIGZyb20gVVJMcywgYW5kIGdlbmVyYXRpbmcgVVJMcyBiYXNlZCBvbiByb3V0ZSBhbmRcbiAqIHBhcmFtZXRlcnMuXG4gKi9cbkBJbmplY3RhYmxlKClcbmV4cG9ydCBjbGFzcyBSb3V0ZVJlZ2lzdHJ5IHtcbiAgcHJpdmF0ZSBfcnVsZXMgPSBuZXcgTWFwPGFueSwgQ29tcG9uZW50UmVjb2duaXplcj4oKTtcblxuICBjb25zdHJ1Y3RvcihASW5qZWN0KFJPVVRFUl9QUklNQVJZX0NPTVBPTkVOVCkgcHJpdmF0ZSBfcm9vdENvbXBvbmVudDogVHlwZSkge31cblxuICAvKipcbiAgICogR2l2ZW4gYSBjb21wb25lbnQgYW5kIGEgY29uZmlndXJhdGlvbiBvYmplY3QsIGFkZCB0aGUgcm91dGUgdG8gdGhpcyByZWdpc3RyeVxuICAgKi9cbiAgY29uZmlnKHBhcmVudENvbXBvbmVudDogYW55LCBjb25maWc6IFJvdXRlRGVmaW5pdGlvbik6IHZvaWQge1xuICAgIGNvbmZpZyA9IG5vcm1hbGl6ZVJvdXRlQ29uZmlnKGNvbmZpZywgdGhpcyk7XG5cbiAgICAvLyB0aGlzIGlzIGhlcmUgYmVjYXVzZSBEYXJ0IHR5cGUgZ3VhcmQgcmVhc29uc1xuICAgIGlmIChjb25maWcgaW5zdGFuY2VvZiBSb3V0ZSkge1xuICAgICAgYXNzZXJ0Q29tcG9uZW50RXhpc3RzKGNvbmZpZy5jb21wb25lbnQsIGNvbmZpZy5wYXRoKTtcbiAgICB9IGVsc2UgaWYgKGNvbmZpZyBpbnN0YW5jZW9mIEF1eFJvdXRlKSB7XG4gICAgICBhc3NlcnRDb21wb25lbnRFeGlzdHMoY29uZmlnLmNvbXBvbmVudCwgY29uZmlnLnBhdGgpO1xuICAgIH1cblxuICAgIHZhciByZWNvZ25pemVyOiBDb21wb25lbnRSZWNvZ25pemVyID0gdGhpcy5fcnVsZXMuZ2V0KHBhcmVudENvbXBvbmVudCk7XG5cbiAgICBpZiAoaXNCbGFuayhyZWNvZ25pemVyKSkge1xuICAgICAgcmVjb2duaXplciA9IG5ldyBDb21wb25lbnRSZWNvZ25pemVyKCk7XG4gICAgICB0aGlzLl9ydWxlcy5zZXQocGFyZW50Q29tcG9uZW50LCByZWNvZ25pemVyKTtcbiAgICB9XG5cbiAgICB2YXIgdGVybWluYWwgPSByZWNvZ25pemVyLmNvbmZpZyhjb25maWcpO1xuXG4gICAgaWYgKGNvbmZpZyBpbnN0YW5jZW9mIFJvdXRlKSB7XG4gICAgICBpZiAodGVybWluYWwpIHtcbiAgICAgICAgYXNzZXJ0VGVybWluYWxDb21wb25lbnQoY29uZmlnLmNvbXBvbmVudCwgY29uZmlnLnBhdGgpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5jb25maWdGcm9tQ29tcG9uZW50KGNvbmZpZy5jb21wb25lbnQpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBSZWFkcyB0aGUgYW5ub3RhdGlvbnMgb2YgYSBjb21wb25lbnQgYW5kIGNvbmZpZ3VyZXMgdGhlIHJlZ2lzdHJ5IGJhc2VkIG9uIHRoZW1cbiAgICovXG4gIGNvbmZpZ0Zyb21Db21wb25lbnQoY29tcG9uZW50OiBhbnkpOiB2b2lkIHtcbiAgICBpZiAoIWlzVHlwZShjb21wb25lbnQpKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgLy8gRG9uJ3QgcmVhZCB0aGUgYW5ub3RhdGlvbnMgZnJvbSBhIHR5cGUgbW9yZSB0aGFuIG9uY2Ug4oCTXG4gICAgLy8gdGhpcyBwcmV2ZW50cyBhbiBpbmZpbml0ZSBsb29wIGlmIGEgY29tcG9uZW50IHJvdXRlcyByZWN1cnNpdmVseS5cbiAgICBpZiAodGhpcy5fcnVsZXMuaGFzKGNvbXBvbmVudCkpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgdmFyIGFubm90YXRpb25zID0gcmVmbGVjdG9yLmFubm90YXRpb25zKGNvbXBvbmVudCk7XG4gICAgaWYgKGlzUHJlc2VudChhbm5vdGF0aW9ucykpIHtcbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgYW5ub3RhdGlvbnMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgdmFyIGFubm90YXRpb24gPSBhbm5vdGF0aW9uc1tpXTtcblxuICAgICAgICBpZiAoYW5ub3RhdGlvbiBpbnN0YW5jZW9mIFJvdXRlQ29uZmlnKSB7XG4gICAgICAgICAgbGV0IHJvdXRlQ2ZnczogUm91dGVEZWZpbml0aW9uW10gPSBhbm5vdGF0aW9uLmNvbmZpZ3M7XG4gICAgICAgICAgcm91dGVDZmdzLmZvckVhY2goY29uZmlnID0+IHRoaXMuY29uZmlnKGNvbXBvbmVudCwgY29uZmlnKSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH1cblxuXG4gIC8qKlxuICAgKiBHaXZlbiBhIFVSTCBhbmQgYSBwYXJlbnQgY29tcG9uZW50LCByZXR1cm4gdGhlIG1vc3Qgc3BlY2lmaWMgaW5zdHJ1Y3Rpb24gZm9yIG5hdmlnYXRpbmdcbiAgICogdGhlIGFwcGxpY2F0aW9uIGludG8gdGhlIHN0YXRlIHNwZWNpZmllZCBieSB0aGUgdXJsXG4gICAqL1xuICByZWNvZ25pemUodXJsOiBzdHJpbmcsIGFuY2VzdG9ySW5zdHJ1Y3Rpb25zOiBJbnN0cnVjdGlvbltdKTogUHJvbWlzZTxJbnN0cnVjdGlvbj4ge1xuICAgIHZhciBwYXJzZWRVcmwgPSBwYXJzZXIucGFyc2UodXJsKTtcbiAgICByZXR1cm4gdGhpcy5fcmVjb2duaXplKHBhcnNlZFVybCwgW10pO1xuICB9XG5cblxuICAvKipcbiAgICogUmVjb2duaXplcyBhbGwgcGFyZW50LWNoaWxkIHJvdXRlcywgYnV0IGNyZWF0ZXMgdW5yZXNvbHZlZCBhdXhpbGlhcnkgcm91dGVzXG4gICAqL1xuICBwcml2YXRlIF9yZWNvZ25pemUocGFyc2VkVXJsOiBVcmwsIGFuY2VzdG9ySW5zdHJ1Y3Rpb25zOiBJbnN0cnVjdGlvbltdLFxuICAgICAgICAgICAgICAgICAgICAgX2F1eCA9IGZhbHNlKTogUHJvbWlzZTxJbnN0cnVjdGlvbj4ge1xuICAgIHZhciBwYXJlbnRJbnN0cnVjdGlvbiA9IExpc3RXcmFwcGVyLmxhc3QoYW5jZXN0b3JJbnN0cnVjdGlvbnMpO1xuICAgIHZhciBwYXJlbnRDb21wb25lbnQgPSBpc1ByZXNlbnQocGFyZW50SW5zdHJ1Y3Rpb24pID8gcGFyZW50SW5zdHJ1Y3Rpb24uY29tcG9uZW50LmNvbXBvbmVudFR5cGUgOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5fcm9vdENvbXBvbmVudDtcblxuICAgIHZhciBjb21wb25lbnRSZWNvZ25pemVyID0gdGhpcy5fcnVsZXMuZ2V0KHBhcmVudENvbXBvbmVudCk7XG4gICAgaWYgKGlzQmxhbmsoY29tcG9uZW50UmVjb2duaXplcikpIHtcbiAgICAgIHJldHVybiBfcmVzb2x2ZVRvTnVsbDtcbiAgICB9XG5cbiAgICAvLyBNYXRjaGVzIHNvbWUgYmVnaW5uaW5nIHBhcnQgb2YgdGhlIGdpdmVuIFVSTFxuICAgIHZhciBwb3NzaWJsZU1hdGNoZXM6IFByb21pc2U8Um91dGVNYXRjaD5bXSA9XG4gICAgICAgIF9hdXggPyBjb21wb25lbnRSZWNvZ25pemVyLnJlY29nbml6ZUF1eGlsaWFyeShwYXJzZWRVcmwpIDpcbiAgICAgICAgICAgICAgIGNvbXBvbmVudFJlY29nbml6ZXIucmVjb2duaXplKHBhcnNlZFVybCk7XG5cbiAgICB2YXIgbWF0Y2hQcm9taXNlczogUHJvbWlzZTxJbnN0cnVjdGlvbj5bXSA9IHBvc3NpYmxlTWF0Y2hlcy5tYXAoXG4gICAgICAgIChjYW5kaWRhdGU6IFByb21pc2U8Um91dGVNYXRjaD4pID0+IGNhbmRpZGF0ZS50aGVuKChjYW5kaWRhdGU6IFJvdXRlTWF0Y2gpID0+IHtcblxuICAgICAgICAgIGlmIChjYW5kaWRhdGUgaW5zdGFuY2VvZiBQYXRoTWF0Y2gpIHtcbiAgICAgICAgICAgIHZhciBhdXhQYXJlbnRJbnN0cnVjdGlvbnMgPVxuICAgICAgICAgICAgICAgIGFuY2VzdG9ySW5zdHJ1Y3Rpb25zLmxlbmd0aCA+IDAgPyBbTGlzdFdyYXBwZXIubGFzdChhbmNlc3Rvckluc3RydWN0aW9ucyldIDogW107XG4gICAgICAgICAgICB2YXIgYXV4SW5zdHJ1Y3Rpb25zID1cbiAgICAgICAgICAgICAgICB0aGlzLl9hdXhSb3V0ZXNUb1VucmVzb2x2ZWQoY2FuZGlkYXRlLnJlbWFpbmluZ0F1eCwgYXV4UGFyZW50SW5zdHJ1Y3Rpb25zKTtcblxuICAgICAgICAgICAgdmFyIGluc3RydWN0aW9uID0gbmV3IFJlc29sdmVkSW5zdHJ1Y3Rpb24oY2FuZGlkYXRlLmluc3RydWN0aW9uLCBudWxsLCBhdXhJbnN0cnVjdGlvbnMpO1xuXG4gICAgICAgICAgICBpZiAoaXNCbGFuayhjYW5kaWRhdGUuaW5zdHJ1Y3Rpb24pIHx8IGNhbmRpZGF0ZS5pbnN0cnVjdGlvbi50ZXJtaW5hbCkge1xuICAgICAgICAgICAgICByZXR1cm4gaW5zdHJ1Y3Rpb247XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHZhciBuZXdBbmNlc3RvckNvbXBvbmVudHMgPSBhbmNlc3Rvckluc3RydWN0aW9ucy5jb25jYXQoW2luc3RydWN0aW9uXSk7XG5cbiAgICAgICAgICAgIHJldHVybiB0aGlzLl9yZWNvZ25pemUoY2FuZGlkYXRlLnJlbWFpbmluZywgbmV3QW5jZXN0b3JDb21wb25lbnRzKVxuICAgICAgICAgICAgICAgIC50aGVuKChjaGlsZEluc3RydWN0aW9uKSA9PiB7XG4gICAgICAgICAgICAgICAgICBpZiAoaXNCbGFuayhjaGlsZEluc3RydWN0aW9uKSkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgLy8gcmVkaXJlY3QgaW5zdHJ1Y3Rpb25zIGFyZSBhbHJlYWR5IGFic29sdXRlXG4gICAgICAgICAgICAgICAgICBpZiAoY2hpbGRJbnN0cnVjdGlvbiBpbnN0YW5jZW9mIFJlZGlyZWN0SW5zdHJ1Y3Rpb24pIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGNoaWxkSW5zdHJ1Y3Rpb247XG4gICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICBpbnN0cnVjdGlvbi5jaGlsZCA9IGNoaWxkSW5zdHJ1Y3Rpb247XG4gICAgICAgICAgICAgICAgICByZXR1cm4gaW5zdHJ1Y3Rpb247XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgaWYgKGNhbmRpZGF0ZSBpbnN0YW5jZW9mIFJlZGlyZWN0TWF0Y2gpIHtcbiAgICAgICAgICAgIHZhciBpbnN0cnVjdGlvbiA9XG4gICAgICAgICAgICAgICAgdGhpcy5nZW5lcmF0ZShjYW5kaWRhdGUucmVkaXJlY3RUbywgYW5jZXN0b3JJbnN0cnVjdGlvbnMuY29uY2F0KFtudWxsXSkpO1xuICAgICAgICAgICAgcmV0dXJuIG5ldyBSZWRpcmVjdEluc3RydWN0aW9uKGluc3RydWN0aW9uLmNvbXBvbmVudCwgaW5zdHJ1Y3Rpb24uY2hpbGQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaW5zdHJ1Y3Rpb24uYXV4SW5zdHJ1Y3Rpb24pO1xuICAgICAgICAgIH1cbiAgICAgICAgfSkpO1xuXG4gICAgaWYgKChpc0JsYW5rKHBhcnNlZFVybCkgfHwgcGFyc2VkVXJsLnBhdGggPT0gJycpICYmIHBvc3NpYmxlTWF0Y2hlcy5sZW5ndGggPT0gMCkge1xuICAgICAgcmV0dXJuIFByb21pc2VXcmFwcGVyLnJlc29sdmUodGhpcy5nZW5lcmF0ZURlZmF1bHQocGFyZW50Q29tcG9uZW50KSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIFByb21pc2VXcmFwcGVyLmFsbChtYXRjaFByb21pc2VzKS50aGVuKG1vc3RTcGVjaWZpYyk7XG4gIH1cblxuICBwcml2YXRlIF9hdXhSb3V0ZXNUb1VucmVzb2x2ZWQoYXV4Um91dGVzOiBVcmxbXSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBhcmVudEluc3RydWN0aW9uczogSW5zdHJ1Y3Rpb25bXSk6IHtba2V5OiBzdHJpbmddOiBJbnN0cnVjdGlvbn0ge1xuICAgIHZhciB1bnJlc29sdmVkQXV4SW5zdHJ1Y3Rpb25zOiB7W2tleTogc3RyaW5nXTogSW5zdHJ1Y3Rpb259ID0ge307XG5cbiAgICBhdXhSb3V0ZXMuZm9yRWFjaCgoYXV4VXJsOiBVcmwpID0+IHtcbiAgICAgIHVucmVzb2x2ZWRBdXhJbnN0cnVjdGlvbnNbYXV4VXJsLnBhdGhdID0gbmV3IFVucmVzb2x2ZWRJbnN0cnVjdGlvbihcbiAgICAgICAgICAoKSA9PiB7IHJldHVybiB0aGlzLl9yZWNvZ25pemUoYXV4VXJsLCBwYXJlbnRJbnN0cnVjdGlvbnMsIHRydWUpOyB9KTtcbiAgICB9KTtcblxuICAgIHJldHVybiB1bnJlc29sdmVkQXV4SW5zdHJ1Y3Rpb25zO1xuICB9XG5cblxuICAvKipcbiAgICogR2l2ZW4gYSBub3JtYWxpemVkIGxpc3Qgd2l0aCBjb21wb25lbnQgbmFtZXMgYW5kIHBhcmFtcyBsaWtlOiBgWyd1c2VyJywge2lkOiAzIH1dYFxuICAgKiBnZW5lcmF0ZXMgYSB1cmwgd2l0aCBhIGxlYWRpbmcgc2xhc2ggcmVsYXRpdmUgdG8gdGhlIHByb3ZpZGVkIGBwYXJlbnRDb21wb25lbnRgLlxuICAgKlxuICAgKiBJZiB0aGUgb3B0aW9uYWwgcGFyYW0gYF9hdXhgIGlzIGB0cnVlYCwgdGhlbiB3ZSBnZW5lcmF0ZSBzdGFydGluZyBhdCBhbiBhdXhpbGlhcnlcbiAgICogcm91dGUgYm91bmRhcnkuXG4gICAqL1xuICBnZW5lcmF0ZShsaW5rUGFyYW1zOiBhbnlbXSwgYW5jZXN0b3JJbnN0cnVjdGlvbnM6IEluc3RydWN0aW9uW10sIF9hdXggPSBmYWxzZSk6IEluc3RydWN0aW9uIHtcbiAgICB2YXIgcGFyYW1zID0gc3BsaXRBbmRGbGF0dGVuTGlua1BhcmFtcyhsaW5rUGFyYW1zKTtcbiAgICB2YXIgcHJldkluc3RydWN0aW9uO1xuXG4gICAgLy8gVGhlIGZpcnN0IHNlZ21lbnQgc2hvdWxkIGJlIGVpdGhlciAnLicgKGdlbmVyYXRlIGZyb20gcGFyZW50KSBvciAnJyAoZ2VuZXJhdGUgZnJvbSByb290KS5cbiAgICAvLyBXaGVuIHdlIG5vcm1hbGl6ZSBhYm92ZSwgd2Ugc3RyaXAgYWxsIHRoZSBzbGFzaGVzLCAnLi8nIGJlY29tZXMgJy4nIGFuZCAnLycgYmVjb21lcyAnJy5cbiAgICBpZiAoTGlzdFdyYXBwZXIuZmlyc3QocGFyYW1zKSA9PSAnJykge1xuICAgICAgcGFyYW1zLnNoaWZ0KCk7XG4gICAgICBwcmV2SW5zdHJ1Y3Rpb24gPSBMaXN0V3JhcHBlci5maXJzdChhbmNlc3Rvckluc3RydWN0aW9ucyk7XG4gICAgICBhbmNlc3Rvckluc3RydWN0aW9ucyA9IFtdO1xuICAgIH0gZWxzZSB7XG4gICAgICBwcmV2SW5zdHJ1Y3Rpb24gPSBhbmNlc3Rvckluc3RydWN0aW9ucy5sZW5ndGggPiAwID8gYW5jZXN0b3JJbnN0cnVjdGlvbnMucG9wKCkgOiBudWxsO1xuXG4gICAgICBpZiAoTGlzdFdyYXBwZXIuZmlyc3QocGFyYW1zKSA9PSAnLicpIHtcbiAgICAgICAgcGFyYW1zLnNoaWZ0KCk7XG4gICAgICB9IGVsc2UgaWYgKExpc3RXcmFwcGVyLmZpcnN0KHBhcmFtcykgPT0gJy4uJykge1xuICAgICAgICB3aGlsZSAoTGlzdFdyYXBwZXIuZmlyc3QocGFyYW1zKSA9PSAnLi4nKSB7XG4gICAgICAgICAgaWYgKGFuY2VzdG9ySW5zdHJ1Y3Rpb25zLmxlbmd0aCA8PSAwKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgQmFzZUV4Y2VwdGlvbihcbiAgICAgICAgICAgICAgICBgTGluayBcIiR7TGlzdFdyYXBwZXIudG9KU09OKGxpbmtQYXJhbXMpfVwiIGhhcyB0b28gbWFueSBcIi4uL1wiIHNlZ21lbnRzLmApO1xuICAgICAgICAgIH1cbiAgICAgICAgICBwcmV2SW5zdHJ1Y3Rpb24gPSBhbmNlc3Rvckluc3RydWN0aW9ucy5wb3AoKTtcbiAgICAgICAgICBwYXJhbXMgPSBMaXN0V3JhcHBlci5zbGljZShwYXJhbXMsIDEpO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gd2UncmUgb24gdG8gaW1wbGljaXQgY2hpbGQvc2libGluZyByb3V0ZVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgLy8gd2UgbXVzdCBvbmx5IHBlYWsgYXQgdGhlIGxpbmsgcGFyYW0sIGFuZCBub3QgY29uc3VtZSBpdFxuICAgICAgICBsZXQgcm91dGVOYW1lID0gTGlzdFdyYXBwZXIuZmlyc3QocGFyYW1zKTtcbiAgICAgICAgbGV0IHBhcmVudENvbXBvbmVudFR5cGUgPSB0aGlzLl9yb290Q29tcG9uZW50O1xuICAgICAgICBsZXQgZ3JhbmRwYXJlbnRDb21wb25lbnRUeXBlID0gbnVsbDtcblxuICAgICAgICBpZiAoYW5jZXN0b3JJbnN0cnVjdGlvbnMubGVuZ3RoID4gMSkge1xuICAgICAgICAgIGxldCBwYXJlbnRDb21wb25lbnRJbnN0cnVjdGlvbiA9IGFuY2VzdG9ySW5zdHJ1Y3Rpb25zW2FuY2VzdG9ySW5zdHJ1Y3Rpb25zLmxlbmd0aCAtIDFdO1xuICAgICAgICAgIGxldCBncmFuZENvbXBvbmVudEluc3RydWN0aW9uID0gYW5jZXN0b3JJbnN0cnVjdGlvbnNbYW5jZXN0b3JJbnN0cnVjdGlvbnMubGVuZ3RoIC0gMl07XG5cbiAgICAgICAgICBwYXJlbnRDb21wb25lbnRUeXBlID0gcGFyZW50Q29tcG9uZW50SW5zdHJ1Y3Rpb24uY29tcG9uZW50LmNvbXBvbmVudFR5cGU7XG4gICAgICAgICAgZ3JhbmRwYXJlbnRDb21wb25lbnRUeXBlID0gZ3JhbmRDb21wb25lbnRJbnN0cnVjdGlvbi5jb21wb25lbnQuY29tcG9uZW50VHlwZTtcbiAgICAgICAgfSBlbHNlIGlmIChhbmNlc3Rvckluc3RydWN0aW9ucy5sZW5ndGggPT0gMSkge1xuICAgICAgICAgIHBhcmVudENvbXBvbmVudFR5cGUgPSBhbmNlc3Rvckluc3RydWN0aW9uc1swXS5jb21wb25lbnQuY29tcG9uZW50VHlwZTtcbiAgICAgICAgICBncmFuZHBhcmVudENvbXBvbmVudFR5cGUgPSB0aGlzLl9yb290Q29tcG9uZW50O1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gRm9yIGEgbGluayB3aXRoIG5vIGxlYWRpbmcgYC4vYCwgYC9gLCBvciBgLi4vYCwgd2UgbG9vayBmb3IgYSBzaWJsaW5nIGFuZCBjaGlsZC5cbiAgICAgICAgLy8gSWYgYm90aCBleGlzdCwgd2UgdGhyb3cuIE90aGVyd2lzZSwgd2UgcHJlZmVyIHdoaWNoZXZlciBleGlzdHMuXG4gICAgICAgIHZhciBjaGlsZFJvdXRlRXhpc3RzID0gdGhpcy5oYXNSb3V0ZShyb3V0ZU5hbWUsIHBhcmVudENvbXBvbmVudFR5cGUpO1xuICAgICAgICB2YXIgcGFyZW50Um91dGVFeGlzdHMgPSBpc1ByZXNlbnQoZ3JhbmRwYXJlbnRDb21wb25lbnRUeXBlKSAmJlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmhhc1JvdXRlKHJvdXRlTmFtZSwgZ3JhbmRwYXJlbnRDb21wb25lbnRUeXBlKTtcblxuICAgICAgICBpZiAocGFyZW50Um91dGVFeGlzdHMgJiYgY2hpbGRSb3V0ZUV4aXN0cykge1xuICAgICAgICAgIGxldCBtc2cgPVxuICAgICAgICAgICAgICBgTGluayBcIiR7TGlzdFdyYXBwZXIudG9KU09OKGxpbmtQYXJhbXMpfVwiIGlzIGFtYmlndW91cywgdXNlIFwiLi9cIiBvciBcIi4uL1wiIHRvIGRpc2FtYmlndWF0ZS5gO1xuICAgICAgICAgIHRocm93IG5ldyBCYXNlRXhjZXB0aW9uKG1zZyk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAocGFyZW50Um91dGVFeGlzdHMpIHtcbiAgICAgICAgICBwcmV2SW5zdHJ1Y3Rpb24gPSBhbmNlc3Rvckluc3RydWN0aW9ucy5wb3AoKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIGlmIChwYXJhbXNbcGFyYW1zLmxlbmd0aCAtIDFdID09ICcnKSB7XG4gICAgICBwYXJhbXMucG9wKCk7XG4gICAgfVxuXG4gICAgaWYgKHBhcmFtcy5sZW5ndGggPiAwICYmIHBhcmFtc1swXSA9PSAnJykge1xuICAgICAgcGFyYW1zLnNoaWZ0KCk7XG4gICAgfVxuXG4gICAgaWYgKHBhcmFtcy5sZW5ndGggPCAxKSB7XG4gICAgICBsZXQgbXNnID0gYExpbmsgXCIke0xpc3RXcmFwcGVyLnRvSlNPTihsaW5rUGFyYW1zKX1cIiBtdXN0IGluY2x1ZGUgYSByb3V0ZSBuYW1lLmA7XG4gICAgICB0aHJvdyBuZXcgQmFzZUV4Y2VwdGlvbihtc2cpO1xuICAgIH1cblxuICAgIHZhciBnZW5lcmF0ZWRJbnN0cnVjdGlvbiA9XG4gICAgICAgIHRoaXMuX2dlbmVyYXRlKHBhcmFtcywgYW5jZXN0b3JJbnN0cnVjdGlvbnMsIHByZXZJbnN0cnVjdGlvbiwgX2F1eCwgbGlua1BhcmFtcyk7XG5cbiAgICAvLyB3ZSBkb24ndCBjbG9uZSB0aGUgZmlyc3QgKHJvb3QpIGVsZW1lbnRcbiAgICBmb3IgKHZhciBpID0gYW5jZXN0b3JJbnN0cnVjdGlvbnMubGVuZ3RoIC0gMTsgaSA+PSAwOyBpLS0pIHtcbiAgICAgIGxldCBhbmNlc3Rvckluc3RydWN0aW9uID0gYW5jZXN0b3JJbnN0cnVjdGlvbnNbaV07XG4gICAgICBpZiAoaXNCbGFuayhhbmNlc3Rvckluc3RydWN0aW9uKSkge1xuICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICAgIGdlbmVyYXRlZEluc3RydWN0aW9uID0gYW5jZXN0b3JJbnN0cnVjdGlvbi5yZXBsYWNlQ2hpbGQoZ2VuZXJhdGVkSW5zdHJ1Y3Rpb24pO1xuICAgIH1cblxuICAgIHJldHVybiBnZW5lcmF0ZWRJbnN0cnVjdGlvbjtcbiAgfVxuXG5cbiAgLypcbiAgICogSW50ZXJuYWwgaGVscGVyIHRoYXQgZG9lcyBub3QgbWFrZSBhbnkgYXNzZXJ0aW9ucyBhYm91dCB0aGUgYmVnaW5uaW5nIG9mIHRoZSBsaW5rIERTTC5cbiAgICogYGFuY2VzdG9ySW5zdHJ1Y3Rpb25zYCBhcmUgcGFyZW50cyB0aGF0IHdpbGwgYmUgY2xvbmVkLlxuICAgKiBgcHJldkluc3RydWN0aW9uYCBpcyB0aGUgZXhpc3RpbmcgaW5zdHJ1Y3Rpb24gdGhhdCB3b3VsZCBiZSByZXBsYWNlZCwgYnV0IHdoaWNoIG1pZ2h0IGhhdmVcbiAgICogYXV4IHJvdXRlcyB0aGF0IG5lZWQgdG8gYmUgY2xvbmVkLlxuICAgKi9cbiAgcHJpdmF0ZSBfZ2VuZXJhdGUobGlua1BhcmFtczogYW55W10sIGFuY2VzdG9ySW5zdHJ1Y3Rpb25zOiBJbnN0cnVjdGlvbltdLFxuICAgICAgICAgICAgICAgICAgICBwcmV2SW5zdHJ1Y3Rpb246IEluc3RydWN0aW9uLCBfYXV4ID0gZmFsc2UsIF9vcmlnaW5hbExpbms6IGFueVtdKTogSW5zdHJ1Y3Rpb24ge1xuICAgIGxldCBwYXJlbnRDb21wb25lbnRUeXBlID0gdGhpcy5fcm9vdENvbXBvbmVudDtcbiAgICBsZXQgY29tcG9uZW50SW5zdHJ1Y3Rpb24gPSBudWxsO1xuICAgIGxldCBhdXhJbnN0cnVjdGlvbnM6IHtba2V5OiBzdHJpbmddOiBJbnN0cnVjdGlvbn0gPSB7fTtcblxuICAgIGxldCBwYXJlbnRJbnN0cnVjdGlvbjogSW5zdHJ1Y3Rpb24gPSBMaXN0V3JhcHBlci5sYXN0KGFuY2VzdG9ySW5zdHJ1Y3Rpb25zKTtcbiAgICBpZiAoaXNQcmVzZW50KHBhcmVudEluc3RydWN0aW9uKSAmJiBpc1ByZXNlbnQocGFyZW50SW5zdHJ1Y3Rpb24uY29tcG9uZW50KSkge1xuICAgICAgcGFyZW50Q29tcG9uZW50VHlwZSA9IHBhcmVudEluc3RydWN0aW9uLmNvbXBvbmVudC5jb21wb25lbnRUeXBlO1xuICAgIH1cblxuICAgIGlmIChsaW5rUGFyYW1zLmxlbmd0aCA9PSAwKSB7XG4gICAgICBsZXQgZGVmYXVsdEluc3RydWN0aW9uID0gdGhpcy5nZW5lcmF0ZURlZmF1bHQocGFyZW50Q29tcG9uZW50VHlwZSk7XG4gICAgICBpZiAoaXNCbGFuayhkZWZhdWx0SW5zdHJ1Y3Rpb24pKSB7XG4gICAgICAgIHRocm93IG5ldyBCYXNlRXhjZXB0aW9uKFxuICAgICAgICAgICAgYExpbmsgXCIke0xpc3RXcmFwcGVyLnRvSlNPTihfb3JpZ2luYWxMaW5rKX1cIiBkb2VzIG5vdCByZXNvbHZlIHRvIGEgdGVybWluYWwgaW5zdHJ1Y3Rpb24uYCk7XG4gICAgICB9XG4gICAgICByZXR1cm4gZGVmYXVsdEluc3RydWN0aW9uO1xuICAgIH1cblxuICAgIC8vIGZvciBub24tYXV4IHJvdXRlcywgd2Ugd2FudCB0byByZXVzZSB0aGUgcHJlZGVjZXNzb3IncyBleGlzdGluZyBwcmltYXJ5IGFuZCBhdXggcm91dGVzXG4gICAgLy8gYW5kIG9ubHkgb3ZlcnJpZGUgcm91dGVzIGZvciB3aGljaCB0aGUgZ2l2ZW4gbGluayBEU0wgcHJvdmlkZXNcbiAgICBpZiAoaXNQcmVzZW50KHByZXZJbnN0cnVjdGlvbikgJiYgIV9hdXgpIHtcbiAgICAgIGF1eEluc3RydWN0aW9ucyA9IFN0cmluZ01hcFdyYXBwZXIubWVyZ2UocHJldkluc3RydWN0aW9uLmF1eEluc3RydWN0aW9uLCBhdXhJbnN0cnVjdGlvbnMpO1xuICAgICAgY29tcG9uZW50SW5zdHJ1Y3Rpb24gPSBwcmV2SW5zdHJ1Y3Rpb24uY29tcG9uZW50O1xuICAgIH1cblxuICAgIHZhciBjb21wb25lbnRSZWNvZ25pemVyID0gdGhpcy5fcnVsZXMuZ2V0KHBhcmVudENvbXBvbmVudFR5cGUpO1xuICAgIGlmIChpc0JsYW5rKGNvbXBvbmVudFJlY29nbml6ZXIpKSB7XG4gICAgICB0aHJvdyBuZXcgQmFzZUV4Y2VwdGlvbihcbiAgICAgICAgICBgQ29tcG9uZW50IFwiJHtnZXRUeXBlTmFtZUZvckRlYnVnZ2luZyhwYXJlbnRDb21wb25lbnRUeXBlKX1cIiBoYXMgbm8gcm91dGUgY29uZmlnLmApO1xuICAgIH1cblxuICAgIGxldCBsaW5rUGFyYW1JbmRleCA9IDA7XG4gICAgbGV0IHJvdXRlUGFyYW1zID0ge307XG5cbiAgICAvLyBmaXJzdCwgcmVjb2duaXplIHRoZSBwcmltYXJ5IHJvdXRlIGlmIG9uZSBpcyBwcm92aWRlZFxuICAgIGlmIChsaW5rUGFyYW1JbmRleCA8IGxpbmtQYXJhbXMubGVuZ3RoICYmIGlzU3RyaW5nKGxpbmtQYXJhbXNbbGlua1BhcmFtSW5kZXhdKSkge1xuICAgICAgbGV0IHJvdXRlTmFtZSA9IGxpbmtQYXJhbXNbbGlua1BhcmFtSW5kZXhdO1xuICAgICAgaWYgKHJvdXRlTmFtZSA9PSAnJyB8fCByb3V0ZU5hbWUgPT0gJy4nIHx8IHJvdXRlTmFtZSA9PSAnLi4nKSB7XG4gICAgICAgIHRocm93IG5ldyBCYXNlRXhjZXB0aW9uKGBcIiR7cm91dGVOYW1lfS9cIiBpcyBvbmx5IGFsbG93ZWQgYXQgdGhlIGJlZ2lubmluZyBvZiBhIGxpbmsgRFNMLmApO1xuICAgICAgfVxuICAgICAgbGlua1BhcmFtSW5kZXggKz0gMTtcbiAgICAgIGlmIChsaW5rUGFyYW1JbmRleCA8IGxpbmtQYXJhbXMubGVuZ3RoKSB7XG4gICAgICAgIGxldCBsaW5rUGFyYW0gPSBsaW5rUGFyYW1zW2xpbmtQYXJhbUluZGV4XTtcbiAgICAgICAgaWYgKGlzU3RyaW5nTWFwKGxpbmtQYXJhbSkgJiYgIWlzQXJyYXkobGlua1BhcmFtKSkge1xuICAgICAgICAgIHJvdXRlUGFyYW1zID0gbGlua1BhcmFtO1xuICAgICAgICAgIGxpbmtQYXJhbUluZGV4ICs9IDE7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHZhciByb3V0ZVJlY29nbml6ZXIgPVxuICAgICAgICAgIChfYXV4ID8gY29tcG9uZW50UmVjb2duaXplci5hdXhOYW1lcyA6IGNvbXBvbmVudFJlY29nbml6ZXIubmFtZXMpLmdldChyb3V0ZU5hbWUpO1xuXG4gICAgICBpZiAoaXNCbGFuayhyb3V0ZVJlY29nbml6ZXIpKSB7XG4gICAgICAgIHRocm93IG5ldyBCYXNlRXhjZXB0aW9uKFxuICAgICAgICAgICAgYENvbXBvbmVudCBcIiR7Z2V0VHlwZU5hbWVGb3JEZWJ1Z2dpbmcocGFyZW50Q29tcG9uZW50VHlwZSl9XCIgaGFzIG5vIHJvdXRlIG5hbWVkIFwiJHtyb3V0ZU5hbWV9XCIuYCk7XG4gICAgICB9XG5cbiAgICAgIC8vIENyZWF0ZSBhbiBcInVucmVzb2x2ZWQgaW5zdHJ1Y3Rpb25cIiBmb3IgYXN5bmMgcm91dGVzXG4gICAgICAvLyB3ZSdsbCBmaWd1cmUgb3V0IHRoZSByZXN0IG9mIHRoZSByb3V0ZSB3aGVuIHdlIHJlc29sdmUgdGhlIGluc3RydWN0aW9uIGFuZFxuICAgICAgLy8gcGVyZm9ybSBhIG5hdmlnYXRpb25cbiAgICAgIGlmIChpc0JsYW5rKHJvdXRlUmVjb2duaXplci5oYW5kbGVyLmNvbXBvbmVudFR5cGUpKSB7XG4gICAgICAgIHZhciBjb21wSW5zdHJ1Y3Rpb24gPSByb3V0ZVJlY29nbml6ZXIuZ2VuZXJhdGVDb21wb25lbnRQYXRoVmFsdWVzKHJvdXRlUGFyYW1zKTtcbiAgICAgICAgcmV0dXJuIG5ldyBVbnJlc29sdmVkSW5zdHJ1Y3Rpb24oKCkgPT4ge1xuICAgICAgICAgIHJldHVybiByb3V0ZVJlY29nbml6ZXIuaGFuZGxlci5yZXNvbHZlQ29tcG9uZW50VHlwZSgpLnRoZW4oKF8pID0+IHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLl9nZW5lcmF0ZShsaW5rUGFyYW1zLCBhbmNlc3Rvckluc3RydWN0aW9ucywgcHJldkluc3RydWN0aW9uLCBfYXV4LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF9vcmlnaW5hbExpbmspO1xuICAgICAgICAgIH0pO1xuICAgICAgICB9LCBjb21wSW5zdHJ1Y3Rpb25bJ3VybFBhdGgnXSwgY29tcEluc3RydWN0aW9uWyd1cmxQYXJhbXMnXSk7XG4gICAgICB9XG5cbiAgICAgIGNvbXBvbmVudEluc3RydWN0aW9uID0gX2F1eCA/IGNvbXBvbmVudFJlY29nbml6ZXIuZ2VuZXJhdGVBdXhpbGlhcnkocm91dGVOYW1lLCByb3V0ZVBhcmFtcykgOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29tcG9uZW50UmVjb2duaXplci5nZW5lcmF0ZShyb3V0ZU5hbWUsIHJvdXRlUGFyYW1zKTtcbiAgICB9XG5cbiAgICAvLyBOZXh0LCByZWNvZ25pemUgYXV4aWxpYXJ5IGluc3RydWN0aW9ucy5cbiAgICAvLyBJZiB3ZSBoYXZlIGFuIGFuY2VzdG9yIGluc3RydWN0aW9uLCB3ZSBwcmVzZXJ2ZSB3aGF0ZXZlciBhdXggcm91dGVzIGFyZSBhY3RpdmUgZnJvbSBpdC5cbiAgICB3aGlsZSAobGlua1BhcmFtSW5kZXggPCBsaW5rUGFyYW1zLmxlbmd0aCAmJiBpc0FycmF5KGxpbmtQYXJhbXNbbGlua1BhcmFtSW5kZXhdKSkge1xuICAgICAgbGV0IGF1eFBhcmVudEluc3RydWN0aW9uID0gW3BhcmVudEluc3RydWN0aW9uXTtcbiAgICAgIGxldCBhdXhJbnN0cnVjdGlvbiA9IHRoaXMuX2dlbmVyYXRlKGxpbmtQYXJhbXNbbGlua1BhcmFtSW5kZXhdLCBhdXhQYXJlbnRJbnN0cnVjdGlvbiwgbnVsbCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRydWUsIF9vcmlnaW5hbExpbmspO1xuXG4gICAgICAvLyBUT0RPOiB0aGlzIHdpbGwgbm90IHdvcmsgZm9yIGF1eCByb3V0ZXMgd2l0aCBwYXJhbWV0ZXJzIG9yIG11bHRpcGxlIHNlZ21lbnRzXG4gICAgICBhdXhJbnN0cnVjdGlvbnNbYXV4SW5zdHJ1Y3Rpb24uY29tcG9uZW50LnVybFBhdGhdID0gYXV4SW5zdHJ1Y3Rpb247XG4gICAgICBsaW5rUGFyYW1JbmRleCArPSAxO1xuICAgIH1cblxuICAgIHZhciBpbnN0cnVjdGlvbiA9IG5ldyBSZXNvbHZlZEluc3RydWN0aW9uKGNvbXBvbmVudEluc3RydWN0aW9uLCBudWxsLCBhdXhJbnN0cnVjdGlvbnMpO1xuXG4gICAgLy8gSWYgdGhlIGNvbXBvbmVudCBpcyBzeW5jLCB3ZSBjYW4gZ2VuZXJhdGUgcmVzb2x2ZWQgY2hpbGQgcm91dGUgaW5zdHJ1Y3Rpb25zXG4gICAgLy8gSWYgbm90LCB3ZSdsbCByZXNvbHZlIHRoZSBpbnN0cnVjdGlvbnMgYXQgbmF2aWdhdGlvbiB0aW1lXG4gICAgaWYgKGlzUHJlc2VudChjb21wb25lbnRJbnN0cnVjdGlvbikgJiYgaXNQcmVzZW50KGNvbXBvbmVudEluc3RydWN0aW9uLmNvbXBvbmVudFR5cGUpKSB7XG4gICAgICBsZXQgY2hpbGRJbnN0cnVjdGlvbjogSW5zdHJ1Y3Rpb24gPSBudWxsO1xuICAgICAgaWYgKGNvbXBvbmVudEluc3RydWN0aW9uLnRlcm1pbmFsKSB7XG4gICAgICAgIGlmIChsaW5rUGFyYW1JbmRleCA+PSBsaW5rUGFyYW1zLmxlbmd0aCkge1xuICAgICAgICAgIC8vIFRPRE86IHRocm93IHRoYXQgdGhlcmUgYXJlIGV4dHJhIGxpbmsgcGFyYW1zIGJleW9uZCB0aGUgdGVybWluYWwgY29tcG9uZW50XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGxldCBjaGlsZEFuY2VzdG9yQ29tcG9uZW50cyA9IGFuY2VzdG9ySW5zdHJ1Y3Rpb25zLmNvbmNhdChbaW5zdHJ1Y3Rpb25dKTtcbiAgICAgICAgbGV0IHJlbWFpbmluZ0xpbmtQYXJhbXMgPSBsaW5rUGFyYW1zLnNsaWNlKGxpbmtQYXJhbUluZGV4KTtcbiAgICAgICAgY2hpbGRJbnN0cnVjdGlvbiA9IHRoaXMuX2dlbmVyYXRlKHJlbWFpbmluZ0xpbmtQYXJhbXMsIGNoaWxkQW5jZXN0b3JDb21wb25lbnRzLCBudWxsLCBmYWxzZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF9vcmlnaW5hbExpbmspO1xuICAgICAgfVxuICAgICAgaW5zdHJ1Y3Rpb24uY2hpbGQgPSBjaGlsZEluc3RydWN0aW9uO1xuICAgIH1cblxuICAgIHJldHVybiBpbnN0cnVjdGlvbjtcbiAgfVxuXG4gIHB1YmxpYyBoYXNSb3V0ZShuYW1lOiBzdHJpbmcsIHBhcmVudENvbXBvbmVudDogYW55KTogYm9vbGVhbiB7XG4gICAgdmFyIGNvbXBvbmVudFJlY29nbml6ZXI6IENvbXBvbmVudFJlY29nbml6ZXIgPSB0aGlzLl9ydWxlcy5nZXQocGFyZW50Q29tcG9uZW50KTtcbiAgICBpZiAoaXNCbGFuayhjb21wb25lbnRSZWNvZ25pemVyKSkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICByZXR1cm4gY29tcG9uZW50UmVjb2duaXplci5oYXNSb3V0ZShuYW1lKTtcbiAgfVxuXG4gIHB1YmxpYyBnZW5lcmF0ZURlZmF1bHQoY29tcG9uZW50Q3Vyc29yOiBUeXBlKTogSW5zdHJ1Y3Rpb24ge1xuICAgIGlmIChpc0JsYW5rKGNvbXBvbmVudEN1cnNvcikpIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cblxuICAgIHZhciBjb21wb25lbnRSZWNvZ25pemVyID0gdGhpcy5fcnVsZXMuZ2V0KGNvbXBvbmVudEN1cnNvcik7XG4gICAgaWYgKGlzQmxhbmsoY29tcG9uZW50UmVjb2duaXplcikgfHwgaXNCbGFuayhjb21wb25lbnRSZWNvZ25pemVyLmRlZmF1bHRSb3V0ZSkpIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cblxuICAgIHZhciBkZWZhdWx0Q2hpbGQgPSBudWxsO1xuICAgIGlmIChpc1ByZXNlbnQoY29tcG9uZW50UmVjb2duaXplci5kZWZhdWx0Um91dGUuaGFuZGxlci5jb21wb25lbnRUeXBlKSkge1xuICAgICAgdmFyIGNvbXBvbmVudEluc3RydWN0aW9uID0gY29tcG9uZW50UmVjb2duaXplci5kZWZhdWx0Um91dGUuZ2VuZXJhdGUoe30pO1xuICAgICAgaWYgKCFjb21wb25lbnRSZWNvZ25pemVyLmRlZmF1bHRSb3V0ZS50ZXJtaW5hbCkge1xuICAgICAgICBkZWZhdWx0Q2hpbGQgPSB0aGlzLmdlbmVyYXRlRGVmYXVsdChjb21wb25lbnRSZWNvZ25pemVyLmRlZmF1bHRSb3V0ZS5oYW5kbGVyLmNvbXBvbmVudFR5cGUpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIG5ldyBEZWZhdWx0SW5zdHJ1Y3Rpb24oY29tcG9uZW50SW5zdHJ1Y3Rpb24sIGRlZmF1bHRDaGlsZCk7XG4gICAgfVxuXG4gICAgcmV0dXJuIG5ldyBVbnJlc29sdmVkSW5zdHJ1Y3Rpb24oKCkgPT4ge1xuICAgICAgcmV0dXJuIGNvbXBvbmVudFJlY29nbml6ZXIuZGVmYXVsdFJvdXRlLmhhbmRsZXIucmVzb2x2ZUNvbXBvbmVudFR5cGUoKS50aGVuKFxuICAgICAgICAgIChfKSA9PiB0aGlzLmdlbmVyYXRlRGVmYXVsdChjb21wb25lbnRDdXJzb3IpKTtcbiAgICB9KTtcbiAgfVxufVxuXG4vKlxuICogR2l2ZW46IFsnL2EvYicsIHtjOiAyfV1cbiAqIFJldHVybnM6IFsnJywgJ2EnLCAnYicsIHtjOiAyfV1cbiAqL1xuZnVuY3Rpb24gc3BsaXRBbmRGbGF0dGVuTGlua1BhcmFtcyhsaW5rUGFyYW1zOiBhbnlbXSk6IGFueVtdIHtcbiAgcmV0dXJuIGxpbmtQYXJhbXMucmVkdWNlKChhY2N1bXVsYXRpb246IGFueVtdLCBpdGVtKSA9PiB7XG4gICAgaWYgKGlzU3RyaW5nKGl0ZW0pKSB7XG4gICAgICBsZXQgc3RySXRlbTogc3RyaW5nID0gaXRlbTtcbiAgICAgIHJldHVybiBhY2N1bXVsYXRpb24uY29uY2F0KHN0ckl0ZW0uc3BsaXQoJy8nKSk7XG4gICAgfVxuICAgIGFjY3VtdWxhdGlvbi5wdXNoKGl0ZW0pO1xuICAgIHJldHVybiBhY2N1bXVsYXRpb247XG4gIH0sIFtdKTtcbn1cblxuLypcbiAqIEdpdmVuIGEgbGlzdCBvZiBpbnN0cnVjdGlvbnMsIHJldHVybnMgdGhlIG1vc3Qgc3BlY2lmaWMgaW5zdHJ1Y3Rpb25cbiAqL1xuZnVuY3Rpb24gbW9zdFNwZWNpZmljKGluc3RydWN0aW9uczogSW5zdHJ1Y3Rpb25bXSk6IEluc3RydWN0aW9uIHtcbiAgaW5zdHJ1Y3Rpb25zID0gaW5zdHJ1Y3Rpb25zLmZpbHRlcigoaW5zdHJ1Y3Rpb24pID0+IGlzUHJlc2VudChpbnN0cnVjdGlvbikpO1xuICBpZiAoaW5zdHJ1Y3Rpb25zLmxlbmd0aCA9PSAwKSB7XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cbiAgaWYgKGluc3RydWN0aW9ucy5sZW5ndGggPT0gMSkge1xuICAgIHJldHVybiBpbnN0cnVjdGlvbnNbMF07XG4gIH1cbiAgdmFyIGZpcnN0ID0gaW5zdHJ1Y3Rpb25zWzBdO1xuICB2YXIgcmVzdCA9IGluc3RydWN0aW9ucy5zbGljZSgxKTtcbiAgcmV0dXJuIHJlc3QucmVkdWNlKChpbnN0cnVjdGlvbjogSW5zdHJ1Y3Rpb24sIGNvbnRlbmRlcjogSW5zdHJ1Y3Rpb24pID0+IHtcbiAgICBpZiAoY29tcGFyZVNwZWNpZmljaXR5U3RyaW5ncyhjb250ZW5kZXIuc3BlY2lmaWNpdHksIGluc3RydWN0aW9uLnNwZWNpZmljaXR5KSA9PSAtMSkge1xuICAgICAgcmV0dXJuIGNvbnRlbmRlcjtcbiAgICB9XG4gICAgcmV0dXJuIGluc3RydWN0aW9uO1xuICB9LCBmaXJzdCk7XG59XG5cbi8qXG4gKiBFeHBlY3RzIHN0cmluZ3MgdG8gYmUgaW4gdGhlIGZvcm0gb2YgXCJbMC0yXStcIlxuICogUmV0dXJucyAtMSBpZiBzdHJpbmcgQSBzaG91bGQgYmUgc29ydGVkIGFib3ZlIHN0cmluZyBCLCAxIGlmIGl0IHNob3VsZCBiZSBzb3J0ZWQgYWZ0ZXIsXG4gKiBvciAwIGlmIHRoZXkgYXJlIHRoZSBzYW1lLlxuICovXG5mdW5jdGlvbiBjb21wYXJlU3BlY2lmaWNpdHlTdHJpbmdzKGE6IHN0cmluZywgYjogc3RyaW5nKTogbnVtYmVyIHtcbiAgdmFyIGwgPSBNYXRoLm1pbihhLmxlbmd0aCwgYi5sZW5ndGgpO1xuICBmb3IgKHZhciBpID0gMDsgaSA8IGw7IGkgKz0gMSkge1xuICAgIHZhciBhaSA9IFN0cmluZ1dyYXBwZXIuY2hhckNvZGVBdChhLCBpKTtcbiAgICB2YXIgYmkgPSBTdHJpbmdXcmFwcGVyLmNoYXJDb2RlQXQoYiwgaSk7XG4gICAgdmFyIGRpZmZlcmVuY2UgPSBiaSAtIGFpO1xuICAgIGlmIChkaWZmZXJlbmNlICE9IDApIHtcbiAgICAgIHJldHVybiBkaWZmZXJlbmNlO1xuICAgIH1cbiAgfVxuICByZXR1cm4gYS5sZW5ndGggLSBiLmxlbmd0aDtcbn1cblxuZnVuY3Rpb24gYXNzZXJ0VGVybWluYWxDb21wb25lbnQoY29tcG9uZW50LCBwYXRoKSB7XG4gIGlmICghaXNUeXBlKGNvbXBvbmVudCkpIHtcbiAgICByZXR1cm47XG4gIH1cblxuICB2YXIgYW5ub3RhdGlvbnMgPSByZWZsZWN0b3IuYW5ub3RhdGlvbnMoY29tcG9uZW50KTtcbiAgaWYgKGlzUHJlc2VudChhbm5vdGF0aW9ucykpIHtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGFubm90YXRpb25zLmxlbmd0aDsgaSsrKSB7XG4gICAgICB2YXIgYW5ub3RhdGlvbiA9IGFubm90YXRpb25zW2ldO1xuXG4gICAgICBpZiAoYW5ub3RhdGlvbiBpbnN0YW5jZW9mIFJvdXRlQ29uZmlnKSB7XG4gICAgICAgIHRocm93IG5ldyBCYXNlRXhjZXB0aW9uKFxuICAgICAgICAgICAgYENoaWxkIHJvdXRlcyBhcmUgbm90IGFsbG93ZWQgZm9yIFwiJHtwYXRofVwiLiBVc2UgXCIuLi5cIiBvbiB0aGUgcGFyZW50J3Mgcm91dGUgcGF0aC5gKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cbn1cbiJdfQ==