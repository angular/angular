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
                return new instruction_1.RedirectInstruction(instruction.component, instruction.child, instruction.auxInstruction, candidate.specificity);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicm91dGVfcmVnaXN0cnkuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJhbmd1bGFyMi9zcmMvcm91dGVyL3JvdXRlX3JlZ2lzdHJ5LnRzIl0sIm5hbWVzIjpbIlJvdXRlUmVnaXN0cnkiLCJSb3V0ZVJlZ2lzdHJ5LmNvbnN0cnVjdG9yIiwiUm91dGVSZWdpc3RyeS5jb25maWciLCJSb3V0ZVJlZ2lzdHJ5LmNvbmZpZ0Zyb21Db21wb25lbnQiLCJSb3V0ZVJlZ2lzdHJ5LnJlY29nbml6ZSIsIlJvdXRlUmVnaXN0cnkuX3JlY29nbml6ZSIsIlJvdXRlUmVnaXN0cnkuX2F1eFJvdXRlc1RvVW5yZXNvbHZlZCIsIlJvdXRlUmVnaXN0cnkuZ2VuZXJhdGUiLCJSb3V0ZVJlZ2lzdHJ5Ll9nZW5lcmF0ZSIsIlJvdXRlUmVnaXN0cnkuaGFzUm91dGUiLCJSb3V0ZVJlZ2lzdHJ5LmdlbmVyYXRlRGVmYXVsdCIsInNwbGl0QW5kRmxhdHRlbkxpbmtQYXJhbXMiLCJtb3N0U3BlY2lmaWMiLCJhc3NlcnRUZXJtaW5hbENvbXBvbmVudCJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7O0FBQUEsMkJBQTZELGdDQUFnQyxDQUFDLENBQUE7QUFDOUYsc0JBQXNDLDJCQUEyQixDQUFDLENBQUE7QUFDbEUscUJBVU8sMEJBQTBCLENBQUMsQ0FBQTtBQUNsQywyQkFBOEMsZ0NBQWdDLENBQUMsQ0FBQTtBQUMvRSwyQkFBd0IseUNBQXlDLENBQUMsQ0FBQTtBQUNsRSxxQkFBOEMsZUFBZSxDQUFDLENBQUE7QUFFOUQsa0NBT08scUJBQXFCLENBQUMsQ0FBQTtBQUM3QixpQ0FBbUQsb0JBQW9CLENBQUMsQ0FBQTtBQUN4RSxxQ0FBa0Msd0JBQXdCLENBQUMsQ0FBQTtBQUMzRCw0QkFNTyxlQUFlLENBQUMsQ0FBQTtBQUV2Qix1Q0FBMEQsMEJBQTBCLENBQUMsQ0FBQTtBQUNyRiwyQkFBNkMsY0FBYyxDQUFDLENBQUE7QUFFNUQsSUFBSSxjQUFjLEdBQUcsc0JBQWMsQ0FBQyxPQUFP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bUJBQW1CQSxHQUF3QkEsSUFBSUEsQ0FBQ0EsTUFBTUEsQ0FBQ0EsR0FBR0EsQ0FBQ0EsZUFBZUEsQ0FBQ0EsQ0FBQ0E7UUFDaEZBLEVBQUVBLENBQUNBLENBQUNBLGNBQU9BLENBQUNBLG1CQUFtQkEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7WUFDakNBLE1BQU1BLENBQUNBLEtBQUtBLENBQUNBO1FBQ2ZBLENBQUNBO1FBQ0RBLE1BQU1BLENBQUNBLG1CQUFtQkEsQ0FBQ0EsUUFBUUEsQ0FBQ0EsSUFBSUEsQ0FBQ0EsQ0FBQ0E7SUFDNUNBLENBQUNBO0lBRU1ULHVDQUFlQSxHQUF0QkEsVUFBdUJBLGVBQXFCQTtRQUE1Q1UsaUJBd0JDQTtRQXZCQ0EsRUFBRUEsQ0FBQ0EsQ0FBQ0EsY0FBT0EsQ0FBQ0EsZUFBZUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7WUFDN0JBLE1BQU1BLENBQUNBLElBQUlBLENBQUNBO1FBQ2RBLENBQUNBO1FBRURBLElBQUlBLG1CQUFtQkEsR0FBR0EsSUFBSUEsQ0FBQ0EsTUFBTUEsQ0FBQ0EsR0FBR0EsQ0FBQ0EsZUFBZUEsQ0FBQ0EsQ0FBQ0E7UUFDM0RBLEVBQUVBLENBQUNBLENBQUNBLGNBQU9BLENBQUNBLG1CQUFtQkEsQ0FBQ0EsSUFBSUEsY0FBT0EsQ0FBQ0EsbUJBQW1CQSxDQUFDQSxZQUFZQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTtZQUM5RUEsTUFBTUEsQ0FBQ0EsSUFBSUEsQ0FBQ0E7UUFDZEEsQ0FBQ0E7UUFHREEsSUFBSUEsWUFBWUEsR0FBR0EsSUFBSUEsQ0FBQ0E7UUFDeEJBLEVBQUVBLENBQUNBLENBQUNBLGdCQUFTQSxDQUFDQSxtQkFBbUJBLENBQUNBLFlBQVlBLENBQUNBLE9BQU9BLENBQUNBLGFBQWFBLENBQUNBLENBQUNBLENBQUNBLENBQUNBO1lBQ3RFQSxJQUFJQSxvQkFBb0JBLEdBQUdBLG1CQUFtQkEsQ0FBQ0EsWUFBWUEsQ0FBQ0EsUUFBUUEsQ0FBQ0EsRUFBRUEsQ0FBQ0EsQ0FBQ0E7WUFDekVBLEVBQUVBLENBQUNBLENBQUNB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REFBMENBLENBQUNBLENBQUNBO1lBQzNGQSxDQUFDQTtRQUNIQSxDQUFDQTtJQUNIQSxDQUFDQTtBQUNIQSxDQUFDQSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7TGlzdFdyYXBwZXIsIE1hcCwgTWFwV3JhcHBlciwgU3RyaW5nTWFwV3JhcHBlcn0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9jb2xsZWN0aW9uJztcbmltcG9ydCB7UHJvbWlzZSwgUHJvbWlzZVdyYXBwZXJ9IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvYXN5bmMnO1xuaW1wb3J0IHtcbiAgaXNQcmVzZW50LFxuICBpc0FycmF5LFxuICBpc0JsYW5rLFxuICBpc1R5cGUsXG4gIGlzU3RyaW5nLFxuICBpc1N0cmluZ01hcCxcbiAgVHlwZSxcbiAgZ2V0VHlwZU5hbWVGb3JEZWJ1Z2dpbmcsXG4gIENPTlNUX0VYUFJcbn0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9sYW5nJztcbmltcG9ydCB7QmFzZUV4Y2VwdGlvbiwgV3JhcHBlZEV4Y2VwdGlvbn0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9leGNlcHRpb25zJztcbmltcG9ydCB7cmVmbGVjdG9yfSBmcm9tICdhbmd1bGFyMi9zcmMvY29yZS9yZWZsZWN0aW9uL3JlZmxlY3Rpb24nO1xuaW1wb3J0IHtJbmplY3RhYmxlLCBJbmplY3QsIE9wYXF1ZVRva2VufSBmcm9tICdhbmd1bGFyMi9jb3JlJztcblxuaW1wb3J0IHtcbiAgUm91dGVDb25maWcsXG4gIEFzeW5jUm91dGUsXG4gIFJvdXRlLFxuICBBdXhSb3V0ZSxcbiAgUmVkaXJlY3QsXG4gIFJvdXRlRGVmaW5pdGlvblxufSBmcm9tICcuL3JvdXRlX2NvbmZpZ19pbXBsJztcbmltcG9ydCB7UGF0aE1hdGNoLCBSZWRpcmVjdE1hdGNoLCBSb3V0ZU1hdGNofSBmcm9tICcuL3JvdXRlX3JlY29nbml6ZXInO1xuaW1wb3J0IHtDb21wb25lbnRSZWNvZ25pemVyfSBmcm9tICcuL2NvbXBvbmVudF9yZWNvZ25pemVyJztcbmltcG9ydCB7XG4gIEluc3RydWN0aW9uLFxuICBSZXNvbHZlZEluc3RydWN0aW9uLFxuICBSZWRpcmVjdEluc3RydWN0aW9uLFxuICBVbnJlc29sdmVkSW5zdHJ1Y3Rpb24sXG4gIERlZmF1bHRJbnN0cnVjdGlvblxufSBmcm9tICcuL2luc3RydWN0aW9uJztcblxuaW1wb3J0IHtub3JtYWxpemVSb3V0ZUNvbmZpZywgYXNzZXJ0Q29tcG9uZW50RXhpc3RzfSBmcm9tICcuL3JvdXRlX2NvbmZpZ19ub21hbGl6ZXInO1xuaW1wb3J0IHtwYXJzZXIsIFVybCwgcGF0aFNlZ21lbnRzVG9Vcmx9IGZyb20gJy4vdXJsX3BhcnNlcic7XG5cbnZhciBfcmVzb2x2ZVRvTnVsbCA9IFByb21pc2VXcmFwcGVyLnJlc29sdmUobnVsbCk7XG5cblxuXG4vKipcbiAqIFRva2VuIHVzZWQgdG8gYmluZCB0aGUgY29tcG9uZW50IHdpdGggdGhlIHRvcC1sZXZlbCB7QGxpbmsgUm91dGVDb25maWd9cyBmb3IgdGhlXG4gKiBhcHBsaWNhdGlvbi5cbiAqXG4gKiAjIyMgRXhhbXBsZSAoW2xpdmUgZGVtb10oaHR0cDovL3BsbmtyLmNvL2VkaXQvaVJVUDhCNU9VYnhDV1EzQWNJRG0pKVxuICpcbiAqIGBgYFxuICogaW1wb3J0IHtDb21wb25lbnR9IGZyb20gJ2FuZ3VsYXIyL2NvcmUnO1xuICogaW1wb3J0IHtcbiAqICAgUk9VVEVSX0RJUkVDVElWRVMsXG4gKiAgIFJPVVRFUl9QUk9WSURFUlMsXG4gKiAgIFJvdXRlQ29uZmlnXG4gKiB9IGZyb20gJ2FuZ3VsYXIyL3JvdXRlcic7XG4gKlxuICogQENvbXBvbmVudCh7ZGlyZWN0aXZlczogW1JPVVRFUl9ESVJFQ1RJVkVTXX0pXG4gKiBAUm91dGVDb25maWcoW1xuICogIHsuLi59LFxuICogXSlcbiAqIGNsYXNzIEFwcENtcCB7XG4gKiAgIC8vIC4uLlxuICogfVxuICpcbiAqIGJvb3RzdHJhcChBcHBDbXAsIFtST1VURVJfUFJPVklERVJTXSk7XG4gKiBgYGBcbiAqL1xuZXhwb3J0IGNvbnN0IFJPVVRFUl9QUklNQVJZX0NPTVBPTkVOVDogT3BhcXVlVG9rZW4gPVxuICAgIENPTlNUX0VYUFIobmV3IE9wYXF1ZVRva2VuKCdSb3V0ZXJQcmltYXJ5Q29tcG9uZW50JykpO1xuXG5cbi8qKlxuICogVGhlIFJvdXRlUmVnaXN0cnkgaG9sZHMgcm91dGUgY29uZmlndXJhdGlvbnMgZm9yIGVhY2ggY29tcG9uZW50IGluIGFuIEFuZ3VsYXIgYXBwLlxuICogSXQgaXMgcmVzcG9uc2libGUgZm9yIGNyZWF0aW5nIEluc3RydWN0aW9ucyBmcm9tIFVSTHMsIGFuZCBnZW5lcmF0aW5nIFVSTHMgYmFzZWQgb24gcm91dGUgYW5kXG4gKiBwYXJhbWV0ZXJzLlxuICovXG5ASW5qZWN0YWJsZSgpXG5leHBvcnQgY2xhc3MgUm91dGVSZWdpc3RyeSB7XG4gIHByaXZhdGUgX3J1bGVzID0gbmV3IE1hcDxhbnksIENvbXBvbmVudFJlY29nbml6ZXI+KCk7XG5cbiAgY29uc3RydWN0b3IoQEluamVjdChST1VURVJfUFJJTUFSWV9DT01QT05FTlQpIHByaXZhdGUgX3Jvb3RDb21wb25lbnQ6IFR5cGUpIHt9XG5cbiAgLyoqXG4gICAqIEdpdmVuIGEgY29tcG9uZW50IGFuZCBhIGNvbmZpZ3VyYXRpb24gb2JqZWN0LCBhZGQgdGhlIHJvdXRlIHRvIHRoaXMgcmVnaXN0cnlcbiAgICovXG4gIGNvbmZpZyhwYXJlbnRDb21wb25lbnQ6IGFueSwgY29uZmlnOiBSb3V0ZURlZmluaXRpb24pOiB2b2lkIHtcbiAgICBjb25maWcgPSBub3JtYWxpemVSb3V0ZUNvbmZpZyhjb25maWcsIHRoaXMpO1xuXG4gICAgLy8gdGhpcyBpcyBoZXJlIGJlY2F1c2UgRGFydCB0eXBlIGd1YXJkIHJlYXNvbnNcbiAgICBpZiAoY29uZmlnIGluc3RhbmNlb2YgUm91dGUpIHtcbiAgICAgIGFzc2VydENvbXBvbmVudEV4aXN0cyhjb25maWcuY29tcG9uZW50LCBjb25maWcucGF0aCk7XG4gICAgfSBlbHNlIGlmIChjb25maWcgaW5zdGFuY2VvZiBBdXhSb3V0ZSkge1xuICAgICAgYXNzZXJ0Q29tcG9uZW50RXhpc3RzKGNvbmZpZy5jb21wb25lbnQsIGNvbmZpZy5wYXRoKTtcbiAgICB9XG5cbiAgICB2YXIgcmVjb2duaXplcjogQ29tcG9uZW50UmVjb2duaXplciA9IHRoaXMuX3J1bGVzLmdldChwYXJlbnRDb21wb25lbnQpO1xuXG4gICAgaWYgKGlzQmxhbmsocmVjb2duaXplcikpIHtcbiAgICAgIHJlY29nbml6ZXIgPSBuZXcgQ29tcG9uZW50UmVjb2duaXplcigpO1xuICAgICAgdGhpcy5fcnVsZXMuc2V0KHBhcmVudENvbXBvbmVudCwgcmVjb2duaXplcik7XG4gICAgfVxuXG4gICAgdmFyIHRlcm1pbmFsID0gcmVjb2duaXplci5jb25maWcoY29uZmlnKTtcblxuICAgIGlmIChjb25maWcgaW5zdGFuY2VvZiBSb3V0ZSkge1xuICAgICAgaWYgKHRlcm1pbmFsKSB7XG4gICAgICAgIGFzc2VydFRlcm1pbmFsQ29tcG9uZW50KGNvbmZpZy5jb21wb25lbnQsIGNvbmZpZy5wYXRoKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMuY29uZmlnRnJvbUNvbXBvbmVudChjb25maWcuY29tcG9uZW50KTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogUmVhZHMgdGhlIGFubm90YXRpb25zIG9mIGEgY29tcG9uZW50IGFuZCBjb25maWd1cmVzIHRoZSByZWdpc3RyeSBiYXNlZCBvbiB0aGVtXG4gICAqL1xuICBjb25maWdGcm9tQ29tcG9uZW50KGNvbXBvbmVudDogYW55KTogdm9pZCB7XG4gICAgaWYgKCFpc1R5cGUoY29tcG9uZW50KSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIC8vIERvbid0IHJlYWQgdGhlIGFubm90YXRpb25zIGZyb20gYSB0eXBlIG1vcmUgdGhhbiBvbmNlIOKAk1xuICAgIC8vIHRoaXMgcHJldmVudHMgYW4gaW5maW5pdGUgbG9vcCBpZiBhIGNvbXBvbmVudCByb3V0ZXMgcmVjdXJzaXZlbHkuXG4gICAgaWYgKHRoaXMuX3J1bGVzLmhhcyhjb21wb25lbnQpKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIHZhciBhbm5vdGF0aW9ucyA9IHJlZmxlY3Rvci5hbm5vdGF0aW9ucyhjb21wb25lbnQpO1xuICAgIGlmIChpc1ByZXNlbnQoYW5ub3RhdGlvbnMpKSB7XG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGFubm90YXRpb25zLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIHZhciBhbm5vdGF0aW9uID0gYW5ub3RhdGlvbnNbaV07XG5cbiAgICAgICAgaWYgKGFubm90YXRpb24gaW5zdGFuY2VvZiBSb3V0ZUNvbmZpZykge1xuICAgICAgICAgIGxldCByb3V0ZUNmZ3M6IFJvdXRlRGVmaW5pdGlvbltdID0gYW5ub3RhdGlvbi5jb25maWdzO1xuICAgICAgICAgIHJvdXRlQ2Zncy5mb3JFYWNoKGNvbmZpZyA9PiB0aGlzLmNvbmZpZyhjb21wb25lbnQsIGNvbmZpZykpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9XG5cblxuICAvKipcbiAgICogR2l2ZW4gYSBVUkwgYW5kIGEgcGFyZW50IGNvbXBvbmVudCwgcmV0dXJuIHRoZSBtb3N0IHNwZWNpZmljIGluc3RydWN0aW9uIGZvciBuYXZpZ2F0aW5nXG4gICAqIHRoZSBhcHBsaWNhdGlvbiBpbnRvIHRoZSBzdGF0ZSBzcGVjaWZpZWQgYnkgdGhlIHVybFxuICAgKi9cbiAgcmVjb2duaXplKHVybDogc3RyaW5nLCBhbmNlc3Rvckluc3RydWN0aW9uczogSW5zdHJ1Y3Rpb25bXSk6IFByb21pc2U8SW5zdHJ1Y3Rpb24+IHtcbiAgICB2YXIgcGFyc2VkVXJsID0gcGFyc2VyLnBhcnNlKHVybCk7XG4gICAgcmV0dXJuIHRoaXMuX3JlY29nbml6ZShwYXJzZWRVcmwsIGFuY2VzdG9ySW5zdHJ1Y3Rpb25zKTtcbiAgfVxuXG5cbiAgLyoqXG4gICAqIFJlY29nbml6ZXMgYWxsIHBhcmVudC1jaGlsZCByb3V0ZXMsIGJ1dCBjcmVhdGVzIHVucmVzb2x2ZWQgYXV4aWxpYXJ5IHJvdXRlc1xuICAgKi9cblxuICBwcml2YXRlIF9yZWNvZ25pemUocGFyc2VkVXJsOiBVcmwsIGFuY2VzdG9ySW5zdHJ1Y3Rpb25zOiBJbnN0cnVjdGlvbltdLFxuICAgICAgICAgICAgICAgICAgICAgX2F1eCA9IGZhbHNlKTogUHJvbWlzZTxJbnN0cnVjdGlvbj4ge1xuICAgIHZhciBwYXJlbnRDb21wb25lbnQgPVxuICAgICAgICBhbmNlc3Rvckluc3RydWN0aW9ucy5sZW5ndGggPiAwID9cbiAgICAgICAgICAgIGFuY2VzdG9ySW5zdHJ1Y3Rpb25zW2FuY2VzdG9ySW5zdHJ1Y3Rpb25zLmxlbmd0aCAtIDFdLmNvbXBvbmVudC5jb21wb25lbnRUeXBlIDpcbiAgICAgICAgICAgIHRoaXMuX3Jvb3RDb21wb25lbnQ7XG5cbiAgICB2YXIgY29tcG9uZW50UmVjb2duaXplciA9IHRoaXMuX3J1bGVzLmdldChwYXJlbnRDb21wb25lbnQpO1xuICAgIGlmIChpc0JsYW5rKGNvbXBvbmVudFJlY29nbml6ZXIpKSB7XG4gICAgICByZXR1cm4gX3Jlc29sdmVUb051bGw7XG4gICAgfVxuXG4gICAgLy8gTWF0Y2hlcyBzb21lIGJlZ2lubmluZyBwYXJ0IG9mIHRoZSBnaXZlbiBVUkxcbiAgICB2YXIgcG9zc2libGVNYXRjaGVzOiBQcm9taXNlPFJvdXRlTWF0Y2g+W10gPVxuICAgICAgICBfYXV4ID8gY29tcG9uZW50UmVjb2duaXplci5yZWNvZ25pemVBdXhpbGlhcnkocGFyc2VkVXJsKSA6XG4gICAgICAgICAgICAgICBjb21wb25lbnRSZWNvZ25pemVyLnJlY29nbml6ZShwYXJzZWRVcmwpO1xuXG4gICAgdmFyIG1hdGNoUHJvbWlzZXM6IFByb21pc2U8SW5zdHJ1Y3Rpb24+W10gPSBwb3NzaWJsZU1hdGNoZXMubWFwKFxuICAgICAgICAoY2FuZGlkYXRlOiBQcm9taXNlPFJvdXRlTWF0Y2g+KSA9PiBjYW5kaWRhdGUudGhlbigoY2FuZGlkYXRlOiBSb3V0ZU1hdGNoKSA9PiB7XG5cbiAgICAgICAgICBpZiAoY2FuZGlkYXRlIGluc3RhbmNlb2YgUGF0aE1hdGNoKSB7XG4gICAgICAgICAgICB2YXIgYXV4UGFyZW50SW5zdHJ1Y3Rpb25zID1cbiAgICAgICAgICAgICAgICBhbmNlc3Rvckluc3RydWN0aW9ucy5sZW5ndGggPiAwID9cbiAgICAgICAgICAgICAgICAgICAgW2FuY2VzdG9ySW5zdHJ1Y3Rpb25zW2FuY2VzdG9ySW5zdHJ1Y3Rpb25zLmxlbmd0aCAtIDFdXSA6XG4gICAgICAgICAgICAgICAgICAgIFtdO1xuICAgICAgICAgICAgdmFyIGF1eEluc3RydWN0aW9ucyA9XG4gICAgICAgICAgICAgICAgdGhpcy5fYXV4Um91dGVzVG9VbnJlc29sdmVkKGNhbmRpZGF0ZS5yZW1haW5pbmdBdXgsIGF1eFBhcmVudEluc3RydWN0aW9ucyk7XG4gICAgICAgICAgICB2YXIgaW5zdHJ1Y3Rpb24gPSBuZXcgUmVzb2x2ZWRJbnN0cnVjdGlvbihjYW5kaWRhdGUuaW5zdHJ1Y3Rpb24sIG51bGwsIGF1eEluc3RydWN0aW9ucyk7XG5cbiAgICAgICAgICAgIGlmIChjYW5kaWRhdGUuaW5zdHJ1Y3Rpb24udGVybWluYWwpIHtcbiAgICAgICAgICAgICAgcmV0dXJuIGluc3RydWN0aW9uO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB2YXIgbmV3QW5jZXN0b3JDb21wb25lbnRzID0gYW5jZXN0b3JJbnN0cnVjdGlvbnMuY29uY2F0KFtpbnN0cnVjdGlvbl0pO1xuXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5fcmVjb2duaXplKGNhbmRpZGF0ZS5yZW1haW5pbmcsIG5ld0FuY2VzdG9yQ29tcG9uZW50cylcbiAgICAgICAgICAgICAgICAudGhlbigoY2hpbGRJbnN0cnVjdGlvbikgPT4ge1xuICAgICAgICAgICAgICAgICAgaWYgKGlzQmxhbmsoY2hpbGRJbnN0cnVjdGlvbikpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgIC8vIHJlZGlyZWN0IGluc3RydWN0aW9ucyBhcmUgYWxyZWFkeSBhYnNvbHV0ZVxuICAgICAgICAgICAgICAgICAgaWYgKGNoaWxkSW5zdHJ1Y3Rpb24gaW5zdGFuY2VvZiBSZWRpcmVjdEluc3RydWN0aW9uKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBjaGlsZEluc3RydWN0aW9uO1xuICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgaW5zdHJ1Y3Rpb24uY2hpbGQgPSBjaGlsZEluc3RydWN0aW9uO1xuICAgICAgICAgICAgICAgICAgcmV0dXJuIGluc3RydWN0aW9uO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGlmIChjYW5kaWRhdGUgaW5zdGFuY2VvZiBSZWRpcmVjdE1hdGNoKSB7XG4gICAgICAgICAgICB2YXIgaW5zdHJ1Y3Rpb24gPSB0aGlzLmdlbmVyYXRlKGNhbmRpZGF0ZS5yZWRpcmVjdFRvLCBhbmNlc3Rvckluc3RydWN0aW9ucyk7XG4gICAgICAgICAgICByZXR1cm4gbmV3IFJlZGlyZWN0SW5zdHJ1Y3Rpb24oaW5zdHJ1Y3Rpb24uY29tcG9uZW50LCBpbnN0cnVjdGlvbi5jaGlsZCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpbnN0cnVjdGlvbi5hdXhJbnN0cnVjdGlvbiwgY2FuZGlkYXRlLnNwZWNpZmljaXR5KTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pKTtcblxuICAgIGlmICgoaXNCbGFuayhwYXJzZWRVcmwpIHx8IHBhcnNlZFVybC5wYXRoID09ICcnKSAmJiBwb3NzaWJsZU1hdGNoZXMubGVuZ3RoID09IDApIHtcbiAgICAgIHJldHVybiBQcm9taXNlV3JhcHBlci5yZXNvbHZlKHRoaXMuZ2VuZXJhdGVEZWZhdWx0KHBhcmVudENvbXBvbmVudCkpO1xuICAgIH1cblxuICAgIHJldHVybiBQcm9taXNlV3JhcHBlci5hbGwobWF0Y2hQcm9taXNlcykudGhlbihtb3N0U3BlY2lmaWMpO1xuICB9XG5cbiAgcHJpdmF0ZSBfYXV4Um91dGVzVG9VbnJlc29sdmVkKGF1eFJvdXRlczogVXJsW10sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwYXJlbnRJbnN0cnVjdGlvbnM6IEluc3RydWN0aW9uW10pOiB7W2tleTogc3RyaW5nXTogSW5zdHJ1Y3Rpb259IHtcbiAgICB2YXIgdW5yZXNvbHZlZEF1eEluc3RydWN0aW9uczoge1trZXk6IHN0cmluZ106IEluc3RydWN0aW9ufSA9IHt9O1xuXG4gICAgYXV4Um91dGVzLmZvckVhY2goKGF1eFVybDogVXJsKSA9PiB7XG4gICAgICB1bnJlc29sdmVkQXV4SW5zdHJ1Y3Rpb25zW2F1eFVybC5wYXRoXSA9IG5ldyBVbnJlc29sdmVkSW5zdHJ1Y3Rpb24oXG4gICAgICAgICAgKCkgPT4geyByZXR1cm4gdGhpcy5fcmVjb2duaXplKGF1eFVybCwgcGFyZW50SW5zdHJ1Y3Rpb25zLCB0cnVlKTsgfSk7XG4gICAgfSk7XG5cbiAgICByZXR1cm4gdW5yZXNvbHZlZEF1eEluc3RydWN0aW9ucztcbiAgfVxuXG5cbiAgLyoqXG4gICAqIEdpdmVuIGEgbm9ybWFsaXplZCBsaXN0IHdpdGggY29tcG9uZW50IG5hbWVzIGFuZCBwYXJhbXMgbGlrZTogYFsndXNlcicsIHtpZDogMyB9XWBcbiAgICogZ2VuZXJhdGVzIGEgdXJsIHdpdGggYSBsZWFkaW5nIHNsYXNoIHJlbGF0aXZlIHRvIHRoZSBwcm92aWRlZCBgcGFyZW50Q29tcG9uZW50YC5cbiAgICpcbiAgICogSWYgdGhlIG9wdGlvbmFsIHBhcmFtIGBfYXV4YCBpcyBgdHJ1ZWAsIHRoZW4gd2UgZ2VuZXJhdGUgc3RhcnRpbmcgYXQgYW4gYXV4aWxpYXJ5XG4gICAqIHJvdXRlIGJvdW5kYXJ5LlxuICAgKi9cbiAgZ2VuZXJhdGUobGlua1BhcmFtczogYW55W10sIGFuY2VzdG9ySW5zdHJ1Y3Rpb25zOiBJbnN0cnVjdGlvbltdLCBfYXV4ID0gZmFsc2UpOiBJbnN0cnVjdGlvbiB7XG4gICAgbGV0IG5vcm1hbGl6ZWRMaW5rUGFyYW1zID0gc3BsaXRBbmRGbGF0dGVuTGlua1BhcmFtcyhsaW5rUGFyYW1zKTtcblxuICAgIHZhciBmaXJzdCA9IExpc3RXcmFwcGVyLmZpcnN0KG5vcm1hbGl6ZWRMaW5rUGFyYW1zKTtcbiAgICB2YXIgcmVzdCA9IExpc3RXcmFwcGVyLnNsaWNlKG5vcm1hbGl6ZWRMaW5rUGFyYW1zLCAxKTtcblxuICAgIC8vIFRoZSBmaXJzdCBzZWdtZW50IHNob3VsZCBiZSBlaXRoZXIgJy4nIChnZW5lcmF0ZSBmcm9tIHBhcmVudCkgb3IgJycgKGdlbmVyYXRlIGZyb20gcm9vdCkuXG4gICAgLy8gV2hlbiB3ZSBub3JtYWxpemUgYWJvdmUsIHdlIHN0cmlwIGFsbCB0aGUgc2xhc2hlcywgJy4vJyBiZWNvbWVzICcuJyBhbmQgJy8nIGJlY29tZXMgJycuXG4gICAgaWYgKGZpcnN0ID09ICcnKSB7XG4gICAgICBhbmNlc3Rvckluc3RydWN0aW9ucyA9IFtdO1xuICAgIH0gZWxzZSBpZiAoZmlyc3QgPT0gJy4uJykge1xuICAgICAgLy8gd2UgYWxyZWFkeSBjYXB0dXJlZCB0aGUgZmlyc3QgaW5zdGFuY2Ugb2YgXCIuLlwiLCBzbyB3ZSBuZWVkIHRvIHBvcCBvZmYgYW4gYW5jZXN0b3JcbiAgICAgIGFuY2VzdG9ySW5zdHJ1Y3Rpb25zLnBvcCgpO1xuICAgICAgd2hpbGUgKExpc3RXcmFwcGVyLmZpcnN0KHJlc3QpID09ICcuLicpIHtcbiAgICAgICAgcmVzdCA9IExpc3RXcmFwcGVyLnNsaWNlKHJlc3QsIDEpO1xuICAgICAgICBhbmNlc3Rvckluc3RydWN0aW9ucy5wb3AoKTtcbiAgICAgICAgaWYgKGFuY2VzdG9ySW5zdHJ1Y3Rpb25zLmxlbmd0aCA8PSAwKSB7XG4gICAgICAgICAgdGhyb3cgbmV3IEJhc2VFeGNlcHRpb24oXG4gICAgICAgICAgICAgIGBMaW5rIFwiJHtMaXN0V3JhcHBlci50b0pTT04obGlua1BhcmFtcyl9XCIgaGFzIHRvbyBtYW55IFwiLi4vXCIgc2VnbWVudHMuYCk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9IGVsc2UgaWYgKGZpcnN0ICE9ICcuJykge1xuICAgICAgbGV0IHBhcmVudENvbXBvbmVudCA9IHRoaXMuX3Jvb3RDb21wb25lbnQ7XG4gICAgICBsZXQgZ3JhbmRwYXJlbnRDb21wb25lbnQgPSBudWxsO1xuICAgICAgaWYgKGFuY2VzdG9ySW5zdHJ1Y3Rpb25zLmxlbmd0aCA+IDEpIHtcbiAgICAgICAgcGFyZW50Q29tcG9uZW50ID1cbiAgICAgICAgICAgIGFuY2VzdG9ySW5zdHJ1Y3Rpb25zW2FuY2VzdG9ySW5zdHJ1Y3Rpb25zLmxlbmd0aCAtIDFdLmNvbXBvbmVudC5jb21wb25lbnRUeXBlO1xuICAgICAgICBncmFuZHBhcmVudENvbXBvbmVudCA9XG4gICAgICAgICAgICBhbmNlc3Rvckluc3RydWN0aW9uc1thbmNlc3Rvckluc3RydWN0aW9ucy5sZW5ndGggLSAyXS5jb21wb25lbnQuY29tcG9uZW50VHlwZTtcbiAgICAgIH0gZWxzZSBpZiAoYW5jZXN0b3JJbnN0cnVjdGlvbnMubGVuZ3RoID09IDEpIHtcbiAgICAgICAgcGFyZW50Q29tcG9uZW50ID0gYW5jZXN0b3JJbnN0cnVjdGlvbnNbMF0uY29tcG9uZW50LmNvbXBvbmVudFR5cGU7XG4gICAgICAgIGdyYW5kcGFyZW50Q29tcG9uZW50ID0gdGhpcy5fcm9vdENvbXBvbmVudDtcbiAgICAgIH1cblxuICAgICAgLy8gRm9yIGEgbGluayB3aXRoIG5vIGxlYWRpbmcgYC4vYCwgYC9gLCBvciBgLi4vYCwgd2UgbG9vayBmb3IgYSBzaWJsaW5nIGFuZCBjaGlsZC5cbiAgICAgIC8vIElmIGJvdGggZXhpc3QsIHdlIHRocm93LiBPdGhlcndpc2UsIHdlIHByZWZlciB3aGljaGV2ZXIgZXhpc3RzLlxuICAgICAgdmFyIGNoaWxkUm91dGVFeGlzdHMgPSB0aGlzLmhhc1JvdXRlKGZpcnN0LCBwYXJlbnRDb21wb25lbnQpO1xuICAgICAgdmFyIHBhcmVudFJvdXRlRXhpc3RzID1cbiAgICAgICAgICBpc1ByZXNlbnQoZ3JhbmRwYXJlbnRDb21wb25lbnQpICYmIHRoaXMuaGFzUm91dGUoZmlyc3QsIGdyYW5kcGFyZW50Q29tcG9uZW50KTtcblxuICAgICAgaWYgKHBhcmVudFJvdXRlRXhpc3RzICYmIGNoaWxkUm91dGVFeGlzdHMpIHtcbiAgICAgICAgbGV0IG1zZyA9XG4gICAgICAgICAgICBgTGluayBcIiR7TGlzdFdyYXBwZXIudG9KU09OKGxpbmtQYXJhbXMpfVwiIGlzIGFtYmlndW91cywgdXNlIFwiLi9cIiBvciBcIi4uL1wiIHRvIGRpc2FtYmlndWF0ZS5gO1xuICAgICAgICB0aHJvdyBuZXcgQmFzZUV4Y2VwdGlvbihtc2cpO1xuICAgICAgfVxuICAgICAgaWYgKHBhcmVudFJvdXRlRXhpc3RzKSB7XG4gICAgICAgIGFuY2VzdG9ySW5zdHJ1Y3Rpb25zLnBvcCgpO1xuICAgICAgfVxuICAgICAgcmVzdCA9IGxpbmtQYXJhbXM7XG4gICAgfVxuXG4gICAgaWYgKHJlc3RbcmVzdC5sZW5ndGggLSAxXSA9PSAnJykge1xuICAgICAgcmVzdC5wb3AoKTtcbiAgICB9XG5cbiAgICBpZiAocmVzdC5sZW5ndGggPCAxKSB7XG4gICAgICBsZXQgbXNnID0gYExpbmsgXCIke0xpc3RXcmFwcGVyLnRvSlNPTihsaW5rUGFyYW1zKX1cIiBtdXN0IGluY2x1ZGUgYSByb3V0ZSBuYW1lLmA7XG4gICAgICB0aHJvdyBuZXcgQmFzZUV4Y2VwdGlvbihtc2cpO1xuICAgIH1cblxuICAgIHZhciBnZW5lcmF0ZWRJbnN0cnVjdGlvbiA9IHRoaXMuX2dlbmVyYXRlKHJlc3QsIGFuY2VzdG9ySW5zdHJ1Y3Rpb25zLCBfYXV4KTtcblxuICAgIGZvciAodmFyIGkgPSBhbmNlc3Rvckluc3RydWN0aW9ucy5sZW5ndGggLSAxOyBpID49IDA7IGktLSkge1xuICAgICAgbGV0IGFuY2VzdG9ySW5zdHJ1Y3Rpb24gPSBhbmNlc3Rvckluc3RydWN0aW9uc1tpXTtcbiAgICAgIGdlbmVyYXRlZEluc3RydWN0aW9uID0gYW5jZXN0b3JJbnN0cnVjdGlvbi5yZXBsYWNlQ2hpbGQoZ2VuZXJhdGVkSW5zdHJ1Y3Rpb24pO1xuICAgIH1cblxuICAgIHJldHVybiBnZW5lcmF0ZWRJbnN0cnVjdGlvbjtcbiAgfVxuXG5cbiAgLypcbiAgICogSW50ZXJuYWwgaGVscGVyIHRoYXQgZG9lcyBub3QgbWFrZSBhbnkgYXNzZXJ0aW9ucyBhYm91dCB0aGUgYmVnaW5uaW5nIG9mIHRoZSBsaW5rIERTTFxuICAgKi9cbiAgcHJpdmF0ZSBfZ2VuZXJhdGUobGlua1BhcmFtczogYW55W10sIGFuY2VzdG9ySW5zdHJ1Y3Rpb25zOiBJbnN0cnVjdGlvbltdLFxuICAgICAgICAgICAgICAgICAgICBfYXV4ID0gZmFsc2UpOiBJbnN0cnVjdGlvbiB7XG4gICAgbGV0IHBhcmVudENvbXBvbmVudCA9XG4gICAgICAgIGFuY2VzdG9ySW5zdHJ1Y3Rpb25zLmxlbmd0aCA+IDAgP1xuICAgICAgICAgICAgYW5jZXN0b3JJbnN0cnVjdGlvbnNbYW5jZXN0b3JJbnN0cnVjdGlvbnMubGVuZ3RoIC0gMV0uY29tcG9uZW50LmNvbXBvbmVudFR5cGUgOlxuICAgICAgICAgICAgdGhpcy5fcm9vdENvbXBvbmVudDtcblxuXG4gICAgaWYgKGxpbmtQYXJhbXMubGVuZ3RoID09IDApIHtcbiAgICAgIHJldHVybiB0aGlzLmdlbmVyYXRlRGVmYXVsdChwYXJlbnRDb21wb25lbnQpO1xuICAgIH1cbiAgICBsZXQgbGlua0luZGV4ID0gMDtcbiAgICBsZXQgcm91dGVOYW1lID0gbGlua1BhcmFtc1tsaW5rSW5kZXhdO1xuXG4gICAgaWYgKCFpc1N0cmluZyhyb3V0ZU5hbWUpKSB7XG4gICAgICB0aHJvdyBuZXcgQmFzZUV4Y2VwdGlvbihgVW5leHBlY3RlZCBzZWdtZW50IFwiJHtyb3V0ZU5hbWV9XCIgaW4gbGluayBEU0wuIEV4cGVjdGVkIGEgc3RyaW5nLmApO1xuICAgIH0gZWxzZSBpZiAocm91dGVOYW1lID09ICcnIHx8IHJvdXRlTmFtZSA9PSAnLicgfHwgcm91dGVOYW1lID09ICcuLicpIHtcbiAgICAgIHRocm93IG5ldyBCYXNlRXhjZXB0aW9uKGBcIiR7cm91dGVOYW1lfS9cIiBpcyBvbmx5IGFsbG93ZWQgYXQgdGhlIGJlZ2lubmluZyBvZiBhIGxpbmsgRFNMLmApO1xuICAgIH1cblxuICAgIGxldCBwYXJhbXMgPSB7fTtcbiAgICBpZiAobGlua0luZGV4ICsgMSA8IGxpbmtQYXJhbXMubGVuZ3RoKSB7XG4gICAgICBsZXQgbmV4dFNlZ21lbnQgPSBsaW5rUGFyYW1zW2xpbmtJbmRleCArIDFdO1xuICAgICAgaWYgKGlzU3RyaW5nTWFwKG5leHRTZWdtZW50KSAmJiAhaXNBcnJheShuZXh0U2VnbWVudCkpIHtcbiAgICAgICAgcGFyYW1zID0gbmV4dFNlZ21lbnQ7XG4gICAgICAgIGxpbmtJbmRleCArPSAxO1xuICAgICAgfVxuICAgIH1cblxuICAgIGxldCBhdXhJbnN0cnVjdGlvbnM6IHtba2V5OiBzdHJpbmddOiBJbnN0cnVjdGlvbn0gPSB7fTtcbiAgICB2YXIgbmV4dFNlZ21lbnQ7XG4gICAgd2hpbGUgKGxpbmtJbmRleCArIDEgPCBsaW5rUGFyYW1zLmxlbmd0aCAmJiBpc0FycmF5KG5leHRTZWdtZW50ID0gbGlua1BhcmFtc1tsaW5rSW5kZXggKyAxXSkpIHtcbiAgICAgIGxldCBhdXhQYXJlbnRJbnN0cnVjdGlvbiA9IGFuY2VzdG9ySW5zdHJ1Y3Rpb25zLmxlbmd0aCA+IDAgP1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFthbmNlc3Rvckluc3RydWN0aW9uc1thbmNlc3Rvckluc3RydWN0aW9ucy5sZW5ndGggLSAxXV0gOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFtdO1xuICAgICAgbGV0IGF1eEluc3RydWN0aW9uID0gdGhpcy5fZ2VuZXJhdGUobmV4dFNlZ21lbnQsIGF1eFBhcmVudEluc3RydWN0aW9uLCB0cnVlKTtcblxuICAgICAgLy8gVE9ETzogdGhpcyB3aWxsIG5vdCB3b3JrIGZvciBhdXggcm91dGVzIHdpdGggcGFyYW1ldGVycyBvciBtdWx0aXBsZSBzZWdtZW50c1xuICAgICAgYXV4SW5zdHJ1Y3Rpb25zW2F1eEluc3RydWN0aW9uLmNvbXBvbmVudC51cmxQYXRoXSA9IGF1eEluc3RydWN0aW9uO1xuICAgICAgbGlua0luZGV4ICs9IDE7XG4gICAgfVxuXG4gICAgdmFyIGNvbXBvbmVudFJlY29nbml6ZXIgPSB0aGlzLl9ydWxlcy5nZXQocGFyZW50Q29tcG9uZW50KTtcbiAgICBpZiAoaXNCbGFuayhjb21wb25lbnRSZWNvZ25pemVyKSkge1xuICAgICAgdGhyb3cgbmV3IEJhc2VFeGNlcHRpb24oXG4gICAgICAgICAgYENvbXBvbmVudCBcIiR7Z2V0VHlwZU5hbWVGb3JEZWJ1Z2dpbmcocGFyZW50Q29tcG9uZW50KX1cIiBoYXMgbm8gcm91dGUgY29uZmlnLmApO1xuICAgIH1cblxuICAgIHZhciByb3V0ZVJlY29nbml6ZXIgPVxuICAgICAgICAoX2F1eCA/IGNvbXBvbmVudFJlY29nbml6ZXIuYXV4TmFtZXMgOiBjb21wb25lbnRSZWNvZ25pemVyLm5hbWVzKS5nZXQocm91dGVOYW1lKTtcblxuICAgIGlmICghaXNQcmVzZW50KHJvdXRlUmVjb2duaXplcikpIHtcbiAgICAgIHRocm93IG5ldyBCYXNlRXhjZXB0aW9uKFxuICAgICAgICAgIGBDb21wb25lbnQgXCIke2dldFR5cGVOYW1lRm9yRGVidWdnaW5nKHBhcmVudENvbXBvbmVudCl9XCIgaGFzIG5vIHJvdXRlIG5hbWVkIFwiJHtyb3V0ZU5hbWV9XCIuYCk7XG4gICAgfVxuXG4gICAgaWYgKCFpc1ByZXNlbnQocm91dGVSZWNvZ25pemVyLmhhbmRsZXIuY29tcG9uZW50VHlwZSkpIHtcbiAgICAgIHZhciBjb21wSW5zdHJ1Y3Rpb24gPSByb3V0ZVJlY29nbml6ZXIuZ2VuZXJhdGVDb21wb25lbnRQYXRoVmFsdWVzKHBhcmFtcyk7XG4gICAgICByZXR1cm4gbmV3IFVucmVzb2x2ZWRJbnN0cnVjdGlvbigoKSA9PiB7XG4gICAgICAgIHJldHVybiByb3V0ZVJlY29nbml6ZXIuaGFuZGxlci5yZXNvbHZlQ29tcG9uZW50VHlwZSgpLnRoZW4oXG4gICAgICAgICAgICAoXykgPT4geyByZXR1cm4gdGhpcy5fZ2VuZXJhdGUobGlua1BhcmFtcywgYW5jZXN0b3JJbnN0cnVjdGlvbnMsIF9hdXgpOyB9KTtcbiAgICAgIH0sIGNvbXBJbnN0cnVjdGlvblsndXJsUGF0aCddLCBjb21wSW5zdHJ1Y3Rpb25bJ3VybFBhcmFtcyddKTtcbiAgICB9XG5cbiAgICB2YXIgY29tcG9uZW50SW5zdHJ1Y3Rpb24gPSBfYXV4ID8gY29tcG9uZW50UmVjb2duaXplci5nZW5lcmF0ZUF1eGlsaWFyeShyb3V0ZU5hbWUsIHBhcmFtcykgOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb21wb25lbnRSZWNvZ25pemVyLmdlbmVyYXRlKHJvdXRlTmFtZSwgcGFyYW1zKTtcblxuXG5cbiAgICB2YXIgcmVtYWluaW5nID0gbGlua1BhcmFtcy5zbGljZShsaW5rSW5kZXggKyAxKTtcblxuICAgIHZhciBpbnN0cnVjdGlvbiA9IG5ldyBSZXNvbHZlZEluc3RydWN0aW9uKGNvbXBvbmVudEluc3RydWN0aW9uLCBudWxsLCBhdXhJbnN0cnVjdGlvbnMpO1xuXG4gICAgLy8gdGhlIGNvbXBvbmVudCBpcyBzeW5jXG4gICAgaWYgKGlzUHJlc2VudChjb21wb25lbnRJbnN0cnVjdGlvbi5jb21wb25lbnRUeXBlKSkge1xuICAgICAgbGV0IGNoaWxkSW5zdHJ1Y3Rpb246IEluc3RydWN0aW9uID0gbnVsbDtcbiAgICAgIGlmIChsaW5rSW5kZXggKyAxIDwgbGlua1BhcmFtcy5sZW5ndGgpIHtcbiAgICAgICAgbGV0IGNoaWxkQW5jZXN0b3JDb21wb25lbnRzID0gYW5jZXN0b3JJbnN0cnVjdGlvbnMuY29uY2F0KFtpbnN0cnVjdGlvbl0pO1xuICAgICAgICBjaGlsZEluc3RydWN0aW9uID0gdGhpcy5fZ2VuZXJhdGUocmVtYWluaW5nLCBjaGlsZEFuY2VzdG9yQ29tcG9uZW50cyk7XG4gICAgICB9IGVsc2UgaWYgKCFjb21wb25lbnRJbnN0cnVjdGlvbi50ZXJtaW5hbCkge1xuICAgICAgICAvLyAuLi4gbG9vayBmb3IgZGVmYXVsdHNcbiAgICAgICAgY2hpbGRJbnN0cnVjdGlvbiA9IHRoaXMuZ2VuZXJhdGVEZWZhdWx0KGNvbXBvbmVudEluc3RydWN0aW9uLmNvbXBvbmVudFR5cGUpO1xuXG4gICAgICAgIGlmIChpc0JsYW5rKGNoaWxkSW5zdHJ1Y3Rpb24pKSB7XG4gICAgICAgICAgdGhyb3cgbmV3IEJhc2VFeGNlcHRpb24oXG4gICAgICAgICAgICAgIGBMaW5rIFwiJHtMaXN0V3JhcHBlci50b0pTT04obGlua1BhcmFtcyl9XCIgZG9lcyBub3QgcmVzb2x2ZSB0byBhIHRlcm1pbmFsIGluc3RydWN0aW9uLmApO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBpbnN0cnVjdGlvbi5jaGlsZCA9IGNoaWxkSW5zdHJ1Y3Rpb247XG4gICAgfVxuXG4gICAgcmV0dXJuIGluc3RydWN0aW9uO1xuICB9XG5cbiAgcHVibGljIGhhc1JvdXRlKG5hbWU6IHN0cmluZywgcGFyZW50Q29tcG9uZW50OiBhbnkpOiBib29sZWFuIHtcbiAgICB2YXIgY29tcG9uZW50UmVjb2duaXplcjogQ29tcG9uZW50UmVjb2duaXplciA9IHRoaXMuX3J1bGVzLmdldChwYXJlbnRDb21wb25lbnQpO1xuICAgIGlmIChpc0JsYW5rKGNvbXBvbmVudFJlY29nbml6ZXIpKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIHJldHVybiBjb21wb25lbnRSZWNvZ25pemVyLmhhc1JvdXRlKG5hbWUpO1xuICB9XG5cbiAgcHVibGljIGdlbmVyYXRlRGVmYXVsdChjb21wb25lbnRDdXJzb3I6IFR5cGUpOiBJbnN0cnVjdGlvbiB7XG4gICAgaWYgKGlzQmxhbmsoY29tcG9uZW50Q3Vyc29yKSkge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuXG4gICAgdmFyIGNvbXBvbmVudFJlY29nbml6ZXIgPSB0aGlzLl9ydWxlcy5nZXQoY29tcG9uZW50Q3Vyc29yKTtcbiAgICBpZiAoaXNCbGFuayhjb21wb25lbnRSZWNvZ25pemVyKSB8fCBpc0JsYW5rKGNvbXBvbmVudFJlY29nbml6ZXIuZGVmYXVsdFJvdXRlKSkge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuXG5cbiAgICB2YXIgZGVmYXVsdENoaWxkID0gbnVsbDtcbiAgICBpZiAoaXNQcmVzZW50KGNvbXBvbmVudFJlY29nbml6ZXIuZGVmYXVsdFJvdXRlLmhhbmRsZXIuY29tcG9uZW50VHlwZSkpIHtcbiAgICAgIHZhciBjb21wb25lbnRJbnN0cnVjdGlvbiA9IGNvbXBvbmVudFJlY29nbml6ZXIuZGVmYXVsdFJvdXRlLmdlbmVyYXRlKHt9KTtcbiAgICAgIGlmICghY29tcG9uZW50UmVjb2duaXplci5kZWZhdWx0Um91dGUudGVybWluYWwpIHtcbiAgICAgICAgZGVmYXVsdENoaWxkID0gdGhpcy5nZW5lcmF0ZURlZmF1bHQoY29tcG9uZW50UmVjb2duaXplci5kZWZhdWx0Um91dGUuaGFuZGxlci5jb21wb25lbnRUeXBlKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBuZXcgRGVmYXVsdEluc3RydWN0aW9uKGNvbXBvbmVudEluc3RydWN0aW9uLCBkZWZhdWx0Q2hpbGQpO1xuICAgIH1cblxuICAgIHJldHVybiBuZXcgVW5yZXNvbHZlZEluc3RydWN0aW9uKCgpID0+IHtcbiAgICAgIHJldHVybiBjb21wb25lbnRSZWNvZ25pemVyLmRlZmF1bHRSb3V0ZS5oYW5kbGVyLnJlc29sdmVDb21wb25lbnRUeXBlKCkudGhlbihcbiAgICAgICAgICAoXykgPT4gdGhpcy5nZW5lcmF0ZURlZmF1bHQoY29tcG9uZW50Q3Vyc29yKSk7XG4gICAgfSk7XG4gIH1cbn1cblxuLypcbiAqIEdpdmVuOiBbJy9hL2InLCB7YzogMn1dXG4gKiBSZXR1cm5zOiBbJycsICdhJywgJ2InLCB7YzogMn1dXG4gKi9cbmZ1bmN0aW9uIHNwbGl0QW5kRmxhdHRlbkxpbmtQYXJhbXMobGlua1BhcmFtczogYW55W10pOiBhbnlbXSB7XG4gIHJldHVybiBsaW5rUGFyYW1zLnJlZHVjZSgoYWNjdW11bGF0aW9uOiBhbnlbXSwgaXRlbSkgPT4ge1xuICAgIGlmIChpc1N0cmluZyhpdGVtKSkge1xuICAgICAgbGV0IHN0ckl0ZW06IHN0cmluZyA9IGl0ZW07XG4gICAgICByZXR1cm4gYWNjdW11bGF0aW9uLmNvbmNhdChzdHJJdGVtLnNwbGl0KCcvJykpO1xuICAgIH1cbiAgICBhY2N1bXVsYXRpb24ucHVzaChpdGVtKTtcbiAgICByZXR1cm4gYWNjdW11bGF0aW9uO1xuICB9LCBbXSk7XG59XG5cbi8qXG4gKiBHaXZlbiBhIGxpc3Qgb2YgaW5zdHJ1Y3Rpb25zLCByZXR1cm5zIHRoZSBtb3N0IHNwZWNpZmljIGluc3RydWN0aW9uXG4gKi9cbmZ1bmN0aW9uIG1vc3RTcGVjaWZpYyhpbnN0cnVjdGlvbnM6IEluc3RydWN0aW9uW10pOiBJbnN0cnVjdGlvbiB7XG4gIHJldHVybiBMaXN0V3JhcHBlci5tYXhpbXVtKGluc3RydWN0aW9ucywgKGluc3RydWN0aW9uOiBJbnN0cnVjdGlvbikgPT4gaW5zdHJ1Y3Rpb24uc3BlY2lmaWNpdHkpO1xufVxuXG5mdW5jdGlvbiBhc3NlcnRUZXJtaW5hbENvbXBvbmVudChjb21wb25lbnQsIHBhdGgpIHtcbiAgaWYgKCFpc1R5cGUoY29tcG9uZW50KSkge1xuICAgIHJldHVybjtcbiAgfVxuXG4gIHZhciBhbm5vdGF0aW9ucyA9IHJlZmxlY3Rvci5hbm5vdGF0aW9ucyhjb21wb25lbnQpO1xuICBpZiAoaXNQcmVzZW50KGFubm90YXRpb25zKSkge1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgYW5ub3RhdGlvbnMubGVuZ3RoOyBpKyspIHtcbiAgICAgIHZhciBhbm5vdGF0aW9uID0gYW5ub3RhdGlvbnNbaV07XG5cbiAgICAgIGlmIChhbm5vdGF0aW9uIGluc3RhbmNlb2YgUm91dGVDb25maWcpIHtcbiAgICAgICAgdGhyb3cgbmV3IEJhc2VFeGNlcHRpb24oXG4gICAgICAgICAgICBgQ2hpbGQgcm91dGVzIGFyZSBub3QgYWxsb3dlZCBmb3IgXCIke3BhdGh9XCIuIFVzZSBcIi4uLlwiIG9uIHRoZSBwYXJlbnQncyByb3V0ZSBwYXRoLmApO1xuICAgICAgfVxuICAgIH1cbiAgfVxufVxuIl19