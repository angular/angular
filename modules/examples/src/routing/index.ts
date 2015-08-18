import {InboxApp} from './inbox-app';
import {bind} from 'angular2/angular2';
import {bootstrap} from 'angular2/bootstrap';
import {ROUTER_BINDINGS, HashLocationStrategy, LocationStrategy} from 'angular2/router';

import {reflector} from 'angular2/src/reflection/reflection';
import {ReflectionCapabilities} from 'angular2/src/reflection/reflection_capabilities';

export function main() {
  reflector.reflectionCapabilities = new ReflectionCapabilities();
  bootstrap(InboxApp, [ROUTER_BINDINGS, bind(LocationStrategy).toClass(HashLocationStrategy)]);
}
