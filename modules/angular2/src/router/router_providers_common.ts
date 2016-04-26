import {LocationStrategy, PathLocationStrategy, Location} from 'angular2/platform/common';
import {Router, RootRouter} from 'angular2/src/router/router';
import {RouteRegistry, ROUTER_PRIMARY_COMPONENT} from 'angular2/src/router/route_registry';
import {Type} from 'angular2/src/facade/lang';
import {ApplicationRef, OpaqueToken, Provider} from 'angular2/core';
import {BaseException} from 'angular2/src/facade/exceptions';

/**
 * The Platform agnostic ROUTER PROVIDERS
 */
export const ROUTER_PROVIDERS_COMMON: any[] = /*@ts2dart_const*/[
  RouteRegistry,
  new Provider(LocationStrategy, {useClass: PathLocationStrategy}),
  Location,
  new Provider(Router,
               {
                 useFactory: routerFactory,
                 deps: [RouteRegistry, Location, ROUTER_PRIMARY_COMPONENT, ApplicationRef]
               }),
  new Provider(ROUTER_PRIMARY_COMPONENT,
               {useFactory: routerPrimaryComponentFactory, deps: [ApplicationRef]})
];

function routerFactory(registry: RouteRegistry, location: Location, primaryComponent: Type,
                       appRef: ApplicationRef): RootRouter {
  var rootRouter = new RootRouter(registry, location, primaryComponent);
  appRef.registerDisposeListener(() => rootRouter.dispose());
  return rootRouter;
}

function routerPrimaryComponentFactory(app: ApplicationRef): Type {
  if (app.componentTypes.length == 0) {
    throw new BaseException("Bootstrap at least one component before injecting Router.");
  }
  return app.componentTypes[0];
}
