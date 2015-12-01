library angular2.src.router.lifecycle_annotations_impl;

class RouteLifecycleHook {
  final String name;
  const RouteLifecycleHook(this.name);
}

class CanActivate {
  final Function fn;
  const CanActivate(this.fn);
}

const RouteLifecycleHook routerCanReuse =
    const RouteLifecycleHook("routerCanReuse");
const RouteLifecycleHook routerCanDeactivate =
    const RouteLifecycleHook("routerCanDeactivate");
const RouteLifecycleHook routerOnActivate =
    const RouteLifecycleHook("routerOnActivate");
const RouteLifecycleHook routerOnReuse =
    const RouteLifecycleHook("routerOnReuse");
const RouteLifecycleHook routerOnDeactivate =
    const RouteLifecycleHook("routerOnDeactivate");
