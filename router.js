'use strict';/**
 * @module
 * @description
 * Maps application URLs into application states, to support deep-linking and navigation.
 */
function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
var router_1 = require('./src/router/router');
exports.Router = router_1.Router;
var router_outlet_1 = require('./src/router/router_outlet');
exports.RouterOutlet = router_outlet_1.RouterOutlet;
var router_link_1 = require('./src/router/router_link');
exports.RouterLink = router_link_1.RouterLink;
var instruction_1 = require('./src/router/instruction');
exports.RouteParams = instruction_1.RouteParams;
exports.RouteData = instruction_1.RouteData;
var platform_location_1 = require('./src/router/platform_location');
exports.PlatformLocation = platform_location_1.PlatformLocation;
var route_registry_1 = require('./src/router/route_registry');
exports.RouteRegistry = route_registry_1.RouteRegistry;
exports.ROUTER_PRIMARY_COMPONENT = route_registry_1.ROUTER_PRIMARY_COMPONENT;
var location_strategy_1 = require('./src/router/location_strategy');
exports.LocationStrategy = location_strategy_1.LocationStrategy;
exports.APP_BASE_HREF = location_strategy_1.APP_BASE_HREF;
var hash_location_strategy_1 = require('./src/router/hash_location_strategy');
exports.HashLocationStrategy = hash_location_strategy_1.HashLocationStrategy;
var path_location_strategy_1 = require('./src/router/path_location_strategy');
exports.PathLocationStrategy = path_location_strategy_1.PathLocationStrategy;
var location_1 = require('./src/router/location');
exports.Location = location_1.Location;
__export(require('./src/router/route_config_decorator'));
__export(require('./src/router/route_definition'));
var lifecycle_annotations_1 = require('./src/router/lifecycle_annotations');
exports.CanActivate = lifecycle_annotations_1.CanActivate;
var instruction_2 = require('./src/router/instruction');
exports.Instruction = instruction_2.Instruction;
exports.ComponentInstruction = instruction_2.ComponentInstruction;
var core_1 = require('angular2/core');
exports.OpaqueToken = core_1.OpaqueToken;
var platform_location_2 = require('./src/router/platform_location');
var location_strategy_2 = require('./src/router/location_strategy');
var path_location_strategy_2 = require('./src/router/path_location_strategy');
var router_2 = require('./src/router/router');
var router_outlet_2 = require('./src/router/router_outlet');
var router_link_2 = require('./src/router/router_link');
var route_registry_2 = require('./src/router/route_registry');
var location_2 = require('./src/router/location');
var core_2 = require('angular2/core');
var lang_1 = require('./src/facade/lang');
var exceptions_1 = require('angular2/src/facade/exceptions');
/**
 * A list of directives. To use the router directives like {@link RouterOutlet} and
 * {@link RouterLink}, add this to your `directives` array in the {@link View} decorator of your
 * component.
 *
 * ### Example ([live demo](http://plnkr.co/edit/iRUP8B5OUbxCWQ3AcIDm))
 *
 * ```
 * import {Component} from 'angular2/core';
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
exports.ROUTER_DIRECTIVES = lang_1.CONST_EXPR([router_outlet_2.RouterOutlet, router_link_2.RouterLink]);
/**
 * A list of {@link Provider}s. To use the router, you must add this to your application.
 *
 * ### Example ([live demo](http://plnkr.co/edit/iRUP8B5OUbxCWQ3AcIDm))
 *
 * ```
 * import {Component} from 'angular2/core';
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
exports.ROUTER_PROVIDERS = lang_1.CONST_EXPR([
    route_registry_2.RouteRegistry,
    lang_1.CONST_EXPR(new core_2.Provider(location_strategy_2.LocationStrategy, { useClass: path_location_strategy_2.PathLocationStrategy })),
    platform_location_2.PlatformLocation,
    location_2.Location,
    lang_1.CONST_EXPR(new core_2.Provider(router_2.Router, {
        useFactory: routerFactory,
        deps: lang_1.CONST_EXPR([route_registry_2.RouteRegistry, location_2.Location, route_registry_2.ROUTER_PRIMARY_COMPONENT, core_2.ApplicationRef])
    })),
    lang_1.CONST_EXPR(new core_2.Provider(route_registry_2.ROUTER_PRIMARY_COMPONENT, { useFactory: routerPrimaryComponentFactory, deps: lang_1.CONST_EXPR([core_2.ApplicationRef]) }))
]);
/**
 * Use {@link ROUTER_PROVIDERS} instead.
 *
 * @deprecated
 */
exports.ROUTER_BINDINGS = exports.ROUTER_PROVIDERS;
function routerFactory(registry, location, primaryComponent, appRef) {
    var rootRouter = new router_2.RootRouter(registry, location, primaryComponent);
    appRef.registerDisposeListener(function () { return rootRouter.dispose(); });
    return rootRouter;
}
function routerPrimaryComponentFactory(app) {
    if (app.componentTypes.length == 0) {
        throw new exceptions_1.BaseException("Bootstrap at least one component before injecting Router.");
    }
    return app.componentTypes[0];
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicm91dGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiYW5ndWxhcjIvcm91dGVyLnRzIl0sIm5hbWVzIjpbInJvdXRlckZhY3RvcnkiLCJyb3V0ZXJQcmltYXJ5Q29tcG9uZW50RmFjdG9yeSJdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7R0FJRzs7OztBQUVILHVCQUFxQixxQkFBcUIsQ0FBQztBQUFuQyxpQ0FBbUM7QUFDM0MsOEJBQTJCLDRCQUE0QixDQUFDO0FBQWhELG9EQUFnRDtBQUN4RCw0QkFBeUIsMEJBQTBCLENBQUM7QUFBNUMsOENBQTRDO0FBQ3BELDRCQUFxQywwQkFBMEIsQ0FBQztBQUF4RCxnREFBVztBQUFFLDRDQUEyQztBQUNoRSxrQ0FBK0IsZ0NBQWdDLENBQUM7QUFBeEQsZ0VBQXdEO0FBQ2hFLCtCQUFzRCw2QkFBNkIsQ0FBQztBQUE1RSx1REFBYTtBQUFFLDZFQUE2RDtBQUNwRixrQ0FBOEMsZ0NBQWdDLENBQUM7QUFBdkUsZ0VBQWdCO0FBQUUsMERBQXFEO0FBQy9FLHVDQUFtQyxxQ0FBcUMsQ0FBQztBQUFqRSw2RUFBaUU7QUFDekUsdUNBQW1DLHFDQUFxQyxDQUFDO0FBQWpFLDZFQUFpRTtBQUN6RSx5QkFBdUIsdUJBQXVCLENBQUM7QUFBdkMsdUNBQXVDO0FBQy9DLGlCQUFjLHFDQUFxQyxDQUFDLEVBQUE7QUFDcEQsaUJBQWMsK0JBQStCLENBQUMsRUFBQTtBQUU5QyxzQ0FBMEIsb0NBQW9DLENBQUM7QUFBdkQsMERBQXVEO0FBQy9ELDRCQUFnRCwwQkFBMEIsQ0FBQztBQUFuRSxnREFBVztBQUFFLGtFQUFzRDtBQUMzRSxxQkFBMEIsZUFBZSxDQUFDO0FBQWxDLHlDQUFrQztBQUUxQyxrQ0FBK0IsZ0NBQWdDLENBQUMsQ0FBQTtBQUNoRSxrQ0FBK0IsZ0NBQWdDLENBQUMsQ0FBQTtBQUNoRSx1Q0FBbUMscUNBQXFDLENBQUMsQ0FBQTtBQUN6RSx1QkFBaUMscUJBQXFCLENBQUMsQ0FBQTtBQUN2RCw4QkFBMkIsNEJBQTRCLENBQUMsQ0FBQTtBQUN4RCw0QkFBeUIsMEJBQTBCLENBQUMsQ0FBQTtBQUNwRCwrQkFBc0QsNkJBQTZCLENBQUMsQ0FBQTtBQUNwRix5QkFBdUIsdUJBQXVCLENBQUMsQ0FBQTtBQUMvQyxxQkFBNkQsZUFBZSxDQUFDLENBQUE7QUFDN0UscUJBQXlCLG1CQUFtQixDQUFDLENBQUE7QUFDN0MsMkJBQTRCLGdDQUFnQyxDQUFDLENBQUE7QUFFN0Q7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztHQXFCRztBQUNVLHlCQUFpQixHQUFVLGlCQUFVLENBQUMsQ0FBQyw0QkFBWSxFQUFFLHdCQUFVLENBQUMsQ0FBQyxDQUFDO0FBRS9FOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztHQXVCRztBQUNVLHdCQUFnQixHQUFVLGlCQUFVLENBQUM7SUFDaEQsOEJBQWE7SUFDYixpQkFBVSxDQUFDLElBQUksZUFBUSxDQUFDLG9DQUFnQixFQUFFLEVBQUMsUUFBUSxFQUFFLDZDQUFvQixFQUFDLENBQUMsQ0FBQztJQUM1RSxvQ0FBZ0I7SUFDaEIsbUJBQVE7SUFDUixpQkFBVSxDQUFDLElBQUksZUFBUSxDQUNuQixlQUFNLEVBQ047UUFDRSxVQUFVLEVBQUUsYUFBYTtRQUN6QixJQUFJLEVBQUUsaUJBQVUsQ0FBQyxDQUFDLDhCQUFhLEVBQUUsbUJBQVEsRUFBRSx5Q0FBd0IsRUFBRSxxQkFBYyxDQUFDLENBQUM7S0FDdEYsQ0FBQyxDQUFDO0lBQ1AsaUJBQVUsQ0FBQyxJQUFJLGVBQVEsQ0FDbkIseUNBQXdCLEVBQ3hCLEVBQUMsVUFBVSxFQUFFLDZCQUE2QixFQUFFLElBQUksRUFBRSxpQkFBVSxDQUFDLENBQUMscUJBQWMsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDO0NBQ3RGLENBQUMsQ0FBQztBQUVIOzs7O0dBSUc7QUFDVSx1QkFBZSxHQUFHLHdCQUFnQixDQUFDO0FBRWhELHVCQUF1QixRQUFRLEVBQUUsUUFBUSxFQUFFLGdCQUFnQixFQUFFLE1BQU07SUFDakVBLElBQUlBLFVBQVVBLEdBQUdBLElBQUlBLG1CQUFVQSxDQUFDQSxRQUFRQSxFQUFFQSxRQUFRQSxFQUFFQSxnQkFBZ0JBLENBQUNBLENBQUNBO0lBQ3RFQSxNQUFNQSxDQUFDQSx1QkFBdUJBLENBQUNBLGNBQU1BLE9BQUFBLFVBQVVBLENBQUNBLE9BQU9BLEVBQUVBLEVBQXBCQSxDQUFvQkEsQ0FBQ0EsQ0FBQ0E7SUFDM0RBLE1BQU1BLENBQUNBLFVBQVVBLENBQUNBO0FBQ3BCQSxDQUFDQTtBQUVELHVDQUF1QyxHQUFHO0lBQ3hDQyxFQUFFQSxDQUFDQSxDQUFDQSxHQUFHQSxDQUFDQSxjQUFjQSxDQUFDQSxNQUFNQSxJQUFJQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTtRQUNuQ0EsTUFBTUEsSUFBSUEsMEJBQWFBLENBQUNBLDJEQUEyREEsQ0FBQ0EsQ0FBQ0E7SUFDdkZBLENBQUNBO0lBQ0RBLE1BQU1BLENBQUNBLEdBQUdBLENBQUNBLGNBQWNBLENBQUNBLENBQUNBLENBQUNBLENBQUNBO0FBQy9CQSxDQUFDQSIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQG1vZHVsZVxuICogQGRlc2NyaXB0aW9uXG4gKiBNYXBzIGFwcGxpY2F0aW9uIFVSTHMgaW50byBhcHBsaWNhdGlvbiBzdGF0ZXMsIHRvIHN1cHBvcnQgZGVlcC1saW5raW5nIGFuZCBuYXZpZ2F0aW9uLlxuICovXG5cbmV4cG9ydCB7Um91dGVyfSBmcm9tICcuL3NyYy9yb3V0ZXIvcm91dGVyJztcbmV4cG9ydCB7Um91dGVyT3V0bGV0fSBmcm9tICcuL3NyYy9yb3V0ZXIvcm91dGVyX291dGxldCc7XG5leHBvcnQge1JvdXRlckxpbmt9IGZyb20gJy4vc3JjL3JvdXRlci9yb3V0ZXJfbGluayc7XG5leHBvcnQge1JvdXRlUGFyYW1zLCBSb3V0ZURhdGF9IGZyb20gJy4vc3JjL3JvdXRlci9pbnN0cnVjdGlvbic7XG5leHBvcnQge1BsYXRmb3JtTG9jYXRpb259IGZyb20gJy4vc3JjL3JvdXRlci9wbGF0Zm9ybV9sb2NhdGlvbic7XG5leHBvcnQge1JvdXRlUmVnaXN0cnksIFJPVVRFUl9QUklNQVJZX0NPTVBPTkVOVH0gZnJvbSAnLi9zcmMvcm91dGVyL3JvdXRlX3JlZ2lzdHJ5JztcbmV4cG9ydCB7TG9jYXRpb25TdHJhdGVneSwgQVBQX0JBU0VfSFJFRn0gZnJvbSAnLi9zcmMvcm91dGVyL2xvY2F0aW9uX3N0cmF0ZWd5JztcbmV4cG9ydCB7SGFzaExvY2F0aW9uU3RyYXRlZ3l9IGZyb20gJy4vc3JjL3JvdXRlci9oYXNoX2xvY2F0aW9uX3N0cmF0ZWd5JztcbmV4cG9ydCB7UGF0aExvY2F0aW9uU3RyYXRlZ3l9IGZyb20gJy4vc3JjL3JvdXRlci9wYXRoX2xvY2F0aW9uX3N0cmF0ZWd5JztcbmV4cG9ydCB7TG9jYXRpb259IGZyb20gJy4vc3JjL3JvdXRlci9sb2NhdGlvbic7XG5leHBvcnQgKiBmcm9tICcuL3NyYy9yb3V0ZXIvcm91dGVfY29uZmlnX2RlY29yYXRvcic7XG5leHBvcnQgKiBmcm9tICcuL3NyYy9yb3V0ZXIvcm91dGVfZGVmaW5pdGlvbic7XG5leHBvcnQge09uQWN0aXZhdGUsIE9uRGVhY3RpdmF0ZSwgT25SZXVzZSwgQ2FuRGVhY3RpdmF0ZSwgQ2FuUmV1c2V9IGZyb20gJy4vc3JjL3JvdXRlci9pbnRlcmZhY2VzJztcbmV4cG9ydCB7Q2FuQWN0aXZhdGV9IGZyb20gJy4vc3JjL3JvdXRlci9saWZlY3ljbGVfYW5ub3RhdGlvbnMnO1xuZXhwb3J0IHtJbnN0cnVjdGlvbiwgQ29tcG9uZW50SW5zdHJ1Y3Rpb259IGZyb20gJy4vc3JjL3JvdXRlci9pbnN0cnVjdGlvbic7XG5leHBvcnQge09wYXF1ZVRva2VufSBmcm9tICdhbmd1bGFyMi9jb3JlJztcblxuaW1wb3J0IHtQbGF0Zm9ybUxvY2F0aW9ufSBmcm9tICcuL3NyYy9yb3V0ZXIvcGxhdGZvcm1fbG9jYXRpb24nO1xuaW1wb3J0IHtMb2NhdGlvblN0cmF0ZWd5fSBmcm9tICcuL3NyYy9yb3V0ZXIvbG9jYXRpb25fc3RyYXRlZ3knO1xuaW1wb3J0IHtQYXRoTG9jYXRpb25TdHJhdGVneX0gZnJvbSAnLi9zcmMvcm91dGVyL3BhdGhfbG9jYXRpb25fc3RyYXRlZ3knO1xuaW1wb3J0IHtSb3V0ZXIsIFJvb3RSb3V0ZXJ9IGZyb20gJy4vc3JjL3JvdXRlci9yb3V0ZXInO1xuaW1wb3J0IHtSb3V0ZXJPdXRsZXR9IGZyb20gJy4vc3JjL3JvdXRlci9yb3V0ZXJfb3V0bGV0JztcbmltcG9ydCB7Um91dGVyTGlua30gZnJvbSAnLi9zcmMvcm91dGVyL3JvdXRlcl9saW5rJztcbmltcG9ydCB7Um91dGVSZWdpc3RyeSwgUk9VVEVSX1BSSU1BUllfQ09NUE9ORU5UfSBmcm9tICcuL3NyYy9yb3V0ZXIvcm91dGVfcmVnaXN0cnknO1xuaW1wb3J0IHtMb2NhdGlvbn0gZnJvbSAnLi9zcmMvcm91dGVyL2xvY2F0aW9uJztcbmltcG9ydCB7QXBwbGljYXRpb25SZWYsIHByb3ZpZGUsIE9wYXF1ZVRva2VuLCBQcm92aWRlcn0gZnJvbSAnYW5ndWxhcjIvY29yZSc7XG5pbXBvcnQge0NPTlNUX0VYUFJ9IGZyb20gJy4vc3JjL2ZhY2FkZS9sYW5nJztcbmltcG9ydCB7QmFzZUV4Y2VwdGlvbn0gZnJvbSAnYW5ndWxhcjIvc3JjL2ZhY2FkZS9leGNlcHRpb25zJztcblxuLyoqXG4gKiBBIGxpc3Qgb2YgZGlyZWN0aXZlcy4gVG8gdXNlIHRoZSByb3V0ZXIgZGlyZWN0aXZlcyBsaWtlIHtAbGluayBSb3V0ZXJPdXRsZXR9IGFuZFxuICoge0BsaW5rIFJvdXRlckxpbmt9LCBhZGQgdGhpcyB0byB5b3VyIGBkaXJlY3RpdmVzYCBhcnJheSBpbiB0aGUge0BsaW5rIFZpZXd9IGRlY29yYXRvciBvZiB5b3VyXG4gKiBjb21wb25lbnQuXG4gKlxuICogIyMjIEV4YW1wbGUgKFtsaXZlIGRlbW9dKGh0dHA6Ly9wbG5rci5jby9lZGl0L2lSVVA4QjVPVWJ4Q1dRM0FjSURtKSlcbiAqXG4gKiBgYGBcbiAqIGltcG9ydCB7Q29tcG9uZW50fSBmcm9tICdhbmd1bGFyMi9jb3JlJztcbiAqIGltcG9ydCB7Uk9VVEVSX0RJUkVDVElWRVMsIFJPVVRFUl9QUk9WSURFUlMsIFJvdXRlQ29uZmlnfSBmcm9tICdhbmd1bGFyMi9yb3V0ZXInO1xuICpcbiAqIEBDb21wb25lbnQoe2RpcmVjdGl2ZXM6IFtST1VURVJfRElSRUNUSVZFU119KVxuICogQFJvdXRlQ29uZmlnKFtcbiAqICB7Li4ufSxcbiAqIF0pXG4gKiBjbGFzcyBBcHBDbXAge1xuICogICAgLy8gLi4uXG4gKiB9XG4gKlxuICogYm9vdHN0cmFwKEFwcENtcCwgW1JPVVRFUl9QUk9WSURFUlNdKTtcbiAqIGBgYFxuICovXG5leHBvcnQgY29uc3QgUk9VVEVSX0RJUkVDVElWRVM6IGFueVtdID0gQ09OU1RfRVhQUihbUm91dGVyT3V0bGV0LCBSb3V0ZXJMaW5rXSk7XG5cbi8qKlxuICogQSBsaXN0IG9mIHtAbGluayBQcm92aWRlcn1zLiBUbyB1c2UgdGhlIHJvdXRlciwgeW91IG11c3QgYWRkIHRoaXMgdG8geW91ciBhcHBsaWNhdGlvbi5cbiAqXG4gKiAjIyMgRXhhbXBsZSAoW2xpdmUgZGVtb10oaHR0cDovL3BsbmtyLmNvL2VkaXQvaVJVUDhCNU9VYnhDV1EzQWNJRG0pKVxuICpcbiAqIGBgYFxuICogaW1wb3J0IHtDb21wb25lbnR9IGZyb20gJ2FuZ3VsYXIyL2NvcmUnO1xuICogaW1wb3J0IHtcbiAqICAgUk9VVEVSX0RJUkVDVElWRVMsXG4gKiAgIFJPVVRFUl9QUk9WSURFUlMsXG4gKiAgIFJvdXRlQ29uZmlnXG4gKiB9IGZyb20gJ2FuZ3VsYXIyL3JvdXRlcic7XG4gKlxuICogQENvbXBvbmVudCh7ZGlyZWN0aXZlczogW1JPVVRFUl9ESVJFQ1RJVkVTXX0pXG4gKiBAUm91dGVDb25maWcoW1xuICogIHsuLi59LFxuICogXSlcbiAqIGNsYXNzIEFwcENtcCB7XG4gKiAgIC8vIC4uLlxuICogfVxuICpcbiAqIGJvb3RzdHJhcChBcHBDbXAsIFtST1VURVJfUFJPVklERVJTXSk7XG4gKiBgYGBcbiAqL1xuZXhwb3J0IGNvbnN0IFJPVVRFUl9QUk9WSURFUlM6IGFueVtdID0gQ09OU1RfRVhQUihbXG4gIFJvdXRlUmVnaXN0cnksXG4gIENPTlNUX0VYUFIobmV3IFByb3ZpZGVyKExvY2F0aW9uU3RyYXRlZ3ksIHt1c2VDbGFzczogUGF0aExvY2F0aW9uU3RyYXRlZ3l9KSksXG4gIFBsYXRmb3JtTG9jYXRpb24sXG4gIExvY2F0aW9uLFxuICBDT05TVF9FWFBSKG5ldyBQcm92aWRlcihcbiAgICAgIFJvdXRlcixcbiAgICAgIHtcbiAgICAgICAgdXNlRmFjdG9yeTogcm91dGVyRmFjdG9yeSxcbiAgICAgICAgZGVwczogQ09OU1RfRVhQUihbUm91dGVSZWdpc3RyeSwgTG9jYXRpb24sIFJPVVRFUl9QUklNQVJZX0NPTVBPTkVOVCwgQXBwbGljYXRpb25SZWZdKVxuICAgICAgfSkpLFxuICBDT05TVF9FWFBSKG5ldyBQcm92aWRlcihcbiAgICAgIFJPVVRFUl9QUklNQVJZX0NPTVBPTkVOVCxcbiAgICAgIHt1c2VGYWN0b3J5OiByb3V0ZXJQcmltYXJ5Q29tcG9uZW50RmFjdG9yeSwgZGVwczogQ09OU1RfRVhQUihbQXBwbGljYXRpb25SZWZdKX0pKVxuXSk7XG5cbi8qKlxuICogVXNlIHtAbGluayBST1VURVJfUFJPVklERVJTfSBpbnN0ZWFkLlxuICpcbiAqIEBkZXByZWNhdGVkXG4gKi9cbmV4cG9ydCBjb25zdCBST1VURVJfQklORElOR1MgPSBST1VURVJfUFJPVklERVJTO1xuXG5mdW5jdGlvbiByb3V0ZXJGYWN0b3J5KHJlZ2lzdHJ5LCBsb2NhdGlvbiwgcHJpbWFyeUNvbXBvbmVudCwgYXBwUmVmKSB7XG4gIHZhciByb290Um91dGVyID0gbmV3IFJvb3RSb3V0ZXIocmVnaXN0cnksIGxvY2F0aW9uLCBwcmltYXJ5Q29tcG9uZW50KTtcbiAgYXBwUmVmLnJlZ2lzdGVyRGlzcG9zZUxpc3RlbmVyKCgpID0+IHJvb3RSb3V0ZXIuZGlzcG9zZSgpKTtcbiAgcmV0dXJuIHJvb3RSb3V0ZXI7XG59XG5cbmZ1bmN0aW9uIHJvdXRlclByaW1hcnlDb21wb25lbnRGYWN0b3J5KGFwcCkge1xuICBpZiAoYXBwLmNvbXBvbmVudFR5cGVzLmxlbmd0aCA9PSAwKSB7XG4gICAgdGhyb3cgbmV3IEJhc2VFeGNlcHRpb24oXCJCb290c3RyYXAgYXQgbGVhc3Qgb25lIGNvbXBvbmVudCBiZWZvcmUgaW5qZWN0aW5nIFJvdXRlci5cIik7XG4gIH1cbiAgcmV0dXJuIGFwcC5jb21wb25lbnRUeXBlc1swXTtcbn1cbiJdfQ==