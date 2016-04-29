import {OpaqueToken, ComponentResolver} from 'angular2/core';
import {LocationStrategy, PathLocationStrategy, Location} from 'angular2/platform/common';
import {Router, RouterOutletMap} from './router';
import {RouterUrlSerializer, DefaultRouterUrlSerializer} from './router_url_serializer';
import {CONST_EXPR} from 'angular2/src/facade/lang';
import {ApplicationRef, Provider} from 'angular2/core';
import {BaseException} from 'angular2/src/facade/exceptions';

export const ROUTER_PROVIDERS_COMMON: any[] = CONST_EXPR([
  RouterOutletMap,
  CONST_EXPR(new Provider(RouterUrlSerializer, {useClass: DefaultRouterUrlSerializer})),
  CONST_EXPR(new Provider(LocationStrategy, {useClass: PathLocationStrategy})),
  Location,
  CONST_EXPR(new Provider(Router,
                          {
                            useFactory: routerFactory,
                            deps: CONST_EXPR([
                              ApplicationRef,
                              ComponentResolver,
                              RouterUrlSerializer,
                              RouterOutletMap,
                              Location
                            ])
                          }))
]);

function routerFactory(app: ApplicationRef, componentResolver: ComponentResolver,
                       urlSerializer: RouterUrlSerializer, routerOutletMap: RouterOutletMap,
                       location: Location): Router {
  if (app.componentTypes.length == 0) {
    throw new BaseException("Bootstrap at least one component before injecting Router.");
  }
  return new Router(app.componentTypes[0], componentResolver, urlSerializer, routerOutletMap,
                    location);
}