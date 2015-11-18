import {PathMatch} from './path_recognizer';
import {RouteRecognizer} from './route_recognizer';
import {Instruction, ComponentInstruction, PrimaryInstruction} from './instruction';
import {ListWrapper, Map, MapWrapper, StringMapWrapper} from 'angular2/src/facade/collection';
import {Promise, PromiseWrapper} from 'angular2/src/facade/async';
import {
  isPresent,
  isBlank,
  isType,
  isString,
  isStringMap,
  isFunction,
  StringWrapper,
  Type,
  getTypeNameForDebugging
} from 'angular2/src/facade/lang';
import {BaseException, WrappedException} from 'angular2/src/facade/exceptions';
import {
  RouteConfig,
  AsyncRoute,
  Route,
  AuxRoute,
  Redirect,
  RouteDefinition
} from './route_config_impl';
import {reflector} from 'angular2/src/core/reflection/reflection';
import {Injectable} from 'angular2/angular2';
import {normalizeRouteConfig, assertComponentExists} from './route_config_nomalizer';
import {parser, Url, pathSegmentsToUrl} from './url_parser';

var _resolveToNull = PromiseWrapper.resolve(null);

/**
 * The RouteRegistry holds route configurations for each component in an Angular app.
 * It is responsible for creating Instructions from URLs, and generating URLs based on route and
 * parameters.
 */
@Injectable()
export class RouteRegistry {
  private _rules = new Map<any, RouteRecognizer>();

  /**
   * Given a component and a configuration object, add the route to this registry
   */
  config(parentComponent: any, config: RouteDefinition): void {
    config = normalizeRouteConfig(config);

    // this is here because Dart type guard reasons
    if (config instanceof Route) {
      assertComponentExists(config.component, config.path);
    } else if (config instanceof AuxRoute) {
      assertComponentExists(config.component, config.path);
    }

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
          let routeCfgs: RouteDefinition[] = annotation.configs;
          routeCfgs.forEach(config => this.config(component, config));
        }
      }
    }
  }


  /**
   * Given a URL and a parent component, return the most specific instruction for navigating
   * the application into the state specified by the url
   */
  recognize(url: string, parentComponent: any): Promise<Instruction> {
    var parsedUrl = parser.parse(url);
    return this._recognize(parsedUrl, parentComponent);
  }

  private _recognize(parsedUrl: Url, parentComponent): Promise<Instruction> {
    return this._recognizePrimaryRoute(parsedUrl, parentComponent)
        .then((instruction: PrimaryInstruction) =>
                  this._completeAuxiliaryRouteMatches(instruction, parentComponent));
  }

  private _recognizePrimaryRoute(parsedUrl: Url, parentComponent): Promise<PrimaryInstruction> {
    var componentRecognizer = this._rules.get(parentComponent);
    if (isBlank(componentRecognizer)) {
      return _resolveToNull;
    }

    // Matches some beginning part of the given URL
    var possibleMatches = componentRecognizer.recognize(parsedUrl);

    var matchPromises =
        possibleMatches.map(candidate => this._completePrimaryRouteMatch(candidate));

    return PromiseWrapper.all(matchPromises).then(mostSpecific);
  }

  private _completePrimaryRouteMatch(partialMatch: PathMatch): Promise<PrimaryInstruction> {
    var instruction = partialMatch.instruction;
    return instruction.resolveComponentType().then((componentType) => {
      this.configFromComponent(componentType);

      if (instruction.terminal) {
        return new PrimaryInstruction(instruction, null, partialMatch.remainingAux);
      }

      return this._recognizePrimaryRoute(partialMatch.remaining, componentType)
          .then((childInstruction) => {
            if (isBlank(childInstruction)) {
              return null;
            } else {
              return new PrimaryInstruction(instruction, childInstruction,
                                            partialMatch.remainingAux);
            }
          });
    });
  }


  private _completeAuxiliaryRouteMatches(instruction: PrimaryInstruction,
                                         parentComponent: any): Promise<Instruction> {
    if (isBlank(instruction)) {
      return _resolveToNull;
    }

    var componentRecognizer = this._rules.get(parentComponent);
    var auxInstructions: {[key: string]: Instruction} = {};

    var promises = instruction.auxUrls.map((auxSegment: Url) => {
      var match = componentRecognizer.recognizeAuxiliary(auxSegment);
      if (isBlank(match)) {
        return _resolveToNull;
      }
      return this._completePrimaryRouteMatch(match).then((auxInstruction: PrimaryInstruction) => {
        if (isPresent(auxInstruction)) {
          return this._completeAuxiliaryRouteMatches(auxInstruction, parentComponent)
              .then((finishedAuxRoute: Instruction) => {
                auxInstructions[auxSegment.path] = finishedAuxRoute;
              });
        }
      });
    });
    return PromiseWrapper.all(promises).then((_) => {
      if (isBlank(instruction.child)) {
        return new Instruction(instruction.component, null, auxInstructions);
      }
      return this._completeAuxiliaryRouteMatches(instruction.child,
                                                 instruction.component.componentType)
          .then((completeChild) => {
            return new Instruction(instruction.component, completeChild, auxInstructions);
          });
    });
  }

  /**
   * Given a normalized list with component names and params like: `['user', {id: 3 }]`
   * generates a url with a leading slash relative to the provided `parentComponent`.
   */
  generate(linkParams: any[], parentComponent: any): Instruction {
    let segments = [];
    let componentCursor = parentComponent;
    var lastInstructionIsTerminal = false;

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
      let params = {};
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
      segments.push(response);
      componentCursor = response.componentType;
      lastInstructionIsTerminal = response.terminal;
    }

    var instruction: Instruction = null;

    if (!lastInstructionIsTerminal) {
      instruction = this._generateRedirects(componentCursor);

      if (isPresent(instruction)) {
        let lastInstruction = instruction;
        while (isPresent(lastInstruction.child)) {
          lastInstruction = lastInstruction.child;
        }
        lastInstructionIsTerminal = lastInstruction.component.terminal;
      }
      if (isPresent(componentCursor) && !lastInstructionIsTerminal) {
        throw new BaseException(
            `Link "${ListWrapper.toJSON(linkParams)}" does not resolve to a terminal or async instruction.`);
      }
    }


    while (segments.length > 0) {
      instruction = new Instruction(segments.pop(), instruction, {});
    }

    return instruction;
  }

  public hasRoute(name: string, parentComponent: any): boolean {
    var componentRecognizer: RouteRecognizer = this._rules.get(parentComponent);
    if (isBlank(componentRecognizer)) {
      return false;
    }
    return componentRecognizer.hasRoute(name);
  }

  // if the child includes a redirect like : "/" -> "/something",
  // we want to honor that redirection when creating the link
  private _generateRedirects(componentCursor: Type): Instruction {
    if (isBlank(componentCursor)) {
      return null;
    }
    var componentRecognizer = this._rules.get(componentCursor);
    if (isBlank(componentRecognizer)) {
      return null;
    }

    for (let i = 0; i < componentRecognizer.redirects.length; i += 1) {
      let redirect = componentRecognizer.redirects[i];

      // we only handle redirecting from an empty segment
      if (redirect.segments.length == 1 && redirect.segments[0] == '') {
        var toSegments = pathSegmentsToUrl(redirect.toSegments);
        var matches = componentRecognizer.recognize(toSegments);
        var primaryInstruction =
            ListWrapper.maximum(matches, (match: PathMatch) => match.instruction.specificity);

        if (isPresent(primaryInstruction)) {
          var child = this._generateRedirects(primaryInstruction.instruction.componentType);
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
function mostSpecific(instructions: PrimaryInstruction[]): PrimaryInstruction {
  return ListWrapper.maximum(
      instructions, (instruction: PrimaryInstruction) => instruction.component.specificity);
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
