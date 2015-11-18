library angular.router.route_lifecycle_reflector;

import 'package:angular2/src/router/lifecycle_annotations_impl.dart';
import 'package:angular2/src/router/interfaces.dart';
import 'package:angular2/src/core/reflection/reflection.dart';

bool hasLifecycleHook(RouteLifecycleHook e, type) {
  if (type is! Type) return false;

  final List interfaces = reflector.interfaces(type);
  var interface;

  if (e == onActivate) {
    interface = OnActivate;
  } else if (e == onDeactivate) {
    interface = OnDeactivate;
  } else if (e == onReuse) {
    interface = OnReuse;
  } else if (e == canDeactivate) {
    interface = CanDeactivate;
  } else if (e == canReuse) {
    interface = CanReuse;
  }

  return interfaces.contains(interface);
}

Function getCanActivateHook(type) {
  final List annotations = reflector.annotations(type);

  for (var annotation in annotations) {
    if (annotation is CanActivate) {
      return annotation.fn;
    }
  }

  return null;
}
