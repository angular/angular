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
var collection_1 = require('angular2/src/facade/collection');
var async_1 = require('angular2/src/facade/async');
var lang_1 = require('angular2/src/facade/lang');
var exceptions_1 = require('angular2/src/facade/exceptions');
var reflection_1 = require('angular2/src/core/reflection/reflection');
var route_config_impl_1 = require('./route_config_impl');
var route_recognizer_1 = require('./route_recognizer');
var component_recognizer_1 = require('./component_recognizer');
var instruction_1 = require('./instruction');
var angular2_1 = require('angular2/angular2');
var route_config_nomalizer_1 = require('./route_config_nomalizer');
var url_parser_1 = require('./url_parser');
var _resolveToNull = async_1.PromiseWrapper.resolve(null);
/**
 * The RouteRegistry holds route configurations for each component in an Angular app.
 * It is responsible for creating Instructions from URLs, and generating URLs based on route and
 * parameters.
 */
var RouteRegistry = (function () {
    function RouteRegistry() {
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
    RouteRegistry.prototype.recognize = function (url, ancestorComponents) {
        var parsedUrl = url_parser_1.parser.parse(url);
        return this._recognize(parsedUrl, ancestorComponents);
    };
    /**
     * Recognizes all parent-child routes, but creates unresolved auxiliary routes
     */
    RouteRegistry.prototype._recognize = function (parsedUrl, ancestorComponents, _aux) {
        var _this = this;
        if (_aux === void 0) { _aux = false; }
        var parentComponent = ancestorComponents[ancestorComponents.length - 1];
        var componentRecognizer = this._rules.get(parentComponent);
        if (lang_1.isBlank(componentRecognizer)) {
            return _resolveToNull;
        }
        // Matches some beginning part of the given URL
        var possibleMatches = _aux ? componentRecognizer.recognizeAuxiliary(parsedUrl) :
            componentRecognizer.recognize(parsedUrl);
        var matchPromises = possibleMatches.map(function (candidate) { return candidate.then(function (candidate) {
            if (candidate instanceof route_recognizer_1.PathMatch) {
                if (candidate.instruction.terminal) {
                    var unresolvedAux = _this._auxRoutesToUnresolved(candidate.remainingAux, parentComponent);
                    return new instruction_1.ResolvedInstruction(candidate.instruction, null, unresolvedAux);
                }
                var newAncestorComponents = ancestorComponents.concat([candidate.instruction.componentType]);
                return _this._recognize(candidate.remaining, newAncestorComponents)
                    .then(function (childInstruction) {
                    if (lang_1.isBlank(childInstruction)) {
                        return null;
                    }
                    // redirect instructions are already absolute
                    if (childInstruction instanceof instruction_1.RedirectInstruction) {
                        return childInstruction;
                    }
                    var unresolvedAux = _this._auxRoutesToUnresolved(candidate.remainingAux, parentComponent);
                    return new instruction_1.ResolvedInstruction(candidate.instruction, childInstruction, unresolvedAux);
                });
            }
            if (candidate instanceof route_recognizer_1.RedirectMatch) {
                var instruction = _this.generate(candidate.redirectTo, ancestorComponents);
                return new instruction_1.RedirectInstruction(instruction.component, instruction.child, instruction.auxInstruction);
            }
        }); });
        if ((lang_1.isBlank(parsedUrl) || parsedUrl.path == '') && possibleMatches.length == 0) {
            return async_1.PromiseWrapper.resolve(this.generateDefault(parentComponent));
        }
        return async_1.PromiseWrapper.all(matchPromises).then(mostSpecific);
    };
    RouteRegistry.prototype._auxRoutesToUnresolved = function (auxRoutes, parentComponent) {
        var _this = this;
        var unresolvedAuxInstructions = {};
        auxRoutes.forEach(function (auxUrl) {
            unresolvedAuxInstructions[auxUrl.path] = new instruction_1.UnresolvedInstruction(function () { return _this._recognize(auxUrl, [parentComponent], true); });
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
    RouteRegistry.prototype.generate = function (linkParams, ancestorComponents, _aux) {
        if (_aux === void 0) { _aux = false; }
        var parentComponent = ancestorComponents[ancestorComponents.length - 1];
        var grandparentComponent = ancestorComponents.length > 1 ? ancestorComponents[ancestorComponents.length - 2] : null;
        var normalizedLinkParams = splitAndFlattenLinkParams(linkParams);
        var first = collection_1.ListWrapper.first(normalizedLinkParams);
        var rest = collection_1.ListWrapper.slice(normalizedLinkParams, 1);
        // The first segment should be either '.' (generate from parent) or '' (generate from root).
        // When we normalize above, we strip all the slashes, './' becomes '.' and '/' becomes ''.
        if (first == '') {
            var firstComponent = ancestorComponents[0];
            collection_1.ListWrapper.clear(ancestorComponents);
            ancestorComponents.push(firstComponent);
        }
        else if (first == '..') {
            // we already captured the first instance of "..", so we need to pop off an ancestor
            ancestorComponents.pop();
            while (collection_1.ListWrapper.first(rest) == '..') {
                rest = collection_1.ListWrapper.slice(rest, 1);
                ancestorComponents.pop();
                if (ancestorComponents.length <= 0) {
                    throw new exceptions_1.BaseException("Link \"" + collection_1.ListWrapper.toJSON(linkParams) + "\" has too many \"../\" segments.");
                }
            }
        }
        else if (first != '.') {
            // For a link with no leading `./`, `/`, or `../`, we look for a sibling and child.
            // If both exist, we throw. Otherwise, we prefer whichever exists.
            var childRouteExists = this.hasRoute(first, parentComponent);
            var parentRouteExists = lang_1.isPresent(grandparentComponent) && this.hasRoute(first, grandparentComponent);
            if (parentRouteExists && childRouteExists) {
                var msg = "Link \"" + collection_1.ListWrapper.toJSON(linkParams) + "\" is ambiguous, use \"./\" or \"../\" to disambiguate.";
                throw new exceptions_1.BaseException(msg);
            }
            if (parentRouteExists) {
                ancestorComponents.pop();
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
        return this._generate(rest, ancestorComponents, _aux);
    };
    /*
     * Internal helper that does not make any assertions about the beginning of the link DSL
     */
    RouteRegistry.prototype._generate = function (linkParams, ancestorComponents, _aux) {
        var _this = this;
        if (_aux === void 0) { _aux = false; }
        var parentComponent = ancestorComponents[ancestorComponents.length - 1];
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
            var auxInstruction = this._generate(nextSegment, [parentComponent], true);
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
                return routeRecognizer.handler.resolveComponentType().then(function (_) { return _this._generate(linkParams, ancestorComponents, _aux); });
            }, compInstruction['urlPath'], compInstruction['urlParams']);
        }
        var componentInstruction = _aux ? componentRecognizer.generateAuxiliary(routeName, params) :
            componentRecognizer.generate(routeName, params);
        var childInstruction = null;
        var remaining = linkParams.slice(linkIndex + 1);
        // the component is sync
        if (lang_1.isPresent(componentInstruction.componentType)) {
            if (linkIndex + 1 < linkParams.length) {
                var childAncestorComponents = ancestorComponents.concat([componentInstruction.componentType]);
                childInstruction = this._generate(remaining, childAncestorComponents);
            }
            else if (!componentInstruction.terminal) {
                // ... look for defaults
                childInstruction = this.generateDefault(componentInstruction.componentType);
                if (lang_1.isBlank(childInstruction)) {
                    throw new exceptions_1.BaseException("Link \"" + collection_1.ListWrapper.toJSON(linkParams) + "\" does not resolve to a terminal instruction.");
                }
            }
        }
        return new instruction_1.ResolvedInstruction(componentInstruction, childInstruction, auxInstructions);
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
        angular2_1.Injectable(), 
        __metadata('design:paramtypes', [])
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