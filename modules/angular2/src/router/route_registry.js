import {RouteRecognizer} from './route_recognizer';
import {Instruction, noopInstruction} from './instruction';
import {List, ListWrapper, Map, MapWrapper, StringMap, StringMapWrapper} from 'angular2/src/facade/collection';
import {isPresent, isBlank, isType, StringWrapper, BaseException} from 'angular2/src/facade/lang';
import {RouteConfig} from './route_config';
import {reflector} from 'angular2/src/reflection/reflection';

export class RouteRegistry {
  _rules:Map<any, RouteRecognizer>;

  constructor() {
    this._rules = MapWrapper.create();
  }

  config(parentComponent, config) {

    var recognizer:RouteRecognizer;
    if (MapWrapper.contains(this._rules, parentComponent)) {
      recognizer = MapWrapper.get(this._rules, parentComponent);
    } else {
      recognizer = new RouteRecognizer();
      MapWrapper.set(this._rules, parentComponent, recognizer);
    }

    config = normalizeConfig(config);

    var components = StringMapWrapper.get(config, 'components');
    StringMapWrapper.forEach(components, (component, _) => {
      this.configFromComponent(component);
    });

    recognizer.addConfig(config['path'], config, config['alias']);
  }

  configFromComponent(component) {
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


  recognize(url:string, parentComponent) {
    var componentRecognizer = MapWrapper.get(this._rules, parentComponent);
    if (isBlank(componentRecognizer)) {
      return null;
    }

    var solutions = componentRecognizer.recognize(url);

    for(var i = 0; i < solutions.length; i++) {
      var candidate = solutions[i];
      if (candidate['unmatchedUrl'].length == 0) {
        return handlerToLeafInstructions(candidate, parentComponent);
      }

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
        return new Instruction({
          component: parentComponent,
          children: children,
          matchedUrl: candidate['matchedUrl']
        });
      }
    }

    return null;
  }

  generate(name:string, params:any, hostComponent) {
    //TODO: implement for hierarchical routes
    var componentRecognizer = MapWrapper.get(this._rules, hostComponent);
    if (isPresent(componentRecognizer)) {
      return componentRecognizer.generate(name, params);
    }
  }
}

function handlerToLeafInstructions(context, parentComponent) {
  var children = StringMapWrapper.create();
  StringMapWrapper.forEach(context['handler']['components'], (component, outletName) => {
    children[outletName] = new Instruction({
      component: component,
      params: context['params']
    });
  });
  return new Instruction({
    component: parentComponent,
    children: children,
    matchedUrl: context['matchedUrl']
  });
}

// given:
// { component: Foo }
// mutates the config to:
// { components: { default: Foo } }
function normalizeConfig(config:StringMap) {
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
  } else if (!StringMapWrapper.contains(config, 'components')) {
    throw new BaseException('Config does not include a "component" or "components" key.');
  }
  return config;
}
