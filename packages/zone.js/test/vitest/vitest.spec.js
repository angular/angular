require('../../../../dist/bin/packages/zone.js/npm_package/bundles/zone.umd.js');
require('../../../../dist/bin/packages/zone.js/npm_package/bundles/zone-testing.umd.js');

import {expect, test} from 'vitest';

const {tick, fakeAsyncAllowNewProxyZone} = Zone[Zone.__symbol__('fakeAsyncTest')];

test(
  'can use fakeAsync in the test body',
  fakeAsyncAllowNewProxyZone(() => {
    let x = 1;
    setTimeout(() => void (x = 2), 5000);
    tick(5000);
    expect(x).toBe(2);
  }),
);
