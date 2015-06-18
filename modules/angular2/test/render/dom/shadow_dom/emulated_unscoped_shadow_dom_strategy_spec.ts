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

import {DOM} from 'angular2/src/dom/dom_adapter';
import {Map, MapWrapper, ListWrapper} from 'angular2/src/facade/collection';

import {
  EmulatedUnscopedShadowDomStrategy,
} from 'angular2/src/render/dom/shadow_dom/emulated_unscoped_shadow_dom_strategy';
import {
  resetShadowDomCache,
} from 'angular2/src/render/dom/shadow_dom/util';
import {UrlResolver} from 'angular2/src/services/url_resolver';
import {StyleUrlResolver} from 'angular2/src/render/dom/shadow_dom/style_url_resolver';
import {StyleInliner} from 'angular2/src/render/dom/shadow_dom/style_inliner';

import {isBlank} from 'angular2/src/facade/lang';
import {PromiseWrapper, Promise} from 'angular2/src/facade/async';

import {XHR} from 'angular2/src/render/xhr';

export function main() {
  var strategy;

  describe('EmulatedUnscopedShadowDomStrategy', () => {
    var xhr, styleHost;

    beforeEach(() => {
      var urlResolver = new UrlResolver();
      var styleUrlResolver = new StyleUrlResolver(urlResolver);
      xhr = new FakeXHR();
      var styleInliner = new StyleInliner(xhr, styleUrlResolver, urlResolver);
      styleHost = el('<div></div>');
      strategy = new EmulatedUnscopedShadowDomStrategy(styleInliner, styleUrlResolver, styleHost);
      resetShadowDomCache();
    });

    it('should use the host element as shadow root', () => {
      var host = el('<div><span>original content</span></div>');
      expect(strategy.prepareShadowRoot(host)).toBe(host);
    });

    it('should rewrite style urls', () => {
      var styleElement = el('<style>.foo {background-image: url("img.jpg");}</style>');
      strategy.processStyleElement('someComponent', 'http://base', styleElement);
      expect(styleElement).toHaveText(".foo {background-image: url('http://base/img.jpg');}");
    });

    it('should inline @import rules', inject([AsyncTestCompleter], (async) => {
         xhr.reply('http://base/one.css', '.one {}');

         var styleElement = el('<style>@import "one.css";</style>');
         var stylePromise =
             strategy.processStyleElement('someComponent', 'http://base', styleElement);
         expect(stylePromise).toBePromise();
         expect(styleElement).toHaveText('');

         stylePromise.then((_) => {
           expect(styleElement).toHaveText('.one {}\n');
           async.done();
         });
       }));

    it('should move the style element to the style host', () => {
      var compileElement = el('<div><style>.one {}</style></div>');
      var styleElement = DOM.firstChild(compileElement);
      strategy.processStyleElement('someComponent', 'http://base', styleElement);

      expect(compileElement).toHaveText('');
      expect(styleHost).toHaveText('.one {}');
    });

    it('should insert the same style only once in the style host', () => {
      var styleEls = [
        el('<style>/*css1*/</style>'),
        el('<style>/*css2*/</style>'),
        el('<style>/*css1*/</style>')
      ];
      ListWrapper.forEach(styleEls, (styleEl) => {
        strategy.processStyleElement('someComponent', 'http://base', styleEl);
      });

      expect(styleHost).toHaveText("/*css1*//*css2*/");
    });

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
