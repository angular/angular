import {
  RegExp,
  RegExpWrapper,
  RegExpMatcherWrapper,
  StringWrapper,
  isPresent,
  isBlank
} from 'angular2/src/facade/lang';
import {BaseException, WrappedException} from 'angular2/src/facade/exceptions';
import {Map, MapWrapper, StringMapWrapper} from 'angular2/src/facade/collection';

import {Url, RootUrl, serializeParams} from './url_parser';

class TouchMap {
  map: {[key: string]: string} = {};
  keys: {[key: string]: boolean} = {};

  constructor(map: {[key: string]: any}) {
    if (isPresent(map)) {
      StringMapWrapper.forEach(map, (value, key) => {
        this.map[key] = isPresent(value) ? value.toString() : null;
        this.keys[key] = true;
      });
    }
  }

  get(key: string): string {
    StringMapWrapper.delete(this.keys, key);
    return this.map[key];
  }

  getUnused(): {[key: string]: any} {
    var unused: {[key: string]: any} = {};
    var keys = StringMapWrapper.keys(this.keys);
    keys.forEach(key => unused[key] = StringMapWrapper.get(this.map, key));
    return unused;
  }
}

function normalizeString(obj: any): string {
  if (isBlank(obj)) {
    return null;
  } else {
    return obj.toString();
  }
}

interface Segment {
  name: string;
  generate(params: TouchMap): string;
  match(path: string): boolean;
}

class ContinuationSegment implements Segment {
  name: string = '';
  generate(params: TouchMap): string { return ''; }
  match(path: string): boolean { return true; }
}

class StaticSegment implements Segment {
  name: string = '';
  constructor(public path: string) {}
  match(path: string): boolean { return path == this.path; }
  generate(params: TouchMap): string { return this.path; }
}

class DynamicSegment implements Segment {
  constructor(public name: string) {}
  match(path: string): boolean { return path.length > 0; }
  generate(params: TouchMap): string {
    if (!StringMapWrapper.contains(params.map, this.name)) {
      throw new BaseException(
          `Route generator for '${this.name}' was not included in parameters passed.`);
    }
    return normalizeString(params.get(this.name));
  }
}


class StarSegment implements Segment {
  constructor(public name: string) {}
  match(path: string): boolean { return true; }
  generate(params: TouchMap): string { return normalizeString(params.get(this.name)); }
}


var paramMatcher = /^:([^\/]+)$/g;
var wildcardMatcher = /^\*([^\/]+)$/g;

function parsePathString(route: string): {[key: string]: any} {
  // normalize route as not starting with a "/". Recognition will
  // also normalize.
  if (route.startsWith("/")) {
    route = route.substring(1);
  }

  var segments = splitBySlash(route);
  var results = [];

  var specificity = '';

  // a single slash (or "empty segment" is as specific as a static segment
  if (segments.length == 0) {
    specificity += '2';
  }

  // The "specificity" of a path is used to determine which route is used when multiple routes match
  // a URL. Static segments (like "/foo") are the most specific, followed by dynamic segments (like
  // "/:id"). Star segments add no specificity. Segments at the start of the path are more specific
  // than proceeding ones.
  //
  // The code below uses place values to combine the different types of segments into a single
  // string that we can sort later. Each static segment is marked as a specificity of "2," each
  // dynamic segment is worth "1" specificity, and stars are worth "0" specificity.

  var limit = segments.length - 1;
  for (var i = 0; i <= limit; i++) {
    var segment = segments[i], match;

    if (isPresent(match = RegExpWrapper.firstMatch(paramMatcher, segment))) {
      results.push(new DynamicSegment(match[1]));
      specificity += '1';
    } else if (isPresent(match = RegExpWrapper.firstMatch(wildcardMatcher, segment))) {
      results.push(new StarSegment(match[1]));
      specificity += '0';
    } else if (segment == '...') {
      if (i < limit) {
        throw new BaseException(`Unexpected "..." before the end of the path for "${route}".`);
      }
      results.push(new ContinuationSegment());
    } else {
      results.push(new StaticSegment(segment));
      specificity += '2';
    }
  }

  return {'segments': results, 'specificity': specificity};
}

// this function is used to determine whether a route config path like `/foo/:id` collides with
// `/foo/:name`
function pathDslHash(segments: Segment[]): string {
  return segments.map((segment) => {
                   if (segment instanceof StarSegment) {
                     return '*';
                   } else if (segment instanceof ContinuationSegment) {
                     return '...';
                   } else if (segment instanceof DynamicSegment) {
                     return ':';
                   } else if (segment instanceof StaticSegment) {
                     return segment.path;
                   }
                 })
      .join('/');
}

function splitBySlash(url: string): string[] {
  return url.split('/');
}

var RESERVED_CHARS = RegExpWrapper.create('//|\\(|\\)|;|\\?|=');
function assertPath(path: string) {
  if (StringWrapper.contains(path, '#')) {
    throw new BaseException(
        `Path "${path}" should not include "#". Use "HashLocationStrategy" instead.`);
  }
  var illegalCharacter = RegExpWrapper.firstMatch(RESERVED_CHARS, path);
  if (isPresent(illegalCharacter)) {
    throw new BaseException(
        `Path "${path}" contains "${illegalCharacter[0]}" which is not allowed in a route config.`);
  }
}


/**
 * Parses a URL string using a given matcher DSL, and generates URLs from param maps
 */
export class PathRecognizer {
  private _segments: Segment[];
  specificity: string;
  terminal: boolean = true;
  hash: string;

  constructor(public path: string) {
    assertPath(path);
    var parsed = parsePathString(path);

    this._segments = parsed['segments'];
    this.specificity = parsed['specificity'];
    this.hash = pathDslHash(this._segments);

    var lastSegment = this._segments[this._segments.length - 1];
    this.terminal = !(lastSegment instanceof ContinuationSegment);
  }

  recognize(beginningSegment: Url): {[key: string]: any} {
    var nextSegment = beginningSegment;
    var currentSegment: Url;
    var positionalParams = {};
    var captured = [];

    for (var i = 0; i < this._segments.length; i += 1) {
      var segment = this._segments[i];

      currentSegment = nextSegment;
      if (segment instanceof ContinuationSegment) {
        break;
      }

      if (isPresent(currentSegment)) {
        captured.push(currentSegment.path);

        // the star segment consumes all of the remaining URL, including matrix params
        if (segment instanceof StarSegment) {
          positionalParams[segment.name] = currentSegment.toString();
          nextSegment = null;
          break;
        }

        if (segment instanceof DynamicSegment) {
          positionalParams[segment.name] = currentSegment.path;
        } else if (!segment.match(currentSegment.path)) {
          return null;
        }

        nextSegment = currentSegment.child;
      } else if (!segment.match('')) {
        return null;
      }
    }

    if (this.terminal && isPresent(nextSegment)) {
      return null;
    }

    var urlPath = captured.join('/');

    var auxiliary;
    var urlParams;
    var allParams;
    if (isPresent(currentSegment)) {
      // If this is the root component, read query params. Otherwise, read matrix params.
      var paramsSegment = beginningSegment instanceof RootUrl ? beginningSegment : currentSegment;

      allParams = isPresent(paramsSegment.params) ?
                      StringMapWrapper.merge(paramsSegment.params, positionalParams) :
                      positionalParams;

      urlParams = serializeParams(paramsSegment.params);


      auxiliary = currentSegment.auxiliary;
    } else {
      allParams = positionalParams;
      auxiliary = [];
      urlParams = [];
    }
    return {urlPath, urlParams, allParams, auxiliary, nextSegment};
  }


  generate(params: {[key: string]: any}): {[key: string]: any} {
    var paramTokens = new TouchMap(params);

    var path = [];

    for (var i = 0; i < this._segments.length; i++) {
      let segment = this._segments[i];
      if (!(segment instanceof ContinuationSegment)) {
        path.push(segment.generate(paramTokens));
      }
    }
    var urlPath = path.join('/');

    var nonPositionalParams = paramTokens.getUnused();
    var urlParams = serializeParams(nonPositionalParams);

    return {urlPath, urlParams};
  }
}
