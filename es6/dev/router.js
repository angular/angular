/**
 * @module
 * @description
 * Maps application URLs into application states, to support deep-linking and navigation.
 */
export { Router } from './src/router/router';
export { RouterOutlet } from './src/router/router_outlet';
export { RouterLink } from './src/router/router_link';
export { RouteParams, RouteData } from './src/router/instruction';
export { RouteRegistry } from './src/router/route_registry';
export { LocationStrategy, APP_BASE_HREF } from './src/router/location_strategy';
export { HashLocationStrategy } from './src/router/hash_location_strategy';
export { PathLocationStrategy } from './src/router/path_location_strategy';
export { Location } from './src/router/location';
export * from './src/router/route_config_decorator';
export * from './src/router/route_definition';
export { CanActivate } from './src/router/lifecycle_annotations';
export { Instruction, ComponentInstruction } from './src/router/instruction';
export { OpaqueToken } from 'angular2/angular2';
import { LocationStrategy } from './src/router/location_strategy';
import { PathLocationStrategy } from './src/router/path_location_strategy';
import { Router, RootRouter } from './src/router/router';
import { RouterOutlet } from './src/router/router_outlet';
import { RouterLink } from './src/router/router_link';
import { RouteRegistry } from './src/router/route_registry';
import { Location } from './src/router/location';
import { ApplicationRef, OpaqueToken, Provider } from 'angular2/angular2';
import { CONST_EXPR } from './src/facade/lang';
import { BaseException } from 'angular2/src/facade/exceptions';
/**
 * Token used to bind the component with the top-level {@link RouteConfig}s for the
 * application.
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
export const ROUTER_PRIMARY_COMPONENT = CONST_EXPR(new OpaqueToken('RouterPrimaryComponent'));
/**
 * A list of directives. To use the router directives like {@link RouterOutlet} and
 * {@link RouterLink}, add this to your `directives` array in the {@link View} decorator of your
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
export const ROUTER_DIRECTIVES = CONST_EXPR([RouterOutlet, RouterLink]);
/**
 * A list of {@link Provider}s. To use the router, you must add this to your application.
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
export const ROUTER_PROVIDERS = CONST_EXPR([
    RouteRegistry,
    CONST_EXPR(new Provider(LocationStrategy, { useClass: PathLocationStrategy })),
    Location,
    CONST_EXPR(new Provider(Router, {
        useFactory: routerFactory,
        deps: CONST_EXPR([RouteRegistry, Location, ROUTER_PRIMARY_COMPONENT, ApplicationRef])
    })),
    CONST_EXPR(new Provider(ROUTER_PRIMARY_COMPONENT, { useFactory: routerPrimaryComponentFactory, deps: CONST_EXPR([ApplicationRef]) }))
]);
/**
 * @deprecated
 */
export const ROUTER_BINDINGS = ROUTER_PROVIDERS;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicm91dGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiYW5ndWxhcjIvcm91dGVyLnRzIl0sIm5hbWVzIjpbInJvdXRlckZhY3RvcnkiLCJyb3V0ZXJQcmltYXJ5Q29tcG9uZW50RmFjdG9yeSJdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7R0FJRztBQUVILFNBQVEsTUFBTSxRQUFPLHFCQUFxQixDQUFDO0FBQzNDLFNBQVEsWUFBWSxRQUFPLDRCQUE0QixDQUFDO0FBQ3hELFNBQVEsVUFBVSxRQUFPLDBCQUEwQixDQUFDO0FBQ3BELFNBQVEsV0FBVyxFQUFFLFNBQVMsUUFBTywwQkFBMEIsQ0FBQztBQUNoRSxTQUFRLGFBQWEsUUFBTyw2QkFBNkIsQ0FBQztBQUMxRCxTQUFRLGdCQUFnQixFQUFFLGFBQWEsUUFBTyxnQ0FBZ0MsQ0FBQztBQUMvRSxTQUFRLG9CQUFvQixRQUFPLHFDQUFxQyxDQUFDO0FBQ3pFLFNBQVEsb0JBQW9CLFFBQU8scUNBQXFDLENBQUM7QUFDekUsU0FBUSxRQUFRLFFBQU8sdUJBQXVCLENBQUM7QUFDL0MsY0FBYyxxQ0FBcUMsQ0FBQztBQUNwRCxjQUFjLCtCQUErQixDQUFDO0FBRTlDLFNBQVEsV0FBVyxRQUFPLG9DQUFvQyxDQUFDO0FBQy9ELFNBQVEsV0FBVyxFQUFFLG9CQUFvQixRQUFPLDBCQUEwQixDQUFDO0FBQzNFLFNBQVEsV0FBVyxRQUFPLG1CQUFtQixDQUFDO09BRXZDLEVBQUMsZ0JBQWdCLEVBQUMsTUFBTSxnQ0FBZ0M7T0FDeEQsRUFBQyxvQkFBb0IsRUFBQyxNQUFNLHFDQUFxQztPQUNqRSxFQUFDLE1BQU0sRUFBRSxVQUFVLEVBQUMsTUFBTSxxQkFBcUI7T0FDL0MsRUFBQyxZQUFZLEVBQUMsTUFBTSw0QkFBNEI7T0FDaEQsRUFBQyxVQUFVLEVBQUMsTUFBTSwwQkFBMEI7T0FDNUMsRUFBQyxhQUFhLEVBQUMsTUFBTSw2QkFBNkI7T0FDbEQsRUFBQyxRQUFRLEVBQUMsTUFBTSx1QkFBdUI7T0FDdkMsRUFBQyxjQUFjLEVBQVcsV0FBVyxFQUFFLFFBQVEsRUFBQyxNQUFNLG1CQUFtQjtPQUN6RSxFQUFDLFVBQVUsRUFBQyxNQUFNLG1CQUFtQjtPQUNyQyxFQUFDLGFBQWEsRUFBQyxNQUFNLGdDQUFnQztBQUc1RDs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0dBd0JHO0FBQ0gsYUFBYSx3QkFBd0IsR0FDakMsVUFBVSxDQUFDLElBQUksV0FBVyxDQUFDLHdCQUF3QixDQUFDLENBQUMsQ0FBQztBQUUxRDs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0dBcUJHO0FBQ0gsYUFBYSxpQkFBaUIsR0FBVSxVQUFVLENBQUMsQ0FBQyxZQUFZLEVBQUUsVUFBVSxDQUFDLENBQUMsQ0FBQztBQUUvRTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7R0F1Qkc7QUFDSCxhQUFhLGdCQUFnQixHQUFVLFVBQVUsQ0FBQztJQUNoRCxhQUFhO0lBQ2IsVUFBVSxDQUFDLElBQUksUUFBUSxDQUFDLGdCQUFnQixFQUFFLEVBQUMsUUFBUSxFQUFFLG9CQUFvQixFQUFDLENBQUMsQ0FBQztJQUM1RSxRQUFRO0lBQ1IsVUFBVSxDQUFDLElBQUksUUFBUSxDQUNuQixNQUFNLEVBQ047UUFDRSxVQUFVLEVBQUUsYUFBYTtRQUN6QixJQUFJLEVBQUUsVUFBVSxDQUFDLENBQUMsYUFBYSxFQUFFLFFBQVEsRUFBRSx3QkFBd0IsRUFBRSxjQUFjLENBQUMsQ0FBQztLQUN0RixDQUFDLENBQUM7SUFDUCxVQUFVLENBQUMsSUFBSSxRQUFRLENBQ25CLHdCQUF3QixFQUN4QixFQUFDLFVBQVUsRUFBRSw2QkFBNkIsRUFBRSxJQUFJLEVBQUUsVUFBVSxDQUFDLENBQUMsY0FBYyxDQUFDLENBQUMsRUFBQyxDQUFDLENBQUM7Q0FDdEYsQ0FBQyxDQUFDO0FBRUg7O0dBRUc7QUFDSCxhQUFhLGVBQWUsR0FBRyxnQkFBZ0IsQ0FBQztBQUVoRCx1QkFBdUIsUUFBUSxFQUFFLFFBQVEsRUFBRSxnQkFBZ0IsRUFBRSxNQUFNO0lBQ2pFQSxJQUFJQSxVQUFVQSxHQUFHQSxJQUFJQSxVQUFVQSxDQUFDQSxRQUFRQSxFQUFFQSxRQUFRQSxFQUFFQSxnQkFBZ0JBLENBQUNBLENBQUNBO0lBQ3RFQSxNQUFNQSxDQUFDQSx1QkFBdUJBLENBQUNBLE1BQU1BLFVBQVVBLENBQUNBLE9BQU9BLEVBQUVBLENBQUNBLENBQUNBO0lBQzNEQSxNQUFNQSxDQUFDQSxVQUFVQSxDQUFDQTtBQUNwQkEsQ0FBQ0E7QUFFRCx1Q0FBdUMsR0FBRztJQUN4Q0MsRUFBRUEsQ0FBQ0EsQ0FBQ0EsR0FBR0EsQ0FBQ0EsY0FBY0EsQ0FBQ0EsTUFBTUEsSUFBSUEsQ0FBQ0EsQ0FBQ0EsQ0FBQ0EsQ0FBQ0E7UUFDbkNBLE1BQU1BLElBQUlBLGFBQWFBLENBQUNBLDJEQUEyREEsQ0FBQ0EsQ0FBQ0E7SUFDdkZBLENBQUNBO0lBQ0RBLE1BQU1BLENBQUNBLEdBQUdBLENBQUNBLGNBQWNBLENBQUNBLENBQUNBLENBQUNBLENBQUNBO0FBQy9CQSxDQUFDQSIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQG1vZHVsZVxuICogQGRlc2NyaXB0aW9uXG4gKiBNYXBzIGFwcGxpY2F0aW9uIFVSTHMgaW50byBhcHBsaWNhdGlvbiBzdGF0ZXMsIHRvIHN1cHBvcnQgZGVlcC1saW5raW5nIGFuZCBuYXZpZ2F0aW9uLlxuICovXG5cbmV4cG9ydCB7Um91dGVyfSBmcm9tICcuL3NyYy9yb3V0ZXIvcm91dGVyJztcbmV4cG9ydCB7Um91dGVyT3V0bGV0fSBmcm9tICcuL3NyYy9yb3V0ZXIvcm91dGVyX291dGxldCc7XG5leHBvcnQge1JvdXRlckxpbmt9IGZyb20gJy4vc3JjL3JvdXRlci9yb3V0ZXJfbGluayc7XG5leHBvcnQge1JvdXRlUGFyYW1zLCBSb3V0ZURhdGF9IGZyb20gJy4vc3JjL3JvdXRlci9pbnN0cnVjdGlvbic7XG5leHBvcnQge1JvdXRlUmVnaXN0cnl9IGZyb20gJy4vc3JjL3JvdXRlci9yb3V0ZV9yZWdpc3RyeSc7XG5leHBvcnQge0xvY2F0aW9uU3RyYXRlZ3ksIEFQUF9CQVNFX0hSRUZ9IGZyb20gJy4vc3JjL3JvdXRlci9sb2NhdGlvbl9zdHJhdGVneSc7XG5leHBvcnQge0hhc2hMb2NhdGlvblN0cmF0ZWd5fSBmcm9tICcuL3NyYy9yb3V0ZXIvaGFzaF9sb2NhdGlvbl9zdHJhdGVneSc7XG5leHBvcnQge1BhdGhMb2NhdGlvblN0cmF0ZWd5fSBmcm9tICcuL3NyYy9yb3V0ZXIvcGF0aF9sb2NhdGlvbl9zdHJhdGVneSc7XG5leHBvcnQge0xvY2F0aW9ufSBmcm9tICcuL3NyYy9yb3V0ZXIvbG9jYXRpb24nO1xuZXhwb3J0ICogZnJvbSAnLi9zcmMvcm91dGVyL3JvdXRlX2NvbmZpZ19kZWNvcmF0b3InO1xuZXhwb3J0ICogZnJvbSAnLi9zcmMvcm91dGVyL3JvdXRlX2RlZmluaXRpb24nO1xuZXhwb3J0IHtPbkFjdGl2YXRlLCBPbkRlYWN0aXZhdGUsIE9uUmV1c2UsIENhbkRlYWN0aXZhdGUsIENhblJldXNlfSBmcm9tICcuL3NyYy9yb3V0ZXIvaW50ZXJmYWNlcyc7XG5leHBvcnQge0NhbkFjdGl2YXRlfSBmcm9tICcuL3NyYy9yb3V0ZXIvbGlmZWN5Y2xlX2Fubm90YXRpb25zJztcbmV4cG9ydCB7SW5zdHJ1Y3Rpb24sIENvbXBvbmVudEluc3RydWN0aW9ufSBmcm9tICcuL3NyYy9yb3V0ZXIvaW5zdHJ1Y3Rpb24nO1xuZXhwb3J0IHtPcGFxdWVUb2tlbn0gZnJvbSAnYW5ndWxhcjIvYW5ndWxhcjInO1xuXG5pbXBvcnQge0xvY2F0aW9uU3RyYXRlZ3l9IGZyb20gJy4vc3JjL3JvdXRlci9sb2NhdGlvbl9zdHJhdGVneSc7XG5pbXBvcnQge1BhdGhMb2NhdGlvblN0cmF0ZWd5fSBmcm9tICcuL3NyYy9yb3V0ZXIvcGF0aF9sb2NhdGlvbl9zdHJhdGVneSc7XG5pbXBvcnQge1JvdXRlciwgUm9vdFJvdXRlcn0gZnJvbSAnLi9zcmMvcm91dGVyL3JvdXRlcic7XG5pbXBvcnQge1JvdXRlck91dGxldH0gZnJvbSAnLi9zcmMvcm91dGVyL3JvdXRlcl9vdXRsZXQnO1xuaW1wb3J0IHtSb3V0ZXJMaW5rfSBmcm9tICcuL3NyYy9yb3V0ZXIvcm91dGVyX2xpbmsnO1xuaW1wb3J0IHtSb3V0ZVJlZ2lzdHJ5fSBmcm9tICcuL3NyYy9yb3V0ZXIvcm91dGVfcmVnaXN0cnknO1xuaW1wb3J0IHtMb2NhdGlvbn0gZnJvbSAnLi9zcmMvcm91dGVyL2xvY2F0aW9uJztcbmltcG9ydCB7QXBwbGljYXRpb25SZWYsIHByb3ZpZGUsIE9wYXF1ZVRva2VuLCBQcm92aWRlcn0gZnJvbSAnYW5ndWxhcjIvYW5ndWxhcjInO1xuaW1wb3J0IHtDT05TVF9FWFBSfSBmcm9tICcuL3NyYy9mYWNhZGUvbGFuZyc7XG5pbXBvcnQge0Jhc2VFeGNlcHRpb259IGZyb20gJ2FuZ3VsYXIyL3NyYy9mYWNhZGUvZXhjZXB0aW9ucyc7XG5cblxuLyoqXG4gKiBUb2tlbiB1c2VkIHRvIGJpbmQgdGhlIGNvbXBvbmVudCB3aXRoIHRoZSB0b3AtbGV2ZWwge0BsaW5rIFJvdXRlQ29uZmlnfXMgZm9yIHRoZVxuICogYXBwbGljYXRpb24uXG4gKlxuICogIyMjIEV4YW1wbGUgKFtsaXZlIGRlbW9dKGh0dHA6Ly9wbG5rci5jby9lZGl0L2lSVVA4QjVPVWJ4Q1dRM0FjSURtKSlcbiAqXG4gKiBgYGBcbiAqIGltcG9ydCB7Q29tcG9uZW50fSBmcm9tICdhbmd1bGFyMi9hbmd1bGFyMic7XG4gKiBpbXBvcnQge1xuICogICBST1VURVJfRElSRUNUSVZFUyxcbiAqICAgUk9VVEVSX1BST1ZJREVSUyxcbiAqICAgUm91dGVDb25maWdcbiAqIH0gZnJvbSAnYW5ndWxhcjIvcm91dGVyJztcbiAqXG4gKiBAQ29tcG9uZW50KHtkaXJlY3RpdmVzOiBbUk9VVEVSX0RJUkVDVElWRVNdfSlcbiAqIEBSb3V0ZUNvbmZpZyhbXG4gKiAgey4uLn0sXG4gKiBdKVxuICogY2xhc3MgQXBwQ21wIHtcbiAqICAgLy8gLi4uXG4gKiB9XG4gKlxuICogYm9vdHN0cmFwKEFwcENtcCwgW1JPVVRFUl9QUk9WSURFUlNdKTtcbiAqIGBgYFxuICovXG5leHBvcnQgY29uc3QgUk9VVEVSX1BSSU1BUllfQ09NUE9ORU5UOiBPcGFxdWVUb2tlbiA9XG4gICAgQ09OU1RfRVhQUihuZXcgT3BhcXVlVG9rZW4oJ1JvdXRlclByaW1hcnlDb21wb25lbnQnKSk7XG5cbi8qKlxuICogQSBsaXN0IG9mIGRpcmVjdGl2ZXMuIFRvIHVzZSB0aGUgcm91dGVyIGRpcmVjdGl2ZXMgbGlrZSB7QGxpbmsgUm91dGVyT3V0bGV0fSBhbmRcbiAqIHtAbGluayBSb3V0ZXJMaW5rfSwgYWRkIHRoaXMgdG8geW91ciBgZGlyZWN0aXZlc2AgYXJyYXkgaW4gdGhlIHtAbGluayBWaWV3fSBkZWNvcmF0b3Igb2YgeW91clxuICogY29tcG9uZW50LlxuICpcbiAqICMjIyBFeGFtcGxlIChbbGl2ZSBkZW1vXShodHRwOi8vcGxua3IuY28vZWRpdC9pUlVQOEI1T1VieENXUTNBY0lEbSkpXG4gKlxuICogYGBgXG4gKiBpbXBvcnQge0NvbXBvbmVudH0gZnJvbSAnYW5ndWxhcjIvYW5ndWxhcjInO1xuICogaW1wb3J0IHtST1VURVJfRElSRUNUSVZFUywgUk9VVEVSX1BST1ZJREVSUywgUm91dGVDb25maWd9IGZyb20gJ2FuZ3VsYXIyL3JvdXRlcic7XG4gKlxuICogQENvbXBvbmVudCh7ZGlyZWN0aXZlczogW1JPVVRFUl9ESVJFQ1RJVkVTXX0pXG4gKiBAUm91dGVDb25maWcoW1xuICogIHsuLi59LFxuICogXSlcbiAqIGNsYXNzIEFwcENtcCB7XG4gKiAgICAvLyAuLi5cbiAqIH1cbiAqXG4gKiBib290c3RyYXAoQXBwQ21wLCBbUk9VVEVSX1BST1ZJREVSU10pO1xuICogYGBgXG4gKi9cbmV4cG9ydCBjb25zdCBST1VURVJfRElSRUNUSVZFUzogYW55W10gPSBDT05TVF9FWFBSKFtSb3V0ZXJPdXRsZXQsIFJvdXRlckxpbmtdKTtcblxuLyoqXG4gKiBBIGxpc3Qgb2Yge0BsaW5rIFByb3ZpZGVyfXMuIFRvIHVzZSB0aGUgcm91dGVyLCB5b3UgbXVzdCBhZGQgdGhpcyB0byB5b3VyIGFwcGxpY2F0aW9uLlxuICpcbiAqICMjIyBFeGFtcGxlIChbbGl2ZSBkZW1vXShodHRwOi8vcGxua3IuY28vZWRpdC9pUlVQOEI1T1VieENXUTNBY0lEbSkpXG4gKlxuICogYGBgXG4gKiBpbXBvcnQge0NvbXBvbmVudH0gZnJvbSAnYW5ndWxhcjIvYW5ndWxhcjInO1xuICogaW1wb3J0IHtcbiAqICAgUk9VVEVSX0RJUkVDVElWRVMsXG4gKiAgIFJPVVRFUl9QUk9WSURFUlMsXG4gKiAgIFJvdXRlQ29uZmlnXG4gKiB9IGZyb20gJ2FuZ3VsYXIyL3JvdXRlcic7XG4gKlxuICogQENvbXBvbmVudCh7ZGlyZWN0aXZlczogW1JPVVRFUl9ESVJFQ1RJVkVTXX0pXG4gKiBAUm91dGVDb25maWcoW1xuICogIHsuLi59LFxuICogXSlcbiAqIGNsYXNzIEFwcENtcCB7XG4gKiAgIC8vIC4uLlxuICogfVxuICpcbiAqIGJvb3RzdHJhcChBcHBDbXAsIFtST1VURVJfUFJPVklERVJTXSk7XG4gKiBgYGBcbiAqL1xuZXhwb3J0IGNvbnN0IFJPVVRFUl9QUk9WSURFUlM6IGFueVtdID0gQ09OU1RfRVhQUihbXG4gIFJvdXRlUmVnaXN0cnksXG4gIENPTlNUX0VYUFIobmV3IFByb3ZpZGVyKExvY2F0aW9uU3RyYXRlZ3ksIHt1c2VDbGFzczogUGF0aExvY2F0aW9uU3RyYXRlZ3l9KSksXG4gIExvY2F0aW9uLFxuICBDT05TVF9FWFBSKG5ldyBQcm92aWRlcihcbiAgICAgIFJvdXRlcixcbiAgICAgIHtcbiAgICAgICAgdXNlRmFjdG9yeTogcm91dGVyRmFjdG9yeSxcbiAgICAgICAgZGVwczogQ09OU1RfRVhQUihbUm91dGVSZWdpc3RyeSwgTG9jYXRpb24sIFJPVVRFUl9QUklNQVJZX0NPTVBPTkVOVCwgQXBwbGljYXRpb25SZWZdKVxuICAgICAgfSkpLFxuICBDT05TVF9FWFBSKG5ldyBQcm92aWRlcihcbiAgICAgIFJPVVRFUl9QUklNQVJZX0NPTVBPTkVOVCxcbiAgICAgIHt1c2VGYWN0b3J5OiByb3V0ZXJQcmltYXJ5Q29tcG9uZW50RmFjdG9yeSwgZGVwczogQ09OU1RfRVhQUihbQXBwbGljYXRpb25SZWZdKX0pKVxuXSk7XG5cbi8qKlxuICogQGRlcHJlY2F0ZWRcbiAqL1xuZXhwb3J0IGNvbnN0IFJPVVRFUl9CSU5ESU5HUyA9IFJPVVRFUl9QUk9WSURFUlM7XG5cbmZ1bmN0aW9uIHJvdXRlckZhY3RvcnkocmVnaXN0cnksIGxvY2F0aW9uLCBwcmltYXJ5Q29tcG9uZW50LCBhcHBSZWYpIHtcbiAgdmFyIHJvb3RSb3V0ZXIgPSBuZXcgUm9vdFJvdXRlcihyZWdpc3RyeSwgbG9jYXRpb24sIHByaW1hcnlDb21wb25lbnQpO1xuICBhcHBSZWYucmVnaXN0ZXJEaXNwb3NlTGlzdGVuZXIoKCkgPT4gcm9vdFJvdXRlci5kaXNwb3NlKCkpO1xuICByZXR1cm4gcm9vdFJvdXRlcjtcbn1cblxuZnVuY3Rpb24gcm91dGVyUHJpbWFyeUNvbXBvbmVudEZhY3RvcnkoYXBwKSB7XG4gIGlmIChhcHAuY29tcG9uZW50VHlwZXMubGVuZ3RoID09IDApIHtcbiAgICB0aHJvdyBuZXcgQmFzZUV4Y2VwdGlvbihcIkJvb3RzdHJhcCBhdCBsZWFzdCBvbmUgY29tcG9uZW50IGJlZm9yZSBpbmplY3RpbmcgUm91dGVyLlwiKTtcbiAgfVxuICByZXR1cm4gYXBwLmNvbXBvbmVudFR5cGVzWzBdO1xufVxuIl19