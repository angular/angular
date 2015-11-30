/**
 * @module
 * @description
 * Maps application URLs into application states, to support deep-linking and navigation.
 */
library angular2.router;

export "src/router/router.dart" show Router;
export "src/router/router_outlet.dart" show RouterOutlet;
export "src/router/router_link.dart" show RouterLink;
export "src/router/instruction.dart" show RouteParams, RouteData;
export "src/router/platform_location.dart" show PlatformLocation;
export "src/router/route_registry.dart"
    show RouteRegistry, ROUTER_PRIMARY_COMPONENT;
export "src/router/location_strategy.dart" show LocationStrategy, APP_BASE_HREF;
export "src/router/hash_location_strategy.dart" show HashLocationStrategy;
export "src/router/path_location_strategy.dart" show PathLocationStrategy;
export "src/router/location.dart" show Location;
export "src/router/route_config_decorator.dart";
export "src/router/route_definition.dart";
export "src/router/interfaces.dart"
    show OnActivate, OnDeactivate, OnReuse, CanDeactivate, CanReuse;
export "src/router/lifecycle_annotations.dart" show CanActivate;
export "src/router/instruction.dart" show Instruction, ComponentInstruction;
export "package:angular2/core.dart" show OpaqueToken;
import "src/router/platform_location.dart" show PlatformLocation;
import "src/router/location_strategy.dart" show LocationStrategy;
import "src/router/path_location_strategy.dart" show PathLocationStrategy;
import "src/router/router.dart" show Router, RootRouter;
import "src/router/router_outlet.dart" show RouterOutlet;
import "src/router/router_link.dart" show RouterLink;
import "src/router/route_registry.dart"
    show RouteRegistry, ROUTER_PRIMARY_COMPONENT;
import "src/router/location.dart" show Location;
import "package:angular2/core.dart"
    show ApplicationRef, provide, OpaqueToken, Provider;
import "package:angular2/src/facade/exceptions.dart" show BaseException;

/**
 * A list of directives. To use the router directives like [RouterOutlet] and
 * [RouterLink], add this to your `directives` array in the [View] decorator of your
 * component.
 *
 * ### Example ([live demo](http://plnkr.co/edit/iRUP8B5OUbxCWQ3AcIDm))
 *
 * ```
 * import {Component} from 'angular2/angular2';
 * import {ROUTER_DIRECTIVES, ROUTER_PROVIDERS, RouteConfig} from 'angular2/router';
 *
 * @Component({directives: [ROUTER_DIRECTIVES]})
 * @RouteConfig([
 *  {...},
 * ])
 * class AppCmp {
 *    // ...
 * }
 *
 * bootstrap(AppCmp, [ROUTER_PROVIDERS]);
 * ```
 */
const List<dynamic> ROUTER_DIRECTIVES = const [RouterOutlet, RouterLink];
/**
 * A list of [Provider]s. To use the router, you must add this to your application.
 *
 * ### Example ([live demo](http://plnkr.co/edit/iRUP8B5OUbxCWQ3AcIDm))
 *
 * ```
 * import {Component} from 'angular2/angular2';
 * import {
 *   ROUTER_DIRECTIVES,
 *   ROUTER_PROVIDERS,
 *   RouteConfig
 * } from 'angular2/router';
 *
 * @Component({directives: [ROUTER_DIRECTIVES]})
 * @RouteConfig([
 *  {...},
 * ])
 * class AppCmp {
 *   // ...
 * }
 *
 * bootstrap(AppCmp, [ROUTER_PROVIDERS]);
 * ```
 */
const List<dynamic> ROUTER_PROVIDERS = const [
  RouteRegistry,
  const Provider(LocationStrategy, useClass: PathLocationStrategy),
  PlatformLocation,
  Location,
  const Provider(Router,
      useFactory: routerFactory,
      deps: const [
        RouteRegistry,
        Location,
        ROUTER_PRIMARY_COMPONENT,
        ApplicationRef
      ]),
  const Provider(ROUTER_PRIMARY_COMPONENT,
      useFactory: routerPrimaryComponentFactory, deps: const [ApplicationRef])
];
/**
 * @deprecated
 */
const ROUTER_BINDINGS = ROUTER_PROVIDERS;
routerFactory(registry, location, primaryComponent, appRef) {
  var rootRouter = new RootRouter(registry, location, primaryComponent);
  appRef.registerDisposeListener(() => rootRouter.dispose());
  return rootRouter;
}

routerPrimaryComponentFactory(app) {
  if (app.componentTypes.length == 0) {
    throw new BaseException(
        "Bootstrap at least one component before injecting Router.");
  }
  return app.componentTypes[0];
}
