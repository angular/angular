library angular2.src.router.route_registry;

import "path_recognizer.dart" show PathMatch;
import "route_recognizer.dart" show RouteRecognizer;
import "instruction.dart"
    show Instruction, ComponentInstruction, PrimaryInstruction;
import "package:angular2/src/facade/collection.dart"
    show ListWrapper, Map, MapWrapper, StringMapWrapper;
import "package:angular2/src/facade/async.dart" show Future, PromiseWrapper;
import "package:angular2/src/facade/lang.dart"
    show
        isPresent,
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
import "route_config_impl.dart"
    show RouteConfig, AsyncRoute, Route, AuxRoute, Redirect, RouteDefinition;
import "package:angular2/src/core/reflection/reflection.dart" show reflector;
import "package:angular2/core.dart" show Injectable;
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
  var _rules = new Map<dynamic, RouteRecognizer>();
  /**
   * Given a component and a configuration object, add the route to this registry
   */
  void config(dynamic parentComponent, RouteDefinition config) {
    config = normalizeRouteConfig(config);
    // this is here because Dart type guard reasons
    if (config is Route) {
      assertComponentExists(config.component, config.path);
    } else if (config is AuxRoute) {
      assertComponentExists(config.component, config.path);
    }
    RouteRecognizer recognizer = this._rules[parentComponent];
    if (isBlank(recognizer)) {
      recognizer = new RouteRecognizer();
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
  Future<Instruction> recognize(String url, dynamic parentComponent) {
    var parsedUrl = parser.parse(url);
    return this._recognize(parsedUrl, parentComponent);
  }

  Future<Instruction> _recognize(Url parsedUrl, parentComponent) {
    return this._recognizePrimaryRoute(parsedUrl, parentComponent).then(
        (PrimaryInstruction instruction) =>
            this._completeAuxiliaryRouteMatches(instruction, parentComponent));
  }

  Future<PrimaryInstruction> _recognizePrimaryRoute(
      Url parsedUrl, parentComponent) {
    var componentRecognizer = this._rules[parentComponent];
    if (isBlank(componentRecognizer)) {
      return _resolveToNull;
    }
    // Matches some beginning part of the given URL
    var possibleMatches = componentRecognizer.recognize(parsedUrl);
    var matchPromises = possibleMatches
        .map((candidate) => this._completePrimaryRouteMatch(candidate))
        .toList();
    return PromiseWrapper.all(matchPromises).then(mostSpecific);
  }

  Future<PrimaryInstruction> _completePrimaryRouteMatch(
      PathMatch partialMatch) {
    var instruction = partialMatch.instruction;
    return instruction.resolveComponentType().then((componentType) {
      this.configFromComponent(componentType);
      if (instruction.terminal) {
        return new PrimaryInstruction(
            instruction, null, partialMatch.remainingAux);
      }
      return this
          ._recognizePrimaryRoute(partialMatch.remaining, componentType)
          .then((childInstruction) {
        if (isBlank(childInstruction)) {
          return null;
        } else {
          return new PrimaryInstruction(
              instruction, childInstruction, partialMatch.remainingAux);
        }
      });
    });
  }

  Future<Instruction> _completeAuxiliaryRouteMatches(
      PrimaryInstruction instruction, dynamic parentComponent) {
    if (isBlank(instruction)) {
      return _resolveToNull;
    }
    var componentRecognizer = this._rules[parentComponent];
    Map<String, Instruction> auxInstructions = {};
    var promises = instruction.auxUrls.map((Url auxSegment) {
      var match = componentRecognizer.recognizeAuxiliary(auxSegment);
      if (isBlank(match)) {
        return _resolveToNull;
      }
      return this
          ._completePrimaryRouteMatch(match)
          .then((PrimaryInstruction auxInstruction) {
        if (isPresent(auxInstruction)) {
          return this
              ._completeAuxiliaryRouteMatches(auxInstruction, parentComponent)
              .then((Instruction finishedAuxRoute) {
            auxInstructions[auxSegment.path] = finishedAuxRoute;
          });
        }
      });
    }).toList();
    return PromiseWrapper.all(promises).then((_) {
      if (isBlank(instruction.child)) {
        return new Instruction(instruction.component, null, auxInstructions);
      }
      return this
          ._completeAuxiliaryRouteMatches(
              instruction.child, instruction.component.componentType)
          .then((completeChild) {
        return new Instruction(
            instruction.component, completeChild, auxInstructions);
      });
    });
  }

  /**
   * Given a normalized list with component names and params like: `['user', {id: 3 }]`
   * generates a url with a leading slash relative to the provided `parentComponent`.
   */
  Instruction generate(List<dynamic> linkParams, dynamic parentComponent) {
    var segments = [];
    var componentCursor = parentComponent;
    var lastInstructionIsTerminal = false;
    for (var i = 0; i < linkParams.length; i += 1) {
      var segment = linkParams[i];
      if (isBlank(componentCursor)) {
        throw new BaseException(
            '''Could not find route named "${ segment}".''');
      }
      if (!isString(segment)) {
        throw new BaseException(
            '''Unexpected segment "${ segment}" in link DSL. Expected a string.''');
      } else if (segment == "" || segment == "." || segment == "..") {
        throw new BaseException(
            '''"${ segment}/" is only allowed at the beginning of a link DSL.''');
      }
      var params = {};
      if (i + 1 < linkParams.length) {
        var nextSegment = linkParams[i + 1];
        if (isStringMap(nextSegment)) {
          params = nextSegment;
          i += 1;
        }
      }
      var componentRecognizer = this._rules[componentCursor];
      if (isBlank(componentRecognizer)) {
        throw new BaseException(
            '''Component "${ getTypeNameForDebugging ( componentCursor )}" has no route config.''');
      }
      var response = componentRecognizer.generate(segment, params);
      if (isBlank(response)) {
        throw new BaseException(
            '''Component "${ getTypeNameForDebugging ( componentCursor )}" has no route named "${ segment}".''');
      }
      segments.add(response);
      componentCursor = response.componentType;
      lastInstructionIsTerminal = response.terminal;
    }
    Instruction instruction = null;
    if (!lastInstructionIsTerminal) {
      instruction = this._generateRedirects(componentCursor);
      if (isPresent(instruction)) {
        var lastInstruction = instruction;
        while (isPresent(lastInstruction.child)) {
          lastInstruction = lastInstruction.child;
        }
        lastInstructionIsTerminal = lastInstruction.component.terminal;
      }
      if (isPresent(componentCursor) && !lastInstructionIsTerminal) {
        throw new BaseException(
            '''Link "${ ListWrapper . toJSON ( linkParams )}" does not resolve to a terminal or async instruction.''');
      }
    }
    while (segments.length > 0) {
      instruction = new Instruction(segments.removeLast(), instruction, {});
    }
    return instruction;
  }

  bool hasRoute(String name, dynamic parentComponent) {
    RouteRecognizer componentRecognizer = this._rules[parentComponent];
    if (isBlank(componentRecognizer)) {
      return false;
    }
    return componentRecognizer.hasRoute(name);
  }
  // if the child includes a redirect like : "/" -> "/something",

  // we want to honor that redirection when creating the link
  Instruction _generateRedirects(Type componentCursor) {
    if (isBlank(componentCursor)) {
      return null;
    }
    var componentRecognizer = this._rules[componentCursor];
    if (isBlank(componentRecognizer)) {
      return null;
    }
    for (var i = 0; i < componentRecognizer.redirects.length; i += 1) {
      var redirect = componentRecognizer.redirects[i];
      // we only handle redirecting from an empty segment
      if (redirect.segments.length == 1 && redirect.segments[0] == "") {
        var toSegments = pathSegmentsToUrl(redirect.toSegments);
        var matches = componentRecognizer.recognize(toSegments);
        var primaryInstruction = ListWrapper.maximum(
            matches, (PathMatch match) => match.instruction.specificity);
        if (isPresent(primaryInstruction)) {
          var child = this
              ._generateRedirects(primaryInstruction.instruction.componentType);
          return new Instruction(primaryInstruction.instruction, child, {});
        }
        return null;
      }
    }
    return null;
  }
}

/*
 * Given a list of instructions, returns the most specific instruction
 */
PrimaryInstruction mostSpecific(List<PrimaryInstruction> instructions) {
  return ListWrapper.maximum(instructions,
      (PrimaryInstruction instruction) => instruction.component.specificity);
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
