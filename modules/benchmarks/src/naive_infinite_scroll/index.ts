import {MapWrapper} from 'angular2/src/facade/collection';

import {bootstrap} from 'angular2/bootstrap';
import {reflector} from 'angular2/src/reflection/reflection';

import {App} from './app';

import {APP_VIEW_POOL_CAPACITY} from 'angular2/src/core/compiler/view_pool';
import {bind} from 'angular2/di';

export function main() {
  bootstrap(App, createBindings());
  setupReflector();
}

function createBindings(): List {
  return [bind(APP_VIEW_POOL_CAPACITY).toValue(100000)];
}

export function setupReflector() {
  // TODO(kegluneq): Generate this.
  reflector.registerSetters({
    'style': (o, m) => {
      // HACK
      MapWrapper.forEach(m, function(v, k) { o.style.setProperty(k, v); });
    }
  });
}
