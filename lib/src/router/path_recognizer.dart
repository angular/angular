library angular2.src.router.path_recognizer;

import "package:angular2/src/facade/lang.dart"
    show
        RegExp,
        RegExpWrapper,
        RegExpMatcherWrapper,
        StringWrapper,
        isPresent,
        isBlank;
import "package:angular2/src/facade/exceptions.dart"
    show BaseException, WrappedException;
import "package:angular2/src/facade/collection.dart"
    show Map, MapWrapper, StringMapWrapper;
import "url_parser.dart" show Url, RootUrl, serializeParams;

class TouchMap {
  Map<String, String> map = {};
  Map<String, bool> keys = {};
  TouchMap(Map<String, dynamic> map) {
    if (isPresent(map)) {
      StringMapWrapper.forEach(map, (value, key) {
        this.map[key] = isPresent(value) ? value.toString() : null;
        this.keys[key] = true;
      });
    }
  }
  String get(String key) {
    StringMapWrapper.delete(this.keys, key);
    return this.map[key];
  }

  Map<String, dynamic> getUnused() {
    Map<String, dynamic> unused = {};
    var keys = StringMapWrapper.keys(this.keys);
    keys.forEach((key) => unused[key] = StringMapWrapper.get(this.map, key));
    return unused;
  }
}

String normalizeString(dynamic obj) {
  if (isBlank(obj)) {
    return null;
  } else {
    return obj.toString();
  }
}

abstract class Segment {
  String name;
  String generate(TouchMap params);
  bool match(String path);
}

class ContinuationSegment implements Segment {
  String name = "";
  String generate(TouchMap params) {
    return "";
  }

  bool match(String path) {
    return true;
  }
}

class StaticSegment implements Segment {
  String path;
  String name = "";
  StaticSegment(this.path) {}
  bool match(String path) {
    return path == this.path;
  }

  String generate(TouchMap params) {
    return this.path;
  }
}

class DynamicSegment implements Segment {
  String name;
  DynamicSegment(this.name) {}
  bool match(String path) {
    return path.length > 0;
  }

  String generate(TouchMap params) {
    if (!StringMapWrapper.contains(params.map, this.name)) {
      throw new BaseException(
          '''Route generator for \'${ this . name}\' was not included in parameters passed.''');
    }
    return normalizeString(params.get(this.name));
  }
}

class StarSegment implements Segment {
  String name;
  StarSegment(this.name) {}
  bool match(String path) {
    return true;
  }

  String generate(TouchMap params) {
    return normalizeString(params.get(this.name));
  }
}

var paramMatcher = new RegExp(r'^:([^\/]+)$');
var wildcardMatcher = new RegExp(r'^\*([^\/]+)$');
Map<String, dynamic> parsePathString(String route) {
  // normalize route as not starting with a "/". Recognition will

  // also normalize.
  if (route.startsWith("/")) {
    route = route.substring(1);
  }
  var segments = splitBySlash(route);
  var results = [];
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
    throw new BaseException(
        '''\'${ route}\' has more than the maximum supported number of segments.''');
  }
  var limit = segments.length - 1;
  for (var i = 0; i <= limit; i++) {
    var segment = segments[i], match;
    if (isPresent(match = RegExpWrapper.firstMatch(paramMatcher, segment))) {
      results.add(new DynamicSegment(match[1]));
      specificity += (100 - i);
    } else if (isPresent(
        match = RegExpWrapper.firstMatch(wildcardMatcher, segment))) {
      results.add(new StarSegment(match[1]));
    } else if (segment == "...") {
      if (i < limit) {
        throw new BaseException(
            '''Unexpected "..." before the end of the path for "${ route}".''');
      }
      results.add(new ContinuationSegment());
    } else {
      results.add(new StaticSegment(segment));
      specificity += 100 * (100 - i);
    }
  }
  var result = StringMapWrapper.create();
  StringMapWrapper.set(result, "segments", results);
  StringMapWrapper.set(result, "specificity", specificity);
  return result;
}
// this function is used to determine whether a route config path like `/foo/:id` collides with

// `/foo/:name`
String pathDslHash(List<Segment> segments) {
  return segments.map((segment) {
    if (segment is StarSegment) {
      return "*";
    } else if (segment is ContinuationSegment) {
      return "...";
    } else if (segment is DynamicSegment) {
      return ":";
    } else if (segment is StaticSegment) {
      return segment.path;
    }
  }).toList().join("/");
}

List<String> splitBySlash(String url) {
  return url.split("/");
}

var RESERVED_CHARS = RegExpWrapper.create("//|\\(|\\)|;|\\?|=");
assertPath(String path) {
  if (StringWrapper.contains(path, "#")) {
    throw new BaseException(
        '''Path "${ path}" should not include "#". Use "HashLocationStrategy" instead.''');
  }
  var illegalCharacter = RegExpWrapper.firstMatch(RESERVED_CHARS, path);
  if (isPresent(illegalCharacter)) {
    throw new BaseException(
        '''Path "${ path}" contains "${ illegalCharacter [ 0 ]}" which is not allowed in a route config.''');
  }
}

/**
 * Parses a URL string using a given matcher DSL, and generates URLs from param maps
 */
class PathRecognizer {
  String path;
  List<Segment> _segments;
  num specificity;
  bool terminal = true;
  String hash;
  PathRecognizer(this.path) {
    assertPath(path);
    var parsed = parsePathString(path);
    this._segments = parsed["segments"];
    this.specificity = parsed["specificity"];
    this.hash = pathDslHash(this._segments);
    var lastSegment = this._segments[this._segments.length - 1];
    this.terminal = !(lastSegment is ContinuationSegment);
  }
  Map<String, dynamic> recognize(Url beginningSegment) {
    var nextSegment = beginningSegment;
    Url currentSegment;
    var positionalParams = {};
    var captured = [];
    for (var i = 0; i < this._segments.length; i += 1) {
      var segment = this._segments[i];
      currentSegment = nextSegment;
      if (segment is ContinuationSegment) {
        break;
      }
      if (isPresent(currentSegment)) {
        captured.add(currentSegment.path);
        // the star segment consumes all of the remaining URL, including matrix params
        if (segment is StarSegment) {
          positionalParams[segment.name] = currentSegment.toString();
          nextSegment = null;
          break;
        }
        if (segment is DynamicSegment) {
          positionalParams[segment.name] = currentSegment.path;
        } else if (!segment.match(currentSegment.path)) {
          return null;
        }
        nextSegment = currentSegment.child;
      } else if (!segment.match("")) {
        return null;
      }
    }
    if (this.terminal && isPresent(nextSegment)) {
      return null;
    }
    var urlPath = captured.join("/");
    var auxiliary;
    var urlParams;
    var allParams;
    if (isPresent(currentSegment)) {
      // If this is the root component, read query params. Otherwise, read matrix params.
      var paramsSegment =
          beginningSegment is RootUrl ? beginningSegment : currentSegment;
      allParams = isPresent(paramsSegment.params)
          ? StringMapWrapper.merge(paramsSegment.params, positionalParams)
          : positionalParams;
      urlParams = serializeParams(paramsSegment.params);
      auxiliary = currentSegment.auxiliary;
    } else {
      allParams = positionalParams;
      auxiliary = [];
      urlParams = [];
    }
    return {
      "urlPath": urlPath,
      "urlParams": urlParams,
      "allParams": allParams,
      "auxiliary": auxiliary,
      "nextSegment": nextSegment
    };
  }

  Map<String, dynamic> generate(Map<String, dynamic> params) {
    var paramTokens = new TouchMap(params);
    var path = [];
    for (var i = 0; i < this._segments.length; i++) {
      var segment = this._segments[i];
      if (!(segment is ContinuationSegment)) {
        path.add(segment.generate(paramTokens));
      }
    }
    var urlPath = path.join("/");
    var nonPositionalParams = paramTokens.getUnused();
    var urlParams = serializeParams(nonPositionalParams);
    return {"urlPath": urlPath, "urlParams": urlParams};
  }
}
