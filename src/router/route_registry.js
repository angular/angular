'use strict';var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") return Reflect.decorate(decorators, target, key, desc);
    switch (arguments.length) {
        case 2: return decorators.reduceRight(function(o, d) { return (d && d(o)) || o; }, target);
        case 3: return decorators.reduceRight(function(o, d) { return (d && d(target, key)), void 0; }, void 0);
        case 4: return decorators.reduceRight(function(o, d) { return (d && d(target, key, o)) || o; }, desc);
    }
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
            return componentRecognizer.defaultRoute.handler.resolveComponentType().then(function () { return _this.generateDefault(componentCursor); });
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
//# sourceMappingURL=route_registry.js.map