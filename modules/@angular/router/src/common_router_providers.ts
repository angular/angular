import {Location, LocationStrategy, PathLocationStrategy} from '@angular/common';
import {APP_INITIALIZER, ApplicationRef, ComponentResolver, Injector, OpaqueToken} from '@angular/core';

import {RouterConfig} from './config';
import {Router} from './router';
import {RouterOutletMap} from './router_outlet_map';
import {ActivatedRoute} from './router_state';
import {DefaultUrlSerializer, UrlSerializer} from './url_tree';

export const ROUTER_CONFIG = new OpaqueToken('ROUTER_CONFIG');
export const ROUTER_OPTIONS = new OpaqueToken('ROUTER_OPTIONS');

export interface ExtraOptions { enableTracing?: boolean; }

export function setupRouter(
    ref: ApplicationRef, resolver: ComponentResolver, urlSerializer: UrlSerializer,
    outletMap: RouterOutletMap, location: Location, injector: Injector, config: RouterConfig,
    opts: ExtraOptions) {
  if (ref.componentTypes.length == 0) {
    throw new Error('Bootstrap at least one component before injecting Router.');
  }
  const componentType = ref.componentTypes[0];
  const r =
      new Router(componentType, resolver, urlSerializer, outletMap, location, injector, config);
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
}

export function setupRouterInitializer(injector: Injector) {
  // https://github.com/angular/angular/issues/9101
  // Delay the router instantiation to avoid circular dependency (ApplicationRef ->
  // APP_INITIALIZER -> Router)
  setTimeout(() => {
    const appRef = injector.get(ApplicationRef);
    if (appRef.componentTypes.length == 0) {
      appRef.registerBootstrapListener(() => { injector.get(Router).initialNavigation(); });
    } else {
      injector.get(Router).initialNavigation();
    }
  }, 0);
  return (): any => null;
}

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
export function provideRouter(_config: RouterConfig, _opts: ExtraOptions): any[] {
  return [
    {provide: ROUTER_CONFIG, useValue: _config}, {provide: ROUTER_OPTIONS, useValue: _opts},
    Location, {provide: LocationStrategy, useClass: PathLocationStrategy},
    {provide: UrlSerializer, useClass: DefaultUrlSerializer},

    {
      provide: Router,
      useFactory: setupRouter,
      deps: [
        ApplicationRef, ComponentResolver, UrlSerializer, RouterOutletMap, Location, Injector,
        ROUTER_CONFIG, ROUTER_OPTIONS
      ]
    },

    RouterOutletMap,
    {provide: ActivatedRoute, useFactory: (r: Router) => r.routerState.root, deps: [Router]},

    // Trigger initial navigation
    {provide: APP_INITIALIZER, multi: true, useFactory: setupRouterInitializer, deps: [Injector]}
  ];
}
