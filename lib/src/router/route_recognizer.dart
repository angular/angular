library angular2.src.router.route_recognizer;

import "package:angular2/src/facade/lang.dart" show isPresent, isBlank;
import "package:angular2/src/facade/exceptions.dart" show BaseException;
import "package:angular2/src/facade/promise.dart" show PromiseWrapper, Future;
import "package:angular2/src/facade/collection.dart" show Map;
import "route_handler.dart" show RouteHandler;
import "url_parser.dart" show Url;
import "instruction.dart" show ComponentInstruction;
import "path_recognizer.dart" show PathRecognizer;

abstract class RouteMatch {}

abstract class AbstractRecognizer {
  String hash;
  String path;
  Future<RouteMatch> recognize(Url beginningSegment);
  ComponentInstruction generate(Map<String, dynamic> params);
}

class PathMatch extends RouteMatch {
  ComponentInstruction instruction;
  Url remaining;
  List<Url> remainingAux;
  PathMatch(this.instruction, this.remaining, this.remainingAux) : super() {
    /* super call moved to initializer */;
  }
}

class RedirectMatch extends RouteMatch {
  List<dynamic> redirectTo;
  var specificity;
  RedirectMatch(this.redirectTo, this.specificity) : super() {
    /* super call moved to initializer */;
  }
}

class RedirectRecognizer implements AbstractRecognizer {
  String path;
  List<dynamic> redirectTo;
  PathRecognizer _pathRecognizer;
  String hash;
  RedirectRecognizer(this.path, this.redirectTo) {
    this._pathRecognizer = new PathRecognizer(path);
    this.hash = this._pathRecognizer.hash;
  }
  /**
   * Returns `null` or a `ParsedUrl` representing the new path to match
   */
  Future<RouteMatch> recognize(Url beginningSegment) {
    var match = null;
    if (isPresent(this._pathRecognizer.recognize(beginningSegment))) {
      match =
          new RedirectMatch(this.redirectTo, this._pathRecognizer.specificity);
    }
    return PromiseWrapper.resolve(match);
  }

  ComponentInstruction generate(Map<String, dynamic> params) {
    throw new BaseException('''Tried to generate a redirect.''');
  }
}

// represents something like '/foo/:bar'
class RouteRecognizer implements AbstractRecognizer {
  String path;
  RouteHandler handler;
  num specificity;
  bool terminal = true;
  String hash;
  Map<String, ComponentInstruction> _cache =
      new Map<String, ComponentInstruction>();
  PathRecognizer _pathRecognizer;
  // TODO: cache component instruction instances by params and by ParsedUrl instance
  RouteRecognizer(this.path, this.handler) {
    this._pathRecognizer = new PathRecognizer(path);
    this.specificity = this._pathRecognizer.specificity;
    this.hash = this._pathRecognizer.hash;
    this.terminal = this._pathRecognizer.terminal;
  }
  Future<RouteMatch> recognize(Url beginningSegment) {
    var res = this._pathRecognizer.recognize(beginningSegment);
    if (isBlank(res)) {
      return null;
    }
    return this.handler.resolveComponentType().then((_) {
      var componentInstruction = this
          ._getInstruction(res["urlPath"], res["urlParams"], res["allParams"]);
      return new PathMatch(
          componentInstruction, res["nextSegment"], res["auxiliary"]);
    });
  }

  ComponentInstruction generate(Map<String, dynamic> params) {
    var generated = this._pathRecognizer.generate(params);
    var urlPath = generated["urlPath"];
    var urlParams = generated["urlParams"];
    return this._getInstruction(urlPath, urlParams, params);
  }

  Map<String, dynamic> generateComponentPathValues(
      Map<String, dynamic> params) {
    return this._pathRecognizer.generate(params);
  }

  ComponentInstruction _getInstruction(
      String urlPath, List<String> urlParams, Map<String, dynamic> params) {
    if (isBlank(this.handler.componentType)) {
      throw new BaseException(
          '''Tried to get instruction before the type was loaded.''');
    }
    var hashKey = urlPath + "?" + urlParams.join("?");
    if (this._cache.containsKey(hashKey)) {
      return this._cache[hashKey];
    }
    var instruction = new ComponentInstruction(
        urlPath,
        urlParams,
        this.handler.data,
        this.handler.componentType,
        this.terminal,
        this.specificity,
        params);
    this._cache[hashKey] = instruction;
    return instruction;
  }
}
