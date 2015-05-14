import {RouteRecognizer} from './route_recognizer';
import {Instruction, noopInstruction} from './instruction';
import {List, ListWrapper, Map, MapWrapper, StringMap, StringMapWrapper} from 'angular2/src/facade/collection';
import {isPresent, isBlank, isType, StringWrapper, BaseException} from 'angular2/src/facade/lang';
import {RouteConfig} from './route_config_impl';
import {reflector} from 'angular2/src/reflection/reflection';

export class RouteRegistry {
  _rules:Map<any, RouteRecognizer>;

  constructor() {
    this._rules = MapWrapper.create();
  }

  config(parentComponent, config: StringMap<string, any>): void {
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
      recognizer.addRedirect(StringMapWrapper.get(config, 'path'), StringMapWrapper.get(config, 'redirectTo'));
      return;
    }

    var components = StringMapWrapper.get(config, 'components');
    StringMapWrapper.forEach(components, (component, _) => {
      this.configFromComponent(component);
    });

    recognizer.addConfig(config['path'], config, config['as']);
  }

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
          ListWrapper.forEach(annotation.configs, (config) => {
            this.config(component, config);
          })
        }
      }
    }
  }


  recognize(url:string, parentComponent): Instruction {
    var componentRecognizer = MapWrapper.get(this._rules, parentComponent);
    if (isBlank(componentRecognizer)) {
      return null;
    }

    var componentSolutions = componentRecognizer.recognize(url);
    var fullSolutions = [];

    for(var i = 0; i < componentSolutions.length; i++) {
      var candidate = componentSolutions[i];
      if (candidate['unmatchedUrl'].length == 0) {
        ListWrapper.push(fullSolutions, handlerToLeafInstructions(candidate, parentComponent));
      } else {
        var children = StringMapWrapper.create(),
            allMapped = true;

        StringMapWrapper.forEach(candidate['handler']['components'], (component, name) => {
          if (!allMapped) {
            return;
          }
          var childInstruction = this.recognize(candidate['unmatchedUrl'], component);
          if (isPresent(childInstruction)) {
            childInstruction.params = candidate['params'];
            children[name] = childInstruction;
          } else {
            allMapped = false;
          }
        });

        if (allMapped) {
          ListWrapper.push(fullSolutions, new Instruction({
            component: parentComponent,
            children: children,
            matchedUrl: candidate['matchedUrl'],
            parentCost: candidate['cost']
          }));
        }
      }
    }

    if (fullSolutions.length > 0) {
      ListWrapper.sort(fullSolutions, (a, b) => a.cost < b.cost ? -1 : 1);
      return fullSolutions[0];
    }

    return null;
  }

  generate(name:string, params:StringMap<string, string>, hostComponent): string {
    //TODO: implement for hierarchical routes
    var componentRecognizer = MapWrapper.get(this._rules, hostComponent);
    return isPresent(componentRecognizer) ? componentRecognizer.generate(name, params) : null;
  }
}

function handlerToLeafInstructions(context, parentComponent): Instruction {
  var children = StringMapWrapper.create();
  StringMapWrapper.forEach(context['handler']['components'], (component, outletName) => {
    children[outletName] = new Instruction({
      component: component,
      params: context['params'],
      parentCost: 0
    });
  });
  return new Instruction({
    component: parentComponent,
    children: children,
    matchedUrl: context['matchedUrl'],
    parentCost: context['cost']
  });
}

// given:
// { component: Foo }
// mutates the config to:
// { components: { default: Foo } }
function normalizeConfig(config:StringMap<string, any>): StringMap<string, any> {
  if (StringMapWrapper.contains(config, 'component')) {
    var component = StringMapWrapper.get(config, 'component');
    var components = StringMapWrapper.create();
    StringMapWrapper.set(components, 'default', component);

    var newConfig = StringMapWrapper.create();
    StringMapWrapper.set(newConfig, 'components', components);

    StringMapWrapper.forEach(config, (value, key) => {
      if (!StringWrapper.equals(key, 'component') && !StringWrapper.equals(key, 'components')) {
        StringMapWrapper.set(newConfig, key, value);
      }
    });

    return newConfig;
  }
  return config;
}
