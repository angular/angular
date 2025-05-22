require('../../../../dist/bin/packages/zone.js/npm_package/bundles/zone.umd.js');
require('../../../../dist/bin/packages/zone.js/npm_package/bundles/zone-testing.umd.js');

import {expect, test, describe, beforeEach} from 'vitest';

const {tick, withProxyZone, fakeAsync} = Zone[Zone.__symbol__('fakeAsyncTest')];

describe('proxy zone behavior', () => {
  const spec = new Zone['ProxyZoneSpec']();
  const proxyZone = Zone.root.fork(spec);

  function createForkedZone() {
    const AsyncTestZoneSpec = Zone['AsyncTestZoneSpec'];
    return Zone.current.fork(
      new AsyncTestZoneSpec(
        () => {},
        () => {},
        'asyncTest',
      ),
    );
  }

  test('cannot run fakeAsync outside proxy zone', () => {
    expect(fakeAsync(() => {})).toThrow();
  });

  test('can run fakeAsync inside proxy zone', () => {
    expect(() => {
      proxyZone.run(fakeAsync(() => {}));
    }).not.toThrow();
  });

  test('can flush timeouts in forked zone if created in proxy', () => {
    let forkedZone;
    proxyZone.run(() => {
      forkedZone = createForkedZone();
    });

    proxyZone.run(
      fakeAsync(() => {
        let x = 1;
        forkedZone.run(() => {
          setTimeout(() => void (x = 2), 5000);
        });

        tick(5000);
        expect(x).toBe(2);
      }),
    );
  });

  test('cannot flush timeouts in forked zone if created outside proxy', () => {
    // This test is similar to creating a component in a beforeEach, which forks the zone to create the Angular NgZone
    const forkedZone = createForkedZone();
    proxyZone.run(() => {
      fakeAsync(() => {
        let x = 1;
        forkedZone.run(() => {
          setTimeout(() => void (x = 2), 5000);
        });

        tick(5000);
        expect(x).toBe(1);
      })();
    });
  });
});

test(
  'withProxyZone runs inside proxy zone',
  withProxyZone(() => {
    expect(Zone.current.name).toEqual('ProxyZone');
  }),
);

test(
  'can use fakeAsync in proxy zone in test body',
  withProxyZone(
    fakeAsync(() => {
      let x = 1;
      setTimeout(() => void (x = 2), 5000);
      tick(5000);
      expect(x).toBe(2);
    }),
  ),
);

describe('can use withProxyZone and beforeEach', () => {
  let forkedZone;
  beforeEach(
    withProxyZone(() => {
      const AsyncTestZoneSpec = Zone['AsyncTestZoneSpec'];
      forkedZone = Zone.current.fork(
        new AsyncTestZoneSpec(
          () => {},
          () => {},
          'asyncTest',
        ),
      );
    }),
  );

  test(
    'withProxyZone(fakeAsync)',
    withProxyZone(
      fakeAsync(() => {
        let x = 1;
        forkedZone.run(() => {
          setTimeout(() => void (x = 2), 5000);
        });
        tick(5000);
        expect(x).toBe(2);
      }),
    ),
  );
});
