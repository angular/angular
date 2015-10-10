import {
  RegExp,
  RegExpWrapper,
  StringWrapper,
  isBlank,
  isPresent,
  isType,
  isStringMap,
  Type
} from 'angular2/src/core/facade/lang';
import {BaseException, WrappedException} from 'angular2/src/core/facade/exceptions';
import {Map, MapWrapper, ListWrapper, StringMapWrapper} from 'angular2/src/core/facade/collection';

import {PathRecognizer, PathMatch} from './path_recognizer';
import {Route, AsyncRoute, AuxRoute, Redirect, RouteDefinition} from './route_config_impl';
import {AsyncRouteHandler} from './async_route_handler';
import {SyncRouteHandler} from './sync_route_handler';
import {Url} from './url_parser';
import {ComponentInstruction} from './instruction';


/**
 * `RouteRecognizer` is responsible for recognizing routes for a single component.
 * It is consumed by `RouteRegistry`, which knows how to recognize an entire hierarchy of
 * components.
 */
export class RouteRecognizer {
  names = new Map<string, PathRecognizer>();

  auxRoutes = new Map<string, PathRecognizer>();

  // TODO: optimize this into a trie
  matchers: PathRecognizer[] = [];

  // TODO: optimize this into a trie
  redirects: Redirector[] = [];

  config(config: RouteDefinition): boolean {
    var handler;

    if (isPresent(config.as) && config.as[0].toUpperCase() != config.as[0]) {
      var suggestedAlias = config.as[0].toUpperCase() + config.as.substring(1);
      throw new BaseException(
          `Route '${config.path}' with alias '${config.as}' does not begin with an uppercase letter. Route aliases should be CamelCase like '${suggestedAlias}'.`);
    }

    if (config instanceof AuxRoute) {
      handler = new SyncRouteHandler(config.component, config.data);
      let path =
          StringWrapper.startsWith(config.path, '/') ? config.path.substring(1) : config.path;
      var recognizer = new PathRecognizer(config.path, handler);
      this.auxRoutes.set(path, recognizer);
      return recognizer.terminal;
    }
    if (config instanceof Redirect) {
      this.redirects.push(new Redirector(config.path, config.redirectTo));
      return true;
    }

    if (config instanceof Route) {
      handler = new SyncRouteHandler(config.component, config.data);
    } else if (config instanceof AsyncRoute) {
      handler = new AsyncRouteHandler(config.loader, config.data);
    }
    var recognizer = new PathRecognizer(config.path, handler);

    this.matchers.forEach((matcher) => {
      if (recognizer.hash == matcher.hash) {
        throw new BaseException(
            `Configuration '${config.path}' conflicts with existing route '${matcher.path}'`);
      }
    });

    this.matchers.push(recognizer);
    if (isPresent(config.as)) {
      this.names.set(config.as, recognizer);
    }
    return recognizer.terminal;
  }


  /**
   * Given a URL, returns a list of `RouteMatch`es, which are partial recognitions for some route.
   *
   */
  recognize(urlParse: Url): PathMatch[] {
    var solutions = [];

    urlParse = this._redirect(urlParse);

    this.matchers.forEach((pathRecognizer: PathRecognizer) => {
      var pathMatch = pathRecognizer.recognize(urlParse);

      if (isPresent(pathMatch)) {
        solutions.push(pathMatch);
      }
    });

    return solutions;
  }

  /** @internal */
  _redirect(urlParse: Url): Url {
    for (var i = 0; i < this.redirects.length; i += 1) {
      let redirector = this.redirects[i];
      var redirectedUrl = redirector.redirect(urlParse);
      if (isPresent(redirectedUrl)) {
        return redirectedUrl;
      }
    }

    return urlParse;
  }

  recognizeAuxiliary(urlParse: Url): PathMatch {
    var pathRecognizer = this.auxRoutes.get(urlParse.path);
    if (isBlank(pathRecognizer)) {
      return null;
    }
    return pathRecognizer.recognize(urlParse);
  }

  hasRoute(name: string): boolean { return this.names.has(name); }

  generate(name: string, params: any): ComponentInstruction {
    var pathRecognizer: PathRecognizer = this.names.get(name);
    if (isBlank(pathRecognizer)) {
      return null;
    }
    return pathRecognizer.generate(params);
  }
}

export class Redirector {
  segments: string[] = [];
  toSegments: string[] = [];

  constructor(path: string, redirectTo: string) {
    if (StringWrapper.startsWith(path, '/')) {
      path = path.substring(1);
    }
    this.segments = path.split('/');
    if (StringWrapper.startsWith(redirectTo, '/')) {
      redirectTo = redirectTo.substring(1);
    }
    this.toSegments = redirectTo.split('/');
  }

  /**
   * Returns `null` or a `ParsedUrl` representing the new path to match
   */
  redirect(urlParse: Url): Url {
    for (var i = 0; i < this.segments.length; i += 1) {
      if (isBlank(urlParse)) {
        return null;
      }
      let segment = this.segments[i];
      if (segment != urlParse.path) {
        return null;
      }
      urlParse = urlParse.child;
    }

    for (var i = this.toSegments.length - 1; i >= 0; i -= 1) {
      let segment = this.toSegments[i];
      urlParse = new Url(segment, urlParse);
    }
    return urlParse;
  }
}
