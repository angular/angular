import {SpyLocation} from 'angular2/src/mock/location_mock';
import {Location} from 'angular2/platform/common';
import {Router, RouterOutletMap} from './router';
import {RouterUrlSerializer, DefaultRouterUrlSerializer} from './router_url_serializer';
import {Component, ComponentResolver} from 'angular2/core';

@Component({selector: 'fake-app-root-comp', template: `<span></span>`})
class FakeAppRootCmp {
}

function routerFactory(componentResolver: ComponentResolver, urlSerializer: RouterUrlSerializer,
                       routerOutletMap: RouterOutletMap, location: Location): Router {
  return new Router(null, FakeAppRootCmp, componentResolver, urlSerializer, routerOutletMap,
                    location);
}

/**
 * Providers for fake router dependecies.
 * This allows TestComponentBuilder to create components with RouterLink and RouterOutlet directives
 * without the test writer needing to override them.
 */
export const ROUTER_FAKE_PROVIDERS: any[] = /*@ts2dart_const*/ [
  RouterOutletMap,
  /* @ts2dart_Provider */ {provide: Location, useClass: SpyLocation},
  /* @ts2dart_Provider */ {provide: RouterUrlSerializer, useClass: DefaultRouterUrlSerializer},
  /* @ts2dart_Provider */ {
    provide: Router,
    useFactory: routerFactory,
    deps: /*@ts2dart_const*/
        [ComponentResolver, RouterUrlSerializer, RouterOutletMap, Location]
  },
];
