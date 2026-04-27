require('../../../../dist/bin/packages/zone.js/npm_package/bundles/zone.umd.js');
require('../../../../dist/bin/packages/zone.js/npm_package/bundles/zone-testing.umd.js');

// Apply the Vitest patch (i.e. `patchVitest`).
require('../../../../dist/bin/packages/zone.js/npm_package/bundles/vitest-patch.umd.js');

const {fakeAsync, tick} = Zone[Zone.__symbol__('fakeAsyncTest')];

describe('patchVitest `describe`', () => {
  test('verify that the patch is installed', () => {
    expect(globalThis['vitest']['__zone_patch__']).toBe(true);
  });

  // Expect `beforeEach` to be patched and working with `fakeAsync`.
  beforeEach(fakeAsync(() => {
    expect(createAsyncTesterFlag()).toBe(true);
  }));

  // Expect `afterEach` to be patched and working with `fakeAsync`.
  afterEach(fakeAsync(() => {
    expect(createAsyncTesterFlag()).toBe(true);
  }));

  // Expect `beforeAll` to be patched and working with `fakeAsync`.
  beforeAll(fakeAsync(() => {
    expect(createAsyncTesterFlag()).toBe(true);
  }));

  // Expect `afterAll` to be patched and working with `fakeAsync`.
  afterAll(fakeAsync(() => {
    expect(createAsyncTesterFlag()).toBe(true);
  }));

  it('expect `it` to be patched and working with `fakeAsync`', fakeAsync(() => {
    expect(createAsyncTesterFlag()).toBe(true);
  }));

  test('expect `it` to be patched and working with `fakeAsync`', fakeAsync(() => {
    expect(createAsyncTesterFlag()).toBe(true);
  }));
});

suite('patchVitest `suite`', () => {
  it('should work with a patched `suite`', fakeAsync(() => {
    expect(createAsyncTesterFlag()).toBe(true);
  }));
});

function createAsyncTesterFlag() {
  let flag = false;
  setTimeout(() => {
    flag = true;
  }, 100);

  tick(110);

  return flag;
}
