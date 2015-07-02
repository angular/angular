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
  normalizeCSS
} from 'angular2/test_lib';

import {DOM} from 'angular2/src/dom/dom_adapter';

import {
  EmulatedScopedShadowDomStrategy,
} from 'angular2/src/render/dom/shadow_dom/emulated_scoped_shadow_dom_strategy';
import {
  resetShadowDomCache,
} from 'angular2/src/render/dom/shadow_dom/util';

export function main() {
  describe('EmulatedScopedShadowDomStrategy', () => {
    var styleHost, strategy;

    beforeEach(() => {
      styleHost = el('<div></div>');
      strategy = new EmulatedScopedShadowDomStrategy(styleHost);
      resetShadowDomCache();
    });

    it('should use the host element as shadow root', () => {
      var host = el('<div><span>original content</span></div>');
      expect(strategy.prepareShadowRoot(host)).toBe(host);
    });

    it('should scope styles', () => {
      var styleElement = el('<style>.foo {} :host {}</style>');
      strategy.processStyleElement('someComponent', 'http://base', styleElement);
      expect(styleElement).toHaveText(".foo[_ngcontent-0] {\n\n}\n\n[_nghost-0] {\n\n}");
    });

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
