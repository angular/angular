library angular2.src.router.lifecycle_annotations_impl;

class RouteLifecycleHook {
  final String name;
  const RouteLifecycleHook(this.name);
}

class CanActivate {
  final Function fn;
  const CanActivate(this.fn);
}

const RouteLifecycleHook canReuse = const RouteLifecycleHook("canReuse");
const RouteLifecycleHook canDeactivate =
    const RouteLifecycleHook("canDeactivate");
const RouteLifecycleHook onActivate = const RouteLifecycleHook("onActivate");
const RouteLifecycleHook onReuse = const RouteLifecycleHook("onReuse");
const RouteLifecycleHook onDeactivate =
    const RouteLifecycleHook("onDeactivate");
