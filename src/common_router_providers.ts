import { RouterOutletMap } from './router_outlet_map';
import { UrlSerializer, DefaultUrlSerializer } from './url_serializer';
import { ActivatedRoute } from './router_state';
import { Router } from './router';
import { RouterConfig } from './config';
import { ComponentResolver, ApplicationRef, Injector, APP_INITIALIZER } from '@angular/core';
import { LocationStrategy, PathLocationStrategy, Location } from '@angular/common';

/**
 * A list of {@link Provider}s. To use the router, you must add this to your application.
 *
 * ### Example
 *
 * ```
 * @Component({directives: [ROUTER_DIRECTIVES]})
 * class AppCmp {
 *   // ...
 * }
 *
 * const router = [
 *   {path: '/home', component: Home}
 * ];
 *
 * bootstrap(AppCmp, [provideRouter(router)]);
 * ```
 */
export function provideRouter(config: RouterConfig):any[] {
  return [
    Location,
    {provide: LocationStrategy, useClass: PathLocationStrategy},
    {provide: UrlSerializer, useClass: DefaultUrlSerializer},

    {
      provide: Router,
      useFactory: (ref, resolver, urlSerializer, outletMap, location, injector) => {
        if (ref.componentTypes.length == 0) {
          throw new Error("Bootstrap at least one component before injecting Router.");
        }
        const componentType = ref.componentTypes[0];
        const r = new Router(componentType, resolver, urlSerializer, outletMap, location, injector, config);
        ref.registerDisposeListener(() => r.dispose());
        return r;
      },
      deps: [ApplicationRef, ComponentResolver, UrlSerializer, RouterOutletMap, Location, Injector]
    },

    RouterOutletMap,
    {provide: ActivatedRoute, useFactory: (r) => r.routerState.root, deps: [Router]},
    
    // Trigger initial navigation
    {provide: APP_INITIALIZER, multi: true, useFactory: (router: Router) => router.initialNavigation(), deps: [Router]},
  ];
}
