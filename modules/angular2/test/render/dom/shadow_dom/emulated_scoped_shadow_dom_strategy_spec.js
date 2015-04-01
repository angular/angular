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

import {isPresent, isBlank} from 'angular2/src/facade/lang';
import {DOM} from 'angular2/src/dom/dom_adapter';
import {Map, MapWrapper} from 'angular2/src/facade/collection';
import {PromiseWrapper, Promise} from 'angular2/src/facade/async';

import {XHR} from 'angular2/src/services/xhr';

import {
  EmulatedScopedShadowDomStrategy,
} from 'angular2/src/render/dom/shadow_dom/emulated_scoped_shadow_dom_strategy';
import {
  resetShadowDomCache,
} from 'angular2/src/render/dom/shadow_dom/util';
import {UrlResolver} from 'angular2/src/services/url_resolver';
import {StyleUrlResolver} from 'angular2/src/render/dom/shadow_dom/style_url_resolver';
import {StyleInliner} from 'angular2/src/render/dom/shadow_dom/style_inliner';
import {View} from 'angular2/src/render/dom/view/view';

export function main() {
  describe('EmulatedScoped', () => {
    var xhr, styleHost, strategy;

    beforeEach(() => {
      var urlResolver = new UrlResolver();
      var styleUrlResolver = new StyleUrlResolver(urlResolver);
      xhr = new FakeXHR();
      var styleInliner = new StyleInliner(xhr, styleUrlResolver, urlResolver);
      styleHost = el('<div></div>');
      strategy = new EmulatedScopedShadowDomStrategy(styleInliner, styleUrlResolver, styleHost);
      resetShadowDomCache();
    });

    it('should attach the view nodes as child of the host element', () => {
      var host = el('<div><span>original content</span></div>');
      var nodes = el('<div>view</div>');
      var view = new View(null, [nodes], [], [], [], []);

      strategy.attachTemplate(host, view);
      var firstChild = DOM.firstChild(host);
      expect(DOM.tagName(firstChild).toLowerCase()).toEqual('div');
      expect(firstChild).toHaveText('view');
      expect(host).toHaveText('view');
    });

    it('should rewrite style urls', () => {
      var styleElement = el('<style>.foo {background-image: url("img.jpg");}</style>');
      strategy.processStyleElement('someComponent', 'http://base', styleElement);
      expect(styleElement).toHaveText(".foo[_ngcontent-0] {\n" +
        "background-image: url(http://base/img.jpg);\n" +
        "}");
    });

    it('should scope styles', () => {
      var styleElement = el('<style>.foo {} :host {}</style>');
      strategy.processStyleElement('someComponent', 'http://base', styleElement);
      expect(styleElement).toHaveText(".foo[_ngcontent-0] {\n\n}\n\n[_nghost-0] {\n\n}");
    });

    it('should inline @import rules', inject([AsyncTestCompleter], (async) => {
      xhr.reply('http://base/one.css', '.one {}');

      var styleElement = el('<style>@import "one.css";</style>');
      var stylePromise = strategy.processStyleElement('someComponent', 'http://base', styleElement);
      expect(stylePromise).toBePromise();
      expect(styleElement).toHaveText('');

      stylePromise.then((_) => {
        expect(styleElement).toHaveText('.one[_ngcontent-0] {\n\n}');
        async.done();
      });
    }));

    it('should return the same style given the same component', () => {
      var styleElement = el('<style>.foo {} :host {}</style>');
      strategy.processStyleElement('someComponent', 'http://base', styleElement);

      var styleElement2 = el('<style>.foo {} :host {}</style>');
      strategy.processStyleElement('someComponent', 'http://base', styleElement2);

      expect(DOM.getText(styleElement)).toEqual(DOM.getText(styleElement2));
    });

    it('should return different styles given different components', () => {
      var styleElement = el('<style>.foo {} :host {}</style>');
      strategy.processStyleElement('someComponent1', 'http://base', styleElement);

      var styleElement2 = el('<style>.foo {} :host {}</style>');
      strategy.processStyleElement('someComponent2', 'http://base', styleElement2);

      expect(DOM.getText(styleElement)).not.toEqual(DOM.getText(styleElement2));
    });

    it('should move the style element to the style host', () => {
      var compileElement = el('<div><style>.one {}</style></div>');
      var styleElement = DOM.firstChild(compileElement);
      strategy.processStyleElement('someComponent', 'http://base', styleElement);

      expect(compileElement).toHaveText('');
      expect(styleHost).toHaveText('.one[_ngcontent-0] {\n\n}');
    });

    it('should add an attribute to component elements', () => {
      var element = el('<div></div>');
      strategy.processElement(null, 'elComponent', element);
      expect(DOM.getAttribute(element, '_nghost-0')).toEqual('');
    });

    it('should add an attribute to the content elements', () => {
      var element = el('<div></div>');
      strategy.processElement('hostComponent', null, element);
      expect(DOM.getAttribute(element, '_ngcontent-0')).toEqual('');
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
