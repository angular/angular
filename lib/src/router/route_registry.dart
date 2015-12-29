library angular2.src.router.route_registry;

import "package:angular2/src/facade/collection.dart"
    show ListWrapper, Map, MapWrapper, StringMapWrapper;
import "package:angular2/src/facade/async.dart" show Future, PromiseWrapper;
import "package:angular2/src/facade/lang.dart"
    show
        isPresent,
        isArray,
        isBlank,
        isType,
        isString,
        isStringMap,
        Type,
        StringWrapper,
        Math,
        getTypeNameForDebugging;
import "package:angular2/src/facade/exceptions.dart"
    show BaseException, WrappedException;
import "package:angular2/src/core/reflection/reflection.dart" show reflector;
import "package:angular2/core.dart" show Injectable, Inject, OpaqueToken;
import "route_config_impl.dart"
    show RouteConfig, AsyncRoute, Route, AuxRoute, Redirect, RouteDefinition;
import "route_recognizer.dart" show PathMatch, RedirectMatch, RouteMatch;
import "component_recognizer.dart" show ComponentRecognizer;
import "instruction.dart"
    show
        Instruction,
        ResolvedInstruction,
        RedirectInstruction,
        UnresolvedInstruction,
        DefaultInstruction;
import "route_config_nomalizer.dart"
    show normalizeRouteConfig, assertComponentExists;
import "url_parser.dart" show parser, Url, pathSegmentsToUrl;

var _resolveToNull = PromiseWrapper.resolve(null);
/**
 * Token used to bind the component with the top-level [RouteConfig]s for the
 * application.
 *
 * ### Example ([live demo](http://plnkr.co/edit/iRUP8B5OUbxCWQ3AcIDm))
 *
 * ```
 * import {Component} from 'angular2/core';
 * import {
 *   ROUTER_DIRECTIVES,
 *   ROUTER_PROVIDERS,
 *   RouteConfig
 * } from 'angular2/router';
 *
 * @Component({directives: [ROUTER_DIRECTIVES]})
 * @RouteConfig([
 *  {...},
 * ])
 * class AppCmp {
 *   // ...
 * }
 *
 * bootstrap(AppCmp, [ROUTER_PROVIDERS]);
 * ```
 */
const OpaqueToken ROUTER_PRIMARY_COMPONENT =
    const OpaqueToken("RouterPrimaryComponent");

/**
 * The RouteRegistry holds route configurations for each component in an Angular app.
 * It is responsible for creating Instructions from URLs, and generating URLs based on route and
 * parameters.
 */
@Injectable()
class RouteRegistry {
  Type _rootComponent;
  var _rules = new Map<dynamic, ComponentRecognizer>();
  RouteRegistry(@Inject(ROUTER_PRIMARY_COMPONENT) this._rootComponent) {}
  /**
   * Given a component and a configuration object, add the route to this registry
   */
  void config(dynamic parentComponent, RouteDefinition config) {
    config = normalizeRouteConfig(config, this);
    // this is here because Dart type guard reasons
    if (config is Route) {
      assertComponentExists(config.component, config.path);
    } else if (config is AuxRoute) {
      assertComponentExists(config.component, config.path);
    }
    ComponentRecognizer recognizer = this._rules[parentComponent];
    if (isBlank(recognizer)) {
      recognizer = new ComponentRecognizer();
      this._rules[parentComponent] = recognizer;
    }
    var terminal = recognizer.config(config);
    if (config is Route) {
      if (terminal) {
        assertTerminalComponent(config.component, config.path);
      } else {
        this.configFromComponent(config.component);
      }
    }
  }

  /**
   * Reads the annotations of a component and configures the registry based on them
   */
  void configFromComponent(dynamic component) {
    if (!isType(component)) {
      return;
    }
    // Don't read the annotations from a type more than once –

    // this prevents an infinite loop if a component routes recursively.
    if (this._rules.containsKey(component)) {
      return;
    }
    var annotations = reflector.annotations(component);
    if (isPresent(annotations)) {
      for (var i = 0; i < annotations.length; i++) {
        var annotation = annotations[i];
        if (annotation is RouteConfig) {
          List<RouteDefinition> routeCfgs = annotation.configs;
          routeCfgs.forEach((config) => this.config(component, config));
        }
      }
    }
  }

  /**
   * Given a URL and a parent component, return the most specific instruction for navigating
   * the application into the state specified by the url
   */
  Future<Instruction> recognize(
      String url, List<Instruction> ancestorInstructions) {
    var parsedUrl = parser.parse(url);
    return this._recognize(parsedUrl, []);
  }

  /**
   * Recognizes all parent-child routes, but creates unresolved auxiliary routes
   */
  Future<Instruction> _recognize(
      Url parsedUrl, List<Instruction> ancestorInstructions,
      [_aux = false]) {
    var parentInstruction = ListWrapper.last(ancestorInstructions);
    var parentComponent = isPresent(parentInstruction)
        ? parentInstruction.component.componentType
        : this._rootComponent;
    var componentRecognizer = this._rules[parentComponent];
    if (isBlank(componentRecognizer)) {
      return _resolveToNull;
    }
    // Matches some beginning part of the given URL
    List<Future<RouteMatch>> possibleMatches = _aux
        ? componentRecognizer.recognizeAuxiliary(parsedUrl)
        : componentRecognizer.recognize(parsedUrl);
    List<Future<Instruction>> matchPromises = possibleMatches
        .map((Future<RouteMatch> candidate) =>
            candidate.then((RouteMatch candidate) {
              if (candidate is PathMatch) {
                var auxParentInstructions = ancestorInstructions.length > 0
                    ? [ListWrapper.last(ancestorInstructions)]
                    : [];
                var auxInstructions = this._auxRoutesToUnresolved(
                    candidate.remainingAux, auxParentInstructions);
                var instruction = new ResolvedInstruction(
                    candidate.instruction, null, auxInstructions);
                if (isBlank(candidate.instruction) ||
                    candidate.instruction.terminal) {
                  return instruction;
                }
                var newAncestorComponents = (new List.from(ancestorInstructions)
                  ..addAll([instruction]));
                return this
                    ._recognize(candidate.remaining, newAncestorComponents)
                    .then((childInstruction) {
                  if (isBlank(childInstruction)) {
                    return null;
                  }
                  // redirect instructions are already absolute
                  if (childInstruction is RedirectInstruction) {
                    return childInstruction;
                  }
                  instruction.child = childInstruction;
                  return instruction;
                });
              }
              if (candidate is RedirectMatch) {
                var instruction = this.generate(candidate.redirectTo,
                    (new List.from(ancestorInstructions)..addAll([null])));
                return new RedirectInstruction(instruction.component,
                    instruction.child, instruction.auxInstruction);
              }
            }))
        .toList();
    if ((isBlank(parsedUrl) || parsedUrl.path == "") &&
        possibleMatches.length == 0) {
      return PromiseWrapper.resolve(this.generateDefault(parentComponent));
    }
    return PromiseWrapper.all(matchPromises).then(mostSpecific);
  }

  Map<String, Instruction> _auxRoutesToUnresolved(
      List<Url> auxRoutes, List<Instruction> parentInstructions) {
    Map<String, Instruction> unresolvedAuxInstructions = {};
    auxRoutes.forEach((Url auxUrl) {
      unresolvedAuxInstructions[auxUrl.path] = new UnresolvedInstruction(() {
        return this._recognize(auxUrl, parentInstructions, true);
      });
    });
    return unresolvedAuxInstructions;
  }

  /**
   * Given a normalized list with component names and params like: `['user', {id: 3 }]`
   * generates a url with a leading slash relative to the provided `parentComponent`.
   *
   * If the optional param `_aux` is `true`, then we generate starting at an auxiliary
   * route boundary.
   */
  Instruction generate(
      List<dynamic> linkParams, List<Instruction> ancestorInstructions,
      [_aux = false]) {
    var params = splitAndFlattenLinkParams(linkParams);
    var prevInstruction;
    // The first segment should be either '.' (generate from parent) or '' (generate from root).

    // When we normalize above, we strip all the slashes, './' becomes '.' and '/' becomes ''.
    if (ListWrapper.first(params) == "") {
      params.removeAt(0);
      prevInstruction = ListWrapper.first(ancestorInstructions);
      ancestorInstructions = [];
    } else {
      prevInstruction = ancestorInstructions.length > 0
          ? ancestorInstructions.removeLast()
          : null;
      if (ListWrapper.first(params) == ".") {
        params.removeAt(0);
      } else if (ListWrapper.first(params) == "..") {
        while (ListWrapper.first(params) == "..") {
          if (ancestorInstructions.length <= 0) {
            throw new BaseException(
                '''Link "${ ListWrapper . toJSON ( linkParams )}" has too many "../" segments.''');
          }
          prevInstruction = ancestorInstructions.removeLast();
          params = ListWrapper.slice(params, 1);
        }
      } else {
        // we must only peak at the link param, and not consume it
        var routeName = ListWrapper.first(params);
        var parentComponentType = this._rootComponent;
        var grandparentComponentType = null;
        if (ancestorInstructions.length > 1) {
          var parentComponentInstruction =
              ancestorInstructions[ancestorInstructions.length - 1];
          var grandComponentInstruction =
              ancestorInstructions[ancestorInstructions.length - 2];
          parentComponentType =
              parentComponentInstruction.component.componentType;
          grandparentComponentType =
              grandComponentInstruction.component.componentType;
        } else if (ancestorInstructions.length == 1) {
          parentComponentType = ancestorInstructions[0].component.componentType;
          grandparentComponentType = this._rootComponent;
        }
        // For a link with no leading `./`, `/`, or `../`, we look for a sibling and child.

        // If both exist, we throw. Otherwise, we prefer whichever exists.
        var childRouteExists = this.hasRoute(routeName, parentComponentType);
        var parentRouteExists = isPresent(grandparentComponentType) &&
            this.hasRoute(routeName, grandparentComponentType);
        if (parentRouteExists && childRouteExists) {
          var msg =
              '''Link "${ ListWrapper . toJSON ( linkParams )}" is ambiguous, use "./" or "../" to disambiguate.''';
          throw new BaseException(msg);
        }
        if (parentRouteExists) {
          prevInstruction = ancestorInstructions.removeLast();
        }
      }
    }
    if (params[params.length - 1] == "") {
      params.removeLast();
    }
    if (params.length > 0 && params[0] == "") {
      params.removeAt(0);
    }
    if (params.length < 1) {
      var msg =
          '''Link "${ ListWrapper . toJSON ( linkParams )}" must include a route name.''';
      throw new BaseException(msg);
    }
    var generatedInstruction = this._generate(
        params, ancestorInstructions, prevInstruction, _aux, linkParams);
    // we don't clone the first (root) element
    for (var i = ancestorInstructions.length - 1; i >= 0; i--) {
      var ancestorInstruction = ancestorInstructions[i];
      if (isBlank(ancestorInstruction)) {
        break;
      }
      generatedInstruction =
          ancestorInstruction.replaceChild(generatedInstruction);
    }
    return generatedInstruction;
  }

  /*
   * Internal helper that does not make any assertions about the beginning of the link DSL.
   * `ancestorInstructions` are parents that will be cloned.
   * `prevInstruction` is the existing instruction that would be replaced, but which might have
   * aux routes that need to be cloned.
   */
  Instruction _generate(List<dynamic> linkParams,
      List<Instruction> ancestorInstructions, Instruction prevInstruction,
      [_aux = false, List<dynamic> _originalLink]) {
    var parentComponentType = this._rootComponent;
    var componentInstruction = null;
    Map<String, Instruction> auxInstructions = {};
    Instruction parentInstruction = ListWrapper.last(ancestorInstructions);
    if (isPresent(parentInstruction) &&
        isPresent(parentInstruction.component)) {
      parentComponentType = parentInstruction.component.componentType;
    }
    if (linkParams.length == 0) {
      var defaultInstruction = this.generateDefault(parentComponentType);
      if (isBlank(defaultInstruction)) {
        throw new BaseException(
            '''Link "${ ListWrapper . toJSON ( _originalLink )}" does not resolve to a terminal instruction.''');
      }
      return defaultInstruction;
    }
    // for non-aux routes, we want to reuse the predecessor's existing primary and aux routes

    // and only override routes for which the given link DSL provides
    if (isPresent(prevInstruction) && !_aux) {
      auxInstructions = StringMapWrapper.merge(
          prevInstruction.auxInstruction, auxInstructions);
      componentInstruction = prevInstruction.component;
    }
    var componentRecognizer = this._rules[parentComponentType];
    if (isBlank(componentRecognizer)) {
      throw new BaseException(
          '''Component "${ getTypeNameForDebugging ( parentComponentType )}" has no route config.''');
    }
    var linkParamIndex = 0;
    var routeParams = {};
    // first, recognize the primary route if one is provided
    if (linkParamIndex < linkParams.length &&
        isString(linkParams[linkParamIndex])) {
      var routeName = linkParams[linkParamIndex];
      if (routeName == "" || routeName == "." || routeName == "..") {
        throw new BaseException(
            '''"${ routeName}/" is only allowed at the beginning of a link DSL.''');
      }
      linkParamIndex += 1;
      if (linkParamIndex < linkParams.length) {
        var linkParam = linkParams[linkParamIndex];
        if (isStringMap(linkParam) && !isArray(linkParam)) {
          routeParams = linkParam;
          linkParamIndex += 1;
        }
      }
      var routeRecognizer = (_aux
          ? componentRecognizer.auxNames
          : componentRecognizer.names)[routeName];
      if (isBlank(routeRecognizer)) {
        throw new BaseException(
            '''Component "${ getTypeNameForDebugging ( parentComponentType )}" has no route named "${ routeName}".''');
      }
      // Create an "unresolved instruction" for async routes

      // we'll figure out the rest of the route when we resolve the instruction and

      // perform a navigation
      if (isBlank(routeRecognizer.handler.componentType)) {
        var compInstruction =
            routeRecognizer.generateComponentPathValues(routeParams);
        return new UnresolvedInstruction(() {
          return routeRecognizer.handler.resolveComponentType().then((_) {
            return this._generate(linkParams, ancestorInstructions,
                prevInstruction, _aux, _originalLink);
          });
        }, compInstruction["urlPath"], compInstruction["urlParams"]);
      }
      componentInstruction = _aux
          ? componentRecognizer.generateAuxiliary(routeName, routeParams)
          : componentRecognizer.generate(routeName, routeParams);
    }
    // Next, recognize auxiliary instructions.

    // If we have an ancestor instruction, we preserve whatever aux routes are active from it.
    while (linkParamIndex < linkParams.length &&
        isArray(linkParams[linkParamIndex])) {
      var auxParentInstruction = [parentInstruction];
      var auxInstruction = this._generate(linkParams[linkParamIndex],
          auxParentInstruction, null, true, _originalLink);
      // TODO: this will not work for aux routes with parameters or multiple segments
      auxInstructions[auxInstruction.component.urlPath] = auxInstruction;
      linkParamIndex += 1;
    }
    var instruction =
        new ResolvedInstruction(componentInstruction, null, auxInstructions);
    // If the component is sync, we can generate resolved child route instructions

    // If not, we'll resolve the instructions at navigation time
    if (isPresent(componentInstruction) &&
        isPresent(componentInstruction.componentType)) {
      Instruction childInstruction = null;
      if (componentInstruction.terminal) {
        if (linkParamIndex >= linkParams.length) {}
      } else {
        var childAncestorComponents = (new List.from(ancestorInstructions)
          ..addAll([instruction]));
        var remainingLinkParams = ListWrapper.slice(linkParams, linkParamIndex);
        childInstruction = this._generate(remainingLinkParams,
            childAncestorComponents, null, false, _originalLink);
      }
      instruction.child = childInstruction;
    }
    return instruction;
  }

  bool hasRoute(String name, dynamic parentComponent) {
    ComponentRecognizer componentRecognizer = this._rules[parentComponent];
    if (isBlank(componentRecognizer)) {
      return false;
    }
    return componentRecognizer.hasRoute(name);
  }

  Instruction generateDefault(Type componentCursor) {
    if (isBlank(componentCursor)) {
      return null;
    }
    var componentRecognizer = this._rules[componentCursor];
    if (isBlank(componentRecognizer) ||
        isBlank(componentRecognizer.defaultRoute)) {
      return null;
    }
    var defaultChild = null;
    if (isPresent(componentRecognizer.defaultRoute.handler.componentType)) {
      var componentInstruction = componentRecognizer.defaultRoute.generate({});
      if (!componentRecognizer.defaultRoute.terminal) {
        defaultChild = this.generateDefault(
            componentRecognizer.defaultRoute.handler.componentType);
      }
      return new DefaultInstruction(componentInstruction, defaultChild);
    }
    return new UnresolvedInstruction(() {
      return componentRecognizer.defaultRoute.handler
          .resolveComponentType()
          .then((_) => this.generateDefault(componentCursor));
    });
  }
}

/*
 * Given: ['/a/b', {c: 2}]
 * Returns: ['', 'a', 'b', {c: 2}]
 */
List<dynamic> splitAndFlattenLinkParams(List<dynamic> linkParams) {
  return linkParams.fold([], (List<dynamic> accumulation, item) {
    if (isString(item)) {
      String strItem = item;
      return (new List.from(accumulation)..addAll(strItem.split("/")));
    }
    accumulation.add(item);
    return accumulation;
  });
}

/*
 * Given a list of instructions, returns the most specific instruction
 */
Instruction mostSpecific(List<Instruction> instructions) {
  instructions =
      instructions.where((instruction) => isPresent(instruction)).toList();
  if (instructions.length == 0) {
    return null;
  }
  if (instructions.length == 1) {
    return instructions[0];
  }
  var first = instructions[0];
  var rest = ListWrapper.slice(instructions, 1);
  return rest.fold(first, (Instruction instruction, Instruction contender) {
    if (compareSpecificityStrings(
            contender.specificity, instruction.specificity) ==
        -1) {
      return contender;
    }
    return instruction;
  });
}

/*
 * Expects strings to be in the form of "[0-2]+"
 * Returns -1 if string A should be sorted above string B, 1 if it should be sorted after,
 * or 0 if they are the same.
 */
num compareSpecificityStrings(String a, String b) {
  var l = Math.min(a.length, b.length);
  for (var i = 0; i < l; i += 1) {
    var ai = StringWrapper.charCodeAt(a, i);
    var bi = StringWrapper.charCodeAt(b, i);
    var difference = bi - ai;
    if (difference != 0) {
      return difference;
    }
  }
  return a.length - b.length;
}

assertTerminalComponent(component, path) {
  if (!isType(component)) {
    return;
  }
  var annotations = reflector.annotations(component);
  if (isPresent(annotations)) {
    for (var i = 0; i < annotations.length; i++) {
      var annotation = annotations[i];
      if (annotation is RouteConfig) {
        throw new BaseException(
            '''Child routes are not allowed for "${ path}". Use "..." on the parent\'s route path.''');
      }
    }
  }
}
