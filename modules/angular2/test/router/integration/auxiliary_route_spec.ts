import {describeRouter, ddescribeRouter, describeWith, describeWithout, describeWithAndWithout, itShouldRoute, TEST_ROUTER_PROVIDERS} from './util';

import {beforeEachProviders, describe,} from 'angular2/testing_internal';

import {registerSpecs} from './impl/aux_route_spec_impl';

export function main() {
  describe('auxiliary route spec', () => {

    beforeEachProviders(() => TEST_ROUTER_PROVIDERS);

    registerSpecs();

    describeRouter('aux routes', () => {
      itShouldRoute();
      describeWith('a primary route', itShouldRoute);
    });
  });
}
