library angular2.test.router.integration.auxiliary_route_spec;

import "util.dart"
    show
        describeRouter,
        ddescribeRouter,
        describeWith,
        describeWithout,
        describeWithAndWithout,
        itShouldRoute;
import "impl/aux_route_spec_impl.dart" show registerSpecs;

main() {
  registerSpecs();
  describeRouter("aux routes", () {
    itShouldRoute();
    describeWith("a primary route", itShouldRoute);
  });
}
