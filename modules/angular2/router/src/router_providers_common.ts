import {ApplicationRef, Provider} from '@angular/core';
import {LocationStrategy, PathLocationStrategy, Location} from '@angular/common';
import {Router, RootRouter} from './router';
import {RouteRegistry, ROUTER_PRIMARY_COMPONENT} from './route_registry';
import {CONST_EXPR, Type} from './facade/lang';
import {BaseException} from './facade/exceptions';

/**
 * The Platform agnostic ROUTER PROVIDERS
 */
export const ROUTER_PROVIDERS_COMMON: any[] = CONST_EXPR([
  RouteRegistry,
  CONST_EXPR(new Provider(LocationStrategy, {useClass: PathLocationStrategy})),
  Location,
  CONST_EXPR(new Provider(
      Router,
      {
        useFactory: routerFactory,
        deps: CONST_EXPR([RouteRegistry, Location, ROUTER_PRIMARY_COMPONENT, ApplicationRef])
      })),
  CONST_EXPR(new Provider(
      ROUTER_PRIMARY_COMPONENT,
      {useFactory: routerPrimaryComponentFactory, deps: CONST_EXPR([ApplicationRef])}))
]);

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
