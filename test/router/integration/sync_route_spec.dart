library angular2.test.router.integration.sync_route_spec;

import "util.dart"
    show
        describeRouter,
        ddescribeRouter,
        describeWith,
        describeWithout,
        describeWithAndWithout,
        itShouldRoute;
import "impl/sync_route_spec_impl.dart" show registerSpecs;

main() {
  registerSpecs();
  describeRouter("sync routes", () {
    describeWithout("children", () {
      describeWithAndWithout("params", itShouldRoute);
    });
    describeWith("sync children", () {
      describeWithout("default routes", () {
        describeWithAndWithout("params", itShouldRoute);
      });
      describeWith("default routes", () {
        describeWithout("params", itShouldRoute);
      });
    });
  });
}
