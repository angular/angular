import {
  RegExp,
  RegExpWrapper,
  StringWrapper,
  isBlank,
  isPresent,
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

import {Promise, PromiseWrapper} from 'angular2/src/facade/async';

import {PathRecognizer} from './path_recognizer';

/**
 * `RouteRecognizer` is responsible for recognizing routes for a single component.
 * It is consumed by `RouteRegistry`, which knows how to recognize an entire hierarchy of
 * components.
 */
export class RouteRecognizer {
  names: Map<string, PathRecognizer> = new Map();
  redirects: Map<string, string> = new Map();
  matchers: Map<RegExp, PathRecognizer> = new Map();

  addRedirect(path: string, target: string): void {
    if (path == '/') {
      path = '';
    }
    this.redirects.set(path, target);
  }

  addConfig(path: string, handler: any, alias: string = null): boolean {
    var recognizer = new PathRecognizer(path, handler);
    MapWrapper.forEach(this.matchers, (matcher, _) => {
      if (recognizer.regex.toString() == matcher.regex.toString()) {
        throw new BaseException(
            `Configuration '${path}' conflicts with existing route '${matcher.path}'`);
      }
    });
    this.matchers.set(recognizer.regex, recognizer);
    if (isPresent(alias)) {
      this.names.set(alias, recognizer);
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
        solutions.push(new RouteMatch({
          specificity: pathRecognizer.specificity,
          handler: pathRecognizer.handler,
          params: pathRecognizer.parseParams(url),
          matchedUrl: matchedUrl,
          unmatchedUrl: unmatchedUrl,
          onResolve: (componentType) => { pathRecognizer.targetComponent = componentType; }
        }));
      }
    });

    return solutions;
  }

  hasRoute(name: string): boolean { return this.names.has(name); }

  generate(name: string, params: any) {
    var pathRecognizer: PathRecognizer = this.names.get(name);
    if (isBlank(pathRecognizer)) {
      return null;
    }
    var url = pathRecognizer.generate(params);
    return {url, 'nextComponent': pathRecognizer.targetComponent};
  }
}

export class RouteMatch {
  specificity: number;
  handler: StringMap<string, any>;
  params: StringMap<string, string>;
  matchedUrl: string;
  unmatchedUrl: string;
  _onResolve: Function;

  constructor({specificity, handler, params, matchedUrl, unmatchedUrl, onResolve}: {
    specificity?: number,
    handler?: StringMap<string, any>,
    params?: StringMap<string, string>,
    matchedUrl?: string,
    unmatchedUrl?: string,
    onResolve?: Function
  } = {}) {
    this.specificity = specificity;
    this.handler = handler;
    this.params = params;
    this.matchedUrl = matchedUrl;
    this.unmatchedUrl = unmatchedUrl;
    this._onResolve = onResolve;
  }

  resolveComponentType(): Promise<any> {
    var componentDeclaration = this.handler['component'], type = componentDeclaration['type'];

    if (type == 'constructor') {
      return PromiseWrapper.resolve(componentDeclaration['constructor']);
    } else if (type == 'loader') {
      var resolverFunction = componentDeclaration['loader'];
      return resolverFunction().then((componentType) => {
        this._onResolve(componentType);
        return componentType;
      });
    } else {
      throw new BaseException(`Cannot extract the component type from a '${type}' component`);
    }
  }
}
