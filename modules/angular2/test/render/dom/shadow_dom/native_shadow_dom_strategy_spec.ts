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

import {DOM} from 'angular2/src/dom/dom_adapter';

export function main() {
  var strategy;

  describe('NativeShadowDomStrategy', () => {
    beforeEach(() => { strategy = new NativeShadowDomStrategy(); });

    if (DOM.supportsNativeShadowDOM()) {
      it('should use the native shadow root', () => {
        var host = el('<div><span>original content</span></div>');
        expect(strategy.prepareShadowRoot(host)).toBe(DOM.getShadowRoot(host));
      });
    }
  });
}
