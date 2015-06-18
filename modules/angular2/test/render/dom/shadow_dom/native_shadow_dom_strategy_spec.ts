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
import {StyleInliner} from 'angular2/src/render/dom/shadow_dom/style_inliner';

import {XHR} from 'angular2/src/render/xhr';

import {isBlank} from 'angular2/src/facade/lang';
import {PromiseWrapper, Promise} from 'angular2/src/facade/async';
import {Map, MapWrapper} from 'angular2/src/facade/collection';

import {DOM} from 'angular2/src/dom/dom_adapter';

export function main() {
  var strategy;

  describe('NativeShadowDomStrategy', () => {
    var xhr;
    beforeEach(() => {
      var urlResolver = new UrlResolver();
      var styleUrlResolver = new StyleUrlResolver(urlResolver);
      xhr = new FakeXHR();
      var styleInliner = new StyleInliner(xhr, styleUrlResolver, urlResolver);
      strategy = new NativeShadowDomStrategy(styleInliner, styleUrlResolver);
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

    it('should inline @import rules', inject([AsyncTestCompleter], (async) => {
         xhr.reply('http://base/one.css', '.one {}');

         var styleElement = el('<style>@import "one.css";</style>');
         var stylePromise =
             strategy.processStyleElement('someComponent', 'http://base', styleElement);
         expect(stylePromise).toBePromise();

         stylePromise.then((_) => {
           expect(styleElement).toHaveText('.one {}\n');
           async.done();
         });
       }));

  });
}

class FakeXHR extends XHR {
  _responses: Map<string, string>;

  constructor() {
    super();
    this._responses = MapWrapper.create();
  }

  get(url: string): Promise<string> {
    var response = MapWrapper.get(this._responses, url);
    if (isBlank(response)) {
      return PromiseWrapper.reject('xhr error', null);
    }

    return PromiseWrapper.resolve(response);
  }

  reply(url: string, response: string) { MapWrapper.set(this._responses, url, response); }
}
