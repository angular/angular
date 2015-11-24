'use strict';var lang_1 = require('angular2/src/facade/lang');
var exceptions_1 = require('angular2/src/facade/exceptions');
var collection_1 = require('angular2/src/facade/collection');
var path_recognizer_1 = require('./path_recognizer');
var route_config_impl_1 = require('./route_config_impl');
var async_route_handler_1 = require('./async_route_handler');
var sync_route_handler_1 = require('./sync_route_handler');
var url_parser_1 = require('./url_parser');
/**
 * `RouteRecognizer` is responsible for recognizing routes for a single component.
 * It is consumed by `RouteRegistry`, which knows how to recognize an entire hierarchy of
 * components.
 */
var RouteRecognizer = (function () {
    function RouteRecognizer() {
        this.names = new collection_1.Map();
        this.auxRoutes = new collection_1.Map();
        // TODO: optimize this into a trie
        this.matchers = [];
        // TODO: optimize this into a trie
        this.redirects = [];
    }
    RouteRecognizer.prototype.config = function (config) {
        var handler;
        if (lang_1.isPresent(config.name) && config.name[0].toUpperCase() != config.name[0]) {
            var suggestedName = config.name[0].toUpperCase() + config.name.substring(1);
            throw new exceptions_1.BaseException("Route \"" + config.path + "\" with name \"" + config.name + "\" does not begin with an uppercase letter. Route names should be CamelCase like \"" + suggestedName + "\".");
        }
        if (config instanceof route_config_impl_1.AuxRoute) {
            handler = new sync_route_handler_1.SyncRouteHandler(config.component, config.data);
            var path = config.path.startsWith('/') ? config.path.substring(1) : config.path;
            var recognizer = new path_recognizer_1.PathRecognizer(config.path, handler);
            this.auxRoutes.set(path, recognizer);
            return recognizer.terminal;
        }
        if (config instanceof route_config_impl_1.Redirect) {
            this.redirects.push(new Redirector(config.path, config.redirectTo));
            return true;
        }
        if (config instanceof route_config_impl_1.Route) {
            handler = new sync_route_handler_1.SyncRouteHandler(config.component, config.data);
        }
        else if (config instanceof route_config_impl_1.AsyncRoute) {
            handler = new async_route_handler_1.AsyncRouteHandler(config.loader, config.data);
        }
        var recognizer = new path_recognizer_1.PathRecognizer(config.path, handler);
        this.matchers.forEach(function (matcher) {
            if (recognizer.hash == matcher.hash) {
                throw new exceptions_1.BaseException("Configuration '" + config.path + "' conflicts with existing route '" + matcher.path + "'");
            }
        });
        this.matchers.push(recognizer);
        if (lang_1.isPresent(config.name)) {
            this.names.set(config.name, recognizer);
        }
        return recognizer.terminal;
    };
    /**
     * Given a URL, returns a list of `RouteMatch`es, which are partial recognitions for some route.
     *
     */
    RouteRecognizer.prototype.recognize = function (urlParse) {
        var solutions = [];
        urlParse = this._redirect(urlParse);
        this.matchers.forEach(function (pathRecognizer) {
            var pathMatch = pathRecognizer.recognize(urlParse);
            if (lang_1.isPresent(pathMatch)) {
                solutions.push(pathMatch);
            }
        });
        return solutions;
    };
    /** @internal */
    RouteRecognizer.prototype._redirect = function (urlParse) {
        for (var i = 0; i < this.redirects.length; i += 1) {
            var redirector = this.redirects[i];
            var redirectedUrl = redirector.redirect(urlParse);
            if (lang_1.isPresent(redirectedUrl)) {
                return redirectedUrl;
            }
        }
        return urlParse;
    };
    RouteRecognizer.prototype.recognizeAuxiliary = function (urlParse) {
        var pathRecognizer = this.auxRoutes.get(urlParse.path);
        if (lang_1.isBlank(pathRecognizer)) {
            return null;
        }
        return pathRecognizer.recognize(urlParse);
    };
    RouteRecognizer.prototype.hasRoute = function (name) { return this.names.has(name); };
    RouteRecognizer.prototype.generate = function (name, params) {
        var pathRecognizer = this.names.get(name);
        if (lang_1.isBlank(pathRecognizer)) {
            return null;
        }
        return pathRecognizer.generate(params);
    };
    return RouteRecognizer;
})();
exports.RouteRecognizer = RouteRecognizer;
var Redirector = (function () {
    function Redirector(path, redirectTo) {
        this.segments = [];
        this.toSegments = [];
        if (path.startsWith('/')) {
            path = path.substring(1);
        }
        this.segments = path.split('/');
        if (redirectTo.startsWith('/')) {
            redirectTo = redirectTo.substring(1);
        }
        this.toSegments = redirectTo.split('/');
    }
    /**
     * Returns `null` or a `ParsedUrl` representing the new path to match
     */
    Redirector.prototype.redirect = function (urlParse) {
        for (var i = 0; i < this.segments.length; i += 1) {
            if (lang_1.isBlank(urlParse)) {
                return null;
            }
            var segment = this.segments[i];
            if (segment != urlParse.path) {
                return null;
            }
            urlParse = urlParse.child;
        }
        for (var i = this.toSegments.length - 1; i >= 0; i -= 1) {
            var segment = this.toSegments[i];
            urlParse = new url_parser_1.Url(segment, urlParse);
        }
        return urlParse;
    };
    return Redirector;
})();
exports.Redirector = Redirector;
//# sourceMappingURL=route_recognizer.js.map