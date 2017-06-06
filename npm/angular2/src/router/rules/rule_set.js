'use strict';"use strict";
var lang_1 = require('angular2/src/facade/lang');
var exceptions_1 = require('angular2/src/facade/exceptions');
var collection_1 = require('angular2/src/facade/collection');
var async_1 = require('angular2/src/facade/async');
var rules_1 = require('./rules');
var route_config_impl_1 = require('../route_config/route_config_impl');
var async_route_handler_1 = require('./route_handlers/async_route_handler');
var sync_route_handler_1 = require('./route_handlers/sync_route_handler');
var param_route_path_1 = require('./route_paths/param_route_path');
var regex_route_path_1 = require('./route_paths/regex_route_path');
/**
 * A `RuleSet` is responsible for recognizing routes for a particular component.
 * It is consumed by `RouteRegistry`, which knows how to recognize an entire hierarchy of
 * components.
 */
var RuleSet = (function () {
    function RuleSet() {
        this.rulesByName = new collection_1.Map();
        // map from name to rule
        this.auxRulesByName = new collection_1.Map();
        // map from starting path to rule
        this.auxRulesByPath = new collection_1.Map();
        // TODO: optimize this into a trie
        this.rules = [];
        // the rule to use automatically when recognizing or generating from this rule set
        this.defaultRule = null;
    }
    /**
     * Configure additional rules in this rule set from a route definition
     * @returns {boolean} true if the config is terminal
     */
    RuleSet.prototype.config = function (config) {
        var handler;
        if (lang_1.isPresent(config.name) && config.name[0].toUpperCase() != config.name[0]) {
            var suggestedName = config.name[0].toUpperCase() + config.name.substring(1);
            throw new exceptions_1.BaseException("Route \"" + config.path + "\" with name \"" + config.name + "\" does not begin with an uppercase letter. Route names should be CamelCase like \"" + suggestedName + "\".");
        }
        if (config instanceof route_config_impl_1.AuxRoute) {
            handler = new sync_route_handler_1.SyncRouteHandler(config.component, config.data);
            var routePath_1 = this._getRoutePath(config);
            var auxRule = new rules_1.RouteRule(routePath_1, handler, config.name);
            this.auxRulesByPath.set(routePath_1.toString(), auxRule);
            if (lang_1.isPresent(config.name)) {
                this.auxRulesByName.set(config.name, auxRule);
            }
            return auxRule.terminal;
        }
        var useAsDefault = false;
        if (config instanceof route_config_impl_1.Redirect) {
            var routePath_2 = this._getRoutePath(config);
            var redirector = new rules_1.RedirectRule(routePath_2, config.redirectTo);
            this._assertNoHashCollision(redirector.hash, config.path);
            this.rules.push(redirector);
            return true;
        }
        if (config instanceof route_config_impl_1.Route) {
            handler = new sync_route_handler_1.SyncRouteHandler(config.component, config.data);
            useAsDefault = lang_1.isPresent(config.useAsDefault) && config.useAsDefault;
        }
        else if (config instanceof route_config_impl_1.AsyncRoute) {
            handler = new async_route_handler_1.AsyncRouteHandler(config.loader, config.data);
            useAsDefault = lang_1.isPresent(config.useAsDefault) && config.useAsDefault;
        }
        var routePath = this._getRoutePath(config);
        var newRule = new rules_1.RouteRule(routePath, handler, config.name);
        this._assertNoHashCollision(newRule.hash, config.path);
        if (useAsDefault) {
            if (lang_1.isPresent(this.defaultRule)) {
                throw new exceptions_1.BaseException("Only one route can be default");
            }
            this.defaultRule = newRule;
        }
        this.rules.push(newRule);
        if (lang_1.isPresent(config.name)) {
            this.rulesByName.set(config.name, newRule);
        }
        return newRule.terminal;
    };
    /**
     * Given a URL, returns a list of `RouteMatch`es, which are partial recognitions for some route.
     */
    RuleSet.prototype.recognize = function (urlParse) {
        var solutions = [];
        this.rules.forEach(function (routeRecognizer) {
            var pathMatch = routeRecognizer.recognize(urlParse);
            if (lang_1.isPresent(pathMatch)) {
                solutions.push(pathMatch);
            }
        });
        // handle cases where we are routing just to an aux route
        if (solutions.length == 0 && lang_1.isPresent(urlParse) && urlParse.auxiliary.length > 0) {
            return [async_1.PromiseWrapper.resolve(new rules_1.PathMatch(null, null, urlParse.auxiliary))];
        }
        return solutions;
    };
    RuleSet.prototype.recognizeAuxiliary = function (urlParse) {
        var routeRecognizer = this.auxRulesByPath.get(urlParse.path);
        if (lang_1.isPresent(routeRecognizer)) {
            return [routeRecognizer.recognize(urlParse)];
        }
        return [async_1.PromiseWrapper.resolve(null)];
    };
    RuleSet.prototype.hasRoute = function (name) { return this.rulesByName.has(name); };
    RuleSet.prototype.componentLoaded = function (name) {
        return this.hasRoute(name) && lang_1.isPresent(this.rulesByName.get(name).handler.componentType);
    };
    RuleSet.prototype.loadComponent = function (name) {
        return this.rulesByName.get(name).handler.resolveComponentType();
    };
    RuleSet.prototype.generate = function (name, params) {
        var rule = this.rulesByName.get(name);
        if (lang_1.isBlank(rule)) {
            return null;
        }
        return rule.generate(params);
    };
    RuleSet.prototype.generateAuxiliary = function (name, params) {
        var rule = this.auxRulesByName.get(name);
        if (lang_1.isBlank(rule)) {
            return null;
        }
        return rule.generate(params);
    };
    RuleSet.prototype._assertNoHashCollision = function (hash, path) {
        this.rules.forEach(function (rule) {
            if (hash == rule.hash) {
                throw new exceptions_1.BaseException("Configuration '" + path + "' conflicts with existing route '" + rule.path + "'");
            }
        });
    };
    RuleSet.prototype._getRoutePath = function (config) {
        if (lang_1.isPresent(config.regex)) {
            if (lang_1.isFunction(config.serializer)) {
                return new regex_route_path_1.RegexRoutePath(config.regex, config.serializer);
            }
            else {
                throw new exceptions_1.BaseException("Route provides a regex property, '" + config.regex + "', but no serializer property");
            }
        }
        if (lang_1.isPresent(config.path)) {
            // Auxiliary routes do not have a slash at the start
            var path = (config instanceof route_config_impl_1.AuxRoute && config.path.startsWith('/')) ?
                config.path.substring(1) :
                config.path;
            return new param_route_path_1.ParamRoutePath(path);
        }
        throw new exceptions_1.BaseException('Route must provide either a path or regex property');
    };
    return RuleSet;
}());
exports.RuleSet = RuleSet;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicnVsZV9zZXQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJkaWZmaW5nX3BsdWdpbl93cmFwcGVyLW91dHB1dF9wYXRoLXI1UHJKSzloLnRtcC9hbmd1bGFyMi9zcmMvcm91dGVyL3J1bGVzL3J1bGVfc2V0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQSxxQkFBNkMsMEJBQTBCLENBQUMsQ0FBQTtBQUN4RSwyQkFBOEMsZ0NBQWdDLENBQUMsQ0FBQTtBQUMvRSwyQkFBNkQsZ0NBQWdDLENBQUMsQ0FBQTtBQUM5RixzQkFBNkIsMkJBQTJCLENBQUMsQ0FBQTtBQUV6RCxzQkFBMkUsU0FBUyxDQUFDLENBQUE7QUFDckYsa0NBTU8sbUNBQW1DLENBQUMsQ0FBQTtBQUUzQyxvQ0FBZ0Msc0NBQXNDLENBQUMsQ0FBQTtBQUN2RSxtQ0FBK0IscUNBQXFDLENBQUMsQ0FBQTtBQUdyRSxpQ0FBNkIsZ0NBQWdDLENBQUMsQ0FBQTtBQUM5RCxpQ0FBNkIsZ0NBQWdDLENBQUMsQ0FBQTtBQU05RDs7OztHQUlHO0FBQ0g7SUFBQTtRQUNFLGdCQUFXLEdBQUcsSUFBSSxnQkFBRyxFQUFxQixDQUFDO1FBRTNDLHdCQUF3QjtRQUN4QixtQkFBYyxHQUFHLElBQUksZ0JBQUcsRUFBcUIsQ0FBQztRQUU5QyxpQ0FBaUM7UUFDakMsbUJBQWMsR0FBRyxJQUFJLGdCQUFHLEVBQXFCLENBQUM7UUFFOUMsa0NBQWtDO1FBQ2xDLFVBQUssR0FBbUIsRUFBRSxDQUFDO1FBRTNCLGtGQUFrRjtRQUNsRixnQkFBVyxHQUFjLElBQUksQ0FBQztJQW1KaEMsQ0FBQztJQWpKQzs7O09BR0c7SUFDSCx3QkFBTSxHQUFOLFVBQU8sTUFBdUI7UUFDNUIsSUFBSSxPQUFPLENBQUM7UUFFWixFQUFFLENBQUMsQ0FBQyxnQkFBUyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLFdBQVcsRUFBRSxJQUFJLE1BQU0s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LENBQUMsQ0FBQztnQkFDbEMsTUFBTSxDQUFDLElBQUksaUNBQWMsQ0FBQyxNQUFNLENBQUMsS0FBSyxFQUFFLE1BQU0sQ0FBQyxVQUFVLENBQUMsQ0FBQztZQUM3RCxDQUFDO1lBQUMsSUFBSSxDQUFDLENBQUM7Z0JBQ04sTUFBTSxJQUFJLDBCQUFhLENBQ25CLHVDQUFxQyxNQUFNLENBQUMsS0FBSyxrQ0FBK0IsQ0FBQyxDQUFDO1lBQ3hGLENBQUM7UUFDSCxDQUFDO1FBQ0QsRUFBRSxDQUFDLENBQUMsZ0JBQVMsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQzNCLG9EQUFvRDtZQUNwRCxJQUFJLElBQUksR0FBRyxDQUFDLE1BQU0sWUFBWSw0QkFBUSxJQUFJLE1BQU0sQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLEdBQUcsQ0FBQyxDQUFDO2dCQUN2RCxNQUFNLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUM7Z0JBQ3hCLE1BQU0sQ0FBQyxJQUFJLENBQUM7WUFDM0IsTUFBTSxDQUFDLElBQUksaUNBQWMsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUNsQyxDQUFDO1FBQ0QsTUFBTSxJQUFJLDBCQUFhLENBQUMsb0RBQW9ELENBQUMsQ0FBQztJQUNoRixDQUFDO0lBQ0gsY0FBQztBQUFELENBQUMsQUFoS0QsSUFnS0M7QUFoS1ksZUFBTyxVQWdLbkIsQ0FBQSIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7aXNCbGFuaywgaXNQcmVzZW50LCBpc0Z1bmN0aW9ufSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2xhbmcnO1xuaW1wb3J0IHtCYXNlRXhjZXB0aW9uLCBXcmFwcGVkRXhjZXB0aW9ufSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2V4Y2VwdGlvbnMnO1xuaW1wb3J0IHtNYXAsIE1hcFdyYXBwZXIsIExpc3RXcmFwcGVyLCBTdHJpbmdNYXBXcmFwcGVyfSBmcm9tICdhbmd1bGFyMi9zcmMvZmFjYWRlL2NvbGxlY3Rpb24nO1xuaW1wb3J0IHtQcm9taXNlV3JhcHBlcn0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9hc3luYyc7XG5cbmltcG9ydCB7QWJzdHJhY3RSdWxlLCBSb3V0ZVJ1bGUsIFJlZGlyZWN0UnVsZSwgUm91dGVNYXRjaCwgUGF0aE1hdGNofSBmcm9tICcuL3J1bGVzJztcbmltcG9ydCB7XG4gIFJvdXRlLFxuICBBc3luY1JvdXRlLFxuICBBdXhSb3V0ZSxcbiAgUmVkaXJlY3QsXG4gIFJvdXRlRGVmaW5pdGlvblxufSBmcm9tICcuLi9yb3V0ZV9jb25maWcvcm91dGVfY29uZmlnX2ltcGwnO1xuXG5pbXBvcnQge0FzeW5jUm91dGVIYW5kbGVyfSBmcm9tICcuL3JvdXRlX2hhbmRsZXJzL2FzeW5jX3JvdXRlX2hhbmRsZXInO1xuaW1wb3J0IHtTeW5jUm91dGVIYW5kbGVyfSBmcm9tICcuL3JvdXRlX2hhbmRsZXJzL3N5bmNfcm91dGVfaGFuZGxlcic7XG5cbmltcG9ydCB7Um91dGVQYXRofSBmcm9tICcuL3JvdXRlX3BhdGhzL3JvdXRlX3BhdGgnO1xuaW1wb3J0IHtQYXJhbVJvdXRlUGF0aH0gZnJvbSAnLi9yb3V0ZV9wYXRocy9wYXJhbV9yb3V0ZV9wYXRoJztcbmltcG9ydCB7UmVnZXhSb3V0ZVBhdGh9IGZyb20gJy4vcm91dGVfcGF0aHMvcmVnZXhfcm91dGVfcGF0aCc7XG5cbmltcG9ydCB7VXJsfSBmcm9tICcuLi91cmxfcGFyc2VyJztcbmltcG9ydCB7Q29tcG9uZW50SW5zdHJ1Y3Rpb259IGZyb20gJy4uL2luc3RydWN0aW9uJztcblxuXG4vKipcbiAqIEEgYFJ1bGVTZXRgIGlzIHJlc3BvbnNpYmxlIGZvciByZWNvZ25pemluZyByb3V0ZXMgZm9yIGEgcGFydGljdWxhciBjb21wb25lbnQuXG4gKiBJdCBpcyBjb25zdW1lZCBieSBgUm91dGVSZWdpc3RyeWAsIHdoaWNoIGtub3dzIGhvdyB0byByZWNvZ25pemUgYW4gZW50aXJlIGhpZXJhcmNoeSBvZlxuICogY29tcG9uZW50cy5cbiAqL1xuZXhwb3J0IGNsYXNzIFJ1bGVTZXQge1xuICBydWxlc0J5TmFtZSA9IG5ldyBNYXA8c3RyaW5nLCBSb3V0ZVJ1bGU+KCk7XG5cbiAgLy8gbWFwIGZyb20gbmFtZSB0byBydWxlXG4gIGF1eFJ1bGVzQnlOYW1lID0gbmV3IE1hcDxzdHJpbmcsIFJvdXRlUnVsZT4oKTtcblxuICAvLyBtYXAgZnJvbSBzdGFydGluZyBwYXRoIHRvIHJ1bGVcbiAgYXV4UnVsZXNCeVBhdGggPSBuZXcgTWFwPHN0cmluZywgUm91dGVSdWxlPigpO1xuXG4gIC8vIFRPRE86IG9wdGltaXplIHRoaXMgaW50byBhIHRyaWVcbiAgcnVsZXM6IEFic3RyYWN0UnVsZVtdID0gW107XG5cbiAgLy8gdGhlIHJ1bGUgdG8gdXNlIGF1dG9tYXRpY2FsbHkgd2hlbiByZWNvZ25pemluZyBvciBnZW5lcmF0aW5nIGZyb20gdGhpcyBydWxlIHNldFxuICBkZWZhdWx0UnVsZTogUm91dGVSdWxlID0gbnVsbDtcblxuICAvKipcbiAgICogQ29uZmlndXJlIGFkZGl0aW9uYWwgcnVsZXMgaW4gdGhpcyBydWxlIHNldCBmcm9tIGEgcm91dGUgZGVmaW5pdGlvblxuICAgKiBAcmV0dXJucyB7Ym9vbGVhbn0gdHJ1ZSBpZiB0aGUgY29uZmlnIGlzIHRlcm1pbmFsXG4gICAqL1xuICBjb25maWcoY29uZmlnOiBSb3V0ZURlZmluaXRpb24pOiBib29sZWFuIHtcbiAgICBsZXQgaGFuZGxlcjtcblxuICAgIGlmIChpc1ByZXNlbnQoY29uZmlnLm5hbWUpICYmIGNvbmZpZy5uYW1lWzBdLnRvVXBwZXJDYXNlKCkgIT0gY29uZmlnLm5hbWVbMF0pIHtcbiAgICAgIGxldCBzdWdnZXN0ZWROYW1lID0gY29uZmlnLm5hbWVbMF0udG9VcHBlckNhc2UoKSArIGNvbmZpZy5uYW1lLnN1YnN0cmluZygxKTtcbiAgICAgIHRocm93IG5ldyBCYXNlRXhjZXB0aW9uKFxuICAgICAgICAgIGBSb3V0ZSBcIiR7Y29uZmlnLnBhdGh9XCIgd2l0aCBuYW1lIFwiJHtjb25maWcubmFtZX1cIiBkb2VzIG5vdCBiZWdpbiB3aXRoIGFuIHVwcGVyY2FzZSBsZXR0ZXIuIFJvdXRlIG5hbWVzIHNob3VsZCBiZSBDYW1lbENhc2UgbGlrZSBcIiR7c3VnZ2VzdGVkTmFtZX1cIi5gKTtcbiAgICB9XG5cbiAgICBpZiAoY29uZmlnIGluc3RhbmNlb2YgQXV4Um91dGUpIHtcbiAgICAgIGhhbmRsZXIgPSBuZXcgU3luY1JvdXRlSGFuZGxlcihjb25maWcuY29tcG9uZW50LCBjb25maWcuZGF0YSk7XG4gICAgICBsZXQgcm91dGVQYXRoID0gdGhpcy5fZ2V0Um91dGVQYXRoKGNvbmZpZyk7XG4gICAgICBsZXQgYXV4UnVsZSA9IG5ldyBSb3V0ZVJ1bGUocm91dGVQYXRoLCBoYW5kbGVyLCBjb25maWcubmFtZSk7XG4gICAgICB0aGlzLmF1eFJ1bGVzQnlQYXRoLnNldChyb3V0ZVBhdGgudG9TdHJpbmcoKSwgYXV4UnVsZSk7XG4gICAgICBpZiAoaXNQcmVzZW50KGNvbmZpZy5uYW1lKSkge1xuICAgICAgICB0aGlzLmF1eFJ1bGVzQnlOYW1lLnNldChjb25maWcubmFtZSwgYXV4UnVsZSk7XG4gICAgICB9XG4gICAgICByZXR1cm4gYXV4UnVsZS50ZXJtaW5hbDtcbiAgICB9XG5cbiAgICBsZXQgdXNlQXNEZWZhdWx0ID0gZmFsc2U7XG5cbiAgICBpZiAoY29uZmlnIGluc3RhbmNlb2YgUmVkaXJlY3QpIHtcbiAgICAgIGxldCByb3V0ZVBhdGggPSB0aGlzLl9nZXRSb3V0ZVBhdGgoY29uZmlnKTtcbiAgICAgIGxldCByZWRpcmVjdG9yID0gbmV3IFJlZGlyZWN0UnVsZShyb3V0ZVBhdGgsIGNvbmZpZy5yZWRpcmVjdFRvKTtcbiAgICAgIHRoaXMuX2Fzc2VydE5vSGFzaENvbGxpc2lvbihyZWRpcmVjdG9yLmhhc2gsIGNvbmZpZy5wYXRoKTtcbiAgICAgIHRoaXMucnVsZXMucHVzaChyZWRpcmVjdG9yKTtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cblxuICAgIGlmIChjb25maWcgaW5zdGFuY2VvZiBSb3V0ZSkge1xuICAgICAgaGFuZGxlciA9IG5ldyBTeW5jUm91dGVIYW5kbGVyKGNvbmZpZy5jb21wb25lbnQsIGNvbmZpZy5kYXRhKTtcbiAgICAgIHVzZUFzRGVmYXVsdCA9IGlzUHJlc2VudChjb25maWcudXNlQXNEZWZhdWx0KSAmJiBjb25maWcudXNlQXNEZWZhdWx0O1xuICAgIH0gZWxzZSBpZiAoY29uZmlnIGluc3RhbmNlb2YgQXN5bmNSb3V0ZSkge1xuICAgICAgaGFuZGxlciA9IG5ldyBBc3luY1JvdXRlSGFuZGxlcihjb25maWcubG9hZGVyLCBjb25maWcuZGF0YSk7XG4gICAgICB1c2VBc0RlZmF1bHQgPSBpc1ByZXNlbnQoY29uZmlnLnVzZUFzRGVmYXVsdCkgJiYgY29uZmlnLnVzZUFzRGVmYXVsdDtcbiAgICB9XG4gICAgbGV0IHJvdXRlUGF0aCA9IHRoaXMuX2dldFJvdXRlUGF0aChjb25maWcpO1xuICAgIGxldCBuZXdSdWxlID0gbmV3IFJvdXRlUnVsZShyb3V0ZVBhdGgsIGhhbmRsZXIsIGNvbmZpZy5uYW1lKTtcblxuICAgIHRoaXMuX2Fzc2VydE5vSGFzaENvbGxpc2lvbihuZXdSdWxlLmhhc2gsIGNvbmZpZy5wYXRoKTtcblxuICAgIGlmICh1c2VBc0RlZmF1bHQpIHtcbiAgICAgIGlmIChpc1ByZXNlbnQodGhpcy5kZWZhdWx0UnVsZSkpIHtcbiAgICAgICAgdGhyb3cgbmV3IEJhc2VFeGNlcHRpb24oYE9ubHkgb25lIHJvdXRlIGNhbiBiZSBkZWZhdWx0YCk7XG4gICAgICB9XG4gICAgICB0aGlzLmRlZmF1bHRSdWxlID0gbmV3UnVsZTtcbiAgICB9XG5cbiAgICB0aGlzLnJ1bGVzLnB1c2gobmV3UnVsZSk7XG4gICAgaWYgKGlzUHJlc2VudChjb25maWcubmFtZSkpIHtcbiAgICAgIHRoaXMucnVsZXNCeU5hbWUuc2V0KGNvbmZpZy5uYW1lLCBuZXdSdWxlKTtcbiAgICB9XG4gICAgcmV0dXJuIG5ld1J1bGUudGVybWluYWw7XG4gIH1cblxuXG4gIC8qKlxuICAgKiBHaXZlbiBhIFVSTCwgcmV0dXJucyBhIGxpc3Qgb2YgYFJvdXRlTWF0Y2hgZXMsIHdoaWNoIGFyZSBwYXJ0aWFsIHJlY29nbml0aW9ucyBmb3Igc29tZSByb3V0ZS5cbiAgICovXG4gIHJlY29nbml6ZSh1cmxQYXJzZTogVXJsKTogUHJvbWlzZTxSb3V0ZU1hdGNoPltdIHtcbiAgICB2YXIgc29sdXRpb25zID0gW107XG5cbiAgICB0aGlzLnJ1bGVzLmZvckVhY2goKHJvdXRlUmVjb2duaXplcjogQWJzdHJhY3RSdWxlKSA9PiB7XG4gICAgICB2YXIgcGF0aE1hdGNoID0gcm91dGVSZWNvZ25pemVyLnJlY29nbml6ZSh1cmxQYXJzZSk7XG5cbiAgICAgIGlmIChpc1ByZXNlbnQocGF0aE1hdGNoKSkge1xuICAgICAgICBzb2x1dGlvbnMucHVzaChwYXRoTWF0Y2gpO1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgLy8gaGFuZGxlIGNhc2VzIHdoZXJlIHdlIGFyZSByb3V0aW5nIGp1c3QgdG8gYW4gYXV4IHJvdXRlXG4gICAgaWYgKHNvbHV0aW9ucy5sZW5ndGggPT0gMCAmJiBpc1ByZXNlbnQodXJsUGFyc2UpICYmIHVybFBhcnNlLmF1eGlsaWFyeS5sZW5ndGggPiAwKSB7XG4gICAgICByZXR1cm4gW1Byb21pc2VXcmFwcGVyLnJlc29sdmUobmV3IFBhdGhNYXRjaChudWxsLCBudWxsLCB1cmxQYXJzZS5hdXhpbGlhcnkpKV07XG4gICAgfVxuXG4gICAgcmV0dXJuIHNvbHV0aW9ucztcbiAgfVxuXG4gIHJlY29nbml6ZUF1eGlsaWFyeSh1cmxQYXJzZTogVXJsKTogUHJvbWlzZTxSb3V0ZU1hdGNoPltdIHtcbiAgICB2YXIgcm91dGVSZWNvZ25pemVyOiBSb3V0ZVJ1bGUgPSB0aGlzLmF1eFJ1bGVzQnlQYXRoLmdldCh1cmxQYXJzZS5wYXRoKTtcbiAgICBpZiAoaXNQcmVzZW50KHJvdXRlUmVjb2duaXplcikpIHtcbiAgICAgIHJldHVybiBbcm91dGVSZWNvZ25pemVyLnJlY29nbml6ZSh1cmxQYXJzZSldO1xuICAgIH1cblxuICAgIHJldHVybiBbUHJvbWlzZVdyYXBwZXIucmVzb2x2ZShudWxsKV07XG4gIH1cblxuICBoYXNSb3V0ZShuYW1lOiBzdHJpbmcpOiBib29sZWFuIHsgcmV0dXJuIHRoaXMucnVsZXNCeU5hbWUuaGFzKG5hbWUpOyB9XG5cbiAgY29tcG9uZW50TG9hZGVkKG5hbWU6IHN0cmluZyk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLmhhc1JvdXRlKG5hbWUpICYmIGlzUHJlc2VudCh0aGlzLnJ1bGVzQnlOYW1lLmdldChuYW1lKS5oYW5kbGVyLmNvbXBvbmVudFR5cGUpO1xuICB9XG5cbiAgbG9hZENvbXBvbmVudChuYW1lOiBzdHJpbmcpOiBQcm9taXNlPGFueT4ge1xuICAgIHJldHVybiB0aGlzLnJ1bGVzQnlOYW1lLmdldChuYW1lKS5oYW5kbGVyLnJlc29sdmVDb21wb25lbnRUeXBlKCk7XG4gIH1cblxuICBnZW5lcmF0ZShuYW1lOiBzdHJpbmcsIHBhcmFtczogYW55KTogQ29tcG9uZW50SW5zdHJ1Y3Rpb24ge1xuICAgIHZhciBydWxlOiBSb3V0ZVJ1bGUgPSB0aGlzLnJ1bGVzQnlOYW1lLmdldChuYW1lKTtcbiAgICBpZiAoaXNCbGFuayhydWxlKSkge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICAgIHJldHVybiBydWxlLmdlbmVyYXRlKHBhcmFtcyk7XG4gIH1cblxuICBnZW5lcmF0ZUF1eGlsaWFyeShuYW1lOiBzdHJpbmcsIHBhcmFtczogYW55KTogQ29tcG9uZW50SW5zdHJ1Y3Rpb24ge1xuICAgIHZhciBydWxlOiBSb3V0ZVJ1bGUgPSB0aGlzLmF1eFJ1bGVzQnlOYW1lLmdldChuYW1lKTtcbiAgICBpZiAoaXNCbGFuayhydWxlKSkge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICAgIHJldHVybiBydWxlLmdlbmVyYXRlKHBhcmFtcyk7XG4gIH1cblxuICBwcml2YXRlIF9hc3NlcnROb0hhc2hDb2xsaXNpb24oaGFzaDogc3RyaW5nLCBwYXRoKSB7XG4gICAgdGhpcy5ydWxlcy5mb3JFYWNoKChydWxlKSA9PiB7XG4gICAgICBpZiAoaGFzaCA9PSBydWxlLmhhc2gpIHtcbiAgICAgICAgdGhyb3cgbmV3IEJhc2VFeGNlcHRpb24oXG4gICAgICAgICAgICBgQ29uZmlndXJhdGlvbiAnJHtwYXRofScgY29uZmxpY3RzIHdpdGggZXhpc3Rpbmcgcm91dGUgJyR7cnVsZS5wYXRofSdgKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG4gIHByaXZhdGUgX2dldFJvdXRlUGF0aChjb25maWc6IFJvdXRlRGVmaW5pdGlvbik6IFJvdXRlUGF0aCB7XG4gICAgaWYgKGlzUHJlc2VudChjb25maWcucmVnZXgpKSB7XG4gICAgICBpZiAoaXNGdW5jdGlvbihjb25maWcuc2VyaWFsaXplcikpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBSZWdleFJvdXRlUGF0aChjb25maWcucmVnZXgsIGNvbmZpZy5zZXJpYWxpemVyKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRocm93IG5ldyBCYXNlRXhjZXB0aW9uKFxuICAgICAgICAgICAgYFJvdXRlIHByb3ZpZGVzIGEgcmVnZXggcHJvcGVydHksICcke2NvbmZpZy5yZWdleH0nLCBidXQgbm8gc2VyaWFsaXplciBwcm9wZXJ0eWApO1xuICAgICAgfVxuICAgIH1cbiAgICBpZiAoaXNQcmVzZW50KGNvbmZpZy5wYXRoKSkge1xuICAgICAgLy8gQXV4aWxpYXJ5IHJvdXRlcyBkbyBub3QgaGF2ZSBhIHNsYXNoIGF0IHRoZSBzdGFydFxuICAgICAgbGV0IHBhdGggPSAoY29uZmlnIGluc3RhbmNlb2YgQXV4Um91dGUgJiYgY29uZmlnLnBhdGguc3RhcnRzV2l0aCgnLycpKSA/XG4gICAgICAgICAgICAgICAgICAgICBjb25maWcucGF0aC5zdWJzdHJpbmcoMSkgOlxuICAgICAgICAgICAgICAgICAgICAgY29uZmlnLnBhdGg7XG4gICAgICByZXR1cm4gbmV3IFBhcmFtUm91dGVQYXRoKHBhdGgpO1xuICAgIH1cbiAgICB0aHJvdyBuZXcgQmFzZUV4Y2VwdGlvbignUm91dGUgbXVzdCBwcm92aWRlIGVpdGhlciBhIHBhdGggb3IgcmVnZXggcHJvcGVydHknKTtcbiAgfVxufVxuIl19