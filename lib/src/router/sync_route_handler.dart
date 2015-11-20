library angular2.src.router.sync_route_handler;

import "package:angular2/src/facade/async.dart" show Future, PromiseWrapper;
import "package:angular2/src/facade/lang.dart" show isPresent, Type;
import "route_handler.dart" show RouteHandler;
import "instruction.dart" show RouteData, BLANK_ROUTE_DATA;

class SyncRouteHandler implements RouteHandler {
  Type componentType;
  RouteData data;
  /** @internal */
  Future<dynamic> _resolvedComponent = null;
  SyncRouteHandler(this.componentType, [Map<String, dynamic> data]) {
    this._resolvedComponent = PromiseWrapper.resolve(componentType);
    this.data = isPresent(data) ? new RouteData(data) : BLANK_ROUTE_DATA;
  }
  Future<dynamic> resolveComponentType() {
    return this._resolvedComponent;
  }
}
