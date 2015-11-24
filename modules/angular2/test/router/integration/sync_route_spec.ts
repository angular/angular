import {
  describeRouter,
  ddescribeRouter,
  describeWith,
  describeWithout,
  describeWithAndWithout,
  itShouldRoute
} from './util';

import {registerSpecs} from './impl/sync_route_spec_impl';

export function main() {
  registerSpecs();

  describeRouter('sync routes', () => {
    describeWithout('children', () => { describeWithAndWithout('params', itShouldRoute); });

    describeWith('sync children', () => {
      describeWithout('default routes', () => { describeWithAndWithout('params', itShouldRoute); });
      describeWith('default routes', () => { describeWithout('params', itShouldRoute); });

    });
  });
}
