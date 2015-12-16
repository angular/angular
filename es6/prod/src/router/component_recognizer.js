import { isBlank, isPresent } from 'angular2/src/facade/lang';
import { BaseException } from 'angular2/src/facade/exceptions';
import { Map } from 'angular2/src/facade/collection';
import { PromiseWrapper } from 'angular2/src/facade/async';
import { RouteRecognizer, RedirectRecognizer, PathMatch } from './route_recognizer';
import { Route, AsyncRoute, AuxRoute, Redirect } from './route_config_impl';
import { AsyncRouteHandler } from './async_route_handler';
import { SyncRouteHandler } from './sync_route_handler';
/**
 * `ComponentRecognizer` is responsible for recognizing routes for a single component.
 * It is consumed by `RouteRegistry`, which knows how to recognize an entire hierarchy of
 * components.
 */
export class ComponentRecognizer {
    constructor() {
        this.names = new Map();
        // map from name to recognizer
        this.auxNames = new Map();
        // map from starting path to recognizer
        this.auxRoutes = new Map();
        // TODO: optimize this into a trie
        this.matchers = [];
        this.defaultRoute = null;
    }
    /**
     * returns whether or not the config is terminal
     */
    config(config) {
        var handler;
        if (isPresent(config.name) && config.name[0].toUpperCase() != config.name[0]) {
            var suggestedName = config.name[0].toUpperCase() + config.name.substring(1);
            throw new BaseException(`Route "${config.path}" with name "${config.name}" does not begin with an uppercase letter. Route names should be CamelCase like "${suggestedName}".`);
        }
        if (config instanceof AuxRoute) {
            handler = new SyncRouteHandler(config.component, config.data);
            let path = config.path.startsWith('/') ? config.path.substring(1) : config.path;
            var recognizer = new RouteRecognizer(config.path, handler);
            this.auxRoutes.set(path, recognizer);
            if (isPresent(config.name)) {
                this.auxNames.set(config.name, recognizer);
            }
            return recognizer.terminal;
        }
        var useAsDefault = false;
        if (config instanceof Redirect) {
            let redirector = new RedirectRecognizer(config.path, config.redirectTo);
            this._assertNoHashCollision(redirector.hash, config.path);
            this.matchers.push(redirector);
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
        var recognizer = new RouteRecognizer(config.path, handler);
        this._assertNoHashCollision(recognizer.hash, config.path);
        if (useAsDefault) {
            if (isPresent(this.defaultRoute)) {
                throw new BaseException(`Only one route can be default`);
            }
            this.defaultRoute = recognizer;
        }
        this.matchers.push(recognizer);
        if (isPresent(config.name)) {
            this.names.set(config.name, recognizer);
        }
        return recognizer.terminal;
    }
    _assertNoHashCollision(hash, path) {
        this.matchers.forEach((matcher) => {
            if (hash == matcher.hash) {
                throw new BaseException(`Configuration '${path}' conflicts with existing route '${matcher.path}'`);
            }
        });
    }
    /**
     * Given a URL, returns a list of `RouteMatch`es, which are partial recognitions for some route.
     */
    recognize(urlParse) {
        var solutions = [];
        this.matchers.forEach((routeRecognizer) => {
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
        var routeRecognizer = this.auxRoutes.get(urlParse.path);
        if (isPresent(routeRecognizer)) {
            return [routeRecognizer.recognize(urlParse)];
        }
        return [PromiseWrapper.resolve(null)];
    }
    hasRoute(name) { return this.names.has(name); }
    componentLoaded(name) {
        return this.hasRoute(name) && isPresent(this.names.get(name).handler.componentType);
    }
    loadComponent(name) {
        return this.names.get(name).handler.resolveComponentType();
    }
    generate(name, params) {
        var pathRecognizer = this.names.get(name);
        if (isBlank(pathRecognizer)) {
            return null;
        }
        return pathRecognizer.generate(params);
    }
    generateAuxiliary(name, params) {
        var pathRecognizer = this.auxNames.get(name);
        if (isBlank(pathRecognizer)) {
            return null;
        }
        return pathRecognizer.generate(params);
    }
}
