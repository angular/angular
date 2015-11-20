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
        isFunction,
        StringWrapper,
        Type,
        getTypeNameForDebugging;
import "package:angular2/src/facade/exceptions.dart"
    show BaseException, WrappedException;
import "package:angular2/src/core/reflection/reflection.dart" show reflector;
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
import "package:angular2/angular2.dart" show Injectable;
import "route_config_nomalizer.dart"
    show normalizeRouteConfig, assertComponentExists;
import "url_parser.dart" show parser, Url, pathSegmentsToUrl;

var _resolveToNull = PromiseWrapper.resolve(null);

/**
 * The RouteRegistry holds route configurations for each component in an Angular app.
 * It is responsible for creating Instructions from URLs, and generating URLs based on route and
 * parameters.
 */
@Injectable()
class RouteRegistry {
  var _rules = new Map<dynamic, ComponentRecognizer>();
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
  Future<Instruction> recognize(String url, List<dynamic> ancestorComponents) {
    var parsedUrl = parser.parse(url);
    return this._recognize(parsedUrl, ancestorComponents);
  }

  /**
   * Recognizes all parent-child routes, but creates unresolved auxiliary routes
   */
  Future<Instruction> _recognize(
      Url parsedUrl, List<dynamic> ancestorComponents,
      [_aux = false]) {
    var parentComponent = ancestorComponents[ancestorComponents.length - 1];
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
                if (candidate.instruction.terminal) {
                  var unresolvedAux = this._auxRoutesToUnresolved(
                      candidate.remainingAux, parentComponent);
                  return new ResolvedInstruction(
                      candidate.instruction, null, unresolvedAux);
                }
                var newAncestorComponents = (new List.from(ancestorComponents)
                  ..addAll([candidate.instruction.componentType]));
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
                  var unresolvedAux = this._auxRoutesToUnresolved(
                      candidate.remainingAux, parentComponent);
                  return new ResolvedInstruction(
                      candidate.instruction, childInstruction, unresolvedAux);
                });
              }
              if (candidate is RedirectMatch) {
                var instruction =
                    this.generate(candidate.redirectTo, ancestorComponents);
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
      List<Url> auxRoutes, parentComponent) {
    Map<String, Instruction> unresolvedAuxInstructions = {};
    auxRoutes.forEach((Url auxUrl) {
      unresolvedAuxInstructions[auxUrl.path] = new UnresolvedInstruction(() {
        return this._recognize(auxUrl, [parentComponent], true);
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
      List<dynamic> linkParams, List<dynamic> ancestorComponents,
      [_aux = false]) {
    var parentComponent = ancestorComponents[ancestorComponents.length - 1];
    var grandparentComponent = ancestorComponents.length > 1
        ? ancestorComponents[ancestorComponents.length - 2]
        : null;
    var normalizedLinkParams = splitAndFlattenLinkParams(linkParams);
    var first = ListWrapper.first(normalizedLinkParams);
    var rest = ListWrapper.slice(normalizedLinkParams, 1);
    // The first segment should be either '.' (generate from parent) or '' (generate from root).

    // When we normalize above, we strip all the slashes, './' becomes '.' and '/' becomes ''.
    if (first == "") {
      var firstComponent = ancestorComponents[0];
      ListWrapper.clear(ancestorComponents);
      ancestorComponents.add(firstComponent);
    } else if (first == "..") {
      // we already captured the first instance of "..", so we need to pop off an ancestor
      ancestorComponents.removeLast();
      while (ListWrapper.first(rest) == "..") {
        rest = ListWrapper.slice(rest, 1);
        ancestorComponents.removeLast();
        if (ancestorComponents.length <= 0) {
          throw new BaseException(
              '''Link "${ ListWrapper . toJSON ( linkParams )}" has too many "../" segments.''');
        }
      }
    } else if (first != ".") {
      // For a link with no leading `./`, `/`, or `../`, we look for a sibling and child.

      // If both exist, we throw. Otherwise, we prefer whichever exists.
      var childRouteExists = this.hasRoute(first, parentComponent);
      var parentRouteExists = isPresent(grandparentComponent) &&
          this.hasRoute(first, grandparentComponent);
      if (parentRouteExists && childRouteExists) {
        var msg =
            '''Link "${ ListWrapper . toJSON ( linkParams )}" is ambiguous, use "./" or "../" to disambiguate.''';
        throw new BaseException(msg);
      }
      if (parentRouteExists) {
        ancestorComponents.removeLast();
      }
      rest = linkParams;
    }
    if (rest[rest.length - 1] == "") {
      rest.removeLast();
    }
    if (rest.length < 1) {
      var msg =
          '''Link "${ ListWrapper . toJSON ( linkParams )}" must include a route name.''';
      throw new BaseException(msg);
    }
    return this._generate(rest, ancestorComponents, _aux);
  }

  /*
   * Internal helper that does not make any assertions about the beginning of the link DSL
   */
  Instruction _generate(
      List<dynamic> linkParams, List<dynamic> ancestorComponents,
      [_aux = false]) {
    var parentComponent = ancestorComponents[ancestorComponents.length - 1];
    if (linkParams.length == 0) {
      return this.generateDefault(parentComponent);
    }
    var linkIndex = 0;
    var routeName = linkParams[linkIndex];
    if (!isString(routeName)) {
      throw new BaseException(
          '''Unexpected segment "${ routeName}" in link DSL. Expected a string.''');
    } else if (routeName == "" || routeName == "." || routeName == "..") {
      throw new BaseException(
          '''"${ routeName}/" is only allowed at the beginning of a link DSL.''');
    }
    var params = {};
    if (linkIndex + 1 < linkParams.length) {
      var nextSegment = linkParams[linkIndex + 1];
      if (isStringMap(nextSegment) && !isArray(nextSegment)) {
        params = nextSegment;
        linkIndex += 1;
      }
    }
    Map<String, Instruction> auxInstructions = {};
    var nextSegment;
    while (linkIndex + 1 < linkParams.length &&
        isArray(nextSegment = linkParams[linkIndex + 1])) {
      var auxInstruction = this._generate(nextSegment, [parentComponent], true);
      // TODO: this will not work for aux routes with parameters or multiple segments
      auxInstructions[auxInstruction.component.urlPath] = auxInstruction;
      linkIndex += 1;
    }
    var componentRecognizer = this._rules[parentComponent];
    if (isBlank(componentRecognizer)) {
      throw new BaseException(
          '''Component "${ getTypeNameForDebugging ( parentComponent )}" has no route config.''');
    }
    var routeRecognizer = (_aux
        ? componentRecognizer.auxNames
        : componentRecognizer.names)[routeName];
    if (!isPresent(routeRecognizer)) {
      throw new BaseException(
          '''Component "${ getTypeNameForDebugging ( parentComponent )}" has no route named "${ routeName}".''');
    }
    if (!isPresent(routeRecognizer.handler.componentType)) {
      var compInstruction = routeRecognizer.generateComponentPathValues(params);
      return new UnresolvedInstruction(() {
        return routeRecognizer.handler.resolveComponentType().then((_) {
          return this._generate(linkParams, ancestorComponents, _aux);
        });
      }, compInstruction["urlPath"], compInstruction["urlParams"]);
    }
    var componentInstruction = _aux
        ? componentRecognizer.generateAuxiliary(routeName, params)
        : componentRecognizer.generate(routeName, params);
    Instruction childInstruction = null;
    var remaining = ListWrapper.slice(linkParams, linkIndex + 1);
    // the component is sync
    if (isPresent(componentInstruction.componentType)) {
      if (linkIndex + 1 < linkParams.length) {
        var childAncestorComponents = (new List.from(ancestorComponents)
          ..addAll([componentInstruction.componentType]));
        childInstruction = this._generate(remaining, childAncestorComponents);
      } else if (!componentInstruction.terminal) {
        // ... look for defaults
        childInstruction =
            this.generateDefault(componentInstruction.componentType);
        if (isBlank(childInstruction)) {
          throw new BaseException(
              '''Link "${ ListWrapper . toJSON ( linkParams )}" does not resolve to a terminal instruction.''');
        }
      }
    }
    return new ResolvedInstruction(
        componentInstruction, childInstruction, auxInstructions);
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
          .then(() => this.generateDefault(componentCursor));
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
  return ListWrapper.maximum(
      instructions, (Instruction instruction) => instruction.specificity);
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
