import {SpyLocation} from 'angular2/src/mock/location_mock';
import {CONST_EXPR} from 'angular2/src/facade/lang';
import {Location} from 'angular2/platform/common';
import {Router, RouterOutletMap} from './router';
import {RouterUrlSerializer, DefaultRouterUrlSerializer} from './router_url_serializer';
import {Provider, Component, ComponentResolver} from 'angular2/core';

@Component({template: `<span></span>`})
class _FakeAppRootCmp {
}

function routerFactory(componentResolver: ComponentResolver, urlSerializer: RouterUrlSerializer,
                       routerOutletMap: RouterOutletMap, location: Location): Router {
  return new Router(_FakeAppRootCmp, componentResolver, urlSerializer, routerOutletMap, location);
}

export const ROUTER_FAKE_PROVIDERS: any[] = CONST_EXPR([
  RouterOutletMap,
  new Provider(Location, {useClass: SpyLocation}),
  CONST_EXPR(new Provider(RouterUrlSerializer, {useClass: DefaultRouterUrlSerializer})),
  CONST_EXPR(new Provider(
      Router,
      {
        useFactory: routerFactory,
        deps: CONST_EXPR([ComponentResolver, RouterUrlSerializer, RouterOutletMap, Location])
      }))
]);
