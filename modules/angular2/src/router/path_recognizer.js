import {RegExp, RegExpWrapper, RegExpMatcherWrapper, StringWrapper, isPresent, isBlank, BaseException, normalizeBlank} from 'angular2/src/facade/lang';
import {Map, MapWrapper, StringMap, StringMapWrapper, List, ListWrapper} from 'angular2/src/facade/collection';

import {escapeRegex} from './url';

class StaticSegment {
  string:string;
  regex:string;
  name:string;

  constructor(string:string) {
    this.string = string;
    this.name = '';
    this.regex = escapeRegex(string);
  }

  generate(params): string {
    return this.string;
  }
}

class DynamicSegment {
  name:string;
  regex:string;
  constructor(name:string) {
    this.name = name;
    this.regex = "([^/]+)";
  }

  generate(params:StringMap<string, string>): string {
    if (!StringMapWrapper.contains(params, this.name)) {
      throw new BaseException(`Route generator for '${this.name}' was not included in parameters passed.`)
    }
    return normalizeBlank(StringMapWrapper.get(params, this.name));
  }
}


class StarSegment {
  name:string;
  regex:string;
  constructor(name:string) {
    this.name = name;
    this.regex = "(.+)";
  }

  generate(params:StringMap<string, string>): string {
    return normalizeBlank(StringMapWrapper.get(params, this.name));
  }
}


var paramMatcher = RegExpWrapper.create("^:([^\/]+)$");
var wildcardMatcher = RegExpWrapper.create("^\\*([^\/]+)$");

function parsePathString(route:string) {
  // normalize route as not starting with a "/". Recognition will
  // also normalize.
  if (route[0] === "/") {
    route = StringWrapper.substring(route, 1);
  }

  var segments = splitBySlash(route);
  var results = ListWrapper.create();
  var cost = 0;

  for (var i=0; i<segments.length; i++) {
    var segment = segments[i],
        match;

    if (isPresent(match = RegExpWrapper.firstMatch(paramMatcher, segment))) {
      ListWrapper.push(results, new DynamicSegment(match[1]));
      cost += 100;
    } else if (isPresent(match = RegExpWrapper.firstMatch(wildcardMatcher, segment))) {
      ListWrapper.push(results, new StarSegment(match[1]));
      cost += 10000;
    } else if (segment.length > 0) {
      ListWrapper.push(results, new StaticSegment(segment));
      cost += 1;
    }
  }

  return {segments: results, cost};
}

function splitBySlash (url:string):List<string> {
  return url.split('/');
}


// represents something like '/foo/:bar'
export class PathRecognizer {
  segments:List;
  regex:RegExp;
  handler:any;
  cost:number;

  constructor(path:string, handler:any) {
    this.handler = handler;
    this.segments = [];

    // TODO: use destructuring assignment
    // see https://github.com/angular/ts2dart/issues/158
    var parsed = parsePathString(path);
    var cost = parsed['cost'];
    var segments = parsed['segments'];
    var regexString = '^';

    ListWrapper.forEach(segments, (segment) => {
      regexString += '/' + segment.regex;
    });

    this.regex = RegExpWrapper.create(regexString);
    this.segments = segments;
    this.cost = cost;
  }

  parseParams(url:string):StringMap<string, string> {
    var params = StringMapWrapper.create();
    var urlPart = url;
    for(var i=0; i<this.segments.length; i++) {
      var segment = this.segments[i];
      var match = RegExpWrapper.firstMatch(RegExpWrapper.create('/' + segment.regex), urlPart);
      urlPart = StringWrapper.substring(urlPart, match[0].length);
      if (segment.name.length > 0) {
        StringMapWrapper.set(params, segment.name, match[1]);
      }
    }

    return params;
  }

  generate(params:StringMap<string, string>):string {
    return ListWrapper.join(ListWrapper.map(this.segments, (segment) =>
      '/' + segment.generate(params)), '');
  }
}
