import {
  RegExp,
  RegExpWrapper,
  StringWrapper,
  isBlank,
  isPresent,
  isType,
  isStringMap,
  BaseException
} from 'angular2/src/facade/lang';
import {
  Map,
  MapWrapper,
  List,
  ListWrapper,
  StringMap,
  StringMapWrapper
} from 'angular2/src/facade/collection';

import {PathRecognizer} from './path_recognizer';
import {RouteHandler} from './route_handler';
import {Route, AsyncRoute, Redirect, RouteDefinition} from './route_config_impl';
import {AsyncRouteHandler} from './async_route_handler';
import {SyncRouteHandler} from './sync_route_handler';

/**
 * `RouteRecognizer` is responsible for recognizing routes for a single component.
 * It is consumed by `RouteRegistry`, which knows how to recognize an entire hierarchy of
 * components.
 */
export class RouteRecognizer {
  names: Map<string, PathRecognizer> = new Map();
  redirects: Map<string, string> = new Map();
  matchers: Map<RegExp, PathRecognizer> = new Map();

  config(config: RouteDefinition): boolean {
    var handler;
    if (config instanceof Redirect) {
      let path = config.path == '/' ? '' : config.path;
      this.redirects.set(path, config.redirectTo);
      return true;
    } else if (config instanceof Route) {
      handler = new SyncRouteHandler(config.component);
    } else if (config instanceof AsyncRoute) {
      handler = new AsyncRouteHandler(config.loader);
    }
    var recognizer = new PathRecognizer(config.path, handler);
    MapWrapper.forEach(this.matchers, (matcher, _) => {
      if (recognizer.regex.toString() == matcher.regex.toString()) {
        throw new BaseException(
            `Configuration '${config.path}' conflicts with existing route '${matcher.path}'`);
      }
    });
    this.matchers.set(recognizer.regex, recognizer);
    if (isPresent(config.as)) {
      this.names.set(config.as, recognizer);
    }
    return recognizer.terminal;
  }


  /**
   * Given a URL, returns a list of `RouteMatch`es, which are partial recognitions for some route.
   *
   */
  recognize(url: string): List<RouteMatch> {
    var solutions = [];
    if (url.length > 0 && url[url.length - 1] == '/') {
      url = url.substring(0, url.length - 1);
    }

    MapWrapper.forEach(this.redirects, (target, path) => {
      // "/" redirect case
      if (path == '/' || path == '') {
        if (path == url) {
          url = target;
        }
      } else if (url.startsWith(path)) {
        url = target + url.substring(path.length);
      }
    });

    MapWrapper.forEach(this.matchers, (pathRecognizer, regex) => {
      var match;
      if (isPresent(match = RegExpWrapper.firstMatch(regex, url))) {
        var matchedUrl = '/';
        var unmatchedUrl = '';
        if (url != '/') {
          matchedUrl = match[0];
          unmatchedUrl = url.substring(match[0].length);
        }
        solutions.push(new RouteMatch(pathRecognizer, matchedUrl, unmatchedUrl));
      }
    });

    return solutions;
  }

  hasRoute(name: string): boolean { return this.names.has(name); }

  generate(name: string, params: any): StringMap<string, any> {
    var pathRecognizer: PathRecognizer = this.names.get(name);
    if (isBlank(pathRecognizer)) {
      return null;
    }
    var url = pathRecognizer.generate(params);
    return {url, 'nextComponent': pathRecognizer.handler.componentType};
  }
}

export class RouteMatch {
  constructor(public recognizer: PathRecognizer, public matchedUrl: string,
              public unmatchedUrl: string) {}

  params(): StringMap<string, string> { return this.recognizer.parseParams(this.matchedUrl); }
}

function configObjToHandler(config: any): RouteHandler {
  if (isType(config)) {
    return new SyncRouteHandler(config);
  } else if (isStringMap(config)) {
    if (isBlank(config['type'])) {
      throw new BaseException(
          `Component declaration when provided as a map should include a 'type' property`);
    }
    var componentType = config['type'];
    if (componentType == 'constructor') {
      return new SyncRouteHandler(config['constructor']);
    } else if (componentType == 'loader') {
      return new AsyncRouteHandler(config['loader']);
    } else {
      throw new BaseException(`oops`);
    }
  }
  throw new BaseException(`Unexpected component "${config}".`);
}
