import {RouteRecognizer, RouteMatch} from './route_recognizer';
import {Instruction} from './instruction';
import {
  List,
  ListWrapper,
  Map,
  MapWrapper,
  StringMap,
  StringMapWrapper
} from 'angular2/src/facade/collection';
import {Promise, PromiseWrapper} from 'angular2/src/facade/async';
import {
  isPresent,
  isBlank,
  isType,
  isMap,
  isFunction,
  StringWrapper,
  BaseException
} from 'angular2/src/facade/lang';
import {RouteConfig} from './route_config_impl';
import {reflector} from 'angular2/src/reflection/reflection';

/**
 * The RouteRegistry holds route configurations for each component in an Angular app.
 * It is responsible for creating Instructions from URLs, and generating URLs based on route and
 * parameters.
 */
export class RouteRegistry {
  _rules: Map<any, RouteRecognizer>;

  constructor() { this._rules = MapWrapper.create(); }

  /**
   * Given a component and a configuration object, add the route to this registry
   */
  config(parentComponent, config: StringMap<string, any>): void {
    assertValidConfig(config);

    var recognizer: RouteRecognizer = MapWrapper.get(this._rules, parentComponent);

    if (isBlank(recognizer)) {
      recognizer = new RouteRecognizer();
      MapWrapper.set(this._rules, parentComponent, recognizer);
    }

    if (StringMapWrapper.contains(config, 'redirectTo')) {
      recognizer.addRedirect(config['path'], config['redirectTo']);
      return;
    }

    config = StringMapWrapper.merge(
        config, {'component': normalizeComponentDeclaration(config['component'])});

    var component = config['component'];
    this.configFromComponent(component);

    recognizer.addConfig(config['path'], config, config['as']);
  }


  /**
   * Reads the annotations of a component and configures the registry based on them
   */
  configFromComponent(component): void {
    if (!isType(component)) {
      return;
    }

    // Don't read the annotations from a type more than once –
    // this prevents an infinite loop if a component routes recursively.
    if (MapWrapper.contains(this._rules, component)) {
      return;
    }
    var annotations = reflector.annotations(component);
    if (isPresent(annotations)) {
      for (var i = 0; i < annotations.length; i++) {
        var annotation = annotations[i];

        if (annotation instanceof RouteConfig) {
          ListWrapper.forEach(annotation.configs, (config) => this.config(component, config));
        }
      }
    }
  }


  /**
   * Given a URL and a parent component, return the most specific instruction for navigating
   * the application into the state specified by the
   */
  recognize(url: string, parentComponent): Promise<Instruction> {
    var componentRecognizer = MapWrapper.get(this._rules, parentComponent);
    if (isBlank(componentRecognizer)) {
      return PromiseWrapper.resolve(null);
    }

    // Matches some beginning part of the given URL
    var possibleMatches = componentRecognizer.recognize(url);
    var matchPromises =
        ListWrapper.map(possibleMatches, (candidate) => this._completeRouteMatch(candidate));

    return PromiseWrapper.all(matchPromises)
        .then((solutions) => {
          // remove nulls
          var fullSolutions = ListWrapper.filter(solutions, (solution) => isPresent(solution));

          if (fullSolutions.length > 0) {
            return mostSpecific(fullSolutions);
          }
          return null;
        });
  }


  _completeRouteMatch(candidate: RouteMatch): Promise<Instruction> {
    return componentHandlerToComponentType(candidate.handler)
        .then((componentType) => {
          this.configFromComponent(componentType);

          if (candidate.unmatchedUrl.length == 0) {
            return new Instruction({
              component: componentType,
              params: candidate.params,
              matchedUrl: candidate.matchedUrl,
              parentSpecificity: candidate.specificity
            });
          }

          return this.recognize(candidate.unmatchedUrl, componentType)
              .then(childInstruction => {
                if (isBlank(childInstruction)) {
                  return null;
                }
                return new Instruction({
                  component: componentType,
                  child: childInstruction,
                  params: candidate.params,
                  matchedUrl: candidate.matchedUrl,
                  parentSpecificity: candidate.specificity
                });
              });
        });
  }

  generate(name: string, params: StringMap<string, string>, hostComponent): string {
    // TODO: implement for hierarchical routes
    var componentRecognizer = MapWrapper.get(this._rules, hostComponent);
    return isPresent(componentRecognizer) ? componentRecognizer.generate(name, params) : null;
  }
}


/*
 * A config should have a "path" property, and exactly one of:
 * - `component`
 * - `redirectTo`
 */
var ALLOWED_TARGETS = ['component', 'redirectTo'];
function assertValidConfig(config: StringMap<string, any>): void {
  if (!StringMapWrapper.contains(config, 'path')) {
    throw new BaseException(`Route config should contain a "path" property`);
  }
  var targets = 0;
  ListWrapper.forEach(ALLOWED_TARGETS, (target) => {
    if (StringMapWrapper.contains(config, target)) {
      targets += 1;
    }
  });
  if (targets != 1) {
    throw new BaseException(
        `Route config should contain exactly one 'component', or 'redirectTo' property`);
  }
}

/*
 * Returns a StringMap like: `{ 'constructor': SomeType, 'type': 'constructor' }`
 */
var VALID_COMPONENT_TYPES = ['constructor', 'loader'];
function normalizeComponentDeclaration(config: any): StringMap<string, any> {
  if (isType(config)) {
    return {'constructor': config, 'type': 'constructor'};
  } else if (isMap(config)) {
    if (isBlank(config['type'])) {
      throw new BaseException(
          `Component declaration when provided as a map should include a 'type' property`);
    }
    var componentType = config['type'];
    if (!ListWrapper.contains(VALID_COMPONENT_TYPES, componentType)) {
      throw new BaseException(`Invalid component type '${componentType}'`);
    }
    return config;
  } else {
    throw new BaseException(`Component declaration should be either a Map or a Type`);
  }
}

function componentHandlerToComponentType(handler): Promise<any> {
  var componentDeclaration = handler['component'], type = componentDeclaration['type'];

  if (type == 'constructor') {
    return PromiseWrapper.resolve(componentDeclaration['constructor']);
  } else if (type == 'loader') {
    var resolverFunction = componentDeclaration['loader'];
    return resolverFunction();
  } else {
    throw new BaseException(`Cannot extract the component type from a '${type}' component`);
  }
}

/*
 * Given a list of instructions, returns the most specific instruction
 */
function mostSpecific(instructions: List<Instruction>): Instruction {
  var mostSpecificSolution = instructions[0];
  for (var solutionIndex = 1; solutionIndex < instructions.length; solutionIndex++) {
    var solution = instructions[solutionIndex];
    if (solution.specificity > mostSpecificSolution.specificity) {
      mostSpecificSolution = solution;
    }
  }
  return mostSpecificSolution;
}
