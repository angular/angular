import {InboxApp} from './inbox-app';
import {provide} from 'angular2/core';
import {bootstrap} from 'angular2/bootstrap';
import {ROUTER_PROVIDERS, HashLocationStrategy, LocationStrategy} from 'angular2/router';

import {reflector} from 'angular2/src/core/reflection/reflection';
import {ReflectionCapabilities} from 'angular2/src/core/reflection/reflection_capabilities';

export function main() {
  reflector.reflectionCapabilities = new ReflectionCapabilities();
  bootstrap(InboxApp,
            [ROUTER_PROVIDERS, provide(LocationStrategy, {useClass: HashLocationStrategy})]);
}
