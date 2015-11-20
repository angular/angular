library angular2.src.router.component_recognizer;

import "package:angular2/src/facade/lang.dart" show isBlank, isPresent;
import "package:angular2/src/facade/exceptions.dart"
    show BaseException, WrappedException;
import "package:angular2/src/facade/collection.dart"
    show Map, MapWrapper, ListWrapper, StringMapWrapper;
import "package:angular2/src/facade/async.dart" show Future, PromiseWrapper;
import "route_recognizer.dart"
    show AbstractRecognizer, RouteRecognizer, RedirectRecognizer, RouteMatch;
import "route_config_impl.dart"
    show Route, AsyncRoute, AuxRoute, Redirect, RouteDefinition;
import "async_route_handler.dart" show AsyncRouteHandler;
import "sync_route_handler.dart" show SyncRouteHandler;
import "url_parser.dart" show Url;
import "instruction.dart" show ComponentInstruction;

/**
 * `ComponentRecognizer` is responsible for recognizing routes for a single component.
 * It is consumed by `RouteRegistry`, which knows how to recognize an entire hierarchy of
 * components.
 */
class ComponentRecognizer {
  var names = new Map<String, RouteRecognizer>();
  // map from name to recognizer
  var auxNames = new Map<String, RouteRecognizer>();
  // map from starting path to recognizer
  var auxRoutes = new Map<String, RouteRecognizer>();
  // TODO: optimize this into a trie
  List<AbstractRecognizer> matchers = [];
  RouteRecognizer defaultRoute = null;
  /**
   * returns whether or not the config is terminal
   */
  bool config(RouteDefinition config) {
    var handler;
    if (isPresent(config.name) &&
        config.name[0].toUpperCase() != config.name[0]) {
      var suggestedName =
          config.name[0].toUpperCase() + config.name.substring(1);
      throw new BaseException(
          '''Route "${ config . path}" with name "${ config . name}" does not begin with an uppercase letter. Route names should be CamelCase like "${ suggestedName}".''');
    }
    if (config is AuxRoute) {
      handler = new SyncRouteHandler(config.component, config.data);
      var path =
          config.path.startsWith("/") ? config.path.substring(1) : config.path;
      var recognizer = new RouteRecognizer(config.path, handler);
      this.auxRoutes[path] = recognizer;
      if (isPresent(config.name)) {
        this.auxNames[config.name] = recognizer;
      }
      return recognizer.terminal;
    }
    var useAsDefault = false;
    if (config is Redirect) {
      var redirector = new RedirectRecognizer(config.path, config.redirectTo);
      this._assertNoHashCollision(redirector.hash, config.path);
      this.matchers.add(redirector);
      return true;
    }
    if (config is Route) {
      handler = new SyncRouteHandler(config.component, config.data);
      useAsDefault = isPresent(config.useAsDefault) && config.useAsDefault;
    } else if (config is AsyncRoute) {
      handler = new AsyncRouteHandler(config.loader, config.data);
      useAsDefault = isPresent(config.useAsDefault) && config.useAsDefault;
    }
    var recognizer = new RouteRecognizer(config.path, handler);
    this._assertNoHashCollision(recognizer.hash, config.path);
    if (useAsDefault) {
      if (isPresent(this.defaultRoute)) {
        throw new BaseException('''Only one route can be default''');
      }
      this.defaultRoute = recognizer;
    }
    this.matchers.add(recognizer);
    if (isPresent(config.name)) {
      this.names[config.name] = recognizer;
    }
    return recognizer.terminal;
  }

  _assertNoHashCollision(String hash, path) {
    this.matchers.forEach((matcher) {
      if (hash == matcher.hash) {
        throw new BaseException(
            '''Configuration \'${ path}\' conflicts with existing route \'${ matcher . path}\'''');
      }
    });
  }

  /**
   * Given a URL, returns a list of `RouteMatch`es, which are partial recognitions for some route.
   */
  List<Future<RouteMatch>> recognize(Url urlParse) {
    var solutions = [];
    this.matchers.forEach((AbstractRecognizer routeRecognizer) {
      var pathMatch = routeRecognizer.recognize(urlParse);
      if (isPresent(pathMatch)) {
        solutions.add(pathMatch);
      }
    });
    return solutions;
  }

  List<Future<RouteMatch>> recognizeAuxiliary(Url urlParse) {
    RouteRecognizer routeRecognizer = this.auxRoutes[urlParse.path];
    if (isPresent(routeRecognizer)) {
      return [routeRecognizer.recognize(urlParse)];
    }
    return [PromiseWrapper.resolve(null)];
  }

  bool hasRoute(String name) {
    return this.names.containsKey(name);
  }

  bool componentLoaded(String name) {
    return this.hasRoute(name) &&
        isPresent(this.names[name].handler.componentType);
  }

  Future<dynamic> loadComponent(String name) {
    return this.names[name].handler.resolveComponentType();
  }

  ComponentInstruction generate(String name, dynamic params) {
    RouteRecognizer pathRecognizer = this.names[name];
    if (isBlank(pathRecognizer)) {
      return null;
    }
    return pathRecognizer.generate(params);
  }

  ComponentInstruction generateAuxiliary(String name, dynamic params) {
    RouteRecognizer pathRecognizer = this.auxNames[name];
    if (isBlank(pathRecognizer)) {
      return null;
    }
    return pathRecognizer.generate(params);
  }
}
