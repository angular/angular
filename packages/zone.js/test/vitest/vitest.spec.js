require('../../../../dist/bin/packages/zone.js/npm_package/bundles/zone.umd.js');
require('../../../../dist/bin/packages/zone.js/npm_package/bundles/zone-testing.umd.js');

import {expect, test, describe, beforeEach} from 'vitest';

const {tick, fakeAsyncWithAutoProxy, withAutoProxy, fakeAsync} = Zone[Zone.__symbol__('fakeAsyncTest')];

test(
  'can use fakeAsync in the test body',
  fakeAsyncWithAutoProxy(() => {
    let x = 1;
    setTimeout(() => void (x = 2), 5000);
    tick(5000);
    expect(x).toBe(2);
  }),
);
function assertInsideProxyZone() {
  expect(Zone.current.name).toEqual('ProxyZone');
}

describe('can use withAutoProxy and beforeEach', () => {
  let forkedZoneInBeforeEach;
  let syncZone;
  beforeEach(withAutoProxy(() => {
    assertInsideProxyZone();
        const SyncTestZoneSpec = Zone['SyncTestZoneSpec'];
    syncZone = Zone.current.fork(new SyncTestZoneSpec('jest.describe'));
  }));

  test('withAutoProxy(fakeAsync)', withAutoProxy(fakeAsync(() => {
    let x = 1;
    syncZone.run(() => {
    setTimeout(() => void (x = 2), 5000);
    });
    tick(5000);
    expect(x).toBe(2);
    assertInsideProxyZone();
  })));

  test('fakeAsync.withAutoProxy', fakeAsyncWithAutoProxy(() => {
    assertInsideProxyZone();
  }));
});
