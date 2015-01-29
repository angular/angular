import {describe, it, expect, beforeEach, ddescribe, iit, xit, el} from 'test_lib/test_lib';
import {ShadowDomTransformer} from 'core/compiler/shadow_dom_emulation/shadow_dom_transformer';
import {WebComponentPolyfill} from 'core/compiler/shadow_dom_emulation/webcmp_polyfill';
import {DOM} from 'facade/dom';
import {CONST} from 'facade/lang';
import {ShadowDomStrategy, ShadowDomNative, ShadowDomEmulated} from 'core/compiler/shadow_dom';
import {DirectiveMetadata} from 'core/compiler/directive_metadata';
import {Component} from 'core/annotations/annotations';

class FakePolyfill extends WebComponentPolyfill {
  _enabled: boolean;

  constructor(enabled: boolean) {
    super(null);
    this._enabled = enabled;
  }

  isEnabled() {
    return this._enabled;
  }
}

export function main() {
  describe('ShadowDomTransformer', () => {

    function createTplTransformer(usePolyfill: boolean) {
      return new ShadowDomTransformer(new FakePolyfill(usePolyfill));
    }

    function createDirectiveMetadata(selector: string, strategy: ShadowDomStrategy) {
      var cmp = new Component({selector: selector});
      return new DirectiveMetadata(null, cmp, strategy, null);
    }

    var tplHtml = '<template><ul><li></li></ul></template>';

    it('should throw when the strategy is neither native or emulated', () => {
      var directiveMd = createDirectiveMetadata('cmp-foo', new CustomStrategy());
      expect(() => {
        var trans = createTplTransformer(false);
        var tpl = el('<template></template>');
        tpl = trans.transformTemplate(tpl, directiveMd);
      }).toThrowError('Unsupported shadow DOM strategy: CustomStrategy');
    });

    describe('Native strategy', () => {
      var directiveMd = createDirectiveMetadata('cmp-foo', ShadowDomNative);
      var transformerTplHtml = '<template><ul cmp-foo=""><li cmp-foo=""></li></ul></template>';

      it('should not update the template when the polyfill is not used', () => {
        var trans = createTplTransformer(false);
        var tpl = el(tplHtml);
        tpl = trans.transformTemplate(tpl, directiveMd);
        expect(DOM.getOuterHTML(tpl)).toEqual(tplHtml);
      });

      it('should update the template when the polyfill is used', () => {
        var trans = createTplTransformer(true);
        var tpl = el(tplHtml);
        tpl = trans.transformTemplate(tpl, directiveMd);
        expect(DOM.getOuterHTML(tpl)).toEqual(transformerTplHtml);
      });
    });

    describe('Emulated strategy', () => {
      var directiveMd = createDirectiveMetadata('cmp-foo', ShadowDomEmulated);
      var transformerTplHtml = '<template><ul cmp-foo=""><li cmp-foo=""></li></ul></template>';

      it('should update the template when the polyfill is not used', () => {
        var trans = createTplTransformer(false);
        var tpl = el(tplHtml);
        tpl = trans.transformTemplate(tpl, directiveMd);
        expect(DOM.getOuterHTML(tpl)).toEqual(transformerTplHtml);
      });

      it('should update the template when the polyfill is used', () => {
        var trans = createTplTransformer(true);
        var tpl = el(tplHtml);
        tpl = trans.transformTemplate(tpl, directiveMd);
        expect(DOM.getOuterHTML(tpl)).toEqual(transformerTplHtml);
      });
    });

  });
}

class CustomStrategy extends ShadowDomStrategy {
  @CONST() constructor() {}
  toString() {
    return 'CustomStrategy';
  }
}
