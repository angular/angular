import { isBlank, isPresent, isFunction } from 'angular2/src/facade/lang';
import { BaseException } from 'angular2/src/facade/exceptions';
import { Map } from 'angular2/src/facade/collection';
import { PromiseWrapper } from 'angular2/src/facade/async';
import { RouteRule, RedirectRule, PathMatch } from './rules';
import { Route, AsyncRoute, AuxRoute, Redirect } from '../route_config/route_config_impl';
import { AsyncRouteHandler } from './route_handlers/async_route_handler';
import { SyncRouteHandler } from './route_handlers/sync_route_handler';
import { ParamRoutePath } from './route_paths/param_route_path';
import { RegexRoutePath } from './route_paths/regex_route_path';
/**
 * A `RuleSet` is responsible for recognizing routes for a particular component.
 * It is consumed by `RouteRegistry`, which knows how to recognize an entire hierarchy of
 * components.
 */
export class RuleSet {
    constructor() {
        this.rulesByName = new Map();
        // map from name to rule
        this.auxRulesByName = new Map();
        // map from starting path to rule
        this.auxRulesByPath = new Map();
        // TODO: optimize this into a trie
        this.rules = [];
        // the rule to use automatically when recognizing or generating from this rule set
        this.defaultRule = null;
    }
    /**
     * Configure additional rules in this rule set from a route definition
     * @returns {boolean} true if the config is terminal
     */
    config(config) {
        let handler;
        if (isPresent(config.name) && config.name[0].toUpperCase() != config.name[0]) {
            let suggestedName = config.name[0].toUpperCase() + config.name.substring(1);
            throw new BaseException(`Route "${config.path}" with name "${config.name}" does not begin with an uppercase letter. Route names should be CamelCase like "${suggestedName}".`);
        }
        if (config instanceof AuxRoute) {
            handler = new SyncRouteHandler(config.component, config.data);
            let routePath = this._getRoutePath(config);
            let auxRule = new RouteRule(routePath, handler, config.name);
            this.auxRulesByPath.set(routePath.toString(), auxRule);
            if (isPresent(config.name)) {
                this.auxRulesByName.set(config.name, auxRule);
            }
            return auxRule.terminal;
        }
        let useAsDefault = false;
        if (config instanceof Redirect) {
            let routePath = this._getRoutePath(config);
            let redirector = new RedirectRule(routePath, config.redirectTo);
            this._assertNoHashCollision(redirector.hash, config.path);
            this.rules.push(redirector);
            return true;
        }
        if (config instanceof Route) {
            handler = new SyncRouteHandler(config.component, config.data);
            useAsDefault = isPresent(config.useAsDefault) && config.useAsDefault;
        }
        else if (config instanceof AsyncRoute) {
            handler = new AsyncRouteHandler(config.loader, config.data);
            useAsDefault = isPresent(config.useAsDefault) && config.useAsDefault;
        }
        let routePath = this._getRoutePath(config);
        let newRule = new RouteRule(routePath, handler, config.name);
        this._assertNoHashCollision(newRule.hash, config.path);
        if (useAsDefault) {
            if (isPresent(this.defaultRule)) {
                throw new BaseException(`Only one route can be default`);
            }
            this.defaultRule = newRule;
        }
        this.rules.push(newRule);
        if (isPresent(config.name)) {
            this.rulesByName.set(config.name, newRule);
        }
        return newRule.terminal;
    }
    /**
     * Given a URL, returns a list of `RouteMatch`es, which are partial recognitions for some route.
     */
    recognize(urlParse) {
        var solutions = [];
        this.rules.forEach((routeRecognizer) => {
            var pathMatch = routeRecognizer.recognize(urlParse);
            if (isPresent(pathMatch)) {
                solutions.push(pathMatch);
            }
        });
        // handle cases where we are routing just to an aux route
        if (solutions.length == 0 && isPresent(urlParse) && urlParse.auxiliary.length > 0) {
            return [PromiseWrapper.resolve(new PathMatch(null, null, urlParse.auxiliary))];
        }
        return solutions;
    }
    recognizeAuxiliary(urlParse) {
        var routeRecognizer = this.auxRulesByPath.get(urlParse.path);
        if (isPresent(routeRecognizer)) {
            return [routeRecognizer.recognize(urlParse)];
        }
        return [PromiseWrapper.resolve(null)];
    }
    hasRoute(name) { return this.rulesByName.has(name); }
    componentLoaded(name) {
        return this.hasRoute(name) && isPresent(this.rulesByName.get(name).handler.componentType);
    }
    loadComponent(name) {
        return this.rulesByName.get(name).handler.resolveComponentType();
    }
    generate(name, params) {
        var rule = this.rulesByName.get(name);
        if (isBlank(rule)) {
            return null;
        }
        return rule.generate(params);
    }
    generateAuxiliary(name, params) {
        var rule = this.auxRulesByName.get(name);
        if (isBlank(rule)) {
            return null;
        }
        return rule.generate(params);
    }
    _assertNoHashCollision(hash, path) {
        this.rules.forEach((rule) => {
            if (hash == rule.hash) {
                throw new BaseException(`Configuration '${path}' conflicts with existing route '${rule.path}'`);
            }
        });
    }
    _getRoutePath(config) {
        if (isPresent(config.regex)) {
            if (isFunction(config.serializer)) {
                return new RegexRoutePath(config.regex, config.serializer);
            }
            else {
                throw new BaseException(`Route provides a regex property, '${config.regex}', but no serializer property`);
            }
        }
        if (isPresent(config.path)) {
            // Auxiliary routes do not have a slash at the start
            let path = (config instanceof AuxRoute && config.path.startsWith('/')) ?
                config.path.substring(1) :
                config.path;
            return new ParamRoutePath(path);
        }
        throw new BaseException('Route must provide either a path or regex property');
    }
}
