library angular2.src.router.sync_route_handler;

import "route_handler.dart" show RouteHandler;
import "package:angular2/src/facade/async.dart" show Future, PromiseWrapper;
import "package:angular2/src/facade/lang.dart" show Type;

class SyncRouteHandler implements RouteHandler {
  Type componentType;
  Map<String, dynamic> data;
  /** @internal */
  Future<dynamic> _resolvedComponent = null;
  SyncRouteHandler(this.componentType, [this.data]) {
    this._resolvedComponent = PromiseWrapper.resolve(componentType);
  }
  Future<dynamic> resolveComponentType() {
    return this._resolvedComponent;
  }
}
