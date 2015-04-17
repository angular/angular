import {RegExp, RegExpWrapper, StringWrapper, isPresent} from 'angular2/src/facade/lang';
import {Map, MapWrapper, List, ListWrapper, StringMap, StringMapWrapper} from 'angular2/src/facade/collection';

import {PathRecognizer} from './path_recognizer';

export class RouteRecognizer {
  names:Map<string, PathRecognizer>;
  redirects:Map<string, string>;
  matchers:Map<RegExp, PathRecognizer>;

  constructor() {
    this.names = MapWrapper.create();
    this.matchers = MapWrapper.create();
    this.redirects = MapWrapper.create();
  }

  addRedirect(path:string, target:string) {
    MapWrapper.set(this.redirects, path, target);
  }

  addConfig(path:string, handler:any, alias:string = null) {
    var recognizer = new PathRecognizer(path, handler);
    MapWrapper.set(this.matchers, recognizer.regex, recognizer);
    if (isPresent(alias)) {
      MapWrapper.set(this.names, alias, recognizer);
    }
  }

  recognize(url:string):List<StringMap> {
    var solutions = [];
    MapWrapper.forEach(this.redirects, (target, path) => {
      //TODO: "/" redirect case
      if (StringWrapper.startsWith(url, path)) {
        url = target + StringWrapper.substring(url, path.length);
      }
    });

    MapWrapper.forEach(this.matchers, (pathRecognizer, regex) => {
      var match;
      if (isPresent(match = RegExpWrapper.firstMatch(regex, url))) {
        var solution = StringMapWrapper.create();
        StringMapWrapper.set(solution, 'handler', pathRecognizer.handler);
        StringMapWrapper.set(solution, 'params', pathRecognizer.parseParams(url));
        StringMapWrapper.set(solution, 'matchedUrl', match[0]);

        var unmatchedUrl = StringWrapper.substring(url, match[0].length);
        StringMapWrapper.set(solution, 'unmatchedUrl', unmatchedUrl);

        ListWrapper.push(solutions, solution);
      }
    });

    return solutions;
  }

  hasRoute(name:string) {
    return MapWrapper.contains(this.names, name);
  }

  generate(name:string, params:any) {
    var pathRecognizer = MapWrapper.get(this.names, name);
    return pathRecognizer.generate(params);
  }
}
