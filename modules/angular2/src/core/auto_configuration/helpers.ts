import {
  Configuration,
  Autoconfigured,
  ConfigurationFactory,
  AutoconfiguredFactory
} from './decorators';
import {AutoconfiguredMetadata} from './metadata';

import {Type, isPresent} from 'angular2/src/core/facade/lang';

import {reflectRegistry} from 'angular2/src/core/util/decorators';

import {ReflectionCapabilities} from 'angular2/src/core/reflection/reflection_capabilities';

var reflector: ReflectionCapabilities = new ReflectionCapabilities();

export function getAutoconfiguredBindings(appComponentType: Type): any[] {
  var autoconfigured = getConfigurationAnnotation(appComponentType);
  var bindings;

  if (isPresent(autoconfigured)) {
    bindings = getConfigurationBindings();
  }

  return bindings;
}

export function getConfigurationAnnotation(appComponentType: Type): AutoconfiguredMetadata {
  var annotations: any[] = reflector.annotations(appComponentType);
  var annotation;

  for (var i = 0; i < annotations.length && !isPresent(annotation); i++) {
    if (annotations[i] instanceof AutoconfiguredMetadata) {
      annotation = annotations[i];
    }
  }
  return annotation;
}

export function getConfigurationBindings(): any[] {
  var bindings: any[] = [];
  var configList: any[] = reflectRegistry.getForAnnotation(Configuration);
  configList.forEach((type: Type) => { bindings.push(reflector.factory(type)().getBindings()); });
  return bindings;
}
