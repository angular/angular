var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
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
import { RouteRecognizer } from './route_recognizer';
import { Instruction, PrimaryInstruction } from './instruction';
import { ListWrapper, Map } from 'angular2/src/facade/collection';
import { PromiseWrapper } from 'angular2/src/facade/async';
import { isPresent, isBlank, isType, isString, isStringMap, getTypeNameForDebugging } from 'angular2/src/facade/lang';
import { BaseException } from 'angular2/src/facade/exceptions';
import { RouteConfig, Route, AuxRoute } from './route_config_impl';
import { reflector } from 'angular2/src/core/reflection/reflection';
import { Injectable } from 'angular2/angular2';
import { normalizeRouteConfig, assertComponentExists } from './route_config_nomalizer';
import { parser, pathSegmentsToUrl } from './url_parser';
var _resolveToNull = PromiseWrapper.resolve(null);
/**
 * The RouteRegistry holds route configurations for each component in an Angular app.
 * It is responsible for creating Instructions from URLs, and generating URLs based on route and
 * parameters.
 */
export let RouteRegistry = class {
    constructor() {
        this._rules = new Map();
    }
    /**
     * Given a component and a configuration object, add the route to this registry
     */
    config(parentComponent, config) {
        config = normalizeRouteConfig(config);
        // this is here because Dart type guard reasons
        if (config instanceof Route) {
            assertComponentExists(config.component, config.path);
        }
        else if (config instanceof AuxRoute) {
            assertComponentExists(config.component, config.path);
        }
        var recognizer = this._rules.get(parentComponent);
        if (isBlank(recognizer)) {
            recognizer = new RouteRecognizer();
            this._rules.set(parentComponent, recognizer);
        }
        var terminal = recognizer.config(config);
        if (config instanceof Route) {
            if (terminal) {
                assertTerminalComponent(config.component, config.path);
            }
            else {
                this.configFromComponent(config.component);
            }
        }
    }
    /**
     * Reads the annotations of a component and configures the registry based on them
     */
    configFromComponent(component) {
        if (!isType(component)) {
            return;
        }
        // Don't read the annotations from a type more than once –
        // this prevents an infinite loop if a component routes recursively.
        if (this._rules.has(component)) {
            return;
        }
        var annotations = reflector.annotations(component);
        if (isPresent(annotations)) {
            for (var i = 0; i < annotations.length; i++) {
                var annotation = annotations[i];
                if (annotation instanceof RouteConfig) {
                    let routeCfgs = annotation.configs;
                    routeCfgs.forEach(config => this.config(component, config));
                }
            }
        }
    }
    /**
     * Given a URL and a parent component, return the most specific instruction for navigating
     * the application into the state specified by the url
     */
    recognize(url, parentComponent) {
        var parsedUrl = parser.parse(url);
        return this._recognize(parsedUrl, parentComponent);
    }
    _recognize(parsedUrl, parentComponent) {
        return this._recognizePrimaryRoute(parsedUrl, parentComponent)
            .then((instruction) => this._completeAuxiliaryRouteMatches(instruction, parentComponent));
    }
    _recognizePrimaryRoute(parsedUrl, parentComponent) {
        var componentRecognizer = this._rules.get(parentComponent);
        if (isBlank(componentRecognizer)) {
            return _resolveToNull;
        }
        // Matches some beginning part of the given URL
        var possibleMatches = componentRecognizer.recognize(parsedUrl);
        var matchPromises = possibleMatches.map(candidate => this._completePrimaryRouteMatch(candidate));
        return PromiseWrapper.all(matchPromises).then(mostSpecific);
    }
    _completePrimaryRouteMatch(partialMatch) {
        var instruction = partialMatch.instruction;
        return instruction.resolveComponentType().then((componentType) => {
            this.configFromComponent(componentType);
            if (instruction.terminal) {
                return new PrimaryInstruction(instruction, null, partialMatch.remainingAux);
            }
            return this._recognizePrimaryRoute(partialMatch.remaining, componentType)
                .then((childInstruction) => {
                if (isBlank(childInstruction)) {
                    return null;
                }
                else {
                    return new PrimaryInstruction(instruction, childInstruction, partialMatch.remainingAux);
                }
            });
        });
    }
    _completeAuxiliaryRouteMatches(instruction, parentComponent) {
        if (isBlank(instruction)) {
            return _resolveToNull;
        }
        var componentRecognizer = this._rules.get(parentComponent);
        var auxInstructions = {};
        var promises = instruction.auxUrls.map((auxSegment) => {
            var match = componentRecognizer.recognizeAuxiliary(auxSegment);
            if (isBlank(match)) {
                return _resolveToNull;
            }
            return this._completePrimaryRouteMatch(match).then((auxInstruction) => {
                if (isPresent(auxInstruction)) {
                    return this._completeAuxiliaryRouteMatches(auxInstruction, parentComponent)
                        .then((finishedAuxRoute) => {
                        auxInstructions[auxSegment.path] = finishedAuxRoute;
                    });
                }
            });
        });
        return PromiseWrapper.all(promises).then((_) => {
            if (isBlank(instruction.child)) {
                return new Instruction(instruction.component, null, auxInstructions);
            }
            return this._completeAuxiliaryRouteMatches(instruction.child, instruction.component.componentType)
                .then((completeChild) => {
                return new Instruction(instruction.component, completeChild, auxInstructions);
            });
        });
    }
    /**
     * Given a normalized list with component names and params like: `['user', {id: 3 }]`
     * generates a url with a leading slash relative to the provided `parentComponent`.
     */
    generate(linkParams, parentComponent) {
        let segments = [];
        let componentCursor = parentComponent;
        var lastInstructionIsTerminal = false;
        for (let i = 0; i < linkParams.length; i += 1) {
            let segment = linkParams[i];
            if (isBlank(componentCursor)) {
                throw new BaseException(`Could not find route named "${segment}".`);
            }
            if (!isString(segment)) {
                throw new BaseException(`Unexpected segment "${segment}" in link DSL. Expected a string.`);
            }
            else if (segment == '' || segment == '.' || segment == '..') {
                throw new BaseException(`"${segment}/" is only allowed at the beginning of a link DSL.`);
            }
            let params = {};
            if (i + 1 < linkParams.length) {
                let nextSegment = linkParams[i + 1];
                if (isStringMap(nextSegment)) {
                    params = nextSegment;
                    i += 1;
                }
            }
            var componentRecognizer = this._rules.get(componentCursor);
            if (isBlank(componentRecognizer)) {
                throw new BaseException(`Component "${getTypeNameForDebugging(componentCursor)}" has no route config.`);
            }
            var response = componentRecognizer.generate(segment, params);
            if (isBlank(response)) {
                throw new BaseException(`Component "${getTypeNameForDebugging(componentCursor)}" has no route named "${segment}".`);
            }
            segments.push(response);
            componentCursor = response.componentType;
            lastInstructionIsTerminal = response.terminal;
        }
        var instruction = null;
        if (!lastInstructionIsTerminal) {
            instruction = this._generateRedirects(componentCursor);
            if (isPresent(instruction)) {
                let lastInstruction = instruction;
                while (isPresent(lastInstruction.child)) {
                    lastInstruction = lastInstruction.child;
                }
                lastInstructionIsTerminal = lastInstruction.component.terminal;
            }
            if (isPresent(componentCursor) && !lastInstructionIsTerminal) {
                throw new BaseException(`Link "${ListWrapper.toJSON(linkParams)}" does not resolve to a terminal or async instruction.`);
            }
        }
        while (segments.length > 0) {
            instruction = new Instruction(segments.pop(), instruction, {});
        }
        return instruction;
    }
    hasRoute(name, parentComponent) {
        var componentRecognizer = this._rules.get(parentComponent);
        if (isBlank(componentRecognizer)) {
            return false;
        }
        return componentRecognizer.hasRoute(name);
    }
    // if the child includes a redirect like : "/" -> "/something",
    // we want to honor that redirection when creating the link
    _generateRedirects(componentCursor) {
        if (isBlank(componentCursor)) {
            return null;
        }
        var componentRecognizer = this._rules.get(componentCursor);
        if (isBlank(componentRecognizer)) {
            return null;
        }
        for (let i = 0; i < componentRecognizer.redirects.length; i += 1) {
            let redirect = componentRecognizer.redirects[i];
            // we only handle redirecting from an empty segment
            if (redirect.segments.length == 1 && redirect.segments[0] == '') {
                var toSegments = pathSegmentsToUrl(redirect.toSegments);
                var matches = componentRecognizer.recognize(toSegments);
                var primaryInstruction = ListWrapper.maximum(matches, (match) => match.instruction.specificity);
                if (isPresent(primaryInstruction)) {
                    var child = this._generateRedirects(primaryInstruction.instruction.componentType);
                    return new Instruction(primaryInstruction.instruction, child, {});
                }
                return null;
            }
        }
        return null;
    }
};
RouteRegistry = __decorate([
    Injectable(), 
    __metadata('design:paramtypes', [])
], RouteRegistry);
/*
 * Given a list of instructions, returns the most specific instruction
 */
function mostSpecific(instructions) {
    return ListWrapper.maximum(instructions, (instruction) => instruction.component.specificity);
}
function assertTerminalComponent(component, path) {
    if (!isType(component)) {
        return;
    }
    var annotations = reflector.annotations(component);
    if (isPresent(annotations)) {
        for (var i = 0; i < annotations.length; i++) {
            var annotation = annotations[i];
            if (annotation instanceof RouteConfig) {
                throw new BaseException(`Child routes are not allowed for "${path}". Use "..." on the parent's route path.`);
            }
        }
    }
}
//# sourceMappingURL=route_registry.js.map