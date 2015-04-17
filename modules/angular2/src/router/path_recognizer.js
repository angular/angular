import {RegExp, RegExpWrapper, RegExpMatcherWrapper, StringWrapper, isPresent} from 'angular2/src/facade/lang';
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

  generate(params) {
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

  generate(params:StringMap) {
    return StringMapWrapper.get(params, this.name);
  }
}


class StarSegment {
  name:string;
  regex:string;
  constructor(name:string) {
    this.name = name;
    this.regex = "(.+)";
  }

  generate(params:StringMap) {
    return StringMapWrapper.get(params, this.name);
  }
}


var paramMatcher = RegExpWrapper.create("^:([^\/]+)$");
var wildcardMatcher = RegExpWrapper.create("^\\*([^\/]+)$");

function parsePathString(route:string):List {
  // normalize route as not starting with a "/". Recognition will
  // also normalize.
  if (route[0] === "/") {
    route = StringWrapper.substring(route, 1);
  }

  var segments = splitBySlash(route);
  var results = ListWrapper.create();

  for (var i=0; i<segments.length; i++) {
    var segment = segments[i],
      match;

    if (isPresent(match = RegExpWrapper.firstMatch(paramMatcher, segment))) {
      ListWrapper.push(results, new DynamicSegment(match[1]));
    } else if (isPresent(match = RegExpWrapper.firstMatch(wildcardMatcher, segment))) {
      ListWrapper.push(results, new StarSegment(match[1]));
    } else if (segment.length > 0) {
      ListWrapper.push(results, new StaticSegment(segment));
    }
  }

  return results;
}

var SLASH_RE = RegExpWrapper.create('/');
function splitBySlash (url:string):List<string> {
  return StringWrapper.split(url, SLASH_RE);
}


// represents something like '/foo/:bar'
export class PathRecognizer {
  segments:List;
  regex:RegExp;
  handler:any;

  constructor(path:string, handler:any) {
    this.handler = handler;
    this.segments = ListWrapper.create();

    var segments = parsePathString(path);
    var regexString = '^';

    ListWrapper.forEach(segments, (segment) => {
      regexString += '/' + segment.regex;
    });

    this.regex = RegExpWrapper.create(regexString);
    this.segments = segments;
  }

  parseParams(url:string):StringMap {
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

  generate(params:StringMap):string {
    return ListWrapper.join(ListWrapper.map(this.segments, (segment) => '/' + segment.generate(params)), '');
  }
}
