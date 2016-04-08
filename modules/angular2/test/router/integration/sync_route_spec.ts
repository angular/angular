import {describeRouter, ddescribeRouter, describeWith, describeWithout, describeWithAndWithout, itShouldRoute, TEST_ROUTER_PROVIDERS} from './util';

import {beforeEachProviders, describe, ddescribe} from 'angular2/testing_internal';

import {registerSpecs} from './impl/sync_route_spec_impl';

export function main() {
  describe('sync route spec', () => {

    beforeEachProviders(() => TEST_ROUTER_PROVIDERS);

    registerSpecs();

    describeRouter('sync routes', () => {
      describeWithout('children', () => { describeWithAndWithout('params', itShouldRoute); });

      describeWith('sync children', () => {
        describeWithout(
            'default routes', () => { describeWithAndWithout('params', itShouldRoute); });
        describeWith('default routes', () => { describeWithout('params', itShouldRoute); });

      });

      describeWith('dynamic components', itShouldRoute);
    });

  });
}
