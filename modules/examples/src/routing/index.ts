import {InboxApp} from './inbox-app';
import {bind} from 'angular2/angular2';
import {bootstrap} from 'angular2/bootstrap';
import {routerBindings, HashLocationStrategy, LocationStrategy} from 'angular2/router';

import {reflector} from 'angular2/src/core/reflection/reflection';
import {ReflectionCapabilities} from 'angular2/src/core/reflection/reflection_capabilities';

export function main() {
  reflector.reflectionCapabilities = new ReflectionCapabilities();
  bootstrap(InboxApp,
            [routerBindings(InboxApp), bind(LocationStrategy).toClass(HashLocationStrategy)]);
}
