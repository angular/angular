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
import {UrlResolver} from 'angular2/src/services/url_resolver';
import {StyleUrlResolver} from 'angular2/src/render/dom/shadow_dom/style_url_resolver';

import {DOM} from 'angular2/src/dom/dom_adapter';

export function main() {
  var strategy;

  describe('NativeShadowDomStrategy', () => {
    beforeEach(() => {
      var urlResolver = new UrlResolver();
      var styleUrlResolver = new StyleUrlResolver(urlResolver);
      strategy = new NativeShadowDomStrategy(styleUrlResolver);
    });

    if (DOM.supportsNativeShadowDOM()) {
      it('should use the native shadow root', () => {
        var host = el('<div><span>original content</span></div>');
        expect(strategy.prepareShadowRoot(host)).toBe(DOM.getShadowRoot(host));
      });
    }

    it('should rewrite style urls', () => {
      var styleElement = el('<style>.foo {background-image: url("img.jpg");}</style>');
      strategy.processStyleElement('someComponent', 'http://base', styleElement);
      expect(styleElement)
          .toHaveText(".foo {" + "background-image: url('http://base/img.jpg');" + "}");
    });

    it('should not inline import rules', () => {
      var styleElement = el('<style>@import "other.css";</style>');
      strategy.processStyleElement('someComponent', 'http://base', styleElement);
      expect(styleElement).toHaveText("@import 'http://base/other.css';");
    });
  });
}
