library angular2.test.router.integration.async_route_spec;

import "util.dart"
    show
        describeRouter,
        ddescribeRouter,
        describeWith,
        describeWithout,
        describeWithAndWithout,
        itShouldRoute;
import "impl/async_route_spec_impl.dart" show registerSpecs;

main() {
  registerSpecs();
  ddescribeRouter("async routes", () {
    describeWithout("children", () {
      describeWith("route data", itShouldRoute);
      describeWithAndWithout("params", itShouldRoute);
    });
    describeWith("sync children", () {
      describeWithAndWithout("default routes", itShouldRoute);
    });
    describeWith("async children", () {
      describeWithAndWithout("params", () {
        describeWithout("default routes", itShouldRoute);
      });
    });
  });
}
