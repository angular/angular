library angular2.src.router.route_recognizer;

import "package:angular2/src/facade/lang.dart"
    show RegExp, RegExpWrapper, isBlank, isPresent, isType, isStringMap, Type;
import "package:angular2/src/facade/exceptions.dart"
    show BaseException, WrappedException;
import "package:angular2/src/facade/collection.dart"
    show Map, MapWrapper, ListWrapper, StringMapWrapper;
import "path_recognizer.dart" show PathRecognizer, PathMatch;
import "route_config_impl.dart"
    show Route, AsyncRoute, AuxRoute, Redirect, RouteDefinition;
import "async_route_handler.dart" show AsyncRouteHandler;
import "sync_route_handler.dart" show SyncRouteHandler;
import "url_parser.dart" show Url;
import "instruction.dart" show ComponentInstruction;

/**
 * `RouteRecognizer` is responsible for recognizing routes for a single component.
 * It is consumed by `RouteRegistry`, which knows how to recognize an entire hierarchy of
 * components.
 */
class RouteRecognizer {
  var names = new Map<String, PathRecognizer>();
  var auxRoutes = new Map<String, PathRecognizer>();
  // TODO: optimize this into a trie
  List<PathRecognizer> matchers = [];
  // TODO: optimize this into a trie
  List<Redirector> redirects = [];
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
      var recognizer = new PathRecognizer(config.path, handler);
      this.auxRoutes[path] = recognizer;
      return recognizer.terminal;
    }
    if (config is Redirect) {
      this.redirects.add(new Redirector(config.path, config.redirectTo));
      return true;
    }
    if (config is Route) {
      handler = new SyncRouteHandler(config.component, config.data);
    } else if (config is AsyncRoute) {
      handler = new AsyncRouteHandler(config.loader, config.data);
    }
    var recognizer = new PathRecognizer(config.path, handler);
    this.matchers.forEach((matcher) {
      if (recognizer.hash == matcher.hash) {
        throw new BaseException(
            '''Configuration \'${ config . path}\' conflicts with existing route \'${ matcher . path}\'''');
      }
    });
    this.matchers.add(recognizer);
    if (isPresent(config.name)) {
      this.names[config.name] = recognizer;
    }
    return recognizer.terminal;
  }

  /**
   * Given a URL, returns a list of `RouteMatch`es, which are partial recognitions for some route.
   *
   */
  List<PathMatch> recognize(Url urlParse) {
    var solutions = [];
    urlParse = this._redirect(urlParse);
    this.matchers.forEach((PathRecognizer pathRecognizer) {
      var pathMatch = pathRecognizer.recognize(urlParse);
      if (isPresent(pathMatch)) {
        solutions.add(pathMatch);
      }
    });
    return solutions;
  }

  /** @internal */
  Url _redirect(Url urlParse) {
    for (var i = 0; i < this.redirects.length; i += 1) {
      var redirector = this.redirects[i];
      var redirectedUrl = redirector.redirect(urlParse);
      if (isPresent(redirectedUrl)) {
        return redirectedUrl;
      }
    }
    return urlParse;
  }

  PathMatch recognizeAuxiliary(Url urlParse) {
    var pathRecognizer = this.auxRoutes[urlParse.path];
    if (isBlank(pathRecognizer)) {
      return null;
    }
    return pathRecognizer.recognize(urlParse);
  }

  bool hasRoute(String name) {
    return this.names.containsKey(name);
  }

  ComponentInstruction generate(String name, dynamic params) {
    PathRecognizer pathRecognizer = this.names[name];
    if (isBlank(pathRecognizer)) {
      return null;
    }
    return pathRecognizer.generate(params);
  }
}

class Redirector {
  List<String> segments = [];
  List<String> toSegments = [];
  Redirector(String path, String redirectTo) {
    if (path.startsWith("/")) {
      path = path.substring(1);
    }
    this.segments = path.split("/");
    if (redirectTo.startsWith("/")) {
      redirectTo = redirectTo.substring(1);
    }
    this.toSegments = redirectTo.split("/");
  }
  /**
   * Returns `null` or a `ParsedUrl` representing the new path to match
   */
  Url redirect(Url urlParse) {
    for (var i = 0; i < this.segments.length; i += 1) {
      if (isBlank(urlParse)) {
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
      urlParse = new Url(segment, urlParse);
    }
    return urlParse;
  }
}
