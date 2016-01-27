import { LocationStrategy } from 'angular2/src/router/location_strategy';
import { PathLocationStrategy } from 'angular2/src/router/path_location_strategy';
import { Router, RootRouter } from 'angular2/src/router/router';
import { RouteRegistry, ROUTER_PRIMARY_COMPONENT } from 'angular2/src/router/route_registry';
import { Location } from 'angular2/src/router/location';
import { CONST_EXPR } from 'angular2/src/facade/lang';
import { ApplicationRef, Provider } from 'angular2/core';
import { BaseException } from 'angular2/src/facade/exceptions';
/**
 * The Platform agnostic ROUTER PROVIDERS
 */
export const ROUTER_PROVIDERS_COMMON = CONST_EXPR([
    RouteRegistry,
    CONST_EXPR(new Provider(LocationStrategy, { useClass: PathLocationStrategy })),
    Location,
    CONST_EXPR(new Provider(Router, {
        useFactory: routerFactory,
        deps: CONST_EXPR([RouteRegistry, Location, ROUTER_PRIMARY_COMPONENT, ApplicationRef])
    })),
    CONST_EXPR(new Provider(ROUTER_PRIMARY_COMPONENT, { useFactory: routerPrimaryComponentFactory, deps: CONST_EXPR([ApplicationRef]) }))
]);
function routerFactory(registry, location, primaryComponent, appRef) {
    var rootRouter = new RootRouter(registry, location, primaryComponent);
    appRef.registerDisposeListener(() => rootRouter.dispose());
    return rootRouter;
}
function routerPrimaryComponentFactory(app) {
    if (app.componentTypes.length == 0) {
        throw new BaseException("Bootstrap at least one component before injecting Router.");
    }
    return app.componentTypes[0];
}
