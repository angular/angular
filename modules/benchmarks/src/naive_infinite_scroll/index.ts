import {MapWrapper} from 'angular2/src/facade/collection';

import {bootstrap} from 'angular2/angular2';
import {reflector} from 'angular2/src/reflection/reflection';
import {ReflectionCapabilities} from 'angular2/src/reflection/reflection_capabilities';

import {App} from './app';

import {APP_VIEW_POOL_CAPACITY} from 'angular2/src/core/compiler/view_pool';
import {bind} from 'angular2/di';

export function main() {
  setupReflector();
  bootstrap(App, createBindings());
}

function createBindings(): List {
  return [bind(APP_VIEW_POOL_CAPACITY).toValue(100000)];
}

export function setupReflector() {
  reflector.reflectionCapabilities = new ReflectionCapabilities();

  // TODO(kegluneq): Generate this.
  reflector.registerSetters({
    'style': (o, m) => {
      // HACK
      MapWrapper.forEach(m, function(v, k) { o.style.setProperty(k, v); });
    }
  });
}
