import {
  describeRouter,
  ddescribeRouter,
  describeWith,
  describeWithout,
  describeWithAndWithout,
  itShouldRoute
} from './util';

import {registerSpecs} from './impl/async_route_spec_impl';

export function main() {
  registerSpecs();

  describeRouter('async routes', () => {
    describeWithout('children', () => {
      describeWith('route data', itShouldRoute);
      describeWithAndWithout('params', itShouldRoute);
    });

    describeWith('sync children',
                 () => { describeWithAndWithout('default routes', itShouldRoute); });

    describeWith('async children', () => {
      describeWithAndWithout('params', () => { describeWithout('default routes', itShouldRoute); });
    });
  });
}
