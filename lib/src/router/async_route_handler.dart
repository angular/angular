library angular2.src.router.async_route_handler;

import "route_handler.dart" show RouteHandler;
import "package:angular2/src/facade/async.dart" show Future, PromiseWrapper;
import "package:angular2/src/facade/lang.dart" show isPresent, Type;

class AsyncRouteHandler implements RouteHandler {
  Function _loader;
  Map<String, dynamic> data;
  /** @internal */
  Future<dynamic> _resolvedComponent = null;
  Type componentType;
  AsyncRouteHandler(this._loader, [this.data]) {}
  Future<dynamic> resolveComponentType() {
    if (isPresent(this._resolvedComponent)) {
      return this._resolvedComponent;
    }
    return this._resolvedComponent = this._loader().then((componentType) {
      this.componentType = componentType;
      return componentType;
    });
  }
}
