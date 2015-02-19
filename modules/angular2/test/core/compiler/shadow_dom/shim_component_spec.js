import {describe, beforeEach, it, expect, ddescribe, iit, SpyObject, el} from 'angular2/test_lib';

import {
  ShimNativeComponent,
  ShimEmulatedComponent,
  resetShimComponentCache
} from 'angular2/src/core/compiler/shadow_dom_emulation/shim_component';

import {ShadowCss} from 'angular2/src/core/compiler/shadow_dom_emulation/shadow_css';

import {Type} from 'angular2/src/facade/lang';
import {DOM} from 'angular2/src/facade/dom';

export function main() {
  describe('ShimComponent', () => {

    describe('ShimNativeComponent', () => {
      function createShim(component: Type) {
        return new ShimNativeComponent(component);
      }

      it('should not transform the CSS', () => {
        var css = '.foo {color: blue;} :host{color: red;}';
        var shim = createShim(SomeComponent);
        var shimCss = shim.shimCssText(css);
        expect(css).toEqual(shimCss);
      });

      it('should not transform content elements', () => {
        var html = '<p>foo</p>';
        var element = el(html);
        var shim = createShim(SomeComponent);
        shim.shimContentElement(element);
        expect(DOM.getOuterHTML(element)).toEqual(html);
      });

      it('should not transform host elements', () => {
        var html = '<p>foo</p>';
        var element = el(html);
        var shim = createShim(SomeComponent);
        shim.shimHostElement(element);
        expect(DOM.getOuterHTML(element)).toEqual(html);
      });
    });

    describe('ShimEmulatedComponent', () => {
      beforeEach(() => {
        resetShimComponentCache();
      });

      function createShim(component: Type) {
        return new ShimEmulatedComponent(component);
      }

      it('should transform the CSS', () => {
        var css = '.foo {color: blue;} :host{color: red;}';
        var shim = createShim(SomeComponent);
        var shimCss = shim.shimCssText(css);
        expect(shimCss).not.toEqual(css);
        var shadowCss = new ShadowCss();
        expect(shimCss).toEqual(shadowCss.shimCssText(css, '_ngcontent-0', '_nghost-0'));
      });

      it('should transform content elements', () => {
        var html = '<p>foo</p>';
        var element = el(html);
        var shim = createShim(SomeComponent);
        shim.shimContentElement(element);
        expect(DOM.getOuterHTML(element)).toEqual('<p _ngcontent-0="">foo</p>');
      });

      it('should not transform host elements', () => {
        var html = '<p>foo</p>';
        var element = el(html);
        var shim = createShim(SomeComponent);
        shim.shimHostElement(element);
        expect(DOM.getOuterHTML(element)).toEqual('<p _nghost-0="">foo</p>');
      });

      it('should generate the same output for the same component', () => {
        var html = '<p>foo</p>';
        var content1 = el(html);
        var host1 = el(html);
        var css = '.foo {color: blue;} :host{color: red;}';
        var shim1 = createShim(SomeComponent);
        shim1.shimContentElement(content1);
        shim1.shimHostElement(host1);
        var shimCss1 = shim1.shimCssText(css);

        var content2 = el(html);
        var host2 = el(html);
        var shim2 = createShim(SomeComponent);
        shim2.shimContentElement(content2);
        shim2.shimHostElement(host2);
        var shimCss2 = shim2.shimCssText(css);

        expect(DOM.getOuterHTML(content1)).toEqual(DOM.getOuterHTML(content2));
        expect(DOM.getOuterHTML(host1)).toEqual(DOM.getOuterHTML(host2));
        expect(shimCss1).toEqual(shimCss2);
      });

      it('should generate different outputs for different components', () => {
        var html = '<p>foo</p>';
        var content1 = el(html);
        var host1 = el(html);
        var css = '.foo {color: blue;} :host{color: red;}';
        var shim1 = createShim(SomeComponent);
        shim1.shimContentElement(content1);
        shim1.shimHostElement(host1);
        var shimCss1 = shim1.shimCssText(css);

        var content2 = el(html);
        var host2 = el(html);
        var shim2 = createShim(SomeComponent2);
        shim2.shimContentElement(content2);
        shim2.shimHostElement(host2);
        var shimCss2 = shim2.shimCssText(css);

        expect(DOM.getOuterHTML(content1)).not.toEqual(DOM.getOuterHTML(content2));
        expect(DOM.getOuterHTML(host1)).not.toEqual(DOM.getOuterHTML(host2));
        expect(shimCss1).not.toEqual(shimCss2);
      });
    });
  });
}

class SomeComponent {}
class SomeComponent2 {}
