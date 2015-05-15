import {RouteRecognizer, RouteMatch} from './route_recognizer';
import {Instruction, noopInstruction} from './instruction';
import {List, ListWrapper, Map, MapWrapper, StringMap, StringMapWrapper} from 'angular2/src/facade/collection';
import {isPresent, isBlank, isType, StringWrapper, BaseException} from 'angular2/src/facade/lang';
import {RouteConfig} from './route_config_impl';
import {reflector} from 'angular2/src/reflection/reflection';

/**
 * The RouteRegistry holds route configurations for each component in an Angular app.
 * It is responsible for creating Instructions from URLs, and generating URLs based on route and parameters.
 */
export class RouteRegistry {
  _rules:Map<any, RouteRecognizer>;

  constructor() {
    this._rules = MapWrapper.create();
  }

  /**
   * Given a component and a configuration object, add the route to this registry
   */
  config(parentComponent, config:StringMap<string, any>): void {
    if (!StringMapWrapper.contains(config, 'path')) {
      throw new BaseException('Route config does not contain "path"');
    }

    if (!StringMapWrapper.contains(config, 'component') &&
        !StringMapWrapper.contains(config, 'components') &&
        !StringMapWrapper.contains(config, 'redirectTo')) {
      throw new BaseException('Route config does not contain "component," "components," or "redirectTo"');
    }

    var recognizer:RouteRecognizer = MapWrapper.get(this._rules, parentComponent);

    if (isBlank(recognizer)) {
      recognizer = new RouteRecognizer();
      MapWrapper.set(this._rules, parentComponent, recognizer);
    }

    config = normalizeConfig(config);

    if (StringMapWrapper.contains(config, 'redirectTo')) {
      recognizer.addRedirect(config['path'], config['redirectTo']);
      return;
    }

    var components = config['components'];
    StringMapWrapper.forEach(components, (component, _) => this.configFromComponent(component));

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
      for (var i=0; i<annotations.length; i++) {
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
  recognize(url:string, parentComponent): Instruction {
    var componentRecognizer = MapWrapper.get(this._rules, parentComponent);
    if (isBlank(componentRecognizer)) {
      return null;
    }

    // Matches some beginning part of the given URL
    var possibleMatches = componentRecognizer.recognize(url);

    // A list of instructions that captures all of the given URL
    var fullSolutions = ListWrapper.create();

    for (var i = 0; i < possibleMatches.length; i++) {
      var candidate : RouteMatch = possibleMatches[i];

      // if the candidate captures all of the URL, add it to our list of solutions
      if (candidate.unmatchedUrl.length == 0) {
        ListWrapper.push(fullSolutions, routeMatchToInstruction(candidate, parentComponent));
      } else {

        // otherwise, recursively match the remaining part of the URL against the component's children
        var children = StringMapWrapper.create(),
            allChildrenMatch = true,
            components = StringMapWrapper.get(candidate.handler, 'components');

        var componentNames = StringMapWrapper.keys(components);
        for (var nameIndex = 0; nameIndex < componentNames.length; nameIndex++) {
          var name = componentNames[nameIndex];
          var component = StringMapWrapper.get(components, name);

          var childInstruction = this.recognize(candidate.unmatchedUrl, component);
          if (isPresent(childInstruction)) {
            childInstruction.params = candidate.params;
            children[name] = childInstruction;
          } else {
            allChildrenMatch = false;
            break;
          }
        }

        if (allChildrenMatch) {
          ListWrapper.push(fullSolutions, new Instruction({
            component: parentComponent,
            children: children,
            matchedUrl: candidate.matchedUrl,
            parentSpecificity: candidate.specificity
          }));
        }
      }
    }

    if (fullSolutions.length > 0) {
      var mostSpecificSolution = fullSolutions[0];
      for (var solutionIndex = 1; solutionIndex < fullSolutions.length; solutionIndex++) {
        var solution = fullSolutions[solutionIndex];
        if (solution.specificity > mostSpecificSolution.specificity) {
          mostSpecificSolution = solution;
        }
      }

      return mostSpecificSolution;
    }

    return null;
  }

  generate(name:string, params:StringMap<string, string>, hostComponent): string {
    //TODO: implement for hierarchical routes
    var componentRecognizer = MapWrapper.get(this._rules, hostComponent);
    return isPresent(componentRecognizer) ? componentRecognizer.generate(name, params) : null;
  }
}

function routeMatchToInstruction(routeMatch:RouteMatch, parentComponent): Instruction {
  var children = StringMapWrapper.create();
  var components = StringMapWrapper.get(routeMatch.handler, 'components');
  StringMapWrapper.forEach(components, (component, outletName) => {
    children[outletName] = new Instruction({
      component: component,
      params: routeMatch.params,
      parentSpecificity: 0
    });
  });
  return new Instruction({
    component: parentComponent,
    children: children,
    matchedUrl: routeMatch.matchedUrl,
    parentSpecificity: routeMatch.specificity
  });
}


/*
 * Given a config object:
 * { 'component': Foo }
 * Returns a new config object:
 * { components: { default: Foo } }
 *
 * If the config object does not contain a `component` key, the original
 * config object is returned.
 */
function normalizeConfig(config:StringMap<string, any>): StringMap<string, any> {
  if (!StringMapWrapper.contains(config, 'component')) {
    return config;
  }
  var newConfig = {
    'components': {
      'default': config['component']
    }
  };

  StringMapWrapper.forEach(config, (value, key) => {
    if (key != 'component' && key != 'components') {
      newConfig[key] = value;
    }
  });

  return newConfig;
}
