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
  isString,
  isStringMap,
  isFunction,
  StringWrapper,
  BaseException
} from 'angular2/src/facade/lang';
import {RouteConfig} from './route_config_impl';
import {reflector} from 'angular2/src/reflection/reflection';
import {Injectable} from 'angular2/di';

/**
 * The RouteRegistry holds route configurations for each component in an Angular app.
 * It is responsible for creating Instructions from URLs, and generating URLs based on route and
 * parameters.
 */
@Injectable()
export class RouteRegistry {
  private _rules: Map<any, RouteRecognizer> = new Map();

  /**
   * Given a component and a configuration object, add the route to this registry
   */
  config(parentComponent, config: StringMap<string, any>): void {
    assertValidConfig(config);

    var recognizer: RouteRecognizer = this._rules.get(parentComponent);

    if (isBlank(recognizer)) {
      recognizer = new RouteRecognizer();
      this._rules.set(parentComponent, recognizer);
    }

    if (StringMapWrapper.contains(config, 'redirectTo')) {
      recognizer.addRedirect(config['path'], config['redirectTo']);
      return;
    }

    config = StringMapWrapper.merge(
        config, {'component': normalizeComponentDeclaration(config['component'])});

    var component = config['component'];
    var terminal = recognizer.addConfig(config['path'], config, config['as']);

    if (component['type'] == 'constructor') {
      if (terminal) {
        assertTerminalComponent(component['constructor'], config['path']);
      } else {
        this.configFromComponent(component['constructor']);
      }
    }
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
    if (this._rules.has(component)) {
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
   * the application into the state specified by the url
   */
  recognize(url: string, parentComponent): Promise<Instruction> {
    var componentRecognizer = this._rules.get(parentComponent);
    if (isBlank(componentRecognizer)) {
      return PromiseWrapper.resolve(null);
    }

    // Matches some beginning part of the given URL
    var possibleMatches = componentRecognizer.recognize(url);
    var matchPromises =
        ListWrapper.map(possibleMatches, (candidate) => this._completeRouteMatch(candidate));

    return PromiseWrapper.all(matchPromises)
        .then((solutions: List<Instruction>) => {
          // remove nulls
          var fullSolutions = ListWrapper.filter(solutions, (solution) => isPresent(solution));

          if (fullSolutions.length > 0) {
            return mostSpecific(fullSolutions);
          }
          return null;
        });
  }


  _completeRouteMatch(partialMatch: RouteMatch): Promise<Instruction> {
    var recognizer = partialMatch.recognizer;
    var handler = recognizer.handler;
    return handler.resolveComponentType().then((componentType) => {
      this.configFromComponent(componentType);

      if (partialMatch.unmatchedUrl.length == 0) {
        return new Instruction(componentType, partialMatch.matchedUrl, recognizer);
      }

      return this.recognize(partialMatch.unmatchedUrl, componentType)
          .then(childInstruction => {
            if (isBlank(childInstruction)) {
              return null;
            } else {
              return new Instruction(componentType, partialMatch.matchedUrl, recognizer,
                                     childInstruction);
            }
          });
    });
  }

  /**
   * Given a normalized list with component names and params like: `['user', {id: 3 }]`
   * generates a url with a leading slash relative to the provided `parentComponent`.
   */
  generate(linkParams: List<any>, parentComponent): string {
    let url = '';
    let componentCursor = parentComponent;
    for (let i = 0; i < linkParams.length; i += 1) {
      let segment = linkParams[i];
      if (!isString(segment)) {
        throw new BaseException(`Unexpected segment "${segment}" in link DSL. Expected a string.`);
      } else if (segment == '' || segment == '.' || segment == '..') {
        throw new BaseException(`"${segment}/" is only allowed at the beginning of a link DSL.`);
      }
      let params = null;
      if (i + 1 < linkParams.length) {
        let nextSegment = linkParams[i + 1];
        if (isStringMap(nextSegment)) {
          params = nextSegment;
          i += 1;
        }
      }

      var componentRecognizer = this._rules.get(componentCursor);
      if (isBlank(componentRecognizer)) {
        throw new BaseException(`Could not find route config for "${segment}".`);
      }
      var response = componentRecognizer.generate(segment, params);
      url += response['url'];
      componentCursor = response['nextComponent'];
    }

    return url;
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
  } else if (isStringMap(config)) {
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

function assertTerminalComponent(component, path) {
  if (!isType(component)) {
    return;
  }

  var annotations = reflector.annotations(component);
  if (isPresent(annotations)) {
    for (var i = 0; i < annotations.length; i++) {
      var annotation = annotations[i];

      if (annotation instanceof RouteConfig) {
        throw new BaseException(
            `Child routes are not allowed for "${path}". Use "..." on the parent's route path.`);
      }
    }
  }
}
