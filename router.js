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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicm91dGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiYW5ndWxhcjIvcm91dGVyLnRzIl0sIm5hbWVzIjpbInJvdXRlckZhY3RvcnkiLCJyb3V0ZXJQcmltYXJ5Q29tcG9uZW50RmFjdG9yeSJdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7R0FJRzs7OztBQUVILHVCQUFxQixxQkFBcUIsQ0FBQztBQUFuQyxpQ0FBbUM7QUFDM0MsOEJBQTJCLDRCQUE0QixDQUFDO0FBQWhELG9EQUFnRDtBQUN4RCw0QkFBeUIsMEJBQTBCLENBQUM7QUFBNUMsOENBQTRDO0FBQ3BELDRCQUFxQywwQkFBMEIsQ0FBQztBQUF4RCxnREFBVztBQUFFLDRDQUEyQztBQUNoRSxrQ0FBK0IsZ0NBQWdDLENBQUM7QUFBeEQsZ0VBQXdEO0FBQ2hFLCtCQUFzRCw2QkFBNkIsQ0FBQztBQUE1RSx1REFBYTtBQUFFLDZFQUE2RDtBQUNwRixrQ0FBOEMsZ0NBQWdDLENBQUM7QUFBdkUsZ0VBQWdCO0FBQUUsMERBQXFEO0FBQy9FLHVDQUFtQyxxQ0FBcUMsQ0FBQztBQUFqRSw2RUFBaUU7QUFDekUsdUNBQW1DLHFDQUFxQyxDQUFDO0FBQWpFLDZFQUFpRTtBQUN6RSx5QkFBdUIsdUJBQXVCLENBQUM7QUFBdkMsdUNBQXVDO0FBQy9DLGlCQUFjLHFDQUFxQyxDQUFDLEVBQUE7QUFDcEQsaUJBQWMsK0JBQStCLENBQUMsRUFBQTtBQUU5QyxzQ0FBMEIsb0NBQW9DLENBQUM7QUFBdkQsMERBQXVEO0FBQy9ELDRCQUFnRCwwQkFBMEIsQ0FBQztBQUFuRSxnREFBVztBQUFFLGtFQUFzRDtBQUMzRSxxQkFBMEIsZUFBZSxDQUFDO0FBQWxDLHlDQUFrQztBQUUxQyxrQ0FBK0IsZ0NBQWdDLENBQUMsQ0FBQTtBQUNoRSxrQ0FBK0IsZ0NBQWdDLENBQUMsQ0FBQTtBQUNoRSx1Q0FBbUMscUNBQXFDLENBQUMsQ0FBQTtBQUN6RSx1QkFBaUMscUJBQXFCLENBQUMsQ0FBQTtBQUN2RCw4QkFBMkIsNEJBQTRCLENBQUMsQ0FBQTtBQUN4RCw0QkFBeUIsMEJBQTBCLENBQUMsQ0FBQTtBQUNwRCwrQkFBc0QsNkJBQTZCLENBQUMsQ0FBQTtBQUNwRix5QkFBdUIsdUJBQXVCLENBQUMsQ0FBQTtBQUMvQyxxQkFBNkQsZUFBZSxDQUFDLENBQUE7QUFDN0UscUJBQXlCLG1CQUFtQixDQUFDLENBQUE7QUFDN0MsMkJBQTRCLGdDQUFnQyxDQUFDLENBQUE7QUFFN0Q7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztHQXFCRztBQUNVLHlCQUFpQixHQUFVLGlCQUFVLENBQUMsQ0FBQyw0QkFBWSxFQUFFLHdCQUFVLENBQUMsQ0FBQyxDQUFDO0FBRS9FOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztHQXVCRztBQUNVLHdCQUFnQixHQUFVLGlCQUFVLENBQUM7SUFDaEQsOEJBQWE7SUFDYixpQkFBVSxDQUFDLElBQUksZUFBUSxDQUFDLG9DQUFnQixFQUFFLEVBQUMsUUFBUSxFQUFFLDZDQUFvQixFQUFDLENBQUMsQ0FBQztJQUM1RSxvQ0FBZ0I7SUFDaEIsbUJBQVE7SUFDUixpQkFBVSxDQUFDLElBQUksZUFBUSxDQUNuQixlQUFNLEVBQ047UUFDRSxVQUFVLEVBQUUsYUFBYTtRQUN6QixJQUFJLEVBQUUsaUJBQVUsQ0FBQyxDQUFDLDhCQUFhLEVBQUUsbUJBQVEsRUFBRSx5Q0FBd0IsRUFBRSxxQkFBYyxDQUFDLENBQUM7S0FDdEYsQ0FBQyxDQUFDO0lBQ1AsaUJBQVUsQ0FBQyxJQUFJLGVBQVEsQ0FDbkIseUNBQXdCLEVBQ3hCLEVBQUMsVUFBVSxFQUFFLDZCQUE2QixFQUFFLElBQUksRUFBRSxpQkFBVSxDQUFDLENBQUMscUJBQWMsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDO0NBQ3RGLENBQUMsQ0FBQztBQUVIOztHQUVHO0FBQ1UsdUJBQWUsR0FBRyx3QkFBZ0IsQ0FBQztBQUVoRCx1QkFBdUIsUUFBUSxFQUFFLFFBQVEsRUFBRSxnQkFBZ0IsRUFBRSxNQUFNO0lBQ2pFQSxJQUFJQSxVQUFVQSxHQUFHQSxJQUFJQSxtQkFBVUEsQ0FBQ0EsUUFBUUEsRUFBRUEsUUFBUUEsRUFBRUEsZ0JBQWdCQSxDQUFDQSxDQUFDQTtJQUN0RUEsTUFBTUEsQ0FBQ0EsdUJBQXVCQSxDQUFDQSxjQUFNQSxPQUFBQSxVQUFVQSxDQUFDQSxPQUFPQSxFQUFFQSxFQUFwQkEsQ0FBb0JBLENBQUNBLENBQUNBO0lBQzNEQSxNQUFNQSxDQUFDQSxVQUFVQSxDQUFDQTtBQUNwQkEsQ0FBQ0E7QUFFRCx1Q0FBdUMsR0FBRztJQUN4Q0MsRUFBRUEsQ0FBQ0EsQ0FBQ0EsR0FBR0EsQ0FBQ0EsY0FBY0EsQ0FBQ0EsTUFBTUEsSUFBSUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7UUFDbkNBLE1BQU1BLElBQUlBLDBCQUFhQSxDQUFDQSwyREFBMkRBLENBQUNBLENBQUNBO0lBQ3ZGQSxDQUFDQTtJQUNEQSxNQUFNQSxDQUFDQSxHQUFHQSxDQUFDQSxjQUFjQSxDQUFDQSxDQUFDQSxDQUFDQSxDQUFDQTtBQUMvQkEsQ0FBQ0EiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBtb2R1bGVcbiAqIEBkZXNjcmlwdGlvblxuICogTWFwcyBhcHBsaWNhdGlvbiBVUkxzIGludG8gYXBwbGljYXRpb24gc3RhdGVzLCB0byBzdXBwb3J0IGRlZXAtbGlua2luZyBhbmQgbmF2aWdhdGlvbi5cbiAqL1xuXG5leHBvcnQge1JvdXRlcn0gZnJvbSAnLi9zcmMvcm91dGVyL3JvdXRlcic7XG5leHBvcnQge1JvdXRlck91dGxldH0gZnJvbSAnLi9zcmMvcm91dGVyL3JvdXRlcl9vdXRsZXQnO1xuZXhwb3J0IHtSb3V0ZXJMaW5rfSBmcm9tICcuL3NyYy9yb3V0ZXIvcm91dGVyX2xpbmsnO1xuZXhwb3J0IHtSb3V0ZVBhcmFtcywgUm91dGVEYXRhfSBmcm9tICcuL3NyYy9yb3V0ZXIvaW5zdHJ1Y3Rpb24nO1xuZXhwb3J0IHtQbGF0Zm9ybUxvY2F0aW9ufSBmcm9tICcuL3NyYy9yb3V0ZXIvcGxhdGZvcm1fbG9jYXRpb24nO1xuZXhwb3J0IHtSb3V0ZVJlZ2lzdHJ5LCBST1VURVJfUFJJTUFSWV9DT01QT05FTlR9IGZyb20gJy4vc3JjL3JvdXRlci9yb3V0ZV9yZWdpc3RyeSc7XG5leHBvcnQge0xvY2F0aW9uU3RyYXRlZ3ksIEFQUF9CQVNFX0hSRUZ9IGZyb20gJy4vc3JjL3JvdXRlci9sb2NhdGlvbl9zdHJhdGVneSc7XG5leHBvcnQge0hhc2hMb2NhdGlvblN0cmF0ZWd5fSBmcm9tICcuL3NyYy9yb3V0ZXIvaGFzaF9sb2NhdGlvbl9zdHJhdGVneSc7XG5leHBvcnQge1BhdGhMb2NhdGlvblN0cmF0ZWd5fSBmcm9tICcuL3NyYy9yb3V0ZXIvcGF0aF9sb2NhdGlvbl9zdHJhdGVneSc7XG5leHBvcnQge0xvY2F0aW9ufSBmcm9tICcuL3NyYy9yb3V0ZXIvbG9jYXRpb24nO1xuZXhwb3J0ICogZnJvbSAnLi9zcmMvcm91dGVyL3JvdXRlX2NvbmZpZ19kZWNvcmF0b3InO1xuZXhwb3J0ICogZnJvbSAnLi9zcmMvcm91dGVyL3JvdXRlX2RlZmluaXRpb24nO1xuZXhwb3J0IHtPbkFjdGl2YXRlLCBPbkRlYWN0aXZhdGUsIE9uUmV1c2UsIENhbkRlYWN0aXZhdGUsIENhblJldXNlfSBmcm9tICcuL3NyYy9yb3V0ZXIvaW50ZXJmYWNlcyc7XG5leHBvcnQge0NhbkFjdGl2YXRlfSBmcm9tICcuL3NyYy9yb3V0ZXIvbGlmZWN5Y2xlX2Fubm90YXRpb25zJztcbmV4cG9ydCB7SW5zdHJ1Y3Rpb24sIENvbXBvbmVudEluc3RydWN0aW9ufSBmcm9tICcuL3NyYy9yb3V0ZXIvaW5zdHJ1Y3Rpb24nO1xuZXhwb3J0IHtPcGFxdWVUb2tlbn0gZnJvbSAnYW5ndWxhcjIvY29yZSc7XG5cbmltcG9ydCB7UGxhdGZvcm1Mb2NhdGlvbn0gZnJvbSAnLi9zcmMvcm91dGVyL3BsYXRmb3JtX2xvY2F0aW9uJztcbmltcG9ydCB7TG9jYXRpb25TdHJhdGVneX0gZnJvbSAnLi9zcmMvcm91dGVyL2xvY2F0aW9uX3N0cmF0ZWd5JztcbmltcG9ydCB7UGF0aExvY2F0aW9uU3RyYXRlZ3l9IGZyb20gJy4vc3JjL3JvdXRlci9wYXRoX2xvY2F0aW9uX3N0cmF0ZWd5JztcbmltcG9ydCB7Um91dGVyLCBSb290Um91dGVyfSBmcm9tICcuL3NyYy9yb3V0ZXIvcm91dGVyJztcbmltcG9ydCB7Um91dGVyT3V0bGV0fSBmcm9tICcuL3NyYy9yb3V0ZXIvcm91dGVyX291dGxldCc7XG5pbXBvcnQge1JvdXRlckxpbmt9IGZyb20gJy4vc3JjL3JvdXRlci9yb3V0ZXJfbGluayc7XG5pbXBvcnQge1JvdXRlUmVnaXN0cnksIFJPVVRFUl9QUklNQVJZX0NPTVBPTkVOVH0gZnJvbSAnLi9zcmMvcm91dGVyL3JvdXRlX3JlZ2lzdHJ5JztcbmltcG9ydCB7TG9jYXRpb259IGZyb20gJy4vc3JjL3JvdXRlci9sb2NhdGlvbic7XG5pbXBvcnQge0FwcGxpY2F0aW9uUmVmLCBwcm92aWRlLCBPcGFxdWVUb2tlbiwgUHJvdmlkZXJ9IGZyb20gJ2FuZ3VsYXIyL2NvcmUnO1xuaW1wb3J0IHtDT05TVF9FWFBSfSBmcm9tICcuL3NyYy9mYWNhZGUvbGFuZyc7XG5pbXBvcnQge0Jhc2VFeGNlcHRpb259IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvZXhjZXB0aW9ucyc7XG5cbi8qKlxuICogQSBsaXN0IG9mIGRpcmVjdGl2ZXMuIFRvIHVzZSB0aGUgcm91dGVyIGRpcmVjdGl2ZXMgbGlrZSB7QGxpbmsgUm91dGVyT3V0bGV0fSBhbmRcbiAqIHtAbGluayBSb3V0ZXJMaW5rfSwgYWRkIHRoaXMgdG8geW91ciBgZGlyZWN0aXZlc2AgYXJyYXkgaW4gdGhlIHtAbGluayBWaWV3fSBkZWNvcmF0b3Igb2YgeW91clxuICogY29tcG9uZW50LlxuICpcbiAqICMjIyBFeGFtcGxlIChbbGl2ZSBkZW1vXShodHRwOi8vcGxua3IuY28vZWRpdC9pUlVQOEI1T1VieENXUTNBY0lEbSkpXG4gKlxuICogYGBgXG4gKiBpbXBvcnQge0NvbXBvbmVudH0gZnJvbSAnYW5ndWxhcjIvY29yZSc7XG4gKiBpbXBvcnQge1JPVVRFUl9ESVJFQ1RJVkVTLCBST1VURVJfUFJPVklERVJTLCBSb3V0ZUNvbmZpZ30gZnJvbSAnYW5ndWxhcjIvcm91dGVyJztcbiAqXG4gKiBAQ29tcG9uZW50KHtkaXJlY3RpdmVzOiBbUk9VVEVSX0RJUkVDVElWRVNdfSlcbiAqIEBSb3V0ZUNvbmZpZyhbXG4gKiAgey4uLn0sXG4gKiBdKVxuICogY2xhc3MgQXBwQ21wIHtcbiAqICAgIC8vIC4uLlxuICogfVxuICpcbiAqIGJvb3RzdHJhcChBcHBDbXAsIFtST1VURVJfUFJPVklERVJTXSk7XG4gKiBgYGBcbiAqL1xuZXhwb3J0IGNvbnN0IFJPVVRFUl9ESVJFQ1RJVkVTOiBhbnlbXSA9IENPTlNUX0VYUFIoW1JvdXRlck91dGxldCwgUm91dGVyTGlua10pO1xuXG4vKipcbiAqIEEgbGlzdCBvZiB7QGxpbmsgUHJvdmlkZXJ9cy4gVG8gdXNlIHRoZSByb3V0ZXIsIHlvdSBtdXN0IGFkZCB0aGlzIHRvIHlvdXIgYXBwbGljYXRpb24uXG4gKlxuICogIyMjIEV4YW1wbGUgKFtsaXZlIGRlbW9dKGh0dHA6Ly9wbG5rci5jby9lZGl0L2lSVVA4QjVPVWJ4Q1dRM0FjSURtKSlcbiAqXG4gKiBgYGBcbiAqIGltcG9ydCB7Q29tcG9uZW50fSBmcm9tICdhbmd1bGFyMi9jb3JlJztcbiAqIGltcG9ydCB7XG4gKiAgIFJPVVRFUl9ESVJFQ1RJVkVTLFxuICogICBST1VURVJfUFJPVklERVJTLFxuICogICBSb3V0ZUNvbmZpZ1xuICogfSBmcm9tICdhbmd1bGFyMi9yb3V0ZXInO1xuICpcbiAqIEBDb21wb25lbnQoe2RpcmVjdGl2ZXM6IFtST1VURVJfRElSRUNUSVZFU119KVxuICogQFJvdXRlQ29uZmlnKFtcbiAqICB7Li4ufSxcbiAqIF0pXG4gKiBjbGFzcyBBcHBDbXAge1xuICogICAvLyAuLi5cbiAqIH1cbiAqXG4gKiBib290c3RyYXAoQXBwQ21wLCBbUk9VVEVSX1BST1ZJREVSU10pO1xuICogYGBgXG4gKi9cbmV4cG9ydCBjb25zdCBST1VURVJfUFJPVklERVJTOiBhbnlbXSA9IENPTlNUX0VYUFIoW1xuICBSb3V0ZVJlZ2lzdHJ5LFxuICBDT05TVF9FWFBSKG5ldyBQcm92aWRlcihMb2NhdGlvblN0cmF0ZWd5LCB7dXNlQ2xhc3M6IFBhdGhMb2NhdGlvblN0cmF0ZWd5fSkpLFxuICBQbGF0Zm9ybUxvY2F0aW9uLFxuICBMb2NhdGlvbixcbiAgQ09OU1RfRVhQUihuZXcgUHJvdmlkZXIoXG4gICAgICBSb3V0ZXIsXG4gICAgICB7XG4gICAgICAgIHVzZUZhY3Rvcnk6IHJvdXRlckZhY3RvcnksXG4gICAgICAgIGRlcHM6IENPTlNUX0VYUFIoW1JvdXRlUmVnaXN0cnksIExvY2F0aW9uLCBST1VURVJfUFJJTUFSWV9DT01QT05FTlQsIEFwcGxpY2F0aW9uUmVmXSlcbiAgICAgIH0pKSxcbiAgQ09OU1RfRVhQUihuZXcgUHJvdmlkZXIoXG4gICAgICBST1VURVJfUFJJTUFSWV9DT01QT05FTlQsXG4gICAgICB7dXNlRmFjdG9yeTogcm91dGVyUHJpbWFyeUNvbXBvbmVudEZhY3RvcnksIGRlcHM6IENPTlNUX0VYUFIoW0FwcGxpY2F0aW9uUmVmXSl9KSlcbl0pO1xuXG4vKipcbiAqIEBkZXByZWNhdGVkXG4gKi9cbmV4cG9ydCBjb25zdCBST1VURVJfQklORElOR1MgPSBST1VURVJfUFJPVklERVJTO1xuXG5mdW5jdGlvbiByb3V0ZXJGYWN0b3J5KHJlZ2lzdHJ5LCBsb2NhdGlvbiwgcHJpbWFyeUNvbXBvbmVudCwgYXBwUmVmKSB7XG4gIHZhciByb290Um91dGVyID0gbmV3IFJvb3RSb3V0ZXIocmVnaXN0cnksIGxvY2F0aW9uLCBwcmltYXJ5Q29tcG9uZW50KTtcbiAgYXBwUmVmLnJlZ2lzdGVyRGlzcG9zZUxpc3RlbmVyKCgpID0+IHJvb3RSb3V0ZXIuZGlzcG9zZSgpKTtcbiAgcmV0dXJuIHJvb3RSb3V0ZXI7XG59XG5cbmZ1bmN0aW9uIHJvdXRlclByaW1hcnlDb21wb25lbnRGYWN0b3J5KGFwcCkge1xuICBpZiAoYXBwLmNvbXBvbmVudFR5cGVzLmxlbmd0aCA9PSAwKSB7XG4gICAgdGhyb3cgbmV3IEJhc2VFeGNlcHRpb24oXCJCb290c3RyYXAgYXQgbGVhc3Qgb25lIGNvbXBvbmVudCBiZWZvcmUgaW5qZWN0aW5nIFJvdXRlci5cIik7XG4gIH1cbiAgcmV0dXJuIGFwcC5jb21wb25lbnRUeXBlc1swXTtcbn1cbiJdfQ==