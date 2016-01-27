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
var router_providers_common_1 = require('angular2/src/router/router_providers_common');
exports.ROUTER_PROVIDERS_COMMON = router_providers_common_1.ROUTER_PROVIDERS_COMMON;
var router_providers_1 = require('angular2/src/router/router_providers');
exports.ROUTER_PROVIDERS = router_providers_1.ROUTER_PROVIDERS;
exports.ROUTER_BINDINGS = router_providers_1.ROUTER_BINDINGS;
var router_outlet_2 = require('./src/router/router_outlet');
var router_link_2 = require('./src/router/router_link');
var lang_1 = require('./src/facade/lang');
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicm91dGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiYW5ndWxhcjIvcm91dGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7O0dBSUc7Ozs7QUFFSCx1QkFBcUIscUJBQXFCLENBQUM7QUFBbkMsaUNBQW1DO0FBQzNDLDhCQUEyQiw0QkFBNEIsQ0FBQztBQUFoRCxvREFBZ0Q7QUFDeEQsNEJBQXlCLDBCQUEwQixDQUFDO0FBQTVDLDhDQUE0QztBQUNwRCw0QkFBcUMsMEJBQTBCLENBQUM7QUFBeEQsZ0RBQVc7QUFBRSw0Q0FBMkM7QUFDaEUsa0NBQStCLGdDQUFnQyxDQUFDO0FBQXhELGdFQUF3RDtBQUNoRSwrQkFBc0QsNkJBQTZCLENBQUM7QUFBNUUsdURBQWE7QUFBRSw2RUFBNkQ7QUFDcEYsa0NBQThDLGdDQUFnQyxDQUFDO0FBQXZFLGdFQUFnQjtBQUFFLDBEQUFxRDtBQUMvRSx1Q0FBbUMscUNBQXFDLENBQUM7QUFBakUsNkVBQWlFO0FBQ3pFLHVDQUFtQyxxQ0FBcUMsQ0FBQztBQUFqRSw2RUFBaUU7QUFDekUseUJBQXVCLHVCQUF1QixDQUFDO0FBQXZDLHVDQUF1QztBQUMvQyxpQkFBYyxxQ0FBcUMsQ0FBQyxFQUFBO0FBQ3BELGlCQUFjLCtCQUErQixDQUFDLEVBQUE7QUFFOUMsc0NBQTBCLG9DQUFvQyxDQUFDO0FBQXZELDBEQUF1RDtBQUMvRCw0QkFBZ0QsMEJBQTBCLENBQUM7QUFBbkUsZ0RBQVc7QUFBRSxrRUFBc0Q7QUFDM0UscUJBQTBCLGVBQWUsQ0FBQztBQUFsQyx5Q0FBa0M7QUFDMUMsd0NBQXNDLDZDQUE2QyxDQUFDO0FBQTVFLG9GQUE0RTtBQUNwRixpQ0FBZ0Qsc0NBQXNDLENBQUM7QUFBL0UsK0RBQWdCO0FBQUUsNkRBQTZEO0FBRXZGLDhCQUEyQiw0QkFBNEIsQ0FBQyxDQUFBO0FBQ3hELDRCQUF5QiwwQkFBMEIsQ0FBQyxDQUFBO0FBQ3BELHFCQUF5QixtQkFBbUIsQ0FBQyxDQUFBO0FBRTdDOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7R0FxQkc7QUFDVSx5QkFBaUIsR0FBVSxpQkFBVSxDQUFDLENBQUMsNEJBQVksRUFBRSx3QkFBVSxDQUFDLENBQUMsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQG1vZHVsZVxuICogQGRlc2NyaXB0aW9uXG4gKiBNYXBzIGFwcGxpY2F0aW9uIFVSTHMgaW50byBhcHBsaWNhdGlvbiBzdGF0ZXMsIHRvIHN1cHBvcnQgZGVlcC1saW5raW5nIGFuZCBuYXZpZ2F0aW9uLlxuICovXG5cbmV4cG9ydCB7Um91dGVyfSBmcm9tICcuL3NyYy9yb3V0ZXIvcm91dGVyJztcbmV4cG9ydCB7Um91dGVyT3V0bGV0fSBmcm9tICcuL3NyYy9yb3V0ZXIvcm91dGVyX291dGxldCc7XG5leHBvcnQge1JvdXRlckxpbmt9IGZyb20gJy4vc3JjL3JvdXRlci9yb3V0ZXJfbGluayc7XG5leHBvcnQge1JvdXRlUGFyYW1zLCBSb3V0ZURhdGF9IGZyb20gJy4vc3JjL3JvdXRlci9pbnN0cnVjdGlvbic7XG5leHBvcnQge1BsYXRmb3JtTG9jYXRpb259IGZyb20gJy4vc3JjL3JvdXRlci9wbGF0Zm9ybV9sb2NhdGlvbic7XG5leHBvcnQge1JvdXRlUmVnaXN0cnksIFJPVVRFUl9QUklNQVJZX0NPTVBPTkVOVH0gZnJvbSAnLi9zcmMvcm91dGVyL3JvdXRlX3JlZ2lzdHJ5JztcbmV4cG9ydCB7TG9jYXRpb25TdHJhdGVneSwgQVBQX0JBU0VfSFJFRn0gZnJvbSAnLi9zcmMvcm91dGVyL2xvY2F0aW9uX3N0cmF0ZWd5JztcbmV4cG9ydCB7SGFzaExvY2F0aW9uU3RyYXRlZ3l9IGZyb20gJy4vc3JjL3JvdXRlci9oYXNoX2xvY2F0aW9uX3N0cmF0ZWd5JztcbmV4cG9ydCB7UGF0aExvY2F0aW9uU3RyYXRlZ3l9IGZyb20gJy4vc3JjL3JvdXRlci9wYXRoX2xvY2F0aW9uX3N0cmF0ZWd5JztcbmV4cG9ydCB7TG9jYXRpb259IGZyb20gJy4vc3JjL3JvdXRlci9sb2NhdGlvbic7XG5leHBvcnQgKiBmcm9tICcuL3NyYy9yb3V0ZXIvcm91dGVfY29uZmlnX2RlY29yYXRvcic7XG5leHBvcnQgKiBmcm9tICcuL3NyYy9yb3V0ZXIvcm91dGVfZGVmaW5pdGlvbic7XG5leHBvcnQge09uQWN0aXZhdGUsIE9uRGVhY3RpdmF0ZSwgT25SZXVzZSwgQ2FuRGVhY3RpdmF0ZSwgQ2FuUmV1c2V9IGZyb20gJy4vc3JjL3JvdXRlci9pbnRlcmZhY2VzJztcbmV4cG9ydCB7Q2FuQWN0aXZhdGV9IGZyb20gJy4vc3JjL3JvdXRlci9saWZlY3ljbGVfYW5ub3RhdGlvbnMnO1xuZXhwb3J0IHtJbnN0cnVjdGlvbiwgQ29tcG9uZW50SW5zdHJ1Y3Rpb259IGZyb20gJy4vc3JjL3JvdXRlci9pbnN0cnVjdGlvbic7XG5leHBvcnQge09wYXF1ZVRva2VufSBmcm9tICdhbmd1bGFyMi9jb3JlJztcbmV4cG9ydCB7Uk9VVEVSX1BST1ZJREVSU19DT01NT059IGZyb20gJ2FuZ3VsYXIyL3NyYy9yb3V0ZXIvcm91dGVyX3Byb3ZpZGVyc19jb21tb24nO1xuZXhwb3J0IHtST1VURVJfUFJPVklERVJTLCBST1VURVJfQklORElOR1N9IGZyb20gJ2FuZ3VsYXIyL3NyYy9yb3V0ZXIvcm91dGVyX3Byb3ZpZGVycyc7XG5cbmltcG9ydCB7Um91dGVyT3V0bGV0fSBmcm9tICcuL3NyYy9yb3V0ZXIvcm91dGVyX291dGxldCc7XG5pbXBvcnQge1JvdXRlckxpbmt9IGZyb20gJy4vc3JjL3JvdXRlci9yb3V0ZXJfbGluayc7XG5pbXBvcnQge0NPTlNUX0VYUFJ9IGZyb20gJy4vc3JjL2ZhY2FkZS9sYW5nJztcblxuLyoqXG4gKiBBIGxpc3Qgb2YgZGlyZWN0aXZlcy4gVG8gdXNlIHRoZSByb3V0ZXIgZGlyZWN0aXZlcyBsaWtlIHtAbGluayBSb3V0ZXJPdXRsZXR9IGFuZFxuICoge0BsaW5rIFJvdXRlckxpbmt9LCBhZGQgdGhpcyB0byB5b3VyIGBkaXJlY3RpdmVzYCBhcnJheSBpbiB0aGUge0BsaW5rIFZpZXd9IGRlY29yYXRvciBvZiB5b3VyXG4gKiBjb21wb25lbnQuXG4gKlxuICogIyMjIEV4YW1wbGUgKFtsaXZlIGRlbW9dKGh0dHA6Ly9wbG5rci5jby9lZGl0L2lSVVA4QjVPVWJ4Q1dRM0FjSURtKSlcbiAqXG4gKiBgYGBcbiAqIGltcG9ydCB7Q29tcG9uZW50fSBmcm9tICdhbmd1bGFyMi9jb3JlJztcbiAqIGltcG9ydCB7Uk9VVEVSX0RJUkVDVElWRVMsIFJPVVRFUl9QUk9WSURFUlMsIFJvdXRlQ29uZmlnfSBmcm9tICdhbmd1bGFyMi9yb3V0ZXInO1xuICpcbiAqIEBDb21wb25lbnQoe2RpcmVjdGl2ZXM6IFtST1VURVJfRElSRUNUSVZFU119KVxuICogQFJvdXRlQ29uZmlnKFtcbiAqICB7Li4ufSxcbiAqIF0pXG4gKiBjbGFzcyBBcHBDbXAge1xuICogICAgLy8gLi4uXG4gKiB9XG4gKlxuICogYm9vdHN0cmFwKEFwcENtcCwgW1JPVVRFUl9QUk9WSURFUlNdKTtcbiAqIGBgYFxuICovXG5leHBvcnQgY29uc3QgUk9VVEVSX0RJUkVDVElWRVM6IGFueVtdID0gQ09OU1RfRVhQUihbUm91dGVyT3V0bGV0LCBSb3V0ZXJMaW5rXSk7XG4iXX0=