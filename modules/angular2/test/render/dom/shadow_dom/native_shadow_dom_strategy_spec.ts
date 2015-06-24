import {
  AsyncTestCompleter,
  beforeEach,
  ddescribe,
  describe,
  el,
  expect,
  iit,
  inject,
  it,
  xit,
  SpyObject,
} from 'angular2/test_lib';

import {
  NativeShadowDomStrategy
} from 'angular2/src/render/dom/shadow_dom/native_shadow_dom_strategy';

export function main() {
  var strategy: NativeShadowDomStrategy;

  describe('NativeShadowDomStrategy', () => {
    beforeEach(() => { strategy = new NativeShadowDomStrategy(); });

    it('should report that this is the native strategy',
       () => { expect(strategy.hasNativeContentElement()).toBe(true); });
  });
}
