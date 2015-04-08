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
  SpyObject,
} from 'angular2/test_lib';

import {
  NativeShadowDomStrategy,
  EmulatedScopedShadowDomStrategy,
  EmulatedUnscopedShadowDomStrategy
} from 'angular2/src/core/compiler/shadow_dom_strategy';
import {UrlResolver} from 'angular2/src/services/url_resolver';
import {StyleUrlResolver} from 'angular2/src/render/dom/shadow_dom/style_url_resolver';
import {StyleInliner} from 'angular2/src/render/dom/shadow_dom/style_inliner';
import {ProtoView} from 'angular2/src/core/compiler/view';

import {XHR} from 'angular2/src/services/xhr';

import {isPresent, isBlank} from 'angular2/src/facade/lang';
import {DOM} from 'angular2/src/dom/dom_adapter';
import {Map, MapWrapper} from 'angular2/src/facade/collection';
import {PromiseWrapper, Promise} from 'angular2/src/facade/async';

import {DynamicProtoChangeDetector} from 'angular2/change_detection';

export function main() {
  var strategy;

  describe('NativeShadowDomStratgey', () => {
    beforeEach(() => {
      var urlResolver = new UrlResolver();
      var styleUrlResolver = new StyleUrlResolver(urlResolver);
      strategy = new NativeShadowDomStrategy(styleUrlResolver);
    });

    it('should attach the view nodes to the shadow root', () => {
      var host = el('<div></div>');
      var nodes = el('<div>view</div>');
      var pv = new ProtoView(null, nodes, new DynamicProtoChangeDetector(null, null), null);
      var view = pv.instantiate(null, null);

      strategy.attachTemplate(host, view);
      var shadowRoot = DOM.getShadowRoot(host);
      expect(isPresent(shadowRoot)).toBeTruthy();
      expect(shadowRoot).toHaveText('view');
    });
  });

  describe('EmulatedScopedShadowDomStratgey', () => {
    var xhr, styleHost;

    beforeEach(() => {
      var urlResolver = new UrlResolver();
      var styleUrlResolver = new StyleUrlResolver(urlResolver);
      xhr = new FakeXHR();
      var styleInliner = new StyleInliner(xhr, styleUrlResolver, urlResolver);
      styleHost = el('<div></div>');
      strategy = new EmulatedScopedShadowDomStrategy(styleInliner, styleUrlResolver, styleHost);
    });

    it('should attach the view nodes as child of the host element', () => {
      var host = el('<div><span>original content</span></div>');
      var nodes = el('<div>view</div>');
      var pv = new ProtoView(null, nodes, new DynamicProtoChangeDetector(null, null), null);
      var view = pv.instantiate(null, null);

      strategy.attachTemplate(host, view);
      var firstChild = DOM.firstChild(host);
      expect(DOM.tagName(firstChild).toLowerCase()).toEqual('div');
      expect(firstChild).toHaveText('view');
      expect(host).toHaveText('view');
    });
  });

  describe('EmulatedUnscopedShadowDomStratgey', () => {
    var styleHost;

    beforeEach(() => {
      var urlResolver = new UrlResolver();
      var styleUrlResolver = new StyleUrlResolver(urlResolver);
      styleHost = el('<div></div>');
      strategy = new EmulatedUnscopedShadowDomStrategy(styleUrlResolver, styleHost);
    });

    it('should attach the view nodes as child of the host element', () => {
      var host = el('<div><span>original content</span></div>');
      var nodes = el('<div>view</div>');
      var pv = new ProtoView(null, nodes, new DynamicProtoChangeDetector(null, null), null);
      var view = pv.instantiate(null, null);

      strategy.attachTemplate(host, view);
      var firstChild = DOM.firstChild(host);
      expect(DOM.tagName(firstChild).toLowerCase()).toEqual('div');
      expect(firstChild).toHaveText('view');
      expect(host).toHaveText('view');
    });
  });
}

class FakeXHR extends XHR {
  _responses: Map;

  constructor() {
    super();
    this._responses = MapWrapper.create();
  }

  get(url: string): Promise<string> {
    var response = MapWrapper.get(this._responses, url);
    if (isBlank(response)) {
      return PromiseWrapper.reject('xhr error');
    }

    return PromiseWrapper.resolve(response);
  }

  reply(url: string, response: string) {
    MapWrapper.set(this._responses, url, response);
  }
}

class SomeComponent {}
class SomeOtherComponent {}
