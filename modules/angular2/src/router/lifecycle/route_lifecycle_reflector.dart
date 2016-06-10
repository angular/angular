library angular.router.route_lifecycle_reflector;

import 'package:angular2/src/router/lifecycle/lifecycle_annotations_impl.dart';
import 'package:angular2/src/router/interfaces.dart';

bool hasLifecycleHook(RouteLifecycleHook e, instance) {
  if (e == routerOnActivate) {
    return instance is OnActivate;
  } else if (e == routerOnDeactivate) {
    return instance is OnDeactivate;
  } else if (e == routerOnReuse) {
    return instance is OnReuse;
  } else if (e == routerCanDeactivate) {
    return instance is CanDeactivate;
  } else if (e == routerCanReuse) {
    return instance is CanReuse;
  }
  return false;
}
