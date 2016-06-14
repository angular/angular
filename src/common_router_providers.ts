import {Location, LocationStrategy, PathLocationStrategy} from '@angular/common';
import {APP_INITIALIZER, ApplicationRef, ComponentResolver, Injector} from '@angular/core';

import {RouterConfig} from './config';
import {Router} from './router';
import {RouterOutletMap} from './router_outlet_map';
import {ActivatedRoute} from './router_state';
import {DefaultUrlSerializer, UrlSerializer} from './url_serializer';

export interface ExtraOptions { enableTracing?: boolean; }

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
export function provideRouter(config: RouterConfig, opts: ExtraOptions): any[] {
  return [
    Location, {provide: LocationStrategy, useClass: PathLocationStrategy},
    {provide: UrlSerializer, useClass: DefaultUrlSerializer},

    {
      provide: Router,
      useFactory: (ref, resolver, urlSerializer, outletMap, location, injector) => {
        if (ref.componentTypes.length == 0) {
          throw new Error('Bootstrap at least one component before injecting Router.');
        }
        const componentType = ref.componentTypes[0];
        const r = new Router(
            componentType, resolver, urlSerializer, outletMap, location, injector, config);
        ref.registerDisposeListener(() => r.dispose());

        if (opts.enableTracing) {
          r.events.subscribe(e => {
            console.group(`Router Event: ${(<any>e.constructor).name}`);
            console.log(e.toString());
            console.log(e);
            console.groupEnd();
          });
        }

        return r;
      },
      deps:
          [ApplicationRef, ComponentResolver, UrlSerializer, RouterOutletMap, Location, Injector]
    },

    RouterOutletMap,
    {provide: ActivatedRoute, useFactory: (r) => r.routerState.root, deps: [Router]},

    // Trigger initial navigation
    {
      provide: APP_INITIALIZER,
      multi: true,
      useFactory: (injector) => {
        // https://github.com/angular/angular/issues/9101
        // Delay the router instantiation to avoid circular dependency (ApplicationRef ->
        // APP_INITIALIZER -> Router)
        setTimeout(_ => {
          const appRef = injector.get(ApplicationRef);
          if (appRef.componentTypes.length == 0) {
            appRef.registerBootstrapListener((_) => { injector.get(Router).initialNavigation(); });
          } else {
            injector.get(Router).initialNavigation();
          }
        }, 0);
        return _ => null;
      },
      deps: [Injector]
    }
  ];
}
