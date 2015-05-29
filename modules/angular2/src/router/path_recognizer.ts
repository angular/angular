import {
  RegExp,
  RegExpWrapper,
  RegExpMatcherWrapper,
  StringWrapper,
  isPresent,
  isBlank,
  BaseException,
  normalizeBlank
} from 'angular2/src/facade/lang';
import {
  Map,
  MapWrapper,
  StringMap,
  StringMapWrapper,
  List,
  ListWrapper
} from 'angular2/src/facade/collection';
import {IMPLEMENTS} from 'angular2/src/facade/lang';

import {escapeRegex} from './url';

// TODO(jeffbcross): implement as interface when ts2dart adds support:
// https://github.com/angular/ts2dart/issues/173
export class Segment {
  name: string;
  regex: string;
}

class StaticSegment extends Segment {
  regex: string;
  name: string;

  constructor(public string: string) {
    super();
    this.name = '';
    this.regex = escapeRegex(string);
  }

  generate(params): string { return this.string; }
}

@IMPLEMENTS(Segment)
class DynamicSegment {
  regex: string;
  constructor(public name: string) { this.regex = "([^/]+)"; }

  generate(params: StringMap<string, string>): string {
    if (!StringMapWrapper.contains(params, this.name)) {
      throw new BaseException(
          `Route generator for '${this.name}' was not included in parameters passed.`)
    }
    return normalizeBlank(StringMapWrapper.get(params, this.name));
  }
}


class StarSegment {
  regex: string;
  constructor(public name: string) { this.regex = "(.+)"; }

  generate(params: StringMap<string, string>): string {
    return normalizeBlank(StringMapWrapper.get(params, this.name));
  }
}


var paramMatcher = RegExpWrapper.create("^:([^\/]+)$");
var wildcardMatcher = RegExpWrapper.create("^\\*([^\/]+)$");

function parsePathString(route: string) {
  // normalize route as not starting with a "/". Recognition will
  // also normalize.
  if (route[0] === "/") {
    route = StringWrapper.substring(route, 1);
  }

  var segments = splitBySlash(route);
  var results = ListWrapper.create();
  var specificity = 0;

  // The "specificity" of a path is used to determine which route is used when multiple routes match
  // a URL.
  // Static segments (like "/foo") are the most specific, followed by dynamic segments (like
  // "/:id"). Star segments
  // add no specificity. Segments at the start of the path are more specific than proceeding ones.
  // The code below uses place values to combine the different types of segments into a single
  // integer that we can
  // sort later. Each static segment is worth hundreds of points of specificity (10000, 9900, ...,
  // 200), and each
  // dynamic segment is worth single points of specificity (100, 99, ... 2).
  if (segments.length > 98) {
    throw new BaseException(`'${route}' has more than the maximum supported number of segments.`);
  }

  for (var i = 0; i < segments.length; i++) {
    var segment = segments[i], match;

    if (isPresent(match = RegExpWrapper.firstMatch(paramMatcher, segment))) {
      ListWrapper.push(results, new DynamicSegment(match[1]));
      specificity += (100 - i);
    } else if (isPresent(match = RegExpWrapper.firstMatch(wildcardMatcher, segment))) {
      ListWrapper.push(results, new StarSegment(match[1]));
    } else if (segment.length > 0) {
      ListWrapper.push(results, new StaticSegment(segment));
      specificity += 100 * (100 - i);
    }
  }

  return {segments: results, specificity};
}

function splitBySlash(url: string): List<string> {
  return url.split('/');
}


// represents something like '/foo/:bar'
export class PathRecognizer {
  segments: List<Segment>;
  regex: RegExp;
  specificity: number;

  constructor(public path: string, public handler: any) {
    this.segments = [];

    // TODO: use destructuring assignment
    // see https://github.com/angular/ts2dart/issues/158
    var parsed = parsePathString(path);
    var specificity = parsed['specificity'];
    var segments = parsed['segments'];
    var regexString = '^';

    ListWrapper.forEach(segments, (segment) => { regexString += '/' + segment.regex; });

    this.regex = RegExpWrapper.create(regexString);
    this.segments = segments;
    this.specificity = specificity;
  }

  parseParams(url: string): StringMap<string, string> {
    var params = StringMapWrapper.create();
    var urlPart = url;
    for (var i = 0; i < this.segments.length; i++) {
      var segment = this.segments[i];
      var match = RegExpWrapper.firstMatch(RegExpWrapper.create('/' + segment.regex), urlPart);
      urlPart = StringWrapper.substring(urlPart, match[0].length);
      if (segment.name.length > 0) {
        StringMapWrapper.set(params, segment.name, match[1]);
      }
    }

    return params;
  }

  generate(params: StringMap<string, string>): string {
    return ListWrapper.join(
        ListWrapper.map(this.segments, (segment) => '/' + segment.generate(params)), '');
  }
}
