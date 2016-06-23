/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {TEST_ROUTER_PROVIDERS, ddescribeRouter, describeRouter, describeWith, describeWithAndWithout, describeWithout, itShouldRoute} from './util';

import {beforeEachProviders, describe,} from '@angular/core/testing/testing_internal';

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
