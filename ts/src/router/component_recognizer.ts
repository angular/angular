import {isBlank, isPresent} from 'angular2/src/facade/lang';
import {BaseException, WrappedException} from 'angular2/src/facade/exceptions';
import {Map, MapWrapper, ListWrapper, StringMapWrapper} from 'angular2/src/facade/collection';
import {Promise, PromiseWrapper} from 'angular2/src/facade/async';

import {
  AbstractRecognizer,
  RouteRecognizer,
  RedirectRecognizer,
  RouteMatch,
  PathMatch
} from './route_recognizer';
import {Route, AsyncRoute, AuxRoute, Redirect, RouteDefinition} from './route_config_impl';
import {AsyncRouteHandler} from './async_route_handler';
import {SyncRouteHandler} from './sync_route_handler';
import {Url} from './url_parser';
import {ComponentInstruction} from './instruction';


/**
 * `ComponentRecognizer` is responsible for recognizing routes for a single component.
 * It is consumed by `RouteRegistry`, which knows how to recognize an entire hierarchy of
 * components.
 */
export class ComponentRecognizer {
  names = new Map<string, RouteRecognizer>();

  // map from name to recognizer
  auxNames = new Map<string, RouteRecognizer>();

  // map from starting path to recognizer
  auxRoutes = new Map<string, RouteRecognizer>();

  // TODO: optimize this into a trie
  matchers: AbstractRecognizer[] = [];

  defaultRoute: RouteRecognizer = null;

  /**
   * returns whether or not the config is terminal
   */
  config(config: RouteDefinition): boolean {
    var handler;

    if (isPresent(config.name) && config.name[0].toUpperCase() != config.name[0]) {
      var suggestedName = config.name[0].toUpperCase() + config.name.substring(1);
      throw new BaseException(
          `Route "${config.path}" with name "${config.name}" does not begin with an uppercase letter. Route names should be CamelCase like "${suggestedName}".`);
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
    } else if (config instanceof AsyncRoute) {
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


  private _assertNoHashCollision(hash: string, path) {
    this.matchers.forEach((matcher) => {
      if (hash == matcher.hash) {
        throw new BaseException(
            `Configuration '${path}' conflicts with existing route '${matcher.path}'`);
      }
    });
  }


  /**
   * Given a URL, returns a list of `RouteMatch`es, which are partial recognitions for some route.
   */
  recognize(urlParse: Url): Promise<RouteMatch>[] {
    var solutions = [];

    this.matchers.forEach((routeRecognizer: AbstractRecognizer) => {
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

  recognizeAuxiliary(urlParse: Url): Promise<RouteMatch>[] {
    var routeRecognizer: RouteRecognizer = this.auxRoutes.get(urlParse.path);
    if (isPresent(routeRecognizer)) {
      return [routeRecognizer.recognize(urlParse)];
    }

    return [PromiseWrapper.resolve(null)];
  }

  hasRoute(name: string): boolean { return this.names.has(name); }

  componentLoaded(name: string): boolean {
    return this.hasRoute(name) && isPresent(this.names.get(name).handler.componentType);
  }

  loadComponent(name: string): Promise<any> {
    return this.names.get(name).handler.resolveComponentType();
  }

  generate(name: string, params: any): ComponentInstruction {
    var pathRecognizer: RouteRecognizer = this.names.get(name);
    if (isBlank(pathRecognizer)) {
      return null;
    }
    return pathRecognizer.generate(params);
  }

  generateAuxiliary(name: string, params: any): ComponentInstruction {
    var pathRecognizer: RouteRecognizer = this.auxNames.get(name);
    if (isBlank(pathRecognizer)) {
      return null;
    }
    return pathRecognizer.generate(params);
  }
}
