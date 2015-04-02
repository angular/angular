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
  EmulatedUnscopedShadowDomStrategy,
  resetShadowDomCache,
} from 'angular2/src/core/compiler/shadow_dom_strategy';
import {UrlResolver} from 'angular2/src/services/url_resolver';
import {StyleUrlResolver} from 'angular2/src/render/dom/shadow_dom/style_url_resolver';
import {StyleInliner} from 'angular2/src/render/dom/shadow_dom/style_inliner';
import {ProtoView} from 'angular2/src/core/compiler/view';
import {DirectiveMetadata} from 'angular2/src/core/compiler/directive_metadata';

import {CompileElement} from 'angular2/src/core/compiler/pipeline/compile_element';

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
      var pv = new ProtoView(nodes, new DynamicProtoChangeDetector(null, null), null);
      var view = pv.instantiate(null, null);

      strategy.attachTemplate(host, view);
      var shadowRoot = DOM.getShadowRoot(host);
      expect(isPresent(shadowRoot)).toBeTruthy();
      expect(shadowRoot).toHaveText('view');
    });

    it('should rewrite style urls', () => {
      var step = strategy.getStyleCompileStep(null, 'http://base');
      var styleElement = DOM.createStyleElement('.one {background-image: url("img.jpg");}');
      var compileElement = new CompileElement(styleElement);
      step.process(null, compileElement, null);
      expect(styleElement).toHaveText(".one {background-image: url('http://base/img.jpg');}");
    });

    it('should not inline import rules', () => {
      var step = strategy.getStyleCompileStep(null, 'http://base');
      var styleElement = DOM.createStyleElement('@import "other.css";');
      var compileElement = new CompileElement(styleElement);
      step.process(null, compileElement, null);
      expect(styleElement).toHaveText("@import 'http://base/other.css';");
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
      resetShadowDomCache();
    });

    it('should attach the view nodes as child of the host element', () => {
      var host = el('<div><span>original content</span></div>');
      var nodes = el('<div>view</div>');
      var pv = new ProtoView(nodes, new DynamicProtoChangeDetector(null, null), null);
      var view = pv.instantiate(null, null);

      strategy.attachTemplate(host, view);
      var firstChild = DOM.firstChild(host);
      expect(DOM.tagName(firstChild).toLowerCase()).toEqual('div');
      expect(firstChild).toHaveText('view');
      expect(host).toHaveText('view');
    });

    it('should rewrite style urls', () => {
      var template = el('<div><style>.foo {background-image: url("img.jpg");}</style></div>');
      var cmpMetadata = new DirectiveMetadata(SomeComponent, null);
      var step = strategy.getStyleCompileStep(cmpMetadata, 'http://base');
      var styleElement = DOM.firstChild(template);
      var compileElement = new CompileElement(styleElement);
      step.process(null, compileElement, null);
      expect(styleElement).toHaveText(".foo[_ngcontent-0] {\n" +
        "background-image: url(http://base/img.jpg);\n" +
        "}");
    });

    it('should scope styles', () => {
      var template = el('<div><style>.foo {} :host {}</style></div>');
      var cmpMetadata = new DirectiveMetadata(SomeComponent, null);
      var step = strategy.getStyleCompileStep(cmpMetadata, 'http://base');
      var styleElement = DOM.firstChild(template);
      var compileElement = new CompileElement(styleElement);
      step.process(null, compileElement, null);
      expect(styleElement).toHaveText(".foo[_ngcontent-0] {\n\n}\n\n[_nghost-0] {\n\n}");
    });

    it('should inline @import rules', inject([AsyncTestCompleter], (async) => {
      xhr.reply('http://base/one.css', '.one {}');

      var template = el('<div><style>@import "one.css";</style></div>');
      var cmpMetadata = new DirectiveMetadata(SomeComponent, null);
      var step = strategy.getStyleCompileStep(cmpMetadata, 'http://base');
      var styleElement = DOM.firstChild(template);
      var parentElement = new CompileElement(template);
      var compileElement = new CompileElement(styleElement);
      var parentpv = new ProtoView(null, null, null);
      parentElement.inheritedProtoView = parentpv;
      step.process(parentElement, compileElement, null);

      expect(parentpv.stylePromises.length).toEqual(1);
      expect(parentpv.stylePromises[0]).toBePromise();

      expect(styleElement).toHaveText('');
      parentpv.stylePromises[0].then((_) => {
        expect(styleElement).toHaveText('.one[_ngcontent-0] {\n\n}');
        async.done();
      });
    }));

    it('should return the same style given the same component', () => {
      var template = el('<div><style>.foo {} :host {}</style></div>');
      var cmpMetadata = new DirectiveMetadata(SomeComponent, null);
      var step = strategy.getStyleCompileStep(cmpMetadata, 'http://base');
      var styleElement = DOM.firstChild(template);
      var compileElement = new CompileElement(styleElement);
      step.process(null, compileElement, null);

      var template2 = el('<div><style>.foo {} :host {}</style></div>');
      var step2 = strategy.getStyleCompileStep(cmpMetadata, 'http://base');
      var styleElement2 = DOM.firstChild(template2);
      var compileElement2 = new CompileElement(styleElement2);
      step2.process(null, compileElement2, null);

      expect(DOM.getText(styleElement)).toEqual(DOM.getText(styleElement2));
    });

    it('should return different styles given different components', () => {
      var template = el('<div><style>.foo {} :host {}</style></div>');
      var cmpMetadata = new DirectiveMetadata(SomeComponent, null);
      var step = strategy.getStyleCompileStep(cmpMetadata, 'http://base');
      var styleElement = DOM.firstChild(template);
      var compileElement = new CompileElement(styleElement);
      step.process(null, compileElement, null);

      var template2 = el('<div><style>.foo {} :host {}</style></div>');
      var cmpMetadata2 = new DirectiveMetadata(SomeOtherComponent, null);
      var step2 = strategy.getStyleCompileStep(cmpMetadata2, 'http://base');
      var styleElement2 = DOM.firstChild(template2);
      var compileElement2 = new CompileElement(styleElement2);
      step2.process(null, compileElement2, null);

      expect(DOM.getText(styleElement)).not.toEqual(DOM.getText(styleElement2));
    });

    it('should move the style element to the style host', () => {
      var template = el('<div><style>.one {}</style></div>');
      var cmpMetadata = new DirectiveMetadata(SomeComponent, null);
      var step = strategy.getStyleCompileStep(cmpMetadata, 'http://base');
      var styleElement = DOM.firstChild(template);
      var compileElement = new CompileElement(styleElement);
      step.process(null, compileElement, null);
      expect(template).toHaveText('');
      expect(styleHost).toHaveText('.one[_ngcontent-0] {\n\n}');
    });

    it('should add an attribute to the content elements', () => {
      var template = el('<div></div>');
      var cmpMetadata = new DirectiveMetadata(SomeComponent, null);
      var step = strategy.getTemplateCompileStep(cmpMetadata);
      var compileElement = new CompileElement(template);
      step.process(null, compileElement, null);
      expect(DOM.getAttribute(template, '_ngcontent-0')).toEqual('');
    });

    it('should add an attribute to the host elements', () => {
      var template = el('<div></div>');
      var cmpMetadata = new DirectiveMetadata(SomeComponent, null);
      var step = strategy.getTemplateCompileStep(cmpMetadata);
      var compileElement = new CompileElement(template);
      compileElement.componentDirective = new DirectiveMetadata(SomeOtherComponent, null);
      step.process(null, compileElement, null);
      expect(DOM.getAttribute(template, '_nghost-1')).toEqual('');
    });
  });

  describe('EmulatedUnscopedShadowDomStratgey', () => {
    var styleHost;

    beforeEach(() => {
      var urlResolver = new UrlResolver();
      var styleUrlResolver = new StyleUrlResolver(urlResolver);
      styleHost = el('<div></div>');
      strategy = new EmulatedUnscopedShadowDomStrategy(styleUrlResolver, styleHost);
      resetShadowDomCache();
    });

    it('should attach the view nodes as child of the host element', () => {
      var host = el('<div><span>original content</span></div>');
      var nodes = el('<div>view</div>');
      var pv = new ProtoView(nodes, new DynamicProtoChangeDetector(null, null), null);
      var view = pv.instantiate(null, null);

      strategy.attachTemplate(host, view);
      var firstChild = DOM.firstChild(host);
      expect(DOM.tagName(firstChild).toLowerCase()).toEqual('div');
      expect(firstChild).toHaveText('view');
      expect(host).toHaveText('view');
    });

    it('should rewrite style urls', () => {
      var template = el('<div><style>.one {background-image: url("img.jpg");}</style></div>')
      var step = strategy.getStyleCompileStep(null, 'http://base');
      var styleElement = DOM.firstChild(template);
      var compileElement = new CompileElement(styleElement);
      step.process(null, compileElement, null);
      expect(styleElement).toHaveText(".one {background-image: url('http://base/img.jpg');}");
    });

    it('should not inline import rules', () => {
      var template = el('<div><style>@import "other.css";</style></div>')
      var step = strategy.getStyleCompileStep(null, 'http://base');
      var styleElement = DOM.firstChild(template);
      var compileElement = new CompileElement(styleElement);
      step.process(null, compileElement, null);
      expect(styleElement).toHaveText("@import 'http://base/other.css';");
    });

    it('should move the style element to the style host', () => {
      var template = el('<div><style>/*css*/</style></div>')
      var step = strategy.getStyleCompileStep(null, 'http://base');
      var styleElement = DOM.firstChild(template);
      var compileElement = new CompileElement(styleElement);
      step.process(null, compileElement, null);
      expect(styleHost).toHaveText("/*css*/");
    });

    it('should insert the same style only once in the style host', () => {
      var template = el('<div><style>/*css1*/</style><style>/*css2*/</style>' +
                        '<style>/*css1*/</style></div>')
      var step = strategy.getStyleCompileStep(null, 'http://base');
      var styleElements = DOM.childNodes(template);
      var compileElement = new CompileElement(styleElements[0]);
      step.process(null, compileElement, null);
      compileElement = new CompileElement(styleElements[0]);
      step.process(null, compileElement, null);
      compileElement = new CompileElement(styleElements[0]);
      step.process(null, compileElement, null);

      expect(styleHost).toHaveText("/*css1*//*css2*/");
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
