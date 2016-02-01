import {
  describeRouter,
  ddescribeRouter,
  describeWith,
  describeWithout,
  describeWithAndWithout,
  itShouldRoute
} from './util';

import {registerSpecs} from './impl/aux_route_spec_impl';

export function main() {
  registerSpecs();

  describeRouter('aux routes', () => {
    itShouldRoute();
    describeWith('a primary route', itShouldRoute);
  });
}
