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
  BaseException,
  getTypeNameForDebugging
} from 'angular2/src/facade/lang';
import {RouteConfig, AsyncRoute, Route, Redirect, RouteDefinition} from './route_config_impl';
import {reflector} from 'angular2/src/reflection/reflection';
import {Injectable} from 'angular2/di';
import {normalizeRouteConfig} from './route_config_nomalizer';

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
  config(parentComponent: any, config: RouteDefinition): void {
    config = normalizeRouteConfig(config);

    var recognizer: RouteRecognizer = this._rules.get(parentComponent);

    if (isBlank(recognizer)) {
      recognizer = new RouteRecognizer();
      this._rules.set(parentComponent, recognizer);
    }

    var terminal = recognizer.config(config);

    if (config instanceof Route) {
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
  configFromComponent(component: any): void {
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
  recognize(url: string, parentComponent: any): Promise<Instruction> {
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
        if (recognizer.terminal) {
          return new Instruction(componentType, partialMatch.matchedUrl, recognizer);
        } else {
          return null;
        }
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
  generate(linkParams: List<any>, parentComponent: any): string {
    let url = '';
    let componentCursor = parentComponent;
    for (let i = 0; i < linkParams.length; i += 1) {
      let segment = linkParams[i];
      if (isBlank(componentCursor)) {
        throw new BaseException(`Could not find route named "${segment}".`);
      }
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
        throw new BaseException(
            `Component "${getTypeNameForDebugging(componentCursor)}" has no route config.`);
      }
      var response = componentRecognizer.generate(segment, params);
      if (isBlank(response)) {
        throw new BaseException(
            `Component "${getTypeNameForDebugging(componentCursor)}" has no route named "${segment}".`);
      }
      url += response['url'];
      componentCursor = response['nextComponent'];
    }

    return url;
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
